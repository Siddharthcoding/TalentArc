const computeEducationScore = (structured) => {
    const entries = structured.education || [];
    if (entries.length === 0) return { score: 0, maxScore: 10, details: { entries: 0 } };

    let points = 0;
    const details = { entries: entries.length };

    points += Math.min(4, entries.length * 2);

    const hasDegree = entries.some((e) => e.degree && e.degree.length > 5);
    if (hasDegree) {
        points += 2;
        details.degree = true;
    }

    const hasField = entries.some((e) => e.field && e.field.length > 0);
    if (hasField) {
        points += 1;
        details.field = true;
    }

    const hasDates = entries.some((e) => e.dates && e.dates.start);
    if (hasDates) {
        points += 1;
        details.dates = true;
    }

    const hasGpa = entries.some((e) => e.gpa && e.gpa.length > 0);
    if (hasGpa) {
        points += 1;
        details.gpa = true;
    }

    const hasLocation = entries.some((e) => e.location && e.location.length > 0);
    if (hasLocation) {
        points += 1;
        details.location = true;
    }

    return { score: Math.min(10, points), maxScore: 10, details };
};

const computeExperienceScore = (structured) => {
    const entries = structured.experience || [];
    if (entries.length === 0) return { score: 0, maxScore: 20, details: { entries: 0 } };

    let points = 0;
    const details = { entries: entries.length };

    points += Math.min(6, entries.length * 3);

    const totalDescriptions = entries.reduce((s, e) => s + (e.description ? e.description.length : 0), 0);
    points += Math.min(6, totalDescriptions * 2);
    details.totalDescriptions = totalDescriptions;

    const hasRoles = entries.some((e) => e.role && e.role.length > 0);
    if (hasRoles) points += 2;
    details.hasRoles = hasRoles || false;

    const hasCompanies = entries.some((e) => e.company && e.company.length > 0);
    if (hasCompanies) points += 2;
    details.hasCompanies = hasCompanies || false;

    const hasDates = entries.some((e) => e.dates && e.dates.start);
    if (hasDates) points += 2;
    details.hasDates = hasDates || false;

    const longDescriptions = entries.some((e) =>
        e.description && e.description.some((d) => d.length > 50)
    );
    if (longDescriptions) points += 2;
    details.hasDetailedDescriptions = longDescriptions || false;

    return { score: Math.min(20, points), maxScore: 20, details };
};

const computeProjectsScore = (structured) => {
    const entries = structured.projects || [];
    if (entries.length === 0) return { score: 0, maxScore: 15, details: { entries: 0 } };

    let points = 0;
    const details = { entries: entries.length };

    points += Math.min(4, entries.length);

    const hasTechStack = entries.filter((e) => e.techStack && e.techStack.length > 3).length;
    points += Math.min(4, hasTechStack * 2);
    details.hasTechStack = hasTechStack;

    const hasDescriptions = entries.filter((e) => e.description && e.description.length > 0).length;
    points += Math.min(4, hasDescriptions * 2);
    details.hasDescriptions = hasDescriptions;

    const hasLinks = entries.filter((e) => e.links && e.links.length > 0).length;
    points += Math.min(3, hasLinks * 1.5);
    details.hasLinks = hasLinks;

    return { score: Math.min(15, points), maxScore: 15, details };
};

const computeSkillsScore = (structured) => {
    if (!structured.skills) return { score: 0, maxScore: 15, details: {} };

    const allSkills = structured.skills.all || [];
    const categories = structured.skills.categories || {};
    const categoryCount = Object.keys(categories).length;

    if (allSkills.length === 0) return { score: 0, maxScore: 15, details: { skills: 0 } };

    let points = 0;
    const details = { skills: allSkills.length };

    points += Math.min(4, allSkills.length * 0.4);

    points += Math.min(4, categoryCount * 1.5);
    details.categories = categoryCount;

    const recognizedCount = structured.skills.all
        ? structured.skills.all.filter((s) => {
            const lower = s.toLowerCase();
            const known = [
                "c", "c++", "java", "python", "javascript", "typescript",
                "react", "node", "express", "mongodb", "sql", "html", "css",
                "docker", "kubernetes", "aws", "git", "linux", "rest",
                "graphql", "redis", "postgresql", "mysql", "flutter",
                "android", "swift", "kotlin", "go", "rust", "php",
                "angular", "vue", "django", "flask", "spring",
            ];
            return known.some((k) => lower.includes(k));
        }).length
        : 0;

    points += Math.min(4, recognizedCount);
    details.recognizedSkills = recognizedCount;

    if (allSkills.length >= 5) points += 3;
    details.minimumMet = allSkills.length >= 5;

    return { score: Math.min(15, points), maxScore: 15, details };
};

const computeAchievementsScore = (structured) => {
    const entries = structured.achievements || [];
    if (entries.length === 0) return { score: 0, maxScore: 5, details: { entries: 0 } };

    let points = 0;
    points += Math.min(3, entries.length);
    if (entries.length >= 3) points += 2;

    return { score: Math.min(5, points), maxScore: 5, details: { entries: entries.length } };
};

const computeGrammarScore = (ats) => {
    const style = ats.style || {};
    const typos = style.details?.typos || [];
    const actionVerbs = style.details?.actionVerbs || {};

    let points = 3;
    const details = {};

    if (typos.length === 0) {
        points += 1;
        details.noTypos = true;
    } else {
        details.typoCount = typos.reduce((s, t) => s + t.count, 0);
    }

    if (actionVerbs.total > 0 && actionVerbs.strong > 0) {
        const ratio = actionVerbs.strong / actionVerbs.total;
        if (ratio >= 0.5) points += 1;
        details.strongVerbRatio = Math.round(ratio * 100) / 100;
    }

    return { score: Math.min(5, points), maxScore: 5, details };
};

const computeATSCompatibilityScore = (ats) => {
    const layers = ["formatting", "contact", "completeness", "style", "keywords"];
    let total = 0;
    let count = 0;

    for (const layer of layers) {
        if (ats[layer] && ats[layer].score !== undefined) {
            total += ats[layer].score;
            count++;
        }
    }

    const avg = count > 0 ? total / count : 0;
    const score = (avg / 10) * 5;

    return {
        score: Math.round(score * 10) / 10,
        maxScore: 5,
        details: { averageLayerScore: Math.round(avg * 10) / 10, layerCount: count },
    };
};

const computeWeightedScore = (structured, ats) => {
    const education = computeEducationScore(structured);
    const experience = computeExperienceScore(structured);
    const projects = computeProjectsScore(structured);
    const skills = computeSkillsScore(structured);
    const achievements = computeAchievementsScore(structured);
    const grammar = computeGrammarScore(ats);
    const atsCompatibility = computeATSCompatibilityScore(ats);

    const formatting = {
        score: ats.formatting?.score ?? 0,
        maxScore: 10,
        details: ats.formatting?.details || {},
    };

    const keywords = {
        score: ((ats.keywords?.score ?? 0) / 10) * 15,
        maxScore: 15,
        details: ats.keywords?.details || {},
    };

    const categories = {
        formatting,
        education,
        experience,
        projects,
        skills,
        achievements,
        keywords,
        grammar,
        atsCompatibility,
    };

    const overallScore = Object.values(categories).reduce(
        (sum, cat) => sum + cat.score,
        0
    );

    const maxScore = Object.values(categories).reduce(
        (sum, cat) => sum + cat.maxScore,
        0
    );

    const categoryBreakdown = {};
    for (const [name, cat] of Object.entries(categories)) {
        categoryBreakdown[name] = {
            score: Math.round(cat.score * 10) / 10,
            maxScore: cat.maxScore,
            percentage: cat.maxScore > 0
                ? Math.round((cat.score / cat.maxScore) * 100)
                : 0,
            details: cat.details,
        };
    }

    return {
        overallScore: Math.round(overallScore * 10) / 10,
        maxScore,
        percentage: Math.round((overallScore / maxScore) * 100 * 10) / 10,
        categories: categoryBreakdown,
    };
};

export default computeWeightedScore;
