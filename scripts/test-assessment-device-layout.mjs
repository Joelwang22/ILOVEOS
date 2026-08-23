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
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browser = browserCandidates.find((candidate) => fs.existsSync(candidate));

if (!browser) {
  console.error("ERROR no supported Chromium browser found for the assessment device-layout test");
  process.exit(1);
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDevTools(profilePath) {
  const portPath = path.join(profilePath, "DevToolsActivePort");
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (fs.existsSync(portPath)) {
      try {
        const [port, browserPath] = fs.readFileSync(portPath, "utf8").trim().split(/\r?\n/);
        if (port && browserPath) return { port: Number(port), browserPath };
      } catch (error) {
        if (!["EBUSY", "ENOENT"].includes(error.code)) throw error;
      }
    }
    await delay(50);
  }
  throw new Error("Chromium did not expose a DevTools endpoint");
}

function openSocket(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener("open", () => resolve(socket), { once: true });
    socket.addEventListener("error", () => reject(new Error(`could not connect to ${url}`)), { once: true });
  });
}

function cdpClient(socket) {
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(`${message.error.code}: ${message.error.message}`));
    else resolve(message.result);
  });
  return {
    send(method, params = {}) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    }
  };
}

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-assessment-device-"));
const profilePath = path.join(tempDirectory, "profile");
const processHandle = spawn(browser, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--remote-debugging-port=0",
  `--user-data-dir=${profilePath}`,
  "about:blank"
], { stdio: "ignore" });

let socket;
try {
  const { port } = await waitForDevTools(profilePath);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find((item) => item.type === "page");
  if (!target?.webSocketDebuggerUrl) throw new Error("Chromium did not expose a page target");
  socket = await openSocket(target.webSocketDebuggerUrl);
  const client = cdpClient(socket);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844
  });
  const pageUrl = `${pathToFileURL(path.join(root, "index.html")).href}#/assessment/final`;
  await client.send("Page.navigate", { url: pageUrl });

  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const probe = await client.send("Runtime.evaluate", {
      expression: 'Boolean(document.querySelector(".assessment-page .assessment-order-actions"))',
      returnByValue: true
    });
    if (probe.result.value) {
      ready = true;
      break;
    }
    await delay(50);
  }
  if (!ready) throw new Error("assessment route did not render under device emulation");

  await client.send("Runtime.evaluate", { expression: 'document.documentElement.dataset.contentSize = "large"' });
  await delay(50);
  const evaluation = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const main = document.querySelector("#main-content");
      const mainRect = main.getBoundingClientRect();
      const options = document.querySelector(".assessment-options");
      const orderActions = document.querySelector(".assessment-order-actions");
      const visible = [...main.querySelectorAll("*")].filter((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.position !== "fixed" && !element.classList.contains("sr-only");
      });
      const overflowers = visible.filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < mainRect.left - 1 || rect.right > mainRect.right + 1);
      });
      const verticallyClipped = [...main.querySelectorAll("button, textarea, .assessment-activity, .assessment-practical-prompts label")]
        .filter((element) => element.scrollHeight > element.clientHeight + 1);
      return {
        innerWidth390: window.innerWidth === 390,
        media480: matchMedia("(max-width: 480px)").matches,
        media780: matchMedia("(max-width: 780px)").matches,
        oneColumnOptions: getComputedStyle(options).gridTemplateColumns.split(" ").length === 1,
        twoColumnOrderActions: getComputedStyle(orderActions).display === "grid" && getComputedStyle(orderActions).gridTemplateColumns.split(" ").length === 2,
        noDocumentOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        noMainOverflow: main.scrollWidth <= main.clientWidth,
        noElementOverflow: overflowers.length === 0,
        noVerticalClipping: verticallyClipped.length === 0
      };
    })()`,
    returnByValue: true
  });
  const results = evaluation.result.value;
  console.log(JSON.stringify(results));
  for (const [name, passed] of Object.entries(results)) {
    if (passed !== true) {
      console.error(`ERROR ${name}: ${String(passed)}`);
      process.exitCode = 1;
    }
  }
  await client.send("Browser.close");
} finally {
  if (socket?.readyState === WebSocket.OPEN) socket.close();
  for (let attempt = 0; attempt < 40 && processHandle.exitCode === null; attempt += 1) await delay(50);
  if (processHandle.exitCode === null) processHandle.kill();
  for (let attempt = 0; attempt < 20 && processHandle.exitCode === null; attempt += 1) await delay(50);
  if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) fs.rmSync(tempDirectory, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
}
