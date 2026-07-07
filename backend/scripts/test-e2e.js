import processResume from "../services/parser.service.js";
import normalizeText from "../services/normalizer.service.js";
import { processJDText } from "../services/jdParser.service.js";
import runATSEvaluation from "../services/ats.service.js";
import computeWeightedScore from "../services/scoring.service.js";
import generateReport, { generateLLMReport } from "../services/report.service.js";
import { runJDMatching, runAsyncMatching } from "../services/jdMatching.service.js";
import aggregateMatchScores from "../services/jdAggregator.service.js";
import { generateJDReport, generateJDReportLLM } from "../services/jdReport.service.js";

const RESUME_PATH = "uploads/Siddharth's Resume.pdf";
const RESUME_DOCX_PATH = "uploads/Siddharth's Resume.docx";

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

const PASS = "\x1b[32mPASS\x1b[0m";
const FAIL = "\x1b[31mFAIL\x1b[0m";
const SKIP = "\x1b[33mSKIP\x1b[0m";

let passed = 0;
let failed = 0;
let skipped = 0;

const assert = (label, condition, detail = "") => {
    if (condition) {
        console.log(`  ${PASS} | ${label} ${detail}`);
        passed++;
    } else {
        console.log(`  ${FAIL} | ${label} ${detail}`);
        failed++;
    }
};

const assertGte = (label, actual, min) => {
    if (actual >= min) {
        console.log(`  ${PASS} | ${label} (${actual} >= ${min})`);
        passed++;
    } else {
        console.log(`  ${FAIL} | ${label} (${actual} < ${min})`);
        failed++;
    }
};

const assertShape = (label, obj, keys) => {
    const hasAll = keys.every((k) => obj && obj[k] !== undefined);
    assert(`${label} has keys: [${keys.join(", ")}]`, hasAll);
};

const section = (num, title) => {
    console.log(`\n--- [${num}] ${title} ---`);
};

const run = async () => {
    console.log("=".repeat(80));
    console.log("END-TO-END TEST — ALL BACKEND SERVICES");
    console.log("=".repeat(80));

    let resumeResult, jdResult, atsResult, scoringResult, reportResult;
    let syncResults, asyncResults, allResults, aggregated, jdReportResult;

    try {
        section("1", "RESUME PARSING — PDF");
        resumeResult = await processResume(RESUME_PATH);
        assert("resumeResult exists", !!resumeResult);
        assert("file name matches", resumeResult.fileName === "Siddharth's Resume.pdf",
            `(${resumeResult.fileName})`);
        assert("normalizedText non-empty", resumeResult.normalizedText?.length > 100);
        assertShape("resumeResult.structured", resumeResult.structured, [
            "contact", "education", "experience", "projects", "skills", "achievements", "summary",
        ]);

        const s = resumeResult.structured;
        assert("contact has email", s.contact?.email?.length > 0, `(${s.contact?.email})`);
        assert("contact has phone", s.contact?.phone?.length > 0, `(${s.contact?.phone})`);
        assertGte("skills count", s.skills?.all?.length ?? 0, 10);
        assertGte("education entries", s.education?.length ?? 0, 1);
        assert("education[0] has degree", s.education[0]?.degree?.length > 0);
        assert("education[0] has institution", s.education[0]?.institution?.length > 0);
        assert("projects exists", Array.isArray(s.projects));
    } catch (e) {
        console.log(`  ${FAIL} | Resume PDF parsing crashed: ${e.message}`);
        failed++;
    }

    try {
        section("2", "RESUME PARSING — DOCX (validation)");
        const docxResult = await processResume(RESUME_DOCX_PATH);
        assert("docxResult exists", !!docxResult);
        assert("docx file name matches", docxResult.fileName === "Siddharth's Resume.docx",
            `(${docxResult.fileName})`);
        assert("docx normalizedText non-empty", docxResult.normalizedText?.length > 100);
        assert("docx structured has contact", docxResult.structured?.contact?.email?.length > 0);
        assertGte("docx skills count", docxResult.structured?.skills?.all?.length ?? 0, 10);
    } catch (e) {
        console.log(`  ${FAIL} | Resume DOCX parsing crashed: ${e.message}`);
        failed++;
    }

    try {
        section("3", "TEXT NORMALIZATION");
        const raw = "Hello•World\n\n\nTest\u00AD ing\r\n";
        const norm = normalizeText(raw);
        assert("normalizeText removes bullets", !norm.includes("•"), `(${norm.slice(0, 20)})`);
        assert("normalizeText removes soft hyphen", !norm.includes("\u00AD"));
        assert("normalizeText collapses blank lines", !norm.includes("\n\n\n"));
        assert("normalizeText trims", norm === norm.trim());

        const empty = normalizeText("");
        assert("normalizeText handles empty string", empty === "");
        const nonStr = normalizeText(null);
        assert("normalizeText handles null", nonStr === "");
    } catch (e) {
        console.log(`  ${FAIL} | Normalization crashed: ${e.message}`);
        failed++;
    }

    try {
        section("4", "JD PARSING — Structured");
        jdResult = processJDText(JD_STRUCTURED);
        assert("jdResult exists", !!jdResult);
        assertShape("jdResult", jdResult, [
            "company", "requiredSkills", "preferredSkills",
            "responsibilities", "experience", "education", "keywords",
        ]);
        assert("company extracted", jdResult.company === "TechCorp Inc.", `(${jdResult.company})`);
        assertGte("requiredSkills count", jdResult.requiredSkills.length, 8);
        assertGte("preferredSkills count", jdResult.preferredSkills.length, 3);
        assertGte("responsibilities count", jdResult.responsibilities.length, 5);
        assert("experience has minimumYears", jdResult.experience?.minimumYears === 5);
        assert("education has degree field", jdResult.education?.degree?.length > 0,
            `(${jdResult.education?.degree})`);
        assert("education has field", jdResult.education?.field?.length > 0);
        assertGte("keywords count", jdResult.keywords.length, 15);
    } catch (e) {
        console.log(`  ${FAIL} | JD structured parsing crashed: ${e.message}`);
        failed++;
    }

    try {
        section("5", "JD PARSING — Unstructured/Raw");
        const rawJdText = `
We are looking for a Senior Frontend Engineer to join our team at DataFlow Analytics.
You will build responsive web applications using React and TypeScript.
You need 4+ years of experience with frontend development.
Must have strong skills in React, TypeScript, CSS, and HTML.
Experience with Next.js and Tailwind CSS is required.
Knowledge of Node.js and GraphQL is a plus.
A Bachelor's degree in Computer Science or equivalent experience is required.
We use Docker and AWS for our infrastructure.
`;
        const rawJd = processJDText(rawJdText);
        assert("raw JD has company", rawJd.company === "DataFlow", `(${rawJd.company})`);
        assert("raw JD has skills", rawJd.requiredSkills.length > 0,
            `(${rawJd.requiredSkills.length})`);
        assert("raw JD has experience object",
            typeof rawJd.experience === "object" && rawJd.experience !== null,
            `(minimumYears=${rawJd.experience?.minimumYears})`);
        assert("raw JD has education", rawJd.education?.degree?.length > 0);
        assert("raw JD has keywords", rawJd.keywords.length > 0,
            `(${rawJd.keywords.length})`);
    } catch (e) {
        console.log(`  ${FAIL} | JD raw parsing crashed: ${e.message}`);
        failed++;
    }

    try {
        section("6", "ATS EVALUATION");
        atsResult = runATSEvaluation(
            resumeResult.rawText,
            resumeResult.normalizedText,
            resumeResult.structured
        );
        assert("atsResult exists", !!atsResult);
        assertShape("atsResult", atsResult, [
            "formatting", "contact", "completeness", "style", "keywords",
        ]);
        for (const layer of ["formatting", "contact", "completeness", "style", "keywords"]) {
            const l = atsResult[layer];
            assert(`ats.${layer} has score (0-10)`, typeof l?.score === "number" && l.score >= 0 && l.score <= 10,
                `(${l?.score})`);
            assert(`ats.${layer} has flags array`, Array.isArray(l?.flags));
            assert(`ats.${layer} has details`, typeof l?.details === "object");
        }
    } catch (e) {
        console.log(`  ${FAIL} | ATS evaluation crashed: ${e.message}`);
        failed++;
    }

    try {
        section("7", "ATS SCORING (Weighted)");
        scoringResult = computeWeightedScore(resumeResult.structured, atsResult);
        assert("scoringResult exists", !!scoringResult);
        assertShape("scoringResult", scoringResult, [
            "overallScore", "maxScore", "percentage", "categories",
        ]);
        assert("overallScore is number", typeof scoringResult.overallScore === "number",
            `(${scoringResult.overallScore})`);
        assert("maxScore > 0", scoringResult.maxScore > 0, `(${scoringResult.maxScore})`);
        assert("percentage 0-100", scoringResult.percentage >= 0 && scoringResult.percentage <= 100,
            `(${scoringResult.percentage})`);

        const cats = ["formatting", "education", "experience", "projects", "skills",
            "achievements", "keywords", "grammar", "atsCompatibility"];
        for (const cat of cats) {
            assert(`category '${cat}' exists`, !!scoringResult.categories[cat]);
            const c = scoringResult.categories[cat];
            assert(`category '${cat}' has score`, typeof c.score === "number");
            assert(`category '${cat}' has maxScore`, c.maxScore > 0);
            assert(`category '${cat}' has percentage`, c.percentage >= 0);
        }
    } catch (e) {
        console.log(`  ${FAIL} | ATS scoring crashed: ${e.message}`);
        failed++;
    }

    try {
        section("8", "ATS REPORT (Template)");
        reportResult = generateReport(resumeResult.structured, atsResult, scoringResult);
        assert("report exists", !!reportResult);
        assertShape("report", reportResult, [
            "summary", "overallScore", "maxScore", "percentage",
            "categoryBreakdown", "flags", "categoryFeedback",
            "keywordInsights", "priorityActions",
        ]);
        assert("report summary non-empty", reportResult.summary.length > 0);
        assert("report flags has critical/warnings/suggestions",
            "critical" in reportResult.flags &&
            "warnings" in reportResult.flags &&
            "suggestions" in reportResult.flags);
        assert("report priorityActions is array", Array.isArray(reportResult.priorityActions));
        assert("report categoryFeedback has entries", Object.keys(reportResult.categoryFeedback).length > 0);
    } catch (e) {
        console.log(`  ${FAIL} | ATS report crashed: ${e.message}`);
        failed++;
    }

    try {
        section("9", "ATS REPORT (LLM-Enhanced)");
        const llmReport = await generateLLMReport(resumeResult.structured, atsResult, scoringResult);
        assert("llmReport exists", !!llmReport);
        assert("llmReport has summary", llmReport.summary?.length > 0);
        assert("llmReport has priorityActions", Array.isArray(llmReport.priorityActions));
        console.log(`  INFO | LLM enhanced: ${llmReport.llmEnhanced ?? false}`);
    } catch (e) {
        console.log(`  ${SKIP} | LLM report generation failed (non-critical): ${e.message}`);
        skipped++;
    }

    try {
        section("10", "JD MATCHING — Sync Matchers");
        syncResults = runJDMatching(jdResult, resumeResult.structured, resumeResult.normalizedText);
        assert("syncResults exists", !!syncResults);
        assertShape("syncResults", syncResults, ["skill", "keyword", "experience", "education"]);

        for (const key of ["skill", "keyword", "experience", "education"]) {
            const m = syncResults[key];
            assert(`sync.${key} has score`, typeof m?.score === "number",
                `(${m?.score})`);
            assert(`sync.${key} has maxScore=100`, m?.maxScore === 100, `(${m?.maxScore})`);
            assert(`sync.${key} has flags array`, Array.isArray(m?.flags));
            assert(`sync.${key} has details`, typeof m?.details === "object");
        }

        assert("skill matcher matchedRequired is array",
            Array.isArray(syncResults.skill.details.matchedRequired));
        assert("keyword matcher has overlappingKeywords",
            Array.isArray(syncResults.keyword.details.overlappingKeywords));
        assert("experience matcher has totalYearsOfExperience",
            typeof syncResults.experience.details.totalYearsOfExperience === "number");
        assert("education matcher has degreeRequirementMet",
            typeof syncResults.education.details.degreeRequirementMet === "boolean");
    } catch (e) {
        console.log(`  ${FAIL} | Sync matchers crashed: ${e.message}`);
        failed++;
    }

    try {
        section("11", "JD MATCHING — Async Matchers (Semantic + Rewrite)");
        asyncResults = await runAsyncMatching(
            jdResult, resumeResult.structured, resumeResult.normalizedText, syncResults
        );
        assert("asyncResults exists", !!asyncResults);
        assertShape("asyncResults", asyncResults, ["semantic", "rewrite"]);

        const sem = asyncResults.semantic;
        assert("semantic has score", typeof sem?.score === "number", `(${sem?.score})`);
        assert("semantic has maxScore=100", sem?.maxScore === 100);
        assert("semantic has methodUsed", sem?.details?.methodUsed?.length > 0,
            `(${sem?.details?.methodUsed})`);
        assert("semantic has responsibilityMatches array",
            Array.isArray(sem?.details?.responsibilityMatches));
        assert("semantic has projectRelevance", typeof sem?.details?.projectRelevance === "number");

        const rw = asyncResults.rewrite;
        assert("rewrite has score", typeof rw?.score === "number", `(${rw?.score})`);
        assert("rewrite has maxScore=100", rw?.maxScore === 100);
        assert("rewrite has suggestions array", Array.isArray(rw?.details?.suggestions));
        assert("rewrite has keywordInjections array", Array.isArray(rw?.details?.keywordInjections));
        assert("rewrite has llmEnhanced flag", typeof rw?.details?.llmEnhanced === "boolean");
    } catch (e) {
        console.log(`  ${FAIL} | Async matchers crashed: ${e.message}`);
        failed++;
    }

    try {
        section("12", "JD MATCHING — Full Combined");
        allResults = { ...syncResults, ...asyncResults };
        const keys = ["skill", "keyword", "experience", "education", "semantic", "rewrite"];
        for (const key of keys) {
            assert(`allResults.${key} has score`, typeof allResults[key]?.score === "number",
                `(${allResults[key]?.score})`);
        }
    } catch (e) {
        console.log(`  ${FAIL} | Full combined crashed: ${e.message}`);
        failed++;
    }

    try {
        section("13", "JD AGGREGATOR (Weighted Scores)");
        aggregated = aggregateMatchScores(allResults);
        assert("aggregated exists", !!aggregated);
        assertShape("aggregated", aggregated, ["overallScore", "maxScore", "breakdown", "categorySummary"]);
        assert("aggregated maxScore=100", aggregated.maxScore === 100);
        assert("aggregated overallScore 0-100",
            aggregated.overallScore >= 0 && aggregated.overallScore <= 100,
            `(${aggregated.overallScore})`);

        for (const key of ["skill", "keyword", "experience", "education", "semantic", "rewrite"]) {
            const b = aggregated.breakdown[key];
            assert(`breakdown.${key} exists`, !!b);
            assert(`breakdown.${key} has percentage 0-100`,
                b.percentage >= 0 && b.percentage <= 100, `(${b.percentage})`);
            assert(`breakdown.${key} has weight`, b.weight > 0, `(${b.weight})`);
            assert(`breakdown.${key} has contribution`, b.contribution >= 0);
        }

        assert("categorySummary has strong/moderate/weak",
            Array.isArray(aggregated.categorySummary.strong) &&
            Array.isArray(aggregated.categorySummary.moderate) &&
            Array.isArray(aggregated.categorySummary.weak));

        const totalWeight = Object.values(aggregated.breakdown)
            .reduce((s, b) => s + b.weight, 0);
        assert("weights sum to 1.0", Math.abs(totalWeight - 1.0) < 0.001, `(${totalWeight})`);
    } catch (e) {
        console.log(`  ${FAIL} | JD aggregator crashed: ${e.message}`);
        failed++;
    }

    try {
        section("14", "JD REPORT (Template)");
        jdReportResult = generateJDReport(jdResult, resumeResult.structured, allResults, aggregated);
        assert("jdReport exists", !!jdReportResult);
        assertShape("jdReportResult", jdReportResult, [
            "matchPercentage", "summary", "breakdown", "categorySummary",
            "flagSummary", "strongMatches", "weakAreas", "missingSkills",
            "keywordSuggestions", "rewriteRecommendations", "priorityActions", "llmEnhanced",
        ]);
        assert("matchPercentage matches aggregated", jdReportResult.matchPercentage === aggregated.overallScore,
            `(${jdReportResult.matchPercentage} vs ${aggregated.overallScore})`);
        assert("summary non-empty", jdReportResult.summary.length > 0);
        assert("strongMatches is array", Array.isArray(jdReportResult.strongMatches));
        assert("weakAreas is array", Array.isArray(jdReportResult.weakAreas));
        assert("missingSkills is array", Array.isArray(jdReportResult.missingSkills));
        assert("keywordSuggestions is array", Array.isArray(jdReportResult.keywordSuggestions));
        assert("rewriteRecommendations is array", Array.isArray(jdReportResult.rewriteRecommendations));
        assert("priorityActions is array", Array.isArray(jdReportResult.priorityActions));
        assert("flagSummary has critical/warnings/suggestions/total",
            "critical" in jdReportResult.flagSummary &&
            "warnings" in jdReportResult.flagSummary &&
            "suggestions" in jdReportResult.flagSummary &&
            "total" in jdReportResult.flagSummary);
        assert("llmEnhanced is false for template", jdReportResult.llmEnhanced === false);
    } catch (e) {
        console.log(`  ${FAIL} | JD report crashed: ${e.message}`);
        failed++;
    }

    try {
        section("15", "JD REPORT (LLM-Enhanced)");
        const llmJdReport = await generateJDReportLLM(
            jdResult, resumeResult.structured, allResults, aggregated
        );
        assert("llmJdReport exists", !!llmJdReport);
        assert("llmJdReport has summary", llmJdReport.summary?.length > 0);
        assert("llmJdReport has priorityActions", Array.isArray(llmJdReport.priorityActions));
        assert("llmJdReport has matchPercentage", typeof llmJdReport.matchPercentage === "number");
        console.log(`  INFO | LLM enhanced: ${llmJdReport.llmEnhanced}`);
    } catch (e) {
        console.log(`  ${SKIP} | JD LLM report failed (non-critical): ${e.message}`);
        skipped++;
    }

    console.log(`\n${"=".repeat(80)}`);
    const total = passed + failed + skipped;
    console.log(`RESULTS: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)`);
    console.log("=".repeat(80));

    process.exit(failed > 0 ? 1 : 0);
};

run();
