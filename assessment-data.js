(() => {
  "use strict";

  function rotateOptions(id, options) {
    const offset = [...id].reduce((total, character) => total + character.charCodeAt(0), 0) % options.length;
    return { offset, options: [...options.slice(offset), ...options.slice(0, offset)] };
  }

  function single(id, module, dimension, skill, prompt, options, answer, explanation) {
    const rotated = rotateOptions(id, options);
    return { id, module, kind: "single", dimension, skill, prompt, options: rotated.options, answer: (answer - rotated.offset + options.length) % options.length, explanation };
  }

  function multiple(id, module, dimension, skill, prompt, options, answers, explanation) {
    const rotated = rotateOptions(id, options);
    return { id, module, kind: "multiple", dimension, skill, prompt, options: rotated.options, answers: answers.map((answer) => (answer - rotated.offset + options.length) % options.length), explanation };
  }

  function ordering(id, module, dimension, skill, prompt, items, answer, explanation) {
    return { id, module, kind: "ordering", dimension, skill, prompt, items, answer, explanation };
  }

  const moduleReviews = [
    {
      module: "foundations",
      title: "OS foundations review",
      summary: "Rebuild the machine-to-kernel mental model, then use contracts and evidence to explain one controlled Windows operation.",
      activities: [
        single(
          "foundations-review-boundary",
          "foundations",
          "mechanism",
          "system-call boundary",
          "A user-mode Python program requests bytes from a file. Which description best explains why the operating system is involved?",
          [
            "Python changes the storage controller registers directly and later informs Windows.",
            "A user-mode API path validates the request and crosses into protected kernel work when required.",
            "The CPU permanently switches the complete Python process into kernel mode.",
            "The file abstraction is implemented entirely by the Python interpreter without operating-system state."
          ],
          1,
          "Applications normally remain in user mode. A Windows API call prepares the request, and protected work crosses a controlled system-call boundary where the kernel validates access and operates on kernel-managed objects."
        ),
        single(
          "foundations-review-interface",
          "foundations",
          "interface",
          "native contract translation",
          "Microsoft documents an output parameter as SIZE_T *lpNumberOfBytesWritten. Which Python declaration preserves both width and pointer level?",
          [
            "Declare the parameter as ctypes.c_uint32 and pass the integer value.",
            "Create ctypes.c_size_t(), declare POINTER(ctypes.c_size_t), and pass it with ctypes.byref().",
            "Use ctypes.c_void_p because every pointer-sized output has no meaningful base type.",
            "Use wintypes.DWORD by value because SIZE_T and DWORD are interchangeable on Windows."
          ],
          1,
          "SIZE_T is pointer-sized, and the asterisk makes the parameter a pointer to writable SIZE_T storage. A c_size_t output object plus POINTER(c_size_t) and byref preserves both facts on 32-bit and 64-bit Python."
        ),
        multiple(
          "foundations-review-failure",
          "foundations",
          "failure",
          "failure-rule diagnosis",
          "A native call returns its documented failure sentinel. Which actions belong in the immediate diagnostic branch? Select every required action.",
          [
            "Capture the documented extended error before another Windows call can replace it.",
            "Interpret the result using this API's documented sentinel rather than a universal truthiness rule.",
            "Close or restore resources while preserving the primary failure information.",
            "Retry forever with progressively broader access rights.",
            "Assume a nonzero last-error value always means the call failed even when the result reports success."
          ],
          [0, 1, 2],
          "Windows APIs do not share one result convention. Test the documented sentinel first, capture the extended error only when the contract says it is meaningful, and preserve that primary evidence while guaranteed cleanup runs."
        ),
        ordering(
          "foundations-review-lifecycle",
          "foundations",
          "ownership",
          "API call lifecycle",
          "Place the contract-driven call lifecycle in the order that avoids guessing and leaking resources.",
          [
            { id: "cleanup", label: "Release every resource owned by the caller in a guaranteed cleanup path" },
            { id: "declare", label: "Declare exact argument and result types before the first native call" },
            { id: "inspect", label: "Read the DLL, parameter directions, result sentinel, error rule, and cleanup contract" },
            { id: "call", label: "Prepare the input and output storage, call once, and check the documented result immediately" }
          ],
          ["inspect", "declare", "call", "cleanup"],
          "Contract reading comes first because it determines declarations, storage, error checks, and ownership. The call is then made with explicit objects, and cleanup remains guaranteed whether the call succeeds or fails."
        ),
        single(
          "foundations-review-evidence",
          "foundations",
          "evidence",
          "snapshot versus trace",
          "A temporary file handle opens and closes too quickly to appear in Process Explorer. Which tool can show when those operations occurred?",
          [
            "A Process Monitor trace filtered to the process and file operations",
            "A RAMMap physical-page snapshot taken after the process exits",
            "A Sigcheck signature report for the Python executable",
            "A static screenshot of the Object Manager root namespace"
          ],
          0,
          "Process Monitor records timestamped create, use, and close operations, so it preserves short-lived history. Process Explorer is a live snapshot and can legitimately miss an object that no longer exists when inspected."
        )
      ]
    },
    {
      module: "processes-handles",
      title: "Processes and handles review",
      summary: "Follow process creation, kernel-object access, handle ownership, and the evidence that connects a PID to its real lifetime.",
      activities: [
        single(
          "processes-review-isolation",
          "processes-handles",
          "mechanism",
          "process isolation",
          "Two processes contain the same virtual address value. What does that fact alone tell you about the underlying memory?",
          [
            "They must refer to the same physical frame because the numbers match.",
            "They are addresses interpreted through different process address spaces and may map to unrelated storage.",
            "One process owns the address and the other process cannot contain that numeric value.",
            "They identify the same kernel handle-table entry in both processes."
          ],
          1,
          "A virtual address is meaningful within an address-space context. Identical numeric values in different processes can translate through different page tables, so equality does not prove shared physical memory or shared ownership."
        ),
        single(
          "processes-review-create",
          "processes-handles",
          "interface",
          "process creation contract",
          "A CreateProcess-style call succeeds and returns process and primary-thread handles plus IDs. Which result handling is contract-correct?",
          [
            "Keep only the PID because Windows automatically closes both returned handles immediately.",
            "Use the returned handles for required operations, then close both exactly once; treat the IDs as identifiers, not owned handles.",
            "Close the PID and TID with CloseHandle after waiting for process termination.",
            "Request every process right so later operations cannot report access denied."
          ],
          1,
          "The process and thread handles are caller-owned references to kernel objects and must be closed explicitly. PID and TID are numeric identifiers rather than handles, and requested access should be limited to the operations the caller plans to perform."
        ),
        multiple(
          "processes-review-open-failure",
          "processes-handles",
          "failure",
          "OpenProcess diagnosis",
          "OpenProcess reports access denied for a diagnostic process you started. Which checks can explain the result without immediately requesting all access?",
          [
            "Confirm the PID still identifies the intended process and has not exited or been reused.",
            "Compare the requested access mask with the exact operation you plan to perform next.",
            "Inspect caller elevation, integrity, target protection, and the relevant security policy.",
            "Assume 64-bit Windows forbids every 32-bit process from opening any 64-bit process.",
            "Disable security software and retry against an unrelated system process."
          ],
          [0, 1, 2],
          "Diagnosis begins with identity, lifetime, minimum required rights, and the applicable security boundary. Architecture can limit some inspection operations, but it is not a universal ban and does not justify broad or unrelated access."
        ),
        ordering(
          "processes-review-ownership",
          "processes-handles",
          "ownership",
          "created-process ownership",
          "Order the parent-side lifecycle for a controlled child process when the parent must wait and inspect the exit code.",
          [
            { id: "close", label: "Close the owned thread and process handles in guaranteed cleanup" },
            { id: "create", label: "Create the child and retain the returned process/thread information" },
            { id: "inspect", label: "Read the exit result after the wait reports the required completion state" },
            { id: "wait", label: "Wait on the process handle and branch on the documented wait result" }
          ],
          ["create", "wait", "inspect", "close"],
          "The returned process handle supplies a stable, waitable reference even if names or IDs are reused. Exit information is meaningful after the wait reports process completion, and both returned handles remain the caller's responsibility until cleanup."
        ),
        single(
          "processes-review-evidence",
          "processes-handles",
          "evidence",
          "process identity evidence",
          "Which evidence set most reliably distinguishes two short-lived processes that happen to use the same image name?",
          [
            "Image name alone in a screenshot",
            "PID, parent PID, creation time, command line, and a matching Process Monitor process event",
            "The desktop icon used to launch the program",
            "The current number of free physical pages"
          ],
          1,
          "Names are not unique and PIDs can eventually be reused. Combining PID with parent, creation time, command line, and trace events ties observations to one process lifetime and makes the evidence reproducible."
        )
      ]
    },
    {
      module: "threads-scheduling",
      title: "Threads and scheduling review",
      summary: "Reason about runnable work, waits, Python concurrency, scheduler choices, and evidence instead of assuming that more threads are faster.",
      activities: [
        single(
          "threads-review-ready-waiting",
          "threads-scheduling",
          "mechanism",
          "thread states",
          "A worker thread is blocked waiting for disk input. Why can another ready thread run without the process ending?",
          [
            "Scheduling selects threads, and a process can contain both waiting and ready threads at once.",
            "Windows copies the blocked thread's stack into every other process.",
            "A waiting thread releases its process object and receives a new PID later.",
            "Disk I/O permanently raises every other thread to real-time priority."
          ],
          0,
          "Threads are the scheduled execution units. One thread can wait on I/O while another thread in the same or a different process is ready, allowing the scheduler to use CPU time without ending either process."
        ),
        single(
          "threads-review-interface",
          "threads-scheduling",
          "interface",
          "threading interface choice",
          "A Python workload spends most of its time waiting for independent file reads. Which initial design best expresses the work and cleanup responsibilities?",
          [
            "Use a bounded set of Python worker threads, retain them, and join them before consuming final results.",
            "Create one native thread for every byte and never retain the handles.",
            "Use a busy loop in the main thread until files appear complete.",
            "Raise the process to real-time priority before measuring anything."
          ],
          0,
          "A bounded worker set can overlap I/O waits, and joining makes lifetime and completion explicit. Thread count still needs measurement; unbounded creation, busy waiting, and priority escalation obscure rather than solve the problem."
        ),
        multiple(
          "threads-review-performance",
          "threads-scheduling",
          "failure",
          "thread slowdown diagnosis",
          "A CPU-bound Python prime search becomes slower after increasing from four to forty threads. Which explanations should be investigated?",
          [
            "Interpreter-level serialization can prevent CPU-bound Python bytecode from running in parallel.",
            "Extra workers add scheduling, synchronization, cache, and partitioning overhead.",
            "Uneven partitions can leave some workers idle while one finishes a large range.",
            "Every context switch proves the scheduler is malfunctioning.",
            "More threads always reduce the number of executed instructions."
          ],
          [0, 1, 2],
          "The GIL can serialize CPU-bound bytecode, while excessive workers add coordination and cache costs. Partition imbalance also affects completion time. These are hypotheses to measure, not evidence that normal context switching is broken."
        ),
        ordering(
          "threads-review-experiment",
          "threads-scheduling",
          "ownership",
          "thread experiment lifecycle",
          "Order a repeatable thread-count experiment so no worker remains active during the next measurement.",
          [
            { id: "compare", label: "Compare elapsed time, CPU use, context switches, and completed work" },
            { id: "join", label: "Join every worker and confirm all expected results were produced" },
            { id: "start", label: "Start the bounded worker set with a recorded partition and start time" },
            { id: "baseline", label: "Define identical input, output checks, warm-up policy, and observation method" }
          ],
          ["baseline", "start", "join", "compare"],
          "A fair experiment fixes the workload and validation first, then starts a known set of workers. Joining confirms that every worker has completed and cleaned up before measurements are compared with another run."
        ),
        single(
          "threads-review-evidence",
          "threads-scheduling",
          "evidence",
          "scheduler evidence",
          "Which Process Explorer observation best supports the claim that one worker dominates a supposedly balanced CPU experiment?",
          [
            "One thread accumulates substantially more CPU time while other workers finish or wait.",
            "The process has a recognizable application icon.",
            "The system commit limit is larger than physical RAM.",
            "The executable has a valid digital signature."
          ],
          0,
          "Per-thread CPU time and states connect the performance symptom to scheduling and partition behavior. An icon, commit limit, or signature may be true but does not distinguish balanced work from one dominant worker."
        )
      ]
    },
    {
      module: "memory",
      title: "Memory management review",
      summary: "Translate addresses through pages, distinguish reservation from commitment, interpret regions, and verify changes with VMMap evidence.",
      activities: [
        single(
          "memory-review-translation",
          "memory",
          "mechanism",
          "virtual address translation",
          "A valid virtual page is not currently resident in a physical frame. What must happen before the instruction can access a byte on that page?",
          [
            "The processor raises a page fault and Windows resolves the mapping or reports an access failure.",
            "The virtual address permanently changes to a physical address visible to the program.",
            "The process opens the page file with CreateFile for every memory access.",
            "The scheduler assigns the address to whichever process runs next."
          ],
          0,
          "The memory-management unit detects that the current mapping is not present and raises a fault. Windows may bring data into a frame, create a demand-zero page, or reject the access according to the region's state and protection."
        ),
        single(
          "memory-review-interface",
          "memory",
          "interface",
          "VirtualAlloc contract",
          "A lab needs a large address range now but will use only one small portion initially. Which allocation model expresses that intent?",
          [
            "Reserve the range, then commit only the pages that need backing as they are required.",
            "Commit every possible page and assume unused commit has no system cost.",
            "Use MEM_RELEASE on the unallocated address before reserving it.",
            "Treat a Python object ID as a stable address for the entire virtual range."
          ],
          0,
          "Reservation protects an address interval without immediately charging commit for every page. Commitment supplies backing for the portion that will be accessed, so the two-stage model matches the stated requirement."
        ),
        multiple(
          "memory-review-query-failure",
          "memory",
          "failure",
          "address-space traversal",
          "A VirtualQueryEx-style traversal stops unexpectedly. Which checks distinguish a normal end from a broken loop or contract error?",
          [
            "Check the documented zero/failure result and capture extended error immediately when applicable.",
            "Advance by RegionSize from BaseAddress while detecting wraparound or non-progress.",
            "Use pointer-sized address arithmetic and a structure layout matching the caller/target contract.",
            "Advance by a hard-coded 4096 bytes regardless of the returned region.",
            "Ignore process access rights because memory metadata is never protected."
          ],
          [0, 1, 2],
          "A correct walk uses the returned region boundary, pointer-sized arithmetic, progress checks, and the API-specific failure rule. Fixed increments can be inefficient or wrong, and opening the target still requires suitable query rights."
        ),
        ordering(
          "memory-review-allocation-lifecycle",
          "memory",
          "ownership",
          "virtual allocation lifecycle",
          "Order a controlled allocation experiment that changes protection and leaves no committed region behind.",
          [
            { id: "free", label: "Release the original allocation base with the cleanup mode required by the contract" },
            { id: "allocate", label: "Reserve or commit the requested size and verify the returned base address" },
            { id: "observe", label: "Record region state, protection, and size through VirtualQuery or VMMap" },
            { id: "protect", label: "Change protection for the intended pages and retain the previous protection value" }
          ],
          ["allocate", "protect", "observe", "free"],
          "Allocation establishes the original base address, protection changes operate on that live range, and observation verifies the state transition. Cleanup must use that original base and follow the release contract rather than using an interior address."
        ),
        single(
          "memory-review-evidence",
          "memory",
          "evidence",
          "VMMap interpretation",
          "After reserving 64 MiB and committing one page, which VMMap comparison best supports that distinction?",
          [
            "The region's virtual size grows by roughly 64 MiB while commit increases only for the committed portion.",
            "Physical RAM immediately decreases by exactly 64 MiB in every measurement.",
            "The process receives 64 MiB of new executable image sections.",
            "The allocation appears only as a new kernel handle and not as an address-space region."
          ],
          0,
          "Virtual size describes reserved address space, whereas commit describes pages with committed backing. VMMap can show both dimensions, so a large virtual range with small commit matches the controlled allocation."
        )
      ]
    },
    {
      module: "linking-loading",
      title: "Linking and loading review",
      summary: "Connect PE file structures to mapped images, resolve addresses correctly, and reason about loader-owned module lifetimes.",
      activities: [
        single(
          "linking-review-rva",
          "linking-loading",
          "mechanism",
          "RVA translation",
          "Why can a PE relative virtual address not always be used as a raw file offset when inspecting an executable on disk?",
          [
            "Sections have different file offsets and mapped virtual addresses, so the containing section must translate the RVA.",
            "Every RVA is encrypted until Windows creates a process.",
            "Raw offsets are always twice the corresponding virtual address.",
            "RVA values identify Registry keys rather than bytes in an image."
          ],
          0,
          "PE sections record where data lies in the file and where it is expected in the mapped image. Translating an RVA therefore uses the containing section's virtual address and raw-data offset rather than assuming equality."
        ),
        single(
          "linking-review-interface",
          "linking-loading",
          "interface",
          "export address calling",
          "GetProcAddress returns a non-null raw function address for a test DLL you control. What is still required before Python can call it safely?",
          [
            "Construct a callable with the documented calling convention, parameter types, and exact result type.",
            "Convert the address to a 32-bit signed integer on every Windows architecture.",
            "Call it with arbitrary strings because exported functions discover their own signature.",
            "Free the DLL before building the callable so the address becomes stable."
          ],
          0,
          "An address does not encode its ABI. Python must use the correct calling convention and contract, and the module must remain loaded for as long as the function address can be called."
        ),
        multiple(
          "linking-review-load-failure",
          "linking-loading",
          "failure",
          "DLL load diagnosis",
          "A DLL supplied by the lab fails to load. Which facts should be checked before changing search paths or copying files into system directories?",
          [
            "Caller and DLL architecture compatibility",
            "Dependent-module availability and the documented search context",
            "The exact load result and extended error captured immediately",
            "Whether the export name is spelled correctly, even though no module has loaded yet",
            "Whether disabling signature verification makes every dependency compatible"
          ],
          [0, 1, 2],
          "Architecture, dependencies, search rules, and the immediate loader error explain most controlled load failures. Export lookup occurs after a module loads, and weakening unrelated protections does not repair an ABI or dependency mismatch."
        ),
        ordering(
          "linking-review-module-lifetime",
          "linking-loading",
          "ownership",
          "module lifetime",
          "Order the explicit-load lifecycle for calling one documented export from a test DLL you control.",
          [
            { id: "unload", label: "Release the caller's module reference after the program can no longer use the callable or its address" },
            { id: "resolve", label: "Resolve the exact export and reject the documented missing-address result" },
            { id: "load", label: "Load the intended DLL through a controlled path and retain the module handle" },
            { id: "invoke", label: "Construct the correctly typed callable, invoke it, and check its own result contract" }
          ],
          ["load", "resolve", "invoke", "unload"],
          "The module must be loaded before its export is resolved and must stay loaded through every use of that address. Releasing the caller's module reference is safe only after the callable and address can no longer be used."
        ),
        single(
          "linking-review-evidence",
          "linking-loading",
          "evidence",
          "loader evidence",
          "Which combined evidence best shows that a DLL was mapped during one controlled program run?",
          [
            "A Process Monitor Load Image event correlated with the module appearing in Process Explorer or ListDLLs",
            "A change to the desktop wallpaper and an unrelated DNS lookup",
            "The DLL filename appearing in source code without executing the program",
            "A RAMMap standby-list total with no process identity"
          ],
          0,
          "A load-image trace establishes when and from which path mapping occurred, while a process module view establishes the resulting live state. Correlating PID, path, and time joins the two forms of evidence."
        )
      ]
    },
    {
      module: "management",
      title: "Windows management review",
      summary: "Reason through Registry views, service transitions, SCM rights, reversible changes, and evidence from management tools.",
      activities: [
        single(
          "management-review-service-state",
          "management",
          "mechanism",
          "service state transitions",
          "A start request succeeds but the service reports START_PENDING. Why is it incorrect to treat that as already running?",
          [
            "A control request and the resulting stable service state are separate; pending state requires bounded observation.",
            "START_PENDING means the service process has permanently crashed.",
            "The SCM always changes every service directly from stopped to running in one CPU instruction.",
            "A pending state is only a Registry value and never affects runtime behavior."
          ],
          0,
          "Service controls initiate transitions. A pending state exposes work still in progress, often with a checkpoint and wait hint, so the controller must poll for a bounded period and handle failures and timeouts separately."
        ),
        single(
          "management-review-interface",
          "management",
          "interface",
          "Registry view selection",
          "A 32-bit Python tool must deliberately read a key from the 64-bit Registry view. Which approach makes that requirement explicit?",
          [
            "Combine the needed base access with KEY_WOW64_64KEY when opening the key.",
            "Rename the Python executable so Windows assumes it is 64-bit.",
            "Open both views with write access and keep whichever contains more values.",
            "Use a hard-coded filesystem path under System32 instead of the Registry API."
          ],
          0,
          "The WOW64 view flag is combined with the minimum base right, such as query access, at open time. This avoids depending on the interpreter architecture and makes the selected Registry view explicit and reviewable."
        ),
        multiple(
          "management-review-control-failure",
          "management",
          "failure",
          "service-control diagnosis",
          "A disposable lab service does not reach the requested stopped state. Which conditions should a controller report separately?",
          [
            "Opening the SCM or service failed because the requested access was not granted.",
            "The service does not accept the requested control in its current state.",
            "The service remains pending beyond a bounded wait or reports a terminal failure state.",
            "Every non-running state should be rewritten in the Registry as running.",
            "The controller should loop forever because service transitions have no diagnostic fields."
          ],
          [0, 1, 2],
          "Open failures, rejected controls, pending timeouts, and terminal service states are different evidence and require different messages. A controller observes SCM state rather than fabricating it or waiting without a bound."
        ),
        ordering(
          "management-review-handle-lifecycle",
          "management",
          "ownership",
          "SCM handle ownership",
          "Put the steps for a read-only service query in order. The final cleanup step should close both independent handles in reverse acquisition order.",
          [
            { id: "open-service", label: "Open the named service with query-status access and retain that handle" },
            { id: "query", label: "Query status, interpret state and checkpoint fields, and preserve any primary error" },
            { id: "open-scm", label: "Open the Service Control Manager with connection access" },
            { id: "close", label: "Close both independently owned handles, conventionally in reverse acquisition order" }
          ],
          ["open-scm", "open-service", "query", "close"],
          "The manager and service handles refer to separate SCM objects and each is closed independently. Reverse acquisition is a clear cleanup discipline rather than a Windows dependency; primary error evidence is stored before either close call."
        ),
        single(
          "management-review-evidence",
          "management",
          "evidence",
          "Registry and service evidence",
          "Which observation best verifies that a controlled service configuration query read Registry data without changing it?",
          [
            "A Process Monitor trace limited to the tool's PID shows Registry query operations and no set/delete operations.",
            "Services displays a familiar service name after the tool exits.",
            "The machine boots successfully the following day.",
            "The Python process consumes less than one percent CPU."
          ],
          0,
          "Process Monitor operation names distinguish reads from writes and can be correlated to the querying PID and path. Merely seeing a service or low CPU does not prove which Registry operations occurred."
        )
      ]
    },
    {
      module: "security",
      title: "Windows security review",
      summary: "Trace access decisions through tokens and descriptors, interpret privilege outcomes, and separate policy evidence from guesses.",
      activities: [
        single(
          "security-review-access-check",
          "security",
          "mechanism",
          "access-check reasoning",
          "A caller opens a securable object for a requested access mask. Which statement best describes the resulting handle?",
          [
            "A successful handle records granted rights resulting from the access check for that open.",
            "The handle contains every right the object type defines, regardless of the request.",
            "The DACL is copied into the handle and reevaluated after every CPU instruction.",
            "The handle is valid only while the caller's username text remains unchanged."
          ],
          0,
          "Windows evaluates the caller's effective security context, requested mask, and object policy during the open. A successful handle then carries granted access used by later operations on that handle."
        ),
        single(
          "security-review-interface",
          "security",
          "interface",
          "minimum token access",
          "A diagnostic only needs to enumerate the current process token's privileges. Which access strategy is most appropriate?",
          [
            "Open the token with query access rather than requesting adjustment, duplication, and all-access rights.",
            "Request TOKEN_ALL_ACCESS so the code never needs to understand later operations.",
            "Enable every privilege before reading the token.",
            "Duplicate the token into a primary token and launch another process."
          ],
          0,
          "Reading token information requires query capability, not mutation or process-creation rights. Requesting only the needed access reduces avoidable denial and makes the diagnostic intent clear."
        ),
        multiple(
          "security-review-privilege-result",
          "security",
          "failure",
          "privilege adjustment",
          "AdjustTokenPrivileges returns a value that normally indicates success. Which checks are still required to determine whether the requested privilege was actually enabled?",
          [
            "Clear and inspect last error according to the API contract, including ERROR_NOT_ALL_ASSIGNED.",
            "Confirm the token actually contains the requested privilege LUID.",
            "Re-query token privileges when the experiment needs evidence of the resulting state.",
            "Assume return success proves the privilege exists and was enabled.",
            "Replace the token DACL because privileges and access-control entries are the same mechanism."
          ],
          [0, 1, 2],
          "The call can report that its request was processed while still setting ERROR_NOT_ALL_ASSIGNED when the token lacks a privilege. Contract-aware last-error handling and a state query distinguish presence from enabled state."
        ),
        ordering(
          "security-review-token-lifecycle",
          "security",
          "ownership",
          "token inspection lifecycle",
          "Order a read-only token investigation that preserves evidence and closes every owned handle.",
          [
            { id: "close", label: "Close the owned token and process handles in reverse acquisition order" },
            { id: "process", label: "Identify and open the target process you started with the minimum query right" },
            { id: "interpret", label: "Interpret groups, privilege attributes, integrity, and elevation without changing them" },
            { id: "token", label: "Open the process token with query access and request the needed information classes" }
          ],
          ["process", "token", "interpret", "close"],
          "The process reference establishes the target, the token handle supplies the security context, and interpretation remains read-only. Both handles are caller-owned and are released in reverse acquisition order."
        ),
        single(
          "security-review-evidence",
          "security",
          "evidence",
          "security evidence",
          "An access attempt is denied. Which evidence combination best separates token state from object policy?",
          [
            "Process Explorer token details plus AccessChk or a security-descriptor query for the exact object and requested action",
            "Task Manager's process-name column plus total physical memory",
            "A valid executable signature plus the current wallpaper",
            "A Registry export from an unrelated user profile"
          ],
          0,
          "Token evidence describes the acting subject, while AccessChk or a descriptor query describes policy on the target object. The exact requested right connects those two sides of the authorization decision."
        )
      ]
    },
    {
      module: "synchronisation",
      title: "Synchronisation review",
      summary: "Expose race interleavings, select primitives by state semantics, branch on waits, and guarantee release without hiding abandoned state.",
      activities: [
        single(
          "sync-review-race",
          "synchronisation",
          "mechanism",
          "race interleaving",
          "Two threads each read a counter, add one, and write the result without synchronization. Why can one increment disappear?",
          [
            "Both threads can read the same old value before either write, then each writes the same incremented value.",
            "Windows guarantees arithmetic produces a random result when two threads exist.",
            "The counter is converted into a process ID during each write.",
            "A mutex automatically protects every integer in the process even when none is used."
          ],
          0,
          "The compound read-modify-write operation is not atomic merely because each source statement looks small. An interleaving can let both workers derive their write from the same stale value, losing one update."
        ),
        single(
          "sync-review-interface",
          "synchronisation",
          "interface",
          "primitive selection",
          "One producer must wake exactly one waiting consumer for each queued work item. Which synchronization primitive naturally tracks how many items are available?",
          [
            "A semaphore whose count tracks available work items",
            "A manual-reset event left signaled forever",
            "A process handle opened with terminate access",
            "A busy loop reading the queue length without a lock"
          ],
          0,
          "A semaphore represents a bounded or accumulating count and allows one waiter to proceed for each available unit. An event represents a condition rather than an item count, and busy polling does not protect the queue operation."
        ),
        multiple(
          "sync-review-wait-result",
          "synchronisation",
          "failure",
          "wait-result branching",
          "A mutex wait returns an abandoned result. Which responses preserve correctness and evidence?",
          [
            "Recognize that ownership was granted while protected state may be inconsistent.",
            "Validate or repair the protected invariant before normal use.",
            "Release the mutex in guaranteed cleanup after handling the acquired ownership.",
            "Treat the result as an ordinary timeout and assume no ownership was acquired.",
            "Erase the result and continue so the user never sees a warning."
          ],
          [0, 1, 2],
          "An abandoned result means the wait succeeded but included a warning: the waiter now owns the mutex, but the previous owner ended without releasing it. The code must inspect the protected state and still release the acquired mutex."
        ),
        ordering(
          "sync-review-critical-section",
          "synchronisation",
          "ownership",
          "mutex ownership",
          "Order one protected read-modify-write operation with a native mutex and complete result handling.",
          [
            { id: "release", label: "Release the mutex in a finally block only when this thread acquired ownership" },
            { id: "wait", label: "Wait with a bounded timeout and handle object, abandoned, timeout, and failure results separately" },
            { id: "update", label: "Validate the invariant, perform the complete read-modify-write, and record the new state" },
            { id: "open", label: "Create or open the intended mutex with the required synchronization rights" }
          ],
          ["open", "wait", "update", "release"],
          "The handle identifies the intended object, and the wait result determines whether the thread acquired ownership. The thread performs the entire invariant-changing operation while it owns the mutex, and cleanup releases only ownership that was actually acquired."
        ),
        single(
          "sync-review-evidence",
          "synchronisation",
          "evidence",
          "named-object evidence",
          "How can you confirm that two processes you started opened the same named event rather than separate unnamed events?",
          [
            "WinObj or Process Explorer shows matching event names or handle entries while the processes coordinate through the same signal.",
            "Both executables happen to be stored in the same directory.",
            "The processes use similar variable names in their Python source.",
            "RAMMap reports that both processes have private memory."
          ],
          0,
          "A shared Object Manager name and coordinated state transition connect both processes to one kernel object. Source variable names and executable paths do not establish object identity."
        )
      ]
    },
    {
      module: "ipc",
      title: "Inter-process communication review",
      summary: "Track pipe endpoints, inheritance, framing, partial transfers, EOF, blocking, and the evidence that reveals one exchange.",
      activities: [
        single(
          "ipc-review-eof",
          "ipc",
          "mechanism",
          "pipe EOF",
          "A pipe reader has consumed all buffered bytes but still blocks instead of receiving EOF. What is the most likely ownership explanation?",
          [
            "At least one write handle remains open, possibly an inherited or forgotten duplicate.",
            "The pipe name is too short for Windows to signal EOF.",
            "Reading bytes requires the process to own a mutex with the same name.",
            "EOF is available only after restarting the operating system."
          ],
          0,
          "Pipe EOF depends on the lifetime of every write endpoint, not merely the intended writer's local variable. A parent or child retaining an unused inherited write handle can keep the stream open indefinitely."
        ),
        single(
          "ipc-review-interface",
          "ipc",
          "interface",
          "pipe selection",
          "A parent only needs to capture one child process's standard output. Which initial IPC design requires the least naming and exposure?",
          [
            "An anonymous pipe with controlled inheritance of the child's write end and prompt closure of unused ends",
            "A globally named message pipe accessible to every logged-on user",
            "A shared file opened with delete access by both processes",
            "A network socket listening on every interface"
          ],
          0,
          "An anonymous pipe directly models a parent-child byte stream. Deliberate inheritance gives the child only the required endpoint, while closing unused copies makes EOF and ownership predictable."
        ),
        multiple(
          "ipc-review-partial-results",
          "ipc",
          "failure",
          "partial transfer handling",
          "A message-mode named-pipe read reports ERROR_MORE_DATA with some bytes returned. Which actions are required?",
          [
            "Retain the returned bytes as the first part of the current message.",
            "Continue bounded reads until the same message completes.",
            "Enforce a maximum message size and handle peer closure or other errors distinctly.",
            "Discard the bytes because any error code means no data was transferred.",
            "Decode each fragment independently even when a multibyte character may span fragments."
          ],
          [0, 1, 2],
          "In message mode, ERROR_MORE_DATA reports an expected partial result. The caller keeps the fragment, continues reading within a size limit, and decodes only after assembling the complete byte message, while distinguishing peer closure from other failures."
        ),
        ordering(
          "ipc-review-inheritance",
          "ipc",
          "ownership",
          "pipe endpoint inheritance",
          "Order the parent-side setup for redirecting a child's standard output without keeping EOF artificially open.",
          [
            { id: "read", label: "Read until all data has been consumed and EOF arrives, then wait and close the remaining caller-owned handles" },
            { id: "create-child", label: "Create the child with explicit handle inheritance and redirected standard output" },
            { id: "pipe", label: "Create the pipe and make only the intended child write endpoint inheritable" },
            { id: "close-parent-write", label: "Close the parent's unused write copy immediately after successful child creation" }
          ],
          ["pipe", "create-child", "close-parent-write", "read"],
          "Inheritance must be prepared before process creation, and only the required child endpoint is exposed. The parent then closes its write copy so the child's final close can produce EOF for the reader."
        ),
        single(
          "ipc-review-evidence",
          "ipc",
          "evidence",
          "pipe evidence",
          "A named-pipe client sometimes connects only after waiting. Which evidence best distinguishes a missing server from all instances being busy?",
          [
            "Capture the exact CreateFile/WaitNamedPipe results and correlate the canonical pipe name with server handles in Process Explorer or Handle.",
            "Compare the client executable's icon before and after retrying.",
            "Measure total physical RAM without recording the pipe path.",
            "Assume every delay is caused by DNS resolution."
          ],
          0,
          "The API result differentiates not-found and busy states, while a matching named handle establishes whether a server instance exists. Exact path, PID, time, and result turn retry behavior into explainable evidence."
        )
      ]
    },
    {
      module: "hooking-injection",
      title: "Hooking and injection review",
      summary: "Use controlled lifecycle and detection reasoning to understand address spaces, hook chains, module baselines, and cleanup without creating operational attack payloads.",
      activities: [
        single(
          "hooking-review-address-context",
          "hooking-injection",
          "mechanism",
          "cross-process addresses",
          "Why is an address returned by GetProcAddress in one process not automatically a callable address in another process?",
          [
            "Virtual addresses are interpreted in a process address space, and module layout or architecture may differ.",
            "Function addresses are globally assigned DNS names rather than virtual addresses.",
            "Windows guarantees every module loads at the same base in every process forever.",
            "GetProcAddress returns a kernel handle that must be duplicated rather than an address."
          ],
          0,
          "A function pointer is meaningful in the address space where it was resolved. Module presence, load base, architecture, export identity, and mitigation state must be established for the target context rather than assumed from numeric resemblance."
        ),
        single(
          "hooking-review-interface",
          "hooking-injection",
          "interface",
          "defensive inspection choice",
          "You need to compare memory-region state in a target process you started without modifying it. Which API approach best matches that diagnostic goal?",
          [
            "Open with minimum query rights and enumerate regions with VirtualQueryEx-style metadata calls.",
            "Allocate writable executable memory and start a remote thread before reading anything.",
            "Install a global hook into unrelated desktop processes.",
            "Request all access and overwrite an arbitrary address to see whether monitoring reacts."
          ],
          0,
          "A read-only region inventory requires query capability and metadata inspection, not allocation, writing, thread creation, or global hooks. Matching rights to the observation keeps the experiment controlled and interpretable."
        ),
        multiple(
          "hooking-review-baseline-failure",
          "hooking-injection",
          "failure",
          "baseline mismatch diagnosis",
          "A module-baseline comparison reports an unexpected DLL in a process you started. Which checks are needed before calling it malicious or injected?",
          [
            "Confirm PID, creation time, architecture, path, signer, and the time each snapshot was taken.",
            "Correlate image-load events and determine whether normal application behavior loaded the module.",
            "Distinguish observed facts from hypotheses and repeat the controlled baseline.",
            "Delete the DLL immediately before preserving any evidence.",
            "Assume every unsigned module is an active cross-process payload."
          ],
          [0, 1, 2],
          "A changed module list is a lead, not a verdict. Process identity, architecture, full path, signature, load timing, normal feature behavior, and repeatability are required before inferring an unexpected loading mechanism."
        ),
        ordering(
          "hooking-review-observer-lifecycle",
          "hooking-injection",
          "ownership",
          "controlled observer lifecycle",
          "Order a defensive module-baseline investigation for a purpose-built test process.",
          [
            { id: "cleanup", label: "Close snapshot/process handles, stop capture, and remove only artifacts created by the lab" },
            { id: "baseline", label: "Record process identity, architecture, module paths, signers, and capture start time" },
            { id: "compare", label: "Trigger the controlled feature, collect a second snapshot, and compare additions and removals" },
            { id: "correlate", label: "Correlate changed modules with Process Monitor image-load events and Process Explorer state" }
          ],
          ["baseline", "compare", "correlate", "cleanup"],
          "A useful comparison begins with a complete identity-aware baseline, then changes one controlled condition. Trace and snapshot evidence explain differences, and the observer releases its own resources without altering unrelated state."
        ),
        single(
          "hooking-review-evidence",
          "hooking-injection",
          "evidence",
          "hook and load evidence",
          "Which statement correctly limits what a Process Monitor Load Image event proves?",
          [
            "It proves that the recorded process mapped an image from the shown path at that time, but not by itself why or whether behavior was malicious.",
            "It proves a remote thread performed DLL injection in every case.",
            "It proves the image remained loaded for the complete process lifetime.",
            "It proves the file's signature is valid and trustworthy."
          ],
          0,
          "The event is direct evidence of an image-load operation associated with a process, path, and time. Causation, persistence, signer status, and intent require additional evidence from the process, file, and controlled experiment."
        )
      ]
    }
  ];

  const finalQuestions = [
    single("final-foundations-contract", "foundations", "interface", "API contract", "A BOOL-returning API documents zero as failure and says to call GetLastError. Which sequence must the Python wrapper follow?", ["Set exact argtypes/restype, call once, test zero, then capture last error immediately", "Treat every non-null Python object as success", "Call GetLastError before the API and ignore its return", "Use a 64-bit pointer as the BOOL result"], 0, "The declaration and API-specific sentinel control interpretation. Exact types prevent ABI corruption, and last error is captured only after the documented failure because another Windows call can replace it."),
    multiple("final-foundations-research", "foundations", "evidence", "research method", "Which records make an unfamiliar Windows API experiment reproducible?", ["The native signature, DLL, parameter directions, result and cleanup contracts", "The Python declarations and owned input/output objects", "The controlled input, exact result/error, and matching system evidence", "Only a screenshot of successful output", "A guess based on a similarly named function"], [0, 1, 2], "Reproducibility connects the authoritative contract to an exact Python declaration, controlled inputs, observed outputs, and external evidence. A screenshot or name resemblance omits the causal and ownership details."),

    single("final-processes-handle", "processes-handles", "ownership", "handle ownership", "A function returns a process handle and a PID. Which value must the caller use for waiting and later close?", ["The handle is waitable and caller-owned; the PID is an identifier", "The PID is closed with CloseHandle and the handle is printed only", "Both values are freed with VirtualFree", "Neither has lifetime because process objects are not kernel objects"], 0, "The handle is a reference to the process object with granted rights and wait semantics, so the caller closes it. The PID identifies a process lifetime but is not itself a handle that the caller owns."),
    single("final-processes-identity", "processes-handles", "debugging", "PID reuse diagnosis", "A stored PID now refers to a different process. Which missing evidence would have prevented the mistaken identity?", ["Creation time and a retained handle or other lifetime-bound identity evidence", "The executable's desktop shortcut color", "The system page size", "The number of Registry hives"], 0, "PIDs are reusable identifiers. Creation time, parent PID, command line, and especially a retained handle tied to the original object distinguish one process lifetime from another process that later uses the same number."),

    single("final-threads-choice", "threads-scheduling", "mechanism", "CPU versus I/O concurrency", "Why may Python threads help an I/O-bound workload but not speed CPU-bound bytecode proportionally?", ["I/O waits can overlap, while interpreter serialization and scheduling overhead limit CPU-bound parallelism", "Windows schedules files instead of threads", "CPU-bound work never uses instructions", "I/O-bound threads do not have stacks"], 0, "Waiting workers can release execution so other work proceeds, but CPU-bound Python bytecode can remain serialized and incur coordination costs. The result must be measured with the same workload and output checks."),
    multiple("final-threads-measure", "threads-scheduling", "evidence", "thread performance evidence", "Which observations support a fair comparison of two worker counts?", ["Identical input and verified output", "Elapsed time across repeated runs", "Per-thread CPU time and states, plus process CPU use", "Different partition sizes chosen after seeing results", "Changing process priority between runs"], [0, 1, 2], "A fair comparison controls input and correctness, repeats elapsed measurements, and collects evidence about both the threads and the process. Changing partition or priority introduces a confounding variable rather than explaining worker-count effects."),

    single("final-memory-region", "memory", "interface", "memory region query", "Which returned field should advance a VirtualQueryEx region walk?", ["BaseAddress plus RegionSize with pointer-sized overflow/progress checks", "AllocationProtect alone", "A fixed one-byte increment", "The process ID multiplied by page size"], 0, "VirtualQueryEx describes a contiguous region with shared attributes. Advancing to BaseAddress plus RegionSize reaches the next boundary, provided pointer-sized arithmetic detects wraparound and non-progress."),
    multiple("final-memory-cleanup", "memory", "ownership", "allocation cleanup", "Which facts are required to release a VirtualAlloc allocation correctly?", ["Retain the original allocation base", "Use the release mode and size rule documented for VirtualFree", "Ensure no code still uses pointers into the released range", "Pass any interior committed-page address with an arbitrary size", "Close the address with CloseHandle"], [0, 1, 2], "Virtual memory is not a handle. Correct release uses the allocation base and the API's release contract, after all users of the range have stopped. Interior addresses and handle cleanup express different ownership models."),

    single("final-linking-rva", "linking-loading", "mechanism", "PE mapping", "An import-table RVA is 0x2500 inside a section whose virtual address is 0x2000 and raw offset is 0x800. What raw offset follows the usual section translation?", ["0xD00", "0x2D00", "0x1D00", "0xA00"], 0, "The offset within the section is 0x2500 minus 0x2000, which is 0x500. Adding the section's raw offset of 0x800 gives 0xD00, subject to file-bounds validation."),
    multiple("final-linking-call", "linking-loading", "failure", "export call safety", "Before calling a raw export address, which contracts must match?", ["Module remains loaded", "Architecture and pointer width", "Calling convention, parameters, and result type", "The address resembles one from another process", "The export filename extension matches Python"], [0, 1, 2], "The address is usable only while its module remains mapped and when Python constructs the exact ABI for the current architecture. Numeric resemblance in another process or a filename convention supplies none of those guarantees."),

    single("final-management-pending", "management", "failure", "service pending state", "A service checkpoint advances while START_PENDING remains reported. What is the best next action?", ["Continue a bounded wait guided by the current state and checkpoint rather than declaring success", "Rewrite service state directly in the Registry", "Close Windows because every pending state is a deadlock", "Send every control code simultaneously"], 0, "An advancing checkpoint suggests that transition work is still in progress, not that the service has reached a stable running state. A controller continues bounded observation using the status fields and reports a timeout or terminal failure separately."),
    multiple("final-management-reversible", "management", "ownership", "reversible configuration", "Which steps make a Registry mutation lab reversible?", ["Record whether the key or value existed and preserve its original type and data", "Change only an exact disposable path with minimum access", "Restore or delete only what the lab changed and verify the final state", "Export the entire Registry and delete broad parent keys", "Leave test values because cleanup cannot be verified"], [0, 1, 2], "Reversibility requires a precise record of the previous state, a narrow mutation, and verified restoration that distinguishes an originally absent value from one that contained typed data. Broad deletion creates unrelated risk rather than reliable cleanup."),

    single("final-security-denied", "security", "mechanism", "authorization decision", "Why can two processes running as the same user receive different access results?", ["Their effective tokens, integrity levels, privileges, requested masks, or target contexts can differ", "A username alone permanently determines every Windows access decision", "DACLs are ignored when a process has a PID", "Access results depend only on CPU clock speed"], 0, "Authorization compares the effective security context and exact requested action with the object's access policy and mandatory integrity policy. Group attributes, privileges, integrity, impersonation, protection, and request masks can differ despite the same account name."),
    multiple("final-security-privilege", "security", "debugging", "privilege failure", "Which observations prove that a requested privilege adjustment did not fully succeed?", ["ERROR_NOT_ALL_ASSIGNED after the call returned its documented success value", "The privilege is absent from the token", "A new query shows that the privilege is not enabled", "The process name contains lowercase letters", "The target file is on an SSD"], [0, 1, 2], "The API's special last-error condition, the presence of the privilege, and its resulting attributes directly address the adjustment. Process naming and storage hardware are unrelated to whether the token contained and enabled that privilege."),

    single("final-sync-abandoned", "synchronisation", "failure", "abandoned mutex", "What does WAIT_ABANDONED mean for the calling thread?", ["It acquired mutex ownership, but protected state may be inconsistent because the prior owner ended", "It timed out without ownership", "The mutex handle was automatically closed", "Every waiting thread now owns the mutex"], 0, "WAIT_ABANDONED means that the caller acquired ownership with a warning. The caller must validate the protected invariants and release the mutex during cleanup; treating the result as a timeout would leak ownership and hide possible corruption."),
    ordering("final-sync-order", "synchronisation", "ownership", "synchronized update", "Order the essential steps for a bounded mutex-protected update.", [{ id: "release", label: "Release the mutex only when this thread acquired ownership" }, { id: "update", label: "Validate the invariant and update all protected state" }, { id: "wait", label: "Wait with a bounded timeout and handle the exact result" }, { id: "open", label: "Open the intended mutex with synchronization access" }], ["open", "wait", "update", "release"], "Object identity comes first, and then the wait result establishes whether ownership was acquired. Only code that acquired ownership may touch the protected state, and guaranteed cleanup releases exactly that ownership."),

    single("final-ipc-eof", "ipc", "ownership", "pipe endpoint lifetime", "A child exits but the parent still never sees EOF on redirected output. Which handle should be investigated first?", ["An unused write-end copy retained or inherited by the parent or another process", "The parent's read handle because readers generate EOF", "The process ID because it must be closed", "A Registry key under the pipe name"], 0, "EOF appears only after all write endpoints close and buffered data is consumed. A forgotten or inherited write copy keeps the stream logically open even after the intended child writer exits."),
    multiple("final-ipc-message", "ipc", "failure", "message framing", "Which rules prevent corrupt decoding of a partial message-mode pipe response?", ["Accumulate fragments until the protocol reports a complete message", "Enforce a maximum total size", "Decode only after assembling the complete byte sequence with the agreed encoding", "Decode each fragment separately regardless of character boundaries", "Treat ERROR_MORE_DATA as zero bytes returned"], [0, 1, 2], "Message mode preserves boundaries, but a buffer can still receive the message in fragments. Bounded accumulation and decoding after complete assembly preserve both framing and multibyte character boundaries without discarding partial bytes."),

    single("final-hooking-observation", "hooking-injection", "evidence", "defensive load evidence", "What does an unexpected module in a snapshot of a process you started establish by itself?", ["Only that the module was observed mapped at that time; cause and intent need correlated evidence", "That a remote-thread injection definitely occurred", "That the file is unsigned and malicious", "That the module was present before process creation"], 0, "A snapshot directly supports presence at one point in time. Establishing how, when, and why the module loaded requires process identity, baselines, image-load traces, path and signature evidence, and controlled reproduction."),
    multiple("final-hooking-compatibility", "hooking-injection", "interface", "cross-process compatibility", "Which facts must a defensive cross-process memory inspector establish before interpreting addresses and structures?", ["The architectures and pointer widths of the caller and target", "The exact process identity and minimum query and read rights", "The structure ABI and valid target address ranges", "An address resolved in the caller must be valid remotely", "All processes use identical module bases"], [0, 1, 2], "Cross-process interpretation depends on target identity, access, architecture, and ABI. Address values and module bases belong to a particular process context, so the inspector validates them rather than transferring assumptions from the local process."
    )
  ];

  const practical = {
    id: "final-owned-target-investigation",
    title: "Final practical: explain a failed inspection of a controlled target",
    scenario: "You maintain a read-only diagnostic Python utility for a purpose-built 64-bit lab process that you own. It opens the process with PROCESS_QUERY_INFORMATION and walks region metadata with VirtualQueryEx. Separately, it calls CreateToolhelp32Snapshot with TH32CS_SNAPMODULE | TH32CS_SNAPMODULE32, initializes MODULEENTRY32.dwSize, and enumerates modules with Module32First and Module32Next. The 64-bit utility succeeds. The same source launched by 32-bit Python still opens the target for region queries, but its 32-to-64 module snapshot returns INVALID_HANDLE_VALUE with ERROR_PARTIAL_COPY instead of returning a malformed module structure. A deliberately over-broad process-open attempt also reports access denied. Design a controlled investigation and an architecture-compatible fallback without modifying target memory, starting remote execution, disabling protections, or testing unrelated processes.",
    prompts: [
      { id: "contract", label: "Choose the contract", prompt: "Explain why VirtualQueryEx requires PROCESS_QUERY_INFORMATION, while Tool Help module enumeration returns a separate snapshot handle that the caller owns. State the zero and INVALID_HANDLE_VALUE sentinels, immediate error rules, and output structures." },
      { id: "compatibility", label: "Check compatibility", prompt: "Explain how you will establish caller and target architecture, pointer width, structure layout, and which address values belong to which process context before interpreting results." },
      { id: "outcomes", label: "Predict branches", prompt: "Predict successful region queries, zero-return termination or failure, access denied, target exit, Module32First or Module32Next completion, and the documented ERROR_PARTIAL_COPY branch for a 32-bit module snapshot of a 64-bit target." },
      { id: "evidence", label: "Correlate evidence", prompt: "Choose only tools and views that answer the question, then list the PID, times, paths, regions, result codes, and tool observations that connect internal output to Windows state." },
      { id: "ownership", label: "Account for ownership", prompt: "Inventory every acquired process, snapshot, module, mapping, buffer, and callback-related resource, identifying which are owned, borrowed, pseudo-handles, or Python-managed objects." },
      { id: "cleanup", label: "Plan cleanup", prompt: "Give the cleanup order for every branch and explain how the utility preserves its primary Windows result or error while later cleanup calls run and may alter thread-local error state." }
    ],
    evidenceExpectations: [
      "Process identity includes the PID, creation time, path, and architecture, tying the evidence to the exact lab target you created.",
      "Memory evidence distinguishes base address, region size, state, protection, type, and a bounded termination condition.",
      "Module evidence records full path and load presence and is correlated with image-load events rather than inferred from names alone.",
      "Failure evidence preserves the exact requested access, documented sentinel, immediate error code, and whether the target remained alive.",
      "Observed facts are separated from explanations that still require an experiment or authoritative contract."
    ],
    modelReasoning: [
      { id: "model-outcome", title: "Start from the outcome", body: "The task is read-only identity, region, and module inspection, so mutation, allocation, writing, hook installation, and remote-thread rights are outside the contract." },
      { id: "model-rights", title: "Request minimum rights", body: "Open only the lab target with PROCESS_QUERY_INFORMATION for VirtualQueryEx. Tool Help creates a separate snapshot handle rather than consuming process-handle rights. Report the over-broad denial as expected policy evidence rather than escalating automatically." },
      { id: "model-abi", title: "Treat ABI as evidence", body: "Record both architectures, declare MEMORY_BASIC_INFORMATION and MODULEENTRY32 with pointer-sized fields, and initialize MODULEENTRY32.dwSize. A 32-bit caller must not reinterpret a failed 64-bit module snapshot as a malformed returned structure." },
      { id: "model-results", title: "Branch on documented results", body: "VirtualQueryEx returns zero on failure or termination and exposes extended error according to its contract. CreateToolhelp32Snapshot returns INVALID_HANDLE_VALUE; 32-to-64 module enumeration reports ERROR_PARTIAL_COPY, so rerun that module phase with an architecture-compatible 64-bit observer." },
      { id: "model-tools", title: "Correlate precise views", body: "Use Process Explorer for live identity, architecture, handles, regions, and modules where available. Use Process Monitor for time-ordered process and image-load evidence. Add VMMap only when its region classifications answer a memory question." },
      { id: "model-ownership", title: "Close what you own", body: "Retain and close the real process handle and every successful Tool Help snapshot handle exactly once. INVALID_HANDLE_VALUE is a failure sentinel, not a snapshot that the caller owns. Release Python-managed buffers only after their calls have completed." },
      { id: "model-error", title: "Preserve the primary failure", body: "Store the operation's result and error before cleanup, run cleanup in reverse ownership order, then report the stored failure together with cleanup failures without replacing the original cause." }
    ]
  };

  window.ILOVEOS_ASSESSMENTS = {
    moduleReviews,
    finalAssessment: {
      id: "final-assessment",
      title: "Final operating systems assessment",
      summary: "Twenty cumulative questions sample all ten modules, followed by one controlled practical reasoning scenario.",
      questions: finalQuestions,
      practical
    }
  };
})();
