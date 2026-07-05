import { TECH_SKILLS, findMatchedSkills, findMissingTechSkills } from "../data/techSkills.js";

const STOP_WORDS = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can", "need",
    "this", "that", "these", "those", "it", "its", "we", "our", "they",
    "their", "he", "she", "his", "her", "them", "all", "each", "every",
    "some", "any", "no", "not", "none", "both", "either", "neither",
    "about", "into", "over", "after", "before", "between", "under",
    "above", "below", "up", "down", "out", "off", "than", "then",
    "also", "very", "just", "more", "most", "much", "many", "such",
    "only", "own", "same", "so", "too", "other", "another",
    "i", "my", "me", "myself", "you", "your", "yours",
    "using", "used", "use", "based", "via", "including",
]);

const analyzeKeywords = (structured, normalizedText) => {
    const flags = [];
    const details = {};
    let deductions = 0;

    const words = normalizedText
        .toLowerCase()
        .replace(/[^a-z0-9\s#+.\-]/g, " ")
        .split(/\s+/)
        .filter(Boolean);

    const wordFreq = {};
    for (const word of words) {
        if (!STOP_WORDS.has(word) && word.length > 2 && /[a-z]/.test(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    }

    const sortedTerms = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);

    details.topKeywords = sortedTerms.slice(0, 10).map(([word, count]) => ({ word, count }));
    details.totalUniqueKeywords = sortedTerms.length;

    const totalSignificantWords = sortedTerms.reduce((s, [, c]) => s + c, 0);
    const totalWords = words.length;
    details.keywordDensity = totalWords > 0
        ? ((totalSignificantWords / totalWords) * 100).toFixed(1) + "%"
        : "0%";

    const triGrams = {};
    for (let i = 0; i < words.length - 2; i++) {
        const w0 = words[i];
        const segment = words.slice(i, i + 3);
        const phrase = segment.join(" ");
        if (segment.every(Boolean) && w0 && !STOP_WORDS.has(w0) && phrase.length > 8) {
            triGrams[phrase] = (triGrams[phrase] || 0) + 1;
        }
    }

    const repeatedEntries = Object.entries(triGrams)
        .filter(([, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const repeatedPhrases = repeatedEntries.map(([phrase, count]) => ({ phrase, count }));
    details.repeatedPhrases = repeatedPhrases;

    if (repeatedPhrases.length > 0 && repeatedPhrases[0]) {
        const top = repeatedPhrases[0];
        flags.push(`Repetitive phrasing detected: "${top.phrase}" used ${top.count} times`);
        deductions += 0.5;
    }

    const skillsAll = structured.skills?.all || [];
    const { matched, unmatched } = findMatchedSkills(skillsAll);
    const missingCategories = findMissingTechSkills(skillsAll);

    details.skillsMatched = matched;
    details.skillsUnmatched = unmatched;
    details.missingCategories = missingCategories;

    const matchedSkillCount = Object.values(matched).flat().length;
    const allSkillCount = skillsAll.length;

    if (matchedSkillCount < 3) {
        flags.push("Very few recognized technical skills found");
        deductions += 1.5;
    }

    if (missingCategories.length > 0) {
        const catNames = missingCategories.map((m) => m.category).join(", ");
        flags.push(`Missing skill categories: ${catNames} — consider adding relevant technologies`);
        deductions += Math.min(1.5, missingCategories.length * 0.5);
    }

    if (allSkillCount > 30) {
        flags.push(`Very large number of skills listed (${allSkillCount}) — consider focusing on core competencies`);
        deductions += 0.5;
    }

    const uniqueTerms = new Set(words);
    const lexicalDiversity = uniqueTerms.size / Math.max(1, totalWords);
    details.lexicalDiversity = Math.round(lexicalDiversity * 100) / 100;

    if (lexicalDiversity > 0.7) {
        flags.push("Very high lexical diversity — text may lack keyword focus");
        deductions += 0.5;
    } else if (lexicalDiversity < 0.2) {
        flags.push("Very low lexical diversity — excessive keyword stuffing");
        deductions += 1;
    }

    const score = Math.max(0, 10 - deductions);
    return {
        score: Math.round(score * 10) / 10,
        maxScore: 10,
        flags,
        details,
    };
};

export default analyzeKeywords;
