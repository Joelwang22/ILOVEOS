import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { discoverPython } from "./check-python-syntax.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
globalThis.window = {};
for (const filename of ["windows-api-families.js", "windows-api-view.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });
}

const data = window.ILOVEOS_WINDOWS_API_FAMILY_DATA;
const view = window.ILOVEOS_WINDOWS_API_VIEW;
const generated = Object.keys(data.nativeBindings).map((key) => {
  const resolved = data.resolveParameterChoices(key, "native");
  assert.ok(resolved.values.every((value) => value.definition), `${key} has an undefined native value`);
  return { key, ...view.buildGeneratedCode("native", resolved.parameter, resolved.values) };
});

const interpreter = discoverPython();
const runner = `
import json, sys
items = json.load(sys.stdin)
for item in items:
    namespace = {}
    exec(item["definitions"], namespace)
    eval(item["usage"], namespace)
print(len(items))
`;
const result = spawnSync(interpreter.command, [...interpreter.args, "-I", "-B", "-c", runner], {
  cwd: root,
  encoding: "utf8",
  input: JSON.stringify(generated),
  windowsHide: true,
});
assert.equal(result.status, 0, result.error?.message || result.stderr || "generated definitions failed");
assert.equal(Number(result.stdout.trim()), generated.length, "not every native binding was executed");
console.log(`Generated native code executed for ${generated.length} parameter bindings`);
