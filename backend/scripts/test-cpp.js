import "dotenv/config";
import { createAssessment } from "../services/assessment.service.js";
import pool from "../db/pool.js";

async function run() {
  try {
    const userRes = await pool.query("SELECT id FROM users LIMIT 1");
    if (userRes.rows.length === 0) {
      console.error("No test user found in db. Run migrations first.");
      process.exit(1);
    }
    const userId = userRes.rows[0].id;
    console.log(`Generating Rust assessment for user ${userId}...`);
    
    const assessment = await createAssessment(userId, {
      inputType: "skill",
      inputValue: "Rust",
      difficulty: "Medium",
      questionCount: 5,
      durationSeconds: 300,
    });
    
    console.log("SUCCESS! Created Assessment:", assessment);
    console.log("Questions list:");
    assessment.questions.forEach((q, idx) => {
      console.log(`${idx + 1}. ${q.question_text}`);
      q.options.forEach((opt, oIdx) => console.log(`   [${oIdx}] ${opt}`));
    });
  } catch (err) {
    console.error("FAILED:", err);
  } finally {
    pool.end();
  }
}

run();
