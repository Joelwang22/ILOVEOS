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
  console.error("ERROR no supported Chromium browser found for the assessment layout test");
  process.exit(1);
}

const scenarios = [
  { name: "desktop", width: 1440, height: 1000, hash: "#/review/foundations", size: "small" },
  { name: "compact", width: 900, height: 900, hash: "#/assessment/final", size: "default" },
  { name: "narrow", width: 500, height: 844, hash: "#/assessment/final", size: "large" },
  { name: "size-small", width: 900, height: 900, hash: "#/assessment/final", size: "small", fontProbe: true },
  { name: "size-default", width: 900, height: 900, hash: "#/assessment/final", size: "default", fontProbe: true },
  { name: "size-large", width: 900, height: 900, hash: "#/assessment/final", size: "large", fontProbe: true }
];
const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-assessment-layout-"));
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const errors = [];
const sizeMetrics = [];
const releaseAssets = ["styles.css", "course-api-coverage.js", "windows-api-data.js", "reference-overview-view.js", "windows-api-view.js", "assessment-data.js", "assessment-view.js", "app.js"];
const releaseVersions = releaseAssets.map((asset) => indexSource.match(new RegExp(`${asset.replace(".", "\\.")}\\?v=([^\"']+)`))?.[1]);
if (releaseVersions.some((version) => version !== "course-api-coverage-1")) errors.push(`Release assets must use course-api-coverage-1: ${JSON.stringify(releaseVersions)}`);

try {
  for (const scenario of scenarios) {
    const pagePath = path.join(tempDirectory, `${scenario.name}.html`);
    const profilePath = path.join(tempDirectory, `${scenario.name}-profile`);
    const probe = `<script>
      window.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
        const main = document.querySelector("#main-content");
        const page = main.querySelector(".assessment-page");
        const activity = main.querySelector(".assessment-activity:not(.unavailable)");
        const firstOptions = main.querySelector(".assessment-options");
        void page.offsetHeight;
        const heroSize = parseFloat(getComputedStyle(main.querySelector(".assessment-hero > p")).fontSize);
        const optionSize = parseFloat(getComputedStyle(main.querySelector(".assessment-option, .assessment-checkbox")).fontSize);
        let continuationSize = null;
        if (${Boolean(scenario.fontProbe)}) {
          const continuation = document.createElement("nav");
          continuation.className = "assessment-next";
          continuation.innerHTML = '<a class="button">Continue</a>';
          page.append(continuation);
          continuationSize = parseFloat(getComputedStyle(continuation.querySelector(".button")).fontSize);
        }
        const visibleElements = [...main.querySelectorAll("*")].filter((element) => {
          const style = getComputedStyle(element);
          return style.display !== "none" && style.position !== "fixed" && !element.classList.contains("sr-only");
        });
        const pageRect = main.getBoundingClientRect();
        const overflowers = visibleElements.filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && (rect.right > pageRect.right + 1 || rect.left < pageRect.left - 1);
        }).map((element) => element.className || element.tagName).slice(0, 5);
        const moveButtons = [...main.querySelectorAll('[data-assessment-action="move"]')];
        const activityStyle = activity ? getComputedStyle(activity) : null;
        const result = {
          pageRendered: Boolean(page && activity),
          noDocumentOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          noMainOverflow: main.scrollWidth <= main.clientWidth,
          noElementOverflow: overflowers.length === 0,
          overflowers,
          activityCardStyled: activityStyle?.borderStyle === "solid" && activityStyle?.backgroundImage !== "none",
          heroSize,
          optionSize,
          heroHeadingSize: parseFloat(getComputedStyle(main.querySelector(".assessment-hero h1")).fontSize),
          practicalHeadingSize: main.querySelector(".assessment-practical h2") ? parseFloat(getComputedStyle(main.querySelector(".assessment-practical h2")).fontSize) : null,
          orderingSize: parseFloat(getComputedStyle(main.querySelector('.assessment-order-actions button')).fontSize),
          textareaSize: main.querySelector("textarea") ? parseFloat(getComputedStyle(main.querySelector("textarea")).fontSize) : null,
          continuationSize,
          optionsColumns: firstOptions ? getComputedStyle(firstOptions).gridTemplateColumns.split(" ").length : 0,
          controlsFit: [...main.querySelectorAll("button, textarea")].every((control) => control.scrollWidth <= control.clientWidth + 1),
          orderingTargets: moveButtons.length === 0 || moveButtons.every((button) => button.getBoundingClientRect().height >= 40),
          longTextWraps: [...main.querySelectorAll(".assessment-page p, .assessment-activity legend, .assessment-option, .assessment-checkbox, .assessment-order-list strong, .assessment-practical-prompts label")].every((element) => element.scrollWidth <= element.clientWidth + 1),
          noVerticalClipping: [...main.querySelectorAll("button, textarea, .assessment-activity, .assessment-practical-prompts label")].every((element) => element.scrollHeight <= element.clientHeight + 1),
          practicalTextarea: !main.querySelector("textarea") || main.querySelector("textarea").getBoundingClientRect().width <= main.querySelector("textarea").parentElement.getBoundingClientRect().width + 1,
          diagnostics: {
            activityBorderStyle: activityStyle?.borderStyle,
            activityBackground: activityStyle?.backgroundImage,
            documentWidths: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
            mainWidths: [main.scrollWidth, main.clientWidth],
            loadedSheets: document.styleSheets.length,
            htmlSize: document.documentElement.dataset.contentSize,
            matchesRequestedSize: page.matches('html[data-content-size="${scenario.size}"] .assessment-page'),
            leadVariable: getComputedStyle(page).getPropertyValue("--assessment-lead-size"),
            controlVariable: getComputedStyle(page).getPropertyValue("--assessment-control-size")
          }
        };
        document.body.innerHTML = '<pre id="layout-result">' + JSON.stringify(result) + '</pre>';
        }, 40);
      });
    <\/script>`;
    const html = indexSource
      .replace("<head>", `<head><base href="${baseUrl}"><script>localStorage.setItem("iloveos-content-size", "${scenario.size}");<\/script>`)
      .replace("</body>", `${probe}</body>`);
    fs.writeFileSync(pagePath, html);
    const run = spawnSync(browser, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--virtual-time-budget=3000",
      `--user-data-dir=${profilePath}`,
      `--window-size=${scenario.width},${scenario.height}`,
      "--force-device-scale-factor=1",
      "--dump-dom",
      `${pathToFileURL(pagePath).href}${scenario.hash}`,
    ], { encoding: "utf8", timeout: 30000 });
    if (run.error) throw run.error;
    const match = run.stdout.match(/<pre id="layout-result">(\{.*?\})<\/pre>/);
    if (!match) throw new Error(`${scenario.name}: browser did not return layout metrics (exit ${run.status}): ${run.stderr.trim()}`);
    const result = JSON.parse(match[1].replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
    console.log(`${scenario.name}: ${JSON.stringify(result)}`);
    for (const [name, passed] of Object.entries(result)) {
      if (["overflowers", "optionsColumns", "heroSize", "optionSize", "heroHeadingSize", "practicalHeadingSize", "orderingSize", "textareaSize", "continuationSize", "diagnostics"].includes(name)) continue;
      if (passed !== true) errors.push(`${scenario.name} ${name}: ${JSON.stringify(passed)}`);
    }
    if (scenario.name === "desktop" && result.optionsColumns < 2) errors.push("desktop assessment options do not use the available horizontal space");
    if (scenario.name === "narrow" && result.optionsColumns !== 1) errors.push("narrow assessment options do not collapse to one column");
    if (scenario.fontProbe) sizeMetrics.push({ name: scenario.name, lead: result.heroSize, heroHeading: result.heroHeadingSize, practicalHeading: result.practicalHeadingSize, option: result.optionSize, ordering: result.orderingSize, textarea: result.textareaSize, continuation: result.continuationSize });
  }
} finally {
  if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) fs.rmSync(tempDirectory, { recursive: true, force: true });
}

for (const key of ["lead", "heroHeading", "practicalHeading", "option", "ordering", "textarea", "continuation"]) {
  if (!(sizeMetrics[0][key] < sizeMetrics[1][key] && sizeMetrics[1][key] < sizeMetrics[2][key])) errors.push(`assessment ${key} does not scale small/default/large: ${JSON.stringify(sizeMetrics)}`);
}

console.log(`errors: ${errors.length}`);
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
