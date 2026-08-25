import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const args = process.argv.slice(2);

function run(command, commandArgs, label) {
  console.log(`\n[release-gate] ${label}`);
  const result = spawnSync(command, commandArgs, { cwd: root, encoding: "utf8", stdio: "inherit", windowsHide: true });
  if (result.error || result.status !== 0) throw result.error || new Error(`${label} failed with exit ${result.status}`);
}

try {
  const javascript = fs.readdirSync(root).filter((name) => name.endsWith(".js")).sort();
  const modules = fs.readdirSync(scriptsDirectory).filter((name) => name.endsWith(".mjs")).sort();
  for (const file of javascript) run(process.execPath, ["--check", file], `syntax ${file}`);
  for (const file of modules) run(process.execPath, ["--check", `scripts/${file}`], `syntax scripts/${file}`);
  run(process.execPath, ["scripts/audit-course.mjs", ...(args.includes("--check-links") ? ["--check-links"] : [])], "course audit");
  if (!args.includes("--skip-tests")) {
    const tests = modules.filter((name) => name.startsWith("test-")).sort();
    for (const test of tests) run(process.execPath, [`scripts/${test}`], test);
  }
  const pythonArgs = ["scripts/check-python-syntax.mjs"];
  const pythonIndex = args.indexOf("--python");
  if (pythonIndex >= 0) pythonArgs.push("--python", args[pythonIndex + 1]);
  run(process.execPath, pythonArgs, "Python syntax");
  if (args.includes("--stage")) run(process.execPath, ["scripts/prepare-pages-artifact.mjs"], "Pages artifact");
  const publicIndex = args.indexOf("--public-url");
  if (publicIndex >= 0) run(process.execPath, ["scripts/verify-pages-assets.mjs", "--url", args[publicIndex + 1]], "public Pages bytes");
  console.log("\nRelease gate passed");
} catch (error) {
  console.error(`\nERROR ${error.message}`);
  process.exitCode = 1;
}
