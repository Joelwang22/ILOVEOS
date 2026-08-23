import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const dataPath = path.join(root, "assessment-data.js");
const errors = [];

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

globalThis.window = {};
vm.runInThisContext(fs.readFileSync(path.join(root, "content.js"), "utf8"), { filename: "content.js" });
if (fs.existsSync(dataPath)) vm.runInThisContext(fs.readFileSync(dataPath, "utf8"), { filename: "assessment-data.js" });

const assessments = window.ILOVEOS_ASSESSMENTS;
const moduleIds = window.ILOVEOS_DATA.modules.map((module) => module.id);
const dimensions = ["mechanism", "interface", "failure", "ownership", "evidence"];
const allIds = new Set();

requireCondition(Boolean(assessments), "Stage 7 assessment data is missing");

function validateActivity(activity, context) {
  requireCondition(Boolean(activity?.id), `${context} has no stable ID`);
  requireCondition(!allIds.has(activity?.id), `${context} reuses activity ID ${activity?.id}`);
  if (activity?.id) allIds.add(activity.id);
  requireCondition(moduleIds.includes(activity?.module), `${context} has unknown module ${activity?.module}`);
  requireCondition(["single", "multiple", "ordering"].includes(activity?.kind), `${context} has invalid kind ${activity?.kind}`);
  requireCondition(typeof activity?.prompt === "string" && activity.prompt.length >= 30, `${context} needs a substantive prompt`);
  requireCondition(typeof activity?.explanation === "string" && activity.explanation.length >= 70, `${context} needs a substantive explanation`);
  requireCondition(dimensions.includes(activity?.dimension), `${context} has invalid reasoning dimension ${activity?.dimension}`);
  requireCondition(typeof activity?.skill === "string" && activity.skill.length >= 4, `${context} needs a searchable skill label`);

  if (activity?.kind === "single") {
    requireCondition(Array.isArray(activity.options) && activity.options.length >= 3, `${context} needs at least three options`);
    requireCondition(Number.isInteger(activity.answer) && activity.answer >= 0 && activity.answer < (activity.options?.length || 0), `${context} has an invalid single-choice answer`);
  }
  if (activity?.kind === "multiple") {
    requireCondition(Array.isArray(activity.options) && activity.options.length >= 3, `${context} needs at least three options`);
    requireCondition(Array.isArray(activity.answers) && activity.answers.length >= 2, `${context} needs at least two correct selections`);
    const uniqueAnswers = new Set(activity.answers || []);
    requireCondition(uniqueAnswers.size === (activity.answers?.length || 0), `${context} repeats a multiple-selection answer`);
    requireCondition([...(activity.answers || [])].every((answer) => Number.isInteger(answer) && answer >= 0 && answer < (activity.options?.length || 0)), `${context} has an invalid multiple-selection answer`);
  }
  if (activity?.kind === "ordering") {
    const itemIds = new Set((activity.items || []).map((item) => item.id));
    requireCondition(Array.isArray(activity.items) && activity.items.length >= 3 && itemIds.size === activity.items.length, `${context} needs unique ordering items`);
    requireCondition(Array.isArray(activity.answer) && activity.answer.length === activity.items?.length, `${context} ordering answer has the wrong length`);
    requireCondition((activity.answer || []).every((answer) => itemIds.has(answer)) && new Set(activity.answer || []).size === itemIds.size, `${context} ordering answer must contain every item exactly once`);
  }
}

if (assessments) {
  const reviews = assessments.moduleReviews || [];
  requireCondition(reviews.length === 10, `expected 10 module reviews, found ${reviews.length}`);
  requireCondition(new Set(reviews.map((review) => review.module)).size === 10, "module reviews do not map one-to-one to modules");
  requireCondition(moduleIds.every((id) => reviews.some((review) => review.module === id)), "one or more course modules have no review");

  for (const review of reviews) {
    requireCondition(typeof review.title === "string" && review.title.includes("review"), `${review.module} review needs a clear title`);
    requireCondition(review.activities?.length === 5, `${review.module} review must contain exactly five activities`);
    requireCondition(new Set((review.activities || []).map((activity) => activity.kind)).size >= 2, `${review.module} review must use at least two activity formats`);
    requireCondition(dimensions.every((dimension) => review.activities?.some((activity) => activity.dimension === dimension)), `${review.module} review does not cover all five reasoning dimensions`);
    for (const [index, activity] of (review.activities || []).entries()) validateActivity(activity, `${review.module} activity ${index + 1}`);
  }

  const finalQuestions = assessments.finalAssessment?.questions || [];
  requireCondition(finalQuestions.length === 20, `final assessment must contain 20 questions, found ${finalQuestions.length}`);
  for (const moduleId of moduleIds) {
    requireCondition(finalQuestions.filter((question) => question.module === moduleId).length === 2, `final assessment must contain exactly two ${moduleId} questions`);
  }
  for (const [index, question] of finalQuestions.entries()) validateActivity(question, `final question ${index + 1}`);
  requireCondition(dimensions.every((dimension) => finalQuestions.some((question) => question.dimension === dimension)), "final assessment does not sample every reasoning dimension");

  const practical = assessments.finalAssessment?.practical;
  const requiredPrompts = ["contract", "compatibility", "outcomes", "evidence", "ownership", "cleanup"];
  requireCondition(practical?.id === "final-owned-target-investigation", "final practical has the wrong or missing stable ID");
  requireCondition(typeof practical?.scenario === "string" && practical.scenario.length >= 180, "final practical needs a developed controlled scenario");
  requireCondition(requiredPrompts.every((id) => practical?.prompts?.some((prompt) => prompt.id === id && prompt.prompt.length >= 50)), "final practical is missing a required structured prompt");
  requireCondition(Array.isArray(practical?.evidenceExpectations) && practical.evidenceExpectations.length >= 4, "final practical needs evidence expectations");
  requireCondition(Array.isArray(practical?.modelReasoning) && practical.modelReasoning.length >= 6, "final practical needs a complete model-reasoning checklist");
}

console.log(`module reviews: ${assessments?.moduleReviews?.length || 0}`);
console.log(`module activities: ${assessments?.moduleReviews?.reduce((count, review) => count + review.activities.length, 0) || 0}`);
console.log(`final questions: ${assessments?.finalAssessment?.questions?.length || 0}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
