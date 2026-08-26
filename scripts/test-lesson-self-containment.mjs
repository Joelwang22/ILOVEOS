import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const context = { window: {} };
vm.createContext(context);

for (const filename of [
  "lesson-content.js",
  ...fs.readdirSync(root).filter((name) => /^lesson-depth-.*\.js$/.test(name)).sort()
]) {
  vm.runInContext(fs.readFileSync(new URL(filename, root), "utf8"), context, { filename });
}

function collectStrings(value, path, output) {
  if (typeof value === "string") {
    output.push({ path, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${path}[${index}]`, output));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => collectStrings(item, `${path}.${key}`, output));
  }
}

const lessons = context.window.ILOVEOS_LESSONS.map((lesson) => ({
  ...lesson,
  ...(context.window.ILOVEOS_LESSON_DEPTH[lesson.id] || {})
}));

const dependencyPatterns = [
  /\b(?:previous|earlier|later|next|prior|another|other) lessons?\b/i,
  /\b(?:previous|earlier|later|next|prior) modules?\b/i,
  /\b(?:previous|earlier|later|next|prior)(?:\s+[A-Za-z0-9-]+){0,2}\s+(?:lesson|module|topic|section)s?\b/i,
  /\blessons? (?:before|after)\b/i,
  /\b(?:as (?:you|we) (?:saw|learned|covered)|covered earlier|introduced earlier|discussed earlier)\b/i,
  /\b(?:from|in) the (?:previous|earlier|next|later) (?:lesson|module)\b/i,
  /\b(?:return to|recall from) (?:the )?(?:lesson|module)\b/i,
  /\b(?:this|the) lesson (?:reuses|builds on|depends on|assumes)\b/i,
  /\b(?:lesson|module) [0-9]+\b/i
];

const dependencyFailures = [];
const filenameFailures = [];
const unavailableArtifactFailures = [];

for (const lesson of lessons) {
  const allStrings = [];
  collectStrings(lesson, `lesson.${lesson.id}`, allStrings);
  for (const item of allStrings) {
    if (dependencyPatterns.some((pattern) => pattern.test(item.text))) {
      dependencyFailures.push(`${item.path}: ${item.text}`);
    }
    if (/\b(?:GoodLog\.exe|BadLog\.exe|how_to_load)\b/i.test(item.text)) {
      unavailableArtifactFailures.push(`${item.path}: ${item.text}`);
    }
  }

  const beforePractice = { ...lesson };
  delete beforePractice.practice;
  delete beforePractice.sources;
  const prePracticeStrings = [];
  collectStrings(beforePractice, `lesson.${lesson.id}`, prePracticeStrings);
  for (const item of prePracticeStrings) {
    const filenames = item.text.match(/\b[A-Za-z0-9_-]+\.py\b/gi) || [];
    if (filenames.length > 0) {
      filenameFailures.push(`${item.path}: ${[...new Set(filenames)].join(", ")} in ${item.text}`);
    }
  }
}

const failureSections = [];
if (dependencyFailures.length > 0) {
  failureSections.push(`Lesson-to-lesson dependencies found; restate the required context in the current lesson:\n${dependencyFailures.join("\n")}`);
}
if (filenameFailures.length > 0) {
  failureSections.push(`Exercise filenames used before the lesson provides its practice download:\n${filenameFailures.join("\n")}`);
}
if (unavailableArtifactFailures.length > 0) {
  failureSections.push(`Unavailable legacy course artifacts referenced by the rendered lesson:\n${unavailableArtifactFailures.join("\n")}`);
}
assert.equal(failureSections.length, 0, failureSections.join("\n\n"));

console.log(`Lesson self-containment checks passed (${lessons.length} rendered lessons)`);
