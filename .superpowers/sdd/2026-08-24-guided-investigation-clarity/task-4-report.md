# Task 4 implementation report

Date: 24 August 2026

Branch: `guided-investigation-audit`

Task base: `c474a7052d076df5053b5d2453d030d7ed34e8a4`

## Outcome

Task 4 completes the approved guided-investigation clarity overhaul. All 62 practices now pass the strict closed-loop audit with zero errors and zero warnings. The course contains 149 command blocks, 11 checkpoints, 2 choice checkpoints, and 55 checked download references. There are no practice extensions, off-page deliverables, dynamic checkpoint answers, first-batch prediction prompts, or first-batch worksheet fields.

The responsive command and checkpoint matrix is green at 1440, 900, 500, and true 390-pixel CDP-emulated widths with small, default, and large content sizes. The matrix checks 11 properties in each of 12 configurations, for 132 passing assertions.

## Scoped files

The implementation changes:

- `lesson-depth-foundations.js`
- `lesson-depth-processes.js`
- `lesson-depth-threads.js`
- `lesson-depth-memory.js`
- `lesson-depth-linking.js`
- `downloads/page_fault_lab.py`
- `downloads/module_lifetime_lab.py`
- `scripts/audit-course.mjs`
- `scripts/test-practice-audit.mjs`
- `scripts/test-practice-command-view.mjs`
- `scripts/test-practice-checkpoint-view.mjs`
- `scripts/test-practice-command-layout.mjs`
- `styles.css`
- `PLAN.md`
- `index.html`
- this report

The two download edits follow the controller's scope ruling that runtime pause text is learner-facing practice content. `page_fault_lab.py` changes three prompts from asking the learner to record counters to asking the learner to inspect them. `module_lifetime_lab.py` changes its baseline prompt from recording module state to inspecting it. No code path, argument, result, or cleanup behavior changed.

No unrelated file was edited. `stuff_to_add.txt` was absent from this isolated worktree and was neither created nor touched.

## TDD evidence

### Content RED

The first strict full-course test was added to `scripts/test-practice-audit.mjs` before rewriting Modules 1-5.

Command:

```powershell
node .\scripts\test-practice-audit.mjs
```

Initial result: exit 1. The test collected exactly 184 remaining findings across Modules 1-5: 32 extension findings and 152 off-page-task findings. The findings covered writing, recording, explanation, classification, calculation, diagram, design, research, and code-reconstruction work.

The first-batch artifact-prompt regression was then added before artifact changes. The same command exited 1 on `downloads/page_fault_lab.py`, identifying its runtime `Record ...` prompt as outside the closed-loop showcase. After the two scoped artifact edits, every first-batch download passed the runtime-prompt scan.

### Content GREEN

Focused final command:

```powershell
node .\scripts\test-practice-audit.mjs
```

Result: exit 0, `practice audit errors: 0`. All 62 practices were validated with `enforceClarity: true`; both returned arrays were empty.

### Layout RED

`scripts/test-practice-command-layout.mjs` was created before CSS changes. It uses the real `inspect-windows` lesson, whose audited PowerShell command is intentionally long and whose fixed Process Monitor checkpoint is real course content. It drives Edge through CDP `Emulation.setDeviceMetricsOverride` rather than relying on a headless-browser window-size flag.

Command:

```powershell
node .\scripts\test-practice-command-layout.mjs
```

Valid RED result: exit 1 with 34 failed assertions out of 132. The Copy button target was below 40 pixels in all 12 configurations. The practice workspace and command region overflowed in 11 configurations; only desktop/small avoided that specific overflow. This reproduced the missing grid-item containment on `.practice-step-copy` and the undersized Copy target.

The smallest implementation was:

- `.practice-step-copy { min-width: 0; }`
- a 40-pixel minimum width and height on `.practice-command-copy`

### Layout GREEN

Commands:

```powershell
node .\scripts\test-practice-command-layout.mjs
node .\scripts\test-practice-command-view.mjs
node .\scripts\test-practice-checkpoint-view.mjs
```

Results: all three exited 0. The layout matrix reported all 132 named assertions true. Copy success, clipboard rejection fallback, focus retention, independently labelled multi-command blocks, short and choice checkpoint checking, retry, feedback announcement, and navigation reset all remained green.

On this managed machine, headless Edge and the registered Python runtime cannot access their subprocess/registration state inside the filesystem sandbox. The exact browser and AST commands were therefore run outside that sandbox. This is an execution-environment constraint, not a repository failure; the commands and test implementations were unchanged.

## Manual audit coverage

Every rendered investigation was read in course order together with its lesson context, commands, expected evidence, and cleanup. Every first-batch downloaded artifact's argument parsing and runtime pauses were inspected against the displayed invocation.

### Module 1: Foundations, 8 of 8

Reviewed `cpu-architecture-data`, `why-operating-system`, `windows-organisation`, `user-kernel-mode`, `system-calls-win32`, `reading-winapi-docs`, `calling-winapi-python`, and `inspect-windows`.

The final practices use complete one-line Python commands or exact downloaded filenames. Architecture and pointer values remain command output. Thread Start Address is read only for a selected TID in `Properties > Threads`. File traces set exact Path and Operation filters before the actor starts, distinguish contract evidence from implementation stacks, and preserve access-denied, missing-symbol, dependency, and exited-target branches. Five-part worksheets, diagrams, recording, explanatory writing, and extensions were removed.

### Module 2: Processes and handles, 6 of 6

Reviewed `programs-processes-isolation`, `process-address-space`, `context-switch-process-metadata`, `createprocess-lifecycle`, `object-manager`, and `handles-rights-lifetime`.

Each process is matched by printed PID plus path or creation state. Lower-pane Handles and DLL modes are named explicitly. Notepad redirection has a two-Python-process fallback. Supplied actors expose controlled file, thread, object, process, and handle lifetime transitions. Collision guards precede owned files and directories; cleanup names exact owned targets. Lists, classifications, written comparisons, timing tables, and extensions were removed.

### Module 3: Threads and scheduling, 5 of 5

Reviewed `threads-in-processes`, `thread-context-states`, `create-end-threads`, `scheduler-dispatch`, and `priorities-boosts-starvation`.

Worker names transfer directly to printed native TIDs and `Properties > Threads`. Process Monitor TID evidence is configured through `Options > Select Columns`. Timing and throughput stay visible but machine-dependent. Priority work uses two owned 60-second workers, changes only one to Below Normal, restores Normal before exit, and never escalates to a helper swarm or system-wide change. Timing tables, scheduler explanations, predictions, and extensions were removed.

### Module 4: Memory, 7 of 7

Reviewed `binary-hex-addresses`, `memory-hierarchy-caches`, `virtual-address-translation`, `pages-frames-page-tables`, `page-faults-pagefile`, `shared-memory-copy-on-write`, and `virtualalloc-heaps-protection`.

VMMap uses `File > Select Process` and its lower Details view. The staged allocation follows reserved, committed, touched, protected, and released states without asking for address arithmetic. The restart practice reacquires a PID and handles an exited or redirected launcher. Performance Monitor uses `Monitoring Tools > Performance Monitor`, the green `+` Add Counters control, `Process V2` PID-named instances, and the documented `Process` plus `ID Process` fallback. Live addresses, page-fault counters, working sets, and elapsed times remain observations only. Address worksheets, recorded VMMap tables, classification, prediction, explanation, and extensions were removed.

### Module 5: Linking and loading, 6 of 6

Reviewed `compile-link-execute`, `static-dynamic-linking`, `pe-anatomy`, `sections-rvas`, `imports-exports-iat`, and `windows-loader`.

All parser work uses owned, collision-guarded copies and exact `py .\pe_inspector_lab.py <file>` invocations. HxD uses `File > Open` and `Search > Goto (Ctrl+G)` with the parser-produced raw offset. CFF Explorer uses named header, section, import, or export tree entries. Sigcheck is guarded with `Get-Command`; unavailable Sigcheck retains hash/parser/CFF evidence. The RVA practice now keeps raw-file evidence separate from a real restart identity and never asks the learner to combine a live base with an RVA. The old import-table reconstruction and untrusted execution task is gone.

For module bases, the four workflows `compile-link-execute`, `static-dynamic-linking`, `imports-exports-iat`, and `windows-loader` each name:

1. `View > Show Lower Pane`
2. `View > Lower Pane View > DLLs`
3. lower-pane `Select Columns > DLL > Base Address`
4. the exact module path row

No learner-facing practice presents a process-list performance column as thread or module Start Address evidence.

### Module 6: Management, 6 of 6

Re-read `registry-structure`, `registry-python`, `services-scm`, `control-services-python`, `svchost-background`, and `wow64-redirection` from the already strict-clean second batch. Registry changes are HKCU-scoped, collision-guarded, and restored without recursive deletion of unknown siblings. Service changes remain restricted to a pre-authorised non-critical disposable-VM service and restore starting state in `finally`. Other service, svchost, and WoW64 work is read-only with explicit access-denied and unavailable-architecture branches.

### Module 7: Security, 6 of 6

Re-read `security-model`, `users-groups-sids`, `access-tokens`, `security-descriptors-dacls-aces`, `access-check`, `privileges-impersonation`, and `uac-integrity` from the already strict-clean second batch. The module contains seven lessons despite its older six-lesson stage label. Probes target owned processes, current tokens, or disposable files. Access checks remain read-only; DACL cleanup preserves unknown siblings; privilege changes restore prior attributes; token launch is same-user and disposable-VM-only. The only checkpoint asks the fixed conceptual question that UAC elevation does not move PowerShell into kernel mode.

### Module 8: Synchronisation, 6 of 6

Re-read `concurrency-problems`, `atomicity-races`, `critical-sections-mutexes`, `semaphores`, `events-waits`, and `deadlocks-starvation`. Supplied barriers make the lost update controlled. Lock, mutex, semaphore, event, timeout, absent-name, and bounded deadlock branches are artifact-visible. Wait ownership and release guards are inspected directly. The only checkpoint asks for the artifact's fixed `WAIT_TIMEOUT` result.

### Module 9: IPC, 5 of 5

Re-read `why-ipc`, `anonymous-pipes`, `named-pipes`, `file-mappings-shared-memory`, and `choose-ipc`. The two-terminal and three-terminal commands remain independently labelled. Endpoint ownership, EOF, partial reads, framing limits, absent server, oversize payload, named mapping lifetime, and process cleanup are all visible from supplied artifacts. No external checkpoint was added because live topology and timing provide no useful invariant answer beyond the displayed artifacts.

### Module 10: Hooking and injection, 6 of 6

Re-read `hooking-injection`, `startup-code-loading`, `remote-memory-threads`, `position-independent-code`, `windows-hooks-iat`, and `detect-injection`. Work remains read-only, self-process-only, or static-file-only. Process Explorer module-base paths use the DLL lower pane with exact module rows. VMMap evidence is current-process provenance only. Static PE tools do not load or modify their target. Baseline JSON cleanup deletes only the two exact owned files. The single checkpoint uses the fixed System32 `user32.dll` artifact path.

## Checkpoint rationale and counts

No checkpoint is the default. Short blanks were kept only when a supplied artifact or fixed on-page example exposes a useful invariant token. Choice is used only for a meaningful distinction, never as a mechanical replacement for removed homework.

- Foundations: 3 checkpoints, 1 choice. Fixed evidence is `INVALID_HANDLE_VALUE`, `WAIT_OBJECT_0`, and Process Monitor/Procmon history.
- Processes and handles: 1 short checkpoint for `Local\ILOVEOS_ObjectLab`.
- Threads and scheduling: 0 checkpoints. TIDs, states, ordering, priority effects, and timing are dynamic.
- Memory: 2 short checkpoints for `reader updated shared bytes` and the artifact-fixed old protection `0x4`.
- Linking and loading: 2 short checkpoints for `version.dll` and the fixed MessageBoxW/IDOK result `1`.
- Management: 0 checkpoints. Registry, service, svchost, and architecture values are environment-dependent.
- Security: 1 choice checkpoint for the fixed user-mode/elevation distinction.
- Synchronisation: 1 short checkpoint for fixed `WAIT_TIMEOUT`.
- IPC: 0 checkpoints. Live IPC values and outcomes are already displayed and do not justify a separate invariant blank.
- Hooking and injection: 1 short checkpoint for fixed `user32.dll`.

Total: 11 checkpoints, 2 choice checkpoints. Every investigation is at or below two checkpoints and one choice checkpoint. No prompt requests PID, TID, address, base, path, timing, counter, inventory, or other machine-dependent data.

## External-tool audit

- Process Explorer process identity: exact printed PID is paired with executable path, creation time, or artifact role before inspection.
- Process Explorer thread evidence: selected TID in `Properties > Threads`; Start Address and Stack are read for that selected row only.
- Process Explorer handles: `View > Show Lower Pane`, `View > Lower Pane View > Handles`, followed by the exact owned path or fixed object suffix.
- Process Explorer modules: `View > Show Lower Pane`, `View > Lower Pane View > DLLs`, lower-pane `Select Columns`, `DLL`, `Base Address` and where needed `Path`/`Size`, followed by the exact module path row.
- Process Monitor: `File > Capture Events`, `Edit > Clear Display`, and `Filter > Filter` are ordered before the actor; Path, PID, Process Name, Operation, Category, and TID filters/columns are named at their consumption point.
- VMMap: `File > Select Process`, exact PID, then Summary or lower Details rows with named fields. Live values remain ungraded.
- Performance Monitor: `Monitoring Tools > Performance Monitor`, green `+` Add Counters, `Process V2` counters and PID-bearing instance, plus the `Process`/`ID Process` fallback and system-wide `Memory > Page Reads/sec` limitation.
- WinObj: the session number is obtained first, then `\Sessions\<id>\BaseNamedObjects` or the tool's current-session `\BaseNamedObjects` view is used for the exact fixed object.
- CFF Explorer: `File > Open` plus exact DOS, NT File Header, NT Optional Header, Section Headers, Import Directory, Export Directory, or Relocation Directory nodes.
- HxD: `File > Open`, exact owned copy, `Search > Goto (Ctrl+G)`, hex offset from the bounded parser, no save.
- Sigcheck, AccessChk, and ListDLLs: each optional command is guarded with `Get-Command` and has an explicit unavailable branch. No installed-tool inventory becomes a checkpoint answer.

## Strict audit and release record

Focused audit command:

```powershell
node .\scripts\audit-course.mjs
```

Result: exit 0.

```text
modules: 10
lessons: 62
deep lessons: 62
guided investigations: 62
practice command blocks: 149
practice checkpoints: 11
choice checkpoints: 2
downloads checked: 55
reference features: 347
API signature entries: 303
Windows API guide entries: 69
module review activities: 50
final assessment questions: 20
unique lesson/tool sources: 127
errors: 0
warnings: 0
```

The gate calls `validatePractice(..., { enforceClarity: true })` for every lesson and sets a failing exit code for either errors or warnings.

## Complete release gate

The required commands were run sequentially from the isolated worktree:

```powershell
Get-ChildItem -File -Filter *.js | ForEach-Object { node --check $_.FullName }
Get-ChildItem .\scripts -File -Filter *.mjs | ForEach-Object { node --check $_.FullName }
Get-ChildItem .\downloads -File -Filter *.py | ForEach-Object { py -c "import ast, pathlib; ast.parse(pathlib.Path(r'$($_.FullName)').read_text(encoding='utf-8'))" }
node .\scripts\audit-course.mjs
Get-ChildItem .\scripts -File -Filter test-*.mjs | Sort-Object Name | ForEach-Object { node $_.FullName }
git diff --check
```

Results:

- Root JavaScript syntax: exit 0.
- All `scripts/*.mjs` syntax: exit 0.
- All `downloads/*.py` AST parsing through the registered Python 3.14 runtime: exit 0.
- Strict course audit: exit 0, 62 investigations, 149 commands, 11 checkpoints, 2 choices, 55 downloads, 0 errors, 0 warnings.
- All 15 `test-*.mjs` files: exit 0. This includes assessment data/integration/layout/device tests, dialog scrolling, worktree-ignore behavior, strict practice audit, checkpoint interaction, command interaction, the 132-assertion command/checkpoint layout matrix, reference overview, and Windows API guide/view coverage.
- `git diff --check`: exit 0. Git printed only the repository's configured LF-to-CRLF informational warnings; it reported no whitespace error.

## Release key and publication boundary

Every tied CSS and JavaScript asset in `index.html` now uses `?v=guided-investigation-4`. The command browser regression asserts that all tied assets share that exact key. The checkpoint fixture targets the matching `app.js` tag.

No push, publication, `main` update, or external deployment verification was performed. Those actions remain with the controller after review.

## Concerns

None within Task 4. Full clean-machine execution of every Windows GUI lab remains the separate Stage 9 roadmap item; this task completed the required static artifact-contract review, strict content audit, real-browser interaction tests, and responsive device-emulation gate.
