import validateFile from "../middleware/fileValidation.js";
import parseResume from "../parsers/resume.parser.js";
import normalizeText from "../services/normalizer.service.js";

const TEST_FILES = [
    "uploads/Siddharth's Resume.pdf",
    "uploads/Siddharth's Resume.docx",
];

const runTest = async (filePath) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Testing: ${filePath}`);
    console.log("=".repeat(60));

    try {
        console.log("\n[1/3] Validating file...");
        const validation = await validateFile(filePath);
        if (!validation.valid) {
            console.error(`  FAIL: ${validation.error}`);
            return;
        }
        console.log(`  PASS: extension=${validation.extension}`);

        console.log("\n[2/3] Extracting raw text...");
        const rawText = await parseResume(filePath);
        console.log(`  PASS: ${rawText.length} characters extracted`);
        console.log(`  Preview (first 300 chars):\n${rawText.slice(0, 300)}\n...`);

        console.log("\n[3/3] Normalizing text...");
        const normalizedText = normalizeText(rawText);
        console.log(`  PASS: ${normalizedText.length} characters after normalization`);
        console.log(`  Reduction: ${((1 - normalizedText.length / rawText.length) * 100).toFixed(1)}%`);
        console.log(`\n  --- Normalized Output ---\n${normalizedText}`);
    } catch (err) {
        console.error(`\n  ERROR: ${err.message}`);
    }
};

const main = async () => {
    console.log("Phase 1 - Ingestion, Extraction & Normalization Test");
    console.log("Testing ${TEST_FILES.length} file(s)\n");

    for (const filePath of TEST_FILES) {
        await runTest(filePath);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("Phase 1 tests complete.");
    console.log("=".repeat(60));
};

main().catch(console.error);
