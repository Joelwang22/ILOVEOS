import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.PROGRAMFILES_X86 && path.join(process.env.PROGRAMFILES_X86, "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"),
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browser = browserCandidates.find((candidate) => fs.existsSync(candidate));

if (!browser) {
  console.error("ERROR no supported Chromium browser found for the assessment integration test");
  process.exit(1);
}

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-assessment-integration-"));
const pagePath = path.join(tempDirectory, "index.html");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const probe = `<script>
  window.addEventListener("DOMContentLoaded", async () => {
    const checks = {};
    const waitForRoute = () => new Promise((resolve) => setTimeout(resolve, 25));
    const visit = async (hash) => {
      window.location.hash = hash;
      await waitForRoute();
    };
    try {
      await visit("#/");
      checks.homeFinalEntry = Boolean(document.querySelector('a[href="#/assessment/final"]'));

      const modules = window.ILOVEOS_DATA.modules;
      const lessons = window.ILOVEOS_LESSONS;
      checks.moduleReviewRows = true;
      checks.lastLessonReviewLinks = true;
      for (const module of modules) {
        await visit("#/module/" + module.id);
        checks.moduleReviewRows &&= Boolean(document.querySelector('.outline-item[href="#/review/' + module.id + '"]'));
        const moduleLessons = lessons.filter((lesson) => lesson.module === module.id);
        await visit("#/lesson/" + moduleLessons.at(-1).id);
        checks.lastLessonReviewLinks &&= Boolean(document.querySelector('.lesson-footer-nav a[href="#/review/' + module.id + '"]'));
      }

      await visit("#/review/foundations");
      checks.reviewRoute = document.querySelector("h1")?.textContent === "OS foundations review"
        && document.querySelectorAll(".assessment-stack fieldset.assessment-activity").length === 5
        && !document.querySelector(".assessment-activity.unavailable");
      checks.reviewNextModule = Boolean(document.querySelector('.assessment-next a[href="#/module/processes-handles"]'));

      await visit("#/review/hooking-injection");
      checks.lastReviewNextFinal = Boolean(document.querySelector('.assessment-next a[href="#/assessment/final"]'));

      await visit("#/review/not-a-module");
      checks.unknownReview = document.querySelector("h1")?.textContent === "Review unavailable" && Boolean(document.querySelector('a[href="#/"]'));

      await visit("#/assessment/final");
      checks.finalRoute = document.querySelector("h1")?.textContent === "Final operating systems assessment"
        && document.querySelectorAll(".assessment-stack fieldset.assessment-activity").length === 4
        && document.querySelectorAll(".assessment-case-link").length === 5
        && !document.querySelector(".assessment-activity.unavailable")
        && !document.querySelector(".assessment-practical");

      await visit("#/");
      document.querySelector("#search-trigger").click();
      const search = document.querySelector("#search-input");
      search.value = "native contract translation";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      checks.reviewSearch = Boolean(document.querySelector('#search-results a[href="#/review/foundations"]'));
      search.value = "ERROR_PARTIAL_COPY";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      checks.finalSearch = Boolean(document.querySelector('#search-results a[href="#/assessment/final"]'));
      document.querySelector("#search-dialog").close();

      await visit("#/lesson/" + lessons[0].id);
      const quiz = document.querySelector(".quiz-card");
      const correct = quiz.querySelector('[data-option="' + quiz.dataset.answer + '"]');
      const wrong = [...quiz.querySelectorAll(".quiz-option")].find((option) => option !== correct);
      wrong.click();
      checks.lessonWrongRetry = wrong.disabled && !correct.disabled && quiz.querySelector(".quiz-feedback").classList.contains("visible");
      correct.click();
      checks.lessonCorrectLock = [...quiz.querySelectorAll(".quiz-option")].every((option) => option.disabled) && correct.classList.contains("correct");
    } catch (error) {
      checks.exception = error.message;
    }
    document.body.innerHTML = '<pre id="integration-result">' + JSON.stringify(checks) + '</pre>';
  });
<\/script>`;

const source = fs.readFileSync(path.join(root, "index.html"), "utf8")
  .replace("<head>", `<head><base href="${baseUrl}">`)
  .replace("</body>", `${probe}</body>`);

try {
  fs.writeFileSync(pagePath, source);
  const run = spawnSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--virtual-time-budget=5000",
    `--user-data-dir=${profilePath}`,
    "--dump-dom",
    `${pathToFileURL(pagePath).href}#/`,
  ], { encoding: "utf8", timeout: 45000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="integration-result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return integration results (exit ${run.status}): ${run.stderr.trim()}`);
  const results = JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  console.log(JSON.stringify(results));
  for (const [name, passed] of Object.entries(results)) {
    if (passed !== true) {
      console.error(`ERROR ${name}: ${String(passed)}`);
      process.exitCode = 1;
    }
  }
} finally {
  if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) fs.rmSync(tempDirectory, { recursive: true, force: true });
}
