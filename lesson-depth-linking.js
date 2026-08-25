window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "compile-link-execute": {
    apis: ["CreateProcessW", "GetModuleFileNameW", "win32api.GetModuleFileName"],
    phases: {
      learn: ["Build an executable image", "Follow source through compilation, object files, symbol resolution, and PE layout."],
      windows: ["Relate the file to the process", "Connect PE metadata and architecture to the loader's work and the live mapped image."],
      investigation: ["Trace one known binary", "Compare safe file parsing with the process image Windows actually runs."],
      review: ["Check the build path", "Test compiler, linker, loader, architecture, and error-stage distinctions."]
    },
    learning: [
      {
        title: "Compilation and linking solve different reference problems",
        paragraphs: [
          "A compiler translates one source unit into machine code and data plus metadata that still contains unresolved symbols and relocation records. The object file does not need to know the final address of every function or global. It records enough information for a linker to combine it with other objects and libraries.",
          "The linker chooses a final section layout, resolves definitions it can see, applies or emits relocations, removes or combines content according to toolchain policy, and writes a PE image. A missing declaration can cause a compile error, while a referenced symbol that was declared but never defined normally causes a link error."
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
        callout: { label: "Keep the stages distinct", text: "The compiler translates the language, the linker constructs the image, the loader maps the image and resolves its dependencies, and the program then performs its own runtime work." }
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
        conclusion: "Symbol resolution during linking and image relocation during loading are related tasks that resolve addresses at different times."
      }
    ],
    windowsLearning: [
      {
        title: "Architecture appears in both file metadata and process behavior",
        paragraphs: [
          "The COFF Machine field identifies the target machine type, and Optional Header Magic distinguishes PE32 from PE32+. These values must be interpreted together. A 32-bit process on 64-bit Windows also runs under WoW64, which affects module compatibility, paths, and inspection tools.",
          "Sigcheck can report architecture, hashes, version, and signature information without modifying the file. CFF Explorer exposes headers and directories. Process Explorer then shows the image path, process type, mapped base, and loaded modules for the live instance."
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
      expectedOutcome: "The parser and CFF Explorer should agree on MZ, PE signature, Machine, Optional Header Magic, section count, entry-point RVA, and preferred image base. The live image base may differ from the preferred base because of ASLR, but live base plus entry-point RVA should fall inside an executable image region.",
      safety: "Inspect a known Microsoft-signed system binary or a harmless binary you built. Parsing does not require execution. Never run an unknown sample merely to populate the live-process half of the exercise.",
      steps: [
        {
          action: "Download pe_inspector_lab.py and open PowerShell in its folder. Create .\\iloveos-pe-lab\\notepad-lab.exe as a lab copy that you control, then parse that exact copy.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-pe-lab'\n$copy = Join-Path $lab 'notepad-lab.exe'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nCopy-Item -LiteralPath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -Destination $copy\npy .\\pe_inspector_lab.py $copy" }],
          why: "The lab copy leaves the signed System32 original untouched and gives pe_inspector_lab.py a stable input.",
          observe: "pe_inspector_lab.py prints the resolved path, file size, Machine value, Optional Header Magic, section count, AddressOfEntryPoint RVA, preferred ImageBase, and section rows. If the MZ or PE signature is missing, the parser reports a malformed PE file."
        },
        { action: "In CFF Explorer, choose File > Open and select .\\iloveos-pe-lab\\notepad-lab.exe. In the left tree, inspect DOS Header, NT Headers > File Header, NT Headers > Optional Header, and Section Headers.", why: "These named static views provide a second interpretation of the lab file.", observe: "CFF Explorer shows the same MZ and PE signatures, Machine value, Magic value, section count, entry RVA, ImageBase, alignments, image size, and section identities. If CFF Explorer is unavailable, continue with the parser output instead of substituting an unspecified viewer." },
        {
          action: "Run the trusted System32 original and print its PID and creation time.",
          commands: [{ label: "PowerShell", code: "$live = Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -PassThru\n\"Live PID: $($live.Id)\"\n\"Creation time: $($live.StartTime.ToString('o'))\"" }],
          why: "The live view tests loader choices against static metadata without executing the copied file.",
          observe: "The trusted original opens and PowerShell prints the launcher PID and creation time. If modern Notepad redirects and that PID exits, use Process Explorer to match the surviving Notepad by creation time and System32 image path."
        },
        { action: "Select the exact live Notepad PID in Process Explorer. Choose View > Show Lower Pane, then View > Lower Pane View > DLLs. Open the lower pane's Select Columns dialog, select the DLL tab, enable Base Address, and locate the row with the exact notepad.exe module path.", why: "The DLL lower pane shows the module selected by the loader and its live base address without requiring address arithmetic.", observe: "The row with the exact module path shows a live Base Address that can differ from the preferred ImageBase printed by pe_inspector_lab.py. Access denial, process redirection, and an exited PID are separate possible outcomes." },
        {
          action: "Close the Notepad process started earlier, close CFF Explorer without saving, and run this PowerShell cleanup block for the lab-copy directory.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-pe-lab'\nif (Test-Path -LiteralPath $lab) { Remove-Item -LiteralPath $lab -Recurse }\nTest-Path -LiteralPath $lab" }],
          why: "Cleanup removes only the directory created in step 1.",
          observe: "PowerShell prints False. A True result means the lab directory remains."
        }
      ],
      hints: [{ title: "The live base is hard to find", body: "Use Process Explorer process properties, the DLL lower pane, or VMMap. Match exact PID and path because several processes can use the same image name." }],
      cleanup: ["If the Notepad process started for the exercise is still running, close it through its own window.", "The final PowerShell block removes only .\\iloveos-pe-lab."]
    },
    checks: [
      ["What does an object file normally retain for the linker?", ["Only screenshots", "Symbols and relocation information", "A running PID", "Physical frame numbers"], 1, "Object files carry unresolved relationships and metadata needed for final image construction."],
      ["Why is a PE file not copied byte-for-byte into memory?", ["Sections have separate raw and virtual layouts", "Windows cannot read files", "Every byte becomes a thread", "The linker deletes the headers"], 0, "Headers describe alignment, mapping, zero-filled tails, protections, and directories."],
      ["Which problem would normally appear only when the program is loaded?", ["A syntax error in the source", "An unresolved local variable type", "A required export is missing from an imported DLL", "The application rejects a user's password"], 2, "The program was built successfully, but the loader cannot satisfy one of its declared dependencies."]
    ]
  },

  "static-dynamic-linking": {
    apis: ["win32api.LoadLibrary", "win32api.GetProcAddress", "win32api.FreeLibrary", "SetDefaultDllDirectories"],
    phases: {
      learn: ["Choose when code is resolved", "Compare static archives, implicit DLL imports, and explicit runtime loading."],
      windows: ["Manage module references", "Handle DLL selection, architecture, exports, paths, and FreeLibrary correctly."],
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
          "Implicit linking records DLL and function requirements in the PE import directory. The loader normally satisfies them before the program's normal entry point begins executing, so a missing required dependency prevents normal startup. An import library used during the build describes this relationship; it is not the DLL's implementation code copied into the executable.",
          "Explicit linking calls LoadLibrary or LoadLibraryEx when a feature is needed, then resolves exports with GetProcAddress. This permits optional behavior and version negotiation, but the code must handle path selection, absent modules, absent exports, exact ABI signatures, reference lifetime, and partial initialization."
        ],
        inlineCheck: ["A build uses vendor.lib, and the final PE imports vendor.dll. What was vendor.lib most likely?", ["The running process", "An import library describing DLL exports", "A page file", "A thread context"], 1, "Windows toolchains commonly use an import library to let the linker create an implicit DLL import."]
      },
      {
        title: "Dynamic sharing still requires ABI compatibility",
        paragraphs: [
          "Several processes can map the same DLL's clean image pages while retaining private writable state. A shared file on disk and shared physical code pages reduce duplication, but each process has its own module base, loader records, import slots, and private data pages where applicable.",
          "Replacing a DLL safely requires compatible exports, calling conventions, data layouts, behavior, and architecture. A file with the same name is not automatically a compatible implementation. Versioning and deployment must be designed explicitly; the loader does not handle them for you."
        ]
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "Three ways a function becomes callable in a process",
        intro: "The moment of resolution changes error handling and deployment.",
        items: [
          { meta: "Static", label: "Object code copied at link time", detail: "No separate library archive at runtime", linkAfter: "or" },
          { meta: "Implicit DLL", label: "Import recorded in PE", detail: "Loader resolves during startup", linkAfter: "or" },
          { meta: "Explicit DLL", label: "LoadLibrary at runtime", detail: "Program resolves the export and handles failure", linkAfter: "all become" },
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
          { title: "Explicit load", rows: [["Availability", "Checked when export is requested"], ["Call site", "Resolved typed function pointer"], ["Failure", "Application can disable the feature or report that it is unavailable"], ["Best fit", "Optional component with defined fallback"]] }
        ],
        shared: "Both require matching architecture, compatible ABI, trustworthy path selection, and a supported component contract.",
        conclusion: "Explicit loading supports optional components only when every failure and cleanup path has been designed."
      }
    ],
    windowsLearning: [
      {
        title: "LoadLibrary ownership is reference-based",
        paragraphs: [
          "A successful LoadLibrary call adds a module reference for the process and returns an HMODULE, effectively the loaded module base for ordinary Win32 use. Match each reference your code obtains with FreeLibrary once no code, data pointer, or active callback depends on the module.",
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
      title: "Observe a module reference obtained explicitly",
      time: "30 min",
      intro: "Load a known system DLL by explicit path, correlate the Image Load event, then release the reference obtained by the script.",
      download: ["downloads/module_lifetime_lab.py", "module_lifetime_lab.py"],
      expectedOutcome: "module_lifetime_lab.py resolves the DLL under System32, obtains a reference with LoadLibrary, and prints its HMODULE. Process Monitor captures an Image Load if the module was not already mapped, while Process Explorer shows the selected path. After FreeLibrary, the module may unload if no other references remain, but a preexisting or transitive reference can keep it mapped.",
      steps: [
        {
          action: "Download module_lifetime_lab.py, open PowerShell in its folder, run the explicit version.dll command, and leave it at the first pause.",
          commands: [{ label: "PowerShell", code: "py .\\module_lifetime_lab.py --dll $env:SystemRoot\\System32\\version.dll" }],
          why: "The pre-load pause establishes whether the exact System32\\version.dll path is already present.",
          observe: "module_lifetime_lab.py prints the PID, Python pointer width, and explicit System32\\version.dll path. An unavailable process and a DLL that is not yet mapped are separate outcomes."
        },
        { action: "Select the printed PID in Process Explorer. Choose View > Show Lower Pane, then View > Lower Pane View > DLLs. Open the lower pane's Select Columns dialog, select the DLL tab, enable Base Address, and look for the row with the exact System32\\version.dll path before LoadLibrary runs.", why: "The baseline distinguishes a new Image Load from an already mapped dependency.", observe: "The row with the exact module path is either present or absent before the supplied load. If present, its Base Address is visible but remains an observation from this particular run." },
        { action: "In Process Monitor, add Include filters for the printed PID and for Operation is Image Load. Clear the display and resume capturing. Press Enter once in module_lifetime_lab.py. When 'Inspect Image Load' appears, pause the capture and refresh the row with the exact System32\\version.dll path in Process Explorer.", why: "The trace captures the loading history while the pause preserves the current mapped state.", observe: "module_lifetime_lab.py prints the HMODULE for the reference it obtained and the selected path. Process Monitor can show an Image Load event for the exact path. If the baseline already contained version.dll, the absence of a new event indicates that the module was preloaded." },
        { action: "Press Enter once at module_lifetime_lab.py's FreeLibrary prompt, leave it at 'Refresh the module snapshot,' and refresh the row with the exact System32\\version.dll path for the same PID.", why: "One release removes only the reference obtained by module_lifetime_lab.py.", observe: "The row can disappear or remain because another reference exists. Access denial and an exited PID are separate possible outcomes." },
        { action: "Press Enter once at the final module_lifetime_lab.py prompt so the supplied process exits.", why: "The final pause exists only to inspect post-FreeLibrary state.", observe: "The command returns to PowerShell and the printed PID disappears from Process Explorer after refresh." }
      ],
      checkpoints: [{ afterStep: 3, type: "short", prompt: "Complete the supplied System32 module name: [____].dll", answer: "version", acceptedAnswers: [], feedback: "module_lifetime_lab.py deliberately loads the explicit System32\\version.dll path." }],
      hints: [{ title: "No new Image Load event appears", body: "version.dll may already be loaded. Use the pre-load baseline and exact path row instead of changing the controlled target." }],
      cleanup: ["If module_lifetime_lab.py is still paused, press Enter until it exits after FreeLibrary.", "Leave Process Monitor capture stopped and close module-inspection tools."]
    },
    checks: [
      ["What does static linking normally copy into the output?", ["A live process", "Needed object code and data from library members", "The DLL search path", "Physical pages"], 1, "The linker incorporates selected compiled content from the archive."],
      ["How should code release a module reference acquired with LoadLibrary?", ["Call CloseHandle", "Call FreeLibrary after it finishes using the module", "Call VirtualFree", "Call TerminateProcess"], 1, "FreeLibrary releases the module reference acquired by LoadLibrary."],
      ["Why can a DLL remain mapped after one FreeLibrary?", ["FreeLibrary never works", "Other references or loader dependencies can remain", "The HMODULE is a PID", "Every DLL is permanent"], 1, "Module lifetime is reference-based within the process."]
    ]
  },

  "pe-anatomy": {
    apis: ["ctypes.Structure", "ctypes.sizeof"],
    phases: {
      learn: ["Walk the PE header chain", "Read MZ, e_lfanew, PE signature, COFF fields, optional fields, directories, and sections."],
      windows: ["Parse without trusting the file", "Apply architecture-aware sizes, bounds checks, and unusual directory rules."],
      investigation: ["Validate a known PE", "Compare a safe parser with CFF Explorer and Sigcheck."],
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
          "Data-directory entries are address and size pairs for structures such as imports, exports, resources, base relocations, exception data, TLS, and debug information. Most addresses are RVAs. The security directory is an important exception: its address identifies a file position for certificate data rather than an ordinary mapped RVA.",
          "The section table describes the name, virtual size and address, raw size and pointer, and characteristics. Names such as .text and .data are conventions. Trust the characteristics and bounds, not the label alone, and treat malformed files as hostile input even when the parser never executes them."
        ],
        callout: { label: "Parser rule", text: "Validate before adding. Check that offset, size, and offset + size remain within the file and that the arithmetic cannot wrap in the integer type used by the parser." }
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
        caption: "Data-directory targets usually lie within the raw and virtual ranges described by the sections."
      }
    ],
    workedExamples: [
      {
        type: "decision",
        title: "Reject a truncated header safely",
        prompt: "A file says e_lfanew is 0x9000, but the entire file is 0x1200 bytes.",
        steps: [
          { title: "Validate the DOS read", action: "Confirm at least 0x40 bytes exist before reading e_lfanew.", why: "The field itself must be inside the file.", result: "The MZ and pointer read can be trusted only after this check." },
          { title: "Validate the target", action: "Require e_lfanew + 4 + COFF header size to remain within the file length.", why: "A pointer outside the file cannot identify a valid PE signature and header.", result: "0x9000 exceeds 0x1200, so parsing stops." },
          { title: "Report a structural error", action: "Report clearly that the image is invalid or truncated without loading the file.", why: "Trying alternate offsets would turn malformed input into unsafe guesswork.", result: "No execution or out-of-bounds read occurs." }
        ],
        conclusion: "A valid MZ signature does not prove the rest of the PE is present or trustworthy."
      }
    ],
    windowsLearning: [
      {
        title: "Machine and Magic together identify the architecture",
        paragraphs: [
          "The supplied how_to_load report correctly used Machine 0x014C and Magic 0x010B to establish an x86 PE32 DLL and matched it to an x86 PE32 executable. Machine identifies the target processor family, while Magic selects the optional-header format. One field reinforces but does not replace the other.",
          "Other compatibility conditions still matter, including the exported-symbol ABI, subsystem expectations, dependencies, and process mitigation policy. A matching architecture is necessary for an in-process native DLL, but it is not sufficient for correct behavior."
        ]
      },
      {
        title: "Static inspection should not execute the target",
        paragraphs: [
          "pe_inspector_lab.py opens the file as bytes, validates bounds, and reports a limited set of fields. CFF Explorer supplies a second interpretation, while Sigcheck adds hashes, signature, version, and entropy-related metadata. None requires launching the target.",
          "Do not use LoadLibrary as a general PE parser. Loading executes loader behavior and can run DLL initialization code. Data-file loading flags exist for specialized resource use, but ordinary structural analysis should read the file format."
        ]
      }
    ],
    practice: {
      title: "Parse and verify the PE header chain",
      time: "35 min",
      intro: "Use the shared PE inspector against a known file and deliberately test one truncated copy.",
      download: ["downloads/pe_inspector_lab.py", "pe_inspector_lab.py"],
      expectedOutcome: "The parser should report the same Machine, Magic, section count, entry RVA, image base, alignments, image size, and section rows as CFF Explorer. It should reject a deliberately truncated copy with a clear error rather than crashing or inventing fields.",
      steps: [
        {
          action: "Download pe_inspector_lab.py and open PowerShell in its folder. Create .\\iloveos-pe-anatomy\\notepad-intact.exe as a lab copy and parse it.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-pe-anatomy'\n$intact = Join-Path $lab 'notepad-intact.exe'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nCopy-Item -LiteralPath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -Destination $intact\npy .\\pe_inspector_lab.py $intact" }],
          why: "The known, unchanged notepad-intact.exe file establishes the normal header path without loading the copy.",
          observe: "pe_inspector_lab.py prints the resolved path, MZ, e_lfanew, PE signature, Machine, section count, Magic, entry RVA, preferred ImageBase, alignments, SizeOfImage, SizeOfHeaders, and section rows."
        },
        {
          action: "Hash and verify the exact intact copy with PowerShell and Sigcheck. Then choose File > Open in CFF Explorer and select .\\iloveos-pe-anatomy\\notepad-intact.exe. In the left tree, examine NT Headers > File Header, NT Headers > Optional Header, and Section Headers.",
          commands: [{ label: "PowerShell", code: "$intact = Join-Path $PWD 'iloveos-pe-anatomy\\notepad-intact.exe'\nGet-FileHash -Algorithm SHA256 -LiteralPath $intact\n$sigcheck = Get-Command sigcheck.exe -ErrorAction SilentlyContinue\nif ($sigcheck) { & $sigcheck.Source -nobanner -h -a $intact } else { 'Sigcheck unavailable; continue with the hash, parser, and CFF Explorer.' }" }],
          why: "The three views check field offsets, architecture interpretation, and provenance separately.",
          observe: "PowerShell prints the SHA-256 hash. Sigcheck shows the signature status and machine type. CFF Explorer shows Magic and the matching named header fields. If Sigcheck is unavailable, the hash, parser, and CFF Explorer still provide the other evidence."
        },
        {
          action: "Create the disposable .\\iloveos-pe-anatomy\\notepad-truncated.exe from the intact copy, keep only its first 128 bytes, and rerun pe_inspector_lab.py on the malformed copy.",
          commands: [{ label: "PowerShell", code: "$intact = Join-Path $PWD 'iloveos-pe-anatomy\\notepad-intact.exe'\n$truncated = Join-Path $PWD 'iloveos-pe-anatomy\\notepad-truncated.exe'\n$bytes = [IO.File]::ReadAllBytes($intact)\n[IO.File]::WriteAllBytes($truncated, $bytes[0..127])\npy .\\pe_inspector_lab.py $truncated" }],
          why: "Safe file-format handling includes predictable failure behavior.",
          observe: "Expect a clear PE inspection failure message that identifies a missing header or an out-of-bounds section range. If the intact source is unexpectedly shorter than 128 bytes, stop rather than producing an invalid slice."
        },
        {
          action: "Close CFF Explorer without saving and run this PowerShell cleanup block for the PE anatomy lab directory.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-pe-anatomy'\nif (Test-Path -LiteralPath $lab) { Remove-Item -LiteralPath $lab -Recurse }\nTest-Path -LiteralPath $lab" }],
          why: "Cleanup removes only the intact and truncated copies created by the exercise.",
          observe: "PowerShell prints False. A True result means the lab directory remains."
        }
      ],
      hints: [{ title: "The section table offset is wrong", body: "Use e_lfanew + 4-byte signature + 20-byte COFF header + SizeOfOptionalHeader. Do not assume PE32 and PE32+ optional headers have one fixed common size." }],
      cleanup: ["Close CFF Explorer without saving modifications.", "The final PowerShell block removes only .\\iloveos-pe-anatomy."]
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
      learn: ["Translate among three locations", "Relate file offsets, RVAs, and live VAs through the section table."],
      windows: ["Account for mapping and relocation", "Use section alignment, zero-fill, ASLR, and protections without assuming one-to-one layout."],
      investigation: ["Resolve one RVA twice", "Calculate its raw file position and its live process address, then verify both."],
      review: ["Check the mapping", "Test RVA arithmetic, section selection, zero-fill, relocation, and protections."]
    },
    learning: [
      {
        title: "File offset, RVA, and VA use different coordinate systems",
        paragraphs: [
          "A file offset counts bytes from the beginning of the PE file. An RVA counts bytes from the loaded image base. A VA is the resulting live virtual address inside one process. The same content can therefore be described by all three values, but converting between them requires section or loading information.",
          "For live memory, VA = loaded image base + RVA. For file content inside a section, file offset = PointerToRawData + (RVA - section VirtualAddress). Find the containing section and confirm the valid range before applying the second equation."
        ]
      },
      {
        title: "Raw size and virtual size explain padding and zero-filled tails",
        paragraphs: [
          "FileAlignment controls raw placement, while SectionAlignment controls mapped placement. SizeOfRawData is commonly padded to file alignment. VirtualSize describes the meaningful mapped extent and can exceed the raw size. In that case, the loader supplies the tail as zero-filled memory rather than reading it from a file offset.",
          "An RVA in the headers can map directly within SizeOfHeaders when it is within the defined bounds. An RVA in a virtual tail beyond the raw data has a valid mapped address but no corresponding stored byte to read. A correct converter reports that distinction instead of inventing a file offset."
        ],
        inlineCheck: ["An RVA is inside a section's VirtualSize but beyond SizeOfRawData. What is the likely result?", ["It must be another PID", "It can be a zero-filled mapped tail with no raw file byte", "The PE signature moves", "ASLR is disabled"], 1, "The mapped virtual extent can include bytes that are not stored in the section's raw data."]
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
        caption: "The byte remains 0x234 bytes from the start of the section in both coordinate systems."
      }
    ],
    workedExamples: [
      {
        type: "calculation",
        title: "Resolve an entry-point RVA to disk and memory",
        prompt: "A PE has .text VirtualAddress 0x1000, PointerToRawData 0x400, and entry RVA 0x17B0. It loads at 0x00007FF712340000.",
        steps: [
          { title: "Find the offset within the section", action: "Subtract the section RVA from the target RVA.", result: "0x17B0 - 0x1000 = 0x7B0", why: "This locates the byte relative to the beginning of .text." },
          { title: "Find file offset", action: "Add the within-section offset to PointerToRawData.", result: "0x400 + 0x7B0 = 0xBB0", why: "This is valid only if 0x7B0 is within stored raw data." },
          { title: "Find live VA", action: "Add the RVA to the actual loaded image base.", result: "0x00007FF712340000 + 0x17B0 = 0x00007FF7123417B0", why: "ASLR affects the base, not the image-relative offset." },
          { title: "Validate ranges", action: "Confirm both results fall inside their respective raw and mapped .text spans.", result: "Reject the conversion if either containing-range test fails", why: "Arithmetic alone cannot make an out-of-range RVA valid." }
        ],
        conclusion: "Use the section-relative offset to connect the two coordinate systems, and validate the result in each one."
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
          "CFF Explorer and pe_inspector_lab.py expose raw pointers, RVAs, sizes, and characteristics. Process Explorer reports module bases. VMMap shows live image ranges and protections. HxD can verify the calculated raw file offset, while WinDbg can inspect the calculated live VA in a process you own.",
          "Relocations can change address-bearing bytes after mapping, so not every live byte must equal the raw file byte. Choose ordinary instruction or constant bytes for a simple comparison and explain relocation as a limitation."
        ]
      }
    ],
    practice: {
      title: "Resolve one RVA in a PE file you control",
      time: "35 min",
      intro: "Use the PE inspector's RVA option to find a valid stored byte, then keep that file-relative evidence separate from the identity of a restarted process.",
      download: ["downloads/pe_inspector_lab.py", "pe_inspector_lab.py"],
      expectedOutcome: "The inspector should identify the containing section, within-section offset, and raw file offset for an RVA backed by file bytes, and HxD should show the same raw byte. A restarted trusted process receives a new live identity, so no runtime address is inferred from or combined with the static file evidence.",
      steps: [
        {
          action: "Download pe_inspector_lab.py and open PowerShell in its folder. Create .\\iloveos-rva-lab\\notepad-rva.exe as a lab copy and parse it once to obtain AddressOfEntryPoint.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-rva-lab'\n$copy = Join-Path $lab 'notepad-rva.exe'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nCopy-Item -LiteralPath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -Destination $copy\npy .\\pe_inspector_lab.py $copy" }],
          why: "The first parse establishes the architecture, section bounds, and an exact RVA from a known, unchanged file.",
          observe: "pe_inspector_lab.py prints the full copy path and an AddressOfEntryPoint value consumed by step 2."
        },
        {
          action: "Run pe_inspector_lab.py again on notepad-rva.exe, entering the AddressOfEntryPoint printed in step 1 when prompted.",
          commands: [{ label: "PowerShell", code: "$entryRva = Read-Host 'Enter AddressOfEntryPoint exactly as printed, including 0x'\npy .\\pe_inspector_lab.py .\\iloveos-rva-lab\\notepad-rva.exe --rva $entryRva" }],
          why: "The parser validates the entered RVA against the same file and section bounds.",
          observe: "pe_inspector_lab.py prints the containing section, its RVA and raw ranges, the offset within the section, the raw file offset, and the byte at that offset. A zero-filled virtual tail has no raw file offset. An RVA outside every range is reported as malformed input."
        },
        { action: "Open HxD, choose File > Open, and select .\\iloveos-rva-lab\\notepad-rva.exe. Choose Search > Goto (Ctrl+G), enter the raw file offset printed by pe_inspector_lab.py as a hexadecimal offset from the beginning of the file, and inspect that byte without editing it.", why: "HxD independently displays the raw byte selected by the parser.", observe: "HxD selects the same byte printed by pe_inspector_lab.py. If HxD is unavailable, the parser's validated output remains visible, and you do not need to substitute an unspecified hex viewer." },
        {
          action: "Test how a restart changes process identity. Launch System32 Notepad, close the first instance through its own window when prompted, and launch a replacement. Then verify the replacement in Process Explorer without combining its identity with an RVA.",
          commands: [{ label: "PowerShell", code: "$trusted = Join-Path $env:SystemRoot 'System32\\notepad.exe'\n$first = Start-Process -FilePath $trusted -PassThru\n\"First launcher PID: $($first.Id)\"\n\"First creation time: $($first.StartTime.ToString('o'))\"\nRead-Host 'Close the first Notepad through its own window, then press Enter'\n$replacement = Start-Process -FilePath $trusted -PassThru\n\"Trusted path: $trusted\"\n\"Replacement launcher PID: $($replacement.Id)\"\n\"Replacement creation time: $($replacement.StartTime.ToString('o'))\"" }],
          why: "The restart separates stable file-relative evidence from the identity of a new process.",
          observe: "PowerShell prints distinct identity records for the first process and its replacement. If either launcher PID exits or redirects, use the printed creation time and System32 path to find the surviving Notepad process. Stop if you cannot close the first window or cannot identify one unique live replacement PID. Do not reuse any address from the earlier file inspection."
        },
        {
          action: "Close the Notepad process started for the exercise and close HxD without saving. Then run this PowerShell cleanup block for the RVA lab directory.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-rva-lab'\nif (Test-Path -LiteralPath $lab) { Remove-Item -LiteralPath $lab -Recurse }\nTest-Path -LiteralPath $lab" }],
          why: "Cleanup removes only the lab copy created in step 1.",
          observe: "PowerShell prints False. A True result means the lab directory remains."
        }
      ],
      hints: [{ title: "The tool reports no raw file byte", body: "The RVA may lie in a zero-filled virtual tail or outside every valid section. Choose an RVA within min(VirtualSize, SizeOfRawData) for a byte comparison." }],
      cleanup: ["Close HxD without saving changes.", "The final PowerShell block removes only .\\iloveos-rva-lab."]
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
      investigation: ["Inspect resolution safely", "Replace the original internal ctypes call with a typed MessageBoxW function pointer, then release the module reference."],
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
        inlineCheck: ["What does an IAT entry contain after the loader resolves its import?", ["Only the DLL filename", "The imported function's callable virtual address", "The process PID", "A page-file offset"], 1, "The loader places the resolved function address in the IAT slot."]
      },
      {
        title: "A raw address alone does not define a safe callable type",
        paragraphs: [
          "GetProcAddress returns an address. It does not tell Python the parameter count, scalar widths, pointer levels, string encoding, calling convention, or return type. Constructing the wrong callable prototype can truncate pointers, corrupt the stack on affected architectures, pass invalid text, or misread the result.",
          "The callable remains valid only while the module is loaded and the export contract remains applicable. Do not FreeLibrary while function pointers, callbacks, worker threads, or returned module-owned data can still be used."
        ],
        callout: { label: "Correction to open_the_box.py", text: "The supplied script uses private _ctypes.call_function without a declared MessageBox signature and never releases its LoadLibrary reference. The revised path uses WINFUNCTYPE, MessageBoxW, exact types, and FreeLibrary in a finally block." }
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
        caption: "GetProcAddress performs a similar export lookup, but the caller must store the returned address and assign it the correct type."
      }
    ],
    workedExamples: [
      {
        type: "contract",
        title: "Turn MessageBoxW into a safe ctypes call",
        prompt: "Resolve MessageBoxW explicitly while preserving pointer width, Unicode text, and module ownership.",
        steps: [
          { title: "Load the module", action: "LoadLibraryW(L\"user32.dll\") returns an HMODULE or null.", why: "HMODULE is pointer-sized, and a successful call creates a reference owned by the caller.", result: "The caller takes ownership only if the result is non-null." },
          { title: "Resolve the byte-string name", action: "GetProcAddress(module, b\"MessageBoxW\") returns c_void_p or null.", why: "Export names are narrow byte strings even when the target function is the W variant.", result: "The raw address is still not safe to call." },
          { title: "Declare the prototype", action: "WINFUNCTYPE(c_int, HWND, LPCWSTR, LPCWSTR, UINT)(address)", why: "The prototype defines the calling convention, four parameters, pointer encodings, and integer return value.", result: "Python now has a typed callable wrapper." },
          { title: "Call and interpret", action: "Pass null owner, Python Unicode strings, and an MB_* UINT flag.", why: "MessageBoxW expects UTF-16 string pointers and returns a button identifier.", result: "The result is interpreted before cleanup." },
          { title: "Release", action: "Call FreeLibrary(module) in a finally block after the last use.", why: "The function pointer must not outlive the module code it addresses.", result: "The reference obtained by the caller is released exactly once." }
        ],
        conclusion: "Loading, resolving, typing, calling, interpreting the result, and releasing the module form one explicit-loading lifecycle."
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
      expectedOutcome: "The script should load user32.dll, resolve a nonzero MessageBoxW address within the module range, display a Unicode message, report the selected button result, and release the module reference it obtained. The W version should accept Python str values, while the export name passed to GetProcAddress remains bytes.",
      steps: [
        { action: "Download explicit_load_lab.py and open the complete file in a text viewer. Locate MESSAGE_BOX_W and the LoadLibraryW, GetProcAddress, GetModuleFileNameW, and FreeLibrary declarations.", why: "The supplied script shows its complete typed boundary before it executes native code.", observe: "MESSAGE_BOX_W is int(HWND, LPCWSTR, LPCWSTR, UINT); GetProcAddress uses LPCSTR for the export name and returns c_void_p." },
        {
          action: "Open PowerShell in the folder containing explicit_load_lab.py, run it, and leave it at 'Inspect the module and export address.'",
          commands: [{ label: "PowerShell", code: "py .\\explicit_load_lab.py" }],
          why: "The pause keeps the user32.dll reference obtained by the script and the MessageBoxW function address available for inspection.",
          observe: "explicit_load_lab.py prints the PID, exact System32\\user32.dll path, HMODULE, MessageBoxW address, and prototype. If the export is missing, the script fails before calling any pointer."
        },
        { action: "Select the printed PID in Process Explorer. Choose View > Show Lower Pane, then View > Lower Pane View > DLLs. Open the lower pane's Select Columns dialog, select the DLL tab, enable Base Address, and locate the row with the exact System32\\user32.dll path.", why: "The row with the exact module path shows the live base address for the reference obtained by the script; a column in the top process list does not provide the same evidence.", observe: "The row shows user32.dll and its current Base Address. Access denial, an exited PID, and a missing exact path are separate possible outcomes." },
        { action: "In CFF Explorer, choose File > Open, select the exact System32\\user32.dll path printed by explicit_load_lab.py, select Export Directory in the left tree, and find MessageBoxW.", why: "The named export view confirms that explicit_load_lab.py requested a published export by name.", observe: "CFF Explorer shows MessageBoxW with its name, ordinal, RVA, and any forwarder. If CFF Explorer is unavailable, the fixed prototype printed by the script remains available as evidence, but the export-directory check is unverified." },
        { action: "Press Enter once in explicit_load_lab.py, select OK in the message box, and wait for the process to exit.", why: "The call completes before the finally block releases the module reference obtained by the script.", observe: "explicit_load_lab.py prints 'MessageBoxW result: 1,' 'result is IDOK: True,' and a message confirming that it released the user32.dll LoadLibrary reference." }
      ],
      checkpoints: [{ afterStep: 5, type: "short", prompt: "Complete the fixed return printed after selecting OK: MessageBoxW result: [____]", answer: "1", acceptedAnswers: ["IDOK"], feedback: "The supplied MB_OK message box returns IDOK, whose integer value is 1." }],
      hints: [{ title: "The function address is outside the expected module", body: "Confirm the correct PID and user32 module range, then check whether the export is forwarded or the tool displays a different mapped implementation module. Do not force the pointer into a guessed range." }],
      cleanup: ["If the message box remains open, select OK so the finally block can call FreeLibrary.", "Close CFF Explorer and Process Explorer if they are no longer needed."]
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
      learn: ["Trace process loader initialization", "Follow the mapping of the main image, dependency loading, relocations, imports, TLS, initialization, and transfer to the entry point."],
      windows: ["Control module selection", "Understand loader constraints, dependency graphs, API sets, secure paths, and live evidence."],
      investigation: ["Prove one startup dependency", "Revisit how_to_load as a controlled import-table experiment with clearer safety limits and stronger evidence."],
      review: ["Check the loader path", "Test ordering, dependency types, DllMain constraints, architecture, search, and evidence."]
    },
    learning: [
      {
        title: "Process creation prepares the environment before application code runs",
        paragraphs: [
          "Windows creates the process and initial thread, maps the main image and core user-mode support such as Ntdll, establishes process structures, and begins user-mode initialization. The loader then prepares the dependency graph, maps required DLLs, applies relocations where needed, resolves imports, establishes runtime loader records, handles TLS initialization, calls required module initialization routines, and transfers control toward the executable entry point.",
          "Exact private loader function names and internal steps can change across Windows versions. Build a durable understanding from the ordered responsibilities and documented contracts visible through PE structures, module APIs, and initialization constraints."
        ]
      },
      {
        title: "Dependencies form a graph with identity and initialization state",
        paragraphs: [
          "An executable imports DLLs that import other DLLs, producing a graph rather than one flat list. The loader tracks modules already mapped in the process and reuses existing mappings when appropriate. API-set contract names can redirect an import to an appropriate host implementation.",
          "A static import list therefore does not equal the final module list. Transitive dependencies, runtime components, explicit loads, injected diagnostics, compatibility components, and API-set hosting can all add or change the live view."
        ],
        inlineCheck: ["A DLL appears in Process Explorer but not in the executable's direct import list. Which explanation is valid?", ["That is impossible", "It can be transitive or explicitly loaded", "The PE signature must be corrupt", "The process has no loader"], 1, "The live module graph includes more than direct implicit imports."]
      },
      {
        title: "DllMain runs under loader constraints",
        paragraphs: [
          "DLL initialization notifications occur while the loader protects internal state. DllMain should perform minimal work, avoid waiting for other threads, avoid loading additional modules through unsafe paths, and defer complex initialization to an explicit function called after loading completes. A dependency cycle plus cross-thread waiting can deadlock process startup.",
          "Thread attach and detach notifications add cost and reentrancy concerns, and abrupt process termination does not guarantee every orderly cleanup notification. A DLL should not depend on DllMain as a general application lifecycle manager."
        ],
        callout: { label: "Implementation versus contract", text: "It is useful to know that much of the loader's work occurs in user mode within Ntdll, but applications should rely on documented loader APIs and DllMain restrictions, not private Ldrp* names." }
      }
    ],
    visuals: [
      {
        type: "flow",
        title: "From CreateProcess success to program entry",
        intro: "The calling process can receive handles before the child has completed user-mode loader initialization.",
        items: [
          { meta: "Kernel setup", label: "Process, thread, image, Ntdll", detail: "Address space and initial execution context", linkAfter: "enter user mode" },
          { meta: "Loader graph", label: "Map dependencies", detail: "Direct and transitive modules", linkAfter: "fix addresses" },
          { meta: "Resolution", label: "Relocations and imports", detail: "Chosen bases and callable IAT entries", linkAfter: "initialize" },
          { meta: "Application", label: "TLS, DLL init, entry path", detail: "Runtime startup then program logic" }
        ],
        caption: "A successful return from CreateProcess does not guarantee that the child will complete every later loader or runtime initialization step."
      }
    ],
    workedExamples: [
      {
        type: "trace",
        title: "Interpret the supplied how_to_load results",
        prompt: "A disposable x86 cmd copy is modified to import one export from an x86 msgbox.dll placed beside it.",
        steps: [
          { title: "Establish compatibility", action: "CFF Explorer shows Machine 0x014C and Magic 0x010B for both files.", why: "An x86 process requires an x86 in-process native DLL.", result: "Architecture is compatible, but behavior is not yet proven." },
          { title: "Add a declared dependency", action: "The import table gains msgbox.dll and ?MyExport@@YAXXZ by name.", why: "The executable now asks the loader to satisfy the DLL and export before normal startup continues.", result: "Static inspection shows the new requirement." },
          { title: "Start the disposable copy", action: "The loader selects the adjacent lab DLL, resolves the decorated export, and runs module initialization as required.", why: "The rebuilt import establishes implicit loading during startup.", result: "The command prompt and controlled message box appear." },
          { title: "Corroborate live path", action: "Image Load capture and module snapshot identify the exact msgbox.dll path in the test PID.", why: "A message box alone does not prove which file supplied the code.", result: "Static dependency and live provenance agree." },
          { title: "Qualify the conclusion", action: "State that modifying a copy changes its original hash and can invalidate signatures or other assumptions.", why: "The lab demonstrates loader mechanics, not a supported production extension model.", result: "The modified files are discarded after the isolated exercise." }
        ],
        conclusion: "The strongest proof combines matching architecture, rebuilt static import data, time-stamped Image Load evidence, and a current module path."
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
      title: "Trace a trusted startup module",
      time: "25 min",
      download: ["downloads/pe_inspector_lab.py", "pe_inspector_lab.py"],
      intro: "Parse a lab copy without executing it, then correlate one trusted System32 Notepad startup across Process Monitor and Process Explorer.",
      expectedOutcome: "pe_inspector_lab.py reports the lab copy's fixed PE structure without loading it. Process Monitor captures Image Load history for the trusted original, and Process Explorer shows the current state and dynamic Base Address of a module at an exact captured path.",
      safety: "Copy but do not modify or execute the notepad-loader.exe lab file. Run only the trusted System32 original and leave all signed system files unchanged.",
      steps: [
        {
          action: "Download pe_inspector_lab.py and open PowerShell in its folder. Create .\\iloveos-loader-lab\\notepad-loader.exe as a lab copy, hash it, and parse it without running it.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-loader-lab'\n$copy = Join-Path $lab 'notepad-loader.exe'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nCopy-Item -LiteralPath (Join-Path $env:SystemRoot 'System32\\notepad.exe') -Destination $copy\nGet-FileHash -Algorithm SHA256 -LiteralPath $copy\npy .\\pe_inspector_lab.py $copy" }],
          why: "A trusted lab copy supplies stable static metadata without binary editing or execution.",
          observe: "PowerShell prints the SHA-256 hash, and pe_inspector_lab.py prints MZ, the PE signature, Machine, Optional Header Magic, entry RVA, ImageBase, and section rows. If Python fails or reports a malformed PE file, the setup did not complete successfully."
        },
        {
          action: "In Process Monitor, pause capturing with File > Capture Events and choose Edit > Clear Display. Open Filter > Filter and add Include filters where Process Name is notepad.exe and Operation is Image Load. Resume capturing, run the trusted System32 original with this PowerShell block, and pause the capture when Notepad appears.",
          commands: [{ label: "PowerShell", code: "$notepadPath = Join-Path $env:SystemRoot 'System32\\notepad.exe'\n$live = Start-Process -FilePath $notepadPath -PassThru\n\"Live PID: $($live.Id)\"\n\"Creation time: $($live.StartTime.ToString('o'))\"" }],
          why: "Capture begins before startup so the Image Load history of the trusted executable is preserved.",
          observe: "Process Monitor shows Image Load rows for the new Notepad startup. If modern Notepad redirects, use the captured event PID and System32 path instead of assuming the launcher PID remains live."
        },
        { action: "Open one successful Process Monitor Image Load row for the live Notepad PID and read its exact module path; keep that exact captured path for step 4.", why: "The trace supplies one concrete loader-selected module path rather than an inferred basename.", observe: "The row shows Result SUCCESS, the exact module path, and the event PID. A missing row means the capture or filters were not active before startup." },
        { action: "Select the live PID from step 3 in Process Explorer. Choose View > Show Lower Pane, then View > Lower Pane View > DLLs. Open Select Columns > DLL > Base Address and locate the exact module path row captured in step 3.", why: "This snapshot checks whether the startup module is still mapped and shows its current base address.", observe: "The matching module row shows its dynamic base address while the process remains live. If the process exits or unloads the module, the earlier Process Monitor event is still valid historical evidence." },
        {
          action: "Close the Notepad process started for the exercise and run this PowerShell cleanup block for the static-copy lab directory.",
          commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-loader-lab'\nif (Test-Path -LiteralPath $lab) { Remove-Item -LiteralPath $lab -Recurse }\nTest-Path -LiteralPath $lab" }],
          why: "Cleanup removes only the non-executed copy created in step 1.",
          observe: "PowerShell prints False. A True result means the lab directory remains."
        }
      ],
      hints: [{ title: "No Image Load rows appear", body: "Confirm both Include filters, clear the display, resume capture before starting Notepad, and pause only after the window appears." }],
      cleanup: ["Leave Process Monitor capture stopped and close Process Explorer if it is no longer needed.", "The final PowerShell block removes only .\\iloveos-loader-lab."]
    },
    checks: [
      ["Why can CreateProcess succeed before a child later fails to start normally?", ["The process has been created, but user-mode loader initialization can still fail", "CreateProcess compiles the source", "The child has no image", "The loader runs only after process exit"], 0, "Kernel process creation and later user-mode loader work are distinct stages."],
      ["Why should DllMain avoid cross-thread waits?", ["It has no stack", "A thread that DllMain waits for may itself need the loader to make progress, causing a deadlock", "It always runs as SYSTEM", "It cannot read parameters"], 1, "Waiting while loader state is protected can create a dependency cycle that prevents either side from progressing."],
      ["How can you verify the exact DLL path selected during startup?", ["Read only the import basename", "Find the test process's filtered Image Load event", "Check the DLL extension", "Read a source-code comment"], 1, "The Image Load trace records the path and timing for that specific process instance."]
    ]
  }
};
