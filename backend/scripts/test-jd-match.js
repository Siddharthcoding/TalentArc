import processResume from "../services/parser.service.js";
import { processJDText } from "../services/jdParser.service.js";
import { runJDMatching, runAsyncMatching } from "../services/jdMatching.service.js";
import aggregateMatchScores from "../services/jdAggregator.service.js";
import { generateJDReport } from "../services/jdReport.service.js";

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

const RESUME_PATH = "uploads/Siddharth's Resume.pdf";

const runTest = async () => {
    console.log("=".repeat(70));
    console.log("JD MATCHING ENGINE — PHASE 2 & 3 TEST");
    console.log("=".repeat(70));

    try {
        console.log("\n[1/5] Parsing resume...");
        const resumeResult = await processResume(RESUME_PATH);
        console.log(`  Resume: ${resumeResult.fileName}`);
        console.log(`  Skills: ${resumeResult.structured.skills.all.length}`);
        console.log(`  Experience entries: ${resumeResult.structured.experience.length}`);
        console.log(`  Education entries: ${resumeResult.structured.education.length}`);

        console.log("\n[2/5] Parsing JD...");
        const jdResult = processJDText(JD_STRUCTURED);
        console.log(`  Company: ${jdResult.company}`);
        console.log(`  Required Skills: ${jdResult.requiredSkills.length}`);
        console.log(`  Responsibilities: ${jdResult.responsibilities.length}`);

        console.log("\n[3/5] Running sync matchers (skill, keyword, experience, education)...");
        const syncResults = runJDMatching(jdResult, resumeResult.structured, resumeResult.normalizedText);

        console.log("\n  --- SKILL MATCHER ---");
        console.log(`  Score: ${syncResults.skill.score}/100`);
        console.log(`  Matched Required: ${syncResults.skill.details.matchedRequired.length}/${syncResults.skill.details.totalRequired}`);
        console.log(`  Missing Required: ${syncResults.skill.details.missingRequired.length ? syncResults.skill.details.missingRequired.join(", ") : "(none)"}`);
        console.log(`  Coverage: ${syncResults.skill.details.coveragePercentage}%`);

        console.log("\n  --- KEYWORD MATCHER ---");
        console.log(`  Score: ${syncResults.keyword.score}/100`);
        console.log(`  Overlapping Keywords: ${syncResults.keyword.details.overlappingKeywords.length}/${syncResults.keyword.details.totalJdKeywords}`);
        console.log(`  Missing Keywords: ${syncResults.keyword.details.missingKeywords.slice(0, 5).join(", ") || "(none)"}`);
        console.log(`  Keyword Density: ${syncResults.keyword.details.keywordDensity}%`);

        console.log("\n  --- EXPERIENCE MATCHER ---");
        console.log(`  Score: ${syncResults.experience.score}/100`);
        console.log(`  Years: ${syncResults.experience.details.totalYearsOfExperience}y (required: ${syncResults.experience.details.yearsRequired || "N/A"}y)`);
        console.log(`  Years Met: ${syncResults.experience.details.yearsMet}`);
        console.log(`  Domain Relevance: ${syncResults.experience.details.domainRelevance}`);
        console.log(`  Matched Technologies: ${syncResults.experience.details.matchedTechnologies.join(", ") || "(none)"}`);

        console.log("\n  --- EDUCATION MATCHER ---");
        console.log(`  Score: ${syncResults.education.score}/100`);
        console.log(`  Degree Met: ${syncResults.education.details.degreeRequirementMet}`);
        console.log(`  Field Met: ${syncResults.education.details.fieldRequirementMet}`);
        console.log(`  Degree: ${syncResults.education.details.matchedDegree || "(none)"}`);

        console.log("\n[4/5] Running async matchers (semantic, rewrite)...");
        const asyncResults = await runAsyncMatching(
            jdResult,
            resumeResult.structured,
            resumeResult.normalizedText,
            syncResults
        );

        console.log("\n  --- SEMANTIC MATCHER ---");
        console.log(`  Score: ${asyncResults.semantic.score}/100`);
        console.log(`  Method: ${asyncResults.semantic.details.methodUsed}`);
        console.log(`  Overall Similarity: ${asyncResults.semantic.details.overallSimilarity}`);
        console.log(`  Project Relevance: ${asyncResults.semantic.details.projectRelevance}%`);
        console.log(`  Responsibility Matches: ${asyncResults.semantic.details.responsibilityMatches.length}`);
        if (asyncResults.semantic.details.responsibilityMatches.length > 0) {
            const top = asyncResults.semantic.details.responsibilityMatches[0];
            console.log(`  Best Match: ${top.similarity} — "${top.jdResponsibility.slice(0, 60)}..."`);
        }

        console.log("\n  --- REWRITE MATCHER ---");
        console.log(`  Score: ${asyncResults.rewrite.score}/100`);
        console.log(`  LLM Enhanced: ${asyncResults.rewrite.details.llmEnhanced}`);
        console.log(`  Suggestions: ${asyncResults.rewrite.details.suggestions.length}`);
        if (asyncResults.rewrite.details.suggestions.length > 0) {
            const s = asyncResults.rewrite.details.suggestions[0];
            console.log(`  Top Suggestion: ${s.suggested || s.reason}`);
        }
        console.log(`  Keyword Injections: ${asyncResults.rewrite.details.keywordInjections.length}`);

        console.log("\n[5/5] Testing with raw/unstructured JD...");
        const JD_RAW = `
We are looking for a Senior Frontend Engineer to join our team at DataFlow Analytics. 
You will build responsive web applications using React and TypeScript. 
You need 4+ years of experience with frontend development. 
Must have strong skills in React, TypeScript, CSS, and HTML. 
Experience with Next.js and Tailwind CSS is required. 
Knowledge of Node.js and GraphQL is a plus. 
A Bachelor's degree in Computer Science or equivalent experience is required. 
We use Docker and AWS for our infrastructure. 
`;
        const rawJd = processJDText(JD_RAW);
        const rawSync = runJDMatching(rawJd, resumeResult.structured, resumeResult.normalizedText);
        console.log(`  JD Company: ${rawJd.company}`);
        console.log(`  Skill Score: ${rawSync.skill.score}/100 — Matched: ${rawSync.skill.details.matchedRequired.length}/${rawSync.skill.details.totalRequired}`);
        console.log(`  Keyword Score: ${rawSync.keyword.score}/100 — Overlap: ${rawSync.keyword.details.overlappingKeywords.length}/${rawSync.keyword.details.totalJdKeywords}`);
        console.log(`  Experience Score: ${rawSync.experience.score}/100`);
        console.log(`  Education Score: ${rawSync.education.score}/100`);

        console.log("\n[6/5] Running Phase 3 — Aggregation & Reporting...");
        const allResults = { ...syncResults, ...asyncResults };
        const aggregated = aggregateMatchScores(allResults);
        console.log(`\n  --- MATCH SCORE AGGREGATOR (Structured JD) ---`);
        console.log(`  Overall Score: ${aggregated.overallScore}/100`);
        for (const [key, data] of Object.entries(aggregated.breakdown)) {
            console.log(`  ${key}: ${data.percentage}% (weight: ${data.weight}, contribution: ${data.contribution})`);
        }
        console.log(`  Strong: ${aggregated.categorySummary.strong.join(", ") || "(none)"}`);
        console.log(`  Moderate: ${aggregated.categorySummary.moderate.join(", ") || "(none)"}`);
        console.log(`  Weak: ${aggregated.categorySummary.weak.join(", ") || "(none)"}`);

        const report = generateJDReport(jdResult, resumeResult.structured, allResults, aggregated);
        console.log(`\n  --- COMBINED REPORT ---`);
        console.log(`  Match %: ${report.matchPercentage}%`);
        console.log(`  Summary: ${report.summary}`);
        console.log(`  Strong: ${report.strongMatches.join(", ") || "(none)"}`);
        console.log(`  Weak: ${report.weakAreas.join(", ") || "(none)"}`);
        console.log(`  Missing Skills: ${report.missingSkills.slice(0, 5).join(", ") || "(none)"}`);
        console.log(`  Keyword Suggestions: ${report.keywordSuggestions.length}`);
        console.log(`  Rewrite Recommendations: ${report.rewriteRecommendations.length}`);
        console.log(`  Priority Actions (${report.priorityActions.length}):`);
        for (const a of report.priorityActions) {
            console.log(`    - ${a}`);
        }
        console.log(`  Flags: ${report.flagSummary.total} (critical: ${report.flagSummary.critical.length}, warnings: ${report.flagSummary.warnings.length}, suggestions: ${report.flagSummary.suggestions.length})`);
        console.log(`  LLM Enhanced: ${report.llmEnhanced}`);

        console.log(`\n${"=".repeat(70)}`);
        console.log("Phase 2 & 3 tests complete.");
        console.log("=".repeat(70));
    } catch (err) {
        console.error(`\nFATAL ERROR: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    }
};

runTest();
