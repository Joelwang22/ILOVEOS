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

console.log("practice audit errors: 0");
