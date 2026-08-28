import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { discoverPython } from "./check-python-syntax.mjs";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const outputPath = path.join(root, "pywin32-api-catalog.js");
const documentationRoot = "https://timgolden.me.uk/pywin32-docs/";
const moduleIndexUrl = `${documentationRoot}win32_modules.html`;

function plainText(html = "") {
  return html
    .replace(/<BR\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/\s+/g, " ")
    .trim();
}

function sentence(text, fallback) {
  const normalized = plainText(text).replace(/\s+([.,;:])/g, "$1");
  if (!normalized) return fallback;
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const character of value) {
    if ("([{<".includes(character)) depth += 1;
    else if (")]}>" .includes(character)) depth = Math.max(0, depth - 1);
    if (character === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else current += character;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function documentationType(html) {
  const value = plainText(html)
    .replace(/\s*\/\s*/g, " | ")
    .replace(/\s+,/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");
  if (!value) return "object";
  if (value.startsWith("(") && value.endsWith(")")) return `tuple[${value.slice(1, -1)}]`;
  if (value.includes(",")) return `tuple[${value}]`;
  return value;
}

async function fetchText(url, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (response.ok) return await response.text();
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 250));
  }
  throw new Error(`Could not fetch ${url}: ${lastError?.message || "unknown error"}`);
}

function parseModuleIndex(html) {
  const modules = [];
  const pattern = /<LI><A HREF="([A-Za-z0-9_]+)\.html">([\s\S]*?)<\/A><\/li>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const name = plainText(match[2]);
    if (name !== match[1]) continue;
    modules.push({ name, page: `${match[1]}.html`, summary: `The published ${name} module reference.` });
  }
  return modules;
}

function parseModulePage(module, html) {
  const content = html.match(/<div id="content">([\s\S]*?)<\/div>/i)?.[1] || html;
  const description = content.match(/<H1>[\s\S]*?<\/H1><P>([\s\S]*?)(?=<H3>)/i)?.[1];
  module.summary = sentence(description, module.summary);
  const methodsSection = html.match(/<H3>Methods<\/H3>[\s\S]*?(?=<H3>|<\/div>)/i)?.[0] || "";
  const methods = [];
  const pattern = /<DT><A HREF="([^"]+_meth\.html)">([\s\S]*?)<\/A><BR>\s*<DD>([\s\S]*?)(?=<P><DT>|<\/DL>)/gi;
  let match;
  while ((match = pattern.exec(methodsSection))) {
    const name = plainText(match[2]);
    if (!/^[A-Za-z_]\w*$/.test(name)) throw new Error(`${module.name} has an unexpected method name: ${name}`);
    if (methods.some((method) => method.name === name)) continue;
    methods.push({
      name,
      summary: sentence(match[3], `Call ${module.name}.${name}.`),
      source: new URL(match[1], documentationRoot).href,
    });
  }
  return methods;
}

function parseMethodPage(moduleName, method, html) {
  const content = html.match(/<div id="content">([\s\S]*?)<\/div>/i)?.[1] || html;
  const heading = plainText(content.match(/<H1>([\s\S]*?)<\/H1>/i)?.[1] || "");
  const callMatch = heading.match(/^(?:(.*?)\s*=\s*)?(?:[A-Za-z_]\w*\.)?([A-Za-z_]\w*)\s*\(([\s\S]*)\)$/);
  const documentedReturn = content.match(/<H1>[\s\S]*?<\/H1><P>\s*([\s\S]*?)\s*=\s*<B>[A-Za-z_]\w*\s*\(/i)?.[1];
  const returnType = documentationType(documentedReturn || callMatch?.[1] || "None");
  const headingParameters = splitTopLevel(callMatch?.[3] || "").map((item) => item.split("=")[0].trim()).filter(Boolean);
  const documentedParameters = new Map();
  const parameterSection = content.match(/<H3>Parameters<\/H3>[\s\S]*?(?=<H3>|$)/i)?.[0] || "";
  const parameterPattern = /<DT><I>([\s\S]*?)<\/I>\s*:\s*([\s\S]*?)<P>\s*<DD>([\s\S]*?)<P>/gi;
  let parameterMatch;
  while ((parameterMatch = parameterPattern.exec(parameterSection))) {
    const rawName = plainText(parameterMatch[1]);
    const name = rawName.split("=")[0].trim();
    documentedParameters.set(name.toLowerCase(), {
      name,
      type: documentationType(parameterMatch[2]),
      optional: rawName.includes("="),
      description: sentence(parameterMatch[3], `Value passed as ${name}.`),
    });
  }
  const orderedNames = headingParameters.length ? headingParameters : [...documentedParameters.values()].map((item) => item.name);
  const parameters = orderedNames.map((rawName) => {
    const name = rawName.replace(/^\*+/, "").trim();
    const documented = documentedParameters.get(name.toLowerCase());
    if (documented) return documented;
    return {
      name: name || "value",
      type: "object",
      optional: (callMatch?.[3] || "").includes(`${rawName}=`),
      description: `Value passed to ${moduleName}.${method.name}; consult the linked module documentation for its accepted shape.`,
    };
  });
  return { name: method.name, parameters, returns: returnType };
}

function moduleCategory(name) {
  if (["win32gui", "_winxptheme", "win32console", "win32clipboard", "win32help", "win32print"].includes(name)) return "Desktop";
  if (["win32process", "win32job"].includes(name)) return "Processes";
  if (["win32event", "timer"].includes(name)) return "Synchronisation";
  if (["win32file", "win32pipe", "win32lz", "mmapfile", "win32transaction"].includes(name)) return "Files and I/O";
  if (["win32security", "win32cred", "win32crypt"].includes(name)) return "Security";
  if (["win32evtlog", "win32pdh", "perfmon"].includes(name)) return "Observation";
  if (["win32service", "servicemanager", "win32profile"].includes(name)) return "Management";
  if (["win32inet", "win32net", "win32wnet", "win32ras", "win2kras", "win32ts", "wincerapi"].includes(name)) return "Networking";
  return "Core";
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

const indexHtml = await fetchText(moduleIndexUrl);
const indexedModules = parseModuleIndex(indexHtml);
if (indexedModules.length !== 34) throw new Error(`Expected 34 published Win32 API modules, found ${indexedModules.length}`);

const modules = await mapConcurrent(indexedModules, 8, async (module) => {
  const html = await fetchText(new URL(module.page, documentationRoot).href);
  const methods = parseModulePage(module, html);
  process.stdout.write(`${module.name}: ${methods.length} methods\n`);
  return { ...module, category: moduleCategory(module.name), methods };
});

const documentedMethodCount = modules.reduce((count, module) => count + module.methods.length, 0);
const methodTasks = modules.flatMap((module) => module.methods.map((method) => ({ module, method })));
let completed = 0;
const unavailableMethodPages = [];
await mapConcurrent(methodTasks, 12, async ({ module, method }) => {
  try {
    const html = await fetchText(method.source);
    method.signature = parseMethodPage(module.name, method, html);
  } catch (error) {
    if (!error.message.includes("404 Not Found")) throw error;
    unavailableMethodPages.push(`${module.name}::${method.name}`);
    method.source = new URL(module.page, documentationRoot).href;
    method.signature = {
      name: method.name,
      parameters: [{
        name: "*args",
        type: "object",
        optional: true,
        description: `The published ${module.name} index lists this method, but its individual signature page is unavailable. Check the module page and the installed wrapper's docstring before calling it.`,
      }],
      returns: "object",
    };
  }
  completed += 1;
  if (completed % 100 === 0 || completed === methodTasks.length) process.stdout.write(`signatures: ${completed}/${methodTasks.length}\n`);
});

const interpreter = discoverPython();
const runtimeResult = spawnSync(
  interpreter.command,
  [...interpreter.args, path.join(scriptsDirectory, "audit_pywin32_runtime.py")],
  { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
);
if (runtimeResult.error || runtimeResult.status !== 0) {
  throw runtimeResult.error || new Error(runtimeResult.stderr || `pywin32 runtime audit exited with ${runtimeResult.status}`);
}
const runtime = JSON.parse(runtimeResult.stdout);
const runtimeOnlyMethods = [];
for (const [moduleName, methodNames] of Object.entries(runtime.modules)) {
  const module = modules.find((item) => item.name === moduleName);
  if (!module) throw new Error(`Runtime module ${moduleName} is absent from the published module index`);
  const documentedNames = new Set(module.methods.map((method) => method.name));
  for (const name of methodNames) {
    if (documentedNames.has(name)) continue;
    const key = `${moduleName}::${name}`;
    runtimeOnlyMethods.push(key);
    module.methods.push({
      name,
      summary: `Call the public ${moduleName}.${name} wrapper exposed by pywin32 ${runtime.version}.`,
      source: new URL(module.page, documentationRoot).href,
      runtimeOnly: true,
      signature: {
        name,
        parameters: [{
          name: "*args",
          type: "object",
          optional: true,
          description: `This callable is present in pywin32 ${runtime.version}, but the published module index does not provide an individual signature page. Check the installed wrapper and native API contract before calling it.`,
        }],
        returns: "object",
      },
    });
  }
}

for (const module of modules) {
  module.methods.sort((left, right) => left.name.localeCompare(right.name));
}
modules.sort((left, right) => left.name.localeCompare(right.name));

const keys = modules.flatMap((module) => module.methods.map((method) => `${module.name}::${method.name}`));
if (new Set(keys).size !== keys.length) throw new Error("The published inventory contains duplicate module/method keys");
if (!keys.includes("win32gui::GetMessage")) throw new Error("The published inventory did not include win32gui.GetMessage");

const catalog = {
  source: moduleIndexUrl,
  runtimeVersion: runtime.version,
  moduleCount: modules.length,
  documentedMethodCount,
  runtimeMethodCount: Object.values(runtime.modules).reduce((count, methods) => count + methods.length, 0),
  runtimeOnlyMethods: runtimeOnlyMethods.sort(),
  methodCount: keys.length,
  unavailableMethodPages: unavailableMethodPages.sort(),
  inventorySha256: crypto.createHash("sha256").update(keys.join("\n")).digest("hex"),
  modules,
};

const output = `/* Generated by scripts/build-pywin32-api-catalog.mjs from the published pywin32 Win32 API module index. */\nwindow.ILOVEOS_PYWIN32_API_CATALOG = ${JSON.stringify(catalog, null, 2)};\n`;
fs.writeFileSync(outputPath, output, "utf8");
console.log(JSON.stringify({
  output: path.relative(root, outputPath),
  modules: catalog.moduleCount,
  documentedMethods: catalog.documentedMethodCount,
  runtimeMethods: catalog.runtimeMethodCount,
  runtimeOnlyMethods: catalog.runtimeOnlyMethods.length,
  unionMethods: catalog.methodCount,
  unavailableMethodPages: catalog.unavailableMethodPages,
  inventorySha256: catalog.inventorySha256,
}, null, 2));
