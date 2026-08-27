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
  console.error("ERROR no supported Chromium browser found for the practice command test");
  process.exit(1);
}

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-practice-command-"));
const pagePath = path.join(tempDirectory, "index.html");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const probe = `<script>
  window.addEventListener("DOMContentLoaded", async () => {
    const checks = {};
    const waitForRoute = () => new Promise((resolve) => setTimeout(resolve, 25));
    try {
      window.location.hash = "#/lesson/cpu-architecture-data";
      await waitForRoute();
      checks.commandRendered = Boolean(document.querySelector("[data-practice-command] pre code"));
      checks.commandLabel = document.querySelector("[data-practice-command] [data-command-label]")?.textContent.trim() === "PowerShell";
      checks.copyButtonNamed = document.querySelector("[data-copy-practice-command]")?.getAttribute("aria-label")?.includes("PowerShell");
      checks.commandContainsPointerCheck = document.querySelector("[data-practice-command-code]")?.textContent.includes("ctypes.sizeof(ctypes.c_void_p)");

      const button = document.querySelector("[data-copy-practice-command]");
      const command = document.querySelector("[data-practice-command-code]");
      const status = document.querySelector("[data-copy-status]");
      let copiedText = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (value) => { copiedText = value; } },
      });
      button?.focus();
      button?.click();
      await waitForRoute();
      checks.copiedText = copiedText === command?.textContent;
      checks.copiedState = button?.textContent.trim() === "Copied";
      checks.copyFocusRetained = document.activeElement === button;
      checks.copyLiveConfirmation = status?.textContent.includes("PowerShell command copied.");

      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => { throw new Error("blocked"); } },
      });
      button?.click();
      await waitForRoute();
      checks.fallbackSelectsCommand = window.getSelection()?.toString() === command?.textContent;
      checks.fallbackLiveConfirmation = status?.textContent.includes("Press Ctrl+C to copy");

      window.location.hash = "#/lesson/events-waits";
      await waitForRoute();
      const eventBlocks = Array.from(document.querySelectorAll("[data-practice-command]"));
      const blockWithLabel = (label) => eventBlocks.find((block) => (
        block.querySelector("[data-command-label]")?.textContent.trim() === label
      ));
      const creatorBlock = blockWithLabel("Creator PowerShell");
      const waiterBlock = blockWithLabel("Waiter PowerShell");
      checks.eventCreatorLabel = Boolean(creatorBlock);
      checks.eventWaiterLabel = Boolean(waiterBlock);
      checks.eventBlocksDistinct = Boolean(creatorBlock && waiterBlock && creatorBlock !== waiterBlock);

      const creatorButton = creatorBlock?.querySelector("[data-copy-practice-command]");
      const creatorStatus = creatorBlock?.querySelector("[data-copy-status]");
      const waiterButton = waiterBlock?.querySelector("[data-copy-practice-command]");
      const waiterCommand = waiterBlock?.querySelector("[data-practice-command-code]");
      const creatorButtonBefore = creatorButton?.textContent;
      const creatorStatusBefore = creatorStatus?.textContent;
      copiedText = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async (value) => { copiedText = value; } },
      });
      waiterButton?.click();
      await waitForRoute();
      checks.eventWaiterCopied = copiedText === waiterCommand?.textContent;
      checks.eventWaiterCopiedState = waiterButton?.textContent.trim() === "Copied";
      checks.eventCreatorCopyUnchanged = creatorButton?.textContent === creatorButtonBefore;
      checks.eventCreatorStatusUnchanged = creatorStatus?.textContent === creatorStatusBefore;
    } catch (error) {
      checks.exception = error.message;
    }
    document.body.innerHTML = '<pre id="practice-command-result">' + JSON.stringify(checks) + '</pre>';
  });
<\/script>`;

const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const tiedAssets = [...indexSource.matchAll(/(?:href|src)="[^"]+\?v=([^"]+)"/g)];
if (!tiedAssets.length || tiedAssets.some((match) => match[1] !== "search-filter-card-1")) {
  console.error("ERROR every tied asset must use the search-filter-card-1 release key");
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
    `${pathToFileURL(pagePath).href}#/lesson/cpu-architecture-data`,
  ], { encoding: "utf8", timeout: 45000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="practice-command-result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return practice command results (exit ${run.status}): ${run.stderr.trim()}`);
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
