import { HfInference } from "@huggingface/inference";

const buildPrompt = (jd, resume, skillResult, keywordResult, experienceResult) => {
    const resumeBullets = (resume.experience || [])
        .flatMap((e) => e.description || [])
        .filter(Boolean)
        .slice(0, 8)
        .map((b) => `- ${b}`)
        .join("\n");

    const missingSkills = skillResult?.details?.missingRequired || [];
    const missingKeywords = keywordResult?.details?.missingKeywords || [];
    const domainRelevance = experienceResult?.details?.domainRelevance || "medium";

    return [
        "You are an expert ATS resume writer. Given a Job Description and a candidate's resume, provide rewrite suggestions.",
        "",
        "--- JOB DESCRIPTION ---",
        `Company: ${jd.company || "N/A"}`,
        `Required Skills: ${(jd.requiredSkills || []).join(", ")}`,
        `Preferred Skills: ${(jd.preferredSkills || []).join(", ")}`,
        `Responsibilities: ${(jd.responsibilities || []).join("; ")}`,
        `Experience Required: ${jd.experience?.minimumYears || "N/A"} years`,
        `Education Required: ${jd.education?.degree || "N/A"} in ${jd.education?.field || "N/A"}`,
        "",
        "--- RESUME BULLET POINTS ---",
        resumeBullets || "(none provided)",
        "",
        "--- IDENTIFIED GAPS ---",
        `Missing Required Skills: ${missingSkills.join(", ") || "none"}`,
        `Missing ATS Keywords: ${missingKeywords.slice(0, 10).join(", ") || "none"}`,
        `Domain Relevance: ${domainRelevance}`,
        "",
        "Based on the above, provide rewrite suggestions for the resume bullet points.",
        "For each suggestion, include:",
        "1. The original bullet point text",
        "2. A rewritten version that is stronger, quantified, and includes relevant keywords",
        "3. A brief reason for the change",
        "",
        "Respond ONLY with valid JSON using this exact format:",
        '{',
        '  "suggestions": [',
        '    { "original": "original text", "suggested": "rewritten text", "reason": "why this change helps" }',
        '  ],',
        '  "keywordInjections": ["keyword1", "keyword2"]',
        '}',
    ].join("\n");
};

const generateTemplateSuggestions = (skillResult, keywordResult) => {
    const suggestions = [];
    const missingSkills = skillResult?.details?.missingRequired || [];
    const missingKeywords = keywordResult?.details?.missingKeywords || [];

    if (missingSkills.length > 0) {
        suggestions.push({
            original: "(missing skill)",
            suggested: `Add "${missingSkills[0]}" to your skills section if you have relevant experience with it.`,
            reason: "This is a required skill in the job description that was not detected in your resume.",
        });
    }

    if (missingKeywords.length > 0) {
        const topMissing = missingKeywords.slice(0, 5);
        suggestions.push({
            original: "(missing keyword)",
            suggested: `Incorporate these keywords naturally into your experience descriptions: ${topMissing.join(", ")}.`,
            reason: "These ATS keywords from the job description were not found in your resume.",
        });
    }

    return suggestions;
};

const suggestRewrites = async (jd, resume, matcherResults) => {
    const flags = [];
    const details = {};

    const skillResult = matcherResults?.skill || {};
    const keywordResult = matcherResults?.keyword || {};
    const experienceResult = matcherResults?.experience || {};

    const hfToken = process.env.HF_TOKEN || "";
    let suggestions = [];
    let keywordInjections = [];
    let llmEnhanced = false;

    if (hfToken) {
        try {
            const prompt = buildPrompt(jd, resume, skillResult, keywordResult, experienceResult);
            const hf = new HfInference(hfToken);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await hf.chatCompletion({
                model: process.env.HF_MODEL || "meta-llama/Llama-3.1-8B-Instruct:scaleway",
                messages: [
                    { role: "system", content: "You are a helpful ATS resume writer. Always respond with valid JSON only." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 800,
                temperature: 0.3,
            });

            clearTimeout(timeoutId);

            const content = response?.choices?.[0]?.message?.content;
            if (content) {
                const parsed = parseJSONResponse(content);
                if (parsed) {
                    suggestions = parsed.suggestions || [];
                    keywordInjections = parsed.keywordInjections || [];
                    llmEnhanced = true;
                }
            }
        } catch (err) {
            console.warn("[Rewrite] LLM request failed:", err.message.slice(0, 200));
        }
    }

    if (!llmEnhanced) {
        suggestions = generateTemplateSuggestions(skillResult, keywordResult);
        keywordInjections = (skillResult?.details?.missingRequired || [])
            .concat(keywordResult?.details?.missingKeywords || [])
            .slice(0, 10);
    }

    const score = suggestions.length > 0 ? Math.min(100, suggestions.length * 25) : 0;

    details.suggestions = suggestions;
    details.keywordInjections = keywordInjections;
    details.llmEnhanced = llmEnhanced;

    if (suggestions.length === 0) {
        flags.push("No rewrite suggestions generated — resume may already be well-aligned");
    }
    if (!llmEnhanced && hfToken) {
        flags.push("LLM rewrite failed — using template-based suggestions");
    }
    if (!hfToken) {
        flags.push("Set HF_TOKEN in .env for AI-powered rewrite suggestions");
    }

    return { score, maxScore: 100, flags, details };
};

const parseJSONResponse = (text) => {
    const trimmed = text.trim();
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
        try {
            return JSON.parse(trimmed.slice(start, end + 1));
        } catch {
            return null;
        }
    }
    return null;
};

export default suggestRewrites;
