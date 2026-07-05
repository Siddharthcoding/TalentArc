import { fileTypeFromFile } from "file-type";
import fs from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];
const ALLOWED_MIMES = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const PDF_HEADER = Buffer.from("%PDF");
const DOCX_HEADER = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function checkMagicBytes(filePath) {
    try {
        const fd = await fs.open(filePath, "r");
        try {
            const buf = Buffer.allocUnsafe(8);
            const { bytesRead } = await fd.read(buf, 0, 8, 0);
            if (bytesRead < 4) return null;

            if (buf.slice(0, 4).equals(PDF_HEADER)) return "pdf";
            if (buf.slice(0, 4).equals(DOCX_HEADER)) return "docx";
            return null;
        } finally {
            await fd.close();
        }
    } catch {
        return null;
    }
}

const validateFile = async (filePath, originalName, multerMime) => {
    const originalExt = originalName
        ? path.extname(originalName).toLowerCase()
        : "";

    /* Layer 1: MIME via file-type library (reads file magic bytes) */
    try {
        const type = await fileTypeFromFile(filePath);
        if (type && ALLOWED_MIMES.has(type.mime)) {
            return { valid: true, extension: path.extname(originalName || filePath).toLowerCase() };
        }
    } catch {
        /* MIME unavailable — continue */
    }

    /* Layer 2: Manual magic byte header check (reads file directly) */
    const magicExt = await checkMagicBytes(filePath);
    if (magicExt) {
        const ext = "." + magicExt;
        return { valid: true, extension: ext };
    }

    /* Layer 3: Original filename extension fallback */
    if (ALLOWED_EXTENSIONS.includes(originalExt)) {
        return { valid: true, extension: originalExt };
    }

    /* Layer 4: Multer-detected MIME from HTTP Content-Type header (no disk read) */
    if (multerMime && ALLOWED_MIMES.has(multerMime)) {
        const ext = multerMime === "application/pdf" ? ".pdf" : ".docx";
        return { valid: true, extension: ext };
    }

    return {
        valid: false,
        error: "Unsupported file. Please upload a PDF or DOCX document.",
    };
};

export default validateFile;
