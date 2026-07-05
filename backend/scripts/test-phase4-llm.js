import "dotenv/config";
import validateFile from "../middleware/fileValidation.js";
import parseResume from "../parsers/resume.parser.js";
import normalizeText from "../services/normalizer.service.js";
import parseStructured from "../parsers/structured.parser.js";
import runATSEvaluation from "../services/ats.service.js";
import computeWeightedScore from "../services/scoring.service.js";
import { generateLLMReport } from "../services/report.service.js";

const TEST_FILES = [
    "uploads/Siddharth's Resume.pdf",
    "uploads/Siddharth's Resume.docx",
];

const runTest = async (filePath) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Testing: ${filePath}`);
    console.log("=".repeat(60));

    try {
        const validation = await validateFile(filePath);
        if (!validation.valid) {
            console.error(`  FAIL: ${validation.error}`);
            return;
        }

        const rawText = await parseResume(filePath);
        const normalizedText = normalizeText(rawText);
        const structured = parseStructured(normalizedText);

        const ats = runATSEvaluation(rawText, normalizedText, structured);
        const scoring = computeWeightedScore(structured, ats);

        console.log("\n[LLM Narrative Report]...");
        const report = await generateLLMReport(structured, ats, scoring);

        if (report.llmEnhanced) {
            console.log("  Status: LLM-GENERATED ✓");
        } else {
            console.log("  Status: TEMPLATE FALLBACK (LLM unavailable)");
        }

        console.log(`\n  Overall Score: ${scoring.overallScore}/${scoring.maxScore} (${scoring.percentage}%)`);
        console.log(`  Strength Label: ${report.strengthLabel || "N/A"}`);

        console.log(`\n  Overall Assessment:`);
        console.log(`    ${report.summary}`);

        console.log(`\n  --- Category Feedback ---`);
        for (const [name, feedback] of Object.entries(report.categoryFeedback)) {
            console.log(`  ${name.padEnd(18)} ${feedback}`);
        }

        console.log(`\n  Priority Actions:`);
        if (report.priorityActions.length === 0) {
            console.log("    (none)");
        } else {
            for (const a of report.priorityActions) {
                console.log(`    → ${a}`);
            }
        }

        console.log(`\n  Flags: ${report.flags.critical.length} critical, ${report.flags.warnings.length} warnings, ${report.flags.suggestions.length} suggestions`);

    } catch (err) {
        console.error(`\n  ERROR: ${err.message}`);
    }
};

const main = async () => {
    console.log("Phase 4 - LLM-Enhanced Report Test");
    console.log(`Testing ${TEST_FILES.length} file(s)\n`);

    for (const filePath of TEST_FILES) {
        await runTest(filePath);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("Phase 4 LLM tests complete.");
    console.log("=".repeat(60));
};

main().catch(console.error);
