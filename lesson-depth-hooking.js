window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "hooking-injection": {
    apis: ["SetWindowsHookExW", "LoadLibraryExW", "GetProcAddress", "win32process.EnumProcessModules", "VirtualQueryEx"],
    phases: {
      learn: ["Classify the control-flow change", "Separate injection, hooking, cooperative extension, instrumentation, and unauthorized tampering."],
      windows: ["Locate the trust boundaries", "Connect process access, modules, executable memory, event paths, and security policy."],
      investigation: ["Build a safe casebook", "Classify evidence without modifying another process."],
      review: ["Check the mechanism model", "Test purpose, authorization, scope, persistence, redirection, and observable artifacts."]
    },
    learning: [
      { title: "Injection adds code or data to an execution context", paragraphs: ["Code injection is a family of mechanisms that causes code not originally present in a process's normal executable path to run in that process. It can involve a loaded module, generated code, instrumentation, a debugger, or raw executable bytes. The mechanism alone does not establish whether the use is legitimate.", "A documented plugin is cooperative extension: the host deliberately discovers, validates, loads, and calls an agreed interface. It can resemble module injection at the memory-layout level, but calling every plugin injection hides the most important difference, consent and a supported contract."], inlineCheck: ["What most clearly distinguishes a supported plugin from unauthorized injection?", ["Every plugin is signed", "The host defines and consents to the extension contract", "Plugins never load DLLs", "Plugins run in kernel mode"], 1, "A supported host contract defines discovery, compatibility, lifecycle, and authority."] },
      { title: "Hooking redirects an existing path", paragraphs: ["Hooking changes where a function call, message, event, or other control path goes. An IAT hook replaces one resolved import slot. A Windows message hook participates in a documented hook chain. A debugger breakpoint temporarily redirects execution through exception handling. These mechanisms have different scope and support guarantees.", "A hook often needs code already present in the process that will execute it, so some loading or injection mechanism may precede the redirection. The reverse is not required: loading a plugin does not necessarily redirect any existing operation."] },
      { title: "Technique, intent, and vulnerability are separate", paragraphs: ["Hooking and injection are not automatically vulnerabilities. Debuggers, profilers, accessibility software, compatibility systems, application performance monitoring, antimalware, game overlays, and malware can all alter execution. Authorization, user consent, target ownership, software policy, behavior, and impact determine acceptability.", "A vulnerability is a weakness that violates a security property. An attacker might exploit one to gain the rights needed for injection, but the injection API is not itself proof of the original weakness. Keep access acquisition and post-access technique separate in an investigation."] }
    ],
    visuals: [{ type: "flow", title: "Classify a runtime modification on three independent axes", items: [
      { meta: "Mechanism", label: "Load, generate, or redirect", detail: "What changed in memory or control flow?", linkAfter: "within" },
      { meta: "Scope", label: "Thread, module, process, desktop", detail: "Where can the change take effect?", linkAfter: "under" },
      { meta: "Authority", label: "Host contract and permissions", detail: "Who consented and what rights were used?", linkAfter: "produces" },
      { meta: "Evidence", label: "Modules, regions, threads, events", detail: "Facts that can be independently observed" }
    ], caption: "Intent cannot be inferred from one API name. Build the mechanism and authority record first." }],
    workedExamples: [{ type: "comparison", title: "Separate four commonly conflated cases", prompt: "Each case changes or observes execution, but not through the same contract.", columns: [
      { title: "Supported plugin", rows: [["Entry", "Host-controlled discovery"], ["Code", "Normal loaded module"], ["Redirection", "Only if the interface requires it"], ["Authority", "Documented application contract"]] },
      { title: "Debugger", rows: [["Entry", "Debug access and events"], ["Code", "Debugger plus target state"], ["Redirection", "Breakpoints and context control"], ["Authority", "User or operator debugging scope"]] },
      { title: "Unauthorized hook", rows: [["Entry", "Unapproved process access or startup path"], ["Code", "Foreign module or private executable region"], ["Redirection", "Call, message, or event path"], ["Authority", "Missing or exceeded"]] }
    ], shared: "All cases still need architecture compatibility, correct ABI, safe lifetime, and evidence-based attribution.", conclusion: "Name the mechanism and trust relationship rather than using injection as a universal label." }],
    windowsLearning: [
      { title: "Windows enforces object and platform boundaries", paragraphs: ["Cross-process actions begin with a process handle whose granted rights control querying, memory operations, and thread creation. Integrity levels, protected-process rules, AppContainer or capability policy, dynamic-code restrictions, Control Flow Guard, code integrity, architecture, and endpoint security can add constraints.", "Running elevated does not erase every boundary, and matching a PID does not identify a stable target by itself. Record image path, creation time, user, integrity, architecture, and protection context before interpreting access results."] },
      { title: "The evidence surface depends on the mechanism", paragraphs: ["A loaded DLL creates image-backed regions and module-list evidence. Generated or copied executable bytes can appear as MEM_PRIVATE. A hook may change an IAT slot, install a hook handle, alter a thread context, or leave only tool-specific telemetry. Process Explorer, VMMap, ListDLLs, Process Monitor, Sigcheck, Autoruns, and ETW answer different parts.", "WoW64 file-system redirection is a useful example of transparent behavior interposition, but it should not be treated as proof that every compatibility mechanism is implemented as an application-level hook. Use it to understand the outcome, then keep implementation claims bounded."] }
    ],
    practice: {
      title: "Create a modification casebook", time: "30 min", intro: "Classify supplied scenarios on paper and use only read-only evidence tools.",
      expectedOutcome: "Each case should identify mechanism, scope, authorization, persistence, expected module or memory form, redirected path if any, evidence sources, benign explanations, concerning explanations, and missing facts.",
      safety: "Do not attach to, modify, hook, inject into, or terminate third-party processes. Use static descriptions and processes you own for read-only observation.",
      steps: [
        { action: "Classify a debugger breakpoint, signed application plugin, accessibility hook, JIT code region, and unauthorized credential hook.", why: "The cases force mechanism and intent to remain separate.", observe: "Some add code without hooking, while others redirect an event path." },
        { action: "For each case, state the narrowest thread, module, process, desktop, or system scope supported by the facts.", why: "The phrase hooks Windows is too broad to investigate.", observe: "Unknown scope must remain unknown rather than being promoted to global." },
        { action: "Choose two evidence sources and one blind spot for each.", why: "No single tool proves code origin, runtime behavior, and authority together.", observe: "Distinguish a module snapshot from a time-based load trace." },
        { action: "Write a verdict using observed facts, interpretation, alternatives, and missing evidence.", why: "A defensive conclusion must expose uncertainty.", observe: "Do not label a private executable page malicious without provenance and behavior." }
      ],
      hints: [{ title: "Every case is classified as injection", body: "Ask whether the host deliberately loaded an extension, whether code was merely generated in the same process, and whether an existing path was actually redirected." }],
      cleanup: ["Close read-only inspection tools.", "The exercise creates no persistent hook, process change, or startup entry."],
      extension: { title: "Independent variation", prompt: "Classify an application performance monitoring agent and identify what evidence would distinguish a supported deployment from an unauthorized look-alike." }
    },
    checks: [
      ["Is every plugin best described as unauthorized code injection?", ["Yes", "No", "Only on x64", "Only if signed"], 1, "A supported plugin follows the host's intentional extension contract."],
      ["Does one call to a cross-process API prove malicious intent?", ["Yes", "No", "Only when elevated", "Only from Python"], 1, "Purpose, authority, target, surrounding events, and behavior must be correlated."],
      ["What does hooking change most directly?", ["An existing control or event path", "The CPU's core count", "Every file signature", "A user's SID"], 0, "Hooking redirects a call, message, event, or related path."]
    ]
  },

  "startup-code-loading": {
    apis: ["LoadLibraryExW", "SetDefaultDllDirectories", "AddDllDirectory", "GetModuleFileNameW", "win32process.EnumProcessModules", "Sigcheck"],
    phases: {
      learn: ["Trace startup loading", "Connect declared imports, search policy, architecture, loader state, and initialization."],
      windows: ["Verify the selected module", "Use static imports, image-load events, paths, hashes, and signatures as separate evidence."],
      investigation: ["Audit a controlled load", "Observe one owned executable or explicit load without weakening system policy."],
      review: ["Check startup reasoning", "Test import resolution, search order, DllMain constraints, signatures, and safe extension."]
    },
    learning: [
      { title: "Implicit dependencies are resolved before ordinary application code", paragraphs: ["The loader maps the executable, reads its import directory, locates each required DLL under the active loader policy, maps matching-architecture images, resolves imported symbols, applies relocations where needed, and completes initialization before the executable reaches its normal entry point.", "Adding an import descriptor to a copy of an executable can therefore cause another DLL to load during startup. That is a binary-format experiment, not a recommended production plugin design. The modified file has a new hash and any original Authenticode signature normally no longer verifies."], inlineCheck: ["What evidence proves a DLL was declared as an implicit dependency?", ["The static import directory", "A process title", "A Registry root", "A CPU wait state"], 0, "The import directory records the declared DLL and symbols."] },
      { title: "DLL selection is a policy, not one universal directory rule", paragraphs: ["The lecture shortcut that a DLL in the executable directory always takes precedence is unsafe and incomplete. Known DLL handling, packaged-application rules, API sets, loaded-module reuse, Safe DLL Search Mode, altered search paths, LOAD_LIBRARY_SEARCH flags, and absolute paths can change selection.", "Use trusted application packaging, SetDefaultDllDirectories, AddDllDirectory, LoadLibraryEx with explicit search flags, and absolute paths where the contract permits. Never demonstrate search-order weakness by dropping look-alike system DLLs into ordinary application folders."] },
      { title: "DllMain is a constrained notification point", paragraphs: ["The loader can call a DLL entry point for process and thread attach or detach notifications. DllMain runs while loader coordination is active and should do minimal work. Waiting on threads, loading additional libraries unpredictably, invoking complex COM or user-interface paths, or acquiring locks in conflicting order can deadlock startup.", "A supported plugin should expose an explicit initialization and shutdown contract invoked by the host after loading. This gives failures, version checks, threading, logging, and cleanup a safer place than DllMain."] }
    ],
    visuals: [{ type: "flow", title: "Follow one implicit dependency into a running process", items: [
      { meta: "On disk", label: "PE import descriptor", detail: "DLL name and imported symbols", linkAfter: "resolve under" },
      { meta: "Policy", label: "Architecture and search rules", detail: "Known DLLs, paths, flags, API sets", linkAfter: "map" },
      { meta: "Loader", label: "Image, relocations, imports", detail: "Dependency graph and constrained initialization", linkAfter: "observe" },
      { meta: "Evidence", label: "Module path, hash, signature", detail: "Static declaration plus runtime load" }
    ], caption: "A matching basename is not enough. The selected path and bytes establish which module actually entered the process." }],
    workedExamples: [{ type: "trace", title: "Audit a startup module claim", prompt: "A process unexpectedly contains helper.dll after an executable copy was modified.", steps: [
      { title: "Establish file state", action: "Hash the executable and DLL copies, record architecture, and preserve original hashes.", why: "Binary modification and replacement must remain attributable.", result: "The exact lab inputs are fixed." },
      { title: "Inspect declaration", action: "Read the executable import table and locate helper.dll plus imported symbols.", why: "Static metadata proves the dependency request.", result: "Startup intent is visible without execution." },
      { title: "Observe resolution", action: "Capture Image Load and record the complete selected DLL path.", why: "Search policy chooses a file, not only a basename.", result: "The runtime module is identified." },
      { title: "Verify provenance", action: "Compare hash and signature status, then explain supported-plugin alternatives.", why: "Loaded does not mean trusted or compatible.", result: "The report separates mechanism from deployment quality." }
    ], conclusion: "Use static imports, runtime path, and file provenance together." }],
    windowsLearning: [
      { title: "The repository how_to_load exercise is a controlled import-table lesson", paragraphs: ["The earlier linking module teaches RVA translation, import descriptors, thunks, architecture, loader resolution, and file-to-memory layout. This lesson reuses that model to explain startup code loading rather than repeating the binary construction steps.", "Keep the supplied x86 artifacts isolated, work only on copies, and do not transplant the technique into signed or third-party binaries. The learning outcome is to predict loader behavior and evidence, not to create a persistence method."] },
      { title: "Startup extension mechanisms have different support levels", paragraphs: ["Application plugin APIs, COM registration, shell extensions, debuggers, compatibility shims, and legacy AppInit behavior can all cause code to appear in processes under different contracts. Some are documented extensibility; others are compatibility features with security restrictions or poor suitability for new design.", "AppInit_DLLs is legacy, depends on user32 loading, and is restricted by code-signing and Secure Boot related policy on modern Windows. Autoruns is useful for auditing extension and persistence locations, not a checklist of safe places to add code."] }
    ],
    codeWalkthroughs: [{ title: "Load one trusted system DLL with an explicit contract", intro: "The existing starter demonstrates normal in-process loading, typed export resolution, and matching release.", stages: [
      { title: "Choose a trusted absolute path", explanation: "The lab constructs System32\\user32.dll rather than relying on the current directory.", code: "dll_path = Path(os.environ[\"SystemRoot\"]) / \"System32\" / \"user32.dll\"\nmodule = kernel32.LoadLibraryW(str(dll_path))" },
      { title: "Resolve a typed export", explanation: "GetProcAddress returns an address, and WINFUNCTYPE defines the ABI before Python calls it.", code: "address = kernel32.GetProcAddress(module, b\"MessageBoxW\")\nmessage_box = MESSAGE_BOX_W(address)" },
      { title: "Release the owned reference", explanation: "The LoadLibrary call created a reference that this code must match with FreeLibrary after no callback can use it.", code: "try:\n    result = message_box(None, text, title, MB_OK)\nfinally:\n    if not kernel32.FreeLibrary(module):\n        raise ctypes.WinError(ctypes.get_last_error())" }
    ] }],
    practice: {
      title: "Compare declared and observed module loading", time: "40 min", intro: "Use the existing explicit-load starter and a controlled executable you own.",
      download: ["downloads/explicit_load_lab.py", "explicit_load_lab.py"],
      expectedOutcome: "The process should load user32.dll from the trusted Windows system path, resolve MessageBoxW, display its module path and address, then release its explicit reference. Process Monitor and Process Explorer should agree on the selected path.",
      safety: "Do not modify system DLLs, search policy, application directories, signed third-party binaries, AppInit settings, shell extensions, or startup entries.",
      steps: [
        { action: "Read the starter and identify path selection, HMODULE ownership, export prototype, and release point.", why: "The lab is safe because its loader contract is explicit.", observe: "The absolute module path should remain within the Windows system directory." },
        { action: "Capture the load with Process Monitor Image Load events and inspect the module in Process Explorer.", why: "A time trace and a snapshot corroborate different facts.", observe: "Record PID, full path, load time, architecture, and signature status." },
        { action: "Run the PE inspector on the Python executable and compare implicit imports with the explicit call.", why: "Explicit loading need not appear in the main executable's static import list.", observe: "Runtime presence and static declaration are distinct." },
        { action: "Explain how a host-managed plugin interface would add version, initialization, error, and removal contracts.", why: "Normal loading is only one component of extensibility.", observe: "DllMain should not become the full plugin API." }
      ],
      hints: [{ title: "The module remains visible after FreeLibrary", body: "Another dependency or earlier load may already own a reference. FreeLibrary releases only this call's ownership and does not promise immediate unmapping when other references remain." }],
      cleanup: ["Close the message box and let the starter release its LoadLibrary reference.", "Close observation tools without changing loader or Autoruns configuration."],
      extension: { title: "Independent variation", prompt: "Replace the convenience LoadLibrary call with LoadLibraryExW and document the exact LOAD_LIBRARY_SEARCH flags, path assumptions, and matching cleanup." }
    },
    checks: [
      ["Does the executable directory always win every DLL lookup?", ["Yes", "No", "Only for Python", "Only when elevated"], 1, "DLL resolution depends on the active loader policy and module class."],
      ["What normally happens to an existing Authenticode signature after PE bytes are modified?", ["It continues to verify unchanged", "Verification normally fails", "It becomes a process token", "It changes architecture"], 1, "The signed byte digest no longer matches."],
      ["Where should substantial plugin initialization occur?", ["In a host-invoked explicit function", "Only in DllMain", "Inside GetLastError", "In the IAT name field"], 0, "An explicit post-load contract avoids loader-lock constraints."]
    ]
  },

  "remote-memory-threads": {
    apis: ["win32api.OpenProcess", "win32process.VirtualAllocEx", "win32process.WriteProcessMemory", "win32process.CreateRemoteThread", "win32process.VirtualFreeEx", "VirtualQueryEx"],
    phases: {
      learn: ["Model the cross-process chain", "Track rights, remote state, architecture, execution, and cleanup without building a payload."],
      windows: ["Correlate defensive evidence", "Relate handles, private pages, protection, thread starts, mitigations, and provenance."],
      investigation: ["Survey memory provenance", "Inspect only the current lab process and build a detection timeline."],
      review: ["Check remote-operation reasoning", "Test access, address spaces, architecture, mitigations, evidence, and uncertainty."]
    },
    learning: [
      { title: "Cross-process memory is an object-rights workflow", paragraphs: ["A caller first identifies a stable target and opens a process handle with rights appropriate to the next operation. Remote reservation or commitment requires process memory-operation access. Writing requires write and operation rights. Creating a remote thread requires its documented access combination and a valid target start address.", "Requesting PROCESS_ALL_ACCESS hides the contract and can fail where a narrower diagnostic request succeeds. A defensive timeline should retain the requested and granted access, source and target identity, allocation address and type, write size, protection, execution start, exit, release, and handle close."], inlineCheck: ["Why record the requested process access mask?", ["It reveals the attempted authority", "It determines the target username", "It replaces the PID", "It proves the payload bytes"], 0, "The access mask is part of the security-relevant operation contract."] },
      { title: "An address belongs to one process context", paragraphs: ["VirtualAllocEx returns an address meaningful in the target process. A local pointer to a buffer, function, or DLL does not become a remote pointer simply because both values fit in an integer. ASLR, architecture, loader state, and module versions affect addresses.", "CreateRemoteThread expects a start routine that follows the target ABI and remains valid for the thread lifetime. Copying a local function address or raw Python callback is not a valid cross-process design. This course stops at the resource and evidence model rather than constructing executable remote bytes."] },
      { title: "Modern mitigations make the simple lecture chain incomplete", paragraphs: ["DEP page protections, Control Flow Guard, Arbitrary Code Guard or dynamic-code policy, process protection, code integrity, architecture mismatch, and endpoint security can block or flag steps. A writable allocation is not automatically executable, and changing protection creates additional evidence and risk.", "A debugger or profiler may perform legitimate cross-process reads, writes, and thread control. A suspicious conclusion needs source authority, target relationship, memory provenance, start address, signature and module context, frequency, and behavior."] }
    ],
    visuals: [{ type: "flow", title: "Correlate the remote-operation chain without executing it", items: [
      { meta: "Source", label: "Process handle and granted rights", detail: "Stable source and target identity", linkAfter: "changes" },
      { meta: "Target memory", label: "Allocation, bytes, protection", detail: "Address, size, MEM_PRIVATE or image", linkAfter: "may lead to" },
      { meta: "Execution", label: "Thread start and lifetime", detail: "Start address, owner process, exit", linkAfter: "evaluate with" },
      { meta: "Context", label: "Mitigations and provenance", detail: "Architecture, signer, purpose, policy" }
    ], caption: "No single box proves injection. The relationship and sequence make the event defensively meaningful." }],
    workedExamples: [{ type: "contract", title: "Translate the API names into owned resources", prompt: "A monitoring rule observes a source process touching a purpose-built target.", steps: [
      { title: "OpenProcess", action: "Source obtains one process handle with a recorded access mask.", why: "The handle is the capability used by later calls.", result: "Local owned handle, no target bytes changed yet." },
      { title: "VirtualAllocEx", action: "Target gains a region with base, size, state, type, and protection.", why: "Remote address and allocation ownership belong to the target context.", result: "Target memory state changes." },
      { title: "Write and protect", action: "Bytes and possibly page protection change under separate rights and results.", why: "Write success, byte count, and executable state are distinct facts.", result: "Content and access policy have evidence." },
      { title: "Execution and cleanup", action: "A start mechanism, completion wait, remote free, and local handle close each need outcomes.", why: "Partial failure can leave a thread, region, or handle alive.", result: "The complete lifecycle can be audited." }
    ], conclusion: "Model every state transition and owner, including branches where a later step never occurs." }],
    windowsLearning: [
      { title: "Memory type improves provenance analysis", paragraphs: ["MEM_IMAGE regions come from mapped executable images and can be tied to a file and PE sections. MEM_MAPPED regions have section backing but are not necessarily executable images. MEM_PRIVATE regions belong to private allocations. Executable MEM_PRIVATE pages are noteworthy but common in JIT runtimes and some instrumentation.", "VMMap provides a rich classification. VirtualQueryEx provides region state, protection, type, base, allocation base, and size. Process Explorer thread start addresses and loaded modules help determine whether execution begins inside a known image."] },
      { title: "Tool coverage has gaps", paragraphs: ["Process Monitor is strong for process, thread, image-load, file, and Registry timing but is not a complete remote-memory-write tracer. Process Explorer and VMMap are snapshots. ETW providers, Windows security products, debuggers, or purpose-built telemetry may expose additional access and memory events.", "A report should state what was not captured. Absence from Process Monitor does not prove no cross-process write occurred, and a module list does not expose raw private executable code."] }
    ],
    practice: {
      title: "Build a read-only memory provenance survey", time: "35 min", intro: "The starter queries only its own address space and never writes or changes protection.",
      download: ["downloads/memory_provenance_lab.py", "memory_provenance_lab.py"],
      expectedOutcome: "The report should count committed MEM_IMAGE, MEM_MAPPED, and MEM_PRIVATE regions, list executable regions, and show that image-backed and private executable memory are different provenance categories. Addresses and counts vary by Python build.",
      safety: "The starter refuses external PIDs and performs no allocation, write, protection change, thread creation, or code execution.",
      steps: [
        { action: "Read the MEMORY_BASIC_INFORMATION layout and VirtualQuery prototype before running.", why: "Pointer width, SIZE_T, and zero-return handling are core ABI requirements.", observe: "Confirm the queried process handle is GetCurrentProcess only." },
        { action: "Run the survey and group committed regions by type and executable protection.", why: "This establishes the vocabulary used in defensive triage.", observe: "Expect normal image-backed executable regions and possibly runtime-dependent private ones." },
        { action: "Pause the starter and compare its region summary with VMMap.", why: "The tools classify related evidence at different levels.", observe: "Explain differences rather than demanding identical labels or counts." },
        { action: "Write a hypothetical correlation timeline for a new private executable region and thread start.", why: "The lab provides evidence structure without creating suspicious state.", observe: "Include at least two benign alternatives and missing telemetry." }
      ],
      hints: [{ title: "The region totals differ from VMMap", body: "VirtualQuery reports raw regions, while VMMap groups and labels allocations using additional rules. Compare address ranges and types before comparing category totals." }],
      cleanup: ["Press Enter to let the self-querying process exit.", "No remote process or persistent state is changed."],
      extension: { title: "Independent variation", prompt: "Add read-only module-range correlation inside the current process and label executable regions that fall within a known loaded image." }
    },
    checks: [
      ["Is an executable MEM_PRIVATE region conclusive proof of malware?", ["Yes", "No", "Only on x86", "Only in Python"], 1, "JIT engines and legitimate instrumentation can create private executable memory."],
      ["Can a local function pointer be assumed valid in another process?", ["Yes", "No", "Only if decimal", "Only with a PID"], 1, "Addresses are interpreted within a process's own mappings and ABI context."],
      ["Does Process Monitor capture every remote memory write?", ["Yes", "No", "Only for DLLs", "Only when signed"], 1, "Its standard event surface is not a complete memory-write audit trail."]
    ]
  },

  "position-independent-code": {
    apis: ["LoadLibraryExW", "GetProcAddress", "RtlAddFunctionTable", "FlushInstructionCache", "VirtualQueryEx", "PE base relocations"],
    phases: {
      learn: ["Account for loader services", "Trace addresses, imports, relocations, data, TLS, unwind metadata, and ABI assumptions."],
      windows: ["Read the binary evidence", "Use PE directories and disassembly to distinguish supported images from raw code."],
      investigation: ["Audit relocation assumptions", "Inspect an owned PE file and stop before copying executable bytes."],
      review: ["Check position independence", "Test relative addressing, dependencies, architecture, metadata, and safer alternatives."]
    },
    learning: [
      { title: "Ordinary compiled code depends on more than its instruction bytes", paragraphs: ["A compiled function can refer to global variables, string literals, import thunks, helper routines, security cookies, thread-local storage, exception or unwind metadata, and alignment assumptions. A PE image supplies sections and directories that let the loader establish those dependencies.", "Copying the bytes of one function to another address omits everything not embedded in that byte range. Even if the first instruction runs, a later relative branch, data reference, stack-unwind event, or imported call can fail."], inlineCheck: ["What does a raw function-byte copy normally omit?", ["Only its source filename", "External data and loader-managed dependencies", "The target PID only", "All arithmetic instructions"], 1, "The function can depend on state and metadata outside the copied range."] },
      { title: "Position independence is architecture and representation specific", paragraphs: ["Position-independent code calculates needed addresses relative to the current instruction, a supplied context, or another relocatable base. x64 commonly uses RIP-relative addressing, and self-contained literals can be stored near code and reached relatively. The lecture statement that position-independent code cannot use strings is therefore too absolute.", "The real restriction is uncorrected location assumptions. A literal, table, or helper can work if it is included in the self-contained layout and addressed under a valid relative contract. External globals and imports still need a resolution strategy."] },
      { title: "The loader supplies relocation and runtime metadata", paragraphs: ["When an image cannot use its preferred base, base-relocation entries identify address-dependent locations the loader can adjust. The import directory supplies names and thunks for external resolution. TLS directories, load configuration, exception tables, and section protections provide other runtime contracts.", "On x64, dynamically generated functions that can participate in stack unwinding may need function-table registration such as RtlAddFunctionTable. After producing or modifying native instructions, the documented contract may require FlushInstructionCache before execution. These details reinforce why a normal DLL or supported plugin is safer than raw code placement."] }
    ],
    visuals: [{ type: "layers", title: "What a normal PE image brings beyond raw instructions", items: [
      { meta: "Code and data", label: "Sections with relative layout", detail: "Instructions, constants, globals, protections", linkAfter: "described by" },
      { meta: "Resolution", label: "Imports and relocations", detail: "External symbols and base-dependent fields", linkAfter: "supported by" },
      { meta: "Runtime", label: "TLS, unwind, load configuration", detail: "Thread data, exceptions, mitigations", linkAfter: "establish" },
      { meta: "Execution", label: "Valid ABI and lifetime", detail: "Stack, calling convention, code ownership" }
    ], caption: "A byte sequence contains instructions. An image supplies the broader contract needed to run them reliably." }],
    workedExamples: [{ type: "comparison", title: "Compare a loaded DLL and a copied function", prompt: "Both contain native instructions, but only one follows the image-loading contract.", columns: [
      { title: "Loaded DLL", rows: [["Addressing", "Relocations applied when needed"], ["Imports", "Resolved into IAT"], ["Data", "Mapped sections"], ["Exceptions", "Image unwind metadata"], ["Lifecycle", "Loader reference and explicit exports"]] },
      { title: "Copied bytes", rows: [["Addressing", "Only self-contained calculations remain valid"], ["Imports", "No automatic resolution"], ["Data", "Only deliberately included layout"], ["Exceptions", "No automatic registration"], ["Lifecycle", "Custom ownership and synchronization"]] }
    ], shared: "Both must match architecture, calling convention, stack alignment, security policy, and target lifetime.", conclusion: "Prefer the standard image contract unless raw generated code is an intentional, reviewed runtime requirement." }],
    windowsLearning: [
      { title: "Static PE inspection reveals loader expectations", paragraphs: ["Inspect the import, base-relocation, exception, TLS, and load-configuration directories. Translate each RVA through the section table and check file bounds. An absent directory can be valid, but its absence changes what the image can safely rely on.", "A disassembler can identify RIP-relative x64 operands and absolute embedded addresses. One instruction view is not enough to prove a function is movable, because data and control dependencies can extend beyond the visible block."] },
      { title: "Memory type supports the distinction", paragraphs: ["A normally loaded DLL appears in MEM_IMAGE regions whose ranges and protections derive from PE sections. Raw generated or copied code generally appears in MEM_PRIVATE or a non-image mapping. VMMap and VirtualQuery expose this difference, though packers, manual loaders, and advanced runtimes complicate interpretation.", "Do not turn this lesson into a payload-construction exercise. The learning target is to predict failure dependencies and defensive artifacts, then choose a loader-supported alternative."] }
    ],
    practice: {
      title: "Audit one PE file's movable-code assumptions", time: "35 min", intro: "Use the static PE starter on Python or another owned executable and record metadata only.",
      download: ["downloads/pe_inspector_lab.py", "pe_inspector_lab.py"],
      expectedOutcome: "The report should identify architecture, image base, entry RVA, sections, and permissions. Your manual audit should also locate import and relocation directories with a PE viewer and explain at least three dependencies raw function bytes would lose.",
      steps: [
        { action: "Inspect architecture, image base, entry point, and section protections.", why: "Position and execution assumptions begin with the image layout.", observe: "Do not confuse file offsets with RVAs or virtual addresses." },
        { action: "Locate one imported call and explain how its IAT slot becomes usable.", why: "Raw copied bytes do not receive automatic external symbol resolution.", observe: "Record DLL, symbol, thunk RVA, and owning module." },
        { action: "Locate one base-relocation block or explain why the selected image lacks one.", why: "Relocation data identifies supported base-dependent fixes.", observe: "Absence can limit rebasing or reflect architecture and build choices." },
        { action: "List literal, global, helper-call, unwind, TLS, and calling-convention dependencies for one disassembled function.", why: "Movability is a whole-function and runtime claim.", observe: "Mark what is proven, inferred, and unknown." }
      ],
      hints: [{ title: "The function uses RIP-relative addressing", body: "That helps position independence for the referenced relative target, but you must still prove the target bytes move with the function and all other dependencies remain valid." }],
      cleanup: ["The starter performs static reads only.", "Close the PE viewer without saving modifications to the inspected file."],
      extension: { title: "Independent variation", prompt: "Compare the same simple C function built with and without position-independent or optimization settings and classify the changed dependencies without executing copied bytes." }
    },
    checks: [
      ["Can position-independent code contain a nearby string literal?", ["Never", "Yes, if the layout and addressing remain position independent", "Only in kernel mode", "Only in decimal"], 1, "Self-contained data can be reached through valid relative addressing."],
      ["What do base relocations identify?", ["Address-dependent image locations to adjust", "User account groups", "Pipe message boundaries", "Thread priorities"], 0, "They let the loader repair supported absolute assumptions after rebasing."],
      ["Why is a DLL normally safer than raw copied code for extension?", ["The loader establishes imports, relocations, metadata, and lifecycle", "DLLs cannot fail", "DLLs always run as SYSTEM", "Raw code has no instructions"], 0, "The image format and loader provide a defined runtime contract."]
    ]
  },

  "windows-hooks-iat": {
    apis: ["SetWindowsHookExW", "CallNextHookEx", "UnhookWindowsHookEx", "VirtualProtect", "InterlockedExchangePointer", "PE import address table"],
    phases: {
      learn: ["Compare two redirection mechanisms", "Separate documented event-hook scope from per-module import-slot replacement."],
      windows: ["Protect ABI and lifecycle", "Reason about chains, reentrancy, concurrency, architecture, restoration, and unload."],
      investigation: ["Inspect without patching", "Map an owned file's import surface and design reversible pseudocode only."],
      review: ["Check hook reasoning", "Test scope, bypass paths, callback lifetime, recursion, atomicity, and removal."]
    },
    learning: [
      { title: "Windows hooks participate in documented event paths", paragraphs: ["SetWindowsHookEx installs a hook procedure for a selected hook type and either a specific thread or a desktop-wide scope when thread ID is zero. Scope, DLL requirements, architecture interaction, process boundaries, desktop boundaries, and event delivery depend on the chosen hook type.", "The lecture phrase injects into all processes is too broad. Some hook procedures execute in the installing process, some require a DLL for cross-process use, low-level hooks are delivered differently, and only processes and threads receiving relevant events within scope participate. Existing eligible threads can be affected; creation after installation is not a universal requirement."], inlineCheck: ["What determines SetWindowsHookEx scope most directly?", ["Hook type, thread ID, desktop, architecture, and callback placement", "The DLL filename only", "The current file offset", "The user's wallpaper"], 0, "Scope is a documented combination, not simply all processes."] },
      { title: "Hook procedures must preserve a chain contract", paragraphs: ["A hook callback must use the exact signature and calling convention, finish within the hook type's timing expectations, handle reentrancy and exceptions, and call CallNextHookEx when the contract requires the rest of the chain to run. Blocking or silently consuming events can destabilize unrelated applications.", "The callback and its containing DLL must remain loaded while the hook can call it. UnhookWindowsHookEx prevents future delivery but an in-flight callback may still be returning, so shutdown needs coordination before unloading code."] },
      { title: "An IAT hook changes selected indirect calls", paragraphs: ["After the loader resolves imports, an IAT slot contains a target function address. Replacing that pointer redirects calls from that module that pass through that slot. It does not automatically affect direct syscalls, statically linked code, delay-load tables not yet handled, GetProcAddress results, another module's IAT, or a caller that cached the original pointer.", "Correct code needs the exact function ABI, a saved original pointer, recursion control, thread-safe installation, temporary page-protection handling where necessary, restoration, and proof no active call can enter unloaded hook code."] }
    ],
    visuals: [{ type: "flow", title: "Follow an imported call before and after IAT redirection", items: [
      { meta: "Caller module", label: "call [IAT slot]", detail: "One module's indirect import path", linkAfter: "normally points to" },
      { meta: "Original", label: "Imported function", detail: "Resolved export in dependency", linkAfter: "hook install changes slot" },
      { meta: "Replacement", label: "ABI-compatible hook", detail: "May observe, modify, and call original", linkAfter: "uninstall restores" },
      { meta: "Lifecycle", label: "Original pointer and protection", detail: "Atomic swap, active-call drain, unload" }
    ], caption: "Only calls that consult the modified slot are redirected. This bounded scope is central to both debugging and detection." }],
    workedExamples: [{ type: "comparison", title: "Windows event hook versus IAT hook", prompt: "Both redirect behavior, but their contracts and bypasses differ.", columns: [
      { title: "SetWindowsHookEx", rows: [["Target", "Documented event family"], ["Scope", "Thread or desktop-dependent"], ["Chain", "CallNextHookEx semantics"], ["Installation", "OS-managed hook handle"], ["Removal", "Unhook plus callback lifetime"]] },
      { title: "IAT replacement", rows: [["Target", "One imported function slot"], ["Scope", "Selected importing module"], ["Chain", "Saved original pointer by design"], ["Installation", "Table pointer change"], ["Removal", "Restore pointer, drain calls, unload"]] }
    ], shared: "Both require an exact ABI, architecture compatibility, reentrancy planning, thread safety, bounded work, and authorization.", conclusion: "Choose terminology from the actual redirection point, not from the shared word hook." }],
    windowsLearning: [
      { title: "Callback ABI mistakes are process-corrupting bugs", paragraphs: ["A wrong parameter type, return type, calling convention, or callback lifetime can corrupt registers or stack state, return invalid results, or jump into freed Python callback storage. ctypes.WINFUNCTYPE creates a native callback wrapper, but the Python object must remain strongly referenced while Windows may call it.", "Python callbacks are a poor fit for broad, timing-sensitive global hooks. The course does not install them. Study the signature, event chain, and lifecycle through documentation and pseudocode."] },
      { title: "Kernel table hooking is outside this lab", paragraphs: ["Historical SSDT or syscall-table hooking requires kernel code and conflicts with modern kernel integrity protections, architecture changes, driver signing, PatchGuard, virtualization-based security, and supportability. It is not simply an IAT hook with higher permissions.", "Use documented tracing, filtering, minifilter, callback, ETW, and security interfaces for legitimate kernel observation. The course treats SSDT hooking as historical vocabulary and a defensive indicator, not an implementation practice."] }
    ],
    practice: {
      title: "Map one executable's import redirection surface", time: "40 min", intro: "The starter reads import descriptors and thunks from an owned PE file without loading or modifying it.",
      download: ["downloads/pe_imports_lab.py", "pe_imports_lab.py"],
      expectedOutcome: "The report should list imported DLLs and named or ordinal imports with IAT RVAs. You should be able to select one slot, state which calls it can redirect, list bypass paths, and write reversible installation pseudocode without changing memory.",
      safety: "Do not patch a running process or file. Work on static files you own and keep the exercise at inspection and pseudocode.",
      steps: [
        { action: "Run the import reader on the Python executable or another owned PE file.", why: "Static metadata establishes the actual per-module import surface.", observe: "Record architecture, DLL, symbol, import-name thunk, and IAT RVA." },
        { action: "Choose one harmless import and enumerate calls that would and would not use its slot.", why: "IAT hooking is narrower than all calls to an API name.", observe: "Include GetProcAddress, another module, and direct or delayed resolution as possible bypasses." },
        { action: "Write pseudocode for locate, validate, change protection, atomic swap, call-through, restore, and protection restoration.", why: "Installation is a state transaction with rollback branches.", observe: "Store the exact old pointer and protection only after successful queries." },
        { action: "Add recursion, concurrent calls, partial install, exception, and unload cases.", why: "A happy-path pointer change is not a safe hook design.", observe: "Restoration must precede unloading, with active calls allowed to finish." }
      ],
      hints: [{ title: "The report shows an ordinal import", body: "An ordinal identifies an export by number rather than name. Retain the ordinal and owning DLL instead of inventing a symbol name." }],
      cleanup: ["The starter performs static reads only.", "Delete only your own pseudocode or temporary file copy if no longer needed."],
      extension: { title: "Independent variation", prompt: "Compare normal and delay-load imports and explain why a hook installer must identify the exact table and resolution time." }
    },
    checks: [
      ["Does changing one module's IAT slot redirect every process call to that API?", ["Yes", "No", "Only on x64", "Only if signed"], 1, "Only calls that use that selected slot are redirected."],
      ["What must happen before hook code is unloaded?", ["Restore redirection and let active callbacks finish", "Make the IAT writable forever", "Close every system process", "Delete the original DLL"], 0, "No path may retain a callable pointer into unloaded code."],
      ["Is SSDT patching a supported user-mode WinAPI hook?", ["Yes", "No", "Only through ctypes", "Only with Process Explorer"], 1, "It is kernel tampering and outside documented user-mode hook contracts."]
    ]
  },

  "detect-injection": {
    apis: ["win32process.EnumProcessModules", "win32process.GetModuleFileNameEx", "VirtualQueryEx", "WinVerifyTrust", "Process Explorer", "ListDLLs", "Sigcheck"],
    phases: {
      learn: ["Build a layered evidence model", "Combine identity, modules, memory, threads, persistence, events, trust, and baseline."],
      windows: ["Correlate complementary tools", "Turn snapshots and timelines into a bounded conclusion with preserved uncertainty."],
      investigation: ["Investigate a controlled module change", "Baseline one owned process, compare it, and finish the full-course synthesis."],
      review: ["Check defensive reasoning", "Test provenance, signatures, false positives, tool limits, response, and course-wide integration."]
    },
    learning: [
      { title: "Start with stable process identity", paragraphs: ["Record image path, file hash and signer, PID and creation time, parent, command line, user, integrity, architecture, protection level, start time, and expected role. PID alone is reusable and a familiar process name can be copied by unrelated software.", "Define the question before collecting every available field. Are you explaining an unexpected module, a private executable region, an unusual thread start, a startup entry, or a cross-process relationship? The question determines the evidence sequence."], inlineCheck: ["Why pair PID with creation time and image path?", ["PIDs can be reused and names can be imitated", "It changes the DACL", "It creates an IAT", "It guarantees malware"], 0, "The tuple identifies the observed process instance more reliably."] },
      { title: "Indicators become meaningful through correlation", paragraphs: ["An unsigned module, unusual path, executable private page, thread starting outside a known image, writable-executable protection, changed IAT slot, suspicious cross-process handle, or unexpected startup entry can each have benign explanations. Several connected events with inconsistent provenance raise confidence.", "A valid signature most directly supports publisher attribution and integrity of the signed bytes under a trust chain. It does not prove benign behavior. An unsigned file is not automatically malicious, especially for local development, but it has weaker publisher provenance."] },
      { title: "Baseline and time order reduce guesswork", paragraphs: ["Compare the same application version, configuration, architecture, and workload before and after the controlled change. A generic list of Windows DLLs is less useful than a known-good baseline for that exact program.", "Record when the parent started, when a module loaded, when memory protection changed, when a thread began, and when persistence appeared. Causality still requires care, but ordered evidence is stronger than an unordered screenshot."] }
    ],
    visuals: [{ type: "flow", title: "Move from anomaly to evidence-based conclusion", items: [
      { meta: "Identity", label: "Exact process instance", detail: "Path, hash, signer, parent, token, time", linkAfter: "compare" },
      { meta: "Execution", label: "Modules, regions, threads", detail: "Image or private provenance, start addresses", linkAfter: "correlate" },
      { meta: "Timeline", label: "Loads, opens, persistence, network", detail: "Source, target, result, sequence", linkAfter: "conclude" },
      { meta: "Report", label: "Facts, inference, alternatives", detail: "Confidence, gaps, safe next action" }
    ], caption: "A defensive verdict should remain reproducible even when the reader disagrees with the interpretation." }],
    workedExamples: [{ type: "decision", title: "Triage an unexpected module", prompt: "Process Explorer shows an unfamiliar DLL in a normal desktop application.", steps: [
      { title: "Verify the process", action: "Record exact process identity and expected application build.", why: "A module conclusion is meaningless if the wrong process instance was inspected.", result: "The subject is stable." },
      { title: "Verify the module", action: "Record full path, hash, signature, company metadata, architecture, and file timestamps.", why: "A basename does not establish provenance.", result: "The artifact is independently identifiable." },
      { title: "Find the load path", action: "Use baseline difference and Image Load timing, then inspect parent, plugin, installer, or startup context.", why: "The reason it entered the process matters more than unfamiliarity.", result: "Candidate causes are evidence-linked." },
      { title: "Bound the verdict", action: "State facts, likely explanation, alternatives, missing telemetry, and proportionate next action.", why: "Investigation quality includes uncertainty and preservation.", result: "No destructive response precedes authority and evidence." }
    ], conclusion: "Unexpected is a question to investigate, not a verdict." }],
    windowsLearning: [
      { title: "Use each Sysinternals tool for its strongest question", paragraphs: ["Process Explorer provides process identity, token context, modules, signature checks, handles, threads, and start addresses. ListDLLs creates a scriptable module inventory. Sigcheck inspects file hashes, versions, and signatures. VMMap classifies memory. Process Monitor captures process, thread, image, file, and Registry timing. Autoruns maps common persistence locations.", "A module can unload before a snapshot, a protected process can restrict inspection, signature verification can depend on network and trust configuration, and Process Monitor can miss pre-capture events. Record tool version, privilege, filters, capture window, and failure results."] },
      { title: "Preserve before responding", paragraphs: ["Hash relevant files, save narrow exports or screenshots, record timestamps and system time basis, and retain the chain between process, module, path, and event. Do not upload sensitive files to third-party services without authorization and policy review.", "Do not delete, terminate, quarantine, change ACLs, disable security controls, or remove persistence simply because a lab indicator looks suspicious. In a real environment, follow incident-response authority and evidence-preservation procedures."] }
    ],
    practice: {
      title: "Baseline the current Python process", time: "45 min", intro: "The starter enumerates only its own loaded modules, optionally saves a JSON baseline, and compares two owned runs.",
      download: ["downloads/module_baseline_lab.py", "module_baseline_lab.py"],
      expectedOutcome: "The report should include PID, executable, architecture, module paths, hashes where readable, and a stable JSON form. A comparison should identify added, removed, and changed-path modules without declaring them malicious.",
      safety: "The starter inspects only its own process and performs no hook, injection, persistence change, process open, or module load beyond Python's normal imports.",
      steps: [
        { action: "Run the starter and save a baseline, then inspect the same PID in Process Explorer and ListDLLs.", why: "Three views let you compare naming, path normalization, timing, and access limitations.", observe: "Record modules seen by one source but not another and the capture time." },
        { action: "Run a second Python configuration that imports a standard extension module, then compare JSON reports.", why: "A controlled, expected module difference exercises the detection workflow.", observe: "Classify the added path, hash, signer availability, and reason for loading." },
        { action: "Add VMMap and one short Process Monitor Image Load capture.", why: "Module inventory, memory type, and load time are complementary.", observe: "Connect one MEM_IMAGE range to its module and event path." },
        { action: "Write the final report and complete the course synthesis questions.", why: "The final lesson should integrate processes, memory, loading, security, synchronization, IPC, and observation.", observe: "Explain how PID identity, handles, page type, loader metadata, token rights, waits, and tool blind spots affect the conclusion." }
      ],
      hints: [{ title: "Two inventories differ unexpectedly", body: "Align capture time, process instance, architecture, path normalization, access level, and modules that loaded or unloaded between snapshots before interpreting the difference." }],
      cleanup: ["Close the owned Python process and inspection tools.", "Delete only baseline JSON files created by this lab if you no longer want them."],
      extension: { title: "Independent variation", prompt: "Create a signed or hashed baseline for one owned application version, then design a schema that survives path case, update version, and expected plugin changes." }
    },
    checks: [
      ["What does a valid Authenticode signature establish most directly?", ["Publisher and signed-byte integrity under the trust chain", "Benign behavior forever", "No private memory", "Universal administrator access"], 0, "Trust and behavior still require separate evaluation."],
      ["Should an unfamiliar module be deleted before its path and hash are preserved?", ["Yes", "No", "Only if unsigned", "Only from System32"], 1, "Preserve evidence and establish authority before response."],
      ["Which conclusion is strongest?", ["Private executable memory always means malware", "Several correlated facts with alternatives and gaps stated", "A familiar filename is trusted", "One clean snapshot proves no injection"], 1, "Correlation, reproducibility, and bounded uncertainty support defensible conclusions."],
      ["Which earlier course topics directly support this investigation?", ["Processes, handles, memory, PE loading, security, synchronization, and IPC", "Only decimal arithmetic", "Only Registry values", "Only thread priority"], 0, "Runtime investigation depends on the integrated operating-system model built across the course."]
    ]
  }
};
