import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const viewPath = path.join(root, "reference-overview-view.js");
const errors = [];

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

globalThis.window = {};
if (fs.existsSync(viewPath)) {
  vm.runInThisContext(fs.readFileSync(viewPath, "utf8"), { filename: "reference-overview-view.js" });
}

const view = window.ILOVEOS_REFERENCE_OVERVIEW_VIEW;
requireCondition(Boolean(view), "shared reference overview renderer is missing");

if (view) {
  const windowsButton = view.renderButton({
    kind: "windows-types",
    title: "Native Windows type translations",
    summary: "Scalar, handle, address, string, pointer, structure, and callback mappings.",
  });
  requireCondition(windowsButton.includes('data-reference-overview="windows-types"'), "Windows type overview is not a popup button");
  requireCondition(windowsButton.includes("Native Windows type translations"), "Windows type overview button is missing its title");
  requireCondition(!windowsButton.includes("<details") && !windowsButton.includes("<summary"), "Windows type overview still renders as a dropdown");

  const mappings = [
    { native: "HANDLE", python: "wintypes.HANDLE", meaning: "Opaque object handle." },
    { native: "LPWSTR", python: "wintypes.LPWSTR", meaning: "Writable Unicode string pointer." },
  ];
  const windowsDialog = view.renderWindowsTypesDialog(mappings);
  for (const expected of [
    'id="api-detail-title"',
    "Native Windows type translations",
    "Scalar, handle, and address types",
    "Strings, pointers, structures, and callbacks",
    "HANDLE",
    "wintypes.HANDLE",
    "LPWSTR",
    "wintypes.LPWSTR",
  ]) {
    requireCondition(windowsDialog.includes(expected), `Windows type popup is missing: ${expected}`);
  }
  requireCondition(!windowsDialog.includes("<details") && !windowsDialog.includes("<summary"), "Windows type popup contains nested dropdowns");

  const pywin32Button = view.renderButton({
    kind: "pywin32-essentials",
    title: "pywin32 essentials",
    summary: "Installation, cleanup, errors, access rights, wrapper selection, and constants.",
  });
  requireCondition(pywin32Button.includes('data-reference-overview="pywin32-essentials"'), "pywin32 essentials is not a popup button");
  requireCondition(!pywin32Button.includes("<details") && !pywin32Button.includes("<summary"), "pywin32 essentials still renders as a dropdown");

  const patterns = [
    { title: "Install and verify pywin32", summary: "Verify imports.", code: "import win32api" },
    { title: "Always close owned handles", summary: "Close owned handles.", code: "win32api.CloseHandle(handle)" },
  ];
  const pywin32Dialog = view.renderPywin32PatternsDialog(patterns);
  for (const expected of [
    'id="api-detail-title"',
    "pywin32 essentials",
    "Install and verify pywin32",
    "Verify imports.",
    "import win32api",
    "Always close owned handles",
    "win32api.CloseHandle(handle)",
  ]) {
    requireCondition(pywin32Dialog.includes(expected), `pywin32 essentials popup is missing: ${expected}`);
  }
  requireCondition(!pywin32Dialog.includes("<details") && !pywin32Dialog.includes("<summary"), "pywin32 essentials popup contains nested dropdowns");

  requireCondition(typeof view.renderDialog === "function", "reference overview popup router is missing");
  if (typeof view.renderDialog === "function") {
    requireCondition(view.renderDialog("windows-types", { mappings, patterns }).includes("Native Windows type translations"), "Windows type button kind does not resolve to its popup");
    requireCondition(view.renderDialog("pywin32-essentials", { mappings, patterns }).includes("pywin32 essentials"), "pywin32 button kind does not resolve to its popup");
    requireCondition(view.renderDialog("unknown", { mappings, patterns }).includes("unavailable"), "unknown reference overview kinds do not fail safely");
  }

  const escaped = view.renderButton({ kind: "<script>", title: "<img src=x>", summary: "A & B" });
  requireCondition(!escaped.includes("<script>") && !escaped.includes("<img src=x>"), "reference overview button does not escape dynamic content");
}

console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
