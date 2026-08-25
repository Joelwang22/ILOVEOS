import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listFiles } from "./prepare-pages-artifact.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = path.resolve(path.dirname(scriptPath), "..", "_site");
const defaultSleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetries(url, { fetchImpl, sleep, attempts }) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, { cache: "no-store", redirect: "follow" });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
      if (![429, 500, 502, 503, 504].includes(response.status)) break;
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await sleep(200 * 2 ** (attempt - 1));
  }
  throw lastError || new Error("Request failed");
}

export async function verifyPagesAssets({ root = defaultRoot, baseUrl, fetchImpl = fetch, sleep = defaultSleep, attempts = 3 } = {}) {
  if (!baseUrl) throw new Error("A public base URL is required");
  root = path.resolve(root);
  const files = listFiles(root);
  const failures = [];
  for (const relative of files) {
    const target = new URL(relative.split("/").map(encodeURIComponent).join("/"), baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    target.searchParams.set("release_verify", `${Date.now()}-${Math.random().toString(16).slice(2)}`);
    try {
      const response = await fetchWithRetries(target, { fetchImpl, sleep, attempts });
      const actual = Buffer.from(await response.arrayBuffer());
      const expected = fs.readFileSync(path.join(root, ...relative.split("/")));
      if (!actual.equals(expected)) failures.push(`${relative}: byte mismatch (${actual.length} public, ${expected.length} expected)`);
    } catch (error) {
      failures.push(`${relative}: ${error.message}`);
    }
  }
  if (failures.length) throw new Error(failures.join("\n"));
  return files.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf("--root");
  const urlIndex = args.indexOf("--url");
  const root = rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : defaultRoot;
  const baseUrl = urlIndex >= 0 ? args[urlIndex + 1] : process.env.ILOVEOS_PAGES_URL;
  try {
    const count = await verifyPagesAssets({ root, baseUrl });
    console.log(`Public Pages bytes verified: ${count} files`);
  } catch (error) {
    console.error(`ERROR ${error.message}`);
    process.exitCode = 1;
  }
}
