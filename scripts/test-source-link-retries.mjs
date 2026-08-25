import assert from "node:assert/strict";
import { checkSourceLink } from "./source-link-check.mjs";

const item = { owner: "test lesson", url: "https://example.test/source" };
const response = (status, headers = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  body: null,
  headers: { get: (name) => headers[name.toLowerCase()] ?? null },
});
let calls = 0;
const delays = [];
const transient = [response(503), response(429, { "retry-after": "3" }), response(204)];
const recovered = await checkSourceLink(item, { request: async () => { calls += 1; return transient.shift(); }, sleep: async (delay) => delays.push(delay) });
assert.equal(recovered.status, 204);
assert.equal(calls, 3);
assert.deepEqual(delays, [2_000, 3_000]);
calls = 0;
const networkRecovered = await checkSourceLink(item, { request: async () => { calls += 1; if (calls === 1) throw new TypeError("offline"); return response(200); }, sleep: async () => {} });
assert.equal(networkRecovered.attempts, 2);
calls = 0;
await assert.rejects(() => checkSourceLink(item, { request: async () => { calls += 1; return response(500); }, sleep: async () => {} }), /HTTP 500/);
assert.equal(calls, 3);
calls = 0;
await assert.rejects(() => checkSourceLink(item, { request: async () => { calls += 1; return response(404); }, sleep: async () => {} }), /HTTP 404/);
assert.equal(calls, 1);
console.log("Source links: transient retries recover and exhausted failures block release");
