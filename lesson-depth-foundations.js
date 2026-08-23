window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "cpu-architecture-data": {
    phases: {
      learn: ["Understand the machine", "Connect instructions, number systems, processor topology, and address width into one foundation."],
      windows: ["Decode Windows values", "Use Win32 types and Python's ABI to interpret the values Windows exposes."],
      investigation: ["Inspect the machine", "Compare the simplified architecture model with the system Windows reports."],
      review: ["Check the foundations", "Test the calculations and distinctions that later lessons rely on."]
    },
    learning: [
      {
        title: "A computer changes state by executing instructions",
        paragraphs: [
          "At the lowest useful level, a processor repeatedly fetches an instruction, decodes what it means, and performs it. An instruction may add two values, compare them, copy bytes, or change which instruction runs next. The values closest to the execution units live in registers. Registers are tiny compared with RAM, but they are where a running thread keeps immediate operands, addresses, flags, and its next instruction position.",
          "RAM holds far more code and data, but the processor does not treat it as one equally fast bucket. Caches retain recently used blocks near each core. If the required bytes are not in a nearby cache, the core waits longer while the memory hierarchy supplies them. Storage sits further away and preserves data after power is removed. This register, cache, RAM, storage model explains why later lessons distinguish CPU time, memory residence, and file I/O."
        ],
        callout: { label: "Keep the nouns separate", text: "A program is passive code. A process is a protected running container. A thread is the execution state a processor can schedule. A core is hardware that can run a thread." }
      },
      {
        title: "Binary stores the state, hexadecimal makes it readable",
        paragraphs: [
          "A bit has two possible states, conventionally written 0 and 1. Eight bits form a byte. Decimal is convenient for quantities people discuss, while binary exposes the individual bit positions computers use. Hexadecimal is a compact bridge between them because one hexadecimal digit represents exactly four bits. The digits 0 through 9 are followed by A through F, representing decimal 10 through 15.",
          "Windows tools display addresses, flags, access masks, and file structures in hexadecimal because the boundaries stay visible. For example, 0x3A is two hexadecimal digits, so it maps directly to 0011 1010 in binary. A flag value such as 0x12 can be understood as multiple set bit positions rather than the decimal number 18. The notation does not change the stored value, only how we write it."
        ]
      },
      {
        title: "Packages, cores, and logical processors describe different layers",
        paragraphs: [
          "A CPU package is the physical chip installed in a socket. A package may contain several physical cores, and a core may expose more than one logical processor through simultaneous multithreading. Windows schedules threads onto logical processors. Saying that two packages with four cores each provide eight physical cores is a useful counting exercise, but saying they can execute exactly eight instructions at once is only a classroom simplification.",
          "Modern cores pipeline many instructions, issue more than one operation in a cycle, wait on dependencies, and reorder work while preserving the program's visible behavior. Multiple runnable threads also compete for shared caches and memory bandwidth. For operating-system work, the practical rule is that logical processors are scheduling targets, while actual throughput depends on the workload and microarchitecture."
        ],
        inlineCheck: ["A machine has two CPU packages, four physical cores per package, and two logical processors per core. How many logical processors can Windows schedule onto?", ["4", "8", "16", "32"], 2, "Two packages times four cores times two logical processors gives sixteen scheduling targets. This does not mean exactly sixteen instructions complete at every instant."]
      },
      {
        title: "Address width limits the names a process can give memory locations",
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
          { title: "Interpret, do not just convert", action: "Ask whether 0x3A is a count, address fragment, character code, or flags in its actual context.", why: "The bits alone do not tell you their meaning. The API or data structure supplies the type and semantics.", result: "You know the value, but you still need its contract." }
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
          { title: "Convert units carefully", action: "Divide by 1024 three times to convert bytes to GiB.", why: "GiB uses powers of two, matching the address calculation.", result: "Exactly 4 GiB of address range." },
          { title: "State the limitation", action: "Separate theoretical range from usable process space.", why: "Mappings, reserved regions, and OS policy occupy parts of the range.", result: "A process does not automatically receive 4 GiB of usable private memory." }
        ],
        conclusion: "Address width determines how many locations can be named. It does not by itself determine installed RAM or usable memory."
      }
    ],
    windowsLearning: [
      {
        title: "Read Win32 type names as clues",
        paragraphs: [
          "Windows type aliases carry intent. BYTE and WORD are fixed-width unsigned quantities. DWORD is a 32-bit unsigned value even on 64-bit Windows. BOOL is a 32-bit Boolean convention, not Python's one-byte bool. HANDLE is an opaque value used to refer to an object through a process handle table. LPVOID is a pointer without a more specific pointed-to type.",
          "Text types add another layer. WCHAR is a UTF-16 code unit, LPCWSTR is a pointer to constant wide text, and LPCTSTR follows the build's TCHAR choice. Modern Python code that calls Windows directly should normally choose the explicit wide, W-suffixed API and corresponding wide-character types. Pointer-sized aliases such as ULONG_PTR change with the caller's architecture."
        ],
        bullets: ["Fixed-width does not mean pointer-sized", "A pointer type is not numeric merely because its address is stored as bits", "Opaque handles must be used and closed according to their API contract"]
      }
    ],
    codeWalkthroughs: [
      {
        title: "Ask Python what architecture its pointers use",
        intro: "This short check establishes the ABI of the Python process that will make ctypes calls.",
        stages: [
          { title: "Import the type system", explanation: "ctypes models C values and pointers. platform gives a readable architecture label, but pointer size is the decisive ABI observation.", code: "import ctypes\nimport platform" },
          { title: "Measure, then convert to bits", explanation: "sizeof returns bytes. Multiplying by eight gives the familiar 32-bit or 64-bit pointer width.", code: "pointer_bytes = ctypes.sizeof(ctypes.c_void_p)\npointer_bits = pointer_bytes * 8" },
          { title: "Report both views", explanation: "If the values disagree with your expectation, check which Python executable you launched before defining any native structures.", code: "print(f\"Python label: {platform.architecture()[0]}\")\nprint(f\"Pointer width: {pointer_bits} bits\")" }
        ]
      }
    ],
    practice: {
      title: "Decode what Windows shows you",
      time: "20 min",
      intro: "Connect architecture, notation, and pointer width to a live process before later memory and PE lessons depend on them.",
      expectedOutcome: "Your Python process will normally report a pointer size of either 4 bytes for 32-bit Python or 8 bytes for 64-bit Python. Process Explorer will show addresses in hexadecimal and identify the process image type. The final two hexadecimal digits should convert cleanly into two groups of four binary bits. Exact addresses will differ each time, but pointer width must follow the Python process architecture.",
      predictionPrompt: "Predict the pointer size of your Python process and the form in which Process Explorer will display a start address. Explain how you could be wrong.",
      steps: [
        {
          action: "In PowerShell, which can run from any folder, paste this command to print the Python executable, architecture label, pointer bytes, and pointer bits.",
          commands: [{
            label: "PowerShell",
            code: "py -c \"import ctypes, platform, sys; pointer_bytes = ctypes.sizeof(ctypes.c_void_p); print(f'Python executable: {sys.executable}'); print(f'Architecture label: {platform.architecture()[0]}'); print(f'Pointer bytes: {pointer_bytes}'); print(f'Pointer bits: {pointer_bytes * 8}')\""
          }],
          why: "The calling process architecture controls pointer width, even when the installed Windows system is 64-bit.",
          observe: "If PowerShell reports that py is not recognized, record that the Python launcher is missing or unavailable. Otherwise, record the Python executable path, architecture label, pointer bytes, and pointer bits as the architecture result."
        },
        { action: "Open Process Explorer and add the Image Type and Start Address columns.", why: "Image Type distinguishes process architecture, while Start Address provides a real hexadecimal value to decode.", observe: "Record the image type and one start address for your Python process.", hint: "Right-click a column header, choose Select Columns, then inspect the Process Image and Process Performance tabs." },
        { action: "Convert the final two hexadecimal digits of the address to binary and decimal.", why: "Working on a small fragment practices the conversion without pretending that an address is merely a human-sized count.", observe: "Show the two four-bit groups and your place-value calculation." },
        { action: "Compare one 32-bit process with one 64-bit process if both are available.", why: "The comparison makes process architecture, not operating-system branding, the relevant pointer-size concept.", observe: "Record which process is 32-bit and which is 64-bit. If no 32-bit process exists, state that instead of inventing one." },
        { action: "Write a five-part distinction: package, physical core, logical processor, process, and thread.", why: "Later scheduling lessons fail if hardware execution resources and software execution state are mixed together.", observe: "Give each noun one sentence and connect a scheduled thread to a logical processor." }
      ],
      fields: [
        { id: "conversion", label: "Conversion working", prompt: "Show the hexadecimal, binary, and decimal forms, including place values." },
        { id: "model", label: "Architecture model", prompt: "Explain what pointer size tells you, and what it does not tell you about installed RAM, address-space use, or CPU throughput." }
      ],
      hints: [{ title: "Image Type is missing", body: "Use Select Columns in Process Explorer. You can also inspect the process Properties window and the executable path. Do not use Task Manager's operating-system architecture as a substitute for the Python process architecture." }],
      cleanup: ["Close Process Explorer if you do not need it for the next lesson.", "Keep the small Python file only if you want it as an architecture diagnostic."],
      extension: { title: "Optional extension", prompt: "Print ctypes.sizeof for c_byte, c_ushort, c_uint32, c_uint64, c_void_p, and wintypes.BOOL. Explain which sizes are fixed and which follow the process ABI." }
    },
    checks: [
      ["Which item is not a numeric Win32 type?", ["BOOL", "CHAR", "UINT", "LPCTSTR"], 3, "LPCTSTR is a pointer to constant TCHAR text. Its address is represented with bits, but the declared meaning is a string pointer."],
      ["What does a 32-bit byte-address calculation establish?", ["Exactly 4 GiB of installed RAM", "2^32 distinct byte addresses", "Four CPU cores", "A 4 GiB file-size limit in every API"], 1, "Thirty-two bits encode 2^32 distinct values. Installed memory and usable process regions are separate questions."],
      ["What does Windows normally schedule onto a logical processor?", ["A file", "A process container", "A runnable thread", "A DLL export"], 2, "A thread carries the instruction pointer, registers, stack, and scheduling state that a logical processor can execute."]
    ]
  },

  "why-operating-system": {
    phases: {
      learn: ["See the problem", "Start from raw hardware and identify the abstractions and resource decisions an OS must provide."],
      windows: ["Find the abstractions", "Connect the model to Windows objects, APIs, and observable process state."],
      investigation: ["Trace one request", "Follow a controlled action from Python into the Windows abstractions that serve it."],
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
          "Protection makes sharing sustainable. Each process receives a separate virtual address space, objects are accessed through checked handles, and security tokens are compared with access-control rules. A program can still crash or misuse resources it legitimately owns, but it cannot ordinarily rewrite arbitrary kernel memory or another process simply because it knows an address."
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
          { meta: "Manager and interface", label: "Operating system", detail: "Checks access, selects objects, schedules I/O", linkAfter: "controls" },
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
          { title: "Express intent", action: "The editor supplies a path, requested access, sharing rules, and opening behavior to a file API.", why: "The editor describes the outcome without addressing disk sectors.", result: "A structured request enters the Windows API." },
          { title: "Resolve and validate", action: "Windows resolves the path, finds the relevant filesystem and object, then evaluates security and sharing rules.", why: "Names, permissions, and concurrent access are shared system policy.", result: "The request is either rejected with an error or allowed to continue." },
          { title: "Perform or queue I/O", action: "The I/O system and drivers obtain the required data, possibly from cache and possibly from a device.", why: "Only the OS and trusted drivers should coordinate device access and completion.", result: "The requesting thread may wait while another ready thread runs." },
          { title: "Return an abstraction", action: "Windows returns a handle representing the caller's granted access to the opened object.", why: "Later operations can refer to checked state without repeating the entire open request.", result: "The editor reads through the handle and must eventually close it." }
        ],
        conclusion: "One ordinary file open demonstrates abstraction, resource management, protection, scheduling, and lifetime ownership."
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
        title: "pywin32 is a view into the operating system, not a replacement for it",
        paragraphs: [
          "pywin32 maps many Windows operations into Python-friendly calls. A function such as GetCurrentProcessId reveals identity assigned by the OS, while GetUserName reports security context. The wrapper may convert a native structure or raise pywintypes.error, but the underlying Windows contract still defines what is being requested.",
          "ctypes works closer to the C boundary and can call exported functions that pywin32 does not cover. That flexibility transfers responsibility to your code: declare types, preserve errors, allocate buffers, and release resources correctly. Later lessons choose pywin32 first and use ctypes when the lower-level details teach something or fill a real coverage gap."
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
      intro: "Run a small pywin32 program, then connect its Python-level output to the operating-system objects and resources around it.",
      expectedOutcome: "The script will print a PID and user that match the same process in Process Explorer. Process Explorer should also reveal a parent process, token details, one or more threads, handles, and loaded modules that were not written directly into the script. When you let the process exit, its row and current resources disappear, although Windows may reuse the numeric PID later.",
      predictionPrompt: "Before running the starter, predict its parent process, user, integrity level, and whether it will have more than one thread. State why.",
      steps: [
        { action: "Open Process Explorer and enable Process ID, Parent PID, User Name, Integrity Level, Image Type, and Threads.", why: "These columns connect identity, security, architecture, and scheduling without opening several unrelated tools.", observe: "Record which columns you enabled and any permission limitation Process Explorer reports." },
        { action: "Download and run who_am_i.py from the terminal you normally use.", why: "Launching from a known parent lets you test process ancestry rather than merely reading a PID.", observe: "Record the printed PID and user, then locate exactly that PID in Process Explorer." },
        { action: "Open the process Properties window and inspect Image, Performance, Threads, Security, Handles, and DLLs.", why: "The script is small, but Windows still surrounds it with an address space, token, threads, handles, and loaded code.", observe: "Choose one concrete observation from each available view. If a tab is unavailable, record the limitation." },
        { action: "Classify each observation as program data, an OS abstraction, an OS-managed resource, or evidence about execution.", why: "Classification forces you to explain why the operating system owns or mediates the state.", observe: "Create at least five classifications, including PID, token, thread, handle, and one loaded module." },
        { action: "Press Enter to let the process exit, then refresh Process Explorer.", why: "Process termination shows that identity and resources have a managed lifetime.", observe: "Record what disappears and explain why a later process could eventually reuse the same numeric PID." }
      ],
      fields: [
        { id: "classification", label: "Object and resource classification", prompt: "List each observation, its category, and why Windows must manage it." },
        { id: "explanation", label: "Explain the boundary", prompt: "Using intent, interface, policy, and mechanism, explain one thing the script asked Windows to do." }
      ],
      hints: [{ title: "The process exits too quickly", body: "The provided starter waits for Enter. If you changed it, add input() after printing. Match the numeric PID rather than relying only on the python.exe name." }],
      cleanup: ["Press Enter in the starter process so it exits normally.", "Close Process Explorer, or leave it open only if continuing to the next lesson."],
      extension: { title: "Optional extension", prompt: "Launch the script once from PowerShell and once from an IDE. Compare parent processes and inherited environment without assuming one launch method is more correct." }
    },
    checks: [
      ["Why can Windows run another thread while a music player waits for storage?", ["The first process lost its memory", "The waiting thread is not ready to use the processor", "Every I/O request terminates its thread", "The file became a process"], 1, "A thread waiting for I/O is not runnable. The scheduler can dispatch another ready thread and use the processor productively."],
      ["Which statement best describes an operating-system abstraction?", ["It removes every hardware performance difference", "It gives programs a stable contract over changing mechanisms", "It lets applications bypass access checks", "It is only a graphical interface"], 1, "An abstraction provides a stable behavior and vocabulary. Hardware details can still matter, but every program does not reimplement the mechanism."],
      ["What is a Windows handle in this model?", ["The kernel object itself", "A process-local reference with granted access", "A physical RAM address", "A CPU instruction"], 1, "A handle indexes process-managed state that refers to an object and records access. It must be used and closed according to the owning API."]
    ]
  },

  "windows-organisation": {
    phases: {
      learn: ["Map Windows", "Build a practical layered model without treating Windows as one opaque block."],
      windows: ["Connect layers to tools", "Use different evidence sources for different parts of the architecture."],
      investigation: ["Trace a request through Windows", "Follow one controlled file operation across the layers that participate."],
      review: ["Check the architecture", "Test which components own stable contracts and which remain implementation detail."]
    },
    learning: [
      {
        title: "Windows is a set of cooperating layers, not one opaque block",
        paragraphs: [
          "A useful Windows map begins with a boundary: application and service processes run in user mode, while the executive, kernel, and most drivers run in kernel mode. User-mode processes have separate virtual address spaces. Kernel-mode components share privileged system space and can affect the entire machine, which is why their interfaces and input validation matter so much.",
          "Applications normally enter through subsystem and API DLLs such as Kernel32, Advapi32, User32, Gdi32, and Ws2_32. These names group programming contracts, not complete operating-system subsystems. Modern implementations frequently forward exports to other DLLs. Ntdll provides the lowest ordinary user-mode layer, including the Native API, loader support, runtime functions, and system-call transition stubs."
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
          "These are roles, not a list to memorize as fixed parent-child positions. Windows versions, service isolation settings, sessions, and security features change the exact tree. Learn to use signed image path, parentage, user, command line, services, and observed behavior together. A familiar filename alone is weak evidence."
        ]
      }
    ],
    visuals: [
      {
        type: "layers",
        title: "A practical map of Windows",
        intro: "Read from the application request down toward hardware, then remember that results and events travel back upward.",
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
          { title: "Enter the public contract", action: "The application calls CreateFileW with a UTF-16 path, desired access, sharing rules, creation disposition, and flags.", why: "The documented Win32 API defines what application code may rely on.", result: "Kernel32 or its implementation forwards and prepares the request." },
          { title: "Reach the native boundary", action: "User-mode code ultimately invokes a Native API service through Ntdll when protected file state is needed.", why: "Ordinary application code cannot directly manipulate kernel objects or filesystem driver state.", result: "The calling thread transitions into kernel mode." },
          { title: "Resolve object and I/O policy", action: "The Object Manager, I/O Manager, security logic, filesystem, and driver stack participate as required.", why: "Names, permissions, sharing, caching, and device access belong to different cooperating responsibilities.", result: "Windows rejects the request or creates an open file object and the necessary references." },
          { title: "Return process-local access", action: "A handle value is returned to the caller and entered in its handle table.", why: "The caller needs a checked reference for later ReadFile and CloseHandle operations.", result: "The process owns a handle, not the underlying storage device or kernel memory." }
        ],
        conclusion: "A simple API call can cross several responsibilities. The stable contract matters more than an undocumented internal function sequence."
      }
    ],
    windowsLearning: [
      {
        title: "Use three tools to view three different kinds of structure",
        paragraphs: [
          "Process Explorer begins with processes. Its tree, Properties tabs, lower pane, and verified signatures help you connect a process to its parent, token, services, threads, handles, and mapped images. It is mainly a current-state view. A process that already exited or a handle that already closed may be absent when you look.",
          "Process Monitor records events over time. File, Registry, process, thread, network, and image-load events can reveal the path a request followed and the result it received. WinObj presents the Object Manager namespace, showing directories and named objects that do not correspond directly to filesystem paths. Together, these tools show execution containers, event history, and the named object world."
        ]
      }
    ],
    practice: {
      title: "Trace one file request through Windows",
      time: "25 min",
      intro: "Use Process Monitor evidence to turn the layer diagram into an observed request path.",
      expectedOutcome: "Process Monitor should capture one or more file operations from the chosen editor against the exact test path. A successful open will show a success result and request details. The event stack may begin with application and user-mode DLL frames, then cross into kernel and filesystem or filter-driver frames. The precise modules vary by Windows build and installed software.",
      predictionPrompt: "Predict which process, operation name, path, result, user-mode DLLs, and kernel drivers you expect when Notepad opens a harmless text file.",
      steps: [
        { action: "Create or choose a harmless text file, then start Process Monitor and pause capture.", why: "A controlled target and a paused initial capture reduce unrelated events before filters are ready.", observe: "Record the test file's full path and the Process Monitor elevation state." },
        { action: "Clear existing events and filter Path is your exact file path, then add a Process Name filter for the chosen editor.", why: "Path plus process identity is stronger than searching a large trace after the event.", observe: "Record the exact filters and whether each is Include or Exclude.", hint: "Use Filter, Filter. Confirm that the status bar shows active filters before capture." },
        { action: "Resume capture, open the file once, then pause capture immediately.", why: "Capturing a single deliberate action makes sequence and causality easier to reason about.", observe: "Record the first relevant operation, its result, and the count of visible events." },
        { action: "Open the main successful create or open event and inspect Event and Stack.", why: "The event describes the contract-level request, while the stack can expose participating user-mode modules and drivers.", observe: "List the user-mode API-side modules, the point at which kernel components appear, and at least one filesystem or filter driver if shown." },
        { action: "Draw the request using the lesson's five layers and attach each observation to one layer.", why: "A trace is only useful when its details update a mental model.", observe: "State which boxes have direct evidence and which remain a reasoned simplification." }
      ],
      fields: [
        { id: "trace", label: "Observed request trace", prompt: "Write the operations in time order with process, path, result, and important stack components." },
        { id: "boundaries", label: "Layer analysis", prompt: "Map the evidence to application, Win32 or Ntdll, executive or kernel, drivers, and hardware. Mark anything the trace cannot prove." }
      ],
      hints: [{ title: "No events are visible", body: "Check that capture was resumed, the path filter matches the normalized path Process Monitor reports, and the application actually reopened the file after capture began. Temporarily disable one filter to identify which one is too narrow." }],
      cleanup: ["Stop Process Monitor capture and save the PML only if you want it for later review.", "Close the test file and delete it only if you created it solely for this investigation."],
      extension: { title: "Optional extension", prompt: "Use Process Explorer's lower pane to find the open file handle while the editor keeps it open. Explain why this snapshot complements but cannot replace the Process Monitor trace." }
    },
    checks: [
      ["Which component normally provides user-mode system-call transition stubs?", ["Ntdll.dll", "Explorer.exe", "services.exe", "WinObj.exe"], 0, "Ntdll exposes the Native API and contains user-mode stubs that transfer control for system services."],
      ["Which executive responsibility best matches virtual address-space policy?", ["Memory Manager", "Service Control Manager", "Window Manager", "Hardware clock"], 0, "The Memory Manager maintains virtual address spaces and physical-memory policy."],
      ["Why is the five-layer diagram not a literal path for every API call?", ["All calls enter the kernel directly", "Some calls finish in user mode and actual driver stacks vary", "Windows has no layers", "Process Monitor invents its stacks"], 1, "The model organizes responsibilities. An actual request may omit layers, take multiple internal paths, or travel through several drivers."]
    ]
  },

  "user-kernel-mode": {
    phases: {
      learn: ["Understand the boundary", "Separate processor execution modes from identity, elevation, and ordinary application privilege."],
      windows: ["Read the security context", "Connect user-mode requests to Windows validation, tokens, and observable state."],
      investigation: ["Compare two contexts", "Observe what elevation changes without confusing it with kernel-mode execution."],
      review: ["Check the boundary", "Test the controlled-entry and validation rules that protect the machine."]
    },
    learning: [
      {
        title: "Execution mode is a processor-enforced privilege boundary",
        paragraphs: [
          "A processor can restrict which instructions and memory regions currently executing code may use. Windows simplifies the x86 and x64 privilege model into user mode and kernel mode. Application code normally runs in user mode. It cannot execute privileged instructions, alter page tables, or directly dereference kernel memory. Kernel code and most device drivers can access protected system state.",
          "This boundary limits the blast radius of mistakes. An invalid user-mode access normally faults the offending process. An invalid kernel-mode access can corrupt shared system state or stop the entire machine. Kernel mode is therefore not a faster version of user mode or a reward for trusted users. It is a level of execution privilege required by core operating-system and driver work."
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
          "A system call begins synchronously because a running thread requests an operating-system service. The user-mode stub arranges a service identifier and arguments, the processor transfers to a designated kernel entry point, and Windows validates user-supplied state before performing work. The same thread later returns to user mode unless the operation blocks, fails, or changes its control flow.",
          "An exception is raised by instruction execution, such as an invalid opcode, breakpoint, or page fault. Some exceptions are expected and recoverable. A page fault can mean the virtual page is valid but not currently resident, so the Memory Manager resolves it and restarts the instruction. A hardware interrupt is asynchronous to the current instruction stream and lets a device or timer request attention. These entries have different causes even though all require controlled kernel handling."
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
          { meta: "Kernel entry", label: "Validate caller state", detail: "Probe addresses, check access, copy or capture data", linkAfter: "dispatch service" },
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
          { title: "Run an elevated copy", action: "The same user-mode code now has a higher-integrity token and may hold additional enabled privileges.", why: "Elevation changes authorization inputs, not processor mode for application instructions.", result: "Some targets may now open, while protected targets can still reject the request." },
          { title: "Separate the conclusions", action: "Describe the code as user mode in both cases, with different security contexts.", why: "Success does not prove that application code executed in kernel mode.", result: "Identity, token rights, target policy, and processor mode remain separate dimensions." }
        ],
        conclusion: "A successful privileged operation proves that kernel policy allowed a request. It does not prove that the application itself ran in kernel mode."
      }
    ],
    windowsLearning: [
      {
        title: "Windows must distrust pointers and lengths from user mode",
        paragraphs: [
          "A user-mode address is meaningful within the caller's process and can become invalid or change while a request is processed. Kernel interfaces therefore validate access, capture values, copy buffers at defined times, and handle faults. A driver that trusts an arbitrary user pointer can expose or overwrite system memory, turning one process's request into a system-wide vulnerability.",
          "DeviceIoControl demonstrates the boundary clearly. User code supplies a device handle, control code, buffers, and lengths. The I/O method encoded by the control code influences how Windows makes buffers available to the driver. Even if Windows performs some mapping or copying, the driver must validate semantic sizes, ranges, states, and permissions."
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
      predictionPrompt: "Predict which Process Explorer properties will differ between a Python process launched normally and one launched from an elevated terminal. Also list two properties you expect to remain the same.",
      safety: "Use only your own short-lived Python processes. Do not attempt to open, suspend, terminate, or modify protected system processes.",
      steps: [
        { action: "Open one normal terminal and one terminal using Run as administrator.", why: "The two launch contexts create a controlled token and integrity comparison.", observe: "Record how Windows indicated elevation and which account each terminal uses." },
        { action: "From each terminal, run a Python command that prints its PID and waits for Enter.", why: "Matching exact PIDs prevents you from comparing unrelated Python or IDE processes.", observe: "Record both PIDs and label them standard or elevated." },
        { action: "In Process Explorer, compare User, Integrity, UAC Virtualization, Image Type, path, and parent process.", why: "This separates security attributes from architecture, executable identity, and ancestry.", observe: "Create a two-column comparison and explain every difference rather than only listing it." },
        { action: "Open each process's Security properties if available.", why: "Group and privilege state explains why later access checks can produce different results.", observe: "Record one group or privilege difference, or state precisely why the view was unavailable." },
        { action: "Explain why both processes are still user mode.", why: "The goal is to correct the common admin-equals-kernel misconception before driver and security lessons.", observe: "Use the words token, authorization, system call, and processor mode in your explanation." }
      ],
      fields: [
        { id: "comparison", label: "Context comparison", prompt: "Compare the two PIDs, parents, paths, users, integrity levels, architecture, and token observations." },
        { id: "boundary", label: "Boundary explanation", prompt: "Explain what elevation changes, what it does not change, and where a system call fits." }
      ],
      hints: [{ title: "Security details are unavailable", body: "Run Process Explorer elevated for fuller inspection, but keep the investigated processes unchanged. If policy still prevents a view, record that limitation as evidence about access rather than treating the lab as failed." }],
      cleanup: ["Press Enter in both Python processes so they exit normally.", "Close the elevated terminal when finished to reduce accidental privileged actions."],
      extension: { title: "Optional extension", prompt: "Use pywin32 to open the current process token and query TokenElevation and TokenIntegrityLevel. Compare the returned structures with Process Explorer, then close every token handle." }
    },
    checks: [
      ["What changes when an application is elevated?", ["Its instructions permanently execute in kernel mode", "Its token and effective authorization context change", "Its CPU architecture changes", "System calls are disabled"], 1, "Elevation changes security context, including integrity and privilege state. Application instructions remain user mode."],
      ["Which event is caused synchronously by a thread requesting protected OS work?", ["A hardware interrupt", "A system call", "A power outage", "Another process's timer"], 1, "A system call is initiated by the currently running thread. Hardware interrupts arrive asynchronously."],
      ["Why must a kernel driver validate a user-supplied buffer?", ["User-mode addresses and lengths cannot be trusted", "Kernel mode has no memory access", "Python strings are always encrypted", "Validation changes the CPU architecture"], 0, "A malformed, stale, or malicious pointer and length can cause kernel memory corruption or disclosure if trusted."]
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
          "A system call is a controlled request for a protected kernel service. It is one implementation mechanism beneath some APIs, not a synonym for the Win32 API. GetCurrentProcessId may obtain information without the same kernel work as reading a file. CreateFileW may validate and transform arguments before eventually reaching a native service. One API can involve zero, one, or several system calls, and the internal mapping can change across Windows releases."
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
        title: "Bindings change the Python surface, not the Windows operation",
        paragraphs: [
          "pywin32 wraps selected Windows APIs and COM interfaces. It frequently converts Python strings to UTF-16, returns Python tuples or handle objects, and turns a failed native call into pywintypes.error. These conversions make ordinary code clearer, but they do not remove access rights, flags, handle lifetime, security requirements, or version constraints from the Windows contract.",
          "ctypes lets Python call exported C functions directly. You load the correct DLL, choose the Unicode export, define argtypes and restype, create any structures or buffers, call the function, check its documented failure value, obtain the error at the correct time, and release owned resources. This is more work, so use it when pywin32 lacks the API or when the ABI itself is part of what you need to learn."
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
        prompt: "You need a Windows function in Python. Make the choice from requirements instead of personal preference.",
        steps: [
          { title: "Define the outcome", action: "Write what Windows state you need to read or change, including required version and security context.", why: "A function name is not a complete requirement and may have a safer higher-level alternative.", result: "You have a task-first search phrase and constraints." },
          { title: "Check pywin32 coverage", action: "Search the local pywin32 guide by outcome, native function name, and likely module.", why: "A maintained wrapper usually reduces signature and error-handling mistakes.", result: "If a clear wrapper exists, it becomes the default candidate." },
          { title: "Read the native documentation", action: "Map parameters, rights, return, failure, lifetime, and version requirements even when using pywin32.", why: "The wrapper still calls the Windows contract and may expose most of its flags directly.", result: "You know what correct use means rather than only the Python spelling." },
          { title: "Use ctypes only with an explicit reason", action: "Define the exact signature and checks when coverage, callbacks, structures, or ABI study require direct access.", why: "ctypes cannot infer pointer levels, buffer ownership, or failure sentinels for you.", result: "The additional complexity is tied to a real need." }
        ],
        conclusion: "pywin32 first is a risk-reduction rule, not a claim that ctypes is inferior or that pywin32 covers every API."
      }
    ],
    windowsLearning: [
      {
        title: "Running example: CreateFileW shows why the whole contract matters",
        paragraphs: [
          "CreateFileW opens or creates a file or I/O device. The desired-access field says what operations the returned handle may request. Share flags say which kinds of access other opens may receive while this handle remains open. Creation disposition says whether the target must exist and whether existing content may be replaced. Flags describe attributes, caching behavior, asynchronous behavior, and other options.",
          "Success returns a handle. Failure returns INVALID_HANDLE_VALUE, not NULL, and sets the calling thread's last-error value. The handle must be closed with CloseHandle. If you remember only the path parameter, code may work in a friendly test and fail under concurrency, permissions, or a different creation state."
        ]
      },
      {
        title: "Error behavior differs at the binding boundary",
        paragraphs: [
          "A pywin32 wrapper normally detects native failure and raises pywintypes.error. The exception commonly provides a Windows error code, function name, and message. Handle it when you can add context, choose a documented fallback, or clean up. Do not catch every exception merely to print success-like output.",
          "With ctypes, configure WinDLL with use_last_error=True when the API uses GetLastError. Test the exact documented sentinel immediately after the call and read ctypes.get_last_error before another Windows call overwrites thread-local error state. Some functions use NULL, zero, minus one, a status value, or a valid zero result, so there is no universal ctypes failure test."
        ]
      }
    ],
    codeWalkthroughs: [
      {
        title: "The same intent through pywin32 and ctypes",
        intro: "Both snippets ask Windows for the current process ID. The simple return lets us compare surfaces before handles and buffers add complexity.",
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
      intro: "Trace one harmless file open and distinguish the documented Win32 promise from the internal route observed on this Windows build.",
      expectedOutcome: "The CreateFileW page should define stable application-facing behavior, while a Process Monitor stack may show Python, pywin32, public Win32 libraries, native transition code, kernel components, and file-system drivers. The exact frames can vary with Windows build, symbols, filters, and implementation. One captured path does not prove that every Win32 API maps to exactly one system call.",
      predictionPrompt: "Before capture, predict which parts of the file-open behavior are documented contracts and which stack frames are implementation details.",
      steps: [
        { action: "Read the Microsoft Learn page for CreateFileW and list only its supported contract.", why: "Starting with public documentation makes it easier to recognise which later observations are not promises.", observe: "Record behavior, parameters, result, last-error rule, requirements, and cleanup, but not an assumed system-service number." },
        { action: "Run a small pywin32 script that opens an existing temporary file, pauses briefly, and closes the handle.", why: "A controlled actor and path give the trace a precise identity and time window.", observe: "Print the PID and exact path so Process Monitor evidence can be correlated without relying on process name alone." },
        { action: "Capture only that PID and file path in Process Monitor, then inspect the successful CreateFile event and its stack.", why: "The event and stack expose an observed route through user-mode and kernel components.", observe: "Look for application or Python frames, Windows libraries, the transition boundary, kernel components, and file-system drivers when symbols permit." },
        { action: "Label every observation as public contract or implementation evidence.", why: "The distinction prevents one build's stack from becoming an invented programming guarantee.", observe: "Treat documented access, sharing, result, and cleanup as contract; treat exact frames and internal routing as evidence from this capture." },
        { action: "Explain why the trace does not establish a one-API-to-one-system-call rule.", why: "Wrappers can validate, transform, cache, or issue more than one protected request.", observe: "State what the capture proves, what may differ on another Windows build, and what additional evidence would be required." }
      ],
      hints: [{ title: "The stack is shallow or missing symbols", body: "The exact stack is not required for the contract lesson. Record the limitation, confirm stack capture is enabled, and use the frames that are available without guessing the hidden ones." }],
      cleanup: ["Close the file handle and stop the test process if it is still paused.", "Clear or close the Process Monitor capture and delete only the temporary file created for this investigation."],
      extension: { title: "Optional extension", prompt: "Repeat with GetCurrentProcessId and compare how much observable kernel work appears. Explain why a public API name alone does not predict an exact system-call path." }
    },
    checks: [
      ["Which statement is correct?", ["Every Win32 call is one system call", "All Win32 APIs are wrapped by pywin32", "Native Microsoft documentation matters for pywin32 and ctypes", "ctypes infers every C signature"], 2, "The native contract defines behavior, rights, flags, lifetime, and errors for either binding."],
      ["Why should application code avoid hard-coded system-service numbers?", ["They are part of the stable Win32 contract", "They are implementation details that can change", "They are always Unicode strings", "They prevent any kernel transition"], 1, "The public API is the supported contract. Numeric service identifiers and exact internal routes can change between builds."],
      ["What indicates CreateFileW failure?", ["A NULL handle only", "INVALID_HANDLE_VALUE", "Any even handle", "An empty path returned by the function"], 1, "CreateFileW documents INVALID_HANDLE_VALUE as its failure sentinel and directs the caller to GetLastError."]
    ]
  },

  "reading-winapi-docs": {
    phases: {
      learn: ["Read the contract", "Follow the documentation in an order that keeps behavior, data flow, results, and lifetime connected."],
      windows: ["Build the contract card", "Turn the native page into a binding-neutral description you can use safely."],
      investigation: ["Annotate a real API", "Apply the reading method to unfamiliar primary documentation."],
      review: ["Check the contract", "Test the documentation and ownership distinctions before choosing a Python binding."]
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
        title: "Success, failure, and last error form one decision",
        paragraphs: [
          "WinAPI functions are mostly C interfaces, so their documentation does not normally promise language exceptions. A function may return BOOL, a handle, a count, a pointer, a status code, or an enumeration sentinel. You must read that function's Return value section. Zero can mean failure for one function and a valid result for another. Some functions set last error only on failure, while others require the caller to clear it first to disambiguate a valid sentinel result.",
          "GetLastError retrieves thread-local error state left by the most recent function that documented setting it. Call it immediately after detecting failure. Do not call it after success unless the API specifically instructs you to, and do not let logging or cleanup make another Windows call first. FormatMessage can translate many error codes, but the numeric code remains valuable for precise handling."
        ],
        callout: { label: "Do not generalize a sentinel", text: "WAIT_OBJECT_0, FALSE, NULL, INVALID_HANDLE_VALUE, WAIT_TIMEOUT, and nonzero status codes belong to different contracts. Name and handle each documented outcome explicitly." }
      },
      {
        title: "Ownership is part of the return type",
        paragraphs: [
          "A returned handle or pointer is incomplete information until you know who owns it and how long it remains valid. CreateFileW returns an owned handle closed with CloseHandle. GetCurrentProcess returns a pseudo handle that must not be closed. LocalAlloc memory is released with LocalFree. Some returned strings are borrowed and remain valid only while another object exists.",
          "Write the cleanup beside the acquisition during design. In Python, use try/finally or a context manager so exceptions do not skip release. Never guess that one cleanup function works for all handles or pointers. The creating API's documentation names the matching lifetime rule."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "A reliable reading order for any WinAPI function",
        intro: "Use this sequence before writing the call. It prevents details from becoming disconnected facts.",
        items: [
          { meta: "Intent", label: "Purpose and requirements", detail: "Outcome, header, DLL, supported versions", linkAfter: "then map" },
          { meta: "Inputs and outputs", label: "Parameters and types", detail: "Direction, optionality, buffers, structures", linkAfter: "then branch" },
          { meta: "Control flow", label: "Success and failure", detail: "Return type, valid sentinels, last error", linkAfter: "finally assign" },
          { meta: "Lifetime", label: "Ownership and cleanup", detail: "Borrowed or owned, matching release API" }
        ],
        caption: "After this pass, read Remarks and Security notes again in the context of the exact arguments you plan to use."
      }
    ],
    workedExamples: [
      {
        type: "contract",
        title: "Running example: read CreateFileW before calling it",
        prompt: "You want to open an existing text file for read access without preventing another reader or writer.",
        steps: [
          { title: "Fix the intended behavior", action: "Choose GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, OPEN_EXISTING, and ordinary attributes.", why: "The same function can create, truncate, lock, or open devices. Intent determines safe flags.", result: "You have a specific contract to map rather than a vague file-open goal." },
          { title: "Map types and nullable pointers", action: "Treat lpFileName as input UTF-16 text and lpSecurityAttributes as an optional input pointer, using NULL when inheritance is not required.", why: "Pointer direction and nullability determine ctypes declarations and Python conversions.", result: "The path becomes c_wchar_p and the optional structure can be None." },
          { title: "Handle both output paths", action: "Test the handle against INVALID_HANDLE_VALUE and read last error immediately when it matches.", why: "CreateFileW does not use NULL as its documented failure value.", result: "Failure becomes a precise Windows error instead of an invalid handle used later." },
          { title: "Assign ownership", action: "Place CloseHandle in finally after successful acquisition.", why: "Every exit path, including later exceptions, must release the process's handle-table reference.", result: "The call has a complete lifetime rather than only a successful beginning." }
        ],
        conclusion: "The correct call is defined by behavior, types, branching, and cleanup together."
      }
    ],
    windowsLearning: [
      {
        title: "Turn the page into a binding-neutral contract card",
        paragraphs: [
          "After reading, compress the page into a card you could hand to someone using any language. State the intended outcome, requirements, DLL, each parameter's direction and meaning, every documented result branch, the last-error rule, required access, and the matching release operation.",
          "Do not copy the declaration without interpretation. A useful card explains whether a size is measured in bytes or characters, whether a pointer may be null, who initializes a structure size field, whether a returned value is owned or borrowed, and which remarks constrain the arguments you intend to use."
        ]
      },
      {
        title: "Recognise what changes when a binding is introduced",
        paragraphs: [
          "A Python binding can convert representation without changing the contract. It may accept str instead of LPCWSTR, return an output buffer as bytes, turn a HANDLE into a PyHANDLE, or raise an exception after detecting a native failure sentinel. Those are binding behaviors layered over the same Windows operation.",
          "Keep those layers separate in your notes. The native page tells you what Windows promises. The binding documentation tells you how Python supplies inputs, receives outputs, and exposes native failure. The next lesson uses this contract to choose pywin32 or ctypes and construct the call safely."
        ]
      }
    ],
    practice: {
      title: "Annotate a real API contract",
      time: "30 min",
      intro: "Build a reusable, binding-neutral function card from the primary documentation without an external worksheet.",
      expectedOutcome: "Your completed API card should identify the DLL, supported environment, every parameter direction and native type, the exact success, alternate, and failure values, how error detail is retrieved, which access or privilege requirements apply, and which resource release function is required. Someone should be able to use the card to evaluate any language binding without rereading the page from scratch.",
      predictionPrompt: "Choose CreateFileW or ControlService. Before reading, predict its DLL, input and output directions, success value, failure mechanism, and cleanup responsibility.",
      steps: [
        { action: "Read the function page once from top to bottom without writing code.", why: "A complete first pass exposes remarks and requirements that change how the signature should be interpreted.", observe: "Record the function purpose, header, DLL, supported client, and any privilege or access prerequisite." },
        { action: "Annotate every parameter with direction, optionality, native type, meaning, and lifetime.", why: "This converts syntax into data flow without committing to a particular language binding.", observe: "Include what a null pointer means where allowed, and identify every related size field and unit." },
        { action: "Write a result decision table.", why: "Success, normal alternate outcomes, and failures should be named before they appear in code.", observe: "For each documented returned value, state its meaning, whether error detail is available, and the next action." },
        { action: "Record ownership, access requirements, and cleanup beside the result table.", why: "A successful return is unsafe to use if its access limits or lifetime remain unknown.", observe: "Distinguish owned, borrowed, and pseudo handles or pointers, then name the exact matching release rule." },
        { action: "Explain which contract facts any language binding must preserve.", why: "This separates stable Windows behavior from representation choices made by pywin32, ctypes, or another wrapper.", observe: "Name at least one value a binding may convert and one behavior it cannot legitimately change." }
      ],
      fields: [
        { id: "function-card", label: "Function contract card", prompt: "Record purpose, DLL, parameters with directions and types, success, alternate outcomes, failure, error retrieval, ownership, and requirements." },
        { id: "handling-plan", label: "Handling plan", prompt: "Write the branch structure for success, expected alternate results, recoverable failures, unexpected failures, and cleanup." }
      ],
      hints: [
        { title: "The docs do not list exceptions", body: "That is expected for a C API. Read Return value and Remarks for sentinels and GetLastError behavior. pywin32's exception is wrapper behavior layered over that contract." },
        { title: "An output buffer is confusing", body: "Find the parameter that supplies its capacity and the unit used, such as bytes or characters. Determine whether the function returns the required size when the buffer is too small." }
      ],
      cleanup: ["Close any handle acquired while testing with the documented matching function.", "Restore any service or file state only if your chosen API changed it; a documentation-only pass changes nothing."],
      extension: { title: "Optional extension", prompt: "Repeat the contract card for a second API with a different return convention, then compare which parts of the reading method remained unchanged." }
    },
    checks: [
      ["Which section is not normally part of a C WinAPI function contract?", ["Parameter descriptions", "Return-value behavior", "Exceptions the C function throws", "Requirements and DLL"], 2, "C WinAPI functions normally report through return values and error state. A Python wrapper may translate failure into an exception."],
      ["Which is not a complete valid direction annotation by itself?", ["[out, optional]", "[optional]", "[out]", "[in, out]"], 1, "Optional modifies a direction. By itself it does not say whether data enters or leaves the function."],
      ["What must be decided before code uses a returned handle?", ["Only its printed integer value", "Its ownership, permitted access, and matching cleanup rule", "Whether its name contains an uppercase letter", "Whether every handle uses RegCloseKey"], 1, "A handle is useful only with its access and lifetime contract. Cleanup functions depend on the API family."]
    ]
  },

  "calling-winapi-python": {
    phases: {
      learn: ["Choose the binding", "Start from the native contract, then choose the Python surface that communicates the task safely."],
      windows: ["Construct the call", "Translate types, result branches, error state, and ownership into explicit Python code."],
      investigation: ["Compare both surfaces", "Map one harmless operation through pywin32 and ctypes before deciding which version to run."],
      review: ["Check the call paths", "Test the binding, status, failure, and cleanup decisions together."]
    },
    learning: [
      {
        title: "The native contract comes before the binding",
        paragraphs: [
          "Begin with the contract card from the previous lesson. It defines the Windows operation, access requirements, native parameter meanings, result branches, error-detail rule, and resource lifetime. Only then compare Python surfaces. This order prevents convenient wrapper syntax from hiding a right, sentinel, or cleanup requirement.",
          "A binding may legitimately change representation. pywin32 can accept a Python str for LPCWSTR, allocate output storage, return several outputs as a tuple, and represent a native handle with PyHANDLE. ctypes stays closer to the C declaration. Neither binding may change what access Windows checks, what the operation does, or which resource lifetime Windows defines."
        ],
        callout: { label: "Running example, new lens", text: "Earlier lessons used CreateFileW to explain abstraction, Windows layers, and API contracts. Here the question is narrower: which Python binding should express that already-understood contract, and what safety work remains visible?" }
      },
      {
        title: "Prefer pywin32 when it communicates the task clearly",
        paragraphs: [
          "A suitable pywin32 wrapper usually removes repetitive foreign-function declarations while retaining the arguments that matter to the operation. It may also wrap an owned native handle in an object with a Close method and translate a documented native failure into pywintypes.error. That makes pywin32 the preferred course path when coverage and behavior are clear.",
          "Read the wrapper documentation for its Python signature, return shape, conversions, and exception behavior. Then keep the Microsoft contract beside it for flags, rights, sharing rules, security requirements, side effects, and lifetime. Catch pywintypes.error only where code can add context, choose a documented fallback, or restore state. Use the numeric winerror for stable branching, not the localized message text."
        ]
      },
      {
        title: "Use ctypes when the native boundary is part of the problem",
        paragraphs: [
          "ctypes is justified when pywin32 has no usable wrapper or when the task specifically requires an exact structure, union, callback, pointer level, calling convention, or export. Load the documented DLL with WinDLL, prefer the Unicode W export for text, declare argtypes in native order, and set restype before the first call. A missing restype can silently truncate pointer-sized results.",
          "Keep Python objects alive while native code can still reference their buffers, structures, or callbacks. Use wintypes only when its declaration matches the documentation, and define custom structures with the correct field order, alignment, and architecture-dependent widths. A call returning without crashing proves very little if the ABI declaration is wrong."
        ],
        inlineCheck: ["When is ctypes the stronger choice?", ["Whenever pywin32 already has a clear wrapper", "When an uncovered API or exact native ABI detail is required", "Whenever the function returns an integer", "Because ctypes automatically discovers every signature"], 1, "ctypes is valuable when coverage or ABI-level learning requires it. A clear pywin32 wrapper is normally safer and easier to read."]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "From Windows contract to safe Python call",
        intro: "Binding selection is one decision inside a larger correctness path.",
        items: [
          { meta: "Outcome", label: "State the operation", detail: "Required behavior and target object", linkAfter: "read" },
          { meta: "Windows", label: "Fix the native contract", detail: "Rights, parameters, results, ownership", linkAfter: "check coverage" },
          { meta: "Binding", label: "Prefer pywin32", detail: "Use the wrapper when its behavior is clear", linkAfter: "otherwise declare" },
          { meta: "ABI", label: "Use ctypes deliberately", detail: "DLL, argtypes, restype, structures", linkAfter: "complete" },
          { meta: "Control flow", label: "Handle and clean up", detail: "Named results, error detail, release" }
        ],
        caption: "Choosing ctypes does not replace the contract. It adds responsibility for representing that contract exactly."
      }
    ],
    workedExamples: [
      {
        type: "branch",
        title: "Handle wait results without treating them as Boolean",
        prompt: "A thread waits up to five seconds for an event handle using win32event.WaitForSingleObject.",
        setupCode: "result = win32event.WaitForSingleObject(event, 5000)",
        branches: [
          { value: "WAIT_OBJECT_0", meaning: "The event became signaled before the timeout.", action: "Run the signaled path. Do not test this value with bool(), because it is numerically zero." },
          { value: "WAIT_TIMEOUT", meaning: "Five seconds elapsed without the event becoming signaled.", action: "Run the timeout path. This is expected control flow, not successful acquisition and not necessarily an exception." },
          { value: "WAIT_ABANDONED", meaning: "This result applies to a mutex whose owning thread exited without releasing it.", action: "Treat the protected state as potentially inconsistent. An event wait does not normally produce this branch." },
          { value: "pywintypes.error", meaning: "The wrapper could not return a normal wait status because the underlying call failed.", action: "Use the Windows error code and function context, then clean up without pretending a wait result was returned." }
        ],
        conclusion: "A status value is a small protocol. Compare named outcomes instead of assuming zero means false and nonzero means true."
      }
    ],
    windowsLearning: [
      {
        title: "Translate pywin32 failures and returned statuses separately",
        paragraphs: [
          "When a wrapper raises pywintypes.error, useful fields typically include winerror, funcname, and strerror. The exception says no ordinary wrapper result was produced. Add operation context, recover only from error codes the design expects, and allow unexpected failures to remain visible.",
          "Some wrappers successfully return a status that still requires a decision. Wait functions can return WAIT_OBJECT_0, WAIT_TIMEOUT, or WAIT_ABANDONED. Enumeration functions may use an end sentinel. A partial read can return useful data and a state requiring another call. Name these branches instead of forcing every result through a Boolean success test."
        ]
      },
      {
        title: "Make ctypes failure detection match the exact declaration",
        paragraphs: [
          "For an API that documents last error, construct WinDLL with use_last_error=True. Call the function, test its documented failure value, and immediately store ctypes.get_last_error before logging or cleanup invokes another Windows function. Raise ctypes.WinError(code) for an unexpected failure or branch on a known numeric code when the design has a valid recovery path.",
          "There is no universal ctypes failure test. FALSE, NULL, INVALID_HANDLE_VALUE, SOCKET_ERROR, HRESULT values, and valid zero results belong to different contracts. Define the check beside the restype, then put every acquired resource into try/finally as soon as acquisition succeeds."
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
      title: "Plan one safe call through both bindings",
      time: "25 min",
      intro: "Use the CreateFileW contract card to expose what pywin32 supplies and what a direct ctypes call must declare.",
      expectedOutcome: "Both plans should preserve the same read-only file-open behavior, sharing rules, existing-file requirement, failure meaning, and handle lifetime. The pywin32 plan should be shorter and expose pywintypes.error plus PyHANDLE cleanup. The ctypes plan should declare the full Unicode signature, detect INVALID_HANDLE_VALUE, capture last error immediately, and call CloseHandle in every successful acquisition path.",
      predictionPrompt: "Before comparing signatures, predict which native details pywin32 will convert and which rights, flags, result meanings, and ownership rules it must preserve.",
      steps: [
        { action: "Reuse the CreateFileW contract card from the previous lesson.", why: "Starting from an agreed contract prevents either binding from quietly redefining the task.", observe: "Confirm read access, sharing, OPEN_EXISTING, INVALID_HANDLE_VALUE, last error, and CloseHandle." },
        { action: "Map the contract to win32file.CreateFile.", why: "The wrapper should simplify representation while keeping behaviorally important choices visible.", observe: "Record Python argument types, PyHANDLE output, pywintypes.error fields, and the handle's Close method." },
        { action: "Write pywin32 pseudocode with acquisition, one small operation, and cleanup.", why: "The control-flow shape should make it impossible for a later exception to skip release.", observe: "Use try/finally and add context only where an expected Windows error can be handled meaningfully." },
        { action: "Declare the equivalent ctypes call without running it.", why: "Reviewing the ABI separately reduces the chance that a type or sentinel mistake reaches Windows.", observe: "Include WinDLL, use_last_error, all argtypes, restype, INVALID_HANDLE_VALUE, get_last_error, WinError, and CloseHandle." },
        { action: "Choose the version you would maintain and defend the decision.", why: "Binding choice should follow coverage, clarity, and required control, not novelty.", observe: "Prefer pywin32 unless the ctypes plan solves a concrete missing-wrapper or ABI-learning requirement." }
      ],
      hints: [
        { title: "The signatures do not look alike", body: "Map meaning rather than spelling. A Python str can represent LPCWSTR, None can represent a permitted null pointer, and PyHANDLE can own the native handle." },
        { title: "INVALID_HANDLE_VALUE is awkward", body: "Do not replace the documented sentinel with a generic null check. Define or derive the pointer-sized minus-one value in a way that matches the declared HANDLE result." }
      ],
      cleanup: ["Close any handle if you choose to execute the pywin32 plan against a temporary file.", "Delete only the temporary file you created for this investigation."],
      extension: { title: "Optional extension", prompt: "Implement both versions against a temporary file, deliberately try a missing path, and compare the Python exception information produced by each binding." }
    },
    checks: [
      ["Why is pywin32 normally preferred when a clear wrapper exists?", ["It changes Windows access rules", "It removes avoidable ABI declarations while keeping the operation readable", "It makes cleanup unnecessary", "It guarantees every call succeeds"], 1, "A clear wrapper reduces conversion and declaration work. The native behavior, errors, and lifetime still matter."],
      ["Why is if result: wrong for WAIT_OBJECT_0?", ["WAIT_OBJECT_0 is text", "WAIT_OBJECT_0 is numerically zero even though the object was signaled", "Wait functions never return", "Python cannot compare named constants"], 1, "The signaled result can be zero and therefore false in a Boolean context. Compare named status constants explicitly."],
      ["When should ctypes.get_last_error be read?", ["After any successful call", "Immediately after detecting a failure from an API documented to set last error", "Only after cleanup", "Before calling the API"], 1, "Capture the error immediately after the documented failure result, before another Windows call can replace the thread's error state."]
    ]
  },

  "inspect-windows": {
    phases: {
      learn: ["Build the investigation method", "Turn a precise question into a prediction, evidence plan, and bounded conclusion."],
      windows: ["Match tools to evidence", "Choose snapshots, traces, and internal probes according to the question."],
      investigation: ["Run a three-view investigation", "Correlate one harmless action from the script, a live snapshot, and a trace."],
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
          "A snapshot describes state at an observation time. Process Explorer shows the processes, threads, tokens, handles, mappings, and performance counters that still exist when it refreshes. WinObj shows the named Object Manager namespace at that moment. Autoruns shows configured persistence locations. A snapshot is strong for current ownership and relationships but can miss something short-lived.",
          "A trace records events over an interval. Process Monitor captures file, Registry, process, thread, image-load, and selected network activity with timestamps and results. A trace can show an open that failed and disappeared, or the exact query sequence before a configuration decision. It can also omit events that occurred before capture, drown the signal in unrelated traffic, and show correlation without proving the application's higher-level intent."
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
          "Separate three statements in your notes: observation, interpretation, limitation. For example: Procmon recorded PID 4120 opening a path with SUCCESS. This supports the interpretation that this process obtained an open to that file during capture. It does not prove which source-code function caused the request or whether later data was read successfully. Precise limitations make conclusions more trustworthy, not weaker."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "The investigation loop",
        intro: "A useful investigation ends by changing the model that generated its prediction.",
        items: [
          { meta: "Frame", label: "Ask and predict", detail: "Question, expected actor, operation, result", linkAfter: "choose evidence" },
          { meta: "Design", label: "Instrument and filter", detail: "Tool, columns, capture window, exact identifiers", linkAfter: "perform once" },
          { meta: "Observe", label: "Collect and correlate", detail: "Events, snapshots, values, timestamps", linkAfter: "separate claims" },
          { meta: "Explain", label: "Interpret and limit", detail: "Mechanism, competing explanations, missing proof", linkAfter: "update" },
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
          { title: "Define identifiers", action: "Record the full path and exact PID of the test process before capture.", why: "Names alone can collide, and partial paths can match unrelated traffic.", result: "The expected actor and target are unambiguous for this run." },
          { title: "Capture the smallest event window", action: "Filter on the path and PID, clear the display, start capture, open the file once, and stop capture.", why: "A controlled interval reduces noise and strengthens temporal connection.", result: "The trace should contain the open request and any immediate metadata or reads." },
          { title: "Interpret the operation and result", action: "Inspect CreateFile desired access, share mode, disposition, options, and result.", why: "The same path can be probed, created, read, deleted, or opened only for metadata.", result: "You can state exactly what access was requested and whether it was granted." },
          { title: "Correlate current ownership", action: "While the process keeps the file open, search its handles in Process Explorer.", why: "The snapshot tests whether a live handle remains after the trace event.", result: "The same PID, object path, and handle lifetime support one another." },
          { title: "Bound the conclusion", action: "State what the two views prove and what they do not.", why: "Tool data does not automatically reveal source-level intent or every later operation.", result: "The conclusion is evidence-based and appropriately narrow." }
        ],
        conclusion: "A trace plus a live handle can identify which process opened the file and that access remained active. It cannot alone identify the exact source line or business reason."
      }
    ],
    windowsLearning: [
      {
        title: "Process Explorer connects process identity to current resources",
        paragraphs: [
          "Use the tree to understand ancestry, but verify the numeric PID and image path. Properties expose command line, environment, token, threads, TCP/IP endpoints, services, handles, and loaded DLLs according to access available. The lower pane can switch between handles and DLLs. Search can locate which visible process owns a named handle or mapped DLL.",
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
        title: "WinObj connects handles to the named object world",
        paragraphs: [
          "The Object Manager namespace contains directories and named objects such as events, mutexes, sections, symbolic links, and device objects. Names like \\Device and \\BaseNamedObjects belong to this namespace, not the ordinary filesystem. WinObj lets you browse that structure and inspect object types and symbolic links.",
          "A process handle is a local numeric reference, while a named object can be discoverable through the global namespace. Many objects are unnamed and therefore absent from a namespace browse. Use WinObj to understand naming and relationships, not to enumerate every kernel object or every handle held by every process."
        ]
      }
    ],
    practice: {
      title: "Investigate one file open with three views",
      time: "35 min",
      intro: "Combine a controlled Python action, a Process Monitor trace, and a Process Explorer snapshot, then state the evidence and its limits.",
      expectedOutcome: "While the script is at its first pause, Process Monitor should retain the successful file-open event and Process Explorer should show a live handle to the same path in the matching PID. After the script closes the file, the handle should disappear from the Process Explorer snapshot while the earlier Process Monitor event remains in the trace. Exact PIDs, handle values, and timestamps will differ.",
      predictionPrompt: "Predict the process name and PID, Procmon operation and result, handle path, requested access, and whether the handle will still exist after Python closes the file.",
      safety: "Use a temporary file in a directory you own. Do not capture passwords or unrelated private activity, and do not close handles from Process Explorer.",
      steps: [
        { action: "Create a Python script that opens a temporary text file for reading, prints its PID, waits once while the file is open, closes it, then waits again.", why: "Two pauses create a deliberate before-and-after handle lifetime that snapshots can test.", observe: "Record the script path, temporary file path, and the exact points at which the handle should exist." },
        { action: "Configure Process Monitor before running the script: include the exact file path and later add the printed PID.", why: "Path captures the early event even before you know the new PID, while the PID filter removes unrelated access afterward.", observe: "Record all filters, capture start time, and whether event dropping is reported." },
        { action: "Run the script, stop at the first pause, and inspect the successful open event.", why: "The trace records the request while the first pause keeps its resulting handle alive.", observe: "Record operation, result, desired access, share mode, disposition, options, sequence, and useful stack frames." },
        { action: "Find the exact PID in Process Explorer and locate the file in its handles.", why: "The snapshot independently confirms that the process currently retains access to the same named object.", observe: "Record handle value, type, name, and any granted-access detail available." },
        { action: "Continue past close but stop at the second pause, then refresh Process Explorer.", why: "A controlled state change tests the distinction between an event history and a current-state snapshot.", observe: "Record whether the handle disappeared while the original Procmon event remained." },
        { action: "Write observation, interpretation, and limitation as separate paragraphs.", why: "Separating them prevents an accurate trace from turning into an unsupported causal story.", observe: "Include at least one alternative explanation that your controlled setup ruled out and one claim it could not rule out." }
      ],
      fields: [
        { id: "evidence-table", label: "Evidence log", prompt: "For each view, record timestamp or state, PID, object or path, operation, result, and relevant details." },
        { id: "conclusion", label: "Bounded conclusion", prompt: "Write separate observation, interpretation, and limitation paragraphs. End with the next experiment you would run if the result were ambiguous." }
      ],
      hints: [
        { title: "The handle is not visible", body: "Confirm the script is still at the first pause, refresh Process Explorer, use the lower pane in Handle mode, and run Process Explorer elevated if access is limited. Match the exact PID." },
        { title: "Procmon is too noisy", body: "Pause capture, clear the display, confirm the exact Path filter, resume only for the open, then pause again. Add PID after the script prints it rather than filtering only by python.exe." }
      ],
      cleanup: ["Let the Python script close the file and exit normally.", "Stop Process Monitor capture and close the temporary file in any editor.", "Delete the temporary file and script only if you do not want to retain them as a practice artifact."],
      extension: { title: "Optional extension", prompt: "Replace the ordinary file with a named event created through win32event. Use WinObj to find its namespace name and Process Explorer to find the process handle, then explain why the two views are related but not identical." }
    },
    checks: [
      ["Which tool is best suited to determine which file operation failed several seconds ago?", ["A current Process Explorer handle snapshot", "A Process Monitor trace captured during the failure", "A desktop screenshot", "The CPU architecture label"], 1, "A time-based trace preserves completed and failed operations that no longer have live state."],
      ["What does a Process Monitor NAME NOT FOUND event prove by itself?", ["The application crashed", "One lookup did not find that name at that time", "The file never existed anywhere", "Malware deleted the path"], 1, "Many programs probe optional paths. Interpret the row within its sequence, process context, and later results."],
      ["Why use both Process Monitor and Process Explorer during the file lab?", ["They always show identical data", "One records the open event and the other tests whether a handle currently remains", "Process Explorer creates the file", "Process Monitor changes the handle rights"], 1, "Trace and snapshot evidence answer related but distinct temporal questions and can corroborate each other."]
    ]
  }
};
