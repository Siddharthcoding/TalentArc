import analyzeFormatting from "../analyzers/formatting.analyzer.js";
import analyzeContact from "../analyzers/contact.analyzer.js";
import analyzeCompleteness from "../analyzers/completeness.analyzer.js";
import analyzeStyle from "../analyzers/style.analyzer.js";
import analyzeKeywords from "../analyzers/keyword.analyzer.js";

const runATSEvaluation = (rawText, normalizedText, structured) => {
    const formatting = analyzeFormatting(rawText, normalizedText);
    const contact = analyzeContact(structured.contact);
    const completeness = analyzeCompleteness(structured);
    const style = analyzeStyle(structured, normalizedText);
    const keywords = analyzeKeywords(structured, normalizedText);

    return {
        formatting,
        contact,
        completeness,
        style,
        keywords,
    };
};

export default runATSEvaluation;
