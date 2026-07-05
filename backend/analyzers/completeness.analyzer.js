const CORE_SECTIONS = [
    { key: "experience", label: "Experience", required: true, penalty: 4 },
    { key: "education", label: "Education", required: true, penalty: 3 },
    { key: "skills", label: "Skills", required: true, penalty: 3 },
];

const BONUS_SECTIONS = [
    { key: "summary", label: "Summary/Profile", penaltyIfMissing: 0.5 },
    { key: "projects", label: "Projects", penaltyIfMissing: 1 },
    { key: "achievements", label: "Achievements/Certifications", penaltyIfMissing: 1 },
];

const hasContent = (structured, key) => {
    const value = structured[key];
    if (value === undefined || value === null) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
        if (key === "skills" && value.all) return value.all.length > 0;
        return Object.keys(value).length > 0;
    }
    return true;
};

const analyzeCompleteness = (structured) => {
    const flags = [];
    const details = {};
    let deductions = 0;

    for (const section of CORE_SECTIONS) {
        const present = hasContent(structured, section.key);
        details[section.key] = present;
        if (!present) {
            flags.push(`Missing core section: ${section.label}`);
            deductions += section.penalty;
        }
    }

    let bonusCount = 0;
    for (const section of BONUS_SECTIONS) {
        const present = hasContent(structured, section.key);
        details[section.key] = present;
        if (present) {
            bonusCount++;
        } else {
            deductions += section.penaltyIfMissing;
        }
    }

    details.bonusSectionsPresent = bonusCount;
    if (bonusCount === 0) {
        flags.push("No bonus sections found — consider adding Summary, Projects, or Achievements");
    }

    if (structured.experience && structured.experience.length > 0) {
        const descCount = structured.experience.reduce(
            (sum, exp) => sum + (exp.description ? exp.description.length : 0),
            0
        );
        if (descCount === 0) {
            flags.push("Experience entries lack bullet point descriptions");
            deductions += 1;
        }
    }

    if (structured.skills && structured.skills.all && structured.skills.all.length < 5) {
        flags.push("Very few skills listed — consider expanding skill set");
        deductions += 0.5;
    }

    const score = Math.max(0, 10 - deductions);
    return {
        score: Math.round(score * 10) / 10,
        maxScore: 10,
        flags,
        details,
    };
};

export default analyzeCompleteness;
