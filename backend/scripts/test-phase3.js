import validateFile from "../middleware/fileValidation.js";
import parseResume from "../parsers/resume.parser.js";
import normalizeText from "../services/normalizer.service.js";
import parseStructured from "../parsers/structured.parser.js";
import runATSEvaluation from "../services/ats.service.js";

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

        console.log("\nRunning ATS Evaluation (5 layers)...\n");

        const ats = runATSEvaluation(rawText, normalizedText, structured);

        const layers = ["formatting", "contact", "completeness", "style", "keywords"];
        let totalScore = 0;
        let totalMax = 0;

        for (const layer of layers) {
            const result = ats[layer];
            totalScore += result.score;
            totalMax += result.maxScore;

            console.log(`  [${layer.toUpperCase()}] ${result.score}/${result.maxScore}`);
            if (result.flags.length > 0) {
                for (const flag of result.flags) {
                    console.log(`    ⚠ ${flag}`);
                }
            } else {
                console.log(`    ✓ No issues found`);
            }
            console.log("");
        }

        const pct = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : "0.0";
        console.log(`  ATS RAW SCORE: ${totalScore}/${totalMax} (${pct}%)`);
    } catch (err) {
        console.error(`\n  ERROR: ${err.message}`);
    }
};

const main = async () => {
    console.log("Phase 3 - ATS Evaluation Engine Test");
    console.log(`Testing ${TEST_FILES.length} file(s)\n`);

    for (const filePath of TEST_FILES) {
        await runTest(filePath);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("Phase 3 tests complete.");
    console.log("=".repeat(60));
};

main().catch(console.error);
