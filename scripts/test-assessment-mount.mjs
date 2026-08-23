import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const viewSource = fs.readFileSync(path.join(root, "assessment-view.js"), "utf8").replaceAll("</script", "<\\/script");
const stylesSource = fs.readFileSync(path.join(root, "styles.css"), "utf8").replaceAll("</style", "<\\/style");
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
  console.error("ERROR no supported Chromium browser found for the assessment mount test");
  process.exit(1);
}

const page = {
  title: "Interaction fixture",
  summary: "Browser-level assessment behavior.",
  questions: [
    {
      id: "single",
      kind: "single",
      dimension: "contract",
      skill: "selection",
      prompt: "Choose the correct option.",
      options: ["Wrong", "Correct", "Also wrong"],
      answer: 1,
      explanation: "The second option is correct."
    },
    {
      id: "multiple",
      kind: "multiple",
      dimension: "ownership",
      skill: "selection",
      prompt: "Select both owned values.",
      options: ["Handle A", "Value", "Handle B"],
      answers: [0, 2],
      explanation: "Both handles are owned."
    },
    {
      id: "ordering",
      kind: "ordering",
      dimension: "lifecycle",
      skill: "ordering",
      prompt: "Put the lifecycle in order.",
      items: [
        { id: "call", label: "Call" },
        { id: "open", label: "Open" },
        { id: "close", label: "Close" }
      ],
      answer: ["open", "call", "close"],
      explanation: "Open, call, then close."
    }
  ],
  practical: {
    title: "Practical fixture",
    scenario: "Explain a controlled observation.",
    prompts: [{ id: "notes", label: "Notes", prompt: "Record your reasoning." }],
    evidenceExpectations: ["Account for cleanup."],
    modelReasoning: [{ title: "Model", body: "Preserve the result and clean up." }]
  }
};

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-assessment-test-"));
const pagePath = path.join(tempDirectory, "assessment.html");
const profilePath = path.join(tempDirectory, "profile");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${stylesSource}</style></head><body>
  <main id="app"></main>
  <script>${viewSource}</script>
  <script>
    const checks = {};
    (async () => {
    try {
      const page = ${JSON.stringify(page)};
      const app = document.querySelector("#app");
      const mounted = window.ILOVEOS_ASSESSMENT_VIEW.mount(app, page, { confirmReset: () => true });
      const originalAnnouncer = app.querySelector("[data-assessment-announcer]");
      const announcerStyle = originalAnnouncer ? getComputedStyle(originalAnnouncer) : null;
      checks.announcerVisuallyHidden = announcerStyle?.position === "absolute" && parseFloat(announcerStyle.width) <= 1 && parseFloat(announcerStyle.height) <= 1;

      app.querySelector('[data-activity="single"][data-option="0"]').click();
      checks.wrongSingleFocus = document.activeElement?.matches('[data-activity="single"][data-option="1"]');
      const wrongSingleStyle = getComputedStyle(app.querySelector('[data-activity="single"][data-option="0"]'));
      checks.incorrectVisualState = wrongSingleStyle.borderColor === "rgba(248, 113, 113, 0.5)" && wrongSingleStyle.color === "rgb(254, 202, 202)";
      checks.announcerPersistent = Boolean(originalAnnouncer && originalAnnouncer.isSameNode(app.querySelector("[data-assessment-announcer]")));
      checks.wrongSingleAnnounced = app.querySelector("[data-assessment-announcer]")?.textContent.includes("Try another option") || false;

      app.querySelector('[data-activity="single"][data-option="1"]').click();
      checks.completionFocus = document.activeElement?.matches('[data-assessment-feedback="single"]');
      const completionFocusStyle = getComputedStyle(document.activeElement);
      checks.completionFocusVisible = completionFocusStyle.boxShadow.includes("rgb(167, 139, 250)");
      const correctSingleStyle = getComputedStyle(app.querySelector('[data-activity="single"][data-option="1"]'));
      checks.correctVisualState = correctSingleStyle.borderColor === "rgba(84, 214, 155, 0.5)" && correctSingleStyle.color === "rgb(198, 246, 223)";
      const completedFeedback = document.activeElement;
      app.querySelector('[data-assessment-action="reset"]').focus();
      await new Promise((resolve) => setTimeout(resolve, 0));
      checks.completionBlurMoved = document.activeElement?.matches('[data-assessment-action="reset"]');
      checks.completionMarkerClears = !completedFeedback.hasAttribute("data-assessment-focus-target");

      app.querySelector('[data-assessment-action="check-multiple"]').click();
      checks.emptyMultipleCheckFocus = document.activeElement?.matches('[data-assessment-action="check-multiple"]');
      const checkbox = app.querySelector('[data-activity="multiple"][data-option="0"]');
      checkbox.click();
      const currentCheckbox = app.querySelector('[data-activity="multiple"][data-option="0"]');
      checks.checkboxRedraw = currentCheckbox.checked && currentCheckbox.closest("label").classList.contains("selected");
      checks.checkboxFocus = document.activeElement === currentCheckbox;
      checks.checkboxClearsFeedback = !app.querySelector('[data-assessment-feedback="multiple"]').textContent.trim();
      app.querySelector('[data-assessment-action="check-multiple"]').click();
      checks.incorrectMultipleCheckFocus = document.activeElement?.matches('[data-assessment-action="check-multiple"]');
      app.querySelector('[data-activity="multiple"][data-option="2"]').click();
      app.querySelector('[data-assessment-action="check-multiple"]').click();
      const completedMultipleCheck = app.querySelector('[data-assessment-action="check-multiple"]');
      checks.completedCheckDisabledStyle = completedMultipleCheck.disabled && parseFloat(getComputedStyle(completedMultipleCheck).opacity) < 1;

      app.querySelector('[data-assessment-action="check-ordering"]').click();
      checks.incorrectOrderingCheckFocus = document.activeElement?.matches('[data-assessment-action="check-ordering"]');
      app.querySelector('[data-activity="ordering"][data-item="open"][data-direction="up"]').click();
      checks.orderingFocus = document.activeElement?.dataset.item === "open" && document.activeElement?.dataset.assessmentAction === "move";
      document.activeElement?.click();
      checks.repeatedOrderingFocus = document.activeElement?.dataset.item === "open" && document.activeElement?.dataset.assessmentAction === "move";

      const notes = app.querySelector('[data-assessment-action="note"]');
      notes.focus();
      notes.value = "Page-local reasoning";
      notes.dispatchEvent(new Event("input", { bubbles: true }));
      checks.noteHeld = mounted.getState().notes.notes === "Page-local reasoning" && document.activeElement !== document.body;

      app.querySelector('[data-assessment-action="reveal-practical"]').click();
      checks.practicalFocus = document.activeElement?.matches("[data-assessment-model]");
      const practicalFocusStyle = getComputedStyle(document.activeElement);
      checks.practicalFocusVisible = practicalFocusStyle.boxShadow.includes("rgb(167, 139, 250)");
      checks.practicalAnnounced = app.querySelector("[data-assessment-announcer]")?.textContent.includes("Model reasoning revealed") || false;
      const completedReveal = app.querySelector('[data-assessment-action="reveal-practical"]');
      checks.completedRevealDisabledStyle = completedReveal.disabled && parseFloat(getComputedStyle(completedReveal).opacity) < 1;
      const focusedModel = document.activeElement;
      app.querySelector('[data-assessment-action="reset"]').focus();
      await new Promise((resolve) => setTimeout(resolve, 0));
      checks.practicalBlurMoved = document.activeElement?.matches('[data-assessment-action="reset"]');
      checks.practicalMarkerClears = !focusedModel.hasAttribute("data-assessment-focus-target");

      app.querySelector('[data-assessment-action="reset"]').click();
      checks.resetFocus = document.activeElement?.matches('[data-assessment-action="reset"]');
      checks.resetClearsState = mounted.getState().notes.notes === undefined && !mounted.getState().practicalReviewed;
    } catch (error) {
      checks.exception = error.message;
    }
    document.body.innerHTML = '<pre id="result">' + JSON.stringify(checks) + '</pre>';
    })();
  <\/script>
</body></html>`;

try {
  fs.writeFileSync(pagePath, html);
  const run = spawnSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--virtual-time-budget=1000",
    `--user-data-dir=${profilePath}`,
    "--dump-dom",
    pathToFileURL(pagePath).href,
  ], { encoding: "utf8", timeout: 30000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return assessment results (exit ${run.status}): ${run.stderr.trim()}`);
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
