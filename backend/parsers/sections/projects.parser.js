const TECH_STACK_KEYWORDS = /^tech\s*stack/i;
const DATE_TAG_RE = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i;
const ACTION_VERBS = /^(Built|Developed|Designed|Engineered|Implemented|Created|Led|Managed|Architected|Spearheaded|Delivered|Launched|Optimized|Integrated|Reduced|Improved|Increased|Achieved|Authored|Established|Generated|Initiated|Introduced|Pioneered|Produced|Revamped|Streamlined|Strengthened|Transformed|Wrote)/i;

const isProjectTitle = (line) => {
    const clean = line.replace(/^[-–•●▪]\s*/, "").trim();
    if (!clean || clean.length < 3) return false;
    if (TECH_STACK_KEYWORDS.test(clean)) return false;
    if (clean.length > 100) return false;
    if (/^https?:\/\//i.test(clean)) return false;
    if (/^[-\d]+\)\s*/.test(clean) && clean.length < 15) return false;

    const hasSeparator = clean.includes("|") || /:\s*(Code|Live|Demo|GitHub)\s*Link/i.test(clean);
    const startsWithAction = ACTION_VERBS.test(clean);
    const endsWithPeriod = clean.endsWith(".");

    if (hasSeparator) return true;
    if (startsWithAction) return false;
    if (endsWithPeriod) return false;
    if (clean.length > 60) return false;

    return /^[A-Z]/.test(clean);
};

const parseProjects = (text) => {
    const entries = [];
    if (!text) return entries;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return entries;

    const blocks = [];
    let currentBlock = [];

    for (const line of lines) {
        const clean = line.replace(/^[-–•●▪]\s*/, "").trim();
        if (isProjectTitle(clean) && currentBlock.length > 0) {
            blocks.push(currentBlock);
            currentBlock = [];
        }
        currentBlock.push(line);
    }
    if (currentBlock.length > 0) {
        blocks.push(currentBlock);
    }

    for (const block of blocks) {
        if (block.length === 0) continue;

        const rawLine = block[0].replace(/^[-–•●▪]\s*/, "").trim();

        const techStackLine = block.find((l) => TECH_STACK_KEYWORDS.test(l));
        let techStack = "";
        if (techStackLine) {
            techStack = techStackLine.replace(/^[-–•●▪]\s*/, "")
                .replace(TECH_STACK_KEYWORDS, "")
                .replace(/:\s*/, "")
                .replace(/etc\.?\s*$/i, "")
                .trim();
        }

        const pipeParts = rawLine.split("|").map((s) => s.trim());
        let name = pipeParts[0];
        if (!techStack && pipeParts.length >= 2) {
            techStack = pipeParts.slice(1).join(", ")
                .replace(/Code Link.*|Live Link.*|GitHub.*/i, "")
                .replace(/\d+\s*$/, "")
                .trim();
        }

        name = name.replace(/:\s*(Code|Live|Demo|GitHub)\s*Link\s*$/i, "").trim();
        name = name.replace(/[|]\s*$/, "").trim();

        const descriptionLines = block.slice(1).filter((l) => {
            const cl = l.replace(/^[-–•●▪]\s*/, "").trim();
            if (!cl) return false;
            if (TECH_STACK_KEYWORDS.test(l)) return false;
            if (/^https?:\/\//i.test(l)) return false;
            if (isProjectTitle(cl) && l === block[0]) return false;
            if (cl === rawLine) return false;
            return true;
        }).map((l) => l.replace(/^[-–•●▪]\s*/, "").trim());

        const urlMatches = block.join(" ").match(/https?:\/\/[^\s,;)\]>]+/gi) || [];
        const links = [...new Set(urlMatches)];

        if (name && !TECH_STACK_KEYWORDS.test(name)) {
            entries.push({
                name: name.replace(/\s+/g, " ").trim(),
                techStack: techStack.replace(/\s+/g, " ").trim(),
                description: descriptionLines.filter((d) => d.length > 5),
                links,
            });
        }
    }

    return entries;
};

export default parseProjects;
