import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
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
if (!browser) throw new Error("no supported Chromium browser found for the Windows API family layout test");

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-api-family-layout-"));
const pagePath = path.join(tempDirectory, "index.html");
const profilePath = path.join(tempDirectory, "profile");
const baseUrl = pathToFileURL(`${root}${path.sep}`).href;
const pageSource = fs.readFileSync(path.join(root, "index.html"), "utf8")
  .replace("<head>", `<head><base href="${baseUrl}">`);
fs.writeFileSync(pagePath, pageSource);

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function waitFor(predicate, timeout, label) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const value = await predicate();
    if (value) return value;
    await delay(50);
  }
  throw new Error(`timed out waiting for ${label}`);
}

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.socket = new WebSocket(url);
    this.opened = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${pending.method}: ${message.error.message}`));
      else pending.resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.opened;
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}

let stderr = "";
let browserProcess;
let browserClient;
let pageClient;
const errors = [];

try {
  browserProcess = spawn(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=0",
    "--remote-allow-origins=*",
    `--user-data-dir=${profilePath}`,
    `${pathToFileURL(pagePath).href}#/reference/windows-api`,
  ], { stdio: ["ignore", "ignore", "pipe"] });
  browserProcess.stderr.on("data", (chunk) => { stderr += String(chunk); });

  const activePortPath = path.join(profilePath, "DevToolsActivePort");
  await waitFor(() => fs.existsSync(activePortPath), 15000, "Edge DevToolsActivePort");
  const [port, browserPath] = fs.readFileSync(activePortPath, "utf8").trim().split(/\r?\n/);
  browserClient = new CdpClient(`ws://127.0.0.1:${port}${browserPath}`);
  const targets = await waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const records = await response.json();
      return records.some((record) => record.type === "page") ? records : null;
    } catch {
      return null;
    }
  }, 10000, "page debugging target");
  const pageTarget = targets.find((record) => record.type === "page");
  pageClient = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await pageClient.send("Runtime.enable");
  await pageClient.send("Page.enable");
  await waitFor(async () => {
    const result = await pageClient.send("Runtime.evaluate", { expression: "document.readyState", returnByValue: true });
    return result.result.value === "complete";
  }, 15000, "course page load");
  await waitFor(async () => {
    const result = await pageClient.send("Runtime.evaluate", {
      expression: "Boolean(window.ILOVEOS_WINDOWS_API_GUIDE?.families?.length && window.ILOVEOS_WINDOWS_API_FAMILY_DATA?.resolveParameterChoices && document.querySelector('#windows-api-filter'))",
      returnByValue: true,
    });
    return result.result.value === true;
  }, 15000, "Windows API guide initialization");

  const widths = [1440, 900, 500, 390];
  const sizes = ["small", "default", "large"];
  for (const width of widths) {
    for (const size of sizes) {
      await pageClient.send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
        screenWidth: width,
        screenHeight: 900,
      });
      const expression = `(${async function runLayoutCase(contentSize) {
        const wait = () => new Promise((resolve) => setTimeout(resolve, 80));
        const viewportWidth = window.innerWidth;
        document.documentElement.dataset.contentSize = contentSize;
        await wait();
        const guide = window.ILOVEOS_WINDOWS_API_GUIDE;
        const familyData = window.ILOVEOS_WINDOWS_API_FAMILY_DATA;
        const maximumVariantCount = Math.max(...guide.families.map((family) => family.variants.length));
        const maximumFamilies = guide.families.filter((family) => family.variants.length === maximumVariantCount);
        const mostVariants = maximumFamilies.sort((left, right) =>
          right.variants.reduce((count, variant) => count + variant.keyBehaviors.length, 0)
          - left.variants.reduce((count, variant) => count + variant.keyBehaviors.length, 0))[0];
        let longest = null;
        for (const family of guide.families) {
          for (const variant of family.variants) {
            for (const parameter of variant.parameters) {
              const resolved = familyData.resolveParameterChoices(parameter.choiceBinding, "native");
              if (resolved && (!longest || resolved.values.length > longest.resolved.values.length)) {
                longest = { family, variant, parameter, resolved };
              }
            }
          }
        }
        const dialog = document.querySelector("#api-detail-dialog");
        const filter = document.querySelector("#windows-api-filter");
        const open = async (family, variantName) => {
          if (dialog.open) dialog.querySelector(".api-dialog-close")?.click();
          filter.value = variantName;
          filter.dispatchEvent(new Event("input", { bubbles: true }));
          await wait();
          document.querySelector(`[data-windows-api-family="${family.id}"]`)?.click();
          await wait();
        };
        const withinViewport = (element) => {
          if (!element) return false;
          const rect = element.getBoundingClientRect();
          return rect.left >= -1 && rect.right <= viewportWidth + 1 && rect.width <= viewportWidth + 1;
        };
        const allWithin = (selector) => [...dialog.querySelectorAll(selector)].every(withinViewport);
        const lastSourceReachable = () => {
          const source = dialog.querySelector(".api-source-links a:last-child");
          const sourceRect = source?.getBoundingClientRect();
          const dialogRect = dialog.getBoundingClientRect();
          return Boolean(sourceRect && sourceRect.top >= dialogRect.top - 1 && sourceRect.bottom <= dialogRect.bottom + 1);
        };

        await open(mostVariants, mostVariants.recommendedVariant);
        const selector = dialog.querySelector(".api-family-variants");
        const contract = dialog.querySelector(".windows-contract-block");
        const selectorRect = selector?.getBoundingClientRect();
        const firstContentRect = contract?.getBoundingClientRect();
        const body = dialog.querySelector(".windows-api-dialog-body");
        const baseChecks = {
          dialogWithinViewport: withinViewport(dialog),
          headerWithinViewport: withinViewport(dialog.querySelector(".api-dialog-head")),
          selectorWithinViewport: withinViewport(selector),
          signaturesWithinViewport: allWithin(".windows-signature-grid, .windows-signature-grid > section, .signature-block pre"),
          parametersWithinViewport: allWithin(".parameter-list, .parameter-list > div"),
          behaviorWithinViewport: withinViewport(dialog.querySelector(".api-key-behaviors")),
          resultWithinViewport: withinViewport(dialog.querySelector(".windows-outcome-block .return-card")),
          cleanupWithinViewport: allWithin(".windows-outcome-block .return-card"),
          sourcesWithinViewport: withinViewport(dialog.querySelector(".api-source-links")),
          noPageHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
          variantTargetsAtLeast40: [...dialog.querySelectorAll(".api-variant-tab")].every((button) => button.getBoundingClientRect().height >= 39.5),
          selectorDoesNotOverlap: Boolean(selectorRect && firstContentRect && selectorRect.bottom <= firstContentRect.top + 1),
          codeContained: [...dialog.querySelectorAll("pre")].every((pre) => pre.scrollWidth <= pre.clientWidth + 1 || ["auto", "scroll"].includes(getComputedStyle(pre).overflowX)),
          popupUsesAvailableTextWidth: Boolean(body && contract && contract.getBoundingClientRect().width >= body.clientWidth * 0.88),
        };
        const switchedSources = {};
        for (const variant of mostVariants.variants) {
          dialog.querySelector(`[data-api-variant="${variant.name}"]`)?.click();
          await wait();
          dialog.scrollTop = dialog.scrollHeight;
          await wait();
          switchedSources[variant.name] = lastSourceReachable();
        }

        await open(longest.family, longest.variant.name);
        const owningRow = [...dialog.querySelectorAll(".parameter-list > div")]
          .find((row) => row.firstElementChild?.textContent.trim() === longest.parameter.name);
        const choices = owningRow?.querySelector(".api-parameter-choices");
        const longestChecks = {
          longestChoiceCount: longest.resolved.values.length,
          longestChoiceOwner: `${longest.variant.name}.${longest.parameter.name}`,
          choicesWithinViewport: withinViewport(choices) && [...choices.querySelectorAll(".api-choice-row")].every(withinViewport),
          choiceTargetsAtLeast40: [...choices.querySelectorAll(".api-choice-row")].every((row) => row.getBoundingClientRect().height >= 39.5),
          longestCodeContained: [...choices.querySelectorAll("code")].every((code) => code.scrollWidth <= code.clientWidth + 1 || getComputedStyle(code).overflowWrap === "anywhere"),
        };
        dialog.scrollTop = dialog.scrollHeight;
        await wait();
        longestChecks.longestSourceReachable = lastSourceReachable();
        longestChecks.noPageHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
        return { width: viewportWidth, contentSize, family: mostVariants.id, variantCount: maximumVariantCount, baseChecks, switchedSources, longestChecks };
      }})(${JSON.stringify(size)})`;
      const response = await pageClient.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
      const result = response.result.value;
      console.log(`${width}/${size}: ${JSON.stringify(result)}`);
      for (const [name, passed] of Object.entries(result.baseChecks)) {
        if (passed !== true) errors.push(`${width}/${size} ${name}: ${String(passed)}`);
      }
      for (const [name, passed] of Object.entries(result.switchedSources)) {
        if (passed !== true) errors.push(`${width}/${size} source unreachable after switching ${name}`);
      }
      for (const [name, passed] of Object.entries(result.longestChecks)) {
        if (["longestChoiceCount", "longestChoiceOwner"].includes(name)) continue;
        if (passed !== true) errors.push(`${width}/${size} ${name}: ${String(passed)}`);
      }
    }
  }
  console.log(`layout cases: 12`);
  console.log(`errors: ${errors.length}`);
  for (const error of errors) console.error(`ERROR ${error}`);
  if (errors.length) process.exitCode = 1;
} catch (error) {
  console.error(`ERROR ${error.message}`);
  if (stderr.trim()) console.error(stderr.trim().slice(-3000));
  process.exitCode = 1;
} finally {
  try { await browserClient?.send("Browser.close"); } catch { /* Edge may already be closing. */ }
  pageClient?.close();
  browserClient?.close();
  if (browserProcess && browserProcess.exitCode === null) {
    await Promise.race([
      new Promise((resolve) => browserProcess.once("exit", resolve)),
      delay(2000),
    ]);
  }
  if (browserProcess && browserProcess.exitCode === null) browserProcess.kill();
  if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) {
    try {
      fs.rmSync(tempDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch (error) {
      console.error(`ERROR could not remove temporary layout profile: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
