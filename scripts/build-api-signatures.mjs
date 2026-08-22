import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

globalThis.window = {};
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
await import(pathToFileURL(path.join(projectDirectory, "reference-data.js")).href);

const pywin32Base = "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/";
const stdlibBase = "https://raw.githubusercontent.com/python/typeshed/main/stdlib/";
const sourcePaths = {
  win32api: [pywin32Base + "win32/win32api.pyi"],
  win32process: [pywin32Base + "win32/win32process.pyi"],
  win32event: [pywin32Base + "win32/win32event.pyi"],
  win32file: [pywin32Base + "win32/win32file.pyi"],
  win32pipe: [pywin32Base + "win32/win32pipe.pyi"],
  win32security: [pywin32Base + "win32/win32security.pyi"],
  win32service: [pywin32Base + "win32/win32service.pyi"],
  win32serviceutil: [pywin32Base + "win32/lib/win32serviceutil.pyi"],
  pywintypes: [pywin32Base + "win32/lib/pywintypes.pyi"],
  win32evtlog: [pywin32Base + "win32/win32evtlog.pyi"],
  win32job: [pywin32Base + "win32/win32job.pyi"],
  win32gui: [pywin32Base + "win32/win32gui.pyi"],
  win32clipboard: [pywin32Base + "win32/win32clipboard.pyi"],
  win32cred: [pywin32Base + "win32/win32cred.pyi"],
  win32crypt: [pywin32Base + "win32/win32crypt.pyi"],
  win32net: [pywin32Base + "win32/win32net.pyi"],
  win32wnet: [pywin32Base + "win32/win32wnet.pyi"],
  "win32com.client": [pywin32Base + "win32com/client/__init__.pyi"],
  pythoncom: [pywin32Base + "pythoncom.pyi", pywin32Base + "win32/pythoncom.pyi"],
  winreg: [stdlibBase + "winreg.pyi"],
  ctypes: [stdlibBase + "ctypes/__init__.pyi"],
  wintypes: [stdlibBase + "ctypes/wintypes.pyi"]
};

function matchingClose(text, start) {
  let depth = 0;
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === "(") depth += 1;
    if (text[index] === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function splitTopLevel(text) {
  const values = [];
  let current = "";
  let depth = 0;
  for (const character of text) {
    if ("([{<".includes(character)) depth += 1;
    if (")]}>".includes(character)) depth -= 1;
    if (character === "," && depth === 0) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  if (current.trim()) values.push(current.trim());
  return values;
}

function cleanType(value) {
  return (value || "object")
    .replaceAll("_win32typing.", "")
    .replaceAll("_typeshed.", "")
    .replaceAll("Incomplete", "object")
    .replace(/\s+/g, " ")
    .trim();
}

function parseParameter(value) {
  if (!value || value === "/" || value === "*") return null;
  const cleaned = value.replace(/^\*\*/, "").replace(/^\*/, "").trim();
  const defaultIndex = cleaned.indexOf("=");
  const declaration = (defaultIndex >= 0 ? cleaned.slice(0, defaultIndex) : cleaned).trim();
  const colonIndex = declaration.indexOf(":");
  return {
    name: (colonIndex >= 0 ? declaration.slice(0, colonIndex) : declaration).trim(),
    type: cleanType(colonIndex >= 0 ? declaration.slice(colonIndex + 1) : "object"),
    optional: defaultIndex >= 0
  };
}

function parseFunctions(text) {
  const functions = new Map();
  const lines = text.replaceAll("\r", "").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].trimStart().startsWith("def ")) continue;
    let declaration = lines[index].trim();
    while (!declaration.trimEnd().endsWith("...") && index + 1 < lines.length) {
      index += 1;
      declaration += "\n" + lines[index].trim();
    }
    const nameMatch = declaration.match(/^def\s+([A-Za-z_]\w*)\s*\(/);
    if (!nameMatch) continue;
    const openIndex = declaration.indexOf("(", nameMatch.index);
    const closeIndex = matchingClose(declaration, openIndex);
    if (closeIndex < 0) continue;
    const tail = declaration.slice(closeIndex + 1);
    const returnMatch = tail.match(/->\s*([\s\S]*?)\s*:\s*\.\.\./);
    const parameters = splitTopLevel(declaration.slice(openIndex + 1, closeIndex)).map(parseParameter).filter(Boolean);
    const signature = {
      parameters,
      returns: cleanType(returnMatch?.[1] || "object (not annotated)")
    };
    const existing = functions.get(nameMatch[1]) || [];
    if (!existing.some((item) => JSON.stringify(item) === JSON.stringify(signature))) existing.push(signature);
    functions.set(nameMatch[1], existing);
  }
  return functions;
}

async function fetchFirst(urls) {
  for (const url of urls) {
    const response = await fetch(url);
    if (response.ok) return { url, text: await response.text() };
  }
  return null;
}

const fetchedSources = await Promise.all(Object.entries(sourcePaths).map(async ([name, urls]) => {
  const result = await fetchFirst(urls);
  if (!result) return [name, null];
  return [name, { ...result, functions: parseFunctions(result.text) }];
}));
const sourceData = Object.fromEntries(fetchedSources);

function sourceNamesFor(moduleName, featureName) {
  if (featureName.startsWith("win32net.")) return ["win32net"];
  if (featureName.startsWith("win32wnet.")) return ["win32wnet"];
  if (featureName.startsWith("win32com.client.")) return ["win32com.client"];
  if (featureName.startsWith("pythoncom.")) return ["pythoncom"];
  if (featureName.startsWith("ctypes.")) return ["ctypes"];
  if (featureName.startsWith("wintypes.")) return ["wintypes"];
  if (moduleName.startsWith("winreg")) return ["winreg"];
  return [moduleName];
}

function callableNames(featureName) {
  return featureName.split(" / ").map((part) => part.trim().split(".").at(-1)).filter((name) => /^[A-Za-z_]\w*$/.test(name));
}

const details = {};
for (const module of window.ILOVEOS_REFERENCE.pywin32Modules) {
  for (const feature of module.features) {
    const signatures = [];
    const sources = [];
    for (const sourceName of sourceNamesFor(module.name, feature.name)) {
      const source = sourceData[sourceName];
      if (!source) continue;
      for (const callableName of callableNames(feature.name)) {
        const found = source.functions.get(callableName) || [];
        for (const signature of found) {
          signatures.push({ name: callableName, ...signature });
        }
      }
      if (signatures.length) sources.push(source.url);
    }
    if (signatures.length) {
      details[`${module.name}::${feature.name}`] = { kind: "function", signatures, sources };
    }
  }
}

const manualDetails = {
  "ctypes / ctypes.wintypes::VirtualQueryEx": {
    kind: "function",
    signatures: [{ name: "VirtualQueryEx", parameters: [
      { name: "hProcess", type: "wintypes.HANDLE", optional: false },
      { name: "lpAddress", type: "ctypes.c_void_p", optional: false },
      { name: "lpBuffer", type: "ctypes.POINTER(MEMORY_BASIC_INFORMATION)", optional: false },
      { name: "dwLength", type: "ctypes.c_size_t", optional: false }
    ], returns: "ctypes.c_size_t" }],
    sources: ["https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualqueryex"]
  },
  "ctypes / ctypes.wintypes::CreateProcessW": {
    kind: "function",
    signatures: [{ name: "CreateProcessW", parameters: [
      { name: "lpApplicationName", type: "wintypes.LPCWSTR | None", optional: false },
      { name: "lpCommandLine", type: "wintypes.LPWSTR | None", optional: false },
      { name: "lpProcessAttributes", type: "POINTER(SECURITY_ATTRIBUTES) | None", optional: false },
      { name: "lpThreadAttributes", type: "POINTER(SECURITY_ATTRIBUTES) | None", optional: false },
      { name: "bInheritHandles", type: "wintypes.BOOL", optional: false },
      { name: "dwCreationFlags", type: "wintypes.DWORD", optional: false },
      { name: "lpEnvironment", type: "ctypes.c_void_p | None", optional: false },
      { name: "lpCurrentDirectory", type: "wintypes.LPCWSTR | None", optional: false },
      { name: "lpStartupInfo", type: "POINTER(STARTUPINFOW)", optional: false },
      { name: "lpProcessInformation", type: "POINTER(PROCESS_INFORMATION)", optional: false }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw"]
  },
  "ctypes / ctypes.wintypes::OpenSCManagerW / OpenServiceW": {
    kind: "function",
    signatures: [
      { name: "OpenSCManagerW", parameters: [{ name: "lpMachineName", type: "wintypes.LPCWSTR | None", optional: false }, { name: "lpDatabaseName", type: "wintypes.LPCWSTR | None", optional: false }, { name: "dwDesiredAccess", type: "wintypes.DWORD", optional: false }], returns: "SC_HANDLE" },
      { name: "OpenServiceW", parameters: [{ name: "hSCManager", type: "SC_HANDLE", optional: false }, { name: "lpServiceName", type: "wintypes.LPCWSTR", optional: false }, { name: "dwDesiredAccess", type: "wintypes.DWORD", optional: false }], returns: "SC_HANDLE" }
    ],
    sources: ["https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-openscmanagerw", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-openservicew"]
  },
  "ctypes / ctypes.wintypes::StartServiceW / ControlService": {
    kind: "function",
    signatures: [
      { name: "StartServiceW", parameters: [{ name: "hService", type: "SC_HANDLE", optional: false }, { name: "dwNumServiceArgs", type: "wintypes.DWORD", optional: false }, { name: "lpServiceArgVectors", type: "POINTER(wintypes.LPCWSTR) | None", optional: false }], returns: "wintypes.BOOL" },
      { name: "ControlService", parameters: [{ name: "hService", type: "SC_HANDLE", optional: false }, { name: "dwControl", type: "wintypes.DWORD", optional: false }, { name: "lpServiceStatus", type: "POINTER(SERVICE_STATUS)", optional: false }], returns: "wintypes.BOOL" }
    ],
    sources: ["https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-startservicew", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-controlservice"]
  },
  "win32serviceutil::RestartService": {
    kind: "function",
    signatures: [{ name: "RestartService", parameters: [
      { name: "serviceName", type: "str", optional: false },
      { name: "args", type: "Sequence[str] | None", optional: true },
      { name: "machine", type: "str | None", optional: true }
    ], returns: "None" }],
    sources: ["https://github.com/mhammond/pywin32/blob/main/win32/Lib/win32serviceutil.py"]
  },
  "win32evtlog::EvtQuery": {
    kind: "function",
    signatures: [{ name: "EvtQuery", parameters: [
      { name: "Path", type: "str", optional: false },
      { name: "Flags", type: "int", optional: false },
      { name: "Query", type: "str | None", optional: true },
      { name: "Session", type: "PyEVT_HANDLE | None", optional: true }
    ], returns: "PyEVT_HANDLE" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtQuery_meth.html"]
  },
  "win32evtlog::EvtNext": {
    kind: "function",
    signatures: [{ name: "EvtNext", parameters: [
      { name: "ResultSet", type: "PyEVT_HANDLE", optional: false },
      { name: "Count", type: "int", optional: false },
      { name: "Timeout", type: "int", optional: true },
      { name: "Flags", type: "int", optional: true }
    ], returns: "tuple[PyEVT_HANDLE, ...]" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtNext_meth.html"]
  },
  "win32evtlog::EvtExportLog": {
    kind: "function",
    signatures: [{ name: "EvtExportLog", parameters: [
      { name: "Path", type: "str", optional: false },
      { name: "Query", type: "str | None", optional: false },
      { name: "TargetFilePath", type: "str", optional: false },
      { name: "Flags", type: "int", optional: false },
      { name: "Session", type: "PyEVT_HANDLE | None", optional: true }
    ], returns: "None" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtExportLog_meth.html"]
  },
  "win32evtlog::EvtOpenSession": {
    kind: "function",
    signatures: [{ name: "EvtOpenSession", parameters: [
      { name: "LoginClass", type: "int", optional: false },
      { name: "Login", type: "dict[str, object]", optional: false },
      { name: "Timeout", type: "int", optional: true },
      { name: "Flags", type: "int", optional: true }
    ], returns: "PyEVT_HANDLE" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtOpenSession_meth.html"]
  },
  "win32crypt::CryptProtectMemory": {
    kind: "function",
    signatures: [{ name: "CryptProtectMemory", parameters: [
      { name: "pDataIn", type: "ctypes.c_void_p", optional: false },
      { name: "cbDataIn", type: "wintypes.DWORD", optional: false },
      { name: "dwFlags", type: "wintypes.DWORD", optional: false }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectmemory"]
  },
  "win32crypt::CryptUnprotectMemory": {
    kind: "function",
    signatures: [{ name: "CryptUnprotectMemory", parameters: [
      { name: "pDataIn", type: "ctypes.c_void_p", optional: false },
      { name: "cbDataIn", type: "wintypes.DWORD", optional: false },
      { name: "dwFlags", type: "wintypes.DWORD", optional: false }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptunprotectmemory"]
  },
  "win32crypt::CertEnumCertificatesInStore": {
    kind: "function",
    signatures: [{ name: "PyCERTSTORE.CertEnumCertificatesInStore", parameters: [], returns: "tuple[PyCERT_CONTEXT, ...]" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/PyCERTSTORE.html"]
  },
  "win32com.client / pythoncom::win32com.client.gencache.EnsureDispatch": {
    kind: "function",
    signatures: [{ name: "EnsureDispatch", parameters: [
      { name: "prog_id", type: "str | object", optional: false },
      { name: "bForDemand", type: "int | bool", optional: true }
    ], returns: "DispatchBaseClass" }],
    sources: ["https://github.com/mhammond/pywin32/blob/main/com/win32com/client/gencache.py"]
  },
  "ctypes / ctypes.wintypes::ctypes.WinDLL": {
    kind: "function",
    signatures: [{ name: "ctypes.WinDLL", parameters: [
      { name: "name", type: "str | os.PathLike[str] | None", optional: false },
      { name: "mode", type: "int", optional: true },
      { name: "handle", type: "int | None", optional: true },
      { name: "use_errno", type: "bool", optional: true },
      { name: "use_last_error", type: "bool", optional: true },
      { name: "winmode", type: "int | None", optional: true }
    ], returns: "ctypes.WinDLL" }],
    sources: ["https://docs.python.org/3/library/ctypes.html#ctypes.WinDLL"]
  },
  "ctypes / ctypes.wintypes::ctypes.get_last_error": {
    kind: "function",
    signatures: [{ name: "ctypes.get_last_error", parameters: [], returns: "int" }],
    sources: ["https://docs.python.org/3/library/ctypes.html#ctypes.get_last_error"]
  },
  "ctypes / ctypes.wintypes::ctypes.GetLastError / ctypes.set_last_error": {
    kind: "function",
    signatures: [
      { name: "ctypes.GetLastError", parameters: [], returns: "int" },
      { name: "ctypes.set_last_error", parameters: [{ name: "value", type: "int", optional: false }], returns: "int" }
    ],
    sources: ["https://docs.python.org/3/library/ctypes.html#ctypes.GetLastError", "https://docs.python.org/3/library/ctypes.html#ctypes.set_last_error"]
  },
  "ctypes / ctypes.wintypes::ctypes.byref": {
    kind: "function",
    signatures: [{ name: "ctypes.byref", parameters: [{ name: "obj", type: "ctypes instance", optional: false }, { name: "offset", type: "int", optional: true }], returns: "CArgObject" }],
    sources: ["https://docs.python.org/3/library/ctypes.html#ctypes.byref"]
  },
  "ctypes / ctypes.wintypes::ctypes.sizeof": {
    kind: "function",
    signatures: [{ name: "ctypes.sizeof", parameters: [{ name: "obj_or_type", type: "ctypes instance | ctypes type", optional: false }], returns: "int" }],
    sources: ["https://docs.python.org/3/library/ctypes.html#ctypes.sizeof"]
  }
};

Object.assign(details, manualDetails);

function plainText(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replace(/\s+/g, " ")
    .trim();
}

function documentationType(html) {
  const value = plainText(html)
    .replace(/\s*\/\s*/g, " | ")
    .replace(/\s+,/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");
  if (value.startsWith("(") && value.endsWith(")")) return `tuple[${value.slice(1, -1)}]`;
  if (value.includes(",")) return `tuple[${value}]`;
  return value;
}

function parseDocumentation(html) {
  const content = html.match(/<div id="content">([\s\S]*?)<\/div>/i)?.[1] || "";
  if (!content) return null;
  const returnMatch = content.match(/<H1[\s\S]*?<\/H1><P>\s*([\s\S]*?)\s*=\s*<B>[A-Za-z_]/i);
  const parameters = new Map();
  const parameterSection = content.match(/<H3>Parameters<\/H3>[\s\S]*?(?=<H3>|$)/i)?.[0] || "";
  const parameterPattern = /<DT><I>([\s\S]*?)<\/I>\s*:\s*([\s\S]*?)<P>\s*<DD>([\s\S]*?)<P>/gi;
  let match;
  while ((match = parameterPattern.exec(parameterSection))) {
    const rawName = plainText(match[1]);
    parameters.set(rawName.split("=")[0].trim().toLowerCase(), {
      type: documentationType(match[2]) || "object",
      description: plainText(match[3]),
      optional: rawName.includes("=")
    });
  }
  return { returns: returnMatch ? documentationType(returnMatch[1]) : "None", parameters };
}

function documentationTarget(key, detail) {
  const [moduleName, featureName] = key.split("::");
  let docsModule = moduleName;
  if (featureName.startsWith("win32net.")) docsModule = "win32net";
  if (featureName.startsWith("win32wnet.")) docsModule = "win32wnet";
  if (!/^win32[a-z0-9_]+$/.test(docsModule)) return null;
  const callableName = detail.signatures[0]?.name;
  if (!callableName || callableName.includes(".")) return null;
  return `https://timgolden.me.uk/pywin32-docs/${docsModule}__${callableName}_meth.html`;
}

const documentationTasks = Object.entries(details).map(([key, detail]) => ({ key, detail, url: documentationTarget(key, detail) })).filter((item) => item.url);
let documentedEntries = 0;
for (let start = 0; start < documentationTasks.length; start += 10) {
  const batch = documentationTasks.slice(start, start + 10);
  const results = await Promise.all(batch.map(async (item) => {
    const response = await fetch(item.url);
    if (!response.ok) return null;
    const parsed = parseDocumentation(await response.text());
    return parsed ? { ...item, parsed } : null;
  }));
  for (const result of results.filter(Boolean)) {
    documentedEntries += 1;
    for (const signature of result.detail.signatures) {
      signature.returns = result.parsed.returns;
      for (const parameter of signature.parameters) {
        const documented = result.parsed.parameters.get(parameter.name.toLowerCase());
        if (!documented) continue;
        parameter.type = documented.type;
        parameter.description = documented.description;
        parameter.optional = parameter.optional || documented.optional;
      }
    }
    result.detail.sources = [result.url, ...result.detail.sources.filter((source) => source !== result.url)];
  }
}

const output = `/* Generated from typeshed annotations and linked pywin32 or Microsoft documentation. */\nwindow.ILOVEOS_API_SIGNATURES = ${JSON.stringify(details, null, 2)};\n`;
fs.writeFileSync(path.join(projectDirectory, "api-signatures.js"), output, "utf8");

const featureCount = window.ILOVEOS_REFERENCE.pywin32Modules.reduce((count, module) => count + module.features.length, 0);
console.log(JSON.stringify({ sources: Object.values(sourceData).filter(Boolean).length, typedEntries: Object.keys(details).length, documentedEntries, featureCount }, null, 2));
