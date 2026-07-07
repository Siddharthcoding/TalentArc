const escapeRegex = (str) => str.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");

const matchSkills = (jd, resume) => {
    const resumeAll = (resume.skills?.all || []).map((s) => s.toLowerCase().trim());
    const resumeText = resumeAll.join(" ");

    const flags = [];
    const details = {};

    const matchList = (required, label) => {
        const matched = [];
        const missing = [];

        for (const skill of required) {
            const lower = skill.toLowerCase().trim();
            const escaped = escapeRegex(lower);
            const regex = new RegExp("\\b" + escaped + "\\b", "i");

            if (regex.test(resumeText) || resumeAll.some((rs) => rs.includes(lower))) {
                matched.push(skill);
            } else {
                missing.push(skill);
            }
        }

        return { matched, missing };
    };

    const required = matchList(jd.requiredSkills || [], "required");
    const preferred = matchList(jd.preferredSkills || [], "preferred");

    const totalRequired = (jd.requiredSkills || []).length;
    const totalPreferred = (jd.preferredSkills || []).length;

    const matchedRequiredCount = required.matched.length;
    const matchedPreferredCount = preferred.matched.length;

    const requiredScore = totalRequired > 0 ? (matchedRequiredCount / totalRequired) * 70 : 0;
    const preferredScore = totalPreferred > 0 ? (matchedPreferredCount / totalPreferred) * 30 : 0;
    const score = Math.round(requiredScore + preferredScore);

    details.matchedRequired = required.matched;
    details.missingRequired = required.missing;
    details.matchedPreferred = preferred.matched;
    details.missingPreferred = preferred.missing;
    details.totalRequired = totalRequired;
    details.totalPreferred = totalPreferred;
    details.coveragePercentage = totalRequired > 0
        ? Math.round((matchedRequiredCount / totalRequired) * 100)
        : 100;

    if (required.missing.length > 0) {
        flags.push(`Missing required skills: ${required.missing.join(", ")}`);
    }
    if (totalRequired === 0) {
        flags.push("No required skills specified in the job description");
    }
    if (matchedRequiredCount === 0 && totalRequired > 0) {
        flags.push("No required skills matched — resume may not align with this role");
    }
    if (preferred.missing.length > 0) {
        flags.push(`Missing preferred skills: ${preferred.missing.join(", ")}`);
    }

    return { score, maxScore: 100, flags, details };
};

export default matchSkills;
