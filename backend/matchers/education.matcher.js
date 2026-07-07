const DEGREE_HIERARCHY = {
    "phd": 5, "ph.d": 5, "doctorate": 5,
    "master's": 4, "master": 4, "masters": 4, "m.tech": 4, "m.e.": 4, "mba": 4,
    "bachelor's": 3, "bachelor": 3, "b.tech": 3, "b.e.": 3, "b.sc": 3, "bsc": 3,
    "associate's": 2, "associate": 2, "diploma": 1,
    "high school": 0, "hsc": 0, "ssc": 0, "12th": 0, "10th": 0,
};

const getDegreeLevel = (degreeStr) => {
    if (!degreeStr) return 0;
    const lower = degreeStr.toLowerCase().trim();
    for (const [key, level] of Object.entries(DEGREE_HIERARCHY)) {
        if (lower.includes(key)) return level;
    }
    return 0;
};

const getRequiredDegreeLevel = (jdEducation) => {
    if (!jdEducation?.degree) return 0;
    const text = jdEducation.degree.toLowerCase();
    for (const [key, level] of Object.entries(DEGREE_HIERARCHY)) {
        if (text.includes(key)) return level;
    }
    return 3;
};

const matchEducation = (jd, resume) => {
    const flags = [];
    const details = {};

    const resumeEducation = resume.education || [];
    const resumeAchievements = resume.achievements || [];

    const requiredLevel = getRequiredDegreeLevel(jd.education);
    const maxResumeLevel = Math.max(0, ...resumeEducation.map((e) => getDegreeLevel(e.degree)));

    const degreeRequirementMet = maxResumeLevel >= requiredLevel;

    const jdField = jd.education?.field ? jd.education.field.toLowerCase() : "";
    let fieldRequirementMet = false;
    let matchedField = null;

    if (!jdField) {
        fieldRequirementMet = true;
    } else {
        const fieldWords = jdField.split(/\s+/);
        for (const entry of resumeEducation) {
            const entryText = [entry.degree, entry.field, entry.institution]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            const allPresent = fieldWords.every((w) => entryText.includes(w));
            if (allPresent) {
                fieldRequirementMet = true;
                matchedField = entry.field || "";
                break;
            }
        }
    }

    const certificationKeywords = ["certif", "license", "credential", "accreditation"];
    const certifications = resumeAchievements.filter((a) =>
        certificationKeywords.some((kw) => a.toLowerCase().includes(kw))
    );

    const matchedDegree = resumeEducation.length > 0 ? resumeEducation[0].degree : null;

    let points = 0;
    if (degreeRequirementMet) points += 50;
    if (fieldRequirementMet) points += 30;
    points += Math.min(20, certifications.length * 10);

    const score = Math.min(100, points);

    details.degreeRequirementMet = degreeRequirementMet;
    details.fieldRequirementMet = fieldRequirementMet;
    details.requiredDegreeLevel = requiredLevel;
    details.resumeDegreeLevel = maxResumeLevel;
    details.matchedDegree = matchedDegree;
    details.matchedField = matchedField;
    details.certifications = certifications;

    if (!degreeRequirementMet) {
        flags.push(`Degree requirement not met: JD requires level ${requiredLevel}, resume has level ${maxResumeLevel}`);
    }
    if (!fieldRequirementMet && jdField) {
        flags.push(`Field of study mismatch: JD expects "${jd.education.field}"`);
    }
    if (certifications.length > 0) {
        flags.push(`Relevant certifications found: ${certifications.join("; ")}`);
    }
    if (resumeEducation.length === 0) {
        flags.push("No education entries found in resume");
    }

    return { score, maxScore: 100, flags, details };
};

export default matchEducation;
