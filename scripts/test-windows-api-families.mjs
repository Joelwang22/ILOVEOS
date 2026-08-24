import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const familyPath = path.join(root, "windows-api-families.js");

if (!fs.existsSync(familyPath)) {
  throw new Error("missing windows-api-families.js");
}

globalThis.window = {};
vm.runInThisContext(fs.readFileSync(familyPath, "utf8"), { filename: "windows-api-families.js" });
const familyData = window.ILOVEOS_WINDOWS_API_FAMILY_DATA;
assert.ok(familyData, "missing ILOVEOS_WINDOWS_API_FAMILY_DATA");

for (const filename of [
  "reference-data.js",
  "api-signatures.js",
  "api-signatures-stage3.js",
  "api-signatures-stage4.js",
  "api-signatures-stage6.js",
  "windows-api-data.js",
]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });
}
assert.ok(window.ILOVEOS_WINDOWS_API_GUIDE?.families, "windows-api-data.js did not publish families");

const expectedLegacyNames = [
  "CreateNamedPipeW", "ReadFile", "WriteFile", "CallNextHookEx",
  "InterlockedExchangePointer", "MessageBoxA", "SetWindowsHookExW",
  "UnhookWindowsHookEx", "CreateFileMappingW", "GetNativeSystemInfo",
  "GetProcessHeap", "GetSystemInfo", "GlobalMemoryStatusEx", "HeapAlloc",
  "HeapFree", "HeapSize", "MapViewOfFile", "OpenFileMappingW",
  "QueryWorkingSetEx", "UnmapViewOfFile", "VirtualAlloc", "VirtualAllocEx",
  "VirtualFree", "VirtualFreeEx", "VirtualProtect", "VirtualProtectEx",
  "VirtualQueryEx", "WriteProcessMemory", "AddDllDirectory",
  "EnumProcessModules", "FreeLibrary", "GetModuleFileNameExW",
  "GetModuleFileNameW", "GetModuleHandleW", "GetProcAddress", "LoadLibraryA",
  "LoadLibraryExW", "LoadLibraryW", "RtlAddFunctionTable",
  "SetDefaultDllDirectories", "CloseHandle", "CreateEventW", "CreateMutexW",
  "CreateProcessW", "CreateRemoteThread", "FlushInstructionCache",
  "GetCurrentProcess", "GetExitCodeProcess", "IsWow64Process2", "OpenProcess",
  "OpenThread", "WaitForMultipleObjects", "WaitForSingleObject", "AccessCheck",
  "DuplicateToken", "GetNamedSecurityInfoW", "LocalFree", "MapGenericMask",
  "OpenProcessToken", "WinVerifyTrust", "CloseServiceHandle", "ControlService",
  "OpenSCManagerW", "OpenServiceW", "QueryServiceStatusEx", "RegOpenKeyExW",
  "StartServiceW", "GetLastError", "GetWindowsDirectoryW",
];
assert.deepEqual(familyData.legacyApiNames, expectedLegacyNames, "legacy API ledger changed");

const source = "https://learn.microsoft.com/windows/win32/api/example";
const contract = (name) => ({
  name,
  summary: "A concise contract summary.",
  useWhen: "Use this contract when the operation is needed.",
  availability: "Windows 10 and later",
  keyBehaviors: [],
  sources: [source],
  parameters: [],
});
const family = (overrides = {}) => ({
  id: "sample-family",
  name: "Sample",
  summary: "A sample family.",
  recommendedVariant: "SampleW",
  aliases: [],
  variants: [contract("SampleW")],
  ...overrides,
});
const guide = (overrides = {}) => ({
  families: [family()],
  legacyApiNames: ["SampleW"],
  ...overrides,
});
const errorFor = (candidate, expected) => {
  assert.ok(familyData.validateGuide(candidate).includes(expected), `expected ${expected}`);
};

errorFor(guide({ families: [family(), family({ id: "sample-family", recommendedVariant: "OtherW", variants: [contract("OtherW")] })] }), "duplicate family id: sample-family");
errorFor(guide({ families: [family({ variants: [contract("SampleW"), contract("SampleW")] })] }), "duplicate variant: SampleW");
errorFor(guide({ families: [family({ recommendedVariant: "MissingW" })] }), "missing recommended variant: sample-family/MissingW");
errorFor(guide({ families: [family({ aliases: [{ name: "Sample", target: "MissingW", note: "Bad target." }] })] }), "alias target missing: sample-family/Sample -> MissingW");
errorFor(guide({ legacyApiNames: ["MissingW"] }), "missing legacy contract: MissingW");
errorFor(guide({ legacyApiNames: ["SampleW", "SampleW"] }), "duplicate legacy contract: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), sources: [] }] })] }), "variant missing Microsoft Learn source: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), keyBehaviors: Array.from({ length: 6 }, () => "Short behavior.") }] })] }), "too many key behaviors: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), useWhen: Array.from({ length: 25 }, (_, index) => `word${index + 1}`).join(" ") }] })] }), "useWhen exceeds 24 words: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), keyBehaviors: [Array.from({ length: 31 }, (_, index) => `word${index + 1}`).join(" ")] }] })] }), "key behavior exceeds 30 words: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), parameters: [{ name: "value", choiceSet: "missing", choices: ["VALUE"] }] }] })] }), "unknown choice set: missing");
errorFor(guide({ choiceSets: { values: { values: { KNOWN: {} } } }, families: [family({ variants: [{ ...contract("SampleW"), parameters: [{ name: "value", choiceSet: "values", choices: ["MISSING"] }] }] })] }), "unknown choice value: values/MISSING");
errorFor(guide({
  families: [family({
    variants: [{
      ...contract("SampleW"),
      parameters: [{ name: "value", combinations: [{ code: "A" }, { code: "B" }] }],
    }],
  })],
}), "too many combination examples: SampleW/value");

const ungrouped = contract("SingleContract");
const explicitVariants = [contract("CreateEventA"), contract("CreateEventW"), contract("CreateEventExA"), contract("CreateEventExW")];
const builtFamilies = familyData.buildFamilies([ungrouped, ...explicitVariants]);
assert.deepEqual(builtFamilies.map((item) => item.id), ["create-event", "single-contract"]);
assert.equal(builtFamilies.find((item) => item.id === "single-contract")?.variants[0], ungrouped, "singleton should preserve its contract object");
assert.deepEqual(builtFamilies.find((item) => item.id === "create-event")?.variants.map((item) => item.name), ["CreateEventW", "CreateEventA", "CreateEventExW", "CreateEventExA"]);

console.log(`legacy contracts covered: ${familyData.legacyApiNames.length}`);
console.log("errors: 0");
