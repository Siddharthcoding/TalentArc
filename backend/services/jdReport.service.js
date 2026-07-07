import { HfInference } from "@huggingface/inference";

const hf = process.env.HF_TOKEN
    ? new HfInference(process.env.HF_TOKEN)
    : null;

const THRESHOLDS = { strong: 70, moderate: 40 };

const LABEL_MAP = {
    skill: "Skills",
    experience: "Experience",
    keyword: "Keywords",
    semantic: "Semantic Fit",
    education: "Education",
    rewrite: "Rewrite Quality",
};

const collectJDFlags = (matching) => {
    const allFlags = [];
    const layerKeys = Object.keys(LABEL_MAP);

    for (const key of layerKeys) {
        const layer = matching[key];
        if (layer?.flags && Array.isArray(layer.flags)) {
            for (const flag of layer.flags) {
                allFlags.push({ layer: key, message: flag });
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
            msg.includes("critical") ||
            msg.includes("major gap") ||
            msg.includes("no match") ||
            msg.includes("extraction failure") ||
            msg.includes("significantly below") ||
            msg.includes("very low")
        ) {
            critical.push(flag);
        } else if (
            msg.includes("missing") ||
            msg.includes("not met") ||
            msg.includes("low") ||
            msg.includes("not found") ||
            msg.includes("mismatch") ||
            msg.includes("gap") ||
            msg.includes("few")
        ) {
            warnings.push(flag);
        } else {
            suggestions.push(flag);
        }
    }

    return { critical, warnings, suggestions };
};

const generateSummary = (aggregated) => {
    const pct = aggregated.overallScore;

    if (pct >= 80) {
        return `Strong match at ${pct}%. The candidate's profile aligns very well with the job requirements.`;
    }
    if (pct >= 60) {
        return `Good match at ${pct}%. The candidate meets most key requirements with some areas for improvement.`;
    }
    if (pct >= 40) {
        return `Moderate match at ${pct}%. Several gaps exist between the candidate and the job requirements.`;
    }
    return `Weak match at ${pct}%. Significant gaps exist across multiple dimensions. Consider addressing the highlighted areas.`;
};

const generateStrengthWeakness = (aggregated) => {
    const strong = [];
    const weak = [];

    for (const [key, data] of Object.entries(aggregated.breakdown)) {
        const label = LABEL_MAP[key] || key;
        if (data.percentage >= THRESHOLDS.strong) {
            strong.push(`${label} (${data.percentage}%)`);
        } else if (data.percentage < THRESHOLDS.moderate) {
            weak.push(`${label} (${data.percentage}%)`);
        }
    }

    return { strong, weak };
};

const extractMissingSkills = (matching) => {
    const skill = matching.skill?.details;
    if (!skill) return [];

    return [
        ...(skill.missingRequired || []),
        ...(skill.missingPreferred || []),
    ];
};

const extractKeywordSuggestions = (matching) => {
    const keyword = matching.keyword?.details;
    if (!keyword) return [];

    const missing = keyword.missingKeywords || [];

    return missing.map((kw) =>
        `Consider adding "${kw}" to your resume for better keyword alignment.`
    ).slice(0, 10);
};

const extractRewriteRecommendations = (matching) => {
    const rewrite = matching.rewrite?.details;
    if (!rewrite) return [];

    return (rewrite.suggestions || []).slice(0, 5);
};

const generatePriorityActions = (aggregated, matching, flags) => {
    const actions = [];

    const skillBreakdown = aggregated.breakdown.skill;
    if (skillBreakdown && skillBreakdown.percentage < 70) {
        const missing = extractMissingSkills(matching);
        if (missing.length > 0) {
            actions.push(
                `Add missing skills to resume: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` and ${missing.length - 5} more` : ""}.`
            );
        }
    }

    const keywordBreakdown = aggregated.breakdown.keyword;
    if (keywordBreakdown && keywordBreakdown.percentage < 70) {
        actions.push("Improve keyword density by incorporating more role-specific terminology from the job description.");
    }

    const expBreakdown = aggregated.breakdown.experience;
    if (expBreakdown && expBreakdown.percentage < 70) {
        actions.push("Highlight relevant experience more prominently, focusing on technologies and domains mentioned in the job description.");
    }

    const eduBreakdown = aggregated.breakdown.education;
    if (eduBreakdown && eduBreakdown.percentage < 50) {
        actions.push("Address education requirements — consider adding relevant certifications or coursework.");
    }

    const semanticBreakdown = aggregated.breakdown.semantic;
    if (semanticBreakdown && semanticBreakdown.percentage < 50) {
        actions.push("Improve semantic alignment by using more language from the job description in your bullet points.");
    }

    for (const flag of flags) {
        const msg = flag.message.toLowerCase();
        if (msg.includes("seniority")) {
            actions.push("Emphasize leadership and senior-level responsibilities in experience descriptions.");
            break;
        }
    }

    return [...new Set(actions)].slice(0, 5);
};

const generateJDReport = (jd, resume, matching, aggregated) => {
    const rawFlags = collectJDFlags(matching);
    const { critical, warnings, suggestions } = classifyFlags(rawFlags);
    const { strong, weak } = generateStrengthWeakness(aggregated);

    return {
        matchPercentage: aggregated.overallScore,
        summary: generateSummary(aggregated),
        breakdown: aggregated.breakdown,
        categorySummary: aggregated.categorySummary,
        flagSummary: {
            critical,
            warnings,
            suggestions,
            total: rawFlags.length,
        },
        strongMatches: strong,
        weakAreas: weak,
        missingSkills: extractMissingSkills(matching),
        keywordSuggestions: extractKeywordSuggestions(matching),
        rewriteRecommendations: extractRewriteRecommendations(matching),
        priorityActions: generatePriorityActions(aggregated, matching, rawFlags),
        llmEnhanced: false,
    };
};

const generateJDReportLLM = async (jd, resume, matching, aggregated) => {
    const template = generateJDReport(jd, resume, matching, aggregated);

    if (!hf) {
        return template;
    }

    try {
        const breakdownLines = Object.entries(aggregated.breakdown)
            .map(([key, data]) => {
                const label = LABEL_MAP[key] || key;
                return `${label}: ${data.percentage}%`;
            })
            .join("\n");

        const prompt = [
            "You are an expert ATS match analyst. Given a Job Description, Resume, and matching results, provide a concise match assessment.",
            "",
            `Overall Match: ${aggregated.overallScore}%`,
            breakdownLines,
            "",
            `Missing Skills: ${template.missingSkills.join(", ") || "none"}`,
            `Strong Areas: ${template.strongMatches.join(", ") || "none"}`,
            `Weak Areas: ${template.weakAreas.join(", ") || "none"}`,
            "",
            'Respond in JSON with keys: overallAssessment (1-2 sentences), strengthLabel ("Weak"/"Moderate"/"Good"/"Strong"), recommendations (array of strings, max 3). No markdown, only valid JSON.',
        ].join("\n");

        const response = await hf.textGeneration({
            model: "mistralai/Mistral-7B-Instruct-v0.3",
            inputs: prompt,
            parameters: { max_new_tokens: 300, temperature: 0.3 },
        });

        const raw = response.generated_text;
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return template;

        const llmNarrative = JSON.parse(jsonMatch[0]);
        const merged = { ...template };

        if (llmNarrative.overallAssessment) {
            merged.summary = llmNarrative.overallAssessment;
        }

        if (llmNarrative.strengthLabel) {
            merged.strengthLabel = llmNarrative.strengthLabel;
        }

        if (Array.isArray(llmNarrative.recommendations)) {
            merged.priorityActions = [
                ...llmNarrative.recommendations.slice(0, 3),
                ...merged.priorityActions,
            ].slice(0, 5);
        }

        merged.llmEnhanced = true;
        return merged;
    } catch {
        return template;
    }
};

export { generateJDReport, generateJDReportLLM };
