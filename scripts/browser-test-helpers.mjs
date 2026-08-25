import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = path.resolve(scriptsDirectory, "..");

const browserCandidates = [
  process.env.ILOVEOS_BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.PROGRAMFILES_X86 && path.join(process.env.PROGRAMFILES_X86, "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"),
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

export function findBrowser() {
  return browserCandidates.find((candidate) => fs.existsSync(candidate));
}

export const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForDevTools(profilePath, processHandle) {
  const portPath = path.join(profilePath, "DevToolsActivePort");
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (processHandle.exitCode !== null) throw new Error(`Chromium exited before exposing DevTools (${processHandle.exitCode})`);
    if (fs.existsSync(portPath)) {
      try {
        const [port] = fs.readFileSync(portPath, "utf8").trim().split(/\r?\n/);
        if (port) return Number(port);
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
    socket.addEventListener("error", () => reject(new Error(`Could not connect to ${url}`)), { once: true });
  });
}

function createClient(socket) {
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
    },
  };
}

export async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Browser evaluation failed");
  }
  return result.result.value;
}

export async function waitFor(client, expression, message = "page condition", timeout = 10_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(client, `Boolean(${expression})`)) return;
    await delay(50);
  }
  throw new Error(`Timed out waiting for ${message}`);
}

export async function navigate(client, url, readyExpression = "document.readyState === 'complete' && Boolean(document.querySelector('#main-content')?.children.length)") {
  await client.send("Page.navigate", { url });
  await waitFor(client, readyExpression, url);
}

export async function setViewport(client, width, height = 1000, mobile = width <= 500) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
}

export async function pressKey(client, key, modifiers = 0) {
  const keyCode = key === "Escape" ? 27 : key === "Tab" ? 9 : key.length === 1 ? key.toUpperCase().charCodeAt(0) : 0;
  for (const type of ["keyDown", "keyUp"]) {
    await client.send("Input.dispatchKeyEvent", {
      type,
      key,
      code: key === "Escape" ? "Escape" : key === "Tab" ? "Tab" : `Key${key.toUpperCase()}`,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
      modifiers,
    });
  }
  await delay(40);
}

export function filePage(hash = "#/") {
  return `${pathToFileURL(path.join(repositoryRoot, "index.html")).href}${hash}`;
}

export async function withBrowser(callback, { width = 1280, height = 1000, mobile = width <= 500 } = {}) {
  const browser = findBrowser();
  if (!browser) throw new Error("No supported Chromium browser found");
  const tempRoot = path.resolve(os.tmpdir());
  const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-browser-test-"));
  const profilePath = path.join(tempDirectory, "profile");
  const processHandle = spawn(browser, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=0",
    `--user-data-dir=${profilePath}`,
    "about:blank",
  ], { stdio: "ignore" });
  let socket;
  try {
    const port = await waitForDevTools(profilePath, processHandle);
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const target = targets.find((item) => item.type === "page");
    if (!target?.webSocketDebuggerUrl) throw new Error("Chromium did not expose a page target");
    socket = await openSocket(target.webSocketDebuggerUrl);
    const client = createClient(socket);
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await setViewport(client, width, height, mobile);
    return await callback(client);
  } finally {
    if (socket?.readyState === WebSocket.OPEN) {
      try {
        const client = createClient(socket);
        await client.send("Browser.close");
      } catch (_) {
        socket.close();
      }
    }
    for (let attempt = 0; attempt < 40 && processHandle.exitCode === null; attempt += 1) await delay(50);
    if (processHandle.exitCode === null) processHandle.kill();
    for (let attempt = 0; attempt < 20 && processHandle.exitCode === null; attempt += 1) await delay(50);
    if (tempDirectory.startsWith(`${tempRoot}${path.sep}`)) {
      fs.rmSync(tempDirectory, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
    }
  }
}

export function reportChecks(checks) {
  console.log(JSON.stringify(checks));
  const failures = Object.entries(checks).filter(([, passed]) => passed !== true);
  for (const [name, value] of failures) console.error(`ERROR ${name}: ${JSON.stringify(value)}`);
  if (failures.length) process.exitCode = 1;
}
