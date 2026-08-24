import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { practiceDownloads, validatePractice } from "./practice-audit.mjs";


const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const dataFiles = [
  "content.js",
  "lesson-content.js",
  "lesson-depth-foundations.js",
  "lesson-depth-processes.js",
  "lesson-depth-threads.js",
  "lesson-depth-memory.js",
  "lesson-depth-linking.js",
  "lesson-depth-management.js",
  "lesson-depth-security.js",
  "lesson-depth-sync-ipc.js",
  "lesson-depth-hooking.js",
  "reference-data.js",
  "api-signatures.js",
  "api-signatures-stage3.js",
  "api-signatures-stage4.js",
  "api-signatures-stage6.js",
  "windows-api-data.js",
  "assessment-data.js",
];

globalThis.window = {};
for (const filename of dataFiles) {
  const source = fs.readFileSync(path.join(root, filename), "utf8");
  vm.runInThisContext(source, { filename });
}

const modules = window.ILOVEOS_DATA.modules;
const lessons = window.ILOVEOS_LESSONS;
const depth = window.ILOVEOS_LESSON_DEPTH;
const reference = window.ILOVEOS_REFERENCE;
const signatures = window.ILOVEOS_API_SIGNATURES;
const windowsApiGuide = window.ILOVEOS_WINDOWS_API_GUIDE;
const assessments = window.ILOVEOS_ASSESSMENTS;
const errors = [];
const warnings = [];

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

function duplicateValues(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

requireCondition(modules.length === 10, `expected 10 modules, found ${modules.length}`);
requireCondition(lessons.length === 62, `expected 62 lessons, found ${lessons.length}`);
requireCondition(assessments.moduleReviews.length === 10, `expected 10 module reviews, found ${assessments.moduleReviews.length}`);
requireCondition(assessments.moduleReviews.reduce((count, review) => count + review.activities.length, 0) === 50, "expected 50 module-review activities");
requireCondition(assessments.finalAssessment.questions.length === 20, `expected 20 final-assessment questions, found ${assessments.finalAssessment.questions.length}`);
for (const id of duplicateValues(modules.map((module) => module.id))) errors.push(`duplicate module id: ${id}`);
for (const id of duplicateValues(lessons.map((lesson) => lesson.id))) errors.push(`duplicate lesson id: ${id}`);

for (const module of modules) {
  const moduleLessons = lessons.filter((lesson) => lesson.module === module.id);
  requireCondition(module.lessons === moduleLessons.length, `${module.id}: card count ${module.lessons}, actual ${moduleLessons.length}`);
  requireCondition(module.lessonTitles.length === moduleLessons.length, `${module.id}: lessonTitles length mismatch`);
  moduleLessons.forEach((lesson, index) => {
    requireCondition(module.lessonTitles[index] === lesson.title, `${module.id}: title mismatch at lesson ${index + 1}`);
  });
}

const downloadPaths = [];
const sourceUrls = [];
let investigationCount = 0;
let commandCount = 0;
let checkpointCount = 0;
let choiceCheckpointCount = 0;
for (const lesson of lessons) {
  const expanded = { ...lesson, ...(depth[lesson.id] || {}) };
  const prefix = `${lesson.module}/${lesson.id}`;
  requireCondition(Boolean(depth[lesson.id]), `${prefix}: missing depth entry`);
  requireCondition((expanded.learning || []).length >= 2, `${prefix}: fewer than two learning blocks`);
  requireCondition((expanded.visuals || []).length >= 1, `${prefix}: missing visual model`);
  requireCondition((expanded.workedExamples || []).length >= 1, `${prefix}: missing worked example`);
  requireCondition((expanded.windowsLearning || []).length >= 1, `${prefix}: missing Windows learning block`);
  requireCondition(Boolean(expanded.practice), `${prefix}: missing integrated practice`);
  requireCondition((expanded.practice?.steps || []).length >= 3, `${prefix}: practice has fewer than three steps`);
  requireCondition(Boolean(expanded.practice?.expectedOutcome), `${prefix}: practice missing expected outcome`);
  requireCondition((expanded.practice?.cleanup || []).length >= 1, `${prefix}: practice missing cleanup`);
  requireCondition((expanded.checks || []).length >= 2, `${prefix}: fewer than two review questions`);
  requireCondition((expanded.keys || []).length >= 3, `${prefix}: fewer than three take-forward points`);
  requireCondition((expanded.sources || []).length >= 1, `${prefix}: missing primary source`);
  if (expanded.practice) {
    investigationCount += 1;
    const practiceResult = validatePractice(expanded.practice, prefix, {
      enforceClarity: true,
      readDownloadSource(downloadPath) {
        return fs.readFileSync(path.join(root, downloadPath), "utf8");
      },
    });
    errors.push(...practiceResult.errors);
    warnings.push(...practiceResult.warnings);
    commandCount += practiceResult.commandCount;
    checkpointCount += practiceResult.checkpointCount;
    choiceCheckpointCount += practiceResult.choiceCheckpointCount;
    for (const download of practiceDownloads(expanded.practice)) downloadPaths.push({ lesson: prefix, path: download.path });
  }
  for (const [, url] of expanded.sources || []) sourceUrls.push({ owner: prefix, url });
}

for (const item of downloadPaths) {
  requireCondition(fs.existsSync(path.join(root, item.path)), `${item.lesson}: missing download ${item.path}`);
}

const referenceNames = new Map();
for (const module of reference.pywin32Modules) {
  for (const feature of module.features) {
    const key = `${module.name}::${feature.name}`;
    requireCondition(!referenceNames.has(key), `duplicate reference feature: ${key}`);
    referenceNames.set(key, true);
    const signature = signatures[key];
    if (signature) {
      requireCondition((signature.signatures || []).length >= 1, `${key}: empty signature list`);
      for (const variant of signature.signatures || []) {
        requireCondition(Boolean(variant.name), `${key}: signature missing name`);
        requireCondition(typeof variant.returns === "string", `${key}: signature missing return type`);
        for (const parameter of variant.parameters || []) {
          requireCondition(Boolean(parameter.name && parameter.type), `${key}: incomplete parameter`);
        }
      }
    }
  }
}

for (const tool of reference.sysinternalsTools) {
  for (const source of tool.sources || []) sourceUrls.push({ owner: `toolbox/${tool.name}`, url: source });
}

requireCondition((windowsApiGuide?.typeMappings || []).length >= 12, "Windows API guide has an incomplete type-translation table");
requireCondition((windowsApiGuide?.entries || []).length >= 69, `expected at least 69 Windows API guide entries, found ${windowsApiGuide?.entries?.length || 0}`);
const windowsApiEntries = new Map((windowsApiGuide?.entries || []).map((entry) => [entry.name, entry]));
for (const [key, value] of Object.entries(signatures)) {
  if (!key.startsWith("ctypes / ctypes.wintypes::")) continue;
  if (!(value.sources || []).some((source) => source.includes("learn.microsoft.com"))) continue;
  for (const signature of value.signatures || []) {
    const entry = windowsApiEntries.get(signature.name);
    requireCondition(Boolean(entry), `Windows API guide missing ${signature.name}`);
    requireCondition(Boolean(entry?.nativeSignature && entry?.python && entry?.example), `Windows API guide has an incomplete translation for ${signature.name}`);
  }
}
for (const entry of windowsApiGuide?.entries || []) {
  for (const source of entry.sources || []) sourceUrls.push({ owner: `windows-api/${entry.name}`, url: source });
}

for (const item of sourceUrls) {
  try {
    const parsed = new URL(item.url);
    requireCondition(parsed.protocol === "https:", `${item.owner}: non-HTTPS source ${item.url}`);
  } catch {
    errors.push(`${item.owner}: invalid source URL ${item.url}`);
  }
}

const textFiles = fs.readdirSync(root, { recursive: true }).filter((relative) => {
  if (relative.startsWith(".git") || relative.startsWith(".superpowers") || relative.startsWith(".worktrees") || relative.includes("node_modules")) return false;
  return /\.(?:js|mjs|html|css|md|py)$/.test(relative);
});
const disallowedDash = String.fromCodePoint(0x2014);
for (const relative of textFiles) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  if (source.includes(disallowedDash)) errors.push(`${relative}: contains a disallowed em dash`);
}

async function checkUrl(item) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    let response = await fetch(item.url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(item.url, { method: "GET", redirect: "follow", signal: controller.signal });
    }
    if (response.body) await response.body.cancel();
    if (response.status >= 400) errors.push(`${item.owner}: source returned HTTP ${response.status}: ${item.url}`);
  } catch (error) {
    warnings.push(`${item.owner}: source check failed (${error.name}): ${item.url}`);
  } finally {
    clearTimeout(timer);
  }
}

if (process.argv.includes("--check-links")) {
  const unique = [...new Map(sourceUrls.map((item) => [item.url, item])).values()];
  const queue = [...unique];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) await checkUrl(queue.shift());
  });
  await Promise.all(workers);
}

console.log(`modules: ${modules.length}`);
console.log(`lessons: ${lessons.length}`);
console.log(`deep lessons: ${lessons.filter((lesson) => depth[lesson.id]).length}`);
console.log(`guided investigations: ${investigationCount}`);
console.log(`practice command blocks: ${commandCount}`);
console.log(`practice checkpoints: ${checkpointCount}`);
console.log(`choice checkpoints: ${choiceCheckpointCount}`);
console.log(`downloads checked: ${downloadPaths.length}`);
console.log(`reference features: ${referenceNames.size}`);
console.log(`API signature entries: ${Object.keys(signatures).length}`);
console.log(`Windows API guide entries: ${windowsApiEntries.size}`);
console.log(`module review activities: ${assessments.moduleReviews.reduce((count, review) => count + review.activities.length, 0)}`);
console.log(`final assessment questions: ${assessments.finalAssessment.questions.length}`);
console.log(`unique lesson/tool sources: ${new Set(sourceUrls.map((item) => item.url)).size}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
console.log(`warnings: ${warnings.length}`);
for (const warning of warnings) console.log(`WARN ${warning}`);
if (errors.length || warnings.length) process.exitCode = 1;
