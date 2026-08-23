import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const worktreesDirectory = path.join(root, ".worktrees");
const fixtureDirectory = path.join(worktreesDirectory, "audit-course-worktree-ignore-fixture");
const fixturePath = path.join(fixtureDirectory, "ignored.md");

assert.ok(fixtureDirectory.startsWith(`${worktreesDirectory}${path.sep}`), "fixture must stay inside .worktrees");

try {
  fs.mkdirSync(fixtureDirectory, { recursive: true });
  fs.writeFileSync(fixturePath, "ignored workflow ledger \u2014 not course content\n");
  const result = spawnSync(process.execPath, [path.join(scriptsDirectory, "audit-course.mjs")], {
    cwd: root,
    encoding: "utf8",
    timeout: 30000,
  });
  if (result.error) throw result.error;
  const output = `${result.stdout}${result.stderr}`;
  assert.equal(result.status, 0, `audit must ignore .worktrees fixtures:\n${output}`);
  assert.doesNotMatch(output, /audit-course-worktree-ignore-fixture/, "audit must not report the ignored worktree fixture");
  console.log("audit ignores worktree fixtures");
} finally {
  fs.rmSync(fixtureDirectory, { recursive: true, force: true });
}
