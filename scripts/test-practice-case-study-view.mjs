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
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browser = browserCandidates.find((candidate) => fs.existsSync(candidate));

if (!browser) {
  console.error("ERROR no supported Chromium browser found for the practice case-study test");
  process.exit(1);
}

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-practice-case-study-"));
const pagePath = path.join(tempDirectory, "index.html");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const probe = `<script>
  window.addEventListener("DOMContentLoaded", async () => {
    const checks = {};
    const waitForRoute = () => new Promise((resolve) => setTimeout(resolve, 40));
    const visible = (element) => Boolean(element
      && element.getClientRects().length
      && getComputedStyle(element).display !== "none"
      && getComputedStyle(element).visibility !== "hidden");
    try {
      window.location.hash = "#/lesson/reading-winapi-docs";
      await waitForRoute();

      const workspace = document.querySelector('[data-practice-workspace="reading-winapi-docs"]');
      const caseStudies = Array.from(workspace?.querySelectorAll("[data-practice-case-study]") || []);
      const caseStudy = caseStudies[0];
      const intro = workspace?.querySelector(".practice-intro");
      const expectation = workspace?.querySelector(".practice-expectation");
      const steps = workspace?.querySelector(".practice-steps");
      const follows = (later, earlier) => Boolean(later && earlier
        && (earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING));
      checks.oneCaseStudy = caseStudies.length === 1;
      checks.beforeSteps = follows(caseStudy, intro) && follows(expectation, caseStudy) && follows(steps, caseStudy);
      checks.alwaysVisible = visible(caseStudy)
        && Array.from(caseStudy?.querySelectorAll("[data-case-study-section]") || []).every(visible);
      checks.notDetailsOrDialog = caseStudy?.tagName === "SECTION"
        && !caseStudy.closest("details, dialog, [role='dialog']")
        && !caseStudy.querySelector("details, dialog, [role='dialog']");
      checks.labelAndTitleVisible = visible(caseStudy?.querySelector(".practice-case-study-label"))
        && caseStudy?.querySelector(".practice-case-study-label")?.textContent.trim() === "API contract case study"
        && visible(caseStudy?.querySelector(".practice-case-study-title"))
        && caseStudy?.querySelector(".practice-case-study-title")?.textContent.trim() === "Opening an existing file with CreateFileW";

      const sections = Array.from(caseStudy?.querySelectorAll("[data-case-study-section]") || []);
      checks.fiveSectionHeadings = sections.length === 5
        && JSON.stringify(sections.map((section) => section.querySelector("h5")?.textContent.trim()))
          === JSON.stringify(["Goal", "Call choices", "Parameter directions", "Result and error", "Ownership"]);

      const factLists = Array.from(caseStudy?.querySelectorAll("[data-case-study-facts]") || []);
      const factRows = factLists.flatMap((list) => Array.from(list.children));
      checks.semanticFactPairs = factLists.length === 3
        && factLists.every((list) => list.tagName === "DL")
        && factRows.length === 9
        && factRows.every((row) => row.children.length === 2
          && row.children[0].tagName === "DT"
          && row.children[1].tagName === "DD"
          && visible(row.children[0])
          && visible(row.children[1]));

      const references = Array.from(workspace?.querySelectorAll("[data-case-study-reference]") || []);
      checks.exactSectionReferences = references.length === 5
        && references.every(visible)
        && JSON.stringify(references.map((reference) => reference.textContent.trim()))
          === JSON.stringify([
            "Use case study: Goal",
            "Use case study: Call choices",
            "Use case study: Parameter directions",
            "Use case study: Result and error",
            "Use case study: Ownership",
          ]);
      checks.noCopyButton = !caseStudy?.querySelector("button, [data-copy-practice-command]");

      window.location.hash = "#/lesson/inspect-windows";
      await waitForRoute();
      const executableWorkspace = document.querySelector('[data-practice-workspace="inspect-windows"]');
      if (!executableWorkspace?.querySelector(".download-button")
        || executableWorkspace.querySelector("[data-practice-case-study]")) {
        throw new Error("executable download practice must not render a case-study box");
      }
    } catch (error) {
      checks.exception = error.message;
    }
    document.body.innerHTML = '<pre id="practice-case-study-result">' + JSON.stringify(checks) + '</pre>';
  });
<\/script>`;

const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const tiedAssets = [...indexSource.matchAll(/(?:href|src)="[^"]+\?v=([^"]+)"/g)];
if (!tiedAssets.length || tiedAssets.some((match) => match[1] !== "windows-api-families-1")) {
  console.error("ERROR every tied asset must use the windows-api-families-1 release key");
  process.exit(1);
}
const source = indexSource
  .replace("<head>", `<head><base href="${baseUrl}">`)
  .replace("</body>", `${probe}</body>`);

try {
  fs.writeFileSync(pagePath, source);
  const run = spawnSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--virtual-time-budget=5000",
    `--user-data-dir=${profilePath}`,
    "--dump-dom",
    `${pathToFileURL(pagePath).href}#/lesson/reading-winapi-docs`,
  ], { encoding: "utf8", timeout: 45000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="practice-case-study-result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return practice case-study results (exit ${run.status}): ${run.stderr.trim()}`);
  const results = JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  console.log(JSON.stringify(results));
  for (const [name, passed] of Object.entries(results)) {
    if (passed !== true) {
      console.error(`ERROR ${name}: ${String(passed)}`);
      process.exitCode = 1;
    }
  }
} finally {
  if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) fs.rmSync(tempDirectory, { recursive: true, force: true });
}
