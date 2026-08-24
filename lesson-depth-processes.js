window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "programs-processes-isolation": {
    phases: {
      learn: ["Separate file from instance", "Distinguish passive program bytes from the protected process Windows creates to run them."],
      windows: ["Identify a process safely", "Use live handles, creation time, and access rights instead of treating a PID as permanent identity."],
      investigation: ["Compare two instances", "Observe which properties belong to the shared image and which belong to each running process."],
      review: ["Check the process model", "Test isolation, ancestry, identity, and cross-process access together."]
    },
    learning: [
      {
        title: "An executable image is input, a process is the running container",
        paragraphs: [
          "An executable file contains code, data, metadata, and instructions for the loader. It is passive until Windows creates a process around it. The process supplies a private virtual address space, a handle table, security context, environment, current directory, accounting state, and at least one thread. Mapping the same executable twice therefore creates two independent runtime containers, not two names for one object.",
          "The mapped image can be shared efficiently at the physical-page level when pages remain unchanged, but each process receives its own virtual mappings and private writable state. The same virtual address in two processes can refer to different physical memory. One process cannot use another process's pointer as if it belonged to its own address space."
        ],
        callout: { label: "Keep three identities separate", text: "A path identifies a file, a PID identifies one currently live process instance, and a process handle represents checked access to that instance from a particular caller." }
      },
      {
        title: "Isolation is selective, not absolute",
        paragraphs: [
          "Processes are isolated by address translation and access checks, but Windows deliberately provides controlled bridges. A process can open another process with specific rights, duplicate or inherit handles, map a shared section, use a named object, or communicate through an IPC mechanism. Each bridge has an explicit API, security decision, and lifetime rule.",
          "Isolation also does not mean every byte is physically unique. Executable and DLL pages can be shared read-only, mapped files can appear in several processes, and copy-on-write lets mappings share a page until one process modifies it. The guarantee is about each process's view and permitted operations, not about wasting physical RAM."
        ]
      },
      {
        title: "Parentage records creation, it does not create automatic ownership",
        paragraphs: [
          "When one process creates another, Windows records a parent PID and tools can draw a process tree. That is useful provenance, but the child is an independent process with its own lifetime. The parent can close its returned process handle, exit first, or lose the ability to control the child. The recorded parent PID may later be reused after the original parent exits.",
          "If an application needs group lifetime, limits, or terminate-as-a-unit behavior, it must establish that policy, commonly with a Job object. A visual tree alone does not prove that killing the displayed parent will safely or completely terminate every descendant."
        ],
        inlineCheck: ["Which value most strongly identifies one process instance across a short investigation?", ["Executable name alone", "PID alone after the process exits", "PID paired with creation time or a live process handle", "The parent process name"], 2, "PIDs are reused. Creation time or a live handle distinguishes the instance that owned the PID during the observation."]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "From executable file to isolated process instance",
        intro: "Windows combines persistent program bytes with instance-specific state.",
        items: [
          { meta: "On disk", label: "Executable image", detail: "Code, data, imports, metadata", linkAfter: "loader maps" },
          { meta: "Identity", label: "Process object", detail: "PID, creation time, accounting", linkAfter: "owns a view" },
          { meta: "Isolation", label: "Virtual address space", detail: "Images, heaps, stacks, private regions", linkAfter: "refers through" },
          { meta: "Capabilities", label: "Handle table and token", detail: "Granted object access and security context", linkAfter: "contains" },
          { meta: "Execution", label: "One or more threads", detail: "Contexts Windows can schedule" }
        ],
        caption: "Another process built from the same image repeats the instance-specific layers with a different PID, address space, handle table, and lifetime."
      }
    ],
    workedExamples: [
      {
        type: "comparison",
        title: "Two Notepad processes using one executable",
        prompt: "Notepad is started twice from the same path. Classify what can be shared and what must identify each instance.",
        columns: [
          { title: "Shared because the program is the same", rows: [["Image path", "The same notepad.exe file may supply both images"], ["Signed code pages", "Clean mapped pages can share physical backing"], ["Publisher", "The file has the same signature metadata"], ["Imports", "Both commonly load many of the same DLL images"]] },
          { title: "Different because the processes are distinct", rows: [["PID and creation time", "Each live process instance has its own identity"], ["Private writable memory", "Editing one document does not edit the other process"], ["Handle table", "Each process holds its own checked references"], ["Threads and lifetime", "Either process can block, exit, or be terminated independently"]] }
        ],
        shared: "The executable file can remain on disk after either process exits. Closing one process does not consume or delete the program.",
        conclusion: "A program describes possible execution. A process is one protected, time-bounded realization of it."
      }
    ],
    windowsLearning: [
      {
        title: "Enumeration finds candidates, OpenProcess asks for authority",
        paragraphs: [
          "win32process.EnumProcesses returns a snapshot of PIDs. A PID from that list is only a candidate identity and may disappear before the next call. win32api.OpenProcess asks Windows for a handle to the still-live process with a requested access mask. The open can fail because the process exited, the PID was reused, the caller lacks rights, or a protected-process policy blocks the request.",
          "Request only what the next operation requires. PROCESS_QUERY_LIMITED_INFORMATION is sufficient for several identity queries and succeeds in more situations than PROCESS_ALL_ACCESS. A successful handle stabilizes access to that process object even if the process later exits, although operations that require a running process can still report that it has terminated."
        ]
      },
      {
        title: "Process Explorer combines ancestry, identity, and current state",
        paragraphs: [
          "The tree view shows recorded creation relationships. Properties expose image path, command line, creation time, user, integrity level, environment, threads, handles, and memory counters. Use the tree for provenance, then verify identity with the property sheet rather than inferring everything from indentation or process name.",
          "Protected and elevated processes may expose less information. That limitation is evidence about the caller's security context. Do not disable protections merely to complete an inventory. Record which field was unavailable and which requested access would have been required."
        ]
      }
    ],
    practice: {
      title: "Separate image from instance",
      time: "20 min",
      intro: "Use two live instances to observe shared image identity and independent process state.",
      expectedOutcome: "Both processes should report the same executable path and similar module sets, but different PIDs, creation times, thread objects, handle tables, private memory, and lifetimes. Closing one process should leave the executable file and the other process intact.",
      steps: [
        {
          action: "In PowerShell, launch two Notepad requests and print the launcher-returned process IDs.",
          commands: [
            { label: "PowerShell", code: "$first = Start-Process -FilePath notepad.exe -PassThru\nStart-Sleep -Milliseconds 500\n$second = Start-Process -FilePath notepad.exe -PassThru\n\"First returned PID: $($first.Id)\"\n\"Second returned PID: $($second.Id)\"" },
            { label: "Fallback: first PowerShell", code: "py -c \"import os; print(f'First Python PID: {os.getpid()}'); input('Press Enter after inspection...')\"" },
            { label: "Fallback: second PowerShell", code: "py -c \"import os; print(f'Second Python PID: {os.getpid()}'); input('Press Enter after inspection...')\"" }
          ],
          why: "A controlled creation order gives the two otherwise similar launch requests a known distinguishing fact.",
          observe: "Two live Notepad rows normally appear with different PIDs and creation times. If this Windows build redirects both requests into one host, use the two labelled fallback commands from separate PowerShell windows and keep both waiting."
        },
        { action: "For each live PID printed in step 1, open Process Explorer Properties > Image and Properties > Performance.", why: "These views separate file identity from runtime accounting and private state.", observe: "The exact executable paths normally match, while PID, parent, start time, private bytes, working set, handle count, and thread count belong to each live instance." },
        { action: "Select each PID printed in step 1, choose View > Show Lower Pane, and switch View > Lower Pane View between DLLs and Handles.", why: "Modules are mapped code images, while handles are checked references to objects.", observe: "DLLs mode shows shared module paths and Handles mode shows process-local object references. Access denied and an exited PID are distinct visible branches." },
        { action: "Close the first live process from step 1 and refresh the second process's Properties window.", why: "Independent lifetime is a direct test of the process-container model.", observe: "The second process remains live and its executable file remains on disk, while the first PID is no longer live." }
      ],
      hints: [{ title: "Notepad reused an existing process", body: "Recent Notepad versions can behave differently across builds. If two starts do not yield two rows, run the two labelled py -c fallback blocks from separate PowerShell windows." }],
      cleanup: ["Close the remaining test process and its Process Explorer property windows.", "Do not terminate unrelated processes that happen to share the same executable name."]
    },
    checks: [
      ["Which item belongs to the executable file rather than one process instance?", ["PID", "Creation time", "Publisher signature", "Private heap"], 2, "The signature describes the file. PID, creation time, and private heap belong to a running instance."],
      ["Why can OpenProcess fail immediately after EnumProcesses returned the PID?", ["Enumeration grants permanent ownership", "The process can exit or access can be denied between calls", "PIDs are file handles", "OpenProcess only opens threads"], 1, "Enumeration is a snapshot. The target can exit, the PID can be reused, or the requested rights can fail an access check."],
      ["What does a process tree establish most directly?", ["Permanent parent ownership", "Creation ancestry", "Shared address spaces", "Automatic group termination"], 1, "The tree records who created whom. Job objects or application policy are needed for stronger group-lifetime semantics."]
    ]
  },

  "process-address-space": {
    phases: {
      learn: ["Map the process container", "Separate process-wide resources from the execution state owned by each thread."],
      windows: ["Inventory one process", "Combine APIs, Process Explorer, and VMMap without confusing their measurements."],
      investigation: ["Build a live inventory", "Create known resources, then locate each one through the appropriate view."],
      review: ["Check the process map", "Test resource scope, memory metrics, handle meaning, and security context."]
    },
    learning: [
      {
        title: "A process combines several kinds of state",
        paragraphs: [
          "The process object holds identity and accounting, but the useful runtime picture spans several structures. The virtual address space contains executable and DLL mappings, heaps, stacks, private allocations, mapped files, and shared sections. The handle table contains references to kernel-managed objects. Process parameters contain command line, environment, and current-directory information. The primary token describes the default security context.",
          "These categories have different ownership rules. Closing a file handle removes one table entry and may release an object reference, but it does not unmap every DLL or destroy the heap. Ending a worker thread releases its stack and thread object state, but it does not normally remove the process-wide handle table or address space while other threads remain."
        ]
      },
      {
        title: "Threads own execution state while sharing the container",
        paragraphs: [
          "Each thread needs its own register context, instruction pointer, user stack, kernel stack, scheduling state, and thread-local storage. Threads in the same process normally share code, globals, heaps, address mappings, and handles. This sharing makes communication inexpensive because a pointer can name the same process memory from either thread, but it also creates race conditions when access is not coordinated.",
          "A process with one thread blocked on I/O can still run another ready thread. Process-level CPU time is an aggregation of its threads' execution. Process-level handle and memory counts can change because of work done by any thread, so a useful investigation correlates the process view with the responsible TID when possible."
        ],
        inlineCheck: ["Which resource is normally private to each thread?", ["The process virtual address space", "The process handle table", "Register context and stack", "The mapped executable image"], 2, "A thread requires its own resumable execution context and stack while sharing the surrounding process resources."]
      },
      {
        title: "Memory counters answer different questions",
        paragraphs: [
          "Virtual size describes address space reserved or committed for the process, not physical RAM currently occupied. Private bytes count committed memory that cannot be shared with other processes. Working set counts pages currently resident for the process and can include shared pages. A DLL image may appear in the working sets of many processes without requiring a separate physical copy of every clean page.",
          "No single counter means total memory cost. Shared pages, file cache, copy-on-write, compression, and page trimming complicate attribution. Use VMMap to classify regions and Process Explorer for current counters, then state which definition supports the question you are answering."
        ]
      }
    ],
    visuals: [
      {
        type: "layers",
        title: "The major views inside one process",
        intro: "Each layer answers a different ownership or execution question.",
        items: [
          { meta: "Identity", label: "Process object and parameters", detail: "PID, creation time, image, command line, environment", linkAfter: "contains" },
          { meta: "Addressing", label: "Virtual address space", detail: "Images, heaps, stacks, mapped and private regions", linkAfter: "accesses objects through" },
          { meta: "Capabilities", label: "Handle table and primary token", detail: "Granted rights and default security context", linkAfter: "shared by" },
          { meta: "Execution", label: "Threads", detail: "Contexts, stacks, priorities, states, TIDs" }
        ],
        caption: "Process Explorer exposes several of these categories in separate tabs and lower-pane modes because they are related but not interchangeable."
      }
    ],
    workedExamples: [
      {
        type: "comparison",
        title: "Classify process-wide and per-thread resources",
        prompt: "A Python process has two workers, an open file, a large list, and several imported modules.",
        columns: [
          { title: "Process-wide", rows: [["Address space", "Both workers can reach the same Python objects"], ["Handle table", "The open file handle is usable by either thread if the program shares it"], ["Modules and heaps", "Mapped code and allocated objects belong to the process"], ["Primary token", "Provides the default security context"]] },
          { title: "Per-thread", rows: [["Register context", "Each worker resumes at its own instruction"], ["User and kernel stacks", "Calls and kernel transitions need separate stack state"], ["TID and scheduling state", "Windows schedules and accounts for each thread"], ["Thread-local storage", "Libraries can keep worker-specific values"]] }
        ],
        shared: "A thread can create or close a process-wide resource, so ownership policy must be established by the program even when Windows stores it at process scope.",
        conclusion: "Scope tells you where state lives. Program design still decides which thread may mutate or release it."
      }
    ],
    windowsLearning: [
      {
        title: "Use the Process Explorer view that matches the question",
        paragraphs: [
          "Image properties establish path, command line, parent, and start time. Threads show TIDs, CPU, start addresses, and stacks. Security shows token information. Environment shows inherited process parameters. The lower pane switches between handles and DLLs: a DLL row is a mapped module, while a handle row is a table entry referring to an object.",
          "VMMap complements this with region classifications such as Image, Heap, Stack, Private Data, and mapped files. Do not expect an open file handle to appear as a unique VMMap region unless the file is also memory mapped. Do not expect every mapped DLL to appear as a file handle that remains open."
        ]
      },
      {
        title: "A checked process handle turns a PID into query capability",
        paragraphs: [
          "OpenProcess returns a PyHANDLE when the requested access is granted. Functions such as GetProcessMemoryInfo, GetProcessTimes, EnumProcessModules, and GetModuleFileNameEx then use that handle. Each query has its own rights and can race with process termination or module changes.",
          "Close the handle in finally. The PyHANDLE object can usually close itself when collected, but deterministic cleanup makes lifetime visible and prevents large inventories from temporarily accumulating hundreds of open process handles. Skip access-denied processes with a recorded reason instead of converting the entire enumeration into one failure."
        ]
      }
    ],
    codeWalkthroughs: [
      {
        title: "Inventory one process without leaking the query handle",
        intro: "The API sequence separates identity, checked access, query, and cleanup.",
        stages: [
          { title: "Request the smallest useful right", explanation: "The query uses a PID supplied by the learner and asks only for limited information.", code: "import win32api\nimport win32con\nimport win32process\n\naccess = win32con.PROCESS_QUERY_LIMITED_INFORMATION\nhandle = win32api.OpenProcess(access, False, pid)" },
          { title: "Query while the handle is valid", explanation: "Creation and CPU times describe this process instance. Additional memory or module queries may require more rights.", code: "try:\n    created, exited, kernel, user = win32process.GetProcessTimes(handle)\n    print({\"created\": created, \"kernel_100ns\": kernel, \"user_100ns\": user})" },
          { title: "Release the caller's reference", explanation: "finally runs whether the query succeeds, the process exits, or later formatting raises.", code: "finally:\n    handle.Close()" }
        ]
      }
    ],
    practice: {
      title: "Build a process inventory",
      time: "25 min",
      intro: "Run a supplied process that creates known memory, file, and thread state, then find each category externally.",
      download: ["downloads/process_inventory_lab.py", "process_inventory_lab.py"],
      expectedOutcome: "process_inventory_lab.py reports its PID, allocates a recognizable private buffer, keeps one temporary file open, and starts one waiting worker. Process Explorer shows the process identity, at least two threads, and an open file handle. VMMap shows image, heap, stack, and private regions, but exact addresses and byte counts vary.",
      steps: [
        {
          action: "Download process_inventory_lab.py, open PowerShell in its folder, run this command, and leave process_inventory_lab.py at 'Inspect the process now'.",
          commands: [{ label: "PowerShell", code: "py .\\process_inventory_lab.py" }],
          why: "process_inventory_lab.py creates known state, giving every external observation a ground-truth explanation.",
          observe: "process_inventory_lab.py prints its PID, held-open path, Python architecture, main native TID, worker native TID, and a 16,777,216-byte private buffer. If py is unavailable, the dependency message is the setup-failure branch."
        },
        { action: "Select the PID printed by process_inventory_lab.py in Process Explorer. Inspect Properties > Image, Performance, and Threads; then choose View > Show Lower Pane and switch View > Lower Pane View between Handles and DLLs.", why: "Handles and DLLs are separate resource categories.", observe: "Handles mode shows the exact held-open path, DLLs mode shows Python and Windows modules, and Properties > Threads shows the printed worker TID. Access denied and an exited PID are distinct branches." },
        { action: "In VMMap choose File > Select Process, select the PID printed by process_inventory_lab.py, and locate Image, Heap, Stack, and Private Data rows.", why: "Virtual memory requires a region map rather than one total counter.", observe: "VMMap shows category rows with machine-dependent base, committed, private, working-set, and protection values. An exited PID or access denied is visible instead of requiring guessed values." },
        { action: "Press Enter once in process_inventory_lab.py so it closes the held-open path and releases its explicit worker; leave it at Refresh the tools. Refresh Process Explorer and VMMap for the same PID.", why: "A controlled transition exposes the file and worker lifetimes while the process remains live.", observe: "The exact held-open path and printed worker TID disappear, while the process image, main TID, and remaining memory stay visible until final exit." },
        { action: "Press Enter a second time in process_inventory_lab.py so it exits and removes its temporary directory; refresh Process Explorer once more.", why: "The supplied artifact owns the temporary path and completes its own cleanup.", observe: "The command returns to PowerShell, the printed PID is no longer live, and the temporary directory has been removed." }
      ],
      hints: [{ title: "The file handle is missing", body: "Confirm process_inventory_lab.py is still at its first prompt, select Handles mode in the lower pane, and search for the exact temporary path." }],
      cleanup: ["If process_inventory_lab.py is still paused, press Enter until it exits and removes its temporary directory.", "Close Process Explorer and VMMap views opened for the showcase."]
    },
    checks: [
      ["Which metric counts resident pages associated with a process?", ["Working set", "Private bytes", "PID", "Handle count"], 0, "The working set is the current resident-page view. It can include shared as well as private pages."],
      ["Why are the DLL and Handle lower-pane modes not interchangeable?", ["DLLs are always kernel objects", "One shows mapped modules and the other shows handle-table references", "Handles are only filenames", "Both show identical rows with different colors"], 1, "Mapped images belong to the address-space view. Handles are checked references recorded in the process handle table."],
      ["What should an enumeration tool do when one protected process returns access denied?", ["Disable Windows protections", "Stop and discard every earlier result", "Record the limitation and continue where possible", "Request every right from every process"], 2, "Access failure is expected evidence in a mixed process inventory. Least privilege and partial results are preferable to weakening protections."]
    ]
  },

  "context-switch-process-metadata": {
    phases: {
      learn: ["Follow a context switch", "Understand what Windows preserves and why scheduling activity is not the same as useful work."],
      windows: ["Correlate process activity", "Use PID, TID, creation time, CPU time, and timestamps as related evidence."],
      investigation: ["Compare one worker with several", "Measure an I/O workload and state exactly what the evidence supports."],
      review: ["Check the measurements", "Test context, identity, CPU, elapsed-time, and concurrency conclusions."]
    },
    learning: [
      {
        title: "Windows switches threads, not abstract process names",
        paragraphs: [
          "A running thread occupies one logical processor with a particular instruction pointer, stack pointer, register set, flags, and architecture-specific state. When Windows preempts it or it waits, the kernel preserves enough context to resume it later and restores another ready thread's context. The process remains the resource container, but the thread is the schedulable entity.",
          "A switch between threads in the same process can retain the same address-space context, while a cross-process switch changes which virtual mappings are active. Modern processors cache translations and state, but switches still have direct save and restore cost plus indirect cache and locality cost. A large switch count does not tell you whether the switches enabled useful overlap or reflected excessive contention."
        ]
      },
      {
        title: "Identifiers need time context",
        paragraphs: [
          "PID and TID values are unique only while their objects are live. Windows can reuse either value later. Parent PID records creation ancestry but can refer to an exited and eventually replaced process by the time a delayed tool displays it. Pair identifiers with creation time, image path, command line, session, and capture timestamps when reconstructing events.",
          "A live process or thread handle is stronger than a bare number because it refers to the opened object. Even then, the object may have terminated, so code must handle completed state. For saved evidence, record capture time and creation time rather than assuming a number has permanent meaning."
        ]
      },
      {
        title: "Elapsed time, CPU time, and waiting describe different intervals",
        paragraphs: [
          "Wall-clock elapsed time includes execution, waiting for storage or locks, scheduling delay, and time when other work ran. User and kernel CPU times count intervals in which the process's threads actually executed. A program can take ten seconds while using one second of CPU because it spent most of its lifetime waiting.",
          "Several I/O workers can reduce elapsed time by overlapping independent waits even when total CPU time stays similar or increases slightly. Conversely, CPU-bound pure Python threads can add overhead without parallel bytecode execution because of the CPython GIL. The workload and runtime determine which conclusion is justified."
        ],
        inlineCheck: ["A process exists for 8 seconds and accumulates 1.2 seconds of CPU time. What does the difference most directly permit?", ["It proves the process crashed", "The process spent substantial time waiting, descheduled, or otherwise not executing", "It proves eight CPU cores were used", "It equals the handle count"], 1, "Wall time includes intervals when the process is not executing. More evidence is needed to identify the exact wait source."]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "One processor across a short scheduling interval",
        intro: "Execution, waiting, and resumption form a timeline rather than simultaneous ownership of one logical processor.",
        items: [
          { meta: "Running", label: "Thread A executes", detail: "Registers and stack describe A", linkAfter: "I/O wait" },
          { meta: "Preserve", label: "Save A context", detail: "A becomes waiting", linkAfter: "dispatch" },
          { meta: "Running", label: "Thread B executes", detail: "Useful work fills the wait interval", linkAfter: "I/O completes" },
          { meta: "Ready", label: "Thread A becomes eligible", detail: "Completion does not guarantee immediate execution", linkAfter: "selected later" },
          { meta: "Resume", label: "Restore A context", detail: "A continues after its wait" }
        ],
        caption: "On multiple logical processors, several threads can run in parallel. The same ready, running, and waiting distinctions still apply per processor."
      }
    ],
    workedExamples: [
      {
        type: "calculation",
        title: "Interpret one timing result without overclaiming",
        prompt: "A file workload takes 4.0 seconds with one worker and 1.2 seconds with five workers. Process Monitor shows five TIDs issuing interleaved reads.",
        steps: [
          { title: "Calculate observed speedup", action: "Divide single-worker time by multi-worker time.", why: "A ratio communicates the measured elapsed-time change for this run.", result: "4.0 / 1.2 = about 3.33 times faster." },
          { title: "State what the trace establishes", action: "Identify that several TIDs issued overlapping sequences of file operations.", why: "TID evidence connects operations to workers and shows concurrency in the request stream.", result: "The trace supports concurrent I/O issue by multiple threads." },
          { title: "State what remains unproven", action: "Do not infer physical-disk parallelism or CPU parallelism from event interleaving alone.", why: "Caching, storage queues, driver behavior, and timestamp resolution sit below the logical events.", result: "Additional CPU, storage, and repeated-run evidence is required." },
          { title: "Limit the conclusion", action: "Attach the result to this directory, cache state, machine, and worker count.", why: "The supplied better_together result is an experiment, not a universal constant.", result: "Five workers helped this tested workload under these conditions." }
        ],
        conclusion: "Good performance reasoning reports the measured benefit and the evidence boundary in the same paragraph."
      }
    ],
    windowsLearning: [
      {
        title: "Correlate Process Monitor events with Process Explorer threads",
        paragraphs: [
          "Process Monitor records PID and TID on each event. Add TID to visible columns, filter to one PID, and use a narrow capture interval. Process Explorer's Threads tab can show the same native thread IDs, current CPU, start addresses, and available stack information. A thread may finish before you open its property view, so the trace is often the durable source for short-lived workers.",
          "Event interleaving establishes ordering in the recorded request stream. It does not prove simultaneous hardware execution. Use processor utilization, thread CPU time, and workload knowledge to distinguish CPU parallelism from overlapping I/O waits."
        ]
      },
      {
        title: "Benchmark a workload, not a single lucky run",
        paragraphs: [
          "Run the same workload several times for each worker count and record the median. Keep file set, output behavior, antivirus conditions, power mode, and measurement boundaries consistent. The first run may populate the file cache, so decide whether the question concerns cold or warm behavior and report it.",
          "Printing thousands of filenames or primes can dominate the measured time. Separate computation or I/O timing from result formatting. Confirm correctness as well as speed: a fast multi-worker result that skipped files or duplicated work is not an optimization."
        ]
      }
    ],
    practice: {
      title: "Correlate work by thread ID",
      time: "30 min",
      intro: "Use a supplied directory reader to compare one worker with several while preserving the limits of the evidence.",
      download: ["downloads/thread_io_lab.py", "thread_io_lab.py"],
      expectedOutcome: "A small file set may be slower with several workers because startup and coordination dominate. A larger cached or storage-backed set may improve when reads overlap, but the best count depends on the machine and files. Process Monitor should attribute reads to more worker TIDs in multi mode. Interleaving supports concurrent issue, not guaranteed physical-disk or CPU parallelism.",
      steps: [
        {
          action: "Download thread_io_lab.py and open PowerShell in its folder. Create the owned .\\iloveos-io-tiny and .\\iloveos-io-many inputs with this complete block.",
          commands: [{ label: "PowerShell", code: "$tiny = Join-Path $PWD 'iloveos-io-tiny'\n$many = Join-Path $PWD 'iloveos-io-many'\nif ((Test-Path -LiteralPath $tiny) -or (Test-Path -LiteralPath $many)) { throw 'Remove or rename the existing iloveos-io-tiny and iloveos-io-many lab folders first.' }\nNew-Item -ItemType Directory -Path $tiny,$many | Out-Null\n1..2 | ForEach-Object { Set-Content -LiteralPath (Join-Path $tiny \"tiny-$_.txt\") -Value ('T' * 4096) -Encoding ascii }\n1..200 | ForEach-Object { Set-Content -LiteralPath (Join-Path $many \"many-$_.txt\") -Value ('M' * 65536) -Encoding ascii }\nGet-ChildItem -File $tiny,$many | Group-Object DirectoryName | Select-Object Name,Count,@{Name='Bytes';Expression={($_.Group | Measure-Object Length -Sum).Sum}}" }],
          why: "Controlled file counts avoid scanning sensitive or changing system directories and make repeated runs comparable.",
          observe: "PowerShell prints the full directory paths, a count of 2 for iloveos-io-tiny, and a count of 200 for iloveos-io-many. A collision error protects pre-existing folders."
        },
        {
          action: "Run these CPU-light, I/O-bound tiny-directory commands from the folder containing thread_io_lab.py.",
          commands: [{ label: "PowerShell", code: "py .\\thread_io_lab.py .\\iloveos-io-tiny 1\npy .\\thread_io_lab.py .\\iloveos-io-tiny 5" }],
          why: "The final argument selects worker count, and the small case exposes fixed thread and executor overhead.",
          observe: "Each run prints root, files: 2, its fixed worker count, bytes read, and a machine-dependent elapsed value. A dependency or path error is the setup-failure branch."
        },
        {
          action: "For the many-file input, run the complete one-worker command, then repeat the full setup with the five-worker command. At each thread_io_lab.py pause, add Process Monitor filters PID is the printed PID Include and Operation is ReadFile Include, clear the display, resume capture, press Enter once, and pause capture when elapsed time prints.",
          commands: [{ label: "One worker", code: "py .\\thread_io_lab.py .\\iloveos-io-many 1 --pause" }, { label: "Five workers", code: "py .\\thread_io_lab.py .\\iloveos-io-many 5 --pause" }],
          why: "The larger I/O-bound workload tests whether overlapping file waits can repay the fixed overhead.",
          observe: "Process Monitor attributes ReadFile rows to the printed PID. The five-worker run can show several TIDs issuing reads, while exact ordering and elapsed values vary. If no ReadFile rows appear, disable only the Operation filter to expose the capture limitation."
        },
        {
          action: "After both thread_io_lab.py processes exit, run this PowerShell cleanup block from the folder containing the two owned input directories.",
          commands: [{ label: "PowerShell", code: "$tiny = Join-Path $PWD 'iloveos-io-tiny'\n$many = Join-Path $PWD 'iloveos-io-many'\nforeach ($ownedPath in @($tiny, $many)) { if (Test-Path -LiteralPath $ownedPath) { Remove-Item -LiteralPath $ownedPath -Recurse } }\nTest-Path -LiteralPath $tiny,$many" }],
          why: "Cleanup is limited to the two directories created by step 1.",
          observe: "PowerShell prints False for both owned paths. Any True result means that specific directory remains."
        }
      ],
      hints: [{ title: "The multi-worker run is slower", body: "That is a valid machine-dependent result. The showcase is concerned with attributed ReadFile activity, not a promised speedup." }],
      cleanup: ["Leave Process Monitor capture stopped and clear only the showcase display.", "The final PowerShell block removes only .\\iloveos-io-tiny and .\\iloveos-io-many."]
    },
    checks: [
      ["What does process CPU time exclude most directly?", ["Time its threads executed in kernel mode", "Wall time spent not executing", "Execution by every worker thread", "Accumulated user-mode execution"], 1, "CPU time accumulates actual execution. Waiting and descheduled wall-clock intervals are not CPU time."],
      ["What does interleaved ReadFile activity from several TIDs prove?", ["The disk completed every read simultaneously", "Several threads issued operations during overlapping periods", "The Python GIL was removed", "Every thread ran on a different core"], 1, "The trace establishes attribution and ordering of logical requests. Hardware parallelism requires additional evidence."],
      ["Why pair a PID with creation time?", ["To convert it into a filename", "Because PID values can be reused", "To increase process priority", "Because every process has two PIDs"], 1, "Creation time distinguishes one historical instance from a later process that reuses the same numeric PID."]
    ]
  },

  "createprocess-lifecycle": {
    phases: {
      learn: ["Trace process creation", "Follow the objects, mappings, inherited state, and initial thread created by one request."],
      windows: ["Build a correct launcher", "Translate CreateProcess contracts into pywin32 or an exact ctypes ABI with explicit ownership."],
      investigation: ["Create, observe, wait, and close", "Use the supplied launcher to make every returned value and lifetime transition visible."],
      review: ["Check the creation contract", "Test parsing, inheritance, startup structures, waiting, exit status, and cleanup."]
    },
    learning: [
      {
        title: "CreateProcess creates both a container and its first execution context",
        paragraphs: [
          "A successful CreateProcess request creates a process object, an initial thread object, a new virtual address space, process parameters, and a security context. Windows maps the executable and core runtime components, then the initial thread performs user-mode loader initialization before reaching the program entry point. The function can return before that initialization has completed.",
          "The caller receives PROCESS_INFORMATION containing a process handle, thread handle, PID, and TID. The handles are owned references in the caller's handle table. Closing them does not normally terminate the child. The identifiers are useful for correlation but cannot replace the handles for waiting or checked queries."
        ]
      },
      {
        title: "Executable selection and command-line parsing are separate decisions",
        paragraphs: [
          "CreateProcessW accepts an optional application name and a mutable command-line buffer. If the application name is null, Windows parses the first token to locate the executable. Spaces and ambiguous quoting can select an unintended file, so security-sensitive launchers should provide an explicit executable path and construct arguments with the target program's parsing rules in mind.",
          "The W function may modify the command-line buffer, which is why a ctypes call must pass writable storage such as create_unicode_buffer rather than immutable Python text. Environment and current directory also influence child behavior, including relative file lookup and later DLL resolution."
        ],
        inlineCheck: ["Why does a direct ctypes call use create_unicode_buffer for lpCommandLine?", ["CreateProcessW requires writable command-line storage", "It converts the child into a kernel thread", "Python str is ANSI-only", "It automatically closes both returned handles"], 0, "The native contract permits CreateProcessW to modify the command-line buffer, so ctypes must provide writable memory."]
      },
      {
        title: "Inheritance requires agreement at both the handle and creation call",
        paragraphs: [
          "Classic handle inheritance requires a handle marked inheritable and bInheritHandles set to true. Standard-handle redirection also requires STARTF_USESTDHANDLES and valid child-side handles. Modern extended startup attributes can pass an explicit handle list, reducing accidental leakage in a multithreaded parent.",
          "A leaked inherited pipe or file handle can keep an endpoint alive and prevent EOF or deletion long after the parent intended to release it. Process creation therefore includes an ownership map: which handles remain with the parent, which appear in the child, and which copies each side must close immediately after creation."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "The CreateProcess lifecycle",
        intro: "The API returns references to a process and its initial thread, not a completed program result.",
        items: [
          { meta: "Input", label: "Validate launch contract", detail: "Image, command line, token, flags, environment", linkAfter: "create" },
          { meta: "Kernel objects", label: "Process and initial thread", detail: "PID, TID, handles, security", linkAfter: "establish" },
          { meta: "Address space", label: "Map image and runtime", detail: "Executable, Ntdll, process parameters", linkAfter: "begin" },
          { meta: "User mode", label: "Loader initialization", detail: "Resolve imports, initialize runtime", linkAfter: "run" },
          { meta: "Caller lifetime", label: "Wait, query, close", detail: "Exit code and both returned handles" }
        ],
        caption: "STARTF_USESHOWWINDOW can influence an initial window. It does not remove the process from enumeration, security checks, or inspection tools."
      }
    ],
    workedExamples: [
      {
        type: "contract",
        title: "Construct a minimal safe CreateProcessW call",
        prompt: "Launch Notepad for observation, wait for it to exit, read the exit code, and release every caller-owned handle.",
        steps: [
          { title: "Declare the ABI", action: "Use WinDLL with use_last_error, exact argtypes and BOOL restype, full STARTUPINFOW, and PROCESS_INFORMATION.", why: "Pointer levels, field widths, and output layout must match the caller's architecture.", result: "ctypes can marshal the call without relying on default integer assumptions." },
          { title: "Initialize inputs", action: "Set startup.cb, use an explicit executable path, and create a writable command-line buffer.", why: "CreateProcessW validates cb and may modify command-line storage.", result: "Every required input has owned, writable lifetime through the call." },
          { title: "Branch on creation", action: "Test the returned BOOL and capture ctypes.get_last_error immediately on zero.", why: "A failed call does not initialize valid output handles.", result: "Only the success path enters handle ownership." },
          { title: "Observe and wait", action: "Use the PID for tool correlation and the process handle for WaitForSingleObject and GetExitCodeProcess.", why: "The handle supplies checked, waitable identity while the PID is only a number.", result: "The child lifecycle becomes visible without polling process names." },
          { title: "Release both references", action: "Close hThread and hProcess in finally, including error paths after successful creation.", why: "The creator owns both returned handles even after the child exits.", result: "The process and thread objects can be deleted when all other references are gone." }
        ],
        conclusion: "Correct process creation includes the output-handle lifetime, not only a true return value."
      }
    ],
    windowsLearning: [
      {
        title: "pywin32 removes ABI work but keeps the lifecycle",
        paragraphs: [
          "win32process.CreateProcess accepts Python representations and a STARTUPINFO object, then returns process handle, thread handle, PID, and TID. It normally raises pywintypes.error on native failure. The caller still chooses flags, inheritance, environment, current directory, and access-sensitive behavior, and still closes both handles.",
          "Use win32event.WaitForSingleObject on the process handle and compare the returned status explicitly. After a signaled result, win32process.GetExitCodeProcess returns the program's exit code. STILL_ACTIVE is meaningful while the process is running and should not be invented as an application exit convention."
        ]
      },
      {
        title: "The supplied hidden_process.py is a useful draft, not the final reference",
        paragraphs: [
          "The supplied script correctly defines the full structures, sets cb, uses a writable command line, and closes the two returned handles. It also demonstrates that STARTF_USESHOWWINDOW and SW_HIDE concern window presentation. The process remains visible to Process Explorer and enumeration APIs.",
          "For a robust reference, declare argtypes and restype, use WinDLL with use_last_error, raise a precise WinError, use an explicit executable path, and keep the process handle long enough to observe or wait. Calling through ctypes.windll without a declared signature relies on defaults that are unsafe for many pointer-sized APIs."
        ],
        callout: { label: "Important correction", text: "Hiding a console or application window is not hiding a process. The OS still tracks the process object, threads, token, handles, and resource use." }
      }
    ],
    practice: {
      title: "Create, observe, wait, and clean up",
      time: "35 min",
      intro: "Use a corrected ctypes launcher that exposes structure inputs, returned outputs, waiting, exit status, and cleanup.",
      download: ["downloads/create_process_lab.py", "create_process_lab.py"],
      expectedOutcome: "The launcher should create Notepad or another explicit harmless target, print the child PID and TID, optionally request a hidden initial window, and keep the process handle until the child exits. Process Explorer should reveal the child in either window mode. The wait should return WAIT_OBJECT_0, the exit code should become available, and both returned handles should close in finally.",
      steps: [
        { action: "Download create_process_lab.py and open the complete file in a text viewer before running it.", why: "The supplied artifact exposes its ABI declarations before native execution.", observe: "create_process_lab.py contains full STARTUPINFOW and PROCESS_INFORMATION fields, pointer-sized HANDLE members, startup.cb, WinDLL, use_last_error, argtypes, and restype." },
        {
          action: "From PowerShell in the folder containing create_process_lab.py, run the visible-target command and leave it at 'Inspect the child'.",
          commands: [{ label: "PowerShell", code: "py .\\create_process_lab.py" }],
          why: "The default target is the explicit System32\\notepad.exe path, establishing ordinary creation and correlation before presentation flags change.",
          observe: "create_process_lab.py prints child PID, initial TID, and hide requested: False. Process Explorer shows that exact child PID with its parent, System32\\notepad.exe image path, and creation time."
        },
        { action: "Close the child identified by the printed child PID, then press Enter in create_process_lab.py so it performs WaitForSingleObject.", why: "Waiting on the process handle demonstrates process-object signaling and avoids process-name polling.", observe: "Confirm a child exit code is printed, followed by 'closed initial thread handle' and 'closed process handle'. A missing child is distinct from access denied while inspecting it." },
        {
          action: "Run the complete hidden-presentation command and leave create_process_lab.py at its inspection prompt before locating the printed child PID externally.",
          commands: [{ label: "PowerShell", code: "py .\\create_process_lab.py --hide" }],
          why: "The comparison changes only the --hide request and separates window presentation from process existence.",
          observe: "create_process_lab.py prints hide requested: True, child PID, and initial TID. Initial window behavior may differ by target, but the exact process and thread remain observable until exit."
        },
        {
          action: "After closing the hidden test child and allowing that launcher to finish, run this guarded absent-target failure command.",
          commands: [{ label: "PowerShell", code: "$missingTarget = Join-Path $env:TEMP 'ILOVEOS-does-not-exist.exe'\nif (Test-Path -LiteralPath $missingTarget) { throw \"Remove or rename the existing collision before this failure test: $missingTarget\" }\npy .\\create_process_lab.py $missingTarget" }],
          why: "The failure path proves last-error handling without creating partial ownership.",
          observe: "The command shows the absent path in a numeric Windows error and prints no child PID or handle-cleanup success messages. A collision guard or access-denied error is distinct from the intended file-not-found branch and leaves unknown files untouched."
        }
      ],
      hints: [{ title: "Notepad does not stay hidden", body: "Modern applications can delegate or control their own windows. The lesson tests that the startup request is not a process-hiding mechanism, not that every target must honor SW_HIDE indefinitely." }],
      cleanup: ["Close the harmless --hide child and press Enter in create_process_lab.py so its wait and handle cleanup finish.", "Do not use the supplied launcher for protected, unrelated, or untrusted executables."]
    },
    checks: [
      ["What does CreateProcess create in addition to the process object?", ["Only a filename", "An initial thread", "A permanent parent-child ownership link", "A Job object automatically"], 1, "A new process begins with an initial thread whose handle and TID are returned to the creator."],
      ["What must the creator close after successful CreateProcessW?", ["The PID and TID integers", "The executable file on disk", "The returned process and thread handles", "The child's entire address space"], 2, "PROCESS_INFORMATION returns two caller-owned handles. Closing them releases references without necessarily terminating the child."],
      ["What does SW_HIDE establish?", ["The process cannot be enumerated", "An initial window-show request", "The process runs in kernel mode", "All child handles are protected"], 1, "SW_HIDE concerns window presentation. It does not conceal the process object from Windows or inspection tools."]
    ]
  },

  "object-manager": {
    phases: {
      learn: ["Build the object model", "Connect kernel-managed resources, names, handles, access checks, and reference tracking."],
      windows: ["Explore the namespace", "Use WinObj and Process Explorer to view the same named object from different perspectives."],
      investigation: ["Watch one object live", "Create, open, close, and observe a named event across two processes."],
      review: ["Check object identity", "Test namespace, handle-table, lifetime, naming, and cleanup distinctions."]
    },
    learning: [
      {
        title: "The Object Manager provides common machinery for different resources",
        paragraphs: [
          "Processes, threads, events, mutexes, semaphores, sections, tokens, files, and Job objects have different behavior, but many participate in a common executive object model. The Object Manager coordinates creation, type information, naming, security, handle-table references, and deletion. Other executive components implement the operations specific to each type.",
          "User-mode code does not receive a raw kernel address. It receives a handle value interpreted in the caller's process handle table. The table entry points toward the object and stores granted access plus attributes such as inheritance. The same numeric value in another process can refer to a different entry or be invalid."
        ]
      },
      {
        title: "Names provide discoverability, handles provide access",
        paragraphs: [
          "Many objects are unnamed and reachable only through existing handles. Named synchronization objects and sections can be looked up by unrelated processes when they use the same namespace path and pass security checks. Creating a named object may either create a new object or open the existing one, depending on the API contract.",
          "For several named objects, Local and Global prefixes select session-related namespaces. Local usually resolves within the caller's session, while Global reaches a cross-session namespace and can require additional privilege for some object types. A name is not authority: OpenEvent still asks for specific access and can return access denied."
        ],
        inlineCheck: ["What lets a second process operate on an existing named event?", ["Knowing the name alone always grants full control", "Opening the name with access allowed by the object's security", "Using the creator's numeric handle value directly", "Sharing the same executable path"], 1, "The name supports lookup, but Windows still performs an access check and returns a new handle in the second process."]
      },
      {
        title: "Object namespace paths are not ordinary file paths",
        paragraphs: [
          "The Object Manager namespace contains directories, symbolic links, devices, object-type directories, and named executive objects. Win32 paths such as C:\\ are translated through DOS-device symbolic links toward device paths. Registry and named-pipe surfaces also have mappings into underlying namespaces, but their public APIs remain the correct programming interface.",
          "WinObj reveals these relationships for investigation. It should not encourage hard-coded internal paths when a documented Win32 name exists. Internal layout can vary, and visibility does not imply that an object is safe or permitted to open."
        ]
      }
    ],
    visuals: [
      {
        type: "layers",
        title: "One named event seen through three views",
        intro: "The object, its namespace entry, and each process's handle are related but distinct.",
        items: [
          { meta: "Namespace", label: "Local\\ILOVEOS_ObjectLab", detail: "A discoverable name resolves within a session", linkAfter: "locates" },
          { meta: "Kernel", label: "Event object", detail: "Type, signaled state, security, reference tracking", linkAfter: "referenced by" },
          { meta: "Process A", label: "Creator handle entry", detail: "Granted access and inheritable attribute", linkAfter: "and" },
          { meta: "Process B", label: "Opened handle entry", detail: "A separate value and access mask" }
        ],
        caption: "Closing one process's handle removes one reference. The object remains while another handle or kernel reference still exists."
      }
    ],
    workedExamples: [
      {
        type: "state",
        title: "Follow a named event from creation to deletion",
        prompt: "Two Python processes share one manual-reset event by name.",
        steps: [
          { title: "No object", action: "Neither process has created or opened the name.", result: "OpenEvent reports that the name cannot be found.", why: "A name does not reserve an object before creation." },
          { title: "Create", action: "Process A calls CreateEvent with Local\\ILOVEOS_ObjectLab.", result: "The event object and A's handle entry exist.", why: "The creator receives an owned handle and establishes the name." },
          { title: "Open", action: "Process B calls OpenEvent with SYNCHRONIZE access.", result: "B receives its own handle to the same event object.", why: "Name lookup and security produce a new per-process capability." },
          { title: "Close A", action: "Process A releases its handle.", result: "The object remains because B still holds a reference.", why: "Closing a handle releases one reference, not every reference." },
          { title: "Close B", action: "Process B releases the final handle.", result: "The object and temporary name disappear when no other reference remains.", why: "Executive objects are deleted after their relevant reference count reaches zero." }
        ],
        conclusion: "Name lifetime follows object lifetime. The string can be reused after the old object is gone."
      }
    ],
    windowsLearning: [
      {
        title: "WinObj shows namespace identity, Process Explorer shows process ownership",
        paragraphs: [
          "WinObj can locate the named event under the session's BaseNamedObjects view and show its type. Process Explorer's Handle lower pane can show which process currently owns an Event handle. The two tools answer complementary questions: where the name resolves and which process has an open reference now.",
          "A short-lived object can disappear before either snapshot refreshes. Keep the creator paused during observation and record exact process identity. Process Monitor is not a general trace of every Object Manager operation, so do not assume it replaces the namespace and handle snapshots."
        ]
      },
      {
        title: "Use the API family's cleanup rule",
        paragraphs: [
          "PyHANDLE objects returned by pywin32 event APIs can be closed, and CloseHandle is the underlying rule for event handles. Other handle-shaped values have different release functions: registry keys use RegCloseKey, service handles use CloseServiceHandle, sockets use closesocket, and some pseudo handles must not be closed.",
          "The creating or opening API documentation defines ownership. Add cleanup to the design at acquisition time rather than deciding from the Python object's printed appearance."
        ]
      }
    ],
    practice: {
      title: "Watch a named object live",
      time: "25 min",
      intro: "Use a two-mode starter to create and open one named event while WinObj and Process Explorer show its namespace and handle views.",
      download: ["downloads/named_event_lab.py", "named_event_lab.py"],
      expectedOutcome: "Creator mode should create Local\\ILOVEOS_ObjectLab and pause with one event handle. Opener mode should obtain a distinct handle to the same object. WinObj should show the event name, and each live process should show an Event handle. The object should survive either first close and disappear after both handles close.",
      steps: [
        {
          action: "Download named_event_lab.py. In the first PowerShell window opened in its folder, run creator mode and leave it at 'Inspect WinObj and Process Explorer'.",
          commands: [{ label: "Creator PowerShell", code: "py .\\named_event_lab.py creator" }],
          why: "The pause makes Local\\ILOVEOS_ObjectLab and the creator handle long-lived enough for snapshot tools.",
          observe: "named_event_lab.py prints mode: creator, creator PID, name: Local\\ILOVEOS_ObjectLab, and a process-local handle value. A pywin32 dependency error is the setup-failure branch."
        },
        { action: "In Process Explorer choose View > Select Columns > Process Image, enable Session, and read the Session value for the creator PID printed in step 1. In WinObj open \\Sessions, open the numeric directory that matches that Session value, open BaseNamedObjects, and select ILOVEOS_ObjectLab.", why: "The live process supplies the current session number consumed by the Object Manager namespace path.", observe: "WinObj shows an Event named ILOVEOS_ObjectLab. Some WinObj versions present the current session directly under \\BaseNamedObjects; access denied and a missing object are distinct branches." },
        { action: "In Process Explorer select the creator PID printed in step 1, choose View > Show Lower Pane and View > Lower Pane View > Handles, then find the Event row whose name ends with ILOVEOS_ObjectLab.", why: "The handle lower pane shows creator ownership separately from the WinObj namespace entry.", observe: "Handles mode shows an Event row ending in ILOVEOS_ObjectLab for the exact creator PID while the first pause remains active." },
        {
          action: "In a second PowerShell window opened in the folder containing named_event_lab.py, run opener mode and leave it paused.",
          commands: [{ label: "Opener PowerShell", code: "py .\\named_event_lab.py opener" }],
          why: "OpenEvent demonstrates name lookup, access checking, and a separate handle-table entry.",
          observe: "Opener mode prints a second PID, the same fixed name, and its own process-local handle value. The numeric values need not match. Windows error 2 means the named object is missing; access denied is a different branch."
        },
        { action: "Press Enter in creator mode while keeping opener mode paused, then refresh WinObj and Process Explorer.", why: "The transition tests whether creator lifetime and object lifetime are the same.", observe: "The creator PID and handle disappear, while the ILOVEOS_ObjectLab namespace entry and opener handle remain." },
        { action: "Press Enter in opener mode, then refresh WinObj and Process Explorer.", why: "Releasing the final user handle allows deletion when no other reference remains.", observe: "opener mode prints handle closed and exits; the event name and opener PID disappear after refresh." }
      ],
      checkpoints: [{ afterStep: 2, type: "short", prompt: "Complete the supplied event name: Local\\ILOVEOS_[____]", answer: "ObjectLab", acceptedAnswers: [], feedback: "named_event_lab.py deliberately creates Local\\ILOVEOS_ObjectLab." }],
      hints: [{ title: "The event is not under the expected directory", body: "Use the exact Local prefix and inspect the BaseNamedObjects view for the current session. WinObj presentation can differ across Windows builds." }],
      cleanup: ["If either named_event_lab.py process is still waiting, press Enter once so its handle closes.", "Local\\ILOVEOS_ObjectLab needs no file cleanup after both processes exit."]
    },
    checks: [
      ["What does an Object Manager name primarily provide?", ["Automatic full access", "A lookup path to an object", "A raw kernel pointer", "Permanent storage"], 1, "Names make objects discoverable. Opening still performs access checks and returns a handle."],
      ["Why can two processes print different handle values for the same event?", ["The events must be different", "Each value is interpreted in its own process handle table", "Event handles are random filenames", "Only one process can use an event"], 1, "The per-process table entries can use different numeric values while referring to the same underlying object."],
      ["When can the named event be deleted?", ["Immediately after the creator closes, regardless of other users", "After the final relevant reference is released", "Only at system shutdown", "When its name is converted to lowercase"], 1, "The object persists while handles or other relevant references remain."]
    ]
  },

  "handles-rights-lifetime": {
    phases: {
      learn: ["Treat a handle as a capability", "Connect object identity, granted access, table scope, inheritance, and reference lifetime."],
      windows: ["Read handle evidence", "Use snapshots and traces to explain ownership, churn, buffering, and durability requests."],
      investigation: ["Compare three logging lifetimes", "Reproduce keep-open, reopen-per-write, and flush-per-write behavior with one controlled script."],
      review: ["Check rights and lifetime", "Test access masks, duplication, inheritance, closing, caching, and evidence limits."]
    },
    learning: [
      {
        title: "A handle table entry combines reference and authority",
        paragraphs: [
          "When an open or create operation succeeds, Windows places an entry in the caller's handle table. The entry refers to an object, records granted access, and carries attributes such as inheritance. The numeric handle is only the process-local key used to find that entry. It is neither a portable object ID nor a raw kernel pointer.",
          "Later APIs check the handle entry's granted rights. A handle opened with PROCESS_QUERY_LIMITED_INFORMATION cannot be used for WriteProcessMemory merely because the caller later decides it wants to write. The caller must have requested and received the necessary right through a suitable open or duplication operation."
        ]
      },
      {
        title: "Least privilege improves both security and reliability",
        paragraphs: [
          "Access masks combine standard, generic, and type-specific rights. Generic rights are mapped to the object's concrete rights during access checking. Requesting PROCESS_ALL_ACCESS or full file access when the task only needs a query increases the chance of access denied and increases what compromised code could do with the handle.",
          "Start from the next operation and request its documented minimum. Keep different capabilities separate when their lifetimes or trust boundaries differ. A read-only file handle communicates a stronger invariant than a read-write handle guarded only by comments."
        ],
        inlineCheck: ["A tool only needs a process image path. Which request is the better starting point?", ["PROCESS_ALL_ACCESS", "PROCESS_QUERY_LIMITED_INFORMATION", "PROCESS_TERMINATE", "PROCESS_VM_WRITE"], 1, "The limited query right matches the task and is more likely to pass the access check than unnecessary broad access."]
      },
      {
        title: "Closing releases one reference, not an abstract resource everywhere",
        paragraphs: [
          "CloseHandle removes the caller's entry and releases that reference. The underlying object can remain because another process holds a handle, a duplicate or inherited handle exists, or a kernel component retains an internal reference. Handle values can be reused, so logging only a number without time and process identity is ambiguous.",
          "DuplicateHandle creates another entry with chosen rights and target process. Inheritance copies selected handles during process creation. Both mechanisms require an ownership plan: who closes each copy, which rights it carries, and how a lingering copy affects EOF, deletion, or object lifetime."
        ]
      },
      {
        title: "File lifetime and durability are different performance decisions",
        paragraphs: [
          "Keeping a file handle open avoids repeated path parsing, security checks, object creation or open work, and handle-table churn. Reopening for every record repeats that overhead. This was the first GoodLog and BadLog observation. It demonstrates an inefficient logical operation sequence, not a direct count of physical disk writes.",
          "FlushFileBuffers asks the storage stack to push buffered data toward durable media. Calling it after every record can defeat batching and greatly increase latency, which was the second Good and Bad observation. Flushing is sometimes required for a durability contract, so the correct lesson is not never flush. It is choose a durability boundary deliberately and measure it separately from handle lifetime."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "The lifetime of one opened file capability",
        intro: "Identity, rights, use, duplication, and release are separate transitions.",
        items: [
          { meta: "Request", label: "Name plus desired access", detail: "Path, sharing, disposition, flags", linkAfter: "access check" },
          { meta: "Grant", label: "Handle table entry", detail: "Process-local value and granted rights", linkAfter: "may be" },
          { meta: "Transfer", label: "Duplicated or inherited", detail: "Another entry with explicit ownership", linkAfter: "supports" },
          { meta: "Use", label: "Read, write, query, wait", detail: "Only operations allowed by granted access", linkAfter: "finally" },
          { meta: "Release", label: "Close each owned handle", detail: "Object remains until final reference is gone" }
        ],
        caption: "A file may remain cached after its last handle closes. Object lifetime, cached data, and durable storage are related but not identical."
      }
    ],
    workedExamples: [
      {
        type: "comparison",
        title: "Three loggers, two independent sources of overhead",
        prompt: "Each logger writes the same records. Compare handle lifetime and durability behavior rather than calling both versions simply bad.",
        columns: [
          { title: "Keep one handle open", rows: [["Sequence", "CreateFile once, many WriteFile operations, CloseFile once"], ["Handle churn", "Low"], ["Buffering", "Windows and the runtime can batch writes"], ["Risk", "Recent buffered data can be lost if durability is required but never requested"]] },
          { title: "Reopen for every record", rows: [["Sequence", "Repeated CreateFile, WriteFile, CloseFile"], ["Handle churn", "High"], ["Buffering", "Still not necessarily durable after every close on every stack"], ["Risk", "Extra lookup and access-check work without a clear durability contract"]] }
        ],
        shared: "A third variant keeps one handle open but calls FlushFileBuffers after every write. It avoids open and close churn while still imposing a durability barrier repeatedly.",
        conclusion: "Choose handle lifetime and flush frequency as two separate design variables."
      }
    ],
    windowsLearning: [
      {
        title: "Process Explorer and Handle answer who owns the reference now",
        paragraphs: [
          "Search by a distinctive controlled file path to find current owners. A snapshot can explain why deletion or rename is blocked and which process still holds a file object. The absence of a handle after the program exits does not disprove that it opened the file earlier.",
          "Process Monitor supplies that time history. Count and order CreateFile, WriteFile, FlushBuffersFile, and CloseFile events for the same PID and path. Its operation names are normalized logical events, not a direct trace of every hardware cache or storage transaction."
        ]
      },
      {
        title: "Interpret each supplied Good, Bad, and Ugly observation precisely",
        paragraphs: [
          "The first supplied report correctly distinguishes one long-lived open from repeated open, write, and close sequences. The explanation should add that path resolution, security checking, object and handle work, runtime buffering, and storage caching all contribute, so Process Monitor alone does not assign exact time to each layer.",
          "The second report correctly identifies FlushBuffersFile after each write as a likely latency source. The result is machine and storage dependent, and a flush request is not proof of the exact instant physical media became durable. Report elapsed timing, operation sequence, storage conditions, and the application's stated durability requirement together."
        ]
      }
    ],
    practice: {
      title: "Compare handle churn and durability barriers",
      time: "35 min",
      intro: "Use one supplied Python logger with three modes so the operation sequence and output data remain controlled.",
      download: ["downloads/file_lifetime_lab.py", "file_lifetime_lab.py"],
      expectedOutcome: "Keep-open mode shows one main open and close around many writes. Reopen mode shows repeated opens and closes. Flush mode keeps one handle but requests a flush after each entry. Reopen and flush modes often take longer, but the exact ratio depends on storage, caching, antivirus, and entry count. Every mode emits equivalent logical entries.",
      steps: [
        {
          action: "Download file_lifetime_lab.py and open PowerShell in its folder. Run all three 25-entry correctness commands with explicit output filenames.",
          commands: [{ label: "PowerShell", code: "$ownedLogs = @('.\\iloveos_keep-open.log', '.\\iloveos_reopen.log', '.\\iloveos_flush.log')\nforeach ($ownedLog in $ownedLogs) { if (Test-Path -LiteralPath $ownedLog) { throw \"Remove or rename the existing lab file first: $ownedLog\" } }\npy .\\file_lifetime_lab.py keep-open --records 25 --output .\\iloveos_keep-open.log\npy .\\file_lifetime_lab.py reopen --records 25 --output .\\iloveos_reopen.log\npy .\\file_lifetime_lab.py flush --records 25 --output .\\iloveos_flush.log" }],
          why: "Correctness must be established before timing or event-count comparisons are meaningful.",
          observe: "At each Start the filtered Process Monitor capture prompt, press Enter once. Every mode prints records: 25, and all three owned files contain the same fixed entry sequence. A collision error protects pre-existing files."
        },
        {
          action: "Run the complete keep-open capture command. At its pause, configure Process Monitor with PID is the printed PID Include and Path is the printed full path Include; clear the display, resume capture, press Enter to start timing, and pause capture when elapsed time prints.",
          commands: [{ label: "PowerShell", code: "py .\\file_lifetime_lab.py keep-open --records 250 --output .\\iloveos_keep-open.log" }],
          why: "This establishes the minimal logical handle-lifetime sequence for the exact output file.",
          observe: "Process Monitor shows the printed PID and exact path using one main CreateFile lifetime around the writes. The program prints mode: keep-open, records: 250, bytes, and machine-dependent elapsed time."
        },
        {
          action: "Repeat the complete capture procedure with reopen mode and its distinct output path; change only the mode and output filename shown here.",
          commands: [{ label: "PowerShell", code: "py .\\file_lifetime_lab.py reopen --records 250 --output .\\iloveos_reopen.log" }],
          why: "Changing handle lifetime isolates repeated open and close behavior.",
          observe: "For the newly printed PID and path, Process Monitor shows repeated CreateFile and CloseFile activity. Exact elapsed time remains machine-dependent."
        },
        {
          action: "Repeat the complete capture procedure with flush mode and its distinct output path; change only the mode and output filename shown here.",
          commands: [{ label: "PowerShell", code: "py .\\file_lifetime_lab.py flush --records 250 --output .\\iloveos_flush.log" }],
          why: "A durability barrier is a different design choice from repeated acquisition.",
          observe: "For the newly printed PID and path, Process Monitor shows FlushBuffersFile activity without the reopen mode's repeated handle lifetime. Exact elapsed time remains machine-dependent."
        },
        {
          action: "After all file_lifetime_lab.py commands exit, run this PowerShell cleanup block in the same folder.",
          commands: [{ label: "PowerShell", code: "$ownedLogs = @('.\\iloveos_keep-open.log', '.\\iloveos_reopen.log', '.\\iloveos_flush.log')\nforeach ($ownedLog in $ownedLogs) { if (Test-Path -LiteralPath $ownedLog) { Remove-Item -LiteralPath $ownedLog } }\n$ownedLogs | ForEach-Object { Test-Path -LiteralPath $_ }" }],
          why: "Cleanup targets only the three explicit files created by the showcase.",
          observe: "PowerShell prints False three times. Any True result identifies an owned log that remains."
        }
      ],
      hints: [{ title: "There are extra file events", body: "Runtimes and Windows can issue metadata or cleanup operations. Keep the PID and exact Path filters so unrelated activity stays outside the display." }],
      cleanup: ["Leave Process Monitor capture stopped and clear only the showcase display.", "The final PowerShell block removes only the three explicit ILOVEOS log files."]
    },
    checks: [
      ["What does granted access belong to most directly?", ["The executable filename", "The handle table entry", "The PID forever", "The desktop window"], 1, "The access check records granted rights in the caller's handle entry."],
      ["Why may an object survive CloseHandle?", ["CloseHandle never releases references", "Other handles or kernel references can remain", "Every object is permanent", "Only processes have lifetimes"], 1, "Closing one handle releases one reference. Deletion waits for all relevant references to be gone."],
      ["What does FlushFileBuffers primarily change?", ["The process PID", "The requested durability boundary for buffered file data", "The file's executable signature", "The number of CPU cores"], 1, "A flush requests buffered file data be pushed through the storage stack, often trading throughput for a stronger durability point."]
    ]
  }
};
