import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
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

function loadStringsFromSource(filename, source) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename });
  const strings = [];
  collectStrings(context.window, "window", strings);
  return strings;
}

function loadStrings(filename) {
  return loadStringsFromSource(filename, fs.readFileSync(new URL(filename, root), "utf8"));
}

function loadHeadStrings(filename) {
  const source = execFileSync("git", ["show", `HEAD:${filename}`], {
    cwd: fileURLToPath(root),
    encoding: "utf8"
  });
  return loadStringsFromSource(filename, source);
}

function fingerprint(strings) {
  return crypto.createHash("sha256").update(JSON.stringify(strings)).digest("hex");
}

const command = process.argv[2] || "stats";
if (command === "stats") {
  let total = 0;
  for (const filename of files) {
    const strings = loadStrings(filename);
    total += strings.length;
    console.log(`${filename}\t${strings.length}\t${fingerprint(strings)}`);
  }
  console.log(`TOTAL\t${total}`);
} else if (command === "file") {
  const filename = process.argv[3];
  if (!files.includes(filename)) throw new Error(`Unknown learner-facing file: ${filename}`);
  const start = Math.max(1, Number.parseInt(process.argv[4] || "1", 10));
  const count = Math.max(1, Number.parseInt(process.argv[5] || "100", 10));
  const strings = loadStrings(filename);
  for (let index = start - 1; index < Math.min(strings.length, start - 1 + count); index += 1) {
    const item = strings[index];
    console.log(`${index + 1}\t${item.path}\t${JSON.stringify(item.text)}`);
  }
} else if (command === "changed") {
  const requestedFile = process.argv[3];
  const selectedFiles = requestedFile ? [requestedFile] : files;
  if (requestedFile && !files.includes(requestedFile)) throw new Error(`Unknown learner-facing file: ${requestedFile}`);
  let total = 0;
  for (const filename of selectedFiles) {
    const beforeByPath = new Map(loadHeadStrings(filename).map((item) => [item.path, item.text]));
    const changed = loadStrings(filename).filter((item) => beforeByPath.get(item.path) !== item.text);
    total += changed.length;
    console.log(`${filename}\t${changed.length} changed learner-facing strings`);
    changed.forEach((item, index) => console.log(`${index + 1}\t${item.path}\t${JSON.stringify(item.text)}`));
  }
  console.log(`TOTAL CHANGED\t${total}`);
} else {
  throw new Error("Usage: node scripts/review-lesson-language.mjs stats | file <filename> [start] [count] | changed [filename]");
}
