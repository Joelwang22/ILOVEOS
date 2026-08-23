# Stage 7 Module Revision and Final Assessment Design

## Purpose

Stage 7 adds a study-first revision path to the existing ten-module operating-systems course. It gives each module a compact cumulative review and ends the course with one assessment that samples every module. The work extends the existing static site without adding accounts, stored progress, a backend, gamification, or the broader Revision hub planned for Stage 8.

The learner should be able to retry an incorrect answer during the current page session, see the reasoning after an attempt, and use the assessment as active revision rather than a one-shot score gate.

## Scope

Stage 7 will deliver:

- One compact review route for each of the ten modules.
- Five cumulative activities in every module review.
- One final-assessment route containing twenty questions, exactly two from each module.
- One final practical scenario that combines API and tool selection, predictions, expected failures, evidence interpretation, ownership, and cleanup.
- Session-only completion summaries and reset controls.
- Retry behavior for the new assessments and the existing lesson checks.
- Links from module outlines, final lesson navigation, the course index or home page, and the tenth module review into the final assessment.
- Automated data, renderer, routing, and course-audit coverage.

Stage 7 will not deliver:

- Persistent scores, browser storage, accounts, completion badges, or a dashboard.
- Randomized question banks or different questions on each visit.
- A timer, pass mark, grading certificate, or locked course progression.
- The consolidated Revision page, Setup page, Glossary, or Sources page planned for Stage 8.
- Automatic grading of open-ended practical reasoning.

## Information Architecture

Each module review has its own stable hash route:

```text
#/review/foundations
#/review/processes-handles
...
#/review/hooking-injection
```

The consolidated assessment uses:

```text
#/assessment/final
```

Every module outline adds a compact review row after its lesson sequence. The final lesson in each module links forward to that module review instead of skipping directly into the next module. Reviews one through nine link onward to the next module. The tenth review links onward to the final assessment. The final assessment also receives a visible entry point from the course-level interface so it remains reachable without completing navigation in sequence.

Unknown module review IDs render a clear unavailable-state message with a link to the course index. They must not silently display a different module's review.

## File and Component Boundaries

The feature will follow the existing dependency-free static architecture while avoiding further assessment-specific growth in `app.js`.

### `assessment-data.js`

Owns curriculum assessment content and exports `window.ILOVEOS_ASSESSMENTS`.

The exported object contains:

- `moduleReviews`: one record per existing module ID.
- `finalAssessment`: the twenty-question course sample and practical scenario.
- Stable IDs for every activity.
- Content metadata used by the audit, renderer, and search integration.

It does not contain DOM behavior or HTML templates.

### `assessment-view.js`

Owns pure filtering, rendering, and session-state transitions for assessment activities. It exports `window.ILOVEOS_ASSESSMENT_VIEW` with pure rendering helpers and one DOM wiring entry point. It does not own application routing or curriculum content.

### `app.js`

Adds route dispatch, module-review links, final-assessment entry points, and calls into the assessment view. The existing lesson quiz handler is adjusted to use retry semantics consistent with assessment single-choice questions.

### `styles.css`

Adds compact review, activity, progress, attempt-feedback, ordering-control, practical-scenario, and responsive states. New controls must use existing typography, spacing, colors, focus conventions, and content-size settings.

### `scripts/test-assessment-data.mjs`

Validates content topology, IDs, module balance, activity contracts, answer correctness, explanation presence, and final-assessment coverage.

### `scripts/test-assessment-view.mjs`

Validates pure render output and state transitions, including incorrect retry, correct locking, reset, ordering, multi-selection, progress, practical reveal, and unknown routes.

### `scripts/audit-course.mjs`

Loads the assessment data and makes Stage 7 part of the normal course release gate.

## Content Model

Every automatically checked activity uses a stable object with common fields:

```js
{
  id: "foundations-api-contract-failure",
  module: "foundations",
  kind: "single",
  skill: "failure interpretation",
  prompt: "...",
  explanation: "..."
}
```

The `kind` selects one of these contracts:

### Single choice

```js
{
  kind: "single",
  options: ["...", "...", "...", "..."],
  answer: 2
}
```

Used for conceptual reasoning, prediction, scenario diagnosis, API selection, result interpretation, tool selection, and code completion. Code-completion questions present a small escaped snippet and ask the learner to choose the contract-correct missing expression or branch.

### Multiple selection

```js
{
  kind: "multiple",
  options: ["...", "...", "...", "..."],
  answers: [0, 2, 3]
}
```

Used where several obligations are simultaneously required, especially ownership, cleanup, minimum-rights selection, and evidence collection. The learner edits a selection and explicitly submits it.

### Ordering

```js
{
  kind: "ordering",
  items: [
    { id: "open", label: "Open the object with minimum required access" },
    { id: "call", label: "Perform the operation and capture its result" },
    { id: "verify", label: "Verify the resulting state or evidence" },
    { id: "close", label: "Release the owned handle" }
  ],
  answer: ["open", "call", "verify", "close"]
}
```

Used for execution order, lifecycle, cleanup, loader, service-transition, synchronization, and IPC sequences. Ordering uses explicit move-up and move-down buttons and never requires drag-and-drop, preserving keyboard and touch accessibility.

### Practical scenario

The practical is deliberately ungraded. It contains a controlled scenario, structured prompts, evidence expectations, and a revealable model-reasoning checklist. The learner can type notes into page-local text areas, but those notes are never stored. Revealing the model does not mark the activity correct; it marks it reviewed in the session summary.

## Content Balance

Each module review contains five activities that collectively cover:

1. The module's central operating-system mechanism.
2. A Windows API, pywin32, or native-contract decision.
3. A result, expected failure, or debugging branch.
4. Ownership, lifetime, synchronization, or cleanup.
5. Observable evidence through the relevant Sysinternals or Windows tool.

At least two activity formats appear in every module review, and the whole set uses single-choice, multiple-selection, and ordering activities. Questions integrate concepts across lessons and do not copy the existing lesson checks verbatim.

The final assessment contains exactly two automatically checked questions from every module. It samples the same six reasoning dimensions used throughout Stage 7: mechanism, interface selection, results and failures, ownership, debugging, and evidence. It does not repeat all fifty module-review activities.

The final practical uses an authorized Windows lab investigation. A diagnostic Python utility must inspect an owned target and correlate a failed operation with Windows evidence. The learner must:

- Choose the minimum access and appropriate pywin32 or native API path.
- Check architecture and pointer-width compatibility where relevant.
- Predict success, expected denial, timeout, partial-result, or unavailable-state branches.
- Select Process Explorer, Process Monitor, VMMap, Handle, WinObj, Sigcheck, or another already taught tool only where its evidence answers the question.
- Separate directly observed facts from inference.
- Account for every acquired handle, mapped view, allocation, callback, buffer, and other owned resource.
- Explain cleanup ordering and how to preserve the primary error across cleanup.

The scenario remains diagnostic and controlled. It does not add an operational cross-process payload or authorize work against third-party systems.

## Interaction and State Model

State exists only in JavaScript memory for the current rendered page. Navigating away or refreshing resets it.

### Single choice behavior

1. Selecting an incorrect option marks only that option incorrect and disables that option.
2. The explanation becomes visible after the attempt and explains the correct reasoning without hiding the fact that the attempt was wrong.
3. Remaining options stay enabled so the learner can retry.
4. Selecting the correct option marks it correct, disables all options for that activity, and records completion.

### Multiple-selection behavior

1. The learner toggles options and presses `Check selection`.
2. An empty selection produces an inline prompt and does not count as an attempt.
3. An incorrect set shows the explanation but remains editable.
4. The exact correct set locks the activity and records completion.

### Ordering behavior

1. The learner moves items with visible `Move up` and `Move down` buttons.
2. Boundary controls are disabled when an item is already first or last.
3. `Check order` compares stable item IDs, not display text.
4. An incorrect order remains editable; the correct order locks and records completion.

### Progress and reset

The page header reports completed automatically checked activities out of the page total. It also reports the practical as `reviewed` after model reasoning is revealed. It is a completion summary, not a persisted grade or pass/fail judgment.

`Reset this review` clears page-local answers, notes, completion, disabled states, and revealed reasoning after a confirmation step. It does not affect another route because no state is shared or stored.

## Feedback and Error Handling

Every attempted automatically checked activity exposes an `aria-live="polite"` feedback region. Feedback states are neutral, incorrect, and correct. Color is never the only indicator; the text and activity status identify the result.

An activity with invalid content must be rejected by the automated audit before deployment. The renderer still fails safely: it displays `This activity is unavailable` instead of throwing and breaking the complete review page.

The practical model answer is labelled as one defensible reasoning path rather than the only acceptable wording. Its checklist distinguishes required contract facts from machine-dependent observations.

## Accessibility and Responsive Behavior

- All activities use headings, fieldsets, legends, buttons, and lists with meaningful accessible names.
- Keyboard focus remains visible under the existing theme.
- Ordering uses buttons rather than drag-only interaction.
- Feedback uses live regions without unexpectedly moving focus.
- Reset confirmation is keyboard operable.
- Activity layouts collapse to one column on compact screens.
- Long code, API names, and paths wrap or scroll inside their own content region rather than widening the page.
- Existing small, default, and large content-size settings apply to all assessment text and controls.
- Motion is limited to existing subtle transitions and respects reduced-motion preferences already used by the site.

## Search and Navigation

Stage 7 review routes and the final assessment are added to global search by title, module, skill labels, prompt text, APIs, tools, failure terms, and ownership terms. Search results link to the containing review page; individual activity anchors are optional and are not required for Stage 7.

The main sidebar does not gain a permanent Revision item in this stage because Stage 8 owns the consolidated Revision page. Course-level and module-level links provide complete reachability until that page is added.

## Testing and Completion Criteria

Stage 7 is complete only when all of the following pass:

- Exactly ten module reviews exist and map one-to-one to current module IDs.
- Every module review contains exactly five valid activities.
- Every module review covers the five required reasoning dimensions and uses at least two formats.
- The final assessment contains exactly twenty valid automatically checked questions and exactly two per module.
- All activity IDs are unique across module reviews and the final assessment.
- Every option index and ordering ID in an answer is valid and unambiguous.
- Every automatically checked question has a substantive explanation.
- The final practical contains all required prompt and model-reasoning sections.
- Incorrect answers remain retryable; correct answers lock; reset restores the initial state.
- No assessment state is written to cookies, local storage, session storage, a network endpoint, or a URL.
- Unknown review routes render the unavailable state.
- Module pages and last-lesson navigation reach the correct review.
- Module ten review and a course-level entry point reach the final assessment.
- Assessment content is searchable.
- Desktop, compact, and narrow layouts render without clipping or horizontal page overflow.
- JavaScript syntax checks, assessment tests, the complete course audit, and `git diff --check` pass.

## Publication Workflow

Implementation is divided into independently testable tasks. After each task:

1. Run that task's focused tests and the relevant course audit.
2. Review the diff and exclude unrelated files, including `stuff_to_add.txt`.
3. Commit only the task's files with a focused message.
4. Push `main` to `origin`.
5. Confirm that the GitHub Pages workflow triggered successfully before starting or reporting the next published task.

This task-level publication requirement is part of Stage 7 delivery because the project owner explicitly requested the GitHub webpage be updated after every task.
