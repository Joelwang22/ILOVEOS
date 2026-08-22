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
- The lecture notes and quizzes define the minimum examinable vocabulary, not the limit of what the lessons must teach.
- The supplied practices and scripts are binding curriculum requirements. Every concept needed to understand, complete, debug, and extend them must be taught or deliberately researched through a demonstrated method.
- Independent research is an explicit course skill. It must be modelled and scaffolded before a practice expects the learner to perform it alone.
- A practice may require reasoning and research, but it must not rely on prerequisite knowledge that the site never introduced.
- The original repository material remains the source curriculum, but it may be expanded, corrected, reorganised, and clarified where that improves learning.
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

The homepage will act as a direct table of contents. It will prioritise the ordered list of lesson modules and links to the supporting reference pages.

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

Guided practices will progress through four learning stages:

1. **Learn the mechanism:** understand the operating-system concept and why it exists.
2. **Learn the interface:** read the native API, translate its types, identify outputs and failure rules, and choose pywin32 or `ctypes`.
3. **Follow a guided investigation:** implement a downloadable scaffold, observe it with the relevant tools, and explain the evidence.
4. **Complete an independent variation:** apply the demonstrated research method to a changed requirement without copying the original solution.

## 6. Curriculum

### Module 1: Operating-system foundations

The repository topics labelled CPU architecture and Operating Systems API will be taught here as prerequisite lesson clusters. They do not require separate top-level modules because their concepts are reinforced throughout memory, scheduling, management, IPC, security, and linking.

Planned lesson order:

1. CPU architecture and data representation.
2. Why an operating system exists.
3. How Windows is organised.
4. User mode, kernel mode, and protected operations.
5. System calls, the Native API, and the Win32 API.
6. How to read and call a Windows API.
7. Inspecting the operating system.

Topics:

- Decimal, binary, and hexadecimal notation.
- Bits, bytes, powers of two, and address-space calculations.
- CPU, registers, RAM, storage, buses, and devices.
- CPU packages, physical cores, logical processors, and the limits of the one-instruction-per-core model.
- 32-bit and 64-bit architectures, pointer widths, virtual address spaces, and the distinction between addressable and usable memory.
- Why operating systems exist.
- Hardware abstraction and resource management.
- Multiprogramming, multitasking, and context switching.
- Windows history and Windows NT architecture.
- User mode, kernel mode, and privilege rings.
- System calls, the Native API, and the Win32 API.
- The anatomy of Windows API documentation: purpose, native signature, parameters, return value, failure rules, requirements, header, and DLL.
- Windows scalar, string, pointer, handle, and structure types, including `BOOL`, `DWORD`, `CHAR`, `LPCTSTR`, and pointer-sized types.
- Parameter direction and optionality, including `[in]`, `[out]`, and `[in, out]` annotations.
- Return sentinels, `GetLastError`, formatted error messages, and pywin32 exceptions.
- ANSI and Unicode API variants and the meaning of `A` and `W` suffixes.
- Calling Windows APIs from Python.
- Choosing between pywin32 and `ctypes`.

Practical integration:

- Explore the system using Process Explorer.
- Make introductory Win32 calls with pywin32.
- Reproduce a small call with `ctypes` and compare the two interfaces.
- Read an unfamiliar Microsoft API entry and identify its DLL, parameter roles, output, failure sentinel, and cleanup obligation.
- Translate a small native signature into `ctypes.argtypes` and `ctypes.restype`.
- Include concise "quiz model versus complete model" explanations where the supplied question intentionally simplifies CPU throughput, address spaces, or API failure behaviour.

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

## 11. Curriculum completeness and research bridge

### Source hierarchy

The course will be built from four complementary sources:

1. **Lectures and quizzes** establish the minimum terminology and expected assessment answers.
2. **Repository practices and scripts** reveal the operational skills, API knowledge, failure cases, and research ability the learner is actually expected to possess.
3. **Authoritative documentation** supplies details that the provided material omits, especially native signatures, structures, access rights, state machines, and platform limitations.
4. **Controlled experiments** connect all three sources to observable Windows behaviour.

The site must distinguish an expected simplified quiz answer from the more accurate working model. It should prepare the learner for assessment without presenting simplifications as universal facts.

### Definition of a complete lesson path

A practice is considered covered only when the preceding lessons provide or demonstrate all of the following:

- The operating-system mechanism and the problem it solves.
- The Windows objects, state, and security boundaries involved.
- Every required API, module, constant, structure, and access right.
- Parameter meanings, native and Python types, output values, and documented failure behaviour.
- Resource ownership, lifetime, cleanup, and the consequences of incorrect cleanup.
- Architecture, Unicode, calling-convention, and pointer-width considerations where relevant.
- Expected failures and a method for diagnosing them.
- A Sysinternals or equivalent observation workflow when Windows can expose useful evidence.
- A downloadable starting scaffold and enough guidance to begin safely.
- An independent extension that proves the learner can transfer the method to a new requirement.

Every callable used by a guided practice should be searchable in the pywin32 guide or the relevant supporting reference. The entry should be sufficient to identify its parameters, output, failure rule, and ownership obligations without requiring an undocumented guess.

### Research method taught by the course

The lessons will repeatedly demonstrate this workflow until the learner can perform it independently:

1. State the required outcome in plain language.
2. Find the authoritative Windows API or pywin32 documentation.
3. Identify the API family, native signature, header, implementing DLL, and minimum supported environment.
4. Decode Windows typedefs, pointers, structures, parameter direction, optional values, and buffer-size units.
5. Check whether a suitable pywin32 wrapper exists and prefer it when it communicates the task clearly.
6. When `ctypes` is required, declare the calling interface, argument types, return type, structures, and callback types exactly.
7. Identify the documented success value, failure sentinel, extended-error rule, and expected asynchronous or partial-result states.
8. Determine ownership of every returned handle, buffer, pointer, and allocated object before writing the call.
9. Run one controlled experiment and verify the result with output, system state, and the relevant inspection tool.
10. Record what failed, why it failed, and which evidence supports the conclusion.

Guided exercises should not require external documentation merely to fill an unexplained gap. External research becomes part of the independent variation only after the lesson has demonstrated how to perform that research.

## 12. Repository practice coverage matrix

This matrix is a durable authoring checklist. It should be updated whenever a practice is added, removed, or materially changed.

| Repository practice | Module | Required teaching bridge |
| --- | --- | --- |
| `Hidden_Process/hidden_process.py` | Processes and handles | `CreateProcessW`, full `STARTUPINFOW` and `PROCESS_INFORMATION` layouts, input and output structures, writable command lines, structure size fields, flags, pointer-sized handles, error reporting, and cleanup |
| GoodLog and BadLog Process Monitor investigation, recorded in `the_good_the_bad_the_ugly.txt` and `thegoodbadugly_2.txt` | Processes and handles | Controlled capture, filters, file-operation sequences, path and result interpretation, evidence recording, and the cost of repeated open/write/close cycles |
| `prime_threads.py`, `better_together`, and `thread_overdose` | Threads and scheduling | Work partitioning, thread lifecycle, joining, CPU-bound versus I/O-bound work, the Python GIL, scheduler observation, contention, and why more threads can reduce performance |
| `alligator.py` | Memory management | Reservation versus commitment, page size, allocation base, protection, partial commitment, cleanup, and comparison with VMMap |
| `vmem_to_csv.py` | Memory management | Address-space traversal, `VirtualQueryEx`, `MEMORY_BASIC_INFORMATION`, structure ABI, state/type/protection bitmasks, hexadecimal ranges, termination conditions, access rights, CSV evidence, and handle cleanup |
| `open_the_box.py` | Linking and loading | DLL loading, exports, `LoadLibrary`, `GetProcAddress`, raw function addresses, calling conventions, pointer-sized returns, ANSI byte strings, Unicode alternatives, and safe function-pointer construction |
| `real_service_controller.py` | Windows management | SCM and service access masks, `Advapi32.dll`, native signatures, `argtypes`, `restype`, `SERVICE_STATUS`, input/output parameters, `GetLastError`, service state transitions, and `CloseServiceHandle` |
| `get_my_leverage.py` | Windows security | Process and token access, privileges present versus enabled, privilege adjustment, impersonation levels, primary-token duplication, `CreateProcessAsUser`, expected access failures, and complete handle ownership |
| `inviter.py` and `invitee.py` | Synchronisation | Named events, `Local` and `Global` scope, access rights, manual versus auto reset, signaled state, wait results, object lifetime, and cross-process observation |
| `party.py` | Synchronisation | Threads sharing native handles, events, mutex ownership, protected read-modify-write operations, `WAIT_OBJECT_0`, `WAIT_ABANDONED`, safe release, joining, and cleanup ordering |
| `pipe_one.py` and `pipe_two.py` | Inter-process communication | Anonymous pipes, inheritable security attributes, handle inheritance masks, standard-handle redirection, `STARTF_USESTDHANDLES`, parent/child handle closure, pipe EOF, blocking, buffer deadlocks, decoding, waits, and cleanup |
| `whats_my_name.py` | Inter-process communication | Named-pipe discovery, canonical pipe paths, availability waits, `CreateFile`, byte versus message mode, partial reads and writes, response encoding, error handling, ownership, and Sysinternals correlation |

The practice lesson for each row must also explain any fragile, incomplete, architecture-dependent, or intentionally simplified choices in the supplied solution. Repository code is evidence of the required learning outcome, not automatically the final reference implementation.

## 13. Technical direction

The site is implemented as a dependency-free static website and deployed through GitHub Pages. It does not require a backend.

The eventual implementation should favour:

- Fast page loads.
- Responsive layouts.
- Readable typography and code blocks.
- Accessible keyboard navigation and colour contrast.
- Reusable lesson, question, callout, code, and lab components.
- Content that remains easy to edit as the course evolves.

The existing HTML, CSS, and JavaScript architecture should remain straightforward. No implementation choice should complicate a project whose main job is presenting lessons clearly.

## 14. Authoring and verification sequence

As implementation continues:

1. Keep the repository practice coverage matrix current as scripts and lessons evolve.
2. Author the CPU architecture and data-representation lesson before later lessons depend on addresses, bitmasks, or processor terminology.
3. Author the Windows API documentation and calling lesson before a guided practice expects independent API research.
4. For each remaining module, build the conceptual lessons and API bridges before publishing its full guided practices.
5. Audit each supplied script for correctness, architecture assumptions, safety, error handling, and resource leaks before presenting it as a worked solution.
6. Ensure every practice API and concept is searchable in the pywin32, `ctypes`, or Sysinternals reference material.
7. Validate each guided investigation on a clean Windows lab environment and record expected output and observable evidence.
8. End each module with an independent variation and a review that includes both supplied quiz objectives and deeper practice-level reasoning.
