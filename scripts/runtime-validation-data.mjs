const files = [
  "access_check_lab.py", "cache_locality_lab.py", "cpu_priority_lab.py", "create_process_lab.py", "dacl_reader_lab.py",
  "deadlock_lab.py", "event_pair_lab.py", "explicit_load_lab.py", "file_lifetime_lab.py", "file_open_trace_lab.py",
  "heap_allocation_lab.py", "memory_map_csv_lab.py", "memory_provenance_lab.py", "module_baseline_lab.py", "module_lifetime_lab.py",
  "named_event_lab.py", "named_pipe_lab.py", "page_fault_lab.py", "party_lab.py", "pe_imports_lab.py", "pe_inspector_lab.py",
  "pipeline_lab.py", "prime_threads_lab.py", "privilege_state_lab.py", "process_access_lab.py", "process_inventory_lab.py",
  "race_counter_lab.py", "registry_views_lab.py", "semaphore_lab.py", "service_controller_lab.py", "service_inventory_lab.py",
  "shared_mapping_lab.py", "thread_io_lab.py", "thread_observer_lab.py", "thread_shutdown_lab.py", "thread_states_lab.py",
  "token_launch_lab.py", "token_summary_lab.py", "virtual_allocation_lab.py", "who_am_i.py", "wow64_views_lab.py",
];

const automatedCommands = {
  "access_check_lab.py": [],
  "cache_locality_lab.py": ["--mode", "sequential", "--mib", "4"],
  "prime_threads_lab.py": ["2000", "2"],
  "privilege_state_lab.py": [],
  "registry_views_lab.py": [],
  "token_summary_lab.py": [],
  "wow64_views_lab.py": [],
};

const authorised = new Set(["service_controller_lab.py", "token_launch_lab.py"]);
const multiTerminal = new Set(["event_pair_lab.py", "named_event_lab.py", "named_pipe_lab.py", "pipeline_lab.py", "shared_mapping_lab.py"]);
const architectureSensitive = new Set(["memory_map_csv_lab.py", "pe_imports_lab.py", "pe_inspector_lab.py", "wow64_views_lab.py"]);

function row(file) {
  const mode = file in automatedCommands ? "automated-safe" : authorised.has(file) ? "authorised-lab-only" : "operator-assisted";
  const base = file.replace(/\.py$/, "");
  return {
    id: base.replaceAll("_", "-"),
    file: `downloads/${file}`,
    mode,
    dependencies: ["Windows 11 clean lab", "64-bit CPython 3.14", ...(file === "access_check_lab.py" ? [] : ["pywin32 matching the interpreter architecture"])],
    interpreterArchitecture: architectureSensitive.has(file) ? "Run both 64-bit and 32-bit where available; record pointer width and PE/WoW64 differences." : "64-bit CPython required; record pointer width.",
    elevation: authorised.has(file) ? "Use elevation only in an authorised disposable lab and record the integrity level." : "Standard user; record and accept documented access-denied branches rather than elevating silently.",
    stableAssertions: ["The program starts under the declared interpreter.", "Documented invariant output is present.", "Every acquired resource reaches its cleanup path."],
    variableEvidence: ["PIDs, TIDs, handles, addresses, timing, module sets, service state, and machine-specific names are evidence, not fixed assertions."],
    expectedNonSuccessBranches: ["Access denied, unavailable object, timeout, architecture mismatch, and missing optional tools are recorded as expected branches when the lesson declares them."],
    cleanupAssertions: ["No owned handles, temporary files, child processes, mappings, named objects, services, or Registry values remain after the protocol."],
    externalEvidence: ["Capture the lesson-specified Process Explorer, Process Monitor, VMMap, WinObj, Handle, or other Sysinternals observation; mark not-collected rather than passed when absent."],
    commands: mode === "automated-safe"
      ? [{ executable: "{python}", args: [`{repo}/downloads/${file}`, ...automatedCommands[file]], timeoutMs: 60_000 }]
      : [{ executable: "{python}", args: [`{repo}/downloads/${file}`], execution: "operator-only; add the controlled arguments specified by operatorProtocol" }],
    operatorProtocol: multiTerminal.has(file) ? "Use the lesson's named multi-terminal order; preserve creator/waiter or producer/consumer output and close every terminal-owned object." : "Follow the lesson's controlled-target protocol and record pre-state, output, external evidence, and post-state.",
  };
}

export const runtimeValidationRows = files.map(row);

const byFile = new Map(runtimeValidationRows.map((item) => [item.file, item]));
byFile.get("downloads/access_check_lab.py").operatorProtocol = "Execute the script normally against its disposable temporary file. Never certify it with import-only execution; verify the temporary file and token handles are removed/closed.";
byFile.get("downloads/registry_views_lab.py").operatorProtocol = "The automated run is read-only. The optional --write-lab protocol must capture and restore any existing HKCU value/type and remove only a newly created empty lab key.";
byFile.get("downloads/service_controller_lab.py").operatorProtocol = "Capture the original service state, query first, require --confirm for a change, restore the exact original state, and prove it with a final query. Use only an authorised disposable service target.";
byFile.get("downloads/token_launch_lab.py").operatorProtocol = "Dry-run token duplication only: select a same-user owned PID, require output child process created=no, and prove all owned handles close. Do not add or execute CreateProcessAsUser.";
