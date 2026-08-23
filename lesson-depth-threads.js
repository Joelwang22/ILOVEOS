window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "threads-in-processes": {
    apis: ["threading.Thread", "threading.get_native_id", "win32api.GetCurrentThreadId", "win32api.GetCurrentProcess", "win32process.GetThreadTimes"],
    phases: {
      learn: ["Separate process from thread", "Connect the shared process container to the execution state Windows schedules."],
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
          { title: "Worker A issues a read", action: "A enters the operating system and waits for data or cached completion.", why: "A waiting thread no longer needs the processor.", result: "A is waiting; another ready thread can run." },
          { title: "Worker B runs", action: "Windows dispatches B, which issues its own read.", why: "The process remains runnable because B has an independent context.", result: "Two logical I/O requests are outstanding or progressing through the stack." },
          { title: "Worker C runs", action: "C performs its file operation while A or B remains blocked.", why: "Concurrency uses otherwise idle wait intervals.", result: "Process Monitor attributes operations to three TIDs." },
          { title: "Completions make workers ready", action: "Each completion moves its waiting worker back toward execution.", why: "Completion does not guarantee immediate dispatch; priority and processor availability still apply.", result: "Workers finish and join returns after all three terminate." }
        ],
        conclusion: "The trace supports overlapping worker lifetimes and logical I/O issue. Physical storage parallelism requires deeper evidence."
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
      intro: "Use a supplied script to connect Python worker names to native TIDs, shared resources, and file events.",
      download: ["downloads/thread_observer_lab.py", "thread_observer_lab.py"],
      expectedOutcome: "The process should contain the main thread plus three named workers. Each worker prints a distinct native TID, waits at a shared start gate, reads a different temporary file, and records a result in process memory. Process Explorer should match the TIDs while they are alive, and Process Monitor should attribute each file sequence to the responsible worker TID.",
      predictionPrompt: "Predict which values every worker shares and which values must differ before starting the script.",
      steps: [
        {
          action: "Download thread_observer_lab.py, open PowerShell in its folder, run this command, and leave it at 'Inspect the waiting workers'.",
          commands: [{ label: "PowerShell", code: "py .\\thread_observer_lab.py" }],
          why: "The start gate keeps all three ILOVEOS-worker threads alive long enough for a reliable snapshot.",
          observe: "Record the process PID, main native TID, worker-0 through worker-2 native TIDs, and all three controlled file paths. If py is unavailable, record that dependency failure and stop."
        },
        { action: "Select the recorded PID in Process Explorer, open Properties > Threads, and match every printed native TID while thread_observer_lab.py remains at its first prompt.", why: "The match joins the runtime's internal naming with Windows scheduling identity.", observe: "For each matched TID record Start Address, CPU, Cycles Delta or Context Switch Delta when available, and Stack. If symbols do not resolve, keep the raw module or address and do not invent Python function names." },
        { action: "In Process Monitor add PID is the recorded PID Include, show the TID column through Options > Select Columns, clear the display, and resume capture. Press Enter once in thread_observer_lab.py to release the workers; pause capture immediately after 'joined results' prints.", why: "A narrow interval connects each known worker with its file operations.", observe: "For each of the three recorded paths, correlate the printed worker TID with CreateFile, ReadFile, and CloseFile when present. Record a missing operation rather than assigning it to another TID." },
        { action: "After thread_observer_lab.py prints the joined results dictionary and exits, compare shared process state with per-thread state.", why: "Completion makes the ownership boundary concrete.", observe: "Classify the one address space and results dictionary as shared, and each native TID, stack, and scheduling state as per-thread; confirm the temporary paths were removed when the TemporaryDirectory closed." },
        { action: "Write a concurrency conclusion with one explicit limitation.", why: "Several TIDs and interleaved events are not sufficient proof of simultaneous physical execution.", observe: "State what the trace proves and what CPU or storage evidence would be needed for a parallelism claim." }
      ],
      hints: [{ title: "A worker is missing from Process Explorer", body: "Restart the script and keep it at the first prompt. The worker must still be alive when Process Explorer refreshes." }],
      cleanup: ["Allow the script to join all workers and remove its temporary files.", "Stop and clear the Process Monitor capture."],
      extension: { title: "Optional extension", prompt: "Add one CPU-bound worker and compare its CPU sample and event history with the I/O workers. Explain how the GIL affects the prediction." }
    },
    checks: [
      ["Which state is normally shared by threads in one process?", ["Register context", "User stack", "Virtual address space", "Native TID"], 2, "Sibling threads share the process address space while keeping independent contexts, stacks, and IDs."],
      ["What does CPython's GIL mainly limit?", ["Creation of native Windows threads", "Simultaneous execution of ordinary Python bytecode in one interpreter", "All overlapping I/O", "Process Monitor TID capture"], 1, "Native threads still exist and blocking work can overlap, but ordinary bytecode execution is generally serialized within one interpreter."],
      ["What evidence joins a Python worker to a Process Monitor file event?", ["Only the executable path", "The worker's native TID within the captured PID and interval", "The file extension", "The process publisher"], 1, "PID and native TID provide the direct correlation, strengthened by controlled paths and timestamps."]
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
        title: "User and kernel stacks protect different execution modes",
        paragraphs: [
          "The user stack stores call frames, return addresses, saved registers, and local data for user-mode execution. On a kernel transition, Windows uses a kernel stack associated with the thread so privileged code does not rely on writable user stack memory for its own control flow. Stack traces cross these layers when symbols and permissions allow.",
          "Each thread reserves stack address space and commits pages as needed. Thousands of threads therefore consume address space and some committed memory even when most are idle. Deep recursion and large per-thread local allocations can exhaust a stack independently of the process heap."
        ]
      },
      {
        title: "Ready, running, and waiting answer different scheduling questions",
        paragraphs: [
          "A running thread currently owns a logical processor. A ready thread can run but has not been selected. A waiting thread cannot proceed until a condition is satisfied, such as I/O completion, a signaled event, an available mutex, or a delay expiration. When the condition completes, the thread becomes ready before it can run again.",
          "Suspension is an imposed suspend count, not a wait for an application invariant. Suspending an arbitrary thread can freeze it while it owns a lock or while a runtime data structure is inconsistent. Use events, condition variables, queues, and cooperative protocols for synchronization."
        ],
        inlineCheck: ["An event becomes signaled for a waiting thread. What state is normally possible next before it executes?", ["Ready", "Terminated only", "It must remain waiting forever", "A new process"], 0, "Satisfying the wait makes the thread eligible. It becomes ready and runs when the scheduler selects it."]
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
        shared: "Both waiting mechanisms stop consuming useful CPU, but a delay is time-based while an event represents an explicit state change.",
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
      title: "Classify live thread states",
      time: "25 min",
      intro: "Use a supplied script with busy, delay, and event-wait workers so each observation has a known cause.",
      download: ["downloads/thread_states_lab.py", "thread_states_lab.py"],
      expectedOutcome: "The busy worker should accumulate CPU and alternate between running and ready. The sleep worker should consume little CPU while waiting for its timer. The event worker should consume little CPU until the main thread signals it, then become ready, run briefly, and terminate. Exact displayed wait reasons and stacks vary by symbols and timing.",
      predictionPrompt: "Predict the likely CPU and wait behavior for each named worker before starting Process Explorer.",
      steps: [
        {
          action: "Download thread_states_lab.py, open PowerShell in its folder, run this command, and leave all three workers in the first controlled phase.",
          commands: [{ label: "PowerShell", code: "py .\\thread_states_lab.py" }],
          why: "Named workers and printed native TIDs create a ground-truth map for live inspection.",
          observe: "Record PID, main native TID, and the TIDs labeled busy, delay, and event. If py is unavailable, record that dependency failure and stop."
        },
        { action: "Select the recorded PID in Process Explorer, open Properties > Threads, and sample the busy, delay, and event TIDs several times without suspending them.", why: "Thread state is dynamic, so repeated observations are more reliable than one refresh.", observe: "Compare CPU, Cycles Delta or Context Switch Delta, Start Address, and Stack. The busy worker is CPU-bound; delay and event workers are waiting. If state or symbols are unavailable, record that branch." },
        { action: "Press Enter once at thread_states_lab.py's 'signal the event worker' prompt, then refresh Process Explorer Properties > Threads.", why: "The explicit trigger demonstrates waiting to ready to running to terminated transitions.", observe: "Record that the event TID prints 'event worker observed its signal' and disappears; a short ready or running transition may be too quick for the refresh interval." },
        { action: "At the second thread_states_lab.py prompt, press Enter to set both the delay-stop and busy-stop events; this does not wait for the delay worker's 30-second timeout.", why: "Two cooperative stop events demonstrate that waiting and cancellation are designed conditions.", observe: "Confirm 'delay worker finished', 'busy worker stopped', and 'all explicit workers joined', then verify both recorded TIDs disappear." },
        { action: "Draw a state path for each worker using only supported observations.", why: "The exercise should preserve uncertainty when refresh timing misses a short transition.", observe: "Label direct observations, inferred transitions, and any missing evidence separately." }
      ],
      safety: "Inspect only the supplied process. Do not suspend or change the context of arbitrary application or system threads.",
      hints: [{ title: "The wait reason is not visible", body: "Use CPU behavior, the known script phase, and any available stack frames. Record that the exact wait reason was unavailable rather than inventing it." }],
      cleanup: ["Use the script prompts to signal and stop every worker, then allow all joins to complete.", "Close Process Explorer thread property windows."],
      extension: { title: "Optional extension", prompt: "Add a queue.get worker and compare its wait and wake behavior with the event worker." }
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
          "join blocks the caller until a worker terminates or an optional timeout expires. It does not ask the worker to stop. Cooperative cancellation uses a flag, event, queue sentinel, or another protocol that the worker checks at safe points. The owner requests cancellation, workers restore their own invariants in finally, and the owner joins them before destroying shared resources.",
          "A cancellation check must occur often enough for responsive shutdown but not inside a state transition that must remain atomic. Blocking calls may need timeouts or waitable cancellation objects so a worker can observe the request instead of hanging indefinitely."
        ],
        inlineCheck: ["What operation asks a Python worker to stop?", ["join by itself", "A cooperative cancellation protocol the worker checks", "Reading its TID", "Closing the process image"], 1, "join only waits. The program needs an explicit cancellation request and worker-side response."]
      },
      {
        title: "Forced termination can strand the whole process",
        paragraphs: [
          "TerminateThread stops a native thread at an arbitrary instruction. User-mode finally blocks do not run, locks may remain owned, heap or runtime operations may be interrupted, and shared data can retain a half-updated invariant. The damage affects sibling threads because they share the process container.",
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
        title: "A cooperatively owned worker lifecycle",
        intro: "The owner and worker each have responsibilities before shared resources can be released.",
        items: [
          { meta: "Prepare", label: "Create inputs and stop event", detail: "Ownership exists before start", linkAfter: "start" },
          { meta: "Run", label: "Worker performs bounded units", detail: "Checks cancellation at safe points", linkAfter: "request" },
          { meta: "Cancel", label: "Owner signals stop", detail: "A request, not forced termination", linkAfter: "worker" },
          { meta: "Unwind", label: "Worker finally cleans up", detail: "Restores invariants and reports failure", linkAfter: "owner" },
          { meta: "Join and release", label: "All workers are complete", detail: "Shared files and handles can now close" }
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
          { title: "Can workers return after a bounded unit?", action: "Use a shared stop event checked between units.", why: "The worker chooses a point where its local state is consistent.", result: "Signal, join, then close shared output." },
          { title: "Can a worker block indefinitely?", action: "Add a timeout, queue sentinel, or wait set that includes cancellation.", why: "A worker that never observes cancellation can make join hang forever.", result: "Shutdown latency becomes bounded and testable." },
          { title: "Did a worker raise?", action: "Capture and propagate the exception to the owner.", why: "Thread exceptions must affect the operation's final success decision.", result: "Cancel siblings if required, join all, then report failure." },
          { title: "Is forced termination tempting?", action: "Redesign the blocking or ownership protocol instead.", why: "TerminateThread cannot guarantee locks, heaps, files, or runtime state remain consistent.", result: "Normal control flow retains cleanup guarantees." }
        ],
        conclusion: "A shutdown protocol is part of the worker API, not an emergency feature added after the thread starts."
      }
    ],
    windowsLearning: [
      {
        title: "Prefer threading.Thread for Python code",
        paragraphs: [
          "Python's threading module initializes the interpreter's required per-thread state and integrates exceptions, naming, daemon policy, and joins. Raw CreateThread is appropriate for native code designed for that ABI, but language runtimes can require their own creation entry points. Course Python code should not call CreateThread merely to appear lower level.",
          "A process often has more threads than the application explicitly created because Python, debuggers, UI frameworks, or libraries can create runtime workers. The supplied thread-overdose observation that N workers often produces about N plus one threads is a useful expectation, not a guaranteed exact count. Measure the process."
        ]
      },
      {
        title: "Daemon threads change shutdown policy, not cleanup correctness",
        paragraphs: [
          "Python can exit when only daemon threads remain, which can stop their work without an orderly application-level completion protocol. Daemon threads are useful for background helpers whose abrupt process exit is acceptable, but they are not a substitute for closing files, flushing required output, or preserving transactions.",
          "For course practices, use non-daemon workers, explicit cancellation, and join. That keeps shutdown observable and lets Process Explorer confirm thread count returns to the expected baseline before process exit."
        ]
      }
    ],
    codeWalkthroughs: [
      {
        title: "Build cooperative cancellation and exception propagation",
        intro: "The worker owns local cleanup, while the main thread owns group cancellation and final success.",
        stages: [
          { title: "Create shared control and error channels", explanation: "An Event communicates cancellation. A Queue moves exceptions back to the owner without unsynchronized shared mutation.", code: "import queue\nimport threading\n\nstop = threading.Event()\nerrors = queue.Queue()" },
          { title: "Check cancellation around bounded work", explanation: "finally runs in the worker that owns the resource, even when its work raises.", code: "def worker():\n    try:\n        while not stop.wait(0.1):\n            do_one_bounded_unit()\n    except BaseException as error:\n        errors.put(error)\n        stop.set()\n    finally:\n        release_worker_resource()" },
          { title: "Join before group cleanup", explanation: "The owner waits for every worker, then treats a queued failure as operation failure.", code: "stop.set()\nfor thread in threads:\n    thread.join()\nif not errors.empty():\n    raise errors.get()" }
        ]
      }
    ],
    practice: {
      title: "Design and test a clean worker shutdown",
      time: "30 min",
      intro: "Use thread_shutdown_lab.py to expose normal completion, cancellation, and injected failure without repeated answer fields.",
      download: ["downloads/thread_shutdown_lab.py", "thread_shutdown_lab.py"],
      expectedOutcome: "Three non-daemon workers should perform bounded units, respond to one stop event, run their finally cleanup, and be joined before main closes the shared report. In failure mode, one worker should report an injected exception, request sibling cancellation, and cause the program to finish with a visible failure after every worker is joined.",
      predictionPrompt: "Predict what could go wrong if main closes the shared report before join or if a blocked worker never checks the stop event.",
      steps: [
        {
          action: "Download thread_shutdown_lab.py, open PowerShell in its folder, and run the normal mode with an explicit report path.",
          commands: [{ label: "PowerShell", code: "py .\\thread_shutdown_lab.py normal --output .\\thread_shutdown_normal.log" }],
          why: "The successful path establishes start, bounded work, cooperative stop, finally, and join ordering.",
          observe: "The run is bounded and has no pause. Record PID, three worker native TIDs, 'main requests cooperative stop', three cleanup messages, 'all workers joined', and 'normal completion'; confirm thread_shutdown_normal.log is closed only after all joins."
        },
        { action: "If Process Explorer was already open, select the printed PID immediately and inspect Properties > Threads while the bounded normal-mode process remains active; refresh after that process exits.", why: "The optional external sample tests the runtime messages against Windows state without changing the workload.", observe: "Match any native TIDs visible during the short execution and verify the PID is gone afterward. If the workers finish before the snapshot, record the timing limitation rather than adding an unsupported pause flag." },
        {
          action: "Run failure mode with a separate explicit report path; preserve the nonzero command result as expected evidence.",
          commands: [{ label: "PowerShell", code: "py .\\thread_shutdown_lab.py fail --output .\\thread_shutdown_fail.log" }],
          why: "Failure handling is part of lifecycle ownership, not only an exceptional afterthought.",
          observe: "Record the injected worker-1 failure, sibling cleanup messages, 'all workers joined', and 'worker failure propagated to main'. Confirm thread_shutdown_fail.log includes cleanup rows despite the exit code 1."
        },
        { action: "Verify sibling cancellation and final process result.", why: "The group should not silently return success with incomplete work.", observe: "All workers join, the shared report closes once, and main reports the original worker failure." },
        { action: "Temporarily reason through, but do not implement, a TerminateThread replacement.", why: "A counterfactual makes the lost guarantees explicit without performing an unsafe call.", observe: "List which finally blocks, locks, buffered writes, and runtime invariants could be stranded." }
      ],
      hints: [{ title: "The program waits briefly after cancellation", body: "Workers check the event around bounded units. Shutdown latency is bounded by the longest unit or wait timeout, not necessarily instantaneous." }],
      cleanup: ["Allow every worker to join; do not close the terminal during the cleanup messages.", "Delete only .\\thread_shutdown_normal.log and .\\thread_shutdown_fail.log after your comparison."],
      extension: { title: "Optional extension", prompt: "Replace periodic Event checks with a queue sentinel protocol and compare ownership, shutdown latency, and how many sentinels are required." }
    },
    checks: [
      ["What does join request?", ["Immediate worker termination", "A wait for worker completion", "A new TID", "A priority boost"], 1, "join waits. Cancellation or completion must be caused through the worker's normal protocol."],
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
          "The better_together observation shows fixed overhead: five workers lost on a two-file directory but improved elapsed time on a much larger directory. Its Process Monitor TIDs support concurrent file operations, while the timing supports a workload-specific elapsed-time improvement. Neither proves that five is always optimal.",
          "The thread_overdose observation shows a knee: performance improved through part of the tested range, then 500 workers regressed. The reported best result near 100 threads belongs to that machine, executable, directory, and cache state. The lesson to transfer is the curve shape and measurement method, not the number 100."
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
          { title: "Calculate improvement at 10 workers", action: "Divide the one-worker time by the ten-worker time.", why: "The ratio describes observed elapsed-time speedup for the supplied run.", result: "6026 / 1724 = about 3.50 times." },
          { title: "Compare 100 with 500", action: "Calculate the regression relative to the 100-worker result.", why: "The curve, not the raw worker count, reveals where added concurrency stopped helping.", result: "(1891 - 1528) / 1528 = about 23.8 percent slower." },
          { title: "Reject a universal optimum", action: "Attach the values to the tested executable, directory, machine, and run conditions.", why: "Different storage, caches, and thread implementations move the knee.", result: "The data supports a local useful region, not a Windows rule of 100." },
          { title: "Name the missing controls", action: "Request repeated runs, medians, cache policy, CPU and switch data, and correctness checks.", why: "One run per count cannot separate scheduler effects from background noise or warm-cache differences.", result: "The next experiment can support a stronger conclusion." }
        ],
        conclusion: "Worker curves need repeated measurements and explanatory counters, but a clear regression already disproves more threads always means faster."
      },
      {
        type: "comparison",
        title: "Audit prime_threads.py as a CPU-bound workload",
        prompt: "The supplied script partitions candidate integers across Python threads and later sorts the combined prime results.",
        columns: [
          { title: "What the script does well", rows: [["Partition", "Striped ranges avoid checking the same integer twice"], ["Result ownership", "Each worker appends to its own list"], ["Completion", "Main joins every worker before combining"], ["Correctness", "Sorting restores numeric order"]] },
          { title: "What performance claims require care", rows: [["GIL", "Pure Python primality loops do not normally execute bytecode in parallel"], ["Output", "Printing every prime can dominate elapsed time"], ["Work balance", "Higher candidates require more divisor checks"], ["Thread count", "Workers beyond useful items add overhead"]] }
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
          "win32process.GetProcessAffinityMask returns the current process mask and system mask. SetProcessAffinityMask can constrain an owned test process when the requested mask is valid and permitted. Save the original mask and restore it in finally.",
          "Do not change affinity for unrelated system or user processes. A one-processor constraint can demonstrate contention among ready workers, but it also changes cache placement and available capacity, so compare it only as a controlled experimental condition."
        ]
      }
    ],
    practice: {
      title: "Find the workload's useful thread region",
      time: "40 min",
      intro: "Extend the controlled directory-reader experiment into a repeated worker-count curve without treating the supplied result as universal.",
      downloads: [["downloads/thread_io_lab.py", "thread_io_lab.py", "I/O workload"], ["downloads/prime_threads_lab.py", "prime_threads_lab.py", "Prime workload"]],
      expectedOutcome: "Elapsed time should change nonlinearly as workers increase. A small workload may regress immediately. A larger file set may improve, flatten, and eventually regress as startup, scheduling, memory, cache, and contention costs grow. The exact knee can differ from the supplied 100-thread observation and can move between cold and warm runs.",
      predictionPrompt: "Choose worker counts appropriate for your controlled file set and predict the useful region before measuring.",
      steps: [
        {
          action: "Download thread_io_lab.py and prime_threads_lab.py, open PowerShell in their folder, and create the owned .\\iloveos-scheduler-files workload.",
          commands: [{ label: "PowerShell", code: "$root = Join-Path $PWD 'iloveos-scheduler-files'\nif (Test-Path -LiteralPath $root) { throw \"Remove or rename the existing lab folder first: $root\" }\nNew-Item -ItemType Directory -Path $root | Out-Null\n1..200 | ForEach-Object { Set-Content -LiteralPath (Join-Path $root \"input-$_.txt\") -Value ('S' * 65536) -Encoding ascii }\n\"Logical processors: $([Environment]::ProcessorCount)\"\nGet-ChildItem -File $root | Measure-Object Length -Sum" }],
          why: "A fixed controlled file set and planned worker range make repeated runs comparable.",
          observe: "Record the full directory path, 200-file count, total bytes, logical processors, Python version, and storage location."
        },
        {
          action: "Measure the I/O-bound directory reader at every shown worker count. Repeat this entire block at least three times; each invocation names thread_io_lab.py, the same .\\iloveos-scheduler-files path, and the only changed argument is workers.",
          commands: [{ label: "PowerShell", code: "py .\\thread_io_lab.py .\\iloveos-scheduler-files 1\npy .\\thread_io_lab.py .\\iloveos-scheduler-files 2\npy .\\thread_io_lab.py .\\iloveos-scheduler-files 5\npy .\\thread_io_lab.py .\\iloveos-scheduler-files 10\npy .\\thread_io_lab.py .\\iloveos-scheduler-files 25\npy .\\thread_io_lab.py .\\iloveos-scheduler-files 50\npy .\\thread_io_lab.py .\\iloveos-scheduler-files 100" }],
          why: "The final argument selects worker count, and medians reduce sensitivity to one background interruption or cache transition.",
          observe: "For each invocation record workers, identical file count and bytes read, and elapsed milliseconds measured from immediately before ThreadPoolExecutor construction through all worker joins."
        },
        {
          action: "Measure the CPU-bound pure-Python prime workload at every shown worker count. Repeat this block at least three times; each invocation names prime_threads_lab.py, the same limit 200000, and the only changed argument is workers.",
          commands: [{ label: "PowerShell", code: "py .\\prime_threads_lab.py 200000 1\npy .\\prime_threads_lab.py 200000 2\npy .\\prime_threads_lab.py 200000 5\npy .\\prime_threads_lab.py 200000 10\npy .\\prime_threads_lab.py 200000 25\npy .\\prime_threads_lab.py 200000 50\npy .\\prime_threads_lab.py 200000 100" }],
          why: "The same CPU-bound algorithm exposes Python-thread scheduling and GIL overhead without mixing in file waits.",
          observe: "For each invocation record worker native TIDs, identical prime count, and elapsed milliseconds measured from before thread creation through all joins; prime printing is excluded unless --show is explicitly added."
        },
        { action: "During one low-count, one best-so-far, and one high-count run, select the printed PID in Process Explorer and open Properties > Threads and Properties > Performance.", why: "Thread count, CPU, memory, and context-switch observations help explain the curve.", observe: "Record live worker count, process CPU, Context Switch Delta or Cycles Delta, Private Bytes, Working Set, and I/O Bytes for the same PID. If a run completes before inspection, record the timing limitation; do not add an unsupported pause flag." },
        { action: "Plot or tabulate workers against median time and mark the useful region.", why: "The shape communicates improvement, plateau, and regression more clearly than one fastest row.", observe: "Calculate speedup relative to one worker and percentage regression after the best measured point." },
        { action: "Compare your result with better_together and thread_overdose.", why: "Transfer means explaining why the qualitative lesson can match while the numerical optimum differs.", observe: "Name workload, GIL, storage, cache, scheduling, and measurement factors that can move the knee." }
      ],
      safety: "Use only controlled files and reasonable worker counts. Do not launch hundreds of workers on a memory-constrained machine merely to match the supplied exercise; stop if the system becomes unresponsive.",
      hints: [{ title: "The curve is noisy", body: "Increase controlled work per run, close unrelated heavy applications, keep power conditions consistent, use medians, and separate cold from warm cache questions." }],
      cleanup: ["Allow thread_io_lab.py and prime_threads_lab.py to join all workers before closing the terminal.", "Delete only .\\iloveos-scheduler-files after all runs finish."],
      extension: { title: "Optional extension", prompt: "Run the supplied prime calculation with several Python thread counts and compare it with a ProcessPoolExecutor version. Exclude printing from timing and explain the GIL-related difference." }
    },
    checks: [
      ["What is the scheduler's direct unit of dispatch?", ["Executable file", "Thread", "Handle table", "DLL"], 1, "Ready threads are selected for logical processors."],
      ["Why is 100 not a universal best thread count?", ["Windows changes all TIDs at 101", "The optimum depends on workload, machine, runtime, and measurement conditions", "Only 100 files can be opened", "Every CPU has exactly 100 cores"], 1, "The supplied value is one experimental result. The useful region moves with available parallelism, waits, and overhead."],
      ["Why may prime_threads.py fail to speed up with more threads?", ["Primes cannot be partitioned", "The pure Python CPU loop is constrained by the CPython GIL and adds overhead", "Windows cannot schedule Python threads", "join deletes results"], 1, "The workers are native threads, but ordinary Python bytecode execution is generally serialized within one interpreter."]
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
        title: "Priority ranks ready threads, it does not create capacity",
        paragraphs: [
          "Windows combines a process priority class with a thread priority level to establish a base priority. Dynamic priority can temporarily differ within the variable range. When ready candidates compete for a logical processor, higher-priority work is selected before lower-priority work. A waiting high-priority thread consumes no processor until its wait is satisfied.",
          "Raising priority does not create another core, make storage faster, remove the GIL, or reduce the amount of work. It changes who waits when demand exceeds available processors. If the machine has idle cores, two CPU workers at different ordinary priority classes may both run with little visible difference."
        ],
        inlineCheck: ["Two CPU-bound threads have different priority but run on otherwise idle separate cores. What result is possible?", ["Both can receive substantial CPU despite the priority difference", "The lower-priority thread must terminate", "The higher-priority thread gets a larger address space", "Windows merges the threads"], 0, "Priority matters most when ready work competes for the same available processor capacity."]
      },
      {
        title: "Dynamic boosts support responsiveness",
        paragraphs: [
          "Windows can boost variable-priority threads after certain waits, foreground interactions, or events so recently unblocked work responds quickly. The dynamic value later decays toward the base. This helps interactive and I/O-completing work without permanently assigning every such thread a high base priority.",
          "A snapshot of current priority therefore needs time context. Base and dynamic values answer different questions, and exact boosting policy is an implementation area that can evolve. Program against documented priority classes and levels rather than assuming a fixed internal boost sequence."
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
        intro: "A high number cannot make a blocked thread runnable or create new processor time.",
        items: [
          { meta: "Condition", label: "Waiting or ready?", detail: "Only ready threads are candidates", linkAfter: "derive" },
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
        prompt: "Low holds a mutex, High needs it, and Medium is CPU ready on the same constrained processor.",
        steps: [
          { title: "Low owns the mutex", action: "Low enters a short critical section.", result: "The protected state is consistent but temporarily unavailable.", why: "Lock ownership, not CPU priority, controls access." },
          { title: "High blocks", action: "High becomes ready, attempts the mutex, and must wait.", result: "High is not a dispatch candidate while the mutex is unavailable.", why: "Priority cannot bypass synchronization ownership." },
          { title: "Medium consumes CPU", action: "Medium remains ready and can delay Low's chance to finish.", result: "High indirectly waits behind medium-priority work.", why: "The low-priority owner must run before High can proceed." },
          { title: "Low releases", action: "Low completes the bounded critical section and releases the mutex.", result: "High becomes ready and its priority can matter again.", why: "Short ownership and platform mitigation bound the inversion." }
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
          "win32process.GetPriorityClass reads the current class from a process handle. SetPriorityClass changes it when the handle has the required rights. Thread priority calls similarly require a suitable thread handle. Access denied is an expected branch when the caller lacks authority.",
          "Save the original class before changing it and restore it in finally. Do not target system services, security tools, or other users' processes. The safe learning objective is relative scheduling under controlled contention, not making the operating system favor arbitrary work."
        ]
      }
    ],
    practice: {
      title: "Observe priority without harming the system",
      time: "25 min",
      intro: "Use two disposable CPU workers and a reversible Process Explorer change below normal priority ranges.",
      download: ["downloads/cpu_priority_lab.py", "cpu_priority_lab.py"],
      expectedOutcome: "With enough competing ready work, the worker left at Normal may accumulate CPU faster than the worker changed to Below Normal. On a machine with spare logical processors, both may run almost equally. Restoring the original class should return the scheduling policy to baseline. The result changes ordering under contention, not total hardware capacity.",
      predictionPrompt: "Check the number of logical processors and predict how many competing workers are needed before priority differences become visible.",
      steps: [
        {
          action: "Download cpu_priority_lab.py and open two PowerShell windows in its folder. Start the first and second CPU-bound workers with these identical 60-second commands.",
          commands: [{ label: "First PowerShell", code: "py .\\cpu_priority_lab.py --seconds 60" }, { label: "Second PowerShell", code: "py .\\cpu_priority_lab.py --seconds 60" }],
          why: "Owned disposable targets make the policy change safe and reversible.",
          observe: "Record both printed PIDs and native TIDs. In Process Explorer confirm both Priority Class values begin at Normal and compare completed_units at the same elapsed seconds."
        },
        {
          action: "Only if the two workers have spare processors, use a third PowerShell window in the same folder to start enough additional owned 60-second Normal-class helpers to match the logical-processor count.",
          commands: [{ label: "Helper PowerShell", code: "$helperCount = [Math]::Max(0, [Environment]::ProcessorCount - 2)\n$helpers = @()\nif ($helperCount -eq 0) {\n  'No helper workers needed.'\n} else {\n  $helpers = 1..$helperCount | ForEach-Object {\n    Start-Process -FilePath py -ArgumentList '.\\cpu_priority_lab.py','--seconds','60' -WindowStyle Hidden -PassThru\n  }\n  $helpers | Select-Object Id,StartTime\n}\n\"Logical processors: $([Environment]::ProcessorCount); helper workers started: $helperCount\"" }],
          why: "Priority has little visible effect when every ready thread has an idle processor.",
          observe: "Record every helper PID and start time printed by PowerShell. Each helper is bounded to 60 seconds; if responsiveness degrades, wait for those recorded PIDs to exit before continuing."
        },
        { action: "In Process Explorer right-click only one of the two recorded primary PIDs, choose Set Priority > Below Normal, and confirm the warning. Leave the other recorded PID at Normal.", why: "A modest class difference demonstrates relative selection without using dangerous High or Real Time ranges.", observe: "At the same elapsed= lines, record completed_units for both PIDs across several equal one-second intervals, plus each process's CPU and Priority Class columns." },
        { action: "Before the 60-second workers exit, right-click the changed recorded PID in Process Explorer and choose Set Priority > Normal.", why: "Restoration is part of every configuration-changing experiment.", observe: "Verify Process Explorer reports Normal for that PID. If it exited first, record that the process ended and no persistent process priority remained; do not change a reused PID." },
        { action: "Explain the result using readiness and capacity.", why: "The conclusion must account for idle cores, affinity, boosts, and sampling noise.", observe: "State whether contention existed and why priority did or did not change observed progress." }
      ],
      safety: "Change only the supplied disposable workers. Do not select High or Real Time, and do not alter system, security, service, or unrelated application processes.",
      hints: [{ title: "Both workers progress equally", body: "That can be correct when the machine has idle logical processors. Add only enough owned normal-priority workers to create mild contention, or constrain the test in a disposable VM." }],
      cleanup: ["Restore the changed primary PID to Normal if it is still live; an exited cpu_priority_lab.py process leaves no persistent priority setting.", "Let every cpu_priority_lab.py process reach its bounded 60-second completion. If stopping early, press Ctrl+C only in the two visible PowerShell windows; the hidden helper PIDs have no prompt and exit after their 60-second bounds."],
      extension: { title: "Optional extension", prompt: "Constrain both owned workers to one logical processor after saving the original affinity, repeat briefly, then restore affinity and priority in finally." }
    },
    checks: [
      ["What does higher priority directly change?", ["Processor capacity", "Selection order among ready work", "Virtual address width", "Handle ownership"], 1, "Priority ranks ready candidates. It does not add processors or reduce the work."],
      ["Why can a high-priority thread still consume no CPU?", ["It may be waiting", "High priority deletes its stack", "It becomes a file", "It cannot have a TID"], 0, "A waiting thread is not eligible for dispatch regardless of its priority."],
      ["What is required after a controlled priority experiment?", ["Leave the faster class permanently", "Restore the saved original setting", "Set every process to Real Time", "Delete Process Explorer"], 1, "Configuration changes must be reversible and restored even if measurement or code fails."]
    ]
  }
};
