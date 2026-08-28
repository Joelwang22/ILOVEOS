import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");

globalThis.window = {};
for (const filename of [
  "reference-data.js", "api-signatures.js", "api-signatures-stage3.js", "api-signatures-stage4.js",
  "api-signatures-stage6.js", "windows-api-families.js", "course-api-coverage.js", "windows-api-data.js",
  "reference-overview-view.js", "windows-api-view.js",
]) vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });

const guide = window.ILOVEOS_WINDOWS_API_GUIDE;
const view = window.ILOVEOS_WINDOWS_API_VIEW;
assert.deepEqual(
  window.ILOVEOS_REFERENCE.pywin32Modules.filter((module) => Object.hasOwn(module, "constants")).map((module) => module.name),
  [],
  "pywin32 modules must not retain redundant constants-strip data",
);
const byVariant = (name) => guide.families.find((family) => family.variants.some((variant) => variant.name === name));
const renderNative = (name) => view.renderDialog(byVariant(name), name);

for (const [surface, bindings] of [
  ["native", window.ILOVEOS_WINDOWS_API_FAMILY_DATA.nativeBindings],
  ["pywin32", window.ILOVEOS_WINDOWS_API_FAMILY_DATA.pywin32Bindings],
]) {
  for (const key of Object.keys(bindings)) {
    const resolved = window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveParameterChoices(key, surface);
    assert.ok(resolved?.values.length, `${surface} ${key} must resolve at least one contextual value`);
    const markup = view.renderParameterChoices(resolved, `${surface}-${key}`);
    for (const value of resolved.values) {
      assert.ok(value.code.trim(), `${surface} ${key} has an empty usage expression`);
      if (surface === "native") assert.ok(value.definition.trim(), `${surface} ${key}.${value.name} has no Python definition`);
      assert.ok(markup.includes(value.code.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")), `${surface} ${key} omits an escaped expression`);
      assert.ok(markup.includes("data-api-choice-select"), `${surface} ${key} omits selection controls`);
      assert.ok(!markup.includes("data-copy-api-value"), `${surface} ${key} still exposes per-value Copy controls`);
    }
    const generated = view.buildGeneratedCode(surface, resolved.parameter, resolved.values);
    assert.ok(generated.usage && generated.complete && !generated.complete.includes("undefined"), `${surface} ${key} does not generate complete code`);
    if (surface === "native") {
      for (const value of resolved.values) assert.ok(generated.definitions.includes(`${value.name} = ${value.definition}`), `${surface} ${key}.${value.name} is absent from generated definitions`);
    } else {
      const requiredModules = [...new Set(resolved.values.map((value) => value.code.match(/^([A-Za-z_]\w*)\./)?.[1]).filter(Boolean))];
      for (const module of requiredModules) assert.ok(generated.definitions.includes(`import ${module}`), `${surface} ${key} omits import ${module}`);
    }
  }
}

const nativePipeChoices = window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveParameterChoices("CreateNamedPipeW.dwOpenMode", "native");
const nativePipeCode = view.buildGeneratedCode("native", "dwOpenMode", nativePipeChoices.values.filter((value) => ["PIPE_ACCESS_DUPLEX", "FILE_FLAG_OVERLAPPED"].includes(value.name)));
assert.equal(nativePipeCode.definitions, "PIPE_ACCESS_DUPLEX = 0x00000003\nFILE_FLAG_OVERLAPPED = 0x40000000", "native generator definitions are not paste-ready");
assert.equal(nativePipeCode.usage, "PIPE_ACCESS_DUPLEX | FILE_FLAG_OVERLAPPED", "native generator does not compose the selected flags");
const pyPipeChoices = window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveParameterChoices("win32pipe::CreateNamedPipe#0.openMode", "pywin32");
const pyPipeCode = view.buildGeneratedCode("pywin32", "openMode", pyPipeChoices.values.filter((value) => ["PIPE_ACCESS_DUPLEX", "FILE_FLAG_OVERLAPPED"].includes(value.name)));
assert.equal(pyPipeCode.definitions, "import win32file\nimport win32pipe", "pywin32 generator does not deduplicate and sort required imports");
assert.equal(pyPipeCode.usage, "win32pipe.PIPE_ACCESS_DUPLEX | win32file.FILE_FLAG_OVERLAPPED", "pywin32 generator does not retain owning modules");

const representedPywin32Parameters = new Map();
for (const module of window.ILOVEOS_REFERENCE.pywin32Modules) {
  for (const feature of module.features) {
    const detail = window.ILOVEOS_API_SIGNATURES[`${module.name}::${feature.name}`];
    for (const [signatureIndex, signature] of (detail?.signatures || []).entries()) {
      for (const parameter of signature.parameters || []) {
        const key = `${module.name}::${signature.name}#${signatureIndex}.${parameter.name}`;
        const owners = representedPywin32Parameters.get(key) || [];
        owners.push({ module: module.name, feature: feature.name });
        representedPywin32Parameters.set(key, owners);
      }
    }
  }
}
assert.deepEqual(
  Object.keys(window.ILOVEOS_WINDOWS_API_FAMILY_DATA.pywin32Bindings).filter((key) => !representedPywin32Parameters.has(key)),
  [],
  "every Python/reference binding must own an existing represented parameter",
);
const searchCasesByOwner = new Map();
for (const key of Object.keys(window.ILOVEOS_WINDOWS_API_FAMILY_DATA.pywin32Bindings)) {
  const representedOwners = representedPywin32Parameters.get(key);
  const values = window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveParameterChoices(key, "pywin32")?.values || [];
  for (const owner of representedOwners) {
    const ownerKey = `${owner.module}\u0000${owner.feature}`;
    const searchCase = searchCasesByOwner.get(ownerKey) || { owner, codes: new Set() };
    for (const value of values) searchCase.codes.add(value.code);
    searchCasesByOwner.set(ownerKey, searchCase);
  }
}
const pywin32SearchCases = [...searchCasesByOwner.values()].map(({ owner, codes }) => ({
  owner,
  codes: [...codes],
  query: [...codes].join(" "),
}));

const expectOnly = (html, present, absent, label) => {
  assert.ok(html.includes('class="api-parameter-choices"'), `${label} must render contextual choices`);
  for (const value of present) assert.ok(html.includes(value), `${label} omits ${value}`);
  for (const value of absent) assert.ok(!html.includes(value), `${label} leaks ${value}`);
};

expectOnly(renderNative("OpenProcessToken"), ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"], ["SecurityAnonymous", "TokenPrimary"], "native OpenProcessToken");
expectOnly(renderNative("DuplicateToken"), ["SecurityAnonymous", "SecurityIdentification", "SecurityImpersonation", "SecurityDelegation"], ["TOKEN_QUERY", "TokenPrimary"], "native DuplicateToken");
assert.ok(!renderNative("CloseHandle").includes("api-parameter-choices"), "CloseHandle must not render a contextual-choice section");
const nativeWow64Markup = renderNative("IsWow64Process2");
assert.ok(!nativeWow64Markup.includes("data-api-choice-select"), "native IsWow64Process2 output pointers must not render selection controls");
assert.ok(nativeWow64Markup.includes("IMAGE_FILE_MACHINE_UNKNOWN") && nativeWow64Markup.includes("IMAGE_FILE_MACHINE_*"), "native IsWow64Process2 outcome must explain returned machine constants");

const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.PROGRAMFILES_X86 && path.join(process.env.PROGRAMFILES_X86, "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"),
].filter(Boolean);
const browser = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!browser) throw new Error("no supported Chromium browser found for parameter-choice tests");

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-api-parameter-choices-"));
const pagePath = path.join(tempDirectory, "index.html");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const probe = `<script>
  window.addEventListener("DOMContentLoaded", async () => {
    const checks = {};
    const wait = () => new Promise((resolve) => setTimeout(resolve, 70));
    const changeRoute = async (hash) => { window.location.hash = hash; await wait(); };
    const parameterRow = (name) => [...document.querySelectorAll(".parameter-list > div")]
      .find((row) => row.firstElementChild?.textContent.trim() === name);
    const choiceSection = (row) => row?.querySelector(".api-parameter-choices");
    const hasOnly = (section, expected, unexpected) => Boolean(section)
      && expected.every((value) => section.textContent.includes(value))
      && unexpected.every((value) => !section.textContent.includes(value));
    try {
      await wait();
      const nativeRow = parameterRow("DesiredAccess");
      checks.nativeParameterAssociation = hasOnly(nativeRow && choiceSection(nativeRow), ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"], ["SecurityAnonymous", "TokenPrimary"]);
      checks.closeHandleHasNoChoices = !window.ILOVEOS_WINDOWS_API_VIEW.renderDialog(
        window.ILOVEOS_WINDOWS_API_GUIDE.families.find((family) => family.variants.some((variant) => variant.name === "CloseHandle")),
        "CloseHandle",
      ).includes("api-parameter-choices");

      await changeRoute("#/reference/windows-api?q=CreateNamedPipeW");
      const nativeOpenMode = choiceSection(parameterRow("dwOpenMode"));
      const nativeChoice = (name) => nativeOpenMode?.querySelector('[data-choice-name="' + name + '"]');
      nativeChoice("PIPE_ACCESS_DUPLEX")?.click();
      nativeChoice("FILE_FLAG_OVERLAPPED")?.click();
      await wait();
      const nativeGenerate = nativeOpenMode?.querySelector("[data-generate-api-choices]");
      const apiScrollBeforeGenerate = document.querySelector("#api-detail-dialog").scrollTop;
      nativeGenerate?.click();
      await wait();
      checks.nativeSelectionsReplaceCopyButtons = nativeOpenMode?.querySelectorAll("[data-api-choice-select]").length === 5
        && !nativeOpenMode?.querySelector("[data-copy-api-value]")
        && nativeOpenMode?.querySelector("[data-api-choice-count]")?.textContent === "2 selected";
      checks.apiStaysOpenUnderGeneratedDialog = document.querySelector("#api-detail-dialog").open;
      checks.generatedDialogOpens = document.querySelector("#api-generated-dialog").open;
      checks.generatedDialogUsesModalLayer = document.querySelector("#api-generated-dialog").matches(":modal");
      checks.nativeDefinitionsGenerated = document.querySelector('[data-generated-code="definitions"]')?.textContent.split(String.fromCharCode(10)).join("|") === "PIPE_ACCESS_DUPLEX = 0x00000003|FILE_FLAG_OVERLAPPED = 0x40000000";
      checks.nativeUsageGenerated = document.querySelector('[data-generated-code="usage"]')?.textContent === "PIPE_ACCESS_DUPLEX | FILE_FLAG_OVERLAPPED";
      let copied = "";
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { copied = value; } } });
      document.querySelector('[data-copy-generated="complete"]')?.click();
      await wait();
      checks.completeNativeSelectionCopies = copied.includes("PIPE_ACCESS_DUPLEX = 0x00000003")
        && copied.includes("FILE_FLAG_OVERLAPPED = 0x40000000")
        && copied.endsWith("PIPE_ACCESS_DUPLEX | FILE_FLAG_OVERLAPPED");
      document.querySelector("[data-close-generated-code]")?.click();
      await wait();
      checks.generatedCloseKeepsApiOpen = document.querySelector("#api-detail-dialog").open && !document.querySelector("#api-generated-dialog").open;
      checks.generatedCloseReturnsFocus = document.activeElement === nativeGenerate;
      checks.generatedClosePreservesSelections = nativeChoice("PIPE_ACCESS_DUPLEX")?.checked && nativeChoice("FILE_FLAG_OVERLAPPED")?.checked;
      checks.generatedClosePreservesApiScroll = document.querySelector("#api-detail-dialog").scrollTop === apiScrollBeforeGenerate;
      nativeChoice("PIPE_ACCESS_OUTBOUND")?.click();
      checks.exclusivePipeDirectionEnforced = nativeChoice("PIPE_ACCESS_OUTBOUND")?.checked && !nativeChoice("PIPE_ACCESS_DUPLEX")?.checked && nativeChoice("FILE_FLAG_OVERLAPPED")?.checked;

      await changeRoute("#/reference/windows-api?q=VirtualAlloc");
      const allocationSection = choiceSection(parameterRow("flAllocationType"));
      const allocationChoice = (name) => allocationSection?.querySelector('[data-choice-name="' + name + '"]');
      allocationChoice("MEM_RESERVE")?.click();
      allocationChoice("MEM_COMMIT")?.click();
      allocationChoice("MEM_RESET")?.click();
      checks.standaloneFlagClearsCombinedFlags = allocationChoice("MEM_RESET")?.checked && !allocationChoice("MEM_RESERVE")?.checked && !allocationChoice("MEM_COMMIT")?.checked;
      allocationChoice("MEM_RESERVE")?.click();
      checks.combinableFlagClearsStandaloneFlag = allocationChoice("MEM_RESERVE")?.checked && !allocationChoice("MEM_RESET")?.checked;

      await changeRoute("#/reference/pywin32?api=OpenProcessToken");
      const renderedMain = document.querySelector("main");
      const pywin32ModuleCards = [...document.querySelectorAll("#reference-list .api-module")];
      checks.pywin32OuterCategoryTagsRetained = pywin32ModuleCards.length > 0 && pywin32ModuleCards.every((card) => card.querySelector(":scope > summary .reference-category"));
      checks.pywin32InnerContextTagsRemoved = pywin32ModuleCards.every((card) => !card.querySelector(".api-module-body .api-context"));
      checks.pywin32ConstantsStripRemoved = !renderedMain?.querySelector(".constant-strip") && !renderedMain?.innerText.includes("Constants you will meet");
      const pywin32Summary = document.querySelector("#api-detail-content > .api-dialog-body > .api-dialog-summary");
      checks.pywin32PopupCategoryTagsRemoved = Boolean(pywin32Summary?.querySelector("p")) && !pywin32Summary.querySelector(":scope > span");
      const pyRow = parameterRow("desiredAccess");
      checks.pywin32OpenProcessTokenAssociation = hasOnly(choiceSection(pyRow), ["win32security.TOKEN_QUERY", "win32security.TOKEN_DUPLICATE", "win32security.TOKEN_ADJUST_PRIVILEGES"], ["win32security.SecurityAnonymous", "win32security.TokenPrimary"]);
      const pySection = choiceSection(pyRow);
      pySection?.querySelector('[data-choice-name="TOKEN_QUERY"]')?.click();
      pySection?.querySelector('[data-choice-name="TOKEN_DUPLICATE"]')?.click();
      pySection?.querySelector("[data-generate-api-choices]")?.click();
      await wait();
      checks.pywin32ImportsGenerated = document.querySelector('[data-generated-code="definitions"]')?.textContent === "import win32security";
      checks.pywin32QualifiedUsageGenerated = document.querySelector('[data-generated-code="usage"]')?.textContent === "win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE";
      document.querySelector('[data-copy-generated="usage"]')?.click();
      await wait();
      checks.copiesExactCombination = copied === "win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE";
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("blocked"); } } });
      document.querySelector('[data-copy-generated="usage"]')?.click();
      await wait();
      checks.rejectionSelectsOnlyGeneratedBlock = window.getSelection()?.toString() === "win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE"
        && document.querySelector('[data-generated-copy-status="usage"]')?.textContent === "Code selected. Press Ctrl+C to copy.";
      document.querySelector("[data-close-generated-code]")?.click();
      await wait();
      pySection?.querySelector("[data-clear-api-choices]")?.click();
      pySection?.querySelector("[data-api-choice-preset]")?.click();
      checks.suggestedCombinationSelectsExactValues = [...pySection.querySelectorAll("[data-api-choice-select]:checked")].map((input) => input.dataset.choiceName).join("|") === "TOKEN_QUERY|TOKEN_DUPLICATE";

      await changeRoute("#/reference/pywin32?api=DuplicateTokenEx");
      const duplicateRows = [...document.querySelectorAll(".parameter-list > div")];
      checks.pywin32DuplicateTokenExOnlyBoundValues = hasOnly(choiceSection(duplicateRows.find((row) => row.firstElementChild?.textContent.trim() === "ImpersonationLevel")), ["win32security.SecurityAnonymous", "win32security.SecurityDelegation"], ["win32security.TokenPrimary", "win32security.TOKEN_QUERY"])
        && hasOnly(choiceSection(duplicateRows.find((row) => row.firstElementChild?.textContent.trim() === "TokenType")), ["win32security.TokenPrimary", "win32security.TokenImpersonation"], ["win32security.SecurityAnonymous", "win32security.TOKEN_QUERY"])
        && hasOnly(choiceSection(duplicateRows.find((row) => row.firstElementChild?.textContent.trim() === "DesiredAccess")), ["win32security.TOKEN_QUERY", "win32security.TOKEN_DUPLICATE"], ["win32security.SecurityAnonymous", "win32security.TokenPrimary"]);

      await changeRoute("#/reference/pywin32?api=IsWow64Process2");
      const wow64OutputRows = ["pProcessMachine", "pNativeMachine"].map(parameterRow);
      checks.referenceWow64OutputPointersHaveNoSelectionControls = wow64OutputRows.every((row) => Boolean(row)
        && !choiceSection(row)
        && !row.querySelector("[data-api-choice-select]"));

      await changeRoute("#/reference/pywin32?q=win32con.GENERIC_READ");
      checks.pywin32ChoiceConstantIsSearchable = [...document.querySelectorAll("[data-api-feature]")]
        .some((button) => button.dataset.apiFeature === "CreateFile");

      const exhaustiveSearchCases = ${JSON.stringify(pywin32SearchCases)};
      const exhaustiveSearchFailures = [];
      const documentUrl = location.href.split("#")[0];
      for (const [searchIndex, item] of exhaustiveSearchCases.entries()) {
        history.replaceState(null, "", documentUrl + "#/reference/pywin32?q=" + encodeURIComponent(item.query));
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        await new Promise((resolve) => setTimeout(resolve, 40));
        const rendered = [...document.querySelectorAll("[data-api-feature]")];
        if (!rendered.some((button) => button.dataset.apiModule === item.owner.module && button.dataset.apiFeature === item.owner.feature)) {
          exhaustiveSearchFailures.push(searchIndex + ":" + item.owner.module + "::" + item.owner.feature + " <- " + item.codes.join(", "));
        }
      }
      checks.everyPywin32ChoiceConstantIsSearchable = exhaustiveSearchFailures.length ? exhaustiveSearchFailures.length + " failures: " + exhaustiveSearchFailures.slice(0, 20).join("; ") : true;

      const openFamily = window.ILOVEOS_WINDOWS_API_GUIDE.families.find((family) => family.variants.some((variant) => variant.name === "OpenProcessToken"));
      const closeFamily = window.ILOVEOS_WINDOWS_API_GUIDE.families.find((family) => family.variants.some((variant) => variant.name === "CloseHandle"));
      const syntheticFamily = { id: "parameter-switch", name: "Parameter switch", summary: "Test family.", recommendedVariant: "OpenProcessToken", aliases: [], variants: [openFamily.variants.find((variant) => variant.name === "OpenProcessToken"), closeFamily.variants.find((variant) => variant.name === "CloseHandle")] };
      const host = document.querySelector("#api-detail-content");
      host.innerHTML = window.ILOVEOS_WINDOWS_API_VIEW.renderDialog(syntheticFamily, "OpenProcessToken");
      const firstHasChoices = host.querySelector(".api-parameter-choices") !== null;
      host.innerHTML = window.ILOVEOS_WINDOWS_API_VIEW.renderDialog(syntheticFamily, "CloseHandle");
      checks.switchingVariantRemovesOtherChoices = firstHasChoices && host.querySelector(".api-parameter-choices") === null;

      await changeRoute("#/reference/pywin32?api=OpenProcessToken");
      checks.reopeningPywin32ResetsSelections = !document.querySelector("[data-api-choice-select]:checked")
        && document.querySelector("[data-api-choice-count]")?.textContent === "0 selected";
    } catch (error) {
      checks.exception = error.message;
    }
    document.body.innerHTML = '<pre id="api-parameter-choice-result">' + JSON.stringify(checks) + "</pre>";
  });
<\/script>`;

try {
  const source = fs.readFileSync(path.join(root, "index.html"), "utf8")
    .replace("<head>", `<head><base href="${baseUrl}">`)
    .replace("</body>", `${probe}</body>`);
  fs.writeFileSync(pagePath, source);
  const run = spawnSync(browser, [
    "--headless=new", "--disable-gpu", "--no-first-run", "--virtual-time-budget=25000",
    `--user-data-dir=${profilePath}`, "--dump-dom", `${pathToFileURL(pagePath).href}#/reference/windows-api?q=OpenProcessToken`,
  ], { encoding: "utf8", timeout: 45000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="api-parameter-choice-result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return parameter-choice results (exit ${run.status}): ${run.stderr.trim()}`);
  const results = JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  console.log(JSON.stringify(results));
  for (const [name, passed] of Object.entries(results)) if (passed !== true) {
    console.error(`ERROR ${name}: ${String(passed)}`);
    process.exitCode = 1;
  }
} finally {
  if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) fs.rmSync(tempDirectory, { recursive: true, force: true });
}
