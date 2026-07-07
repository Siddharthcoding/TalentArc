const WEIGHTS = {
    skill: 0.30,
    experience: 0.25,
    keyword: 0.15,
    semantic: 0.15,
    education: 0.10,
    rewrite: 0.05,
};

const aggregateMatchScores = (matching) => {
    const breakdown = {};
    let totalWeighted = 0;

    for (const [key, weight] of Object.entries(WEIGHTS)) {
        const matcher = matching[key];

        if (!matcher) {
            breakdown[key] = {
                score: 0,
                maxScore: 100,
                percentage: 0,
                weight,
                contribution: 0,
                details: {},
            };
            continue;
        }

        const score = matcher.score ?? 0;
        const maxScore = matcher.maxScore ?? 100;
        const percentage = maxScore > 0
            ? Math.round((score / maxScore) * 100)
            : 0;
        const contribution = Math.round(percentage * weight * 10) / 10;

        breakdown[key] = {
            score: Math.round(score * 10) / 10,
            maxScore,
            percentage,
            weight,
            contribution,
            details: matcher.details || {},
        };

        totalWeighted += contribution;
    }

    const overallScore = Math.round(totalWeighted * 10) / 10;

    const categorySummary = { strong: [], moderate: [], weak: [] };
    for (const [key, data] of Object.entries(breakdown)) {
        if (data.percentage >= 70) {
            categorySummary.strong.push(key);
        } else if (data.percentage >= 40) {
            categorySummary.moderate.push(key);
        } else {
            categorySummary.weak.push(key);
        }
    }

    return {
        overallScore,
        maxScore: 100,
        breakdown,
        categorySummary,
    };
};

export default aggregateMatchScores;
