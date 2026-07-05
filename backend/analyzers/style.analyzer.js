const STRONG_VERBS = [
    "built", "developed", "designed", "engineered", "implemented",
    "led", "managed", "architected", "created", "delivered",
    "launched", "optimized", "integrated", "reduced", "improved",
    "increased", "achieved", "established", "generated", "initiated",
    "introduced", "pioneered", "produced", "streamlined",
    "strengthened", "transformed", "wrote", "authored",
    "accelerated", "automated", "configured", "deployed",
    "migrated", "orchestrated", "refactored", "scaled",
    "spearheaded", "championed", "drove",
];

const WEAK_VERBS = [
    "was", "were", "had", "did", "made", "got", "been",
    "being", "involved", "participated", "helped", "worked on",
    "responsible for", "tasked with", "duties included",
];

const COMMON_TYPOS = {
    "teh": "the", "recieve": "receive", "acheive": "achieve",
    "occured": "occurred", "occurance": "occurrence",
    "definately": "definitely", "seperate": "separate",
    "goverment": "government", "calender": "calendar",
    "commitee": "committee", "embarass": "embarrass",
    "enviroment": "environment", "excelent": "excellent",
    "independant": "independent", "liason": "liaison",
    "millenium": "millennium", "neccessary": "necessary",
    "occassion": "occasion", "paralel": "parallel",
    "priviledge": "privilege", "reciept": "receipt",
    "succesful": "successful",
    "maintainance": "maintenance", "maintanence": "maintenance",
    "managment": "management", "developement": "development",
    "experiance": "experience", "acheivement": "achievement",
    "acheivements": "achievements",
};

const countSyllables = (word) => {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return 1;
    let count = 0;
    const vowels = "aeiouy";
    let prevVowel = false;
    for (const ch of w) {
        const isVowel = vowels.includes(ch);
        if (isVowel && !prevVowel) count++;
        prevVowel = isVowel;
    }
    if (w.endsWith("e") && !w.endsWith("le")) count--;
    if (count === 0) count = 1;
    return count;
};

const fleschKincaid = (text) => {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = text.split(/\s+/).filter(Boolean);
    if (sentences.length === 0 || words.length === 0) return { score: 50, grade: "N/A" };

    const sentenceCount = sentences.length;
    const wordCount = words.length;
    const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

    const score = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
    const clamped = Math.max(0, Math.min(100, score));

    let grade = "N/A";
    if (clamped >= 90) grade = "Very Easy";
    else if (clamped >= 80) grade = "Easy";
    else if (clamped >= 70) grade = "Fairly Easy";
    else if (clamped >= 60) grade = "Standard";
    else if (clamped >= 50) grade = "Fairly Difficult";
    else if (clamped >= 30) grade = "Difficult";
    else grade = "Very Difficult";

    return { score: Math.round(clamped * 10) / 10, grade, wordCount, sentenceCount };
};

const analyzeStyle = (structured, normalizedText) => {
    const flags = [];
    const details = {};
    let deductions = 0;

    const readability = fleschKincaid(normalizedText);
    details.readability = readability;

    if (readability.score > 80) {
        flags.push("Text is very easy to read — may be too simplistic for technical roles");
        deductions += 1;
    } else if (readability.score < 20) {
        flags.push("Text is extremely difficult to read — consider simplifying language for broader audiences");
        deductions += 1.5;
    }

    const typos = [];
    const lowerText = normalizedText.toLowerCase();
    for (const [typo, correction] of Object.entries(COMMON_TYPOS)) {
        const regex = new RegExp("\\b" + typo + "\\b", "gi");
        const matches = lowerText.match(regex);
        if (matches) {
            typos.push({ typo, correction, count: matches.length });
        }
    }
    details.typos = typos;

    if (typos.length > 0) {
        const totalTypos = typos.reduce((s, t) => s + t.count, 0);
        flags.push(`${totalTypos} potential spelling error(s) detected (e.g., "${typos[0].typo}" should be "${typos[0].correction}")`);
        deductions += Math.min(2, totalTypos * 0.5);
    }

    if (structured.experience && structured.experience.length > 0) {
        let strongCount = 0;
        let weakCount = 0;
        const allBullets = [];

        for (const exp of structured.experience) {
            if (exp.description) allBullets.push(...exp.description);
        }

        for (const bullet of allBullets) {
            const lower = bullet.toLowerCase();
            for (const verb of STRONG_VERBS) {
                if (lower.startsWith(verb) || lower.includes(" " + verb)) {
                    strongCount++;
                    break;
                }
            }
            for (const verb of WEAK_VERBS) {
                if (lower.startsWith(verb) || lower.includes(" " + verb)) {
                    weakCount++;
                    break;
                }
            }
        }

        const totalDescriptions = allBullets.length;
        details.actionVerbs = { strong: strongCount, weak: weakCount, total: totalDescriptions };

        if (totalDescriptions > 0) {
            if (strongCount === 0) {
                flags.push("No strong action verbs found in experience descriptions");
                deductions += 2;
            } else if (strongCount < totalDescriptions * 0.3) {
                flags.push(`Only ${strongCount}/${totalDescriptions} bullet points start with strong action verbs`);
                deductions += 1;
            }

            if (weakCount > 0) {
                flags.push(`Weak/passive verbs detected (${weakCount} instance(s)) — consider using stronger action verbs`);
                deductions += 1;
            }
        } else {
            const hasExperienceEntries = structured.experience.some(
                (e) => e.role || e.company
            );
            if (hasExperienceEntries) {
                flags.push("Experience section has no bullet point descriptions");
                deductions += 1.5;
            }
        }
    }

    const bulletCount = (normalizedText.match(/^[-–•●▪]\s/gm) || []).length;
    details.bulletCount = bulletCount;

    if (bulletCount === 0) {
        flags.push("No bullet points used — bullet points improve readability and ATS parsing");
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

export default analyzeStyle;
