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
- Lessons must teach the reasoning behind a concept, not merely state the correct definition or direct the learner to a reference page.
- Paragraphs should contain enough explanation, cause and effect, and concrete examples to build understanding without repeating the same point or adding unrelated history.
- Hard-to-visualise mechanisms should use a step-by-step execution trace, diagram, state transition, address map, ownership map, or worked example when that materially improves understanding.
- Every meaningful transition in a worked example must make the action, causal reason, changed state, and verification clear, using the format that best fits the topic.
- The pywin32 guide, Sysinternals toolbox, and external documentation support the lessons. They must not carry teaching that the lesson itself should provide.
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
- **Windows API guide:** plain-English native contracts, recommended pywin32 paths, complete `ctypes` translations where required, parameter mappings, result rules, ownership, cleanup, and primary Microsoft sources.
- **Glossary:** important operating-system and Windows-internals terminology.
- **Revision:** consolidated questions, practical review activities, and a final assessment.
- **Sources:** the original repository materials and any authoritative external references used.

## 5. Recurring lesson format

Lessons should read like focused interactive textbook chapters rather than expanded outlines. To avoid a wall of subheadings, most lessons will use four visible phases while placing supporting material in diagrams, code cards, callouts, tables, and expandable details. The four-part navigation remains predictable, but phase names and short descriptions should fit the lesson instead of repeating identical labels everywhere.

### Learn

- Establish the problem the mechanism exists to solve.
- Introduce unfamiliar terms close to where they are first used.
- Build the mental model through clear prose with enough causal explanation to answer both what happens and why.
- Use a concrete example before moving to edge cases or formal details.
- Address common misconceptions when they would otherwise damage later understanding.

### Use it on Windows

- Explain the Windows objects, components, state, and security boundaries involved.
- Introduce the relevant Win32 API as part of the mechanism rather than as a detached list of names.
- Explain important parameters, types, results, expected non-success states, ownership, and cleanup.
- Prefer pywin32 for the main Python path and add `ctypes` when the native ABI, structure layout, pointer width, callback, or uncovered API is educationally important.
- Connect the explanation to evidence available through Sysinternals or another appropriate Windows tool.

### Investigate

- Keep the practical workspace inside the lesson instead of downloading a separate worksheet.
- Provide step-by-step instructions with an explanation beside each step.
- Provide an expandable "What should happen?" explanation so the learner can compare the real result with the expected mechanism.
- State the specific values, identifiers, results, errors, or tool evidence to look for without turning the lesson into a form.
- Provide expandable hints that preserve the opportunity to reason independently.
- Provide an actual downloadable starter file only when the learner needs a `.py` file or another concrete lab artifact.
- End with cleanup and restoration instructions.

The action is always visible. A separate reason or observation prompt should appear only when it adds information the learner cannot infer from the action itself. Simple steps should remain visually simple instead of receiving generic filler labels.

### Review

- Use more than one check when the lesson contains several important decisions or state transitions.
- Include at least one question that requires explanation, prediction, debugging, or scenario-based choice rather than recognition alone.
- Summarise the mental model and the few facts worth retaining.
- Include an independent variation when the lesson completes a practice pathway.

Questions may also appear inside explanations so the learner predicts an outcome before revealing it or running an experiment. These inline checks should be visually restrained, placed directly after the concept they test, and used selectively in longer lessons rather than becoming additional named phases.

At compact widths, each lesson will provide an expandable "Lesson sections" control because the desktop "On this page" column is hidden. The control should use the lesson's context-specific phase names and collapse after a destination is selected.

### Content depth without bloat

Depth is measured by whether the learner can explain, apply, debug, and extend the concept, not by word count alone. A lesson is not complete merely because it contains several paragraphs.

- Each paragraph should advance the model, explain a causal link, work through an example, or resolve a likely misunderstanding.
- Repeated definitions, decorative history, generic motivational copy, and API lists without context should be removed.
- Narrow supporting lessons can remain shorter, while central mechanism and practice lessons should be substantially developed.
- A major technical lesson will normally require multiple worked examples, state traces, or code stages. A smaller prerequisite lesson may need only one.
- Deeper reference material and unusual edge cases can use expandable disclosures so the main reading path remains clear.

### Worked example standard

A worked example should make the learner's changing mental state visible, but it must not force every kind of reasoning into the same repeated card layout. The author must first identify what relationship the learner needs to follow, then select the smallest presentation that makes that relationship clear.

Use the following formats selectively:

- **Calculation:** show the given value, continuous working, substitutions, intermediate values, and final answer. The result of one line should visibly become the input to the next.
- **Execution trace:** use a timeline when a request, thread, object, or value moves through components over time. Show the state after each meaningful transition.
- **State transition:** emphasise before state, triggering action, after state, and the condition that permitted the transition.
- **Comparison:** place alternatives side by side when the learning goal is to distinguish two bindings, security contexts, architectures, or strategies. Keep shared properties visually aligned.
- **Decision path:** use a compact decision tree or ordered decision when the learner must select an API, access right, synchronization primitive, or recovery action.
- **API contract:** organise inputs, parameter choices, returned result, failure rule, ownership, and cleanup around the lifecycle of one call.
- **Result branch:** show named result values and their distinct branches when a status code, wait result, partial result, or sentinel controls the next action.
- **Code construction:** grow code in understandable stages, explain only the new or changed lines, and place expected output beside the stage that produces it.

Not every example needs numbered steps. Numbering should be reserved for a real sequence. A comparison may need aligned columns, a calculation may need uninterrupted working, and a decision may need branches instead.

Regardless of format, the example must:

1. State the problem and starting conditions clearly.
2. Keep one dominant visual reading path.
3. Show the important value, state, choice, or output rather than only describing it.
4. Explain the causal link needed to understand the next part.
5. Include alternative or failure behavior only when it changes the model or the required action.
6. Finish with a clear answer, resulting state, or decision and one concise takeaway.

Avoid repeating labels such as "Do", "Why", and "Result" on every row when hierarchy and placement already communicate their roles. Do not place cards inside cards merely to make sections look interactive. Secondary detail can use a restrained disclosure, while the essential reasoning remains visible.

### Diagram standard

Diagrams are teaching tools, not decoration. Use them when prose alone makes ownership, hierarchy, address translation, execution order, or cross-component relationships difficult to hold in working memory.

- Prefer state diagrams for transitions, timelines for execution order, maps for memory and namespaces, and flow diagrams for API or I/O paths.
- Label every object and arrow with its meaning.
- Accompany the visual with a short guided reading that explains how to follow it.
- Keep diagrams responsive and accessible, including a text equivalent or useful accessible description.
- Do not add a diagram when a short example or compact table communicates the idea more clearly.

Guided practices will progress through four learning stages:

1. **Learn the mechanism:** understand the operating-system concept and why it exists.
2. **Learn the interface:** read the native API, translate its types, identify outputs and failure rules, and choose pywin32 or `ctypes`.
3. **Follow a guided investigation:** work through the integrated lesson workspace, use a downloadable code scaffold only when needed, observe the result with the relevant tools, and explain the evidence.
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
6. How to read a Windows API contract.
7. Calling Windows APIs safely from Python.
8. Inspecting the operating system.

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

The Windows API guide provides the bridge between Microsoft declarations and assignment-ready Python. Each covered native API shows the original contract, DLL, a complete `argtypes` and `restype` declaration, parameter-by-parameter type reasoning, result and extended-error behavior, ownership and cleanup, and the preferred pywin32 wrapper when one communicates the task clearly. The guide is scoped to APIs used by this course and its repository practices rather than attempting to reproduce the whole Windows SDK.

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
- An expandable explanation of what should happen and which details may vary by machine.
- Step-by-step investigation instructions, with the purpose and expected state change explained at each step.
- Evidence to observe or record.
- Questions about the result.
- An explanation of what happened and why.
- Expected failure branches and guidance for interpreting their error values.
- A cleanup or restoration checklist.
- An optional extension challenge.

The practical workspace should be embedded in the lesson, but it should read as an instructional guide rather than a form. It should contain a compact expected-outcome dropdown, clear steps, reasons, evidence to look for, optional hints, and cleanup instructions. It should not require the learner to fill repeated text boxes or store lesson responses in the browser. There will be no dashboard, completion score, or stored mastery state.

Separate worksheet downloads should not be used. Download buttons are reserved for actual starter code, sample data, or another artifact required to run the practice.

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
- A developed explanation with enough causal detail and concrete examples to teach the mechanism rather than summarise it.
- A labelled diagram, execution trace, state transition, or worked example when the mechanism is difficult to visualise.
- The Windows objects, state, and security boundaries involved.
- Every required API, module, constant, structure, and access right.
- Parameter meanings, native and Python types, output values, and documented failure behaviour.
- Resource ownership, lifetime, cleanup, and the consequences of incorrect cleanup.
- Architecture, Unicode, calling-convention, and pointer-width considerations where relevant.
- Expected failures and a method for diagnosing them.
- Clear explanations for the important transformations, API calls, decisions, comparisons, and state changes in worked examples.
- A Sysinternals or equivalent observation workflow when Windows can expose useful evidence.
- An integrated practice scaffold and enough guidance to begin safely, plus a downloadable code artifact when execution requires one.
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
- Reusable lesson, question, callout, code, worked-example format, diagram, and integrated practice components.
- Compact expected-outcome disclosures and static observation guidance for practices.
- Content that remains easy to edit as the course evolves.

The existing HTML, CSS, and JavaScript architecture should remain straightforward. No implementation choice should complicate a project whose main job is presenting lessons clearly.

## 14. Authoring and verification sequence

As implementation continues:

1. Keep the repository practice coverage matrix current as scripts and lessons evolve.
2. Reauthor the CPU architecture and data-representation lesson before later lessons depend on addresses, bitmasks, or processor terminology.
3. Reauthor the Windows API documentation and calling lesson before a guided practice expects independent API research.
4. For each module, deepen the conceptual lessons and API bridges before publishing its revised guided practices.
5. Add diagrams and worked examples only after identifying the relationship or state change they need to clarify.
6. Replace external lesson worksheets with integrated practice workspaces and keep code downloads only where an executable starter is genuinely useful.
7. Audit each supplied script for correctness, architecture assumptions, safety, error handling, and resource leaks before presenting it as a worked solution.
8. Ensure every practice API and concept is searchable in the pywin32, `ctypes`, or Sysinternals reference material.
9. Validate each guided investigation on a clean Windows lab environment and record expected output and observable evidence.
10. Review each lesson for both missing explanation and unnecessary repetition before considering it complete.
11. End each module with an independent variation and a review that includes both supplied quiz objectives and deeper practice-level reasoning.

## 15. Staged lesson-depth overhaul

The existing 62 lesson pages form a complete curriculum map, but many are still concise first-pass lessons. They will now be expanded incrementally so that content quality can be reviewed and corrected before the same pattern is repeated across the whole course.

### Stage 1: Lesson system and operating-system foundations

Status: completed on 22 August 2026.

- Build the reusable integrated practice workspace, context-specific worked-example formats, diagram patterns, expected-outcome disclosures, observation guidance, and expandable hints.
- Remove the separate worksheet download behavior.
- Deepen all eight OS foundations lessons, including separate documentation-reading and safe-Python-calling lessons.
- Give particular attention to CPU architecture, binary and hexadecimal reasoning, Windows architecture, system-call flow, and reading WinAPI documentation.
- Use this module to establish the final writing density and visual language for the remaining course.

### Stage 2: Processes, handles, threads, and scheduling

Status: completed on 22 August 2026.

- Deepen Modules 2 and 3.
- Add process-creation timelines, object and handle ownership diagrams, context-switch traces, and scheduling examples.
- Turn `hidden_process.py`, Good/Bad/Ugly, `prime_threads.py`, better-together, and thread-overdose into fully integrated guided pathways.
- Explain each code stage, API result, tool observation, and performance conclusion.

### Stage 3: Memory, linking, and loading

Status: completed on 22 August 2026.

- Deepen Modules 4 and 5.
- Add virtual-address translation diagrams, page-state transitions, memory-region maps, PE file-to-memory layouts, RVA calculations, import-resolution traces, and loader timelines.
- Fully bridge `alligator.py`, `vmem_to_csv.py`, `open_the_box.py`, and the import-table loading exercise.
- Check architecture and pointer-width explanations especially carefully.

### Stage 4: Management and security

Status: completed on 22 August 2026.

- Deepen Modules 6 and 7.
- Add Registry view maps, service state transitions, SCM handle ownership, token diagrams, DACL evaluation traces, privilege-state examples, and integrity-level comparisons.
- Fully bridge `real_service_controller.py` and `get_my_leverage.py` with worked error and cleanup paths.
- Keep configuration-changing practices reversible and security-sensitive practices constrained to owned lab targets.

### Stage 5: Synchronisation and IPC

Status: completed on 22 August 2026.

- Deepen Modules 8 and 9.
- Add race-condition interleavings, wait-result decision trees, object state diagrams, pipe endpoint ownership maps, blocking timelines, and message-framing examples.
- Fully integrate `inviter.py`, `invitee.py`, `party.py`, `pipe_one.py`, `pipe_two.py`, and `whats_my_name.py`.
- Make successful, timeout, abandoned, broken-pipe, partial-read, and cleanup branches explicit.

### Stage 6: Hooking, injection, and full-course audit

Status: completed on 23 August 2026.

- Deepen Module 10 with visual, controlled, and defensively framed explanations.
- Use loader, memory, IAT, hook-chain, and detection-timeline diagrams instead of relying on operational payload code.
- Audit the complete course for missing prerequisites, duplicated explanations, inaccurate simplifications, unsafe practices, broken reference links, and inconsistent terminology.
- Confirm every repository practice can be understood, completed, investigated, debugged, and extended using knowledge taught by the preceding lessons.

Final audit record:

- 62 of 62 lessons use the full teaching structure, with contextual explanations, a diagram, a worked example, Windows evidence, an integrated practice, and knowledge checks.
- 43 referenced practice downloads exist and are reachable from their lessons.
- 347 searchable pywin32, native API, and tool concepts are available, including 303 entries with detailed parameter, type, return, and failure contracts.
- 63 distinct primary lesson or tool sources are included in the automated link review.
- Module 10 demonstrations stay within the current process, static PE files, or owned baselines. They teach evidence and lifecycle reasoning without providing an operational cross-process payload.

## 16. Post-overhaul roadmap

The six-stage lesson-depth overhaul is complete. The remaining work extends the finished curriculum with course-level revision, focused supporting pages, systematic lab validation, and final product quality assurance. It does not reopen the completed module structure or introduce dashboards, accounts, stored progress, or gamification.

The searchable Windows API guide was completed on 23 August 2026 ahead of the remaining roadmap because current assignments required a direct bridge from Microsoft native declarations to safe Python calls. Its initial catalogue covers all native API contracts already represented by the course plus the missing DLL-injection assignment chain. Future lesson or practice APIs must be added to this guide and its automated coverage audit in the same change.

The remaining work should proceed in the following order.

### Stage 7: Module revision and final assessment

Status: completed on 24 August 2026.

- Add a compact review at the end of each module without turning reviews into visually heavy standalone lesson sections.
- Combine conceptual reasoning, API selection, result and failure interpretation, resource ownership, debugging, and Sysinternals evidence questions.
- Add varied activities where they improve the assessment, including execution-order puzzles, code-completion tasks, scenario diagnosis, and prediction questions.
- Let the learner retry incorrect answers during the current session without storing scores or progress.
- Build one consolidated final assessment that samples all ten modules instead of repeating every lesson check.
- Include a final practical scenario that requires the learner to select APIs and tools, predict evidence, interpret expected failures, and explain cleanup.
- Keep assessment explanations available after an attempt so revision also teaches the reasoning behind the answer.

Final audit record:

- All ten modules have one review containing exactly five activities. Every review covers mechanism, interface choice, failure interpretation, ownership, and observable evidence while using at least two of the single-choice, multiple-selection, and ordering formats.
- The consolidated final assessment contains twenty automatically checked questions, exactly two from each module, and samples all six Stage 7 reasoning dimensions. Its ungraded practical adds contract selection, compatibility, outcome prediction, evidence, ownership, and cleanup prompts with a revealable model-reasoning path.
- Incorrect answers remain retryable, correct answers lock, and reset restores the initial state. Answers and practical notes remain in the current rendered page's JavaScript state and are not written to browser storage, a URL, or a network endpoint.
- Module outlines, final-lesson links, review continuation links, the course-level entry point, global search, and unavailable-route handling were exercised through the integration suite.
- Desktop, compact, Edge-minimum, and true 390-pixel device-emulation checks found no page overflow or clipped assessment content. Small, default, and large content-size settings apply across assessment headings, options, ordering controls, notes, and continuation controls.
- The final release gate covered JavaScript syntax, assessment data and state transitions, browser interaction and focus behavior, responsive layout, routing, search, supporting-reference dialogs, the complete course audit, and whitespace validation. The audit reports 10 reviews, 50 module activities, 20 final questions, 62 deep lessons, 43 downloads, 347 reference features, 0 errors, and 0 warnings.
- Each Stage 7 implementation task was published to `main`, followed by a successful GitHub Pages deployment check before work continued to the next task.

Guided-investigation clarity audit, 24 August 2026:

- All 62 guided investigations pass the closed-loop clarity gate with zero errors and zero warnings, zero extension assignments, zero off-page deliverables, and no dynamic checkpoint answers.
- The measured course contains 147 copyable practice command blocks, exactly 2 justified case studies, 11 sparse checkpoints, 2 choice checkpoints, and 55 checked download references; the strict audit reports 0 errors and 0 warnings.
- Every practice stays within two checkpoints and one choice checkpoint. Checkpoints are used only for invariant supplied-artifact evidence or a fixed distinction the webpage can grade.
- Every Modules 1-5 investigation received a step-by-step content and artifact-contract review. Process Explorer module-base evidence uses `View > Show Lower Pane`, `View > Lower Pane View > DLLs`, lower-pane `Select Columns > DLL > Base Address`, and an exact module path row; thread-start evidence uses the selected TID in `Properties > Threads`.
- True Chromium device emulation at desktop, compact, Edge-minimum, and 390-pixel widths, with small, default, and large content sizes, found no document or practice overflow. Commands, 40-pixel copy targets, checkpoint controls, feedback, case-study facts, and section references remain visible and contained.

Windows API family and contextual-parameter audit, 24 August 2026:

- Status: completed on the `feature/windows-api-families` worktree and ready for controller review.
- The guide contains 67 represented-operation families and 96 complete callable variants while preserving all 69 baseline contracts exactly once. All 69 baseline contracts have an explicit official-source family decision.
- The contextual parameter catalogue contains 97 reusable choice sets with 357 documented values and 241 exact-key bindings: 73 native bindings and 168 Python/reference bindings. Another 46 correctness-bearing candidates have explicit `plain` decisions, for 287 exact parameter reviews overall. Large masks stay course-focused and link to Microsoft's full authoritative lists.
- `docs/windows-api-source-audit.md` records the official Microsoft Learn review for every baseline contract, including included siblings and similar operations deliberately kept separate.
- The completion gate covers `test-windows-api-families.mjs`, `test-windows-api-guide.mjs`, `test-windows-api-view.mjs`, `test-api-parameter-choices.mjs`, `test-windows-api-family-layout.mjs`, `test-api-dialog-scroll.mjs`, the complete sorted `test-*.mjs` suite, the course audit, JavaScript syntax, Python download parsing, and whitespace validation.
- Final feature commit: `feat: complete Windows API family guide` (the controller records the immutable SHA after review). GitHub Pages run: intentionally not started from this isolated task worktree. Public verification outcome: pending the controller-owned publish and exact-workflow check required after task and final reviews.

### Stage 8: Supporting study pages

- Add a concise Setup page covering Python, pywin32, the Sysinternals Suite, permissions, architecture checks, and preparation of a safe Windows lab environment.
- Add a searchable Glossary for operating-system, Windows-internals, Win32, pywin32, `ctypes`, PE, and Sysinternals terminology used by the lessons.
- Add a Revision page that provides the module reviews, final assessment, and practical review activities in one predictable location.
- Add a consolidated Sources page grouped by module, API family, and tool while retaining primary sources beside the lessons that use them.
- Integrate these pages into the existing navigation and search without creating a dashboard or duplicating lesson explanations.
- Keep the pywin32 guide and Sysinternals toolbox as the main task-oriented references rather than moving their content into the new pages.

### Stage 9: Clean-machine validation and release quality

- Run every relevant guided practice and downloadable artifact in a clean Windows lab environment with the intended Python architecture and permissions.
- For each practice, record the stable expected outcome, machine-dependent values, expected non-success branches, observable Sysinternals evidence, and verified cleanup state.
- Check the repository practice coverage matrix against the final lesson sequence and record any corrected script assumptions, leaks, fragile behavior, or version-specific differences.
- Verify keyboard navigation, focus behavior, screen-reader labels, colour contrast, font-size controls, diagram scaling, disclosures, dialogs, and downloadable controls.
- Review desktop, compact, and very narrow mobile layouts, plus the supported browsers, for clipping, overflow, excessive visual density, and inconsistent reading order.
- Review search coverage for lesson concepts, outcome-oriented Win32 queries, APIs, constants, structures, pywin32 modules, and Sysinternals capabilities.
- Run the structural course audit, Python parsing checks, JavaScript syntax checks, source-link audit, and live GitHub Pages asset checks as one repeatable release gate.
- Automate the non-interactive audit checks during repository deployment where practical.
- Update the final audit record after runtime validation, then mark the complete course release as verified.

### Completion gate for each stage

A stage is complete only after:

1. The revised lessons meet the depth, worked-example, and diagram standards in this plan.
2. Expected-outcome disclosures, investigation steps, and hints work on desktop and mobile layouts.
3. Every relevant starter artifact downloads correctly.
4. Practice APIs link to sufficient pywin32 or native reference information.
5. Quizzes test reasoning as well as assessment vocabulary.
6. The corresponding repository practices have been checked against the teaching path.
7. A final editing pass removes redundant prose and unexplained jargon.
8. The stage is deployed and visually reviewed before the next stage begins.
