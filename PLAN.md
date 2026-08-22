# ILOVEOS Learning Site Plan

## 1. Project purpose

ILOVEOS will be a straightforward, lesson-based website for learning all of the Operating Systems material in this repository. It will turn the existing slides, documents, images, Python exercises, and practical activities into an ordered course that is easier to study and more engaging to use.

The site should help the learner:

- Understand the underlying operating-system concepts.
- Connect those concepts to Windows internals.
- Use the Win32 API through Python, with pywin32 as the priority and `ctypes` where lower-level access is educationally useful.
- Investigate real Windows behaviour using tools from the Sysinternals Suite.
- Reinforce knowledge through questions, execution puzzles, guided investigations, and practical exercises.

The site should feel like a clear interactive textbook, not an academy, game, or learning-management system.

## 2. Product principles

- Lessons are arranged in a deliberate linear order.
- Explanations build from first principles before introducing Windows-specific details.
- Practical observation is integrated into the lesson in which a concept is taught.
- pywin32 is the preferred interface for Windows programming exercises.
- `ctypes` is introduced when native signatures, structures, pointers, or APIs unavailable through pywin32 add educational value.
- Sysinternals tools are teaching instruments, not a disconnected appendix.
- Questions should test reasoning and prediction, not just recognition or memorisation.
- The original repository material remains the source curriculum, but it may be reorganised and clarified where that improves learning.
- Navigation and presentation remain simple and focused.

## 3. Features intentionally excluded

The initial design will not include:

- A dashboard.
- Accounts or authentication.
- Persistent progress tracking.
- Mastery percentages or lesson statuses.
- Achievements, experience points, or other gamification.
- An academy-style theme or framing.
- A backend unless a future feature clearly requires one.

Quizzes may show the result of the current attempt and allow incorrect questions to be retried, but results do not need to be stored.

## 4. Site structure

The homepage will act as a clean course introduction and table of contents. It will contain:

- A short explanation of the module.
- Prerequisites.
- Environment and safety guidance.
- The ordered list of lesson modules.
- Links to supporting reference pages.

Lessons will use simple sequential navigation:

`Previous lesson` | `Module contents` | `Next lesson`

Supporting pages will be limited to those that directly aid learning:

- **Setup:** Python, pywin32, Sysinternals Suite, and a suitable Windows lab environment.
- **Toolbox:** concise guidance for the Sysinternals tools used throughout the course.
- **Win32 API reference:** APIs introduced by the lessons, with Python usage notes.
- **Glossary:** important operating-system and Windows-internals terminology.
- **Revision:** consolidated questions, practical review activities, and a final assessment.
- **Sources:** the original repository materials and any authoritative external references used.

## 5. Recurring lesson format

Lessons will generally draw from the following structure without being forced to include every section:

1. **What you will learn**
2. **Conceptual explanation**
3. **Diagram, analogy, or execution trace**
4. **How Windows implements it**
5. **Relevant Win32 APIs**
6. **Python example**, normally using pywin32
7. **Lower-level view with `ctypes`**, where useful
8. **Sysinternals investigation**
9. **Knowledge checks and prediction questions**
10. **Practical exercise**
11. **Summary and key terms**

Questions may also appear inside explanations so the learner predicts an outcome before revealing it or running an experiment.

## 6. Curriculum

### Module 1: Operating-system foundations

Topics:

- CPU, registers, RAM, storage, buses, and devices.
- Why operating systems exist.
- Hardware abstraction and resource management.
- Multiprogramming, multitasking, and context switching.
- Windows history and Windows NT architecture.
- User mode, kernel mode, and privilege rings.
- System calls, the Native API, and the Win32 API.
- Calling Windows APIs from Python.

Practical integration:

- Explore the system using Process Explorer.
- Make introductory Win32 calls with pywin32.
- Reproduce a small call with `ctypes` and compare the two interfaces.

### Module 2: Processes, kernel objects, and handles

Topics:

- Programs and processes.
- Process IDs, process trees, and virtual address spaces.
- Process metadata and context switching.
- Process creation and the role of `CreateProcess`.
- Kernel objects and the Object Manager.
- Handles and per-process handle tables.
- Object names and namespaces.
- Access rights, handle inheritance, handle duplication, and reference counting.

Practical integration:

- Inspect parent-child relationships with Process Explorer.
- Inspect handles with Process Explorer and Handle.
- Browse named kernel objects with WinObj.
- Create and inspect processes with `win32process`.
- Compare a pywin32 process operation with its `ctypes` equivalent.
- Incorporate the repository's hidden-process and Good/Bad/Ugly exercises.

### Module 3: Threads and scheduling

Topics:

- Processes versus threads.
- Thread contexts, stacks, and states.
- Creating and terminating threads.
- Context switching.
- Benefits and costs of multithreading.
- Scheduling goals and round-robin scheduling.
- Windows priority classes and thread priorities.
- Priority boosts, starvation, and CPU-bound versus I/O-bound work.

Practical integration:

- Inspect threads, stacks, states, and priorities in Process Explorer.
- Run the prime-number, thread-overdose, and related repository experiments.
- Measure the effect of changing thread counts.
- Adjust process or thread priority through Win32.
- Explain why adding threads does not automatically improve performance.

### Module 4: Memory management

Topics:

- Binary and hexadecimal foundations.
- Memory hierarchy, locality, and CPU caches.
- Real mode and protected mode.
- Virtual and physical memory.
- Pages, frames, page tables, and address translation.
- Page faults, paging, and the page file.
- Shared pages and copy-on-write.
- Reserved and committed memory.
- Page protection and allocation granularity.
- Process heaps and user-mode allocation.

Practical integration:

- Investigate process memory with VMMap.
- Investigate system-wide memory with RAMMap.
- Use the repository's memory scripts, images, and exercises.
- Call `VirtualAlloc`, `VirtualProtect`, and `VirtualFree`.
- Compare Win32 virtual-memory allocation with Python-managed memory.
- Consider an interactive page-to-frame and page-fault visualisation.

### Module 5: Linking, loading, and Portable Executables

Topics:

- Compilation and linking.
- Object files and static libraries.
- Static and dynamic linking.
- DLL benefits and trade-offs.
- The Portable Executable format.
- DOS and PE signatures.
- File headers, optional headers, sections, and relative virtual addresses.
- Import and export directories.
- The Import Address Table.
- Windows loader operation.
- Implicit and explicit DLL loading.
- DLL entry points.

Practical integration:

- Inspect PE files using CFF Explorer.
- Inspect modules using Process Explorer and ListDLLs.
- Parse selected PE fields using Python.
- Use `LoadLibrary`, `GetProcAddress`, and related APIs.
- Incorporate the repository's import-table modification exercise.
- Consider an annotated, interactive PE layout diagram.

### Module 6: Windows management mechanisms

Topics:

- Registry structure, root keys, keys, values, and value types.
- Registry paths and views.
- Win32 Registry APIs.
- Windows services and the Service Control Manager.
- Service processes, states, startup modes, and `svchost.exe`.
- WoW64.
- File-system and Registry redirection.

Practical integration:

- Observe Registry activity using Process Monitor.
- Inspect startup entries using Autoruns.
- Read and write safe test keys using `winreg` and pywin32.
- Enumerate, query, and safely control services using Python.
- Incorporate the repository's service-controller exercise.
- Compare 32-bit and 64-bit Registry views.

### Module 7: Windows security

Topics:

- The Windows security model.
- Subjects, actions, and objects.
- Security identifiers, users, and groups.
- Access tokens.
- Security descriptors, DACLs, ACEs, and access masks.
- ACE ordering and access checks.
- Privileges and impersonation.
- The Security Reference Monitor and LSASS.
- User Account Control and filtered tokens.
- Integrity levels and mandatory access control.

Practical integration:

- Inspect tokens, privileges, and integrity levels with Process Explorer.
- Examine permissions using AccessChk.
- Inspect security descriptors using `win32security`.
- Enumerate token groups and privileges.
- Enable an appropriate privilege through pywin32 in a controlled exercise.
- Predict access-check results before confirming them.
- Consider an interactive access-check simulator.

### Module 8: Synchronisation

Topics:

- Concurrent access and cooperation between threads.
- Atomic and non-atomic operations.
- Race conditions.
- Critical sections and mutexes.
- Semaphores.
- Manual-reset and auto-reset events.
- Other waitable objects.
- Deadlocks and starvation.
- Windows interlocked operations.

Practical integration:

- Reproduce and diagnose a race condition.
- Repair it using different synchronisation primitives.
- Use Python's `threading` primitives.
- Create native Windows events and mutexes with `win32event`.
- Observe handles and waiting threads in Process Explorer.
- Incorporate the repository's party and invitation exercises.

### Module 9: Inter-process communication

Topics:

- Process isolation and the need for explicit communication.
- IPC design considerations.
- Anonymous and named pipes.
- Pipe servers and clients.
- File mappings and shared memory.
- Synchronisation between communicating processes.
- Clipboard, files, and sockets as IPC mechanisms.

Practical integration:

- Incorporate the repository's pipe exercises.
- Build a named-pipe server and client using pywin32.
- Reimplement a selected part with `ctypes` where instructive.
- Build a small shared-memory example.
- Inspect relevant handles with Sysinternals tools.
- Compare IPC mechanisms using realistic scenarios.

### Module 10: Hooking and injection

Topics:

- Code injection versus hooking.
- Legitimate, diagnostic, defensive, and malicious uses.
- DLL loading during process startup.
- Import modification and proxy DLL concepts.
- Remote-process memory allocation and writing.
- `VirtualAllocEx`, `WriteProcessMemory`, and remote-thread concepts.
- Position-independent code.
- Windows message hooks.
- Import Address Table hooking.
- User-mode and kernel-mode limitations.
- Detection and defensive investigation.

Practical integration:

- Observe loaded modules with Process Explorer and ListDLLs.
- Examine imports and unexpected modules.
- Investigate relevant memory permissions and process activity.
- Trace safe, purpose-built demonstrations with Process Monitor.
- Recognise common indicators of injection.
- Keep all active demonstrations constrained to an isolated lab environment and programs created for the exercise.

## 7. Sysinternals integration

The following tools will appear directly in the lessons where they are relevant:

| Tool | Main course uses |
| --- | --- |
| Process Explorer | Processes, threads, handles, DLLs, tokens, integrity levels, and priorities |
| Process Monitor | File, Registry, process, thread, and image-loading activity |
| VMMap | Process virtual-address-space layout and allocation types |
| RAMMap | System-wide physical-memory usage |
| WinObj | Object Manager namespace and named kernel objects |
| Handle | Command-line handle inspection |
| ListDLLs | Loaded-module inspection |
| Autoruns | Logon entries, services, and other persistence locations |
| AccessChk | Permissions, access rights, and security investigations |
| PsTools | Process and service administration exercises |
| Sigcheck | Executable metadata, signatures, and trust investigations |

## 8. Python and Win32 integration

Python examples will generally progress through three levels:

1. **Standard Python** for the basic concept, where possible.
2. **pywin32** as the preferred way to perform Windows-specific operations.
3. **`ctypes`** when seeing the native function signature, structures, pointers, or memory layout improves understanding.

Likely pywin32 areas include:

- `win32api`
- `win32process`
- `win32event`
- `win32file`
- `win32pipe`
- `win32security`
- `win32service` and `win32serviceutil`
- Related modules selected while authoring individual lessons

Examples should explain the associated Win32 API instead of presenting the wrapper as unexplained Python magic.

## 9. Questions and interactive content

The site can remain simple while using varied learning activities:

- Expandable questions and answers.
- Multiple-choice questions with explanations for every option.
- Short-answer prompts.
- Execution-order puzzles.
- "Predict before running" experiments.
- Code-completion exercises.
- Bug and race-condition diagnosis.
- Diagram labelling.
- Tool screenshots with explanatory callouts.
- Scenario-based API and synchronisation choices.
- End-of-module quizzes.
- Practical challenges with optional hints and worked solutions.

End-of-module quizzes should allow the learner to retry incorrect questions during the current session without requiring persistent progress tracking.

## 10. Practical exercise format

Repository exercises should be converted into guided labs with:

- The objective.
- Required background.
- Required tools and files.
- Safety or environment notes.
- A prediction made before execution.
- Step-by-step investigation instructions.
- Evidence to observe or record.
- Questions about the result.
- An explanation of what happened and why.
- An optional extension challenge.

Unknown executables, process manipulation, hooking, and injection material must be handled conservatively and, where applicable, limited to an isolated Windows virtual machine.

## 11. Technical direction

The intended deployment target is GitHub Pages. The site should therefore begin as a static website with no backend dependency.

The eventual implementation should favour:

- Fast page loads.
- Responsive layouts.
- Readable typography and code blocks.
- Accessible keyboard navigation and colour contrast.
- Reusable lesson, question, callout, code, and lab components.
- Content that remains easy to edit as the course evolves.

The exact framework and visual design will be selected later. No implementation choice should complicate a project whose main job is presenting lessons clearly.

## 12. Proposed next planning steps

Before implementation begins:

1. Produce a detailed inventory of every source file and map it to a module and lesson.
2. Break each module into individual lesson pages.
3. Identify concepts that are missing, dated, ambiguous, or require authoritative verification.
4. Decide which existing exercises can be reused directly and which need safer or clearer replacements.
5. Design one representative lesson on paper to validate the content structure.
6. Choose the static-site technology and visual direction only after the lesson structure is settled.
