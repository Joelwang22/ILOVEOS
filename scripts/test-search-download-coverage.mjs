import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { delay, evaluate, navigate, repositoryRoot, setViewport, withBrowser } from "./browser-test-helpers.mjs";

const mimeTypes = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".py": "text/x-python" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidate = path.resolve(repositoryRoot, relative);
  if (!candidate.startsWith(`${repositoryRoot}${path.sep}`) || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": mimeTypes[path.extname(candidate)] || "application/octet-stream" });
  fs.createReadStream(candidate).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}/`;
const failures = [];
const downloads = new Map();

try {
  await withBrowser(async (client) => {
    await setViewport(client, 390, 1000, true);
    await navigate(client, `${baseUrl}#/`);
    const searchCases = [
      ["address translation", "/lesson/"],
      ["CreateProcessW", "/reference/windows-api"],
      ["WAIT_ABANDONED", "/reference/windows-api"],
      ["PROCESS_INFORMATION", "/reference/windows-api"],
      ["win32event", "/reference/pywin32"],
      ["Lower Pane", "/toolbox"],
    ];
    for (const [query, expectedHref] of searchCases) {
      await evaluate(client, `(() => {
        const trigger = document.querySelector('#search-trigger');
        if (!document.querySelector('#search-dialog').open) trigger.click();
        const input = document.querySelector('#search-input');
        input.value = ${JSON.stringify(query)};
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await delay(30);
      const results = await evaluate(client, `[...document.querySelectorAll('#search-results .search-result')].map((item) => ({ href: item.getAttribute('href'), text: item.textContent.trim() }))`);
      const expectedIndex = results.findIndex((item) => item.href.includes(expectedHref));
      if (expectedIndex < 0 || expectedIndex >= 10 || !results[0]?.text) failures.push({ type: "search", query, expectedHref, results: results.slice(0, 5) });
    }
    await evaluate(client, `document.querySelector('#search-dialog').close()`);

    const lessonIds = await evaluate(client, `window.ILOVEOS_LESSONS.map((item) => item.id)`);
    for (const lessonId of lessonIds) {
      await evaluate(client, `location.hash = ${JSON.stringify(`#/lesson/${lessonId}`)}`);
      await delay(18);
      const links = await evaluate(client, `[...document.querySelectorAll('.download-button')].map((item) => {
        const rect = item.getBoundingClientRect();
        return { href: item.getAttribute('href'), file: item.getAttribute('download'), name: item.getAttribute('aria-label') || item.textContent.trim(), width: rect.width, height: rect.height };
      })`);
      const names = new Set();
      for (const link of links) {
        if (!link.href || /^([a-z]+:|\/\/|\/)/i.test(link.href) || link.href.split(/[?#]/)[0].split("/").includes("..")) failures.push({ type: "unsafe-download-path", lessonId, link });
        if (!link.name || names.has(link.name) || link.height < 40 || link.width < 40) failures.push({ type: "download-accessibility", lessonId, link });
        names.add(link.name);
        downloads.set(link.href, link);
      }
    }
  });

  for (const [href] of downloads) {
    const response = await fetch(new URL(href, baseUrl));
    const source = await response.text();
    if (!response.ok || !source.trim() || !/\.py(?:[?#]|$)/i.test(href) || !/(import |def |print\(|if __name__)/.test(source)) {
      failures.push({ type: "download-response", href, status: response.status, bytes: Buffer.byteLength(source) });
    }
  }
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

console.log(JSON.stringify({ downloads: downloads.size, failures: failures.slice(0, 30) }));
if (downloads.size !== 41 || failures.length) {
  console.error(`ERROR expected 41 valid physical downloads and no coverage failures; found ${downloads.size} downloads and ${failures.length} failures`);
  process.exitCode = 1;
}
