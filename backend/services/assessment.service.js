import { HfInference } from "@huggingface/inference";
import pool from "../db/pool.js";
import { runScraper } from "./scraper.service.js";

const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V4-Flash-0731:fireworks-ai";
const FALLBACK_MODEL = "meta-llama/Llama-3.1-8B-Instruct:scaleway";

const getConfig = () => ({
  token: process.env.HF_TOKEN || "",
  model: process.env.HF_MODEL || DEFAULT_MODEL,
});

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
 * Fetch questions from Hugging Face LLM using DeepSeek or Llama fallback
 */
async function generateQuestionsViaLLM(topic, difficulty, count = 5) {
  const config = getConfig();
  if (!config.token) {
    console.warn("[LLM] No HF_TOKEN found. Skipping LLM question generation.");
    return [];
  }

  const prompt = `
Generate exactly ${count} multiple choice questions (MCQ) for the topic "${topic}" with difficulty level "${difficulty}".
Each question must have exactly 4 choices (options) and exactly one correct answer.
Provide explanations for why the correct answer is right.

Respond ONLY with a valid JSON array of objects. Do not include markdown code block syntax (like \`\`\`json) or any conversational text. Use this exact format:
[
  {
    "question_text": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_option": 0,
    "explanation": "Explanation text goes here...",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
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
      console.log(`[LLM] Requesting ${count} questions from model: ${modelName}`);
      const hf = new HfInference(config.token);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await hf.chatCompletion({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "You are an expert technical interviewer. You construct highly accurate MCQ assessments. Always respond with raw JSON only.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.4,
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
          return validated;
        }
      }
    } catch (err) {
      console.warn(`[LLM] Generation failed for model ${modelName}:`, err.message);
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
 * Create a new assessment
 */
export async function createAssessment(userId, { inputType, inputValue, difficulty, questionCount, durationSeconds }) {
  // 1. Infer topic
  let topic = "Technical Skills";
  if (inputType === "skill") {
    topic = inputValue || "General Tech";
  } else if (inputType === "job_role") {
    topic = inputValue || "Software Engineer";
  } else if (inputType === "job_description") {
    // Attempt to extract key tech keywords or set generic title
    const firstLines = (inputValue || "").split("\n")[0];
    topic = firstLines.length > 50 ? "Job Match Assessment" : firstLines || "Job Match Assessment";
  } else if (inputType === "resume") {
    // inputValue is a comma-separated list of skills extracted from the resume
    if (inputValue && inputValue.trim().length > 0) {
      // Use first skill as primary topic, truncate if too long
      const firstSkill = inputValue.split(",")[0].trim();
      topic = firstSkill.length <= 60 ? firstSkill : inputValue.slice(0, 60);
    } else {
      topic = "Software Development";
    }
  }

  const count = parseInt(questionCount, 10) || 10;
  const timer = parseInt(durationSeconds, 10) || 600;

  console.log(`[Assessment] Creating assessment for topic: "${topic}" (${inputType}), difficulty: ${difficulty}, size: ${count}`);

  // Determine how many questions should come from external sources (scraper + LLM)
  const EXTERNAL_RATIO = 0.7; // 70% external, 30% DB fallback
  const externalTarget = Math.max(1, Math.round(count * EXTERNAL_RATIO));
  const dbFallbackTarget = count - externalTarget;

  let questions = [];

  // 1. Attempt to fetch from DB as fallback only if needed after external sources
  // (keep this as last resort)

  // 2. Scrape from web
  if (questions.length < externalTarget) {
    const neededScrape = externalTarget - questions.length;
    try {
      const scraped = await runScraper(topic, neededScrape);
      if (scraped && scraped.length > 0) {
        scraped.forEach((q) => (q.difficulty = difficulty));
        questions = [...questions, ...scraped];
        console.log(`[Assessment] Added ${scraped.length} questions from web scraper`);
      }
    } catch (err) {
      console.error("[Assessment] Error during scraping:", err);
    }
  }

  // 3. Generate remaining needed via LLM
  if (questions.length < externalTarget) {
    const neededLLM = externalTarget - questions.length;
    try {
      const generated = await generateQuestionsViaLLM(topic, difficulty, neededLLM);
      if (generated && generated.length > 0) {
        questions = [...questions, ...generated];
        console.log(`[Assessment] Added ${generated.length} questions generated via LLM`);
        // Cache generated questions for future reuse
        for (const q of generated) {
          pool.query(
            `INSERT INTO questions_store (topic, question_text, options, correct_option, explanation, difficulty)
             VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
            [q.topic || topic, q.question_text, JSON.stringify(q.options), q.correct_option, q.explanation, q.difficulty]
          ).catch((e) => console.error("[Assessment] Failed to cache generated question:", e));
        }
      }
    } catch (err) {
      console.error("[Assessment] Error during LLM generation:", err);
    }
  }

  // 4. Fallback to DB store for any remaining slots
  if (questions.length < count) {
    const neededDB = count - questions.length;
    try {
      const { rows } = await pool.query(
        `SELECT * FROM questions_store ORDER BY RANDOM() LIMIT $1`,
        [neededDB]
      );
      const fallbackQuestions = rows.map((r) => ({
        id: r.id,
        question_text: r.question_text,
        options: r.options,
        correct_option: r.correct_option,
        explanation: r.explanation,
        difficulty: r.difficulty,
        topic: r.topic,
      }));
      questions = [...questions, ...fallbackQuestions];
      console.log(`[Assessment] Pulled ${fallbackQuestions.length} global fallback questions`);
    } catch (err) {
      console.error("[Assessment] Fallback query failed:", err);
    }
  }

  // Trim to exactly requested count
  questions = questions.slice(0, count);

  // Assign temporary IDs where needed
  questions = questions.map((q, idx) => ({
    id: q.id || `temp-${idx}-${Date.now()}`,
    question_text: q.question_text,
    options: q.options,
    correct_option: q.correct_option,
    explanation: q.explanation,
    difficulty: q.difficulty,
    topic: q.topic,
  }));

  // Create assessment in DB
  const { rows } = await pool.query(
    `INSERT INTO assessments (user_id, topic, input_type, input_value, questions, duration_seconds, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'active')
     RETURNING *`,
    [userId, topic, inputType, inputValue, JSON.stringify(questions), timer]
  );

  const assessment = rows[0];

  // Return assessment with censored questions (no correct answers)
  const censoredQuestions = questions.map((q) => ({
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
