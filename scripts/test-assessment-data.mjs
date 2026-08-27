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
const reviewDimensions = ["mechanism", "interface", "failure", "ownership", "evidence"];
const finalDimensions = [...reviewDimensions, "debugging"];
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
  requireCondition(finalDimensions.includes(activity?.dimension), `${context} has invalid reasoning dimension ${activity?.dimension}`);
  requireCondition(typeof activity?.skill === "string" && activity.skill.length >= 4, `${context} needs a searchable skill label`);

  if (activity?.kind === "single") {
    requireCondition(Array.isArray(activity.options) && activity.options.length >= 3, `${context} needs at least three options`);
    requireCondition(activity.options?.every((option) => typeof option === "string" && option.trim().length >= 3), `${context} has a blank or weak option`);
    requireCondition(new Set(activity.options || []).size === (activity.options?.length || 0), `${context} repeats option text`);
    requireCondition(Number.isInteger(activity.answer) && activity.answer >= 0 && activity.answer < (activity.options?.length || 0), `${context} has an invalid single-choice answer`);
  }
  if (activity?.kind === "multiple") {
    requireCondition(Array.isArray(activity.options) && activity.options.length >= 3, `${context} needs at least three options`);
    requireCondition(activity.options?.every((option) => typeof option === "string" && option.trim().length >= 3), `${context} has a blank or weak option`);
    requireCondition(new Set(activity.options || []).size === (activity.options?.length || 0), `${context} repeats option text`);
    requireCondition(Array.isArray(activity.answers) && activity.answers.length >= 2, `${context} needs at least two correct selections`);
    const uniqueAnswers = new Set(activity.answers || []);
    requireCondition(uniqueAnswers.size === (activity.answers?.length || 0), `${context} repeats a multiple-selection answer`);
    requireCondition([...(activity.answers || [])].every((answer) => Number.isInteger(answer) && answer >= 0 && answer < (activity.options?.length || 0)), `${context} has an invalid multiple-selection answer`);
  }
  if (activity?.kind === "ordering") {
    const itemIds = new Set((activity.items || []).map((item) => item.id));
    requireCondition(Array.isArray(activity.items) && activity.items.length >= 3 && itemIds.size === activity.items.length, `${context} needs unique ordering items`);
    requireCondition(activity.items?.every((item) => typeof item.label === "string" && item.label.length >= 20), `${context} has a weak ordering label`);
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
    requireCondition(reviewDimensions.every((dimension) => review.activities?.some((activity) => activity.dimension === dimension)), `${review.module} review does not cover all five reasoning dimensions`);
    requireCondition(review.activities?.every((activity) => activity.module === review.module), `${review.module} review contains an activity assigned to another module`);
    for (const [index, activity] of (review.activities || []).entries()) validateActivity(activity, `${review.module} activity ${index + 1}`);
  }

  const finalQuestions = assessments.finalAssessment?.questions || [];
  requireCondition(finalQuestions.length === 20, `final assessment must contain 20 questions, found ${finalQuestions.length}`);
  for (const moduleId of moduleIds) {
    requireCondition(finalQuestions.filter((question) => question.module === moduleId).length === 2, `final assessment must contain exactly two ${moduleId} questions`);
  }
  for (const [index, question] of finalQuestions.entries()) validateActivity(question, `final question ${index + 1}`);
  requireCondition(finalDimensions.every((dimension) => finalQuestions.some((question) => question.dimension === dimension)), "final assessment does not sample all six reasoning dimensions");

  const allActivities = [...reviews.flatMap((review) => review.activities), ...finalQuestions];
  const allSingleCounts = allActivities.filter((activity) => activity.kind === "single").reduce((counts, activity) => counts.set(activity.answer, (counts.get(activity.answer) || 0) + 1), new Map());
  const allSingleTotal = [...allSingleCounts.values()].reduce((total, count) => total + count, 0);
  requireCondition(allSingleCounts.size >= 3, "single-choice answers use fewer than three positions");
  requireCondition(Math.max(...allSingleCounts.values()) <= Math.ceil(allSingleTotal * 0.5), "one single-choice answer position dominates more than half the assessment data");
  const finalSingleCounts = finalQuestions.filter((activity) => activity.kind === "single").reduce((counts, activity) => counts.set(activity.answer, (counts.get(activity.answer) || 0) + 1), new Map());
  requireCondition(finalSingleCounts.size >= 3 && Math.max(...finalSingleCounts.values()) <= 5, "final single-choice answer positions are predictable");
  const multipleSets = allActivities.filter((activity) => activity.kind === "multiple").map((activity) => [...activity.answers].sort((left, right) => left - right).join(","));
  requireCondition(new Set(multipleSets).size >= 4, "multiple-selection activities reuse too few answer-position patterns");
  const finalMultipleSets = finalQuestions.filter((activity) => activity.kind === "multiple").map((activity) => [...activity.answers].sort((left, right) => left - right).join(","));
  requireCondition(new Set(finalMultipleSets).size >= 3, "final multiple-selection answer positions are predictable");

  const finalCases = assessments.finalAssessment?.cases || [];
  requireCondition(assessments.finalAssessment?.version === 2, "integrated final assessment needs content version 2");
  requireCondition(finalCases.length === 5, `final assessment must contain five integrated cases, found ${finalCases.length}`);
  requireCondition(new Set(finalCases.map((caseFile) => caseFile.id)).size === 5, "final assessment repeats a case ID");
  requireCondition(finalCases.flatMap((caseFile) => caseFile.modules || []).length === 10, "final cases must declare ten module placements");
  requireCondition(new Set(finalCases.flatMap((caseFile) => caseFile.modules || [])).size === 10, "final cases do not cover every module exactly once");
  for (const [caseIndex, caseFile] of finalCases.entries()) {
    requireCondition(typeof caseFile.title === "string" && caseFile.title.length >= 20, `final case ${caseIndex + 1} needs a substantive title`);
    requireCondition(typeof caseFile.summary === "string" && caseFile.summary.length >= 80, `final case ${caseIndex + 1} needs a developed summary`);
    requireCondition(typeof caseFile.scenario === "string" && caseFile.scenario.length >= 150, `final case ${caseIndex + 1} needs a developed scenario`);
    requireCondition(Array.isArray(caseFile.modules) && caseFile.modules.length === 2 && caseFile.modules.every((module) => moduleIds.includes(module)), `final case ${caseIndex + 1} needs two valid module tags`);
    requireCondition(Array.isArray(caseFile.artifacts) && caseFile.artifacts.length >= 2 && caseFile.artifacts.every((artifact) => artifact.label?.length >= 5 && artifact.content?.length >= 70), `final case ${caseIndex + 1} needs two substantive artifacts`);
    requireCondition(Array.isArray(caseFile.questions) && caseFile.questions.length === 4, `final case ${caseIndex + 1} must contain four questions`);
    requireCondition(caseFile.questions.every((question) => caseFile.modules.includes(question.module)), `final case ${caseIndex + 1} contains a question outside its module pair`);
    requireCondition(caseFile.modules.every((module) => caseFile.questions.filter((question) => question.module === module).length === 2), `final case ${caseIndex + 1} must assign two questions to each paired module`);
    requireCondition(caseFile.questions.every((question) => finalQuestions.some((flat) => flat.id === question.id && flat.caseId === caseFile.id)), `final case ${caseIndex + 1} is not represented correctly in the flat question index`);
  }
  requireCondition(!assessments.finalAssessment?.practical, "outdated ungraded practical must not remain in the final assessment");
}

console.log(`module reviews: ${assessments?.moduleReviews?.length || 0}`);
console.log(`module activities: ${assessments?.moduleReviews?.reduce((count, review) => count + review.activities.length, 0) || 0}`);
console.log(`final questions: ${assessments?.finalAssessment?.questions?.length || 0}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
