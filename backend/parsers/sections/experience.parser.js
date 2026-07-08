const DATE_RE = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[–\-]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present\b|Current\b|Expected\b)/i;

const parseDateRange = (text) => {
    const match = text.match(DATE_RE);
    if (match) {
        const parts = match[0].split(/[–\-]+/).map((s) => s.trim());
        return { start: parts[0] || "", end: parts[1] || "", full: match[0] };
    }
    const yearOnly = /(\d{4})\s*[–\-]+\s*(\d{4}|Present\b|Current\b|Expected\b)/i;
    const ym = text.match(yearOnly);
    if (ym) {
        return { start: ym[1], end: ym[2], full: ym[0] };
    }
    return null;
};

const hasDate = (text) => {
    return DATE_RE.test(text) || /(\d{4})\s*[–\-]+\s*(\d{4}|Present\b|Current\b|Expected\b)/i.test(text);
};

const isBulletLine = (line) => /^[-–•●▪]\s/.test(line.trim());

const isRoleLine = (line) => hasDate(line) && !isBulletLine(line);

const splitRoleLine = (line, dates) => {
    if (!dates || !dates.full) return { role: line, rest: "" };
    const idx = line.indexOf(dates.full);
    if (idx === -1) return { role: line, rest: "" };
    const before = line.slice(0, idx).trim();
    const after = line.slice(idx + dates.full.length).trim();
    return { role: before, rest: after };
};

const parseExperience = (text) => {
    const entries = [];
    if (!text) return entries;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return entries;

    const blocks = [];
    let currentBlock = [];

    for (const line of lines) {
        if (isRoleLine(line) && currentBlock.length > 0) {
            blocks.push(currentBlock);
            currentBlock = [];
        }
        currentBlock.push(line);
    }
    if (currentBlock.length > 0) {
        blocks.push(currentBlock);
    }

    for (const block of blocks) {
        const blockText = block.join(" ");
        const dates = parseDateRange(blockText);

        let role = "";
        let company = "";
        const description = [];

        for (const line of block) {
            const isBullet = isBulletLine(line);

            if (!isBullet && hasDate(line) && !role) {
                const split = splitRoleLine(line, dates);
                role = split.role;
                if (split.rest && !company) {
                    company = split.rest;
                }
            } else if (isBullet) {
                description.push(line.replace(/^[-–•●▪]\s*/, "").trim());
            }
        }

        const nonRoleNonBullet = block.filter((l) => !isRoleLine(l) && !isBulletLine(l));

        for (const line of nonRoleNonBullet) {
            const trimmed = line.trim();
            if (trimmed && !company && trimmed.length > 3 && !dates?.full?.includes(trimmed)) {
                company = trimmed;
                break;
            }
        }

        for (const line of nonRoleNonBullet) {
            const trimmed = line.trim();
            if (trimmed && trimmed.length > 10) {
                description.push(trimmed);
            }
        }

        if (!role && block.length > 0) {
            role = block[0];
        }

        if (role || company || description.length > 0) {
            entries.push({
                role: role.replace(/\s+/g, " ").trim(),
                company: company.replace(/\s+/g, " ").trim(),
                dates,
                description,
            });
        }
    }

    return entries;
};

export default parseExperience;
