# Guided Investigation Clarity Design

## Purpose

The course's 62 guided investigations should be executable by a learner who understands the preceding lesson but has not memorised the repository layout or inferred how separate examples fit together. An instruction such as "Run the ctypes pointer-size code from this lesson" fails that standard because it does not identify a complete program, filename, terminal, command, or expected output.

This change audits every guided investigation, rewrites unclear instructions as closed-loop showcases, adds copyable PowerShell command blocks where terminal input is required, adds sparse webpage-verifiable evidence checkpoints, and strengthens the course audit so ambiguity or off-page homework cannot silently return.

## Scope

The work covers all 62 integrated guided investigations, including their:

- introductions and prerequisites;
- downloadable artifacts;
- ordered actions;
- terminal commands and arguments;
- Windows-tool navigation and filters;
- expected observations and non-success branches;
- hints and cleanup;
- deterministic evidence checkpoints checked on the webpage;
- rendering on desktop and compact layouts;
- automated structural and wording checks.

The work adds only transient inline checkpoint controls. It does not add stored responses, progress tracking, automatic execution, an in-browser terminal, a backend, or downloads for activities that require only observation. Independent extension assignments are removed from guided investigations.

## Instructional Standard

Every investigation step must be understandable without asking the learner to locate an unnamed example or reconstruct an implied program. The step must identify, as applicable:

1. The prerequisite state, supplied file, process, terminal, tool, or earlier displayed value it consumes.
2. The exact action to perform.
3. The filename, process identity, path, API, tool view, menu path, filter, option, or argument involved.
4. The exact PowerShell input when the learner must type a terminal command.
5. The result, error, state, or evidence that should become visible.
6. How to distinguish success, an expected non-success branch, and a setup failure.
7. The named output that a later controlled step consumes immediately.

Pronouns and shortened references are acceptable only when their antecedent is explicit in the same step. Step actions must not rely on phrases such as:

- "from this lesson";
- "the code" or "the example";
- "the script" or "the starter" without a filename;
- "the same command" or "the same workload" without repeating the complete command;
- "the reader", "the inspector", "the survey", or "the copy" without naming the program or file.

The action remains concise, while the existing "Why this step matters", "Look for", hint, expected-outcome, and cleanup areas carry the supporting explanation. "Look for" describes visible evidence; it does not instruct the learner to record, write, explain, classify, calculate, draw, design, research, or produce an off-page deliverable.

## Closed-Loop Showcase Standard

A guided investigation is a controlled showcase, not a worksheet. Its required flow is:

1. Open a supplied artifact or named tool view.
2. Run a complete supplied command or perform an exact interface action.
3. Observe the stated deterministic or machine-dependent evidence.
4. Advance through any supplied pause or controlled state transition.
5. Clean up only the resources created by the showcase.

Every required input comes from the webpage, a supplied download, or an immediately preceding step in the same investigation. A guided investigation does not ask the learner to:

- write or record an explanation, conclusion, table, list, casebook, or report;
- draw or map a diagram on paper;
- classify or design hypothetical systems;
- calculate or convert an answer outside the webpage;
- research external documentation independently;
- create, edit, or reconstruct code unless the webpage itself supplies and checks the complete result;
- locate an additional example, program, process, file, or machine not supplied by the showcase;
- answer a question whose result depends on a dynamic PID, address, timing, path, permission, or machine configuration.

Conceptual material removed from a practice step returns to the lesson explanation or, only when it merits a decision, to a webpage-verified checkpoint or existing review question. Most removed writing tasks receive no replacement.

## Executable and Tool-Based Tasks

### Direct PowerShell commands

If the complete action can be pasted directly into PowerShell, the relevant step includes a copyable command block. This includes Python `-c` checks, `whoami`, Sysinternals command-line utilities, and invocations of downloaded `.py` files.

The displayed command must be complete. It may use a clearly assigned PowerShell variable when the learner must substitute a machine-specific value, for example:

```powershell
$TargetPid = 1234
py .\process_inventory_lab.py --pid $TargetPid
```

The instruction above the block explains where `1234` comes from. Bare placeholders such as `<PID>` are not used because they are easy to paste unchanged.

### Multi-line Python programs

Any task that requires a multi-line Python program provides a complete downloadable `.py` file. The relevant step:

- names the file exactly;
- tells the learner where the browser normally saves it or asks them to open PowerShell in its containing folder;
- includes the exact PowerShell command used to run it;
- names required flags and how to obtain their values;
- states when the program pauses or exits;
- identifies the important output fields.

A lesson may reuse an existing complete artifact when its behavior matches the task. It must not tell the learner to reconstruct a runnable program from code-walkthrough fragments unless code construction is itself the stated activity and every construction step is explicit.

### GUI and Sysinternals tools

GUI steps do not receive artificial command blocks. They instead name:

- the tool and required elevation state;
- the exact target process, file, object, or path;
- every menu, properties page, pane mode, tab, column, or filter required to make the value visible;
- the capture start/stop point when timing matters;
- the evidence that should be visible;
- an unavailable or access-denied branch when the view is not guaranteed.

Process Explorer instructions distinguish the top process pane, `Properties > Threads` thread data, handle lower-pane data, and DLL lower-pane data. A loaded module base requires selecting the target process, choosing `View > Show Lower Pane`, choosing `View > Lower Pane View > DLLs`, opening the lower-pane column chooser, enabling `DLL > Base Address`, and locating the exact module path. A thread start address instead comes from the selected TID in `Properties > Threads`. One view must never be presented as a substitute for the other.

If an optional external tool is unavailable, the investigation names that branch and continues without demanding research, installation, or an unverified substitute. A checkpoint may depend on external-tool evidence only when the same deterministic evidence is also supplied on the webpage as a fallback.

### Learner decisions

The webpage requests a learner decision only when the site can verify a predetermined answer. Three routes apply in order:

1. A deterministic fact deliberately exposed by a supplied artifact uses a short-answer evidence checkpoint.
2. A meaningful distinction whose alternatives teach something uses an occasional multiple-choice checkpoint or the existing lesson review.
3. A dynamic, subjective, machine-dependent, or low-value result receives no question.

Short-answer checkpoints are preferred for exact evidence such as a filename fragment, DLL name, API name, fixed state, result code, handle type, or invariant output field. For example, a supplied program deliberately loading `i_love_os.dll` may ask the learner to complete `i_love_[____].dll` after following the exact DLL lower-pane path. The accepted answer is `os`.

Multiple choice is not a mechanical replacement for deleted writing tasks. An investigation has zero checkpoints by default, normally no more than one, and never more than two. It has at most one multiple-choice checkpoint. A second checkpoint is allowed only for a separate, meaningful evidence target from the controlled showcase.

## Practice Command Data

A practice step may include a `commands` array:

```js
{
  action: "Run pointer_size_check.py from the folder that contains the download.",
  commands: [
    {
      label: "PowerShell",
      code: "py .\\pointer_size_check.py"
    }
  ],
  why: "The calling Python process determines the pointer width.",
  observe: "The command prints the executable path, architecture label, pointer bytes, and pointer bits."
}
```

`commands` is an array because a few investigations require two terminals or deliberately compare two complete invocations. Each command object has exactly these required fields:

- `label`: a human-readable environment name; Stage 1 uses `PowerShell`;
- `code`: one or more complete lines that can be copied together.

Command blocks are optional. Their absence keeps GUI and observation-only steps visually simple.

## Practice Checkpoint Data

A practice may include a `checkpoints` array. Checkpoints appear immediately after the step whose evidence they verify.

```js
{
  afterStep: 2,
  type: "short",
  prompt: "Complete the distinctive loaded module name: i_love_[____].dll",
  answer: "os",
  acceptedAnswers: [],
  feedback: "The supplied program deliberately loads i_love_os.dll."
}
```

A short checkpoint has exactly `afterStep`, `type`, `prompt`, `answer`, optional `acceptedAnswers`, and `feedback`. Verification trims surrounding whitespace and compares case-insensitively. Accepted alternatives exist only for genuinely equivalent fixed strings.

An occasional choice checkpoint uses:

```js
{
  afterStep: 3,
  type: "choice",
  prompt: "Which fixed result did the supplied timeout mode return?",
  options: ["WAIT_OBJECT_0", "WAIT_TIMEOUT", "WAIT_ABANDONED"],
  answerIndex: 1,
  feedback: "The supplied timeout mode deliberately reaches WAIT_TIMEOUT."
}
```

The answer must be invariant for the supplied artifact and mode. Checkpoints never use live PIDs, addresses, timings, machine-specific paths, installed-module inventories, or other values the static webpage cannot know.

## Command Block Interaction

The lesson renderer places each command block after the step action and before its explanatory and observation text. The block contains:

- the environment label;
- a `<pre><code>` region preserving line breaks;
- a keyboard-operable `Copy` button;
- visible and assistive confirmation after a successful copy;
- a fallback that selects the command text and explains that the learner can press `Ctrl+C` when the Clipboard API is unavailable.

Copying never executes the command. Copy state is transient and is not stored. Multiple command blocks remain independently labelled and copyable.

The command region scrolls horizontally rather than widening the page. At compact widths the header may wrap, but the label, copy control, and command remain reachable. Small, default, and large content-size settings apply to the command label, button, and code.

## Course-Wide Content Audit Method

Every lesson receives a manual step-by-step review. The review is not limited to keyword matches. For each investigation, the author will:

1. Read the lesson explanation, walkthroughs, current practice, and downloadable artifact together.
2. Run or inspect the artifact's help and argument parsing to establish the real command contract.
3. Identify each value passed between steps, such as PID, path, handle state, capture filter, service name, or baseline file.
4. Rewrite actions so those values are named at both production and consumption points.
5. Add complete PowerShell commands for every terminal action.
6. Add or correct downloads when a multi-line program is required.
7. Make expected success, expected non-success, and unavailable-tool branches explicit where relevant.
8. Check that cleanup reverses the actual task and does not mention resources the learner never acquired.
9. Remove extension assignments and every request for an off-page written, calculated, classified, designed, researched, or reconstructed deliverable.
10. Decide whether the controlled showcase exposes a worthwhile invariant fact. Add no checkpoint by default; add a short-answer checkpoint only for exact evidence, or an occasional choice checkpoint only for a meaningful distinction.
11. Confirm that any checkpoint answer is predetermined by the supplied artifact or webpage fallback, not by the learner's machine or a live runtime value.
12. Read the complete investigation as a learner and confirm no outside repository knowledge, excessive external work, or unverified decision is assumed.

The audit proceeds in two content batches so each can be reviewed and published independently:

- Modules 1–5: foundations, processes and handles, threads and scheduling, memory, linking and loading.
- Modules 6–10: management, security, synchronisation, IPC, hooking and injection.

## Automated Enforcement

The course audit will validate the learner-facing contract without attempting to judge all prose mechanically.

It will:

- normalise both `practice.download` and `practice.downloads`;
- check every referenced artifact path, including every item in multi-download practices;
- validate that each command entry has a non-empty label and code;
- reject unsupported command fields and malformed command arrays;
- reject known unresolved phrases in step actions;
- require a command that invokes a `.py` file to name an artifact available from that practice;
- require each downloaded artifact used by a step to be named explicitly in the step action or command;
- reject paste-hostile angle-bracket placeholders in PowerShell blocks;
- require each step to retain a concrete action and observation;
- reject extension fields and off-page task verbs in actions, observations, hints, expected outcomes, and cleanup text;
- validate every checkpoint's exact fields, type, step placement, non-empty prompt and feedback, fixed answer, accepted-answer values, option count, and answer-index bounds;
- reject more than two checkpoints per investigation or more than one choice checkpoint;
- reject checkpoint answers and prompts that solicit live PIDs, addresses, timings, paths, inventories, or machine-specific results;
- report command-block, checked-download, and investigation totals in the final audit output.

Heuristic searches for terminal verbs without command blocks may produce warnings for manual review, because `Run as administrator` and GUI tool names are legitimate non-terminal instructions. Completion requires resolving every warning rather than merely accepting the warning count.

## Files and Responsibilities

### `app.js`

- Renders optional practice command blocks.
- Wires copy behavior after each lesson render.
- Provides clipboard success and fallback behavior.
- Renders short-answer and choice checkpoints immediately after their associated steps.
- Checks answers locally, shows accessible corrective feedback, and permits another attempt without storing a response.
- Does not own course content or infer commands from prose.

### `styles.css`

- Styles command blocks consistently with existing lesson code and practice cards.
- Styles checkpoint fields, option groups, feedback, and focus states consistently with existing practice cards.
- Preserves focus visibility, text-size controls, compact wrapping, and horizontal containment.

### `lesson-depth-*.js`

- Own the rewritten investigation instructions and command metadata for their modules.
- Name downloads and cross-step values explicitly.
- Own only deterministic checkpoint data justified by their supplied artifacts.
- Contain no extension assignment or off-page learner deliverable.

### `downloads/*.py`

- Supplies complete multi-line programs where the current practice assumes unwritten code.
- Uses help text and argument names that match the displayed commands.

### `scripts/audit-course.mjs`

- Enforces artifact, command, and ambiguity rules across all 62 investigations.
- Enforces the closed-loop, checkpoint-shape, sparsity, and invariant-answer rules.

### New browser and content tests

- Test command rendering and copy interaction in a real browser.
- Test short-answer and choice verification, retry behavior, feedback announcements, and non-persistence.
- Test compact and content-size layout behavior.
- Test deliberately malformed fixture data against the audit rules or shared validation helpers.

## Accessibility and Error Handling

- Copy buttons use `type="button"` and an accessible name that identifies their command.
- Success and fallback messages are announced without moving focus.
- Clipboard rejection does not erase or hide the command.
- The fallback selects only the requested command block.
- Commands remain readable without color and are not identified only by syntax coloring.
- Every checkpoint control has a visible label or group prompt, and feedback is announced without moving focus.
- Choice state and correctness are not communicated by color alone.
- An incorrect response remains editable, and checking or resetting a checkpoint never stores the response.
- Long paths and arguments remain inside the command region at narrow widths.
- Reduced-motion preferences apply to any copy-state transition.

## Testing

Implementation follows test-driven development.

The release gate includes:

1. A failing content/audit fixture demonstrating that the original pointer-size wording is rejected.
2. Failing renderer tests for absent command markup and copy wiring before implementation.
3. Audit tests for singular and plural downloads, malformed commands, unnamed artifacts, vague references, and placeholders.
4. Audit fixtures proving that the rejected five-part writing task, extension assignments, excessive checkpoints, excessive multiple choice, and dynamic-answer prompts fail.
5. Browser tests for successful copy, rejected Clipboard API fallback, keyboard focus, independent multiple blocks, checkpoint verification and retry, and live-region feedback.
6. Content tests confirming the exact Process Explorer DLL lower-pane workflow and the distinct `Properties > Threads` thread-start workflow.
7. Layout tests at desktop, compact, Edge minimum, and true 390-pixel emulation with all content-size settings.
8. The complete existing course, reference, assessment, dialog, and JavaScript syntax gates.
9. `git diff --check` and a clean-file review excluding the owner's `stuff_to_add.txt`.

## Publication Workflow

Work is divided into four independently reviewable tasks:

1. Command-block renderer, copy interaction, styles, and strengthened audit infrastructure.
2. Modules 1–5 investigation rewrite and any required artifacts.
3. Checkpoint renderer and audit rules, plus the Modules 6–10 closed-loop rewrite and required artifacts.
4. Modules 1–5 closed-loop retrofit, full-course strict review, final audit record, cache-key update, and release verification.

After each task:

1. Run its focused tests and the complete relevant course audit.
2. Review the diff for instructional accuracy and unrelated files.
3. Commit only the task's files.
4. Fast-forward `main` and rerun the focused checks there.
5. Push `main` to GitHub.
6. Wait for the exact GitHub Pages workflow SHA to succeed.
7. Verify the public site serves the new task assets before starting the next task.

## Completion Criteria

The guided-investigation audit is complete only when:

- all 62 investigations have been manually reviewed against this specification;
- every terminal action has a complete copyable PowerShell block;
- every multi-line Python requirement has a complete downloadable artifact and exact run command;
- every GUI/tool step identifies its target, interface path or filter, timing, and evidence where applicable;
- Process Explorer instructions use the exact pane, tab, and column path for the evidence being inspected;
- every later step names the earlier output it consumes;
- no guided investigation contains an extension assignment or asks for an off-page written, calculated, classified, designed, researched, or reconstructed deliverable;
- every learner decision is checked on the webpage against an invariant answer supplied by the course;
- checkpoints remain sparse: zero by default, no more than two per investigation, and no more than one choice checkpoint;
- no unresolved-reference audit errors or warnings remain;
- every singular and plural download exists and is checked;
- copy success and failure behavior is keyboard and screen-reader accessible;
- checkpoint labels, retry behavior, and feedback are keyboard and screen-reader accessible and non-persistent;
- command blocks do not overflow at supported widths or content sizes;
- the full course audit and all existing test suites pass with zero errors and zero warnings;
- each of the four tasks has been deployed and visually verified on GitHub Pages.
