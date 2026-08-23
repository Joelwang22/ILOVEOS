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
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const dataVersion = indexHtml.match(/windows-api-data\.js\?v=([^"']+)/)?.[1];
const viewVersion = indexHtml.match(/windows-api-view\.js\?v=([^"']+)/)?.[1];
const appVersion = indexHtml.match(/app\.js\?v=([^"']+)/)?.[1];
const styleVersion = indexHtml.match(/styles\.css\?v=([^"']+)/)?.[1];

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

requireCondition(Boolean(dataVersion && viewVersion && appVersion && styleVersion), "Windows API guide assets are missing cache versions");
requireCondition(dataVersion === viewVersion && viewVersion === appVersion && appVersion === styleVersion, "Windows API guide data, view, app, and stylesheet cache versions do not match");
requireCondition(dataVersion !== "windows-api-guide", "Windows API guide still uses the stale first-release cache key");
requireCondition(dataVersion !== "windows-api-guide-2", "Windows API redesign still uses the pre-redesign cache key");
requireCondition(dataVersion !== "windows-api-guide-3", "Windows API category colors still use the pre-color cache key");
for (const expected of [
  "windowsApiView.renderDialog(entry)",
  "trigger.dataset.windowsApi",
  "openWindowsApiDetails(exact.name)",
]) {
  requireCondition(appSource.includes(expected), `Windows API popup integration is missing: ${expected}`);
}
for (const obsoleteSelector of [".windows-api-wrap", ".windows-api-entry", ".native-type-row", ".native-parameter-row"]) {
  requireCondition(!styles.includes(obsoleteSelector), `obsolete Windows-only layout remains in CSS: ${obsoleteSelector}`);
}

const allocationMatches = view.filterEntries(guide.entries, "SIZE_T VirtualAllocEx");
requireCondition(allocationMatches.length === 1, `expected one VirtualAllocEx match, found ${allocationMatches.length}`);
requireCondition(allocationMatches[0]?.name === "VirtualAllocEx", "search did not return VirtualAllocEx");

const outputPointerMatches = view.filterEntries(guide.entries, "output count pointer");
requireCondition(outputPointerMatches.some((entry) => entry.name === "WriteProcessMemory"), "parameter explanations are not searchable");

const categoryAccents = {
  "Files, pipes, and devices": "green",
  "Hooks and desktop APIs": "orange",
  "Memory and address spaces": "teal",
  "Modules and loading": "violet",
  "Processes, threads, and handles": "blue",
  "Security and trust": "rose",
  "Services and Registry": "amber",
  "System information and errors": "cyan",
};
for (const [category, accent] of Object.entries(categoryAccents)) {
  const categoryHtml = view.renderEntries(guide.entries.filter((entry) => entry.category === category));
  requireCondition(categoryHtml.includes(`style="--reference-color: var(--${accent})"`), `${category} does not use its ${accent} accent`);
}

const html = view.render(guide, "VirtualAllocEx");
for (const expected of [
  "content-wrap reference-width",
  "reference-hero compact-reference-hero",
  "reference-filter sticky-filter",
  "reference-list",
  "api-module",
  "feature-table",
  'data-windows-api="VirtualAllocEx"',
]) {
  requireCondition(html.includes(expected), `redesigned guide is missing shared pywin32 structure: ${expected}`);
}
requireCondition(!html.includes('class="windows-api-entry"'), "API items still render as inline accordions");
requireCondition(!html.includes("VirtualAllocEx.argtypes"), "filtered page renders API details inline instead of in a dialog");
requireCondition(!html.includes("WriteProcessMemory"), "filtered rendering includes an unrelated API entry");
requireCondition(!html.includes('role="table"') && !html.includes('role="row"'), "clickable API rows expose an incomplete ARIA table structure");

requireCondition(typeof view.renderDialog === "function", "Windows API view does not expose a dialog renderer");
const dialogHtml = typeof view.renderDialog === "function" ? view.renderDialog(allocationMatches[0]) : "";
for (const expected of [
  'class="api-dialog-head"',
  'id="api-detail-title"',
  "VirtualAllocEx.argtypes",
  "Native declaration",
  "Python translation",
  "Checked call pattern",
  "remote_address = VirtualAllocEx(",
  "Result and failure",
  "Ownership and cleanup",
  "Microsoft Learn",
]) {
  requireCondition(dialogHtml.includes(expected), `rendered Windows API dialog is missing: ${expected}`);
}

const fullHtml = view.render(guide, "");
requireCondition(fullHtml.includes("Native types to Python types"), "the unfiltered guide is missing its type map");
requireCondition(fullHtml.includes("reference-patterns"), "native type map does not use the pywin32 pattern-card spacing");
for (const unwanted of [
  "Start with the Windows operation",
  "Do not translate by resemblance",
  "Controlled Windows lab only",
  "How to translate Microsoft declarations",
  "translation-workflow",
]) {
  requireCondition(!fullHtml.includes(unwanted), `the unfiltered guide still renders unwanted introductory content: ${unwanted}`);
}
requireCondition(fullHtml.includes("APIs"), "the unfiltered guide is missing its API count");

const escaped = view.render(guide, "<script>alert(1)</script>");
requireCondition(!escaped.includes("<script>alert(1)</script>"), "guide renders the search query without HTML escaping");

console.log(`filtered entries: ${allocationMatches.length}`);
console.log(`rendered bytes: ${html.length}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
