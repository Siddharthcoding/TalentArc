import { HfInference } from "@huggingface/inference";
import pool from "../db/pool.js";
import { runScraper } from "./scraper.service.js";
import { TECH_SKILLS } from "../data/techSkills.js";

const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V4-Flash-0731:fireworks-ai";
const FALLBACK_MODEL = "meta-llama/Llama-3.1-8B-Instruct:scaleway";

const getConfig = () => ({
  token: process.env.HF_TOKEN || "",
  model: process.env.HF_MODEL || DEFAULT_MODEL,
});

const ALL_TECH_SKILLS = Object.values(TECH_SKILLS).flat();
const TOPIC_ALIASES = {
  dbms: "Database Management Systems",
  cn: "Computer Networks",
  os: "Operating Systems",
  oops: "Object Oriented Programming",
  dsa: "Data Structures and Algorithms",
};

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeTopic(value) {
  return String(value || "")
    .replace(/[()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandTopic(topic) {
  const normalized = normalizeTopic(topic);
  return TOPIC_ALIASES[normalized.toLowerCase()] || normalized;
}

function uniqueTopics(topics, limit = 8) {
  const seen = new Set();
  const result = [];
  for (const raw of topics) {
    const topic = normalizeTopic(raw);
    const key = topic.toLowerCase();
    if (!topic || seen.has(key)) continue;
    seen.add(key);
    const expanded = expandTopic(topic);
    result.push(expanded.length <= 60 ? titleCase(expanded) : expanded.slice(0, 60).trim());
    if (result.length >= limit) break;
  }
  return result;
}

function extractCommaSeparatedTopics(inputValue) {
  return uniqueTopics(String(inputValue || "").split(/[,;\n|/]+/));
}

function extractTechTopicsFromText(inputValue) {
  const text = String(inputValue || "").toLowerCase();
  const matched = [];
  for (const skill of ALL_TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`, "i");
    if (pattern.test(text)) matched.push(skill);
  }
  return uniqueTopics(matched);
}

function resolveAssessmentTopics(inputType, inputValue) {
  if (inputType === "skill") {
    return extractCommaSeparatedTopics(inputValue).length
      ? extractCommaSeparatedTopics(inputValue)
      : ["General Tech"];
  }

  if (inputType === "job_role") {
    const topics = extractCommaSeparatedTopics(inputValue);
    return topics.length ? topics : ["Software Engineer"];
  }

  if (inputType === "job_description") {
    const techTopics = extractTechTopicsFromText(inputValue);
    if (techTopics.length) return techTopics;
    const firstLines = String(inputValue || "").split("\n").slice(0, 2).join(" ");
    const fallback = firstLines.length > 80 ? "Job Match Assessment" : firstLines;
    return [normalizeTopic(fallback) || "Job Match Assessment"];
  }

  if (inputType === "resume") {
    // Strictly extract tech topics from the resume text or comma-separated list
    const techTopics = extractTechTopicsFromText(inputValue);
    if (techTopics.length) return techTopics.slice(0, 8);
    const parsedComma = extractCommaSeparatedTopics(inputValue).filter(
      (t) => !/^(name|phone|email|gmail|yahoo|address|bhubaneswar|kiit|university|b\.tech|m\.tech|cgpa|gpa|percentage|roll|certif|coursera|udemy|intern|experience|projects?|education|summary|contact)$/i.test(t)
    );
    return parsedComma.length ? parsedComma : ["Data Structures", "Java", "SQL", "Software Development"];
  }


  return ["Technical Skills"];
}

function allocateCounts(total, topics) {
  const safeTopics = topics.length ? topics : ["Technical Skills"];
  const base = Math.floor(total / safeTopics.length);
  let remainder = total % safeTopics.length;
  return safeTopics.map((topic) => ({
    topic,
    count: base + (remainder-- > 0 ? 1 : 0),
  })).filter((entry) => entry.count > 0);
}

async function loadTopicFallbackQuestions(topic, limit) {
  const aliases = uniqueTopics([topic, expandTopic(topic), ...Object.entries(TOPIC_ALIASES)
    .filter(([, expanded]) => expanded.toLowerCase() === topic.toLowerCase())
    .map(([alias]) => alias)]);
  const { rows } = await pool.query(
    `SELECT * FROM questions_store
     WHERE LOWER(topic) = ANY($2::text[])
        OR LOWER(topic) ILIKE $3
        OR LOWER(question_text) ILIKE $3
     ORDER BY RANDOM()
     LIMIT $1`,
    [limit, aliases.map((t) => t.toLowerCase()), `%${topic.toLowerCase()}%`]
  );
  return rows.map((r) => ({
    id: r.id,
    question_text: r.question_text,
    options: r.options,
    correct_option: r.correct_option,
    explanation: r.explanation,
    difficulty: r.difficulty,
    topic: r.topic,
  }));
}

/**
 * Clean up markdown blocks from LLM JSON responses
 */
function parseJSONResponse(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Try extracting between first { and last } or first [ and last ]
      const firstCurly = trimmed.indexOf("{");
      const lastCurly = trimmed.lastIndexOf("}");
      if (firstCurly !== -1 && lastCurly > firstCurly) {
        try {
          return JSON.parse(trimmed.slice(firstCurly, lastCurly + 1));
        } catch {}
      }
      const firstBracket = trimmed.indexOf("[");
      const lastBracket = trimmed.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket > firstBracket) {
        try {
          return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1));
        } catch {}
      }
    }
  }

  const jsonMatch = trimmed.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  const jsonMatchObj = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatchObj) {
    try {
      return JSON.parse(jsonMatchObj[0]);
    } catch {}
  }

  return null;
}

/**
 * Fetch questions from Hugging Face LLM in a single consolidated API call across all topics
 */
async function generateMultiTopicQuestionsViaLLM(topicPlan, difficulty, totalCount) {
  const config = getConfig();
  if (!config.token) {
    console.warn("[LLM] No HF_TOKEN found. Skipping LLM question generation.");
    return [];
  }

  const topicDistribution = topicPlan
    .map((p) => `- ${p.topic}: ${p.count} question${p.count > 1 ? "s" : ""}`)
    .join("\n");

  const topicList = topicPlan.map((p) => p.topic).join(", ");

  const prompt = `
Generate exactly ${totalCount} multiple choice questions (MCQ) for a technical placement assessment with difficulty level "${difficulty}".
The questions must be distributed across the following technical topics:
${topicDistribution}

Each question must have:
- Exactly 4 choices in "options" array
- Exactly one 0-based integer index in "correct_option" (0, 1, 2, or 3)
- A clear, educational explanation in "explanation"
- "topic": exactly one of the requested topics (${topicList})
- "difficulty": "${difficulty}"

Respond ONLY with a valid JSON array of objects. Do not include markdown code block syntax (like \`\`\`json) or any conversational text. Use this exact format:
[
  {
    "question_text": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option": 0,
    "explanation": "Explanation text goes here...",
    "difficulty": "${difficulty}",
    "topic": "Topic Name"
  }
]
`;

  const models = [
    config.model,
    "deepseek-ai/DeepSeek-V4-Flash-0731:fireworks-ai",
    FALLBACK_MODEL,
    "meta-llama/Meta-Llama-3-8B-Instruct"
  ];

  for (const modelName of models) {
    try {
      console.log(`[LLM] Requesting ${totalCount} questions for topics [${topicList}] via single LLM call from model: ${modelName}`);
      const hf = new HfInference(config.token);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await hf.chatCompletion({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "You are an expert technical placement interviewer for engineering campus drives. You construct highly accurate MCQ assessments. Always respond with raw JSON only.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2800,
        temperature: 0.35,
      });

      clearTimeout(timeoutId);
      const content = response?.choices?.[0]?.message?.content;
      if (!content) continue;

      const questions = parseJSONResponse(content);
      if (Array.isArray(questions) && questions.length > 0) {
        // Validate question structure
        const validated = questions.filter(
          (q) =>
            q.question_text &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correct_option === "number" &&
            q.correct_option >= 0 &&
            q.correct_option <= 3
        );
        if (validated.length > 0) {
          console.log(`[LLM] Successfully generated ${validated.length}/${totalCount} questions in 1 unified call.`);
          return validated;
        }
      }
    } catch (err) {
      console.warn(`[LLM] Unified generation failed for model ${modelName}:`, err.message);
    }
  }

  return [];
}

/**
 * Generate personal feedback / weak areas analysis from LLM
 */
async function generateWeakAreasNarrative(topic, score, maxScore, incorrectQuestions) {
  const config = getConfig();
  if (!config.token || incorrectQuestions.length === 0) {
    return "Focus on reviewing your incorrect answers to identify concepts that need reinforcement.";
  }

  const incorrectSummary = incorrectQuestions
    .slice(0, 5)
    .map((q, idx) => `${idx + 1}. Q: ${q.question_text}\n   Explanation: ${q.explanation}`)
    .join("\n\n");

  const prompt = `
Subject: ${topic} Mock Assessment Results.
The user scored ${score}/${maxScore}.
Here are some of the questions they answered incorrectly along with the explanations:

${incorrectSummary}

Provide a constructive, 2-3 sentence personalized feedback summary. Highlight the key weak areas and specify what concepts or subjects the user should study to improve.
Respond with plain text only, no JSON, and no headers.
`;

  const models = [
    config.model,
    "deepseek-ai/DeepSeek-V4-Flash-0731:fireworks-ai",
    FALLBACK_MODEL
  ];

  for (const modelName of models) {
    try {
      console.log(`[LLM Feedback] Requesting feedback narrative from model: ${modelName}`);
      const hf = new HfInference(config.token);
      const response = await hf.chatCompletion({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.5,
      });
      const result = response?.choices?.[0]?.message?.content?.trim();
      if (result) return result;
    } catch (err) {
      console.warn(`[LLM Feedback] Failed for model ${modelName}:`, err.message);
    }
  }

  return "Focus on reviewing your incorrect answers to identify concepts that need reinforcement.";
}

/**
 * Create a new assessment using 1 consolidated LLM call for all topics
 */
export async function createAssessment(userId, { inputType, inputValue, difficulty, questionCount, durationSeconds }) {
  const count = parseInt(questionCount, 10) || 10;
  const timer = parseInt(durationSeconds, 10) || 600;
  const topics = resolveAssessmentTopics(inputType, inputValue);
  const topic = topics.length === 1 ? topics[0] : topics.join(", ");
  const topicPlan = allocateCounts(count, topics);

  console.log(`[Assessment] Creating assessment for topics: "${topic}" (${inputType}), difficulty: ${difficulty}, size: ${count}`);

  let collectedQuestions = [];
  const neededPerTopic = new Map();
  topicPlan.forEach((p) => neededPerTopic.set(p.topic, p.count));

  // 1. Try to scrape or fetch from database cache first for each topic
  for (const plan of topicPlan) {
    try {
      const fallbackQuestions = await loadTopicFallbackQuestions(plan.topic, plan.count);
      if (fallbackQuestions && fallbackQuestions.length > 0) {
        collectedQuestions = [...collectedQuestions, ...fallbackQuestions];
        const remaining = Math.max(0, plan.count - fallbackQuestions.length);
        neededPerTopic.set(plan.topic, remaining);
      }
    } catch (err) {
      console.error(`[Assessment] Cache lookup failed for ${plan.topic}:`, err);
    }
  }

  // 2. Compute total remaining questions needed across all topics
  const remainingPlan = [];
  let totalRemainingNeeded = 0;
  for (const [top, needed] of neededPerTopic.entries()) {
    if (needed > 0) {
      remainingPlan.push({ topic: top, count: needed });
      totalRemainingNeeded += needed;
    }
  }

  // 3. Generate all remaining questions in 1 SINGLE unified LLM call
  if (totalRemainingNeeded > 0) {
    try {
      const generated = await generateMultiTopicQuestionsViaLLM(
        remainingPlan.length > 0 ? remainingPlan : topicPlan,
        difficulty,
        totalRemainingNeeded
      );

      if (generated && generated.length > 0) {
        collectedQuestions = [...collectedQuestions, ...generated];

        // Cache generated questions in questions_store for future instant retrieval
        for (const q of generated) {
          pool.query(
            `INSERT INTO questions_store (topic, question_text, options, correct_option, explanation, difficulty)
             VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
            [q.topic || topic, q.question_text, JSON.stringify(q.options), q.correct_option, q.explanation, q.difficulty || difficulty]
          ).catch((e) => console.error("[Assessment] Failed to cache question:", e));
        }
      }
    } catch (err) {
      console.error("[Assessment] Single-call LLM generation error:", err);
    }
  }

  // 4. If still short of total count, fill from database
  if (collectedQuestions.length < count) {
    for (const plan of topicPlan) {
      if (collectedQuestions.length >= count) break;
      try {
        const fallbacks = await loadTopicFallbackQuestions(plan.topic, count - collectedQuestions.length);
        collectedQuestions = [...collectedQuestions, ...fallbacks];
      } catch {}
    }
  }

  // Trim to exactly requested count
  let finalQuestions = collectedQuestions.slice(0, count);

  // Assign temporary IDs where needed
  finalQuestions = finalQuestions.map((q, idx) => ({
    id: q.id || `temp-${idx}-${Date.now()}`,
    question_text: q.question_text,
    options: q.options,
    correct_option: q.correct_option,
    explanation: q.explanation,
    difficulty: q.difficulty || difficulty,
    topic: q.topic || topic,
  }));

  // Create assessment in DB
  const { rows } = await pool.query(
    `INSERT INTO assessments (user_id, topic, input_type, input_value, questions, duration_seconds, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'active')
     RETURNING *`,
    [userId, topic, inputType, inputValue, JSON.stringify(finalQuestions), timer]
  );

  const assessment = rows[0];

  // Return assessment with censored questions (no correct answers)
  const censoredQuestions = finalQuestions.map((q) => ({
    id: q.id,
    question_text: q.question_text,
    options: q.options,
    topic: q.topic,
  }));

  return {
    id: assessment.id,
    topic: assessment.topic,
    inputType: assessment.input_type,
    durationSeconds: assessment.duration_seconds,
    status: assessment.status,
    questions: censoredQuestions,
    createdAt: assessment.created_at,
  };
}


/**
 * Submit answers and score the assessment
 */
export async function submitAssessment(assessmentId, userId, answers) {
  // Fetch the assessment
  const { rows } = await pool.query(
    `SELECT * FROM assessments WHERE id = $1 AND user_id = $2`,
    [assessmentId, userId]
  );

  if (rows.length === 0) {
    const err = new Error("Assessment not found");
    err.status = 404;
    throw err;
  }

  const assessment = rows[0];
  if (assessment.status === "completed" || assessment.status === "terminated") {
    // Already submitted
    return getAssessmentReport(assessmentId, userId);
  }

  const questions = assessment.questions;
  let score = 0;
  const maxScore = questions.length;
  const detailedAnswers = [];
  const incorrectQuestions = [];

  for (const q of questions) {
    const userAnswerObj = (answers || []).find((a) => a.questionId === q.id);
    const selectedOption = userAnswerObj ? userAnswerObj.selectedOption : null;
    const isCorrect = selectedOption !== null && parseInt(selectedOption, 10) === q.correct_option;

    if (isCorrect) {
      score++;
    } else {
      incorrectQuestions.push(q);
    }

    detailedAnswers.push({
      questionId: q.id,
      question_text: q.question_text,
      options: q.options,
      selectedOption,
      correctOption: q.correct_option,
      isCorrect,
      explanation: q.explanation,
      topic: q.topic,
    });
  }

  // Dynamic feedback and weak areas analysis
  const weakAreasFeedback = await generateWeakAreasNarrative(assessment.topic, score, maxScore, incorrectQuestions);

  // Compile weak areas list
  const weakTopicsSet = new Set();
  incorrectQuestions.forEach((q) => {
    if (q.topic) weakTopicsSet.add(q.topic);
  });
  const weakTopics = Array.from(weakTopicsSet);

  const reportPayload = {
    score,
    maxScore,
    answers: detailedAnswers,
    feedback: weakAreasFeedback,
    weakTopics,
  };

  // Update in DB
  const updateRes = await pool.query(
    `UPDATE assessments 
     SET score = $1, max_score = $2, answers = $3, status = 'completed', completed_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [score, maxScore, JSON.stringify(reportPayload), assessmentId, userId]
  );

  return {
    id: assessmentId,
    topic: assessment.topic,
    inputType: assessment.input_type,
    durationSeconds: assessment.duration_seconds,
    status: "completed",
    fullscreenViolations: assessment.fullscreen_violations,
    score,
    maxScore,
    report: reportPayload,
    createdAt: assessment.created_at,
    completedAt: updateRes.rows[0].completed_at,
  };
}

/**
 * Get assessment details / report
 */
export async function getAssessmentReport(assessmentId, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM assessments WHERE id = $1 AND user_id = $2`,
    [assessmentId, userId]
  );

  if (rows.length === 0) {
    const err = new Error("Assessment not found");
    err.status = 404;
    throw err;
  }

  const assessment = rows[0];
  if (assessment.status === "active" || assessment.status === "created") {
    // If still active, return questions without answers (censor)
    const censoredQuestions = assessment.questions.map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options,
      topic: q.topic,
    }));

    return {
      id: assessment.id,
      topic: assessment.topic,
      inputType: assessment.input_type,
      durationSeconds: assessment.duration_seconds,
      status: assessment.status,
      fullscreenViolations: assessment.fullscreen_violations,
      questions: censoredQuestions,
      createdAt: assessment.created_at,
    };
  }

  // Already submitted
  return {
    id: assessment.id,
    topic: assessment.topic,
    inputType: assessment.input_type,
    durationSeconds: assessment.duration_seconds,
    status: assessment.status,
    fullscreenViolations: assessment.fullscreen_violations,
    score: assessment.score,
    maxScore: assessment.max_score,
    report: assessment.answers, // containing answers object
    createdAt: assessment.created_at,
    completedAt: assessment.completed_at,
  };
}

/**
 * Get past assessments list for history
 */
export async function getUserAssessments(userId) {
  const { rows } = await pool.query(
    `SELECT id, topic, input_type, score, max_score, status, fullscreen_violations, created_at, completed_at
     FROM assessments
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map((r) => ({
    id: r.id,
    topic: r.topic,
    inputType: r.input_type,
    score: r.score,
    maxScore: r.max_score,
    status: r.status,
    fullscreenViolations: r.fullscreen_violations,
    createdAt: r.created_at,
    completedAt: r.completed_at,
  }));
}

/**
 * Handle fullscreen violations
 */
export async function incrementFullscreenViolations(assessmentId, userId) {
  // Fetch current violations
  const { rows } = await pool.query(
    `SELECT fullscreen_violations, status, questions FROM assessments WHERE id = $1 AND user_id = $2`,
    [assessmentId, userId]
  );

  if (rows.length === 0) {
    const err = new Error("Assessment not found");
    err.status = 404;
    throw err;
  }

  const assessment = rows[0];
  if (assessment.status !== "active") {
    return { status: assessment.status, violations: assessment.fullscreen_violations };
  }

  const newViolations = (assessment.fullscreen_violations || 0) + 1;

  if (newViolations >= 2) {
    // Auto-terminate the assessment!
    console.log(`[Assessment] Auto-terminating assessment ${assessmentId} due to ${newViolations} fullscreen violations.`);
    
    // Evaluate whatever answers were registered, or default to score 0
    const questions = assessment.questions;
    const maxScore = questions.length;
    const detailedAnswers = questions.map((q) => ({
      questionId: q.id,
      question_text: q.question_text,
      options: q.options,
      selectedOption: null,
      correctOption: q.correct_option,
      isCorrect: false,
      explanation: q.explanation,
      topic: q.topic,
    }));

    const reportPayload = {
      score: 0,
      maxScore,
      answers: detailedAnswers,
      feedback: "Assessment automatically terminated due to multiple exits from full screen mode (cheating prevention).",
      weakTopics: questions.map((q) => q.topic).filter(Boolean),
    };

    const updateRes = await pool.query(
      `UPDATE assessments 
       SET score = 0, max_score = $1, answers = $2, status = 'terminated', fullscreen_violations = $3, completed_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [maxScore, JSON.stringify(reportPayload), newViolations, assessmentId, userId]
    );

    return {
      id: assessmentId,
      status: "terminated",
      fullscreenViolations: newViolations,
      score: 0,
      maxScore,
      report: reportPayload,
      completedAt: updateRes.rows[0].completed_at,
    };
  }

  // Else just increment
  const updateRes = await pool.query(
    `UPDATE assessments 
     SET fullscreen_violations = $1
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [newViolations, assessmentId, userId]
  );

  return {
    id: assessmentId,
    status: "active",
    fullscreenViolations: newViolations,
  };
}

export async function deleteAssessment(id, userId) {
  const { rowCount } = await pool.query(
    `DELETE FROM assessments WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  if (rowCount === 0) {
    const err = new Error("Assessment not found");
    err.status = 404;
    throw err;
  }
}
