import fs from "fs";
import path from "path";
import normalizeText from "./normalizer.service.js";
import parseJDText from "../parsers/jdParser.js";
import parseResume from "../parsers/resume.parser.js";

const processJDText = (rawText) => {
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
        throw new Error("Job description text is empty or invalid");
    }

    const normalizedText = normalizeText(rawText);
    const structured = parseJDText(normalizedText);

    return {
        ...structured,
        characterCount: normalizedText.length,
        rawText,
    };
};

const processJDFile = async (filePath, originalName) => {
    const ext = path.extname(originalName || filePath).toLowerCase();

    let rawText;

    if (ext === ".txt") {
        rawText = fs.readFileSync(filePath, "utf-8");
    } else {
        rawText = await parseResume(filePath, ext);
    }

    return processJDText(rawText);
};

export { processJDText, processJDFile };
