const MONTH_NAMES = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const parseMonthYear = (str) => {
    const s = str.trim();
    const parts = s.split(/\s+/);
    if (parts.length === 2) {
        const month = MONTH_NAMES[parts[0].toLowerCase().slice(0, 3)];
        const year = parseInt(parts[1], 10);
        if (month && !isNaN(year)) return { month, year };
    }
    if (parts.length === 1) {
        const year = parseInt(parts[0], 10);
        if (!isNaN(year)) return { month: 1, year };
    }
    return null;
};

const parseResumeDate = (dateStr) => {
    if (!dateStr) return null;
    const cleaned = dateStr.replace(/\./g, "");
    const isPresent = /present|current/i.test(cleaned);
    if (isPresent) return { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
    return parseMonthYear(cleaned);
};

const isDateLike = (str) => {
    if (!str) return false;
    return /\d{4}/.test(str) || /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(str);
};

const estimateTotalYears = (experienceEntries) => {
    let totalMonths = 0;

    for (const entry of experienceEntries) {
        const dates = entry.dates;
        if (!dates) continue;

        const start = parseResumeDate(dates.start);
        const end = parseResumeDate(dates.end);

        if (start && end) {
            const months = (end.year - start.year) * 12 + (end.month - start.month);
            totalMonths += Math.max(0, months);
        } else if (isDateLike(dates.start) && isDateLike(dates.end)) {
            const years = dates.full ? (dates.full.match(/\d{4}/g) || []) : [];
            if (years.length >= 2) {
                totalMonths += (parseInt(years[years.length - 1], 10) - parseInt(years[0], 10)) * 12;
            }
        }
    }

    return Math.round((totalMonths / 12) * 10) / 10;
};

const countMatchedTechnologies = (experienceEntries, requiredSkills) => {
    const matched = [];
    const lowerReq = requiredSkills.map((s) => s.toLowerCase().trim());

    for (const entry of experienceEntries) {
        const entryText = [entry.role, entry.company, ...(entry.description || [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        for (const skill of lowerReq) {
            if (!matched.includes(skill) && entryText.includes(skill)) {
                matched.push(skill);
            }
        }
    }

    return matched;
};

const matchExperience = (jd, resume) => {
    const flags = [];
    const details = {};

    const resumeExperience = resume.experience || [];
    const totalYears = estimateTotalYears(resumeExperience);

    const jdMinYears = jd.experience?.minimumYears;
    const jdMaxYears = jd.experience?.maximumYears;

    const yearsMet = jdMinYears != null ? totalYears >= jdMinYears : true;

    const matchedTechnologies = countMatchedTechnologies(
        resumeExperience,
        jd.requiredSkills || []
    );

    const allRequiredSkills = jd.requiredSkills || [];
    const techRatio = allRequiredSkills.length > 0
        ? matchedTechnologies.length / allRequiredSkills.length
        : 1;

    const hasTechInExperience = matchedTechnologies.length > 0;

    const roleTitles = resumeExperience.map((e) => (e.role || "").toLowerCase()).filter(Boolean);
    const jdText = [
        jd.responsibilities?.join(" ") || "",
        jd.company || "",
    ].join(" ").toLowerCase();

    const domainWords = ["engineer", "developer", "architect", "manager", "analyst",
        "scientist", "intern", "lead", "senior", "junior", "full stack", "backend",
        "frontend", "devops", "data", "machine learning", "software"];
    const domainHits = roleTitles.filter((t) => domainWords.some((dw) => t.includes(dw))).length;

    let domainRelevance = "medium";
    if (hasTechInExperience && domainHits >= resumeExperience.length * 0.5) {
        domainRelevance = "high";
    } else if (!hasTechInExperience && resumeExperience.length > 0) {
        domainRelevance = "low";
    }

    let points = 0;
    if (yearsMet) points += 40;
    if (domainRelevance === "high") points += 25;
    else if (domainRelevance === "medium") points += 10;
    points += Math.min(35, Math.round(techRatio * 35));

    const score = Math.min(100, points);

    details.totalYearsOfExperience = totalYears;
    details.yearsRequired = jdMinYears;
    details.yearsMet = yearsMet;
    details.domainRelevance = domainRelevance;
    details.matchedTechnologies = matchedTechnologies;
    details.technologyCoverageRatio = Math.round(techRatio * 100);

    if (!yearsMet) {
        flags.push(`Experience gap: ${totalYears}y of experience, JD requires ${jdMinYears}y`);
    }
    if (domainRelevance === "low") {
        flags.push("Experience domain relevance is low — roles may not align with this JD");
    }
    if (matchedTechnologies.length < (allRequiredSkills.length / 2)) {
        flags.push("Few required technologies found in experience descriptions");
    }
    if (resumeExperience.length === 0) {
        flags.push("No work experience entries found in resume");
    }

    return { score, maxScore: 100, flags, details };
};

export default matchExperience;
