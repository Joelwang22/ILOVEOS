window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "binary-hex-addresses": {
    apis: ["ctypes.sizeof", "VirtualQueryEx", "GetSystemInfo"],
    phases: {
      learn: ["Read an address range", "Turn hexadecimal addresses, sizes, and alignment into one consistent model."],
      windows: ["Interpret Windows memory rows", "Distinguish a region base, allocation base, end address, and pointer width."],
      investigation: ["Annotate a live region", "Use VMMap and explicit calculations to explain one real process range."],
      review: ["Check the arithmetic", "Test conversion, alignment, half-open ranges, and architecture assumptions."]
    },
    learning: [
      {
        title: "An address names one byte, a size defines the span",
        paragraphs: [
          "Windows presents virtual addresses as hexadecimal because each hex digit represents four bits and page boundaries remain visually obvious. An address is only the name of one byte in one process's virtual address space. It does not state how much memory is valid after that byte, what access is permitted, or which physical frame currently backs it.",
          "Describe a region with a half-open interval: base <= address < base + size. The first address outside the region is base + size, while the last included byte is base + size - 1. Half-open ranges compose cleanly because the end of one adjacent region is the base of the next."
        ],
        inlineCheck: ["A region begins at 0x4000 and has size 0x1000. Which address is outside it?", ["0x4000", "0x4FFF", "0x4800", "0x5000"], 3, "The region contains 0x4000 through 0x4FFF. Its exclusive end is 0x5000."]
      },
      {
        title: "Alignment divides an address into page number and offset",
        paragraphs: [
          "A typical Windows page is 0x1000 bytes, which is 4096 or 2^12. The low 12 bits therefore select a byte within the page. Rounding an address down with address & ~(page_size - 1) finds its page base, and address & (page_size - 1) finds the offset when page size is a power of two.",
          "Page size is not the same as allocation granularity. On common Windows systems the page size is 4 KiB, while reservation addresses are aligned to the allocation granularity, commonly 64 KiB. Query the system rather than building a native program around assumed constants."
        ]
      },
      {
        title: "Pointer width belongs to the observing process and target contract",
        paragraphs: [
          "A 32-bit pointer can encode 2^32 byte addresses, while a 64-bit pointer type is eight bytes wide. Real user-mode address ranges are smaller than the full mathematical space because Windows reserves portions, enforces architecture rules, and current CPUs implement a subset of possible address bits.",
          "Python integers can grow beyond native pointer width, so arithmetic that looks valid in Python can still be invalid for a target process. Structure fields, ctypes pointer types, the target architecture, and overflow checks must agree before an address is passed to an API."
        ],
        callout: { label: "Keep the target attached", text: "A hex number is not a portable pointer. Record the PID, process creation time, architecture, and observation interval with every live address." }
      }
    ],
    visuals: [
      {
        type: "map",
        title: "Split one address at a 4 KiB boundary",
        intro: "For 0x00007FF6A12B3C5D, the final three hex digits contain the 12-bit page offset.",
        items: [
          { meta: "Full virtual address", label: "0x00007FF6A12B3C5D", detail: "Meaningful only inside one address space", linkAfter: "mask low 12 bits" },
          { meta: "Page base", label: "0x00007FF6A12B3000", detail: "Address rounded down to 0x1000", linkAfter: "plus offset" },
          { meta: "Offset", label: "0xC5D", detail: "3165 bytes into the page", linkAfter: "must remain below" },
          { meta: "Page size", label: "0x1000", detail: "4096 bytes" }
        ],
        caption: "The page base plus offset reconstructs the original address."
      }
    ],
    workedExamples: [
      {
        type: "calculation",
        title: "Calculate a region boundary and page count",
        prompt: "A VMMap region begins at 0x000001D400200000 and has size 0x2A000. Find its exclusive end, last byte, and number of 4 KiB pages.",
        steps: [
          { title: "Add the size", action: "Add the hexadecimal region size to the base.", result: "0x1D400200000 + 0x2A000 = 0x1D40022A000", why: "This is the first address after the half-open region." },
          { title: "Find the final byte", action: "Subtract one from the exclusive end.", result: "0x1D40022A000 - 1 = 0x1D400229FFF", why: "Every address through this value is inside the region." },
          { title: "Convert size to pages", action: "Divide by the 0x1000-byte page size.", result: "0x2A000 / 0x1000 = 0x2A = 42 pages", why: "Both values are page aligned, so no partial page remains." }
        ],
        conclusion: "Use BaseAddress for the range, RegionSize for its span, and base + size - 1 for an inclusive display."
      }
    ],
    windowsLearning: [
      {
        title: "BaseAddress and AllocationBase answer different questions",
        paragraphs: [
          "VirtualQueryEx groups adjacent pages with matching state, protection, and type into a region. BaseAddress is the first page of that returned region. AllocationBase points to the beginning of the larger allocation from which the pages originated. Several queried regions can therefore share one AllocationBase while having different BaseAddress values and protections.",
          "A CSV range must use BaseAddress through BaseAddress + RegionSize - 1. Using AllocationBase as the range start duplicates earlier pages and misrepresents later subregions. For MEM_FREE, allocation, protection, and type fields are undefined and should be displayed as blank rather than invented values."
        ]
      },
      {
        title: "VMMap supplies values, not their arithmetic meaning",
        paragraphs: [
          "VMMap groups an address space into categories and shows base, size, protection, committed bytes, and working-set evidence. Select a stable process you own and record its bitness before copying an address. A restart normally invalidates the old address because allocation order and ASLR can change.",
          "Use a calculator or Python int(text, 16) for verification, but write the equation first. The point is to understand which value is being added, masked, or rounded, not to trust a tool's formatting."
        ]
      }
    ],
    practice: {
      title: "Observe one VMMap region",
      time: "15 min",
      intro: "Open one controlled Notepad instance and inspect a current VMMap row without turning live addresses into a worksheet.",
      expectedOutcome: "VMMap shows the controlled process's Image and Private Data regions with current Address, Size, Committed, Private, Total WS, and Protection values. Closing the process makes that live map unavailable; its addresses are not durable identifiers.",
      steps: [
        {
          action: "In PowerShell, start the controlled Notepad instance and print the process identity; then open that exact live PID in VMMap with File > Select Process.",
          commands: [{ label: "PowerShell", code: "$target = Start-Process -FilePath notepad.exe -PassThru\n\"PID: $($target.Id)\"\n\"Creation time: $($target.StartTime.ToString('o'))\"\n\"System page size: $([Environment]::SystemPageSize) bytes\"" }],
          why: "Addresses are scoped to one live process instance.",
          observe: "PowerShell prints the requested PID, creation time, and page size. If modern Notepad redirects and the returned PID exits, use Process Explorer to match the surviving Notepad by creation time and image path before selecting it in VMMap."
        },
        { action: "In VMMap's lower Details view for the matched live PID, select one Image row and one Private Data row; open row details for Allocation Base when available.", why: "The two categories expose current region purpose without requiring address arithmetic.", observe: "Each row shows Address, Type, Size, Committed, Private, Total WS, and Protection. Address is the current region start, while Allocation Base can identify the larger originating allocation." },
        {
          action: "Restart the controlled identity check: close the first Notepad through its own window, start a replacement, print the replacement PID and creation time, and select that newly identified live PID in VMMap.",
          commands: [{ label: "PowerShell", code: "$replacement = Start-Process -FilePath notepad.exe -PassThru\n\"Replacement launcher PID: $($replacement.Id)\"\n\"Replacement creation time: $($replacement.StartTime.ToString('o'))\"" }],
          why: "A restart supplies a new process identity instead of treating old live addresses as durable evidence.",
          observe: "PowerShell prints a replacement PID and creation time. If the replacement launcher PID exited or redirected, match the surviving Notepad by that creation time and image path in Process Explorer; stop if no unique live match exists. VMMap then shows the replacement process's current regions, whose addresses need not match the first instance."
        },
        { action: "Close the controlled Notepad through its own window, then refresh VMMap for the same PID.", why: "Process lifetime bounds the validity of every current address-space row.", observe: "VMMap reports that the PID exited or can no longer refresh it. The prior addresses remain machine-dependent historical output only." }
      ],
      hints: [{ title: "VMMap cannot select the printed PID", body: "Modern Notepad can redirect its launcher. Match the surviving instance by creation time and image path in Process Explorer, and stop if the identity is ambiguous." }],
      cleanup: ["If the controlled Notepad remains live, close it through its own window.", "Close VMMap."]
    },
    checks: [
      ["What is the inclusive final byte of base 0x8000 with size 0x2000?", ["0x9FFF", "0xA000", "0x7FFF", "0xA001"], 0, "The exclusive end is 0xA000, so the final included byte is 0x9FFF."],
      ["What does address & 0xFFF return for a 4 KiB page model?", ["The allocation base", "The page offset", "The process ID", "The page protection"], 1, "The low 12 bits select the byte offset within a 0x1000-byte page."],
      ["Why can two processes show the same virtual address?", ["They must share every byte", "Each process has its own translation context", "The address is a file offset", "Windows ignores process isolation"], 1, "The same virtual value can be translated through different process page tables to different backing storage."]
    ]
  },

  "memory-hierarchy-caches": {
    apis: ["win32file.FlushFileBuffers", "QueryWorkingSetEx", "win32process.GetProcessMemoryInfo"],
    phases: {
      learn: ["Follow a memory access", "Connect locality, cache lines, RAM, storage, and measured latency."],
      windows: ["Separate the caches", "Distinguish CPU caches, process working sets, standby memory, and the file cache."],
      investigation: ["Measure locality", "Compare sequential and strided access without confusing elapsed time with allocation size."],
      review: ["Check the hierarchy", "Test locality, cache identity, coherence, and evidence limits."]
    },
    learning: [
      {
        title: "The hierarchy trades capacity for access cost",
        paragraphs: [
          "Registers hold the values directly used by instructions. CPU caches retain recently used fixed-size lines, RAM holds active pages, and storage retains files and page-file content. Each step toward greater capacity is generally slower, so the machine relies on locality to keep useful data near execution.",
          "Temporal locality means data used recently is likely to be used again. Spatial locality means nearby bytes are likely to be used soon. A sequential scan lets hardware prefetchers and cache lines contribute useful neighboring bytes, while pointer chasing and large irregular strides can turn each access into a new miss."
        ]
      },
      {
        title: "A cache line and a virtual-memory page solve different problems",
        paragraphs: [
          "A cache line is a hardware transfer and coherence unit, commonly much smaller than a page. A page is an operating-system translation, protection, and residency unit. One 4 KiB page contains many cache lines, and a present page can still produce CPU cache misses.",
          "A page fault and a cache miss are therefore not synonyms. The CPU can miss in its caches and fetch from RAM without involving the Windows memory manager. A page fault transfers control to the kernel because the page-table state requires operating-system handling."
        ],
        inlineCheck: ["A loop rereads one present 4 KiB page but jumps among cache lines. Which event is possible?", ["CPU cache misses without page faults", "Page faults on every instruction by definition", "Only file-cache misses", "A new process for each line"], 0, "The page can remain resident while individual cache lines move through the CPU cache hierarchy."]
      },
      {
        title: "Coherence keeps values consistent but does not make sharing free",
        paragraphs: [
          "When cores cache the same memory, the coherence protocol coordinates ownership and visibility. If several threads repeatedly write data that occupies the same cache line, the line can bounce among cores. This false sharing occurs even when the threads update different variables.",
          "Performance claims require repeated measurements, fixed input, limited output, and awareness of warm-up, power policy, background load, interpreter overhead, and compiler behavior. One timing difference suggests a question, not a complete microarchitectural explanation."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "One load searches progressively larger stores",
        intro: "The exact hardware is model-specific, but the locality relationship is stable.",
        items: [
          { meta: "Instruction", label: "Registers", detail: "Operands already available", linkAfter: "miss searches" },
          { meta: "Hardware cache", label: "L1, L2, shared cache", detail: "Cache-line copies close to cores", linkAfter: "miss reaches" },
          { meta: "Physical memory", label: "RAM", detail: "Resident page frames", linkAfter: "page not resident" },
          { meta: "Kernel and storage", label: "Backing data", detail: "Mapped file, page file, or demand-zero source" }
        ],
        caption: "A page can be resident in RAM while its cache line is absent from every CPU cache."
      }
    ],
    workedExamples: [
      {
        type: "comparison",
        title: "Why identical byte counts can have different costs",
        prompt: "Two loops read 64 MiB once. One walks every byte in order, the other touches one byte per cache-line-sized stride in a shuffled order.",
        columns: [
          { title: "Sequential walk", rows: [["Locality", "Neighboring bytes arrive together"], ["Prefetch", "Regular pattern is easier to predict"], ["Translation", "Nearby accesses reuse page translations"], ["Expected tendency", "Higher useful bytes per fetched line"]] },
          { title: "Shuffled stride", rows: [["Locality", "Many fetched bytes may go unused"], ["Prefetch", "Irregular next address is harder to predict"], ["Translation", "Large working sets pressure the TLB"], ["Expected tendency", "More latency per useful byte"]] }
        ],
        shared: "Both loops read the same allocated buffer and can finish without any hard page faults once the pages are resident.",
        conclusion: "Access pattern, not only total bytes, determines cache usefulness."
      }
    ],
    windowsLearning: [
      {
        title: "CPU cache, file cache, and working set are separate layers",
        paragraphs: [
          "Task Manager can report hardware cache capacities, while CPU tools expose model-specific cache details. Process working set is the set of its pages currently resident and attributed to it. RAMMap shows active, standby, modified, mapped-file, and other physical-page uses. None of these views directly lists each CPU cache line.",
          "The Windows file cache retains file data in RAM. Repeating a file read can become faster because the data is cached in physical memory even when it is not present in a core's CPU cache. FlushFileBuffers concerns buffered I/O durability and is not an instruction that empties CPU caches."
        ]
      },
      {
        title: "Counters support a bounded performance conclusion",
        paragraphs: [
          "Use elapsed time for the user-visible result, process CPU time for executed work, and hardware performance counters only when a suitable profiler supplies them. Process Explorer and Performance Monitor can reveal CPU and memory changes, but attributing a timing difference specifically to L1 or TLB behavior requires lower-level counters and a controlled benchmark.",
          "The supplied cache lecture gives the correct locality foundation but simplifies replacement as least-recently-used. Real cache replacement and prefetch policies are hardware-specific approximations, so programs should optimize access patterns rather than assume one exact eviction algorithm."
        ]
      }
    ],
    practice: {
      title: "Compare sequential and strided access",
      time: "15 min",
      intro: "Use cache_locality_lab.py to run fixed sequential and strided access modes over the same buffer.",
      download: ["downloads/cache_locality_lab.py", "cache_locality_lab.py"],
      expectedOutcome: "Sequential access will usually provide better useful throughput than a sufficiently irregular or large-stride pattern, but exact ratios depend on Python overhead, buffer size, cache hierarchy, memory speed, and background load. Equal checksums establish comparable logical work, not identical machine instructions.",
      steps: [
        {
          action: "Download cache_locality_lab.py, open PowerShell in its folder, and run the fixed 64 MiB sequential mode.",
          commands: [{ label: "PowerShell", code: "py .\\cache_locality_lab.py --mib 64 --mode sequential" }],
          why: "The supplied mode establishes the buffer, visit count, checksum, and one machine-dependent timing observation.",
          observe: "cache_locality_lab.py prints mode: sequential, buffer bytes, sampled lines, checksum, visits, elapsed milliseconds, and million visits per second. A dependency or allocation error is the setup-failure branch."
        },
        {
          action: "Run the fixed 64 MiB strided mode; only --mode changes from step 1.",
          commands: [{ label: "PowerShell", code: "py .\\cache_locality_lab.py --mib 64 --mode strided" }],
          why: "Changing only access order makes locality the intended independent variable.",
          observe: "cache_locality_lab.py prints mode: strided with the same buffer bytes, sampled lines, checksum, and visits as sequential mode. Elapsed time and throughput remain machine-dependent."
        },
        { action: "Compare the labelled checksum, sampled lines, and visits values visible in the two terminal outputs.", why: "Matching fixed work fields distinguishes the access-order change from a changed workload.", observe: "The fixed work fields match. The elapsed and throughput fields can differ, but they do not identify an exact cache boundary or replacement policy." }
      ],
      hints: [{ title: "The timings are almost identical", body: "That is a valid machine-dependent result. Python loop overhead can hide smaller hardware effects." }],
      cleanup: ["Both cache_locality_lab.py invocations release their bytearrays when they exit; no lab file is created."]
    },
    checks: [
      ["Which locality describes reusing the same value soon?", ["Spatial locality", "Temporal locality", "Address randomization", "Page protection"], 1, "Temporal locality rewards recently used data remaining close to execution."],
      ["What does FlushFileBuffers target?", ["CPU cache lines", "Buffered data for a file or device handle", "Every process working set", "The TLB"], 1, "It requests buffered I/O be pushed through the relevant stack. It is not a CPU-cache flush command."],
      ["What is false sharing?", ["Two processes use the same PID", "Independent variables on one cache line cause coherence traffic", "A file is mapped read-only", "Two pages share a virtual address"], 1, "Writes to different data can still contend when the data occupies the same coherence unit."]
    ]
  },

  "virtual-address-translation": {
    apis: ["VirtualAlloc", "VirtualFree", "VirtualQueryEx", "win32process.GetProcessMemoryInfo"],
    phases: {
      learn: ["Translate one virtual address", "Follow a process address through page tables, the TLB, and a physical frame."],
      windows: ["Read address-space evidence", "Connect reservation, commitment, residency, protection, and process isolation."],
      investigation: ["Compare virtual and resident size", "Create known regions and explain why allocation totals do not equal immediate RAM use."],
      review: ["Check the translation model", "Test isolation, TLBs, commitment, residency, and protection."]
    },
    learning: [
      {
        title: "Each process receives a private translation context",
        paragraphs: [
          "A thread issues virtual addresses. The CPU combines the address with the current process translation context to locate a page-table entry, check access, and identify a physical frame or another backing condition. The same virtual value in two processes can therefore refer to different frames, and changing one process's mapping does not rewrite the other's table.",
          "User mode cannot edit page tables directly. Windows creates and changes mappings through memory-manager operations, and the CPU enforces the resulting present, writable, executable, user-accessible, and other architecture-specific attributes."
        ]
      },
      {
        title: "The TLB caches translations, not application bytes",
        paragraphs: [
          "Walking multilevel page tables for every load would be expensive, so the translation lookaside buffer caches recent virtual-page translations. A TLB hit supplies the translation quickly. A TLB miss can be resolved by a hardware page-table walk without being a Windows page fault if the page-table entry is valid.",
          "A context switch may change the active address-space context. Modern processors and Windows can preserve or tag some translations, but stale mappings must never be used for the wrong process. This translation work is distinct from saving a thread's register context."
        ],
        inlineCheck: ["A translation is absent from the TLB, but the page-table entry is valid and present. What must happen?", ["The process always terminates", "A page-table walk can refill the TLB", "The file must be loaded from disk", "A new PID is allocated"], 1, "A TLB miss is not automatically a page fault. Valid page-table state can satisfy the translation in hardware."]
      },
      {
        title: "Reserved, committed, and resident describe different questions",
        paragraphs: [
          "Reservation claims a virtual address range so other allocations do not use it. Commitment establishes that pages can receive backing when accessed, subject to system commit limits. Residency says whether a committed page currently occupies a physical frame in the process working set.",
          "A large reserved range can consume almost no physical memory. Committed demand-zero pages may receive physical frames only when touched. Resident pages can later leave a working set while remaining committed. Treat virtual size, commit, private bytes, and working set as different measurements."
        ],
        callout: { label: "Do not say allocated without a qualifier", text: "State whether you mean reserved address range, committed backing, resident working set, heap block, mapped view, or a language object." }
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "Translate one load from virtual byte to physical byte",
        intro: "Protection and presence are checked before the instruction receives data.",
        items: [
          { meta: "Process view", label: "Virtual address", detail: "Virtual page number plus offset", linkAfter: "TLB lookup" },
          { meta: "Fast translation", label: "Cached mapping", detail: "Hit, or walk page tables on miss", linkAfter: "validate PTE" },
          { meta: "Memory-manager state", label: "Page-table entry", detail: "Present, access, backing information", linkAfter: "select frame" },
          { meta: "Physical memory", label: "Frame plus offset", detail: "The requested byte in RAM" }
        ],
        caption: "If the PTE cannot satisfy the access directly, the processor raises a page fault for Windows to handle."
      }
    ],
    workedExamples: [
      {
        type: "trace",
        title: "First access to a committed demand-zero page",
        prompt: "A process reserves and commits a read/write page but has not touched it yet.",
        steps: [
          { title: "Instruction writes", action: "The CPU translates the page and finds state requiring memory-manager attention.", why: "Commit guarantees backing can be provided, not that this exact page already has a private frame.", result: "A page fault enters the kernel." },
          { title: "Windows supplies a page", action: "The memory manager provides a zero-filled physical page and updates the mapping.", why: "Demand-zero pages need no application data read from disk.", result: "The page becomes valid and resident." },
          { title: "Instruction restarts", action: "The processor retries the original write through the new translation.", why: "A successfully handled fault is transparent to normal application control flow.", result: "The byte changes and execution continues." },
          { title: "Later access hits", action: "A later access can use the valid mapping and cached translation.", why: "No state transition is needed while the page remains accessible and resident.", result: "No demand-zero fault is required for that page." }
        ],
        conclusion: "Page fault means the access required operating-system handling, not necessarily that storage I/O occurred."
      }
    ],
    windowsLearning: [
      {
        title: "VMMap classifies regions while RAMMap explains physical use",
        paragraphs: [
          "VMMap shows one process's virtual regions, committed sizes, working set, protection, and categories such as Image, Heap, Stack, and Private Data. RAMMap reorganizes physical memory by use and list state. Use VMMap for a process address question and RAMMap for a system physical-page question.",
          "Process Explorer totals are summaries. Private Bytes approximates private committed memory, Working Set reports resident pages attributed to the process, and Virtual Size covers address-space mappings. Differences among them are expected, not measurement errors."
        ]
      },
      {
        title: "VirtualQueryEx reports mapping state, not physical frame numbers",
        paragraphs: [
          "VirtualQueryEx returns the region containing or following a queried address, coalescing pages with matching attributes. It reports BaseAddress, AllocationBase, RegionSize, State, Protect, and Type. It does not reveal the physical frame number and does not prove a page is resident.",
          "QueryWorkingSetEx and working-set tools address residency questions with their own race and permission limits. Keep the question precise before choosing the API."
        ]
      },
      {
        title: "Repair the supplied vmem_to_csv traversal before trusting its output",
        paragraphs: [
          "The supplied script correctly identifies the main ingredients, but its OpenProcess call passes PROCESS_VM_READ as the Boolean inherit argument instead of combining access flags, its inclusive end adds one instead of subtracting one, and its displayed range begins at AllocationBase rather than BaseAddress. Free regions also have no defined allocation base to format. These mistakes produce convincing CSV rows with incorrect geometry.",
          "The corrected starter requests PROCESS_QUERY_INFORMATION and sets bInheritHandle to False. It uses WinDLL with use_last_error, declares SIZE_T and pointer fields, and advances by BaseAddress + RegionSize. It stops at the reported maximum application address and treats an earlier zero return as a failure. It also decodes protection modifiers as bit flags, leaves undefined fields blank, and closes the process handle in finally. Cross-architecture inspection remains an explicit limitation."
        ]
      }
    ],
    codeWalkthroughs: [
      {
        title: "Build a reliable VirtualQueryEx CSV exporter",
        intro: "Each stage repairs one prerequisite from the supplied skeleton before the next stage depends on it.",
        stages: [
          { title: "Model the native record", explanation: "Field order, pointer width, SIZE_T, DWORD fields, and native alignment must match MEMORY_BASIC_INFORMATION.", code: "class MEMORY_BASIC_INFORMATION(ctypes.Structure):\n    _fields_ = [\n        (\"BaseAddress\", wintypes.LPVOID),\n        (\"AllocationBase\", wintypes.LPVOID),\n        (\"AllocationProtect\", wintypes.DWORD),\n        (\"PartitionId\", wintypes.WORD),\n        (\"RegionSize\", ctypes.c_size_t),\n        (\"State\", wintypes.DWORD),\n        (\"Protect\", wintypes.DWORD),\n        (\"Type\", wintypes.DWORD),\n    ]" },
          { title: "Open without accidental inheritance", explanation: "The second OpenProcess parameter is a Boolean, so desired access belongs entirely in the first argument.", code: "process = win32api.OpenProcess(\n    win32con.PROCESS_QUERY_INFORMATION,\n    False,\n    pid,\n)" },
          { title: "Query and advance", explanation: "A successful row determines the next address. Failure before the known address limit is reported, and the loop rejects a non-advancing result.", code: "written = VirtualQueryEx(process, address, byref(region), sizeof(region))\nif not written:\n    raise ctypes.WinError(ctypes.get_last_error())\nnext_address = int(region.BaseAddress or 0) + region.RegionSize\nif next_address <= address:\n    raise RuntimeError(\"address traversal did not advance\")\naddress = next_address" },
          { title: "Render the correct range", explanation: "BaseAddress starts this query region, AllocationBase identifies the larger originating allocation, and the inclusive end subtracts one.", code: "base = int(region.BaseAddress or 0)\nend_inclusive = base + region.RegionSize - 1\nallocation_base = \"\" if region.State == MEM_FREE else hex(region.AllocationBase)" },
          { title: "Close the acquired handle", explanation: "CSV or decoding failures must not leak the process handle.", code: "process = win32api.OpenProcess(access, False, pid)\ntry:\n    write_memory_map(process, output)\nfinally:\n    win32api.CloseHandle(process)" }
        ]
      }
    ],
    practice: {
      title: "Separate reservation, commitment, and residency",
      time: "50 min",
      intro: "Use a staged allocation as known ground truth, then export its process map with the corrected VirtualQueryEx traversal.",
      downloads: [["downloads/virtual_allocation_lab.py", "virtual_allocation_lab.py", "Staged allocation"], ["downloads/memory_map_csv_lab.py", "memory_map_csv_lab.py", "CSV exporter"]],
      expectedOutcome: "After reservation, VMMap and the CSV should show a reserved three-page range with a common allocation base. After the first page is committed and touched, the query sequence should split at the state boundary. CSV ranges should be contiguous where Windows reports adjacent regions, use BaseAddress as their start, and end at BaseAddress + RegionSize - 1.",
      steps: [
        {
          action: "Download virtual_allocation_lab.py and memory_map_csv_lab.py. In the first PowerShell window opened in their folder, run the staged allocator and leave it at 'Inspect the reserved range'.",
          commands: [{ label: "Allocator PowerShell", code: "py .\\virtual_allocation_lab.py" }],
          why: "The returned base is authoritative even when a caller suggests an address.",
          observe: "virtual_allocation_lab.py prints PID, page size, allocation granularity, reserved base, and three page addresses before pausing. If py is unavailable, the dependency message is the setup-failure branch."
        },
        { action: "At the reserved pause, open the PID printed by virtual_allocation_lab.py in VMMap with File > Select Process and find the printed reserved base in the lower Details view.", why: "Reservation changes virtual ownership without committing backing.", observe: "The row shows the three-page Size as reserved. Committed and Total WS remain separate commitment and residency fields with machine-dependent values." },
        { action: "Press Enter once to commit and touch page 0; refresh VMMap. Press Enter again to commit and touch page 1; refresh again, leaving virtual_allocation_lab.py at the read-only transition prompt.", why: "Separating the calls makes each allocation stage visible.", observe: "VMMap first shows page 0 committed and then pages 0 and 1 committed, while page 2 remains reserved. Address, Committed, Private, Total WS, and Protection update without becoming answers to enter." },
        {
          action: "While virtual_allocation_lab.py remains paused, open a second PowerShell window in the same folder. Enter the allocator PID when prompted and export the exact .\\memory-map.csv path with memory_map_csv_lab.py.",
          commands: [{ label: "Exporter PowerShell", code: "$csvPath = Join-Path $PWD 'memory-map.csv'\nif (Test-Path -LiteralPath $csvPath) { throw \"Remove or rename the existing lab file first: $csvPath\" }\n$targetPid = [int](Read-Host 'Enter the PID printed by virtual_allocation_lab.py')\npy .\\memory_map_csv_lab.py $targetPid $csvPath" }],
          why: "The known three-page allocation gives memory_map_csv_lab.py an externally verifiable target.",
          observe: "memory_map_csv_lab.py prints the number of regions written for the entered PID and the exact memory-map.csv path. The CSV contains BaseAddress, AllocationBase, RegionSizeBytes, State, Protect, and Type columns; OpenProcess denied and an exited PID are distinct branches."
        },
        { action: "Return to virtual_allocation_lab.py, press Enter to make page 1 read-only, refresh VMMap, then press Enter at the final prompt to call MEM_RELEASE and let the process exit.", why: "MEM_RELEASE returns the entire reservation rather than decommitting one page.", observe: "virtual_allocation_lab.py prints page 1 old protection: 0x4, VMMap shows page 1 read-only, and the final message names the released base. After exit the target is unavailable rather than a live free region." },
        {
          action: "After memory_map_csv_lab.py and virtual_allocation_lab.py exit, run this PowerShell cleanup block for the exported CSV.",
          commands: [{ label: "PowerShell", code: "$csvPath = Join-Path $PWD 'memory-map.csv'\nif (Test-Path -LiteralPath $csvPath) { Remove-Item -LiteralPath $csvPath }\nTest-Path -LiteralPath $csvPath" }],
          why: "The showcase removes only the CSV path it deliberately created.",
          observe: "PowerShell prints False. A True result means the owned CSV remains."
        }
      ],
      hints: [{ title: "VMMap does not show the exact row", body: "Refresh the correct PID, search for the printed base, and keep the script at the matching pause. Address-space state can disappear immediately after release." }],
      cleanup: ["If virtual_allocation_lab.py is still paused, press Enter until its finally block reports MEM_RELEASE.", "Close VMMap; the final PowerShell block removes only memory-map.csv."]
    },
    checks: [
      ["What happens when a process reserves a virtual address range?", ["Every page becomes resident", "Other allocations cannot use that range", "Every page becomes executable", "The data is saved to disk"], 1, "Reservation sets aside part of the address space without necessarily committing storage for it."],
      ["What does a TLB cache?", ["File contents", "Recent virtual-to-physical translations and attributes", "Process command lines", "Registry values"], 1, "The TLB accelerates address translation."],
      ["Which memory measurement can be much larger than the process's working set?", ["A thread ID", "Its reserved virtual size or committed bytes", "A page offset", "Its CPU priority"], 1, "A process can reserve or commit a large range without keeping every page resident in physical memory."]
    ]
  },

  "pages-frames-page-tables": {
    apis: ["GetSystemInfo", "VirtualProtect", "QueryWorkingSetEx"],
    phases: {
      learn: ["Map pages to frames", "Connect fixed-size virtual pages, physical frames, PTE state, and region boundaries."],
      windows: ["Read page attributes", "Distinguish page size, allocation granularity, region coalescing, guards, and large pages."],
      investigation: ["Create a mixed-state allocation", "Observe how page-level changes split one allocation into several query regions."],
      review: ["Check the page model", "Test page counts, granularity, PTE meaning, protection, and region formation."]
    },
    learning: [
      {
        title: "Pages and frames are equal-size units in different spaces",
        paragraphs: [
          "A virtual address space is divided into pages, and physical memory is divided into frames of the corresponding hardware page size. A valid page-table entry connects a virtual page to a physical frame and carries access and state information. Contiguous virtual pages do not need contiguous physical frames.",
          "The byte offset is preserved during translation. Only the virtual page number is translated, so byte 0x37A within a virtual page refers to byte 0x37A within its selected frame."
        ]
      },
      {
        title: "Allocation granularity governs reservation starts, pages govern commitment",
        paragraphs: [
          "Windows rounds reservation addresses to the system allocation granularity and sizes to page boundaries. Once a range is reserved, individual pages or page-aligned subranges can be committed and protected. On a common 4 KiB page and 64 KiB granularity system, one granularity unit contains 16 pages.",
          "Never confuse these rules with heap granularity. A heap can return a small block because it suballocates from larger regions that the memory manager already reserved and committed."
        ],
        inlineCheck: ["How many 4 KiB pages fit in one 64 KiB allocation-granularity unit?", ["4", "8", "16", "64"], 2, "64 KiB divided by 4 KiB equals 16 pages."]
      },
      {
        title: "Page-table state controls access and fault handling",
        paragraphs: [
          "A PTE can describe a valid resident mapping or encode a condition that Windows can resolve, such as demand-zero, transition, mapped-file, or page-file backing. Details vary by architecture and Windows version, but the key contract is whether the requested access can proceed or must fault.",
          "Protection applies at page granularity. PAGE_GUARD causes a one-shot guard exception and then clears for the accessed page, supporting stack growth detection and instrumentation. PAGE_NOACCESS is different, it denies access rather than providing a normal synchronization boundary."
        ]
      }
    ],
    visuals: [
      {
        type: "map",
        title: "One reservation can contain several page states",
        intro: "VirtualQueryEx splits the allocation wherever state or protection changes.",
        items: [
          { meta: "Allocation base", label: "Page 0", detail: "Committed, read/write", linkAfter: "next page differs" },
          { meta: "Same allocation", label: "Page 1", detail: "Committed, read-only", linkAfter: "next page differs" },
          { meta: "Same allocation", label: "Page 2", detail: "Reserved, no committed protection", linkAfter: "query returns" },
          { meta: "Region results", label: "Three rows", detail: "Shared AllocationBase, distinct BaseAddress" }
        ],
        caption: "Region boundaries describe consecutive equal attributes, not separate original reservations."
      }
    ],
    workedExamples: [
      {
        type: "calculation",
        title: "Round a request using two granularities",
        prompt: "A caller requests a reservation near 0x12345 for 5000 bytes on a system with 64 KiB allocation granularity and 4 KiB pages.",
        steps: [
          { title: "Align the requested base", action: "Round the reservation address down to a 0x10000 boundary.", result: "0x12345 -> 0x10000", why: "Reservation start addresses use allocation granularity." },
          { title: "Round the byte count", action: "Round 5000 bytes up to complete 0x1000-byte pages.", result: "5000 decimal -> 8192 bytes = 0x2000", why: "Page state cannot cover a fraction of a page." },
          { title: "Use the returned values", action: "Treat the API return and subsequent query as authoritative.", result: "Observed base and size can reflect rounding rules", why: "Hard-coding the requested value as the actual base produces invalid later calculations." }
        ],
        conclusion: "Query page size and allocation granularity separately, then use the returned allocation base."
      }
    ],
    windowsLearning: [
      {
        title: "GetSystemInfo supplies both values needed for alignment",
        paragraphs: [
          "The system information structure reports dwPageSize and dwAllocationGranularity. Page size controls commitment, protection, and ordinary region rounding. Allocation granularity controls the start addresses of reservations and mapped views. The values are often 4096 and 65536, but the program should report rather than assume them.",
          "Large pages are a separate facility with stricter alignment, privilege, and allocation requirements. They can reduce translation overhead for suitable workloads but waste more memory and should not be folded into the ordinary-page model without explicit evidence."
        ]
      },
      {
        title: "Region queries summarize runs of pages",
        paragraphs: [
          "VirtualQueryEx returns one MEMORY_BASIC_INFORMATION record for pages that share state, protection, and type. Changing one page to read-only can split a previously uniform three-page committed region into up to three query results even though AllocationBase remains the same.",
          "VMMap provides a higher-level category view. Use raw query rows when exact state transitions matter and VMMap when allocation purpose, committed total, working set, and category relationships matter."
        ]
      }
    ],
    practice: {
      title: "Observe region splitting page by page",
      time: "25 min",
      intro: "Continue with virtual_allocation_lab.py and follow every page-state transition this time.",
      download: ["downloads/virtual_allocation_lab.py", "virtual_allocation_lab.py"],
      expectedOutcome: "The single three-page reservation should acquire several VirtualQueryEx regions as pages are committed with different protections. Every committed or reserved subregion should retain the same AllocationBase while BaseAddress advances by page-sized amounts.",
      steps: [
        {
          action: "Download virtual_allocation_lab.py, open PowerShell in its folder, run it, and leave it at 'Inspect the reserved range'.",
          commands: [{ label: "PowerShell", code: "py .\\virtual_allocation_lab.py" }],
          why: "Using the printed base plus N times the printed page size connects arithmetic to exact subranges.",
          observe: "virtual_allocation_lab.py prints PID, page size, reserved base, and three page addresses before pausing. If py is unavailable, the dependency message is the setup-failure branch."
        },
        { action: "Open the PID printed by virtual_allocation_lab.py in VMMap with File > Select Process. At the reserve pause and after each of the two commit prompts, refresh the lower Details view over the three printed page addresses.", why: "The controlled pauses make region splitting visible over time.", observe: "The range starts reserved, then shows page 0 committed, then pages 0 and 1 committed. VMMap displays Address, Allocation Base, Size, Committed, Type, Total WS, and Protection as observations only." },
        { action: "Press Enter at the third prompt to make page 1 read-only, then refresh VMMap before advancing again.", why: "Protection changes are page-level causes of new query regions.", observe: "Confirm virtual_allocation_lab.py reports old protection 0x4 and VMMap shows page 1 read-only; page 0 remains read/write and page 2 remains reserved." },
        { action: "Press Enter at the final prompt so virtual_allocation_lab.py calls VirtualFree with the printed allocation base, size zero, and MEM_RELEASE; then refresh VMMap.", why: "MEM_RELEASE operates on the allocation base with size zero.", observe: "released full reservation names the same printed base, the process exits, and VMMap can no longer refresh that PID." }
      ],
      hints: [{ title: "Two adjacent pages remain one row", body: "That is expected when their state, type, and protection match. A region is a run of equal page attributes, not one row per page." }],
      cleanup: ["If virtual_allocation_lab.py is still paused, press Enter until it calls MEM_RELEASE.", "Close VMMap after the process exits."]
    },
    checks: [
      ["What remains unchanged during ordinary page translation?", ["The virtual page number", "The byte offset within the page", "The process PID", "The protection mask"], 1, "Translation selects a frame while preserving the within-page byte offset."],
      ["Why can one allocation produce several VirtualQueryEx rows?", ["Every byte gets a row", "Adjacent pages have different state or protection", "The PID changed", "The file is compressed"], 1, "VirtualQueryEx coalesces only consecutive pages with matching attributes."],
      ["How does PAGE_GUARD behave?", ["It acts as a permanent mutex", "It raises an exception on the first access and then clears", "It flushes the file cache", "It counts allocation references"], 1, "The first guard-page access raises an exception and clears the guard state for that page."]
    ]
  },

  "page-faults-pagefile": {
    apis: ["VirtualAlloc", "VirtualFree", "GlobalMemoryStatusEx", "QueryWorkingSetEx"],
    phases: {
      learn: ["Classify a page fault", "Separate demand-zero, copy-on-write, mapped-file, page-file, and invalid accesses."],
      windows: ["Read pressure evidence", "Interpret fault counters, working sets, standby pages, commit, and storage activity together."],
      investigation: ["Touch pages twice", "Compare first-touch and repeated access without forcing unsafe system pressure."],
      review: ["Check the fault path", "Test soft versus hard handling, page-file purpose, commitment, and invalid access."]
    },
    learning: [
      {
        title: "Page fault describes a control transfer, not one storage event",
        paragraphs: [
          "The processor raises a page fault when current translation state cannot complete an access. Windows may satisfy it with a demand-zero page, a page already on a transition or standby list, a copy-on-write duplicate, mapped-file data, or page-file data. Only faults that require storage reads are hard faults.",
          "A protection violation and an access to uncommitted memory also fault, but Windows cannot make every such request valid. If no exception handler resolves the condition, the process receives an access violation."
        ],
        inlineCheck: ["A newly committed demand-zero page is written for the first time. Must Windows read that page from disk?", ["Yes, every fault is a disk read", "No, Windows can supply a zero-filled frame", "Yes, from the executable", "No, because no fault occurs"], 1, "Demand-zero handling can supply a cleared physical page without reading application data from storage."]
      },
      {
        title: "Working-set removal does not cancel commitment",
        paragraphs: [
          "A process working set contains resident pages currently attributed to it. Windows can trim a page from that set while preserving enough information to recover it later. A clean mapped-file page may be discarded and reread from its file, while a changed private page needs suitable backing before its frame can be reused.",
          "A soft fault can reconnect a page already in RAM, often from a standby or shared state. A hard fault waits for storage. Both increment page-fault activity, so a high fault count alone does not prove page-file thrashing."
        ]
      },
      {
        title: "The page file supports commit and private-page backing",
        paragraphs: [
          "The page file is not a simple overflow bucket that becomes active only after RAM is full. It contributes to the system commit limit and can back private committed pages that are not resident. Windows balances working sets, standby data, modified pages, files, compression on supported systems, and page-file use according to current conditions.",
          "Disabling or resizing the page file changes crash-dump capability and commit behavior as well as paging. It is outside this course investigation. Observe the existing configuration without modifying it."
        ],
        callout: { label: "Use precise evidence", text: "Page Faults/sec includes faults resolved without disk. Pair it with hard-fault or page-read evidence, working-set changes, commit, and storage latency before claiming thrashing." }
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "Windows branches after a page fault",
        intro: "The backing condition determines cost and whether execution can continue.",
        items: [
          { meta: "CPU", label: "Access cannot complete", detail: "Missing, protected, or copy-on-write state", linkAfter: "fault enters kernel" },
          { meta: "Memory manager", label: "Classify backing", detail: "Demand-zero, resident list, file, page file, invalid", linkAfter: "resolve or reject" },
          { meta: "Valid branch", label: "Update PTE", detail: "Supply frame, copy, or read backing data", linkAfter: "restart" },
          { meta: "Invalid branch", label: "Raise exception", detail: "Access violation if unhandled" }
        ],
        caption: "Hard faults are the subset whose valid resolution requires storage I/O."
      }
    ],
    workedExamples: [
      {
        type: "branch",
        title: "Interpret four accesses that all fault",
        prompt: "The processor enters the page-fault handler, but the correct next action depends on the page state.",
        setupCode: "faulting virtual address + requested read/write/execute access",
        branches: [
          { value: "Demand zero", meaning: "Committed private page has no data yet", action: "Supply a cleared frame and restart." },
          { value: "Copy on write", meaning: "Write targets a shared copy-on-write page", action: "Create a private copy, update mapping, and restart." },
          { value: "Hard fault", meaning: "Required content is not currently in RAM", action: "Read backing data, wait, update mapping, and restart." },
          { value: "Invalid access", meaning: "Uncommitted address or denied protection cannot be resolved", action: "Deliver an access-violation exception." }
        ],
        conclusion: "Fault count, fault type, and outcome are separate facts."
      }
    ],
    windowsLearning: [
      {
        title: "Use several counters to distinguish activity from pressure",
        paragraphs: [
          "Process Explorer can show per-process page faults and working set. Resource Monitor reports hard faults per second. Performance Monitor exposes process and memory counters, including page faults, page reads, committed bytes, and available memory. RAMMap shows active, standby, modified, and other physical lists.",
          "Counters are interval observations. A program can accumulate many harmless first-touch soft faults. A concerning pressure story usually also includes constrained available memory, working-set churn, hard-fault storage reads, sustained latency, and affected responsiveness."
        ]
      },
      {
        title: "Avoid forcing pressure or trimming unrelated processes",
        paragraphs: [
          "EmptyWorkingSet and working-set limit APIs can perturb a process dramatically and make measurements artificial. VirtualLock consumes a limited resource and does not make arbitrary data permanently immune to all system behavior. These are not required for the guided lab.",
          "Use a modest owned allocation, observe natural first-touch behavior, and stop if the machine is memory constrained. The course aims to explain memory management, not manufacture a system-wide paging incident."
        ]
      }
    ],
    practice: {
      title: "Compare first touch with repeated touch",
      time: "30 min",
      intro: "Commit a modest demand-zero region, touch one byte per page, then touch the same pages again while observing fault counters.",
      download: ["downloads/page_fault_lab.py", "page_fault_lab.py"],
      expectedOutcome: "The first touch normally causes substantially more page-fault activity than the immediate second touch because each demand-zero page needs initial resolution. Most first-touch faults should not require storage reads. Exact counts differ because the interpreter, monitoring tools, and background activity also fault.",
      safety: "Keep the default 64 MiB unless the machine has ample available memory. Do not modify the page-file configuration, trim unrelated working sets, or increase the allocation until the system becomes unresponsive.",
      steps: [
        {
          action: "Download page_fault_lab.py, open PowerShell in its folder, run the 64 MiB page-fault workload, and leave it at 'committed but untouched'.",
          commands: [{ label: "PowerShell", code: "py .\\page_fault_lab.py --mib 64" }],
          why: "This CPU- and memory-bound mode separates commit from physical first touch.",
          observe: "page_fault_lab.py prints PID, base, size: 64 MiB, and page count before the committed-but-untouched pause. In Process Explorer, the exact PID exposes Page Faults, Private Bytes, and Working Set; a py failure is the setup-failure branch."
        },
        { action: "Open Performance Monitor and choose Monitoring Tools > Performance Monitor, then select Add Counters. On Windows 11 or later, expand Process V2 and add Page Faults/sec and Working Set - Private for the Python instance whose name contains the PID printed by page_fault_lab.py. If Process V2 is unavailable, first add ID Process for every python instance and find the series whose Last value matches the PID. Remove those temporary ID counters, then add Page Faults/sec and Working Set - Private only for the matching instance. Add Memory > Page Reads/sec as a system-wide comparison. Press Enter once in page_fault_lab.py and watch the counters until it prints the first-touch timing.", why: "Matching the PID prevents Performance Monitor from attaching the counters to another Python process. Writing once to each page then triggers demand-zero handling.", observe: "The target's page-fault and private-working-set counters change during the first touch, while page_fault_lab.py prints the checksum and elapsed time. Memory > Page Reads/sec is system-wide, so do not attribute it solely to the test process. If the process has exited, restart step 1 and match its new PID before touching the pages." },
        { action: "At page_fault_lab.py's second pause, press Enter once and sample the same counters until second touch elapsed prints.", why: "The repeated access uses the same page order against already valid and recently resident mappings.", observe: "page_fault_lab.py prints the same fixed checksum for second touch. Elapsed time and counter deltas vary, and the repeated touch is not required to show an exact zero." },
        { action: "At page_fault_lab.py's final pause, press Enter once and wait for released demand-zero test region.", why: "Explicit cleanup distinguishes release from working-set trimming.", observe: "The release message appears before process exit. If the PID disappears before a final refresh, that is the exited-target branch rather than a counter value to guess." }
      ],
      hints: [{ title: "Hard faults appear during the run", body: "Monitoring tools, Python modules, antivirus, or other processes can cause unrelated storage activity. Keep the PID and interval correlation, and do not attribute every system hard fault to the test region." }],
      cleanup: ["If page_fault_lab.py is still paused, press Enter until it calls VirtualFree with MEM_RELEASE.", "Close monitoring tools and leave page-file settings unchanged."]
    },
    checks: [
      ["Which page fault necessarily requires storage I/O?", ["Every demand-zero fault", "A hard fault", "Every copy-on-write fault", "Every guard-page fault"], 1, "Hard fault is the term for a fault whose resolution must obtain data from storage."],
      ["What remains after a clean mapped page leaves a working set?", ["The entire process must end", "Its file can remain the backing source", "Its PID becomes the page address", "The page becomes a mutex"], 1, "Clean mapped data can be discarded from RAM and read again from its mapped file."],
      ["Why is Page Faults/sec insufficient to prove thrashing?", ["It excludes every process", "It includes faults resolved without disk", "It measures CPU temperature", "It is always zero"], 1, "Soft faults and normal first-touch activity contribute to the counter."]
    ]
  },

  "shared-memory-copy-on-write": {
    apis: ["CreateFileMappingW", "OpenFileMappingW", "MapViewOfFile", "UnmapViewOfFile"],
    phases: {
      learn: ["Share pages deliberately", "Distinguish shared views, copy-on-write views, persistence, and synchronization."],
      windows: ["Follow a section object", "Connect file mappings, named objects, view protections, handles, and process lifetimes."],
      investigation: ["Compare shared and private writes", "Use two processes and a copy-on-write view to test visibility and persistence."],
      review: ["Check sharing semantics", "Test view identity, COW faults, ordering, cleanup, and file persistence."]
    },
    learning: [
      {
        title: "Shared memory maps the same section into several address spaces",
        paragraphs: [
          "Windows file mapping APIs create or open a section object and map views into processes. Each process receives its own virtual addresses, but corresponding pages can refer to the same underlying section data. The numeric bases do not need to match for communication to work.",
          "A page-file-backed section provides shared volatile storage. A file-backed section connects view contents to a file. Handle access, view access, and page protection remain explicit, and each process must unmap its views and close owned handles."
        ]
      },
      {
        title: "Visibility does not supply a message protocol",
        paragraphs: [
          "When one process writes a shared view, another mapping can observe the bytes. That does not make a multi-field update atomic, preserve message boundaries, or tell the reader when the data is complete. Use an event, mutex, semaphore, atomic state field, or another defined protocol for ordering and ownership.",
          "A shared mapping should define layout, encoding, version, length, valid states, and recovery if one process exits during an update. Otherwise fast shared memory becomes an ambiguous byte array."
        ],
        inlineCheck: ["Two processes map the same bytes. What is still required before treating them as a reliable queue?", ["Matching virtual base addresses", "A synchronization and message-layout protocol", "The same PID", "Executable page permission"], 1, "Shared visibility alone does not define when data is complete or who owns each update."]
      },
      {
        title: "Copy-on-write creates private changes on the first write",
        paragraphs: [
          "A copy-on-write view initially reads from shared backing. When a process writes a page, the access faults and Windows gives that process a private writable copy. Other views continue to see the original backing page, and the private change is not written back as a shared file update.",
          "Windows process creation does not generally clone an entire parent address space through a Unix-style fork model. Study copy-on-write through image mappings, mapped-file copy views, and explicit Windows mapping contracts rather than assuming fork semantics."
        ]
      }
    ],
    visuals: [
      {
        type: "map",
        title: "Shared view and copy-on-write view diverge",
        intro: "Virtual addresses differ, backing identity determines visibility.",
        items: [
          { meta: "Backing", label: "Section page: HELLO", detail: "File or page-file-backed data", linkAfter: "mapped shared" },
          { meta: "Process A", label: "Shared view", detail: "Writes WORLD into common backing", linkAfter: "visible to" },
          { meta: "Process B", label: "Shared view", detail: "Reads WORLD after synchronization", linkAfter: "COW write creates" },
          { meta: "Process C", label: "Private copy", detail: "Reads original, private changes stay local" }
        ],
        caption: "The mapping mode, not equal virtual addresses, decides whether writes are shared."
      }
    ],
    workedExamples: [
      {
        type: "state",
        title: "One write to a copy-on-write page",
        prompt: "A process maps a file with copy access, then changes one byte.",
        steps: [
          { title: "Before", action: "The view reads the same original file-backed content as other mappings.", result: "No private changed page is needed yet.", why: "Read access can use common backing." },
          { title: "Trigger", action: "The process writes to the copy-on-write page.", result: "A write fault enters the memory manager.", why: "The shared backing cannot be overwritten through a copy view." },
          { title: "After", action: "Windows supplies a private page containing the original bytes plus the modification.", result: "This process sees its change, other views and the file do not.", why: "The PTE now selects private backing for that process." }
        ],
        conclusion: "Copy-on-write delays copying until a write and then changes sharing identity for the written page."
      }
    ],
    windowsLearning: [
      {
        title: "Section object lifetime and view lifetime are related but distinct",
        paragraphs: [
          "CreateFileMapping creates a section object and returns a handle. MapViewOfFile creates a virtual mapping. Closing the section handle does not automatically unmap an existing view, and unmapping one view does not close every section handle. Track both resources explicitly.",
          "A named mapping lets another process call OpenFileMapping, subject to namespace and security rules. The name locates the section object, while each successful open gives the caller its own handle with granted rights."
        ]
      },
      {
        title: "VMMap and Process Explorer answer complementary questions",
        paragraphs: [
          "VMMap can show mapped files, shared memory categories, private working set, and protection. Process Explorer can show Section handles and mapped-file paths where available. RAMMap provides a physical-memory and file-page perspective.",
          "A changed private page may increase private working-set evidence while the original mapped page remains shareable elsewhere. Measurements are snapshots, so pause the controlled scripts at defined states before comparing."
        ]
      }
    ],
    practice: {
      title: "Test shared visibility and copy isolation",
      time: "40 min",
      intro: "Use a named page-file-backed mapping for cross-process visibility, then a file copy view for private changes.",
      download: ["downloads/shared_mapping_lab.py", "shared_mapping_lab.py"],
      expectedOutcome: "The reader process should open the named mapping and see the creator's bytes even though its virtual base differs. After the reader writes and signals completion through the prompts, the creator should see the shared change. In copy mode, the process should see its private edit while reopening the file shows the original data unchanged.",
      steps: [
        {
          action: "Download shared_mapping_lab.py. In the first PowerShell window opened in its folder, run creator mode and leave it at Start reader mode. In Process Explorer select the printed creator PID, choose View > Show Lower Pane and View > Lower Pane View > Handles, then search for a Section handle.",
          commands: [{ label: "Creator PowerShell", code: "py .\\shared_mapping_lab.py creator" }],
          why: "Creator mode establishes the page-file-backed mapping Local\\ILOVEOS_SharedMappingLab and writes the initial bytes.",
          observe: "Creator mode prints PID, name: Local\\ILOVEOS_SharedMappingLab, a view address, and initial bytes b'creator says hello'. Process Explorer can show a Section handle; an unavailable name is a tool limitation."
        },
        {
          action: "In the second PowerShell window opened in the same folder, run reader mode and leave it at 'Let creator mode observe the update'.",
          commands: [{ label: "Reader PowerShell", code: "py .\\shared_mapping_lab.py reader" }],
          why: "Reader mode opens the existing named mapping, reads creator bytes, and writes the controlled shared update.",
          observe: "Reader mode prints a second PID, the same mapping name, its view address, the initial creator text, and reader wrote: b'reader updated shared bytes'. The two view addresses need not match. Without creator mode, the missing-mapping message is distinct from access denied."
        },
        { action: "While reader mode remains paused, press Enter once in creator mode so it consumes the shared bytes; leave creator mode at its second pause. Then press Enter in reader mode to close its view.", why: "The prompt ordering ensures creator mode consumes reader mode's value before reader mode closes its view.", observe: "Creator mode prints creator now reads: b'reader updated shared bytes'. Creator view and named mapping remain while reader-mode PID exits." },
        {
          action: "After pressing Enter at the creator's second pause so the last shared view closes, run copy mode in PowerShell.",
          commands: [{ label: "PowerShell", code: "py .\\shared_mapping_lab.py copy" }],
          why: "ACCESS_COPY demonstrates a private copy-on-write view over a disposable file created by shared_mapping_lab.py.",
          observe: "Copy mode prints its temporary path and view address, ORIGINAL FILE BYTES before the private write, PRIVATE! bytes in the view, unchanged reopened file bytes, and deleted controlled copy-on-write file."
        },
        { action: "Refresh Process Explorer after creator, reader, and copy modes have exited.", why: "The final snapshot confirms that all supplied views and processes completed their owned lifetimes.", observe: "All three printed PIDs are absent, the named mapping no longer has a live user handle, and copy mode already removed only its own temporary file." }
      ],
      checkpoints: [{ afterStep: 3, type: "short", prompt: "Complete the fixed shared update: reader updated shared [____]", answer: "bytes", acceptedAnswers: [], feedback: "Reader mode writes reader updated shared bytes, and creator mode displays the same fixed value." }],
      hints: [{ title: "The reader cannot open the mapping", body: "Keep the creator paused, use the exact default name, run both under the same user session, and avoid adding Global scope unless the security and privilege implications are understood." }],
      cleanup: ["If creator or reader mode is still paused, press Enter until both shared views close normally.", "Allow copy mode to delete only its own temporary file."]
    },
    checks: [
      ["Must two shared views use the same virtual address?", ["Yes, always", "No, their pages can map the same backing at different bases", "Only on 32-bit Windows", "Only for executables"], 1, "Sharing is based on the section and offsets, not equal process-local pointers."],
      ["What does a copy-on-write view do on first write?", ["Changes every process's mapping", "Creates private backing for the writing process", "Deletes the mapped file", "Closes the process handle"], 1, "The writer receives a private copy of the affected page."],
      ["Why is synchronization still required?", ["Memory cannot contain bytes", "Visibility alone does not define ordering or complete messages", "Mapped views have no addresses", "Windows cannot share pages"], 1, "A protocol must state when data is valid and coordinate competing access."]
    ]
  },

  "virtualalloc-heaps-protection": {
    apis: ["VirtualAlloc", "VirtualFree", "VirtualProtect", "VirtualQueryEx", "HeapAlloc", "HeapFree"],
    phases: {
      learn: ["Choose the allocation layer", "Relate VirtualAlloc regions, page protection, heap blocks, and language allocation."],
      windows: ["Use memory APIs safely", "Apply exact sizes, returned addresses, failure checks, old protection, and matching cleanup."],
      investigation: ["Rebuild the Alligator", "Observe reserve, commit, protect, heap suballocation, and release with corrected contracts."],
      review: ["Check memory ownership", "Test allocation choice, protections, granularity, failure, and cleanup."]
    },
    learning: [
      {
        title: "VirtualAlloc manages regions and pages, heaps manage small blocks",
        paragraphs: [
          "VirtualAlloc reserves and commits page-granular regions. It is appropriate when code needs explicit address-space control, page protections, large contiguous ranges, or mapping-like behavior. Repeatedly using it for tiny objects wastes address space and adds kernel transitions.",
          "A heap obtains larger regions from the virtual-memory system and suballocates blocks efficiently in user mode. Windows processes have a default process heap, can create additional heaps for special ownership or isolation needs, and language runtimes usually add their own allocators above these layers."
        ]
      },
      {
        title: "Protection expresses permitted access, not intended data type",
        paragraphs: [
          "Committed pages receive a protection such as read-only, read/write, execute/read, or no access. Modern designs avoid writable and executable permission on the same page because it weakens the distinction between data construction and code execution. PAGE_EXECUTE alone is not evidence that useful code exists there.",
          "VirtualProtect changes complete pages and returns the previous protection through an output parameter. If generated code is a legitimate requirement, the documented lifecycle includes writing under non-executable protection, changing to executable protection, flushing the instruction cache when required, and never executing untrusted bytes. This course does not generate code."
        ],
        inlineCheck: ["A page has PAGE_EXECUTE protection but contains only zero bytes. What does that protection tell you?", ["The page belongs to a hidden process", "The CPU may fetch instructions from it, but the bytes are not necessarily meaningful code", "Windows compiles the page automatically", "The process heap owns it automatically"], 1, "Page protection controls which kinds of access are allowed. It does not create valid instructions or make the page a safe control-flow target."]
      },
      {
        title: "Every successful acquisition defines a matching release",
        paragraphs: [
          "VirtualFree with MEM_RELEASE requires the original allocation base and size zero to release an entire reservation. MEM_DECOMMIT removes commitment from a page-aligned subrange but leaves the virtual range reserved. HeapFree requires the same heap that allocated the block. Mixing release families corrupts ownership.",
          "Check zero or null results immediately and capture last error before another call changes it. Use the returned base, not merely the requested address. Place cleanup in finally only after ownership has actually been acquired."
        ],
        callout: { label: "Correction to the supplied exercise", text: "The original Alligator demonstrates the intended states, but it assumes the requested address is the returned base, omits allocation-granularity handling, and relies on process exit instead of MEM_RELEASE." }
      }
    ],
    visuals: [
      {
        type: "state",
        title: "A safe virtual-allocation lifecycle",
        intro: "Each transition changes one explicit property and retains the base for cleanup.",
        items: [
          { meta: "No ownership", label: "Free address range", detail: "No pointer may be used", linkAfter: "reserve" },
          { meta: "Virtual ownership", label: "MEM_RESERVE", detail: "Address range claimed, no committed access", linkAfter: "commit pages" },
          { meta: "Backing guarantee", label: "MEM_COMMIT", detail: "Demand-zero pages with chosen protection", linkAfter: "change protection" },
          { meta: "Cleanup", label: "MEM_RELEASE", detail: "Original base, size zero" }
        ],
        caption: "Touching a committed page can add residency between commit and release."
      }
    ],
    workedExamples: [
      {
        type: "contract",
        title: "Reserve three pages, commit two, protect one, release all",
        prompt: "Construct the supplied Alligator goal with explicit return checks and ownership.",
        steps: [
          { title: "Reserve", action: "VirtualAlloc(NULL, 3 * page_size, MEM_RESERVE, PAGE_NOACCESS)", why: "Let Windows choose an allocation-granularity-aligned base unless a fixed address is genuinely required.", result: "Non-null base owns one three-page reservation." },
          { title: "Commit", action: "Commit page 0 and page 1 at base + N * page_size as PAGE_READWRITE.", why: "Commit operates within the returned reservation and can be page granular.", result: "Page 2 remains reserved." },
          { title: "Protect", action: "VirtualProtect(page 1, page_size, PAGE_READONLY, &old_protect)", why: "The output verifies the prior state and enables deliberate restoration.", result: "Page 0 is read/write, page 1 read-only, page 2 reserved." },
          { title: "Release", action: "VirtualFree(base, 0, MEM_RELEASE) inside finally.", why: "The matching release consumes the original allocation base.", result: "The full reservation returns to the free address space." }
        ],
        conclusion: "The returned base and matching release contract are as important as the visible page states."
      },
      {
        type: "comparison",
        title: "Select the right allocator",
        prompt: "Choose by required control, not by which API looks lower level.",
        columns: [
          { title: "Virtual memory API", rows: [["Granularity", "Pages and reservations"], ["Protection", "Explicit page permissions"], ["Typical use", "Large regions, guards, mappings, native runtimes"], ["Release", "VirtualFree with matching mode"]] },
          { title: "Heap or Python allocator", rows: [["Granularity", "Small blocks from larger regions"], ["Protection", "Normally ordinary data pages"], ["Typical use", "Objects, buffers, variable-size application data"], ["Release", "Matching heap or language owner"]] }
        ],
        shared: "Both ultimately rely on the process virtual address space and can fail under resource or contract constraints.",
        conclusion: "Application code should normally use its runtime allocator unless page-level behavior is the actual requirement."
      }
    ],
    windowsLearning: [
      {
        title: "pywin32 is concise, ctypes exposes the exact native contract",
        paragraphs: [
          "win32process.VirtualAllocEx and VirtualFreeEx make process-handle operations convenient and convert failures to Python exceptions. They remain governed by process rights, page alignment, allocation type, protection, and matching release rules. Use the current-process pseudo-handle only for the current process and do not close it.",
          "ctypes is valuable here because pointer-sized returns, SIZE_T, output protection pointers, use_last_error, and exact BOOL failure checks are central to the lesson. Configure argtypes and restype before the first call and retain Python objects that own any passed buffers."
        ]
      },
      {
        title: "VMMap reveals the allocator layers",
        paragraphs: [
          "A Python allocation can appear inside Heap or Private Data regions rather than as one obvious row matching the object size. The heap block starter prints a returned pointer and block size, while VMMap shows the larger heap and virtual-memory regions that support it.",
          "The virtual-allocation starter creates a distinctive three-page allocation with pauses. Compare requested size, rounded region size, protection boundaries, committed bytes, working set, and final release."
        ]
      }
    ],
    practice: {
      title: "Compare page allocation with heap suballocation",
      time: "50 min",
      intro: "Run virtual_allocation_lab.py and heap_allocation_lab.py so the low-level ownership rules and the higher-level allocator purpose remain distinct.",
      downloads: [["downloads/virtual_allocation_lab.py", "virtual_allocation_lab.py", "Virtual pages"], ["downloads/heap_allocation_lab.py", "heap_allocation_lab.py", "Heap block"]],
      expectedOutcome: "The virtual-memory starter should show one three-page reservation, staged commitment, a read-only protection change, and a full release. The heap starter should return a much smaller block from the process heap, report its usable size, preserve written bytes, and free it through the same heap. VMMap may show allocator regions much larger than either requested block.",
      safety: "Use only the current process and the provided modest sizes. Do not execute allocated memory, change another process, or write through the page after it becomes read-only.",
      steps: [
        {
          action: "Download virtual_allocation_lab.py and heap_allocation_lab.py. In PowerShell from their folder, run the virtual-page program and leave it at the reserved-range pause.",
          commands: [{ label: "PowerShell", code: "py .\\virtual_allocation_lab.py" }],
          why: "Each supplied pause makes one allocation state visible in VMMap.",
          observe: "virtual_allocation_lab.py prints PID, returned base, and three page addresses. In VMMap's lower Details view, the three-page range is reserved and not yet committed; a py failure is the setup-failure branch."
        },
        { action: "At the reserved-range pause, press Enter once to commit page 0. Leave virtual_allocation_lab.py at Inspect committed page 0, refresh the same PID in VMMap, and inspect the three printed page addresses.", why: "The first transition separates reservation from commitment while the allocation base remains unchanged.", observe: "VMMap shows page 0 committed read/write and pages 1 and 2 reserved, with Size, Committed, Private, Total WS, and Protection visible for the resulting rows." },
        { action: "Press Enter once to commit page 1. Leave virtual_allocation_lab.py at Inspect both committed pages, refresh the same PID in VMMap, and inspect the same three addresses.", why: "The second transition exposes the only changed state before protection changes.", observe: "VMMap shows pages 0 and 1 committed read/write and page 2 reserved. Committed, Private, Total WS, and Protection remain machine-dependent observations." },
        { action: "Press Enter once to make page 1 read-only. Leave virtual_allocation_lab.py at Inspect the final mixed state and refresh the same PID in VMMap.", why: "The supplied artifact avoids an invalid write after changing the protection.", observe: "Page 0 remains read/write, page 1 is read-only, page 2 remains reserved, and virtual_allocation_lab.py prints page 1 old protection: 0x4." },
        { action: "Press Enter at the final virtual_allocation_lab.py prompt and verify 'released full reservation' names the original base before process exit.", why: "Explicit release proves correct ownership independent of automatic process teardown.", observe: "Confirm the region disappears and no interior address is passed as the MEM_RELEASE base." },
        {
          action: "Run the 100-byte heap program and leave it at 'Find the containing heap region in VMMap'.",
          commands: [{ label: "PowerShell", code: "py .\\heap_allocation_lab.py --bytes 100" }],
          why: "A small block demonstrates process-heap suballocation below page granularity.",
          observe: "heap_allocation_lab.py prints PID, process heap, block pointer, requested bytes: 100, reported usable bytes, and checksum. In VMMap's lower Details view, the pointer falls inside a Heap row rather than a dedicated 100-byte virtual region."
        },
        { action: "Press Enter once in heap_allocation_lab.py after locating the containing Heap row.", why: "The heap block must be freed through the same process heap that allocated it.", observe: "heap_allocation_lab.py prints freed block through the same process heap and returns to PowerShell." }
      ],
      checkpoints: [{ afterStep: 4, type: "short", prompt: "Complete the fixed old page-1 protection printed by virtual_allocation_lab.py: 0x[____]", answer: "4", acceptedAnswers: ["04"], feedback: "PAGE_READWRITE is 0x4 before the supplied transition changes page 1 to read-only." }],
      hints: [{ title: "The heap pointer is hard to find in VMMap", body: "Search the address only to identify its containing region. Heap managers combine many blocks, so a 100-byte request should not appear as a dedicated 100-byte VMMap row." }],
      cleanup: ["If either supplied program is still paused, press Enter until its finally cleanup completes.", "Close VMMap after the virtual reservation is released and the heap block is freed."]
    },
    checks: [
      ["Which release matches a whole VirtualAlloc reservation?", ["HeapFree", "VirtualFree with MEM_RELEASE and size zero", "CloseHandle", "FreeLibrary"], 1, "MEM_RELEASE uses the original allocation base and a zero size."],
      ["Why can a heap return a 100-byte block efficiently?", ["It changes CPU page size", "It suballocates from larger managed regions", "It stores every block in a DLL", "It disables alignment"], 1, "The heap manages small blocks within larger virtual-memory allocations."],
      ["What should code do with the old-protection output from VirtualProtect?", ["Treat it as a PID", "Use it to understand or restore the previous state", "Execute it", "Close it as a handle"], 1, "The output reports the prior page protection and supports reversible changes."]
    ]
  }
};
