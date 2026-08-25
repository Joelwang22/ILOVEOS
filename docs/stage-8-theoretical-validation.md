# Stage 8 theoretical runtime validation

Recorded 25 August 2026. This audit reviews the 32 operator-assisted and two authorised-lab-only downloads that cannot receive complete clean-lab evidence in the current environment. It is deliberately separate from executed runtime evidence: **theoretically validated does not mean clean-lab passed**.

## Method and conclusion

Every pending script was reviewed for command-line validation, Win32/pywin32 call shape, pointer-sized types, structure layout, access masks, wait results, error branches, ownership, and cleanup. Shared contracts were checked against Microsoft Learn, CPython 3.14, the primary pywin32 API reference, and Microsoft Sysinternals documentation.

No blocking contract contradiction was found. The normal paths are expected to run as authored on Windows 11 with matching 64-bit CPython 3.14 and pywin32. Expected non-success remains possible where the script deliberately depends on target permissions, service state, process architecture, object timing, or operator sequencing. Those branches are part of the lesson and must be recorded rather than treated as release defects.

Supporting checks completed on the current 64-bit Windows host:

- All 41 downloads compile without import execution; 32 `argparse` command surfaces returned successful `--help` output.
- `dacl_reader_lab.py`, `memory_provenance_lab.py --no-pause`, `module_baseline_lab.py --no-pause`, both PE readers against the active Python executable, `service_inventory_lab.py EventLog`, and the query-only path of `service_controller_lab.py` ran successfully without changing system state.
- The ctypes ABI checks produced the expected 64-bit sizes: `STARTUPINFOW` 104, `PROCESS_INFORMATION` 24, `SYSTEM_INFO` 48, `MEMORY_BASIC_INFORMATION` 48, `SERVICE_STATUS` 28, and `SERVICE_STATUS_PROCESS` 36 bytes.
- The hard-coded process and service masks/states matched the installed pywin32 constants.
- The complete local release gate and the separate deployed-site checks remain green.

## Per-row result

| Download | Theoretical result | Contract basis | Evidence still requiring the lab |
|---|---|---|---|
| `cpu_priority_lab.py` | Expected to pass | Bounded CPU loop, positive-duration guard, interrupt path, no acquired handles | Process Explorer priority/class observation and throughput comparison |
| `create_process_lab.py` | Expected to pass | Mutable Unicode command buffer, correct 64-bit structures, wait/exit query, both returned handles closed | Owned child observation, operator-driven child exit, and post-close handle proof |
| `dacl_reader_lab.py` | Read-only path passed | Owner/DACL retrieval, null-DACL distinction, ACE-type/mask/SID decoding | Controlled target comparison and optional external permission view |
| `deadlock_lab.py` | Expected to pass | Barrier makes the bounded cycle deterministic; timed acquire prevents a permanent deadlock; ordered mode uses one lock order | Thread-state observation during the two modes |
| `event_pair_lab.py` | Expected to pass | Manual/auto-reset event creation, `SYNCHRONIZE` open, bounded waits, missing-object branch, handle closure | Ordered creator/waiter terminals, early/late waiter evidence, Handle/WinObj lifetime |
| `explicit_load_lab.py` | Expected to pass | Absolute System32 DLL path, typed `WINFUNCTYPE`, export lookup, matching `FreeLibrary` | Loader/module observation and interactive `MessageBoxW` result |
| `file_lifetime_lab.py` | Expected to pass | Equivalent records distinguish persistent, reopened, and per-record flushed handles | Filtered Process Monitor counts/timing and deletion of the owned output files |
| `file_open_trace_lab.py` | Expected to pass | Owned-file tracking, context-managed close, pre/post-close pauses, conditional deletion | Process Monitor/Handle before and after close; confirm no created file remains |
| `heap_allocation_lab.py` | Expected to pass | Borrowed process heap, bounded allocation, same-heap size/free pairing | VMMap containing-region observation before `HeapFree` |
| `memory_map_csv_lab.py` | Expected with architecture/permission conditions | Correct 64-bit `MEMORY_BASIC_INFORMATION`, forward-progress traversal, process handle closure, CSV ownership | Controlled PID, 32-bit companion run, VMMap comparison, CSV deletion; access denial is valid evidence |
| `memory_provenance_lab.py` | Read-only path passed | Current-process pseudo-handle, native address bounds, forward-progress checks, documented region classes | VMMap type/working-set comparison while paused |
| `module_baseline_lab.py` | Read-only path passed | Correct PSAPI buffer sizing, module paths/hashes, no closing borrowed module values, bounded inventory | Two owned baseline files, ListDLLs comparison, and baseline deletion |
| `module_lifetime_lab.py` | Expected to pass | Absolute DLL path, one owned loader reference, `FreeLibrary` in `finally` | Before/load/free module snapshots and Process Monitor Image Load evidence |
| `named_event_lab.py` | Expected to pass | Local namespace, creator/opener distinction, explicit PyHANDLE close | Two-terminal handle values and WinObj/Process Explorer lifetime observation |
| `named_pipe_lab.py` | Expected to pass | Duplex message pipe, client switches to message-read mode, bounded frame size, `ERROR_MORE_DATA` loop, connect-race handling, disconnect/close | Ordered server/client transcript, Process Monitor/Handle evidence, object disappearance |
| `page_fault_lab.py` | Expected to pass | Bounded reserve+commit, one byte touched per page, matching `MEM_RELEASE` | VMMap/working-set and first-touch versus repeated-touch observations |
| `party_lab.py` | Expected to pass | Manual-reset gate, mutex ownership/timeout/abandonment handling, release only after acquisition, joined workers | Waiting/running thread states and named-object/cleanup evidence |
| `pe_imports_lab.py` | Read-only path passed | PE32/PE32+ directory offsets, section-aware RVA translation, ordinal/name thunks, bounded parsing | 32-bit PE comparison and independent PE viewer correlation |
| `pe_inspector_lab.py` | Read-only path passed | Bounded DOS/COFF/optional/section parsing, PE32/PE32+ image bases, header/section RVA translation | 32-bit PE comparison and independent PE viewer correlation |
| `pipeline_lab.py` | Expected to pass | Inheritable anonymous-pipe creation, non-inherited parent reads, exact standard-handle assignment, parent write closure before EOF read, child/process handle cleanup | Ordered child transcript, nonzero-stage case, Process Explorer/Handle inheritance evidence |
| `process_access_lab.py` | Expected with target/permission conditions | Named minimal/all access masks, last-error reporting, close only on successful open | Same-user controlled PID, minimal success, protected-target denial, Process Explorer comparison |
| `process_inventory_lab.py` | Expected to pass | Owned 16 MiB buffer, named waiting thread, context-managed temporary directory and explicit file close/join | Process Explorer/VMMap/Handle snapshots before and after release |
| `race_counter_lab.py` | Expected to pass | Barrier-controlled lost update, deliberately nondeterministic free run, lock-protected invariant | Thread/interleaving observation; only controlled and locked results are fixed assertions |
| `semaphore_lab.py` | Expected to pass | Wait decrements capacity, release follows acquisition only, timeout branch, joined workers, handle closure | Peak-capacity observation and named-handle disappearance |
| `service_controller_lab.py` | Query path passed; mutation remains conditional | Exact SCM/service rights, `SERVICE_STATUS_PROCESS` query, bounded transition polling, confirmation gate, service handles closed | Authorised disposable service, original-state capture, start/stop, exact restoration, final query |
| `service_inventory_lab.py` | Read-only path passed | Minimal query/config rights, live status/config decoding, both service handles closed | Independent Services/Process Explorer correlation for the chosen target |
| `shared_mapping_lab.py` | Expected to pass | Named writable mapping lifetime, creator/reader byte protocol, context-managed views, `ACCESS_COPY` file isolation, temporary-file deletion | Ordered creator/reader transcript and VMMap/WinObj lifetime evidence |
| `thread_io_lab.py` | Expected to pass | Existing nonempty controlled directory guard, bounded worker count, executor joins, byte-total invariant | Controlled corpus, Process Monitor TID correlation, one-versus-many timing evidence |
| `thread_observer_lab.py` | Expected to pass | Barrier-started named workers, controlled temporary files, event release, joins, automatic directory cleanup | Process Explorer TIDs and Process Monitor per-thread file reads |
| `thread_shutdown_lab.py` | Expected to pass | Cooperative stop, locked report writes, worker exception queue, joins before report close, nonzero failure return | Normal/failure transcripts and deletion of the owned report file |
| `thread_states_lab.py` | Expected to pass | Separate busy, timed-event, and event-wait workers; `finally` signals and joins every worker | Process Explorer state transitions at both pauses |
| `token_launch_lab.py` | Expected with same-user/rights conditions | Minimal process open, SID equality refusal, documented `DuplicateTokenEx` argument order, primary-token type, no launch call, four-handle cleanup | Authorised owned PID, expected denial branch if applicable, and external handle proof; child-created output must remain `no` |
| `virtual_allocation_lab.py` | Expected to pass | Reserve before page commits, pointer-sized arithmetic, committed-page protection change, full-reservation release | VMMap snapshots for reserved/committed/read-only states and post-release absence |
| `who_am_i.py` | Expected to pass | Current PID/name lookup and deliberate pause contain no owned native resource | Process Explorer identity/TID correlation during the pause |

## Primary references

- Microsoft memory contracts: [`VirtualQueryEx`](https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualqueryex), [`MEMORY_BASIC_INFORMATION`](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-memory_basic_information), [`VirtualAlloc`](https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc), and the [`heapapi.h` family](https://learn.microsoft.com/en-us/windows/win32/api/heapapi/).
- Loader and image contracts: [`LoadLibraryW`](https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibraryw), [`EnumProcessModules`](https://learn.microsoft.com/en-us/windows/win32/api/psapi/nf-psapi-enumprocessmodules), and Microsoft’s [PE/COFF format](https://learn.microsoft.com/en-us/windows/win32/debug/pe-format).
- Process, service, and security contracts: [`CreateProcessW`](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw), [`winsvc.h`](https://learn.microsoft.com/en-us/windows/win32/api/winsvc/), [service access rights](https://learn.microsoft.com/en-us/windows/win32/services/service-security-and-access-rights), [access tokens](https://learn.microsoft.com/en-us/windows/win32/secauthz/access-tokens), [ACLs](https://learn.microsoft.com/en-us/windows/win32/secauthz/access-control-lists), and pywin32 [`DuplicateTokenEx`](https://mhammond.github.io/pywin32/win32security__DuplicateTokenEx_meth.html).
- Synchronisation and IPC contracts: [`CreateEventW`](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createeventw), [synchronisation functions](https://learn.microsoft.com/en-us/windows/win32/sync/synchronization-functions), [named-pipe modes](https://learn.microsoft.com/en-us/windows/win32/ipc/named-pipe-type-read-and-wait-modes), pywin32 [`ReadFile`](https://mhammond.github.io/pywin32/win32file__ReadFile_meth.html), and Python 3.14 [`mmap`](https://docs.python.org/3.14/library/mmap.html).
- Thread and observation contracts: Python 3.14 [`threading`](https://docs.python.org/3.14/library/threading.html), Microsoft [Process Monitor](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon), [Handle](https://learn.microsoft.com/en-us/sysinternals/downloads/handle), [WinObj](https://learn.microsoft.com/en-us/sysinternals/downloads/winobj), [ListDLLs](https://learn.microsoft.com/en-us/sysinternals/downloads/listdlls), and [VMMap](https://learn.microsoft.com/en-us/sysinternals/downloads/vmmap).

## Remaining boundary

This audit materially raises confidence that the scripts should pass their documented normal paths. It cannot prove machine-dependent access decisions, timing observations, cross-process ordering, 32-bit/WoW64 comparisons, GUI tool displays, service restoration, token-handle visibility, or post-run system state. Only the named clean-lab protocols can close those evidence fields.
