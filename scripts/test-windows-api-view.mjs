import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";


const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const viewPath = path.join(root, "windows-api-view.js");
const indexPath = path.join(root, "index.html");

if (!fs.existsSync(viewPath)) {
  console.error("FAIL missing windows-api-view.js");
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, "utf8");
const dataVersion = indexHtml.match(/windows-api-data\.js\?v=([^"']+)/)?.[1];
const viewVersion = indexHtml.match(/windows-api-view\.js\?v=([^"']+)/)?.[1];

globalThis.window = {};
for (const filename of [
  "reference-data.js",
  "api-signatures.js",
  "api-signatures-stage3.js",
  "api-signatures-stage4.js",
  "api-signatures-stage6.js",
  "windows-api-data.js",
  "windows-api-view.js",
]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });
}

const guide = window.ILOVEOS_WINDOWS_API_GUIDE;
const view = window.ILOVEOS_WINDOWS_API_VIEW;
const errors = [];

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

requireCondition(Boolean(dataVersion && viewVersion), "Windows API guide scripts are missing cache versions");
requireCondition(dataVersion === viewVersion, "Windows API guide data and view cache versions do not match");
requireCondition(dataVersion !== "windows-api-guide", "Windows API guide still uses the stale first-release cache key");

const allocationMatches = view.filterEntries(guide.entries, "SIZE_T VirtualAllocEx");
requireCondition(allocationMatches.length === 1, `expected one VirtualAllocEx match, found ${allocationMatches.length}`);
requireCondition(allocationMatches[0]?.name === "VirtualAllocEx", "search did not return VirtualAllocEx");

const outputPointerMatches = view.filterEntries(guide.entries, "output count pointer");
requireCondition(outputPointerMatches.some((entry) => entry.name === "WriteProcessMemory"), "parameter explanations are not searchable");

const html = view.render(guide, "VirtualAllocEx");
for (const expected of [
  "Windows API guide",
  "VirtualAllocEx.argtypes",
  "Native declaration",
  "Python translation",
  "Checked call pattern",
  "remote_address = VirtualAllocEx(",
  "Result and failure",
  "Ownership and cleanup",
  "Microsoft Learn",
]) {
  requireCondition(html.includes(expected), `rendered guide is missing: ${expected}`);
}
requireCondition(!html.includes("translation-workflow"), "a direct API result still places the full tutorial before the catalogue");
requireCondition(!html.includes("WriteProcessMemory.argtypes"), "filtered rendering includes an unrelated API entry");

const fullHtml = view.render(guide, "");
requireCondition(fullHtml.includes("Native types to Python types"), "the unfiltered guide is missing its type map");
for (const unwanted of [
  "Start with the Windows operation",
  "Do not translate by resemblance",
  "Controlled Windows lab only",
  "How to translate Microsoft declarations",
  "translation-workflow",
]) {
  requireCondition(!fullHtml.includes(unwanted), `the unfiltered guide still renders unwanted introductory content: ${unwanted}`);
}
requireCondition(fullHtml.includes("Translated API catalogue"), "the unfiltered guide is missing its API catalogue");

const escaped = view.render(guide, "<script>alert(1)</script>");
requireCondition(!escaped.includes("<script>alert(1)</script>"), "guide renders the search query without HTML escaping");

console.log(`filtered entries: ${allocationMatches.length}`);
console.log(`rendered bytes: ${html.length}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
