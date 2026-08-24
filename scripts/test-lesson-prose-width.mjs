import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const browser = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.PROGRAMFILES_X86 && path.join(process.env.PROGRAMFILES_X86, "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"),
].filter(Boolean).find((candidate) => fs.existsSync(candidate));

if (!browser) {
  console.error("ERROR no supported Chromium browser found for the lesson prose-width test");
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
    },
  };
}

const layouts = [
  { name: "wide-expanded", width: 1600, height: 1000, collapsed: false, mobile: false },
  { name: "wide-collapsed", width: 1600, height: 1000, collapsed: true, mobile: false },
  { name: "mobile-390", width: 390, height: 844, collapsed: false, mobile: true },
];
const contentSizes = ["small", "default", "large"];
const checks = ["leadUsesFullWidth", "paragraphUsesFullWidth", "listUsesFullWidth", "noDocumentOverflow"];

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "iloveos-lesson-prose-width-"));
const profilePath = path.join(tempDirectory, "profile");
const browserProcess = spawn(browser, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--remote-debugging-port=0",
  `--user-data-dir=${profilePath}`,
  "about:blank",
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

  const results = {};
  for (const layout of layouts) {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: layout.width,
      height: layout.height,
      deviceScaleFactor: 1,
      mobile: layout.mobile,
      screenWidth: layout.width,
      screenHeight: layout.height,
    });
    await client.send("Page.navigate", {
      url: `${pathToFileURL(path.join(root, "index.html")).href}#/lesson/cpu-architecture-data`,
    });

    let ready = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const probe = await client.send("Runtime.evaluate", {
        expression: "Boolean(document.querySelector('.lesson-lead') && document.querySelector('.learning-block > p') && document.querySelector('.learning-block > ul'))",
        returnByValue: true,
      });
      if (probe.result.value) {
        ready = true;
        break;
      }
      await delay(50);
    }
    if (!ready) throw new Error(`${layout.name}: lesson prose did not render`);

    await client.send("Runtime.evaluate", {
      expression: `document.body.classList.toggle("sidebar-collapsed", ${layout.collapsed})`,
    });
    await delay(250);

    for (const contentSize of contentSizes) {
      await client.send("Runtime.evaluate", {
        expression: `document.documentElement.dataset.contentSize = ${JSON.stringify(contentSize)}`,
      });
      await delay(50);
      const evaluation = await client.send("Runtime.evaluate", {
        expression: `(() => {
          const copy = document.querySelector(".lesson-copy");
          const lead = document.querySelector(".lesson-lead");
          const paragraph = document.querySelector(".learning-block > p");
          const list = document.querySelector(".learning-block > ul");
          const copyWidth = copy.getBoundingClientRect().width;
          const usesFullWidth = (element) => Math.abs(element.getBoundingClientRect().width - copyWidth) <= 1;
          return {
            leadUsesFullWidth: usesFullWidth(lead),
            paragraphUsesFullWidth: usesFullWidth(paragraph),
            listUsesFullWidth: usesFullWidth(list),
            noDocumentOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          };
        })()`,
        returnByValue: true,
      });
      for (const check of checks) {
        results[`${layout.name}/${contentSize}/${check}`] = evaluation.result.value?.[check] === true;
      }
    }
  }

  console.log(JSON.stringify(results));
  const failures = Object.entries(results).filter(([, passed]) => !passed);
  if (failures.length) {
    for (const [name] of failures) console.error(`ERROR ${name}: false`);
    process.exitCode = 1;
  }
} finally {
  socket?.close();
  browserProcess.kill();
  await delay(250);
  fs.rmSync(tempDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
