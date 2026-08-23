import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
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
  console.error("ERROR no supported Chromium browser found for the popup scroll test");
  process.exit(1);
}

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-dialog-test-"));
const pagePath = path.join(tempDirectory, "dialog.html");
const profilePath = path.join(tempDirectory, "profile");

const repeatedContent = Array.from({ length: 24 }, (_, index) => `<p>Reference content row ${index + 1}: enough material to require scrolling.</p>`).join("");
const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>${styles}</style><style>.api-dialog{width:356px}</style></head>
<body>
  <dialog class="api-dialog" id="popup">
    <div id="api-detail-content">
      <header class="api-dialog-head">
        <div><span>Windows API guide</span><h2 id="api-detail-title">A deliberately wrapping popup heading</h2><p>This deliberately long popup description wraps across several lines so the header is taller than a fixed allowance.</p></div>
        <button class="api-dialog-close" type="button">×</button>
      </header>
      <div class="api-dialog-body">${repeatedContent}<p id="last-popup-content">Last popup content</p></div>
    </div>
  </dialog>
  <script>
    const popup = document.querySelector("#popup");
    const body = popup.querySelector(".api-dialog-body");
    popup.showModal();
    const popupOverflow = getComputedStyle(popup).overflowY;
    const scrollOwner = ["auto", "scroll"].includes(popupOverflow) ? popup : body;
    scrollOwner.scrollTop = scrollOwner.scrollHeight;
    const popupRect = popup.getBoundingClientRect();
    const lastRect = document.querySelector("#last-popup-content").getBoundingClientRect();
    const result = {
      visible: lastRect.top >= popupRect.top - 1 && lastRect.bottom <= popupRect.bottom + 1,
      scrollOwner: scrollOwner === popup ? "dialog" : "body",
      popupOverflow,
      bodyOverflow: getComputedStyle(body).overflowY,
      popupBottom: Math.round(popupRect.bottom),
      contentBottom: Math.round(lastRect.bottom),
    };
    document.body.innerHTML = '<pre id="result">' + JSON.stringify(result) + '</pre>';
  </script>
</body></html>`;

try {
  fs.writeFileSync(pagePath, html);
  const run = spawnSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    `--user-data-dir=${profilePath}`,
    "--window-size=390,600",
    "--force-device-scale-factor=1",
    "--dump-dom",
    pathToFileURL(pagePath).href,
  ], { encoding: "utf8", timeout: 30000 });

  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return popup metrics (exit ${run.status}): ${run.stderr.trim()}`);
  const result = JSON.parse(match[1].replaceAll("&quot;", '"'));
  console.log(JSON.stringify(result));
  if (!result.visible || result.scrollOwner !== "dialog") {
    console.error("ERROR the popup's final content is not reachable through the dialog scroll container");
    process.exitCode = 1;
  }
} finally {
  if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) fs.rmSync(tempDirectory, { recursive: true, force: true });
}
