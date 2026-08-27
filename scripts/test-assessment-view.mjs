import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const viewPath = path.join(root, "assessment-view.js");
const errors = [];

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

const review = {
  module: "test-module",
  title: "Test module review",
  summary: "A controlled review fixture.",
  activities: [
    {
      id: "single-contract",
      module: "test-module",
      kind: "single",
      dimension: "interface",
      skill: "contract choice",
      prompt: "Which option preserves the documented contract?",
      options: ["Wrong width", "Exact width and pointer level", "No declaration"],
      answer: 1,
      explanation: "The exact width and pointer level preserve the native contract."
    },
    {
      id: "multiple-cleanup",
      module: "test-module",
      kind: "multiple",
      dimension: "ownership",
      skill: "cleanup selection",
      prompt: "Select every caller-owned resource.",
      options: ["Process handle", "PID", "Thread handle", "Error code"],
      answers: [0, 2],
      explanation: "The process and thread handles are owned resources; IDs and error codes are values."
    },
    {
      id: "ordering-lifecycle",
      module: "test-module",
      kind: "ordering",
      dimension: "mechanism",
      skill: "lifecycle order",
      prompt: "Put the lifecycle into its required order.",
      items: [
        { id: "call", label: "Perform the checked operation" },
        { id: "open", label: "Open with minimum access" },
        { id: "close", label: "Close the owned resource" }
      ],
      answer: ["open", "call", "close"],
      explanation: "Open before calling, then release the acquired resource."
    }
  ]
};

const practical = {
  id: "test-practical",
  title: "Controlled practical",
  scenario: "Inspect an owned target without changing it.",
  prompts: [
    { id: "contract", label: "Contract", prompt: "Choose the minimum query contract." },
    { id: "cleanup", label: "Cleanup", prompt: "Account for every owned resource." }
  ],
  evidenceExpectations: ["Record exact PID and result."],
  modelReasoning: [
    { id: "model-contract", title: "Use minimum rights", body: "Select only the query capability required by the observation." },
    { id: "model-cleanup", title: "Close owned handles", body: "Release each acquired handle exactly once after preserving the primary result." }
  ]
};

globalThis.window = {};
if (fs.existsSync(viewPath)) vm.runInThisContext(fs.readFileSync(viewPath, "utf8"), { filename: "assessment-view.js" });
const view = window.ILOVEOS_ASSESSMENT_VIEW;
requireCondition(Boolean(view), "Stage 7 assessment renderer is missing");

if (view) {
  let state = view.createState(review);
  requireCondition(view.progress(review, state).completed === 0, "new review does not start at zero completion");
  const initial = view.renderReview(review, state, { moduleNumber: "02", nextHref: "#/module/next", nextLabel: "Next module" });
  for (const expected of [
    "Test module review",
    "0 of 3 complete",
    '<fieldset class="assessment-activity',
    'data-assessment-action="single"',
    'type="checkbox"',
    'data-assessment-action="move"',
    'aria-live="polite"',
    "Reset this review",
    '#/module/next'
  ]) {
    requireCondition(initial.includes(expected), `initial review rendering is missing: ${expected}`);
  }

  state = view.reduceState(review, state, { type: "select-single", id: "single-contract", option: 0 });
  requireCondition(!state.activities["single-contract"].completed, "incorrect single choice completes the activity");
  requireCondition(state.activities["single-contract"].incorrect.includes(0), "incorrect single choice is not recorded");
  requireCondition(state.activities["single-contract"].latestAttemptCorrect === false && state.activities["single-contract"].attempts === 1, "incorrect attempt is not reflected in the latest-attempt score");
  let rendered = view.renderReview(review, state);
  requireCondition(rendered.includes("Try another option") && rendered.includes(review.activities[0].explanation), "incorrect single choice does not expose retry feedback and reasoning");
  requireCondition(!rendered.includes('data-activity="single-contract" data-option="1" disabled'), "remaining single-choice options are disabled after an incorrect attempt");

  state = view.reduceState(review, state, { type: "select-single", id: "single-contract", option: 1 });
  requireCondition(state.activities["single-contract"].completed, "correct single choice does not complete the activity");
  requireCondition(state.activities["single-contract"].latestAttemptCorrect === true && state.activities["single-contract"].attempts === 2, "correct retry does not update the latest-attempt score");
  requireCondition(view.progress(review, state).completed === 1, "single-choice completion does not update progress");
  requireCondition(view.progress(review, state).latestAttemptCorrect === 1 && view.progress(review, state).latestAttemptScored === 1, "progress reports the wrong latest-attempt score");
  rendered = view.renderReview(review, state);
  requireCondition(rendered.includes("Correct. Activity complete."), "correct single choice does not render completion feedback");

  let emptyMultiple = view.reduceState(review, state, { type: "check-multiple", id: "multiple-cleanup" });
  requireCondition(emptyMultiple.activities["multiple-cleanup"].feedback === "Choose at least one option before checking.", "empty multiple selection has no inline prompt");
  requireCondition(!emptyMultiple.activities["multiple-cleanup"].attempted, "empty multiple selection counts as an attempt");
  requireCondition(emptyMultiple.activities["multiple-cleanup"].latestAttemptCorrect === null && emptyMultiple.activities["multiple-cleanup"].attempts === 0, "empty multiple selection changes latest-attempt scoring");
  state = view.reduceState(review, state, { type: "toggle-multiple", id: "multiple-cleanup", option: 0 });
  state = view.reduceState(review, state, { type: "check-multiple", id: "multiple-cleanup" });
  requireCondition(!state.activities["multiple-cleanup"].completed && state.activities["multiple-cleanup"].attempted, "incorrect multiple selection cannot be retried");
  state = view.reduceState(review, state, { type: "toggle-multiple", id: "multiple-cleanup", option: 2 });
  state = view.reduceState(review, state, { type: "check-multiple", id: "multiple-cleanup" });
  requireCondition(state.activities["multiple-cleanup"].completed, "exact multiple selection does not complete the activity");

  requireCondition(state.activities["ordering-lifecycle"].order.join(",") === "call,open,close", "ordering activity does not preserve its authored initial order");
  state = view.reduceState(review, state, { type: "move-ordering", id: "ordering-lifecycle", item: "open", direction: "up" });
  requireCondition(state.activities["ordering-lifecycle"].order.join(",") === "open,call,close", "ordering move-up action changes the wrong item");
  let incorrectOrder = view.reduceState(review, view.createState(review), { type: "check-ordering", id: "ordering-lifecycle" });
  requireCondition(!incorrectOrder.activities["ordering-lifecycle"].completed, "incorrect ordering attempt completes the activity");
  incorrectOrder = view.reduceState(review, incorrectOrder, { type: "move-ordering", id: "ordering-lifecycle", item: "open", direction: "up" });
  incorrectOrder = view.reduceState(review, incorrectOrder, { type: "check-ordering", id: "ordering-lifecycle" });
  requireCondition(incorrectOrder.activities["ordering-lifecycle"].completed, "ordering activity cannot be corrected after an incorrect attempt");
  state = view.reduceState(review, state, { type: "check-ordering", id: "ordering-lifecycle" });
  requireCondition(state.activities["ordering-lifecycle"].completed, "correct order does not complete the activity");
  const lockedState = JSON.stringify(state);
  state = view.reduceState(review, state, { type: "move-ordering", id: "ordering-lifecycle", item: "call", direction: "down" });
  requireCondition(JSON.stringify(state) === lockedState, "completed activity accepts a later action");
  requireCondition(view.progress(review, state).completed === 3, "completed review reports the wrong progress");
  rendered = view.renderReview(review, state);
  requireCondition(rendered.includes('data-direction="up" disabled') && rendered.includes('data-direction="down" disabled'), "completed ordering controls do not lock");
  requireCondition(rendered.includes('aria-label="Move Open with minimum access up"'), "ordering controls do not name the item they move");

  const finalPage = { id: "final", title: "Final assessment", summary: "Course sample", questions: review.activities, practical };
  let finalState = view.createState(finalPage);
  finalState = view.reduceState(finalPage, finalState, { type: "update-note", prompt: "contract", value: "Use query access only." });
  requireCondition(finalState.notes.contract === "Use query access only.", "practical note is not held in page-local state");
  finalState = view.reduceState(finalPage, finalState, { type: "reveal-practical" });
  requireCondition(view.progress(finalPage, finalState).practicalReviewed, "practical reveal does not update review progress");
  const finalHtml = view.renderFinalAssessment(finalPage, finalState);
  requireCondition(finalHtml.includes("Use query access only.") && finalHtml.includes("One defensible reasoning path"), "final practical does not preserve notes or reveal model reasoning");

  const reset = view.reduceState(finalPage, finalState, { type: "reset-page" });
  requireCondition(view.progress(finalPage, reset).completed === 0 && !view.progress(finalPage, reset).practicalReviewed, "reset does not clear completion and practical review");
  requireCondition(Object.keys(reset.notes).length === 0, "reset does not clear practical notes");

  const invalidPage = { module: "bad", title: "Broken review", summary: "Fixture", activities: [{ id: "bad-kind", kind: "unknown", prompt: "Broken" }] };
  const invalidHtml = view.renderReview(invalidPage, view.createState(invalidPage));
  requireCondition(invalidHtml.includes("This activity is unavailable"), "invalid activity content breaks the whole review page");
  const malformedActivities = [
    { id: "bad-multiple", kind: "multiple", prompt: "Missing answers", options: ["One", "Two"] },
    { id: "bad-ordering", kind: "ordering", prompt: "Missing answer", items: [{ id: "one", label: "One" }, { id: "two", label: "Two" }] }
  ];
  const malformedPage = { module: "malformed", title: "Malformed review", summary: "Fixture", activities: malformedActivities };
  let malformedState;
  let malformedHtml = "";
  try {
    malformedState = view.createState(malformedPage);
    malformedHtml = view.renderReview(malformedPage, malformedState);
    malformedState = view.reduceState(malformedPage, malformedState, { type: "check-multiple", id: "bad-multiple" });
    malformedState = view.reduceState(malformedPage, malformedState, { type: "check-ordering", id: "bad-ordering" });
  } catch (error) {
    errors.push(`malformed known activity throws instead of degrading safely: ${error.message}`);
  }
  requireCondition((malformedHtml.match(/This activity is unavailable/g) || []).length === 2, "malformed known activities are rendered as interactive controls");
  requireCondition(!malformedState?.activities?.["bad-multiple"] && !malformedState?.activities?.["bad-ordering"], "malformed activities receive mutable state");

  for (const nonArrayPage of [
    { title: "Object activities", summary: "Fixture", activities: { id: "not-a-list" } },
    { title: "String questions", summary: "Fixture", questions: "not-a-list" }
  ]) {
    try {
      const nonArrayState = view.createState(nonArrayPage);
      const nonArrayHtml = view.renderReview(nonArrayPage, nonArrayState);
      requireCondition(view.progress(nonArrayPage, nonArrayState).total === 0 && nonArrayHtml.includes("0 of 0 complete"), "non-array activity collection is not treated as empty");
    } catch (error) {
      errors.push(`non-array activity collection throws: ${error.message}`);
    }
  }
  requireCondition(view.renderUnavailable("missing-review").includes("Review unavailable"), "unknown review does not render a safe unavailable state");

  const escapedPage = { module: "escape", title: "<img src=x>", summary: "A & B", activities: [] };
  const escapedHtml = view.renderReview(escapedPage, view.createState(escapedPage));
  requireCondition(!escapedHtml.includes("<img src=x>") && escapedHtml.includes("A &amp; B"), "assessment renderer does not escape dynamic content");
}

console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
