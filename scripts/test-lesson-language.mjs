import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const files = [
  "lesson-content.js",
  ...fs.readdirSync(root).filter((name) => /^lesson-depth-.*\.js$/.test(name)).sort(),
  "assessment-data.js"
];

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

const strings = [];
for (const filename of files) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL(filename, root), "utf8"), context, { filename });
  const fileStrings = [];
  collectStrings(context.window, "window", fileStrings);
  fileStrings.forEach((item) => strings.push({ filename, ...item }));
}

const disallowedTemplates = [
  ["ambiguous 'most directly' question template", /\bmost directly\b/i],
  ["compressed non-execution wording", /\bwall time spent not executing\b/i],
  ["abstract 'difference permits' wording", /\bwhat does the difference\b.*\bpermit/i],
  ["question fragment used as an action title", /^Need\b.*\?$/i],
  ["internal setup-failure label", /\bsetup-failure\b/i],
  ["internal protected-invariant label", /\bprotected-invariant\b/i],
  ["internal success-shaped label", /\bsuccess-shaped\b/i],
  ["editorial showcase terminology", /\bshowcase\b/i],
  ["unnatural owned-target terminology", /\bowned (?:notepad|powershell|director(?:y|ies)|path|csv|log|same-user)\b/i]
];

const failures = [];
for (const item of strings) {
  for (const [label, pattern] of disallowedTemplates) {
    if (pattern.test(item.text)) failures.push(`${label}: ${item.filename} ${item.path}: ${item.text}`);
  }
}

assert.equal(failures.length, 0, `Unnatural lesson-language templates found:\n${failures.join("\n")}`);
console.log(`Lesson language checks passed (${files.length} files, ${strings.length} learner-facing strings)`);
