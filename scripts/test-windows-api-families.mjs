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
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), sources: ["https://example.test/learn.microsoft.com"] }] })] }), "variant missing Microsoft Learn source: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), useWhen: "" }] })] }), "variant missing useWhen: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), useWhen: 42 }] })] }), "useWhen must be a string: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), keyBehaviors: Array.from({ length: 6 }, () => "Short behavior.") }] })] }), "too many key behaviors: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), keyBehaviors: "Short behavior." }] })] }), "keyBehaviors must be an array: SampleW");
errorFor(guide({ families: [family({ variants: [{ ...contract("SampleW"), keyBehaviors: [42] }] })] }), "key behavior must be a string: SampleW");
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

// These bindings protect parameter context: changing a token choice set or reusing
// a binding for a different overload must make this test fail.
const requiredBindings = [
  ["native", "OpenProcessToken.DesiredAccess", "token-access"],
  ["native", "DuplicateToken.ImpersonationLevel", "security-impersonation-level"],
  ["pywin32", "win32security::OpenProcessToken#0.DesiredAccess", "token-access"],
  ["pywin32", "win32security::DuplicateTokenEx#0.ImpersonationLevel", "security-impersonation-level"],
  ["pywin32", "win32security::DuplicateTokenEx#0.TokenType", "token-type"],
  ["pywin32", "win32security::DuplicateTokenEx#0.DesiredAccess", "token-access"],
];
for (const [surface, key, expectedId] of requiredBindings) {
  const resolved = familyData.resolveParameterChoices(key, surface);
  assert.equal(resolved?.id, expectedId, `${surface} ${key} must resolve its contextual choice set`);
}

const nativeAccess = familyData.resolveParameterChoices("OpenProcessToken.DesiredAccess", "native");
assert.deepEqual(nativeAccess?.values.map((value) => value.name), ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"]);
const pywin32Access = familyData.resolveParameterChoices("win32security::OpenProcessToken#0.DesiredAccess", "pywin32");
assert.deepEqual(pywin32Access?.values.map((value) => value.code), [
  "win32security.TOKEN_QUERY",
  "win32security.TOKEN_DUPLICATE",
  "win32security.TOKEN_ADJUST_PRIVILEGES",
]);
assert.equal(pywin32Access?.example?.code, "win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE");
assert.deepEqual(
  familyData.resolveParameterChoices("DuplicateToken.ImpersonationLevel", "native")?.values.map((value) => value.name),
  ["SecurityAnonymous", "SecurityIdentification", "SecurityImpersonation", "SecurityDelegation"],
);
assert.deepEqual(
  familyData.resolveParameterChoices("win32security::DuplicateTokenEx#0.TokenType", "pywin32")?.values.map((value) => value.name),
  ["TokenPrimary", "TokenImpersonation"],
);

// A binding may permit a subset in any order, but the displayed catalogue must
// retain its documented order. Reverting to binding.choices order breaks this.
familyData.nativeBindings["Sample.DesiredAccess"] = {
  choiceSet: "token-access",
  choices: ["TOKEN_ADJUST_PRIVILEGES", "TOKEN_QUERY"],
};
assert.deepEqual(
  familyData.resolveParameterChoices("Sample.DesiredAccess", "native")?.values.map((value) => value.name),
  ["TOKEN_QUERY", "TOKEN_ADJUST_PRIVILEGES"],
  "a filtered binding must preserve catalogue order",
);

const firstResolved = familyData.resolveParameterChoices("OpenProcessToken.DesiredAccess", "native");
firstResolved.values[0].code = "MUTATED_VALUE";
firstResolved.example.code = "MUTATED_EXAMPLE";
const secondResolved = familyData.resolveParameterChoices("OpenProcessToken.DesiredAccess", "native");
assert.equal(secondResolved.values[0].code, "TOKEN_QUERY", "a resolved value mutation must not affect a later resolve");
assert.equal(secondResolved.example.code, "TOKEN_QUERY | TOKEN_DUPLICATE", "a resolved example mutation must not affect a later resolve");
assert.equal(familyData.choiceSets["token-access"].values.TOKEN_QUERY.native, "TOKEN_QUERY", "a resolved value mutation must not affect the catalogue");

console.log(`legacy contracts covered: ${familyData.legacyApiNames.length}`);
console.log("errors: 0");
