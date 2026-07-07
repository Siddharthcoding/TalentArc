import validateFile from "../middleware/fileValidation.js";
import parseResume from "../parsers/resume.parser.js";
import normalizeText from "../services/normalizer.service.js";
import { processJDText } from "../services/jdParser.service.js";

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

const JD_STRUCTURED = `
Senior Software Engineer - Backend

About TechCorp Inc.
TechCorp Inc. is a leading fintech company building the future of digital payments.

Responsibilities:
- Design and develop scalable microservices using Node.js and TypeScript
- Build and maintain RESTful APIs serving millions of requests daily
- Collaborate with cross-functional teams to define and implement new features
- Optimize database queries and improve system performance
- Write comprehensive unit and integration tests
- Participate in code reviews and mentor junior engineers
- Deploy and monitor services using Docker and AWS infrastructure

Requirements:
- 5+ years of experience in software development
- Strong proficiency in Node.js, TypeScript, and Express.js
- Experience with PostgreSQL and MongoDB
- Hands-on experience with AWS services (EC2, S3, Lambda)
- Understanding of Docker and containerization
- Familiarity with Git and CI/CD pipelines
- Excellent problem-solving and communication skills

Preferred Qualifications:
- Experience with Kubernetes
- Knowledge of GraphQL
- Familiarity with Redis and caching strategies
- Experience with event-driven architecture and Kafka
- Contributions to open-source projects

Education:
- Bachelor's degree in Computer Science or related field
- Master's degree preferred
`;

const JD_RAW = `
We are looking for a Senior Frontend Engineer to join our team at DataFlow Analytics. 
You will build responsive web applications using React and TypeScript. 
You need 4+ years of experience with frontend development. 
Must have strong skills in React, TypeScript, CSS, and HTML. 
Experience with Next.js and Tailwind CSS is required. 
Knowledge of Node.js and GraphQL is a plus. 
You should understand state management with Redux. 
Familiarity with testing frameworks like Jest and Cypress is expected. 
A Bachelor's degree in Computer Science or equivalent experience is required. 
We use Docker and AWS for our infrastructure. 
You will work closely with UX designers and backend engineers to deliver features. 
`;

const runJDStructuredTest = () => {
    console.log(`\n${"=".repeat(60)}`);
    console.log("JD Test 1: Well-Structured Job Description");
    console.log("=".repeat(60));

    try {
        console.log("\n[1/2] Parsing structured JD...");
        const result = processJDText(JD_STRUCTURED);
        console.log("  PASS: JD parsed successfully");

        console.log("\n[2/2] Verifying extracted fields...");
        const checks = [
            { field: "company", expectedType: "string", actual: result.company },
            { field: "requiredSkills", expectedType: "array", actual: result.requiredSkills },
            { field: "preferredSkills", expectedType: "array", actual: result.preferredSkills },
            { field: "responsibilities", expectedType: "array", actual: result.responsibilities },
            { field: "experience", expectedType: "object", actual: result.experience },
            { field: "education", expectedType: "object", actual: result.education },
            { field: "keywords", expectedType: "array", actual: result.keywords },
        ];

        for (const check of checks) {
            const pass = Array.isArray(check.actual)
                ? check.actual.length > 0
                : typeof check.actual === check.expectedType;
            console.log(`  ${pass ? "PASS" : "FAIL"}: ${check.field} = ${JSON.stringify(check.actual)}`);
        }

        console.log(`\n  --- Full Output ---\n${JSON.stringify(result, null, 2)}`);
    } catch (err) {
        console.error(`\n  ERROR: ${err.message}`);
    }
};

const runJDRawTest = () => {
    console.log(`\n${"=".repeat(60)}`);
    console.log("JD Test 2: Raw/Unstructured Job Description");
    console.log("=".repeat(60));

    try {
        console.log("\n[1/2] Parsing raw JD...");
        const result = processJDText(JD_RAW);
        console.log("  PASS: JD parsed successfully");

        console.log("\n[2/2] Verifying extracted fields...");
        const checks = [
            { field: "company", expected: "non-empty", actual: result.company },
            { field: "characterCount", expected: "> 0", actual: result.characterCount },
        ];

        for (const check of checks) {
            const pass = typeof check.actual === "string"
                ? check.actual.length > 0
                : check.actual > 0;
            console.log(`  ${pass ? "PASS" : "FAIL"}: ${check.field} = ${JSON.stringify(check.actual)}`);
        }

        console.log("  STATS:");
        console.log(`    requiredSkills: ${result.requiredSkills.length} skills`);
        console.log(`    preferredSkills: ${result.preferredSkills.length} skills`);
        console.log(`    responsibilities: ${result.responsibilities.length} items`);
        console.log(`    experience: ${JSON.stringify(result.experience)}`);
        console.log(`    education: ${JSON.stringify(result.education)}`);
        console.log(`    keywords: ${result.keywords.length} keywords`);

        console.log(`\n  --- Full Output ---\n${JSON.stringify(result, null, 2)}`);
    } catch (err) {
        console.error(`\n  ERROR: ${err.message}`);
    }
};

const main = async () => {
    console.log("=".repeat(60));
    console.log("PHASE 1 - Resume & JD Ingestion Tests");
    console.log("=".repeat(60));

    console.log("\n>>> RESUME PARSING TESTS <<<");
    console.log(`Testing ${TEST_FILES.length} file(s)`);

    for (const filePath of TEST_FILES) {
        await runTest(filePath);
    }

    console.log(`\n${"-".repeat(60)}`);
    console.log(">>> JD PARSING TESTS <<<");

    runJDStructuredTest();
    runJDRawTest();

    console.log(`\n${"=".repeat(60)}`);
    console.log("Phase 1 tests complete.");
    console.log("=".repeat(60));
};

main().catch(console.error);
