# Stage 8 Windows runtime validation

This ledger separates structural release evidence from Windows runtime evidence. A row is not passed until its command output, machine-dependent values, expected non-success branches, external-tool observations, and cleanup proof have actually been collected.

Use a disposable Windows 11 lab, a deliberate 64-bit CPython/pywin32 installation, and the lesson’s owned targets. Start with `node scripts/run-runtime-validation.mjs --check-environment --python <absolute-python.exe>`. The runner’s default is a read-only list. Only `--profile automated-safe` executes anything; operator-assisted and authorised-lab-only rows remain manual.

For each run, retain the interpreter path and pointer width, permissions/integrity, exact command, stable assertions, variable evidence (never fixed PIDs, addresses, timing, or module sets), expected failures, Sysinternals evidence, and cleanup proof. Multi-terminal event, pipe, mapping, and pipeline protocols must preserve the ordered output from every terminal. PE and WoW64 observations must identify both file and interpreter architecture.

Safety boundaries are mandatory: `access_check_lab.py` must execute against its disposable file rather than being certified by import; Registry writes are restricted to the reversible HKCU protocol; service state is captured and restored; token launch remains dry-run-only; and temporary files, processes, handles, mappings, and named objects are explicitly checked after execution.

The committed results file is an honest seed record. Pending means unexecuted or missing a named prerequisite; it never means implicitly passed. Timestamped runner output is written under ignored `validation/stage-8/results/` and must be reviewed before selected evidence is appended to the committed record.
