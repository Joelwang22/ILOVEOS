import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { checkPythonSyntax, discoverPython } from "./check-python-syntax.mjs";
import { preparePagesArtifact } from "./prepare-pages-artifact.mjs";
import { verifyPagesAssets } from "./verify-pages-assets.mjs";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "iloveos-release-tools-"));
try {
  assert.throws(() => discoverPython(path.join(temp, "missing-python")), /unavailable/);
  const interpreter = discoverPython();
  const valid = path.join(temp, "valid.py");
  const invalid = path.join(temp, "invalid.py");
  fs.writeFileSync(valid, "print('valid')\n");
  fs.writeFileSync(invalid, "def broken(:\n");
  assert.equal(checkPythonSyntax([valid], interpreter), 1);
  assert.throws(() => checkPythonSyntax([invalid], interpreter), /SyntaxError/);
  assert.equal(fs.existsSync(path.join(temp, "__pycache__")), false);

  const fixture = path.join(temp, "fixture");
  fs.mkdirSync(path.join(fixture, "downloads"), { recursive: true });
  fs.writeFileSync(path.join(fixture, "index.html"), '<!doctype html><link rel="stylesheet" href="styles.css?v=1"><script src="app.js?v=1"></script>');
  fs.writeFileSync(path.join(fixture, "styles.css"), "body{}\n");
  fs.writeFileSync(path.join(fixture, "app.js"), "console.log('ok');\n");
  fs.writeFileSync(path.join(fixture, "downloads", "lab.py"), "print('lab')\n");
  fs.writeFileSync(path.join(fixture, "private.md"), "do not publish\n");
  const output = path.join(fixture, "_site");
  const inventory = preparePagesArtifact({ root: fixture, output });
  assert.deepEqual(inventory, ["app.js", "downloads/lab.py", "index.html", "styles.css"]);
  assert.equal(fs.existsSync(path.join(output, "private.md")), false);

  const missingFixture = path.join(temp, "missing");
  fs.mkdirSync(path.join(missingFixture, "downloads"), { recursive: true });
  fs.writeFileSync(path.join(missingFixture, "index.html"), '<script src="missing.js"></script>');
  assert.throws(() => preparePagesArtifact({ root: missingFixture, output: path.join(missingFixture, "_site") }), /Missing/);
  fs.writeFileSync(path.join(missingFixture, "index.html"), '<script src="../escape.js"></script>');
  assert.throws(() => preparePagesArtifact({ root: missingFixture, output: path.join(missingFixture, "_site") }), /escapes/);
  fs.writeFileSync(path.join(missingFixture, "index.html"), '<script src="/absolute.js"></script>');
  assert.throws(() => preparePagesArtifact({ root: missingFixture, output: path.join(missingFixture, "_site") }), /Unsafe/);
  fs.writeFileSync(path.join(missingFixture, "index.html"), '<script src="https://cdn.example.test/app.js"></script>');
  assert.throws(() => preparePagesArtifact({ root: missingFixture, output: path.join(missingFixture, "_site") }), /Unsafe/);

  let mode = "success";
  let transientRequests = 0;
  const server = http.createServer((request, response) => {
    const relative = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\/+/, "") || "index.html";
    if (mode === "status") return response.writeHead(404).end("missing");
    if (mode === "transient" && transientRequests++ < 2) return response.writeHead(503).end("retry");
    const file = path.join(output, ...relative.split("/"));
    if (!fs.existsSync(file)) return response.writeHead(404).end("missing");
    response.writeHead(200).end(mode === "mismatch" ? "wrong bytes" : fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  try {
    assert.equal(await verifyPagesAssets({ root: output, baseUrl, sleep: async () => {} }), inventory.length);
    mode = "transient";
    assert.equal(await verifyPagesAssets({ root: output, baseUrl, sleep: async () => {} }), inventory.length);
    mode = "status";
    await assert.rejects(() => verifyPagesAssets({ root: output, baseUrl, sleep: async () => {}, attempts: 2 }), /HTTP 404/);
    mode = "mismatch";
    await assert.rejects(() => verifyPagesAssets({ root: output, baseUrl, sleep: async () => {} }), /byte mismatch/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  console.log("Release tools: all fixture checks passed");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
