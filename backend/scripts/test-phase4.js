import validateFile from "../middleware/fileValidation.js";
import parseResume from "../parsers/resume.parser.js";
import normalizeText from "../services/normalizer.service.js";
import parseStructured from "../parsers/structured.parser.js";
import runATSEvaluation from "../services/ats.service.js";
import computeWeightedScore from "../services/scoring.service.js";
import generateReport from "../services/report.service.js";

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

        console.log("\n[1/3] ATS Evaluation...");
        const ats = runATSEvaluation(rawText, normalizedText, structured);
        console.log("  Done (5 layers evaluated)");

        console.log("\n[2/3] Weighted Scoring...");
        const scoring = computeWeightedScore(structured, ats);
        console.log(`  Overall: ${scoring.overallScore}/${scoring.maxScore} (${scoring.percentage}%)`);

        console.log("\n  --- Category Breakdown ---");
        for (const [name, cat] of Object.entries(scoring.categories)) {
            const bar = "█".repeat(Math.round(cat.percentage / 10)) +
                       "░".repeat(10 - Math.round(cat.percentage / 10));
            console.log(`  ${name.padEnd(18)} ${cat.score.toString().padStart(5)}/${cat.maxScore.toString().padEnd(2)} ${bar} ${cat.percentage}%`);
        }

        console.log("\n[3/3] Report Generation...");
        const report = generateReport(structured, ats, scoring);

        console.log(`\n  Summary: ${report.summary}`);
        console.log(`\n  Critical Flags: ${report.flags.critical.length}`);
        for (const f of report.flags.critical) {
            console.log(`    ! ${f.message}`);
        }
        console.log(`  Warnings: ${report.flags.warnings.length}`);
        for (const f of report.flags.warnings) {
            console.log(`    ⚠ ${f.message}`);
        }
        console.log(`  Suggestions: ${report.flags.suggestions.length}`);

        console.log("\n  Priority Actions:");
        if (report.priorityActions.length === 0) {
            console.log("    (none)");
        } else {
            for (const a of report.priorityActions) {
                console.log(`    → ${a}`);
            }
        }

        console.log("\n  Top Keywords:");
        for (const kw of (report.keywordInsights.topKeywords || [])) {
            console.log(`    ${kw.word} (${kw.count}x)`);
        }

        console.log("\n  Category Feedback:");
        for (const [name, feedback] of Object.entries(report.categoryFeedback)) {
            console.log(`    ${name}: ${feedback}`);
        }

    } catch (err) {
        console.error(`\n  ERROR: ${err.message}`);
    }
};

const main = async () => {
    console.log("Phase 4 - Scoring, Aggregation & Reporting Test");
    console.log(`Testing ${TEST_FILES.length} file(s)\n`);

    for (const filePath of TEST_FILES) {
        await runTest(filePath);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("Phase 4 tests complete.");
    console.log("=".repeat(60));
};

main().catch(console.error);
