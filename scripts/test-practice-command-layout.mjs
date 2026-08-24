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
  console.error("ERROR no supported Chromium browser found for the practice command-layout test");
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

const layouts = [
  { name: "desktop", width: 1440, height: 1000, mobile: false },
  { name: "compact", width: 900, height: 900, mobile: false },
  { name: "edge-minimum", width: 500, height: 800, mobile: false },
  { name: "mobile-390", width: 390, height: 844, mobile: true },
];
const contentSizes = ["small", "default", "large"];
const expectedChecks = [
  "commandVisible",
  "noDocumentOverflow",
  "noPracticeOverflow",
  "commandScrollContained",
  "copyButtonVisible",
  "copyTargetAtLeast40",
  "codeReadable",
  "checkpointVisible",
  "checkpointContained",
  "checkpointControlReachable",
  "checkpointFeedbackReadable",
];

const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = fs.mkdtempSync(path.join(tempRoot, "iloveos-practice-command-layout-"));
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
    const pageUrl = `${pathToFileURL(path.join(root, "index.html")).href}#/lesson/inspect-windows`;
    await client.send("Page.navigate", { url: pageUrl });

    let ready = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const probe = await client.send("Runtime.evaluate", {
        expression: 'Boolean(document.querySelector("[data-practice-command] pre code") && document.querySelector("[data-practice-checkpoint]"))',
        returnByValue: true,
      });
      if (probe.result.value) {
        ready = true;
        break;
      }
      await delay(50);
    }
    if (!ready) throw new Error(`${layout.name}: practice route did not render under device emulation`);

    for (const contentSize of contentSizes) {
      await client.send("Runtime.evaluate", {
        expression: `document.documentElement.dataset.contentSize = ${JSON.stringify(contentSize)}`,
      });
      await delay(50);
      const evaluation = await client.send("Runtime.evaluate", {
        expression: `(() => {
          const visible = (element) => Boolean(element && element.getClientRects().length && getComputedStyle(element).visibility !== "hidden");
          const practice = document.querySelector(".practice-workspace");
          const command = document.querySelector("[data-practice-command]");
          const pre = command?.querySelector("pre");
          const code = command?.querySelector("code");
          const copy = command?.querySelector("[data-copy-practice-command]");
          const checkpoint = document.querySelector("[data-practice-checkpoint]");
          const input = checkpoint?.querySelector("input");
          const checkButton = checkpoint?.querySelector("[data-checkpoint-check]");
          const feedback = checkpoint?.querySelector("[data-checkpoint-feedback]");
          if (input && !feedback?.textContent) {
            input.value = "Monitor";
            input.dispatchEvent(new Event("input", { bubbles: true }));
            checkButton?.click();
          }
          const practiceRect = practice?.getBoundingClientRect();
          const commandRect = command?.getBoundingClientRect();
          const preRect = pre?.getBoundingClientRect();
          const copyRect = copy?.getBoundingClientRect();
          const checkpointRect = checkpoint?.getBoundingClientRect();
          const controlRect = input?.getBoundingClientRect();
          const feedbackStyle = feedback && getComputedStyle(feedback);
          const codeStyle = code && getComputedStyle(code);
          const within = (inner, outer) => Boolean(inner && outer && inner.left >= outer.left - 1 && inner.right <= outer.right + 1);
          return {
            commandVisible: visible(command) && visible(code),
            noDocumentOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
            noPracticeOverflow: practice.scrollWidth <= practice.clientWidth,
            commandScrollContained: within(commandRect, practiceRect)
              && within(preRect, commandRect)
              && pre.scrollWidth >= pre.clientWidth
              && ["auto", "scroll"].includes(getComputedStyle(pre).overflowX),
            copyButtonVisible: visible(copy) && within(copyRect, commandRect),
            copyTargetAtLeast40: copyRect.width >= 40 && copyRect.height >= 40,
            codeReadable: Number.parseFloat(codeStyle.fontSize) >= 10 && Number.parseFloat(codeStyle.lineHeight) >= Number.parseFloat(codeStyle.fontSize) * 1.4,
            checkpointVisible: visible(checkpoint),
            checkpointContained: within(checkpointRect, practiceRect),
            checkpointControlReachable: visible(input) && visible(checkButton) && within(controlRect, checkpointRect),
            checkpointFeedbackReadable: visible(feedback)
              && feedback.textContent.includes("Correct")
              && Number.parseFloat(feedbackStyle.fontSize) >= 10
              && Number.parseFloat(feedbackStyle.lineHeight) >= Number.parseFloat(feedbackStyle.fontSize) * 1.4,
          };
        })()`,
        returnByValue: true,
      });
      for (const check of expectedChecks) {
        results[`${layout.name}/${contentSize}/${check}`] = evaluation.result.value?.[check] === true;
      }
    }
  }

  console.log(JSON.stringify(results));
  for (const [name, passed] of Object.entries(results)) {
    if (!passed) {
      console.error(`ERROR ${name}: false`);
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
