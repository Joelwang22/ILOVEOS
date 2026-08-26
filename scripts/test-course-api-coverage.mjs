import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");

globalThis.window = {};
for (const filename of [
  "windows-api-families.js",
  "reference-data.js",
  "api-signatures.js",
  "api-signatures-stage3.js",
  "api-signatures-stage4.js",
  "api-signatures-stage6.js",
  "course-api-coverage.js",
  "windows-api-data.js",
]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });
}

const manifest = window.ILOVEOS_COURSE_API_COVERAGE;
assert.ok(manifest, "missing course API coverage manifest");
assert.equal(manifest.sourceBasis.length, 5, "course source basis changed without review");
assert.equal(manifest.expandedNativeVariants.length, 39, "course native expansion changed without review");
assert.equal(manifest.pywin32.length, 58, "course pywin32 inventory changed without review");
assert.equal(manifest.native.length, 92, "course native API inventory changed without review");

const pywin32GuideKeys = new Set(window.ILOVEOS_REFERENCE.pywin32Modules.flatMap((module) =>
  module.features.map((feature) => `${module.name}::${feature.name}`),
));
const nativeVariants = new Set(window.ILOVEOS_WINDOWS_API_GUIDE.families.flatMap((family) =>
  family.variants.map((variant) => variant.name),
));

const pywin32References = manifest.pywin32.map((item) => item.courseReference);
const nativeReferences = manifest.native.map((item) => item.courseReference);
assert.equal(new Set(pywin32References).size, pywin32References.length, "duplicate course pywin32 reference");
assert.equal(new Set(nativeReferences).size, nativeReferences.length, "duplicate course native API reference");

assert.deepEqual(
  manifest.pywin32.filter((item) => !pywin32GuideKeys.has(item.guideKey)),
  [],
  "every pywin32 reference extracted from the supplied course files must map to a visible guide entry",
);
assert.deepEqual(
  manifest.native.filter((item) => !nativeVariants.has(item.guideVariant)),
  [],
  "every native API reference extracted from the supplied course files must map to a callable guide variant",
);

const addedNativeContracts = Object.entries(window.ILOVEOS_API_SIGNATURES)
  .filter(([key]) => key.startsWith("ctypes / ctypes.wintypes::"))
  .filter(([key]) => manifest.expandedNativeVariants.includes(key.split("::").at(-1)))
  .filter(([, detail]) => detail.sources?.some((source) => source.startsWith("https://learn.microsoft.com/")));
for (const [key, detail] of addedNativeContracts) {
  assert.ok(detail.signatures?.length, `${key} must have at least one native signature`);
  for (const signature of detail.signatures) {
    assert.equal(typeof signature.returns, "string", `${key}/${signature.name} must declare a return type`);
    for (const parameter of signature.parameters || []) {
      assert.ok(parameter.name && parameter.type && parameter.description, `${key}/${signature.name} has an incomplete parameter`);
    }
  }
}

console.log(`course pywin32 references covered: ${manifest.pywin32.length}`);
console.log(`course native API references covered: ${manifest.native.length}`);
console.log(`Windows API callable variants available: ${nativeVariants.size}`);
