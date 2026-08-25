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
  console.error("ERROR no supported Chromium browser found for the global keyboard-navigation test");
  process.exit(1);
}

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-global-keyboard-"));
const pagePath = path.join(tempDirectory, "index.html");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const probe = `<script>
  window.addEventListener("DOMContentLoaded", async () => {
    const wait = (milliseconds = 40) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const checks = {};
    try {
      const menu = document.querySelector("#menu-button");
      const sidebar = document.querySelector("#sidebar");
      const searchDialog = document.querySelector("#search-dialog");
      const searchInput = document.querySelector("#search-input");
      const searchClose = document.querySelector("#search-close");
      checks.searchDialogName = searchDialog.getAttribute("aria-label") === "Search course content";
      checks.searchInputName = searchInput.getAttribute("aria-label") === "Search course content";
      checks.searchCloseName = searchClose.getAttribute("aria-label") === "Close search";
      checks.menuControlsSidebar = menu.getAttribute("aria-controls") === sidebar.id;

      for (const [hash, route] of [["#/", "home"], ["#/lessons", "lessons"], ["#/lesson/cpu-architecture-data", "lesson"], ["#/reference/windows-api", "windows-api"]]) {
        window.location.hash = hash;
        await wait();
        const current = [...document.querySelectorAll('.nav-item[aria-current="page"]')];
        checks["oneCurrent" + route] = current.length === 1 && current[0].dataset.route === route;
      }

      menu.focus();
      menu.click();
      await wait();
      checks.menuOpensWithNavigationFocus = sidebar.classList.contains("open")
        && sidebar.contains(document.activeElement)
        && document.querySelector("#main-content").inert
        && !menu.inert;
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await wait();
      checks.escapeClosesAndReturnsFocus = !sidebar.classList.contains("open")
        && document.activeElement === menu
        && !document.querySelector("#main-content").inert;
      menu.click();
      await wait();
      document.querySelector("#sidebar-scrim").click();
      await wait();
      checks.scrimClosesAndReturnsFocus = !sidebar.classList.contains("open")
        && document.activeElement === menu
        && !document.querySelector("#main-content").inert;
    } catch (error) {
      checks.exception = error.message;
    }
    document.body.innerHTML = '<pre id="keyboard-result">' + JSON.stringify(checks) + '</pre>';
  });
<\/script>`;

const source = fs.readFileSync(path.join(root, "index.html"), "utf8")
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
    "--window-size=500,844",
    "--force-device-scale-factor=1",
    "--dump-dom",
    `${pathToFileURL(pagePath).href}#/`,
  ], { encoding: "utf8", timeout: 45000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="keyboard-result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return keyboard results (exit ${run.status}): ${run.stderr.trim()}`);
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
