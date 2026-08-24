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

const validCaseStudy = {
  title: "Inspect a supplied contract",
  intro: "Use the fixed contract supplied inside this investigation.",
  caseStudy: {
    label: "API contract case study",
    title: "Open an existing file",
    summary: "The same fixed contract supports both steps.",
    sections: [
      { title: "Call choices", facts: [["Creation", "OPEN_EXISTING"]] },
      { title: "Ownership", body: "Release the successful handle with CloseHandle." },
    ],
  },
  steps: [
    { action: "Inspect the supplied call choice.", caseStudySections: ["Call choices"], observe: "OPEN_EXISTING is visible." },
    { action: "Inspect the supplied ownership rule.", caseStudySections: ["Ownership"], observe: "CloseHandle is visible." },
  ],
};
const validCaseStudyResult = validatePractice(validCaseStudy, "valid case study", { enforceClarity: true });
assert.deepEqual(validCaseStudyResult.errors, []);
assert.equal(validCaseStudyResult.caseStudyCount, 1);

const crossLessonRenderedPhrase = "Use the example elsewhere in this lesson.";
const renderedCrossLessonFailures = [];
for (const [field, mutate] of [
  ["case-study label", (practice) => { practice.caseStudy.label = crossLessonRenderedPhrase; }],
  ["case-study title", (practice) => { practice.caseStudy.title = crossLessonRenderedPhrase; }],
  ["case-study summary", (practice) => { practice.caseStudy.summary = crossLessonRenderedPhrase; }],
  ["case-study section title", (practice) => {
    practice.caseStudy.sections[0].title = crossLessonRenderedPhrase;
    practice.steps[0].caseStudySections = [crossLessonRenderedPhrase];
  }],
  ["case-study step reference", (practice) => { practice.steps[0].caseStudySections = [crossLessonRenderedPhrase]; }],
  ["case-study section body", (practice) => { practice.caseStudy.sections[1].body = crossLessonRenderedPhrase; }],
  ["case-study fact term", (practice) => { practice.caseStudy.sections[0].facts[0][0] = crossLessonRenderedPhrase; }],
  ["case-study fact description", (practice) => { practice.caseStudy.sections[0].facts[0][1] = crossLessonRenderedPhrase; }],
  ["case-study section code", (practice) => { practice.caseStudy.sections[0].code = crossLessonRenderedPhrase; }],
]) {
  const practice = structuredClone(validCaseStudy);
  mutate(practice);
  const result = validatePractice(practice, field, { enforceClarity: true });
  if (!result.errors.some((message) => message.includes("cross-lesson reference"))) renderedCrossLessonFailures.push(field);
}

for (const [field, practice] of [
  ["practice time", { time: crossLessonRenderedPhrase, steps: [{ action: "Inspect the supplied value.", observe: "The fixed value is visible." }] }],
  ["download path", { download: [crossLessonRenderedPhrase, "one.txt", "Download one.txt"], steps: [{ action: "Inspect the supplied value.", observe: "The fixed value is visible." }] }],
  ["download filename", { download: ["downloads/one.txt", crossLessonRenderedPhrase, "Download one.txt"], steps: [{ action: "Inspect the supplied value.", observe: "The fixed value is visible." }] }],
  ["download label", { download: ["downloads/one.txt", "one.txt", crossLessonRenderedPhrase], steps: [{ action: "Inspect the supplied value.", observe: "The fixed value is visible." }] }],
  ["command code", {
    steps: [{
      action: "Run the supplied command.",
      commands: [{ label: "PowerShell", code: `# ${crossLessonRenderedPhrase}\nWrite-Output 'ready'` }],
      observe: "The fixed word ready is visible.",
    }],
  }],
  ["checkpoint prompt", {
    steps: [{ action: "Inspect the supplied value.", observe: "The fixed value is visible." }],
    checkpoints: [{ afterStep: 1, type: "short", prompt: crossLessonRenderedPhrase, answer: "OS", feedback: "OS is fixed." }],
  }],
  ["checkpoint option", {
    steps: [{ action: "Inspect the supplied value.", observe: "The fixed value is visible." }],
    checkpoints: [{ afterStep: 1, type: "choice", prompt: "Choose the fixed value.", options: [crossLessonRenderedPhrase, "OS"], answerIndex: 1, feedback: "OS is fixed." }],
  }],
  ["checkpoint feedback", {
    steps: [{ action: "Inspect the supplied value.", observe: "The fixed value is visible." }],
    checkpoints: [{ afterStep: 1, type: "short", prompt: "Complete the fixed value.", answer: "OS", feedback: crossLessonRenderedPhrase }],
  }],
]) {
  const result = validatePractice(practice, field, { enforceClarity: true });
  if (!result.errors.some((message) => message.includes("cross-lesson reference"))) renderedCrossLessonFailures.push(field);
}
assert.deepEqual(renderedCrossLessonFailures, [], `rendered fields missing cross-lesson validation:\n${renderedCrossLessonFailures.join("\n")}`);

for (const [name, practice, expectedText] of [
  ["unsupported case-study field", { ...validCaseStudy, caseStudy: { ...validCaseStudy.caseStudy, theme: "terminal" } }, "unsupported case-study field theme"],
  ["unsupported case-study section field", {
    ...validCaseStudy,
    caseStudy: {
      ...validCaseStudy.caseStudy,
      sections: [{ title: "Call choices", facts: [["Creation", "OPEN_EXISTING"]], order: 1 }, validCaseStudy.caseStudy.sections[1]],
    },
  }, "unsupported case-study section field order"],
  ["unsupported practice step field", {
    ...validCaseStudy,
    steps: [{ ...validCaseStudy.steps[0], caseStudyLabel: "Call choices" }, validCaseStudy.steps[1]],
  }, "unsupported step field caseStudyLabel"],
  ["duplicate case-study section titles", {
    ...validCaseStudy,
    caseStudy: {
      ...validCaseStudy.caseStudy,
      sections: [{ title: "Call choices", facts: [["Creation", "OPEN_EXISTING"]] }, { title: "Call choices", body: "Close the handle." }],
    },
    steps: [
      { action: "Inspect the first supplied choice.", caseStudySections: ["Call choices"], observe: "OPEN_EXISTING is visible." },
      { action: "Inspect the second supplied choice.", caseStudySections: ["Call choices"], observe: "CloseHandle is visible." },
    ],
  }, "section titles must be unique"],
  ["case-study section without content", {
    ...validCaseStudy,
    caseStudy: { ...validCaseStudy.caseStudy, sections: [{ title: "Call choices" }, validCaseStudy.caseStudy.sections[1]] },
  }, "must include body, facts, or code"],
  ["malformed case-study fact row", {
    ...validCaseStudy,
    caseStudy: { ...validCaseStudy.caseStudy, sections: [{ title: "Call choices", facts: [["Creation"]] }, validCaseStudy.caseStudy.sections[1]] },
  }, "fact rows must contain exactly two non-empty strings"],
  ["nonexistent case-study section reference", {
    ...validCaseStudy,
    steps: [{ ...validCaseStudy.steps[0], caseStudySections: ["Missing section"] }, validCaseStudy.steps[1]],
  }, "unknown case-study section Missing section"],
  ["case-study reference without a case study", {
    title: "Inspect a supplied contract",
    steps: [{ action: "Inspect the supplied choice.", caseStudySections: ["Call choices"], observe: "OPEN_EXISTING is visible." }],
  }, "caseStudySections requires a case study"],
  ["case study with only one consuming step", {
    ...validCaseStudy,
    steps: [{ ...validCaseStudy.steps[0] }, { action: "Inspect the supplied cleanup rule.", observe: "CloseHandle is visible." }],
  }, "at least two distinct steps must consume the case study"],
  ["decorative case study without consumers", {
    ...validCaseStudy,
    steps: validCaseStudy.steps.map(({ caseStudySections, ...step }) => step),
  }, "at least two distinct steps must consume the case study"],
]) {
  const result = validatePractice(practice, name, { enforceClarity: true });
  assert.ok(result.errors.some((message) => message.includes(expectedText)), name);
}

for (const phrase of [
  "Open the displayed example above.",
  "Return to the same walkthrough.",
  "Open the Assign ownership stage in the earlier card.",
  "Use the example elsewhere in this lesson.",
]) {
  const result = validatePractice({
    title: "Inspect supplied evidence",
    steps: [{ action: phrase, observe: "The referenced evidence is visible." }],
  }, `cross-lesson reference: ${phrase}`, { enforceClarity: true });
  assert.ok(result.errors.some((message) => message.includes("cross-lesson reference")), phrase);
}

for (const [field, practice] of [
  ["title", { title: "Return to the same walkthrough.", steps: [{ action: "Inspect the supplied value.", observe: "The value is visible." }] }],
  ["intro", { intro: "Return to the same walkthrough.", steps: [{ action: "Inspect the supplied value.", observe: "The value is visible." }] }],
  ["safety", { safety: "Return to the same walkthrough.", steps: [{ action: "Inspect the supplied value.", observe: "The value is visible." }] }],
  ["step action", { steps: [{ action: "Return to the same walkthrough.", observe: "The value is visible." }] }],
  ["step why", { steps: [{ action: "Inspect the supplied value.", why: "Return to the same walkthrough.", observe: "The value is visible." }] }],
  ["step observe", { steps: [{ action: "Inspect the supplied value.", observe: "Return to the same walkthrough." }] }],
  ["step hint", { steps: [{ action: "Inspect the supplied value.", observe: "The value is visible.", hint: "Return to the same walkthrough." }] }],
  ["step command label", { steps: [{ action: "Run the supplied command.", commands: [{ label: "Use the example elsewhere in this lesson.", code: "Write-Output 'ready'" }], observe: "The fixed word ready is visible." }] }],
  ["expected outcome", { expectedOutcome: "Return to the same walkthrough.", steps: [{ action: "Inspect the supplied value.", observe: "The value is visible." }] }],
  ["practice hint title", { hints: [{ title: "Return to the same walkthrough.", body: "Use the supplied value." }], steps: [{ action: "Inspect the supplied value.", observe: "The value is visible." }] }],
  ["practice hint body", { hints: [{ title: "Supplied value", body: "Return to the same walkthrough." }], steps: [{ action: "Inspect the supplied value.", observe: "The value is visible." }] }],
  ["cleanup", { cleanup: ["Return to the same walkthrough."], steps: [{ action: "Inspect the supplied value.", observe: "The value is visible." }] }],
]) {
  const result = validatePractice(practice, `cross-lesson ${field}`, { enforceClarity: true });
  assert.ok(result.errors.some((message) => message.includes("cross-lesson reference")), field);
}

const sameInvestigationOutput = validatePractice({
  title: "Follow one controlled process",
  steps: [
    { action: "Open the supplied process view.", observe: "The program prints a PID in step 1." },
    { action: "Use the PID printed in step 1.", observe: "Refresh the same PID." },
  ],
}, "same-investigation output", { enforceClarity: true });
assert.deepEqual(sameInvestigationOutput.errors, [], "named earlier-step outputs and same-process state must remain valid");
assert.equal(sameInvestigationOutput.caseStudyCount, 0);

const negativeSafety = validatePractice({
  title: "Inspect one fixed artifact",
  intro: "Use the supplied artifact and visible output.",
  safety: "Do not write a report, record dynamic values, or use an unrelated target.",
  steps: [{ action: "Open the supplied page.", observe: "The fixed label is visible." }],
}, "negative safety", { enforceClarity: true });
assert.deepEqual(negativeSafety.errors, [], "negative safety wording must not become a learner task");

const sourcedInteractiveInput = validatePractice({
  title: "Transfer one supplied identity",
  intro: "Use the PID printed by actor.py.",
  steps: [{
    action: "Enter the PID that actor.py printed in step 1.",
    commands: [{ label: "PowerShell", code: "$targetPid = [int](Read-Host 'Enter the printed PID from actor.py')\nGet-Process -Id $targetPid" }],
    observe: "The exact supplied process identity is visible.",
  }],
}, "sourced input", { enforceClarity: true });
assert.deepEqual(sourcedInteractiveInput.errors, [], "reordered sourced Read-Host input must remain valid");

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
  ["stale preference title", { title: "Map one harmless application preference", steps: [{ action: "Open the supplied page.", observe: "The page shows a fixed label." }] }, "unsupplied external choice"],
  ["stale preference intro", { intro: "Choose a reversible per-user preference in a disposable application profile.", steps: [{ action: "Open the supplied page.", observe: "The page shows a fixed label." }] }, "unsupplied external choice"],
  ["contradictory safety task", { intro: "Inspect only the supplied fixed value.", safety: "Write a report before continuing.", steps: [{ action: "Open the supplied page.", observe: "The page shows a fixed label." }] }, "safety: off-page task verb"],
  ["contrasting negative safety task", { safety: "Do not change the supplied value, but write a report before continuing.", steps: [{ action: "Open the supplied page.", observe: "The page shows a fixed label." }] }, "safety: off-page task verb"],
  ["contrasting task after negated task", { safety: "Do not write a report, but record a timeline before continuing.", steps: [{ action: "Open the supplied page.", observe: "The page shows a fixed label." }] }, "safety: off-page task verb"],
  ["unsupplied VM service", { safety: "Use only a pre-authorised lab service in a disposable VM.", steps: [{ action: "Open the supplied page.", observe: "The page shows a fixed label." }] }, "unsupplied external environment"],
  ["unsupplied token launch", { intro: "Use a disposable VM for this launch.", steps: [{ action: "Choose a process and launch a token-created child.", commands: [{ label: "PowerShell", code: "$pid = Read-Host 'Enter any PID'\npy .\\token_launch_lab.py $pid --launch" }], observe: "The child appears." }] }, "unsupplied external environment"],
  ["unsourced interactive input", { steps: [{ action: "Query a service selected by the learner.", commands: [{ label: "PowerShell", code: "$serviceName = Read-Host 'Enter a service name'\nsc.exe query $serviceName" }], observe: "The current state is visible." }] }, "interactive input needs explicit provenance"],
  ["unsourced named prompt input", { steps: [{ action: "Query a service selected by the learner.", commands: [{ label: "PowerShell", code: "$serviceName = Read-Host -Prompt 'Enter a service name'\nsc.exe query $serviceName" }], observe: "The current state is visible." }] }, "interactive input needs explicit provenance"],
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
const allDownloadPaths = [...new Set(lessons.flatMap((lesson) => practiceDownloads(lesson.practice).map((download) => download.path)))];
const runtimeScannedPaths = [];
const strictResults = lessons.map((lesson) => ({
  lesson,
  result: validatePractice(lesson.practice, lesson.id, {
    enforceClarity: true,
    readDownloadSource(downloadPath) {
      runtimeScannedPaths.push(downloadPath);
      return fs.readFileSync(path.join(root, downloadPath), "utf8");
    },
  }),
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
const crossLessonReferenceFindings = strictErrors.filter((message) => message.includes("cross-lesson reference"));
const caseStudyLessonIds = strictResults
  .filter(({ result }) => result.caseStudyCount === 1)
  .map(({ lesson }) => lesson.id)
  .sort();
const practiceById = new Map(strictResults.map(({ lesson }) => [lesson.id, lesson.practice]));
const caseStudyContentFindings = [];
const requireCaseStudyContent = (condition, message) => {
  if (!condition) caseStudyContentFindings.push(message);
};
const readingCaseStudyPractice = practiceById.get("reading-winapi-docs");
const callingCaseStudyPractice = practiceById.get("calling-winapi-python");
const systemCallPracticeFixture = practiceById.get("system-calls-win32");
requireCaseStudyContent(
  readingCaseStudyPractice.caseStudy?.title === "Opening an existing file with CreateFileW",
  "reading-winapi-docs must supply the fixed CreateFileW case study",
);
requireCaseStudyContent(
  JSON.stringify(readingCaseStudyPractice.caseStudy?.sections?.map((section) => section.title) || [])
    === JSON.stringify(["Goal", "Call choices", "Parameter directions", "Result and error", "Ownership"]),
  "reading-winapi-docs must use the five exact case-study sections",
);
const readingCaseStudyText = JSON.stringify(readingCaseStudyPractice.caseStudy || {});
for (const requiredText of [
  "GENERIC_READ",
  "FILE_SHARE_READ | FILE_SHARE_WRITE",
  "OPEN_EXISTING",
  "FILE_ATTRIBUTE_NORMAL",
  "UTF-16",
  "lpFileName",
  "lpSecurityAttributes",
  "INVALID_HANDLE_VALUE",
  "GetLastError",
  "CloseHandle",
]) {
  requireCaseStudyContent(readingCaseStudyText.includes(requiredText), `reading-winapi-docs case study must contain ${requiredText}`);
}
requireCaseStudyContent(
  JSON.stringify(readingCaseStudyPractice.steps.map((step) => step.caseStudySections))
    === JSON.stringify([["Goal", "Call choices"], ["Parameter directions"], ["Result and error"], ["Ownership"]]),
  "reading-winapi-docs steps must consume the exact local sections",
);
requireCaseStudyContent(
  callingCaseStudyPractice.caseStudy?.title === "Interpreting wait results and ctypes failures",
  "calling-winapi-python must supply the fixed wait/ctypes case study",
);
requireCaseStudyContent(
  JSON.stringify(callingCaseStudyPractice.caseStudy?.sections?.map((section) => section.title) || [])
    === JSON.stringify(["Wait results", "Wrapper failure", "ctypes declaration", "Immediate error capture"]),
  "calling-winapi-python must use the four exact case-study sections",
);
const callingCaseStudyText = JSON.stringify(callingCaseStudyPractice.caseStudy || {});
for (const requiredText of [
  "WAIT_OBJECT_0",
  "WAIT_TIMEOUT",
  "pywintypes.error",
  "WinDLL",
  "use_last_error=True",
  "CloseHandle.argtypes",
  "CloseHandle.restype",
  "zero means failure",
  "ctypes.get_last_error()",
  "ctypes.WinError(code)",
]) {
  requireCaseStudyContent(callingCaseStudyText.includes(requiredText), `calling-winapi-python case study must contain ${requiredText}`);
}
requireCaseStudyContent(
  JSON.stringify(callingCaseStudyPractice.steps.map((step) => step.caseStudySections))
    === JSON.stringify([["Wait results"], ["Wait results", "Wrapper failure"], ["ctypes declaration"], ["Immediate error capture"]]),
  "calling-winapi-python steps must consume the exact local sections",
);
requireCaseStudyContent(systemCallPracticeFixture.caseStudy === undefined, "system-calls-win32 must not have a case study");
const systemCallFirstStepText = JSON.stringify(systemCallPracticeFixture.steps[0]);
for (const requiredText of [
  "GENERIC_READ",
  "FILE_SHARE_READ | FILE_SHARE_WRITE",
  "OPEN_EXISTING",
  "FILE_ATTRIBUTE_NORMAL",
  "UTF-16",
  "INVALID_HANDLE_VALUE",
  "GetLastError",
  "CloseHandle",
]) {
  requireCaseStudyContent(systemCallFirstStepText.includes(requiredText), `system-calls-win32 first step must contain ${requiredText}`);
}
const serviceControllerPractice = practiceById.get("control-services-python");
const serviceControllerQueryEvidence = `${serviceControllerPractice.expectedOutcome} ${serviceControllerPractice.steps[1].observe}`;
for (const forbiddenText of ["checkpoint", "wait hint", "accepted controls", "exit code"] ) {
  requireCaseStudyContent(!serviceControllerQueryEvidence.toLowerCase().includes(forbiddenText), `EventLog query evidence must not promise ${forbiddenText}`);
}
for (const requiredText of ["state", "PID"]) {
  requireCaseStudyContent(serviceControllerQueryEvidence.includes(requiredText), `EventLog query evidence must promise ${requiredText}`);
}
requireCaseStudyContent(serviceControllerPractice.cleanup.join(" ").includes("closes the EventLog and SCM handles"), "EventLog query evidence must retain service/SCM handle cleanup");
const systemCallCrossLessonFindings = strictResults
  .find(({ lesson }) => lesson.id === "system-calls-win32")
  .result.errors
  .filter((message) => message.includes("cross-lesson reference"));

assert.equal(lessons.length, 62, "expected exactly 62 guided investigations");
assert.deepEqual(caseStudyContentFindings, [], caseStudyContentFindings.join("\n"));
assert.deepEqual(crossLessonReferenceFindings, [], crossLessonReferenceFindings.join("\n"));
assert.deepEqual(caseStudyLessonIds, ["calling-winapi-python", "reading-winapi-docs"]);
assert.deepEqual(systemCallCrossLessonFindings, [], systemCallCrossLessonFindings.join("\n"));
assert.deepEqual(strictErrors, [], strictErrors.join("\n"));
assert.deepEqual(strictWarnings, [], strictWarnings.join("\n"));
assert.equal(extensionCount, 0, `expected zero extensions, found ${extensionCount}`);
assert.equal(predictionPromptCount, 0, `expected zero first-batch prediction prompts, found ${predictionPromptCount}`);
assert.equal(fieldCollectionCount, 0, `expected zero first-batch field worksheets, found ${fieldCollectionCount}`);
assert.deepEqual([...new Set(runtimeScannedPaths)].sort(), allDownloadPaths.filter((downloadPath) => downloadPath.endsWith(".py")).sort(), "every authored Python download across Modules 1-10 must have runtime prompts scanned");
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

const serviceControlPracticeText = JSON.stringify(lessonById.get("control-services-python").practice);
for (const forbiddenText of ["Read-Host", "disposable VM", "pre-authorised", "--confirm"]) {
  requireReview(!serviceControlPracticeText.includes(forbiddenText), `service-control required showcase must not contain ${forbiddenText}`);
}
requireReview(serviceControlPracticeText.includes("EventLog"), "service-control required showcase must use the fixed EventLog service");
requireReview(/query-only|read-only/i.test(serviceControlPracticeText), "service-control required showcase must be explicitly non-mutating");
const serviceControllerSource = fs.readFileSync(path.join(root, "downloads", "service_controller_lab.py"), "utf8");
const serviceControllerOpening = serviceControllerSource.split(/\r?\n/).slice(0, 8).join(" ");
requireReview(
  serviceControllerOpening.includes("Query mode is read-only and may inspect the fixed EventLog service."),
  "service_controller_lab.py opening must explicitly allow the fixed read-only EventLog query",
);
requireReview(
  serviceControllerOpening.includes("Use start or stop only with a non-critical service you are authorised to control in a VM."),
  "service_controller_lab.py VM warning must apply only to mutating start/stop modes",
);
requireReview(
  !serviceControllerOpening.includes("Use only with a non-critical service"),
  "service_controller_lab.py must not apply its mutation warning unconditionally",
);

const tokenLaunchPracticeText = JSON.stringify(lessonById.get("privileges-impersonation").practice);
for (const forbiddenText of ["Read-Host", "disposable VM", "--launch", "VM only"]) {
  requireReview(!tokenLaunchPracticeText.includes(forbiddenText), `token-launch required showcase must not contain ${forbiddenText}`);
}
for (const requiredText of [
  "Dry run evidence: child process created=no",
  "Closed owned handle: primary token",
  "Cleanup evidence: owned handles closed=4",
]) {
  requireReview(tokenLaunchPracticeText.includes(requiredText), `token-launch required showcase must name exact evidence: ${requiredText}`);
}
requireReview(
  !tokenLaunchPracticeText.includes("Confirm the process and token handles close"),
  "token-launch cleanup must not ask the learner to confirm silent handle closure",
);
const tokenLaunchSource = fs.readFileSync(path.join(root, "downloads", "token_launch_lab.py"), "utf8");
for (const forbiddenText of ["Add --launch", "parser.add_argument(\"--launch\"", "CreateProcessAsUser", "STARTUPINFO"]) {
  requireReview(!tokenLaunchSource.includes(forbiddenText), `token_launch_lab.py dry-run artifact must not contain ${forbiddenText}`);
}
for (const requiredText of [
  "Dry run evidence: child process created=no",
  "Closed owned handle: {label}",
  "Cleanup evidence: owned handles closed={closed_handles}",
]) {
  requireReview(tokenLaunchSource.includes(requiredText), `token_launch_lab.py must emit deterministic evidence: ${requiredText}`);
}

const registryPracticeText = JSON.stringify(lessonById.get("registry-structure").practice);
for (const forbiddenText of ["application preference", "Choose a reversible", "application's own UI"]) {
  requireReview(!registryPracticeText.includes(forbiddenText), `Registry practice must not retain stale framing: ${forbiddenText}`);
}
requireReview(registryPracticeText.includes("HKCU\\\\Software\\\\ILOVEOSLab\\\\Structure\\\\DemoMode"), "Registry practice must name the fixed disposable value");

requireReview(!/state exactly/i.test(lessonById.get("svchost-background").practice.intro), "svchost practice intro must remain a visible observation");
requireReview(lessonById.get("pe-anatomy").phases.investigation[1].includes("CFF Explorer"), "PE anatomy phase must name CFF Explorer");

const runtimePromptFixture = validatePractice({
  download: ["downloads/off_page.py", "off_page.py"],
  steps: [{ action: "Run off_page.py.", commands: [{ label: "PowerShell", code: "py .\\off_page.py" }], observe: "The supplied program pauses." }],
}, "runtime prompt fixture", {
  enforceClarity: true,
  readDownloadSource: () => 'input("Write a report before continuing...")',
});
requireReview(runtimePromptFixture.errors.some((message) => message.includes("runtime prompt") && message.includes("off-page task verb")), "all-download runtime prompt scan must reject an off-page input prompt");

const runtimePrintInvitationFixture = validatePractice({
  download: ["downloads/token.py", "token.py"],
  steps: [{ action: "Run token.py.", commands: [{ label: "PowerShell", code: "py .\\token.py" }], observe: "The dry-run evidence is visible." }],
}, "runtime print invitation fixture", {
  enforceClarity: true,
  readDownloadSource: () => 'print("Add --launch only after reviewing the source and command.")',
});
requireReview(
  runtimePrintInvitationFixture.errors.some((message) => message.includes("runtime print") && message.includes("launch invitation")),
  "all-download runtime print scan must reject a launch invitation",
);

const runtimePrintEvidenceFixture = validatePractice({
  download: ["downloads/token.py", "token.py"],
  steps: [{ action: "Run token.py.", commands: [{ label: "PowerShell", code: "py .\\token.py" }], observe: "The dry-run evidence is visible." }],
}, "runtime print evidence fixture", {
  enforceClarity: true,
  readDownloadSource: () => 'print("Dry run evidence: child process created=no")\nprint("Cleanup evidence: owned handles closed=4")',
});
requireReview(runtimePrintEvidenceFixture.errors.length === 0, "deterministic runtime evidence prints must remain valid");

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
