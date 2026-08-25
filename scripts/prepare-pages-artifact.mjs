import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = path.resolve(path.dirname(scriptPath), "..");

export function extractLocalAssets(indexSource) {
  const references = [];
  for (const match of indexSource.matchAll(/<link\b[^>]*\brel=["'][^"']*stylesheet[^"']*["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) references.push(match[1]);
  for (const match of indexSource.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) references.push(match[1]);
  return references;
}

function safeAssetPath(reference) {
  const raw = reference.split(/[?#]/, 1)[0];
  if (!raw || raw.includes("\\") || raw.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(raw) || raw.startsWith("//")) throw new Error(`Unsafe or non-local index asset: ${reference}`);
  const normalized = path.posix.normalize(raw);
  if (normalized === ".." || normalized.startsWith("../")) throw new Error(`Index asset escapes the site root: ${reference}`);
  if (!/\.(?:css|js)$/i.test(normalized)) throw new Error(`Index asset is not CSS or JavaScript: ${reference}`);
  return normalized;
}

function copyFile(root, output, relative) {
  const source = path.resolve(root, relative);
  const rootPrefix = `${path.resolve(root)}${path.sep}`;
  if (!source.startsWith(rootPrefix) || !fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`Missing or unsafe public file: ${relative}`);
  const destination = path.join(output, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

export function listFiles(root) {
  const files = [];
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) files.push(path.relative(root, absolute).split(path.sep).join("/"));
    }
  }
  visit(root);
  return files;
}

export function preparePagesArtifact({ root = defaultRoot, output = path.join(root, "_site") } = {}) {
  root = path.resolve(root);
  output = path.resolve(output);
  if (output === root || !output.startsWith(`${root}${path.sep}`)) throw new Error("Artifact output must be a child of the repository root");
  const indexPath = path.join(root, "index.html");
  if (!fs.existsSync(indexPath)) throw new Error("Missing index.html");
  const assets = [...new Set(extractLocalAssets(fs.readFileSync(indexPath, "utf8")).map(safeAssetPath))];
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  copyFile(root, output, "index.html");
  if (fs.existsSync(path.join(root, ".nojekyll"))) copyFile(root, output, ".nojekyll");
  for (const asset of assets) copyFile(root, output, asset);
  const downloads = path.join(root, "downloads");
  if (!fs.existsSync(downloads) || !fs.statSync(downloads).isDirectory()) throw new Error("Missing downloads directory");
  for (const relative of listFiles(downloads)) copyFile(root, output, `downloads/${relative}`);
  return listFiles(output);
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const rootIndex = process.argv.indexOf("--root");
    const outputIndex = process.argv.indexOf("--output");
    const root = rootIndex >= 0 ? path.resolve(process.argv[rootIndex + 1]) : defaultRoot;
    const output = outputIndex >= 0 ? path.resolve(process.argv[outputIndex + 1]) : path.join(root, "_site");
    const inventory = preparePagesArtifact({ root, output });
    console.log(`Pages artifact: ${inventory.length} files in ${output}`);
    for (const file of inventory) console.log(file);
  } catch (error) {
    console.error(`ERROR ${error.message}`);
    process.exitCode = 1;
  }
}
