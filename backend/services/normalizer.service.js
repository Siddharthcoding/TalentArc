const BULLET_PATTERN = /[•●▪‣▸▹►▻◆◇○◉◎◈⁃⁌⁍→⇒⇨➢➤▪️▫️]\s*/g;
const SOFT_HYPHEN = /\u00AD/g;
const ZERO_WIDTH_CHARS = /[\u200B-\u200D\uFEFF]/g;
const REPLACEMENT_CHAR = /\uFFFD/g;
const MULTIPLE_SPACES = /[^\S\r\n]{2,}/g;
const MULTIPLE_BLANK_LINES = /\n{3,}/g;
const TRAILING_SPACES = /[ \t]+$/gm;
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

const normalizeText = (rawText) => {
    if (!rawText || typeof rawText !== "string") {
        return "";
    }

    let text = rawText;

    text = text.replace(SOFT_HYPHEN, "");
    text = text.replace(ZERO_WIDTH_CHARS, "");
    text = text.replace(REPLACEMENT_CHAR, "");
    text = text.replace(CONTROL_CHARS, "");

    text = text.replace(BULLET_PATTERN, "- ");

    text = text.replace(TRAILING_SPACES, "");
    text = text.replace(MULTIPLE_SPACES, " ");
    text = text.replace(MULTIPLE_BLANK_LINES, "\n\n");

    text = text.trim();

    return text;
};

export default normalizeText;
