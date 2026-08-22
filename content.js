window.ILOVEOS_DATA = {
  modules: [
    {
      id: "foundations",
      number: "01",
      title: "OS foundations",
      kicker: "Start with the machine",
      description: "Build the mental model: hardware, abstraction, system calls, and the boundary between user mode and the Windows kernel.",
      lessons: 8,
      lessonTitles: [
        "CPU architecture and data representation",
        "Why does an operating system exist?",
        "How Windows is organised",
        "User mode and kernel mode",
        "System calls and the Win32 API",
        "How to read a Windows API contract",
        "Calling Windows APIs safely from Python",
        "Inspecting the operating system"
      ],
      time: "140 min",
      accent: "violet",
      topics: ["CPU architecture", "Binary and hexadecimal", "Why an OS exists", "Windows NT", "User vs kernel mode", "System calls", "WinAPI documentation"],
      tools: ["Process Explorer"],
      python: ["win32api", "ctypes"]
    },
    {
      id: "processes-handles",
      number: "02",
      title: "Processes & handles",
      kicker: "Meet Windows objects",
      description: "See how Windows represents running programs and gives user-mode code controlled access to kernel resources.",
      lessons: 6,
      lessonTitles: [
        "Programs, processes, and isolation",
        "Inside a process",
        "Context switches and process metadata",
        "How Windows creates a process",
        "Kernel objects and the Object Manager",
        "Handles, access rights, and reference counting"
      ],
      time: "240 min",
      accent: "blue",
      topics: ["Process creation", "Kernel objects", "Handle tables", "Object Manager", "Reference counting"],
      tools: ["Process Explorer", "Handle", "WinObj"],
      python: ["win32process", "win32api", "pywintypes"]
    },
    {
      id: "threads-scheduling",
      number: "03",
      title: "Threads & scheduling",
      kicker: "Who gets the CPU next?",
      description: "Follow a thread from creation to execution and understand the scheduling choices that keep Windows responsive.",
      lessons: 5,
      lessonTitles: [
        "Processes and their threads",
        "Thread contexts, stacks, and states",
        "Creating and ending threads",
        "How the scheduler chooses a thread",
        "Priorities, boosts, and starvation"
      ],
      time: "210 min",
      accent: "cyan",
      topics: ["Thread context", "Stacks", "Context switches", "Priorities", "Priority boosts"],
      tools: ["Process Explorer"],
      python: ["threading", "win32process"]
    },
    {
      id: "memory",
      number: "04",
      title: "Memory management",
      kicker: "An address is not a location",
      description: "Translate virtual addresses into physical reality through pages, frames, faults, protection, and heaps.",
      lessons: 7,
      lessonTitles: [
        "Addresses in binary and hexadecimal",
        "The memory hierarchy and CPU caches",
        "Virtual memory and address translation",
        "Pages, frames, and page tables",
        "Page faults, paging, and the page file",
        "Shared memory and copy-on-write",
        "VirtualAlloc, protection, and heaps"
      ],
      time: "330 min",
      accent: "green",
      topics: ["Binary & hex", "Virtual memory", "Paging", "Page faults", "Heaps", "Copy-on-write"],
      tools: ["VMMap", "RAMMap"],
      python: ["ctypes", "win32process"]
    },
    {
      id: "linking-loading",
      number: "05",
      title: "Linking & loading",
      kicker: "From file to live process",
      description: "Take apart a Portable Executable and trace how Windows resolves imports, maps sections, and loads DLLs.",
      lessons: 6,
      lessonTitles: [
        "From source code to an executable",
        "Static and dynamic linking",
        "Anatomy of a Portable Executable",
        "Sections and relative virtual addresses",
        "Imports, exports, and the IAT",
        "How the Windows loader loads a process"
      ],
      time: "330 min",
      accent: "amber",
      topics: ["Static & dynamic linking", "PE headers", "Sections", "Imports & exports", "The loader"],
      tools: ["CFF Explorer", "ListDLLs", "Process Explorer"],
      python: ["win32api", "win32process", "ctypes"]
    },
    {
      id: "management",
      number: "06",
      title: "Windows management",
      kicker: "Configuration and services",
      description: "Explore the Registry, the Service Control Manager, service hosts, and Windows-on-Windows compatibility.",
      lessons: 6,
      lessonTitles: [
        "How the Registry is structured",
        "Reading and changing Registry data",
        "Windows services and the SCM",
        "Controlling services from Python",
        "Service hosts and background processes",
        "WoW64 and redirection"
      ],
      time: "330 min",
      accent: "rose",
      topics: ["Registry", "Services", "SCM", "svchost", "WoW64", "Redirection"],
      tools: ["Process Monitor", "Autoruns", "PsService"],
      python: ["winreg", "win32service", "win32serviceutil"]
    },
    {
      id: "security",
      number: "07",
      title: "Windows security",
      kicker: "Who may do what?",
      description: "Reason through tokens, SIDs, security descriptors, access checks, privileges, UAC, and integrity levels.",
      lessons: 7,
      lessonTitles: [
        "The Windows security model",
        "Users, groups, and SIDs",
        "Access tokens and security contexts",
        "Security descriptors, DACLs, and ACEs",
        "How Windows performs an access check",
        "Privileges and impersonation",
        "UAC and integrity levels"
      ],
      time: "400 min",
      accent: "red",
      topics: ["SIDs", "Tokens", "DACLs & ACEs", "Privileges", "UAC", "Integrity levels"],
      tools: ["AccessChk", "Process Explorer"],
      python: ["win32security", "win32api"]
    },
    {
      id: "synchronisation",
      number: "08",
      title: "Synchronisation",
      kicker: "Coordinate concurrent work",
      description: "Reproduce race conditions, then choose the right primitive to make shared state safe and predictable.",
      lessons: 6,
      lessonTitles: [
        "Why concurrent code goes wrong",
        "Atomicity and race conditions",
        "Critical sections and mutexes",
        "Semaphores",
        "Events and waitable objects",
        "Deadlocks, starvation, and safe design"
      ],
      time: "300 min",
      accent: "pink",
      topics: ["Atomicity", "Race conditions", "Mutexes", "Semaphores", "Events", "Deadlocks"],
      tools: ["Process Explorer", "WinObj"],
      python: ["threading", "win32event"]
    },
    {
      id: "ipc",
      number: "09",
      title: "Inter-process communication",
      kicker: "Cross the process boundary",
      description: "Move data safely between isolated processes with pipes, shared memory, files, and sockets.",
      lessons: 5,
      lessonTitles: [
        "Why processes need IPC",
        "Anonymous pipes",
        "Named-pipe servers and clients",
        "File mappings and shared memory",
        "Choosing an IPC mechanism"
      ],
      time: "300 min",
      accent: "teal",
      topics: ["Anonymous pipes", "Named pipes", "File mappings", "Shared memory", "Sockets"],
      tools: ["Process Explorer", "Handle", "Process Monitor"],
      python: ["win32pipe", "win32file", "mmap"]
    },
    {
      id: "hooking-injection",
      number: "10",
      title: "Hooking & injection",
      kicker: "Change behaviour at runtime",
      description: "Understand injection and hooking mechanisms through constrained labs and defensive process investigation.",
      lessons: 6,
      lessonTitles: [
        "Injection and hooking explained",
        "Loading code during process startup",
        "Remote memory and remote threads",
        "Position-independent injected code",
        "Windows hooks and IAT hooking",
        "Detecting injection and suspicious modules"
      ],
      time: "110 min",
      accent: "orange",
      topics: ["DLL injection", "Remote memory", "Windows hooks", "IAT hooking", "Detection"],
      tools: ["Process Explorer", "ListDLLs", "Process Monitor", "Sigcheck"],
      python: ["win32process", "win32api", "ctypes"]
    }
  ],

  pywin32: [
    {
      name: "win32api",
      label: "General Windows utilities",
      description: "The practical utility drawer. Use it for common OS operations such as handles, DLLs, files, environment values, and basic process actions when a more focused module is not the natural fit.",
      useWhen: "You need a common Windows operation and there is no more specific pywin32 module for it.",
      calls: ["CloseHandle", "DuplicateHandle", "GetModuleHandle", "LoadLibrary", "GetProcAddress"],
      lesson: "Foundations · Processes · Linking"
    },
    {
      name: "win32process",
      label: "Processes and threads",
      description: "Create and inspect processes and threads. This is where process IDs, startup information, priorities, affinity, loaded modules, and thread control become Python objects and functions.",
      useWhen: "Your code needs to start a process, enumerate processes or modules, or inspect scheduling-related properties.",
      calls: ["CreateProcess", "EnumProcesses", "EnumProcessModules", "GetPriorityClass", "SetProcessAffinityMask"],
      lesson: "Processes · Scheduling"
    },
    {
      name: "win32event",
      label: "Waiting and synchronisation",
      description: "Create and wait on Windows synchronisation objects. Despite the name, it covers more than events: mutexes, semaphores, and the wait functions live here too.",
      useWhen: "Threads or processes need to wait, signal one another, or control access to a shared resource.",
      calls: ["CreateEvent", "CreateMutex", "CreateSemaphore", "SetEvent", "WaitForSingleObject"],
      lesson: "Synchronisation"
    },
    {
      name: "win32file",
      label: "Files, devices, and I/O",
      description: "The low-level Windows I/O interface. It works with files, pipes, devices, and asynchronous operations through handles rather than Python file objects.",
      useWhen: "You need Win32 handle-based I/O, device access, named-pipe communication, or overlapped operations.",
      calls: ["CreateFile", "ReadFile", "WriteFile", "DeviceIoControl", "GetFileInformationByHandle"],
      lesson: "Processes · IPC"
    },
    {
      name: "win32pipe",
      label: "Named and anonymous pipes",
      description: "Build communication channels between processes. It creates and connects pipes; reading and writing the resulting pipe handles is normally done with win32file.",
      useWhen: "You are building a pipe server/client or redirecting data between related processes.",
      calls: ["CreateNamedPipe", "ConnectNamedPipe", "CreatePipe", "PeekNamedPipe", "SetNamedPipeHandleState"],
      lesson: "Inter-process communication"
    },
    {
      name: "win32security",
      label: "Tokens, identities, and permissions",
      description: "The main security module. Use it to inspect access tokens, SIDs, privileges, ACLs, and security descriptors, and to understand why an operation is allowed or denied.",
      useWhen: "You need to ask who a process represents, what it may do, or how an object is protected.",
      calls: ["OpenProcessToken", "GetTokenInformation", "LookupPrivilegeValue", "AdjustTokenPrivileges", "GetNamedSecurityInfo"],
      lesson: "Windows security"
    },
    {
      name: "win32service",
      label: "Service Control Manager API",
      description: "A direct wrapper around the Windows service APIs. It opens the Service Control Manager, queries services, and sends start, stop, or control requests.",
      useWhen: "You need precise control over service records or want to learn the underlying SCM API.",
      calls: ["OpenSCManager", "OpenService", "EnumServicesStatus", "StartService", "ControlService"],
      lesson: "Windows management"
    },
    {
      name: "win32serviceutil",
      label: "Convenient service helpers",
      description: "A higher-level layer over win32service. It removes boilerplate for common service administration and provides a base class for writing a Python Windows service.",
      useWhen: "You want the convenient path for installing, controlling, or implementing a service.",
      calls: ["StartService", "StopService", "RestartService", "QueryServiceStatus", "ServiceFramework"],
      lesson: "Windows management"
    },
    {
      name: "pywintypes",
      label: "Shared Windows data types",
      description: "The common type system underneath pywin32. It supplies Python representations of handles, SIDs, security descriptors, GUIDs, times, and overlapped-I/O state.",
      useWhen: "Another pywin32 module returns a specialised Windows object or asks you to construct one.",
      calls: ["HANDLE", "SID", "SECURITY_ATTRIBUTES", "SECURITY_DESCRIPTOR", "OVERLAPPED"],
      lesson: "Used throughout"
    },
    {
      name: "win32evtlog",
      label: "Windows Event Log",
      description: "Read and monitor Windows event logs. It exposes the older event-log API and is useful for connecting OS activity to auditable records.",
      useWhen: "You need to inspect system, application, or security events from Python.",
      calls: ["OpenEventLog", "ReadEventLog", "GetNumberOfEventLogRecords", "NotifyChangeEventLog", "CloseEventLog"],
      lesson: "Windows security · Management"
    },
    {
      name: "win32gui",
      label: "Windows and messages",
      description: "Work with native desktop windows and the Windows message-driven GUI system: find windows, inspect them, send messages, and interact with controls.",
      useWhen: "You need a window handle, message-level interaction, or a closer view of the Win32 GUI model.",
      calls: ["FindWindow", "EnumWindows", "GetWindowText", "SendMessage", "ShowWindow"],
      lesson: "Hooking & injection"
    },
    {
      name: "win32job",
      label: "Groups of processes",
      description: "Create Job Objects that manage a group of processes as one unit. Jobs can enforce limits and make process-tree cleanup reliable.",
      useWhen: "You need to constrain, account for, or terminate a related group of processes together.",
      calls: ["CreateJobObject", "AssignProcessToJobObject", "SetInformationJobObject", "QueryInformationJobObject", "TerminateJobObject"],
      lesson: "Processes"
    }
  ],

  tools: [
    { name: "Process Explorer", short: "The task manager for understanding", description: "Inspect process trees, threads, handles, loaded DLLs, tokens, integrity levels, priorities, and live resource use.", modules: "01 · 02 · 03 · 07 · 08 · 10", color: "violet" },
    { name: "Process Monitor", short: "See what a process actually did", description: "Capture file, Registry, process, thread, and image-loading activity, then filter the event stream until behaviour becomes explainable.", modules: "06 · 09 · 10", color: "blue" },
    { name: "VMMap", short: "A process address-space map", description: "Break a process's virtual memory into images, heaps, stacks, private allocations, mapped files, and other regions.", modules: "04", color: "green" },
    { name: "RAMMap", short: "Where physical memory went", description: "Investigate system-wide physical-memory use, page lists, file cache, process working sets, and mapped files.", modules: "04", color: "cyan" },
    { name: "WinObj", short: "Browse the Object Manager", description: "Explore the namespace containing devices, symbolic links, events, mutexes, sections, and other named kernel objects.", modules: "02 · 08", color: "amber" },
    { name: "Handle", short: "Find open handles from the terminal", description: "Search which processes hold a file or object open and inspect handle types without leaving the command line.", modules: "02 · 09", color: "rose" },
    { name: "ListDLLs", short: "List loaded modules", description: "See which DLLs are mapped into a process and collect useful module metadata during loader and injection investigations.", modules: "05 · 10", color: "orange" },
    { name: "Autoruns", short: "Map automatic-start locations", description: "Inspect logon entries, services, scheduled tasks, extensions, and other locations that make code run automatically.", modules: "06", color: "pink" },
    { name: "AccessChk", short: "Make permissions visible", description: "Ask what access a user or group has to files, Registry keys, services, processes, and other securable objects.", modules: "07", color: "red" },
    { name: "Sigcheck", short: "Inspect identity and trust", description: "Report version information, hashes, signatures, certificate chains, and reputation-related metadata for executable files.", modules: "10", color: "teal" }
  ]
};
