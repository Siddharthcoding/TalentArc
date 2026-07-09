import { HfInference } from "@huggingface/inference";

const STOP_WORDS = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can", "need",
    "this", "that", "these", "those", "it", "its", "we", "our", "you",
    "your", "they", "their", "not", "no", "nor", "so", "if", "than",
    "then", "else", "when", "where", "what", "which", "who", "whom",
    "why", "how", "all", "each", "every", "both", "few", "more", "most",
    "other", "some", "such", "only", "own", "same", "too", "very", "just",
    "about", "above", "after", "again", "also", "any", "because", "before",
    "between", "during", "into", "through", "up", "down", "over", "under",
    "out", "off", "here", "there", "while", "well", "back", "still", "yet",
]);

const tokenize = (text) => {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));
};

const buildTFIDFVector = (tokens, vocab) => {
    const freq = {};
    for (const t of tokens) {
        freq[t] = (freq[t] || 0) + 1;
    }
    const maxFreq = Math.max(1, ...Object.values(freq));
    const vec = new Array(vocab.length).fill(0);
    for (let i = 0; i < vocab.length; i++) {
        const count = freq[vocab[i]] || 0;
        if (count > 0) {
            vec[i] = 0.5 + (0.5 * count) / maxFreq;
        }
    }
    return vec;
};

const cosineSimilarity = (a, b) => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
};

const tfidfSimilarity = (textA, textB) => {
    const tokensA = tokenize(textA);
    const tokensB = tokenize(textB);
    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    const vocab = [...new Set([...tokensA, ...tokensB])];
    const vecA = buildTFIDFVector(tokensA, vocab);
    const vecB = buildTFIDFVector(tokensB, vocab);
    return cosineSimilarity(vecA, vecB);
};

const embeddingCache = new Map();

const getEmbedding = async (hf, text) => {
    if (embeddingCache.has(text)) {
        return embeddingCache.get(text);
    }
    const result = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
        provider: "hf-inference",
    }, {
        retry_on_error: false,
    });
    const embedding = Array.isArray(result[0]) ? result[0] : result;
    embeddingCache.set(text, embedding);
    return embedding;
};

const embeddingSimilarity = async (hf, textA, textB) => {
    const embA = await getEmbedding(hf, textA);
    const embB = await getEmbedding(hf, textB);
    return cosineSimilarity(embA, embB);
};

const matchSemantic = async (jd, resume, normalizedText) => {
    const flags = [];
    const details = {};
    let methodUsed = "tfidf";

    const jdResponsibilities = jd.responsibilities || [];
    const resumeExperience = resume.experience || [];
    const resumeProjects = resume.projects || [];

    const resumeBullets = resumeExperience
        .flatMap((e) => e.description || [])
        .filter(Boolean);

    const projectDescriptions = resumeProjects
        .flatMap((p) => p.description || [])
        .filter(Boolean);

    const allResumeTexts = [...resumeBullets, ...projectDescriptions];

    const hfToken = process.env.HF_TOKEN || "";
    const useHuggingFace = hfToken.length > 0 && jdResponsibilities.length > 0 && allResumeTexts.length > 0;

    const responsibilityMatches = [];

    if (useHuggingFace) {
        try {
            const hf = new HfInference(hfToken);
            methodUsed = "huggingface";

            for (const jdResp of jdResponsibilities) {
                let bestScore = 0;
                let bestMatch = "";

                for (const resumeText of allResumeTexts) {
                    const sim = await embeddingSimilarity(hf, jdResp, resumeText);
                    if (sim > bestScore) {
                        bestScore = sim;
                        bestMatch = resumeText;
                    }
                }

                if (bestMatch) {
                    responsibilityMatches.push({
                        jdResponsibility: jdResp,
                        matchedResumeBullet: bestMatch,
                        similarity: Math.round(bestScore * 1000) / 1000,
                    });
                }
            }
        } catch (err) {
            console.warn("[Semantic] HF embeddings failed, falling back to TF-IDF:", err.message);
            methodUsed = "tfidf";
        }
    }

    if (methodUsed === "tfidf") {
        for (const jdResp of jdResponsibilities) {
            let bestScore = 0;
            let bestMatch = "";

            for (const resumeText of allResumeTexts) {
                const sim = tfidfSimilarity(jdResp, resumeText);
                if (sim > bestScore) {
                    bestScore = sim;
                    bestMatch = resumeText;
                }
            }

            if (bestMatch) {
                responsibilityMatches.push({
                    jdResponsibility: jdResp,
                    matchedResumeBullet: bestMatch,
                    similarity: Math.round(bestScore * 1000) / 1000,
                });
            }
        }
    }

    const avgSimilarity = responsibilityMatches.length > 0
        ? responsibilityMatches.reduce((s, m) => s + m.similarity, 0) / responsibilityMatches.length
        : 0;

    const projectTechStack = resumeProjects
        .flatMap((p) => p.techStack || [])
        .map((t) => t.toLowerCase());

    const jdRequiredSkills = (jd.requiredSkills || []).map((s) => s.toLowerCase());
    const techOverlap = jdRequiredSkills.filter((s) =>
        projectTechStack.some((pt) => pt.includes(s))
    ).length;

    const projectRelevance = jdRequiredSkills.length > 0
        ? Math.round((techOverlap / jdRequiredSkills.length) * 100)
        : 50;

    const score = Math.round(
        (avgSimilarity * 60) + (projectRelevance * 0.4)
    );

    details.methodUsed = methodUsed;
    details.responsibilityMatches = responsibilityMatches;
    details.overallSimilarity = Math.round(avgSimilarity * 1000) / 1000;
    details.projectRelevance = projectRelevance;
    details.responsibilitiesCount = jdResponsibilities.length;
    details.resumeBulletsCount = allResumeTexts.length;

    if (jdResponsibilities.length === 0) {
        flags.push("No responsibilities specified in the JD to match against");
    }
    if (allResumeTexts.length === 0) {
        flags.push("No experience descriptions or project details in resume");
    }
    if (avgSimilarity < 0.2 && responsibilityMatches.length > 0) {
        flags.push("Low semantic similarity — resume responsibilities may not align with JD requirements");
    }
    if (projectRelevance < 30) {
        flags.push("Project tech stack has limited overlap with JD required skills");
    }
    if (methodUsed === "tfidf" && jdResponsibilities.length > 0) {
        flags.push("Using TF-IDF similarity (not embeddings) — set HF_TOKEN for semantic matching");
    }

    return { score, maxScore: 100, flags, details };
};

export default matchSemantic;
