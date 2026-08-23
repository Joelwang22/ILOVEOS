window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "compile-link-execute": {
    apis: ["CreateProcessW", "GetModuleFileNameW", "win32api.GetModuleFileName"],
    phases: {
      learn: ["Build an executable image", "Follow source through compilation, object files, symbol resolution, and PE layout."],
      windows: ["Connect file to process", "Relate PE metadata, architecture, loader work, and the live mapped image."],
      investigation: ["Trace one known binary", "Compare safe file parsing with the process image Windows actually runs."],
      review: ["Check the build path", "Test compiler, linker, loader, architecture, and error-stage distinctions."]
    },
    learning: [
      {
        title: "Compilation and linking solve different reference problems",
        paragraphs: [
          "A compiler translates one source unit into machine code and data plus metadata that still contains unresolved symbols and relocation records. The object file does not need to know the final address of every function or global. It records enough information for a linker to combine it with other objects and libraries.",
          "The linker chooses a final section layout, resolves definitions it can see, applies or emits relocations, removes or combines content according to toolchain policy, and writes a PE image. A missing declaration can be a compile error, while a declared but undefined referenced symbol normally becomes a link error."
        ]
      },
      {
        title: "The PE file is a mapping recipe, not a memory dump",
        paragraphs: [
          "The final file contains headers, aligned raw section data, import and relocation information, resources, and other directories. Its raw offsets describe positions in the file. Its virtual fields describe how the image should appear after the loader maps it into a process.",
          "Some mapped bytes have no matching raw bytes because VirtualSize can exceed SizeOfRawData and the remainder is zero-filled. Some file data, such as signatures and alignment padding, is not mapped as an ordinary executable section. File offset and live virtual address must therefore be translated through PE metadata."
        ],
        inlineCheck: ["Why can a section occupy more bytes in memory than in the file?", ["Every process duplicates its PID", "VirtualSize can include a zero-filled tail beyond raw data", "The linker disables virtual memory", "The file offset becomes a handle"], 1, "The loader can provide zero-filled mapped bytes that were not stored as raw section content."]
      },
      {
        title: "Build, load, and run failures belong to different stages",
        paragraphs: [
          "A link can succeed while process startup fails because the image architecture is incompatible, a dependency cannot be found, an imported export is absent, or policy rejects the file. Loading can succeed and execution can still fail after the entry point receives control.",
          "A .NET assembly also uses a PE container but adds CLR metadata and managed execution requirements. Establish whether an image is native, managed, or mixed before interpreting entry points, imports, and code sections as if every PE followed one runtime model."
        ],
        callout: { label: "Keep the stages named", text: "Compiler resolves language translation, linker resolves image construction, loader resolves process mappings and dependencies, and the program then performs its own runtime work." }
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "From source reference to executing instruction",
        intro: "Each stage consumes one representation and adds decisions needed by the next.",
        items: [
          { meta: "Compile", label: "Object files", detail: "Machine code, data, symbols, relocations", linkAfter: "link" },
          { meta: "Link", label: "PE image", detail: "Sections, headers, imports, entry-point RVA", linkAfter: "create process" },
          { meta: "Load", label: "Mapped image", detail: "Chosen base, dependencies, resolved imports", linkAfter: "transfer control" },
          { meta: "Execute", label: "Initial thread", detail: "Runtime startup then program entry" }
        ],
        caption: "The disk layout and mapped layout are related through the PE headers, not by identical offsets."
      }
    ],
    workedExamples: [
      {
        type: "trace",
        title: "Resolve one external function call",
        prompt: "main.obj calls helper(), but helper is compiled in helper.obj.",
        steps: [
          { title: "Compiler records a reference", action: "main.obj contains a call site plus an unresolved helper symbol or relocation.", why: "The compiler processes the source unit without knowing the final combined layout.", result: "The object is valid but incomplete by itself." },
          { title: "Second object supplies a definition", action: "helper.obj publishes the matching symbol and machine code.", why: "The linker needs exactly one compatible definition for the referenced symbol.", result: "The reference can be resolved." },
          { title: "Linker lays out sections", action: "Code from both objects receives positions in the output image and the call displacement or relocation is fixed.", why: "The final relationship is known only after layout.", result: "The PE contains a coherent code section." },
          { title: "Loader maps the image", action: "Windows maps sections and applies remaining image relocations if the chosen base differs.", why: "Live virtual addresses depend on the process mapping.", result: "The initial thread can eventually execute the resolved call." }
        ],
        conclusion: "Symbol resolution during linking and image relocation during loading are related address tasks at different times."
      }
    ],
    windowsLearning: [
      {
        title: "Architecture appears in both file metadata and process behavior",
        paragraphs: [
          "The COFF Machine field identifies the target machine type, and Optional Header Magic distinguishes PE32 from PE32+. These values must be interpreted together. A 32-bit process on 64-bit Windows also runs under WoW64, which affects module compatibility, paths, and inspection tools.",
          "Sigcheck can report architecture, hashes, version, and signature information without modifying the file. A PE viewer exposes headers and directories. Process Explorer then shows the image path, process type, mapped base, and loaded modules for the live instance."
        ]
      },
      {
        title: "The live entry address combines file metadata with runtime choice",
        paragraphs: [
          "AddressOfEntryPoint is an RVA. The loader selects the actual image base, affected by architecture, availability, and ASLR, then the live entry address is image base + entry-point RVA. The executable's user code may not run immediately at that address because runtime startup code can establish language state before calling a source-level main function.",
          "Do not confuse the PE entry point with the initial thread's first kernel-to-user transition or with the source function named main. Each is a different point in the startup path."
        ]
      }
    ],
    practice: {
      title: "Trace one binary through file and process views",
      time: "30 min",
      intro: "Use a safe parser on a known Windows binary, then compare the reported metadata with one live instance.",
      download: ["downloads/pe_inspector_lab.py", "pe_inspector_lab.py"],
      expectedOutcome: "The parser and PE viewer should agree on MZ, PE signature, Machine, Optional Header Magic, section count, entry-point RVA, and preferred image base. The live image base may differ from the preferred base because of ASLR, but live base plus entry-point RVA should fall inside an executable image region.",
      safety: "Inspect a known Microsoft-signed system binary or a harmless binary you built. Parsing does not require execution. Never run an unknown sample merely to populate the live-process half of the exercise.",
      steps: [
        {
          action: "Download pe_inspector_lab.py and open PowerShell in its folder. Create the owned .\\iloveos-pe-lab\\notepad-lab.exe copy, then parse that exact copy.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-pe-lab'\n$copy = Join-Path $lab 'notepad-lab.exe'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nCopy-Item -LiteralPath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -Destination $copy\npy .\\pe_inspector_lab.py $copy" }],
          why: "An owned copy preserves the signed System32 original and gives pe_inspector_lab.py a stable input.",
          observe: "Record resolved file path, file size, Machine, Optional Header Magic, section count, AddressOfEntryPoint RVA, preferred ImageBase, and every section row. A missing MZ/PE signature or unsupported Magic is a malformed-PE branch, not an architecture mismatch."
        },
        { action: "Open the same .\\iloveos-pe-lab\\notepad-lab.exe copy in a PE viewer and compare DOS header, NT Headers > File Header, NT Headers > Optional Header, and Section Headers with pe_inspector_lab.py output.", why: "Independent parsing catches field-offset and architecture mistakes.", observe: "Compare MZ, PE signature, Machine, Magic, section count, entry RVA, ImageBase, alignments, image size, and each section; explain hexadecimal formatting differences without changing values." },
        {
          action: "Run the trusted System32 original and print its PID, then inspect that exact live PID in Process Explorer Properties > Image and View > Lower Pane View > DLLs.",
          commands: [{ label: "PowerShell", code: "$live = Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -PassThru\n\"Live PID: $($live.Id)\"\n\"Creation time: $($live.StartTime.ToString('o'))\"" }],
          why: "The live view tests loader choices against static metadata without executing the copied file.",
          observe: "Record exact live image path, architecture, PID, creation time, and module base for notepad.exe. If modern Notepad redirects and the returned PID exits, match the surviving Notepad process by creation time and path and record that branch."
        },
        { action: "Add the recorded live module base to pe_inspector_lab.py's recorded AddressOfEntryPoint RVA, then locate that VA inside VMMap's Image details or Process Explorer's DLL range for the same PID.", why: "The calculation bridges RVA metadata to the mapped process.", observe: "Confirm the VA lies inside the notepad.exe image range and normally inside a section whose parser Protect field includes X. If the target exited, restart and record the new PID and base before recalculating." },
        { action: "Classify every step as compile-time, link-time, load-time, or run-time knowledge.", why: "The stage distinction makes later error diagnosis much faster.", observe: "Identify at least one fact that is unknowable until the process is loaded." }
      ],
      hints: [{ title: "The live base is hard to find", body: "Use Process Explorer process properties, the DLL lower pane, or VMMap. Match exact PID and path because several processes can use the same image name." }],
      cleanup: ["Close the recorded Notepad PID and inspection tools.", "Delete only .\\iloveos-pe-lab\\notepad-lab.exe and its now-empty .\\iloveos-pe-lab folder if you no longer need them."],
      extension: { title: "Independent variation", prompt: "Inspect one PE32 and one PE32+ image and list which header fields change width or position." }
    },
    checks: [
      ["What does an object file normally retain for the linker?", ["Only screenshots", "Symbols and relocation information", "A running PID", "Physical frame numbers"], 1, "Object files carry unresolved relationships and metadata needed for final image construction."],
      ["Why is a PE file not copied byte-for-byte into memory?", ["Sections have separate raw and virtual layouts", "Windows cannot read files", "Every byte becomes a thread", "The linker deletes the headers"], 0, "Headers describe alignment, mapping, zero-filled tails, protections, and directories."],
      ["Which failure belongs most clearly to load time?", ["Source syntax error", "Unresolved local variable type", "Required imported export is missing from a dependency", "An application rejects a user password"], 2, "The image was built, but the loader cannot satisfy its declared dependency contract."]
    ]
  },

  "static-dynamic-linking": {
    apis: ["win32api.LoadLibrary", "win32api.GetProcAddress", "win32api.FreeLibrary", "SetDefaultDllDirectories"],
    phases: {
      learn: ["Choose when code is resolved", "Compare static archives, implicit DLL imports, and explicit runtime loading."],
      windows: ["Own module references", "Handle DLL selection, architecture, exports, paths, and FreeLibrary correctly."],
      investigation: ["Observe one explicit load", "Correlate LoadLibrary with Image Load evidence and module lifetime."],
      review: ["Check dependency choices", "Test timing, deployment, reference ownership, search, and compatibility."]
    },
    learning: [
      {
        title: "Static linking incorporates selected code into the image",
        paragraphs: [
          "A static library is an archive of object files. The linker extracts the members needed to satisfy references and includes their code and data in the output image. The application no longer needs that library archive at runtime, but a library update normally requires relinking and redeploying the executable.",
          "Static does not mean the program has no runtime dependencies. A statically linked component can still import operating-system DLLs, load plugins, or rely on runtime data. Inspect the final PE rather than inferring dependency behavior from one build option."
        ]
      },
      {
        title: "Implicit and explicit dynamic linking move decisions to different moments",
        paragraphs: [
          "Implicit linking records DLL and function requirements in the PE import directory. The loader normally satisfies them before the program entry path begins, so a missing required dependency prevents normal startup. An import library used during the build is metadata for this relationship, not the DLL's implementation code copied into the executable.",
          "Explicit linking calls LoadLibrary or LoadLibraryEx when a feature is needed, then resolves exports with GetProcAddress. This permits optional behavior and version negotiation, but the code must handle path selection, absent modules, absent exports, exact ABI signatures, reference lifetime, and partial initialization."
        ],
        inlineCheck: ["A build uses vendor.lib, and the final PE imports vendor.dll. What was vendor.lib most likely?", ["The running process", "An import library describing DLL exports", "A page file", "A thread context"], 1, "Windows toolchains commonly use an import library to let the linker create an implicit DLL import."]
      },
      {
        title: "Dynamic sharing is useful, but ABI compatibility is the contract",
        paragraphs: [
          "Several processes can map the same DLL's clean image pages while retaining private writable state. A shared file on disk and shared physical code pages reduce duplication, but each process has its own module base, loader records, import slots, and private data pages where applicable.",
          "Replacing a DLL safely requires compatible exports, calling conventions, data layouts, behavior, and architecture. A file with the same name is not automatically a compatible implementation. Versioning and deployment are design work, not loader cleanup."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "Three ways a function reaches the final process",
        intro: "The moment of resolution changes error handling and deployment.",
        items: [
          { meta: "Static", label: "Object code copied at link time", detail: "No separate library archive at runtime", linkAfter: "or" },
          { meta: "Implicit DLL", label: "Import recorded in PE", detail: "Loader resolves during startup", linkAfter: "or" },
          { meta: "Explicit DLL", label: "LoadLibrary at runtime", detail: "Program resolves and checks export", linkAfter: "all become" },
          { meta: "Execution", label: "Callable machine code", detail: "Exact ABI must match" }
        ],
        caption: "The final executable can use more than one strategy at the same time."
      }
    ],
    workedExamples: [
      {
        type: "comparison",
        title: "Choose a dependency model for an optional report exporter",
        prompt: "The core application must start even when a separately shipped exporter is unavailable.",
        columns: [
          { title: "Implicit import", rows: [["Availability", "Required during startup"], ["Call site", "Ordinary imported function"], ["Failure", "Loader can reject process startup"], ["Best fit", "Core mandatory dependency"]] },
          { title: "Explicit load", rows: [["Availability", "Checked when export is requested"], ["Call site", "Resolved typed function pointer"], ["Failure", "Feature can report unavailable"], ["Best fit", "Optional component with defined fallback"]] }
        ],
        shared: "Both require matching architecture, compatible ABI, trustworthy path selection, and a supported component contract.",
        conclusion: "Explicit loading supports optionality only when every failure and cleanup branch is designed."
      }
    ],
    windowsLearning: [
      {
        title: "LoadLibrary ownership is reference based",
        paragraphs: [
          "A successful LoadLibrary call adds a module reference for the process and returns an HMODULE, effectively the loaded module base for ordinary Win32 use. Each owned reference must be matched by FreeLibrary when no code, data pointer, or active callback still depends on the module.",
          "GetModuleHandle finds a module already loaded in the calling process but normally does not grant a new reference that should be released. GetModuleHandleEx can request clearer reference behavior. Never call FreeLibrary merely because a base address was observed in Process Explorer."
        ]
      },
      {
        title: "A module name is not provenance",
        paragraphs: [
          "Windows DLL selection involves application packaging, loaded-module state, KnownDLLs, API-set resolution, configured search directories, and flags supplied to LoadLibraryEx. The exact search behavior depends on the call and process configuration, so secure code uses supported directory controls and verifies the selected path.",
          "Process Monitor Image Load events reveal when and from which path a module was mapped. ListDLLs and Process Explorer show current module state, path, version, and signatures. Trace and snapshot evidence answer different timing questions."
        ]
      }
    ],
    practice: {
      title: "Observe an explicitly owned module reference",
      time: "30 min",
      intro: "Load a known system DLL by explicit path, correlate the Image Load event, then release the owned reference.",
      download: ["downloads/module_lifetime_lab.py", "module_lifetime_lab.py"],
      expectedOutcome: "The script should resolve the DLL under System32, add a LoadLibrary reference, and print its HMODULE. Process Monitor should record an Image Load if the module was not already mapped, while Process Explorer or ListDLLs should show the selected path. After FreeLibrary the module may unload if no other references remain, but a preexisting or transitive reference can keep it mapped.",
      steps: [
        {
          action: "Download module_lifetime_lab.py, open PowerShell in its folder, run the default version.dll command, and leave it at 'Record whether the DLL is already mapped'.",
          commands: [{ label: "PowerShell", code: "py .\\module_lifetime_lab.py --dll $env:SystemRoot\\System32\\version.dll" }],
          why: "The pre-load pause establishes whether the exact System32\\version.dll path is already present.",
          observe: "Record PID, Python pointer width, and explicit DLL path. In Process Explorer select that PID, choose View > Show Lower Pane and View > Lower Pane View > DLLs, then record whether the exact path is present before LoadLibrary. Distinguish an unavailable PID from an unloaded module."
        },
        { action: "In Process Monitor add PID is the recorded PID Include and Operation is Image Load Include, clear the display, and resume capture. Press Enter once in module_lifetime_lab.py, pause capture when 'Inspect Image Load' appears, and refresh Process Explorer's DLL lower pane.", why: "The trace captures the load-time event while the second pause preserves the resulting state.", observe: "Record owned HMODULE, selected path, Process Monitor event time, Result, image path, and signature status or verification availability. If no new Image Load appears but the baseline already contained version.dll, record the preloaded-module branch." },
        { action: "Press Enter once at module_lifetime_lab.py's FreeLibrary prompt, leave it at 'Refresh the module snapshot', and refresh Process Explorer's DLL lower pane for the same PID.", why: "One release removes only the reference module_lifetime_lab.py owns.", observe: "State whether version.dll disappeared. If it remains, identify the baseline or another dependency reference as possible evidence; if it disappears, record that the owned reference was sufficient to keep it mapped. Access denied and exited PID are separate branches." },
        { action: "Classify the module as implicit, transitive, or explicit using evidence.", why: "Presence alone does not identify how the dependency arrived.", observe: "Use static imports, event timing, and the controlled LoadLibrary call together." },
        { action: "Write the full acquisition and release contract.", why: "Module addresses and callable pointers become invalid if lifetime ends too early.", observe: "Include path choice, null failure, exported-pointer lifetime, FreeLibrary result, and no-use-after-release rule." }
      ],
      hints: [{ title: "No new Image Load event appears", body: "The DLL may already be loaded. Confirm the baseline, choose another known system DLL with the script's --dll option, and never copy an untrusted DLL into a searched directory for this exercise." }],
      cleanup: ["Let the script call FreeLibrary and exit normally.", "Stop the Process Monitor capture and close module-inspection tools."],
      extension: { title: "Independent variation", prompt: "Compare GetModuleHandle with LoadLibrary for an already loaded module and write the reference-ownership difference before calling either function." }
    },
    checks: [
      ["What does static linking normally copy into the output?", ["A live process", "Needed object code and data from library members", "The DLL search path", "Physical pages"], 1, "The linker incorporates selected compiled content from the archive."],
      ["What should match one successful owned LoadLibrary reference?", ["CloseHandle", "FreeLibrary after dependent use ends", "VirtualFree", "TerminateProcess"], 1, "FreeLibrary releases the module reference acquired by LoadLibrary."],
      ["Why can a DLL remain mapped after one FreeLibrary?", ["FreeLibrary never works", "Other references or loader dependencies can remain", "The HMODULE is a PID", "Every DLL is permanent"], 1, "Module lifetime is reference based within the process."]
    ]
  },

  "pe-anatomy": {
    apis: ["ctypes.Structure", "ctypes.sizeof"],
    phases: {
      learn: ["Walk the PE header chain", "Read MZ, e_lfanew, PE signature, COFF fields, optional fields, directories, and sections."],
      windows: ["Parse without trusting the file", "Apply architecture-aware sizes, bounds checks, and unusual directory rules."],
      investigation: ["Validate a known PE", "Compare a safe parser with a visual PE tool and Sigcheck."],
      review: ["Check the structure", "Test header location, PE32 differences, data directories, bounds, and architecture."]
    },
    learning: [
      {
        title: "The DOS header leads to the modern PE headers",
        paragraphs: [
          "A PE image begins with the two-byte MZ signature. At DOS-header offset 0x3C, e_lfanew stores a file offset to the PE signature. A parser must verify the file is large enough before every read, validate e_lfanew, then confirm the four bytes PE followed by two zero bytes.",
          "Immediately after the signature, the COFF File Header records Machine, NumberOfSections, TimeDateStamp, SizeOfOptionalHeader, and Characteristics. SizeOfOptionalHeader tells the parser where the section table begins, so it must not be replaced by one assumed constant."
        ]
      },
      {
        title: "The Optional Header is required for executable images",
        paragraphs: [
          "Magic identifies PE32 as 0x10B and PE32+ as 0x20B. The layouts differ, including pointer-related fields and the position of later values. Important fields include AddressOfEntryPoint, ImageBase, SectionAlignment, FileAlignment, SizeOfImage, SizeOfHeaders, Subsystem, and NumberOfRvaAndSizes.",
          "The word optional comes from the broader COFF format, not from normal Windows image loading. A native executable or DLL requires the information Windows needs to map and initialize it."
        ],
        inlineCheck: ["What should a parser do before using PE32+ field offsets?", ["Check only the filename extension", "Read and validate Optional Header Magic", "Start the process", "Assume every 64-bit pointer is in the DOS stub"], 1, "Magic selects the correct optional-header layout."]
      },
      {
        title: "Data directories and sections provide the navigation map",
        paragraphs: [
          "Data-directory entries are address and size pairs for structures such as imports, exports, resources, base relocations, exception data, TLS, and debug information. Most addresses are RVAs. The security directory is an important exception, its address identifies a file position for certificate data rather than an ordinary mapped RVA.",
          "The section table describes name, virtual size and address, raw size and pointer, and characteristics. Names such as .text and .data are conventions. Trust characteristics and bounds, not the label alone, and treat malformed files as hostile input even when the parser never executes them."
        ],
        callout: { label: "Parser rule", text: "Validate before adding. Check that offset, size, and offset + size remain within the file and that arithmetic cannot wrap in the target integer model." }
      }
    ],
    visuals: [
      {
        type: "map",
        title: "Navigate the PE file in order",
        intro: "Offsets are discovered from fields, not guessed from screenshots.",
        items: [
          { meta: "File start", label: "DOS header and MZ", detail: "e_lfanew at offset 0x3C", linkAfter: "points to" },
          { meta: "NT header start", label: "PE signature", detail: "PE followed by two zero bytes", linkAfter: "followed by" },
          { meta: "Image metadata", label: "COFF and Optional Header", detail: "Machine, Magic, entry, image base, directories", linkAfter: "sized to" },
          { meta: "Layout table", label: "Section headers", detail: "Raw and virtual ranges plus characteristics" }
        ],
        caption: "The data-directory targets usually live inside the raw and virtual ranges described by sections."
      }
    ],
    workedExamples: [
      {
        type: "decision",
        title: "Reject a truncated header safely",
        prompt: "A file says e_lfanew is 0x9000, but the entire file is 0x1200 bytes.",
        steps: [
          { title: "Validate the DOS read", action: "Confirm at least 0x40 bytes exist before reading e_lfanew.", why: "The field itself must be inside the file.", result: "The MZ and pointer read can be trusted only after this check." },
          { title: "Validate the target", action: "Require e_lfanew + 4 + COFF header size to remain within file length.", why: "A pointer outside the file cannot identify a valid PE signature and header.", result: "0x9000 exceeds 0x1200, so parsing stops." },
          { title: "Report structure error", action: "Return a clear invalid or truncated image result without loading the file.", why: "Trying alternate offsets would turn malformed input into unsafe guesswork.", result: "No execution or out-of-bounds read occurs." }
        ],
        conclusion: "A valid MZ signature does not prove the rest of the PE is present or trustworthy."
      }
    ],
    windowsLearning: [
      {
        title: "Architecture needs Machine and Magic together",
        paragraphs: [
          "The supplied how_to_load report correctly used Machine 0x014C and Magic 0x010B to establish an x86 PE32 DLL and matched it to an x86 PE32 executable. Machine identifies the target processor family, while Magic selects the optional-header format. One field reinforces but does not replace the other.",
          "Other compatibility conditions still matter, including exported symbol ABI, subsystem expectations, dependencies, and process mitigation policy. Architecture match is necessary for an in-process native DLL, not sufficient for correct behavior."
        ]
      },
      {
        title: "Static inspection should remain non-executing",
        paragraphs: [
          "The starter opens the file as bytes, validates bounds, and reports a limited set of fields. A PE viewer supplies a second interpretation, while Sigcheck adds hashes, signature, version, and entropy-related metadata. None requires launching the target.",
          "Do not use LoadLibrary as a general PE parser. Loading executes loader behavior and can run DLL initialization code. Data-file loading flags exist for specialized resource use, but ordinary structural analysis should read the file format."
        ]
      }
    ],
    practice: {
      title: "Parse and verify the PE header chain",
      time: "35 min",
      intro: "Use the shared PE inspector against a known file and deliberately test one truncated copy.",
      download: ["downloads/pe_inspector_lab.py", "pe_inspector_lab.py"],
      expectedOutcome: "The parser should report the same Machine, Magic, section count, entry RVA, image base, alignments, image size, and section rows as the PE viewer. A deliberately truncated copy should be rejected with a bounded error rather than a crash or invented fields.",
      steps: [
        {
          action: "Download pe_inspector_lab.py and open PowerShell in its folder. Create the owned .\\iloveos-pe-anatomy\\notepad-intact.exe copy and parse it.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-pe-anatomy'\n$intact = Join-Path $lab 'notepad-intact.exe'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nCopy-Item -LiteralPath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -Destination $intact\npy .\\pe_inspector_lab.py $intact" }],
          why: "The trusted stable notepad-intact.exe input establishes the normal header path without loading notepad-intact.exe.",
          observe: "Record resolved file path, MZ, e_lfanew, PE signature, Machine, section count, Magic, entry RVA, preferred ImageBase, alignments, SizeOfImage, SizeOfHeaders, and section rows."
        },
        {
          action: "Hash and verify the exact intact copy with PowerShell and Sigcheck, then open it in a PE viewer.",
          commands: [{ label: "PowerShell", code: "$intact = Join-Path $PWD 'iloveos-pe-anatomy\\notepad-intact.exe'\nGet-FileHash -Algorithm SHA256 -LiteralPath $intact\nsigcheck.exe -nobanner -h -a $intact" }],
          why: "Three views test field offsets, architecture interpretation, and provenance separately.",
          observe: "Record full path, SHA-256, signature status, Machine and Magic from Sigcheck, and matching PE-viewer fields. If Sigcheck is unavailable, record that tool branch and retain the hash plus parser/viewer comparison."
        },
        { action: "Map each section's raw range and virtual range on paper.", why: "The section table prepares the RVA lesson and exposes padding.", observe: "Identify which sections are readable, writable, or executable by characteristics." },
        {
          action: "Create the disposable .\\iloveos-pe-anatomy\\notepad-truncated.exe from the intact copy, keep only its first 128 bytes, and rerun pe_inspector_lab.py on the malformed copy.",
          commands: [{ label: "PowerShell", code: "$intact = Join-Path $PWD 'iloveos-pe-anatomy\\notepad-intact.exe'\n$truncated = Join-Path $PWD 'iloveos-pe-anatomy\\notepad-truncated.exe'\n$bytes = [IO.File]::ReadAllBytes($intact)\n[IO.File]::WriteAllBytes($truncated, $bytes[0..127])\npy .\\pe_inspector_lab.py $truncated" }],
          why: "Failure behavior is part of a safe file-format contract.",
          observe: "Expect a PE inspection failed message naming a bounded missing header or section range. If the intact source is unexpectedly shorter than 128 bytes, stop rather than producing an invalid slice."
        },
        { action: "Explain why the security directory needs special address handling.", why: "Remembering one exception prevents a parser from treating every directory address as an RVA.", observe: "State that the certificate table uses a file-position interpretation and is not mapped as an ordinary section directory." }
      ],
      hints: [{ title: "The section table offset is wrong", body: "Use e_lfanew + 4-byte signature + 20-byte COFF header + SizeOfOptionalHeader. Do not assume PE32 and PE32+ optional headers have one fixed common size." }],
      cleanup: ["Delete only .\\iloveos-pe-anatomy\\notepad-intact.exe, .\\iloveos-pe-anatomy\\notepad-truncated.exe, and the now-empty .\\iloveos-pe-anatomy folder.", "Close the PE viewer without saving modifications."],
      extension: { title: "Independent variation", prompt: "Add read-only reporting for the import-directory RVA and size, with bounds validation but without parsing descriptors yet." }
    },
    checks: [
      ["What does e_lfanew contain?", ["A live virtual address", "A file offset to the PE signature", "The process handle", "An imported ordinal"], 1, "e_lfanew navigates from the DOS header to the NT headers in the file."],
      ["What selects PE32 versus PE32+ field layout?", ["File extension", "Optional Header Magic", "Section name", "PID parity"], 1, "Magic 0x10B and 0x20B select the two principal image layouts."],
      ["Which data directory does not use its address as an ordinary RVA?", ["Import directory", "Export directory", "Security certificate directory", "Resource directory"], 2, "The certificate table uses a file-position interpretation."]
    ]
  },

  "sections-rvas": {
    apis: ["GetModuleHandleW", "VirtualQueryEx", "win32process.EnumProcessModules"],
    phases: {
      learn: ["Translate among three locations", "Connect file offsets, RVAs, and live VAs through the section table."],
      windows: ["Account for mapping and relocation", "Use section alignment, zero-fill, ASLR, and protections without assuming one-to-one layout."],
      investigation: ["Resolve one RVA twice", "Calculate its raw file position and its live process address, then verify both."],
      review: ["Check the mapping", "Test RVA arithmetic, section selection, zero-fill, relocation, and protections."]
    },
    learning: [
      {
        title: "File offset, RVA, and VA belong to different coordinate systems",
        paragraphs: [
          "A file offset counts bytes from the beginning of the PE file. An RVA counts bytes from the loaded image base. A VA is the resulting live virtual address inside one process. The same content can therefore be described by all three values, but no single addition converts every pair without section or load information.",
          "For live memory, VA = loaded image base + RVA. For file content inside a section, file offset = PointerToRawData + (RVA - section VirtualAddress). The containing section and valid range must be found before applying the second equation."
        ]
      },
      {
        title: "Raw size and virtual size explain padding and zero-filled tails",
        paragraphs: [
          "FileAlignment controls raw placement, while SectionAlignment controls mapped placement. SizeOfRawData is commonly padded to file alignment. VirtualSize describes meaningful mapped extent and can exceed raw size, in which case the tail is supplied as zero-filled memory rather than read from a file offset.",
          "An RVA in headers can map directly within SizeOfHeaders under defined bounds. An RVA in a virtual tail beyond raw data has a valid mapped address but no corresponding stored byte to read. A correct converter reports that distinction rather than manufacturing a file offset."
        ],
        inlineCheck: ["An RVA is inside a section's VirtualSize but beyond SizeOfRawData. What is the likely result?", ["It must be another PID", "It can be a zero-filled mapped tail with no raw file byte", "The PE signature moves", "ASLR is disabled"], 1, "Mapped virtual extent can include bytes not stored in the section's raw data."]
      },
      {
        title: "ASLR changes the base while RVAs describe image structure",
        paragraphs: [
          "The Optional Header records a preferred ImageBase, but Windows can map a relocatable image elsewhere. Base-relocation entries identify address-dependent locations that need adjustment by the difference between preferred and actual base. Position-independent calculations and RVAs remain relative to the chosen live base.",
          "Restarting a process can produce a different base while its section RVAs and entry-point RVA remain the same for the same file. Record the actual base from the exact process instance rather than assuming the preferred value."
        ]
      }
    ],
    visuals: [
      {
        type: "map",
        title: "One .text byte in file and memory",
        intro: "The section header supplies the bridge between raw and virtual layout.",
        items: [
          { meta: "Section header", label: ".text RVA 0x1000", detail: "PointerToRawData 0x400", linkAfter: "choose offset within" },
          { meta: "Target", label: "RVA 0x1234", detail: "0x234 bytes into .text", linkAfter: "raw equation" },
          { meta: "File", label: "Offset 0x634", detail: "0x400 + 0x234", linkAfter: "live equation" },
          { meta: "Process", label: "Base + 0x1234", detail: "Actual VA depends on this instance" }
        ],
        caption: "The byte's within-section offset stays 0x234 in both coordinate systems."
      }
    ],
    workedExamples: [
      {
        type: "calculation",
        title: "Resolve an entry-point RVA to disk and memory",
        prompt: "A PE has .text VirtualAddress 0x1000, PointerToRawData 0x400, and entry RVA 0x17B0. It loads at 0x00007FF712340000.",
        steps: [
          { title: "Find within-section offset", action: "Subtract the section RVA from the target RVA.", result: "0x17B0 - 0x1000 = 0x7B0", why: "This locates the byte relative to the beginning of .text." },
          { title: "Find file offset", action: "Add the within-section offset to PointerToRawData.", result: "0x400 + 0x7B0 = 0xBB0", why: "This is valid only if 0x7B0 is within stored raw data." },
          { title: "Find live VA", action: "Add the RVA to the actual loaded image base.", result: "0x00007FF712340000 + 0x17B0 = 0x00007FF7123417B0", why: "ASLR affects the base, not the image-relative offset." },
          { title: "Validate ranges", action: "Confirm both results fall inside their respective raw and mapped .text spans.", result: "Reject the conversion if either containing-range test fails", why: "Arithmetic alone cannot make an out-of-range RVA valid." }
        ],
        conclusion: "Use section-relative offset as the invariant bridge, and validate both coordinate systems."
      }
    ],
    windowsLearning: [
      {
        title: "Mapped protections derive from section characteristics",
        paragraphs: [
          "Section characteristics describe code, initialized or uninitialized data, discardability, sharing, and read, write, or execute intent. The loader translates these into page-level mappings, subject to alignment, combined page boundaries, image policy, and loader behavior. Section rows and memory regions are therefore related but not guaranteed to form a perfect one-row-to-one-row match.",
          "A writable and executable image region is worth explaining, but it is not proof of malicious behavior by itself. Confirm the file, section characteristics, signature, runtime use, and protection transitions."
        ]
      },
      {
        title: "Tools expose each coordinate system separately",
        paragraphs: [
          "A PE viewer and the starter expose raw pointers, RVAs, sizes, and characteristics. Process Explorer reports module bases. VMMap shows live image ranges and protections. A debugger or hex viewer can compare the byte at the calculated file offset with the byte at the live VA for a process you own.",
          "Relocations can change address-bearing bytes after mapping, so not every live byte must equal the raw file byte. Choose ordinary instruction or constant bytes for a simple comparison and explain relocation as a limitation."
        ]
      }
    ],
    practice: {
      title: "Resolve one RVA into file and live memory",
      time: "35 min",
      intro: "Use the PE inspector's RVA option, then verify its result against a live known process.",
      download: ["downloads/pe_inspector_lab.py", "pe_inspector_lab.py"],
      expectedOutcome: "The inspector should identify the containing section, within-section offset, and raw file offset for an RVA backed by file bytes. The live VA should equal actual module base plus the same RVA. Restarting can change the base while the RVA and raw file offset remain stable for the unchanged file.",
      steps: [
        {
          action: "Download pe_inspector_lab.py and open PowerShell in its folder. Create the owned .\\iloveos-rva-lab\\notepad-rva.exe copy and parse it once to obtain AddressOfEntryPoint.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-rva-lab'\n$copy = Join-Path $lab 'notepad-rva.exe'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nCopy-Item -LiteralPath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -Destination $copy\npy .\\pe_inspector_lab.py $copy" }],
          why: "The first parse establishes architecture, section bounds, and an exact RVA from an owned stable file.",
          observe: "Record the full copy path and AddressOfEntryPoint printed by pe_inspector_lab.py."
        },
        {
          action: "Run pe_inspector_lab.py again on notepad-rva.exe, entering the recorded AddressOfEntryPoint when prompted.",
          commands: [{ label: "PowerShell", code: "$entryRva = Read-Host 'Enter AddressOfEntryPoint exactly as printed, including 0x'\npy .\\pe_inspector_lab.py .\\iloveos-rva-lab\\notepad-rva.exe --rva $entryRva" }],
          why: "The parser validates the entered RVA against the same file and section bounds.",
          observe: "Record containing section, its RVA and raw ranges from the section table, within-section offset, raw file offset, and byte at offset. A zero-filled virtual tail reports no raw file offset; an RVA outside all ranges is a malformed input branch."
        },
        { action: "Recalculate the file offset manually and inspect that byte range in a hex viewer.", why: "Manual verification tests the formula independently of pe_inspector_lab.py.", observe: "Confirm the raw offset is within notepad-rva.exe's file size and the containing section's SizeOfRawData." },
        {
          action: "Start the trusted System32 original, print its PID and creation time, and record its actual notepad.exe module base in Process Explorer's DLL lower pane.",
          commands: [{ label: "PowerShell", code: "$live = Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -PassThru\n\"Live PID: $($live.Id)\"\n\"Creation time: $($live.StartTime.ToString('o'))\"" }],
          why: "Preferred ImageBase is not a substitute for the process's chosen base.",
          observe: "Match exact live PID, System32 path, creation time, and architecture. If the launcher PID redirects, record the surviving Notepad PID selected by path and creation time."
        },
        { action: "Calculate live VA = the recorded actual module base + the recorded AddressOfEntryPoint RVA, then locate that VA in VMMap's Image details for the same PID.", why: "The final check connects structural metadata to memory protection.", observe: "Confirm the VA lies inside the notepad.exe Image range and record Protection. If the module or target has unloaded or exited, reacquire a live PID and base before calculating." },
        { action: "Restart once and repeat only the base and VA calculation.", why: "The comparison demonstrates which values are image relative and which are process specific.", observe: "Record whether ASLR changed the base and preserve any unchanged RVA and file offset." }
      ],
      hints: [{ title: "The tool reports no raw file byte", body: "The RVA may lie in a zero-filled virtual tail or outside every valid section. Choose an RVA within min(VirtualSize, SizeOfRawData) for a byte comparison." }],
      cleanup: ["Close the recorded Notepad PID, PE viewer, and hex viewer.", "Delete only .\\iloveos-rva-lab\\notepad-rva.exe and its now-empty .\\iloveos-rva-lab folder."],
      extension: { title: "Independent variation", prompt: "Resolve an RVA inside .data whose live byte changes at runtime and explain why address mapping can be correct even when byte contents differ." }
    },
    checks: [
      ["How is live VA calculated from an RVA?", ["File offset + PID", "Actual image base + RVA", "Preferred base - RVA", "Section count + page size"], 1, "RVA is defined relative to the loaded image base."],
      ["What is needed to convert an RVA to a raw file offset?", ["Containing section's virtual and raw placement", "The process priority", "A thread handle", "Only the filename"], 0, "The section header provides VirtualAddress and PointerToRawData for the conversion."],
      ["Why can a valid RVA lack a raw file byte?", ["It lies in a zero-filled virtual tail", "Windows deleted the process", "Every RVA is a registry key", "The file is always encrypted"], 0, "VirtualSize can extend beyond stored raw section data."]
    ]
  },

  "imports-exports-iat": {
    apis: ["win32api.LoadLibrary", "win32api.GetProcAddress", "ctypes.WINFUNCTYPE", "win32api.FreeLibrary"],
    phases: {
      learn: ["Resolve an external function", "Follow import names and ordinals through export lookup into a callable IAT address."],
      windows: ["Construct the exact ABI", "Use pywin32 first, then ctypes for raw addresses, pointer width, calling convention, and lifetime."],
      investigation: ["Open the box safely", "Replace the original internal ctypes call with a typed MessageBoxW function pointer and cleanup."],
      review: ["Check symbol resolution", "Test import tables, exports, forwarders, IAT contents, ABI, and module lifetime."]
    },
    learning: [
      {
        title: "Imports describe what an image needs from other modules",
        paragraphs: [
          "The import directory contains one descriptor per dependency. Each descriptor leads to the DLL name and thunk arrays whose entries identify imported functions by name or ordinal. A zero entry terminates each array or descriptor sequence according to the PE structure.",
          "Before resolution, import lookup data identifies symbols. During loading, Windows locates the exporting module and writes callable virtual addresses into the Import Address Table. Machine code then calls indirectly through IAT slots rather than embedding one fixed address for every external function."
        ]
      },
      {
        title: "Exports publish addresses, ordinals, names, and sometimes forwarders",
        paragraphs: [
          "An export directory maps ordinal indexes to function RVAs and can associate selected ordinals with names. Importing by ordinal is compact but depends on a stable ordinal contract. Name decoration can encode language or calling information, which is why a C++ export such as the supplied ?MyExport@@YAXXZ is less convenient than a deliberate C-compatible exported name.",
          "An export entry can forward to another module and symbol instead of containing code in the first DLL. The loader follows the forwarder, so the module named by the import and the module containing the final implementation can differ."
        ],
        inlineCheck: ["The IAT entry for an import contains what after resolution?", ["The DLL filename only", "A callable virtual address", "The process PID", "A page-file offset"], 1, "The loader replaces or initializes the IAT slot with the resolved function address."]
      },
      {
        title: "A raw address has no safe callable type by itself",
        paragraphs: [
          "GetProcAddress returns an address. It does not tell Python the parameter count, scalar widths, pointer levels, string encoding, calling convention, or return type. Constructing the wrong callable prototype can truncate pointers, corrupt the stack on affected architectures, pass invalid text, or misread the result.",
          "The callable remains valid only while the module is loaded and the export contract remains applicable. Do not FreeLibrary while function pointers, callbacks, worker threads, or returned module-owned data can still be used."
        ],
        callout: { label: "Correction to open_the_box.py", text: "The supplied script uses private _ctypes.call_function without a declared MessageBox signature and never releases its LoadLibrary reference. The revised path uses WINFUNCTYPE, MessageBoxW, exact types, and FreeLibrary in finally." }
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "Resolve one implicit import",
        intro: "The lookup begins with PE metadata and ends with a process-local address.",
        items: [
          { meta: "Import descriptor", label: "USER32.dll", detail: "Dependency name", linkAfter: "load or find" },
          { meta: "Import thunk", label: "MessageBoxW", detail: "Name or ordinal requirement", linkAfter: "search exports" },
          { meta: "Export result", label: "Function RVA", detail: "Possibly forwarded", linkAfter: "base plus RVA" },
          { meta: "IAT slot", label: "Callable VA", detail: "Indirect call target in this process" }
        ],
        caption: "Explicit GetProcAddress performs a related export lookup but the caller stores and types the returned address itself."
      }
    ],
    workedExamples: [
      {
        type: "contract",
        title: "Turn MessageBoxW into a safe ctypes call",
        prompt: "Resolve MessageBoxW explicitly while preserving pointer width, Unicode text, and module ownership.",
        steps: [
          { title: "Load module", action: "LoadLibraryW(L\"user32.dll\") returns HMODULE or null.", why: "HMODULE is pointer sized and the successful call creates an owned reference.", result: "Only non-null enters module ownership." },
          { title: "Resolve bytes name", action: "GetProcAddress(module, b\"MessageBoxW\") returns c_void_p or null.", why: "Export names are narrow byte strings even when the target function is the W variant.", result: "The raw address is still not callable safely." },
          { title: "Declare prototype", action: "WINFUNCTYPE(c_int, HWND, LPCWSTR, LPCWSTR, UINT)(address)", why: "The prototype defines calling convention, four parameters, pointer encodings, and integer result.", result: "Python now has a typed callable wrapper." },
          { title: "Call and interpret", action: "Pass null owner, Python Unicode strings, and an MB_* UINT flag.", why: "MessageBoxW expects UTF-16 string pointers and returns a button identifier.", result: "The result is interpreted before cleanup." },
          { title: "Release", action: "FreeLibrary(module) in finally after the last call.", why: "The function pointer must not outlive the module code it addresses.", result: "The owned reference is removed exactly once." }
        ],
        conclusion: "Load, resolve, type, call, interpret, and release are one indivisible explicit-loading contract."
      }
    ],
    windowsLearning: [
      {
        title: "pywin32 hides ABI work when a wrapper already exists",
        paragraphs: [
          "For supported APIs, pywin32 should remain the first choice because its wrapper converts Python values, returns useful objects, and raises pywintypes.error on most ordinary failures. win32api.LoadLibrary, GetProcAddress, and FreeLibrary still expose explicit module lifetime, but a raw export remains the caller's ABI responsibility.",
          "ctypes is justified in this lesson because constructing a function pointer is the subject. Use WinDLL or WINFUNCTYPE for Windows calling convention, configure every loader function, select W string types deliberately, and keep the module handle alive across the call."
        ]
      },
      {
        title: "Static and live tools reveal different sides of resolution",
        paragraphs: [
          "CFF Explorer displays import descriptors, thunk names, IAT location, export names, ordinals, and forwarder text. Process Explorer or ListDLLs confirms the actual loaded module path. A debugger can display the resolved IAT slot in a process you own.",
          "Process Monitor Image Load events show when a module appeared, not each individual GetProcAddress lookup. The explicit starter prints the raw address so it can be checked against the loaded module range without treating the address as permanent."
        ]
      }
    ],
    practice: {
      title: "Resolve and call MessageBoxW with an exact prototype",
      time: "45 min",
      intro: "Use the corrected starter to inspect every decision hidden by an ordinary wrapper call.",
      download: ["downloads/explicit_load_lab.py", "explicit_load_lab.py"],
      expectedOutcome: "The script should load user32.dll, resolve a nonzero MessageBoxW address within the module range, display a Unicode message, report the selected button result, and release its owned module reference. The W version should accept Python str values, while the export name passed to GetProcAddress remains bytes.",
      steps: [
        { action: "Inspect explicit_load_lab.py before running and write the native signature beside each ctypes type.", why: "Signature review prevents a successful GUI result from hiding an ABI mistake.", observe: "Match HWND, LPCWSTR, LPCWSTR, UINT, int, HMODULE, LPCSTR, BOOL, and c_void_p." },
        {
          action: "Download explicit_load_lab.py, open PowerShell in its folder, run it, and leave it at 'Inspect the module and export address'.",
          commands: [{ label: "PowerShell", code: "py .\\explicit_load_lab.py" }],
          why: "The pause keeps the owned user32.dll reference and MessageBoxW function address observable.",
          observe: "Record PID, exact module path, HMODULE, MessageBoxW address, and printed prototype. In Process Explorer select the PID and use the DLL lower pane to verify user32.dll's base and size contain the address. If GetProcAddress returned null, explicit_load_lab.py would report the missing-export branch and must not construct or call the pointer."
        },
        { action: "Continue, select OK, and interpret the integer return.", why: "Return values remain part of a UI API contract even when only one button is offered.", observe: "Confirm the reported identifier corresponds to the selected button." },
        { action: "Open the exact System32\\user32.dll path printed by explicit_load_lab.py in a PE viewer. Inspect its Export Directory for MessageBoxW and inspect an owned executable's Import Directory for one ordinary imported function.", why: "The static views connect explicit lookup and loader-resolved imports to their PE structures.", observe: "For MessageBoxW record name, ordinal, RVA, and any forwarder. If MessageBoxW is absent on an unexpected target, do not substitute a guessed ordinal; treat it as a missing-export branch." },
        { action: "Compare on paper with MessageBoxA and the original script.", why: "The comparison isolates encoding and prototype safety improvements.", observe: "List LPCSTR plus bytes for A, LPCWSTR plus str for W, and explain why private call_function is unnecessary." }
      ],
      hints: [{ title: "The function address is outside the expected module", body: "Confirm the correct PID and user32 module range, then check whether the export is forwarded or the tool displays a different mapped implementation module. Do not force the pointer into a guessed range." }],
      cleanup: ["Dismiss the message box and let finally call FreeLibrary.", "Close static and live inspection tools."],
      extension: { title: "Independent variation", prompt: "Resolve GetDesktopWindow, which takes no parameters, and construct its exact typed prototype. Do not reuse the MessageBox signature." }
    },
    checks: [
      ["What is stored in an IAT slot after normal resolution?", ["A source-code line", "The resolved callable address", "The DLL hash only", "A process token"], 1, "Machine code calls indirectly through the resolved function address."],
      ["Why does GetProcAddress take a byte-string export name for MessageBoxW?", ["Export identifiers are narrow names independent of the W function's text parameters", "W functions reject bytes everywhere", "The PID is encoded in ASCII", "It loads the ANSI DLL"], 0, "The W suffix describes the function's string parameters, not GetProcAddress's export-name parameter."],
      ["When may the module reference be released?", ["Before constructing the pointer", "After all calls and dependent pointers or callbacks are finished", "Only after reboot", "Immediately after GetProcAddress"], 1, "The address is valid only while the module remains loaded and its code is available."]
    ]
  },

  "windows-loader": {
    apis: ["LoadLibraryExW", "AddDllDirectory", "SetDefaultDllDirectories", "GetModuleFileNameW"],
    phases: {
      learn: ["Trace process loader initialization", "Follow main image mapping, dependencies, relocations, imports, TLS, initialization, and entry transfer."],
      windows: ["Control module selection", "Understand loader constraints, dependency graphs, API sets, secure paths, and live evidence."],
      investigation: ["Prove one startup dependency", "Revisit how_to_load as a controlled import-table experiment with stronger safety and evidence."],
      review: ["Check the loader path", "Test ordering, dependency types, DllMain constraints, architecture, search, and evidence."]
    },
    learning: [
      {
        title: "Process creation prepares the environment before application code runs",
        paragraphs: [
          "Windows creates the process and initial thread, maps the main image and core user-mode support such as Ntdll, establishes process structures, and begins user-mode initialization. The loader then prepares the dependency graph, maps required DLLs, applies relocations where needed, resolves imports, establishes runtime loader records, handles TLS initialization, calls required module initialization routines, and transfers control toward the executable entry point.",
          "Exact private loader function names and internal steps can change across Windows versions. The stable model is the ordered set of responsibilities and the documented contracts visible through PE structures, module APIs, and initialization constraints."
        ]
      },
      {
        title: "Dependencies form a graph with identity and initialization state",
        paragraphs: [
          "An executable imports DLLs that import other DLLs, producing a graph rather than one flat list. The loader tracks modules already mapped in the process and resolves repeated dependency requests without blindly creating independent copies. API-set contract names can redirect an import to an appropriate host implementation.",
          "A static import list therefore does not equal the final module list. Transitive dependencies, runtime components, explicit loads, injected diagnostics, compatibility components, and API-set hosting can all add or change the live view."
        ],
        inlineCheck: ["A DLL appears in Process Explorer but not in the executable's direct import list. Which explanation is valid?", ["That is impossible", "It can be transitive or explicitly loaded", "The PE signature must be corrupt", "The process has no loader"], 1, "The live module graph includes more than direct implicit imports."]
      },
      {
        title: "DllMain runs under loader constraints",
        paragraphs: [
          "DLL initialization notifications occur while the loader protects internal state. DllMain should perform minimal work, avoid waiting for other threads, avoid loading additional modules through unsafe paths, and defer complex initialization to an explicit function called after loading completes. A dependency cycle plus cross-thread waiting can deadlock process startup.",
          "Thread attach and detach notifications add cost and reentrancy concerns, and abrupt process termination does not provide every orderly cleanup guarantee. A DLL should not depend on DllMain as a general application lifecycle manager."
        ],
        callout: { label: "Implementation versus contract", text: "It is useful to know that much loader work is user mode in Ntdll, but applications should rely on documented loader APIs and DllMain restrictions, not private Ldrp* names." }
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "From CreateProcess success to program entry",
        intro: "The creator can receive handles before the child has completed user-mode loader initialization.",
        items: [
          { meta: "Kernel setup", label: "Process, thread, image, Ntdll", detail: "Address space and initial execution context", linkAfter: "enter user mode" },
          { meta: "Loader graph", label: "Map dependencies", detail: "Direct and transitive modules", linkAfter: "fix addresses" },
          { meta: "Resolution", label: "Relocations and imports", detail: "Chosen bases and callable IAT entries", linkAfter: "initialize" },
          { meta: "Application", label: "TLS, DLL init, entry path", detail: "Runtime startup then program logic" }
        ],
        caption: "CreateProcess returning successfully does not guarantee the child will survive every later loader or runtime initialization step."
      }
    ],
    workedExamples: [
      {
        type: "trace",
        title: "Interpret the supplied how_to_load result",
        prompt: "A disposable x86 cmd copy is modified to import one export from an x86 msgbox.dll placed beside it.",
        steps: [
          { title: "Establish compatibility", action: "CFF Explorer shows Machine 0x014C and Magic 0x010B for both files.", why: "An x86 process requires an x86 in-process native DLL.", result: "Architecture is compatible, but behavior is not yet proven." },
          { title: "Add declared dependency", action: "The import table gains msgbox.dll and ?MyExport@@YAXXZ by name.", why: "The executable now asks the loader to satisfy the DLL and export before ordinary startup continues.", result: "Static inspection shows the new requirement." },
          { title: "Start disposable copy", action: "The loader selects the adjacent lab DLL, resolves the decorated export, and runs module initialization as required.", why: "The rebuilt import establishes startup-time implicit loading.", result: "The command prompt and controlled message box appear." },
          { title: "Corroborate live path", action: "Image Load capture and module snapshot identify the exact msgbox.dll path in the test PID.", why: "A message box alone does not prove which file supplied the code.", result: "Static dependency and live provenance agree." },
          { title: "Bound the conclusion", action: "State that modifying a copy invalidates its original hash and can break signatures or assumptions.", why: "The lab demonstrates loader mechanics, not a supported production extension model.", result: "The modified artifacts are discarded after the isolated exercise." }
        ],
        conclusion: "The strongest proof combines matching architecture, rebuilt static import data, time-based Image Load evidence, and a current module path."
      }
    ],
    windowsLearning: [
      {
        title: "Secure DLL selection is part of correctness",
        paragraphs: [
          "A bare DLL name can be influenced by process configuration, application directory, system locations, KnownDLLs, package behavior, and LoadLibraryEx flags. Current-directory assumptions create both reliability and security problems. Use supported packaging, explicit trusted paths where appropriate, AddDllDirectory, SetDefaultDllDirectories, and documented search flags.",
          "The selected module should be verified by full path and, when trust matters, signature or deployment provenance. A familiar basename is weak evidence because a different directory can contain another file with the same name."
        ]
      },
      {
        title: "Trace, snapshot, and static import evidence answer different questions",
        paragraphs: [
          "CFF Explorer shows declared imports before execution. Process Monitor Image Load events establish selection and timing during a capture. Process Explorer and ListDLLs show modules currently mapped and their paths. Sigcheck reports file identity, hash, and signature. Use the smallest combination that answers the investigation.",
          "A module can load and unload between snapshots, while a captured event remains. A module can remain mapped without appearing in the main executable's imports because it is transitive or explicit. State these time boundaries in every conclusion."
        ]
      }
    ],
    practice: {
      title: "Prove a controlled startup import",
      time: "50 min",
      download: ["downloads/pe_inspector_lab.py", "pe_inspector_lab.py"],
      intro: "Repeat the repository import-table exercise only with matching disposable lab files in an isolated directory or VM.",
      expectedOutcome: "After rebuilding the copy, static inspection should show the new DLL and export import. A filtered run should record the DLL's exact Image Load path before the application reaches its ordinary behavior. The live module list should contain the same path while loaded. Hash and signature state of the modified executable should differ from the original.",
      safety: "Modify only a disposable executable copy and a lab DLL you own. Keep matching architectures, preserve the originals, do not patch production or signed system files in place, and perform the exercise in a disposable VM if the binary's behavior is not fully known.",
      steps: [
        {
          action: "Download pe_inspector_lab.py and open PowerShell in its folder. Enter paths to a harmless executable and DLL that you own; this block creates only .\\iloveos-loader-lab\\host-lab.exe and .\\iloveos-loader-lab\\msgbox-lab.dll copies, then hashes and parses both copies.",
          commands: [{ label: "PowerShell", code: "$hostOriginal = Read-Host 'Enter the full path to an owned harmless executable'\n$dllOriginal = Read-Host 'Enter the full path to an owned lab DLL'\n$lab = Join-Path $PWD 'iloveos-loader-lab'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nCopy-Item -LiteralPath $hostOriginal -Destination (Join-Path $lab 'host-lab.exe')\nCopy-Item -LiteralPath $dllOriginal -Destination (Join-Path $lab 'msgbox-lab.dll')\nGet-FileHash -Algorithm SHA256 -LiteralPath $hostOriginal,$dllOriginal,(Join-Path $lab 'host-lab.exe'),(Join-Path $lab 'msgbox-lab.dll')\npy .\\pe_inspector_lab.py .\\iloveos-loader-lab\\host-lab.exe\npy .\\pe_inspector_lab.py .\\iloveos-loader-lab\\msgbox-lab.dll" }],
          why: "Provenance, disposable names, and matching architecture are prerequisites before any import edit.",
          observe: "Record original and copy SHA-256 values, signature states from your verifier, and Machine plus Optional Header Magic for host-lab.exe and msgbox-lab.dll. If Machine or Magic differ, stop with the architecture-mismatch branch; do not edit or run the pair."
        },
        { action: "Open .\\iloveos-loader-lab\\msgbox-lab.dll in a PE viewer and inspect its Export Directory. Record the exact owned export name, ordinal, RVA, and decoration; use that exact name in the next step.", why: "The import must request a symbol that the owned DLL actually publishes with a compatible ABI.", observe: "If the intended export is absent, stop with the missing-export branch rather than reconstructing ?MyExport@@YAXXZ from the walkthrough. A decorated name must be copied exactly." },
        { action: "In your PE editor, open only .\\iloveos-loader-lab\\host-lab.exe, add an import descriptor for msgbox-lab.dll and the exact export recorded in step 2, rebuild to the same host-lab.exe copy, and close the editor without touching either original path.", why: "This changes startup dependency metadata and usually changes hash or signature validity.", observe: "Reopen host-lab.exe and prove the new descriptor and thunk name exist. Re-run your hash/signature verifier and record the changed copy hash and invalidated or absent signature before execution." },
        {
          action: "In Process Monitor, clear the display and add Process Name is host-lab.exe Include plus Operation is Image Load Include, then resume capture. Run the owned host-lab.exe copy from its lab directory and print the returned PID; pause capture as soon as startup succeeds or fails.",
          commands: [{ label: "PowerShell", code: "$host = (Resolve-Path .\\iloveos-loader-lab\\host-lab.exe).Path\n$process = Start-Process -FilePath $host -WorkingDirectory (Split-Path $host) -PassThru\n\"host-lab.exe PID: $($process.Id)\"" }],
          why: "Time-based evidence shows which exact adjacent DLL path Windows selected before ordinary behavior.",
          observe: "Record host PID, msgbox-lab.dll Image Load path, event order, Result, and process architecture. If startup fails, distinguish architecture mismatch, DLL not found, export not found, malformed PE, and a missing transitive dependency using the observed Result or loader error; do not run unknown files merely to obtain a trace."
        },
        { action: "If host-lab.exe remains live, select the recorded PID in Process Explorer, choose View > Show Lower Pane and View > Lower Pane View > DLLs, and find the exact .\\iloveos-loader-lab\\msgbox-lab.dll path.", why: "Static, trace, and snapshot evidence corroborate different parts of the claim.", observe: "Record module base, size, path, and verified-signer availability, then write a timeline containing direct import, possible transitive dependencies, initialization, and entry path. If the module unloaded or the process exited before refresh, record that temporal branch; an absent snapshot does not erase the Image Load trace." },
        { action: "Discard the modified artifacts or restore the isolated VM snapshot.", why: "Binary modification is not a durable or supported extension mechanism for ordinary software.", observe: "Confirm the original hashes remain unchanged and no altered copy replaced a system file." }
      ],
      hints: [{ title: "The process fails before showing a window", body: "Inspect Process Monitor and loader error output for architecture mismatch, DLL not found, export not found, or dependency failure. Recheck exact decorated name and the DLL's own transitive dependencies." }],
      cleanup: ["Delete only .\\iloveos-loader-lab\\host-lab.exe, .\\iloveos-loader-lab\\msgbox-lab.dll, and the now-empty .\\iloveos-loader-lab folder, or restore the VM snapshot.", "Stop the Process Monitor capture and retain only non-sensitive notes or screenshots needed for study."],
      extension: { title: "Independent variation", prompt: "Design a supported plugin interface that achieves optional loading without rewriting the host PE. Specify version negotiation, trusted path, initialization, failure, and unload contracts." }
    },
    checks: [
      ["Why can CreateProcess succeed before a child later fails to start normally?", ["The creator already owns a PID, but user-mode loader initialization can still fail", "CreateProcess compiles the source", "The child has no image", "The loader runs only after process exit"], 0, "Kernel process creation and later user-mode loader work are distinct stages."],
      ["Why should DllMain avoid cross-thread waits?", ["It has no stack", "Loader constraints can create deadlock with threads needing loader progress", "It always runs as SYSTEM", "It cannot read parameters"], 1, "Waiting while loader state is protected can create a dependency cycle that prevents either side from progressing."],
      ["Which evidence best proves the exact DLL path selected during startup?", ["The import basename alone", "A filtered Image Load event correlated to the test PID", "The DLL extension", "The source-code comment"], 1, "The trace records the selected path and timing for that process instance."]
    ]
  }
};
