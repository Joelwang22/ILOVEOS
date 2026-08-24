# Guided Investigation Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn all 62 guided investigations into self-contained, closed-loop showcases with exact commands and tool paths, sparse webpage-verifiable evidence checks, optional local case studies, and no off-page homework or cross-lesson navigation.

**Architecture:** Practice steps carry optional `commands` metadata, practices carry optional invariant `checkpoints`, and only investigations whose steps share one fixed source carry a singular `caseStudy`. `app.js` renders all three without storage or a backend. A focused Node validator enforces artifacts, clarity, local references, case-study shape, checkpoint shape and sparsity, while every investigation receives a manual audit before the complete course passes a zero-warning gate.

**Tech Stack:** Dependency-free HTML, CSS, browser JavaScript, Node.js audit/test scripts, headless Microsoft Edge, static GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-24-guided-investigation-clarity-design.md`

## Global Constraints

- Audit all 62 guided investigations; keyword-only remediation is not sufficient.
- Direct terminal input must be displayed as a complete copyable PowerShell block in the step that requires it.
- Multi-line Python work must provide a complete `.py` download and an exact PowerShell invocation.
- GUI/tool steps must name the tool, target, interface path or filter, timing, evidence, and unavailable branch where applicable.
- Process Explorer steps must distinguish `Properties > Threads` thread start addresses from DLL lower-pane module base addresses and spell out every pane, tab, and column needed to reveal the requested value.
- A later step must name the earlier output it consumes; unresolved references such as "the script" or "the same command" are not acceptable.
- Guided investigations must not request off-page writing, recording, explanations, classifications, calculations, diagrams, designs, research, code reconstruction, or unsupplied examples, and must not contain extension assignments.
- Learner decisions must be transient and webpage-verifiable against fixed answers supplied by the course. Prefer short evidence blanks; use multiple choice only for a meaningful distinction.
- Add no checkpoint by default, normally no more than one, never more than two, and at most one choice checkpoint per investigation. Never grade dynamic PIDs, addresses, timings, paths, inventories, or machine-dependent values.
- Retain executable script, downloadable artifact, external-tool, and controlled-transition investigation formats. A case study is optional, singular, always visible, and justified only when at least two steps consume the same fixed source.
- Every case-study fact required by a step must live inside that practice. Steps may name an exact local case-study section or a named earlier-step output, but must not send the learner to an example, walkthrough, stage, card, or section elsewhere in the lesson.
- Do not add stored progress, automatic execution, a backend, or artificial command blocks to observation-only steps.
- Preserve the dependency-free static architecture and the existing lesson visual language.
- Preserve the owner's untracked `stuff_to_add.txt` and all unrelated changes.
- After every task, fast-forward `main`, push it, wait for the exact GitHub Pages workflow SHA, and verify the public asset cache key before continuing.

---

### Task 1: Command blocks and audit infrastructure

**Files:**

- Create: `scripts/practice-audit.mjs`
- Create: `scripts/test-practice-audit.mjs`
- Create: `scripts/test-practice-command-view.mjs`
- Modify: `scripts/audit-course.mjs`
- Modify: `app.js`
- Modify: `styles.css`
- Modify: `lesson-depth-foundations.js`
- Modify: `index.html`
- Test: `scripts/test-practice-audit.mjs`
- Test: `scripts/test-practice-command-view.mjs`

**Interfaces:**

- Produces `practiceDownloads(practice): Array<{ path: string, filename: string, label: string }>` in `scripts/practice-audit.mjs`.
- Produces `validatePractice(practice, context, options?): { errors: string[], warnings: string[], downloadPaths: string[], commandCount: number }` in `scripts/practice-audit.mjs`.
- Adds optional `step.commands: Array<{ label: string, code: string }>` to lesson content.
- Adds lesson DOM attributes `data-practice-command`, `data-practice-command-code`, `data-copy-practice-command`, and `data-copy-status` for browser tests and accessible behavior.

- [ ] **Step 1: Write the failing audit-module test**

Create `scripts/test-practice-audit.mjs`. Before importing the new module, assert that it exists so the first run fails with a normal assertion rather than an import exception. After that assertion, dynamically import it and exercise these fixtures:

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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
    observe: "The command prints the PID and pointer width.",
  }],
  download: ["downloads/one.py", "one.py", "Download one.py"],
}, "fixture", { enforceClarity: true });
assert.deepEqual(valid.errors, []);
assert.deepEqual(valid.warnings, []);

for (const [name, practice, expectedText] of [
  ["vague reference", { steps: [{ action: "Run the script from this lesson.", observe: "The output should become visible." }] }, "unresolved reference"],
  ["malformed command", { steps: [{ action: "Run one.py.", commands: [{ label: "", code: "" }], observe: "The output should become visible." }] }, "command"],
  ["unsupported command field", { steps: [{ action: "Print a value.", commands: [{ label: "PowerShell", code: "Write-Output 1", shell: "pwsh" }], observe: "The value 1 should appear." }] }, "unsupported"],
  ["terminal instruction without command", { steps: [{ action: "Run one.py from PowerShell.", observe: "The program output should appear." }] }, "command block"],
  ["unnamed artifact", { download: ["downloads/one.py", "one.py"], steps: [{ action: "Run a direct check.", commands: [{ label: "PowerShell", code: "py -c \"print(1)\"" }], observe: "The value 1 should appear." }] }, "one.py"],
  ["paste-hostile placeholder", { steps: [{ action: "Query a PID.", commands: [{ label: "PowerShell", code: "tool.exe <PID>" }], observe: "The query result should appear." }] }, "placeholder"],
]) {
  const result = validatePractice(practice, name, { enforceClarity: true });
  assert.ok([...result.errors, ...result.warnings].some((message) => message.includes(expectedText)), name);
}
```

- [ ] **Step 2: Run the audit-module test and verify RED**

Run:

```powershell
node .\scripts\test-practice-audit.mjs
```

Expected: FAIL with `practice-audit.mjs must exist`.

- [ ] **Step 3: Implement the practice validator**

Create `scripts/practice-audit.mjs` with these exact exported functions:

```js
const unresolvedPatterns = [
  /\bfrom this lesson\b/i,
  /\bthe (?:code|example|script|starter|reader|inspector|survey|copy)\b/i,
  /\bthe same (?:command|script|workload)\b/i,
];

export function practiceDownloads(practice = {}) {
  const authored = practice.downloads || (practice.download ? [practice.download] : []);
  return authored.map(([path, filename, label]) => ({
    path,
    filename,
    label: label || "Download starter",
  }));
}

export function validatePractice(practice = {}, context = "practice", options = {}) {
  const errors = [];
  const warnings = [];
  const downloads = practiceDownloads(practice);
  let commandCount = 0;
  // Validate action/observe, command arrays, allowed label/code keys,
  // angle-bracket placeholders, known unresolved patterns, and explicit
  // naming of any downloaded .py file referenced by a command.
  return { errors, warnings, downloadPaths: downloads.map((item) => item.path), commandCount };
}
```

`enforceClarity: true` turns unresolved-reference and terminal-without-command findings into errors. With the option false, malformed structure remains an error while unresolved prose becomes a warning so the two content batches can reduce the debt incrementally.

- [ ] **Step 4: Run the audit-module test and verify GREEN**

Run `node .\scripts\test-practice-audit.mjs`.

Expected: exit 0 and `practice audit errors: 0`.

- [ ] **Step 5: Write the failing real-course audit test**

Extend `scripts/test-practice-audit.mjs` to load `lesson-content.js` and every `lesson-depth-*.js` file in a VM, merge each depth record into its lesson, then validate `cpu-architecture-data` with `enforceClarity: true`:

```js
const pointerLesson = lessons.find((lesson) => lesson.id === "cpu-architecture-data");
const pointerResult = validatePractice(pointerLesson.practice, pointerLesson.id, { enforceClarity: true });
assert.deepEqual(pointerResult.errors, [], pointerResult.errors.join("\n"));
```

- [ ] **Step 6: Run the real-course audit test and verify RED**

Run `node .\scripts\test-practice-audit.mjs`.

Expected: FAIL identifying `Run the ctypes pointer-size code from this lesson.` as an unresolved reference and missing command block.

- [ ] **Step 7: Rewrite the pointer-size step as the vertical content slice**

In `lesson-depth-foundations.js`, replace the ambiguous action with a directly pasteable PowerShell check. The step must name PowerShell, explain that it can run from any folder, and include:

```js
commands: [{
  label: "PowerShell",
  code: "py -c \"import ctypes, platform, sys; pointer_bytes = ctypes.sizeof(ctypes.c_void_p); print(f'Python executable: {sys.executable}'); print(f'Architecture label: {platform.architecture()[0]}'); print(f'Pointer bytes: {pointer_bytes}'); print(f'Pointer bits: {pointer_bytes * 8}')\""
}]
```

Update the action to name the four printed fields and update the observation to distinguish a missing `py` launcher from an architecture result.

- [ ] **Step 8: Run the real-course audit test and verify GREEN**

Run `node .\scripts\test-practice-audit.mjs`.

Expected: exit 0.

- [ ] **Step 9: Write the failing command-rendering browser test**

Create `scripts/test-practice-command-view.mjs` using the repository's existing temporary-file and headless-Edge pattern. Load `index.html#/lesson/cpu-architecture-data`, then assert:

```js
checks.commandRendered = Boolean(document.querySelector("[data-practice-command] pre code"));
checks.commandLabel = document.querySelector("[data-practice-command] [data-command-label]")?.textContent.trim() === "PowerShell";
checks.copyButtonNamed = document.querySelector("[data-copy-practice-command]")?.getAttribute("aria-label")?.includes("PowerShell");
checks.commandContainsPointerCheck = document.querySelector("[data-practice-command-code]")?.textContent.includes("ctypes.sizeof(ctypes.c_void_p)");
```

The test must also stub `navigator.clipboard.writeText`, activate the button, await the result, and assert copied text, visible `Copied` state, retained button focus, and live-region confirmation. Replace the stub with a rejecting function and assert the fallback selects only that command and announces `Press Ctrl+C to copy`.

- [ ] **Step 10: Run the command-rendering test and verify RED**

Run:

```powershell
node .\scripts\test-practice-command-view.mjs
```

Expected: FAIL because `data-practice-command` and the copy behavior do not exist.

- [ ] **Step 11: Implement command rendering and copy behavior**

In `app.js`:

1. Add `renderPracticeCommands(step, stepIndex)` that escapes the label/code and renders the four specified data attributes, a `type="button"` copy control, and a polite status node.
2. Insert its output directly after the step `<h4>` and before the explanatory paragraphs.
3. Add `wirePracticeCommands()` and call it after `wireQuizzes()` in `renderLesson()`.
4. On success, set button text to `Copied`, announce `PowerShell command copied.`, keep focus on the button, and restore `Copy` when that button loses focus rather than with an arbitrary timer.
5. On Clipboard API absence or rejection, create a `Range` over only the relevant code node, replace the current selection, announce `Command selected. Press Ctrl+C to copy.`, and keep the command visible.

- [ ] **Step 12: Implement responsive command styling**

In `styles.css`, add `.practice-command`, `.practice-command-head`, `.practice-command-copy`, and code-region rules beside the existing practice styles. Use the existing panel colors and focus convention. Require `min-width: 0`, `overflow-x: auto` on the preformatted region, visible `:focus-visible`, wrapping header controls, and content-size selectors for small/default/large modes.

- [ ] **Step 13: Integrate the validator with the course audit**

Import `practiceDownloads` and `validatePractice` in `scripts/audit-course.mjs`. Replace the singular-download collection at the current practice loop with normalised singular/plural downloads. Append validation errors and warnings with the lesson prefix. Count investigations, commands, and all artifact paths, and print:

```text
guided investigations: 62
practice command blocks: <count>
downloads checked: 51
```

Run clarity validation in warning mode for Task 1; structural errors still fail the audit.

- [ ] **Step 14: Update the release cache key**

Change every tied local asset query in `index.html` from `stage-7-assessment-2` or `stage-6-depth` to `guided-investigation-1`. Do not leave mixed cache keys.

- [ ] **Step 15: Verify Task 1**

Run:

```powershell
node --check .\app.js
node --check .\scripts\practice-audit.mjs
node .\scripts\test-practice-audit.mjs
node .\scripts\test-practice-command-view.mjs
node .\scripts\audit-course.mjs
node .\scripts\test-assessment-integration.mjs
node .\scripts\test-assessment-layout.mjs
git diff --check
```

Expected: all commands exit 0. The audit may report unresolved-instruction warnings for modules not yet rewritten, but must report no structural errors.

- [ ] **Step 16: Review and commit Task 1**

Request a code/content review of the Task 1 diff. Fix all Critical and Important findings, rerun Step 15, then commit:

```powershell
git add app.js styles.css index.html lesson-depth-foundations.js scripts\audit-course.mjs scripts\practice-audit.mjs scripts\test-practice-audit.mjs scripts\test-practice-command-view.mjs
git commit -m "Add copyable investigation commands"
```

- [ ] **Step 17: Publish and verify Task 1**

Fast-forward `main`, rerun the focused tests there, push `main`, wait for the exact Pages workflow SHA, and verify the public `index.html` contains `guided-investigation-1` before beginning Task 2.

---

### Task 2: Audit and rewrite Modules 1–5

**Files:**

- Modify: `lesson-depth-foundations.js`
- Modify: `lesson-depth-processes.js`
- Modify: `lesson-depth-threads.js`
- Modify: `lesson-depth-memory.js`
- Modify: `lesson-depth-linking.js`
- Create: `downloads/file_open_trace_lab.py`
- Modify: `scripts/test-practice-audit.mjs`
- Modify: `index.html`

**Interfaces:**

- Consumes the `step.commands` renderer and `validatePractice()` from Task 1.
- Produces clarity-clean practices for module IDs `foundations`, `processes-handles`, `threads-scheduling`, `memory`, and `linking-loading`.

- [ ] **Step 1: Add the Modules 1–5 clarity assertion and verify RED**

Extend `scripts/test-practice-audit.mjs`:

```js
const firstBatch = new Set(["foundations", "processes-handles", "threads-scheduling", "memory", "linking-loading"]);
const firstBatchFindings = lessons
  .filter((lesson) => firstBatch.has(lesson.module))
  .flatMap((lesson) => {
    const result = validatePractice(lesson.practice, lesson.id, { enforceClarity: true });
    return [...result.errors, ...result.warnings];
  });
assert.deepEqual(firstBatchFindings, [], firstBatchFindings.join("\n"));
```

Run `node .\scripts\test-practice-audit.mjs`.

Expected: FAIL listing the remaining vague references and terminal steps without exact commands in Modules 1–5.

- [ ] **Step 2: Inventory the real command contract for every Modules 1–5 artifact**

For each `practice.download` and `practice.downloads` entry in the five lesson-depth files, inspect the Python file's `argparse`, `sys.argv`, prompts, pause points, output fields, and cleanup. Encode the exact filename and invocation in the lesson step; do not invent flags absent from the artifact or change an artifact merely to simplify the prose. Run `py <file> --help` only when the file defines help safely; otherwise inspect the source without executing configuration-changing behavior.

- [ ] **Step 3: Rewrite all foundations investigations**

Review all eight foundations lessons. In particular:

- replace the unspecified elevated-process Python command with a complete `py -c` PowerShell block that prints `sys.executable` and PID and waits for Enter;
- add `downloads/file_open_trace_lab.py` for the two practices that currently ask the learner to create or run an unwritten multi-line file-open program;
- name `who_am_i.py` wherever the lesson currently says starter or script;
- give exact Process Monitor filter fields, Process Explorer column/menu paths, capture timing, and unavailable-symbol branches;
- repeat complete commands instead of referring to previous commands.

- [ ] **Step 4: Create and syntax-check `file_open_trace_lab.py`**

The artifact must accept an optional owned temporary-file path, print its executable path and PID, create/open the file, pause once while the handle is owned, close it, pause once after closure, and remove only a file it created after confirmation or explicit `--cleanup`. Its help and pause text must match the lesson commands. Run:

```powershell
py -c "import ast, pathlib; ast.parse(pathlib.Path(r'.\\downloads\\file_open_trace_lab.py').read_text(encoding='utf-8'))"
py .\downloads\file_open_trace_lab.py --help
```

- [ ] **Step 5: Rewrite processes and handles investigations**

Review all six lessons. Name every downloaded file, provide its exact PowerShell command, identify pause points, repeat PIDs/paths where later steps consume them, identify Process Explorer lower-pane mode and WinObj namespace paths, and distinguish access denied from a missing object or exited process.

- [ ] **Step 6: Rewrite threads and scheduling investigations**

Review all five lessons. Provide exact commands for each worker count/mode, name output files and timing boundaries, state whether each script is CPU- or I/O-bound, identify Process Explorer/Performance Monitor counters, and replace "same workload" with complete invocations whose only changed argument is visible.

- [ ] **Step 7: Rewrite memory investigations**

Review all seven lessons. Provide complete commands for sequential/strided modes, allocation stages, target PID input, CSV output path, page-fault mode, mapping roles, and heap/virtual comparisons. Name the VMMap view/column and distinguish reserve, commit, working set, image/private type, and unavailable target branches.

- [ ] **Step 8: Rewrite linking and loading investigations**

Review all six lessons. Name PE/module artifacts and owned target files, provide exact parser/loader commands, state how disposable copies are created and named, identify Process Monitor Image Load filters and Process Explorer module views, and make architecture mismatch, missing export, malformed PE, and unloaded-module branches explicit.

- [ ] **Step 9: Run the Modules 1–5 audit and verify GREEN**

Run:

```powershell
node .\scripts\test-practice-audit.mjs
node .\scripts\audit-course.mjs
```

Expected: the first-batch assertion passes; remaining clarity warnings belong only to Modules 6–10.

- [ ] **Step 10: Update cache key and verify rendering**

Change all tied asset queries in `index.html` to `guided-investigation-2`. Run the command-view browser test and inspect at least one command-heavy lesson from each of the five modules at desktop and compact width.

- [ ] **Step 11: Verify, review, commit, and publish Task 2**

Run all JavaScript syntax checks, Python parsing for every download, `test-practice-audit.mjs`, `test-practice-command-view.mjs`, the complete course audit, assessment integration/layout tests, and `git diff --check`. Request content review focused on command accuracy and human readability. Fix all Critical/Important findings, then commit:

```powershell
git add lesson-depth-foundations.js lesson-depth-processes.js lesson-depth-threads.js lesson-depth-memory.js lesson-depth-linking.js downloads\file_open_trace_lab.py scripts\test-practice-audit.mjs index.html
git commit -m "Clarify guided investigations for modules one to five"
```

Fast-forward and push `main`, wait for the exact Pages workflow, and verify the public cache key `guided-investigation-2` before Task 3.

---

### Task 3: Checkpoints and closed-loop Modules 6–10

**Files:**

- Modify: `app.js`
- Modify: `styles.css`
- Modify: `scripts/practice-audit.mjs`
- Modify: `lesson-depth-management.js`
- Modify: `lesson-depth-security.js`
- Modify: `lesson-depth-sync-ipc.js`
- Modify: `lesson-depth-hooking.js`
- Modify: `scripts/test-practice-audit.mjs`
- Modify: `scripts/test-practice-command-view.mjs`
- Create: `scripts/test-practice-checkpoint-view.mjs`
- Modify: `index.html`

**Interfaces:**

- Consumes Task 1 command blocks and Task 2's first-batch clarity work.
- Adds `practice.checkpoints?: Array<ShortCheckpoint | ChoiceCheckpoint>` where `afterStep` is a one-based step number.
- `ShortCheckpoint` has exactly `{ afterStep, type: "short", prompt, answer, acceptedAnswers?, feedback }`.
- `ChoiceCheckpoint` has exactly `{ afterStep, type: "choice", prompt, options, answerIndex, feedback }`.
- Produces closed-loop practices for module IDs `management`, `security`, `synchronisation`, `ipc`, and `hooking-injection`.

- [ ] **Step 1: Add checkpoint validation fixtures and verify RED**

Extend `scripts/test-practice-audit.mjs` with one valid short checkpoint and one valid choice checkpoint. Add invalid fixtures for an extension, the rejected five-part writing instruction, unsupported checkpoint fields, an out-of-range `afterStep`, empty answers, fewer than two choice options, an out-of-range `answerIndex`, three checkpoints, two choice checkpoints, and a prompt that asks for a live PID. Require each invalid fixture to return the named error.

Run `node .\scripts\test-practice-audit.mjs`.

Expected: FAIL because the validator does not yet enforce closed-loop or checkpoint rules.

- [ ] **Step 2: Implement the validator rules and verify GREEN**

In `scripts/practice-audit.mjs`, validate `practice.extension`, task verbs across `action`, `observe`, step `hint`, practice hints, and expected outcome, and the exact checkpoint unions above. Check one-based `afterStep`, trimmed fixed answers, choice bounds, the two-checkpoint/one-choice limits, and dynamic-answer wording. Return `checkpointCount` and `choiceCheckpointCount` with the existing validation result.

Keep the closed-loop verb patterns narrow enough that explanatory lesson prose is unaffected; validation applies only to practice task fields. Run `node .\scripts\test-practice-audit.mjs` and require every fixture to pass.

- [ ] **Step 3: Write the failing checkpoint browser test**

Create `scripts/test-practice-checkpoint-view.mjs` using the repository's headless-Edge helper pattern. Inject a deterministic short checkpoint and choice checkpoint through a fixture lesson, then assert that each appears immediately after its `afterStep`, has a visible prompt, an accessible form control, a `Check answer` button, and a polite feedback region. Assert that `OS`, ` os `, and an accepted alias pass the short check; a wrong answer shows corrective feedback but remains editable; the correct choice passes; navigating away and back restores blank unchecked controls.

Run `node .\scripts\test-practice-checkpoint-view.mjs`.

Expected: FAIL because checkpoint markup and wiring do not exist.

- [ ] **Step 4: Render and wire transient checkpoints**

In `app.js`, add `renderPracticeCheckpoints(practice, afterStep)` and `wirePracticeCheckpoints()`. Render short answers as a labelled text input and choices as a `fieldset`/`legend` radio group. Add stable test hooks `data-practice-checkpoint`, `data-checkpoint-input`, `data-checkpoint-option`, `data-checkpoint-check`, and `data-checkpoint-feedback`. Insert each checkpoint after the matching list item content, compare short answers with `trim().toLocaleLowerCase()`, and use no storage API. Incorrect answers remain editable; feedback uses `role="status"` and does not move focus.

In `styles.css`, add practice-card-consistent checkpoint spacing, input, option, feedback, correct/incorrect text cues, and visible `:focus-visible` rules. Correctness must have a textual cue and not rely on color. Run the checkpoint browser test until GREEN.

- [ ] **Step 5: Add the Modules 6–10 closed-loop assertion and verify RED**

Add the second module set to `scripts/test-practice-audit.mjs`, validate with `enforceClarity: true`, and assert an empty finding list. Run the test and confirm it fails on remaining vague references, missing commands, off-page tasks, extensions, and malformed external-tool instructions.

- [ ] **Step 6: Inventory every Modules 6–10 artifact and evidence contract**

Inspect each referenced download's arguments, prompts, output, privileges, state changes, and cleanup. Match the displayed commands exactly to the artifact rather than modifying the artifact to fit a guessed command. Configuration-changing and security-context scripts are inspected statically unless their existing controlled test mode is explicitly safe.

- [ ] **Step 7: Rewrite management investigations**

Review all six lessons. Name Registry paths/views, service names, query/change modes, architecture probes, elevation requirements, and confirmation flags. Provide exact commands for inventory versus state change. Keep restoration inside supplied commands or artifact modes; show the restored state on the page or in the tool without asking the learner to record or explain it. Remove every extension and off-page deliverable. Add a checkpoint only for a worthwhile fixed artifact result.

- [ ] **Step 8: Rewrite security investigations**

Review all seven lessons. Replace `starter`, `same script`, and `controlled pair` with filenames and complete commands. Name normal/elevated terminals separately, state where SIDs/integrity/privilege values appear, identify exact Process Explorer `Properties > Security` tabs and fields, and make absent privilege, access denied, cancellation, and restoration branches explicit. Convert comparisons into visible observations, not tables or written explanations.

- [ ] **Step 9: Rewrite synchronisation investigations**

Review all six synchronisation lessons in `lesson-depth-sync-ipc.js`. Provide complete commands for each role/mode, say which terminal starts first, name events/mutexes/semaphores, identify expected wait codes and timeout/abandoned branches, and state the process/thread cleanup order. Use a short evidence blank for a deliberately fixed wait result only when it materially checks the run.

- [ ] **Step 10: Rewrite IPC investigations**

Review all five IPC lessons in `lesson-depth-sync-ipc.js`. Provide separate labelled command blocks for server/client or producer/consumer terminals, name pipe/mapping/output identifiers, state startup order and blocking point, and make EOF, unavailable endpoint, timeout, partial transfer, and cleanup evidence explicit.

- [ ] **Step 11: Rewrite hooking and injection investigations**

Review all six lessons. Name `memory_provenance_lab.py`, `pe_imports_lab.py`, and `module_baseline_lab.py`; provide exact read-only/owned-target commands; identify Process Explorer, VMMap, ListDLLs, or Sigcheck views; and replace survey/reader/starter wording with concrete artifacts and visible output fields. For Process Explorer DLL evidence, require `View > Show Lower Pane`, `View > Lower Pane View > DLLs`, lower-pane `Select Columns > DLL > Base Address`, and the exact module row. Use `Properties > Threads` only for a selected TID's start address. Preserve the existing non-payload, diagnostic scope.

- [ ] **Step 12: Run the Task 3 content and interaction gates**

Extend `scripts/test-practice-command-view.mjs` to load `#/lesson/events-waits`, assert that its creator and waiter PowerShell blocks are independently labelled, copy the waiter block, and confirm that the creator block's button/status does not change. Then run `node .\scripts\test-practice-audit.mjs`, `node .\scripts\test-practice-command-view.mjs`, and `node .\scripts\audit-course.mjs`.

Also run `node .\scripts\test-practice-checkpoint-view.mjs`. Expected: the Modules 6–10 assertion passes, checkpoint fixtures and browser interactions pass, and any remaining course warnings belong only to Modules 1–5 closed-loop debt scheduled for Task 4.

- [ ] **Step 13: Update cache key and verify rendering**

Change every tied asset query to `guided-investigation-3`. Browser-check one command-heavy lesson from each Task 3 module and every authored checkpoint at desktop and compact width. Confirm no investigation contains an extension card.

- [ ] **Step 14: Verify, review, commit, and publish Task 3**

Run JavaScript syntax checks, Python parsing for every download, all practice tests, the complete course audit, browser layout/integration tests, and `git diff --check`. Request content review focused on commands, permissions, failure branches, and cleanup. Fix all Critical/Important findings, then commit:

```powershell
git add app.js styles.css lesson-depth-management.js lesson-depth-security.js lesson-depth-sync-ipc.js lesson-depth-hooking.js scripts\practice-audit.mjs scripts\test-practice-audit.mjs scripts\test-practice-command-view.mjs scripts\test-practice-checkpoint-view.mjs index.html
git commit -m "Close guided investigations for modules six to ten"
```

Fast-forward and push `main`, wait for the exact Pages workflow, and verify `guided-investigation-3` live before Task 4.

---

### Task 4: Modules 1–5 closed-loop retrofit and zero-warning release

**Files:**

- Modify: `lesson-depth-foundations.js`
- Modify: `lesson-depth-processes.js`
- Modify: `lesson-depth-threads.js`
- Modify: `lesson-depth-memory.js`
- Modify: `lesson-depth-linking.js`
- Modify: `scripts/audit-course.mjs`
- Modify: `scripts/test-practice-audit.mjs`
- Modify: `scripts/test-practice-command-view.mjs`
- Modify: `scripts/test-practice-checkpoint-view.mjs`
- Create: `scripts/test-practice-command-layout.mjs`
- Modify: `PLAN.md`
- Modify: `index.html`

**Interfaces:**

- Consumes Task 3's closed-loop/checkpoint validator and transient renderer.
- Produces closed-loop practices for module IDs `foundations`, `processes-handles`, `threads-scheduling`, `memory`, and `linking-loading`.
- Changes the complete course audit to `enforceClarity: true` for all lessons.
- Produces a final audit record containing investigation, command-block, checkpoint, and checked-artifact totals.

- [ ] **Step 1: Write the failing full-course closed-loop assertion**

In `scripts/test-practice-audit.mjs`, validate every merged lesson with `enforceClarity: true`, collect all errors and warnings, and assert both arrays are empty. Assert exactly 62 investigations, zero extensions, no off-page-task findings, no dynamic checkpoint answers, no more than two checkpoints per investigation, no more than one choice checkpoint per investigation, and every authored download path returned by `practiceDownloads()`.

Run the test. Expected: FAIL on Modules 1–5 writing, recording, classification, calculation, diagram, extension, and external-tool path debt.

- [ ] **Step 2: Retrofit foundations investigations**

Review all eight foundations practices against the closed-loop standard. Delete five-part distinctions, conversion worksheets, observation tables, diagrams, explanatory writing, and every extension. Keep supplied commands and visible evidence. Correct Process Explorer instructions so a module base uses the DLL lower pane and a thread start address uses `Properties > Threads`; do not substitute `View > Select Columns > Process Performance > Start Address`. Add only deterministic evidence blanks justified by supplied artifacts.

- [ ] **Step 3: Retrofit processes and handles investigations**

Review all six practices. Remove requests to list, classify, compare in writing, or explain collected values. Make PID/path transfer immediate, name exact Handles/DLL lower-pane modes and columns, show deterministic artifact evidence, and keep unavailable/access-denied branches observable. Remove every extension.

- [ ] **Step 4: Retrofit threads and scheduling investigations**

Review all five practices. Remove written timing tables, scheduler explanations, and hardware/software distinction homework. Commands may display timings and relationships, but checkpoints may test only invariant artifact output or one meaningful distinction whose answer the page knows. Remove every extension.

- [ ] **Step 5: Retrofit memory investigations**

Review all seven practices. Remove address arithmetic worksheets, manually recorded VMMap tables, classifications, predictions, and explanations. Preserve controlled allocation transitions and exact VMMap/Performance Monitor navigation. Dynamic addresses, counters, and elapsed times remain observations only and are never checkpoint answers. Remove every extension.

- [ ] **Step 6: Retrofit linking and loading investigations**

Review all six practices. Remove hand-authored inventories, reports, comparisons, and explanations. Keep supplied parsers/loaders and exact Process Monitor/Process Explorer module paths. Where a supplied artifact deliberately exposes a distinctive module or fixed import, prefer one short evidence blank such as `i_love_[____].dll`; otherwise add no question. Remove every extension.

- [ ] **Step 7: Enable the strict course-audit gate**

Call `validatePractice(..., { enforceClarity: true })` for every lesson in `scripts/audit-course.mjs`. Treat every returned warning as release-blocking by setting a non-zero exit code when warnings remain. Preserve separate error/warning output so the author knows whether a finding is malformed data or prose requiring review.

Print measured `guided investigations`, `practice command blocks`, `practice checkpoints`, `choice checkpoints`, and `downloads checked` totals. Run `node .\scripts\test-practice-audit.mjs` and `node .\scripts\audit-course.mjs`; require zero errors and zero warnings.

- [ ] **Step 8: Write the failing command-and-checkpoint layout browser test**

Create `scripts/test-practice-command-layout.mjs` using the real site and true CDP device emulation. At desktop, compact, Edge-minimum, and 390-pixel widths, and for small/default/large text sizes, assert:

```js
{
  commandVisible: true,
  noDocumentOverflow: true,
  noPracticeOverflow: true,
  commandScrollContained: true,
  copyButtonVisible: true,
  copyTargetAtLeast40: true,
  codeReadable: true,
  checkpointVisible: true,
  checkpointContained: true,
  checkpointControlReachable: true,
  checkpointFeedbackReadable: true
}
```

Use an intentionally long real command from the audited lessons. The first run must fail because this test and any required responsive refinements do not yet exist.

- [ ] **Step 9: Refine responsive/accessibility behavior until GREEN**

Make the smallest `styles.css` or `app.js` changes required by the layout test. Do not alter instructional content in response to a layout problem. Run both command browser tests after every refinement.

- [ ] **Step 10: Perform the final human-readability pass**

Read every rendered investigation in course order. For each, verify the action-prerequisite-command-evidence-cleanup chain against the specification. Confirm commands use the actual download filename, PowerShell syntax, and real artifact arguments. Confirm GUI menu paths name every setting needed to reveal evidence. Confirm the investigation ends on the webpage with no request to record, write, explain, classify, calculate, draw, design, research, reconstruct code, or perform an independent extension.

- [ ] **Step 11: Update the plan and release key**

Add a dated guided-investigation clarity audit record to `PLAN.md` with measured totals from the strict audit, including checkpoint and choice counts. Change every tied asset query in `index.html` to `guided-investigation-4`.

- [ ] **Step 12: Run the complete release gate**

Run sequentially:

```powershell
Get-ChildItem -File -Filter *.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem .\scripts -File -Filter *.mjs | ForEach-Object { node --check $_.FullName }
Get-ChildItem .\downloads -File -Filter *.py | ForEach-Object { py -c "import ast, pathlib; ast.parse(pathlib.Path(r'$($_.FullName)').read_text(encoding='utf-8'))" }
node .\scripts\audit-course.mjs
Get-ChildItem .\scripts -File -Filter test-*.mjs | Sort-Object Name | ForEach-Object { node $_.FullName }
git diff --check
```

Expected: all commands exit 0; audit errors 0; audit warnings 0; 62 investigations validated; zero extensions and off-page tasks; checkpoint sparsity limits satisfied; every singular/plural download checked; every browser/layout assertion true.

- [ ] **Step 13: Final review and commit**

Request final code review and separate instructional-content review against the approved spec. Fix every Critical/Important issue and repeat Step 12. Commit:

```powershell
git add PLAN.md index.html app.js styles.css lesson-depth-foundations.js lesson-depth-processes.js lesson-depth-threads.js lesson-depth-memory.js lesson-depth-linking.js scripts\audit-course.mjs scripts\test-practice-audit.mjs scripts\test-practice-command-view.mjs scripts\test-practice-checkpoint-view.mjs scripts\test-practice-command-layout.mjs
git commit -m "Complete guided investigation clarity audit"
```

- [ ] **Step 14: Publish and externally verify**

Fast-forward `main`, rerun the strict audit and command browser/layout tests there, push `main`, and wait for the exact GitHub Pages workflow SHA. Verify:

- public `index.html` contains `guided-investigation-4`;
- the pointer-size lesson displays its complete PowerShell block;
- a multi-line Python investigation shows both download and exact run command;
- a two-terminal IPC investigation shows independently labelled commands;
- the public site has no horizontal page overflow at 390 pixels.

Record the deployment run ID and final commit SHA in the handoff.

---

### Task 5: Self-contained case studies and cross-lesson reference gate

**Files:**

- Modify: `app.js`
- Modify: `styles.css`
- Modify: `lesson-depth-foundations.js`
- Modify: `lesson-depth-management.js`
- Modify: `scripts/practice-audit.mjs`
- Modify: `scripts/audit-course.mjs`
- Modify: `scripts/test-practice-audit.mjs`
- Create: `scripts/test-practice-case-study-view.mjs`
- Modify: `scripts/test-practice-command-layout.mjs`
- Modify: `PLAN.md`

**Interfaces:**

- Consumes the Task 4 command/checkpoint renderer, strict validator, all-download runtime-prompt reader, and true-CDP layout matrix.
- Adds optional `practice.caseStudy: { label: string, title: string, summary: string, sections: CaseStudySection[] }`.
- A `CaseStudySection` has exactly `title` plus at least one of `body: string`, `facts: Array<[string, string]>`, or `code: string`; section titles are unique.
- Adds optional `step.caseStudySections: string[]`; every name resolves to a local section and at least two distinct steps must consume the case study.
- Produces exactly two case-study practices in `lesson-depth-foundations.js`: `reading-winapi-docs` and `calling-winapi-python`.
- Keeps `system-calls-win32` as a non-case-study investigation by placing its one required CreateFileW fact set directly in its consuming step.
- Corrects the carried EventLog query evidence so it promises only fields actually printed by `service_controller_lab.py query EventLog`.

- [ ] **Step 1: Add failing case-study and reference fixtures**

Extend `scripts/test-practice-audit.mjs` with a valid case-study fixture and invalid fixtures for unsupported case-study fields, duplicate section titles, a section without body/facts/code, malformed fact rows, a nonexistent `caseStudySections` name, a step reference without a case study, only one consuming step, and a decorative case study with no consumers. Add cross-lesson fixtures that must fail for:

```js
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
assert.deepEqual(validatePractice(validCaseStudy, "valid case study", { enforceClarity: true }).errors, []);
```

Add cross-lesson fixtures that must fail for:

```js
[
  "Open the displayed example above.",
  "Return to the same walkthrough.",
  "Open the Assign ownership stage in the earlier card.",
  "Use the example elsewhere in this lesson."
]
```

Include positive fixtures for `Use the PID printed in step 1.` and `Refresh the same PID.` within one controlled practice. Run `node .\scripts\test-practice-audit.mjs`.

Expected: FAIL because `caseStudy`, `caseStudySections`, and the cross-lesson patterns are not validated.

- [ ] **Step 2: Implement exact case-study/reference validation**

In `scripts/practice-audit.mjs`, validate the exact unions from the Interfaces block, return `caseStudyCount` as `0` or `1`, and reject unresolved cross-lesson navigation in practice title/intro/safety, step action/why/observe/hint, expected outcome, practice hints, and cleanup. Do not reject named earlier-step outputs or legitimate same-process/same-file state inside a controlled investigation.

Use explicit allowed-field sets:

```js
const caseStudyFields = new Set(["label", "title", "summary", "sections"]);
const caseStudySectionFields = new Set(["title", "body", "facts", "code"]);
const caseStudyStepFields = new Set(["action", "commands", "why", "observe", "hint", "caseStudySections"]);
```

Keep existing step fields valid when `caseStudySections` is absent; the third set defines the complete supported step surface after this task rather than requiring a case study on every step.

Require at least two distinct consuming steps and resolve every `caseStudySections` item against the case-sensitive authored section title. Run the focused audit test until every fixture is GREEN.

- [ ] **Step 3: Add the real-course reference assertion and verify RED**

Extend the merged-course section of `scripts/test-practice-audit.mjs` to collect strict results for all 62 practices and assert zero cross-lesson-reference findings. Add exact assertions that `reading-winapi-docs` and `calling-winapi-python` have a case study, every other practice does not, and `system-calls-win32` contains no cross-lesson reference.

Run `node .\scripts\test-practice-audit.mjs`.

Expected: FAIL on the CreateFileW stage references in `reading-winapi-docs`, the wait/ctypes example and walkthrough references in `calling-winapi-python`, and the displayed CreateFileW reference in `system-calls-win32`.

- [ ] **Step 4: Rewrite the three affected foundations investigations**

In `reading-winapi-docs`, supply one case study titled `Opening an existing file with CreateFileW` with these sections: `Goal`, `Call choices`, `Parameter directions`, `Result and error`, and `Ownership`. Include the complete fixed behavior, `GENERIC_READ`, `FILE_SHARE_READ | FILE_SHARE_WRITE`, `OPEN_EXISTING`, `FILE_ATTRIBUTE_NORMAL`, required UTF-16 `lpFileName`, nullable `lpSecurityAttributes`, `INVALID_HANDLE_VALUE`, immediate `GetLastError`, and owned `CloseHandle` cleanup. Associate each step with the exact sections it consumes and remove every instruction to open a stage elsewhere in the lesson.

In `calling-winapi-python`, supply one case study titled `Interpreting wait results and ctypes failures` with sections `Wait results`, `Wrapper failure`, `ctypes declaration`, and `Immediate error capture`. Include fixed `WAIT_OBJECT_0`, `WAIT_TIMEOUT`, `pywintypes.error`, `WinDLL(..., use_last_error=True)`, `CloseHandle` argtypes/restype, the documented zero failure test, immediate `ctypes.get_last_error()`, and `ctypes.WinError(code)`. Associate the four steps with the exact local sections and remove example/walkthrough/stage navigation.

In `system-calls-win32`, rewrite the one dependent step to state its complete CreateFileW access, sharing, creation, failure, error, and cleanup facts directly. Do not add a case study for one consumer.

- [ ] **Step 5: Complete the manual all-62 dependency audit**

Read every practice in all `lesson-depth-*.js` files together with its surrounding lesson examples. For each action, why, observation, hint, intro, safety, expected outcome, and cleanup item, determine whether the learner must leave the practice to recover a fact. Keep named downloads, exact external-tool views, and named earlier-step outputs. Rewrite any semantic cross-lesson dependency found even if no banned phrase matched. Do not add a case study unless at least two steps share the same fixed source.

Also correct the carried `control-services-python` mismatch in `lesson-depth-management.js`: query mode promises only the returned service state and PID plus normal service/SCM handle cleanup; it does not promise checkpoint, wait hint, accepted controls, or service exit-code fields that query mode does not print.

- [ ] **Step 6: Write the failing real-browser case-study test**

Create `scripts/test-practice-case-study-view.mjs` with the existing temporary-site/headless-Edge pattern. Load `#/lesson/reading-winapi-docs` and assert:

```js
{
  oneCaseStudy: true,
  beforeSteps: true,
  alwaysVisible: true,
  notDetailsOrDialog: true,
  labelAndTitleVisible: true,
  fiveSectionHeadings: true,
  semanticFactPairs: true,
  exactSectionReferences: true,
  noCopyButton: true
}
```

Then load one executable download practice and assert `data-practice-case-study` is absent. Run the test.

Expected: FAIL because the renderer and data hooks do not exist.

- [ ] **Step 7: Render and style the singular case study**

In `app.js`, add `renderPracticeCaseStudy(practice)` and insert it after the intro/safety content and before expected outcome/steps. Escape every label, title, summary, fact, body, and code value. Render facts as semantic `<dl><dt><dd>` associations, code only in `<pre><code>`, and visible step references using the exact authored section title. Add test hooks `data-practice-case-study`, `data-case-study-section`, `data-case-study-facts`, and `data-case-study-reference`.

The rendered hierarchy is:

```html
<section class="practice-case-study" data-practice-case-study>
  <header><!-- escaped label, title, summary --></header>
  <section data-case-study-section><!-- heading plus body, dl facts, and/or pre code --></section>
</section>
<!-- each consuming step contains visible "Use case study: Section title" references -->
```

In `styles.css`, use the existing practice-card colors and spacing, clear section hierarchy, `min-width: 0`, contained preformatted overflow, visible section-reference text, and content-size selectors. Do not make fact/body sections look like a terminal, and do not add dropdown, popup, sticky, copy, or persistence behavior. Run the case-study browser test until GREEN.

- [ ] **Step 8: Extend strict totals and layout coverage**

Aggregate `caseStudyCount` in `scripts/audit-course.mjs` and print `practice case studies: 2`. Extend `scripts/test-practice-command-layout.mjs` to load `reading-winapi-docs` and assert the case-study box, fact rows, section references, and any code region remain contained at 1440, 900, 500, and true 390-pixel widths under small/default/large content sizes. Preserve all existing 132 command/checkpoint assertions and add the new case-study assertions rather than replacing them.

- [ ] **Step 9: Update the audit record and confirm the unpublished cache key**

Assert that every existing tied asset and browser fixture still uses `guided-investigation-5`, which has not been published. Update `PLAN.md` to record 62 investigations, 147 command blocks, 2 case studies, 11 checkpoints, 2 choice checkpoints, 55 downloads, and zero errors/warnings.

- [ ] **Step 10: Run the complete release gate**

Run sequentially:

```powershell
Get-ChildItem -File -Filter *.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem .\scripts -File -Filter *.mjs | ForEach-Object { node --check $_.FullName }
Get-ChildItem .\downloads -File -Filter *.py | ForEach-Object { py -c "import ast, pathlib; ast.parse(pathlib.Path(r'$($_.FullName)').read_text(encoding='utf-8'))" }
node .\scripts\audit-course.mjs
Get-ChildItem .\scripts -File -Filter test-*.mjs | Sort-Object Name | ForEach-Object { node $_.FullName }
git diff --check
```

Expected: all commands exit 0; 62 investigations; 147 commands; 2 case studies; 11 checkpoints; 2 choices; 55 downloads; zero errors/warnings; every existing and new browser/layout assertion true.

- [ ] **Step 11: Review and commit Task 5**

Request a task-scoped code/content review that explicitly checks case-study restraint, all-62 manual audit evidence, the three foundations rewrites, the EventLog evidence correction, cross-lesson false-positive handling, semantics, escaping, and compact layout. Fix every Critical/Important finding and repeat Step 10. Commit only:

```powershell
git add app.js styles.css lesson-depth-foundations.js lesson-depth-management.js scripts\practice-audit.mjs scripts\audit-course.mjs scripts\test-practice-audit.mjs scripts\test-practice-case-study-view.mjs scripts\test-practice-command-layout.mjs PLAN.md
git commit -m "Add self-contained investigation case studies"
```

- [ ] **Step 12: Final combined review and publication**

Generate one combined review package from public `main` SHA `a83c9fdbef6f71081c1ff9c1a7a95bfa4733db47` through Task 5 head so it includes the unpushed final-review fixes, the approved design/plan commits, the EventLog correction, and case-study implementation. Resolve the review under the normal five-round task loop if required.

After approval, fast-forward `main`, rerun the strict audit plus case-study/command/checkpoint/layout browser tests there, push `main`, and wait for the exact GitHub Pages workflow SHA. Verify the public site serves `guided-investigation-5`, exactly two practice case studies, no external-stage references in the three affected foundations practices, the corrected EventLog evidence, unchanged script/download/external-tool investigation formats, and contained case-study rendering at 390 pixels. Record the final SHA and Pages run ID.
