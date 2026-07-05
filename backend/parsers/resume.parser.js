import path from "path";
import parsePDF from "./pdf.parser.js";
import parseDOCX from "./docx.parser.js";

const parseResume = async (filePath, ext) => {
    const extension = (ext || path.extname(filePath)).toLowerCase();

    switch (extension) {
        case ".pdf":
            return await parsePDF(filePath);
        case ".docx":
            return await parseDOCX(filePath);
        default:
            throw new Error(`Unsupported file format: ${extension}`);
    }
};

export default parseResume;
