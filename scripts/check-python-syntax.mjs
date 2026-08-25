import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(scriptPath);
export const repositoryRoot = path.resolve(scriptsDirectory, "..");

function executableCandidates() {
  const candidates = [];
  if (process.platform === "win32") {
    const local = process.env.LOCALAPPDATA;
    if (local) {
      for (const version of ["314", "313", "312", "311"]) candidates.push({ command: path.join(local, "Programs", "Python", `Python${version}`, "python.exe"), args: [] });
    }
    candidates.push({ command: "py", args: ["-3.14"] }, { command: "py", args: ["-3"] });
  }
  candidates.push({ command: "python3", args: [] }, { command: "python", args: [] });
  return candidates;
}

export function discoverPython(override = process.env.ILOVEOS_PYTHON) {
  const candidates = override ? [{ command: override, args: [] }] : executableCandidates();
  for (const candidate of candidates) {
    const result = spawnSync(candidate.command, [...candidate.args, "--version"], { encoding: "utf8", windowsHide: true });
    if (!result.error && result.status === 0 && /Python 3\./.test(`${result.stdout}${result.stderr}`)) return candidate;
  }
  throw new Error(override ? `Python interpreter is unavailable: ${override}` : "No supported Python 3 interpreter was found");
}

export function pythonFiles(root = repositoryRoot) {
  const downloads = path.join(root, "downloads");
  return fs.readdirSync(downloads, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".py"))
    .map((entry) => path.join(downloads, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

export function checkPythonSyntax(files, interpreter = discoverPython()) {
  const compile = "import pathlib,sys; p=pathlib.Path(sys.argv[1]); compile(p.read_text(encoding='utf-8'), str(p), 'exec')";
  const failures = [];
  for (const file of files) {
    const result = spawnSync(interpreter.command, [...interpreter.args, "-I", "-B", "-c", compile, file], { encoding: "utf8", windowsHide: true });
    if (result.error || result.status !== 0) failures.push({ file, error: result.error?.message || result.stderr.trim() || `exit ${result.status}` });
  }
  if (failures.length) throw new Error(failures.map((item) => `${item.file}: ${item.error}`).join("\n"));
  return files.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const args = process.argv.slice(2);
  const overrideIndex = args.indexOf("--python");
  const override = overrideIndex >= 0 ? args[overrideIndex + 1] : undefined;
  const explicitFiles = args.filter((value, index) => value !== "--python" && index !== overrideIndex + 1).map((value) => path.resolve(value));
  try {
    const interpreter = discoverPython(override);
    const files = explicitFiles.length ? explicitFiles : pythonFiles();
    const count = checkPythonSyntax(files, interpreter);
    console.log(`Python syntax: ${count} files (${interpreter.command} ${interpreter.args.join(" ")})`);
  } catch (error) {
    console.error(`ERROR ${error.message}`);
    process.exitCode = 1;
  }
}
