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
  "api-signatures-stage6.js", "windows-api-families.js", "windows-api-data.js",
  "reference-overview-view.js", "windows-api-view.js",
]) vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });

const guide = window.ILOVEOS_WINDOWS_API_GUIDE;
const view = window.ILOVEOS_WINDOWS_API_VIEW;
const byVariant = (name) => guide.families.find((family) => family.variants.some((variant) => variant.name === name));
const renderNative = (name) => view.renderDialog(byVariant(name), name);

const expectOnly = (html, present, absent, label) => {
  assert.ok(html.includes('class="api-parameter-choices"'), `${label} must render contextual choices`);
  for (const value of present) assert.ok(html.includes(value), `${label} omits ${value}`);
  for (const value of absent) assert.ok(!html.includes(value), `${label} leaks ${value}`);
};

expectOnly(renderNative("OpenProcessToken"), ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"], ["SecurityAnonymous", "TokenPrimary"], "native OpenProcessToken");
expectOnly(renderNative("DuplicateToken"), ["SecurityAnonymous", "SecurityIdentification", "SecurityImpersonation", "SecurityDelegation"], ["TOKEN_QUERY", "TokenPrimary"], "native DuplicateToken");
assert.ok(!renderNative("CloseHandle").includes("api-parameter-choices"), "CloseHandle must not render a contextual-choice section");

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

      await changeRoute("#/reference/pywin32?api=OpenProcessToken");
      const pyRow = parameterRow("desiredAccess");
      checks.pywin32OpenProcessTokenAssociation = hasOnly(choiceSection(pyRow), ["win32security.TOKEN_QUERY", "win32security.TOKEN_DUPLICATE", "win32security.TOKEN_ADJUST_PRIVILEGES"], ["win32security.SecurityAnonymous", "win32security.TokenPrimary"]);
      let copied = "";
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { copied = value; } } });
      const queryRow = [...pyRow.querySelectorAll(".api-choice-row")].find((row) => row.querySelector("[data-api-value-code]")?.textContent === "win32security.TOKEN_QUERY");
      queryRow?.querySelector("[data-copy-api-value]")?.click();
      await wait();
      checks.copiesModuleQualifiedValue = copied === "win32security.TOKEN_QUERY" && queryRow?.querySelector("[data-api-value-status]")?.textContent === "Copied";
      const exampleRow = pyRow.querySelector(".api-choice-example");
      exampleRow?.querySelector("[data-copy-api-value]")?.click();
      await wait();
      checks.copiesExactCombination = copied === "win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE";
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("blocked"); } } });
      queryRow?.querySelector("[data-copy-api-value]")?.click();
      await wait();
      checks.rejectionSelectsOnlyLocalValue = window.getSelection()?.toString() === "win32security.TOKEN_QUERY"
        && queryRow?.querySelector("[data-api-value-status]")?.textContent === "Value selected. Press Ctrl+C to copy."
        && exampleRow?.querySelector("[data-api-value-status]")?.textContent === "Copied";

      await changeRoute("#/reference/pywin32?api=DuplicateTokenEx");
      const duplicateRows = [...document.querySelectorAll(".parameter-list > div")];
      checks.pywin32DuplicateTokenExOnlyBoundValues = hasOnly(choiceSection(duplicateRows.find((row) => row.firstElementChild?.textContent.trim() === "ImpersonationLevel")), ["win32security.SecurityAnonymous", "win32security.SecurityDelegation"], ["win32security.TokenPrimary", "win32security.TOKEN_QUERY"])
        && hasOnly(choiceSection(duplicateRows.find((row) => row.firstElementChild?.textContent.trim() === "TokenType")), ["win32security.TokenPrimary", "win32security.TokenImpersonation"], ["win32security.SecurityAnonymous", "win32security.TOKEN_QUERY"])
        && hasOnly(choiceSection(duplicateRows.find((row) => row.firstElementChild?.textContent.trim() === "DesiredAccess")), ["win32security.TOKEN_QUERY", "win32security.TOKEN_DUPLICATE"], ["win32security.SecurityAnonymous", "win32security.TokenPrimary"]);

      const openFamily = window.ILOVEOS_WINDOWS_API_GUIDE.families.find((family) => family.variants.some((variant) => variant.name === "OpenProcessToken"));
      const closeFamily = window.ILOVEOS_WINDOWS_API_GUIDE.families.find((family) => family.variants.some((variant) => variant.name === "CloseHandle"));
      const syntheticFamily = { id: "parameter-switch", name: "Parameter switch", summary: "Test family.", recommendedVariant: "OpenProcessToken", aliases: [], variants: [openFamily.variants.find((variant) => variant.name === "OpenProcessToken"), closeFamily.variants.find((variant) => variant.name === "CloseHandle")] };
      const host = document.querySelector("#api-detail-content");
      host.innerHTML = window.ILOVEOS_WINDOWS_API_VIEW.renderDialog(syntheticFamily, "OpenProcessToken");
      const firstHasChoices = host.querySelector(".api-parameter-choices") !== null;
      host.innerHTML = window.ILOVEOS_WINDOWS_API_VIEW.renderDialog(syntheticFamily, "CloseHandle");
      checks.switchingVariantRemovesOtherChoices = firstHasChoices && host.querySelector(".api-parameter-choices") === null;

      await changeRoute("#/reference/pywin32?api=OpenProcessToken");
      checks.reopeningPywin32ResetsCopyStatuses = [...document.querySelectorAll("[data-api-value-status]")].every((status) => status.textContent === "");
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
    "--headless=new", "--disable-gpu", "--no-first-run", "--virtual-time-budget=12000",
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
