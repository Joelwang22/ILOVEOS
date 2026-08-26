window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "threads-in-processes": {
    apis: ["threading.Thread", "threading.get_native_id", "win32api.GetCurrentThreadId", "win32api.GetCurrentProcess", "win32process.GetThreadTimes"],
    phases: {
      learn: ["Separate process from thread", "Relate the shared process container to the execution state that Windows schedules for each thread."],
      windows: ["Identify native workers", "Correlate Python thread names, Windows TIDs, stacks, CPU, and I/O events."],
      investigation: ["Observe one process, many workers", "Create known threads and classify which state is shared or private."],
      review: ["Check the thread model", "Test scheduling scope, sharing, concurrency, parallelism, and Python runtime limits."]
    },
    learning: [
      {
        title: "A process supplies resources, a thread supplies an execution path",
        paragraphs: [
          "Every ordinary process begins with at least one thread. The process owns the virtual address space, mapped code, heaps, handle table, and default security context. A thread supplies the instruction pointer, register context, stacks, scheduling state, priority, and thread-local storage needed to execute inside that container.",
          "Threads in one process can pass a normal pointer because they share the address space. They can also use the same process handle-table entry. This makes cooperation cheaper than cross-process IPC, but one incorrect write, premature close, or unhandled exception can damage state used by every other thread. Isolation exists between processes, not automatically between sibling threads."
        ]
      },
      {
        title: "Concurrency describes overlap, parallelism describes simultaneous execution",
        paragraphs: [
          "Two tasks are concurrent when their lifetimes overlap and each can make progress before the other finishes. One logical processor can produce concurrency by switching between ready threads. Parallelism requires two or more logical processors executing threads at the same instant. Creating several threads provides candidates for parallelism but does not guarantee placement, readiness, or useful work.",
          "A blocked thread consumes little CPU while waiting for I/O, a timer, a lock, or a dispatcher object. Another ready thread can use that interval. This is why I/O workloads often benefit from modest concurrency even when one storage device ultimately serializes some operations."
        ],
        inlineCheck: ["Two worker threads alternate on one logical processor and both finish during the same one-second interval. Which description is justified?", ["Parallel but not concurrent", "Concurrent, not necessarily parallel", "Neither concurrent nor parallel", "Two separate processes"], 1, "Their lifetimes and progress overlap, so they are concurrent. One logical processor cannot execute both at the same instant."]
      },
      {
        title: "CPython threads are native Windows threads with a runtime constraint",
        paragraphs: [
          "threading.Thread creates native operating-system threads, so Process Explorer and Process Monitor can observe their Windows TIDs. In the standard CPython build, the global interpreter lock normally permits only one thread at a time to execute ordinary Python bytecode within one interpreter. That limits CPU-bound Python parallelism but does not make threads fake or useless.",
          "Blocking file and network operations release the GIL, and some native extensions release it during computation. Those intervals allow other Python threads to run. CPU-heavy pure Python commonly needs multiprocessing, subinterpreters with appropriate runtime support, or native code that releases the GIL. Choose from the actual workload rather than the slogan that threads are always fast or never parallel."
        ]
      }
    ],
    visuals: [
      {
        type: "layers",
        title: "One process containing three schedulable threads",
        intro: "Shared state reduces communication cost while per-thread contexts preserve independent execution.",
        items: [
          { meta: "Shared container", label: "Address space and heaps", detail: "Code, globals, objects, mapped files", linkAfter: "plus" },
          { meta: "Shared capabilities", label: "Handle table and token", detail: "Files, events, processes, default identity", linkAfter: "used by" },
          { meta: "Thread A", label: "Context, stacks, TID", detail: "Running CPU work", linkAfter: "alongside" },
          { meta: "Thread B", label: "Context, stacks, TID", detail: "Waiting for file I/O", linkAfter: "and" },
          { meta: "Thread C", label: "Context, stacks, TID", detail: "Ready for dispatch" }
        ],
        caption: "Windows can schedule each ready thread independently. A shared handle or Python object still needs an application ownership and synchronization policy."
      }
    ],
    workedExamples: [
      {
        type: "trace",
        title: "How I/O threads overlap without proving disk parallelism",
        prompt: "Three workers each read a different controlled file and then summarize its size.",
        steps: [
          { title: "Worker A issues a read", action: "A enters the operating system and waits for the data unless the request can be completed from the cache.", why: "A waiting thread no longer needs the processor.", result: "A is waiting, so another ready thread can run." },
          { title: "Worker B runs", action: "Windows dispatches B, which issues its own read.", why: "The process remains runnable because B has an independent context.", result: "Two logical I/O requests are outstanding or progressing through the stack." },
          { title: "Worker C runs", action: "C performs its file operation while A or B remains blocked.", why: "Concurrency uses otherwise idle wait intervals.", result: "Process Monitor attributes operations to three TIDs." },
          { title: "Completions make workers ready", action: "Each completion moves its waiting worker back toward execution.", why: "Completion does not guarantee immediate dispatch; priority and processor availability still apply.", result: "Workers finish and join returns after all three terminate." }
        ],
        conclusion: "The trace supports overlapping worker lifetimes and the issuance of multiple logical I/O requests. Proving physical storage parallelism requires deeper evidence."
      }
    ],
    windowsLearning: [
      {
        title: "Use native TIDs to join Python and Windows evidence",
        paragraphs: [
          "threading.get_native_id returns the Windows thread ID for the calling Python thread. Print it with a meaningful Python thread name, then match it in Process Explorer's Threads tab and Process Monitor's TID column. threading.get_ident is a Python runtime identifier and should not be assumed to equal the native TID.",
          "TIDs can be reused after termination. Pair the value with the containing PID, process creation time, and observation interval. A short-lived worker may disappear from Process Explorer before refresh while its recorded Process Monitor events remain available."
        ]
      },
      {
        title: "Thread start addresses and stacks need interpretation",
        paragraphs: [
          "A start address identifies the native routine where the thread began, often in a runtime helper rather than the Python function name. A stack can show Python and Windows runtime layers, I/O waits, or synchronization calls when symbols and permissions permit. Do not label an unfamiliar runtime start address as injection without corroborating evidence.",
          "CPU percentage, context-switch delta, and state are momentary or interval measurements. Sample several times and connect them to the controlled work phase. A worker waiting at a prompt should look different from the same worker reading files or performing a busy loop."
        ]
      }
    ],
    practice: {
      title: "See one process, many workers",
      time: "25 min",
      intro: "Use thread_observer_lab.py to connect Python worker names to native TIDs and file events.",
      download: ["downloads/thread_observer_lab.py", "thread_observer_lab.py"],
      expectedOutcome: "The process contains the main thread plus three named workers. Each worker prints a distinct native TID, waits at a shared start gate, reads a different temporary file, and stores a result in process memory. Process Explorer matches the selected TIDs while they are alive, and Process Monitor attributes each file sequence to its worker TID.",
      steps: [
        {
          action: "Download thread_observer_lab.py, open PowerShell in its folder, run this command, and leave it at 'Inspect the waiting workers'.",
          commands: [{ label: "PowerShell", code: "py .\\thread_observer_lab.py" }],
          why: "The start gate keeps all three ILOVEOS-worker threads alive long enough for a reliable snapshot.",
          observe: "thread_observer_lab.py prints the process PID, the main thread's native TID, the native TIDs for worker-0 through worker-2, and three controlled file paths. If the py launcher is unavailable, the resulting error indicates that Python still needs to be set up."
        },
        { action: "Select the PID printed by thread_observer_lab.py in Process Explorer, open Properties > Threads, select each printed worker TID in turn, and inspect Start Address and Stack while the first prompt remains active.", why: "Selecting the exact TID joins the runtime worker name with Windows scheduling identity.", observe: "Each printed worker TID appears in Properties > Threads. Start Address can show a runtime helper, while Stack can show resolved modules or raw addresses when symbols are unavailable." },
        { action: "In Process Monitor, add an Include filter where PID is the printed PID. Use Options > Select Columns to show the TID, clear the display, and resume capture. Press Enter once in thread_observer_lab.py, then pause the capture immediately after the script prints its joined results.", why: "A narrow interval connects each known worker with its file operations.", observe: "When captured, the CreateFile, ReadFile, and CloseFile rows for each controlled path contain one of the printed worker TIDs. A missing row is a capture limitation and must not be attributed to another TID." },
        { action: "After thread_observer_lab.py prints the joined results dictionary and exits, refresh Process Explorer and check the three controlled paths.", why: "This final check confirms both the thread lifetimes and TemporaryDirectory cleanup.", observe: "The printed PID and worker TIDs are no longer active, and the three temporary paths are removed when the supplied TemporaryDirectory closes." }
      ],
      hints: [{ title: "A worker is missing from Process Explorer", body: "Restart thread_observer_lab.py and keep it at the first prompt. The worker must still be alive when Process Explorer refreshes." }],
      cleanup: ["If thread_observer_lab.py is still waiting, press Enter once so it joins all workers and removes its temporary files.", "Leave Process Monitor capture stopped and clear only the events displayed for this lab."]
    },
    checks: [
      ["Which state is normally shared by threads in one process?", ["Register context", "User stack", "Virtual address space", "Native TID"], 2, "Sibling threads share the process address space while keeping independent contexts, stacks, and IDs."],
      ["What does CPython's GIL mainly limit?", ["Creation of native Windows threads", "Simultaneous execution of ordinary Python bytecode in one interpreter", "All overlapping I/O", "Process Monitor TID capture"], 1, "Native threads still exist and blocking work can overlap, but ordinary bytecode execution is generally serialized within one interpreter."],
      ["How can you match a Python worker to its Process Monitor file event?", ["Use only the executable path", "Match the worker's native TID within the captured PID and time interval", "Match the file extension", "Match the process publisher"], 1, "The PID and native thread ID provide the strongest match, supported by the controlled path and timestamps."]
    ]
  },

  "thread-context-states": {
    phases: {
      learn: ["Follow resumable execution", "Connect registers, stacks, state transitions, waiting, and processor dispatch."],
      windows: ["Read live thread state", "Interpret start addresses, waits, CPU samples, and stacks without unsafe suspension."],
      investigation: ["Classify three workers", "Observe busy, delayed, and event-waiting threads through controlled state changes."],
      review: ["Check context and state", "Test ready, running, waiting, suspended, terminated, stack, and context distinctions."]
    },
    learning: [
      {
        title: "A context is the information required to resume a thread",
        paragraphs: [
          "The architectural context includes instruction pointer, stack pointer, general registers, flags, and other processor state such as floating-point or vector registers. When Windows switches execution, it preserves the outgoing thread's required context and restores the selected thread's context. The exact structure differs between x86, x64, and ARM64.",
          "Debugging APIs can read or modify a stopped thread's context with suitable access, but ordinary application coordination should not manipulate registers. A live context is changing while the thread runs, which is why debugger-style access requires careful suspension and architecture-aware structures."
        ]
      },
      {
        title: "User-mode and kernel-mode execution use different stacks",
        paragraphs: [
          "The user stack stores call frames, return addresses, saved registers, and local data for user-mode execution. On a kernel transition, Windows uses a kernel stack associated with the thread so privileged code does not rely on writable user stack memory for its own control flow. Stack traces cross these layers when symbols and permissions allow.",
          "Each thread reserves stack address space and commits pages as needed. Thousands of threads therefore consume address space and some committed memory even when most are idle. Deep recursion and large per-thread local allocations can exhaust a stack independently of the process heap."
        ]
      },
      {
        title: "Ready, running, and waiting answer different scheduling questions",
        paragraphs: [
          "A running thread currently owns a logical processor. A ready thread can run but has not been selected. A waiting thread cannot proceed until a condition is satisfied, such as I/O completion, a signaled event, an available mutex, or a delay expiration. When the condition completes, the thread becomes ready before it can run again.",
          "Suspending a thread increments its suspend count; it is not a wait for an application condition. Suspending an arbitrary thread can freeze it while it owns a lock or while a runtime data structure is inconsistent. Use events, condition variables, queues, and cooperative protocols for synchronization."
        ],
        inlineCheck: ["An event becomes signaled for a waiting thread. Which state can the thread normally enter before it executes?", ["Ready", "Terminated only", "It must remain waiting forever", "A new process"], 0, "Satisfying the wait makes the thread eligible. It becomes ready and runs when the scheduler selects it."]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "The useful thread-state cycle",
        intro: "The internal scheduler has more states, but this model explains the decisions visible in course investigations.",
        items: [
          { meta: "Eligible", label: "Ready", detail: "Can execute, waiting for a processor", linkAfter: "dispatch" },
          { meta: "Executing", label: "Running", detail: "Context loaded on one logical processor", linkAfter: "wait or preempt" },
          { meta: "Blocked", label: "Waiting", detail: "Condition, I/O, delay, or object not satisfied", linkAfter: "condition completes" },
          { meta: "Eligible again", label: "Ready", detail: "May wait behind higher-priority work", linkAfter: "eventually" },
          { meta: "Complete", label: "Terminated", detail: "No more execution; object can remain referenced" }
        ],
        caption: "Preemption can move a running thread directly back to ready. Suspension is a separate administrative condition and should not be used as ordinary coordination."
      }
    ],
    workedExamples: [
      {
        type: "comparison",
        title: "Three workers observed at the same instant",
        prompt: "A script starts one busy loop, one time.sleep call, and one worker waiting on an event.",
        columns: [
          { title: "Busy worker", rows: [["Likely condition", "Running or ready"], ["CPU", "Accumulates while dispatched"], ["Wake condition", "None until loop ends or cooperatively stops"], ["Risk", "Can reduce responsiveness if priority is raised carelessly"]] },
          { title: "Sleep or event worker", rows: [["Likely condition", "Waiting"], ["CPU", "Little while the wait remains unsatisfied"], ["Wake condition", "Timer expiry or event signal"], ["After wake", "Becomes ready before running"]] }
        ],
        shared: "Both waiting mechanisms prevent the worker from consuming CPU while it waits, but a delay is time-based whereas an event represents an explicit state change.",
        conclusion: "A low CPU sample does not mean the thread is useless or terminated. It may be correctly waiting."
      }
    ],
    windowsLearning: [
      {
        title: "Process Explorer samples a moving system",
        paragraphs: [
          "The Threads tab provides TID, CPU, context-switch information, start address, and stack inspection when available. State and wait information can change between refreshes. Sample several times during a controlled phase and treat a single row as one observation, not a permanent property.",
          "A native start address often points to a runtime bootstrap function. The current stack is usually more informative about what the thread is doing now. Missing symbols, protected processes, and rapidly changing stacks limit interpretation and should be recorded."
        ]
      },
      {
        title: "Context APIs are diagnostics tools with strict rights",
        paragraphs: [
          "OpenThread requests specific access to a live thread object. GetThreadContext requires appropriate query or context rights and a correctly initialized architecture-specific CONTEXT structure. The target generally must be suspended for a coherent user-mode context, which introduces the lock and invariance hazards discussed above.",
          "This course uses Process Explorer stacks and controlled workers for ordinary observation. Direct context manipulation belongs to debugger, crash-analysis, and carefully isolated diagnostic scenarios, not to application pause or cancellation design."
        ]
      }
    ],
    practice: {
      title: "Observe live thread states",
      time: "25 min",
      intro: "Use thread_states_lab.py with busy, delay, and event-wait workers so each observed phase has a known cause.",
      download: ["downloads/thread_states_lab.py", "thread_states_lab.py"],
      expectedOutcome: "The busy worker should accumulate CPU and alternate between running and ready. The sleep worker should consume little CPU while waiting for its timer. The event worker should consume little CPU until the main thread signals it, then become ready, run briefly, and terminate. Exact displayed wait reasons and stacks vary by symbols and timing.",
      steps: [
        {
          action: "Download thread_states_lab.py, open PowerShell in its folder, run this command, and leave all three workers in the first controlled phase.",
          commands: [{ label: "PowerShell", code: "py .\\thread_states_lab.py" }],
          why: "Named workers and printed native TIDs create a ground-truth map for live inspection.",
          observe: "thread_states_lab.py prints the PID, the main thread's native TID, and the TIDs labelled busy, delay, and event. If the py launcher is unavailable, the resulting error indicates that Python still needs to be set up."
        },
        { action: "Select the PID printed by thread_states_lab.py in Process Explorer, open Properties > Threads, select the busy, delay, and event TIDs in turn, and refresh several times without suspending them.", why: "Thread state is dynamic, so repeated snapshots are more reliable than one refresh.", observe: "The busy TID accumulates CPU while delay and event TIDs wait. Each selected TID exposes Start Address and Stack; state or symbols can remain unavailable." },
        { action: "When thread_states_lab.py displays the 'Signal the event worker' prompt, press Enter once. Then refresh Properties > Threads in Process Explorer.", why: "The explicit trigger demonstrates the progression from waiting through ready and running to termination.", observe: "thread_states_lab.py prints 'event worker observed its signal', and the printed event TID disappears. A brief ready or running transition may occur between refreshes." },
        { action: "At the second thread_states_lab.py prompt, press Enter to set both the delay-stop and busy-stop events; this does not wait for the delay worker's 30-second timeout.", why: "Two cooperative stop events demonstrate that waiting and cancellation are designed conditions.", observe: "Confirm 'delay worker finished', 'busy worker stopped', and 'all explicit workers joined', then verify both recorded TIDs disappear." },
        { action: "Refresh Process Explorer after thread_states_lab.py exits.", why: "The final refresh confirms that all controlled workers and the process have terminated.", observe: "The printed PID and all three worker TIDs are absent. If the process remains, return to the second prompt and press Enter once." }
      ],
      safety: "Inspect only the supplied process. Do not suspend or change the context of arbitrary application or system threads.",
      hints: [{ title: "The wait reason is not visible", body: "Use CPU behavior, the named thread_states_lab.py phase, and available stack frames without guessing an unavailable wait reason." }],
      cleanup: ["If thread_states_lab.py is still waiting, use its two supplied prompts to release every worker.", "Close Process Explorer thread property windows."]
    },
    checks: [
      ["What does ready mean?", ["The thread currently owns a processor", "The thread can run when selected", "The thread has terminated", "The thread is permanently suspended"], 1, "A ready thread is eligible but not currently executing."],
      ["Why is arbitrary suspension unsafe as synchronization?", ["It always changes the PID", "The thread may hold locks or leave invariants unfinished", "Suspended threads use every CPU", "It automatically closes handles"], 1, "Suspension can freeze a thread at any instruction, including inside a critical section or runtime update."],
      ["Why does a thread have a kernel stack?", ["To store the executable file", "To support privileged execution without trusting the user stack", "To replace the process heap", "To increase its PID"], 1, "Kernel-mode execution uses protected stack state associated with the thread."]
    ]
  },

  "create-end-threads": {
    phases: {
      learn: ["Own the thread lifecycle", "Connect creation, cooperative work, cancellation, joining, termination, and object cleanup."],
      windows: ["Choose the correct creation surface", "Prefer runtime-aware Python threads while understanding native waitable thread objects."],
      investigation: ["Shut workers down cleanly", "Inject cancellation and failure while preserving cleanup and shared-state invariants."],
      review: ["Check lifecycle ownership", "Test start, join, cancellation, exception, termination, and handle-lifetime rules."]
    },
    learning: [
      {
        title: "Creation allocates more than a function call",
        paragraphs: [
          "Creating a thread constructs a kernel thread object, assigns a TID, reserves stack address space, commits initial stack pages, initializes scheduling state, and arranges a start routine and argument. Python's threading.Thread also creates runtime bookkeeping and a bootstrap that invokes the target callable.",
          "The call to start returns before the worker finishes. The creator must decide who owns inputs, outputs, cancellation, exceptions, and shared resources. Starting a thread without a completion and cleanup policy is an incomplete lifetime design."
        ]
      },
      {
        title: "Join waits for completion, cancellation requests completion",
        paragraphs: [
          "join blocks the caller until a worker terminates or an optional timeout expires. It does not ask the worker to stop. Cooperative cancellation uses a flag, event, queue sentinel, or another protocol that the worker checks at safe points. The owner requests cancellation, workers restore their own invariants in their finally blocks, and the owner joins them before destroying shared resources.",
          "A cancellation check must occur often enough for responsive shutdown but not inside a state transition that must remain atomic. Blocking calls may need timeouts or waitable cancellation objects so a worker can observe the request instead of hanging indefinitely."
        ],
        inlineCheck: ["What operation asks a Python worker to stop?", ["join by itself", "A cooperative cancellation protocol the worker checks", "Reading its TID", "Closing the process image"], 1, "join only waits. The program needs an explicit cancellation request and worker-side response."]
      },
      {
        title: "Forced termination can strand the whole process",
        paragraphs: [
          "TerminateThread stops a native thread at an arbitrary instruction. User-mode finally blocks do not run, locks may remain held, heap or runtime operations may be interrupted, and shared data can retain a half-updated invariant. The damage affects sibling threads because they share the process container.",
          "The preferred normal exit is returning from the entry function. An unhandled Python exception also ends that worker after Python unwinds its frames, but the application must still surface the failure and decide whether sibling work remains valid. Silently losing one worker can produce incomplete output that looks successful."
        ]
      },
      {
        title: "Execution can end before the thread object is deleted",
        paragraphs: [
          "A terminated thread is signaled and can still be waited on or queried through an existing handle. The kernel object remains while handles or internal references exist. Closing a thread handle releases one reference; it does not terminate a running thread.",
          "Python Thread objects are runtime wrappers, not raw handles exposed for arbitrary Windows operations. Use Python's start, join, and synchronization primitives for Python workers. Use native handles only when a documented API or diagnostic task genuinely requires them."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "A cooperative worker lifecycle",
        intro: "The owner and worker each have responsibilities before shared resources can be released.",
        items: [
          { meta: "Prepare", label: "Create inputs and stop event", detail: "Ownership exists before start", linkAfter: "start" },
          { meta: "Run", label: "Worker performs bounded units", detail: "Checks cancellation at safe points", linkAfter: "request" },
          { meta: "Cancel", label: "Owner signals stop", detail: "A request, not forced termination", linkAfter: "worker" },
          { meta: "Unwind", label: "Worker's finally block cleans up", detail: "Restores invariants and reports failure", linkAfter: "owner" },
          { meta: "Join and release", label: "All workers are complete", detail: "The owner can now close shared files and handles" }
        ],
        caption: "If a worker can block forever, the design needs a cancellation-aware wait or another bounded shutdown policy before join can be reliable."
      }
    ],
    workedExamples: [
      {
        type: "decision",
        title: "Choose a shutdown response",
        prompt: "The application needs to stop three workers that write through one shared output owner.",
        steps: [
          { title: "Give workers a safe stopping point", action: "Use a shared stop event checked between bounded units of work.", why: "Each worker can stop where its local state is consistent.", result: "Signal, join, then close shared output." },
          { title: "Put a bound on blocking operations", action: "Add a timeout, queue sentinel, or wait set that includes cancellation.", why: "A worker that never observes cancellation can make join hang forever.", result: "Shutdown latency becomes bounded and testable." },
          { title: "Propagate worker failures", action: "Capture each exception and return it to the owner.", why: "A worker exception must affect the operation's final success decision.", result: "Cancel siblings if required, join all workers, then report the failure." },
          { title: "Avoid forced termination", action: "Redesign the blocking or ownership protocol instead.", why: "TerminateThread cannot guarantee that locks, heaps, files, or runtime state remain consistent.", result: "Normal control flow retains cleanup guarantees." }
        ],
        conclusion: "A shutdown protocol is part of the worker API, not an emergency feature added after the thread starts."
      }
    ],
    windowsLearning: [
      {
        title: "Prefer threading.Thread for Python code",
        paragraphs: [
          "Python's threading module initializes the interpreter's required per-thread state and integrates exceptions, naming, daemon policy, and joins. Raw CreateThread is appropriate for native code designed for that ABI, but language runtimes can require their own creation entry points. Course Python code should not call CreateThread merely to appear lower level.",
          "A process often has more threads than the application explicitly created because Python, debuggers, UI frameworks, or libraries can create runtime workers. The supplied thread-overdose experiment suggests that N worker threads often produce roughly N plus one threads in total, but this is an expectation rather than a guaranteed count. Measure the process."
        ]
      },
      {
        title: "Daemon threads change shutdown policy, not cleanup correctness",
        paragraphs: [
          "Python can exit when only daemon threads remain, which can stop their work without an orderly application-level completion protocol. Daemon threads are useful for background helpers whose abrupt process exit is acceptable, but they are not a substitute for closing files, flushing required output, or preserving transactions.",
          "For course exercises, use non-daemon workers, explicit cancellation, and join each worker. This keeps shutdown observable and lets Process Explorer confirm that the thread count returns to the expected baseline before the process exits."
        ]
      }
    ],
    codeWalkthroughs: [
      {
        title: "Build cooperative cancellation and exception propagation",
        intro: "The worker owns local cleanup, while the main thread owns group cancellation and final success.",
        stages: [
          { title: "Create shared control and error channels", explanation: "An Event communicates cancellation. A Queue moves exceptions back to the owner without unsynchronized shared mutation.", code: "import queue\nimport threading\n\nstop = threading.Event()\nerrors = queue.Queue()" },
          { title: "Check cancellation around bounded work", explanation: "The worker's finally block runs even when its work raises an exception, so the worker can release the resource it owns.", code: "def worker():\n    try:\n        while not stop.wait(0.1):\n            do_one_bounded_unit()\n    except BaseException as error:\n        errors.put(error)\n        stop.set()\n    finally:\n        release_worker_resource()" },
          { title: "Join before group cleanup", explanation: "The owner waits for every worker, then treats a queued failure as operation failure.", code: "stop.set()\nfor thread in threads:\n    thread.join()\nif not errors.empty():\n    raise errors.get()" }
        ]
      }
    ],
    practice: {
      title: "Observe clean worker shutdown",
      time: "20 min",
      intro: "Use thread_shutdown_lab.py to expose normal completion, cancellation, and injected failure with fixed output paths.",
      download: ["downloads/thread_shutdown_lab.py", "thread_shutdown_lab.py"],
      expectedOutcome: "Three non-daemon workers should perform bounded units, respond to one stop event, run the cleanup in their finally blocks, and be joined before the main thread closes the shared report. In failure mode, one worker should report an injected exception, request cancellation of its siblings, and cause the program to finish with a visible failure after every worker has been joined.",
      steps: [
        {
          action: "Download thread_shutdown_lab.py, open PowerShell in its folder, and run the normal mode with an explicit report path.",
          commands: [{ label: "PowerShell", code: "$normalLog = Join-Path $PWD 'thread_shutdown_normal.log'\n$failLog = Join-Path $PWD 'thread_shutdown_fail.log'\nforeach ($ownedLog in @($normalLog, $failLog)) { if (Test-Path -LiteralPath $ownedLog) { throw \"Remove or rename the existing lab file first: $ownedLog\" } }\npy .\\thread_shutdown_lab.py normal --output .\\thread_shutdown_normal.log" }],
          why: "The successful path establishes the order of startup, bounded work, cooperative stopping, cleanup in finally blocks, and joins.",
          observe: "The bounded run prints one PID and three native worker TIDs, followed by messages showing that the main thread requested a cooperative stop, all three workers cleaned up, every worker was joined, and the program completed normally. A collision error protects pre-existing logs."
        },
        {
          action: "Run the failure mode with a separate explicit report path, and preserve the nonzero command result as expected evidence.",
          commands: [{ label: "PowerShell", code: "py .\\thread_shutdown_lab.py fail --output .\\thread_shutdown_fail.log" }],
          why: "Failure handling is part of lifecycle ownership, not an afterthought reserved for exceptional cases.",
          observe: "The command prints the injected worker-1 failure, sibling cleanup messages, 'all workers joined,' and 'worker failure propagated to main.' It then returns the expected nonzero exit code 1."
        },
        {
          action: "After the normal and failure modes finish, run this PowerShell block to display both complete logs created by the lab.",
          commands: [{ label: "PowerShell", code: "Get-Content -LiteralPath .\\thread_shutdown_normal.log\nGet-Content -LiteralPath .\\thread_shutdown_fail.log" }],
          why: "The file output confirms that worker cleanup occurred before the shared report closed in both modes.",
          observe: "Both logs contain worker cleanup rows. The failure log retains cleanup rows even though failure mode returned exit code 1."
        },
        {
          action: "Run this PowerShell cleanup block for the two explicit log paths.",
          commands: [{ label: "PowerShell", code: "$ownedLogs = @('.\\thread_shutdown_normal.log', '.\\thread_shutdown_fail.log')\nforeach ($ownedLog in $ownedLogs) { if (Test-Path -LiteralPath $ownedLog) { Remove-Item -LiteralPath $ownedLog } }\n$ownedLogs | ForEach-Object { Test-Path -LiteralPath $_ }" }],
          why: "Cleanup is limited to the two explicitly named files created by the preceding commands.",
          observe: "PowerShell prints False twice. A True result identifies a lab-created log that still remains."
        }
      ],
      hints: [{ title: "The program waits briefly after cancellation", body: "Workers check the event around bounded units. Shutdown latency is bounded by the longest unit or wait timeout, not necessarily instantaneous." }],
      cleanup: ["Allow every worker to join; do not close the terminal during the cleanup messages.", "The final PowerShell block removes only thread_shutdown_normal.log and thread_shutdown_fail.log."]
    },
    checks: [
      ["What happens when one thread calls join on another?", ["The worker terminates immediately", "The caller waits for the worker to finish", "Windows creates a new thread ID", "The worker receives a priority boost"], 1, "join waits for completion; it does not request cancellation. The worker must finish through its normal control flow."],
      ["Why can TerminateThread corrupt sibling work?", ["Threads share process state and locks", "It creates a new process", "It always deletes the executable", "It only changes wall time"], 0, "Forced termination can interrupt shared-state updates and leave locks or runtime structures inconsistent."],
      ["When should shared resources normally be released?", ["Before workers receive inputs", "After cancellation is requested but before joins", "After every worker that can use them has completed", "Only at system shutdown"], 2, "Join establishes that no worker will continue using the shared resource before the owner closes it."]
    ]
  },

  "scheduler-dispatch": {
    phases: {
      learn: ["Model dispatch", "Follow how ready state, priority, processor availability, affinity, and time determine selection."],
      windows: ["Measure useful concurrency", "Connect worker count to CPU, context switches, I/O, memory, the GIL, and cache state."],
      investigation: ["Find the useful worker region", "Reproduce a scaling curve with controlled files and repeatable measurements."],
      review: ["Check scheduler reasoning", "Test dispatch, affinity, context-switch cost, workload size, and benchmark limits."]
    },
    learning: [
      {
        title: "Scheduling is preemptive, priority-driven, and performed for logical processors",
        paragraphs: [
          "A logical processor runs one scheduled thread at an instant. Windows selects from ready threads, preferring higher dynamic priority. A newly ready higher-priority thread can preempt lower-priority work. Among comparable candidates, queue order, time-slice policy, processor locality, and other scheduler decisions influence who runs next.",
          "The scheduler chooses threads, not processes as indivisible units. Process priority class contributes to thread base priority, but each thread has its own state and relative priority. A process with ten threads supplies ten scheduling candidates when all are ready."
        ]
      },
      {
        title: "Affinity constrains placement but does not create performance",
        paragraphs: [
          "A process or thread affinity mask restricts which logical processors may run it. Processor groups and CPU sets extend placement on larger systems. Windows also tracks locality and preferred processors to reduce migration cost. Restricting affinity can be useful for controlled experiments or specialized software, but it removes choices from the scheduler.",
          "Pinning all workers to one processor prevents CPU parallelism. Spreading communicating workers can increase cache-coherence traffic. Leaving affinity unrestricted is the sensible default unless measurement and a concrete requirement justify the constraint."
        ],
        inlineCheck: ["What happens if four CPU-ready threads are restricted to one logical processor?", ["They execute simultaneously on that processor", "They must share it through scheduling", "Windows creates three extra cores", "Their address spaces merge"], 1, "Affinity limits every worker to the same scheduling target, so only one can execute there at an instant."]
      },
      {
        title: "More ready threads increase opportunity and overhead",
        paragraphs: [
          "Additional workers can overlap waits or use idle processors, but each thread brings stack space, kernel bookkeeping, scheduling work, cache footprint, and synchronization. Once the workload's useful concurrency is saturated, extra workers mostly compete. Context switches and migrations can displace useful cache data even when their direct save and restore time looks small.",
          "The optimal worker count is not a Windows constant. It depends on CPU topology, storage queueing, file sizes, cache warmth, antivirus, lock contention, runtime behavior, and the ratio between useful work and coordination. Search for a stable useful region, not one magical number."
        ]
      },
      {
        title: "The supplied practices demonstrate two different scaling limits",
        paragraphs: [
          "The better_together observation shows fixed overhead: five workers performed worse on a two-file directory but improved elapsed time on a much larger directory. Its Process Monitor TIDs support concurrent file operations, while the timing supports a workload-specific improvement in elapsed time. Neither result proves that five workers are always optimal.",
          "The thread_overdose observation shows a point of diminishing returns: performance improved through part of the tested range, but regressed at 500 workers. The reported best result near 100 threads applies only to that machine, executable, directory, and cache state. The lesson to transfer is the shape of the curve and the measurement method, not the number 100."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "A simplified dispatch decision",
        intro: "Eligibility comes first; performance consequences come after selection.",
        items: [
          { meta: "State", label: "Is the thread ready?", detail: "Waiting and suspended threads are excluded", linkAfter: "then compare" },
          { meta: "Policy", label: "Dynamic priority", detail: "Higher ready priority can preempt", linkAfter: "then place" },
          { meta: "Placement", label: "Allowed processor", detail: "Affinity, CPU sets, locality", linkAfter: "dispatch" },
          { meta: "Execution", label: "Run for an interval", detail: "Until wait, preemption, yield, or completion", linkAfter: "measure" },
          { meta: "Outcome", label: "Useful work and overhead", detail: "CPU, waits, switches, cache, contention" }
        ],
        caption: "A scheduling decision can be correct while an application-level worker-count decision is inefficient. The scheduler manages the ready work it is given."
      }
    ],
    workedExamples: [
      {
        type: "calculation",
        title: "Read the supplied thread-overdose curve",
        prompt: "The reported times include 1 worker at 6026 ms, 10 at 1724 ms, 100 at 1528 ms, and 500 at 1891 ms.",
        steps: [
          { title: "Calculate improvement at 10 workers", action: "Divide the one-worker time by the ten-worker time.", why: "The ratio describes the observed elapsed-time speedup for the supplied run.", result: "6026 / 1724 gives a speedup of about 3.50 times." },
          { title: "Compare 100 with 500", action: "Calculate the regression relative to the 100-worker result.", why: "The curve, not the raw worker count, reveals where added concurrency stopped helping.", result: "(1891 - 1528) / 1528 = about 23.8 percent slower." },
          { title: "Reject a universal optimum", action: "Tie the values to the tested executable, directory, machine, and run conditions.", why: "Different storage, caches, and thread implementations shift the point where additional workers stop helping.", result: "The data supports a useful range for this setup, not a Windows rule of 100." },
          { title: "Name the missing controls", action: "Request repeated runs, medians, cache policy, CPU and switch data, and correctness checks.", why: "One run per count cannot separate scheduler effects from background noise or warm-cache differences.", result: "The next experiment can support a stronger conclusion." }
        ],
        conclusion: "Worker curves need repeated measurements and explanatory counters, but a clear regression already disproves the claim that more threads always mean better performance."
      },
      {
        type: "comparison",
        title: "Audit the supplied prime-number program as a CPU-bound workload",
        prompt: "The supplied script partitions candidate integers across Python threads and later sorts the combined prime results.",
        columns: [
          { title: "What the script does well", rows: [["Partition", "Striped ranges avoid checking the same integer twice"], ["Result ownership", "Each worker appends to its own list"], ["Completion", "Main joins every worker before combining"], ["Correctness", "Sorting restores numeric order"]] },
          { title: "What performance claims require care", rows: [["GIL", "Pure Python primality loops do not normally execute bytecode in parallel"], ["Output", "Printing every prime can dominate elapsed time"], ["Work balance", "Higher candidates require more divisor checks"], ["Thread count", "More workers than useful units of work add overhead"]] }
        ],
        shared: "The script is a valid threading and partitioning exercise. It is not evidence that CPU-bound Python threads scale across cores.",
        conclusion: "Use it to study lifecycle and correctness, then compare a process pool or GIL-releasing implementation for CPU parallelism."
      }
    ],
    windowsLearning: [
      {
        title: "Measure the scheduler and workload together",
        paragraphs: [
          "Process Explorer can expose thread count, CPU, context-switch delta, per-thread CPU, and affinity. Process Monitor can attribute logical I/O to TIDs. Performance Monitor can add processor, queue, and context-switch counters. None of these alone identifies the optimum, but together they distinguish idle waits from CPU saturation and overhead.",
          "Record wall time and correctness for repeated runs. If thread count rises while CPU stays low and storage is saturated, more workers may only queue. If CPU is saturated by pure Python and elapsed time worsens, the GIL and scheduler overhead are stronger candidates. If several cores are busy in native code, actual parallelism may be occurring."
        ]
      },
      {
        title: "Affinity experiments must preserve and restore state",
        paragraphs: [
          "win32process.GetProcessAffinityMask returns the current process mask and system mask. SetProcessAffinityMask can constrain a test process you started when the requested mask is valid and permitted. Save the original mask and restore it in a finally block.",
          "Do not change affinity for unrelated system or user processes. A one-processor constraint can demonstrate contention among ready workers, but it also changes cache placement and available capacity, so compare it only as a controlled experimental condition."
        ]
      }
    ],
    practice: {
      title: "Compare controlled I/O and CPU thread counts",
      time: "25 min",
      intro: "Run fixed one-worker and five-worker modes for supplied I/O-bound and CPU-bound artifacts.",
      downloads: [["downloads/thread_io_lab.py", "thread_io_lab.py", "I/O workload"], ["downloads/prime_threads_lab.py", "prime_threads_lab.py", "Prime workload"]],
      expectedOutcome: "thread_io_lab.py reads the same 200 controlled files with one and five workers, while prime_threads_lab.py checks the same range with one and five workers. File counts, bytes, and prime counts stay fixed; elapsed values vary by machine, and the CPU-bound Python workload is not promised to improve with more threads.",
      steps: [
        {
          action: "Download thread_io_lab.py and prime_threads_lab.py, open PowerShell in their folder, and create the controlled workload in .\\iloveos-scheduler-files.",
          commands: [{ label: "PowerShell", code: "$root = Join-Path $PWD 'iloveos-scheduler-files'\nif (Test-Path -LiteralPath $root) { throw \"Remove or rename the existing lab folder first: $root\" }\nNew-Item -ItemType Directory -Path $root | Out-Null\n1..200 | ForEach-Object { Set-Content -LiteralPath (Join-Path $root \"input-$_.txt\") -Value ('S' * 65536) -Encoding ascii }\n\"Logical processors: $([Environment]::ProcessorCount)\"\nGet-ChildItem -File $root | Measure-Object Length -Sum" }],
          why: "A fixed controlled file set keeps input inventory identical between the two I/O modes.",
          observe: "PowerShell prints 200 files, their fixed total bytes, and the machine's logical-processor count. A collision error protects a pre-existing folder."
        },
        {
          action: "Run thread_io_lab.py against the same .\\iloveos-scheduler-files input with one worker and five workers.",
          commands: [{ label: "PowerShell", code: "py .\\thread_io_lab.py .\\iloveos-scheduler-files 1\npy .\\thread_io_lab.py .\\iloveos-scheduler-files 5" }],
          why: "Only the worker-count argument changes between the supplied I/O modes.",
          observe: "Both invocations print files: 200 and the same bytes read. Worker counts are 1 and 5; elapsed values are machine-dependent."
        },
        {
          action: "Run prime_threads_lab.py with the same limit 200000 and worker counts one and five.",
          commands: [{ label: "PowerShell", code: "py .\\prime_threads_lab.py 200000 1\npy .\\prime_threads_lab.py 200000 5" }],
          why: "The fixed pure-Python CPU workload exposes thread overhead and GIL constraints without file waits.",
          observe: "Both invocations print the same prime count and different worker TID sets. Elapsed values vary, and the five-worker mode is not guaranteed to be faster."
        },
        {
          action: "After both supplied programs exit, run this PowerShell cleanup block for the input directory created by the lab.",
          commands: [{ label: "PowerShell", code: "$root = Join-Path $PWD 'iloveos-scheduler-files'\nif (Test-Path -LiteralPath $root) { Remove-Item -LiteralPath $root -Recurse }\nTest-Path -LiteralPath $root" }],
          why: "The cleanup removes only the controlled directory created in step 1.",
          observe: "PowerShell prints False. A True result means the lab-created directory still remains."
        }
      ],
      safety: "Use only controlled files and reasonable worker counts. Do not launch hundreds of workers on a memory-constrained machine merely to match the supplied exercise; stop if the system becomes unresponsive.",
      hints: [{ title: "Elapsed values differ between runs", body: "That is expected. The fixed evidence is input and result consistency; timing remains an observation only." }],
      cleanup: ["Allow thread_io_lab.py and prime_threads_lab.py to join all workers before cleanup.", "The final PowerShell block removes only .\\iloveos-scheduler-files."]
    },
    checks: [
      ["What is the scheduler's direct unit of dispatch?", ["Executable file", "Thread", "Handle table", "DLL"], 1, "Ready threads are selected for logical processors."],
      ["Why is there no single best thread count for every workload?", ["Windows changes all thread IDs at 101", "The best count depends on the workload, machine, runtime, and measurement conditions", "A process can open only 100 files", "Every CPU has exactly 100 cores"], 1, "A result from one experiment does not become a universal setting. Available parallelism, waiting time, and overhead all change the useful range."],
      ["Why may the prime-number program fail to speed up with more threads?", ["Primes cannot be partitioned", "The pure Python CPU loop is constrained by the CPython GIL and adds overhead", "Windows cannot schedule Python threads", "join deletes results"], 1, "The workers are native threads, but ordinary Python bytecode execution is generally serialized within one interpreter."]
    ]
  },

  "priorities-boosts-starvation": {
    phases: {
      learn: ["Order ready work", "Understand base priority, dynamic priority, boosts, starvation, and inversion without treating priority as extra CPU."],
      windows: ["Observe priority safely", "Use disposable workers, preserve original settings, and avoid real-time classes."],
      investigation: ["Compare two CPU workers", "Change one process priority class and interpret the result under controlled contention."],
      review: ["Check priority reasoning", "Test selection order, boosts, capacity, starvation, inversion, and restoration."]
    },
    learning: [
      {
        title: "Priority ranks ready threads; it does not create capacity",
        paragraphs: [
          "Windows combines a process priority class with a thread priority level to establish a base priority. Dynamic priority can temporarily differ within the variable range. When ready candidates compete for a logical processor, higher-priority work is selected before lower-priority work. A waiting high-priority thread consumes no processor until its wait is satisfied.",
          "Raising priority does not create another core, make storage faster, remove the GIL, or reduce the amount of work. It changes who waits when demand exceeds available processors. If the machine has idle cores, two CPU workers at different ordinary priority classes may both run with little visible difference."
        ],
        inlineCheck: ["Two CPU-bound threads have different priorities but can run on separate idle cores. What result is possible?", ["Both can receive substantial CPU despite the priority difference", "The lower-priority thread must terminate", "The higher-priority thread gets a larger address space", "Windows merges the threads"], 0, "Priority matters most when ready work competes for the same available processor capacity."]
      },
      {
        title: "Dynamic boosts support responsiveness",
        paragraphs: [
          "Windows can boost variable-priority threads after certain waits, foreground interactions, or events so recently unblocked work responds quickly. The dynamic value later decays toward the base. This helps interactive and I/O-completing work without permanently assigning every such thread a high base priority.",
          "A snapshot of current priority must therefore be interpreted in the context of when it was taken. Base and dynamic values answer different questions, and the exact boosting policy is an implementation detail that can evolve. Program against documented priority classes and levels rather than assuming a fixed internal boost sequence."
        ]
      },
      {
        title: "Starvation and inversion are ownership problems as well as scheduling problems",
        paragraphs: [
          "A high-priority CPU-bound thread that rarely waits can delay lower-priority ready work on constrained processors. Real-time classes can interfere with input, storage, and critical system activity, making the machine difficult to recover. They are not a general optimization switch.",
          "Priority inversion occurs when high-priority work waits for a lock held by lower-priority work, possibly while medium-priority work consumes the processor. Keep critical sections short, avoid blocking while holding locks, and use synchronization designs and OS primitives appropriate to the platform. Raising every participant's priority does not repair an unclear ownership protocol."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "Priority affects selection only after eligibility",
        intro: "A high priority value cannot make a blocked thread runnable or create more processor time.",
        items: [
          { meta: "Condition", label: "Check whether the thread is ready", detail: "Waiting threads are not candidates", linkAfter: "derive" },
          { meta: "Base", label: "Class plus thread level", detail: "Documented starting priority", linkAfter: "adjust" },
          { meta: "Dynamic", label: "Temporary boost or decay", detail: "Responsiveness within policy", linkAfter: "rank" },
          { meta: "Dispatch", label: "Select ready work", detail: "Higher priority precedes lower", linkAfter: "competes for" },
          { meta: "Capacity", label: "Existing logical processors", detail: "Priority does not add hardware" }
        ],
        caption: "Affinity can force differently prioritized threads to compete on the same processor, but that is an experimental constraint, not a normal tuning recommendation."
      }
    ],
    workedExamples: [
      {
        type: "state",
        title: "Follow a small priority inversion",
        prompt: "A low-priority thread called Low holds a mutex. A high-priority thread called High needs it, while a medium-priority thread called Medium is ready to run on the same constrained processor.",
        steps: [
          { title: "Low owns the mutex", action: "Low enters a short critical section.", result: "The protected state is consistent but temporarily unavailable.", why: "Lock ownership, not CPU priority, controls access." },
          { title: "High blocks", action: "High becomes ready, attempts the mutex, and must wait.", result: "High is not a dispatch candidate while the mutex is unavailable.", why: "Priority cannot bypass synchronization ownership." },
          { title: "Medium consumes CPU", action: "Medium remains ready and can delay Low's chance to finish.", result: "High indirectly waits behind medium-priority work.", why: "The low-priority owner must run before High can proceed." },
          { title: "Low releases", action: "Low completes the bounded critical section and releases the mutex.", result: "High becomes ready and its priority can matter again.", why: "Short ownership periods and platform mitigations limit the inversion." }
        ],
        conclusion: "Priority does not replace synchronization design. The blocked high-priority thread first needs the resource condition to change."
      }
    ],
    windowsLearning: [
      {
        title: "Process Explorer can run a reversible priority experiment",
        paragraphs: [
          "Use disposable CPU workers you started yourself. Record both original process priority classes, change one to Below Normal, observe several intervals under actual CPU contention, and restore it before exit. Avoid High and Real Time for this course experiment.",
          "A process priority class affects the base priorities derived for its threads. Per-thread values can differ, and dynamic boosts can make short samples noisy. Record processor count, affinity, total competing workers, and whether the machine had idle capacity."
        ]
      },
      {
        title: "pywin32 priority calls require process handles and restoration",
        paragraphs: [
          "win32process.GetPriorityClass reads the current class from a process handle. SetPriorityClass changes it when the handle has the required rights. Thread priority calls similarly require a suitable thread handle. An access-denied result is expected when the caller lacks authority.",
          "Save the original class before changing it and restore it in a finally block. Do not target system services, security tools, or other users' processes. The safe learning objective is relative scheduling under controlled contention, not making the operating system favor arbitrary work."
        ]
      }
    ],
    practice: {
      title: "Observe priority without harming the system",
      time: "25 min",
      intro: "Use two disposable CPU workers and make one reversible change to the Below Normal priority class in Process Explorer.",
      download: ["downloads/cpu_priority_lab.py", "cpu_priority_lab.py"],
      expectedOutcome: "With enough competing ready work, the worker left at Normal may accumulate CPU faster than the worker changed to Below Normal. On a machine with spare logical processors, both may run almost equally. Restoring the original class should return the scheduling policy to baseline. The priority change affects scheduling order under contention; it does not change the available hardware capacity.",
      steps: [
        {
          action: "Download cpu_priority_lab.py and open two PowerShell windows in its folder. Start the first and second CPU-bound workers with these identical 60-second commands.",
          commands: [{ label: "First PowerShell", code: "py .\\cpu_priority_lab.py --seconds 60" }, { label: "Second PowerShell", code: "py .\\cpu_priority_lab.py --seconds 60" }],
          why: "Using disposable processes that you started makes the policy change safe and reversible.",
          observe: "Each cpu_priority_lab.py process prints its PID, native TID, elapsed values, and completed_units. Process Explorer initially shows both exact PIDs at Normal priority."
        },
        { action: "In Process Explorer right-click only the first PID printed in step 1, choose Set Priority > Below Normal, and confirm the warning. Leave the second printed PID at Normal.", why: "A modest class difference demonstrates relative selection without using dangerous High or Real Time ranges.", observe: "Process Explorer shows Below Normal for the first exact PID and Normal for the second. completed_units may diverge under contention or remain similar when processors are idle." },
        { action: "Before the 60-second workers exit, right-click the changed first PID in Process Explorer and choose Set Priority > Normal.", why: "Restoring the original setting is part of every experiment that changes system configuration.", observe: "Process Explorer shows Normal again for that exact PID. If it already exited, no persistent process priority remains; do not act on a reused PID." },
        { action: "Allow both cpu_priority_lab.py commands to reach their 60-second bound, or press Ctrl+C once in each visible window after priority is restored.", why: "The supplied workers are bounded and belong only to this experiment, so they can be stopped safely.", observe: "Each completed worker prints its final unit count and checksum. If you press Ctrl+C, it prints 'stop requested'. Its PID then disappears from Process Explorer." }
      ],
      safety: "Change only the supplied disposable workers. Do not select High or Real Time, and do not alter system, security, service, or unrelated application processes.",
      hints: [{ title: "Both workers progress equally", body: "That can be correct when the machine has idle logical processors. Priority changes selection order among ready threads; it does not add contention or capacity." }],
      cleanup: ["Restore the changed first PID to Normal if it is still live.", "Let both cpu_priority_lab.py processes finish, or stop only the two visible workers you started with Ctrl+C after restoring the priority."]
    },
    checks: [
      ["How does a higher priority affect a ready thread?", ["It increases processor capacity", "It makes the scheduler favor that thread over lower-priority ready work", "It widens the virtual address space", "It grants handle ownership"], 1, "Priority ranks ready candidates. It does not add processors or reduce the amount of work."],
      ["Why can a high-priority thread still consume no CPU?", ["It may be waiting", "High priority deletes its stack", "It becomes a file", "It cannot have a TID"], 0, "A waiting thread is not eligible for dispatch regardless of its priority."],
      ["What should you do after a controlled priority experiment?", ["Leave the faster priority class in place", "Restore the original priority setting", "Set every process to Real Time", "Delete Process Explorer"], 1, "Restore configuration changes even if the measurement or test code fails."]
    ]
  }
};
