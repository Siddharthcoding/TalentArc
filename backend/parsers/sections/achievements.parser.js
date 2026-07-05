const parseAchievements = (text) => {
    const achievements = [];

    if (!text) return achievements;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
        const clean = line.replace(/^[-–•●▪\d+.[)\]]*\s*/, "").trim();
        if (clean && clean.length > 10) {
            achievements.push(clean);
        }
    }

    return achievements;
};

export default parseAchievements;
