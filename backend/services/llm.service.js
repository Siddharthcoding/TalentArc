import { HfInference } from "@huggingface/inference";

const DEFAULT_MODEL = "deepseek-ai/DeepSeek-V4-Flash-0731:fireworks-ai";
const TIMEOUT_MS = 30000;
const MAX_TOKENS = 800;
const TEMPERATURE = 0.3;

const getConfig = () => ({
    token: process.env.HF_TOKEN || "",
    model: process.env.HF_MODEL || DEFAULT_MODEL,
});

const buildPrompt = (structured, ats, scoring) => {
    const { overallScore, maxScore, percentage, categories } = scoring;
    const flags = [];
    const layers = ["formatting", "contact", "completeness", "style", "keywords"];
    for (const layer of layers) {
        if (ats[layer]?.flags) {
            for (const f of ats[layer].flags) {
                flags.push(`[${layer}] ${f}`);
            }
        }
    }

    const keywordDetails = ats.keywords?.details || {};
    const topKeywords = (keywordDetails.topKeywords || []).slice(0, 5);

    let categoryLines = "";
    for (const [name, cat] of Object.entries(categories)) {
        categoryLines += `  ${name}: ${cat.score}/${cat.maxScore} (${cat.percentage}%)\n`;
    }

    const flagText = flags.length > 0
        ? flags.slice(0, 8).map((f) => `- ${f}`).join("\n")
        : "None identified";

    const keywordText = topKeywords.length > 0
        ? topKeywords.map((k) => `- ${k.word} (${k.count}x)`).join("\n")
        : "None identified";

    const categoriesList = Object.keys(categories)
        .map((name) => `"${name}": "1 sentence feedback on ${name}"`)
        .join(",\n    ");

    return [
        "You are an expert ATS resume analyst. Given the following resume evaluation metrics, provide concise and actionable narrative feedback.",
        "",
        `Overall Score: ${overallScore}/${maxScore} (${percentage}%)`,
        "",
        "Category Scores:",
        categoryLines,
        "",
        "Issues & Flags:",
        flagText,
        "",
        "Top Keywords:",
        keywordText,
        "",
        'Respond ONLY with valid JSON. Use this exact format:',
        "{",
        '  "overallAssessment": "2-3 sentence overall evaluation",',
        '  "categoryFeedback": {',
        `    ${categoriesList}`,
        "  },",
        '  "recommendations": ["Top priority", "Second priority", "Third priority"],',
        '  "strengthLabel": "Excellent|Strong|Good|Fair|Needs Improvement"',
        "}",
    ].join("\n");
};

const parseJSONResponse = (text) => {
    const trimmed = text.trim();

    if (trimmed.startsWith("{")) {
        try {
            return JSON.parse(trimmed);
        } catch {
            const start = trimmed.indexOf("{");
            const end = trimmed.lastIndexOf("}");
            if (start !== -1 && end > start) {
                try {
                    return JSON.parse(trimmed.slice(start, end + 1));
                } catch {
                    return null;
                }
            }
        }
    }

    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch {
            return null;
        }
    }

    return null;
};

const generateNarrative = async (structured, ats, scoring) => {
    const config = getConfig();

    if (!config.token) {
        console.warn("[LLM] No HF_TOKEN set in .env; skipping LLM narrative");
        return null;
    }

    const prompt = buildPrompt(structured, ats, scoring);

    try {
        const hf = new HfInference(config.token);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await hf.chatCompletion({
            model: config.model,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful ATS resume analyst. Always respond with valid JSON only.",
                },
                { role: "user", content: prompt },
            ],
            max_tokens: MAX_TOKENS,
            temperature: TEMPERATURE,
        });

        clearTimeout(timeoutId);

        const content = response?.choices?.[0]?.message?.content;
        if (!content) {
            console.warn("[LLM] Empty response from model");
            return null;
        }

        const parsed = parseJSONResponse(content);
        if (!parsed) {
            console.warn("[LLM] Failed to parse JSON from response:", content.slice(0, 300));
            return null;
        }

        return parsed;
    } catch (err) {
        const msg = err.message || "";
        const detail = err.httpResponse?.body?.error?.message || "";

        if (detail.includes("not supported by any provider")) {
            console.warn(
                "[LLM] HF Inference Providers not configured. Enable free providers at " +
                "https://hf.co/settings/inference-providers"
            );
        } else if (msg.includes("timed out") || msg.includes("abort")) {
            console.warn("[LLM] Request timed out");
        } else {
            console.warn(`[LLM] Request failed: ${(detail || msg).slice(0, 200)}`);
        }
        return null;
    }
};

export { generateNarrative };
