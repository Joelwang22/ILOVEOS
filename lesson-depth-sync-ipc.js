window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "concurrency-problems": {
    apis: ["threading.Thread", "threading.Lock", "threading.Barrier", "win32event.WaitForSingleObject", "Process Explorer Threads"],
    phases: {
      learn: ["Reason about interleavings", "Find shared state, ownership, invariants, and lifetime before choosing a primitive."],
      windows: ["See runnable and waiting work", "Connect Python threads to Windows threads, waits, handles, and stacks."],
      investigation: ["Force one timing failure", "Make a race deterministic enough to explain and then remove its cause."],
      review: ["Check the concurrency model", "Test ownership, invariants, waiting, cleanup, and the limits of timing evidence."]
    },
    learning: [
      { title: "Concurrency creates more than one valid execution order", paragraphs: ["Two threads can each follow their own source code correctly while their combined order violates the program's rule. The scheduler may switch at an instruction boundary, a blocking call, or another point the source layout does not make obvious. A passing run proves only that one allowed interleaving happened.", "Write the invariant before adding a lock. In party.py the useful invariant is that the cake count never becomes negative and exactly one successful guest consumes each remaining piece. The protected operation therefore includes checking the count, deciding, decrementing, and recording the related outcome."], inlineCheck: ["What should be identified before selecting a lock?", ["The longest function name", "The shared state and invariant", "The fastest thread", "The window color"], 1, "A synchronization primitive is chosen to protect a defined relationship, not an isolated line."] },
      { title: "Shared state includes resources and lifetime", paragraphs: ["Threads in one process share globals, heaps, module state, and the process handle table. A handle passed to several workers is one shared capability even though each Python variable looks local. Closing it while another worker is waiting or using it creates a lifetime race.", "Ownership rules should answer who creates the resource, which workers may use it, how shutdown wakes them, who joins them, and who closes the final handle. In party.py, main owns the event and mutex handles, guest threads borrow them, main joins every guest, then main closes the handles."] },
      { title: "Coordination can be designed out", paragraphs: ["A mutex is not the first answer to every shared value. Give one worker exclusive ownership and send it messages, partition data so workers touch disjoint regions, use immutable snapshots, or perform a reduction after independent work. These designs often make correctness easier to test.", "When sharing remains, use the narrowest primitive whose semantics match the problem. An event announces a condition, a mutex establishes exclusive ownership, a semaphore limits capacity, and a queue combines synchronized transfer with a defined ownership handoff."] }
    ],
    visuals: [{ type: "flow", title: "Turn a timing symptom into a concurrency contract", items: [
      { meta: "Inventory", label: "Shared state and handles", detail: "Cake count, log, event, mutex", linkAfter: "define" },
      { meta: "Rule", label: "Invariant and ownership", detail: "What must remain true, who releases what", linkAfter: "enumerate" },
      { meta: "Risk", label: "Allowed interleavings", detail: "Check, switch, stale decision, update", linkAfter: "redesign" },
      { meta: "Proof", label: "Protected operation and cleanup", detail: "Test outcome and lifetime branches" }
    ], caption: "The primitive comes after the contract. This keeps synchronization code tied to a reason you can explain." }],
    workedExamples: [{ type: "trace", title: "Find the race in a cake decision", prompt: "Two guests run if cake > 0: pause(); cake -= 1 while one piece remains.", steps: [
      { title: "Guest A checks", action: "A reads 1 and decides cake is available.", why: "The condition is true at the instant of the read.", result: "A plans to decrement." },
      { title: "Guest B checks", action: "Before A writes, B also reads 1.", why: "Nothing makes the check and update indivisible.", result: "B also plans to decrement." },
      { title: "Both update", action: "A writes 0, then B applies its stale decision and writes or computes another result.", why: "The invariant spans more than the check line.", result: "Consumption is miscounted or the count becomes invalid." },
      { title: "Protect the decision", action: "Acquire once before the check and release after the related update and log decision.", why: "Other guests cannot observe a half-completed cake transaction.", result: "At most one guest consumes the final piece." }
    ], conclusion: "Protect the complete state transition that establishes the invariant." }],
    windowsLearning: [
      { title: "A blocked wait is not a busy loop", paragraphs: ["WaitForSingleObject places a thread into a waiting state until the object condition, timeout, or another documented result occurs. The CPU can run other ready threads. Repeatedly checking a flag in Python consumes scheduling opportunities and still needs a memory and synchronization contract.", "In Process Explorer, open the process Threads tab while the race lab is paused at a barrier. Thread stacks and wait reasons can support the model, but symbols and exact stack text vary. Use the program's own thread names, IDs, timestamps, and phase logs as the primary correlation."] },
      { title: "A trace changes timing", paragraphs: ["Extra logging, breakpoints, and Process Explorer inspection can make a race disappear or appear. Use a barrier to construct the disputed order and an assertion to test the invariant. Then use observation tools to confirm state, not to claim the observed order is the only possible one.", "party.py uses one event handle as a starting gate and one mutex handle for the cake transaction. That separation is important: releasing all guests into the next phase does not grant them simultaneous access to the protected count."] }
    ],
    practice: {
      title: "Make one lost update reproducible", time: "30 min", intro: "Use the starter's controlled and free-running modes before changing synchronization.",
      download: ["downloads/race_counter_lab.py", "race_counter_lab.py"],
      expectedOutcome: "Controlled mode should reliably finish with 1 instead of the expected 2 because both workers read before either writes. Locked mode should finish with 2. Free mode may pass or fail and must not be treated as proof of safety.",
      steps: [
        { action: "Run controlled mode and map each printed phase to the worked interleaving.", why: "A barrier turns an intermittent timing claim into a repeatable state trace.", observe: "Both workers should report the same observed value before writing." },
        { action: "Run free mode several times and explain why any mixture of results is inconclusive.", why: "Sampling schedules cannot enumerate every valid execution order.", observe: "Machine load and Python version can change the frequency." },
        { action: "Run locked mode and locate the exact invariant boundary.", why: "The lock must cover the read, decision, and write, not only assignment.", observe: "The final value should equal the number of completed increments." },
        { action: "Inspect the paused workers in Process Explorer and then allow clean shutdown.", why: "This connects application phases to native thread waits without leaving resources alive.", observe: "Record PID, TIDs, thread names from logs, and the observable waiting state." }
      ],
      hints: [{ title: "Controlled mode hangs", body: "Both worker threads and the main thread must reach the correct barrier generation. Do not hold the result lock while waiting for another participant that needs it." }],
      cleanup: ["Let every worker pass its barrier and join before closing the terminal.", "No system configuration or persistent object is created."],
      extension: { title: "Independent variation", prompt: "Redesign the counter with one owner thread receiving increment messages through queue.Queue, then state which shared mutation disappeared." }
    },
    checks: [
      ["Does ten successful test runs prove a concurrent function is race-free?", ["Yes", "No", "Only on one CPU", "Only with logging"], 1, "Testing samples interleavings, while correctness must cover every allowed interleaving."],
      ["Who should close party.py's shared native handles?", ["Any guest at random", "Main after all borrowers join", "The first guest to finish", "Process Explorer"], 1, "Main owns the handles and closes them after guest threads stop using them."]
    ]
  },

  "atomicity-races": {
    apis: ["threading.Lock", "threading.Barrier", "InterlockedIncrement", "InterlockedCompareExchange", "win32event.WaitForSingleObject"],
    phases: {
      learn: ["Separate atomicity from source syntax", "Trace read, modify, write and understand what an atomic primitive actually guarantees."],
      windows: ["Connect language operations to the machine", "Use Windows interlocked operations only for the narrow state they can protect."],
      investigation: ["Compare unsafe, locked, and atomic designs", "Use repeatable evidence rather than assumptions about the GIL."],
      review: ["Check atomic reasoning", "Test indivisibility, visibility, ordering, scope, and compound invariants."]
    },
    learning: [
      { title: "Atomicity is defined for an operation and its observers", paragraphs: ["An atomic operation appears indivisible at the abstraction level that defines it. That does not make a whole function atomic, and it does not automatically protect a relationship among several fields. A counter increment can be atomic while the rule count <= capacity and owner is valid still races.", "The familiar read, add, write model is a useful way to find a lost update. Actual machine instructions depend on compiler, runtime, and architecture, so use documented language or OS guarantees rather than claiming one Python line maps to one locked instruction."], inlineCheck: ["Can an atomic counter alone protect a multi-field queue invariant?", ["Always", "No, not without a wider protocol", "Only when printed", "Only on x64"], 1, "Atomicity of one scalar does not make a compound state transition indivisible."] },
      { title: "The GIL is not an application transaction", paragraphs: ["CPython's interpreter lock controls execution of Python bytecode in one interpreter, but bytecode sequences can span multiple steps, calls can release the GIL, and implementation details change. It does not define the invariant for your application or coordinate with another process.", "Use threading.Lock or a higher-level synchronized structure when correctness depends on a compound Python operation. Treat a currently observed bytecode sequence as diagnostic detail, not a portable synchronization guarantee."] },
      { title: "Atomic access also has ordering and alignment rules", paragraphs: ["Windows Interlocked functions perform documented atomic updates on suitably aligned native values and include ordering semantics. They are valuable for counters, reference counts, flags, and compare-exchange state machines exposed through native code.", "Using InterlockedIncrement through ctypes requires an exact pointer to stable writable storage, correct type width and alignment, and lifetime that outlasts every call. A Python Lock is clearer for ordinary Python state. Reach for Interlocked only when the native contract is part of the lesson or integration requirement."] }
    ],
    visuals: [{ type: "flow", title: "One lost update, expanded into observable states", items: [
      { meta: "Initial", label: "counter = 0", detail: "Expected two completed increments", linkAfter: "both read" },
      { meta: "Local copies", label: "A = 0, B = 0", detail: "Shared value has not changed", linkAfter: "both add" },
      { meta: "Prepared writes", label: "A = 1, B = 1", detail: "Each decision is locally correct", linkAfter: "store" },
      { meta: "Final", label: "counter = 1", detail: "One update overwrote the other" }
    ], caption: "The invariant fails even though neither worker computes the wrong local arithmetic result." }],
    workedExamples: [{ type: "comparison", title: "Choose the scope of protection", prompt: "A worker reserves a slot and records its owner.", columns: [
      { title: "Atomic counter only", rows: [["Capacity", "Increment can be indivisible"], ["Owner record", "Updated separately"], ["Rollback", "Needs another protocol"], ["Fit", "Too narrow for the full invariant"]] },
      { title: "One lock", rows: [["Capacity", "Checked under the lock"], ["Owner record", "Published in the same section"], ["Rollback", "Can restore both fields"], ["Fit", "Clear compound transaction"]] }
    ], shared: "Both designs still need bounded input, exception handling, and a defined release path.", conclusion: "Match the indivisible region to the invariant, not to the smallest available primitive." }],
    windowsLearning: [
      { title: "Interlocked is a native contract, not a speed spell", paragraphs: ["InterlockedIncrement returns the resulting value after the atomic update. InterlockedCompareExchange changes a destination only when it equals an expected comparator, which can support lock-free state transitions when the complete algorithm is proven.", "Lock-free does not mean wait-free, simple, or always faster. Cache-line contention, retry loops, reclamation, and memory ordering make real lock-free structures advanced work. Use locks for the compound course examples unless the scalar operation itself is the subject."] },
      { title: "Measure correctness before throughput", paragraphs: ["A faster unsafe counter is not an optimization. First assert the expected result across a constructed failure schedule and normal runs, then measure the correct alternatives. Keep the forced barrier mode separate from performance measurements because its purpose is explanation.", "The race_counter_lab.py starter reports mode and final invariant. Add timing only after all threads join so partially completed work is never counted as success."] }
    ],
    practice: {
      title: "Explain why the lock changes the result", time: "25 min", intro: "Reuse the controlled race starter and focus on the operation boundary rather than adding more UI.",
      download: ["downloads/race_counter_lab.py", "race_counter_lab.py"],
      expectedOutcome: "The unsafe controlled schedule loses exactly one update. The protected schedule prevents both workers from reading the same old value inside the transaction and reaches the expected final count.",
      steps: [
        { action: "Mark the shared read, local computation, and shared write in controlled mode.", why: "The three stages reveal where another thread can enter.", observe: "The barrier deliberately sits between the read and write." },
        { action: "Move protection around only the write and predict the result before running.", why: "Serializing stale writes does not make their earlier reads current.", observe: "Both workers can still prepare the value 1." },
        { action: "Protect the whole read-modify-write and rerun.", why: "The second worker must now read the first worker's completed value.", observe: "Final value should be 2." },
        { action: "State why the result says nothing about a separate owner field.", why: "A proof must name the exact state covered.", observe: "The demonstrated invariant contains only the counter." }
      ],
      hints: [{ title: "The unsafe run reaches 2", body: "Use controlled mode. Free scheduling is intentionally nondeterministic and a successful result does not invalidate the race model." }],
      cleanup: ["Join both workers before exiting.", "Remove experimental timing output if it obscures the state trace."],
      extension: { title: "Independent variation", prompt: "Describe the exact ctypes type, alignment, pointer lifetime, and error assumptions required before calling InterlockedIncrement on native storage." }
    },
    checks: [
      ["What makes the shown increment unsafe?", ["The number is decimal", "Read and write can be interleaved", "Threads have separate PIDs", "Waits close handles"], 1, "Both workers can derive a write from the same old shared value."],
      ["What does InterlockedIncrement protect?", ["Every nearby field", "One documented native update", "All Python code", "The process lifetime"], 1, "Its guarantee is specific to the destination operation and native contract."]
    ]
  },

  "critical-sections-mutexes": {
    apis: ["win32event.CreateMutex", "win32event.OpenMutex", "win32event.WaitForSingleObject", "win32event.ReleaseMutex", "win32api.CloseHandle"],
    phases: {
      learn: ["Model exclusive ownership", "Distinguish process-local locking, kernel mutex state, recursion, and abandonment."],
      windows: ["Handle every mutex result", "Treat wait status, ownership, protected data, and release as one contract."],
      investigation: ["Repair the party transaction", "Use the repository script to prove state safety and cleanup order."],
      review: ["Check mutex reasoning", "Test ownership, timeout, abandonment, release, naming, and lifetime."]
    },
    learning: [
      { title: "A lock protects an invariant by controlling entry", paragraphs: ["Python threading.Lock is process-local and does not track a Windows kernel mutex object. A Windows mutex is waitable, records its owning thread, supports recursive acquisition by that owner, can be named, and can coordinate processes with handles to the same object.", "Kernel visibility and cross-process naming cost more than a simple process-local lock. party.py uses a mutex intentionally because the module is teaching native wait results and object ownership, even though threading.Lock could protect its in-process cake count more simply."], inlineCheck: ["Why might party.py deliberately use a Win32 mutex?", ["Python locks cannot protect integers", "To teach native ownership and wait results", "Mutexes remove all deadlocks", "It makes every thread a process"], 1, "The exercise uses a kernel mutex to expose Windows object semantics."] },
      { title: "Acquisition status determines whether release is legal", paragraphs: ["WAIT_OBJECT_0 means this thread acquired the mutex normally. WAIT_ABANDONED means the previous owner ended without releasing it, and this waiter now owns it. WAIT_TIMEOUT means it acquired nothing. An unexpected result or pywintypes.error must not flow into ReleaseMutex.", "Set an acquired flag only for normal and abandoned acquisition. Put ReleaseMutex in finally behind that flag. This makes cleanup follow actual ownership rather than assuming the call above succeeded."] },
      { title: "Abandonment reports damaged trust, not automatic repair", paragraphs: ["When WAIT_ABANDONED is returned, Windows can transfer mutex ownership but cannot know whether the protected data was left halfway through an update. Validate, restore from a durable transaction, discard the shared state, or shut down safely according to the application protocol.", "party.py's cake count is in the same process as its threads, so ordinary unhandled Python exceptions do not terminate just one native owner while preserving a separate process's memory. Use a purpose-built cross-process lab to demonstrate true abandonment rather than forcibly damaging the course script."] }
    ],
    visuals: [{ type: "flow", title: "A mutex wait changes ownership differently on each branch", items: [
      { meta: "Wait", label: "WaitForSingleObject", detail: "Bounded timeout or INFINITE", linkAfter: "returns" },
      { meta: "Normal", label: "WAIT_OBJECT_0", detail: "Own mutex, state assumed consistent", linkAfter: "or" },
      { meta: "Abandoned", label: "WAIT_ABANDONED", detail: "Own mutex, state is suspect", linkAfter: "eventually" },
      { meta: "Release", label: "ReleaseMutex in finally", detail: "Only if this thread acquired" }
    ], caption: "WAIT_TIMEOUT is intentionally outside the ownership path because there is nothing to release." }],
    workedExamples: [{ type: "branch", title: "Turn one wait result into correct control flow", prompt: "A guest waits up to two seconds for the cake mutex.", setupCode: "result = win32event.WaitForSingleObject(cake_mutex, 2_000)", branches: [
      { value: "WAIT_OBJECT_0", meaning: "Normal acquisition.", action: "Set acquired, update the protected state, release in finally." },
      { value: "WAIT_ABANDONED", meaning: "Acquired after an owner ended unexpectedly.", action: "Set acquired, validate or reject state, then release in finally." },
      { value: "WAIT_TIMEOUT", meaning: "No acquisition before the deadline.", action: "Report or cancel. Do not release." },
      { value: "pywintypes.error", meaning: "The wrapper reported an API failure.", action: "Record winerror, function, and message. Do not release." }
    ], conclusion: "The wait result is part of the program's state machine, not a disposable return value." }],
    windowsLearning: [
      { title: "Named mutex identity and handle identity differ", paragraphs: ["CreateMutex with Local\\CakeMutex creates or opens an object in the current session namespace. Each process receives its own numeric handle value. The name locates the object, the handle grants process-specific access, and ownership belongs to a thread after a successful wait.", "WinObj can show the named Mutant object, the Windows internal object type used for mutexes. Process Explorer can show handles in the process, while the program's logs establish which thread currently owns the critical operation."] },
      { title: "Review the supplied party.py as a lifetime graph", paragraphs: ["The script correctly protects the cake check, deliberate delay, decrement, and result under one acquisition. It joins every guest before closing shared event and mutex handles. The started flag and final SetEvent attempt are meant to avoid leaving guests blocked if main begins cleanup after the gate was used.", "Improve narrow error reporting rather than using a bare except. Preserve unexpected failures, fix the spelling in diagnostic text, and decide whether an abandoned cake state can be trusted instead of only logging a warning."] }
    ],
    codeWalkthroughs: [{ title: "Acquire, validate, and release without inventing ownership", intro: "The Boolean records a fact established by the wait result.", stages: [
      { title: "Start with no ownership", explanation: "Initialization before try also covers exceptions raised by the wait call.", code: "acquired = False\ntry:\n    result = win32event.WaitForSingleObject(mutex, 2_000)" },
      { title: "Accept only ownership results", explanation: "Normal and abandoned results grant ownership, but abandoned state needs its own recovery decision.", code: "    if result == win32event.WAIT_OBJECT_0:\n        acquired = True\n    elif result == win32event.WAIT_ABANDONED:\n        acquired = True\n        validate_shared_state()\n    elif result == win32event.WAIT_TIMEOUT:\n        return False\n    else:\n        raise RuntimeError(f\"unexpected wait status: {result}\")" },
      { title: "Release only what this thread owns", explanation: "A timeout or failed call leaves acquired false.", code: "    update_invariant()\n    return True\nfinally:\n    if acquired:\n        win32event.ReleaseMutex(mutex)" }
    ] }],
    practice: {
      title: "Audit and run the cake transaction", time: "40 min", intro: "The starter mirrors party.py with explicit wait branches and bounded observation points.",
      download: ["downloads/party_lab.py", "party_lab.py"],
      expectedOutcome: "All guests should cross the manual-reset event. Exactly the configured number should consume cake, the remaining guests should report no cake, the count should end at zero, and both native handles should close only after every guest joins.",
      steps: [
        { action: "Draw main as owner and each guest as a borrower of both handles.", why: "The lifetime rule must be clear before threads start.", observe: "No guest closes the shared handles." },
        { action: "Run with five guests and three pieces, then inspect the logs around the one-second critical section.", why: "The delay makes serialized ownership visible.", observe: "Cake outcomes should appear one at a time even though gate arrival is concurrent." },
        { action: "Change the mutex wait to a short timeout and add delay to force timeout branches.", why: "A non-owner path must be tested, not merely written.", observe: "Timed-out guests must not call ReleaseMutex or decrement." },
        { action: "Compare the starter with repository party.py and list each error or cleanup path that needs strengthening.", why: "Repository solutions are curriculum evidence, not automatically final reference implementations.", observe: "Include abandoned-state validation and narrow exception handling." }
      ],
      hints: [{ title: "ReleaseMutex reports access or ownership failure", body: "Trace the acquired flag. It must become true only after WAIT_OBJECT_0 or WAIT_ABANDONED in the same thread that releases." }],
      cleanup: ["Allow or signal all guest threads to exit, then join them.", "Close the event and mutex handles once in main."],
      extension: { title: "Independent variation", prompt: "Replace the Win32 mutex with threading.Lock, list which observable Windows semantics disappear, and verify the cake invariant remains the same." }
    },
    checks: [
      ["Does WAIT_ABANDONED mean the waiter failed to acquire the mutex?", ["Yes", "No, it owns the mutex but state may be inconsistent", "Only for events", "Only in kernel mode"], 1, "Ownership transfers, but the previous owner's incomplete update makes the protected state suspect."],
      ["Should a timeout branch call ReleaseMutex?", ["Yes", "No", "Only twice", "Only when named"], 1, "A timeout grants no ownership."]
    ]
  },

  "semaphores": {
    apis: ["win32event.CreateSemaphore", "win32event.OpenSemaphore", "win32event.WaitForSingleObject", "win32event.ReleaseSemaphore", "threading.Semaphore"],
    phases: {
      learn: ["Model counted capacity", "Track permit count, maximum, acquisition, and release without mutex assumptions."],
      windows: ["Observe a bounded resource", "Connect the semaphore handle to worker admission and timeout behavior."],
      investigation: ["Limit concurrent workers", "Prove the active count never exceeds capacity and permits are not leaked."],
      review: ["Check semaphore reasoning", "Test count, ownership, timeout, over-release, and cleanup."]
    },
    learning: [
      { title: "A semaphore stores available permits", paragraphs: ["CreateSemaphore receives an initial count and maximum count. A successful wait subtracts one permit. ReleaseSemaphore adds a requested number, but cannot raise the count above the maximum. Count zero makes later waits block or time out.", "This models capacity such as three connections or four work slots. It does not identify a particular physical resource. After admission, the application must still select and protect the actual connection, buffer, or device."], inlineCheck: ["What happens after a successful semaphore wait?", ["The count decreases", "The handle closes", "An owner is recorded", "Every waiter runs"], 0, "One available permit is consumed."] },
      { title: "There is no owning thread", paragraphs: ["Unlike a mutex, a semaphore does not track which thread acquired a permit. Any caller with suitable rights can release it. This enables producer-consumer patterns but also means an extra release is a logic error Windows cannot connect to a specific earlier waiter.", "Pair one release with each successful acquisition in application logic. A timeout, exception before acquisition, or failed wait must not release. A max-count-one semaphore is a binary gate, not a mutex with abandonment reporting."] },
      { title: "Capacity and data safety are separate", paragraphs: ["A semaphore can keep active workers at three while all three still race on the same list. Use another ownership rule for shared mutable state, or give each admitted worker a distinct resource from a synchronized pool.", "Fairness is not a portable guarantee of the simple semaphore contract. Avoid correctness rules that depend on the longest-waiting worker always entering next."] }
    ],
    visuals: [{ type: "flow", title: "Follow the permit count through one worker", items: [
      { meta: "Initial", label: "count = 3", detail: "Three workers may enter", linkAfter: "successful wait" },
      { meta: "Admitted", label: "count = 2", detail: "One permit held by protocol", linkAfter: "work or exception" },
      { meta: "Finally", label: "ReleaseSemaphore(1)", detail: "Only after acquisition", linkAfter: "restores" },
      { meta: "Available", label: "count = 3", detail: "Never exceed maximum" }
    ], caption: "The application remembers who owes a release because the semaphore itself does not track an owner." }],
    workedExamples: [{ type: "trace", title: "Explain a timeout without leaking capacity", prompt: "Capacity is two, workers A and B are active, and C waits for 100 ms.", steps: [
      { title: "A and B acquire", action: "Two successful waits reduce the count from 2 to 0.", why: "All capacity is in use.", result: "Both workers owe one release." },
      { title: "C times out", action: "The wait returns WAIT_TIMEOUT.", why: "No permit became available before C's deadline.", result: "C owes no release." },
      { title: "A completes", action: "A releases one permit in finally.", why: "Its successful acquisition established that obligation.", result: "Count becomes 1." },
      { title: "C retries by policy", action: "A new wait can now acquire, if retry is permitted.", why: "Timeout and retry are separate application decisions.", result: "Count returns to 0 on acquisition." }
    ], conclusion: "Track release obligation from the successful wait, never from worker creation." }],
    windowsLearning: [
      { title: "ReleaseSemaphore exposes the previous count", paragraphs: ["pywin32 ReleaseSemaphore returns the previous count. This can help diagnostics, but it does not prove the releasing thread was the one that acquired. An over-release past maximum raises a Windows error and indicates broken application bookkeeping.", "Name the semaphore only when another process must discover it. Local and Global namespaces and the security descriptor then become part of the design, just as they do for named events and mutexes."] },
      { title: "Observe admission with program evidence", paragraphs: ["WinObj and Process Explorer show object and handle existence, not a friendly live count history. The starter keeps an independent active count under a small Python lock and asserts active <= capacity. That lock protects measurement only, while the Win32 semaphore controls admission.", "Include worker ID, acquisition result, active count, and release in logs. A missing release is then visible as later timeouts even after work appears finished."] }
    ],
    practice: {
      title: "Prove a three-worker capacity limit", time: "25 min", intro: "Run ten workers through a Win32 semaphore and test success plus timeout paths.",
      download: ["downloads/semaphore_lab.py", "semaphore_lab.py"],
      expectedOutcome: "At most three workers should report active at once. Every successful worker should release once, timed-out workers should release zero times, and the final probe should acquire all three permits again.",
      steps: [
        { action: "Run the default capacity-three scenario and follow the active-count log.", why: "The independent assertion makes an admission violation explicit.", observe: "Peak active should equal or remain below three." },
        { action: "Use a very short timeout so some workers receive WAIT_TIMEOUT.", why: "The non-acquisition branch tests release bookkeeping.", observe: "Timed-out worker IDs should have no matching release." },
        { action: "Add an intentional extra release in a disposable run and capture the exact error.", why: "Maximum count is enforced and the error should be recognized.", observe: "Undo the intentional bug immediately after recording it." },
        { action: "Inspect the named object while workers are paused, then let all workers join.", why: "Object visibility and application count evidence answer different questions.", observe: "The handle should disappear after final close when no process retains it." }
      ],
      hints: [{ title: "Peak active exceeds capacity", body: "Check whether the independent active counter itself is protected, and verify that work begins only after WAIT_OBJECT_0." }],
      cleanup: ["Join every worker and close the semaphore handle once.", "Remove the deliberate over-release before keeping the script."],
      extension: { title: "Independent variation", prompt: "Model a pool of three distinct resource IDs and explain why a second synchronized structure is needed after semaphore admission." }
    },
    checks: [
      ["Does a semaphore report an abandoned owner?", ["Yes", "No, it has no owner", "Only at count zero", "Only when named"], 1, "Abandonment is a mutex ownership concept."],
      ["What should a timed-out worker release?", ["One permit", "No permit", "The maximum count", "Every handle"], 1, "It did not acquire capacity."]
    ]
  },

  "events-waits": {
    apis: ["win32event.CreateEvent", "win32event.OpenEvent", "win32event.SetEvent", "win32event.ResetEvent", "win32event.WaitForSingleObject"],
    phases: {
      learn: ["Model signaled state", "Distinguish manual reset, auto reset, wait status, naming, and object lifetime."],
      windows: ["Trace the invitation pair", "Map inviter.py and invitee.py to event state and per-process handles."],
      investigation: ["Run both reset modes", "Predict how many waiters proceed and verify every failure branch."],
      review: ["Check event reasoning", "Test state, access, timeouts, namespaces, reset, and cleanup."]
    },
    learning: [
      { title: "An event stores a condition, not an arbitrary message", paragraphs: ["An event object is either signaled or nonsignaled. Waiters observe that condition through a wait. SetEvent changes it to signaled and ResetEvent changes a manual-reset event back to nonsignaled. The event does not carry the birthday greeting or identify which worker should eat cake.", "Use a manual-reset event when one published condition should release a group and remain true until explicitly reset. Use auto reset when each signal should satisfy approximately one waiter and then return to nonsignaled. Signals are state changes, not an unbounded queue of notifications."], inlineCheck: ["Which reset mode fits one start gate for all current guests?", ["Manual reset", "Auto reset", "A semaphore only", "No waitable object"], 0, "One SetEvent leaves a manual-reset gate signaled until ResetEvent."] },
      { title: "A name enables discovery, while handles enable access", paragraphs: ["inviter.py creates Local\\ThreadBirthdayDance. invitee.py opens that exact name with SYNCHRONIZE access. The two processes can have different numeric handle values referring to the same kernel object. The Local prefix scopes the name to the current session.", "CreateEvent can open an existing object of the same name, so production code may need GetLastError to distinguish creation from opening. Name collisions and permissive default security can create correctness or security problems. Use a unique lab name and minimum access."] },
      { title: "Object lifetime depends on every open handle", paragraphs: ["The named event exists while at least one handle remains open. Closing the inviter's handle does not destroy it if invitees still hold handles. Once the last handle closes, a later OpenEvent normally fails with ERROR_FILE_NOT_FOUND unless another creator recreates the name.", "Waiting does not close a handle. Signaling does not close it either. Each process closes only the handles it owns in finally."] }
    ],
    visuals: [{ type: "state", title: "A manual-reset invitation event across three processes", items: [
      { meta: "Create", label: "Nonsignaled event", detail: "Inviter owns one handle", linkAfter: "open and wait" },
      { meta: "Waiting", label: "Two invitee handles", detail: "Both threads block efficiently", linkAfter: "SetEvent once" },
      { meta: "Signaled", label: "Both waiters proceed", detail: "Later waits also pass", linkAfter: "ResetEvent" },
      { meta: "Nonsignaled again", label: "Future waits block", detail: "Handles remain open" }
    ], caption: "Manual reset separates state from handle lifetime. Resetting changes the condition, while closing changes ownership references." }],
    workedExamples: [{ type: "branch", title: "Interpret every single-object event wait outcome", prompt: "invitee.py waits up to five seconds instead of forever.", setupCode: "result = win32event.WaitForSingleObject(event_handle, 5_000)", branches: [
      { value: "WAIT_OBJECT_0", meaning: "The event satisfied the wait.", action: "Proceed to the birthday action." },
      { value: "WAIT_TIMEOUT", meaning: "The event did not become signaled in time.", action: "Report timeout or retry by policy, then close the handle." },
      { value: "pywintypes.error: 6", meaning: "The handle is invalid or was mismanaged.", action: "Treat as an API failure and audit ownership." },
      { value: "OpenEvent error 2", meaning: "No object with that name exists in this namespace.", action: "Start inviter first or correct the exact name." }
    ], conclusion: "WAIT_ABANDONED is not an event result. It describes a mutex owner that terminated." }],
    windowsLearning: [
      { title: "Read inviter.py as the creator path", paragraphs: ["CreateEvent(None, True, False, name) requests default security attributes, manual reset, initially nonsignaled state, and the shared name. input pauses while invitees open handles. SetEvent publishes the condition, then finally closes only the inviter's handle.", "If the inviter exits immediately after signaling, already-open invitees still own valid handles. A late invitee can miss the object entirely after the final existing handle closes. If late arrival must work, a longer-lived owner or another rendezvous design is required."] },
      { title: "Read invitee.py as the minimum-right waiter", paragraphs: ["OpenEvent(SYNCHRONIZE, False, name) asks only to wait and does not make the returned handle inheritable. It does not request EVENT_MODIFY_STATE because the invitee never signals or resets the event.", "The supplied infinite wait is appropriate for the simple happy-path exercise but hides timeout and cancellation design. The lab starter adds a bounded option so the lesson can test both result branches without leaving a terminal blocked."] }
    ],
    codeWalkthroughs: [{ title: "Build the invitation contract in two roles", intro: "The same named object is reached through different rights and responsibilities.", stages: [
      { title: "Creator establishes state", explanation: "Manual reset releases all waiters and False starts the gate closed.", code: "event = win32event.CreateEvent(\n    None, True, False, r\"Local\\ILOVEOS_InvitationLab\"\n)" },
      { title: "Waiter opens minimum access", explanation: "SYNCHRONIZE permits waiting without granting state modification.", code: "event = win32event.OpenEvent(\n    win32con.SYNCHRONIZE, False, EVENT_NAME\n)" },
      { title: "Waiter branches on status", explanation: "Timeout is a normal control result, while wrapper failures arrive as exceptions.", code: "result = win32event.WaitForSingleObject(event, 5_000)\nif result == win32event.WAIT_OBJECT_0:\n    print(\"invitation received\")\nelif result == win32event.WAIT_TIMEOUT:\n    print(\"invitation timed out\")\nelse:\n    raise RuntimeError(result)" }
    ] }],
    practice: {
      title: "Run the invitation state machine", time: "35 min", intro: "The downloadable pair is one script with creator and waiter roles, making both endpoints easy to launch.",
      download: ["downloads/event_pair_lab.py", "event_pair_lab.py"],
      expectedOutcome: "In manual mode, one signal should release every waiting process and later waiters while the creator retains the signaled event. In auto mode, one signal should release one waiter. Missing creator and timeout runs should produce distinct explanations.",
      steps: [
        { action: "Start creator mode, then two waiter terminals, and inspect the named event and process handles.", why: "This establishes one object with multiple per-process references.", observe: "Handle values can differ even though the name and object are shared." },
        { action: "Signal manual mode once and verify both current waiters proceed.", why: "Manual reset publishes a group condition.", observe: "A later waiter should also proceed until reset or object destruction." },
        { action: "Repeat in auto mode and predict which waiter runs.", why: "One signal normally satisfies one waiter, but waiter selection should not be treated as a fairness guarantee.", observe: "A second waiter should remain blocked or time out until another signal." },
        { action: "Run waiter with no creator and then run a timeout case.", why: "Open failure and completed timeout are different stages.", observe: "Expect error 2 for absent name, and WAIT_TIMEOUT only after a handle was opened." }
      ],
      hints: [{ title: "A late manual waiter cannot open the event", body: "The last handle may already have closed. Signaled state persists only while the object exists, not as a permanent record of an earlier name." }],
      cleanup: ["Let every waiter return or time out.", "Close all creator and waiter handles, then confirm the named event disappears."],
      extension: { title: "Independent variation", prompt: "Add a separate shutdown event and use WaitForMultipleObjects to distinguish start, cancel, and timeout without overloading one event's meaning." }
    },
    checks: [
      ["Does SetEvent transfer text to waiters?", ["Yes", "No, it changes signaled state", "Only in message mode", "Only through WinObj"], 1, "Payload transfer requires another mechanism."],
      ["What access does a pure event waiter normally need?", ["SYNCHRONIZE", "PROCESS_ALL_ACCESS", "EVENT_MODIFY_STATE only", "GENERIC_WRITE"], 0, "SYNCHRONIZE permits waiting on the handle."]
    ]
  },

  "deadlocks-starvation": {
    apis: ["threading.Lock", "threading.Barrier", "win32event.WaitForMultipleObjects", "Wait Chain Traversal", "Process Explorer Threads"],
    phases: {
      learn: ["Reason about liveness", "Distinguish deadlock, starvation, livelock, blocking, and slow progress."],
      windows: ["Build a wait-for graph", "Use thread stacks and ownership evidence without mistaking a symptom for a cause."],
      investigation: ["Create and remove one cycle", "Diagnose a disposable two-lock deadlock, then prove the ordering fix."],
      review: ["Check liveness design", "Test lock order, bounded waits, cancellation, recovery, and observability."]
    },
    learning: [
      { title: "Deadlock is a dependency cycle", paragraphs: ["In the classic two-lock case, thread A owns lock 1 and waits for lock 2 while thread B owns lock 2 and waits for lock 1. Neither can make the release that would help the other. A slow operation, a long queue, or one ordinary blocked read is not automatically a deadlock.", "The common conditions are mutual exclusion, hold and wait, no forced preemption, and circular wait. A single global acquisition order removes the circular wait for locks governed by that order."], inlineCheck: ["What evidence most directly establishes a two-lock deadlock?", ["High CPU usage", "A cycle in the wait-for graph", "Many log lines", "Two PIDs"], 1, "Deadlock is defined by the circular dependency, not by elapsed time alone."] },
      { title: "Starvation and livelock fail differently", paragraphs: ["Starvation means one participant can be delayed indefinitely while others keep progressing, perhaps because of priority, unfair admission, or constant competition. Livelock means participants keep reacting and changing state but do not complete useful work.", "Adding immediate timeout and retry can turn a deadlock risk into livelock. Add backoff, ordering, bounded attempts, cancellation, or a central coordinator according to the protocol rather than retrying forever."] },
      { title: "Timeout creates a branch, not a rollback", paragraphs: ["A timeout tells the waiter that its condition was not met by the deadline. It does not undo changes made before the wait and does not prove the owner is dead. Code must decide whether to retry, cancel, collect diagnostics, release already-owned resources, or abandon the operation.", "Never release a lock or mutex that the timeout branch did not acquire. If partial state was changed before waiting, use a transaction or explicit recovery plan."] }
    ],
    visuals: [{ type: "flow", title: "The cycle that prevents both workers from progressing", items: [
      { meta: "Thread A", label: "Owns lock 1", detail: "Waiting for lock 2", linkAfter: "needed from" },
      { meta: "Thread B", label: "Owns lock 2", detail: "Waiting for lock 1", linkAfter: "needed from" },
      { meta: "Cycle", label: "A waits for B, B waits for A", detail: "No owner reaches release", linkAfter: "break with" },
      { meta: "Design", label: "One lock order", detail: "Both acquire lock 1 before lock 2" }
    ], caption: "A timeout can reveal the cycle, but the consistent order removes it." }],
    workedExamples: [{ type: "decision", title: "Respond to a thread that has stopped progressing", prompt: "A worker has waited five seconds for a resource.", steps: [
      { title: "Identify the condition", action: "Record thread ID, requested object, current owners, and the operation preceding the wait.", why: "Elapsed time alone cannot classify the liveness problem.", result: "One wait-for edge is known." },
      { title: "Follow dependencies", action: "Repeat for the owner and draw edges until they end or form a cycle.", why: "A cycle establishes deadlock, while an active owner suggests delay or starvation.", result: "The failure category is evidence-based." },
      { title: "Preserve state", action: "Capture stacks and logs before forceful termination in the disposable lab.", why: "Killing the process destroys the waiting arrangement you need to explain.", result: "The blocked state remains inspectable." },
      { title: "Change the design", action: "Apply one order or remove nested acquisition, then rerun the constructed schedule.", why: "A diagnostic timeout is not the final correction.", result: "Both workers join successfully." }
    ], conclusion: "Diagnose dependency, then remove the dependency pattern that permits the failure." }],
    windowsLearning: [
      { title: "Stacks and wait chains are complementary", paragraphs: ["Process Explorer can show thread stacks and waiting locations. Wait Chain Traversal can expose selected waits among threads and synchronization objects. Neither tool understands every application-level queue, condition, or custom protocol.", "Combine system evidence with logs that include thread name, native ID, requested lock, acquired lock, hold time, and release. This lets you translate stack locations into the program's ownership vocabulary."] },
      { title: "Shutdown must release blocked participants", paragraphs: ["A clean design has a cancellation condition and a way to wake workers so they can observe it. Closing a handle while another thread waits on it is not a general cancellation technique and can have undefined or failure behavior depending on the API contract.", "In party.py, setting the start event before joining in the cleanup path prevents guests from remaining at the gate. A more complete program would also bound joins and propagate worker failures to main."] }
    ],
    practice: {
      title: "Diagnose and remove a two-lock cycle", time: "30 min", intro: "Use only the disposable starter and its built-in barrier so the cycle is deliberate.",
      download: ["downloads/deadlock_lab.py", "deadlock_lab.py"],
      expectedOutcome: "Deadlock mode should report both workers holding their first lock and timing out on their second, which exposes a cycle without permanently hanging. Ordered mode should let both workers complete and join.",
      steps: [
        { action: "Run deadlock mode and draw the two ownership and wait edges from its log.", why: "The barrier guarantees each worker owns one lock before requesting the other.", observe: "A waits for B's lock and B waits for A's lock." },
        { action: "Inspect the paused or bounded-wait threads in Process Explorer.", why: "Native thread evidence connects the Python model to Windows scheduling.", observe: "Record stacks as supporting evidence, not as the complete ownership graph." },
        { action: "Run ordered mode and explain which deadlock condition was removed.", why: "Both workers now request locks in the same global order.", observe: "No circular wait forms and both joins complete." },
        { action: "Design a shutdown event for a worker blocked on ordinary work.", why: "Liveness includes controlled termination, not only lock ordering.", observe: "State how a multiple-object wait distinguishes work from cancellation." }
      ],
      hints: [{ title: "The lab never returns", body: "Keep the provided bounded second-lock acquisition while learning. An infinite wait makes the failure harder to clean up and adds no explanatory value." }],
      cleanup: ["Allow both bounded waits to finish and join both threads.", "Do not use forceful termination outside this disposable process."],
      extension: { title: "Independent variation", prompt: "Add a third lock and show how a numeric lock rank can reject an acquisition that would violate the global order." }
    },
    checks: [
      ["Does a timeout repair partially updated shared state?", ["Yes", "No", "Only for mutexes", "Only after logging"], 1, "It reports elapsed waiting and requires a separate recovery policy."],
      ["Which change directly prevents circular wait?", ["Higher priorities", "One acquisition order", "More threads", "Longer sleeps"], 1, "A consistent order prevents a dependency cycle among governed locks."]
    ]
  },

  "why-ipc": {
    apis: ["win32pipe.CreatePipe", "win32pipe.CreateNamedPipe", "CreateFileMappingW", "socket.socket", "Process Monitor named pipes"],
    phases: {
      learn: ["Design the exchange", "Separate transport, protocol, synchronization, security, ownership, and failure policy."],
      windows: ["Map IPC to Windows objects", "Choose discovery and observation evidence that matches the mechanism."],
      investigation: ["Write an IPC decision record", "Defend a mechanism for topology, data semantics, trust, and operations."],
      review: ["Check the channel design", "Test framing, identity, backpressure, shutdown, and cleanup."]
    },
    learning: [
      { title: "Isolation makes every crossing explicit", paragraphs: ["A pointer is meaningful only in the virtual address space whose mappings interpret it. A Python object reference cannot be handed to an unrelated process as though both heaps were one. IPC either copies bytes through an endpoint, shares a common backing object, or transfers access to an OS object through inherited, duplicated, or named handles.", "This boundary improves fault and security isolation, but it introduces serialization, validation, peer identity, cancellation, and independent process lifetime. The transport is only one part of the solution."], inlineCheck: ["Why is an ordinary pointer not an IPC message?", ["Pointers contain letters", "The receiver has a different address space", "Windows forbids integers", "Pipes require decimal"], 1, "The same numeric address can refer to unrelated mappings in another process."] },
      { title: "A protocol makes bytes meaningful", paragraphs: ["Define encoding, framing, version, maximum size, request and response shape, error representation, ordering, timeout, and shutdown. A byte stream does not preserve the boundaries of WriteFile calls, so one read can return part of a message or several messages unless the mechanism's mode or your framing handles it.", "Length-prefixed messages need bounds checks before allocation. Delimiter protocols need escaping or a rule that excludes the delimiter. Fixed records need size, alignment, and version rules. Never let one observed read size become an undocumented protocol."] },
      { title: "Endpoint access and peer trust are separate questions", paragraphs: ["A security descriptor controls who can open a named endpoint or mapping. The server may also need to identify the connected client and authorize each requested action. A discoverable pipe name does not authenticate the peer, and a successful open does not make input trustworthy.", "Record who creates the endpoint, who may connect, whether data needs confidentiality or integrity, and what happens when one side exits mid-message. Use minimum rights and validate every untrusted length, command, path, and version."] }
    ],
    visuals: [{ type: "layers", title: "Every IPC solution needs four aligned layers", items: [
      { meta: "Topology", label: "Who connects to whom", detail: "Parent-child, local client-server, peer, network", linkAfter: "selects" },
      { meta: "Transport", label: "Pipe, mapping, socket, file", detail: "Bytes, messages, shared backing, persistence", linkAfter: "carries" },
      { meta: "Protocol", label: "Frame, encode, version, limit", detail: "Meaning and failure responses", linkAfter: "protected by" },
      { meta: "Operations", label: "Identity, timeout, shutdown", detail: "Ownership, evidence, cleanup" }
    ], caption: "Choosing an API before specifying the other layers usually pushes ambiguity into error paths." }],
    workedExamples: [{ type: "comparison", title: "Match three common topologies", prompt: "Choose a starting mechanism, then state what it still does not solve.", columns: [
      { title: "Parent captures child output", rows: [["Mechanism", "Anonymous pipe"], ["Discovery", "Inherited handle"], ["Framing", "Byte stream or command convention"], ["Main risk", "Leaked writer prevents EOF"]] },
      { title: "Local request server", rows: [["Mechanism", "Named pipe"], ["Discovery", "Canonical pipe name"], ["Framing", "Message mode or explicit stream frames"], ["Main risk", "Weak ACL or unvalidated request"]] },
      { title: "Large local data", rows: [["Mechanism", "Shared mapping"], ["Discovery", "Name or transferred handle"], ["Framing", "Versioned shared layout"], ["Main risk", "Torn or out-of-bounds state"]] }
    ], conclusion: "The mechanism narrows the design space but never replaces the protocol and lifetime contract." }],
    windowsLearning: [
      { title: "Use evidence matched to the endpoint", paragraphs: ["Process Monitor can show named-pipe CreateFile, CreateNamedPipe, reads, writes, and results over time. Handle and Process Explorer can show which process currently owns pipe, section, event, or mutex handles. WinObj is especially helpful for named sections and synchronization objects.", "A tool view is partial. Anonymous pipe endpoint names can be less convenient than an ownership table, payload contents should not be logged when sensitive, and shared-memory writes may not appear as file-style I/O after mapping."] },
      { title: "Backpressure is observable behavior", paragraphs: ["A bounded pipe buffer makes a producer block when the consumer does not drain it. Shared memory needs its own full or empty protocol. Files persist but require coordination around completeness and rename or locking rules. Sockets add network failure and partial transfer behavior.", "Decide whether producers block, reject, drop, overwrite, or spool when consumers fall behind. This policy affects correctness and user experience more than a simple fastest-mechanism comparison."] }
    ],
    practice: {
      title: "Produce an IPC design record", time: "25 min", intro: "Design three channels before running the mechanism-specific labs.",
      expectedOutcome: "Each scenario should have a topology, transport, framing rule, maximum message size, endpoint access rule, peer identity plan, timeout, backpressure behavior, shutdown signal, handle owner, and matching evidence tool.",
      steps: [
        { action: "Design parent-to-child command capture, a local identity service, and a high-volume shared status feed.", why: "Different topology and data semantics should lead to different tradeoffs.", observe: "Do not choose solely by throughput." },
        { action: "Write one valid frame and one malformed frame for each protocol.", why: "Validation becomes concrete only when failure input is specified.", observe: "Include oversize, truncated, and unsupported-version cases." },
        { action: "Draw each endpoint and handle owner from creation through shutdown.", why: "EOF and object lifetime depend on references that code can accidentally retain.", observe: "Mark inherited, opened, mapped, unmounted, and closed transitions." },
        { action: "Choose Process Monitor, Handle, Process Explorer, WinObj, or network tools for each question.", why: "Evidence quality depends on asking the tool a question it can answer.", observe: "State one important fact the chosen tool cannot prove." }
      ],
      hints: [{ title: "Every design uses a named pipe", body: "Recheck relationship, persistence, throughput, cross-platform needs, and whether sharing a mapped record is simpler than serializing every update." }],
      cleanup: ["This design exercise creates no endpoint.", "Keep the records for comparison after the following labs."],
      extension: { title: "Independent variation", prompt: "Add a networked cross-platform client and explain which assumptions in the local named-pipe design must change." }
    },
    checks: [
      ["Does a named endpoint authenticate its peer by name alone?", ["Yes", "No", "Only locally", "Only with pywin32"], 1, "Discovery, access control, and peer identity are distinct."],
      ["What does framing define?", ["How bytes form messages", "Which CPU runs", "The PID width", "The desktop color"], 0, "Framing lets the receiver find complete message boundaries."]
    ]
  },

  "anonymous-pipes": {
    apis: ["win32pipe.CreatePipe", "win32security.SECURITY_ATTRIBUTES", "win32api.SetHandleInformation", "win32process.STARTUPINFO", "win32process.CreateProcess", "win32file.ReadFile"],
    phases: {
      learn: ["Own every pipe endpoint", "Understand inheritance, redirection, EOF, backpressure, decoding, and child lifetime."],
      windows: ["Build a two-command pipeline", "Map pipe_one.py from endpoint creation to final handle close."],
      investigation: ["Run and inspect the pipeline", "Test output, failure, large data, EOF, and cleanup branches."],
      review: ["Check anonymous-pipe reasoning", "Test direction, inheritance, blocking, wait order, encoding, and ownership."]
    },
    learning: [
      { title: "An anonymous pipe is a one-way byte channel", paragraphs: ["CreatePipe returns read and write handles. Bytes written at the write end become available at the read end in order. The pipe does not know lines, Unicode, JSON, commands, or records. A two-way conversation requires two pipes or a different duplex mechanism.", "pipe_one.py needs two channels: pipeline read and write carry command one's stdout into command two's stdin, while capture read and write carry command two's stdout back to the parent. Give every endpoint a direction and owner before assigning variables."], inlineCheck: ["How many one-way pipes are needed for cmd1 | cmd2 with parent capture?", ["One", "Two", "Three per byte", "None"], 1, "One connects the children and one returns final output to the parent."] },
      { title: "Inheritance has an object flag and a process-creation gate", paragraphs: ["SECURITY_ATTRIBUTES.bInheritHandle makes newly created pipe handles inheritable. SetHandleInformation can clear HANDLE_FLAG_INHERIT on parent-only endpoints. CreateProcess must also enable handle inheritance, or use an explicit handle list in a more constrained design.", "When broad inheritance is enabled, every inheritable handle in the parent can be copied into the child, not just those placed in STARTUPINFO. Clear inheritance aggressively or use STARTUPINFOEX with a handle list for production-quality least exposure."] },
      { title: "EOF is a reference-count fact", paragraphs: ["A blocking ReadFile reaches pipe end only after all data is drained and every write handle referring to that pipe is closed. A parent copy or an unintended child inheritance is enough to keep the reader waiting forever after the intended writer exits.", "Close parent write endpoints immediately after the relevant child starts. Close inter-stage read endpoints when no future child needs them. Set local variables to None after close so finally does not close the same numeric handle twice."] }
    ],
    visuals: [{ type: "flow", title: "Own the endpoints in a two-command pipeline", items: [
      { meta: "Child 1", label: "stdin: parent, stdout: pipe A write", detail: "Keeps only the standard handles it needs", linkAfter: "pipe A bytes" },
      { meta: "Child 2", label: "stdin: pipe A read, stdout: pipe B write", detail: "Consumes first output and produces final output", linkAfter: "pipe B bytes" },
      { meta: "Parent", label: "reads pipe B read", detail: "Closes A read, A write, and B write copies", linkAfter: "then" },
      { meta: "Completion", label: "drain, EOF, wait, exit codes", detail: "Close process and thread handles" }
    ], caption: "The parent must not keep a write-side reference to pipe B, or its own read cannot observe EOF." }],
    workedExamples: [{ type: "trace", title: "Why read before waiting for the final child", prompt: "The final child writes more bytes than the pipe buffer can hold.", steps: [
      { title: "Child writes", action: "The child fills the bounded pipe buffer.", why: "No consumer has drained it yet.", result: "The next WriteFile blocks." },
      { title: "Parent waits", action: "The parent waits for the child's process handle before reading.", why: "A process handle is signaled only after the child exits.", result: "Parent blocks waiting for exit." },
      { title: "Cycle forms", action: "Child needs parent to read, parent needs child to exit.", why: "Backpressure has become a wait dependency.", result: "Pipeline hangs." },
      { title: "Correct order", action: "Parent drains output until EOF, then waits and reads exit codes.", why: "The child can complete writes and exit.", result: "Both sides progress." }
    ], conclusion: "Drain a potentially bounded output channel concurrently or before waiting for the producer to exit." }],
    windowsLearning: [
      { title: "STARTUPINFO changes the child's standard handles", paragraphs: ["Set STARTF_USESTDHANDLES, then assign hStdInput, hStdOutput, and hStdError. CreateProcess copies the selected inheritable handles when inheritance is enabled. The returned process handle, thread handle, PID, and TID are four distinct outputs with different cleanup requirements.", "The initial thread handle and process handle are owned by the parent and must close. PID and TID are identifiers, not handles. The child's copied standard handles are managed in the child process."] },
      { title: "The supplied pipe_one.py needs an ownership correction", paragraphs: ["The repository draft creates active handles in variables such as process_handle_one and second_pipe_read_handle, but its finally block closes a different family of variables initialized to None. As written, final capture, process, and thread handles can remain open until process exit. The lesson starter uses one ownership table and sets each variable to None immediately after an early close.", "The draft also imports locale but decodes UTF-8 unconditionally. Neither choice is universally correct for Windows console programs. Select a known child encoding, request UTF-8 output where possible, or use an observed code page with errors='replace' and document the boundary."] }
    ],
    codeWalkthroughs: [{ title: "Transfer selected endpoints to two children", intro: "Each close marks the point where the parent no longer owns a usable reference.", stages: [
      { title: "Create inheritable endpoints, then privatize reads", explanation: "Children write these channels, while the parent-only final read must not leak.", code: "a_read, a_write = inheritable_pipe()\nb_read, b_write = inheritable_pipe()\nset_inheritable(a_read, False)\nset_inheritable(b_read, False)" },
      { title: "Launch the first child", explanation: "Its stdout goes to pipe A. The parent closes its A write copy immediately.", code: "p1, t1, pid1, tid1 = create_child(\n    cmd1, startup(parent_stdin, a_write, parent_stderr)\n)\nclose(a_write)\na_write = None" },
      { title: "Launch the second and drop inter-stage ownership", explanation: "Temporarily allow A read to be inherited as child two's stdin.", code: "set_inheritable(a_read, True)\np2, t2, pid2, tid2 = create_child(\n    cmd2, startup(a_read, b_write, parent_stderr)\n)\nclose(a_read); a_read = None\nclose(b_write); b_write = None" },
      { title: "Drain, wait, inspect, close", explanation: "ERROR_BROKEN_PIPE is expected EOF only after all writers close.", code: "output = read_until_broken_pipe(b_read)\nwait_success(p1); wait_success(p2)\n# query exit codes, then close b_read, t1, t2, p1, p2" }
    ] }],
    practice: {
      title: "Run a corrected Windows pipeline", time: "50 min", intro: "The starter supports two or more quoted commands and records endpoint ownership.",
      download: ["downloads/pipeline_lab.py", "pipeline_lab.py"],
      expectedOutcome: "A simple pipeline should print only the final stage's captured stdout, report every child PID and exit code, reach EOF after all write endpoints close, and finish with no retained pipe, process, or thread handles.",
      steps: [
        { action: "Run two small commands and compare the printed ownership log with the diagram.", why: "Each endpoint close should have a clear reason and time.", observe: "The parent should retain only the final read plus process and thread handles after launch." },
        { action: "Run a producer with output larger than the buffer.", why: "This tests that the parent drains before waiting.", observe: "The command should finish rather than deadlock on a full buffer." },
        { action: "Run one failing command and preserve all child exit codes.", why: "A valid byte transfer does not imply each stage succeeded.", observe: "Output, EOF, and process exit are separate facts." },
        { action: "Inspect handles during the pause and compare with repository pipe_one.py cleanup variables.", why: "The source audit bridges the exercise's intended outcome and implementation hazards.", observe: "List any leaked or double-close path before modifying the repository draft." }
      ],
      hints: [{ title: "ReadFile never reaches EOF", body: "Search every process for a remaining write-side handle. Check both parent copies and handles inherited by children that never use that pipe." }],
      cleanup: ["Let every child exit, then close final pipe, thread, and process handles exactly once.", "Terminate only lab children you created if a deliberately broken ownership run hangs."],
      extension: { title: "Independent variation", prompt: "Use STARTUPINFOEX with an explicit handle list and explain how it reduces accidental inheritance compared with a broad True gate." }
    },
    checks: [
      ["What usually causes a pipe reader to wait forever at the end?", ["An open write handle remains", "The bytes are binary", "The PID is reused", "The pipe has a read end"], 0, "EOF depends on every write reference being closed."],
      ["Why drain output before waiting for the producer?", ["To avoid bounded-buffer deadlock", "To change its token", "To rename the pipe", "To reset an event"], 0, "A blocked writer cannot exit while the parent waits for that exit."]
    ]
  },

  "named-pipes": {
    apis: ["win32pipe.CreateNamedPipe", "win32pipe.ConnectNamedPipe", "win32pipe.WaitNamedPipe", "win32file.CreateFile", "win32pipe.SetNamedPipeHandleState", "win32file.ReadFile", "win32file.WriteFile"],
    phases: {
      learn: ["Build a named-pipe protocol", "Separate discovery, instances, mode, framing, security, and connection lifetime."],
      windows: ["Trace client and server branches", "Connect whats_my_name.py to the challenge endpoint and observable pipe activity."],
      investigation: ["Exchange a framed message", "Test success, timeout, connection races, partial messages, broken peers, and cleanup."],
      review: ["Check named-pipe reasoning", "Test naming, mode, framing, identity, limits, and disconnect behavior."]
    },
    learning: [
      { title: "The server creates instances, the client opens one", paragraphs: ["A local pipe name has the canonical form \\\\.\\pipe\\Name. CreateNamedPipe creates one server instance with direction, byte or message type, wait mode, instance limits, buffers, timeout, and security. ConnectNamedPipe waits for a client. The client may WaitNamedPipe for availability and opens through CreateFile.", "WaitNamedPipe succeeding is advisory. Another client can take the available instance before CreateFile, so the open still needs retry or failure handling. Servers normally loop by creating or reconnecting instances according to their concurrency design."], inlineCheck: ["What does WaitNamedPipe guarantee?", ["The later open cannot race", "An instance was available during the check", "The client is authenticated", "The response is UTF-8"], 1, "Availability can change before CreateFile."] },
      { title: "Byte mode and message mode expose different boundaries", paragraphs: ["Byte mode is a stream and needs length, delimiter, fixed-size, or close-delimited framing. Message mode preserves write boundaries, but a read buffer smaller than the message can return ERROR_MORE_DATA with a partial chunk. The client must continue until the complete message is assembled.", "Partial transfer is not only an asynchronous-I/O concern. Protocol code should loop writes until all intended bytes are accepted when the API contract permits partial completion, and loop reads according to stream framing or message-mode status."] },
      { title: "A pipe endpoint is a security boundary", paragraphs: ["CreateNamedPipe accepts security attributes that determine who may connect. A server can impersonate a connected client for supported operations, but it must revert promptly and authorize the requested action under an intentional policy.", "Do not trust a client-supplied username as identity. Conversely, a client that discovers the expected pipe name has not proven it connected to the intended server. Deployment, ACL, namespace, server process provenance, and a higher-level authentication protocol may matter."] }
    ],
    visuals: [{ type: "flow", title: "Follow one named-pipe request from discovery to cleanup", items: [
      { meta: "Server", label: "Create one secured instance", detail: "Name, mode, buffers, ACL", linkAfter: "connect race" },
      { meta: "Client", label: "Wait then CreateFile", detail: "Bounded retry, read and write rights", linkAfter: "exchange" },
      { meta: "Protocol", label: "Frame, validate, respond", detail: "Length, encoding, max size, errors", linkAfter: "finish" },
      { meta: "Lifetime", label: "Disconnect and close", detail: "Broken peer and next instance" }
    ], caption: "Discovery and connection are only the first half. Message completion and endpoint reuse need their own states." }],
    workedExamples: [{ type: "branch", title: "Handle the main connection and read branches", prompt: "A synchronous message-mode server accepts one request.", setupCode: "ConnectNamedPipe(server, None); ReadFile(server, 4096)", branches: [
      { value: "ERROR_PIPE_CONNECTED", meaning: "The client connected before the server began waiting.", action: "Treat the connection as established and continue." },
      { value: "ERROR_MORE_DATA", meaning: "A message is larger than this read buffer.", action: "Keep the partial bytes and continue reading the same message." },
      { value: "ERROR_BROKEN_PIPE", meaning: "The peer closed its endpoint.", action: "End this exchange, discard incomplete frame, disconnect or close." },
      { value: "WAIT timeout or busy", meaning: "No instance became available in the client deadline.", action: "Report availability failure or retry with bounded policy." }
    ], conclusion: "Classify expected transport states narrowly and re-raise unrelated Windows failures." }],
    windowsLearning: [
      { title: "whats_my_name.py is an observed-protocol client", paragraphs: ["The repository exercise begins by discovering the challenge pipe name in Process Monitor, then validates the \\\\.\\pipe\\ prefix, waits for an instance, opens read and write access, detects message type, writes the expected name bytes, reads a response, decodes, and closes in finally.", "Its current one-call read rejects ERROR_MORE_DATA, and its one-call write assumes the full payload is accepted. The lesson extends these into loops. It also treats encoding and terminators as observed protocol facts rather than assuming UTF-8 with no newline for every server."] },
      { title: "Use a time trace and a handle snapshot together", paragraphs: ["Process Monitor reveals CreateNamedPipe, CreateFile, reads, writes, results, and timing when filters match the server and client. Handle or Process Explorer can confirm which process currently owns the endpoint while it remains open.", "The pipe name can be dynamic or include a process-specific suffix. Record the server image, PID, creation time, operation path, and relevant event ordering before copying a name into the client."] }
    ],
    codeWalkthroughs: [{ title: "Read one complete message without assuming one buffer", intro: "The status and accumulated bytes jointly determine completion.", stages: [
      { title: "Accumulate chunks", explanation: "Keep every returned byte chunk, including the chunk accompanying ERROR_MORE_DATA.", code: "chunks = []\nwhile True:\n    status, chunk = win32file.ReadFile(pipe, 4096)\n    chunks.append(chunk)" },
      { title: "Branch on message status", explanation: "Zero completes this message. ERROR_MORE_DATA continues only for the expected message-mode condition.", code: "    if status == 0:\n        break\n    if status != winerror.ERROR_MORE_DATA:\n        raise OSError(status, \"pipe read failed\")" },
      { title: "Validate before decoding", explanation: "A maximum prevents an untrusted peer from forcing unlimited accumulation.", code: "    if sum(map(len, chunks)) > MAX_MESSAGE:\n        raise ValueError(\"message too large\")\npayload = b\"\".join(chunks)\ntext = payload.rstrip(b\"\\0\\r\\n\").decode(ENCODING)" }
    ] }],
    practice: {
      title: "Run and inspect both named-pipe roles", time: "45 min", intro: "The starter includes a controlled local server and client before you adapt the client to the repository challenge.",
      download: ["downloads/named_pipe_lab.py", "named_pipe_lab.py"],
      expectedOutcome: "The controlled client should send one length-bounded UTF-8 message and receive a framed response. Timeout, oversize, and peer-close modes should produce distinct messages, and all handles should close after one exchange.",
      safety: "Connect only to the provided local lab server or the authorized course challenge. Do not probe third-party pipe endpoints or send guessed commands.",
      steps: [
        { action: "Run server mode, discover its pipe in Process Monitor, then run client mode.", why: "This reproduces the observation path required by whats_my_name.py.", observe: "Match the exact pipe path, server PID, CreateFile, write, read, and close sequence." },
        { action: "Run the client before the server and record the bounded availability result.", why: "Missing endpoint or busy timeout is not a successful connection with empty data.", observe: "No pipe handle should need cleanup if CreateFile never succeeds." },
        { action: "Send a message larger than one read chunk and trace the framing loop.", why: "One ReadFile call is not the protocol boundary.", observe: "The response should assemble completely or reject the declared maximum." },
        { action: "Compare the controlled client with whats_my_name.py and adapt only name, encoding, terminator, and expected response proven by observation.", why: "The challenge should teach evidence-guided API use rather than blind guessing.", observe: "Document every remaining assumption and exact Windows error branch." }
      ],
      hints: [{ title: "SetNamedPipeHandleState fails", body: "Confirm the server created a message-type pipe before requesting PIPE_READMODE_MESSAGE. A byte-type pipe cannot be converted into message type by the client." }],
      cleanup: ["Let the server disconnect or close after the lab exchange.", "Close Process Monitor capture and remove any sensitive payload columns before saving evidence."],
      extension: { title: "Independent variation", prompt: "Add a second simultaneous server instance and explain how instance availability changes the WaitNamedPipe and CreateFile race." }
    },
    checks: [
      ["What does ERROR_MORE_DATA mean in a message read?", ["The pipe is deleted", "More bytes remain in the same message", "The client is authenticated", "The handle is a file mapping"], 1, "Retain the partial chunk and continue within the size limit."],
      ["Is a client-supplied username proof of client identity?", ["Yes", "No", "Only in UTF-8", "Only locally"], 1, "It is untrusted message content unless independently authenticated."]
    ]
  },

  "file-mappings-shared-memory": {
    apis: ["mmap.mmap", "CreateFileMappingW", "OpenFileMappingW", "MapViewOfFile", "FlushViewOfFile", "UnmapViewOfFile", "win32event.CreateEvent"],
    phases: {
      learn: ["Design a shared layout", "Separate section backing, per-process views, offsets, framing, synchronization, and lifetime."],
      windows: ["Observe shared backing", "Use VMMap, Process Explorer, and WinObj to connect views to one section."],
      investigation: ["Exchange a versioned record", "Validate state before decoding and coordinate publication with an event."],
      review: ["Check shared-memory reasoning", "Test addresses, bounds, ordering, synchronization, persistence, and cleanup."]
    },
    learning: [
      { title: "Processes share backing, not virtual addresses", paragraphs: ["CreateFileMapping creates a section object backed by a file or by the paging file. MapViewOfFile maps bytes from that section into the caller. Another process can open the same named section and map its own view, often at a different base address.", "Store offsets, fixed-width values, or self-contained encoded records. A raw pointer written by the producer refers to the producer's address space and can be meaningless or dangerous in the consumer."], inlineCheck: ["Why use offsets inside a shared structure?", ["Each process may map at a different address", "Offsets are always encrypted", "Pointers cannot be integers", "Sections have no bytes"], 0, "Offsets remain relative to the agreed mapping layout."] },
      { title: "A shared page does not define a safe message", paragraphs: ["The processes need a layout with magic, version, header size, capacity, payload length, sequence or state, encoding, and validation rules. The reader must reject invalid sizes before slicing or allocating and must not decode a record marked incomplete.", "A simple publication rule writes payload first, then metadata that declares it complete, then signals an event. For multiple writers or reused slots, add a mutex, sequence protocol, or another proven synchronization design."] },
      { title: "Visibility, ordering, and persistence are different", paragraphs: ["Synchronization establishes when a reader may rely on related writes. A file-backed mapping and FlushViewOfFile address persistence and writeback concerns, not mutual exclusion. An event without a layout rule can wake the reader while metadata and payload disagree.", "Unmap each view and close each section and synchronization handle. Closing the section handle does not automatically invalidate an existing view, and unmapping a view does not close another process's handle."] }
    ],
    visuals: [{ type: "layers", title: "One section, two views, one publication protocol", items: [
      { meta: "Producer process", label: "View at address A", detail: "Writes header and payload", linkAfter: "shared backing" },
      { meta: "Section object", label: "Named page-file mapping", detail: "Common bytes and access policy", linkAfter: "mapped as" },
      { meta: "Consumer process", label: "View at address B", detail: "Validates offsets and lengths", linkAfter: "coordinated by" },
      { meta: "Protocol", label: "State, sequence, event", detail: "When a record is complete" }
    ], caption: "Address A does not need to equal address B. The shared bytes and relative layout establish common meaning." }],
    workedExamples: [{ type: "state", title: "Publish one bounded record", prompt: "The mapping contains a fixed 24-byte header and up to 4 KB of UTF-8 payload.", steps: [
      { title: "EMPTY", action: "Creator initializes magic, version, capacity, and state before advertising the mapping.", why: "Readers can distinguish initialized storage from stale or unrelated bytes.", result: "No payload is consumable." },
      { title: "WRITING", action: "Writer marks incomplete, checks size, then copies payload.", why: "A reader must not decode a partly replaced record.", result: "Length is not yet published as ready." },
      { title: "READY", action: "Writer stores length and sequence under the protocol, then signals the event.", why: "Publication happens only after related data is established.", result: "Reader may validate and copy." },
      { title: "CONSUMED", action: "Reader validates every field, copies bytes, and acknowledges by the chosen rule.", why: "Reuse needs an explicit ownership transition.", result: "The slot can safely return to EMPTY." }
    ], conclusion: "The state machine supplies message semantics that raw shared pages do not provide." }],
    windowsLearning: [
      { title: "Different tools expose different layers", paragraphs: ["VMMap can show mapped-file and shared regions and their per-process addresses. Process Explorer can show Section and event handles. WinObj can expose named objects in the session namespace. None of these tools automatically decodes your custom header.", "Record both processes' PIDs, view base addresses, mapping name, size, and observed data. Different view addresses are expected evidence, not a failure."] },
      { title: "Python mmap is useful before ctypes", paragraphs: ["On Windows, mmap.mmap with tagname can create or open a named mapping and manages the view with a Python context manager. It is a good way to learn shared backing and protocol design without first defining pointer signatures.", "Use ctypes when native access masks, offsets, view sizes, security attributes, or exact WinAPI contracts are the learning goal. Declare pointer-sized returns correctly, check NULL, and unmap the exact returned base."] }
    ],
    practice: {
      title: "Observe two views of one named mapping", time: "40 min", intro: "Reuse the existing starter, then extend its raw string slot into a small versioned record.",
      download: ["downloads/shared_mapping_lab.py", "shared_mapping_lab.py"],
      expectedOutcome: "Creator and reader should report different process IDs and possibly different view addresses while observing the same bytes. The reader's update should appear in the creator. Copy mode should change private view bytes without changing the file.",
      steps: [
        { action: "Run creator and reader modes and compare PID, mapping name, addresses, and bytes.", why: "The evidence separates shared backing from process-local virtual address.", observe: "The shared update should be visible from both views." },
        { action: "Inspect both processes with VMMap and Process Explorer while views remain open.", why: "Region and handle views connect the Python abstraction to Windows objects.", observe: "Record mapping classifications without expecting identical bases." },
        { action: "Add magic, version, capacity, and payload length before decoding.", why: "A raw null-terminated string has no evolution or corruption contract.", observe: "Reject a deliberately invalid length larger than capacity." },
        { action: "Add a named ready event and document write then signal ordering.", why: "The reader needs an explicit publication condition.", observe: "A timeout must leave the reader from consuming incomplete data." }
      ],
      hints: [{ title: "Reader says the creator is absent", body: "Start creator first and keep its view open. The named mapping can disappear when the last relevant handle or view closes." }],
      cleanup: ["Close both mmap context managers and synchronization handles.", "The copy mode deletes only its own temporary file."],
      extension: { title: "Independent variation", prompt: "Add an odd/even sequence counter and explain how the reader detects a writer active during its copy." }
    },
    checks: [
      ["Does FlushViewOfFile replace synchronization?", ["Yes", "No", "Only for named sections", "Only on x86"], 1, "Persistence and coordination answer different questions."],
      ["Must two mapped views use the same virtual address?", ["Yes", "No", "Only in Python", "Only for files"], 1, "They share section offsets, not necessarily base addresses."]
    ]
  },

  "choose-ipc": {
    apis: ["win32pipe.CreatePipe", "win32pipe.CreateNamedPipe", "CreateFileMappingW", "socket.socket", "win32process.CreateProcess", "win32event.WaitForMultipleObjects"],
    phases: {
      learn: ["Choose from requirements", "Compare topology, semantics, throughput, trust, failure recovery, and operability."],
      windows: ["Generalize endpoint ownership", "Turn pipe_two.py into a correct N-stage lifecycle rather than only a loop."],
      investigation: ["Complete the N-stage pipeline", "Test one, many, failing, verbose, and cleanup scenarios."],
      review: ["Check the final IPC model", "Test selection, backpressure, framing, security, exit state, and ownership."]
    },
    learning: [
      { title: "Choose the mechanism from constraints", paragraphs: ["Anonymous pipes are strong for related process streams and standard-handle redirection. Named pipes suit discoverable local client-server channels and can support remote use. Shared mappings suit high-volume local data when you can design synchronization. Sockets suit network and cross-platform channels. Files suit durable, decoupled transfer.", "Higher-level RPC and messaging libraries add schemas, marshaling, authentication, discovery, cancellation, and version evolution. Their overhead can remove risky protocol work. Use the lowest level only when its control or learning value is required."], inlineCheck: ["Which need most strongly favors a file over an anonymous pipe?", ["Durable decoupled exchange", "Parent-child stdout", "One event signal", "Thread ownership"], 0, "A file can persist independently of both participants."] },
      { title: "Success has several independent dimensions", paragraphs: ["Transport success means bytes moved. Protocol success means a valid complete message was understood. Application success means the requested work succeeded. Process success may be represented by exit code. Cleanup success means no endpoint or child handle remains unintentionally alive.", "A pipeline can print output while an earlier stage fails. A named-pipe client can connect but receive an invalid response. A shared reader can map the section but reject its version. Report these dimensions separately."] },
      { title: "N stages magnify ownership mistakes", paragraphs: ["For N commands, each stage produces one pipe whose read end becomes the next stage's stdin, except the final read retained by the parent. Immediately after each CreateProcess, the parent closes the prior read used by that child and the new write copied into that child.", "Use one collection for process handles, one for initial thread handles, and explicit variables for previous and final reads. Set every early-closed variable to None. The supplied pipe_two.py closes current_write_handle but leaves that variable non-None, so its finally path can attempt to close it again. It also clears current_process_handle rather than the write variable, which obscures ownership even though the process list retains the handle."] }
    ],
    visuals: [{ type: "flow", title: "Rotate ownership through an N-stage pipeline", items: [
      { meta: "Iteration input", label: "previous_read or parent stdin", detail: "Inherited by current child", linkAfter: "launch with" },
      { meta: "New channel", label: "current_write as stdout", detail: "current_read stays in parent", linkAfter: "after launch" },
      { meta: "Parent cleanup", label: "close previous_read and current_write", detail: "Set both variables to None", linkAfter: "carry" },
      { meta: "Next iteration", label: "previous_read = current_read", detail: "Final read is drained by parent" }
    ], caption: "The loop is correct only when the ownership transition is correct on every iteration and exception edge." }],
    workedExamples: [{ type: "contract", title: "Review one pipeline iteration", prompt: "Stage i has previous_read and creates current_read, current_write.", steps: [
      { title: "Before launch", action: "Parent owns previous_read plus both current endpoints.", why: "Only selected handles are marked inheritable.", result: "No child ownership exists yet." },
      { title: "CreateProcess succeeds", action: "Child receives copies for stdin, stdout, and stderr, and parent receives process and thread handles.", why: "Copied handles are separate references to the same objects.", result: "Both processes temporarily reference selected pipe ends." },
      { title: "Drop parent copies", action: "Close previous_read if consumed and current_write, then set both variables to None.", why: "The parent no longer needs them and retained writers delay EOF.", result: "current_read is the only rotating pipe endpoint." },
      { title: "Publish next state", action: "Move current_read into previous_read, or final_read on the last iteration.", why: "One variable represents one ownership role.", result: "Finally can close each remaining handle once." }
    ], conclusion: "A loop transformation is an ownership proof, not only an indexing exercise." }],
    windowsLearning: [
      { title: "Audit pipe_two.py before trusting its happy path", paragraphs: ["The draft contains the intended core order, including reading final output before waiting. However, current_write_handle is closed without being cleared, which risks a second close in finally. current_process_handle is cleared instead, even though the process handle is intentionally retained in process_handles. Correct variable transitions before using the draft as a reusable reference.", "Its output decoder also imports locale but selects UTF-8 directly. Keep encoding configurable and attach it to the command contract. An OEM console tool and a UTF-8-aware program may require different choices."] },
      { title: "Exit codes complete the pipeline result", paragraphs: ["WaitForSingleObject tells you a child process ended, not whether it succeeded. Query each exit code after its process handle is signaled. Decide whether an earlier nonzero stage makes the overall pipeline fail even when the final stage exits zero.", "Process Explorer and Handle can validate endpoint counts during a deliberate pause. The starter prints PID, stage number, endpoint transition, bytes captured, and exit code so the static snapshot can be correlated to the application lifecycle."] }
    ],
    practice: {
      title: "Generalize and audit the course pipeline", time: "55 min", intro: "Use the corrected starter first, then apply its ownership rules to pipe_two.py.",
      download: ["downloads/pipeline_lab.py", "pipeline_lab.py"],
      expectedOutcome: "One, two, and several-stage runs should drain final output, report every stage's exit code, and terminate without leaked or double-closed handles. A verbose producer should not deadlock, and an invalid command should preserve the exact CreateProcess failure.",
      steps: [
        { action: "Build an ownership table for one, two, and three commands before reading the loop.", why: "Edge cases reveal assumptions hidden by the ordinary two-stage shape.", observe: "For one stage, final_read still belongs to the parent and no inter-stage read exists." },
        { action: "Run the starter with a large producer and a slow consumer.", why: "Backpressure tests the read-before-wait design.", observe: "Output should continue draining and all children should eventually signal." },
        { action: "Run a missing command and a command that exits nonzero.", why: "Creation failure and application failure occur at different layers.", observe: "The first may leave only earlier children to clean, while the second still yields a process exit code." },
        { action: "Correct pipe_two.py's variable clearing and add exit-code reporting.", why: "The repository practice is complete only when every owned handle has one cleanup path.", observe: "Use finally after partial launch and verify no variable names a handle already closed." }
      ],
      hints: [{ title: "A double-close error appears only on failures", body: "After each successful early close, assign None immediately. Then exercise CreateProcess failure in a later stage so finally runs with a partially built pipeline." }],
      cleanup: ["Close every remaining pipe, initial thread, and process handle once.", "End only child processes created by the lab if testing a deliberately blocked variant."],
      extension: { title: "Independent variation", prompt: "Design a policy that combines all stage exit codes into one pipeline result without discarding partial captured output." }
    },
    checks: [
      ["Does WAIT_OBJECT_0 on a process prove exit code zero?", ["Yes", "No", "Only for Python", "Only with pipes"], 1, "It proves termination, while exit status must be queried separately."],
      ["What should happen immediately after closing current_write_handle?", ["Set it to None", "Close it again", "Make it inheritable", "Use it as final_read"], 0, "Clearing the variable prevents later cleanup from claiming the closed resource."]
    ]
  }
};
