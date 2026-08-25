import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { practiceDownloads } from "./practice-audit.mjs";
import { runtimeValidationRows } from "./runtime-validation-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const physical = fs.readdirSync(path.join(root, "downloads")).filter((name) => name.endsWith(".py")).map((name) => `downloads/${name}`).sort();
const files = runtimeValidationRows.map((row) => row.file).sort();
assert.equal(runtimeValidationRows.length, 41);
assert.deepEqual(files, physical);
assert.equal(new Set(files).size, files.length);
assert.equal(runtimeValidationRows.filter((row) => row.mode === "automated-safe").length, 7);

const context = vm.createContext({ window: {} });
for (const sourceFile of ["lesson-content.js", ...fs.readdirSync(root).filter((name) => /^lesson-depth-.*\.js$/.test(name)).sort()]) {
  vm.runInContext(fs.readFileSync(path.join(root, sourceFile), "utf8"), context, { filename: sourceFile });
}
const references = context.window.ILOVEOS_LESSONS.flatMap((lesson) => {
  const expanded = { ...lesson, ...(context.window.ILOVEOS_LESSON_DEPTH[lesson.id] || {}) };
  return practiceDownloads(expanded.practice).map((item) => item.path);
});
assert.equal(references.length, 55);
const manifestFiles = new Set(files);
for (const reference of references) assert.ok(manifestFiles.has(reference), `missing manifest row for ${reference}`);

const required = ["mode", "dependencies", "interpreterArchitecture", "elevation", "stableAssertions", "variableEvidence", "expectedNonSuccessBranches", "cleanupAssertions", "externalEvidence", "commands", "operatorProtocol"];
for (const row of runtimeValidationRows) {
  assert.ok(["automated-safe", "operator-assisted", "authorised-lab-only"].includes(row.mode), `${row.file}: invalid mode`);
  for (const field of required) assert.ok(field in row && row[field] !== "" && (!Array.isArray(row[field]) || row[field].length), `${row.file}: missing ${field}`);
}
assert.match(runtimeValidationRows.find((row) => row.file.endsWith("access_check_lab.py")).operatorProtocol, /Never certify.*import-only/i);
assert.match(runtimeValidationRows.find((row) => row.file.endsWith("registry_views_lab.py")).operatorProtocol, /restore/i);
assert.match(runtimeValidationRows.find((row) => row.file.endsWith("service_controller_lab.py")).operatorProtocol, /original state/i);
assert.match(runtimeValidationRows.find((row) => row.file.endsWith("token_launch_lab.py")).operatorProtocol, /child process created=no/i);
console.log(`Runtime manifest: ${runtimeValidationRows.length} physical downloads and ${references.length} lesson references covered`);
