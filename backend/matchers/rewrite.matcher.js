import { HfInference } from "@huggingface/inference";

const getResumeBullets = (resume) => {
    const expBullets = (resume.experience || [])
        .flatMap((e) => e.description || []);
    const projectBullets = (resume.projects || [])
        .flatMap((p) => p.description || []);
    const allBullets = [...expBullets, ...projectBullets];
    return allBullets.filter(Boolean).slice(0, 8);
};

const buildPrompt = (jd, resume, skillResult, keywordResult, experienceResult) => {
    const resumeBullets = getResumeBullets(resume)
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
        "--- RESUME BULLET POINTS (THESE ARE THE ONLY LINES TO REWRITE) ---",
        resumeBullets || "(NO RESUME BULLETS PROVIDED — return empty suggestions)",
        "",
        "--- IDENTIFIED GAPS ---",
        `Missing Required Skills: ${missingSkills.join(", ") || "none"}`,
        `Missing ATS Keywords: ${missingKeywords.slice(0, 10).join(", ") || "none"}`,
        `Domain Relevance: ${domainRelevance}`,
        "",
        "CRITICAL RULES (VIOLATION WILL REJECT YOUR RESPONSE):",
        "1. The 'original' field MUST be copied verbatim from the Resume Bullet Points listed above. NEVER use JD text or fabricated content — your response will be rejected.",
        "2. Rewrite each original bullet to be stronger: add quantified impact, inject relevant missing skills/keywords, and use active language.",
        "3. The 'reason' must explain how the rewrite improves ATS compatibility or addresses a specific gap.",
        "4. If no resume bullet points are provided above (the RESUME BULLET POINTS section says 'NO RESUME BULLETS PROVIDED'), return an empty suggestions array immediately.",
        "5. NEVER return more suggestions than the number of resume bullet points provided.",
        "",
        "Respond ONLY with valid JSON using this exact format:",
        '{',
        '  "suggestions": [',
        '    { "original": "original resume bullet", "suggested": "rewritten stronger version", "reason": "why this change improves the match" }',
        '  ],',
        '  "keywordInjections": ["keyword1", "keyword2"]',
        '}',
    ].join("\n");
};

const generateTemplateSuggestions = (resume, jd, skillResult, keywordResult) => {
    const suggestions = [];
    const missingSkills = skillResult?.details?.missingRequired || [];
    const missingKeywords = keywordResult?.details?.missingKeywords || [];

    const resumeBullets = getResumeBullets(resume);

    if (resumeBullets.length === 0) {
        return suggestions;
    }

    const allGaps = [...missingSkills, ...missingKeywords.slice(0, 5)];
    const usedGaps = new Set();

    for (const bullet of resumeBullets) {
        const applicableGaps = allGaps.filter(
            (g) => !bullet.toLowerCase().includes(g.toLowerCase()) && !usedGaps.has(g)
        );

        if (applicableGaps.length > 0) {
            const gap = applicableGaps[0];
            usedGaps.add(gap);

            let suggested = bullet;
            if (!suggested.endsWith(".")) suggested += ".";

            if (missingSkills.includes(gap)) {
                suggested = suggested.replace(
                    /\.$/,
                    ` Leveraged ${gap} to drive measurable improvements in project outcomes.`
                );
            } else {
                suggested = suggested.replace(
                    /\.$/,
                    ` with a strong focus on ${gap} best practices and industry standards.`
                );
            }

            suggestions.push({
                original: bullet,
                suggested,
                reason: `Injects the missing ${missingSkills.includes(gap) ? "required skill" : "keyword"} "${gap}" to improve ATS alignment with the job description.`,
            });
        }
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

            if (llmEnhanced && suggestions.length > 0) {
                const actualBullets = getResumeBullets(resume).map((b) => b.trim());

                suggestions = suggestions.filter((s) => {
                    const orig = (s.original || "").trim();
                    return actualBullets.includes(orig);
                });

                if (suggestions.length === 0) {
                    llmEnhanced = false;
                }
            }
        } catch (err) {
            console.warn("[Rewrite] LLM request failed:", err.message.slice(0, 200));
        }
    }

    if (!llmEnhanced) {
        suggestions = generateTemplateSuggestions(resume, jd, skillResult, keywordResult);
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
