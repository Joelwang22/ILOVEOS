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
  steps: [
    {
      action: "Run one.py from the folder containing the downloaded file.",
      commands: [{ label: "PowerShell", code: "py .\\one.py" }],
      observe: "The program prints the fixed operating-system label.",
    },
    {
      action: "Run the fixed timeout mode in one.py.",
      commands: [{ label: "PowerShell", code: "py .\\one.py --timeout" }],
      observe: "The controlled mode prints WAIT_TIMEOUT.",
    },
  ],
  download: ["downloads/one.py", "one.py", "Download one.py"],
  checkpoints: [
    {
      afterStep: 1,
      type: "short",
      prompt: "Complete the fixed label: [____]",
      answer: "OS",
      acceptedAnswers: ["operating system"],
      feedback: "The supplied artifact prints OS.",
    },
    {
      afterStep: 2,
      type: "choice",
      prompt: "Which fixed result does timeout mode print?",
      options: ["WAIT_OBJECT_0", "WAIT_TIMEOUT"],
      answerIndex: 1,
      feedback: "The controlled timeout mode prints WAIT_TIMEOUT.",
    },
  ],
}, "fixture", { enforceClarity: true });
assert.deepEqual(valid.errors, []);
assert.deepEqual(valid.warnings, []);
assert.equal(valid.checkpointCount, 2);
assert.equal(valid.choiceCheckpointCount, 1);

const contextualWarning = validatePractice({
  steps: [{ action: "Run one.py from PowerShell.", observe: "The output is visible." }],
}, "context", { enforceClarity: false });
assert.deepEqual(contextualWarning.warnings, ["context: step 1: terminal instruction needs a command block"]);

const codeRunWarning = validatePractice({
  steps: [{ action: "Run the ctypes pointer-size code from this lesson.", observe: "The output is visible." }],
}, "context", { enforceClarity: false });
assert.deepEqual(codeRunWarning.warnings, [
  "context: step 1: unresolved reference",
  "context: step 1: terminal instruction needs a command block",
]);

const artifactWarning = validatePractice({
  download: ["downloads/one.py", "one.py"],
  steps: [{ action: "Run a direct check.", commands: [{ label: "PowerShell", code: "py -c \"print(1)\"" }], observe: "The output is visible." }],
}, "context", { enforceClarity: false });
assert.deepEqual(artifactWarning.warnings, ["context: downloaded artifact one.py is not explicitly named in a step"]);

for (const [name, practice, expectedText] of [
  ["vague reference", { steps: [{ action: "Run the script from this lesson.", observe: "Record output." }] }, "unresolved reference"],
  ["malformed command", { steps: [{ action: "Run one.py.", commands: [{ label: "", code: "" }], observe: "Record output." }] }, "command"],
  ["unsupported command field", { steps: [{ action: "Print a value.", commands: [{ label: "PowerShell", code: "Write-Output 1", shell: "pwsh" }], observe: "Record output." }] }, "unsupported"],
  ["terminal instruction without command", { steps: [{ action: "Run one.py from PowerShell.", observe: "Record output." }] }, "command block"],
  ["unnamed artifact", { download: ["downloads/one.py", "one.py"], steps: [{ action: "Run a direct check.", commands: [{ label: "PowerShell", code: "py -c \"print(1)\"" }], observe: "Record output." }] }, "one.py"],
  ["paste-hostile placeholder", { steps: [{ action: "Query a PID.", commands: [{ label: "PowerShell", code: "tool.exe <PID>" }], observe: "Record output." }] }, "placeholder"],
  ["extension", { steps: [{ action: "Open the supplied page.", observe: "The page shows OS." }], extension: { title: "Independent variation", prompt: "Research another system." } }, "extension fields are not allowed"],
  ["five-part writing instruction", { steps: [{ action: "Write a five-part distinction: package, physical core, logical processor, process, and thread.", observe: "Give each noun one sentence." }] }, "off-page task verb"],
  ["unsupported checkpoint field", { steps: [{ action: "Open the supplied page.", observe: "The page shows OS." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "Complete [____].", answer: "OS", feedback: "OS is fixed.", storageKey: "answer" }] }, "unsupported checkpoint field storageKey"],
  ["checkpoint afterStep out of range", { steps: [{ action: "Open the supplied page.", observe: "The page shows OS." }], checkpoints: [{ afterStep: 2, type: "short", prompt: "Complete [____].", answer: "OS", feedback: "OS is fixed." }] }, "afterStep must reference an existing step"],
  ["empty checkpoint answer", { steps: [{ action: "Open the supplied page.", observe: "The page shows OS." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "Complete [____].", answer: "  ", acceptedAnswers: ["valid", ""], feedback: "OS is fixed." }] }, "answer must be a non-empty fixed string"],
  ["choice checkpoint has too few options", { steps: [{ action: "Open the supplied page.", observe: "The page shows OS." }], checkpoints: [{ afterStep: 1, type: "choice", prompt: "Choose the fixed result.", options: ["OS"], answerIndex: 0, feedback: "OS is fixed." }] }, "options must contain at least two choices"],
  ["choice checkpoint answerIndex out of range", { steps: [{ action: "Open the supplied page.", observe: "The page shows OS." }], checkpoints: [{ afterStep: 1, type: "choice", prompt: "Choose the fixed result.", options: ["OS", "DOS"], answerIndex: 2, feedback: "OS is fixed." }] }, "answerIndex must reference an option"],
  ["three checkpoints", { steps: [{ action: "Open the supplied page.", observe: "The page shows three fixed labels." }], checkpoints: [1, 2, 3].map((afterStep) => ({ afterStep: 1, type: "short", prompt: `Complete fixed label ${afterStep}.`, answer: `OS${afterStep}`, feedback: `OS${afterStep} is fixed.` })) }, "no more than two checkpoints"],
  ["two choice checkpoints", { steps: [{ action: "Open the supplied page.", observe: "The page shows two fixed results." }], checkpoints: [1, 2].map((number) => ({ afterStep: 1, type: "choice", prompt: `Choose fixed result ${number}.`, options: ["OS", "DOS"], answerIndex: 0, feedback: "OS is fixed." })) }, "no more than one choice checkpoint"],
  ["dynamic checkpoint prompt", { steps: [{ action: "Open the supplied page.", observe: "The page prints its live PID." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "What live PID did the program print?", answer: "1234", feedback: "The PID was printed." }] }, "checkpoint must not request a dynamic answer"],
  ["reordered printed PID prompt", { steps: [{ action: "Open the supplied page.", observe: "The program prints a PID." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "Enter the PID printed by the program.", answer: "1234", feedback: "The PID varies." }] }, "checkpoint must not request a dynamic answer"],
  ["reordered shown address prompt", { steps: [{ action: "Open the supplied page.", observe: "The program shows an address." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "Type the address shown above.", answer: "0x1234", feedback: "The address varies." }] }, "checkpoint must not request a dynamic answer"],
  ["reordered observed timing prompt", { steps: [{ action: "Open the supplied page.", observe: "The run shows timing." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "Provide the timing observed in the run.", answer: "10 ms", feedback: "The timing varies." }] }, "checkpoint must not request a dynamic answer"],
  ["reordered printed path prompt", { steps: [{ action: "Open the supplied page.", observe: "The tool prints a path." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "Which path did the tool print?", answer: "C:\\temp", feedback: "The path varies." }] }, "checkpoint must not request a dynamic answer"],
  ["reordered reported inventory prompt", { steps: [{ action: "Open the supplied page.", observe: "The program reports inventory." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "List the inventory reported by the program.", answer: "module.dll", feedback: "The inventory varies." }] }, "checkpoint must not request a dynamic answer"],
  ["dynamic checkpoint answer", { steps: [{ action: "Open the supplied page.", observe: "The page shows a fixed label." }], checkpoints: [{ afterStep: 1, type: "short", prompt: "Complete the supplied label.", answer: "current PID", feedback: "The answer must be invariant." }] }, "checkpoint must not request a dynamic answer"],
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
const firstBatch = new Set(["foundations", "processes-handles", "threads-scheduling", "memory", "linking-loading"]);
const secondBatch = new Set(["management", "security", "synchronisation", "ipc", "hooking-injection"]);
const firstBatchDownloadPaths = [...new Set(lessons
  .filter((lesson) => firstBatch.has(lesson.module))
  .flatMap((lesson) => practiceDownloads(lesson.practice).map((download) => download.path)))];
const offPageRuntimePromptPattern = /input\([^)]*(?:\b(?:record|explain|classify|calculate|draw|design|research|reconstruct|document|summari[sz]e|produce)\b|\bwrite\s+(?:an?|the|your|one)\b)/is;
for (const downloadPath of firstBatchDownloadPaths) {
  const source = fs.readFileSync(path.join(root, downloadPath), "utf8");
  assert.doesNotMatch(source, offPageRuntimePromptPattern, `${downloadPath}: runtime prompt must stay inside the closed-loop showcase`);
}
const strictResults = lessons.map((lesson) => ({
  lesson,
  result: validatePractice(lesson.practice, lesson.id, { enforceClarity: true }),
}));
const strictErrors = strictResults.flatMap(({ result }) => result.errors);
const strictWarnings = strictResults.flatMap(({ result }) => result.warnings);
const authoredDownloadPaths = lessons.flatMap((lesson) => {
  const authored = lesson.practice.downloads || (lesson.practice.download ? [lesson.practice.download] : []);
  return authored.map((download) => download[0]);
});
const returnedDownloadPaths = lessons.flatMap((lesson) => practiceDownloads(lesson.practice).map((download) => download.path));
const extensionCount = lessons.filter((lesson) => lesson.practice.extension !== undefined).length;
const predictionPromptCount = lessons.filter((lesson) => firstBatch.has(lesson.module) && lesson.practice.predictionPrompt !== undefined).length;
const fieldCollectionCount = lessons.filter((lesson) => firstBatch.has(lesson.module) && lesson.practice.fields !== undefined).length;
const offPageTaskFindings = strictErrors.filter((message) => message.includes("off-page task verb"));
const dynamicCheckpointFindings = strictErrors.filter((message) => message.includes("checkpoint must not request a dynamic answer"));

assert.equal(lessons.length, 62, "expected exactly 62 guided investigations");
assert.deepEqual(strictErrors, [], strictErrors.join("\n"));
assert.deepEqual(strictWarnings, [], strictWarnings.join("\n"));
assert.equal(extensionCount, 0, `expected zero extensions, found ${extensionCount}`);
assert.equal(predictionPromptCount, 0, `expected zero first-batch prediction prompts, found ${predictionPromptCount}`);
assert.equal(fieldCollectionCount, 0, `expected zero first-batch field worksheets, found ${fieldCollectionCount}`);
assert.deepEqual(offPageTaskFindings, [], offPageTaskFindings.join("\n"));
assert.deepEqual(dynamicCheckpointFindings, [], dynamicCheckpointFindings.join("\n"));
for (const { lesson, result } of strictResults) {
  assert.ok(result.checkpointCount <= 2, `${lesson.id}: no more than two checkpoints`);
  assert.ok(result.choiceCheckpointCount <= 1, `${lesson.id}: no more than one choice checkpoint`);
}
assert.deepEqual(returnedDownloadPaths, authoredDownloadPaths, "practiceDownloads() must return every authored download path");

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const reviewFindings = [];
const requireReview = (condition, message) => {
  if (!condition) reviewFindings.push(message);
};

const securityModelPractice = lessonById.get("security-model").practice;
const securityModelText = JSON.stringify(securityModelPractice);
requireReview(
  securityModelPractice.download?.[0] === "downloads/process_access_lab.py",
  "security-model must download the complete process_access_lab.py probe",
);
requireReview(!securityModelText.includes("@'\\nimport"), "security-model must not embed multiline Python in PowerShell");
requireReview(securityModelText.includes("0x001FFFFF"), "security-model must use the current PROCESS_ALL_ACCESS value");
requireReview(!securityModelText.includes("0x001F0FFF"), "security-model must not label the legacy mask as current PROCESS_ALL_ACCESS");
requireReview(fs.existsSync(path.join(root, "downloads", "process_access_lab.py")), "process_access_lab.py must exist");
const processAccessSource = fs.readFileSync(path.join(root, "downloads", "process_access_lab.py"), "utf8");
for (const requiredText of ["OpenProcess", "CloseHandle", "0x001FFFFF", "0x00001000", "if __name__ == \"__main__\""]) {
  requireReview(processAccessSource.includes(requiredText), `process_access_lab.py must contain ${requiredText}`);
}

const eventsPractice = lessonById.get("events-waits").practice;
const eventsPracticeText = JSON.stringify(eventsPractice);
const eventsCommands = eventsPractice.steps.flatMap((step) => step.commands || []).map((command) => command.code);
requireReview(!eventsPracticeText.includes("@'\\nimport"), "events-waits must invoke its downloaded Python artifact directly");
for (const invocation of ["py .\\event_pair_lab.py creator", "py .\\event_pair_lab.py waiter --timeout-ms 10000"]) {
  requireReview(eventsCommands.includes(invocation), `events-waits must show the exact invocation ${invocation}`);
}

const registryCleanup = lessonById.get("registry-structure").practice.steps.at(-1).commands[0].code;
requireReview(/\.Property\)\.Count|\.Property\.Count/.test(registryCleanup), "registry cleanup must test value names as well as subkeys");
requireReview(/Get-ChildItem/.test(registryCleanup), "registry cleanup must preserve unexpected subkeys");

const largePipelineStep = lessonById.get("anonymous-pipes").practice.steps[1];
const largePipelineText = JSON.stringify(largePipelineStep);
requireReview(!/findstr\.exe/i.test(largePipelineText), "large pipeline must not send a 200000-character line through findstr.exe");
requireReview(largePipelineText.includes("200000 bytes"), "large pipeline must retain fixed 200000-byte evidence");
requireReview(largePipelineText.includes("-EncodedCommand"), "large pipeline must preserve the producer script as one native-process argument");

const task3PracticeText = lessons
  .filter((lesson) => secondBatch.has(lesson.module))
  .map((lesson) => JSON.stringify(lesson.practice))
  .join("\n");
const misleadingStartAddressPath = ["Process Performance", "Start Address"].join(" > ");
requireReview(
  !task3PracticeText.includes(misleadingStartAddressPath),
  "Task 3 practices must not present a process-list Start Address as thread or module evidence",
);
const task4PracticeText = lessons
  .filter((lesson) => firstBatch.has(lesson.module))
  .map((lesson) => JSON.stringify(lesson.practice))
  .join("\n");
requireReview(
  !task4PracticeText.includes(misleadingStartAddressPath),
  "Task 4 practices must not present a process-list Start Address as thread or module evidence",
);
const pointerPracticeText = JSON.stringify(lessonById.get("cpu-architecture-data").practice);
for (const requiredText of ["Properties > Threads", "selected TID", "Start Address"]) {
  requireReview(pointerPracticeText.includes(requiredText), `pointer-size thread-start workflow must name ${requiredText}`);
}
for (const lessonId of ["compile-link-execute", "static-dynamic-linking", "imports-exports-iat", "windows-loader"]) {
  const practiceText = JSON.stringify(lessonById.get(lessonId).practice);
  for (const requiredText of ["View > Show Lower Pane", "View > Lower Pane View > DLLs", "Select Columns > DLL > Base Address"]) {
    requireReview(practiceText.includes(requiredText), `${lessonId} module-base workflow must name ${requiredText}`);
  }
  requireReview(/exact.{0,160}module (?:path )?row/i.test(practiceText), `${lessonId} module-base workflow must locate the exact module path row`);
}
for (const lessonId of ["hooking-injection", "startup-code-loading", "detect-injection"]) {
  const practiceText = JSON.stringify(lessonById.get(lessonId).practice);
  for (const requiredText of ["View > Show Lower Pane", "View > Lower Pane View > DLLs", "Select Columns", "Base Address"]) {
    requireReview(practiceText.includes(requiredText), `${lessonId} module-base workflow must name ${requiredText}`);
  }
  requireReview(/locate (?:an|the) exact.{0,160}row/i.test(practiceText), `${lessonId} module-base workflow must locate the exact module path row`);
}

const deadlockPracticeText = JSON.stringify(lessonById.get("deadlocks-starvation").practice);
for (const requiredText of ["Properties > Threads", "read its TID", "Start Address", "symbols may remain unresolved"]) {
  requireReview(deadlockPracticeText.includes(requiredText), `deadlock thread-start workflow must name ${requiredText}`);
}

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
