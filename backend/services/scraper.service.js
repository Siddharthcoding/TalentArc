import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runScraper(topic, limit = 5) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "scripts", "scrape_questions.py");
    console.log(`[Scraper] Invoking python scraper at ${scriptPath} for topic: "${topic}"`);

    // Standard python spawning
    const py = spawn("python", [scriptPath, "--topic", topic, "--limit", String(limit)]);

    const SCRAPER_TIMEOUT_MS = 12000;
    const timeoutId = setTimeout(() => {
      console.warn(`[Scraper] Python scraper timed out after ${SCRAPER_TIMEOUT_MS}ms. Terminating process...`);
      try {
        py.kill("SIGKILL");
      } catch (err) {
        console.error("[Scraper] Error killing python process:", err);
      }
      resolve([]);
    }, SCRAPER_TIMEOUT_MS);

    let stdoutData = "";
    let stderrData = "";

    py.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    py.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    py.on("close", (code) => {
      clearTimeout(timeoutId);
      if (stderrData) {
        console.warn(`[Scraper] Python stderr: ${stderrData.trim()}`);
      }

      if (code !== 0) {
        console.error(`[Scraper] Python process exited with code ${code}`);
        // We resolve with empty array rather than rejecting so the calling service can fallback to LLM
        return resolve([]);
      }

      try {
        const questions = JSON.parse(stdoutData.trim() || "[]");
        console.log(`[Scraper] Successfully scraped ${questions.length} questions`);
        resolve(questions);
      } catch (err) {
        console.error("[Scraper] Failed to parse JSON output from python script:", err);
        resolve([]);
      }
    });

    py.on("error", (err) => {
      clearTimeout(timeoutId);
      console.error("[Scraper] Failed to start python process:", err);
      resolve([]);
    });
  });
}
