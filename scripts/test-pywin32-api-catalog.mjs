import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { delay, evaluate, filePage, navigate, reportChecks, waitFor, withBrowser } from "./browser-test-helpers.mjs";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");

globalThis.window = {};
for (const filename of [
  "reference-data.js",
  "api-signatures.js",
  "api-signatures-stage3.js",
  "api-signatures-stage4.js",
  "api-signatures-stage6.js",
  "pywin32-api-catalog.js",
  "pywin32-catalog-integration.js",
]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });
}

const catalog = window.ILOVEOS_PYWIN32_API_CATALOG;
const stats = window.ILOVEOS_PYWIN32_CATALOG_STATS;
const modules = window.ILOVEOS_REFERENCE.pywin32Modules;
const signatures = window.ILOVEOS_API_SIGNATURES;
const expectedModules = [
  "_winxptheme", "mmapfile", "odbc", "perfmon", "pywintypes", "servicemanager", "timer", "win2kras",
  "win32api", "win32clipboard", "win32console", "win32cred", "win32crypt", "win32event", "win32evtlog",
  "win32file", "win32gui", "win32help", "win32inet", "win32job", "win32lz", "win32net", "win32pdh",
  "win32pipe", "win32print", "win32process", "win32profile", "win32ras", "win32security", "win32service",
  "win32transaction", "win32ts", "win32wnet", "wincerapi",
].sort();

assert.equal(catalog.moduleCount, 34, "published pywin32 module count changed without catalogue regeneration");
assert.equal(catalog.documentedMethodCount, 1348, "published pywin32 method count changed without catalogue regeneration");
assert.equal(catalog.runtimeMethodCount, 1378, "installed pywin32 public callable count changed without catalogue regeneration");
assert.equal(catalog.runtimeOnlyMethods.length, 71, "runtime-only callable count changed without catalogue regeneration");
assert.equal(catalog.methodCount, 1419, "pywin32 documented/runtime union changed without catalogue regeneration");
assert.equal(catalog.inventorySha256, "c4923954c92aca138a5292de751e0ac1a0c888f2cc9bfe86a2b1a54cd097f679", "pywin32 callable inventory changed without review");
assert.deepEqual(catalog.modules.map((module) => module.name).sort(), expectedModules, "catalogue does not enumerate the complete published module index");

const keys = [];
for (const sourceModule of catalog.modules) {
  assert.ok(sourceModule.methods.length > 0, `${sourceModule.name} has no enumerated methods`);
  const targetName = ["win32net", "win32wnet"].includes(sourceModule.name) ? "win32net / win32wnet" : sourceModule.name;
  const target = modules.find((module) => module.name === targetName);
  assert.ok(target, `${sourceModule.name} is not represented by a visible guide module`);
  for (const method of sourceModule.methods) {
    const key = `${sourceModule.name}::${method.name}`;
    keys.push(key);
    assert.ok(method.summary && method.source && method.signature, `${key} has incomplete generated metadata`);
    assert.ok(method.signature.parameters && method.signature.returns, `${key} has no callable contract`);
    const featureName = targetName === "win32net / win32wnet" ? `${sourceModule.name}.${method.name}` : method.name;
    assert.ok(target.features.some((feature) => feature.name === featureName), `${key} is missing from the learner-facing guide`);
    assert.ok(signatures[`${targetName}::${featureName}`]?.signatures?.length, `${key} has no learner-facing signature`);
  }
}

assert.equal(new Set(keys).size, catalog.methodCount, "catalogue contains duplicate method keys");
assert.equal(stats.representedMethods, catalog.methodCount, "not every published method reached the learner-facing data");
assert.equal(stats.unavailableMethodPages.length, 7, "broken upstream method-page inventory changed without review");

const gui = modules.find((module) => module.name === "win32gui");
const getMessage = gui.features.find((feature) => feature.name === "GetMessage");
const getMessageDetail = signatures["win32gui::GetMessage"];
assert.ok(getMessage, "win32gui.GetMessage is missing from the guide");
assert.match(getMessage.detail, /calling thread's queue/i, "GetMessage did not retain its curated learner guidance");
assert.deepEqual(getMessageDetail.signatures[0].parameters.map((parameter) => parameter.name), ["hwnd", "min", "max"]);
assert.equal(getMessageDetail.signatures[0].returns, "MSG");
assert.equal(getMessageDetail.sources[0], "https://timgolden.me.uk/pywin32-docs/win32gui__GetMessage_meth.html");

const browserChecks = {};
await withBrowser(async (client) => {
  await navigate(client, filePage("#/reference/pywin32?q=GetMessage&module=win32gui&api=GetMessage"));
  await waitFor(client, `document.querySelector('#api-detail-dialog')?.open`, "GetMessage API popup");
  await delay(50);
  Object.assign(browserChecks, await evaluate(client, `(() => {
    const main = document.querySelector('#main-content');
    const dialog = document.querySelector('#api-detail-dialog');
    const source = dialog.querySelector('.api-source-links a');
    const rect = dialog.getBoundingClientRect();
    return {
      inventoryCountShown: main.querySelector('.source-note')?.textContent.includes('34 modules · 1,419 public callables') && main.querySelector('.source-note')?.textContent.includes('1,348 published methods plus 71 additional callables'),
      filteredModulesLimited: main.querySelectorAll('.api-module').length > 0 && main.querySelectorAll('.api-module').length < 4,
      getMessageVisible: main.querySelector('[data-api-feature="GetMessage"]')?.dataset.apiModule === 'win32gui',
      getMessagePopupNamed: dialog.querySelector('#api-detail-title')?.textContent.trim() === 'GetMessage',
      getMessageSignatureShown: dialog.querySelector('.signature-block code')?.textContent.includes('GetMessage(hwnd: int, min: int, max: int) -> MSG'),
      getMessageGuidanceShown: dialog.querySelector('.api-dialog-summary')?.textContent.includes("calling thread's queue"),
      getMessageSourceLinked: source?.href === 'https://timgolden.me.uk/pywin32-docs/win32gui__GetMessage_meth.html',
      popupWithinViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
    };
  })()`));
  await evaluate(client, `(() => {
    document.querySelector('#api-detail-dialog').close();
    document.querySelector('#search-trigger').click();
    const input = document.querySelector('#search-input');
    input.value = 'GetMessage';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await delay(80);
  Object.assign(browserChecks, await evaluate(client, `(() => {
    const result = [...document.querySelectorAll('.search-result')].find((item) => item.querySelector('strong')?.textContent.trim() === 'GetMessage');
    return {
      getMessageInMainSearch: Boolean(result),
      mainSearchRetainsModuleIdentity: result?.getAttribute('href').includes('module=win32gui') === true,
    };
  })()`));
});

console.log(`published pywin32 modules: ${catalog.moduleCount}`);
console.log(`published pywin32 methods: ${catalog.documentedMethodCount}`);
console.log(`documented/runtime union: ${catalog.methodCount}`);
console.log(`learner-facing pywin32 modules: ${modules.length}`);
console.log(`learner-facing entries: ${modules.reduce((count, module) => count + module.features.length, 0)}`);
reportChecks(browserChecks);
