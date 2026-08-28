import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { discoverPython } from "./check-python-syntax.mjs";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
globalThis.window = {};
vm.runInThisContext(fs.readFileSync(path.join(root, "pywin32-api-catalog.js"), "utf8"), { filename: "pywin32-api-catalog.js" });

const interpreter = discoverPython();
const result = spawnSync(interpreter.command, [...interpreter.args, path.join(scriptsDirectory, "audit_pywin32_runtime.py")], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 8 * 1024 * 1024,
});
if (result.error || result.status !== 0) throw result.error || new Error(result.stderr || `runtime audit exited with ${result.status}`);

const runtime = JSON.parse(result.stdout);
const documented = new Map(window.ILOVEOS_PYWIN32_API_CATALOG.modules.map((module) => [
  module.name,
  new Set(module.methods.map((method) => method.name)),
]));
const undocumentedRuntimeMethods = Object.entries(runtime.modules).flatMap(([moduleName, methods]) =>
  methods.filter((method) => !documented.get(moduleName)?.has(method)).map((method) => `${moduleName}::${method}`),
);

assert.deepEqual(
  undocumentedRuntimeMethods,
  [],
  "the installed pywin32 runtime exposes public methods missing from the published catalogue",
);
assert.deepEqual(Object.keys(runtime.unavailable), ["wincerapi"], "unexpected pywin32 modules were unavailable to the runtime audit");
console.log(`runtime modules audited: ${Object.keys(runtime.modules).length}`);
console.log(`runtime public methods covered: ${Object.values(runtime.modules).reduce((count, methods) => count + methods.length, 0)}`);
