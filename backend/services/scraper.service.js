import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runScraper(topic, limit = 5) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "scripts", "scrape_questions.py");
    console.log(`[Scraper] Invoking python scraper at ${scriptPath} for topic: "${topic}"`);

    const candidates = process.env.PYTHON_BIN
      ? [{ command: process.env.PYTHON_BIN, prefixArgs: [] }]
      : process.platform === "win32"
        ? [
            { command: "python", prefixArgs: [] },
            { command: "py", prefixArgs: ["-3"] },
            { command: "python3", prefixArgs: [] },
          ]
        : [
            { command: "python3", prefixArgs: [] },
            { command: "python", prefixArgs: [] },
          ];

    let candidateIndex = 0;
    let settled = false;
    let timeoutId = null;
    let py = null;

    const SCRAPER_TIMEOUT_MS = 12000;

    const finish = (questions) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);
      resolve(questions);
    };

    const tryNext = () => {
      if (candidateIndex >= candidates.length) {
        console.error("[Scraper] No working Python command found for web scraping.");
        return finish([]);
      }

      const candidate = candidates[candidateIndex++];
      const args = [...candidate.prefixArgs, scriptPath, "--topic", topic, "--limit", String(limit)];
      let stdoutData = "";
      let stderrData = "";

      try {
        py = spawn(candidate.command, args);
      } catch (err) {
        console.warn(`[Scraper] Could not launch ${candidate.command}: ${err.message}`);
        return tryNext();
      }

      timeoutId = setTimeout(() => {
        console.warn(`[Scraper] Python scraper timed out after ${SCRAPER_TIMEOUT_MS}ms. Terminating process...`);
        try {
          py.kill("SIGKILL");
        } catch {}
        finish([]);
      }, SCRAPER_TIMEOUT_MS);

      py.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      py.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      py.on("close", (code) => {
        if (settled) return;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;

        if (stderrData) {
          console.warn(`[Scraper] ${candidate.command} stderr: ${stderrData.trim()}`);
        }

        if (code !== 0) {
          console.warn(`[Scraper] ${candidate.command} exited with code ${code}; trying next Python command.`);
          return tryNext();
        }

        try {
          const questions = JSON.parse(stdoutData.trim() || "[]");
          console.log(`[Scraper] Successfully scraped ${questions.length} questions`);
          finish(questions);
        } catch (err) {
          console.error("[Scraper] Failed to parse JSON output from python script:", err);
          finish([]);
        }
      });

      py.on("error", (err) => {
        if (settled) return;
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = null;
        console.warn(`[Scraper] Failed to start ${candidate.command}: ${err.message}`);
        tryNext();
      });
    };

    tryNext();
  });
}
