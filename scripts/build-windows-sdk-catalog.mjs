import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const readerProject = path.join(scriptsDirectory, "win32metadata-reader", "Win32MetadataReader.csproj");
const outputPath = path.join(root, "windows-sdk-catalog.js");
const packageVersion = "71.0.20-preview";
const packageSha256 = "43b9a07fb89fb1d43edd6a05855fe88a303bf450b267ec0c4aaf00064dc62bdb";
const packageUrl = `https://api.nuget.org/v3-flatcontainer/microsoft.windows.sdk.win32metadata/${packageVersion}/microsoft.windows.sdk.win32metadata.${packageVersion}.nupkg`;
const packageOverrideIndex = process.argv.indexOf("--package");

async function obtainPackage(directory) {
  if (packageOverrideIndex >= 0) return path.resolve(process.argv[packageOverrideIndex + 1]);
  const target = path.join(directory, `Microsoft.Windows.SDK.Win32Metadata.${packageVersion}.nupkg`);
  const response = await fetch(packageUrl, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Could not download Win32 metadata: ${response.status} ${response.statusText}`);
  fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  return target;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function headerFromDocumentation(url) {
  return url?.match(/\/windows\/win32\/api\/([^/]+)\//i)?.[1] ? `${url.match(/\/windows\/win32\/api\/([^/]+)\//i)[1]}.h` : undefined;
}

function parameterTuple(parameter) {
  const flags = [
    parameter.optional ? "optional" : "",
    parameter.direction === "out" ? "out" : parameter.direction === "inout" ? "inout" : "",
  ].filter(Boolean).join(",");
  return flags ? [parameter.name, parameter.type, flags] : [parameter.name, parameter.type];
}

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "iloveos-windows-sdk-"));
try {
  const packagePath = await obtainPackage(temporaryDirectory);
  const actualHash = sha256(packagePath);
  if (actualHash !== packageSha256) throw new Error(`Win32 metadata package SHA-256 mismatch: ${actualHash}`);

  const readerOutput = path.join(temporaryDirectory, "functions.json");
  const reader = spawnSync("dotnet", [
    "run", "--project", readerProject, "--configuration", "Release", "--",
    packagePath, readerOutput,
  ], { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (reader.error || reader.status !== 0) throw reader.error || new Error(reader.stderr || `metadata reader exited with ${reader.status}`);

  const extracted = JSON.parse(fs.readFileSync(readerOutput, "utf8"));
  const groups = new Map();
  for (const definition of extracted.functions) {
    const key = `${definition.namespace}::${definition.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(definition);
  }

  const namespaces = new Map();
  let documentedFunctions = 0;
  let signatureCount = 0;
  const inventoryLines = [];
  for (const [key, definitions] of [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const first = definitions[0];
    const signatures = [];
    const seenSignatures = new Set();
    for (const definition of definitions) {
      const signature = [definition.returns, definition.parameters.map(parameterTuple)];
      const serialized = JSON.stringify(signature);
      if (seenSignatures.has(serialized)) continue;
      seenSignatures.add(serialized);
      signatures.push(signature);
    }
    signatureCount += signatures.length;
    const documentation = definitions.map((item) => item.documentation).find(Boolean);
    if (documentation) documentedFunctions += 1;
    const attributes = first.metadataAttributes || {};
    const supportedOS = attributes["Windows.Win32.Foundation.Metadata.SupportedOSPlatformAttribute"]?.[0];
    const architectures = attributes["Windows.Win32.Foundation.Metadata.SupportedArchitectureAttribute"];
    const obsolete = attributes["System.ObsoleteAttribute"]?.[0];
    const item = {
      n: first.name,
      d: first.dll,
      ...(first.entryPoint !== first.name ? { e: first.entryPoint } : {}),
      ...(documentation ? { u: documentation } : {}),
      ...(headerFromDocumentation(documentation) ? { h: headerFromDocumentation(documentation) } : {}),
      ...(supportedOS ? { o: supportedOS } : {}),
      ...(architectures?.length ? { a: architectures } : {}),
      ...(obsolete ? { x: obsolete } : {}),
      ...(first.importAttributes.includes("SetLastError") ? { l: 1 } : {}),
      s: signatures,
    };
    if (!namespaces.has(first.namespace)) namespaces.set(first.namespace, []);
    namespaces.get(first.namespace).push(item);
    inventoryLines.push(`${key}|${first.dll}|${first.entryPoint}|${JSON.stringify(signatures)}`);
  }

  const namespaceRecords = [...namespaces.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, functions]) => ({ name, functions }));
  const catalog = {
    sourcePackage: "Microsoft.Windows.SDK.Win32Metadata",
    packageVersion,
    packageSha256,
    packageUrl,
    projectUrl: "https://github.com/microsoft/win32metadata",
    metadataVersion: extracted.metadataVersion,
    definitionCount: extracted.functions.length,
    signatureCount,
    functionCount: groups.size,
    documentedFunctions,
    namespaceCount: namespaceRecords.length,
    dllCount: new Set(extracted.functions.map((item) => item.dll.toLowerCase())).size,
    inventorySha256: crypto.createHash("sha256").update(inventoryLines.join("\n")).digest("hex"),
    namespaces: namespaceRecords,
  };
  if (catalog.definitionCount !== 18345 || catalog.functionCount !== 18301) {
    throw new Error(`Pinned metadata inventory changed: ${catalog.definitionCount} definitions / ${catalog.functionCount} functions`);
  }
  const output = `/* Generated by scripts/build-windows-sdk-catalog.mjs from Microsoft Win32 metadata ${packageVersion}. */\nwindow.ILOVEOS_WINDOWS_SDK_CATALOG=${JSON.stringify(catalog)};\n`;
  fs.writeFileSync(outputPath, output, "utf8");
  console.log(JSON.stringify({
    output: path.relative(root, outputPath),
    packageVersion,
    definitions: catalog.definitionCount,
    signatures: catalog.signatureCount,
    functions: catalog.functionCount,
    documentedFunctions: catalog.documentedFunctions,
    namespaces: catalog.namespaceCount,
    dlls: catalog.dllCount,
    inventorySha256: catalog.inventorySha256,
  }, null, 2));
} finally {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
}
