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
            /^job description\b/i,
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
            /^apply if you are\b/i, /^eligibility\b/i,
            /^eligibility criteria\b/i,
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

const GENERIC_JD_WORDS = new Set([
    "able", "above", "across", "achieve", "action", "active", "activities",
    "activity", "actual", "admin", "after", "again", "align", "along",
    "already", "also", "among", "analysis", "another", "any", "apply",
    "approach", "appropriate", "areas", "around", "assist", "available",
    "back", "based", "become", "becomes", "being", "below", "best",
    "better", "between", "bring", "brings", "build", "building", "business",
    "campus", "candidate", "candidates", "career", "certain", "change",
    "check", "clear", "close", "come", "comes", "coming", "common",
    "company", "complete", "completion", "compliance", "concern",
    "conduct", "consider", "continued", "coordinate", "core", "corner",
    "corporate", "correct", "could", "create", "creating", "creation",
    "current", "currently", "daily", "data", "day", "days", "define",
    "degree", "deliver", "delivery", "department", "depend", "dependent",
    "describe", "description", "design", "desired", "detail", "details",
    "determine", "develop", "developing", "development", "different",
    "direct", "directly", "distribute", "diverse", "document", "does",
    "doing", "done", "down", "drive", "driven", "driving", "during",
    "each", "effective", "effectively", "effort", "either", "employ",
    "employee", "employer", "employment", "enable", "encourage",
    "end", "engage", "engaged", "engineering", "ensure", "entire",
    "entry", "environment", "equal", "especially", "essential",
    "establish", "evaluate", "even", "event", "events", "every",
    "everyone", "everything", "excel", "excellent", "execute",
    "existing", "expand", "expect", "expected", "experience",
    "experienced", "expert", "expertise", "explore", "extend",
    "extensive", "external", "extra", "extreme", "facilitate",
    "faculty", "fail", "fair", "familiar", "field", "file", "files",
    "final", "finally", "find", "finish", "firm", "first", "follow",
    "following", "form", "former", "forward", "foundation", "frame",
    "framework", "free", "frequency", "frequently", "fresh", "front",
    "full", "fully", "function", "functional", "functions", "funding",
    "further", "future", "gain", "gather", "general", "generate",
    "getting", "give", "given", "gives", "giving", "global", "goal",
    "goals", "going", "good", "grade", "group", "groups", "grow",
    "growing", "growth", "guarantee", "guide", "guideline", "hand",
    "handle", "handling", "happen", "happy", "hard", "head", "help",
    "helpful", "helping", "high", "higher", "highest", "highly",
    "hiring", "hold", "holding", "home", "honest", "host", "hour",
    "hours", "house", "huge", "human", "idea", "identify", "impact",
    "implement", "implementation", "improve", "improved", "improvement",
    "improving", "include", "included", "includes", "including",
    "increase", "increased", "increasing", "independent", "individual",
    "industry", "influence", "info", "inform", "information", "initiate",
    "initiative", "innovation", "innovative", "input", "insight",
    "inspect", "install", "instance", "integrate", "integrated",
    "integration", "integrity", "intend", "intense", "interact",
    "interaction", "interested", "interesting", "internal", "international",
    "internship", "introduce", "investigate", "investment", "invite",
    "involve", "involved", "involvement", "issue", "issues", "item",
    "join", "joining", "knowledge", "known", "large", "largely", "latest",
    "launch", "lead", "leader", "leadership", "leading", "leads",
    "learn", "learning", "leave", "level", "lever", "leverage",
    "life", "like", "likely", "limit", "line", "lines", "list",
    "listen", "live", "local", "locate", "located", "location",
    "log", "long", "longer", "look", "looking", "lot", "love",
    "low", "lower", "machine", "main", "maintain", "maintaining",
    "maintenance", "major", "make", "makes", "making", "manage",
    "managed", "management", "manager", "managers", "managing",
    "manner", "many", "market", "marketing", "match", "materials",
    "matter", "maximize", "mean", "meaning", "measure", "meet",
    "meeting", "member", "members", "mentor", "mentoring", "metrics",
    "might", "mind", "minimize", "minimum", "minute", "mission",
    "mode",     "india", "kiit", "juspay", "model", "moment", "monitor", "month", "monthly", "months",
    "much", "multiple", "must", "natural", "nature", "near", "need",
    "needed", "needs", "network", "never", "next", "normal", "note",
    "noted", "nothing", "notice", "notify", "now", "number", "object",
    "objective", "obtain", "occur", "off", "offer", "offering",
    "office", "often", "ongoing", "open", "operate", "operating",
    "operation", "operational", "operations", "opportunities",
    "opportunity", "optimize", "option", "order", "organize",
    "organized", "organization", "organizational", "original",
    "other", "outcome", "output", "outside", "outsource", "overall",
    "overcome", "oversee", "own", "owner", "ownership", "paper",
    "part", "participate", "participation", "particular", "particularly",
    "partner", "parts", "passionate", "people", "per", "perfection", "perform",
    "performance", "physical",
    "performing", "period", "permit", "person", "personal", "personnel",
    "perspective", "place", "plan", "planning", "plans", "plant",
    "platform", "play", "please", "pleasure", "point", "policy",
    "portion", "position", "positive", "possess", "possible", "post",
    "potential", "power", "powerful", "practice", "prefer", "preference",
    "preferred", "premier", "preparation", "prepare", "present",
    "presentation", "preserve", "press", "pressure", "prevent",
    "previous", "previously", "primary", "principle", "prior",
    "priority", "problem", "procedure", "proceed", "process",
    "processes", "processing", "produce", "producer", "product",
    "production", "productive", "productivity", "professional",
    "professor", "proficiency", "proficient", "program", "programme",
    "progress", "project", "projects", "promote", "prompt", "proper",
    "properly", "property", "proposal", "propose", "protect",
    "protection", "prove", "provide", "provided", "provider",
    "provides", "providing", "publish", "purpose", "pursue",
    "pursuing", "put", "qualification", "qualifications", "qualified",
    "qualify", "quality", "quarter", "question", "quick", "quickly",
    "quiet", "rate", "rather", "reach", "react", "read", "readiness",
    "reading", "ready", "real", "realistic", "reality", "realize",
    "really", "reason", "receive", "recent", "recently", "recognize",
    "recommend", "record", "recover", "recruit", "recruitment",
    "reduce", "reduced", "refer", "reference", "reflect", "regard",
    "regarding", "regardless", "region", "register", "regular",
    "regularly", "relate", "related", "relation", "relationship",
    "relevant", "reliable", "relief", "religion", "relocate",
    "remain", "remedy", "remote", "remove", "renew", "report",
    "reporting", "represent", "representative", "request", "require",
    "required", "requirement", "requirements", "research", "resource",
    "resources", "respect", "respond", "responsibilities",
    "responsibility", "responsible", "rest", "restore", "result",
    "results", "resume", "retain", "retirement", "return", "revenue",
    "review", "revise", "right", "risk", "role", "rotation", "round",
    "routine", "rule", "run", "running", "safe", "safety", "sales",
    "satisfaction", "satisfy", "scale", "scalable", "schedule",
    "scheduling", "school", "science", "scope", "screen", "search",
    "second", "section", "secure", "security", "seek", "seeking",
    "select", "selection", "self", "send", "senior", "sense", "sensitive",
    "separate", "sequence", "series", "serious", "serve", "service",
    "services", "set", "setup", "settle", "several", "shape", "share",
    "shared", "sheet", "shift", "short", "shortly", "show", "significant",
    "significantly", "similar", "simple", "simply", "single", "sister",
    "site", "situation", "size", "skill", "skills", "small", "smooth",
    "social", "software", "solution", "solutions", "solve", "some",
    "someone", "something", "sometimes", "soon", "sophisticated",
    "sort", "sound", "source", "space", "speak", "special", "specialist",
    "specific", "specifically", "specify", "spend", "spending", "sponsor",
    "spot", "spread", "stable", "staff", "stage", "stakeholder",
    "stakeholders", "stand", "standard", "standards", "start",
    "starting", "state", "statement", "status", "stay", "still",
    "stock", "stop", "storage", "store", "strategic", "strategy",
    "stream", "street", "strength", "strengthen", "stress", "stretch",
    "strict", "strong", "strongly", "structural", "structure",
    "student", "students", "study", "subsequent", "substantial",
    "substitute", "succeed", "success", "successful", "suggest",
    "suitable", "summarize", "superior", "supervise", "supervision",
    "supervisor", "supplier", "support", "supported", "supporting",
    "supports", "suppose", "sure", "surface", "surround", "survey",
    "sustain", "sustainable", "system", "systems", "table", "tackle",
    "take", "takes", "taking", "talent", "talk", "target", "task",
    "tasks", "teach", "teacher", "teaching", "team", "teams",
    "technical", "technique", "techniques", "technology", "tell",
    "temporary", "tend", "term", "terms", "terrific", "test",
    "testing", "thing", "things", "think", "thinking", "third",
    "thorough", "thought", "threat", "through", "throughout",
    "time", "timely", "times", "today", "together", "tolerate",
    "tomorrow", "tool", "tools", "topic", "total", "touch",
    "toward", "track", "tracking", "trade", "traditional",
    "train", "trained", "training", "transfer", "transform",
    "transformation", "transition", "transmit", "transparent",
    "travel", "treat", "trend", "trial", "troubleshoot", "true",
    "truly", "trust", "try", "turn", "two", "type", "types",
    "typical", "ultimately", "unable", "under", "undergo",
    "understand", "understanding", "undertake", "unique", "unit",
    "unite", "unity", "universal", "university", "unless", "unlike",
    "unlikely", "update", "upgrade", "upon", "upper", "upset",
    "urban", "urge", "urgent", "use", "used", "useful", "user",
    "users", "uses", "using", "usual", "vacancy", "valid", "value",
    "values", "variety", "various", "vendor", "venture", "verify",
    "version", "versus", "vertical", "very", "viable", "view",
    "virtual", "vision", "visit", "visual", "vital", "voice",
    "volume", "voluntary", "volunteer", "wait", "want", "wanted",
    "warrant", "way", "ways", "weak", "wealth", "weekly", "weight",
    "welcome", "well", "wide", "widespread", "width", "willing",
    "win", "window", "wish", "within", "without", "woman", "word",
    "work", "worked", "worker", "workforce", "working", "workload",
    "works", "workshop", "workshops", "world", "worldwide", "worry",
    "worst", "worth", "would", "write", "writer", "writing", "written",
    "wrong", "year", "yearly", "years", "young",
    "ambitious", "challenges", "constant", "engineer", "informed", "interests",
    "learner", "marathoner", "seeker", "stretches", "yourself",
]);
const ACTION_VERB_PATTERN = /^\s*(?:develop|design|build|create|implement|manage|lead|drive|oversee|coordinate|establish|define|architect|engineer|maintain|support|improve|optimize|enhance|monitor|troubleshoot|resolve|analyze|evaluate|assess|review|audit|test|deploy|integrate|collaborate|communicate|mentor|train|guide|participate|contribute|ensure|deliver|provide|perform|execute|conduct|prepare|document|report|write|configure|customize|administer|operate|facilitate|champion|advise|consult|research|investigate|identify|recommend|prioritize|plan|organize|direct|supervise|own|automate|streamline|restructure|migrate|scale|secure)\b/i;

const ALL_TECH_SKILLS_FLAT = [...new Set(Object.values(TECH_SKILLS).flat())];

const SKILLS_TO_SKIP = new Set(["r", "c", "go", "rest", "less", "sass", "notion", "shell"]);

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

const MONTH_WORDS = new Set([
    "january", "february", "march", "april", "may", "june", "july",
    "august", "september", "october", "november", "december",
    "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
]);

const isNumericOrdinal = (word) => /^\d+(?:st|nd|rd|th)$/.test(word);

const extractKeywords = (normalizedText, allMatchedSkills) => {
    const tokens = normalizedText
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .map((t) => t.replace(/\.+$/, ""))
        .filter((t) => t.length >= 3 && !STOP_WORDS.has(t) && !/^\d+$/.test(t));

    const freq = {};
    for (const token of tokens) {
        freq[token] = (freq[token] || 0) + 1;
    }

    const additionalEntries = Object.entries(freq)
        .filter(([word, count]) => {
            if (GENERIC_JD_WORDS.has(word)) return false;
            if (MONTH_WORDS.has(word)) return false;
            if (isNumericOrdinal(word)) return false;
            if (allMatchedSkills.includes(word)) return false;
            if (word.length < 6) return count >= 3;
            return count >= 2;
        })
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map((e) => e[0]);

    const combined = [...new Set([...allMatchedSkills, ...additionalEntries])];

    return combined.slice(0, 30);
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
    const responsibilitySkills = extractSkillsFromText(sections.responsibilities.join(" "));

    const experience = extractExperience(sections);
    const education = extractEducation(sections);

    const allMatchedSkills = [...new Set([...requiredSkills, ...preferredSkills, ...responsibilitySkills])];
    const relevantText = [
        ...sections.requirements,
        ...sections.preferred,
        ...sections.responsibilities,
        ...sections.education,
    ].join(" ");
    const keywords = relevantText.trim()
        ? extractKeywords(relevantText, allMatchedSkills)
        : extractKeywords(normalizedText, allMatchedSkills);

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
