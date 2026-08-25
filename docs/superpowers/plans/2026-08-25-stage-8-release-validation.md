# Stage 8 Release Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before claiming a task complete.

**Goal:** Turn the final course audit into a repeatable release gate, close the identified accessibility and responsive-quality gaps, and leave an honest, complete validation record for all 41 downloadable Windows labs.

**Architecture:** Keep the dependency-free static site. Add focused headless-browser tests for user-visible behavior, small Node command-line tools for release staging and verification, and a machine-readable runtime manifest that separates safe automation from operator-assisted Windows observations. GitHub Actions validates on both Ubuntu and Windows, stages only public assets, deploys only after validation, and verifies the live Pages bytes after deployment.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js 22 standard library, headless Microsoft Edge/Chromium, CPython 3.14, pywin32, PowerShell, GitHub Actions and GitHub Pages.

**Spec:** `PLAN.md`, Stage 8: Clean-machine validation and release quality.

## Global Constraints

- Do not add supporting study pages or new learner-facing navigation.
- Do not run service mutations, persistent registry changes, token operations, or cross-process exercises automatically on an unverified personal machine.
- Treat timing, addresses, PIDs, module sets, service state, and architecture-dependent output as variable evidence, never fixed assertions.
- Every runtime record identifies stable assertions, expected non-success branches, cleanup, architecture, permissions, and required external-tool evidence.
- Preserve the dependency-free browser application and use only Node/Python standard-library tooling in the release gate.
- All production changes follow a demonstrated RED/GREEN cycle. Test-only coverage may characterize existing behavior, but must still exercise the real rendered site or executable tool.
- Keep generated validation output outside the committed public site.
- Stage only `index.html`, `.nojekyll`, index-linked local CSS/JavaScript, and `downloads/**` for GitHub Pages.
- Pull requests validate without Pages write permissions. Only validated `main` or manual workflow runs may deploy.
- After each reviewed task: commit on `codex/stage8-release-validation`, fast-forward `main`, push, wait for the exact commit's Pages run, and verify the public site before continuing.

---

### Task 1: Repair the global accessibility contract

**Files:**

- Create: `scripts/test-site-accessibility.mjs`
- Create: `scripts/test-global-keyboard-navigation.mjs`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`
- Modify: cache-key assertions in existing browser tests

- [ ] Write a browser test that fails because the search dialog/input/close button are not clearly named, active navigation lacks `aria-current`, and the mobile menu lacks `aria-controls`, initial focus, Escape close, and focus return.
- [ ] Write a browser/computed-style test that fails on the low-contrast `--muted-2` and code-comment colours and on ordinary interactive elements without an author-provided `:focus-visible` indicator.
- [ ] Run both tests and record the expected RED failures before changing production files.
- [ ] Give the search dialog and input explicit accessible names and name its close button as an action rather than only `Esc`.
- [ ] Make active-route state set exactly one appropriate `aria-current="page"` value.
- [ ] Connect the menu button to the sidebar with `aria-controls`; on narrow screens move focus into the opened navigation, close on Escape or scrim, prevent background interaction while open, and restore focus to the menu button. Preserve desktop sidebar behavior.
- [ ] Add a consistent high-contrast `:focus-visible` treatment without suppressing native focus on search results.
- [ ] Raise muted normal-text and code-comment colours to at least WCAG AA contrast against their actual dark backgrounds while retaining the established palette.
- [ ] Run the two new tests, every existing browser test, and `node scripts/audit-course.mjs`; record GREEN.

### Task 2: Add route-wide release-quality coverage

**Files:**

- Create: `scripts/test-content-size-controls.mjs`
- Create: `scripts/test-dialog-accessibility.mjs`
- Create: `scripts/test-course-responsive-matrix.mjs`
- Create: `scripts/test-diagram-accessibility-layout.mjs`
- Create: `scripts/test-search-download-coverage.mjs`
- Modify when a demonstrated failure requires it: `index.html`, `app.js`, `styles.css`, view/data files

- [ ] Add real-browser coverage that clicks Small/Default/Large, verifies exactly one `aria-pressed` state, persistence after reload, invalid-value fallback, and visible size changes across lesson, reference, toolbox, assessment, and diagram content.
- [ ] Add dialog lifecycle coverage for search, Windows API, pywin32 overview, and settings: accessible name, initial focus, Escape/backdrop close where applicable, modal Tab containment, scroll reachability, and focus return.
- [ ] Add a generated responsive matrix over all 62 lessons and every top-level route at 1440, 900, 500, and 390 CSS pixels with default and large text. Assert no page-level horizontal overflow, clipped primary controls, or invalid rendered reading order.
- [ ] Add diagram checks that every visual exposes a useful name and textual sequence/non-visual relationship, and that large-text diagrams remain contained at 390 pixels.
- [ ] Add search coverage generated from representative lesson concepts/outcomes, Windows APIs/constants/structures, pywin32 modules/features, and Sysinternals capabilities. Assert the expected result route and meaningful ranking for ambiguous queries.
- [ ] Serve a temporary local copy and fetch every practice download. Assert non-empty Python content, safe relative paths, accessible download names, and a minimum 40-pixel target on narrow screens.
- [ ] For each genuine failure, preserve the failing evidence, implement the smallest fix, and rerun the focused test before the whole suite.

### Task 3: Build and test the release tools

**Files:**

- Create: `scripts/test-release-tools.mjs`
- Create: `scripts/check-python-syntax.mjs`
- Create: `scripts/prepare-pages-artifact.mjs`
- Create: `scripts/verify-pages-assets.mjs`
- Create: `scripts/release-gate.mjs`
- Modify: `.gitignore`

- [ ] Write failing command-level tests using temporary fixtures for a missing Python interpreter, valid/invalid Python, index-linked assets, missing assets, path traversal, public-file exclusion, HTTP status failure, byte mismatch, and a successful local public verification.
- [ ] Implement Python discovery with an explicit override plus common Windows launcher/interpreter paths. Compile source text without importing downloads and without creating `__pycache__`.
- [ ] Implement artifact staging to a clean `_site` directory containing only `index.html`, optional `.nojekyll`, every local CSS/JavaScript asset referenced by the index, and all downloads. Reject missing, absolute, remote-as-local, or escaping paths.
- [ ] Implement public verification with bounded retry/backoff, 2xx requirements, cache-busting query parameters, and byte comparison for the index, every linked local asset, and every download.
- [ ] Implement one release-gate entry point that checks repository JavaScript syntax, runs the structural audit, executes sorted `test-*.mjs` scripts without recursively invoking itself, checks Python syntax, and optionally performs source-link/public checks.
- [ ] Ignore generated `_site/` and `validation/stage-8/results/` output.
- [ ] Run the tool tests RED then GREEN, stage a real `_site`, and verify its exact inventory.

### Task 4: Create the complete Windows runtime-validation ledger and safe runner

**Files:**

- Create: `scripts/runtime-validation-data.mjs`
- Create: `scripts/test-runtime-validation-data.mjs`
- Create: `scripts/run-runtime-validation.mjs`
- Create: `docs/stage-8-runtime-validation.md`
- Create: `docs/stage-8-runtime-results.json`

- [ ] Write a failing manifest test that requires every one of the 41 physical downloads exactly once and every one of the 55 lesson download references to resolve to a manifest row.
- [ ] Require each row to declare execution mode (`automated-safe`, `operator-assisted`, or `authorised-lab-only`), dependencies, interpreter architecture, elevation, stable assertions, variable evidence, non-success branches, cleanup assertions, Sysinternals/external evidence, and commands.
- [ ] Encode the audited boundaries: no import-only run of `access_check_lab.py`; reversible HKCU handling for registry writes; state capture/restoration for service control; dry-run-only token launch; explicit file cleanup; multi-terminal protocols for events, pipes, mappings, and pipelines; and architecture-sensitive PE/WoW64 observations.
- [ ] Implement `--list`, `--check-environment`, and `--profile automated-safe`. Default behavior must be read-only listing; actual execution requires an explicit profile and writes timestamped JSON results outside the public artifact.
- [ ] Add a human-readable operator protocol explaining setup, evidence fields, expected variable output, cleanup proof, and how to append results without pretending unrun cases passed.
- [ ] Seed the results JSON with the current host inventory and verified structural/browser evidence. Mark unexecuted clean-lab rows `pending`, including the exact missing prerequisite, rather than certifying them.
- [ ] Run the manifest test and the runner's non-executing modes; with the explicit 64-bit Python path, execute only the audited automated-safe profile and verify cleanup/results.

### Task 5: Gate GitHub Pages on validation

**Files:**

- Create: `scripts/test-pages-workflow.mjs`
- Modify: `.github/workflows/pages.yml`
- Modify: `scripts/audit-course.mjs`
- Create: `scripts/test-source-link-retries.mjs`
- Modify: `README.md`

- [ ] Write a failing workflow contract test that requires validation-only pull requests, Node 22, a complete Windows Edge test job, Python setup/syntax validation, an Ubuntu source-link job, `_site` artifact staging, deploy dependencies, scoped Pages permissions, and post-deploy byte verification.
- [ ] Write a failing source-link test proving transient network/429/5xx results receive bounded retries and exhausted failures remain release-blocking.
- [ ] Refactor source checking behind injectable request/timing functions, preserve existing behavior, and implement three bounded attempts without introducing an external package.
- [ ] Replace the one-job workflow with `validate-linux`, `validate-windows`, `build`, `deploy`, and `verify-public`. Keep pull requests validation-only and scope Pages/id-token permissions to deploy.
- [ ] Set up Node 22 and Python on Windows, run the full sorted browser suite plus syntax/runtime-manifest checks there, and run structural/JavaScript/source-link validation on Ubuntu.
- [ ] Build `_site` only after both validation jobs pass, deploy that directory, then verify the returned Pages URL against the exact commit.
- [ ] Document the local gate, prerequisites, safe runtime boundary, and CI/public verification in README without adding a learner-facing supporting page.
- [ ] Run workflow/source tests and all local non-network release checks.

### Task 6: Execute the final audit, publish, and record the truth

**Files:**

- Modify: `PLAN.md`
- Modify: `docs/stage-8-runtime-validation.md`
- Modify: `docs/stage-8-runtime-results.json`
- Modify when evidence exposes a defect: the smallest responsible production/test/runtime file

- [ ] Run JavaScript syntax, structural audit, all sorted tests, Python parsing, artifact inventory, runtime-manifest validation, and `git diff --check` locally.
- [ ] Run safe downloadable exercises with the explicit 64-bit CPython/pywin32 interpreter. Record stable output, machine-dependent values, expected failures, and cleanup for every executed row.
- [ ] Push the reviewed commit and wait for both validation platforms, Pages deployment, and public byte verification for that exact SHA.
- [ ] Check the live site at desktop, compact, and narrow widths for home, lessons, both API guides, toolbox, reviews, final assessment, dialogs, and download controls.
- [ ] Update the final validation record with exact commands, environment, commit, workflow URL/status, Pages URL, asset result, known platform limitations, and remaining operator-assisted clean-lab rows.
- [ ] Mark Stage 8 complete only if every plan bullet has evidence. If the clean Windows/Sysinternals matrix remains unexecuted, mark automated release quality complete and leave Stage 8 explicitly pending rather than making a false completion claim.
