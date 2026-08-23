# Guided Investigation Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every one of the course's 62 guided investigations independently understandable and executable, with exact copyable PowerShell commands, complete downloads for multi-line programs, precise Windows-tool instructions, and automated regression protection.

**Architecture:** Add optional `commands` metadata to practice steps and render it as accessible copyable command blocks. Extract practice validation into a focused Node module used by the course audit, then rewrite the lesson content in two module batches before enabling a zero-warning clarity gate across the complete course.

**Tech Stack:** Dependency-free HTML, CSS, browser JavaScript, Node.js audit/test scripts, headless Microsoft Edge, static GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-24-guided-investigation-clarity-design.md`

## Global Constraints

- Audit all 62 guided investigations; keyword-only remediation is not sufficient.
- Direct terminal input must be displayed as a complete copyable PowerShell block in the step that requires it.
- Multi-line Python work must provide a complete `.py` download and an exact PowerShell invocation.
- GUI/tool steps must name the tool, target, interface path or filter, timing, evidence, and unavailable branch where applicable.
- A later step must name the earlier output it consumes; unresolved references such as "the script" or "the same command" are not acceptable.
- Do not add response forms, stored progress, automatic execution, a backend, or artificial command blocks to reasoning-only steps.
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
    observe: "Record the printed PID and pointer width.",
  }],
  download: ["downloads/one.py", "one.py", "Download one.py"],
}, "fixture", { enforceClarity: true });
assert.deepEqual(valid.errors, []);
assert.deepEqual(valid.warnings, []);

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

For each `practice.download` and `practice.downloads` entry in the five lesson-depth files, inspect the Python file's `argparse`, `sys.argv`, prompts, pause points, output fields, and cleanup. Record the exact filename and invocation in the lesson step; do not invent flags absent from the artifact or change an artifact merely to simplify the prose. Run `py <file> --help` only when the file defines help safely; otherwise inspect the source without executing configuration-changing behavior.

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

### Task 3: Audit and rewrite Modules 6–10

**Files:**

- Modify: `lesson-depth-management.js`
- Modify: `lesson-depth-security.js`
- Modify: `lesson-depth-sync-ipc.js`
- Modify: `lesson-depth-hooking.js`
- Modify: `scripts/test-practice-audit.mjs`
- Modify: `scripts/test-practice-command-view.mjs`
- Modify: `index.html`

**Interfaces:**

- Consumes Task 1 command blocks and Task 2's clarity-clean first batch.
- Produces clarity-clean practices for module IDs `management`, `security`, `synchronisation`, `ipc`, and `hooking-injection`.

- [ ] **Step 1: Add the Modules 6–10 clarity assertion and verify RED**

Add the second module set to `scripts/test-practice-audit.mjs`, validate with `enforceClarity: true`, and assert an empty finding list. Run the test and confirm it fails on the remaining vague references and missing commands.

- [ ] **Step 2: Inventory the real command contract for every Modules 6–10 artifact**

Inspect each referenced download's arguments, prompts, output, privileges, state changes, and cleanup. Match the displayed commands exactly to the artifact rather than modifying the artifact to fit a guessed command. Configuration-changing and security-context scripts are inspected statically unless their existing controlled test mode is explicitly safe.

- [ ] **Step 3: Rewrite management investigations**

Review all six lessons. Name Registry paths/views, service names, query/change modes, architecture probes, elevation requirements, and confirmation flags. Provide exact commands for inventory versus state change and state how to record/restore the original Registry or service value.

- [ ] **Step 4: Rewrite security investigations**

Review all seven lessons. Replace `starter`, `same script`, and `controlled pair` with filenames and complete commands. Name normal/elevated terminals separately, state where SIDs/integrity/privilege values appear, identify Process Explorer Security paths, and make absent privilege, access denied, cancellation, and restoration branches explicit.

- [ ] **Step 5: Rewrite synchronisation investigations**

Review all six synchronisation lessons in `lesson-depth-sync-ipc.js`. Provide complete commands for each role/mode, say which terminal starts first, name events/mutexes/semaphores, identify expected wait codes and timeout/abandoned branches, and state the process/thread cleanup order.

- [ ] **Step 6: Rewrite IPC investigations**

Review all five IPC lessons in `lesson-depth-sync-ipc.js`. Provide separate labelled command blocks for server/client or producer/consumer terminals, name pipe/mapping/output identifiers, state startup order and blocking point, and make EOF, unavailable endpoint, timeout, partial transfer, and cleanup evidence explicit.

- [ ] **Step 7: Rewrite hooking and injection investigations**

Review all six lessons. Name `memory_provenance_lab.py`, `pe_imports_lab.py`, and `module_baseline_lab.py`; provide exact read-only/owned-target commands; identify Process Explorer, VMMap, ListDLLs, or Sigcheck views; and replace survey/reader/starter wording with the concrete artifact and output fields. Preserve the existing non-payload, diagnostic scope.

- [ ] **Step 8: Run the complete content audit and verify GREEN**

Extend `scripts/test-practice-command-view.mjs` to load `#/lesson/events-waits`, assert that its creator and waiter PowerShell blocks are independently labelled, copy the waiter block, and confirm that the creator block's button/status does not change. Then run `node .\scripts\test-practice-audit.mjs`, `node .\scripts\test-practice-command-view.mjs`, and `node .\scripts\audit-course.mjs`.

Expected: both module-batch assertions pass. Any remaining warnings are audit-heuristic false positives that must be resolved by clearer wording or a narrowly justified validator adjustment before continuing.

- [ ] **Step 9: Update cache key and verify rendering**

Change every tied asset query to `guided-investigation-3`. Browser-check at least one command-heavy lesson from management, security, synchronisation, IPC, and hooking/injection at desktop and compact width.

- [ ] **Step 10: Verify, review, commit, and publish Task 3**

Run JavaScript syntax checks, Python parsing for every download, all practice tests, the complete course audit, browser layout/integration tests, and `git diff --check`. Request content review focused on commands, permissions, failure branches, and cleanup. Fix all Critical/Important findings, then commit:

```powershell
git add lesson-depth-management.js lesson-depth-security.js lesson-depth-sync-ipc.js lesson-depth-hooking.js scripts\test-practice-audit.mjs scripts\test-practice-command-view.mjs index.html
git commit -m "Clarify guided investigations for modules six to ten"
```

Fast-forward and push `main`, wait for the exact Pages workflow, and verify `guided-investigation-3` live before Task 4.

---

### Task 4: Zero-warning release gate and final record

**Files:**

- Modify: `scripts/audit-course.mjs`
- Modify: `scripts/test-practice-audit.mjs`
- Modify: `scripts/test-practice-command-view.mjs`
- Create: `scripts/test-practice-command-layout.mjs`
- Modify: `PLAN.md`
- Modify: `index.html`

**Interfaces:**

- Changes the complete course audit from clarity-warning mode to `enforceClarity: true` for all lessons.
- Produces a final audit record containing investigation, command-block, and checked-artifact totals.

- [ ] **Step 1: Write the failing zero-warning release assertion**

In `scripts/test-practice-audit.mjs`, validate every merged lesson with `enforceClarity: true`, collect all errors and warnings, and assert both arrays are empty. Also assert exactly 62 investigations were validated and every authored download path is returned by `practiceDownloads()`.

Run the test and confirm any remaining wording or structural debt fails explicitly. If it passes immediately, temporarily restore one original vague fixture string and verify the assertion fails, then restore the audited content before implementation continues.

- [ ] **Step 2: Enable the strict course-audit gate**

Call `validatePractice(..., { enforceClarity: true })` for every lesson in `scripts/audit-course.mjs`. Treat every returned warning as release-blocking by setting a non-zero exit code when warnings remain. Preserve separate error/warning output so the author knows whether a finding is malformed data or prose requiring review.

- [ ] **Step 3: Write the failing command-layout browser test**

Create `scripts/test-practice-command-layout.mjs` using the real site and true CDP device emulation. At desktop, compact, Edge-minimum, and 390-pixel widths, and for small/default/large text sizes, assert:

```js
{
  commandVisible: true,
  noDocumentOverflow: true,
  noPracticeOverflow: true,
  commandScrollContained: true,
  copyButtonVisible: true,
  copyTargetAtLeast40: true,
  codeReadable: true
}
```

Use an intentionally long real command from the audited lessons. The first run must fail because this test and any required responsive refinements do not yet exist.

- [ ] **Step 4: Refine responsive/accessibility behavior until GREEN**

Make the smallest `styles.css` or `app.js` changes required by the layout test. Do not alter instructional content in response to a layout problem. Run both command browser tests after every refinement.

- [ ] **Step 5: Perform the final human-readability pass**

Read every rendered investigation in course order. For each, verify the action-prerequisite-command-evidence-cleanup chain against the specification. Confirm commands use the actual download filename, PowerShell syntax, and real artifact arguments. Confirm GUI menu paths and failure branches remain appropriate to the task rather than generic boilerplate.

- [ ] **Step 6: Update the plan and release key**

Add a dated guided-investigation clarity audit record to `PLAN.md` with measured totals from the strict audit. Change every tied asset query in `index.html` to `guided-investigation-4`.

- [ ] **Step 7: Run the complete release gate**

Run sequentially:

```powershell
Get-ChildItem -File -Filter *.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem .\scripts -File -Filter *.mjs | ForEach-Object { node --check $_.FullName }
Get-ChildItem .\downloads -File -Filter *.py | ForEach-Object { py -c "import ast, pathlib; ast.parse(pathlib.Path(r'$($_.FullName)').read_text(encoding='utf-8'))" }
node .\scripts\audit-course.mjs
Get-ChildItem .\scripts -File -Filter test-*.mjs | Sort-Object Name | ForEach-Object { node $_.FullName }
git diff --check
```

Expected: all commands exit 0; audit errors 0; audit warnings 0; 62 investigations validated; every singular/plural download checked; every browser/layout assertion true.

- [ ] **Step 8: Final review and commit**

Request final code review and separate instructional-content review against the approved spec. Fix every Critical/Important issue and repeat Step 7. Commit:

```powershell
git add PLAN.md index.html app.js styles.css lesson-depth-*.js downloads scripts docs\superpowers
git commit -m "Complete guided investigation clarity audit"
```

- [ ] **Step 9: Publish and externally verify**

Fast-forward `main`, rerun the strict audit and command browser/layout tests there, push `main`, and wait for the exact GitHub Pages workflow SHA. Verify:

- public `index.html` contains `guided-investigation-4`;
- the pointer-size lesson displays its complete PowerShell block;
- a multi-line Python investigation shows both download and exact run command;
- a two-terminal IPC investigation shows independently labelled commands;
- the public site has no horizontal page overflow at 390 pixels.

Record the deployment run ID and final commit SHA in the handoff.
