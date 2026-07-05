import validateFile from "../middleware/fileValidation.js";
import parseResume from "../parsers/resume.parser.js";
import normalizeText from "../services/normalizer.service.js";
import parseStructured from "../parsers/structured.parser.js";

const TEST_FILES = [
    "uploads/Siddharth's Resume.pdf",
    "uploads/Siddharth's Resume.docx",
];

const runTest = async (filePath) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Testing: ${filePath}`);
    console.log("=".repeat(60));

    try {
        console.log("\n[1/3] Validating & extracting...");
        const validation = await validateFile(filePath);
        if (!validation.valid) {
            console.error(`  FAIL: ${validation.error}`);
            return;
        }
        const rawText = await parseResume(filePath);
        console.log(`  PASS: ${rawText.length} chars extracted`);

        console.log("\n[2/3] Normalizing...");
        const normalizedText = normalizeText(rawText);
        console.log(`  PASS: ${normalizedText.length} chars after normalization`);

        console.log("\n[3/3] Parsing structured JSON...");
        const structured = parseStructured(normalizedText);

        console.log("\n  --- Structured Output ---\n");
        console.log(JSON.stringify(structured, null, 2));

        console.log("\n  --- Field Summary ---");
        console.log(`  summary:        ${structured.summary ? structured.summary.slice(0, 80) + "..." : "(empty)"}`);
        console.log(`  contact.name:   ${structured.contact.name || "(not found)"}`);
        console.log(`  contact.email:  ${structured.contact.email || "(not found)"}`);
        console.log(`  contact.phone:  ${structured.contact.phone || "(not found)"}`);
        console.log(`  contact.links:  ${Object.values(structured.contact.links).filter(Boolean).join(", ") || "(none)"}`);
        console.log(`  education:      ${structured.education.length} entry(ies)`);
        console.log(`  experience:     ${structured.experience.length} entry(ies)`);
        console.log(`  projects:       ${structured.projects.length} entry(ies)`);
        console.log(`  skills.all:     ${structured.skills.all.length} skills found`);
        console.log(`  achievements:   ${structured.achievements.length} achievement(s)`);
    } catch (err) {
        console.error(`\n  ERROR: ${err.message}`);
    }
};

const main = async () => {
    console.log("Phase 2 - Structured Parsing Test");
    console.log(`Testing ${TEST_FILES.length} file(s)\n`);

    for (const filePath of TEST_FILES) {
        await runTest(filePath);
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log("Phase 2 tests complete.");
    console.log("=".repeat(60));
};

main().catch(console.error);
