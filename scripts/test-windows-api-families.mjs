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

const representedNativeParameterKeys = new Set(
  window.ILOVEOS_WINDOWS_API_GUIDE.families.flatMap((family) => family.variants
    .flatMap((variant) => variant.parameters.map((parameter) => `${variant.name}.${parameter.name}`))),
);
const representedPywin32ParameterKeys = new Set();
for (const module of window.ILOVEOS_REFERENCE.pywin32Modules) {
  for (const feature of module.features) {
    const detail = window.ILOVEOS_API_SIGNATURES[`${module.name}::${feature.name}`];
    for (const [signatureIndex, signature] of (detail?.signatures || []).entries()) {
      for (const parameter of signature.parameters || []) {
        representedPywin32ParameterKeys.add(`${module.name}::${signature.name}#${signatureIndex}.${parameter.name}`);
      }
    }
  }
}
assert.deepEqual(
  Object.keys(familyData.nativeBindings).filter((key) => !representedNativeParameterKeys.has(key)),
  [],
  "every native binding must own an existing represented parameter",
);
assert.deepEqual(
  Object.entries(familyData.parameterReview)
    .filter(([, decision]) => decision === "plain")
    .map(([key]) => key)
    .filter((key) => !(key.includes("::") ? representedPywin32ParameterKeys : representedNativeParameterKeys).has(key)),
  [],
  "every explicit plain decision must own an existing represented parameter",
);

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

const sourceAuditPath = path.join(root, "docs", "windows-api-source-audit.md");
assert.ok(fs.existsSync(sourceAuditPath), "missing docs/windows-api-source-audit.md");
const sourceAuditRows = fs.readFileSync(sourceAuditPath, "utf8").split(/\r?\n/)
  .filter((line) => /^\| `[^`]+` \|/.test(line));
assert.equal(sourceAuditRows.length, expectedLegacyNames.length, "source audit must contain exactly 69 baseline rows");
assert.deepEqual(
  sourceAuditRows.map((line) => line.match(/^\| `([^`]+)` \|/)?.[1]),
  expectedLegacyNames,
  "source-audit rows must preserve the complete baseline ledger order",
);

// Completeness gate: deleting one editorial decision, pointing it at an
// unrelated family, or adding an incomplete sibling must fail before release.
const completenessErrors = [];
const familyReviews = familyData.familyReview || {};
const allowedDecisions = new Set(["single", "encoding", "extended", "separate"]);
const liveFamiliesById = new Map(window.ILOVEOS_WINDOWS_API_GUIDE.families.map((item) => [item.id, item]));
const liveVariants = window.ILOVEOS_WINDOWS_API_GUIDE.families.flatMap((item) => item.variants);

for (const name of expectedLegacyNames) {
  const review = familyReviews[name];
  if (!review) {
    completenessErrors.push(`missing familyReview: ${name}`);
    continue;
  }
  if (!allowedDecisions.has(review.decision)) completenessErrors.push(`invalid familyReview decision: ${name}`);
  const reviewedFamily = liveFamiliesById.get(review.familyId);
  if (!reviewedFamily) completenessErrors.push(`familyReview points to missing family: ${name}/${review.familyId || "missing"}`);
  if (!reviewedFamily?.variants.some((variant) => variant.name === name)) completenessErrors.push(`familyReview family does not contain baseline: ${name}`);
  if (typeof review.source !== "string" || !review.source.startsWith("https://learn.microsoft.com/")) completenessErrors.push(`familyReview missing direct Microsoft Learn source: ${name}`);
  if (typeof review.note !== "string" || !review.note.trim()) completenessErrors.push(`familyReview missing note: ${name}`);
}
for (const name of Object.keys(familyReviews)) {
  if (!expectedLegacyNames.includes(name)) completenessErrors.push(`orphan familyReview: ${name}`);
}

const completeContractFields = ["summary", "useWhen", "availability", "dll", "nativeSignature", "python", "example", "result", "cleanup"];
for (const variant of liveVariants) {
  for (const field of completeContractFields) {
    if (typeof variant?.[field] !== "string" || !variant[field].trim()) completenessErrors.push(`incomplete variant ${variant?.name || "unnamed"}: ${field}`);
  }
  if (!Array.isArray(variant?.parameters)) completenessErrors.push(`incomplete variant ${variant?.name || "unnamed"}: parameters`);
  if (!(variant?.sources || []).some((item) => typeof item === "string" && item.startsWith("https://learn.microsoft.com/"))) completenessErrors.push(`incomplete variant ${variant?.name || "unnamed"}: source`);
}
if (new Set(liveVariants.map((variant) => variant.name)).size !== liveVariants.length) completenessErrors.push("callable variant names are not unique");
for (const item of window.ILOVEOS_WINDOWS_API_GUIDE.families) {
  const names = new Set(item.variants.map((variant) => variant.name));
  const hasA = [...names].some((name) => name.endsWith("A"));
  const hasW = [...names].some((name) => name.endsWith("W"));
  if (hasA && hasW && !item.recommendedVariant.endsWith("W")) completenessErrors.push(`Unicode variant is not recommended: ${item.id}`);
}

const familyContaining = (name) => window.ILOVEOS_WINDOWS_API_GUIDE.families.find((item) => item.variants.some((variant) => variant.name === name));
const namesOf = (item) => item?.variants.map((variant) => variant.name) || [];
const createEventShape = familyContaining("CreateEventW");
if (JSON.stringify(namesOf(createEventShape)) !== JSON.stringify(["CreateEventW", "CreateEventA", "CreateEventExW", "CreateEventExA"])) completenessErrors.push("CreateEvent must retain base/extended A/W shape");
const messageBoxShape = familyContaining("MessageBoxA");
if (JSON.stringify(namesOf(messageBoxShape)) !== JSON.stringify(["MessageBoxW", "MessageBoxA"]) || messageBoxShape?.recommendedVariant !== "MessageBoxW") completenessErrors.push("MessageBox must preserve MessageBoxA and recommend MessageBoxW");
const getProcAddressShape = familyContaining("GetProcAddress");
if (JSON.stringify(namesOf(getProcAddressShape)) !== JSON.stringify(["GetProcAddress"]) || liveVariants.some((variant) => /^GetProcAddress[AW]$/.test(variant.name))) completenessErrors.push("GetProcAddress must remain one byte-oriented export");
const intrinsicShape = familyContaining("InterlockedExchangePointer");
if (JSON.stringify(namesOf(intrinsicShape)) !== JSON.stringify(["InterlockedExchangePointer"]) || intrinsicShape?.variants[0]?.dll !== "Compiler intrinsic (no DLL export)") completenessErrors.push("InterlockedExchangePointer must remain an intrinsic-only singleton");
if (familyContaining("VirtualAlloc")?.id === familyContaining("VirtualAllocEx")?.id) completenessErrors.push("VirtualAlloc and VirtualAllocEx must remain separate families");
const addDllDirectoryShape = familyContaining("AddDllDirectory");
if (JSON.stringify(namesOf(addDllDirectoryShape)) !== JSON.stringify(["AddDllDirectory"]) || !addDllDirectoryShape?.variants[0]?.nativeSignature.includes("PCWSTR")) completenessErrors.push("AddDllDirectory must remain an actionable Unicode singleton without an invented A sibling");

assert.deepEqual(completenessErrors, [], `family completeness audit failed:\n${completenessErrors.join("\n")}`);

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
  ["pywin32", "win32security::OpenProcessToken#0.desiredAccess", "token-access"],
  ["pywin32", "win32security::DuplicateTokenEx#0.ImpersonationLevel", "security-impersonation-level"],
  ["pywin32", "win32security::DuplicateTokenEx#0.TokenType", "token-type"],
  ["pywin32", "win32security::DuplicateTokenEx#0.DesiredAccess", "token-access"],
];
for (const [surface, key, expectedId] of requiredBindings) {
  const resolved = familyData.resolveParameterChoices(key, surface);
  assert.equal(resolved?.id, expectedId, `${surface} ${key} must resolve its contextual choice set`);
}

// Task 4 parameter-audit gate: one representative binding protects every
// required named-choice category before the larger binding table is checked.
const requiredAuditBindings = [
  ["native", "OpenProcess.dwDesiredAccess", "process-access"],
  ["native", "OpenThread.dwDesiredAccess", "thread-access"],
  ["native", "VirtualAlloc.flAllocationType", "memory-allocation-type"],
  ["native", "VirtualFree.dwFreeType", "memory-free-type"],
  ["native", "VirtualProtect.flNewProtect", "memory-protection"],
  ["native", "MapViewOfFile.dwDesiredAccess", "file-mapping-access"],
  ["native", "WaitForSingleObject.dwMilliseconds", "wait-timeout"],
  ["native", "CreateProcessW.dwCreationFlags", "process-creation-flags"],
  ["native", "CreateNamedPipeW.dwOpenMode", "named-pipe-open-mode"],
  ["native", "CreateNamedPipeW.dwPipeMode", "named-pipe-mode"],
  ["native", "OpenSCManagerW.dwDesiredAccess", "scm-access"],
  ["native", "OpenServiceW.dwDesiredAccess", "service-access"],
  ["native", "ControlService.dwControl", "service-control"],
  ["native", "RegOpenKeyExW.samDesired", "registry-access"],
  ["native", "GetNamedSecurityInfoW.SecurityInfo", "security-information"],
  ["native", "GetNamedSecurityInfoW.ObjectType", "securable-object-type"],
  ["native", "SetWindowsHookExW.idHook", "hook-id"],
  ["native", "LoadLibraryExW.dwFlags", "module-loading-flags"],
  ["native", "CreateEventExW.dwFlags", "event-creation-flags"],
  ["native", "CreateMutexExW.dwFlags", "mutex-creation-flags"],
  ["native", "IsWow64Process2.pProcessMachine", "machine-type"],
  ["pywin32", "win32file::CreateFile#0.desiredAccess", "file-access"],
  ["pywin32", "win32file::CreateFile#0.shareMode", "file-share-mode"],
  ["pywin32", "win32file::CreateFile#0.CreationDisposition", "file-creation-disposition"],
  ["pywin32", "win32process::EnumProcessModulesEx#0.FilterFlag", "module-filter"],
];
for (const [surface, key, expectedId] of requiredAuditBindings) {
  assert.equal(familyData.resolveParameterChoices(key, surface)?.id, expectedId, `${surface} ${key} must resolve ${expectedId}`);
}

// Self-review expansion: these are the correctness-bearing named-choice
// candidates found by walking every represented native and Python signature.
// Keep this as one completeness assertion so RED reports the entire omission
// set instead of stopping at the first missing binding.
const expandedAuditBindings = [
  ["native", "CreateFileMappingW.hFile", "file-mapping-backing"],
  ["native", "HeapFree.dwFlags", "heap-operation-flags"],
  ["native", "GetExitCodeProcess.lpExitCode", "process-exit-status"],
  ["native", "MapGenericMask.AccessMask", "generic-access"],
  ["native", "WinVerifyTrust.pgActionID", "trust-action"],
  ["pywin32", "win32api::DuplicateHandle#0.options", "duplicate-handle-options"],
  ["pywin32", "win32api::SetHandleInformation#0.Flags", "handle-information-flags"],
  ["pywin32", "win32api::GetStdHandle#0.handle", "standard-handle"],
  ["pywin32", "win32api::FormatMessage#0.flags", "format-message-flags"],
  ["pywin32", "win32api::ShellExecute#0.bShow", "show-window-command"],
  ["pywin32", "win32process::SetPriorityClass#0.dwPriorityClass", "process-priority-class"],
  ["pywin32", "win32process::SetThreadPriority#0.nPriority", "thread-priority"],
  ["pywin32", "win32event::OpenSemaphore#0.desiredAccess", "semaphore-access"],
  ["pywin32", "win32file::GetFinalPathNameByHandle#0.Flags", "final-path-format"],
  ["pywin32", "win32file::SetFilePointer#0.moveMethod", "file-pointer-origin"],
  ["pywin32", "win32file::SetFileAttributes#0.newAttributes", "file-attributes"],
  ["pywin32", "win32file::ReadDirectoryChangesW#0.dwNotifyFilter", "file-notify-filter"],
  ["pywin32", "win32security::CreateWellKnownSid#0.WellKnownSidType", "well-known-sid-type"],
  ["pywin32", "win32security::CreateRestrictedToken#0.Flags", "restricted-token-flags"],
  ["pywin32", "win32security::ConvertSecurityDescriptorToStringSecurityDescriptor#0.RequestedStringSDRevision", "security-descriptor-revision"],
  ["pywin32", "win32security::LogonUser#0.LogonType", "logon-type"],
  ["pywin32", "win32security::LogonUser#0.LogonProvider", "logon-provider"],
  ["pywin32", "win32service::EnumServicesStatusEx#0.ServiceType", "service-enumeration-type"],
  ["pywin32", "win32service::EnumServicesStatusEx#0.ServiceState", "service-state-filter"],
  ["pywin32", "win32service::QueryServiceConfig2#0.InfoLevel", "service-config-info-level"],
  ["pywin32", "win32service::CreateService#0.serviceType", "service-type"],
  ["pywin32", "win32service::CreateService#0.startType", "service-start-type"],
  ["pywin32", "win32service::CreateService#0.errorControl", "service-error-control"],
  ["pywin32", "win32evtlog::ReadEventLog#0.Flags", "event-log-read-flags"],
  ["pywin32", "win32evtlog::EvtRender#0.Flags", "evt-render-flags"],
  ["pywin32", "win32evtlog::EvtSubscribe#0.Flags", "evt-subscribe-flags"],
  ["pywin32", "win32evtlog::EvtQuery#0.Flags", "evt-query-flags"],
  ["pywin32", "win32evtlog::EvtNext#0.Timeout", "evt-timeout"],
  ["pywin32", "win32evtlog::EvtExportLog#0.Flags", "evt-export-flags"],
  ["pywin32", "win32evtlog::EvtOpenSession#0.LoginClass", "evt-login-class"],
  ["pywin32", "win32job::OpenJobObject#0.desiredAccess", "job-access"],
  ["pywin32", "win32job::QueryInformationJobObject#0.JobObjectInfoClass", "job-information-class"],
  ["pywin32", "win32cred::CredRead#0.Type", "credential-type"],
  ["pywin32", "win32cred::CredRead#0.Flags", "reserved-zero"],
  ["pywin32", "win32cred::CredWrite#0.Flags", "credential-write-flags"],
  ["pywin32", "win32crypt::CryptProtectData#0.Flags", "dpapi-flags"],
  ["pywin32", "win32crypt::CryptQueryObject#0.ObjectType", "cert-query-object-type"],
  ["pywin32", "win32crypt::CryptQueryObject#0.ExpectedContentTypeFlags", "cert-query-content-type"],
  ["pywin32", "win32crypt::CryptQueryObject#0.ExpectedFormatTypeFlags", "cert-query-format-type"],
  ["pywin32", "win32crypt::CryptProtectMemory#0.dwFlags", "protect-memory-scope"],
  ["pywin32", "win32net / win32wnet::NetSessionEnum#0.level", "net-session-info-level"],
  ["pywin32", "win32net / win32wnet::WNetAddConnection2#0.Flags", "network-connection-flags"],
  ["pywin32", "win32security::MapGenericMask#0.accessMask", "generic-access"],
  ["pywin32", "winreg::OpenKey#0.reserved", "reserved-zero"],
  ["pywin32", "ctypes / ctypes.wintypes::ctypes.WinDLL#0.winmode", "module-loading-flags"],
];
const missingExpandedAuditBindings = expandedAuditBindings
  .filter(([surface, key, expectedId]) => familyData.resolveParameterChoices(key, surface)?.id !== expectedId)
  .map(([surface, key, expectedId]) => `${surface}:${key} -> ${expectedId}`);
assert.deepEqual(missingExpandedAuditBindings, [], "expanded parameter audit omissions");

assert.ok(familyData.parameterReview && typeof familyData.parameterReview === "object", "missing parameterReview audit");
for (const [surface, bindings] of [["native", familyData.nativeBindings], ["pywin32", familyData.pywin32Bindings]]) {
  for (const [key, binding] of Object.entries(bindings)) {
    assert.equal(familyData.parameterReview[key], binding.choiceSet, `parameterReview must cover ${surface}:${key}`);
  }
}
const plainReviewCount = Object.values(familyData.parameterReview).filter((decision) => decision === "plain").length;
assert.equal(
  Object.keys(familyData.parameterReview).length,
  Object.keys(familyData.nativeBindings).length + Object.keys(familyData.pywin32Bindings).length + plainReviewCount,
  "parameterReview keys must be unique across bindings and explicit plain decisions",
);
for (const [key, decision] of Object.entries(familyData.parameterReview)) {
  assert.ok(decision === "plain" || familyData.choiceSets[decision], `parameterReview ${key} has unknown decision ${decision}`);
}
assert.equal(familyData.parameterReview["AccessCheck.DesiredAccess"], "plain", "AccessCheck must receive object-specific rights after generic mapping");
assert.equal(familyData.resolveParameterChoices("AccessCheck.DesiredAccess", "native"), null, "AccessCheck must not offer invalid GENERIC_* input");
assert.equal(familyData.parameterReview["win32file::DeviceIoControl#0.IoControlCode"], "plain", "device-specific IOCTL codes must not become a generic constants dump");
for (const [id, choiceSet] of Object.entries(familyData.choiceSets)) {
  assert.ok(choiceSet.source.startsWith("https://learn.microsoft.com/"), `${id} must use a direct Microsoft Learn source`);
  assert.ok(Object.keys(choiceSet.values || {}).length > 0, `${id} must contain values`);
  for (const [name, value] of Object.entries(choiceSet.values || {})) {
    assert.ok(value.native?.trim(), `${id}/${name} missing native expression`);
    assert.ok(value.pywin32?.trim(), `${id}/${name} missing pywin32 expression`);
    assert.ok(value.useWhen?.trim(), `${id}/${name} missing concise use case`);
  }
}

const nativeAccess = familyData.resolveParameterChoices("OpenProcessToken.DesiredAccess", "native");
assert.deepEqual(nativeAccess?.values.map((value) => value.name), ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"]);
const pywin32Access = familyData.resolveParameterChoices("win32security::OpenProcessToken#0.desiredAccess", "pywin32");
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
