import "dotenv/config";
import migrate from "../db/migrate.js";
import { createAssessment, submitAssessment, getAssessmentReport, incrementFullscreenViolations } from "../services/assessment.service.js";
import pool from "../db/pool.js";

async function runTest() {
  console.log("=== STARTING MOCK ASSESSMENT SERVICE TEST ===");

  try {
    // 1. Run migrations
    console.log("Running migrations...");
    await migrate();

    // 2. Fetch/create a mock user ID for testing
    let testUserId = null;
    const userRes = await pool.query("SELECT id FROM users LIMIT 1");
    if (userRes.rows.length > 0) {
      testUserId = userRes.rows[0].id;
      console.log(`Found test user: ${testUserId}`);
    } else {
      // Create a test user
      const insertUser = await pool.query(
        `INSERT INTO users (google_id, email, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (google_id) DO UPDATE SET display_name = EXCLUDED.display_name
         RETURNING id`,
        ["test-google-id-12345", "testuser@gmail.com", "Test User"]
      );
      testUserId = insertUser.rows[0].id;
      console.log(`Created test user: ${testUserId}`);
    }

    // 3. Generate assessment
    console.log("\n--- Testing createAssessment ---");
    const assessment = await createAssessment(testUserId, {
      inputType: "skill",
      inputValue: "JavaScript",
      difficulty: "Easy",
      questionCount: 3,
      durationSeconds: 300,
    });

    console.log("Assessment created successfully!");
    console.log(`ID: ${assessment.id}`);
    console.log(`Topic: ${assessment.topic}`);
    console.log(`Censored Questions Count: ${assessment.questions.length}`);
    console.log("Sample question (censored):", assessment.questions[0]);

    if (assessment.questions[0].correct_option !== undefined) {
      throw new Error("Security check failed: correct_option is exposed during test!");
    }
    if (assessment.questions[0].explanation !== undefined) {
      throw new Error("Security check failed: explanation is exposed during test!");
    }
    console.log("✓ Security Check passed: answers and explanations censored.");

    // 4. Test fullscreen violations
    console.log("\n--- Testing incrementFullscreenViolations ---");
    const v1 = await incrementFullscreenViolations(assessment.id, testUserId);
    console.log(`Violation 1 updated. Status: ${v1.status}, Violations count: ${v1.fullscreenViolations}`);
    if (v1.fullscreenViolations !== 1 || v1.status !== "active") {
      throw new Error("Fullscreen violation 1 failed to record correctly.");
    }

    const v2 = await incrementFullscreenViolations(assessment.id, testUserId);
    console.log(`Violation 2 updated (should auto-terminate). Status: ${v2.status}, Violations count: ${v2.fullscreenViolations}`);
    if (v2.status !== "terminated" || v2.score !== 0) {
      throw new Error("Fullscreen violation 2 failed to auto-terminate assessment.");
    }
    console.log("✓ Fullscreen auto-termination logic working.");

    // Create a new assessment to test submission and scoring
    console.log("\n--- Testing createAssessment (Second Run for Scoring) ---");
    const assessment2 = await createAssessment(testUserId, {
      inputType: "skill",
      inputValue: "React",
      difficulty: "Medium",
      questionCount: 2,
      durationSeconds: 300,
    });

    // To score it, let's fetch the actual correct answers from the DB since we need to submit correct answers
    const dbAssessment = await pool.query("SELECT questions FROM assessments WHERE id = $1", [assessment2.id]);
    const actualQuestions = dbAssessment.rows[0].questions;
    console.log(`React actual questions count: ${actualQuestions.length}`);

    // Let's answer the first question correctly and the second question incorrectly (or leave empty)
    const answers = [
      {
        questionId: actualQuestions[0].id,
        selectedOption: actualQuestions[0].correct_option, // correct
      },
      {
        questionId: actualQuestions[1].id,
        selectedOption: (actualQuestions[1].correct_option + 1) % 4, // incorrect
      }
    ];

    console.log("\n--- Testing submitAssessment ---");
    const submissionResult = await submitAssessment(assessment2.id, testUserId, answers);
    console.log("Submission result score:", submissionResult.score, "/", submissionResult.maxScore);
    console.log("Feedback summary:", submissionResult.report.feedback);
    console.log("Weak topics:", submissionResult.report.weakTopics);

    if (submissionResult.score !== 1) {
      throw new Error(`Scoring calculation incorrect. Expected 1, got ${submissionResult.score}`);
    }
    console.log("✓ Scoring calculation correct.");

    // 5. Test retrieve report
    console.log("\n--- Testing getAssessmentReport (Completed) ---");
    const report = await getAssessmentReport(assessment2.id, testUserId);
    console.log("Report fetched successfully. Status:", report.status);
    console.log("Explanation for question 1 (should be uncensored now):", report.report.answers[0].explanation);
    if (!report.report.answers[0].explanation) {
      throw new Error("Completed report is missing explanations!");
    }
    console.log("✓ Report successfully populated.");

    console.log("\n=== ALL TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

runTest();
