import { generateNarrative } from "./llm.service.js";

const collectFlags = (ats) => {
    const allFlags = [];
    const layers = ["formatting", "contact", "completeness", "style", "keywords"];

    for (const layer of layers) {
        if (ats[layer]?.flags) {
            for (const flag of ats[layer].flags) {
                allFlags.push({ layer, message: flag });
            }
        }
    }

    return allFlags;
};

const classifyFlags = (flags) => {
    const critical = [];
    const warnings = [];
    const suggestions = [];

    for (const flag of flags) {
        const msg = flag.message.toLowerCase();
        if (
            msg.includes("missing core section") ||
            msg.includes("no strong action verbs") ||
            msg.includes("no bullet points") ||
            msg.includes("extraction failure") ||
            msg.includes("few recognized")
        ) {
            critical.push(flag);
        } else if (
            msg.includes("missing") ||
            msg.includes("not found") ||
            msg.includes("no professional") ||
            msg.includes("no bullet") ||
            msg.includes("spelling error")
        ) {
            warnings.push(flag);
        } else {
            suggestions.push(flag);
        }
    }

    return { critical, warnings, suggestions };
};

const generateSummaryFeedback = (scoring) => {
    const pct = scoring.percentage;
    const overall = scoring.overallScore;
    const max = scoring.maxScore;

    if (pct >= 85) {
        return `Strong resume with an overall score of ${overall}/${max} (${pct}%). The document is well-structured and covers most key areas effectively.`;
    } else if (pct >= 65) {
        return `Decent resume scoring ${overall}/${max} (${pct}%). Several areas could be improved to increase ATS compatibility and impact.`;
    } else if (pct >= 40) {
        return `Below-average resume at ${overall}/${max} (${pct}%). Significant improvements are needed across multiple categories.`;
    } else {
        return `Weak resume scoring ${overall}/${max} (${pct}%). Major restructuring and content additions are recommended.`;
    }
};

const generateCategoryFeedback = (categoryName, cat) => {
    const pct = cat.percentage;
    const name = categoryName[0].toUpperCase() + categoryName.slice(1);

    if (pct >= 80) return `${name} looks strong (${cat.score}/${cat.maxScore}). No major issues.`;
    if (pct >= 50) return `${name} is adequate (${cat.score}/${cat.maxScore}) but has room for improvement.`;
    return `${name} needs attention (${cat.score}/${cat.maxScore}). Consider addressing the highlighted issues.`;
};

const generatePriorityActions = (flags, scoring) => {
    const actions = [];

    if (scoring.categories.experience?.score < 10) {
        actions.push("Add detailed bullet points under each Experience entry with strong action verbs and quantifiable results.");
    }
    if (scoring.categories.skills?.score < 8) {
        actions.push("Expand the Skills section to include a broader range of relevant technical competencies.");
    }
    if (scoring.categories.keywords?.score < 8) {
        actions.push("Improve keyword density by incorporating more role-specific terminology throughout the resume.");
    }

    for (const flag of flags) {
        const msg = flag.message;
        if (msg.includes("Missing core section")) {
            actions.push(`Add the missing "${msg.split(":")[1]?.trim() || "section"}" to ensure ATS completeness.`);
        }
        if (msg.includes("spelling error")) {
            actions.push("Proofread the resume thoroughly to eliminate spelling errors.");
        }
        if (msg.includes("bullet point")) {
            actions.push("Use bullet points consistently to improve readability and ATS parsing.");
        }
        if (msg.includes("LinkedIn")) {
            actions.push("Add your LinkedIn profile URL to the contact section.");
        }
    }

    return [...new Set(actions)].slice(0, 5);
};

const generateKeywordInsights = (ats) => {
    const keywordDetails = ats.keywords?.details || {};
    const topKeywords = keywordDetails.topKeywords || [];
    const density = keywordDetails.keywordDensity || "N/A";
    const diversity = keywordDetails.lexicalDiversity;

    return {
        topKeywords: topKeywords.slice(0, 5),
        density,
        lexicalDiversity: diversity,
        missingCategories: keywordDetails.missingCategories || [],
    };
};

const generateReport = (structured, ats, scoring) => {
    const rawFlags = collectFlags(ats);
    const { critical, warnings, suggestions } = classifyFlags(rawFlags);

    const report = {
        summary: generateSummaryFeedback(scoring),
        overallScore: scoring.overallScore,
        maxScore: scoring.maxScore,
        percentage: scoring.percentage,
        categoryBreakdown: scoring.categories,
        flags: {
            critical,
            warnings,
            suggestions,
            total: rawFlags.length,
        },
        categoryFeedback: {},
        keywordInsights: generateKeywordInsights(ats),
        priorityActions: generatePriorityActions(rawFlags, scoring),
    };

    for (const [name, cat] of Object.entries(scoring.categories)) {
        report.categoryFeedback[name] = generateCategoryFeedback(name, cat);
    }

    return report;
};

const generateLLMReport = async (structured, ats, scoring) => {
    const template = generateReport(structured, ats, scoring);

    const llmNarrative = await generateNarrative(structured, ats, scoring);

    if (!llmNarrative) {
        return template;
    }

    const merged = { ...template };

    if (llmNarrative.overallAssessment) {
        merged.summary = llmNarrative.overallAssessment;
    }

    if (llmNarrative.strengthLabel) {
        merged.strengthLabel = llmNarrative.strengthLabel;
    }

    if (llmNarrative.categoryFeedback) {
        for (const [name, feedback] of Object.entries(llmNarrative.categoryFeedback)) {
            if (merged.categoryFeedback[name] !== undefined) {
                merged.categoryFeedback[name] = feedback;
            }
        }
    }

    if (Array.isArray(llmNarrative.recommendations) && llmNarrative.recommendations.length > 0) {
        merged.priorityActions = [...llmNarrative.recommendations.slice(0, 3), ...merged.priorityActions].slice(0, 5);
    }

    merged.llmEnhanced = true;

    return merged;
};

export default generateReport;
export { generateLLMReport };
