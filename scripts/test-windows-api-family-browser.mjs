import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.PROGRAMFILES_X86 && path.join(process.env.PROGRAMFILES_X86, "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"),
].filter(Boolean);
const browser = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!browser) throw new Error("no supported Chromium browser found for the Windows API family browser test");

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-api-family-browser-"));
const pagePath = path.join(tempDirectory, "index.html");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const probe = `<script>
  const runProbe = async () => {
    const checks = {};
    const wait = () => new Promise((resolve) => setTimeout(resolve, 50));
    const selected = () => document.querySelector("[data-api-variant][aria-selected=\\\"true\\\"]");
    const currentName = () => selected()?.dataset.apiVariant;
    try {
      await wait();
      const filter = document.querySelector("#windows-api-filter");
      filter.value = "CreateEvent";
      filter.dispatchEvent(new Event("input", { bubbles: true }));
      const createEventRow = document.querySelector('[data-windows-api-family="create-event"]');
      createEventRow?.click();
      await wait();
      const dialog = document.querySelector("#api-detail-dialog");
      checks.clickOpensOneDialog = dialog?.open === true && document.querySelectorAll("#api-detail-dialog dialog").length === 0;
      checks.clickStartsRecommended = currentName() === "CreateEventW";
      const tab = selected();
      tab?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await wait();
      checks.arrowRightSelectsNext = currentName() === "CreateEventA" && document.activeElement?.dataset.apiVariant === "CreateEventA" && selected()?.tabIndex === 0;
      selected()?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      await wait();
      checks.endSelectsLast = currentName() === "CreateEventExA" && document.activeElement?.dataset.apiVariant === "CreateEventExA";
      selected()?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      await wait();
      checks.arrowLeftSelectsPrevious = currentName() === "CreateEventExW" && document.querySelector("#api-detail-title")?.textContent.includes("CreateEventExW") && document.querySelector(".windows-contract-block")?.textContent.includes("CreateEventExW.argtypes");
      selected()?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      await wait();
      checks.homeSelectsFirst = currentName() === "CreateEventW" && document.activeElement?.dataset.apiVariant === "CreateEventW";
      dialog?.querySelector(".api-dialog-close")?.click();
      createEventRow?.click();
      await wait();
      checks.reopenResetsToRecommended = currentName() === "CreateEventW";
      dialog?.querySelector(".api-dialog-close")?.click();
      window.location.hash = "#/reference/windows-api?q=CreateEventExA";
      await wait();
      checks.filteredRouteSelectsExactVariant = dialog?.open === true && currentName() === "CreateEventExA" && document.querySelector("#api-detail-title")?.textContent.includes("CreateEventExA");
    } catch (error) { checks.exception = error.message; }
    document.body.innerHTML = '<pre id="api-family-browser-result">' + JSON.stringify(checks) + "</pre>";
  };
  setTimeout(runProbe, 300);
<\/script>`;

try {
  const source = fs.readFileSync(path.join(root, "index.html"), "utf8").replace("<head>", `<head><base href="${baseUrl}">`).replace("</body>", `${probe}</body>`);
  fs.writeFileSync(pagePath, source);
  const run = spawnSync(browser, ["--headless=new", "--disable-gpu", "--no-first-run", "--enable-logging=stderr", "--virtual-time-budget=10000", `--user-data-dir=${profilePath}`, "--dump-dom", `${pathToFileURL(pagePath).href}#/reference/windows-api`], { encoding: "utf8", timeout: 45000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="api-family-browser-result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return family browser results (exit ${run.status}): ${run.stderr.trim()} stdout: ${run.stdout.slice(-1000)}`);
  const results = JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  console.log(JSON.stringify(results));
  for (const [name, passed] of Object.entries(results)) if (passed !== true) { console.error(`ERROR ${name}: ${String(passed)}`); process.exitCode = 1; }
} finally {
  if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) fs.rmSync(tempDirectory, { recursive: true, force: true });
}
