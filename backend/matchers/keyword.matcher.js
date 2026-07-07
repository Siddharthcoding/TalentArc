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
    "able", "like", "etc", "eg", "ie", "including", "must", "within",
    "across", "along", "among", "upon", "using", "based", "new",
]);

const normalize = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s+#.]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));
};

const matchKeywords = (jd, resume, normalizedText) => {
    const flags = [];
    const details = {};

    const resumeText = normalizedText || "";
    const resumeTokens = normalize(resumeText);
    const resumeTokenSet = new Set(resumeTokens);

    const resumeFreq = {};
    for (const token of resumeTokens) {
        resumeFreq[token] = (resumeFreq[token] || 0) + 1;
    }

    const jdKeywords = jd.keywords || [];
    const lowerJdKeywords = jdKeywords.map((k) => k.toLowerCase().trim());

    const overlapping = [];
    const missing = [];

    for (let i = 0; i < jdKeywords.length; i++) {
        const kw = jdKeywords[i];
        const lower = lowerJdKeywords[i];

        const kwTokens = lower.split(/\s+/);
        const allTokensPresent = kwTokens.every((t) => resumeTokenSet.has(t));

        if (allTokensPresent || resumeTokenSet.has(lower)) {
            overlapping.push(kw);
        } else {
            const fuzzy = kwTokens.some((t) => resumeTokenSet.has(t));
            if (fuzzy) {
                overlapping.push(kw);
            } else {
                missing.push(kw);
            }
        }
    }

    const total = jdKeywords.length;
    const overlapCount = overlapping.length;
    const score = total > 0 ? Math.round((overlapCount / total) * 100) : 100;

    let sumFrequency = 0;
    for (const kw of overlapping) {
        const lower = kw.toLowerCase();
        const tokens = lower.split(/\s+/);
        for (const t of tokens) {
            sumFrequency += resumeFreq[t] || 0;
        }
    }

    const keywordDensity = resumeTokens.length > 0
        ? Math.round((sumFrequency / resumeTokens.length) * 1000) / 10
        : 0;

    details.overlappingKeywords = overlapping;
    details.missingKeywords = missing;
    details.totalJdKeywords = total;
    details.overlapCount = overlapCount;
    details.keywordDensity = keywordDensity;

    if (missing.length > 0) {
        flags.push(`Missing ATS keywords: ${missing.slice(0, 10).join(", ")}`);
    }
    if (score < 30 && total > 0) {
        flags.push("Very low keyword overlap — resume may not be optimized for ATS screening");
    }
    if (keywordDensity < 5 && overlapping.length > 0) {
        flags.push("Keywords appear infrequently — consider increasing their density");
    }
    if (missing.length === 0 && total > 0) {
        flags.push("All JD keywords found in resume — strong ATS alignment");
    }

    return { score, maxScore: 100, flags, details };
};

export default matchKeywords;
