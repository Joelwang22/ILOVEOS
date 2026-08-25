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
  console.error("ERROR no supported Chromium browser found for the practice checkpoint test");
  process.exit(1);
}

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-practice-checkpoint-"));
const pagePath = path.join(tempDirectory, "index.html");
const fixturePath = path.join(tempDirectory, "checkpoint-fixture.js");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;

const fixture = `
  window.ILOVEOS_LESSON_DEPTH["cpu-architecture-data"].practice.checkpoints = [
    {
      afterStep: 1,
      type: "short",
      prompt: "Complete the fixed operating-system label: [____]",
      answer: "OS",
      acceptedAnswers: ["operating system"],
      feedback: "The deterministic fixture label is OS."
    },
    {
      afterStep: 2,
      type: "choice",
      prompt: "Which fixed wait result did the fixture expose?",
      options: ["WAIT_OBJECT_0", "WAIT_TIMEOUT", "WAIT_FAILED"],
      answerIndex: 1,
      feedback: "The deterministic fixture result is WAIT_TIMEOUT."
    }
  ];
`;

const probe = `<script>
  window.addEventListener("DOMContentLoaded", async () => {
    const checks = {};
    const waitForRoute = () => new Promise((resolve) => setTimeout(resolve, 35));
    const visible = (element) => Boolean(element && element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");
    try {
      window.location.hash = "#/lesson/cpu-architecture-data";
      await waitForRoute();

      let checkpoints = Array.from(document.querySelectorAll("[data-practice-checkpoint]"));
      const shortCheckpoint = checkpoints.find((item) => item.dataset.checkpointType === "short");
      const choiceCheckpoint = checkpoints.find((item) => item.dataset.checkpointType === "choice");
      const practiceSteps = Array.from(document.querySelectorAll(".practice-steps > li"));
      checks.shortAfterStep = practiceSteps[0]?.querySelector("[data-practice-checkpoint]") === shortCheckpoint;
      checks.choiceAfterStep = practiceSteps[1]?.querySelector("[data-practice-checkpoint]") === choiceCheckpoint;
      checks.shortPromptVisible = visible(shortCheckpoint?.querySelector("[data-checkpoint-prompt]"));
      checks.choicePromptVisible = visible(choiceCheckpoint?.querySelector("legend[data-checkpoint-prompt]"));

      const shortInput = shortCheckpoint?.querySelector("[data-checkpoint-input]");
      const shortButton = shortCheckpoint?.querySelector("[data-checkpoint-check]");
      const shortFeedback = shortCheckpoint?.querySelector("[data-checkpoint-feedback]");
      const choiceOptions = Array.from(choiceCheckpoint?.querySelectorAll("[data-checkpoint-option]") || []);
      const choiceButton = choiceCheckpoint?.querySelector("[data-checkpoint-check]");
      const choiceFeedback = choiceCheckpoint?.querySelector("[data-checkpoint-feedback]");
      checks.shortAccessibleControl = shortInput?.labels?.length > 0;
      checks.choiceAccessibleControls = choiceOptions.length === 3
        && choiceOptions.every((option) => option.closest("label"))
        && Boolean(choiceCheckpoint?.querySelector("fieldset > legend"));
      checks.checkButtonsVisible = visible(shortButton) && visible(choiceButton)
        && shortButton?.textContent.trim() === "Check answer"
        && choiceButton?.textContent.trim() === "Check answer";
      checks.politeFeedbackRegions = shortFeedback?.getAttribute("role") === "status"
        && shortFeedback?.getAttribute("aria-live") === "polite"
        && choiceFeedback?.getAttribute("role") === "status"
        && choiceFeedback?.getAttribute("aria-live") === "polite";

      const checkShort = async (value) => {
        shortInput.value = value;
        shortInput.dispatchEvent(new Event("input", { bubbles: true }));
        shortButton.click();
        await waitForRoute();
        return shortFeedback.textContent;
      };
      checks.shortExactPasses = (await checkShort("OS")).includes("Correct");
      checks.shortTrimmedCasePasses = (await checkShort(" os ")).includes("Correct");
      checks.shortAliasPasses = (await checkShort("operating system")).includes("Correct");
      const wrongFeedback = await checkShort("DOS");
      checks.shortWrongCorrective = wrongFeedback.includes("Try again") && shortInput.value === "DOS";
      checks.shortWrongEditable = !shortInput.disabled && !shortInput.readOnly;

      choiceOptions[1].checked = true;
      choiceOptions[1].dispatchEvent(new Event("change", { bubbles: true }));
      choiceButton.click();
      await waitForRoute();
      checks.correctChoicePasses = choiceFeedback.textContent.includes("Correct");

      window.location.hash = "#/lesson/system-calls-win32";
      await waitForRoute();
      window.location.hash = "#/lesson/cpu-architecture-data";
      await waitForRoute();
      checkpoints = Array.from(document.querySelectorAll("[data-practice-checkpoint]"));
      const freshShort = checkpoints.find((item) => item.dataset.checkpointType === "short");
      const freshChoice = checkpoints.find((item) => item.dataset.checkpointType === "choice");
      checks.navigationResetsShort = freshShort?.querySelector("[data-checkpoint-input]")?.value === ""
        && freshShort?.querySelector("[data-checkpoint-feedback]")?.textContent === "";
      checks.navigationResetsChoice = !Array.from(freshChoice?.querySelectorAll("[data-checkpoint-option]") || []).some((option) => option.checked)
        && freshChoice?.querySelector("[data-checkpoint-feedback]")?.textContent === "";
    } catch (error) {
      checks.exception = error.message;
    }
    document.body.innerHTML = '<pre id="practice-checkpoint-result">' + JSON.stringify(checks) + '</pre>';
  });
<\/script>`;

const appTag = '<script src="app.js?v=windows-api-families-8" defer></script>';
const source = fs.readFileSync(path.join(root, "index.html"), "utf8")
  .replace("<head>", `<head><base href="${baseUrl}">`)
  .replace(appTag, `<script src="${pathToFileURL(fixturePath).href}" defer></script>\n    ${appTag}`)
  .replace("</body>", `${probe}</body>`);

try {
  fs.writeFileSync(fixturePath, fixture);
  fs.writeFileSync(pagePath, source);
  const run = spawnSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--virtual-time-budget=6000",
    `--user-data-dir=${profilePath}`,
    "--dump-dom",
    `${pathToFileURL(pagePath).href}#/lesson/cpu-architecture-data`,
  ], { encoding: "utf8", timeout: 45000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="practice-checkpoint-result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return practice checkpoint results (exit ${run.status}): ${run.stderr.trim()}`);
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
