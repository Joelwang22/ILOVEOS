import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { delay, evaluate, filePage, navigate, reportChecks, setViewport, waitFor, withBrowser } from "./browser-test-helpers.mjs";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");

globalThis.window = {};
for (const filename of [
  "reference-data.js", "api-signatures.js", "api-signatures-stage3.js", "api-signatures-stage4.js",
  "api-signatures-stage6.js", "windows-api-families.js", "course-api-coverage.js", "windows-api-data.js",
  "windows-sdk-catalog.js", "windows-sdk-catalog-view.js",
]) vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });

const catalog = window.ILOVEOS_WINDOWS_SDK_CATALOG;
const view = window.ILOVEOS_WINDOWS_SDK_VIEW;
const expected = {
  packageVersion: "71.0.20-preview",
  packageSha256: "43b9a07fb89fb1d43edd6a05855fe88a303bf450b267ec0c4aaf00064dc62bdb",
  definitionCount: 18345,
  signatureCount: 18344,
  functionCount: 18301,
  documentedFunctions: 13984,
  namespaceCount: 222,
  dllCount: 368,
  inventorySha256: "3c33ec4421e7c16f27da8e3eba275113d6ffa112317155a483b0cfbcd62e97c0",
};

for (const [field, value] of Object.entries(expected)) {
  assert.equal(catalog[field], value, `${field} changed without an intentional SDK catalogue regeneration`);
}
assert.equal(catalog.sourcePackage, "Microsoft.Windows.SDK.Win32Metadata");
assert.equal(catalog.projectUrl, "https://github.com/microsoft/win32metadata");
assert.match(catalog.packageUrl, /api\.nuget\.org\/.*71\.0\.20-preview/i);
assert.equal(catalog.namespaces.length, catalog.namespaceCount);

const allFunctions = catalog.namespaces.flatMap((namespace) => namespace.functions.map((item) => ({
  ...item,
  namespace: namespace.name,
  key: `${namespace.name}::${item.n}`,
})));
assert.equal(allFunctions.length, catalog.functionCount);
assert.equal(new Set(allFunctions.map((item) => item.key)).size, catalog.functionCount, "SDK catalogue has duplicate namespace/function keys");
assert.equal(new Set(allFunctions.map((item) => item.d.toLowerCase())).size, catalog.dllCount, "SDK catalogue DLL count disagrees with its contents");
assert.equal(allFunctions.filter((item) => item.u).length, catalog.documentedFunctions, "documented-function count disagrees with the catalogue");
assert.equal(allFunctions.reduce((count, item) => count + item.s.length, 0), catalog.signatureCount, "signature count disagrees with the catalogue");

for (const item of allFunctions) {
  assert.match(item.namespace, /^Windows\.Win32(?:\.|$)/, `${item.key} is outside the Win32 metadata namespaces`);
  assert.ok(item.n && item.d && item.s.length, `${item.key} has an incomplete callable identity`);
  if (item.u) assert.match(item.u, /^https:\/\/learn\.microsoft\.com\//, `${item.key} has a non-Microsoft documentation URL`);
  for (const [returns, parameters] of item.s) {
    assert.ok(typeof returns === "string" && returns.length > 0, `${item.key} has no return type`);
    assert.ok(Array.isArray(parameters), `${item.key} has no parameter list`);
    for (const parameter of parameters) {
      assert.ok(parameter.length >= 2 && parameter[0] && parameter[1], `${item.key} has an incomplete parameter`);
      if (parameter[2]) assert.match(parameter[2], /^(?:optional|out|inout)(?:,(?:out|inout))?$/, `${item.key}.${parameter[0]} has invalid flags`);
    }
  }
}

const getMessageKey = "Windows.Win32.UI.WindowsAndMessaging::GetMessageW";
const getMessageA = view.get("Windows.Win32.UI.WindowsAndMessaging::GetMessageA");
const getMessageW = view.get(getMessageKey);
for (const item of [getMessageA, getMessageW]) {
  assert.ok(item, `${item === getMessageA ? "GetMessageA" : "GetMessageW"} is absent`);
  assert.equal(item.d, "USER32.dll");
  assert.equal(item.h, "winuser.h");
  assert.equal(item.s[0][0], "BOOL");
  assert.deepEqual(item.s[0][1], [
    ["lpMsg", "MSG*", "out"],
    ["hWnd", "HWND", "optional"],
    ["wMsgFilterMin", "UINT32"],
    ["wMsgFilterMax", "UINT32"],
  ]);
}
assert.equal(getMessageW.u, "https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-getmessagew");
assert.ok(view.filter("GetMessageW").items.some((item) => item.key === getMessageKey));
assert.ok(view.renderDialog(getMessageW).includes("BOOL GetMessageW("), "GetMessageW popup omits the native signature");
assert.ok(view.renderDialog(getMessageW).includes("Microsoft Learn documentation"), "GetMessageW popup omits its authoritative documentation");

const generatedNames = new Set(allFunctions.map((item) => item.n));
const curatedNames = window.ILOVEOS_WINDOWS_API_GUIDE.families.flatMap((family) => family.variants.map((variant) => variant.name));
const curatedIntrinsics = new Set(["InterlockedExchangePointer"]);
assert.deepEqual(curatedNames.filter((name) => !generatedNames.has(name) && !curatedIntrinsics.has(name)), [], "a curated DLL function is absent from the generated SDK inventory");

const overview = view.renderOverview();
assert.equal((overview.match(/data-sdk-namespace=/g) || []).length, catalog.namespaceCount, "overview does not expose every SDK namespace");
assert.equal((overview.match(/class="[^"]*sdk-function-row/g) || []).length, 0, "overview eagerly renders thousands of function rows");
const broadSearch = view.renderSearch("Windows.Win32");
assert.ok((broadSearch.match(/class="[^"]*sdk-function-row/g) || []).length <= 200, "broad SDK search exceeds its render cap");

const browserChecks = {};
await withBrowser(async (client) => {
  await navigate(client, filePage(`#/reference/windows-api?q=GetMessageW&sdk=${encodeURIComponent(getMessageKey)}`));
  await waitFor(client, "document.querySelector('#api-detail-dialog')?.open", "SDK function popup", 20_000);
  Object.assign(browserChecks, await evaluate(client, `(() => {
    const main = document.querySelector('#main-content');
    const dialog = document.querySelector('#api-detail-dialog');
    const source = dialog.querySelector('.api-source-links a');
    const rect = dialog.getBoundingClientRect();
    return {
      fullCountShown: main.querySelector('.source-note')?.textContent.includes('18,301 P/Invoke functions'),
      getMessageSearchRowShown: Boolean(main.querySelector('[data-windows-sdk-key="${getMessageKey}"]')),
      sdkPopupNamed: dialog.querySelector('#api-detail-title')?.textContent.trim() === 'GetMessageW',
      sdkSignatureShown: dialog.querySelector('pre code')?.textContent.includes('BOOL GetMessageW('),
      sdkDllShown: dialog.querySelector('.sdk-metadata-list')?.textContent.includes('USER32.dll'),
      sdkDocsLinked: source?.href === 'https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-getmessagew',
      popupWithinViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
    };
  })()`));

  await evaluate(client, `document.querySelector('#api-detail-dialog').close(); location.hash = '#/reference/windows-api';`);
  await waitFor(client, "document.querySelectorAll('[data-sdk-namespace]').length === 222", "lazy SDK namespace overview", 20_000);
  Object.assign(browserChecks, await evaluate(client, `(() => {
    const namespaces = [...document.querySelectorAll('[data-sdk-namespace]')];
    const target = namespaces.find((item) => item.dataset.sdkNamespace === 'Windows.Win32.UI.WindowsAndMessaging');
    return {
      allNamespacesShown: namespaces.length === 222,
      noRowsBeforeOpen: document.querySelectorAll('.sdk-function-row').length === 0,
      targetNamespaceAvailable: Boolean(target),
    };
  })()`));
  await evaluate(client, `(() => {
    const target = [...document.querySelectorAll('[data-sdk-namespace]')].find((item) => item.dataset.sdkNamespace === 'Windows.Win32.UI.WindowsAndMessaging');
    target.open = true;
    target.dispatchEvent(new Event('toggle'));
  })()`);
  await delay(100);
  Object.assign(browserChecks, await evaluate(client, `(() => {
    const target = [...document.querySelectorAll('[data-sdk-namespace]')].find((item) => item.dataset.sdkNamespace === 'Windows.Win32.UI.WindowsAndMessaging');
    const rows = target.querySelectorAll('.sdk-function-row');
    const more = target.querySelector('[data-sdk-load-more]');
    return {
      firstNamespacePageLimited: rows.length === 100,
      namespaceCanLoadMore: Boolean(more),
    };
  })()`));
  await evaluate(client, `document.querySelector('[data-sdk-namespace="Windows.Win32.UI.WindowsAndMessaging"] [data-sdk-load-more]').click()`);
  await delay(100);
  Object.assign(browserChecks, await evaluate(client, `(() => {
    const target = document.querySelector('[data-sdk-namespace="Windows.Win32.UI.WindowsAndMessaging"]');
    return {
      secondNamespacePageHasTwoHundred: target.querySelectorAll('.sdk-function-row').length === 200,
      secondNamespacePageIncludesGetMessage: Boolean(target.querySelector('[data-windows-sdk-key="${getMessageKey}"]')),
    };
  })()`));

  await evaluate(client, `(() => {
    document.querySelector('#search-trigger').click();
    const input = document.querySelector('#search-input');
    input.value = 'GetMessageW';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await delay(100);
  Object.assign(browserChecks, await evaluate(client, `(() => {
    const result = [...document.querySelectorAll('.search-result')].find((item) => item.querySelector('strong')?.textContent.trim() === 'GetMessageW' && item.querySelector('.search-kind')?.textContent.trim() === 'Windows SDK API');
    return {
      getMessageInMainSearch: Boolean(result),
      mainSearchRetainsSdkIdentity: result?.getAttribute('href').includes('sdk=Windows.Win32.UI.WindowsAndMessaging%3A%3AGetMessageW') === true,
    };
  })()`));

  await setViewport(client, 390, 900, true);
  await navigate(client, filePage(`#/reference/windows-api?q=GetMessageW&sdk=${encodeURIComponent(getMessageKey)}`));
  await waitFor(client, "document.querySelector('#api-detail-dialog')?.open", "mobile SDK function popup", 20_000);
  Object.assign(browserChecks, await evaluate(client, `(() => {
    const dialog = document.querySelector('#api-detail-dialog');
    const rect = dialog.getBoundingClientRect();
    const metadataRows = [...dialog.querySelectorAll('.sdk-metadata-list > div')];
    return {
      mobilePopupWithinViewport: rect.left >= -1 && rect.right <= innerWidth + 1,
      mobileSignatureContained: [...dialog.querySelectorAll('pre')].every((pre) => pre.scrollWidth <= pre.clientWidth + 1 || ['auto', 'scroll'].includes(getComputedStyle(pre).overflowX)),
      mobileMetadataContained: metadataRows.every((row) => row.getBoundingClientRect().right <= innerWidth + 1),
      mobilePageHasNoHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
    };
  })()`));
});

console.log(`SDK functions: ${catalog.functionCount}`);
console.log(`SDK namespaces: ${catalog.namespaceCount}`);
console.log(`Microsoft Learn links: ${catalog.documentedFunctions}`);
reportChecks(browserChecks);
