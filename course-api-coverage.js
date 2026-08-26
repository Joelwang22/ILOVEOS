(() => {
  const reference = window.ILOVEOS_REFERENCE;
  const signatures = window.ILOVEOS_API_SIGNATURES;
  const familyData = window.ILOVEOS_WINDOWS_API_FAMILY_DATA;

  const p = (name, type, description) => ({ name, type, optional: false, description });
  const contract = (name, task, detail, returns, source, parameters = []) => ({
    name,
    task,
    detail,
    returns,
    source,
    parameters,
  });

  // These contracts close the native-API gaps found in the supplied course
  // decks, notes, and exercise files. They stay separate from generated
  // typeshed data because the Windows ABI is documented by Microsoft Learn.
  const nativeContracts = [
    contract("AdjustTokenPrivileges", "Enable or disable privileges held by a token", "Open the token with TOKEN_ADJUST_PRIVILEGES, inspect ERROR_NOT_ALL_ASSIGNED even when BOOL is nonzero, and restore temporary privilege changes.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-adjusttokenprivileges", [
      p("TokenHandle", "wintypes.HANDLE", "Token handle with TOKEN_ADJUST_PRIVILEGES access and TOKEN_QUERY when previous state is requested."),
      p("DisableAllPrivileges", "wintypes.BOOL", "Whether to disable every privilege and ignore NewState."),
      p("NewState", "ctypes.POINTER(TOKEN_PRIVILEGES) | None", "Privileges to enable, disable, or remove, or null when disabling all privileges."),
      p("BufferLength", "wintypes.DWORD", "Byte capacity of PreviousState, or zero when previous state is not requested."),
      p("PreviousState", "ctypes.POINTER(TOKEN_PRIVILEGES) | None", "Optional output receiving the privileges changed by the call."),
      p("ReturnLength", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving the required byte count for PreviousState."),
    ]),
    contract("CreateFileW", "Open or create a file, device, pipe, or other I/O object", "Choose access, sharing, creation disposition, flags, and security deliberately. Failure returns INVALID_HANDLE_VALUE, not null.", "wintypes.HANDLE", "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew", [
      p("lpFileName", "wintypes.LPCWSTR", "Unicode path or device name."),
      p("dwDesiredAccess", "wintypes.DWORD", "GENERIC_* access requested, or zero for metadata-only access where supported."),
      p("dwShareMode", "wintypes.DWORD", "FILE_SHARE_* permissions granted to later opens."),
      p("lpSecurityAttributes", "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", "Optional security descriptor and inheritance setting."),
      p("dwCreationDisposition", "wintypes.DWORD", "CREATE_*, OPEN_*, or TRUNCATE_EXISTING behavior for files."),
      p("dwFlagsAndAttributes", "wintypes.DWORD", "FILE_ATTRIBUTE_* and FILE_FLAG_* options."),
      p("hTemplateFile", "wintypes.HANDLE | None", "Optional template-file handle, normally null."),
    ]),
    contract("CreatePipe", "Create an anonymous pipe", "Receive owned read and write handles, make only intended ends inheritable, and close unused ends promptly to preserve end-of-file behavior.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-createpipe", [
      p("hReadPipe", "ctypes.POINTER(wintypes.HANDLE)", "Output receiving the owned read handle."),
      p("hWritePipe", "ctypes.POINTER(wintypes.HANDLE)", "Output receiving the owned write handle."),
      p("lpPipeAttributes", "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", "Optional security descriptor and inheritance setting."),
      p("nSize", "wintypes.DWORD", "Advisory pipe-buffer size, or zero for the system default."),
    ]),
    contract("CreateProcessAsUserW", "Create a process in a primary token's security context", "Use a primary token with the required rights, prepare a mutable command line and initialized STARTUPINFO, and close both returned handles.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessasuserw", [
      p("hToken", "wintypes.HANDLE", "Primary token used for the new process."),
      p("lpApplicationName", "wintypes.LPCWSTR | None", "Optional executable path."),
      p("lpCommandLine", "wintypes.LPWSTR | None", "Writable command-line buffer."),
      p("lpProcessAttributes", "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", "Optional process security and inheritance attributes."),
      p("lpThreadAttributes", "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", "Optional primary-thread security and inheritance attributes."),
      p("bInheritHandles", "wintypes.BOOL", "Whether inheritable handles are inherited."),
      p("dwCreationFlags", "wintypes.DWORD", "Process creation and priority flags."),
      p("lpEnvironment", "ctypes.c_void_p | None", "Optional environment block compatible with the selected flags."),
      p("lpCurrentDirectory", "wintypes.LPCWSTR | None", "Optional working directory."),
      p("lpStartupInfo", "ctypes.POINTER(STARTUPINFOW)", "Initialized startup settings."),
      p("lpProcessInformation", "ctypes.POINTER(PROCESS_INFORMATION)", "Output receiving owned process and thread handles and identifiers."),
    ]),
    contract("CreateServiceW", "Create a service entry in the Service Control Manager database", "Use an SCM handle with SC_MANAGER_CREATE_SERVICE, supply the internal service name and executable configuration, and close the returned service handle.", "SC_HANDLE", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-createservicew", [
      p("hSCManager", "SC_HANDLE", "Open Service Control Manager database handle."),
      p("lpServiceName", "wintypes.LPCWSTR", "Unique internal service name."),
      p("lpDisplayName", "wintypes.LPCWSTR | None", "Optional user-facing service name."),
      p("dwDesiredAccess", "wintypes.DWORD", "SERVICE_* access requested for the returned handle."),
      p("dwServiceType", "wintypes.DWORD", "SERVICE_* type for the executable or driver."),
      p("dwStartType", "wintypes.DWORD", "SERVICE_* start policy."),
      p("dwErrorControl", "wintypes.DWORD", "Boot-time response to a service-start error."),
      p("lpBinaryPathName", "wintypes.LPCWSTR", "Fully qualified executable path and optional arguments."),
      p("lpLoadOrderGroup", "wintypes.LPCWSTR | None", "Optional load-order group."),
      p("lpdwTagId", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving a group tag."),
      p("lpDependencies", "wintypes.LPCWSTR | None", "Optional double-null-terminated dependency list."),
      p("lpServiceStartName", "wintypes.LPCWSTR | None", "Optional service account name."),
      p("lpPassword", "wintypes.LPCWSTR | None", "Optional account password."),
    ]),
    contract("CreateThread", "Create a thread in the current process", "Keep the start routine and its argument alive, use an ABI-correct callback, and close the returned thread handle after synchronization.", "wintypes.HANDLE", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createthread", [
      p("lpThreadAttributes", "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", "Optional security descriptor and inheritance setting."),
      p("dwStackSize", "ctypes.c_size_t", "Initial stack size or zero for the executable default."),
      p("lpStartAddress", "LPTHREAD_START_ROUTINE", "ABI-correct thread entry point."),
      p("lpParameter", "ctypes.c_void_p | None", "Single pointer-sized argument passed to the entry point."),
      p("dwCreationFlags", "wintypes.DWORD", "Zero or supported thread-creation flags such as CREATE_SUSPENDED."),
      p("lpThreadId", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving the thread identifier."),
    ]),
    contract("DuplicateHandle", "Duplicate a handle within or across processes", "Use process handles with PROCESS_DUP_HANDLE, choose either same access or an explicit mask, and define exactly which side owns each copy.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-duplicatehandle", [
      p("hSourceProcessHandle", "wintypes.HANDLE", "Process containing the source handle table."),
      p("hSourceHandle", "wintypes.HANDLE", "Handle value valid in the source process."),
      p("hTargetProcessHandle", "wintypes.HANDLE", "Process that will receive the duplicate."),
      p("lpTargetHandle", "ctypes.POINTER(wintypes.HANDLE)", "Output receiving the new handle value for the target process."),
      p("dwDesiredAccess", "wintypes.DWORD", "Requested access when DUPLICATE_SAME_ACCESS is absent."),
      p("bInheritHandle", "wintypes.BOOL", "Whether the duplicate is inheritable."),
      p("dwOptions", "wintypes.DWORD", "DUPLICATE_* options controlling access and source closure."),
    ]),
    contract("EnterCriticalSection", "Acquire an in-process critical section", "Initialize the CRITICAL_SECTION first and pair every successful entry with LeaveCriticalSection on the same thread.", "None", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-entercriticalsection", [p("lpCriticalSection", "ctypes.POINTER(CRITICAL_SECTION)", "Initialized critical-section object owned by this process.")]),
    contract("EnumProcesses", "Enumerate process identifiers", "Pass a DWORD array, use lpcbNeeded to detect a full buffer, and remember that processes can exit or appear immediately after the snapshot.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/psapi/nf-psapi-enumprocesses", [
      p("lpidProcess", "ctypes.POINTER(wintypes.DWORD)", "Output array receiving process identifiers."),
      p("cb", "wintypes.DWORD", "Array capacity in bytes."),
      p("lpcbNeeded", "ctypes.POINTER(wintypes.DWORD)", "Output receiving bytes written or required for the current snapshot."),
    ]),
    contract("ExitThread", "End the calling native thread", "Return from the thread procedure when practical so language cleanup runs; direct ExitThread bypasses ordinary stack unwinding for the calling thread.", "None", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-exitthread", [p("dwExitCode", "wintypes.DWORD", "Exit status published by the thread object.")]),
    contract("FlushFileBuffers", "Request that buffered file or pipe data be written", "Use only when durability or pipe protocol requires it; frequent calls can be expensive and do not replace application-level acknowledgement.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-flushfilebuffers", [p("hFile", "wintypes.HANDLE", "Open file or pipe handle with the access required by its contract.")]),
    contract("FlushViewOfFile", "Write dirty mapped-view pages toward their backing file", "Flush the byte range, then flush the file handle when durable metadata and disk ordering matter; this call alone does not flush all file metadata.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-flushviewoffile", [
      p("lpBaseAddress", "wintypes.LPCVOID", "Address within the mapped view."),
      p("dwNumberOfBytesToFlush", "ctypes.c_size_t", "Bytes to flush, or zero for the range through the end of the mapping."),
    ]),
    contract("GetExitCodeThread", "Read a thread's termination status", "A successful call can return STILL_ACTIVE while the thread runs. Waiting is the reliable way to establish termination before treating the value as final.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getexitcodethread", [
      p("hThread", "wintypes.HANDLE", "Thread handle with query access."),
      p("lpExitCode", "ctypes.POINTER(wintypes.DWORD)", "Output receiving the exit status or STILL_ACTIVE."),
    ]),
    contract("GetNamedPipeInfo", "Read a named pipe's configuration", "Request only the outputs needed and interpret buffer sizes and maximum instances as configuration data, not current queued-byte counts.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-getnamedpipeinfo", [
      p("hNamedPipe", "wintypes.HANDLE", "Open named-pipe handle."),
      p("lpFlags", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving server/client and pipe-type flags."),
      p("lpOutBufferSize", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving outbound buffer size."),
      p("lpInBufferSize", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving inbound buffer size."),
      p("lpMaxInstances", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving the configured maximum instance count."),
    ]),
    contract("GetStdHandle", "Retrieve the process standard-stream handle", "The result can be null, INVALID_HANDLE_VALUE, redirected, or replaced. Borrow it unless another operation explicitly transfers ownership.", "wintypes.HANDLE", "https://learn.microsoft.com/en-us/windows/console/getstdhandle", [p("nStdHandle", "wintypes.DWORD", "STD_INPUT_HANDLE, STD_OUTPUT_HANDLE, or STD_ERROR_HANDLE.")]),
    contract("HeapCreate", "Create a private heap", "Choose sizing and serialization options, check the returned heap handle, and destroy the heap only after every user has stopped accessing it.", "wintypes.HANDLE", "https://learn.microsoft.com/en-us/windows/win32/api/heapapi/nf-heapapi-heapcreate", [
      p("flOptions", "wintypes.DWORD", "Heap creation options."),
      p("dwInitialSize", "ctypes.c_size_t", "Initially committed bytes."),
      p("dwMaximumSize", "ctypes.c_size_t", "Maximum heap size, or zero for a growable heap."),
    ]),
    contract("HeapDestroy", "Destroy a private heap", "Use only for a heap returned by HeapCreate after all users are quiescent; never destroy the process heap.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/heapapi/nf-heapapi-heapdestroy", [p("hHeap", "wintypes.HANDLE", "Private heap returned by HeapCreate.")]),
    contract("ImpersonateLoggedOnUser", "Adopt a token's security context on the calling thread", "Use a suitable token and always restore the original context with RevertToSelf in a finally block.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-impersonateloggedonuser", [p("hToken", "wintypes.HANDLE", "Primary or impersonation token meeting the documented level and access requirements.")]),
    contract("ImpersonateNamedPipeClient", "Impersonate the last client that wrote to a named pipe", "Call from the pipe server after a client interaction and guarantee RevertToSelf even when authorization or processing fails.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-impersonatenamedpipeclient", [p("hNamedPipe", "wintypes.HANDLE", "Connected server-side named-pipe handle.")]),
    contract("LeaveCriticalSection", "Release an in-process critical section", "Call from the thread that entered it and do not leave more times than the recursion count acquired.", "None", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-leavecriticalsection", [p("lpCriticalSection", "ctypes.POINTER(CRITICAL_SECTION)", "Critical section currently owned by the calling thread.")]),
    contract("LookupPrivilegeValueW", "Resolve a privilege name to its locally unique identifier", "Resolve on the local or named system and pass the resulting LUID in TOKEN_PRIVILEGES; the LUID is system-specific.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-lookupprivilegevaluew", [
      p("lpSystemName", "wintypes.LPCWSTR | None", "Target system name, or null for the local system."),
      p("lpName", "wintypes.LPCWSTR", "Privilege name such as SE_DEBUG_NAME."),
      p("lpLuid", "ctypes.POINTER(LUID)", "Output receiving the privilege LUID."),
    ]),
    contract("OpenEventW", "Open an existing named event", "Request only the access required, distinguish a missing object from other failures, and close the returned handle.", "wintypes.HANDLE", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-openeventw", [
      p("dwDesiredAccess", "wintypes.DWORD", "EVENT_* access requested."),
      p("bInheritHandle", "wintypes.BOOL", "Whether a later child may inherit the returned handle."),
      p("lpName", "wintypes.LPCWSTR", "Existing event object's name."),
    ]),
    contract("ReadProcessMemory", "Copy readable bytes from another process", "Use a process handle with PROCESS_VM_READ, validate the complete address range, and check both BOOL and the transferred byte count.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-readprocessmemory", [
      p("hProcess", "wintypes.HANDLE", "Process handle with PROCESS_VM_READ access."),
      p("lpBaseAddress", "wintypes.LPCVOID", "Address in the target process."),
      p("lpBuffer", "wintypes.LPVOID", "Caller-owned writable output buffer."),
      p("nSize", "ctypes.c_size_t", "Number of bytes requested."),
      p("lpNumberOfBytesRead", "ctypes.POINTER(ctypes.c_size_t) | None", "Optional output receiving the transferred byte count."),
    ]),
    contract("RegCloseKey", "Close an open Registry key", "Close every HKEY acquired by a Registry open or create call. Predefined root handles do not need this cleanup.", "wintypes.LONG", "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regclosekey", [p("hKey", "wintypes.HKEY", "Open Registry key to release.")]),
    contract("RegCreateKeyExW", "Create or open a Registry key", "Use only when creation is intended, select the Registry view explicitly when relevant, inspect the disposition output, and close the returned HKEY.", "wintypes.LONG", "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regcreatekeyexw", [
      p("hKey", "wintypes.HKEY", "Predefined root or open parent key."), p("lpSubKey", "wintypes.LPCWSTR", "Relative subkey path."), p("Reserved", "wintypes.DWORD", "Reserved; must be zero."), p("lpClass", "wintypes.LPWSTR | None", "Optional user-defined class string."), p("dwOptions", "wintypes.DWORD", "Creation options such as volatile or nonvolatile."), p("samDesired", "wintypes.DWORD", "KEY_* access and optional WOW64 view flags."), p("lpSecurityAttributes", "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", "Optional security descriptor and inheritance setting."), p("phkResult", "ctypes.POINTER(wintypes.HKEY)", "Output receiving the opened or created key."), p("lpdwDisposition", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output reporting whether the key was created or opened."),
    ]),
    contract("RegDeleteKeyW", "Delete an empty Registry key", "Target the exact lab key, select the intended Registry view through the parent handle, and expect failure while subkeys remain.", "wintypes.LONG", "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regdeletekeyw", [p("hKey", "wintypes.HKEY", "Open parent key."), p("lpSubKey", "wintypes.LPCWSTR", "Relative name of the key to delete.")]),
    contract("RegEnumKeyExW", "Enumerate Registry subkeys", "Advance the index until ERROR_NO_MORE_ITEMS, reset buffer capacities for each call, and tolerate concurrent Registry changes.", "wintypes.LONG", "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regenumkeyexw", [
      p("hKey", "wintypes.HKEY", "Open key whose subkeys are enumerated."), p("dwIndex", "wintypes.DWORD", "Zero-based subkey index."), p("lpName", "wintypes.LPWSTR", "Writable subkey-name buffer."), p("lpcchName", "ctypes.POINTER(wintypes.DWORD)", "In/out name-buffer capacity and resulting character count."), p("lpReserved", "ctypes.POINTER(wintypes.DWORD) | None", "Reserved; must be null."), p("lpClass", "wintypes.LPWSTR | None", "Optional writable class-name buffer."), p("lpcchClass", "ctypes.POINTER(wintypes.DWORD) | None", "Optional in/out class-buffer capacity and length."), p("lpftLastWriteTime", "ctypes.POINTER(wintypes.FILETIME) | None", "Optional output receiving last-write time."),
    ]),
    contract("RegEnumValueW", "Enumerate Registry values", "Preserve each value's name, type, and raw data, resize buffers on ERROR_MORE_DATA, and do not depend on enumeration order.", "wintypes.LONG", "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regenumvaluew", [
      p("hKey", "wintypes.HKEY", "Open key whose values are enumerated."), p("dwIndex", "wintypes.DWORD", "Zero-based value index."), p("lpValueName", "wintypes.LPWSTR", "Writable value-name buffer."), p("lpcchValueName", "ctypes.POINTER(wintypes.DWORD)", "In/out name-buffer capacity and resulting length."), p("lpReserved", "ctypes.POINTER(wintypes.DWORD) | None", "Reserved; must be null."), p("lpType", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving the REG_* type."), p("lpData", "ctypes.POINTER(wintypes.BYTE) | None", "Optional raw-data buffer."), p("lpcbData", "ctypes.POINTER(wintypes.DWORD) | None", "In/out data-buffer capacity and byte count."),
    ]),
    contract("RegQueryValueExW", "Read one Registry value and its type", "Query the byte count when necessary, allocate for the reported type, and handle data that changes between sizing and retrieval.", "wintypes.LONG", "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regqueryvalueexw", [
      p("hKey", "wintypes.HKEY", "Open Registry key."), p("lpValueName", "wintypes.LPCWSTR | None", "Value name, or null or empty for the unnamed value."), p("lpReserved", "ctypes.POINTER(wintypes.DWORD) | None", "Reserved; must be null."), p("lpType", "ctypes.POINTER(wintypes.DWORD) | None", "Optional output receiving the REG_* type."), p("lpData", "ctypes.POINTER(wintypes.BYTE) | None", "Optional raw-data buffer."), p("lpcbData", "ctypes.POINTER(wintypes.DWORD)", "In/out data-buffer capacity and required byte count."),
    ]),
    contract("RegSetValueExW", "Write typed data to one Registry value", "Use the correct REG_* type and byte count, preserve terminators required by string types, and limit writes to an owned lab key.", "wintypes.LONG", "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regsetvalueexw", [
      p("hKey", "wintypes.HKEY", "Open key with KEY_SET_VALUE access."), p("lpValueName", "wintypes.LPCWSTR | None", "Value name, or null or empty for the unnamed value."), p("Reserved", "wintypes.DWORD", "Reserved; must be zero."), p("dwType", "wintypes.DWORD", "REG_* data type."), p("lpData", "ctypes.POINTER(wintypes.BYTE) | None", "Bytes to store."), p("cbData", "wintypes.DWORD", "Number of bytes in lpData."),
    ]),
    contract("ReleaseMutex", "Release one level of mutex ownership", "Only the owning thread can release the mutex. Balance recursive acquisitions and close the handle separately when finished.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-releasemutex", [p("hMutex", "wintypes.HANDLE", "Mutex currently owned by the calling thread.")]),
    contract("ResetEvent", "Set an event to the nonsignaled state", "Manual-reset events remain nonsignaled until SetEvent; resetting an auto-reset event can discard a pending signal before a waiter consumes it.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-resetevent", [p("hEvent", "wintypes.HANDLE", "Event handle with EVENT_MODIFY_STATE access.")]),
    contract("RevertToSelf", "Restore the calling thread's original security context", "Place it in a finally block around every successful impersonation. If restoration fails, stop privileged processing rather than continuing in the wrong context.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-reverttoself", []),
    contract("SetEvent", "Set an event to the signaled state", "A manual-reset event releases eligible waiters until reset; an auto-reset event releases at most one waiter and resets automatically.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-setevent", [p("hEvent", "wintypes.HANDLE", "Event handle with EVENT_MODIFY_STATE access.")]),
    contract("SetHandleInformation", "Change handle inheritance or close-protection flags", "Use the mask to identify flags being changed and clear inheritance on pipe ends or handles that a child must not receive.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-sethandleinformation", [
      p("hObject", "wintypes.HANDLE", "Handle whose metadata is changed."), p("dwMask", "wintypes.DWORD", "HANDLE_FLAG_* bits to update."), p("dwFlags", "wintypes.DWORD", "New values for bits selected by dwMask."),
    ]),
    contract("SetNamedPipeHandleState", "Change named-pipe read mode or collection settings", "Pass pointers only for fields being changed and choose byte or message read mode compatible with the pipe type.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-setnamedpipehandlestate", [
      p("hNamedPipe", "wintypes.HANDLE", "Open named-pipe handle with the required access."), p("lpMode", "ctypes.POINTER(wintypes.DWORD) | None", "Optional new read and wait-mode flags."), p("lpMaxCollectionCount", "ctypes.POINTER(wintypes.DWORD) | None", "Optional maximum buffered byte count for remote collection."), p("lpCollectDataTimeout", "ctypes.POINTER(wintypes.DWORD) | None", "Optional remote collection timeout in milliseconds."),
    ]),
    contract("SetThreadContext", "Replace selected register state for a suspended thread", "Suspend the target, initialize CONTEXT flags and architecture-specific layout exactly, and use only in an authorized debugger-style workflow.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-setthreadcontext", [p("hThread", "wintypes.HANDLE", "Suspended thread handle with THREAD_SET_CONTEXT access."), p("lpContext", "ctypes.POINTER(CONTEXT)", "Architecture-correct context containing the register groups selected by ContextFlags.")]),
    contract("TerminateThread", "Force a thread to stop", "Treat this as an emergency last resort: the target cannot release locks, repair invariants, run language cleanup, or notify DLLs safely.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-terminatethread", [p("hThread", "wintypes.HANDLE", "Thread handle with THREAD_TERMINATE access."), p("dwExitCode", "wintypes.DWORD", "Exit status assigned to the terminated thread.")]),
    contract("WaitNamedPipeW", "Wait for a named-pipe server instance to become available", "Treat success as permission to retry CreateFileW, not a reservation; another client can win the race before the open.", "wintypes.BOOL", "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-waitnamedpipew", [p("lpNamedPipeName", "wintypes.LPCWSTR", "Fully qualified pipe name."), p("nTimeOut", "wintypes.DWORD", "Timeout in milliseconds or a documented named-pipe default sentinel.")]),
  ];

  const ctypesModule = reference.pywin32Modules.find((module) => module.name === "ctypes / ctypes.wintypes");
  for (const item of nativeContracts) {
    if (!ctypesModule.features.some((feature) => feature.name === item.name)) {
      ctypesModule.features.push({ name: item.name, task: item.task, detail: item.detail });
    }
    signatures[`ctypes / ctypes.wintypes::${item.name}`] = {
      kind: "function",
      signatures: [{ name: item.name, parameters: item.parameters, returns: item.returns }],
      sources: [item.source],
    };
  }

  const family = (name, summary, variant, aliases = []) => ({
    id: name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
    name,
    summary,
    recommendedVariant: variant,
    variantNames: [variant],
    aliases,
  });
  const unicodeAlias = (name, target) => ({ name, target, note: "Use the explicit Unicode entry point for Python strings." });
  const familyDefinitions = [
    family("AdjustTokenPrivileges", "Enable, disable, or remove privileges held by an access token.", "AdjustTokenPrivileges"),
    family("CreateFile", "Open or create a file, device, pipe, or other I/O object.", "CreateFileW", [unicodeAlias("CreateFile", "CreateFileW")]),
    family("CreatePipe", "Create an anonymous pipe with owned read and write handles.", "CreatePipe"),
    family("CreateProcessAsUser", "Create a process in a primary token's security context.", "CreateProcessAsUserW", [unicodeAlias("CreateProcessAsUser", "CreateProcessAsUserW")]),
    family("CreateService", "Create a service entry in the Service Control Manager database.", "CreateServiceW", [unicodeAlias("CreateService", "CreateServiceW")]),
    family("CreateThread", "Create a thread in the current process.", "CreateThread"),
    family("DuplicateHandle", "Duplicate a handle within or across process handle tables.", "DuplicateHandle"),
    family("EnterCriticalSection", "Acquire an in-process critical section.", "EnterCriticalSection"),
    family("EnumProcesses", "Take a best-effort snapshot of current process identifiers.", "EnumProcesses"),
    family("ExitThread", "End the calling native thread with an exit status.", "ExitThread"),
    family("FlushFileBuffers", "Request that buffered file or pipe data be written.", "FlushFileBuffers"),
    family("FlushViewOfFile", "Write dirty mapped-view pages toward their backing file.", "FlushViewOfFile"),
    family("GetExitCodeThread", "Read a thread's termination status or STILL_ACTIVE.", "GetExitCodeThread"),
    family("GetNamedPipeInfo", "Read a named pipe's type and configured buffer information.", "GetNamedPipeInfo"),
    family("GetStdHandle", "Borrow the process standard input, output, or error handle.", "GetStdHandle"),
    family("HeapCreate", "Create a private heap.", "HeapCreate"),
    family("HeapDestroy", "Destroy a private heap after all users are finished.", "HeapDestroy"),
    family("ImpersonateLoggedOnUser", "Adopt a token's security context on the calling thread.", "ImpersonateLoggedOnUser"),
    family("ImpersonateNamedPipeClient", "Adopt the security context of a named-pipe client.", "ImpersonateNamedPipeClient"),
    family("LeaveCriticalSection", "Release one acquisition of an in-process critical section.", "LeaveCriticalSection"),
    family("LookupPrivilegeValue", "Resolve a privilege name to its system-specific LUID.", "LookupPrivilegeValueW", [unicodeAlias("LookupPrivilegeValue", "LookupPrivilegeValueW")]),
    family("OpenEvent", "Open an existing named event object.", "OpenEventW", [unicodeAlias("OpenEvent", "OpenEventW")]),
    family("ReadProcessMemory", "Copy readable bytes from another process.", "ReadProcessMemory"),
    family("RegCloseKey", "Release an open Registry key handle.", "RegCloseKey"),
    family("RegCreateKeyEx", "Create or open a Registry key.", "RegCreateKeyExW", [unicodeAlias("RegCreateKeyEx", "RegCreateKeyExW")]),
    family("RegDeleteKey", "Delete an empty Registry key.", "RegDeleteKeyW", [unicodeAlias("RegDeleteKey", "RegDeleteKeyW")]),
    family("RegEnumKeyEx", "Enumerate subkeys and their metadata.", "RegEnumKeyExW", [unicodeAlias("RegEnumKeyEx", "RegEnumKeyExW")]),
    family("RegEnumValue", "Enumerate value names, types, and data.", "RegEnumValueW", [unicodeAlias("RegEnumValue", "RegEnumValueW")]),
    family("RegQueryValueEx", "Read one Registry value and its type.", "RegQueryValueExW", [unicodeAlias("RegQueryValueEx", "RegQueryValueExW")]),
    family("RegSetValueEx", "Write typed data to one Registry value.", "RegSetValueExW", [unicodeAlias("RegSetValueEx", "RegSetValueExW")]),
    family("ReleaseMutex", "Release one level of mutex ownership.", "ReleaseMutex"),
    family("ResetEvent", "Set an event object to the nonsignaled state.", "ResetEvent"),
    family("RevertToSelf", "Restore the calling thread's original security context.", "RevertToSelf"),
    family("SetEvent", "Set an event object to the signaled state.", "SetEvent"),
    family("SetHandleInformation", "Change handle inheritance or close-protection flags.", "SetHandleInformation"),
    family("SetNamedPipeHandleState", "Change named-pipe read mode or collection settings.", "SetNamedPipeHandleState"),
    family("SetThreadContext", "Replace selected register state for a suspended thread.", "SetThreadContext"),
    family("TerminateThread", "Force a thread to stop without cooperative cleanup.", "TerminateThread"),
    family("WaitNamedPipe", "Wait for a named-pipe server instance to become available.", "WaitNamedPipeW", [unicodeAlias("WaitNamedPipe", "WaitNamedPipeW")]),
  ];
  const existingFamilyIds = new Set(familyData.familyDefinitions.map((item) => item.id));
  for (const item of familyDefinitions) {
    if (!existingFamilyIds.has(item.id)) familyData.familyDefinitions.push(item);
  }

  const pywin32 = [
    ["pywintypes.error", "pywintypes::error"],
    ["win32api.CloseHandle", "win32api::CloseHandle"], ["win32api.GetCurrentProcess", "win32api::GetCurrentProcess"], ["win32api.GetModuleHandle", "win32api::GetModuleHandle"], ["win32api.GetProcAddress", "win32api::GetProcAddress"], ["win32api.GetStdHandle", "win32api::GetStdHandle"], ["win32api.OpenProcess", "win32api::OpenProcess"], ["win32api.SetHandleInformation", "win32api::SetHandleInformation"],
    ["win32con.CREATE_NEW_CONSOLE", "win32con::Process creation flags"], ["win32con.GENERIC_READ", "win32con::File access and sharing"], ["win32con.GENERIC_WRITE", "win32con::File access and sharing"], ["win32con.HANDLE_FLAG_INHERIT", "win32con::Handle inheritance"], ["win32con.OPEN_EXISTING", "win32con::Creation dispositions"], ["win32con.PROCESS_CREATE_THREAD", "win32con::Process rights"], ["win32con.PROCESS_QUERY_INFORMATION", "win32con::Process rights"], ["win32con.PROCESS_VM_OPERATION", "win32con::Process rights"], ["win32con.PROCESS_VM_READ", "win32con::Process rights"], ["win32con.PROCESS_VM_WRITE", "win32con::Process rights"], ["win32con.SE_ASSIGNPRIMARYTOKEN_NAME", "win32con::Privilege attributes"], ["win32con.SE_PRIVILEGE_ENABLED", "win32con::Privilege attributes"], ["win32con.STARTF_USESTDHANDLES", "win32con::Handle inheritance"], ["win32con.SYNCHRONIZE", "win32con::Access masks"],
    ["win32event.CreateEvent", "win32event::CreateEvent"], ["win32event.CreateMutex", "win32event::CreateMutex"], ["win32event.INFINITE", "win32event::INFINITE"], ["win32event.OpenEvent", "win32event::OpenEvent"], ["win32event.ReleaseMutex", "win32event::ReleaseMutex"], ["win32event.SetEvent", "win32event::SetEvent"], ["win32event.WAIT_ABANDONED", "win32event::WAIT_ABANDONED"], ["win32event.WAIT_OBJECT_0", "win32event::WAIT_OBJECT_0"], ["win32event.WaitForSingleObject", "win32event::WaitForSingleObject"],
    ["win32file.CreateFile", "win32file::CreateFile"], ["win32file.ReadFile", "win32file::ReadFile"], ["win32file.WriteFile", "win32file::WriteFile"],
    ["win32pipe.CreatePipe", "win32pipe::CreatePipe"], ["win32pipe.GetNamedPipeInfo", "win32pipe::GetNamedPipeInfo"], ["win32pipe.PIPE_READMODE_MESSAGE", "win32pipe::SetNamedPipeHandleState"], ["win32pipe.PIPE_TYPE_MESSAGE", "win32pipe::CreateNamedPipe"], ["win32pipe.SetNamedPipeHandleState", "win32pipe::SetNamedPipeHandleState"], ["win32pipe.WaitNamedPipe", "win32pipe::WaitNamedPipe"],
    ["win32process.CreateProcess", "win32process::CreateProcess"], ["win32process.CreateProcessAsUser", "win32process::CreateProcessAsUser"], ["win32process.CreateRemoteThread", "win32process::CreateRemoteThread"], ["win32process.STARTUPINFO", "win32process::STARTUPINFO"], ["win32process.VirtualAllocEx", "win32process::VirtualAllocEx"],
    ["win32security.AdjustTokenPrivileges", "win32security::AdjustTokenPrivileges"], ["win32security.DuplicateTokenEx", "win32security::DuplicateTokenEx"], ["win32security.LookupPrivilegeValue", "win32security::LookupPrivilegeValue"], ["win32security.OpenProcessToken", "win32security::OpenProcessToken"], ["win32security.SECURITY_ATTRIBUTES", "win32security::SECURITY_ATTRIBUTES"],
    ["win32security.SE_ASSIGNPRIMARYTOKEN_NAME", "win32security::LookupPrivilegeValue"], ["win32security.SE_INCREASE_QUOTA_NAME", "win32security::LookupPrivilegeValue"], ["win32security.SecurityImpersonation", "win32security::DuplicateTokenEx"], ["win32security.TOKEN_ADJUST_PRIVILEGES", "win32security::AdjustTokenPrivileges"], ["win32security.TOKEN_ASSIGN_PRIMARY", "win32security::DuplicateTokenEx"], ["win32security.TOKEN_DUPLICATE", "win32security::DuplicateTokenEx"], ["win32security.TOKEN_QUERY", "win32security::OpenProcessToken"], ["win32security.TokenPrimary", "win32security::DuplicateTokenEx"],
  ].map(([courseReference, guideKey]) => ({ courseReference, guideKey }));

  const native = [
    ["AdjustTokenPrivileges", "AdjustTokenPrivileges"], ["CloseHandle", "CloseHandle"], ["CloseServiceHandle", "CloseServiceHandle"], ["ControlService", "ControlService"], ["CreateEvent", "CreateEventW"], ["CreateFile", "CreateFileW"], ["CreateFileW", "CreateFileW"], ["CreateMutex", "CreateMutexW"], ["CreateNamedPipe", "CreateNamedPipeW"], ["CreatePipe", "CreatePipe"], ["CreateProcess", "CreateProcessW"], ["CreateProcessAsUser", "CreateProcessAsUserW"], ["CreateProcessAsUserW", "CreateProcessAsUserW"], ["CreateService", "CreateServiceW"], ["CreateThread", "CreateThread"], ["DuplicateHandle", "DuplicateHandle"], ["DuplicateTokenEx", "DuplicateTokenEx"], ["EnterCriticalSection", "EnterCriticalSection"], ["EnumProcesses", "EnumProcesses"], ["EnumProcessModules", "EnumProcessModules"], ["EnumProcessModulesEx", "EnumProcessModulesEx"], ["ExitThread", "ExitThread"], ["FlushFileBuffers", "FlushFileBuffers"], ["FlushViewOfFile", "FlushViewOfFile"], ["FreeLibrary", "FreeLibrary"], ["GetCurrentProcess", "GetCurrentProcess"], ["GetExitCodeThread", "GetExitCodeThread"], ["GetLastError", "GetLastError"], ["GetModuleFileName", "GetModuleFileNameW"], ["GetModuleFileNameEx", "GetModuleFileNameExW"], ["GetModuleHandle", "GetModuleHandleW"], ["GetNamedPipeInfo", "GetNamedPipeInfo"], ["GetProcAddress", "GetProcAddress"], ["GetProcessHeap", "GetProcessHeap"], ["GetStdHandle", "GetStdHandle"], ["HeapAlloc", "HeapAlloc"], ["HeapCreate", "HeapCreate"], ["HeapDestroy", "HeapDestroy"], ["HeapFree", "HeapFree"], ["HeapSize", "HeapSize"], ["ImpersonateLoggedOnUser", "ImpersonateLoggedOnUser"], ["ImpersonateNamedPipeClient", "ImpersonateNamedPipeClient"], ["IsWow64Process2", "IsWow64Process2"], ["LeaveCriticalSection", "LeaveCriticalSection"], ["LoadLibrary", "LoadLibraryW"], ["LoadLibraryA", "LoadLibraryA"], ["LoadLibraryEx", "LoadLibraryExW"], ["LoadLibraryW", "LoadLibraryW"], ["LookupPrivilegeValue", "LookupPrivilegeValueW"], ["MapViewOfFile", "MapViewOfFile"], ["MessageBox", "MessageBoxW"], ["MessageBoxA", "MessageBoxA"], ["OpenEvent", "OpenEventW"], ["OpenFile", "CreateFileW"], ["OpenProcess", "OpenProcess"], ["OpenProcessToken", "OpenProcessToken"], ["OpenSCManager", "OpenSCManagerW"], ["OpenSCManagerW", "OpenSCManagerW"], ["OpenService", "OpenServiceW"], ["OpenServiceW", "OpenServiceW"], ["ReadFile", "ReadFile"], ["ReadProcessMemory", "ReadProcessMemory"], ["RegCloseKey", "RegCloseKey"], ["RegCreateKeyEx", "RegCreateKeyExW"], ["RegDeleteKey", "RegDeleteKeyW"], ["RegEnumKeyEx", "RegEnumKeyExW"], ["RegEnumValue", "RegEnumValueW"], ["RegOpenKeyEx", "RegOpenKeyExW"], ["RegQueryValueEx", "RegQueryValueExW"], ["RegSetValueEx", "RegSetValueExW"], ["ReleaseMutex", "ReleaseMutex"], ["ResetEvent", "ResetEvent"], ["RevertToSelf", "RevertToSelf"], ["SetEvent", "SetEvent"], ["SetHandleInformation", "SetHandleInformation"], ["SetNamedPipeHandleState", "SetNamedPipeHandleState"], ["SetThreadContext", "SetThreadContext"], ["SetWindowsHookEx", "SetWindowsHookExW"], ["StartService", "StartServiceW"], ["StartServiceW", "StartServiceW"], ["TerminateThread", "TerminateThread"], ["UnmapViewOfFile", "UnmapViewOfFile"], ["VirtualAlloc", "VirtualAlloc"], ["VirtualAllocEx", "VirtualAllocEx"], ["VirtualFree", "VirtualFree"], ["VirtualFreeEx", "VirtualFreeEx"], ["VirtualProtect", "VirtualProtect"], ["VirtualQueryEx", "VirtualQueryEx"], ["WaitForSingleObject", "WaitForSingleObject"], ["WaitNamedPipe", "WaitNamedPipeW"], ["WriteFile", "WriteFile"], ["WriteProcessMemory", "WriteProcessMemory"],
  ].map(([courseReference, guideVariant]) => ({ courseReference, guideVariant }));

  window.ILOVEOS_COURSE_API_COVERAGE = {
    sourceBasis: [
      "Modules 1 and 4-12 presentation decks",
      "OS - Hooking and Injection Textbook.docx",
      "how_to_load.docx",
      "supplied Python exercise files",
      "supplied exercise notes and study notes",
    ],
    expandedNativeVariants: nativeContracts.map((item) => item.name),
    pywin32,
    native,
  };
})();
