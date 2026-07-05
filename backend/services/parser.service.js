import path from "path";
import validateFile from "../middleware/fileValidation.js";
import parseResume from "../parsers/resume.parser.js";
import normalizeText from "./normalizer.service.js";
import parseStructured from "../parsers/structured.parser.js";

const processResume = async (filePath, originalName, multerMime) => {
    const validation = await validateFile(filePath, originalName, multerMime);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const rawText = await parseResume(filePath, validation.extension);
    const normalizedText = normalizeText(rawText);
    const structured = parseStructured(normalizedText);

    return {
        fileName: path.basename(originalName || filePath),
        fileType: validation.extension,
        rawText,
        normalizedText,
        structured,
    };
};

export default processResume;
