# Stage 8 Windows runtime validation

This ledger separates structural release evidence from Windows runtime evidence. A row is not passed until its command output, machine-dependent values, expected non-success branches, external-tool observations, and cleanup proof have actually been collected.

Use a disposable Windows 11 lab, a deliberate 64-bit CPython/pywin32 installation, and the lesson’s owned targets. Start with `node scripts/run-runtime-validation.mjs --check-environment --python <absolute-python.exe>`. The runner’s default is a read-only list. Only `--profile automated-safe` executes anything; operator-assisted and authorised-lab-only rows remain manual.

For each run, retain the interpreter path and pointer width, permissions/integrity, exact command, stable assertions, variable evidence (never fixed PIDs, addresses, timing, or module sets), expected failures, Sysinternals evidence, and cleanup proof. Multi-terminal event, pipe, mapping, and pipeline protocols must preserve the ordered output from every terminal. PE and WoW64 observations must identify both file and interpreter architecture.

Safety boundaries are mandatory: `access_check_lab.py` must execute against its disposable file rather than being certified by import; Registry writes are restricted to the reversible HKCU protocol; service state is captured and restored; token launch remains dry-run-only; and temporary files, processes, handles, mappings, and named objects are explicitly checked after execution.

The committed results file is an honest seed record. Pending means unexecuted or missing a named prerequisite; it never means implicitly passed. Timestamped runner output is written under ignored `validation/stage-8/results/` and must be reviewed before selected evidence is appended to the committed record.

## Release evidence recorded 25 August 2026

Commit `684e7cff73eebcf1a2145e0e3eb54648e2ac9664` passed Linux validation, Windows validation, exact-artifact build, GitHub Pages deployment, and post-deploy public verification in [workflow run 69](https://github.com/Joelwang22/ILOVEOS/actions/runs/32815828498). The deployed site is [ILOVEOS on GitHub Pages](https://joelwang22.github.io/ILOVEOS/).

The staged artifact contains 67 files. All 66 publicly retrievable files matched the deployment byte-for-byte; `.nojekyll` remains present as an artifact-only Pages marker. A separate live-browser pass against the deployed URL covered 704 route/viewport/text-size combinations, dialog lifecycle, global keyboard navigation, and all 41 download controls without a failure.

This release evidence closes the CI, deployment, public-byte, and live-browser portions of Stage 8. It does not convert unexecuted runtime rows into passes: 32 operator-assisted rows and two authorised-lab-only rows still require a disposable Windows 11 lab and their named Sysinternals, multi-terminal, controlled-target, architecture, service, or token evidence.
