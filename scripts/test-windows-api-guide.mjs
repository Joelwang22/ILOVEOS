import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";


const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const guidePath = path.join(root, "windows-api-data.js");

if (!fs.existsSync(guidePath)) {
  console.error("FAIL missing windows-api-data.js");
  process.exit(1);
}

globalThis.window = {};
for (const filename of [
  "reference-data.js",
  "api-signatures.js",
  "api-signatures-stage3.js",
  "api-signatures-stage4.js",
  "api-signatures-stage6.js",
  "windows-api-families.js",
  "windows-api-data.js",
]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });
}

const guide = window.ILOVEOS_WINDOWS_API_GUIDE;
const signatures = window.ILOVEOS_API_SIGNATURES;
const familyData = window.ILOVEOS_WINDOWS_API_FAMILY_DATA;
const errors = [];

function requireCondition(condition, message) {
  if (!condition) errors.push(message);
}

requireCondition(Boolean(guide), "missing ILOVEOS_WINDOWS_API_GUIDE global");
requireCondition((guide?.typeMappings || []).length >= 12, "guide needs at least 12 native-to-ctypes type mappings");
requireCondition((guide?.families || []).length >= 1, "guide has no API families");
requireCondition(!Object.hasOwn(guide || {}, "entries"), "guide must not publicly expose the compatibility entries array");

const variants = new Map(
  (guide?.families || []).flatMap((family) => family.variants.map((variant) => [variant.name, variant])),
);
const coveredLegacyNames = new Set((guide?.legacyApiNames || []).filter((name) => variants.has(name)));
const namedPipeSecurityAttributes = variants.get("CreateNamedPipeW")?.parameters
  .find((parameter) => parameter.name === "lpSecurityAttributes");
requireCondition(
  namedPipeSecurityAttributes?.python === "ctypes.POINTER(SECURITY_ATTRIBUTES)",
  "CreateNamedPipeW.lpSecurityAttributes must retain its typed SECURITY_ATTRIBUTES pointer",
);
const nativeNames = Object.entries(signatures)
  .filter(([key, value]) => key.startsWith("ctypes / ctypes.wintypes::")
    && (value.sources || []).some((source) => source.includes("learn.microsoft.com")))
  .flatMap(([, value]) => value.signatures || [])
  .map((signature) => signature.name);

const assignmentCritical = [
  "OpenProcess",
  "VirtualAllocEx",
  "WriteProcessMemory",
  "GetModuleHandleW",
  "GetProcAddress",
  "LoadLibraryW",
  "CreateRemoteThread",
  "WaitForSingleObject",
  "VirtualFreeEx",
  "CloseHandle",
  "CreateEventW",
  "CreateMutexW",
  "WaitForMultipleObjects",
  "ReadFile",
  "WriteFile",
  "CreateNamedPipeW",
  "OpenThread",
  "VirtualProtectEx",
  "MessageBoxA",
];

const courseRoot = path.resolve(root, "..");
const directCtypesApis = new Set();
for (const relative of fs.readdirSync(courseRoot, { recursive: true }).filter((filename) => filename.endsWith(".py"))) {
  const source = fs.readFileSync(path.join(courseRoot, relative), "utf8");
  const dllVariables = new Set([...source.matchAll(/([A-Za-z_]\w*)\s*=\s*ctypes\.(?:WinDLL\([^\n]+\)|windll\.[A-Za-z_]\w*)/g)].map((match) => match[1]));
  for (const match of source.matchAll(/ctypes\.windll\.[A-Za-z_]\w*\.([A-Z][A-Za-z0-9_]*)/g)) directCtypesApis.add(match[1]);
  for (const variable of dllVariables) {
    const callPattern = new RegExp(`\\b${variable}\\.([A-Z][A-Za-z0-9_]*)`, "g");
    for (const match of source.matchAll(callPattern)) directCtypesApis.add(match[1]);
  }
}

for (const name of new Set([...nativeNames, ...assignmentCritical, ...directCtypesApis])) {
  requireCondition(variants.has(name), `missing Windows API guide variant: ${name}`);
}

for (const entry of variants.values()) {
  const prefix = entry.name || "unnamed entry";
  requireCondition(Boolean(entry.summary), `${prefix}: missing plain-English summary`);
  requireCondition(Boolean(entry.dll), `${prefix}: missing DLL`);
  requireCondition(Boolean(entry.category), `${prefix}: missing category`);
  requireCondition(Boolean(entry.nativeSignature), `${prefix}: missing native C signature`);
  requireCondition(Boolean(entry.python), `${prefix}: missing Python translation`);
  requireCondition(Boolean(entry.example), `${prefix}: missing checked call pattern`);
  requireCondition((entry.parameters || []).length >= 1 || entry.nativeSignature.includes("(void)"), `${prefix}: missing parameter explanations`);
  requireCondition(Boolean(entry.result), `${prefix}: missing result and failure guidance`);
  requireCondition(Boolean(entry.cleanup), `${prefix}: missing ownership or cleanup guidance`);
  requireCondition((entry.sources || []).some((source) => source.startsWith("https://learn.microsoft.com")), `${prefix}: missing Microsoft Learn source`);
}

const virtualAllocEx = variants.get("VirtualAllocEx");
requireCondition(virtualAllocEx?.python.includes("VirtualAllocEx.argtypes"), "VirtualAllocEx: translation does not declare argtypes");
requireCondition(virtualAllocEx?.python.includes("ctypes.c_size_t"), "VirtualAllocEx: SIZE_T is not translated to ctypes.c_size_t");
requireCondition(virtualAllocEx?.python.includes("VirtualAllocEx.restype"), "VirtualAllocEx: translation does not declare restype");
requireCondition(virtualAllocEx?.result.toLowerCase().includes("null") && virtualAllocEx?.result.toLowerCase().includes("failure"), "VirtualAllocEx: nullable pointer result is not described as a failure sentinel");
requireCondition(virtualAllocEx?.example?.includes("remote_address = VirtualAllocEx("), "VirtualAllocEx: checked allocation call is missing");
requireCondition(virtualAllocEx?.example?.includes("ctypes.WinError"), "VirtualAllocEx: checked failure branch is missing");

const writeProcessMemory = variants.get("WriteProcessMemory");
requireCondition(writeProcessMemory?.python.includes("ctypes.POINTER(ctypes.c_size_t)"), "WriteProcessMemory: SIZE_T pointer translation is missing");
requireCondition(writeProcessMemory?.parameters.some((parameter) => parameter.native === "SIZE_T *" && parameter.python === "ctypes.POINTER(ctypes.c_size_t)"), "WriteProcessMemory: output-count mapping is missing");
requireCondition(writeProcessMemory?.parameters.find((parameter) => parameter.name === "lpBuffer")?.direction === "in", "WriteProcessMemory: source buffer is not marked as input");
requireCondition(writeProcessMemory?.parameters.find((parameter) => parameter.name === "lpNumberOfBytesWritten")?.direction === "out", "WriteProcessMemory: byte count is not marked as output");
requireCondition(writeProcessMemory?.example?.includes("ctypes.create_string_buffer"), "WriteProcessMemory: source-buffer construction is missing");
requireCondition(writeProcessMemory?.example?.includes("ctypes.byref(bytes_written)"), "WriteProcessMemory: output-count pointer is missing from the call pattern");

const namedSecurity = variants.get("GetNamedSecurityInfoW");
for (const name of ["ppsidOwner", "ppsidGroup", "ppDacl", "ppSacl", "ppSecurityDescriptor"]) {
  requireCondition(namedSecurity?.parameters.find((parameter) => parameter.name === name)?.python.includes("POINTER"), `GetNamedSecurityInfoW: ${name} loses an output pointer level`);
}
requireCondition(namedSecurity?.example.includes("ctypes.byref(descriptor)"), "GetNamedSecurityInfoW: security-descriptor output is not passed by reference");
requireCondition(namedSecurity?.example.includes("status != 0"), "GetNamedSecurityInfoW: direct status code is not checked");

const namedPipe = variants.get("CreateNamedPipeW");
requireCondition(namedPipe?.result.includes("INVALID_HANDLE_VALUE"), "CreateNamedPipeW: result guidance omits its non-null failure sentinel");
requireCondition(namedPipe?.example.includes("ctypes.c_void_p(-1).value"), "CreateNamedPipeW: checked call does not compare against INVALID_HANDLE_VALUE");

const localFree = variants.get("LocalFree");
requireCondition(localFree?.example.includes("if remaining:"), "LocalFree: checked call does not treat a non-null return as failure");

for (const name of ["RegOpenKeyExW", "WinVerifyTrust"]) {
  requireCondition(variants.get(name)?.example.includes("status != 0"), `${name}: direct status code is not checked`);
}

for (const name of ["ReadFile", "WriteFile"]) {
  requireCondition(variants.get(name)?.example.includes("None)  # synchronous"), `${name}: generic example does not establish synchronous I/O semantics`);
}

const createProcess = variants.get("CreateProcessW");
requireCondition(createProcess?.python.includes("class SECURITY_ATTRIBUTES(ctypes.Structure)"), "CreateProcessW: SECURITY_ATTRIBUTES declaration is missing");
requireCondition(createProcess?.python.includes("ctypes.POINTER(SECURITY_ATTRIBUTES)"), "CreateProcessW: SECURITY_ATTRIBUTES pointers lose type checking");

const requiredStructures = new Map([
  ["GetSystemInfo", ["SYSTEM_INFO"]],
  ["GetNativeSystemInfo", ["SYSTEM_INFO"]],
  ["QueryWorkingSetEx", ["PSAPI_WORKING_SET_EX_INFORMATION"]],
  ["GlobalMemoryStatusEx", ["MEMORYSTATUSEX"]],
  ["VirtualQueryEx", ["MEMORY_BASIC_INFORMATION"]],
  ["AccessCheck", ["GENERIC_MAPPING"]],
  ["MapGenericMask", ["GENERIC_MAPPING"]],
  ["ControlService", ["SERVICE_STATUS"]],
  ["RtlAddFunctionTable", ["RUNTIME_FUNCTION"]],
  ["WinVerifyTrust", ["GUID", "WINTRUST_DATA"]],
]);
for (const [name, structures] of requiredStructures) {
  for (const structure of structures) {
    requireCondition(variants.get(name)?.python.includes(`class ${structure}(ctypes.Structure)`), `${name}: ${structure} declaration is missing`);
    requireCondition(variants.get(name)?.python.includes(`ctypes.POINTER(${structure})`), `${name}: ${structure} pointer loses type checking`);
  }
}

for (const entry of variants.values()) {
  requireCondition(!entry.python.includes("wintypes.LRESULT"), `${entry.name}: generated Python uses unavailable wintypes.LRESULT`);
  requireCondition(!/^\s+int,\s+#/m.test(entry.python), `${entry.name}: generated argtypes contains Python's built-in int`);
}

const queryServiceStatus = variants.get("QueryServiceStatusEx");
requireCondition(queryServiceStatus?.python.includes("ctypes.c_int,  # InfoLevel"), "QueryServiceStatusEx: InfoLevel is not a valid ctypes enum type");

const interlockedExchangePointer = variants.get("InterlockedExchangePointer");
requireCondition(!interlockedExchangePointer?.python.includes("InterlockedExchangePointer = kernel32.InterlockedExchangePointer"), "InterlockedExchangePointer: guide invents a callable Kernel32 export");
requireCondition(interlockedExchangePointer?.python.toLowerCase().includes("compiler intrinsic"), "InterlockedExchangePointer: intrinsic-only constraint is not explained");
requireCondition(interlockedExchangePointer?.example.toLowerCase().includes("compiled"), "InterlockedExchangePointer: call pattern does not direct learners to compiled code");
requireCondition(interlockedExchangePointer?.dll === "Compiler intrinsic (no DLL export)", "InterlockedExchangePointer: DLL metadata contradicts its intrinsic-only contract");

const familyValidationErrors = window.ILOVEOS_WINDOWS_API_FAMILY_DATA.validateGuide(guide);
requireCondition(familyValidationErrors.length === 0, `family validation errors: ${familyValidationErrors.join(", ")}`);
for (const name of guide?.legacyApiNames || []) {
  const occurrences = (guide?.families || []).flatMap((family) => family.variants).filter((variant) => variant.name === name).length;
  requireCondition(occurrences === 1, `legacy API must occur exactly once: ${name}`);
}
const createEventFamily = (guide?.families || []).find((family) => family.id === "create-event");
requireCondition(createEventFamily?.variants.length === 4, "CreateEvent family must contain exactly four variants");
requireCondition(JSON.stringify(createEventFamily?.variants.map((variant) => variant.name)) === JSON.stringify(["CreateEventW", "CreateEventA", "CreateEventExW", "CreateEventExA"]), "CreateEvent family variants are incomplete or out of order");
requireCondition(window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveSelection(createEventFamily, "CreateEvent") === "CreateEventW", "CreateEvent alias does not resolve to CreateEventW");
requireCondition(window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveSelection(createEventFamily, "CreateEventEx") === "CreateEventExW", "CreateEventEx alias does not resolve to CreateEventExW");
const createEventSignatures = new Map([
  ["CreateEventW", {
    native: `HANDLE CreateEventW(\n  [in, optional] SECURITY_ATTRIBUTES * lpEventAttributes,\n  [in] BOOL bManualReset,\n  [in] BOOL bInitialState,\n  [in, optional] LPCWSTR lpName\n);`,
    python: `CreateEventW.argtypes = [\n    ctypes.POINTER(SECURITY_ATTRIBUTES),  # lpEventAttributes\n    wintypes.BOOL,  # bManualReset\n    wintypes.BOOL,  # bInitialState\n    wintypes.LPCWSTR,  # lpName\n]`,
  }],
  ["CreateEventA", {
    native: `HANDLE CreateEventA(\n  [in, optional] SECURITY_ATTRIBUTES * lpEventAttributes,\n  [in] BOOL bManualReset,\n  [in] BOOL bInitialState,\n  [in, optional] LPCSTR lpName\n);`,
    python: `CreateEventA.argtypes = [\n    ctypes.POINTER(SECURITY_ATTRIBUTES),  # lpEventAttributes\n    wintypes.BOOL,  # bManualReset\n    wintypes.BOOL,  # bInitialState\n    wintypes.LPCSTR,  # lpName\n]`,
  }],
  ["CreateEventExW", {
    native: `HANDLE CreateEventExW(\n  [in, optional] SECURITY_ATTRIBUTES * lpEventAttributes,\n  [in, optional] LPCWSTR lpName,\n  [in] DWORD dwFlags,\n  [in] DWORD dwDesiredAccess\n);`,
    python: `CreateEventExW.argtypes = [\n    ctypes.POINTER(SECURITY_ATTRIBUTES),  # lpEventAttributes\n    wintypes.LPCWSTR,  # lpName\n    wintypes.DWORD,  # dwFlags\n    wintypes.DWORD,  # dwDesiredAccess\n]`,
  }],
  ["CreateEventExA", {
    native: `HANDLE CreateEventExA(\n  [in, optional] SECURITY_ATTRIBUTES * lpEventAttributes,\n  [in, optional] LPCSTR lpName,\n  [in] DWORD dwFlags,\n  [in] DWORD dwDesiredAccess\n);`,
    python: `CreateEventExA.argtypes = [\n    ctypes.POINTER(SECURITY_ATTRIBUTES),  # lpEventAttributes\n    wintypes.LPCSTR,  # lpName\n    wintypes.DWORD,  # dwFlags\n    wintypes.DWORD,  # dwDesiredAccess\n]`,
  }],
]);
for (const [name, expected] of createEventSignatures) {
  const variant = variants.get(name);
  requireCondition(variant?.nativeSignature === expected.native, `${name}: native signature does not preserve typed SECURITY_ATTRIBUTES`);
  requireCondition(variant?.python.includes("class SECURITY_ATTRIBUTES(ctypes.Structure)"), `${name}: Python declaration omits SECURITY_ATTRIBUTES`);
  requireCondition(variant?.python.includes(expected.python), `${name}: Python argtypes do not preserve the exact typed signature`);
}

console.log(`Windows API families: ${guide.families.length}`);
console.log(`callable variants: ${variants.size}`);
console.log(`legacy contracts covered: ${coveredLegacyNames.size}`);
console.log(`family review records: ${Object.keys(familyData.familyReview).length}`);
console.log(`native signature functions covered: ${new Set(nativeNames).size}`);
console.log(`direct ctypes APIs covered: ${directCtypesApis.size}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
