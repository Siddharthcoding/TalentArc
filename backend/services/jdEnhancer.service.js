import { HfInference } from "@huggingface/inference";

const hf = process.env.HF_TOKEN
    ? new HfInference(process.env.HF_TOKEN)
    : null;

const buildEnhancePrompt = (rawText, jdResult) => ({
    messages: [
        {
            role: "system",
            content: "You extract structured data from job descriptions. Return ONLY valid JSON. No markdown, no explanation.",
        },
        {
            role: "user",
            content: [
                "Extract the following from this job description text:",
                "",
                "1. requiredSkills: technical skills EXPLICITLY listed as required or must-have (array of strings, lowercase)",
                "2. preferredSkills: technical skills listed as preferred or nice-to-have (array of strings, lowercase)",
                "3. keywords: important ATS keywords and domain terms relevant to the role (array of strings, lowercase). Include: programming languages, frameworks, tools, platforms, methodologies, domain terms (e.g. fintech, payments, distributed systems). EXCLUDE: generic English words, common adjectives, location names, university names, company names, date terms, recruitment process terms.",
                "",
                "EXAMPLES of good keywords: python, react, kubernetes, aws, microservices, payments, distributed systems, ci/cd, agile",
                "EXAMPLES of bad keywords: passionate, team player, fast learner, students, campus, online, physical, mode, job, 30th, june, kiit, india, office",
                "",
                "Job description text:",
                rawText.slice(0, 4000),
                "",
                "Existing dictionary-based extraction (may be incomplete):",
                JSON.stringify({
                    requiredSkills: jdResult.requiredSkills || [],
                    preferredSkills: jdResult.preferredSkills || [],
                    keywords: jdResult.keywords || [],
                }),
                "",
                "Return JSON: { requiredSkills: string[], preferredSkills: string[], keywords: string[] }",
            ].join("\n"),
        },
    ],
    max_tokens: 600,
    temperature: 0.1,
});

const enhanceJD = async (rawText, jdResult) => {
    if (!hf || !rawText || !rawText.trim()) return jdResult;

    try {
        const { messages, ...params } = buildEnhancePrompt(rawText, jdResult);

        const response = await hf.chatCompletion({
            model: process.env.HF_MODEL || "deepseek-ai/DeepSeek-V4-Flash-0731:fireworks-ai",
            ...params,
            messages,
        });

        const content = response?.choices?.[0]?.message?.content;
        if (!content) return jdResult;

        const start = content.indexOf("{");
        const end = content.lastIndexOf("}");
        if (start === -1 || end <= start) return jdResult;

        const parsed = JSON.parse(content.slice(start, end + 1));

        const llmRequired = Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills.map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
        const llmPreferred = Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills.map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
        const llmKeywords = Array.isArray(parsed.keywords) ? parsed.keywords.map((s) => s.trim().toLowerCase()).filter(Boolean) : [];

        const dictRequired = (jdResult.requiredSkills || []).map((s) => s.toLowerCase());
        const dictPreferred = (jdResult.preferredSkills || []).map((s) => s.toLowerCase());
        const dictKeywords = (jdResult.keywords || []).map((s) => s.toLowerCase());

        const mergedRequired = [...new Set([...dictRequired, ...llmRequired])];
        const mergedPreferred = [...new Set([...dictPreferred, ...llmPreferred])];
        const mergedKeywords = [...new Set([...dictKeywords, ...llmKeywords])];

        console.log("[JD Enhancer] LLM extracted", llmRequired.length, "required,", llmPreferred.length, "preferred,", llmKeywords.length, "keywords");

        return {
            ...jdResult,
            requiredSkills: mergedRequired.sort(),
            preferredSkills: mergedPreferred.sort(),
            keywords: mergedKeywords.sort().slice(0, 40),
            llmEnhanced: true,
        };
    } catch (err) {
        console.warn("[JD Enhancer] LLM request failed:", err.message.slice(0, 200));
        return jdResult;
    }
};

export default enhanceJD;
