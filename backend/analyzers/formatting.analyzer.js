const analyzeFormatting = (rawText, normalizedText) => {
    const flags = [];
    const details = {};
    let deductions = 0;

    const lines = rawText.split("\n");
    const nonEmptyLines = lines.filter((l) => l.trim().length > 0);
    const totalChars = rawText.length;

    const tabCount = (rawText.match(/\t/g) || []).length;
    if (tabCount > 5) {
        flags.push("Tab characters detected — possible table/column layout that may not parse correctly");
        deductions += 2;
    }

    const replacementCharCount = (rawText.match(/\uFFFD/g) || []).length;
    if (replacementCharCount > 0) {
        flags.push(`Unicode replacement characters found (${replacementCharCount}) — possible encoding issues`);
        deductions += 1.5;
    }

    const controlCharCount = (rawText.match(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g) || []).length;
    if (controlCharCount > 0) {
        flags.push(`Control characters detected (${controlCharCount}) — possible extraction artifacts`);
        deductions += 1;
    }

    const lineLengths = nonEmptyLines.map((l) => l.length);
    const avgLineLen = lineLengths.length > 0
        ? lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length
        : 0;
    const maxLineLen = lineLengths.length > 0 ? Math.max(...lineLengths) : 0;
    const veryLongLines = lineLengths.filter((l) => l > 200).length;

    details.avgLineLength = Math.round(avgLineLen);
    details.maxLineLength = maxLineLen;
    details.veryLongLines = veryLongLines;

    if (veryLongLines > 3) {
        flags.push(`${veryLongLines} lines exceed 200 chars — text may lack proper line breaks or have merged columns`);
        deductions += 1.5;
    }

    if (avgLineLen > 150) {
        flags.push("Average line length is very high — document may have minimal structure");
        deductions += 1;
    }

    const totalLines = lines.length;
    const blankLines = lines.filter((l) => l.trim().length === 0).length;
    const blankRatio = totalLines > 0 ? blankLines / totalLines : 0;
    details.blankLineRatio = blankRatio.toFixed(2);

    if (blankRatio > 0.4) {
        flags.push("High ratio of blank lines — document may have excessive whitespace");
        deductions += 1;
    }

    if (totalChars < 200) {
        flags.push("Extracted text is very short — possible extraction failure");
        deductions += 3;
    }

    const inconsistentIndent = (() => {
        const indents = nonEmptyLines
            .map((l) => l.match(/^(\s+)/))
            .filter(Boolean)
            .map((m) => m[1].length);
        if (indents.length < 5) return false;
        const unique = [...new Set(indents)];
        return unique.length > 4;
    })();

    if (inconsistentIndent) {
        flags.push("Inconsistent indentation detected — possible multi-column layout");
        deductions += 1;
    }

    const score = Math.max(0, 10 - deductions);
    return {
        score: Math.round(score * 10) / 10,
        maxScore: 10,
        flags,
        details,
    };
};

export default analyzeFormatting;
