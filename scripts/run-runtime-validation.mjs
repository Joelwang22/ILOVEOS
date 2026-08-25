import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { discoverPython } from "./check-python-syntax.mjs";
import { runtimeValidationRows } from "./runtime-validation-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const pythonIndex = args.indexOf("--python");
const pythonOverride = pythonIndex >= 0 ? args[pythonIndex + 1] : undefined;

function inventory() {
  let python;
  try {
    const found = discoverPython(pythonOverride);
    python = { available: true, command: found.command, launcherArgs: found.args };
  } catch (error) {
    python = { available: false, error: error.message };
  }
  let pywin32 = false;
  if (python.available) {
    const probe = spawnSync(python.command, [...python.launcherArgs, "-I", "-c", "import win32api; print('ok')"], { encoding: "utf8", windowsHide: true });
    pywin32 = probe.status === 0;
  }
  return { platform: process.platform, release: os.release(), architecture: os.arch(), node: process.version, python, pywin32 };
}

function list() {
  console.log("Mode                 File");
  for (const row of runtimeValidationRows) console.log(`${row.mode.padEnd(20)} ${row.file}`);
}

if (args.includes("--check-environment")) {
  console.log(JSON.stringify(inventory(), null, 2));
} else if (!args.includes("--profile")) {
  list();
  console.log("\nRead-only listing only. Use --check-environment or an explicit --profile.");
} else {
  const profile = args[args.indexOf("--profile") + 1];
  if (profile !== "automated-safe") throw new Error(`Unsupported execution profile: ${profile}`);
  const environment = inventory();
  if (process.platform !== "win32") throw new Error("automated-safe execution requires a Windows host");
  if (!environment.python.available) throw new Error(environment.python.error);
  if (!environment.pywin32) throw new Error("The selected interpreter does not provide pywin32");
  const interpreter = environment.python;
  const results = [];
  for (const row of runtimeValidationRows.filter((item) => item.mode === profile)) {
    for (const command of row.commands) {
      const executable = command.executable.replace("{python}", interpreter.command).replace("{repo}", root);
      const commandArgs = [...interpreter.launcherArgs, ...command.args.map((value) => value.replaceAll("{repo}", root).replaceAll("{python}", interpreter.command))];
      const startedAt = new Date().toISOString();
      const run = spawnSync(executable, commandArgs, { cwd: root, encoding: "utf8", timeout: command.timeoutMs, windowsHide: true });
      results.push({ file: row.file, startedAt, status: run.status === 0 && !run.error ? "passed" : "failed", exitCode: run.status, stdout: run.stdout, stderr: run.stderr, error: run.error?.message || null, cleanupAssertions: row.cleanupAssertions });
      if (run.status !== 0 || run.error) break;
    }
  }
  const directory = path.join(root, "validation", "stage-8", "results");
  fs.mkdirSync(directory, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(":", "-");
  const output = path.join(directory, `${stamp}-automated-safe.json`);
  fs.writeFileSync(output, `${JSON.stringify({ generatedAt: new Date().toISOString(), environment, profile, results }, null, 2)}\n`);
  console.log(`Runtime results: ${output}`);
  if (results.some((item) => item.status !== "passed")) process.exitCode = 1;
}
