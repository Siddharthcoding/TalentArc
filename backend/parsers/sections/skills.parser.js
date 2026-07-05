const SKILL_CATEGORIES = [
    { label: "languages", patterns: [/languages?\s*:/i, /programming\s*(languages?)?\s*:/i] },
    { label: "frameworks", patterns: [/frameworks?\s*:/i, /frameworks?\s*&\s*technologies\s*:/i, /libraries\s*:\s*/i] },
    { label: "tools", patterns: [/tools?\s*:/i, /cloud\s*&\s*tools\s*:/i, /developer\s*tools?\s*:/i] },
    { label: "databases", patterns: [/databases?\s*:/i] },
    { label: "cloud", patterns: [/cloud\s*:/i] },
    { label: "softSkills", patterns: [/soft\s*skills?\s*:/i] },
];

const CATEGORY_LABEL = /^(technical\s*skills|languages|frameworks|tools|databases|cloud|soft\s*skills)\s*:\s*/i;

const parseSkills = (text) => {
    const result = {
        categories: {},
        all: [],
    };

    if (!text) return result;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
        let matched = false;

        for (const cat of SKILL_CATEGORIES) {
            for (const pattern of cat.patterns) {
                const match = line.match(pattern);
                if (match) {
                    const skillsStr = line.slice(match.index + match[0].length).trim();
                    const skills = skillsStr
                        .split(/[,;|]/)
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0 && !/^(etc|and)$/i.test(s));

                    if (skills.length > 0) {
                        if (!result.categories[cat.label]) {
                            result.categories[cat.label] = [];
                        }
                        result.categories[cat.label].push(...skills);
                        result.all.push(...skills);
                    }
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }

        if (!matched) {
            const hasCategoryLabel = CATEGORY_LABEL.test(line);
            if (!hasCategoryLabel && line.length > 5) {
                const skills = line
                    .split(/[,;|]/)
                    .map((s) => s.trim())
                    .filter(
                        (s) =>
                            s.length > 1 &&
                            !/^(and|etc)$/i.test(s) &&
                            !/^[:\-–]+$/.test(s)
                    );
                if (skills.length >= 2 && !/^[a-z]/.test(line)) {
                    result.all.push(...skills);
                }
            }
        }
    }

    result.all = [...new Set(result.all.map((s) => s.replace(/\s+/g, " ").trim()))];

    return result;
};

export default parseSkills;
