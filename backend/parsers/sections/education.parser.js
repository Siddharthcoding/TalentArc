const GPA_RE = /(?:CGPA|GPA|Grade)[:\s]*([\d.]+(?:\/\d+\.?\d*)?)/i;
const DEGREE_RE = /(Bachelor|Master|PhD|B\.Tech|M\.Tech|B\.E|M\.E|B\.Sc|M\.Sc|B\.A|M\.A|B\.Com|M\.Com|Associate|Diploma|Doctorate|12th|Higher Secondary|HSC|SSC|Xth)/i;
const INSTITUTION_KEYWORDS = /(Institute|University|College|School|Academy|IIT|NIT|IIIT)\s/i;
const DATE_RE = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}\s*[–\-]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(?:\d{4}|Present|Current|Expected)/i;
const LOCATION_RE = /(?:^|\s)([A-Z][a-z]+(?:\s[A-Z][a-z]+){0,2},\s*[A-Z][A-Za-z]+)$/;

const parseDateRange = (text) => {
    const match = text.match(DATE_RE);
    if (match) {
        const parts = match[0].split(/[–\-]+/).map((s) => s.trim());
        return { start: parts[0] || "", end: parts[1] || "" };
    }
    return null;
};

const isInstitutionLine = (line) => {
    if (!line || line.length < 5) return false;
    if (DEGREE_RE.test(line)) return false;
    if (INSTITUTION_KEYWORDS.test(line)) return true;
    if (line === line.toUpperCase() && line.length > 10 && line.split(/\s+/).length >= 2) return true;
    return false;
};

const isDegreeLine = (line) => DEGREE_RE.test(line);

const normalizeText = (s) => s.replace(/\s+/g, " ").trim();

const cleanStr = (s) => {
    if (!s) return "";
    const dateParts = s.match(DATE_RE);
    if (dateParts) {
        s = s.replace(dateParts[0], "");
    }
    return s.replace(/[–\-]+\s*/g, "").trim();
};

const parseEducation = (text) => {
    const entries = [];
    if (!text) return entries;

    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return entries;

    const blocks = [];
    let currentBlock = [];

    const isNewEntry = (line) => {
        return isInstitutionLine(line) && currentBlock.length > 0 && !isDegreeLine(line);
    };

    for (const line of lines) {
        if (isNewEntry(line)) {
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
        const gpaMatch = blockText.match(GPA_RE);
        const dates = parseDateRange(blockText);

        let institution = "";
        let degree = "";
        let field = "";
        let location = "";

        for (const line of block) {
            if (isInstitutionLine(line) && !institution) {
                let inst = line;
                const locMatch = line.match(LOCATION_RE);
                if (locMatch) {
                    location = locMatch[1];
                    inst = line.slice(0, -locMatch[1].length).trim();
                }
                institution = cleanStr(inst);
            }

            if (isDegreeLine(line) && !degree) {
                let deg = line;
                const locMatch = line.match(LOCATION_RE);
                if (locMatch && !location) {
                    location = locMatch[1];
                    deg = deg.replace(locMatch[1], "").trim();
                }
                if (dates) {
                    deg = deg.replace(dates.start, "").replace(dates.end, "").trim();
                }
                deg = deg.replace(/[–\-]+\s*/g, "").trim();
                const fieldMatch = deg.match(/in\s+([A-Za-z\s&]+?)(?:[;,])/);
                if (fieldMatch) field = fieldMatch[1].trim();
                degree = deg;
            }
        }

        if (degree && !institution) {
            const instLine = block.find((l) => isInstitutionLine(l) && !isDegreeLine(l));
            if (instLine) {
                const locMatch = instLine.match(LOCATION_RE);
                let inst = instLine;
                if (locMatch && !location) {
                    location = locMatch[1];
                    inst = instLine.replace(locMatch[1], "").trim();
                }
                institution = cleanStr(inst);
            }
        }

        if (institution || degree) {
            entries.push({
                institution: normalizeText(institution),
                degree: normalizeText(degree),
                field: normalizeText(field),
                dates,
                gpa: gpaMatch ? gpaMatch[1] : "",
                location: location.trim(),
            });
        }
    }

    return entries;
};

export default parseEducation;
