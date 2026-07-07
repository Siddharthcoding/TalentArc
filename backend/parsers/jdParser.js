import { TECH_SKILLS } from "../data/techSkills.js";

const SECTION_PATTERNS = [
    {
        name: "about",
        patterns: [
            /^about\b/i, /^company\b/i, /^overview\b/i,
            /^about the company\b/i, /^who we are\b/i,
        ],
    },
    {
        name: "responsibilities",
        patterns: [
            /^responsibilities\b/i, /^what you('ll| will) do\b/i,
            /^key responsibilities\b/i, /^the role\b/i,
            /^about the role\b/i, /^role overview\b/i,
            /^what you('ll| will) be doing\b/i, /^duties\b/i,
            /^job responsibilities\b/i, /^primary responsibilities\b/i,
            /^what the role entails\b/i,
        ],
    },
    {
        name: "requirements",
        patterns: [
            /^requirements\b/i, /^qualifications\b/i,
            /^what you bring\b/i, /^required qualifications\b/i,
            /^must have\b/i, /^must-have\b/i, /^minimum requirements\b/i,
            /^what we('re| are) looking for\b/i, /^required skills\b/i,
            /^job requirements\b/i, /^candidate requirements\b/i,
            /^ideal candidate\b/i, /^key requirements\b/i,
            /^essential requirements\b/i, /^technical requirements\b/i,
            /^skill requirements\b/i, /^what you need\b/i,
        ],
    },
    {
        name: "preferred",
        patterns: [
            /^preferred\b/i, /^nice to have\b/i, /^good to have\b/i,
            /^bonus points\b/i, /^bonus\b/i, /^plus\b/i,
            /^preferred qualifications\b/i, /^additional qualifications\b/i,
            /^desired qualifications\b/i, /^nice-to-have\b/i,
        ],
    },
    {
        name: "education",
        patterns: [
            /^education\b/i, /^educational requirements\b/i,
            /^degree\b/i, /^education & certifications\b/i,
            /^education and experience\b/i,
        ],
    },
    {
        name: "benefits",
        patterns: [
            /^benefits\b/i, /^perks\b/i, /^what we offer\b/i,
            /^why join us\b/i, /^compensation\b/i,
            /^we offer\b/i,
        ],
    },
];

const EXP_YEARS_PATTERNS = [
    /(\d+)\+?\s*(?:to|–|-|,)\s*(\d+)\s*\+?\s*years?/i,
    /(\d+)\s*[-–to]+\s*(\d+)\s*\+?\s*years?/i,
    /(\d+)\+?\s*years?/i,
    /(?:minimum|at least|min)\s*(?:of\s*)?(\d+)\s*years?/i,
    /(\d+)\s*years?\s*(?:of\s*)?(?:experience|work)/i,
];

const DEGREE_PATTERNS = [
    { pattern: /bachelor(?:'s)?\s*(?:degree)?/i, value: "Bachelor's" },
    { pattern: /master(?:'s)?\s*(?:degree)?/i, value: "Master's" },
    { pattern: /phd|ph\.\s*d\.|doctorate/i, value: "PhD" },
    { pattern: /b\.?\s*tech/i, value: "B.Tech" },
    { pattern: /m\.?\s*tech/i, value: "M.Tech" },
    { pattern: /b\.?\s*e\.?/i, value: "B.E." },
    { pattern: /m\.?\s*e\.?/i, value: "M.E." },
    { pattern: /mba/i, value: "MBA" },
    { pattern: /associate(?:'s)?\s*(?:degree)?/i, value: "Associate's" },
    { pattern: /(?:b|m)\s*\.?\s*s\s*\.?\s*c\s*\.?/i, value: "BSc/MSc" },
];

const FIELD_PATTERNS = [
    /computer\s*science/i,
    /computer\s*engineering/i,
    /software\s*engineering/i,
    /information\s*technology/i,
    /information\s*systems/i,
    /data\s*science/i,
    /data\s*engineering/i,
    /machine\s*learning/i,
    /artificial\s*intelligence/i,
    /cybersecurity/i,
    /electrical\s*engineering/i,
    /electronics\s*engineering/i,
    /related\s*field/i,
];

const STOP_WORDS = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can", "need",
    "this", "that", "these", "those", "it", "its", "we", "our", "you",
    "your", "they", "their", "he", "she", "him", "her", "his", "not",
    "no", "nor", "so", "if", "than", "then", "else", "when", "where",
    "what", "which", "who", "whom", "why", "how", "all", "each", "every",
    "both", "few", "more", "most", "other", "some", "such", "only", "own",
    "same", "too", "very", "just", "about", "above", "after", "again",
    "also", "any", "because", "before", "between", "during", "into",
    "through", "up", "down", "over", "under", "out", "off", "here",
    "there", "while", "well", "back", "still", "yet", "able", "like",
    "etc", "eg", "ie", "e.g", "i.e", "including", "including:",
    "must", "able", "within", "across", "along", "among", "upon",
    "using", "based", "work", "role", "team", "new",
]);

const ACTION_VERB_PATTERN = /^\s*(?:develop|design|build|create|implement|manage|lead|drive|oversee|coordinate|establish|define|architect|engineer|maintain|support|improve|optimize|enhance|monitor|troubleshoot|resolve|analyze|evaluate|assess|review|audit|test|deploy|integrate|collaborate|communicate|mentor|train|guide|participate|contribute|ensure|deliver|provide|perform|execute|conduct|prepare|document|report|write|configure|customize|administer|operate|facilitate|champion|advise|consult|research|investigate|identify|recommend|prioritize|plan|organize|direct|supervise|own|automate|streamline|restructure|migrate|scale|secure)\b/i;

const ALL_TECH_SKILLS_FLAT = [...new Set(Object.values(TECH_SKILLS).flat())];

const SKILLS_TO_SKIP = new Set(["r", "c", "go"]);

const detectSections = (lines) => {
    const sections = {
        preamble: [],
        about: [],
        responsibilities: [],
        requirements: [],
        preferred: [],
        education: [],
        benefits: [],
    };

    let currentSection = "preamble";

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let matched = false;
        for (const sec of SECTION_PATTERNS) {
            for (const pattern of sec.patterns) {
                if (pattern.test(trimmed)) {
                    currentSection = sec.name;
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }

        if (!matched) {
            sections[currentSection].push(trimmed);
        }
    }

    return sections;
};

const extractCompany = (preamble, aboutLines) => {
    if (aboutLines.length > 0) {
        const aboutText = aboutLines.join(" ");
        const match = aboutText.match(/([A-Z][A-Za-z0-9\s&.]+?)(?:\s+(?:is|are|was|were)\b)/i);
        if (match) {
            const candidate = match[1].trim();
            if (candidate.length > 1 && candidate.length < 60) {
                return candidate;
            }
        }
    }

    const preambleText = preamble.join(" ");

    const atJoinMatch = preambleText.match(/(?:at|join)\s+([A-Z][A-Za-z0-9&.]+)/);
    if (atJoinMatch) {
        return atJoinMatch[1].trim();
    }

    const hiringMatch = preambleText.match(/([A-Z][A-Za-z0-9\s&.]+?)\s+(?:is\s+(?:looking|seeking|hiring))/i);
    if (hiringMatch) {
        return hiringMatch[1].trim();
    }

    const firstLine = preamble[0] || "";
    const cleaned = firstLine.replace(/^[#*•\-]\s*/, "").trim();
    const words = cleaned.split(/\s+/);

    for (let i = 0; i < words.length; i++) {
        if (/^[A-Z][a-z]/.test(words[i]) && words[i].length > 2) {
            const nameWords = words.slice(i, Math.min(i + 3, words.length));
            const candidate = nameWords.join(" ").replace(/[.,!?;:]$/, "");
            if (candidate.length > 2) {
                return candidate;
            }
        }
    }

    return "";
};

const extractResponsibilities = (lines) => {
    const bullets = [];

    for (const line of lines) {
        const cleaned = line.replace(/^[-•●▪‣▸▹►▻◆◇○◉◎◈⁃⁌⁍]\s*/, "").trim();
        if (!cleaned || cleaned.length < 10) continue;
        if (ACTION_VERB_PATTERN.test(cleaned)) {
            bullets.push(cleaned);
        }
    }

    return bullets;
};

const extractSkillsFromText = (text) => {
    if (!text.trim()) return [];

    const lowerText = text.toLowerCase();
    const found = [];

    for (const skill of ALL_TECH_SKILLS_FLAT) {
        if (SKILLS_TO_SKIP.has(skill)) continue;

        const escaped = skill.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp("\\b" + escaped + "\\b", "i");
        if (regex.test(text)) {
            found.push(skill);
        }
    }

    const unique = [...new Set(found.map((s) => s.trim()))];
    return unique.sort();
};

const extractExperience = (sections) => {
    const allSectionLines = [
        ...sections.requirements,
        ...sections.preferred,
        ...sections.education,
    ];
    const text = allSectionLines.join(" ");

    let minimumYears = null;
    let maximumYears = null;

    for (const pattern of EXP_YEARS_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            if (match[2] !== undefined) {
                minimumYears = parseInt(match[1], 10);
                maximumYears = parseInt(match[2], 10);
            } else {
                minimumYears = parseInt(match[1], 10);
                maximumYears = null;
            }
            break;
        }
    }

    const lines = allSectionLines
        .filter((l) => /years?\s*(?:of\s*)?(?:experience|work)/i.test(l))
        .slice(0, 3);

    return {
        minimumYears,
        maximumYears,
        description: lines.join(" "),
    };
};

const extractEducation = (sections) => {
    const allSectionLines = [
        ...sections.education,
        ...sections.requirements,
        ...sections.preferred,
    ];
    const text = allSectionLines.join(" ");

    let degree = null;
    for (const entry of DEGREE_PATTERNS) {
        if (entry.pattern.test(text)) {
            degree = entry.value;
            break;
        }
    }

    let field = null;
    const fieldText = sections.education.length > 0
        ? sections.education.join(" ")
        : text;
    for (const fp of FIELD_PATTERNS) {
        const match = fieldText.match(fp);
        if (match) {
            field = match[0].trim();
            break;
        }
    }

    const lines = sections.education.length > 0
        ? sections.education.slice(0, 5)
        : [];

    return {
        degree,
        field,
        description: lines.join(" "),
    };
};

const extractKeywords = (normalizedText, allMatchedSkills) => {
    const tokens = normalizedText
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .filter((t) => t.length >= 3 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));

    const freq = {};
    for (const token of tokens) {
        freq[token] = (freq[token] || 0) + 1;
    }

    const words = tokens;
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        bigrams.push(`${words[i]} ${words[i + 1]}`);
    }

    const bigramFreq = {};
    for (const bg of bigrams) {
        bigramFreq[bg] = (bigramFreq[bg] || 0) + 1;
    }

    const sortedWords = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map((e) => e[0]);

    const sortedBigrams = Object.entries(bigramFreq)
        .filter(([, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map((e) => e[0]);

    const combined = [...new Set([...allMatchedSkills, ...sortedBigrams, ...sortedWords])];

    return combined.slice(0, 40);
};

const parseJDText = (normalizedText) => {
    if (!normalizedText || typeof normalizedText !== "string" || !normalizedText.trim()) {
        return {
            company: "",
            requiredSkills: [],
            preferredSkills: [],
            responsibilities: [],
            experience: { minimumYears: null, maximumYears: null, description: "" },
            education: { degree: null, field: null, description: "" },
            keywords: [],
        };
    }

    const lines = normalizedText.split("\n");
    const sections = detectSections(lines);

    const company = extractCompany(sections.preamble, sections.about);
    const responsibilities = extractResponsibilities(sections.responsibilities);

    const requiredSkills = extractSkillsFromText(sections.requirements.join(" "));
    const preferredSkills = extractSkillsFromText(sections.preferred.join(" "));

    const experience = extractExperience(sections);
    const education = extractEducation(sections);

    const allMatchedSkills = [...new Set([...requiredSkills, ...preferredSkills])];
    const keywords = extractKeywords(normalizedText, allMatchedSkills);

    return {
        company,
        requiredSkills,
        preferredSkills,
        responsibilities,
        experience,
        education,
        keywords,
    };
};

export default parseJDText;
