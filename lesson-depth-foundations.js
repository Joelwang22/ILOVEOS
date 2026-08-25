window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "cpu-architecture-data": {
    phases: {
      learn: ["Understand the machine", "Connect instructions, number systems, processor topology, and address width to form a common foundation."],
      windows: ["Decode Windows values", "Use Win32 types and the Python process's ABI to interpret the values Windows exposes."],
      investigation: ["Inspect the machine", "Compare the simplified architecture model with the system Windows reports."],
      review: ["Check the foundations", "Test the calculations and distinctions that later lessons rely on."]
    },
    learning: [
      {
        title: "A computer changes state by executing instructions",
        paragraphs: [
          "At the lowest useful level, a processor repeatedly fetches an instruction, decodes what it means, and performs it. An instruction may add two values, compare them, copy bytes, or change which instruction runs next. The values closest to the execution units live in registers. Registers are tiny compared with RAM, but they are where a running thread keeps immediate operands, addresses, flags, and its next instruction position.",
          "RAM holds far more code and data, but the processor does not treat it as a uniformly fast pool. Caches retain recently used blocks near each core. If the required bytes are not in a nearby cache, the core waits longer while the memory hierarchy supplies them. Storage sits further away and preserves data after power is removed. This model of registers, caches, RAM, and storage explains why later lessons distinguish CPU time, memory residency, and file I/O."
        ],
        callout: { label: "Distinguish the terms", text: "A program is passive code. A process is a protected running container. A thread is the execution state a processor can schedule. A core is hardware that can run a thread." }
      },
      {
        title: "Binary stores the state, hexadecimal makes it readable",
        paragraphs: [
          "A bit has two possible states, conventionally written 0 and 1. Eight bits form a byte. Decimal is convenient for quantities people discuss, while binary exposes the individual bit positions computers use. Hexadecimal is a compact bridge between them because one hexadecimal digit represents exactly four bits. The digits 0 through 9 are followed by A through F, representing decimal 10 through 15.",
          "Windows tools display addresses, flags, access masks, and file structures in hexadecimal because the four-bit groups remain visible. For example, 0x3A is two hexadecimal digits, so it maps directly to 0011 1010 in binary. A flag value such as 0x12 can be understood as multiple set bit positions rather than the decimal number 18. The notation does not change the stored value, only how we write it."
        ]
      },
      {
        title: "Packages, cores, and logical processors describe different layers",
        paragraphs: [
          "A CPU package is the physical chip installed in a socket. A package may contain several physical cores, and a core may expose more than one logical processor through simultaneous multithreading. Windows schedules threads onto logical processors. Saying that two packages with four cores each provide eight physical cores is a useful counting exercise, but saying they can execute exactly eight instructions at once is only a classroom simplification.",
          "Modern cores pipeline many instructions, issue more than one operation in a cycle, wait on dependencies, and reorder work while preserving the program's visible behavior. Multiple runnable threads also compete for shared caches and memory bandwidth. For operating-system work, the practical rule is that logical processors are scheduling targets, while actual throughput depends on the workload and microarchitecture."
        ],
        inlineCheck: ["A machine has two CPU packages, four physical cores per package, and two logical processors per core. How many logical processors are available to the Windows scheduler?", ["4", "8", "16", "32"], 2, "Two packages multiplied by four cores and two logical processors gives 16 scheduling targets. This does not mean that exactly 16 instructions complete at every instant."]
      },
      {
        title: "Address width limits the range of memory a process can address",
        paragraphs: [
          "If an address contains N bits, it can encode 2 to the power of N distinct values. With byte-addressable memory, the simple 32-bit calculation is 2^32 bytes, which is 4 GiB. That is the size of the address range, not a guarantee that an ordinary 32-bit process can use every byte. Windows reserves regions, maps system components, and may divide the range according to process and boot configuration.",
          "A 64-bit pointer can represent a vastly larger range, although current x64 processors and Windows use fewer than all 64 bits for implemented virtual addresses. Pointer width follows the process architecture. A 32-bit Python process on 64-bit Windows still has 32-bit pointers, which is why ctypes.sizeof(ctypes.c_void_p) is a useful first check before declaring native structures."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "From persistent bytes to the instruction being executed",
        intro: "The same code and data move through layers with different capacity, latency, and purpose.",
        items: [
          { meta: "Persistent", label: "Storage", detail: "Executable files and saved data", linkAfter: "load pages" },
          { meta: "Working set", label: "RAM", detail: "Active code, stacks, heaps, and cached file data", linkAfter: "fill cache lines" },
          { meta: "Near the core", label: "CPU cache", detail: "Recently used blocks", linkAfter: "supply operands" },
          { meta: "Current state", label: "Registers", detail: "Values, addresses, flags, and instruction pointer" }
        ],
        caption: "Data can move in both directions. The arrows show the usual path toward execution, not a one-way ownership transfer."
      }
    ],
    workedExamples: [
      {
        type: "calculation",
        title: "Decode a hexadecimal value without guessing",
        prompt: "Convert 0x3A into binary and decimal, then explain why the representation is useful.",
        steps: [
          { title: "Expand each hexadecimal digit", action: "Map 3 to 0011 and A to 1010.", why: "Every hex digit corresponds to exactly four bits, so this conversion preserves visible groups.", result: "0x3A becomes 0011 1010." },
          { title: "Apply place values", action: "Calculate 3 multiplied by 16, then add 10.", why: "Hexadecimal is base 16, so the left digit occupies the sixteens place.", result: "48 + 10 = 58 decimal." },
          { title: "Interpret the value; do not merely convert it", action: "Ask whether 0x3A represents a count, part of an address, a character code, or a set of flags in its actual context.", why: "The bits alone do not tell you their meaning. The API or data structure supplies the type and semantics.", result: "You know the value, but you still need its type and definition." }
        ],
        conclusion: "Binary, decimal, and hexadecimal are different notations for the same bit pattern. Context gives that pattern meaning."
      },
      {
        type: "calculation",
        title: "Calculate a 32-bit address range",
        prompt: "Explain why a 32-bit byte address is commonly associated with 4 GiB.",
        steps: [
          { title: "Count distinct addresses", action: "Use 2^32 because every one of 32 bit positions has two possible states.", why: "This counts combinations from all zeroes through all ones.", result: "There are 4,294,967,296 possible address values." },
          { title: "Apply byte addressing", action: "Treat each address as naming one byte.", why: "The result is a byte count only because this architecture addresses bytes.", result: "4,294,967,296 bytes." },
          { title: "Convert units carefully", action: "Divide by 1024 three times to convert bytes to GiB.", why: "GiB uses powers of two, matching the address calculation.", result: "The address range contains exactly 4 GiB." },
          { title: "State the limitation", action: "Distinguish the theoretical address range from the space a process can actually use.", why: "Mappings, reserved regions, and OS policy occupy parts of the range.", result: "A process does not automatically receive 4 GiB of usable private memory." }
        ],
        conclusion: "Address width determines how many locations can be named. It does not by itself determine installed RAM or usable memory."
      }
    ],
    windowsLearning: [
      {
        title: "Use Win32 type names as clues",
        paragraphs: [
          "Windows type aliases convey intent. BYTE and WORD are fixed-width unsigned quantities. DWORD is a 32-bit unsigned value even on 64-bit Windows. BOOL follows a 32-bit Windows convention; it does not use the same representation as ctypes.c_bool. HANDLE is an opaque value used to refer to an object through a process handle table. LPVOID is a pointer without a more specific target type.",
          "Text types add another layer. WCHAR is a UTF-16 code unit, LPCWSTR is a pointer to constant wide text, and LPCTSTR follows the build's TCHAR choice. Modern Python code that calls Windows directly should normally choose the explicit wide, W-suffixed API and corresponding wide-character types. Pointer-sized aliases such as ULONG_PTR change with the caller's architecture."
        ],
        bullets: ["Fixed-width does not mean pointer-sized", "Do not treat a pointer as an ordinary number merely because its address is stored as bits", "Opaque handles must be used and closed according to their API contract"]
      }
    ],
    codeWalkthroughs: [
      {
        title: "Ask Python what architecture its pointers use",
        intro: "This short check establishes the ABI of the Python process that will make ctypes calls.",
        stages: [
          { title: "Import the type system", explanation: "ctypes models C values and pointers. platform gives a readable architecture label, but the measured pointer size determines the ABI that matters here.", code: "import ctypes\nimport platform" },
          { title: "Measure, then convert to bits", explanation: "sizeof returns bytes. Multiplying by eight gives the familiar 32-bit or 64-bit pointer width.", code: "pointer_bytes = ctypes.sizeof(ctypes.c_void_p)\npointer_bits = pointer_bytes * 8" },
          { title: "Report both views", explanation: "If the values disagree with your expectation, check which Python executable you launched before defining any native structures.", code: "print(f\"Python label: {platform.architecture()[0]}\")\nprint(f\"Pointer width: {pointer_bits} bits\")" }
        ]
      }
    ],
    practice: {
      title: "Decode what Windows shows you",
      time: "20 min",
      intro: "Match a controlled Python process to its architecture, then inspect one of its threads in Process Explorer.",
      expectedOutcome: "The Python command prints its executable, PID, architecture label, pointer bytes, and pointer bits. Process Explorer identifies the same image type and exposes a selected thread's Start Address through Properties > Threads. Exact PIDs and addresses vary; pointer bits always equal pointer bytes multiplied by eight.",
      steps: [
        {
          action: "Open PowerShell in any folder and paste this command. It prints the Python executable, PID, architecture label, pointer size in bytes, and pointer size in bits, then waits at the Enter prompt.",
          commands: [{
            label: "PowerShell",
            code: "py -c \"import ctypes, os, platform, sys; pointer_bytes = ctypes.sizeof(ctypes.c_void_p); print(f'Python executable: {sys.executable}'); print(f'PID: {os.getpid()}'); print(f'Architecture label: {platform.architecture()[0]}'); print(f'Pointer bytes: {pointer_bytes}'); print(f'Pointer bits: {pointer_bytes * 8}'); input('Press Enter after Process Explorer inspection...')\""
          }],
          why: "The calling process architecture controls pointer width, even when the installed Windows system is 64-bit.",
          observe: "The five labelled values appear before the prompt. If PowerShell reports that py is not recognized, the Python launcher is unavailable and the Process Explorer steps cannot continue."
        },
        { action: "In Process Explorer, choose View > Select Columns > Process Image, enable Image Type and Path, and match the live PID and Python executable printed in step 1.", why: "Matching both identifiers avoids inspecting an unrelated Python process.", observe: "The matched row shows the same executable path and an image type consistent with the command's 32-bit or 64-bit pointer width. If the PID has exited, restart the command in step 1 before continuing." },
        { action: "With the matched Python row selected in Process Explorer, open Properties > Threads, select one listed TID, and read its Start Address.", why: "A start address belongs to a specific thread; it is not a value in the process list's Process Performance columns.", observe: "The selected TID shows a hexadecimal Start Address. Symbols may remain unresolved; an access-denied result or missing Threads view is a tool limitation, not a value you should guess." },
        { action: "Return to the waiting Python command and press Enter once so the controlled process exits.", why: "The pause exists only to keep the exact process and its threads available during inspection.", observe: "The command finishes and the matched PID disappears from Process Explorer after refresh." }
      ],
      hints: [{ title: "Image Type is missing", body: "Use View > Select Columns > Process Image in Process Explorer. Do not use the operating-system architecture as a substitute for the live Python process architecture." }],
      cleanup: ["If the Python process is still waiting, press Enter once so it exits normally.", "Close Process Explorer if it is no longer needed; the command creates no lab file."]
    },
    checks: [
      ["Which item is not a numeric Win32 type?", ["BOOL", "CHAR", "UINT", "LPCTSTR"], 3, "LPCTSTR is a pointer to constant TCHAR text. Its address is represented with bits, but its declared purpose is to point to a string."],
      ["How many distinct byte addresses can a 32-bit address represent?", ["Exactly 4 GiB of installed RAM", "2^32 byte addresses", "Four CPU cores", "A 4 GiB file-size limit in every API"], 1, "Thirty-two bits can encode 2^32 distinct values. Installed memory and usable process regions are separate questions."],
      ["What does Windows normally schedule onto a logical processor?", ["A file", "A process container", "A runnable thread", "A DLL export"], 2, "A thread carries the instruction pointer, registers, stack, and scheduling state that a logical processor can execute."]
    ]
  },

  "why-operating-system": {
    phases: {
      learn: ["See the problem", "Start from raw hardware and identify the abstractions and resource decisions an OS must provide."],
      windows: ["Find the abstractions", "Connect the model to Windows objects, APIs, and observable process state."],
      investigation: ["Trace one request", "Follow a controlled action from Python into the Windows abstractions that fulfill it."],
      review: ["Check the OS model", "Test why abstraction, protection, and resource management belong together."]
    },
    learning: [
      {
        title: "Raw hardware is powerful but awkward to share",
        paragraphs: [
          "Imagine every application talking directly to a storage controller, configuring page tables, handling keyboard interrupts, and deciding when another program may use the CPU. Each program would need hardware-specific code, and two programs could corrupt one another simply by choosing the same memory or device state. The operating system creates a controlled layer between program intent and machine mechanism.",
          "That layer is not just convenience. It is the place where Windows can validate requests, schedule competing work, isolate failures, and recover resources. Applications receive stable abstractions such as files, processes, virtual memory, sockets, windows, and handles. Drivers and the kernel translate those abstractions into operations suitable for the actual hardware."
        ]
      },
      {
        title: "The first job is abstraction",
        paragraphs: [
          "An abstraction presents the behavior software needs while hiding details that should not be repeated everywhere. A program opens a named file and reads bytes. It does not need to know whether those bytes came from an NVMe drive, a USB device, a network redirector, or a cache. The file interface stays recognizable while the mechanism changes.",
          "Abstraction is not the same as pretending hardware does not exist. Performance, alignment, buffering, and failure modes still leak through when they matter. The goal is a stable contract: the application states what it wants, and the OS chooses an allowed way to perform it."
        ]
      },
      {
        title: "The second job is resource management and protection",
        paragraphs: [
          "Processors, memory, storage bandwidth, and devices are finite. Windows schedules ready threads, tracks virtual memory, caches file data, controls access to objects, and decides when buffered changes reach a device. A thread waiting for I/O is not ready to execute, so another ready thread can use the logical processor instead. This overlap keeps the machine useful while slow operations complete.",
          "Protection makes sharing sustainable. Each process receives a separate virtual address space, objects are accessed through checked handles, and security tokens are compared with access-control rules. A program can still crash or misuse resources it legitimately owns, but it cannot ordinarily rewrite arbitrary kernel memory or another process's memory simply because it knows an address."
        ],
        callout: { label: "A reusable model", text: "Intent enters through an interface. Windows applies policy, chooses a mechanism, and returns either a result or a failure that the program must handle." }
      }
    ],
    visuals: [
      {
        type: "layers",
        title: "The operating system sits between intent and mechanism",
        intro: "Each layer asks the one below for a more concrete operation.",
        items: [
          { meta: "Goal", label: "User intent", detail: "Save a document", linkAfter: "expressed by" },
          { meta: "Program", label: "Application", detail: "Requests a file operation", linkAfter: "calls" },
          { meta: "Manager and interface", label: "Operating system", detail: "Checks access, resolves objects, schedules I/O", linkAfter: "controls" },
          { meta: "Mechanism", label: "Hardware and devices", detail: "Execute instructions and move bytes" }
        ],
        caption: "The operating system is both an interface provider and a policy-enforcing resource manager."
      }
    ],
    workedExamples: [
      {
        type: "trace",
        title: "Running example: follow an application opening a file",
        prompt: "A text editor asks to open C:\\notes\\plan.txt. What work belongs to the operating system?",
        steps: [
          { title: "Express intent", action: "The editor supplies a path, requested access, sharing rules, and opening behavior to a file API.", why: "The editor describes the outcome without specifying disk sectors.", result: "A structured request enters the Windows API." },
          { title: "Resolve and validate", action: "Windows resolves the path, finds the relevant file system and object, then evaluates security and sharing rules.", why: "The operating system must enforce names, permissions, and concurrent-access rules consistently for all programs.", result: "The request is either rejected with an error or allowed to continue." },
          { title: "Perform or queue I/O", action: "The I/O system and drivers obtain the required data, possibly from cache and possibly from a device.", why: "Only the OS and trusted drivers should coordinate device access and completion.", result: "The requesting thread may wait while another ready thread runs." },
          { title: "Return an abstraction", action: "Windows returns a handle representing the caller's granted access to the opened object.", why: "Later operations can use the access recorded in the handle without repeating the entire request to open the file.", result: "The editor reads through the handle and must eventually close it." }
        ],
        conclusion: "One ordinary file-open operation demonstrates abstraction, resource management, protection, scheduling, and responsibility for resource lifetime."
      }
    ],
    windowsLearning: [
      {
        title: "Windows exposes abstractions through APIs and objects",
        paragraphs: [
          "Most applications begin with the documented Win32 API. User-mode libraries normalize arguments and may complete simple work locally. Operations that need protected state cross into kernel mode through a system service. Kernel managers and drivers then operate on processes, threads, files, sections, tokens, registry keys, events, and other objects.",
          "A handle is a process-local reference to an object plus granted access. The handle is not the object and is not usually a pointer to kernel memory. This distinction lets Windows validate each use, share an object safely, and release the process's reference when the handle is closed."
        ]
      },
      {
        title: "pywin32 exposes the operating system; it does not replace it",
        paragraphs: [
          "pywin32 maps many Windows operations into Python-friendly calls. A function such as GetCurrentProcessId returns the identity assigned by the OS, while GetUserName reports the user associated with the current security context. The wrapper may convert a native structure or raise pywintypes.error, but the underlying Windows contract still defines what is being requested.",
          "ctypes operates closer to the C boundary and can call exported functions that pywin32 does not cover. That flexibility transfers responsibility to your code: declare types, preserve errors, allocate buffers, and release resources correctly. Later lessons choose pywin32 first and use ctypes when the lower-level details provide a useful lesson or fill a real coverage gap."
        ]
      }
    ],
    codeWalkthroughs: [
      {
        title: "Identify the process Windows created around your script",
        intro: "The starter file asks Windows for state that does not live in the Python source itself.",
        stages: [
          { title: "Import Windows wrappers", explanation: "win32api exposes general process, user, and system functions. These calls ask the current Windows environment for answers.", code: "import win32api\nimport win32process" },
          { title: "Read process and user identity", explanation: "The PID is assigned when Windows creates the process. The user name comes from the security context in which it runs.", code: "pid = win32api.GetCurrentProcessId()\nuser = win32api.GetUserName()" },
          { title: "Keep the process observable", explanation: "A short pause gives you time to find the exact PID in Process Explorer and inspect its parent, threads, token, handles, and modules.", code: "print(f\"PID: {pid}  User: {user}\")\ninput(\"Inspect this process, then press Enter...\")" }
        ]
      }
    ],
    practice: {
      title: "Find Python inside Windows",
      time: "20 min",
      download: ["downloads/who_am_i.py", "who_am_i.py"],
      intro: "Run a small pywin32 program, then connect its Python output to the operating-system objects and resources associated with the process.",
      expectedOutcome: "who_am_i.py prints a user and PID that match the same process in Process Explorer. The live process exposes parent, token, thread, handle, and loaded-module state. After Enter, the PID row and current resources disappear; Windows may reuse the number later.",
      steps: [
        { action: "Open Process Explorer and choose View > Select Columns. On the Process Image tab, enable PID, Parent PID, User Name, Integrity Level, and Image Type. On the Process Performance tab, enable Threads.", why: "These columns show identity, security, architecture, and scheduling information together in one process row.", observe: "The enabled columns appear in the top process pane. If Process Explorer cannot show a protected value, the corresponding cell remains unavailable." },
        {
          action: "Download who_am_i.py, open PowerShell in the folder containing it, and run this command. Leave who_am_i.py at its Enter prompt.",
          commands: [{ label: "PowerShell", code: "py .\\who_am_i.py" }],
          why: "Launching from a known parent lets you test process ancestry rather than merely reading a PID.",
          observe: "who_am_i.py prints a user and PID. Locate that exact PID in Process Explorer. If py or pywin32 is unavailable, treat the dependency message as a setup failure; do not substitute an unrelated Python process."
        },
        { action: "Select the PID printed by who_am_i.py in Process Explorer, open Properties, and inspect Image, Performance, Threads, and Security.", why: "The tabs expose OS-managed identity, scheduling, memory, and authorization state for the exact process.", observe: "Image shows the executable and parent, Threads shows at least the running thread, and Security shows token details when access permits. Access denial, an unavailable tab, and a PID that has already exited are distinct limitations." },
        { action: "Keep the printed PID selected, choose View > Show Lower Pane, then switch View > Lower Pane View between Handles and DLLs.", why: "Handles are process-local references to objects, while DLL rows are mapped code images.", observe: "Handles mode and DLLs mode show different row types for the same live PID. If access is denied, Process Explorer may leave one of the panes empty or show the limitation explicitly." },
        { action: "Press Enter once in who_am_i.py, then refresh Process Explorer.", why: "Terminating the process makes the lifetime of its row and current resources visible.", observe: "who_am_i.py returns to PowerShell and its PID row disappears after refresh. A later reused numeric PID would identify a different process instance." }
      ],
      hints: [{ title: "who_am_i.py exits too quickly", body: "The downloaded who_am_i.py waits for Enter after printing. Match its numeric PID rather than relying only on the python.exe name." }],
      cleanup: ["If who_am_i.py is still waiting, press Enter once so it exits normally.", "Close Process Explorer if it is no longer needed."]
    },
    checks: [
      ["Why can Windows run another thread while a music player waits for storage?", ["The first process lost its memory", "The waiting thread is not ready to use the processor", "Every I/O request terminates its thread", "The file became a process"], 1, "A thread waiting for I/O is not runnable. The scheduler can dispatch another ready thread and use the processor productively."],
      ["Which statement best describes an operating-system abstraction?", ["It removes every hardware performance difference", "It gives programs a stable contract over changing mechanisms", "It lets applications bypass access checks", "It is only a graphical interface"], 1, "An abstraction provides stable behavior and terminology. Hardware details can still matter, but each program does not need to reimplement the mechanism."],
      ["What is a Windows handle in this model?", ["The kernel object itself", "A process-local reference with granted access", "A physical RAM address", "A CPU instruction"], 1, "A handle identifies an entry in the process's handle table. That entry refers to an object and records the granted access. Use and close the handle according to the API that created it."]
    ]
  },

  "windows-organisation": {
    phases: {
      learn: ["Map Windows", "Build a practical layered model without treating Windows as one opaque block."],
      windows: ["Connect layers to tools", "Use different evidence sources for different parts of the architecture."],
      investigation: ["Trace a request through Windows", "Follow one controlled file operation across the layers that participate."],
      review: ["Check the architecture", "Test which components provide stable contracts and which remain implementation details."]
    },
    learning: [
      {
        title: "Windows is a set of cooperating layers, not one opaque block",
        paragraphs: [
          "A useful Windows map begins with a boundary: application and service processes run in user mode, while the executive, kernel, and most drivers run in kernel mode. User-mode processes have separate virtual address spaces. Kernel-mode components share privileged system space and can affect the entire machine, which is why their interfaces and input validation matter so much.",
          "Applications normally enter through subsystem and API DLLs such as Kernel32, Advapi32, User32, Gdi32, and Ws2_32. These DLLs group programming contracts; each one is not a complete operating-system subsystem. Modern implementations frequently forward exports to other DLLs. Ntdll provides the lowest ordinary user-mode layer, including the Native API, loader support, runtime functions, and system-call transition stubs."
        ]
      },
      {
        title: "Executive managers implement the major operating-system policies",
        paragraphs: [
          "Inside kernel mode, executive components divide responsibility. The Object Manager supplies a common object and handle model. The Process and Thread Manager maintains execution containers and thread state. The Memory Manager owns virtual address spaces and physical-page policy. The I/O Manager builds requests and sends them through driver stacks. The Security Reference Monitor participates in access checks, and the Configuration Manager implements the Registry.",
          "Below and alongside the executive, the kernel handles low-level scheduling, interrupt and exception dispatch, and synchronization primitives. The hardware abstraction layer hides platform-specific interrupt and hardware details from higher components. Device drivers translate general I/O requests into operations for filesystems, networks, storage devices, displays, and other devices."
        ],
        callout: { label: "Names describe responsibility", text: "The diagram is a mental model, not a promise that every request crosses every box. Trace the actual path when the distinction matters." }
      },
      {
        title: "System processes make parts of the architecture visible",
        paragraphs: [
          "Several long-lived processes support the system. The System process represents kernel and driver activity in many tools. services.exe runs the Service Control Manager. lsass.exe supports local security policy and authentication. wininit.exe and winlogon.exe participate in session initialization, and svchost.exe hosts groups of DLL-based services.",
          "These descriptions identify roles; they are not a fixed list of parent-child positions to memorize. Windows versions, service isolation settings, sessions, and security features change the exact tree. Evaluate the signed image path, parentage, user, command line, services, and observed behavior together. A familiar filename alone is weak evidence."
        ]
      }
    ],
    visuals: [
      {
        type: "layers",
        title: "A practical map of Windows",
        intro: "Follow the application request down toward the hardware, then remember that results and events travel back upward.",
        items: [
          { meta: "User mode", label: "Applications and services", detail: "Separate processes, tokens, address spaces, threads", linkAfter: "documented API calls" },
          { meta: "User mode", label: "Win32 DLLs and Ntdll", detail: "Contracts, argument preparation, runtime, Native API stubs", linkAfter: "system-call transition" },
          { meta: "Kernel mode", label: "Executive and kernel", detail: "Objects, memory, I/O, security, scheduling", linkAfter: "I/O requests and interrupts" },
          { meta: "Kernel mode", label: "Drivers and HAL", detail: "Filesystem, network, device, and platform mechanisms", linkAfter: "control" },
          { meta: "Machine", label: "Hardware", detail: "Processors, memory controllers, storage, and devices" }
        ],
        caption: "Some calls finish in user mode, while some I/O paths include multiple layered drivers. Use this as an orientation map rather than a rigid stack trace."
      }
    ],
    workedExamples: [
      {
        type: "trace",
        title: "Running example: trace CreateFileW through the map",
        prompt: "A process opens an existing text file for reading. Follow the important responsibilities without claiming every internal implementation detail.",
        steps: [
          { title: "Enter the public contract", action: "The application calls CreateFileW with a UTF-16 path, desired access, sharing rules, creation disposition, and flags.", why: "The documented Win32 API defines what application code may rely on.", result: "Kernel32 and the underlying implementation prepare and forward the request." },
          { title: "Reach the native boundary", action: "When the operation needs protected file state, user-mode code ultimately invokes a Native API service through Ntdll.", why: "Ordinary application code cannot directly manipulate kernel objects or file-system driver state.", result: "The calling thread transitions into kernel mode." },
          { title: "Resolve object and I/O policy", action: "The Object Manager, I/O Manager, security logic, file system, and driver stack participate as required.", why: "Different cooperating components handle names, permissions, sharing, caching, and device access.", result: "Windows either rejects the request or creates an open file object and the necessary references." },
          { title: "Return process-local access", action: "Windows creates an entry in the process's handle table and returns the corresponding handle value to the caller.", why: "The caller needs a checked reference for later ReadFile and CloseHandle operations.", result: "The process owns a handle, not the underlying storage device or kernel memory." }
        ],
        conclusion: "A simple API call can cross several responsibilities. The stable contract matters more than an undocumented internal function sequence."
      }
    ],
    windowsLearning: [
      {
        title: "Use three tools to examine three kinds of structure",
        paragraphs: [
          "Process Explorer begins with processes. Its tree, Properties tabs, lower pane, and verified signatures help you connect a process to its parent, token, services, threads, handles, and mapped images. It is mainly a current-state view. A process that has already exited or a handle that has already been closed may be absent when you look.",
          "Process Monitor records events over time. File, Registry, process, thread, network, and image-load events can reveal the path a request followed and the result it received. WinObj presents the Object Manager namespace, showing directories and named objects that do not correspond directly to file-system paths. Together, these tools show running processes, event history, and the namespace of named objects."
        ]
      }
    ],
    practice: {
      title: "Trace one file request through Windows",
      time: "25 min",
      intro: "Use Process Monitor evidence to connect the layer diagram to a request you can observe.",
      expectedOutcome: "Process Monitor captures Notepad's successful CreateFile request for the exact lab path. Event details expose access and sharing fields, while Stack can show user-mode frames followed by kernel and file-system or filter-driver frames. Exact modules vary by Windows build and available symbols.",
      steps: [
        {
          action: "In PowerShell, create the ILOVEOS_windows_layers.txt lab file and print its full path. Leave Notepad closed for now.",
          commands: [{ label: "PowerShell", code: "$tracePath = Join-Path $env:TEMP 'ILOVEOS_windows_layers.txt'\nif (Test-Path -LiteralPath $tracePath) { throw \"Remove or rename the existing lab file first: $tracePath\" }\nSet-Content -LiteralPath $tracePath -Value 'ILOVEOS controlled Windows-layer trace' -Encoding utf8\n$tracePath" }],
          why: "A controlled target gives the trace one known path and makes it clear which file the cleanup step may remove.",
          observe: "PowerShell prints the full path. If the file already exists, the command stops with an error; remove or rename that file before continuing."
        },
        { action: "In Process Monitor, pause capture with File > Capture Events, choose Edit > Clear Display, and open Filter > Filter. Add an Include filter whose Path equals the full path printed in step 1. Add a second Include filter whose Operation is CreateFile, then select OK.", why: "Filtering by the exact Path and Operation limits the display before the file is opened.", observe: "The filter list shows both Include rows and the cleared event display remains empty while capture is paused." },
        {
          action: "Resume Process Monitor capture, then run this complete PowerShell block to open the controlled target in Notepad. As soon as the Notepad text window appears, pause Process Monitor.",
          commands: [{ label: "PowerShell", code: "$tracePath = Join-Path $env:TEMP 'ILOVEOS_windows_layers.txt'\nif (-not (Test-Path -LiteralPath $tracePath)) { throw \"Controlled lab file is missing: $tracePath\" }\nStart-Process -FilePath notepad.exe -ArgumentList ('\"{0}\"' -f $tracePath)" }],
          why: "Starting capture before Notepad preserves the deliberate open while keeping the trace window short.",
          observe: "Notepad displays the controlled text. After capture is paused, Process Monitor shows one or more notepad.exe CreateFile rows for the exact target. If no row appears, capture was not running or one of the filters was not active before launch."
        },
        { action: "Open a successful CreateFile row for the exact target in Process Monitor and inspect Event and Stack. In Event, locate Desired Access, Disposition, Options, ShareMode, and Result; in Stack, locate user-mode frames above the first kernel frame and any filesystem or filter-driver frame shown.", why: "The event describes the request, while the stack exposes participating modules when symbols are available.", observe: "Event shows Result SUCCESS and the request fields. Stack shows resolved symbols, module names, or raw addresses; unresolved symbols remain an explicit tool limitation." },
        {
          action: "Close Notepad without saving, then run this PowerShell cleanup block for the exact path of the lab file.",
          commands: [{ label: "PowerShell", code: "$tracePath = Join-Path $env:TEMP 'ILOVEOS_windows_layers.txt'\nif (Test-Path -LiteralPath $tracePath) { Remove-Item -LiteralPath $tracePath }\nTest-Path -LiteralPath $tracePath" }],
          why: "The cleanup command removes only the file created for this lab.",
          observe: "PowerShell prints False. If it prints True, the file is still open or cleanup did not complete."
        }
      ],
      hints: [{ title: "No events are visible", body: "Check that capture was resumed, the path filter matches the normalized path Process Monitor reports, and the application actually reopened the file after capture began. Temporarily disable one filter to identify which one is too narrow." }],
      cleanup: ["Leave Process Monitor capture stopped and close Process Monitor if it is no longer needed.", "The final PowerShell block removes only ILOVEOS_windows_layers.txt under the current TEMP directory."]
    },
    checks: [
      ["Which component normally provides user-mode system-call transition stubs?", ["Ntdll.dll", "Explorer.exe", "services.exe", "WinObj.exe"], 0, "Ntdll exposes the Native API and contains the user-mode stubs that initiate system calls."],
      ["Which executive responsibility best matches virtual address-space policy?", ["Memory Manager", "Service Control Manager", "Window Manager", "Hardware clock"], 0, "The Memory Manager maintains virtual address spaces and physical-memory policy."],
      ["Why is the five-layer diagram not a literal path for every API call?", ["All calls enter the kernel directly", "Some calls finish in user mode and actual driver stacks vary", "Windows has no layers", "Process Monitor invents its stacks"], 1, "The model organizes responsibilities. An actual request may omit layers, take multiple internal paths, or travel through several drivers."]
    ]
  },

  "user-kernel-mode": {
    phases: {
      learn: ["Understand the boundary", "Separate processor execution modes from identity, elevation, and ordinary application permissions."],
      windows: ["Read the security context", "Connect user-mode requests to Windows validation, tokens, and observable state."],
      investigation: ["Compare two contexts", "Observe what elevation changes without confusing it with kernel-mode execution."],
      review: ["Check the boundary", "Test the controlled-entry and validation rules that protect the machine."]
    },
    learning: [
      {
        title: "Execution mode is a processor-enforced privilege boundary",
        paragraphs: [
          "A processor can restrict which instructions and memory regions currently executing code may use. Windows simplifies the x86 and x64 privilege model into user mode and kernel mode. Application code normally runs in user mode. It cannot execute privileged instructions, alter page tables, or directly dereference kernel memory. Kernel code and most device drivers can access protected system state.",
          "This boundary limits the consequences of mistakes. An invalid user-mode access normally faults the offending process. An invalid kernel-mode access can corrupt shared system state or stop the entire machine. Kernel mode is therefore not a faster version of user mode or a reward for trusted users. It is a level of execution privilege required by core operating-system and driver work."
        ]
      },
      {
        title: "Administrator, elevated, and kernel mode answer different questions",
        paragraphs: [
          "A user account and process token answer who the caller is and what access it may be granted. Integrity level and elevation affect security policy and access checks. Processor mode answers what the currently executing code may do at the hardware protection level. An elevated Python process still executes its Python and extension code in user mode.",
          "When that process calls an API requiring protected work, its thread enters kernel mode through a controlled transition. Kernel code evaluates the caller's token, arguments, object access, and other policy. Elevation may change the answer to an access check, but it does not let the Python instructions themselves rewrite kernel memory."
        ],
        callout: { label: "Common correction", text: "Admin is an identity and authorization concept. Kernel mode is an execution privilege concept. Do not use the terms interchangeably." }
      },
      {
        title: "System calls, exceptions, and interrupts are controlled entries",
        paragraphs: [
          "A system call begins synchronously because a running thread requests an operating-system service. The user-mode stub loads a service identifier and arguments, the processor transfers to a designated kernel entry point, and Windows validates user-supplied state before performing the work. The same thread later returns to user mode unless the operation blocks, fails, or changes its control flow.",
          "An exception is raised by instruction execution, such as an invalid opcode, breakpoint, or page fault. Some exceptions are expected and recoverable. A page fault can mean the virtual page is valid but not currently resident, so the Memory Manager resolves it and restarts the instruction. A hardware interrupt occurs asynchronously to the current instruction stream and lets a device or timer request attention. These entries have different causes even though all require controlled kernel handling."
        ]
      }
    ],
    visuals: [
      {
        type: "timeline",
        title: "One thread crosses the boundary and returns",
        intro: "The thread does not become a different process. Its execution mode changes while Windows performs privileged work.",
        items: [
          { meta: "User mode", label: "Prepare API request", detail: "Arguments live in the caller's address space", linkAfter: "system-call instruction" },
          { meta: "Kernel entry", label: "Validate caller state", detail: "Validate addresses and access, then copy or capture data", linkAfter: "dispatch service" },
          { meta: "Kernel mode", label: "Perform protected work", detail: "Use executive managers and drivers as required", linkAfter: "return status" },
          { meta: "User mode", label: "Resume caller", detail: "Wrapper returns a value or reports failure" }
        ],
        caption: "If the operation waits, the scheduler may run another ready thread before this thread returns to user mode."
      }
    ],
    workedExamples: [
      {
        type: "comparison",
        title: "Elevation changes access, not execution mode",
        prompt: "The same Python script attempts to open a protected process from a standard terminal and an elevated terminal.",
        columns: [
          {
            title: "Standard launch",
            rows: [
              ["Python code", "User mode"],
              ["Typical integrity", "Medium"],
              ["Token", "Standard user authorization context"],
              ["OpenProcess result", "May be denied for a protected target"]
            ]
          },
          {
            title: "Elevated launch",
            rows: [
              ["Python code", "User mode"],
              ["Typical integrity", "High"],
              ["Token", "Elevated groups and privilege state"],
              ["OpenProcess result", "May gain access, but target protection still applies"]
            ]
          }
        ],
        shared: "Both requests cross into kernel mode through a controlled system call. Windows evaluates the different caller tokens against the same requested access and target policy.",
        steps: [
          { title: "Run as a standard process", action: "The user-mode script calls OpenProcess with requested rights.", why: "The kernel must compare the caller token and target protection with the requested access.", result: "The call may fail with Access Denied." },
          { title: "Run an elevated copy", action: "The process running the same user-mode code now has a higher-integrity token and may hold additional enabled privileges.", why: "Elevation changes the inputs to authorization decisions, not the processor mode of application instructions.", result: "Some targets may now open, while protected targets can still reject the request." },
          { title: "Separate the conclusions", action: "Describe the code as running in user mode in both cases, but under different security contexts.", why: "Success does not prove that application code executed in kernel mode.", result: "Consider identity, token rights, target policy, and processor mode separately." }
        ],
        conclusion: "A successful privileged operation proves that kernel policy allowed a request. It does not prove that the application itself ran in kernel mode."
      }
    ],
    windowsLearning: [
      {
        title: "Windows must distrust pointers and lengths from user mode",
        paragraphs: [
          "A user-mode address is meaningful within the caller's process and can become invalid or change while a request is processed. Kernel interfaces therefore validate access, capture values, copy buffers at defined times, and handle faults. A driver that trusts an arbitrary user pointer can expose or overwrite system memory, turning one process's request into a system-wide vulnerability.",
          "DeviceIoControl demonstrates the boundary clearly. User code supplies a device handle, control code, buffers, and lengths. The I/O method encoded by the control code influences how Windows makes buffers available to the driver. Even if Windows performs some mapping or copying, the driver must verify that the sizes, ranges, states, and permissions make sense for the requested operation."
        ]
      },
      {
        title: "Observe security context without confusing it with mode",
        paragraphs: [
          "Process Explorer can display integrity level, user, virtualization state, and token details for user-mode processes. These are observable security attributes. It cannot show that an application permanently runs in kernel mode because ordinary application execution does not. Kernel stacks may appear when a thread is sampled during a system service or wait, but that is a moment in a controlled transition.",
          "For later debugging, remember that a user-mode crash usually produces a process-scoped exception, while a fatal kernel error may produce a bug check. Protected Process Light and virtualization-based security add further restrictions, but they build on rather than erase the basic boundary."
        ]
      }
    ],
    practice: {
      title: "Compare standard and elevated security contexts",
      time: "20 min",
      intro: "Observe that elevation changes token and integrity state while both Python processes remain ordinary user-mode applications.",
      expectedOutcome: "Both Python processes remain user-mode applications and normally use the same executable architecture. The ordinary process will usually have medium integrity, while the elevated process will usually have high integrity and different token group or privilege state. Their PIDs and parents will differ. Elevation changes authorization context, not the processor mode used by Python instructions.",
      safety: "Use only your own short-lived Python processes. Do not attempt to open, suspend, terminate, or modify protected system processes.",
      steps: [
        { action: "Open one ordinary PowerShell window. Then use Run as administrator from the taskbar or Windows Search to open a second PowerShell window.", why: "The two contexts create a controlled comparison of tokens and integrity levels.", observe: "After the consent prompt, the elevated window shows an administrator indicator in its title. Both windows remain interactive PowerShell sessions." },
        {
          action: "In the normal PowerShell window, run this complete command and leave it waiting at the Enter prompt.",
          commands: [{ label: "Normal PowerShell", code: "py -c \"import os, sys; print(f'Python executable: {sys.executable}'); print(f'PID: {os.getpid()}'); input('Standard process: press Enter after inspection...')\"" }],
          why: "Matching the exact executable path and PID prevents you from comparing an unrelated Python or IDE process.",
          observe: "The normal window prints its Python executable and the standard process's PID before waiting. If py is unavailable, stop and resolve that setup problem before continuing."
        },
        {
          action: "In the PowerShell window opened with Run as administrator, run this complete command and leave it waiting at the Enter prompt.",
          commands: [{ label: "Elevated PowerShell", code: "py -c \"import os, sys; print(f'Python executable: {sys.executable}'); print(f'PID: {os.getpid()}'); input('Elevated process: press Enter after inspection...')\"" }],
          why: "Running the same code in both windows makes the launch token the intended difference.",
          observe: "The elevated window prints its Python executable and a different elevated-process PID before waiting. If the PIDs are not both live and distinct, restart the missing command before continuing."
        },
        { action: "In Process Explorer choose View > Select Columns > Process Image and enable User Name, Integrity Level, UAC Virtualization, Image Type, Path, and Parent PID. Match the two PIDs printed in steps 2 and 3.", why: "The side-by-side rows separate security attributes from architecture, executable identity, and ancestry.", observe: "The PIDs and parents differ; the executable paths and image types normally match. Integrity Level normally differs between the standard and elevated rows." },
        { action: "For each printed PID, open Process Explorer Properties > Security and inspect Groups and Privileges.", why: "The Security tab exposes the token state behind the integrity-level difference.", observe: "When access permits, the two live PIDs show differences in their enabled groups or privileges. Access denial, a missing Security tab, and a PID that has exited are distinct limitations." },
        { action: "Press Enter once in each Python process and refresh Process Explorer.", why: "Both controlled processes should end without modifying any other process.", observe: "Both commands return to their PowerShell prompts and both matched PID rows disappear after refresh." }
      ],
      hints: [{ title: "Security details are unavailable", body: "Run Process Explorer elevated for fuller inspection, but keep the investigated processes unchanged. If policy still prevents the view, the Security page remains unavailable because access is limited." }],
      cleanup: ["If either Python process is still waiting, press Enter once in that window.", "Close the elevated terminal when finished to reduce accidental privileged actions."]
    },
    checks: [
      ["What changes when an application is elevated?", ["Its instructions permanently execute in kernel mode", "Its token and effective authorization context change", "Its CPU architecture changes", "System calls are disabled"], 1, "Elevation changes the security context, including its integrity level and privilege state. Application instructions remain in user mode."],
      ["Which event is caused synchronously by a thread requesting protected OS work?", ["A hardware interrupt", "A system call", "A power outage", "Another process's timer"], 1, "A system call is initiated by the currently running thread. Hardware interrupts arrive asynchronously."],
      ["Why must a kernel driver validate a user-supplied buffer?", ["User-mode addresses and lengths cannot be trusted", "Kernel mode has no memory access", "Python strings are always encrypted", "Validation changes the CPU architecture"], 0, "If trusted without validation, a malformed, stale, or malicious pointer and length could cause kernel-memory corruption or disclosure."]
    ]
  },

  "system-calls-win32": {
    phases: {
      learn: ["Separate the contracts", "Distinguish APIs, ABIs, wrappers, native services, and system-call transitions."],
      windows: ["Follow the API path", "Trace one operation through pywin32, the public Win32 contract, and native implementation layers."],
      investigation: ["Trace the boundary", "Separate the supported public contract from an observed implementation path."],
      review: ["Check the boundaries", "Test which behaviors are public contracts and which paths may change."]
    },
    learning: [
      {
        title: "API, ABI, and system call describe different contracts",
        paragraphs: [
          "An application programming interface, or API, describes callable operations and their behavior. The Win32 API includes file, process, service, security, networking, windowing, and many other functions documented for application developers. An application binary interface, or ABI, describes how compiled code represents parameters, return values, structures, calling conventions, and exported symbols at a binary boundary.",
          "A system call is a controlled request for a protected kernel service. It is one implementation mechanism beneath some APIs, not a synonym for the Win32 API. Windows may satisfy GetCurrentProcessId without doing the same kernel work required to read a file. CreateFileW may validate and transform arguments before eventually reaching a native service. One API can involve zero, one, or several system calls, and the internal mapping can change across Windows releases."
        ]
      },
      {
        title: "Program against the public contract, investigate the path separately",
        paragraphs: [
          "Microsoft documents Win32 behavior, accepted flags, required access, return values, and cleanup because those are the promises application code may depend on. Native API details and numeric system-service identifiers are mostly implementation details. Hard-coding an observed internal route makes code fragile and usually provides no benefit for ordinary application work.",
          "The internal route is still valuable when learning, debugging, analyzing performance, or understanding security boundaries. Process Monitor stacks and a debugger can reveal how a particular Windows build handled a call. Phrase that conclusion as an observation for that environment, not as a new public API guarantee."
        ],
        callout: { label: "Practical rule", text: "Use documented Win32 contracts to build. Use traces and native details to explain, diagnose, and learn." }
      },
      {
        title: "Bindings change the Python interface, not the Windows operation",
        paragraphs: [
          "pywin32 wraps selected Windows APIs and COM interfaces. It frequently converts Python strings to UTF-16, returns Python tuples or handle objects, and turns a failed native call into pywintypes.error. These conversions make ordinary code clearer, but they do not remove access rights, flags, handle lifetime, security requirements, or version constraints from the Windows contract.",
          "ctypes lets Python call exported C functions directly. You load the correct DLL, choose the Unicode export, define argtypes and restype, create any structures or buffers, call the function, check its documented failure value, capture any error immediately, and release owned resources. This is more work, so use it when pywin32 lacks the API or when the ABI itself is part of what you need to learn."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "The layers beneath one Python file-open request",
        intro: "Each boundary has a different contract and a different reason to exist.",
        items: [
          { meta: "Python binding", label: "win32file.CreateFile", detail: "Python objects, wrapper exceptions", linkAfter: "marshals to" },
          { meta: "Public Win32 API", label: "CreateFileW contract", detail: "UTF-16 path, access, sharing, disposition, flags", linkAfter: "may invoke" },
          { meta: "Native user layer", label: "Ntdll service stub", detail: "Native arguments and transition", linkAfter: "system call" },
          { meta: "Protected service", label: "Kernel I/O path", detail: "Objects, access checks, filesystem, drivers" }
        ],
        caption: "The wrapper and internal path may change, while the documented CreateFile behavior remains the application-facing contract."
      }
    ],
    workedExamples: [
      {
        type: "decision",
        title: "Choose between pywin32 and ctypes",
        prompt: "You need to call a Windows function from Python. Base the choice of binding on the requirements, not personal preference.",
        steps: [
          { title: "Define the outcome", action: "Write down which Windows state you need to read or change, including the required version and security context.", why: "A function name is not a complete requirement, and a safer higher-level alternative may exist.", result: "You now have a description of the task and its constraints to guide your search." },
          { title: "Check pywin32 coverage", action: "Search the local pywin32 guide by outcome, native function name, and likely module.", why: "A maintained wrapper usually reduces signature and error-handling mistakes.", result: "If a clear wrapper exists, it becomes the default candidate." },
          { title: "Read the native documentation", action: "Even when using pywin32, identify the parameters, required rights, return and failure values, resource lifetime, and version requirements.", why: "The wrapper still follows the Windows contract and may expose most of its flags directly.", result: "You understand the requirements for correct use, not merely the Python function name." },
          { title: "Use ctypes only with an explicit reason", action: "Define the exact signature and checks when coverage, callbacks, structures, or ABI study require direct access.", why: "ctypes cannot infer pointer levels, buffer ownership, or failure sentinels for you.", result: "The additional complexity is tied to a real need." }
        ],
        conclusion: "Choosing pywin32 first reduces avoidable risk. It does not mean that ctypes is inferior or that pywin32 covers every API."
      }
    ],
    windowsLearning: [
      {
        title: "CreateFileW shows why the whole contract matters",
        paragraphs: [
          "CreateFileW opens or creates a file or I/O device. The desired-access field says what operations the returned handle may request. Share flags say which kinds of access other opens may receive while this handle remains open. Creation disposition says whether the target must exist and whether existing content may be replaced. Flags describe attributes, caching behavior, asynchronous behavior, and other options.",
          "Success returns a handle. Failure returns INVALID_HANDLE_VALUE, not NULL, and sets the calling thread's last-error value. The handle must be closed with CloseHandle. If you remember only the path parameter, code may work in a friendly test and fail under concurrency, permissions, or a different creation state."
        ]
      },
      {
        title: "Error behavior differs at the binding boundary",
        paragraphs: [
          "A pywin32 wrapper normally detects native failure and raises pywintypes.error. The exception commonly provides a Windows error code, function name, and message. Handle it when you can add context, choose a documented fallback, or clean up. Do not catch every exception merely to print output that misleadingly resembles success.",
          "With ctypes, configure WinDLL with use_last_error=True when the API uses GetLastError. Test the exact documented sentinel immediately after the call and read ctypes.get_last_error before another Windows call overwrites thread-local error state. Some functions use NULL, zero, minus one, a status value, or a valid zero result, so there is no universal ctypes failure test."
        ]
      }
    ],
    codeWalkthroughs: [
      {
        title: "The same intent through pywin32 and ctypes",
        intro: "Both snippets ask Windows for the current process ID. The simple return value lets us compare the two interfaces before handles and buffers add complexity.",
        stages: [
          { title: "Use the pywin32 wrapper", explanation: "The wrapper exposes the operation directly and returns a Python int. No resource is acquired.", code: "import win32api\n\npid = win32api.GetCurrentProcessId()\nprint(pid, type(pid))" },
          { title: "Declare the ctypes boundary", explanation: "DWORD is an unsigned 32-bit result. The function takes no parameters, so argtypes is an empty list.", code: "import ctypes\nfrom ctypes import wintypes\n\nkernel32 = ctypes.WinDLL(\"kernel32\", use_last_error=True)\nkernel32.GetCurrentProcessId.argtypes = []\nkernel32.GetCurrentProcessId.restype = wintypes.DWORD" },
          { title: "Call and interpret", explanation: "The returned Python int represents a DWORD. Documentation says this function has no failure value and needs no cleanup.", code: "pid = kernel32.GetCurrentProcessId()\nprint(pid, type(pid))" }
        ]
      }
    ],
    practice: {
      title: "Separate contract from implementation",
      time: "25 min",
      download: ["downloads/file_open_trace_lab.py", "file_open_trace_lab.py"],
      intro: "Trace one harmless file open and distinguish the documented Win32 promise from the internal route observed on this Windows build.",
      expectedOutcome: "The CreateFileW documentation defines the stable behavior available to applications. A Process Monitor stack may show the Python runtime, C runtime or public Windows libraries, native transition code, kernel components, and file-system drivers. Exact frames vary with the Python version, Windows build, available symbols, filters, and implementation. The script first creates the file with write access, then opens and holds a separate read handle. This one captured path does not prove that every Win32 API maps to exactly one system call.",
      steps: [
        { action: "Use the complete CreateFileW contract for this trace. Pass the required UTF-16 path as lpFileName. Use GENERIC_READ access, FILE_SHARE_READ | FILE_SHARE_WRITE sharing, OPEN_EXISTING as the creation disposition, FILE_ATTRIBUTE_NORMAL, and a null lpSecurityAttributes because inheritance is not required. Failure returns INVALID_HANDLE_VALUE, after which you must call GetLastError immediately. Success returns an owned handle that you must release with CloseHandle.", why: "Reviewing these facts establishes the stable public contract before you inspect a machine-dependent trace.", observe: "You have identified the text encoding, access, sharing, existing-file rule, attributes, optional security pointer, failure value, error-reporting call, and matching cleanup operation." },
        {
          action: "Download file_open_trace_lab.py. Open PowerShell in the download folder, print the target path, and verify that the file does not yet exist. Do not start the script yet.",
          commands: [{ label: "PowerShell", code: "$tracePath = Join-Path $env:TEMP 'ILOVEOS_CreateFileW_contract.txt'\nif (Test-Path -LiteralPath $tracePath) { throw \"Remove or rename the existing lab file first: $tracePath\" }\n$tracePath" }],
          why: "The exact absent path is needed to configure capture before any create or open event occurs.",
          observe: "PowerShell prints the full path to ILOVEOS_CreateFileW_contract.txt. If the file already exists, remove or rename it before starting the capture."
        },
        { action: "In Process Monitor, pause capture with File > Capture Events and choose Filter > Filter. Add an Include filter for the full ILOVEOS_CreateFileW_contract.txt path and another Include filter for the CreateFile operation. Choose Edit > Clear Display, then resume capture with File > Capture Events. Do not start file_open_trace_lab.py until capture is active.", why: "Configuring and clearing the capture first preserves both the file-creation event and the later read-open event in their actual order.", observe: "Confirm that the display is empty, both Include filters are active, and capture is running." },
        {
          action: "With Process Monitor capture active, run this complete command and leave file_open_trace_lab.py waiting at the 'File handle is open' prompt.",
          commands: [{ label: "PowerShell", code: "$tracePath = Join-Path $env:TEMP 'ILOVEOS_CreateFileW_contract.txt'\nif (Test-Path -LiteralPath $tracePath) { throw \"Remove or rename the existing lab file first: $tracePath\" }\npy .\\file_open_trace_lab.py $tracePath --cleanup" }],
          why: "The script creates the absent file, then opens it separately for reading and keeps only that read handle open at the first pause.",
          observe: "file_open_trace_lab.py prints its executable, PID, exact path, 'created by this run: True,' and the 'File handle is open' prompt. If py is unavailable, pause Process Monitor and resolve that setup problem before continuing."
        },
        { action: "At the first pause, stop Process Monitor capture with File > Capture Events and add an Include filter for the printed PID. Inspect the successful CreateFile rows in time order, then open Stack for the final successful read-open event immediately before the pause.", why: "The event details distinguish the earlier create-and-write operation from the read handle that remains open.", observe: "The event for the open read handle has Result SUCCESS, Desired Access containing read or Generic Read, Disposition Open, and the exact PID and path. It appears after the earlier create-and-write event. Stack shows any available runtime, Windows, kernel, and file-system frames; unresolved symbols remain as raw module names or addresses." },
        { action: "Press Enter once in file_open_trace_lab.py to close the held read handle, then press Enter again at the second pause so --cleanup can finish.", why: "These two controlled actions close the open handle and remove only the file created by this run.", observe: "The program prints 'file handle closed,' followed by 'removed file created by this lab,' and then returns to PowerShell. The Process Monitor rows remain as historical evidence even though the handle and file no longer exist." }
      ],
      hints: [{ title: "The stack is shallow or missing symbols", body: "The exact stack is not required for the contract lesson. Confirm stack capture is enabled and use the frames that are available without guessing hidden ones." }],
      cleanup: ["If file_open_trace_lab.py is still paused, press Enter until it exits and performs its guarded --cleanup.", "Leave Process Monitor capture stopped and close Process Monitor if it is no longer needed."]
    },
    checks: [
      ["Which statement is correct?", ["Every Win32 call is one system call", "All Win32 APIs are wrapped by pywin32", "Native Microsoft documentation matters for pywin32 and ctypes", "ctypes infers every C signature"], 2, "The native contract defines behavior, rights, flags, lifetime, and errors for either binding."],
      ["Why should application code avoid hard-coded system-service numbers?", ["They are part of the stable Win32 contract", "They are implementation details that can change", "They are always Unicode strings", "They prevent any kernel transition"], 1, "The public API is the supported contract. Numeric service identifiers and exact internal routes can change between builds."],
      ["What indicates CreateFileW failure?", ["A NULL handle only", "INVALID_HANDLE_VALUE", "Any even handle", "An empty path returned by the function"], 1, "CreateFileW documents INVALID_HANDLE_VALUE as its failure sentinel and directs the caller to GetLastError."]
    ]
  },

  "reading-winapi-docs": {
    phases: {
      learn: ["Read the contract", "Follow the documentation in an order that keeps behavior, data flow, results, and resource lifetime connected."],
      windows: ["Build the contract card", "Turn the native page into a binding-neutral description you can use safely."],
      investigation: ["Annotate a real API", "Apply the reading method to unfamiliar primary documentation."],
      review: ["Check the contract", "Test your understanding of the documented behavior and ownership rules before choosing a Python binding."]
    },
    learning: [
      {
        title: "Read a WinAPI page as a contract, not a function-name dictionary",
        paragraphs: [
          "A Windows API page answers a sequence of questions. What outcome does the function provide? Which header lets C code compile the declaration, which DLL exports it at runtime, and which Windows versions support it? What does each parameter mean, which direction does data travel, what represents success, how is failure reported, and what resource must the caller eventually release?",
          "Reading only the first sentence and copying an example misses the conditions that make the example correct. The Remarks section often contains sharing rules, privilege requirements, race conditions, structure initialization, reserved values, and paired cleanup functions. Requirements tell you whether the call exists in the target environment. Treat all of these as part of the signature's meaning."
        ]
      },
      {
        title: "Parameter annotations describe data flow and optionality",
        paragraphs: [
          "An [in] parameter supplies data that the function reads. An [out] parameter points to storage the function fills. An [in, out] parameter starts with caller-provided state and returns modified state. Optional modifies a direction, such as [in, optional] or [out, optional]. It is not a complete direction by itself. SAL annotations can express buffer length relationships and nullability in more detail.",
          "A pointer does not automatically mean output. LPCWSTR is an input pointer to constant text. LPWSTR may point to a writable character buffer, but its actual direction comes from the parameter contract. A pointer-to-pointer can let a function return an allocated address or modify a caller-held pointer. ctypes must model every pointer level correctly, while pywin32 may replace an output buffer with a returned Python value."
        ],
        inlineCheck: ["Which annotation fully describes an optional output parameter?", ["[optional]", "[in]", "[out, optional]", "[in, out]"], 2, "Optional modifies a direction. The complete annotation must still state that data flows out of the function."]
      },
      {
        title: "Evaluate the return value and last-error result together",
        paragraphs: [
          "WinAPI functions are mostly C interfaces, so their documentation does not normally promise language exceptions. A function may return BOOL, a handle, a count, a pointer, a status code, or an enumeration sentinel. You must read that function's Return value section. Zero can mean failure for one function and a valid result for another. Some functions set the last-error value only on failure, while others require the caller to clear it first to distinguish a valid sentinel result from an error.",
          "GetLastError retrieves thread-local error state left by the most recent function that documented setting it. Call it immediately after detecting failure. Do not call it after success unless the API specifically instructs you to, and do not let logging or cleanup make another Windows call first. FormatMessage can translate many error codes, but the numeric code remains valuable for precise handling."
        ],
        callout: { label: "Do not generalize a sentinel", text: "WAIT_OBJECT_0, FALSE, NULL, INVALID_HANDLE_VALUE, WAIT_TIMEOUT, and nonzero status codes belong to different contracts. Identify and handle each documented outcome explicitly." }
      },
      {
        title: "Ownership is part of the return contract",
        paragraphs: [
          "A returned handle or pointer is incomplete information until you know who owns it and how long it remains valid. CreateFileW returns an owned handle closed with CloseHandle. GetCurrentProcess returns a pseudo handle that must not be closed. LocalAlloc memory is released with LocalFree. Some returned strings are borrowed and remain valid only while another object exists.",
          "Plan the cleanup at the same time as the acquisition. In Python, use try/finally or a context manager so exceptions do not skip the release. Never assume that one cleanup function works for all handles or pointers. The creating API's documentation defines the matching lifetime rule."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "A reliable reading order for any WinAPI function",
        intro: "Use this sequence before writing the call so that each detail remains connected to the complete contract.",
        items: [
          { meta: "Intent", label: "Purpose and requirements", detail: "Outcome, header, DLL, supported versions", linkAfter: "then map" },
          { meta: "Inputs and outputs", label: "Parameters and types", detail: "Direction, optionality, buffers, structures", linkAfter: "then branch" },
          { meta: "Control flow", label: "Success and failure", detail: "Return type, success and failure values, last error", linkAfter: "finally assign" },
          { meta: "Lifetime", label: "Ownership and cleanup", detail: "Borrowed or owned, matching release API" }
        ],
        caption: "After this pass, read Remarks and Security notes again in the context of the exact arguments you plan to use."
      }
    ],
    workedExamples: [
      {
        type: "contract",
        title: "Read CreateFileW before calling it",
        prompt: "You want to open an existing text file for read access without preventing another reader or writer.",
        steps: [
          { title: "Define the intended behavior", action: "Choose GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, OPEN_EXISTING, and ordinary attributes.", why: "The same function can create, truncate, lock, or open devices. The intended behavior determines which flags are safe.", result: "You now have a specific contract to map instead of a vague goal to open a file." },
          { title: "Map types and nullable pointers", action: "Treat lpFileName as input UTF-16 text and lpSecurityAttributes as an optional input pointer, using NULL when inheritance is not required.", why: "Pointer direction and nullability determine ctypes declarations and Python conversions.", result: "The ctypes declaration uses c_wchar_p for the path, and Python can pass None for the optional structure." },
          { title: "Handle both outcomes", action: "Test the handle against INVALID_HANDLE_VALUE and read the last-error value immediately when it matches.", why: "CreateFileW does not use NULL as its documented failure value.", result: "The code reports a precise Windows error instead of trying to use an invalid handle later." },
          { title: "Assign ownership", action: "After a successful acquisition, place CloseHandle in a finally block.", why: "Every exit path, including later exceptions, must release the process's handle-table reference.", result: "The call now has a complete resource lifecycle, not merely a successful beginning." }
        ],
        conclusion: "The correct call is defined by behavior, types, branching, and cleanup together."
      }
    ],
    windowsLearning: [
      {
        title: "Turn the page into a language-independent contract card",
        paragraphs: [
          "After reading, compress the page into a card you could hand to someone using any language. State the intended outcome, requirements, DLL, each parameter's direction and meaning, every documented result branch, the last-error rule, required access, and the matching release operation.",
          "Do not copy the declaration without interpretation. A useful card explains whether a size is measured in bytes or characters, whether a pointer may be null, who initializes a structure size field, whether a returned value is owned or borrowed, and which remarks constrain the arguments you intend to use."
        ]
      },
      {
        title: "Recognize what changes when a binding is introduced",
        paragraphs: [
          "A Python binding can convert the representation without changing the contract. It may accept str instead of LPCWSTR, return an output buffer as bytes, turn a HANDLE into a PyHANDLE, or raise an exception after detecting a native failure sentinel. Those are binding behaviors layered over the same Windows operation.",
          "Keep those layers separate in your notes. The native page tells you what Windows promises. The binding documentation tells you how Python supplies inputs, receives outputs, and reports native failures. The next lesson uses this contract to choose pywin32 or ctypes and construct the call safely."
        ]
      }
    ],
    practice: {
      title: "Follow the supplied CreateFileW contract",
      time: "15 min",
      intro: "Use the complete contract in this investigation to examine the purpose, parameters, result handling, and ownership without creating a separate worksheet.",
      caseStudy: {
        label: "API contract case study",
        title: "Opening an existing file with CreateFileW",
        summary: "Use this defined behavior and its parameter, result, and ownership rules throughout the investigation.",
        sections: [
          {
            title: "Goal",
            body: "Open an existing file for read access without preventing another reader or writer. The call must not create, overwrite, or truncate the target."
          },
          {
            title: "Call choices",
            facts: [
              ["Desired access", "GENERIC_READ"],
              ["Share mode", "FILE_SHARE_READ | FILE_SHARE_WRITE"],
              ["Creation disposition", "OPEN_EXISTING"],
              ["Flags and attributes", "FILE_ATTRIBUTE_NORMAL"]
            ]
          },
          {
            title: "Parameter directions",
            facts: [
              ["lpFileName", "Required input UTF-16 path (LPCWSTR)."],
              ["lpSecurityAttributes", "Nullable input pointer; use NULL or None when handle inheritance is not required."]
            ]
          },
          {
            title: "Result and error",
            facts: [
              ["Success", "A valid file handle."],
              ["Failure", "INVALID_HANDLE_VALUE"],
              ["Error detail", "Call GetLastError immediately after detecting the failure sentinel, before another Windows call can change the thread's error state."]
            ]
          },
          {
            title: "Ownership",
            body: "A successful return gives the caller an owned handle-table reference. Immediately after acquiring it, enter a try/finally block that calls CloseHandle so every later exit path releases the reference."
          }
        ]
      },
      expectedOutcome: "The CreateFileW case study defines the read access and sharing behavior, maps the UTF-16 path and optional security pointer, checks INVALID_HANDLE_VALUE, retrieves the last-error value only on failure, and calls CloseHandle from a finally block after successful acquisition.",
      steps: [
        { action: "Inspect the stated goal and call choices.", caseStudySections: ["Goal", "Call choices"], why: "The intended behavior determines the access, sharing, creation, and attribute flags.", observe: "The Goal and Call choices sections specify reading an existing file with GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, OPEN_EXISTING, and FILE_ATTRIBUTE_NORMAL." },
        { action: "Inspect the parameter directions.", caseStudySections: ["Parameter directions"], why: "Direction and nullability determine how a binding represents the path and optional structure.", observe: "The Parameter directions section identifies lpFileName as required UTF-16 input and lpSecurityAttributes as a nullable input pointer." },
        { action: "Inspect the documented success and failure outcomes.", caseStudySections: ["Result and error"], why: "The documented failure value determines when the Windows error state is meaningful.", observe: "The Result and error section checks INVALID_HANDLE_VALUE and calls GetLastError immediately only after that failure value." },
        { action: "Inspect the ownership rule.", caseStudySections: ["Ownership"], why: "A successful handle return is incomplete without its lifetime rule.", observe: "The Ownership section calls CloseHandle from a finally block after successful acquisition, so later exceptions do not skip the release." }
      ],
      checkpoints: [{ afterStep: 3, type: "short", prompt: "Complete the fixed CreateFileW failure value: INVALID_[____]_VALUE", answer: "HANDLE", acceptedAnswers: [], feedback: "The supplied case study checks INVALID_HANDLE_VALUE before retrieving last error." }],
      hints: [
        { title: "Why is no exception shown?", body: "The case study models the native C contract. A pywin32 exception is wrapper behavior layered over the native failure value." }
      ],
      cleanup: ["This on-page exercise creates no process, handle, file, or external note to clean up."]
    },
    checks: [
      ["Which section is not normally part of a C WinAPI function contract?", ["Parameter descriptions", "Return-value behavior", "Exceptions the C function throws", "Requirements and DLL"], 2, "C WinAPI functions normally report results through return values and error state. A Python wrapper may translate a failure into an exception."],
      ["Which annotation is incomplete because it does not specify a data-flow direction?", ["[out, optional]", "[optional]", "[out]", "[in, out]"], 1, "Optional modifies a direction; it does not say whether data enters or leaves the function."],
      ["What must be decided before code uses a returned handle?", ["Only its printed integer value", "Its ownership, permitted access, and matching cleanup rule", "Whether its name contains an uppercase letter", "Whether every handle uses RegCloseKey"], 1, "To use a handle correctly, you need to know its granted access and lifetime rules. The correct cleanup function depends on the API family."]
    ]
  },

  "calling-winapi-python": {
    phases: {
      learn: ["Choose the binding", "Start from the native contract, then choose the Python interface that expresses the task safely."],
      windows: ["Construct the call", "Translate types, success and failure outcomes, error state, and ownership into explicit Python code."],
      investigation: ["Compare both bindings", "Map one harmless operation through pywin32 and ctypes before deciding which version to run."],
      review: ["Check the call paths", "Test the binding, status, failure, and cleanup decisions together."]
    },
    learning: [
      {
        title: "The native contract comes before the binding",
        paragraphs: [
          "Begin with the contract card from the previous lesson. It defines the Windows operation, access requirements, native parameter meanings, possible results, error-detail rule, and resource lifetime. Only then compare the Python interfaces. This order prevents convenient wrapper syntax from hiding a right, failure value, or cleanup requirement.",
          "A binding may legitimately change representation. pywin32 can accept a Python str for LPCWSTR, allocate output storage, return several outputs as a tuple, and represent a native handle with PyHANDLE. ctypes stays closer to the C declaration. Neither binding may change what access Windows checks, what the operation does, or which resource lifetime Windows defines."
        ],
        callout: { label: "Apply the earlier example", text: "Earlier lessons used CreateFileW to explain abstraction, Windows layers, and API contracts. The question here is narrower: which Python binding should express that already-understood contract, and which safety requirements must the code still handle explicitly?" }
      },
      {
        title: "Prefer pywin32 when it communicates the task clearly",
        paragraphs: [
          "A suitable pywin32 wrapper usually removes repetitive foreign-function declarations while retaining the arguments that matter to the operation. It may also wrap an owned native handle in an object with a Close method and translate a documented native failure into pywintypes.error. Prefer pywin32 when it clearly covers the required behavior.",
          "Read the wrapper documentation for its Python signature, return shape, conversions, and exception behavior. Then keep the Microsoft contract beside it for flags, rights, sharing rules, security requirements, side effects, and lifetime. Catch pywintypes.error only where code can add context, choose a documented fallback, or restore state. Use the numeric winerror for stable branching, not the localized message text."
        ]
      },
      {
        title: "Use ctypes when the native boundary is part of the problem",
        paragraphs: [
          "ctypes is justified when pywin32 has no usable wrapper or when the task specifically requires an exact structure, union, callback, pointer level, calling convention, or export. Load the documented DLL with WinDLL, prefer the Unicode W export for text, declare argtypes in native order, and set restype before the first call. A missing restype can silently truncate pointer-sized results.",
          "Keep Python objects alive while native code can still reference their buffers, structures, or callbacks. Use wintypes only when its declaration matches the documentation, and define custom structures with the correct field order, alignment, and architecture-dependent widths. A call returning without crashing proves very little if the ABI declaration is wrong."
        ],
        inlineCheck: ["When is ctypes the stronger choice?", ["Whenever pywin32 already has a clear wrapper", "When an uncovered API or exact native ABI detail is required", "Whenever the function returns an integer", "Because ctypes automatically discovers every signature"], 1, "ctypes is valuable when the API is not covered or when you need to study the ABI itself. A clear pywin32 wrapper is normally safer and easier to read."]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "From Windows contract to safe Python call",
        intro: "Choosing a binding is one step in a larger process for constructing a correct call.",
        items: [
          { meta: "Outcome", label: "State the operation", detail: "Required behavior and target object", linkAfter: "read" },
          { meta: "Windows", label: "Define the native contract", detail: "Rights, parameters, results, ownership", linkAfter: "check coverage" },
          { meta: "Binding", label: "Prefer pywin32", detail: "Use the wrapper when its behavior is clear", linkAfter: "otherwise declare" },
          { meta: "ABI", label: "Use ctypes deliberately", detail: "DLL, argtypes, restype, structures", linkAfter: "complete" },
          { meta: "Control flow", label: "Handle and clean up", detail: "Documented results, error details, resource release" }
        ],
        caption: "Choosing ctypes does not replace the contract. It adds responsibility for representing that contract exactly."
      }
    ],
    workedExamples: [
      {
        type: "branch",
        title: "Handle wait results without treating them as Boolean values",
        prompt: "A thread waits up to five seconds for an event handle using win32event.WaitForSingleObject.",
        setupCode: "result = win32event.WaitForSingleObject(event, 5000)",
        branches: [
          { value: "WAIT_OBJECT_0", meaning: "The event became signaled before the timeout.", action: "Follow the branch for a signaled event. Do not test this value with bool(), because it is numerically zero." },
          { value: "WAIT_TIMEOUT", meaning: "Five seconds elapsed without the event becoming signaled.", action: "Follow the timeout branch. This is expected control flow: the event was not signaled, but the wait operation did not necessarily fail." },
          { value: "WAIT_ABANDONED", meaning: "This result applies to a mutex whose owning thread exited without releasing it.", action: "Treat the protected state as potentially inconsistent. Waiting for an event does not normally produce this result." },
          { value: "pywintypes.error", meaning: "The wrapper could not return a normal wait status because the underlying call failed.", action: "Use the Windows error code and function context, then clean up. Do not handle the exception as though the function returned a wait result." }
        ],
        conclusion: "A status value has meanings defined by its API. Compare it with the documented constants instead of assuming that zero means false and nonzero means true."
      }
    ],
    windowsLearning: [
      {
        title: "Handle pywin32 exceptions separately from returned status values",
        paragraphs: [
          "When a wrapper raises pywintypes.error, useful fields typically include winerror, funcname, and strerror. The exception says no ordinary wrapper result was produced. Add operation context, recover only from error codes the design expects, and allow unexpected failures to remain visible.",
          "Some wrappers successfully return a status that still requires a decision. Wait functions can return WAIT_OBJECT_0, WAIT_TIMEOUT, or WAIT_ABANDONED. Enumeration functions may use a value that marks the end. A partial read can return useful data and a state requiring another call. Handle each documented result explicitly instead of forcing every result through a Boolean success test."
        ]
      },
      {
        title: "Make ctypes failure detection match the exact declaration",
        paragraphs: [
          "For an API that uses the last-error value, construct WinDLL with use_last_error=True. Call the function, test its documented failure value, and immediately store ctypes.get_last_error before logging or cleanup invokes another Windows function. Raise ctypes.WinError(code) for an unexpected failure, or handle a known numeric code when the design has a valid recovery path.",
          "There is no universal ctypes failure test. FALSE, NULL, INVALID_HANDLE_VALUE, SOCKET_ERROR, HRESULT values, and valid zero results belong to different contracts. Define the check beside the restype. As soon as a resource is acquired, protect it with a try/finally block."
        ]
      }
    ],
    codeWalkthroughs: [
      {
        title: "Turn GetLastError into a precise ctypes exception",
        intro: "The important order is declare, call, test, capture, interpret, and clean up.",
        stages: [
          { title: "Load with last-error support", explanation: "use_last_error lets ctypes preserve Windows error state around foreign-function calls.", code: "import ctypes\nfrom ctypes import wintypes\n\nkernel32 = ctypes.WinDLL(\"kernel32\", use_last_error=True)" },
          { title: "Declare a failure-aware signature", explanation: "The actual API determines argtypes and restype. This small example uses CloseHandle, where zero means failure.", code: "kernel32.CloseHandle.argtypes = [wintypes.HANDLE]\nkernel32.CloseHandle.restype = wintypes.BOOL" },
          { title: "Test before any other Windows call", explanation: "Read last error only after the documented failure result. WinError formats the captured numeric code.", code: "ok = kernel32.CloseHandle(handle)\nif not ok:\n    code = ctypes.get_last_error()\n    raise ctypes.WinError(code)" }
        ]
      }
    ],
    practice: {
      title: "Handle each documented result",
      time: "15 min",
      intro: "Use the complete wait-result and ctypes failure contract in this investigation to distinguish returned status values from native-call failures.",
      caseStudy: {
        label: "Binding behavior case study",
        title: "Interpreting wait results and ctypes failures",
        summary: "Use these status, wrapper-failure, declaration, and error-capture rules throughout the investigation.",
        sections: [
          {
            title: "Wait results",
            facts: [
              ["WAIT_OBJECT_0", "The event became signaled. This valid status is numerically zero, so do not interpret it with a generic Boolean test."],
              ["WAIT_TIMEOUT", "Five seconds elapsed without the event becoming signaled. This is expected control flow and does not necessarily mean that the wait operation failed."]
            ]
          },
          {
            title: "Wrapper failure",
            facts: [
              ["pywintypes.error", "The wrapper returned no ordinary wait status. Preserve the Windows error code and function context before cleanup."]
            ]
          },
          {
            title: "ctypes declaration",
            code: "kernel32 = ctypes.WinDLL(\"kernel32\", use_last_error=True)\nkernel32.CloseHandle.argtypes = [wintypes.HANDLE]\nkernel32.CloseHandle.restype = wintypes.BOOL"
          },
          {
            title: "Immediate error capture",
            body: "For CloseHandle, zero means failure. Test that documented result and call ctypes.get_last_error() immediately, before logging or cleanup can overwrite the thread's error state. Raise ctypes.WinError(code) with the captured number.",
            code: "ok = kernel32.CloseHandle(handle)\nif not ok:\n    code = ctypes.get_last_error()\n    raise ctypes.WinError(code)"
          }
        ]
      },
      expectedOutcome: "WAIT_OBJECT_0 is a valid signaled result even though it is numerically zero, WAIT_TIMEOUT is expected control flow, and pywintypes.error means that no ordinary wait status was returned. The ctypes case study declares the signature, detects the documented failure value, captures the last-error value immediately, and then raises WinError.",
      steps: [
        { action: "Inspect the rules for signaled and timed-out waits.", caseStudySections: ["Wait results"], why: "Interpret each named status according to its documented meaning instead of using a generic Boolean test.", observe: "The Wait results section says WAIT_OBJECT_0 is a valid signaled result even though it is numerically zero, while WAIT_TIMEOUT is expected control flow after five seconds." },
        { action: "Compare the timeout status with the wrapper-failure case.", caseStudySections: ["Wait results", "Wrapper failure"], why: "An expected timeout status is different from a wrapper failure that returned no ordinary status.", observe: "WAIT_TIMEOUT is a returned status; pywintypes.error carries Windows failure context instead of a wait result." },
        { action: "Inspect the ctypes declaration that supports failure handling.", caseStudySections: ["ctypes declaration"], why: "ctypes must preserve the last-error value and define the ABI before the call.", observe: "The ctypes declaration uses WinDLL with use_last_error=True, sets CloseHandle.argtypes to HANDLE, and sets CloseHandle.restype to BOOL." },
        { action: "Inspect the rule for capturing an error immediately.", caseStudySections: ["Immediate error capture"], why: "Another Windows call could overwrite the thread-local error state.", observe: "The Immediate error capture section tests the documented zero failure, immediately calls ctypes.get_last_error(), and raises ctypes.WinError(code)." }
      ],
      checkpoints: [{ afterStep: 1, type: "choice", prompt: "Which fixed wait status means the event was signaled even though the value is numerically zero?", options: ["WAIT_OBJECT_0", "WAIT_TIMEOUT", "WAIT_ABANDONED"], answerIndex: 0, feedback: "WAIT_OBJECT_0 is the valid signaled result and must not be treated as false." }],
      hints: [
        { title: "Status or exception", body: "A returned named wait status is ordinary control flow. pywintypes.error means the wrapper did not return a normal status." }
      ],
      cleanup: ["This on-page exercise creates no process, handle, file, or generated code to clean up."]
    },
    checks: [
      ["Why is pywin32 normally preferred when a clear wrapper exists?", ["It changes Windows access rules", "It removes avoidable ABI declarations while keeping the operation readable", "It makes cleanup unnecessary", "It guarantees every call succeeds"], 1, "A clear wrapper reduces conversion and declaration work. The native behavior, errors, and lifetime still matter."],
      ["Why is if result: wrong for WAIT_OBJECT_0?", ["WAIT_OBJECT_0 is text", "WAIT_OBJECT_0 is numerically zero even though the object was signaled", "Wait functions never return", "Python cannot compare named constants"], 1, "The signaled result can be zero and therefore false in a Boolean context. Compare named status constants explicitly."],
      ["When should ctypes.get_last_error be read?", ["After any successful call", "Immediately after detecting a failure from an API documented to set last error", "Only after cleanup", "Before calling the API"], 1, "Capture the error immediately after the documented failure result, before another Windows call can replace the thread's error state."]
    ]
  },

  "inspect-windows": {
    phases: {
      learn: ["Build the investigation method", "Turn a precise question into a prediction, an evidence plan, and an appropriately scoped conclusion."],
      windows: ["Match tools to evidence", "Choose snapshots, traces, and internal probes according to the question."],
      investigation: ["Run a three-view investigation", "Correlate one harmless action using evidence from the script, a live snapshot, and a trace."],
      review: ["Check the evidence", "Test what each observation proves, suggests, and cannot establish."]
    },
    learning: [
      {
        title: "Begin with a question that has an observable answer",
        paragraphs: [
          "Inspection is not opening every Sysinternals tool and browsing until something looks unusual. Start with a question such as: which process opened this path, which handle keeps this file busy, what modules are mapped in this process, or which Registry value did the application query before failing? A precise question tells you which evidence source, time window, and filters you need.",
          "Write a prediction before capture. The prediction exposes your current model and gives the investigation something to update. Then define the smallest action that should produce the event. Record process identity, exact path, timestamp, operation, result, and relevant state. Finally, explain the evidence and name what it cannot establish. This cycle turns a tool view into reasoning."
        ]
      },
      {
        title: "Snapshots and traces answer different kinds of questions",
        paragraphs: [
          "A snapshot describes state at a particular point in time. Process Explorer shows the processes, threads, tokens, handles, mappings, and performance counters that still exist when it refreshes. WinObj shows the named Object Manager namespace at that moment. Autoruns shows configured persistence locations. A snapshot is strong for current ownership and relationships but can miss something short-lived.",
          "A trace records events over an interval. Process Monitor captures file, Registry, process, thread, image-load, and selected network activity with timestamps and results. A trace can show an open that failed and disappeared, or the exact query sequence before a configuration decision. It can also omit events that occurred before capture, bury relevant events in unrelated traffic, and show correlation without proving the application's higher-level intent."
        ],
        callout: { label: "Use both when possible", text: "The trace shows what happened. The snapshot shows what remains. Agreement between independent views produces a stronger conclusion." },
        inlineCheck: ["A file handle opened and closed before Process Explorer refreshed. Which evidence source is most likely to preserve the operation?", ["A Process Monitor trace captured during the action", "A later Process Explorer snapshot", "A desktop screenshot", "The file extension"], 0, "A trace records events over time. A later snapshot can only show handles that still exist when it observes the process."]
      },
      {
        title: "Filters are part of the experiment",
        paragraphs: [
          "A Process Monitor capture can contain millions of events. Filters should follow the question: exact PID when possible, normalized path, operation family, and a tight time window. Process name is convenient but can match several instances or a newly started process with the same name. PID is more precise during one capture, though PIDs can be reused after a process exits.",
          "Every filter can hide the answer. Record it. If the expected event is missing, broaden one constraint at a time rather than deleting all filters. Check whether capture was running before the action, whether the process delegated work to another process, whether the path was redirected, and whether elevation limited stack or process inspection. A missing event is meaningful only after capture coverage is understood."
        ]
      },
      {
        title: "Evidence is not interpretation",
        paragraphs: [
          "An event row saying NAME NOT FOUND is evidence that one lookup did not find that name at that time. It does not automatically mean the application failed, because probing several candidate paths can be expected behavior. ACCESS DENIED identifies a rejected request, but the event details and security context are needed before you know which access or policy mattered.",
          "Separate three kinds of statements in your notes: observations, interpretations, and limitations. For example, Procmon recorded PID 4120 opening a path with SUCCESS. This supports the interpretation that the process successfully opened that file during the capture. It does not prove which source-code function caused the request or whether the process later read any data. Stating precise limitations makes a conclusion more trustworthy, not weaker."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "The investigation loop",
        intro: "A useful investigation ends by updating the model that produced its original prediction.",
        items: [
          { meta: "Frame", label: "Ask and predict", detail: "Question, expected process, operation, result", linkAfter: "choose evidence" },
          { meta: "Design", label: "Instrument and filter", detail: "Tool, columns, capture window, exact identifiers", linkAfter: "perform once" },
          { meta: "Observe", label: "Collect and correlate", detail: "Events, snapshots, values, timestamps", linkAfter: "separate claims" },
          { meta: "Explain", label: "Interpret and state limitations", detail: "Mechanism, competing explanations, gaps in the evidence", linkAfter: "update" },
          { meta: "Retain", label: "Revise the model", detail: "What you would predict next time" }
        ],
        caption: "If the evidence is ambiguous, the next move is a narrower experiment, not a more confident story."
      }
    ],
    workedExamples: [
      {
        type: "trace",
        title: "Find which process opened a known file",
        prompt: "A controlled test application opens C:\\Lab\\sample.txt. Build a conclusion from trace and snapshot evidence.",
        steps: [
          { title: "Define identifiers", action: "Record the full path and exact PID of the test process before capture.", why: "Names alone can collide, and partial paths can match unrelated traffic.", result: "The expected process and target are unambiguous for this run." },
          { title: "Capture the smallest event window", action: "Filter on the path and PID, clear the display, start capture, open the file once, and stop capture.", why: "A controlled interval reduces noise and strengthens the chronological link between the action and the event.", result: "The trace should contain the open request and any immediate metadata operations or reads." },
          { title: "Interpret the operation and result", action: "Inspect CreateFile desired access, share mode, disposition, options, and result.", why: "The same path can be probed, created, read, deleted, or opened only for metadata.", result: "You can state exactly what access was requested and whether it was granted." },
          { title: "Correlate current ownership", action: "While the process keeps the file open, search its handles in Process Explorer.", why: "The snapshot tests whether a live handle remains after the trace event.", result: "The matching PID, object path, and handle lifetime corroborate one another." },
          { title: "Limit the conclusion", action: "State what the two views establish and what they do not.", why: "Tool data does not automatically reveal source-level intent or every later operation.", result: "The conclusion is supported by evidence and limited to what that evidence shows." }
        ],
        conclusion: "A trace and a live handle can identify which process opened the file and show that access remained active. By themselves, they cannot identify the exact source line or the program's reason for opening it."
      }
    ],
    windowsLearning: [
      {
        title: "Process Explorer connects process identity to current resources",
        paragraphs: [
          "Use the tree to understand ancestry, but verify the numeric PID and image path. When access permits, Properties shows the command line, environment, token, threads, TCP/IP endpoints, services, handles, and loaded DLLs. The lower pane can switch between handles and DLLs. Search can locate which visible process owns a named handle or mapped DLL.",
          "Colors and highlighting are aids, not verdicts. Signature verification can establish whether a file is signed by an expected publisher, but it does not prove the process is harmless. A strange parent can deserve explanation without proving compromise. For this course, Process Explorer is a way to connect abstractions to live state, not an automatic malware detector."
        ]
      },
      {
        title: "Process Monitor connects operations across time",
        paragraphs: [
          "A Procmon row includes time, process, PID, operation, path, result, and detail. Event properties add stack and process context when available. Use backing-file capture for longer investigations only when needed, and save the native PML when you need full fidelity. CSV export is useful for tables but does not preserve every interactive property.",
          "Operation names describe Process Monitor's normalized event categories, not necessarily the literal Win32 function the application called. CreateFile can represent create and open requests. Query operations may be exploratory. Stack frames can help bridge from an application module through user-mode libraries into kernel drivers, but symbols and access determine how informative the stack becomes."
        ]
      },
      {
        title: "WinObj connects handles to the namespace of named objects",
        paragraphs: [
          "The Object Manager namespace contains directories and named objects such as events, mutexes, sections, symbolic links, and device objects. Names like \\Device and \\BaseNamedObjects belong to this namespace, not the ordinary filesystem. WinObj lets you browse that structure and inspect object types and symbolic links.",
          "A process handle is a local numeric reference, while a named object can be discoverable through the global namespace. Many objects are unnamed and therefore absent when you browse that namespace. Use WinObj to understand naming and relationships, not to enumerate every kernel object or every handle held by every process."
        ]
      }
    ],
    practice: {
      title: "Investigate one file open with three views",
      time: "35 min",
      download: ["downloads/file_open_trace_lab.py", "file_open_trace_lab.py"],
      intro: "Combine a controlled Python action, a Process Monitor trace, and Process Explorer snapshots from before and after a handle closes.",
      expectedOutcome: "While the script is at its first pause, Process Monitor should retain the successful file-open event and Process Explorer should show a live handle to the same path in the matching PID. After the script closes the file, the handle should disappear from the Process Explorer snapshot while the earlier Process Monitor event remains in the trace. Exact PIDs, handle values, and timestamps will differ.",
      safety: "Use a temporary file in a directory you own. Do not capture passwords or unrelated private activity, and do not close handles from Process Explorer.",
      steps: [
        {
          action: "Download file_open_trace_lab.py. Open PowerShell in the download folder, print the target path, and verify that the file does not already exist.",
          commands: [{ label: "PowerShell", code: "$tracePath = Join-Path $env:TEMP 'ILOVEOS_three_view_file.txt'\nif (Test-Path -LiteralPath $tracePath) { throw \"Remove or rename the existing lab file first: $tracePath\" }\n$tracePath" }],
          why: "Starting with an absent path lets file_open_trace_lab.py create and clean up its own file without risking an existing one.",
          observe: "PowerShell prints the full target path. If the file already exists, remove or rename it before continuing."
        },
        { action: "In Process Monitor, pause capture with File > Capture Events and choose Edit > Clear Display. Under Filter > Filter, add an Include filter for the full target Path and another Include filter for the CreateFile Operation. Resume capture only after both filters are active.", why: "The exact path filter captures the first event before you know the new PID, while the Operation filter limits the trace to attempts to open the file.", observe: "Both Include rows are visible, the display is clear, and capture is active before file_open_trace_lab.py starts." },
        {
          action: "Run file_open_trace_lab.py from its PowerShell folder. When it reaches the 'File handle is open' prompt, leave the script waiting and pause Process Monitor.",
          commands: [{ label: "PowerShell", code: "$tracePath = Join-Path $env:TEMP 'ILOVEOS_three_view_file.txt'\nif (Test-Path -LiteralPath $tracePath) { throw \"Remove or rename the existing lab file first: $tracePath\" }\npy .\\file_open_trace_lab.py $tracePath --cleanup" }],
          why: "The trace records the request while the first pause keeps its resulting handle alive.",
          observe: "file_open_trace_lab.py prints its executable, PID, exact path, 'created by this run: True,' and 'File handle is open.' Process Monitor shows successful CreateFile activity for that exact path. If py fails to start, pause the capture and resolve the setup problem before continuing."
        },
        { action: "In Process Explorer, select the PID printed by file_open_trace_lab.py. Choose View > Show Lower Pane and then View > Lower Pane View > Handles. Search the lower pane for the exact target path.", why: "The snapshot independently confirms that the process currently retains access to the same file.", observe: "A File handle row shows the exact target path while the first pause is active. Access denial, an absent row, and a PID that has exited are distinct outcomes." },
        { action: "Press Enter once in file_open_trace_lab.py to close the handle, but leave the script waiting at the 'File handle is closed' prompt. Refresh Process Explorer without resuming Process Monitor capture.", why: "This controlled change distinguishes event history from current state.", observe: "The exact handle row disappears while the earlier Process Monitor CreateFile event remains. If the row remains, verify the exact PID and path before treating it as another live handle." },
        { action: "Press Enter again in file_open_trace_lab.py so --cleanup removes the lab file.", why: "This second action lets the script remove only the file it created.", observe: "The program prints 'removed file created by this lab' and returns to PowerShell. If it reports that the file was not created by this run, it leaves that pre-existing path untouched." }
      ],
      checkpoints: [{ afterStep: 5, type: "short", prompt: "Complete the tool name that retains the earlier event after the handle closes: Process [____]", answer: "Monitor", acceptedAnswers: ["Procmon"], feedback: "Process Monitor retains captured history while Process Explorer shows current handles." }],
      hints: [
        { title: "The handle is not visible", body: "Confirm file_open_trace_lab.py is still at the first pause, refresh Process Explorer, use the lower pane in Handles mode, and match the exact PID." },
        { title: "Process Monitor is too noisy", body: "Pause capture, clear the display, confirm the exact Path filter, resume only for the open, then pause again. Add PID after file_open_trace_lab.py prints it rather than filtering only by python.exe." }
      ],
      cleanup: ["Press Enter at the second file_open_trace_lab.py pause; --cleanup removes only the target created by this run.", "Stop Process Monitor capture.", "Keep or delete the downloaded file_open_trace_lab.py as you prefer."],
    },
    checks: [
      ["Which tool is best suited to determine which file operation failed several seconds ago?", ["A current Process Explorer handle snapshot", "A Process Monitor trace captured during the failure", "A desktop screenshot", "The CPU architecture label"], 1, "A trace taken over time preserves completed and failed operations that no longer have live state."],
      ["What can you conclude from a single Process Monitor NAME NOT FOUND event?", ["The application crashed", "One lookup did not find that name at that time", "The file never existed anywhere", "Malware deleted the path"], 1, "Many programs probe optional paths. Interpret the event alongside the surrounding sequence, process context, and later results."],
      ["Why use both Process Monitor and Process Explorer during the file lab?", ["They always show identical data", "One records the open event and the other tests whether a handle currently remains", "Process Explorer creates the file", "Process Monitor changes the handle rights"], 1, "Trace and snapshot evidence answer related questions about different points in time and can corroborate each other."]
    ]
  }
};
