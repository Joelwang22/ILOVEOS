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
  console.error("ERROR no supported Chromium browser found for the site accessibility test");
  process.exit(1);
}

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-site-accessibility-"));
const pagePath = path.join(tempDirectory, "index.html");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const probe = `<script>
  window.addEventListener("DOMContentLoaded", () => {
    const toRgb = (value) => {
      if (value.startsWith("#")) return [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)].map((channel) => Number.parseInt(channel, 16));
      return value.slice(value.indexOf("(") + 1, value.lastIndexOf(")")).split(",").slice(0, 3).map(Number);
    };
    const luminance = (value) => {
      const channels = toRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const contrast = (foreground, background) => {
      const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
      return (light + 0.05) / (dark + 0.05);
    };
    const probeFocus = (element) => {
      element.focus();
      const style = getComputedStyle(element);
      return style.outlineStyle === "solid" && parseFloat(style.outlineWidth) >= 2 && style.outlineColor !== "rgba(0, 0, 0, 0)";
    };
    const mutedElement = document.querySelector(".code-head");
    const codeCard = mutedElement.closest(".code-card");
    const comment = document.createElement("span");
    comment.className = "code-comment";
    comment.textContent = "# comment";
    codeCard.append(comment);
    document.body.append(codeCard);
    const results = {
      mutedTextContrast: contrast(getComputedStyle(mutedElement).color, getComputedStyle(codeCard).backgroundColor) >= 4.5,
      codeCommentContrast: contrast(getComputedStyle(comment).color, getComputedStyle(codeCard).backgroundColor) >= 4.5,
      buttonFocusIndicator: probeFocus(document.querySelector("#search-trigger")),
      linkFocusIndicator: probeFocus(document.querySelector(".nav-item")),
    };
    document.body.innerHTML = '<pre id="accessibility-result">' + JSON.stringify(results) + '</pre>';
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
    "--virtual-time-budget=3000",
    `--user-data-dir=${profilePath}`,
    "--window-size=1440,1000",
    "--force-device-scale-factor=1",
    "--dump-dom",
    `${pathToFileURL(pagePath).href}#/`,
  ], { encoding: "utf8", timeout: 30000 });
  if (run.error) throw run.error;
  const match = run.stdout.match(/<pre id="accessibility-result">(\{.*?\})<\/pre>/);
  if (!match) throw new Error(`browser did not return accessibility results (exit ${run.status}): ${run.stderr.trim()}`);
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
