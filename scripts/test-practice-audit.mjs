import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const modulePath = path.join(scriptsDirectory, "practice-audit.mjs");
assert.ok(fs.existsSync(modulePath), "practice-audit.mjs must exist");
const { practiceDownloads, validatePractice } = await import(pathToFileURL(modulePath));

const downloads = practiceDownloads({
  downloads: [
    ["downloads/one.py", "one.py", "One"],
    ["downloads/two.py", "two.py", "Two"],
  ],
});
assert.deepEqual(downloads.map((item) => item.filename), ["one.py", "two.py"]);

const valid = validatePractice({
  steps: [{
    action: "Run one.py from the folder containing the downloaded file.",
    commands: [{ label: "PowerShell", code: "py .\\one.py" }],
    observe: "Record the printed PID and pointer width.",
  }],
  download: ["downloads/one.py", "one.py", "Download one.py"],
}, "fixture", { enforceClarity: true });
assert.deepEqual(valid.errors, []);
assert.deepEqual(valid.warnings, []);

const contextualWarning = validatePractice({
  steps: [{ action: "Run one.py from PowerShell.", observe: "Record output." }],
}, "context", { enforceClarity: false });
assert.deepEqual(contextualWarning.warnings, ["context: step 1: terminal instruction needs a command block"]);

const codeRunWarning = validatePractice({
  steps: [{ action: "Run the ctypes pointer-size code from this lesson.", observe: "Record output." }],
}, "context", { enforceClarity: false });
assert.deepEqual(codeRunWarning.warnings, [
  "context: step 1: unresolved reference",
  "context: step 1: terminal instruction needs a command block",
]);

const artifactWarning = validatePractice({
  download: ["downloads/one.py", "one.py"],
  steps: [{ action: "Run a direct check.", commands: [{ label: "PowerShell", code: "py -c \"print(1)\"" }], observe: "Record output." }],
}, "context", { enforceClarity: false });
assert.deepEqual(artifactWarning.warnings, ["context: downloaded artifact one.py is not explicitly named in a step"]);

for (const [name, practice, expectedText] of [
  ["vague reference", { steps: [{ action: "Run the script from this lesson.", observe: "Record output." }] }, "unresolved reference"],
  ["malformed command", { steps: [{ action: "Run one.py.", commands: [{ label: "", code: "" }], observe: "Record output." }] }, "command"],
  ["unsupported command field", { steps: [{ action: "Print a value.", commands: [{ label: "PowerShell", code: "Write-Output 1", shell: "pwsh" }], observe: "Record output." }] }, "unsupported"],
  ["terminal instruction without command", { steps: [{ action: "Run one.py from PowerShell.", observe: "Record output." }] }, "command block"],
  ["unnamed artifact", { download: ["downloads/one.py", "one.py"], steps: [{ action: "Run a direct check.", commands: [{ label: "PowerShell", code: "py -c \"print(1)\"" }], observe: "Record output." }] }, "one.py"],
  ["paste-hostile placeholder", { steps: [{ action: "Query a PID.", commands: [{ label: "PowerShell", code: "tool.exe <PID>" }], observe: "Record output." }] }, "placeholder"],
]) {
  const result = validatePractice(practice, name, { enforceClarity: true });
  assert.ok([...result.errors, ...result.warnings].some((message) => message.includes(expectedText)), name);
}

const root = path.resolve(scriptsDirectory, "..");
const context = { window: {} };
vm.createContext(context);
for (const filename of ["lesson-content.js", ...fs.readdirSync(root).filter((name) => /^lesson-depth-.*\.js$/.test(name)).sort()]) {
  vm.runInContext(fs.readFileSync(path.join(root, filename), "utf8"), context, { filename });
}
const lessons = Array.from(context.window.ILOVEOS_LESSONS, (lesson) => ({
  ...lesson,
  ...(context.window.ILOVEOS_LESSON_DEPTH[lesson.id] || {}),
}));
const pointerLesson = lessons.find((lesson) => lesson.id === "cpu-architecture-data");
const pointerResult = validatePractice(pointerLesson.practice, pointerLesson.id, { enforceClarity: true });
assert.deepEqual(pointerResult.errors, [], pointerResult.errors.join("\n"));
assert.match(
  pointerLesson.practice.steps[2].action,
  /one start address for your Python process that you recorded in the previous step/i,
  "the conversion step must name the start address recorded by the previous step",
);

const firstBatch = new Set(["foundations", "processes-handles", "threads-scheduling", "memory", "linking-loading"]);
const firstBatchFindings = lessons
  .filter((lesson) => firstBatch.has(lesson.module))
  .flatMap((lesson) => {
    const result = validatePractice(lesson.practice, lesson.id, { enforceClarity: true });
    return [...result.errors, ...result.warnings];
  });
assert.deepEqual(firstBatchFindings, [], firstBatchFindings.join("\n"));

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const reviewFindings = [];
const requireReview = (condition, message) => {
  if (!condition) reviewFindings.push(message);
};

const linkingPracticeText = lessons
  .filter((lesson) => lesson.module === "linking-loading")
  .map((lesson) => JSON.stringify(lesson.practice))
  .join("\n");
requireReview(
  !/\b(?:a PE viewer|a hex viewer|your PE editor|your hash\/signature verifier)\b/i.test(linkingPracticeText),
  "linking practices must name CFF Explorer, HxD, or Sigcheck instead of a generic binary tool",
);
for (const tool of ["CFF Explorer", "HxD", "Sigcheck"]) {
  requireReview(linkingPracticeText.includes(tool), `linking practices must name ${tool}`);
}

const systemCallPractice = lessonById.get("system-calls-win32").practice;
const procmonSetupIndex = systemCallPractice.steps.findIndex((step) => /Process Monitor.*Filter > Filter/i.test(step.action));
const fileOpenRunIndex = systemCallPractice.steps.findIndex((step) => step.commands?.some((command) => /file_open_trace_lab\.py/.test(command.code)));
requireReview(procmonSetupIndex >= 0 && procmonSetupIndex < fileOpenRunIndex, "Process Monitor setup must precede file_open_trace_lab.py");
requireReview(!/pywin32/i.test(systemCallPractice.expectedOutcome), "file_open_trace_lab.py stack prediction must not name pywin32");
requireReview(
  systemCallPractice.steps.some((step) => /held-open read handle/i.test(`${step.action} ${step.observe}`) && /Desired Access.*read/i.test(step.observe)),
  "system call trace must identify the successful CreateFile row for the held-open read handle",
);

const heapPractice = lessonById.get("virtualalloc-heaps-protection").practice;
const heapActions = heapPractice.steps.map((step) => step.action).join("\n");
for (const stage of ["commit page 0", "commit page 1", "make page 1 read-only"]) {
  requireReview(heapActions.includes(stage), `heap comparison must explicitly ${stage}`);
}

for (const lessonId of ["binary-hex-addresses", "sections-rvas"]) {
  const restartStep = lessonById.get(lessonId).practice.steps.find((step) => /restart/i.test(step.action));
  requireReview(restartStep?.commands?.length > 0, `${lessonId} restart must provide a complete launch block`);
  requireReview(/PID/i.test(`${restartStep?.action || ""} ${restartStep?.observe || ""}`), `${lessonId} restart must reacquire a PID`);
  requireReview(/exited|redirect/i.test(restartStep?.observe || ""), `${lessonId} restart must describe the exited or redirected launcher branch`);
}

const pageFaultCounterStep = lessonById.get("page-faults-pagefile").practice.steps.find((step) => /Performance Monitor/i.test(step.action));
for (const requiredText of ["Monitoring Tools > Performance Monitor", "Add Counters", "Process V2", "ID Process"]) {
  requireReview(pageFaultCounterStep?.action.includes(requiredText), `page-fault counter setup must name ${requiredText}`);
}
requireReview(/exited/i.test(pageFaultCounterStep?.observe || ""), "page-fault counter setup must include an exited-instance branch");

const windowsLayersCommand = lessonById.get("windows-organisation").practice.steps
  .flatMap((step) => step.commands || [])
  .find((command) => /notepad\.exe/i.test(command.code))?.code || "";
requireReview(/ArgumentList \('\"\{0\}\"' -f \$tracePath\)/.test(windowsLayersCommand), "Notepad launch must quote the owned path as one argument");

const missingTargetCommand = lessonById.get("createprocess-lifecycle").practice.steps
  .flatMap((step) => step.commands || [])
  .find((command) => /does-not-exist/i.test(command.code))?.code || "";
requireReview(/Test-Path -LiteralPath \$missingTarget/.test(missingTargetCommand), "CreateProcess failure target must be guarded absent");
requireReview(!/C:\\ILOVEOS\\does-not-exist\.exe/i.test(missingTargetCommand), "CreateProcess failure target must not use an unguarded global path");

assert.deepEqual(reviewFindings, [], reviewFindings.join("\n"));

console.log("practice audit errors: 0");
