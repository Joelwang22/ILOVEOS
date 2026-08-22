window.ILOVEOS_REFERENCE = {
  pywin32Patterns: [
    {
      title: "Install and verify pywin32",
      summary: "Install into the same interpreter that runs the exercises, then verify imports before debugging API calls.",
      code: `py -m pip install --upgrade pywin32
py -c "import win32api, win32process, win32security; print(win32api.GetCurrentProcessId())"`
    },
    {
      title: "Always close owned handles",
      summary: "A successful Create* or Open* call usually gives you a kernel handle. Close every handle you own in a finally block.",
      code: `handle = None
try:
    handle = win32api.OpenProcess(access, False, pid)
    # Use the process handle.
finally:
    if handle is not None:
        win32api.CloseHandle(handle)`
    },
    {
      title: "Read pywintypes.error",
      summary: "Most failed pywin32 calls raise pywintypes.error. The exception carries the numeric Win32 error, function name, and readable message.",
      code: `try:
    handle = win32api.OpenProcess(access, False, pid)
except pywintypes.error as exc:
    code, function, message = exc.args
    print(f"{function} failed ({code}): {message}")`
    },
    {
      title: "Access rights are requests, not decoration",
      summary: "Ask for the minimum rights needed. OpenProcess, OpenProcessToken, OpenService, and named-object APIs fail when the requested mask exceeds your authority.",
      code: `access = win32con.PROCESS_QUERY_LIMITED_INFORMATION
process = win32api.OpenProcess(access, False, pid)`
    },
    {
      title: "Use pywin32 first, ctypes for the missing edge",
      summary: "Prefer a pywin32 wrapper when it exists. For an uncovered API, load the Unicode function with WinDLL, declare argtypes/restype, preserve last-error, and model structures exactly.",
      code: `kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
query = kernel32.VirtualQueryEx
query.argtypes = [wintypes.HANDLE, ctypes.c_void_p,
                  ctypes.POINTER(MEMORY_BASIC_INFORMATION), ctypes.c_size_t]
query.restype = ctypes.c_size_t`
    },
    {
      title: "Constants live beside the wrapper",
      summary: "Function wrappers and constants are often split. Expect to combine win32process or win32file with win32con, win32event constants, and winerror codes.",
      code: `access = win32con.GENERIC_READ | win32con.GENERIC_WRITE
handle = win32file.CreateFile(path, access, 0, None,
                              win32con.OPEN_EXISTING, 0, None)`
    }
  ],

  pywin32Modules: [
    {
      name: "winreg",
      category: "Management",
      label: "Typed Windows Registry access from Python's standard library",
      description: "The standard Python wrapper for Registry keys and values. It is not part of pywin32, but it exposes the same handle, access-mask, value-type, and 32-bit or 64-bit view decisions used throughout the Windows management lessons.",
      useWhen: "You need to open, query, enumerate, create, update, or remove a precisely scoped Registry key or value from Python.",
      course: "Windows management · WoW64 · Security",
      constants: ["HKEY_* roots", "KEY_* access", "KEY_WOW64_32KEY", "KEY_WOW64_64KEY", "REG_* types"],
      features: [
        { name: "OpenKey", task: "Open an existing Registry key", detail: "Supply a root, subkey, reserved zero, and desired access. It does not create a missing key and returns an owned PyHKEY." },
        { name: "CreateKeyEx", task: "Create or open a Registry key", detail: "Use only when creation is intended. A typo can otherwise become persistent configuration instead of an expected missing-key error." },
        { name: "CloseKey", task: "Close an opened Registry key", detail: "Prefer a with block for PyHKEY ownership, or close exactly once when explicit lifetime is needed." },
        { name: "QueryValueEx", task: "Read one named value and its type", detail: "Returns a pair of data and REG_* type. Keep both for correct interpretation and reversible writes." },
        { name: "SetValueEx", task: "Write typed data to one value", detail: "Pass the value name separately from the key path and preserve the expected REG_* type." },
        { name: "DeleteValue", task: "Remove one named value", detail: "Delete only an exact value you own or are restoring. This does not delete the containing key." },
        { name: "DeleteKey", task: "Delete one Registry key", detail: "The key must meet deletion rules. Avoid recursive deletion and verify the exact lab target first." },
        { name: "EnumKey", task: "Enumerate subkey names by index", detail: "Advance from index zero until the documented no-more-data result and tolerate concurrent changes." },
        { name: "EnumValue", task: "Enumerate value name, data, and type", detail: "Preserve all three fields and do not assume enumeration order is stable." },
        { name: "QueryInfoKey", task: "Read subkey/value counts and last-write time", detail: "Useful for bounded enumeration, though the key can still change after the query." },
        { name: "KEY_WOW64_32KEY", task: "Select the 32-bit Registry view", detail: "Combine with KEY_READ, KEY_QUERY_VALUE, or another base mask where the selected key is redirected." },
        { name: "KEY_WOW64_64KEY", task: "Select the 64-bit Registry view", detail: "Use explicitly when a tool must not depend on the Python interpreter's default architecture view." }
      ]
    },
    {
      name: "win32api",
      category: "Core",
      label: "Handles, processes, DLLs, and general OS utilities",
      description: "The general-purpose Win32 drawer. It contains common handle, process, module, environment, identity, and system operations that do not belong to a narrower wrapper.",
      useWhen: "You need to open a process, manage a handle, inspect the current machine or user, or load and query a DLL.",
      course: "Foundations · Processes · Memory · Linking · IPC · Security",
      constants: ["PROCESS_* access masks", "HANDLE_FLAG_INHERIT", "STD_*_HANDLE", "FORMAT_MESSAGE_*"],
      features: [
        { name: "GetCurrentProcess", task: "Get the current-process pseudo-handle", detail: "Returns a special handle valid in the current process. Do not close this pseudo-handle." },
        { name: "GetCurrentProcessId", task: "Get this process's PID", detail: "Use it to correlate Python output with Process Explorer or Process Monitor." },
        { name: "GetCurrentThreadId", task: "Get the calling thread's TID", detail: "Useful when correlating a Python worker with a captured thread or stack." },
        { name: "OpenProcess", task: "Open another process by PID", detail: "Arguments are desired access, inherit flag, and PID. Request only the rights required by the next operation." },
        { name: "CloseHandle", task: "Release a kernel handle", detail: "Call once for every owned process, thread, file, pipe, event, mutex, semaphore, or token handle." },
        { name: "DuplicateHandle", task: "Create another handle to the same object", detail: "Can duplicate across processes, alter rights, or make an inheritable copy when permissions allow." },
        { name: "GetHandleInformation", task: "Read handle inheritance/protection flags", detail: "Returns flags such as HANDLE_FLAG_INHERIT and HANDLE_FLAG_PROTECT_FROM_CLOSE." },
        { name: "SetHandleInformation", task: "Change handle inheritance flags", detail: "Essential in redirected-child pipelines: make only the intended pipe ends inheritable." },
        { name: "GetStdHandle", task: "Get stdin, stdout, or stderr handles", detail: "Pass STD_INPUT_HANDLE, STD_OUTPUT_HANDLE, or STD_ERROR_HANDLE; useful when preserving inherited console streams." },
        { name: "GetUserName", task: "Get the current account name", detail: "Returns the user associated with the calling security context." },
        { name: "GetComputerName", task: "Get the local computer name", detail: "Useful for lab output and remote-management context." },
        { name: "GetEnvironmentVariable", task: "Read one environment variable", detail: "Pass the variable name and receive its string value. Treat a missing variable as an expected lookup outcome rather than assuming every process has the same environment." },
        { name: "QueryDosDevice", task: "Translate a DOS device name", detail: "Resolve names such as C: to the underlying NT device path. This demonstrates that familiar drive letters are links in a namespace, not kernel storage-device names." },
        { name: "GetSystemInfo", task: "Inspect processor and address information", detail: "Returns architecture-related system information as seen by the calling process." },
        { name: "GetNativeSystemInfo", task: "Inspect the native host architecture", detail: "Prefer this when a 32-bit process under WoW64 must identify the real 64-bit host." },
        { name: "GetModuleHandle", task: "Find an already loaded DLL", detail: "Returns the module handle/base address without loading another reference." },
        { name: "LoadLibrary", task: "Load a DLL into the current process", detail: "Returns a module handle. Use GetProcAddress for exports and release owned references when appropriate." },
        { name: "FreeLibrary", task: "Release a LoadLibrary reference", detail: "Decrements the module reference count; unloading while code is active can crash the process." },
        { name: "GetProcAddress", task: "Resolve an exported DLL function", detail: "Accepts a module handle and export name or ordinal and returns the callable address." },
        { name: "GetModuleFileName", task: "Resolve a module handle to its file", detail: "With a null/current module handle, returns the current executable path." },
        { name: "FormatMessage", task: "Turn a Win32 error code into text", detail: "Useful when an API returns a status code rather than raising pywintypes.error." },
        { name: "ShellExecute", task: "Ask the Windows shell to open or run something", detail: "Uses file associations and verbs such as open or runas; it is not a replacement for controlled CreateProcess use." }
      ]
    },
    {
      name: "win32process",
      category: "Processes",
      label: "Process, thread, module, scheduling, and remote-memory APIs",
      description: "The main process-and-thread wrapper. It covers creation, enumeration, priorities, affinity, timing, memory statistics, modules, remote memory, and thread control.",
      useWhen: "The task starts, inspects, schedules, waits for, or manipulates a process or thread.",
      course: "Processes · Threads · Memory · Linking · Security · Injection",
      constants: ["CREATE_* flags", "STARTF_* flags", "priority classes", "LIST_MODULES_*"],
      features: [
        { name: "STARTUPINFO", task: "Describe child startup and standard handles", detail: "Set dwFlags and hStdInput/hStdOutput/hStdError for redirected IPC; combine with inheritable handles." },
        { name: "CreateProcess", task: "Create a process and its primary thread", detail: "Returns process handle, thread handle, PID, and TID. Close both handles after use." },
        { name: "CreateProcessAsUser", task: "Create a process under a primary token", detail: "Requires a suitable primary token, environment/profile decisions, and often SeAssignPrimaryTokenPrivilege or SeIncreaseQuotaPrivilege." },
        { name: "EnumProcesses", task: "List running PIDs", detail: "Returns process identifiers; processes may exit before you can open them, so handle races gracefully." },
        { name: "EnumProcessModules", task: "List modules loaded in a process", detail: "Requires an appropriate process handle and may be affected by 32/64-bit architecture differences." },
        { name: "EnumProcessModulesEx", task: "Choose 32-bit, 64-bit, or all modules", detail: "Use LIST_MODULES_32BIT, LIST_MODULES_64BIT, or LIST_MODULES_ALL for WoW64-aware inspection." },
        { name: "GetModuleFileNameEx", task: "Get a remote module's path", detail: "Pass the target process handle and module handle returned by module enumeration." },
        { name: "GetProcessMemoryInfo", task: "Read working-set and private-memory counters", detail: "Returns a dictionary based on PROCESS_MEMORY_COUNTERS; this is statistics, not a region map." },
        { name: "GetProcessTimes", task: "Read process creation and CPU times", detail: "Kernel and user time values let you compare CPU consumption between experiments." },
        { name: "GetThreadTimes", task: "Read one thread's creation and CPU times", detail: "Pass an open thread handle. The returned creation, exit, kernel, and user times describe that thread, not the whole process." },
        { name: "GetProcessIoCounters", task: "Read process I/O counters", detail: "Returns operation and transfer counts for read, write, and other I/O." },
        { name: "GetExitCodeProcess", task: "Test whether a process has ended", detail: "STILL_ACTIVE means it is still running; a process handle is also waitable with win32event." },
        { name: "GetPriorityClass", task: "Read a process priority class", detail: "Combine with thread priority to reason about the effective scheduler priority." },
        { name: "SetPriorityClass", task: "Change a process priority class", detail: "Use cautiously; REALTIME_PRIORITY_CLASS can make a system unresponsive." },
        { name: "GetThreadPriority", task: "Read a thread's relative priority", detail: "Returns a THREAD_PRIORITY_* value relative to the process priority class." },
        { name: "SetThreadPriority", task: "Change a thread's relative priority", detail: "Use for controlled scheduling experiments, then restore the original value." },
        { name: "GetProcessAffinityMask", task: "Read allowed and system CPU masks", detail: "Useful for understanding which logical processors a process may use." },
        { name: "SetProcessAffinityMask", task: "Restrict a process to selected CPUs", detail: "Useful for controlled single-core scheduling experiments; use a valid subset of the system mask." },
        { name: "SuspendThread", task: "Increment a thread's suspend count", detail: "The thread stops when its suspend count is nonzero. Suspending arbitrary threads can deadlock a process." },
        { name: "ResumeThread", task: "Decrement a thread's suspend count", detail: "Execution resumes only when the count reaches zero." },
        { name: "TerminateProcess", task: "Force a process to end", detail: "Skips orderly application cleanup. Prefer cooperative shutdown and use this only in controlled cases." },
        { name: "VirtualAllocEx", task: "Reserve or commit pages in another process", detail: "Requires PROCESS_VM_OPERATION; specify allocation type and page protection deliberately." },
        { name: "VirtualFreeEx", task: "Release remote-process virtual memory", detail: "Match the free type to how the region was allocated and do not free memory still in use." },
        { name: "ReadProcessMemory", task: "Read bytes from another process", detail: "Requires PROCESS_VM_READ and a readable committed address range." },
        { name: "WriteProcessMemory", task: "Write bytes into another process", detail: "Requires PROCESS_VM_WRITE and PROCESS_VM_OPERATION; only use against purpose-built lab processes." },
        { name: "CreateRemoteThread", task: "Start a thread in another process", detail: "Advanced injection primitive requiring compatible architecture, a valid remote start address, and strict lab isolation." },
        { name: "IsWow64Process", task: "Detect a 32-bit process on 64-bit Windows", detail: "Use during module, address-size, and redirection investigations." }
      ]
    },
    {
      name: "win32event",
      category: "Synchronisation",
      label: "Events, mutexes, semaphores, timers, and wait functions",
      description: "Windows waitable-object coordination. The module name says event, but it also owns mutexes, semaphores, waitable timers, and single/multiple-object waits.",
      useWhen: "A thread or process needs to wait, signal, limit concurrency, or acquire exclusive ownership.",
      course: "Processes · Synchronisation · IPC",
      constants: ["INFINITE", "WAIT_OBJECT_0", "WAIT_TIMEOUT", "WAIT_ABANDONED", "EVENT_* access"],
      features: [
        { name: "CreateEvent", task: "Create or open a manual/auto-reset event", detail: "Choose reset mode and initial state. A name lets unrelated processes open the same event." },
        { name: "OpenEvent", task: "Open an existing named event", detail: "Request SYNCHRONIZE to wait and EVENT_MODIFY_STATE to set/reset it." },
        { name: "SetEvent", task: "Signal an event", detail: "Manual-reset events stay signaled until reset; auto-reset events release one waiter and reset automatically." },
        { name: "ResetEvent", task: "Return an event to nonsignaled", detail: "Normally used with manual-reset events after the released work has been coordinated." },
        { name: "CreateMutex", task: "Create or open a mutex", detail: "A mutex provides exclusive ownership and may be named for cross-process use." },
        { name: "OpenMutex", task: "Open an existing named mutex", detail: "Request SYNCHRONIZE to wait and MUTEX_MODIFY_STATE to release ownership." },
        { name: "ReleaseMutex", task: "Release mutex ownership", detail: "Only the owning thread may release it; pair acquisition and release with try/finally." },
        { name: "CreateSemaphore", task: "Create a counted gate", detail: "Initial count is current availability; maximum count is the hard capacity." },
        { name: "OpenSemaphore", task: "Open a named semaphore", detail: "Allows independent processes to share the same concurrency limit." },
        { name: "ReleaseSemaphore", task: "Return one or more semaphore slots", detail: "Never release more slots than were acquired; exceeding maximum count fails." },
        { name: "WaitForSingleObject", task: "Wait for one waitable handle", detail: "Check the result explicitly: WAIT_OBJECT_0, WAIT_TIMEOUT, or WAIT_ABANDONED for a mutex." },
        { name: "WaitForMultipleObjects", task: "Wait for any or all handles", detail: "The result encodes which object fired when waiting for any; Windows limits the number of handles." },
        { name: "CreateWaitableTimer", task: "Create a kernel timer object", detail: "A timer becomes signaled at a due time and can optionally repeat." },
        { name: "SetWaitableTimer", task: "Arm a waitable timer", detail: "Supports relative/absolute due times and periodic intervals." },
        { name: "WaitForInputIdle", task: "Wait for a GUI process to reach an input-ready state", detail: "Useful after CreateProcess when automation depends on the target message queue." }
      ]
    },
    {
      name: "win32file",
      category: "Files and I/O",
      label: "Handle-based files, pipes, devices, directories, and overlapped I/O",
      description: "The low-level Windows I/O wrapper. A 'file' handle may actually represent a disk file, named pipe, console, device, directory notification, or other kernel object.",
      useWhen: "You need CreateFile semantics, handle-based reads/writes, device control, asynchronous I/O, file metadata, or directory change notifications.",
      course: "Processes · Memory · Management · IPC",
      constants: ["GENERIC_*", "FILE_SHARE_*", "CREATE_*/OPEN_*", "FILE_FLAG_*", "FILE_ATTRIBUTE_*"],
      features: [
        { name: "CreateFile", task: "Open a file, pipe, volume, or device", detail: "Supply access, sharing, security attributes, creation disposition, flags, and optional template handle." },
        { name: "ReadFile", task: "Read bytes from a handle", detail: "Returns a status and bytes. ERROR_BROKEN_PIPE normally means the writer closed its end after all data was read." },
        { name: "WriteFile", task: "Write bytes to a handle", detail: "Encode text explicitly. A successful result reports the number of bytes written." },
        { name: "FlushFileBuffers", task: "Push buffered data through a handle", detail: "For files it requests storage flush; for pipes it waits for the client to consume buffered data and can block." },
        { name: "GetFileInformationByHandle", task: "Inspect an open file object", detail: "Returns volume serial, file index, timestamps, size, links, and attributes." },
        { name: "GetFinalPathNameByHandle", task: "Resolve the path behind an open handle", detail: "Useful when a file was opened through a link or alternate path." },
        { name: "GetFileSize", task: "Read the size through an open handle", detail: "Appropriate when you already own the handle and want the object's current size." },
        { name: "GetFileTime", task: "Read creation/access/write times", detail: "Returns Windows time objects for the open file." },
        { name: "SetFilePointer", task: "Move a synchronous file position", detail: "Controls where the next non-overlapped read or write occurs." },
        { name: "SetEndOfFile", task: "Truncate or extend at the current pointer", detail: "Move the file pointer first; extending creates a larger logical file." },
        { name: "GetFileAttributes", task: "Read path attributes", detail: "Reports directory, hidden, read-only, reparse-point, and other FILE_ATTRIBUTE_* flags." },
        { name: "SetFileAttributes", task: "Change path attributes", detail: "Set the complete desired attribute mask rather than assuming it only adds one flag." },
        { name: "FindFilesIterator", task: "Enumerate directory entries lazily", detail: "Avoids building a large in-memory list for directories with many entries." },
        { name: "FindStreams", task: "List alternate data streams", detail: "Enumerates named NTFS streams attached to a file." },
        { name: "FindFirstChangeNotification", task: "Create a waitable directory-change notification", detail: "Pair with a wait function and FindNextChangeNotification to continue watching." },
        { name: "ReadDirectoryChangesW", task: "Receive detailed directory changes", detail: "Reports names and actions and supports subtree and overlapped operation." },
        { name: "DeviceIoControl", task: "Send a control code to a driver/device", detail: "Buffers and control codes are device-specific; incorrect calls can have system-wide effects." },
        { name: "GetOverlappedResult", task: "Finish an asynchronous I/O request", detail: "Use with a pywintypes.OVERLAPPED object after its event signals." },
        { name: "Wow64DisableWow64FsRedirection", task: "Temporarily disable 32-bit path redirection", detail: "Keep the scope extremely short and always restore with Wow64RevertWow64FsRedirection." },
        { name: "QueryDosDevice", task: "Translate DOS device names", detail: "Maps drive letters and other DOS names to NT device paths." }
      ]
    },
    {
      name: "win32pipe",
      category: "IPC",
      label: "Anonymous pipes and named-pipe servers/clients",
      description: "Creates and configures pipes. Pipe handles are normally read and written with win32file, waited on with win32event, and secured with win32security.",
      useWhen: "You are redirecting a child's standard streams or building a named-pipe protocol between processes.",
      course: "Inter-process communication · Synchronisation",
      constants: ["PIPE_ACCESS_*", "PIPE_TYPE_*", "PIPE_READMODE_*", "PIPE_WAIT/PIPE_NOWAIT", "PIPE_UNLIMITED_INSTANCES"],
      features: [
        { name: "CreatePipe", task: "Create an anonymous read/write pair", detail: "Returns read and write handles. Configure inheritance before passing selected ends to children." },
        { name: "CreateNamedPipe", task: "Create a named-pipe server instance", detail: "Choose direction, byte/message type, read mode, blocking mode, instance count, buffers, timeout, and security." },
        { name: "ConnectNamedPipe", task: "Wait for a client to connect", detail: "ERROR_PIPE_CONNECTED can be a successful race where the client connected before this call." },
        { name: "DisconnectNamedPipe", task: "Detach the current client", detail: "Allows a server instance to be reused for another connection after outstanding work completes." },
        { name: "WaitNamedPipe", task: "Wait for an available server instance", detail: "Client-side readiness check; a successful wait does not guarantee another client cannot win the race." },
        { name: "SetNamedPipeHandleState", task: "Change read mode or blocking behaviour", detail: "Clients of message-type pipes often switch to PIPE_READMODE_MESSAGE after opening with CreateFile." },
        { name: "GetNamedPipeHandleState", task: "Inspect pipe mode and state", detail: "Can return read mode, current instances, collection settings, and server/user details." },
        { name: "GetNamedPipeInfo", task: "Inspect type, buffers, and instance limit", detail: "Use PIPE_TYPE_MESSAGE to determine whether message read mode is valid." },
        { name: "PeekNamedPipe", task: "Inspect available data without consuming it", detail: "Useful for diagnostics, not as a substitute for correct blocking/protocol design." },
        { name: "CallNamedPipe", task: "Perform a one-shot request/response", detail: "Convenience API that opens, writes, reads, and closes a named pipe transaction." },
        { name: "TransactNamedPipe", task: "Write a request and read a response atomically", detail: "Works on a connected duplex message pipe and is well suited to request/response protocols." },
        { name: "GetNamedPipeClientProcessId", task: "Identify the connected client PID", detail: "Server-side attribution helper; do not treat PID alone as authentication." },
        { name: "GetNamedPipeServerProcessId", task: "Identify the server PID", detail: "Client-side diagnostic useful when correlating a pipe with Process Explorer." }
      ]
    },
    {
      name: "win32security",
      category: "Security",
      label: "Tokens, SIDs, ACLs, privileges, impersonation, and access checks",
      description: "The central Windows security wrapper. It exposes identities, access tokens, security descriptors, discretionary ACLs, privileges, impersonation, and LSA-related operations.",
      useWhen: "You need to know who code represents, what rights it has, why access succeeds or fails, or how an object's security is configured.",
      course: "Handles · Services · Windows security · IPC",
      constants: ["TOKEN_* access", "TOKEN_ASSIGN_PRIMARY", "Token* information classes", "SecurityImpersonation", "SE_ASSIGNPRIMARYTOKEN_NAME", "SE_INCREASE_QUOTA_NAME", "SE_* privilege names", "OWNER/GROUP/DACL/SACL_SECURITY_INFORMATION"],
      features: [
        { name: "OpenProcessToken", task: "Open a process access token", detail: "Request TOKEN_QUERY to inspect, TOKEN_ADJUST_PRIVILEGES to change privilege state, or TOKEN_DUPLICATE to copy." },
        { name: "OpenThreadToken", task: "Open a thread impersonation token", detail: "Fails with ERROR_NO_TOKEN when the thread is using only its process token." },
        { name: "GetTokenInformation", task: "Read token user, groups, privileges, type, elevation, or integrity", detail: "Choose the Token* information class and interpret the returned structure accordingly." },
        { name: "TokenElevationType", task: "Select linked-token elevation information", detail: "Use with GetTokenInformation to distinguish Default, Full, and Limited elevation contexts where UAC linkage applies." },
        { name: "TokenIntegrityLevel", task: "Select the token mandatory label", detail: "Use with GetTokenInformation and interpret the returned SID's final RID as an integrity level." },
        { name: "LookupAccountName", task: "Resolve account name to SID", detail: "Returns SID, domain, and SID type." },
        { name: "LookupAccountSid", task: "Resolve SID to account name", detail: "Returns account, domain, and SID type; some SIDs may not resolve locally." },
        { name: "ConvertSidToStringSid", task: "Make a SID readable", detail: "Converts PySID to canonical text such as S-1-5-18." },
        { name: "ConvertStringSidToSid", task: "Parse a textual SID", detail: "Creates a PySID suitable for ACL and membership operations." },
        { name: "CreateWellKnownSid", task: "Create a built-in SID", detail: "Builds identities such as Everyone or Administrators without hard-coding binary SID data." },
        { name: "CheckTokenMembership", task: "Test whether a SID is enabled in a token", detail: "Useful for group membership checks; consider UAC filtered tokens and deny-only groups." },
        { name: "MapGenericMask", task: "Expand generic rights for an object type", detail: "Map GENERIC_READ, WRITE, EXECUTE, and ALL through the correct file, process, service, Registry, or other object contract." },
        { name: "LookupPrivilegeValue", task: "Resolve a privilege name to its LUID", detail: "Use before AdjustTokenPrivileges." },
        { name: "LookupPrivilegeName", task: "Resolve a privilege LUID to its name", detail: "Use when turning TokenPrivileges entries into readable names while retaining the raw LUID and attributes." },
        { name: "AdjustTokenPrivileges", task: "Enable or disable token privileges", detail: "A successful call can still report ERROR_NOT_ALL_ASSIGNED; possession and enabled state are different." },
        { name: "DuplicateTokenEx", task: "Create primary or impersonation token copies", detail: "Specify impersonation level, desired access, token attributes, and TokenPrimary/TokenImpersonation." },
        { name: "CreateRestrictedToken", task: "Create a reduced-authority token", detail: "Can disable SIDs, remove privileges, and add restricting SIDs for least-privilege execution." },
        { name: "ImpersonateLoggedOnUser", task: "Adopt another token on the current thread", detail: "Always pair with RevertToSelf in finally; avoid doing unrelated work while impersonating." },
        { name: "ImpersonateNamedPipeClient", task: "Adopt a connected pipe client's context", detail: "Server-side operation; authenticate the protocol and revert promptly." },
        { name: "RevertToSelf", task: "Stop thread impersonation", detail: "Security-critical cleanup that belongs in a finally block." },
        { name: "GetNamedSecurityInfo", task: "Read a named object's security descriptor", detail: "Supports files, Registry keys, services, printers, shares, and other SE_OBJECT_TYPE values." },
        { name: "SetNamedSecurityInfo", task: "Update a named object's owner/group/DACL/SACL", detail: "Requires different rights or privileges depending on which security information is changed." },
        { name: "GetSecurityInfo", task: "Read security through an existing handle", detail: "Use when you already opened the object and want handle-specific security semantics." },
        { name: "SetSecurityInfo", task: "Update security through a handle", detail: "Pass only the OWNER/GROUP/DACL/SACL fields indicated by the information flags." },
        { name: "GetFileSecurity", task: "Read a file or directory security descriptor", detail: "Convenience API for file paths; GetNamedSecurityInfo is more general." },
        { name: "ACL", task: "Create and edit a discretionary/system ACL", detail: "Add allow/deny/audit ACEs deliberately and preserve canonical deny-before-allow ordering." },
        { name: "SECURITY_ATTRIBUTES", task: "Set inheritance and an optional security descriptor", detail: "Used when creating pipes and other objects that need inheritable handles or explicit security." },
        { name: "SECURITY_DESCRIPTOR", task: "Create or inspect a security descriptor", detail: "Contains owner, group, DACL, SACL, and control information." },
        { name: "GetSecurityDescriptorDacl", task: "Read DACL presence and content", detail: "Distinguish a null DACL from a present empty ACL and from data the caller did not request." },
        { name: "GetAce", task: "Read one ACE by index", detail: "Interpret the returned tuple by ACE type and retain order, flags, raw mask, and SID." },
        { name: "ConvertSecurityDescriptorToStringSecurityDescriptor", task: "Render a descriptor as SDDL", detail: "Useful for readable diagnostics, comparison, and storing a security template." },
        { name: "LogonUser", task: "Obtain a token from credentials", detail: "Logon type changes network credential and caching behaviour; never embed passwords in source." },
        { name: "LsaEnumerateLogonSessions", task: "List logon session identifiers", detail: "Pair with LsaGetLogonSessionData to inspect session metadata." },
        { name: "LsaGetLogonSessionData", task: "Inspect one logon session", detail: "Returns identity, authentication package, logon type, time, and related data when permitted." }
      ]
    },
    {
      name: "win32service",
      category: "Management",
      label: "Low-level Service Control Manager operations",
      description: "Direct access to the Service Control Manager database and service handles. This is the right layer for understanding SCM access rights, status structures, configuration, and controls.",
      useWhen: "You need exact control over enumeration, configuration, creation, start/stop, status, dependencies, or service security.",
      course: "Windows management · Security",
      constants: ["SC_MANAGER_*", "SERVICE_* access", "SERVICE_CONTROL_*", "SERVICE_* state/start/type"],
      features: [
        { name: "OpenSCManager", task: "Open the local or remote SCM database", detail: "Request SC_MANAGER_CONNECT for ordinary opens or broader rights only for enumeration/creation." },
        { name: "CloseServiceHandle", task: "Close SCM or service handles", detail: "Use this specific closer rather than assuming every service handle is an ordinary CloseHandle target." },
        { name: "EnumServicesStatusEx", task: "Enumerate services with process IDs", detail: "Filter by service type/state and inspect extended status records." },
        { name: "OpenService", task: "Open one service by internal name", detail: "The display name may differ; request SERVICE_QUERY_STATUS, SERVICE_START, SERVICE_STOP, etc. as needed." },
        { name: "QueryServiceStatusEx", task: "Read state, PID, controls, and exit information", detail: "Prefer extended status when you need the service process identifier." },
        { name: "QueryServiceConfig", task: "Read executable, account, start type, and dependencies", detail: "Useful for explaining how a service is configured rather than merely whether it is running." },
        { name: "QueryServiceConfig2", task: "Read advanced service configuration", detail: "Includes description, failure actions, delayed start, SID type, and other level-specific data." },
        { name: "StartService", task: "Request service startup", detail: "Startup is asynchronous; poll status/checkpoint/wait-hint rather than assuming immediate running state." },
        { name: "ControlService", task: "Send stop, pause, continue, or custom control", detail: "The service must advertise support for the control. Stop requests may require dependencies first." },
        { name: "EnumDependentServices", task: "List services that depend on a service", detail: "Use before stopping or deleting a service to understand impact." },
        { name: "CreateService", task: "Register a service", detail: "Creates configuration in the SCM database; it does not by itself make an arbitrary script a correct service process." },
        { name: "DeleteService", task: "Mark a service record for deletion", detail: "Deletion completes only after all open handles close and the service stops." },
        { name: "ChangeServiceConfig", task: "Change core service configuration", detail: "Can modify start type, image path, account, display name, and dependencies." },
        { name: "QueryServiceObjectSecurity", task: "Read a service security descriptor", detail: "Use to explain who can start, stop, reconfigure, or delete a service." },
        { name: "SetServiceObjectSecurity", task: "Change service permissions", detail: "High-impact operation; preserve required ACEs and test only on a disposable lab service." },
        { name: "GetServiceKeyName", task: "Convert display name to internal service name", detail: "SCM API calls generally use the internal key name." },
        { name: "GetServiceDisplayName", task: "Convert internal name to display name", detail: "Useful when presenting enumeration results to a human." }
      ]
    },
    {
      name: "win32serviceutil",
      category: "Management",
      label: "Convenient service helpers and Python service base class",
      description: "A higher-level convenience layer over win32service. It reduces boilerplate for ordinary service control and provides ServiceFramework for implementing a proper Python Windows service.",
      useWhen: "You want the practical service-administration path or need to implement a Python service without manually writing the dispatcher plumbing.",
      course: "Windows management",
      constants: ["ServiceFramework", "command-line service actions"],
      features: [
        { name: "StartService", task: "Start by service name", detail: "Convenience wrapper that opens the SCM/service and issues the start request." },
        { name: "StopService", task: "Stop by service name", detail: "Convenience wrapper; stopping remains asynchronous." },
        { name: "RestartService", task: "Stop and start a service", detail: "Useful for labs, but consider dependencies and recovery policies." },
        { name: "QueryServiceStatus", task: "Read current service status", detail: "Returns the standard status tuple without manual handle management." },
        { name: "ServiceFramework", task: "Implement a Python service", detail: "Subclass it, define _svc_name_/_svc_display_name_, and implement SvcDoRun and SvcStop." },
        { name: "HandleCommandLine", task: "Install/remove/debug a Python service from CLI", detail: "Processes commands such as install, start, stop, remove, update, and debug for a ServiceFramework subclass." },
        { name: "LocateSpecificServiceExe", task: "Locate the pywin32 service host executable", detail: "Used internally/diagnostically when installing Python-based services." }
      ]
    },
    {
      name: "pywintypes",
      category: "Core",
      label: "Shared Windows objects, structures, and exceptions",
      description: "The common type layer beneath pywin32. Most code encounters it through returned handles, times, SIDs, security structures, OVERLAPPED state, and exceptions.",
      useWhen: "A wrapper returns a specialised Windows value or you need to construct security/overlapped types shared across modules.",
      course: "Used throughout every practical module",
      constants: ["PyHANDLE lifecycle", "Windows time values", "GUID/IID values"],
      features: [
        { name: "error", task: "Catch Win32 API failures", detail: "Exception arguments normally contain error code, failing function, and system message." },
        { name: "HANDLE / PyHANDLE", task: "Represent a Windows handle", detail: "Treat it as opaque. It may support Close(), but explicit module-appropriate cleanup is clearest in teaching code." },
        { name: "OVERLAPPED", task: "Track asynchronous I/O", detail: "Holds offsets and an event handle used by overlapped ReadFile/WriteFile and completion APIs." },
        { name: "SECURITY_ATTRIBUTES", task: "Describe security and inheritance at object creation", detail: "Also exposed through win32security; bInheritHandle is central to child-process pipe labs." },
        { name: "SECURITY_DESCRIPTOR", task: "Represent owner/group/DACL/SACL", detail: "Used by security APIs and SECURITY_ATTRIBUTES." },
        { name: "SID", task: "Represent a binary security identifier", detail: "Convert to text with win32security.ConvertSidToStringSid for display." },
        { name: "Time", task: "Represent Windows date/time values", detail: "Returned by many file, process, and event-log APIs." },
        { name: "IID", task: "Represent a COM interface identifier", detail: "Used when working below win32com.client's dynamic-dispatch layer." }
      ]
    },
    {
      name: "win32con",
      category: "Core",
      label: "Constants shared by Win32 wrappers",
      description: "A large constants module. It supplies access masks, creation flags, messages, file modes, process rights, standard-handle identifiers, privilege flags, and more.",
      useWhen: "A pywin32 function signature expects a numeric flag, access mask, control code, or special value.",
      course: "Used throughout",
      constants: ["PROCESS_QUERY_INFORMATION", "PROCESS_VM_READ/WRITE/OPERATION", "GENERIC_READ/WRITE", "OPEN_EXISTING", "HANDLE_FLAG_INHERIT", "STARTF_USESTDHANDLES", "CREATE_NEW_CONSOLE", "SE_PRIVILEGE_ENABLED"],
      features: [
        { name: "Access masks", task: "Combine specific object permissions", detail: "Use bitwise OR, for example TOKEN_QUERY | TOKEN_ADJUST_PRIVILEGES." },
        { name: "Process rights", task: "Choose what OpenProcess requests", detail: "Common rights include PROCESS_QUERY_LIMITED_INFORMATION, PROCESS_VM_READ, PROCESS_VM_WRITE, and PROCESS_VM_OPERATION." },
        { name: "File access and sharing", task: "Configure CreateFile", detail: "GENERIC_READ/WRITE describe access; FILE_SHARE_* controls what other opens may do." },
        { name: "Creation dispositions", task: "Choose create/open behaviour", detail: "OPEN_EXISTING, OPEN_ALWAYS, CREATE_NEW, CREATE_ALWAYS, and TRUNCATE_EXISTING have distinct data-loss semantics." },
        { name: "Handle inheritance", task: "Control child visibility", detail: "HANDLE_FLAG_INHERIT and STARTF_USESTDHANDLES are central to redirected pipelines." },
        { name: "Privilege attributes", task: "Enable or disable a token privilege", detail: "SE_PRIVILEGE_ENABLED changes state; it cannot add a privilege absent from the token." },
        { name: "Process creation flags", task: "Choose console/window/process behaviour", detail: "Examples include CREATE_NEW_CONSOLE, CREATE_NO_WINDOW, and CREATE_SUSPENDED." }
      ]
    },
    {
      name: "winerror",
      category: "Core",
      label: "Named Windows error and status codes",
      description: "Readable names for numeric Win32 results. Especially useful when APIs treat some nonzero outcomes as expected control flow rather than fatal errors.",
      useWhen: "You need to compare a returned/raised error code with a documented Windows condition.",
      course: "Files · IPC · Synchronisation · Services",
      constants: ["ERROR_BROKEN_PIPE", "ERROR_PIPE_CONNECTED", "ERROR_FILE_NOT_FOUND", "ERROR_ACCESS_DENIED", "ERROR_INSUFFICIENT_BUFFER"],
      features: [
        { name: "ERROR_BROKEN_PIPE", task: "Recognise normal pipe EOF", detail: "When all write handles close, a reader may receive this after consuming buffered data." },
        { name: "ERROR_PIPE_CONNECTED", task: "Handle the named-pipe connection race", detail: "ConnectNamedPipe can report this when a client connected just before the server waited." },
        { name: "ERROR_FILE_NOT_FOUND", task: "Recognise a missing named object or path", detail: "OpenEvent and similar APIs use file-not-found when the named kernel object does not exist." },
        { name: "ERROR_ACCESS_DENIED", task: "Recognise insufficient access", detail: "Check requested rights, object DACL, token, integrity level, elevation, and protected-process restrictions." },
        { name: "ERROR_INSUFFICIENT_BUFFER", task: "Retry a size-query API", detail: "Many Win32 APIs first report the required output size, then succeed with a correctly sized buffer." },
        { name: "ERROR_NOT_ALL_ASSIGNED", task: "Detect a missing token privilege", detail: "AdjustTokenPrivileges may otherwise look successful even though the token lacked the requested privilege." }
      ]
    },
    {
      name: "win32evtlog",
      category: "Observation",
      label: "Classic and modern Windows Event Log APIs",
      description: "Read, query, subscribe to, export, and render Windows event logs. The Evt* family is the modern channel/XML interface; classic functions remain useful for basic sequential reading.",
      useWhen: "You need durable system/application/security evidence rather than a live Procmon trace.",
      course: "Windows management · Security",
      constants: ["EVENTLOG_* read flags", "EvtQuery*", "EvtRender*", "channel paths"],
      features: [
        { name: "OpenEventLog", task: "Open a classic log", detail: "Specify server and log name such as System or Application." },
        { name: "ReadEventLog", task: "Read classic records", detail: "Use sequential/seek and forward/backward flags and continue until no records remain." },
        { name: "GetNumberOfEventLogRecords", task: "Count classic log records", detail: "Useful for bounds and progress, but the log can change during a read." },
        { name: "NotifyChangeEventLog", task: "Signal an event when a classic log changes", detail: "Combine with a win32event event handle and wait function." },
        { name: "EvtQuery", task: "Run a modern XPath query", detail: "Query a live channel or exported file and choose direction/tolerance flags." },
        { name: "EvtNext", task: "Fetch events from an EvtQuery result", detail: "Returns event handles in batches; close them when finished." },
        { name: "EvtRender", task: "Render an event as XML or values", detail: "XML exposes provider, IDs, time, process/thread, and event data fields." },
        { name: "EvtSubscribe", task: "Receive new matching events", detail: "Supports push/pull subscription patterns and bookmarks." },
        { name: "EvtCreateBookmark", task: "Create a resumable position", detail: "Persist rendered bookmark XML if a watcher must resume after restart." },
        { name: "EvtUpdateBookmark", task: "Advance a bookmark", detail: "Update only after an event has been processed successfully." },
        { name: "EvtExportLog", task: "Export matching events", detail: "Writes a channel/query subset to an EVTX archive." },
        { name: "EvtOpenSession", task: "Connect to a remote event-log service", detail: "Requires reachable services, credentials, and appropriate remote permissions." }
      ]
    },
    {
      name: "win32job",
      category: "Processes",
      label: "Job Objects for managing process groups",
      description: "Job Objects let Windows apply limits, accounting, lifecycle, and grouping rules to one or more processes.",
      useWhen: "A parent must control an entire child process tree, enforce limits, or guarantee group cleanup.",
      course: "Processes · Scheduling · Memory",
      constants: ["JobObjectExtendedLimitInformation", "JOB_OBJECT_LIMIT_*", "JobObjectBasicAccountingInformation"],
      features: [
        { name: "CreateJobObject", task: "Create or open a named/unnamed job", detail: "Returns a job handle that must remain open while you manage the group." },
        { name: "OpenJobObject", task: "Open an existing named job", detail: "Request rights matching query, assign, set, or terminate operations." },
        { name: "AssignProcessToJobObject", task: "Add a process to a job", detail: "Assignment may fail due to existing job restrictions or missing rights." },
        { name: "IsProcessInJob", task: "Test job membership", detail: "Can check membership in a specific job or whether the process belongs to any job." },
        { name: "SetInformationJobObject", task: "Set limits and behaviour", detail: "Use extended limit information for kill-on-close, memory, process-count, and CPU-related controls." },
        { name: "QueryInformationJobObject", task: "Read limits and accounting", detail: "Returns data based on the requested JobObject information class." },
        { name: "TerminateJobObject", task: "Force every associated process to end", detail: "High-impact fallback; cooperative shutdown is preferable." }
      ]
    },
    {
      name: "win32gui",
      category: "Desktop",
      label: "Windows, messages, controls, and desktop GUI state",
      description: "A wrapper around the native user-interface APIs. It works with HWND values, window enumeration, text/classes, messages, visibility, geometry, and hooks-related GUI concepts.",
      useWhen: "You need to find a native window, inspect its owning process, read properties, or send/receive Windows messages.",
      course: "Processes · Hooking",
      constants: ["WM_* messages", "SW_* show states", "GWL_* indexes"],
      features: [
        { name: "EnumWindows", task: "Enumerate top-level windows", detail: "Callback receives HWND values; filter by visibility, title, class, or owning PID." },
        { name: "EnumChildWindows", task: "Enumerate descendant controls", detail: "Useful for understanding a native dialog's control hierarchy." },
        { name: "FindWindow", task: "Find a top-level window by class/title", detail: "Exact matching is fragile; enumeration is usually better for diagnostic tools." },
        { name: "FindWindowEx", task: "Find a child/next matching window", detail: "Searches within a parent or after a previous sibling." },
        { name: "GetWindowText", task: "Read a window title", detail: "Cross-process behaviour is limited for some control text; messages may be needed." },
        { name: "GetClassName", task: "Read a window class", detail: "Class names help distinguish controls and system window types." },
        { name: "GetWindowRect", task: "Read screen coordinates", detail: "Returns left, top, right, bottom for a window." },
        { name: "IsWindowVisible", task: "Test visibility state", detail: "Visible does not guarantee the window is onscreen or unobscured." },
        { name: "ShowWindow", task: "Change show/minimise/maximise state", detail: "Uses SW_* constants; this is a request interpreted by the windowing system." },
        { name: "SendMessage", task: "Send a synchronous window message", detail: "The call waits for handling and can hang if the target is unresponsive; avoid arbitrary pointer-bearing messages cross-process." },
        { name: "PostMessage", task: "Queue an asynchronous window message", detail: "Returns after queuing and does not report the target's processing result." },
        { name: "SetForegroundWindow", task: "Request foreground activation", detail: "Windows restricts foreground stealing; failure may be policy rather than an API bug." },
        { name: "GetWindowLong", task: "Read style or window metadata", detail: "Use the pointer-sized variants/appropriate wrappers on 64-bit systems." },
        { name: "SetWindowLong", task: "Change style or callback-related metadata", detail: "Advanced operation; incorrect values can destabilise the target window." }
      ]
    },
    {
      name: "win32clipboard",
      category: "IPC",
      label: "System clipboard access",
      description: "Opens the shared desktop clipboard, enumerates formats, reads data, and publishes data in one or more formats.",
      useWhen: "Processes exchange user-mediated text, images, file lists, or custom data through the desktop clipboard.",
      course: "Inter-process communication",
      constants: ["CF_UNICODETEXT", "CF_HDROP", "CF_DIB", "registered formats"],
      features: [
        { name: "OpenClipboard", task: "Lock the clipboard for access", detail: "Keep the critical section short and always call CloseClipboard in finally." },
        { name: "CloseClipboard", task: "Release clipboard access", detail: "Failure to close blocks other applications from using the clipboard." },
        { name: "EmptyClipboard", task: "Clear current clipboard ownership/data", detail: "Call after OpenClipboard before setting replacement data." },
        { name: "GetClipboardData", task: "Read one available format", detail: "Request the format explicitly, commonly CF_UNICODETEXT." },
        { name: "SetClipboardData", task: "Publish data in a format", detail: "The value representation depends on the selected clipboard format." },
        { name: "IsClipboardFormatAvailable", task: "Check before reading", detail: "Avoid relying on one format when the producer may expose alternatives." },
        { name: "EnumClipboardFormats", task: "Discover all available formats", detail: "Iterate until zero and resolve custom names where needed." },
        { name: "RegisterClipboardFormat", task: "Create/find a custom format identifier", detail: "Processes using the same format name receive the same registered ID." },
        { name: "GetClipboardSequenceNumber", task: "Detect clipboard changes", detail: "A changed sequence means content changed, not necessarily that a particular format exists." }
      ]
    },
    {
      name: "win32cred",
      category: "Security",
      label: "Windows Credential Manager",
      description: "Read, write, enumerate, and delete credentials stored through Windows Credential Manager.",
      useWhen: "An application needs Windows-managed credential persistence instead of plaintext configuration files.",
      course: "Windows security",
      constants: ["CRED_TYPE_*", "CRED_PERSIST_*"],
      features: [
        { name: "CredRead", task: "Read a credential by target/type", detail: "Returns metadata and credential blob when the caller is authorised." },
        { name: "CredWrite", task: "Create or replace a credential", detail: "Choose target name, type, user name, persistence, attributes, and secret bytes deliberately." },
        { name: "CredDelete", task: "Delete a stored credential", detail: "Requires exact target name and credential type." },
        { name: "CredEnumerate", task: "List matching credentials", detail: "Use a filter to narrow results and avoid printing secrets." },
        { name: "CredGetSessionTypes", task: "Inspect supported persistence by type", detail: "Reports maximum persistence available for each credential type." },
        { name: "CredReadDomainCredentials", task: "Read credentials matching target information", detail: "Used for domain-oriented target matching rather than a single generic target." }
      ]
    },
    {
      name: "win32crypt",
      category: "Security",
      label: "DPAPI, certificates, and Windows cryptography helpers",
      description: "Exposes Windows data protection and selected certificate/cryptographic APIs. DPAPI is the practical choice for secrets bound to a user or machine context.",
      useWhen: "You need Windows to protect local secret bytes or you need to inspect certificate stores and encoded objects.",
      course: "Windows security",
      constants: ["CRYPTPROTECT_*", "certificate store flags", "encoding types"],
      features: [
        { name: "CryptProtectData", task: "Encrypt bytes with DPAPI", detail: "Protection is tied to the current user by default; optional entropy must be reproduced for decryption." },
        { name: "CryptUnprotectData", task: "Decrypt DPAPI-protected bytes", detail: "Requires the matching user/machine context and optional entropy." },
        { name: "CryptProtectMemory", task: "Protect memory-sized blocks through ctypes", detail: "This is a native Crypt32 API rather than a win32crypt module function. Call it through ctypes for short-lived in-memory protection, using the required block-size multiples." },
        { name: "CryptUnprotectMemory", task: "Reverse native memory protection through ctypes", detail: "This is a native Crypt32 API rather than a win32crypt module function. Use the same flags and a compatible process or logon context." },
        { name: "CertOpenSystemStore", task: "Open a certificate store", detail: "Common stores include MY, ROOT, CA, and TRUST; close the returned store." },
        { name: "CertEnumCertificatesInStore", task: "Enumerate certificates from a store object", detail: "Call this method on the PyCERTSTORE returned by CertOpenSystemStore. Inspect subject, issuer, validity, thumbprint, and usages without assuming trust." },
        { name: "CryptQueryObject", task: "Identify and decode a certificate/message object", detail: "Useful for examining signed files and encoded certificate material." }
      ]
    },
    {
      name: "win32net / win32wnet",
      category: "Networking",
      label: "Accounts, groups, shares, sessions, and network resources",
      description: "win32net wraps NetAPI management data; win32wnet wraps mapped drives and network-resource connections.",
      useWhen: "You need to enumerate local/domain accounts, shares, sessions, or connect/disconnect a UNC resource.",
      course: "Windows management · Security",
      constants: ["FILTER_* account flags", "RESOURCETYPE_*", "CONNECT_*"],
      features: [
        { name: "win32net.NetUserEnum", task: "Enumerate users", detail: "Works locally or against an authorised server/domain context and returns level-specific dictionaries." },
        { name: "win32net.NetLocalGroupEnum", task: "Enumerate local groups", detail: "Use membership APIs to connect groups to effective token SIDs." },
        { name: "win32net.NetLocalGroupGetMembers", task: "List local-group members", detail: "Different information levels return SIDs, names, or account types." },
        { name: "win32net.NetShareEnum", task: "Enumerate shares", detail: "Returns share names, types, remarks, paths, and security data by information level." },
        { name: "win32net.NetSessionEnum", task: "Enumerate active server sessions", detail: "Typically requires administrative rights on the target server." },
        { name: "win32net.NetFileEnum", task: "Enumerate remotely opened server files", detail: "Server-side view of files opened through sharing; permissions are required." },
        { name: "win32wnet.WNetAddConnection2", task: "Connect a network resource", detail: "Can map a drive or establish a UNC connection with supplied credentials/options." },
        { name: "win32wnet.WNetCancelConnection2", task: "Disconnect a mapped/network resource", detail: "Choose whether to update the persistent profile and whether to force closure." },
        { name: "win32wnet.WNetGetConnection", task: "Resolve a mapped drive to UNC", detail: "Translates a local device such as Z: to its remote path." },
        { name: "win32wnet.WNetEnumResource", task: "Enumerate network resources", detail: "Open an enumeration handle, fetch batches, and close it." }
      ]
    },
    {
      name: "win32com.client / pythoncom",
      category: "Automation",
      label: "COM automation and apartment management",
      description: "win32com.client offers high-level automation for registered COM servers; pythoncom exposes lower-level COM lifecycle, interfaces, marshalling, and HRESULT support.",
      useWhen: "You need to automate applications such as Office, query WMI through COM, or work directly with COM objects/interfaces.",
      course: "Optional Windows automation reference",
      constants: ["CLSCTX_*", "COINIT_*", "HRESULT values"],
      features: [
        { name: "win32com.client.Dispatch", task: "Create/connect to an automation object", detail: "Uses dynamic dispatch; methods and properties follow the COM type exposed by the server." },
        { name: "win32com.client.gencache.EnsureDispatch", task: "Generate/use early-bound wrappers", detail: "Provides richer constants, signatures, and IDE discoverability when a type library exists." },
        { name: "win32com.client.GetObject", task: "Bind to an existing COM object or moniker", detail: "Commonly used with WMI monikers and already-running automation servers." },
        { name: "pythoncom.CoInitialize", task: "Initialise COM on the current thread", detail: "Each thread using COM must be initialised with the correct apartment model." },
        { name: "pythoncom.CoUninitialize", task: "Release thread COM initialisation", detail: "Pair with CoInitialize when explicit thread lifecycle matters." },
        { name: "pythoncom.MakeIID", task: "Create an IID/CLSID value", detail: "Converts canonical GUID text into a COM identifier object." },
        { name: "pythoncom.com_error", task: "Catch COM failures", detail: "Carries HRESULT and extended error information; translate the code and inspect excepinfo." }
      ]
    },
    {
      name: "winreg (standard library companion)",
      category: "Management",
      label: "Registry keys and values",
      description: "Python's standard-library Registry wrapper is clearer than routing ordinary Registry work through general pywin32 functions, so it is the preferred course interface.",
      useWhen: "You need to open, enumerate, query, create, modify, or delete Registry keys and values.",
      course: "Windows management · WoW64",
      constants: ["HKEY_*", "KEY_READ/WRITE", "KEY_WOW64_32KEY/64KEY", "REG_* value types"],
      features: [
        { name: "OpenKey", task: "Open an existing key", detail: "Use a with block so the HKEY closes automatically; add explicit WOW64 view flags where relevant." },
        { name: "CreateKeyEx", task: "Create or open a key", detail: "Choose access rights rather than relying on overly broad defaults." },
        { name: "QueryValueEx", task: "Read one value and its type", detail: "Returns value data and REG_* type; do not infer type from Python value alone." },
        { name: "SetValueEx", task: "Write a typed value", detail: "Supply the correct REG_SZ, REG_DWORD, REG_BINARY, REG_MULTI_SZ, or other type." },
        { name: "EnumKey", task: "Enumerate subkey names", detail: "Increment the index until OSError indicates there are no more items." },
        { name: "EnumValue", task: "Enumerate value name/data/type tuples", detail: "Values and subkeys are separate namespaces within a key." },
        { name: "DeleteValue", task: "Delete one value", detail: "Does not delete the containing key." },
        { name: "DeleteKey", task: "Delete an empty key", detail: "Use recursive deletion only with validated, tightly scoped paths." },
        { name: "ConnectRegistry", task: "Connect to another machine's Registry service", detail: "Requires remote service/network access and suitable permissions." },
        { name: "KEY_WOW64_32KEY", task: "Explicitly select the 32-bit view", detail: "Use with desired access to investigate WoW64 Registry redirection." },
        { name: "KEY_WOW64_64KEY", task: "Explicitly select the 64-bit view", detail: "Lets a 32-bit Python process inspect the native 64-bit view when permitted." }
      ]
    },
    {
      name: "ctypes / ctypes.wintypes",
      category: "Low-level companion",
      label: "Call Win32 APIs that pywin32 does not wrap",
      description: "Python's foreign-function interface. In this course it fills deliberate gaps in pywin32 while making ABI details explicit, including types, pointers, structures, calling convention, error state, and ownership.",
      useWhen: "The required Windows API or structure is absent from pywin32, or the exercise specifically needs the native ABI boundary to be visible.",
      course: "Memory · Linking · Services · Security · Injection",
      constants: ["ctypes.WinDLL", "ctypes.WINFUNCTYPE", "ctypes.wintypes", "use_last_error=True"],
      features: [
        { name: "ctypes.WinDLL", task: "Load a Windows DLL", detail: "Uses the stdcall convention expected by Win32. Pass use_last_error=True when the function reports extended errors through GetLastError." },
        { name: "ctypes.windll", task: "Use the convenience DLL loader", detail: "Convenient for quick calls, but an explicit WinDLL object is clearer when configuring prototypes and last-error behavior." },
        { name: "function.argtypes", task: "Declare native parameter types", detail: "Set this before calling. It enables conversions and catches many pointer-width or argument-count errors before native code executes." },
        { name: "function.restype", task: "Declare the native return type", detail: "Never rely on the default c_int for handles, pointers, SIZE_T, or 64-bit values; truncation can create convincing but invalid results." },
        { name: "function.errcheck", task: "Centralize return-value validation", detail: "Attach a validator that raises WinError or transforms the native result while retaining access to the function and original arguments." },
        { name: "ctypes.get_last_error", task: "Read the thread-local Win32 error", detail: "Read immediately after a documented failure sentinel; unrelated calls can replace the value." },
        { name: "GetLastError", task: "Read a failed Win32 call's extended error code", detail: "Call only when the API contract says extended error is meaningful, and capture it before cleanup or formatting calls." },
        { name: "ctypes.GetLastError / ctypes.set_last_error", task: "Inspect or restore ctypes' saved error", detail: "Use get_last_error for normal code. GetLastError directly calls the Windows API; set_last_error is useful when preserving an error across cleanup or in controlled tests." },
        { name: "ctypes.WinError", task: "Raise a readable OSError", detail: "With no argument, uses ctypes' saved last-error value and formats the system message." },
        { name: "ctypes.Structure", task: "Model a C structure", detail: "Define _fields_ in native order with exact field types. Architecture-dependent alignment and field width must match the Windows declaration." },
        { name: "ctypes.Union", task: "Model overlapping native fields", detail: "Use for documented C unions and combine with Structure for nested layouts; do not replace a union with sequential fields." },
        { name: "ctypes.POINTER", task: "Declare a typed pointer", detail: "Use in prototypes and structure fields so ctypes knows the pointee type and level of indirection." },
        { name: "ctypes.byref", task: "Pass an object by reference", detail: "Efficiently passes a temporary pointer to an existing ctypes object for output parameters." },
        { name: "ctypes.pointer", task: "Create a persistent pointer object", detail: "Unlike byref, returns a real pointer object that can be stored or dereferenced; keep its pointee alive." },
        { name: "ctypes.sizeof", task: "Supply structure or buffer size", detail: "Many Win32 structures require cbSize/dwLength and APIs such as VirtualQueryEx need the exact buffer size." },
        { name: "ctypes.create_unicode_buffer", task: "Allocate writable UTF-16 storage", detail: "Use for Win32 W functions that fill a caller-owned string buffer; sizes are normally character counts, not bytes." },
        { name: "ctypes.create_string_buffer", task: "Allocate writable byte storage", detail: "Use for binary/ANSI output or raw memory. Account for terminators only when the API treats it as a C string." },
        { name: "ctypes.c_byte / c_char_p", task: "Model raw bytes and C byte-string pointers", detail: "Use c_byte arrays for opaque storage and c_char_p only for NUL-terminated byte strings, not arbitrary writable buffers." },
        { name: "ctypes.c_void_p / c_size_t", task: "Model addresses and native-size counts", detail: "Both follow pointer width. Use them for LPVOID/PVOID, SIZE_T, remote addresses, and byte counts rather than fixed 32-bit integers." },
        { name: "ctypes.cast", task: "Reinterpret a pointer intentionally", detail: "Useful at ABI boundaries, but it does not validate object size or lifetime; prefer typed prototypes wherever possible." },
        { name: "ctypes.WINFUNCTYPE", task: "Create a Windows callback prototype", detail: "Wrap Python callbacks passed to Enum* or hook APIs and retain a strong reference for the entire period native code may invoke them." },
        { name: "wintypes.HANDLE / LPVOID", task: "Use pointer-sized Windows types", detail: "Prefer ctypes.wintypes names and c_void_p-sized types over c_int for handles and addresses on 64-bit Windows." },
        { name: "wintypes.DWORD / BOOL", task: "Model common scalar Win32 types", detail: "BOOL success semantics and DWORD status/error codes are API-specific; consult the function's documented failure sentinel." },
        { name: "wintypes.LPCWSTR / LPWSTR", task: "Model input and output UTF-16 strings", detail: "LPCWSTR is read-only input; LPWSTR usually points to writable or API-owned text. Prefer the Unicode W API explicitly." },
        { name: "handle ownership", task: "Close native handles exactly once", detail: "A ctypes integer handle has no automatic pywin32 lifetime. Use the documented matching closer, such as CloseHandle, CloseServiceHandle, or LocalFree, in finally." },
        { name: "buffer lifetime", task: "Keep native inputs alive", detail: "Store callback, buffer, pointer, and structure objects for as long as native code may access them; a numeric address does not keep Python storage alive." },
        { name: "bitness and layout", task: "Match Python to the target ABI", detail: "Pointer size, structure layout, WOW64 behavior, and remote-process architecture affect correctness. Test x64 and x86 boundaries explicitly." },
        { name: "GetSystemInfo", task: "Read page size and allocation granularity", detail: "Fill a SYSTEM_INFO structure and keep dwPageSize separate from dwAllocationGranularity when calculating page and reservation boundaries." },
        { name: "QueryWorkingSetEx", task: "Query residency attributes for selected addresses", detail: "Pass an array of PSAPI_WORKING_SET_EX_INFORMATION entries. A successful snapshot can become stale immediately as working sets change." },
        { name: "GlobalMemoryStatusEx", task: "Read system memory and commit totals", detail: "Initialize MEMORYSTATUSEX.dwLength before the call and distinguish physical-memory availability from page-file and commit values." },
        { name: "VirtualAlloc", task: "Reserve or commit pages in the current process", detail: "Pass a null address to let Windows choose a base, use SIZE_T for size, check a null result, and match the allocation with VirtualFree." },
        { name: "VirtualFree", task: "Decommit pages or release a reservation", detail: "MEM_RELEASE requires the original allocation base and a zero size. MEM_DECOMMIT leaves the address range reserved." },
        { name: "VirtualProtect", task: "Change protection on committed pages", detail: "The range is page granular and the output DWORD receives the previous protection. Avoid writable-executable pages and restore changes when appropriate." },
        { name: "VirtualQueryEx", task: "Query a remote address-space region", detail: "Declare MEMORY_BASIC_INFORMATION, pass a process handle with PROCESS_QUERY_INFORMATION, and distinguish a zero return from valid region data." },
        { name: "CreateFileMappingW", task: "Create or open a section object", detail: "Specify file or page-file backing, maximum size, protection, security attributes, and optional name. Close the mapping handle after views no longer need its ownership." },
        { name: "OpenFileMappingW", task: "Open an existing named section", detail: "Request only the view rights required and treat a missing mapping as an expected lookup outcome when the creator is not active." },
        { name: "MapViewOfFile", task: "Map section bytes into the calling process", detail: "Choose access, section offset, and length. The returned base belongs to this process and must later be passed to UnmapViewOfFile." },
        { name: "UnmapViewOfFile", task: "Remove a mapped view", detail: "Pass the exact view base returned by MapViewOfFile. Unmapping a view and closing the section handle are separate cleanup operations." },
        { name: "HeapAlloc", task: "Allocate a block from a Windows heap", detail: "Pass the owning heap, flags, and SIZE_T byte count. A null result means no block was acquired, and the returned pointer must be freed by the same heap." },
        { name: "HeapFree", task: "Return a block to its owning heap", detail: "Use the same heap handle that produced the pointer and never mix HeapFree with VirtualFree or a language allocator." },
        { name: "GetModuleHandleW", task: "Find a module already loaded in this process", detail: "Pass a module name or null for the main executable. The ordinary call does not create a new LoadLibrary reference to release." },
        { name: "GetModuleFileNameW", task: "Resolve a module handle to its selected path", detail: "Supply a writable UTF-16 buffer and character capacity, then handle truncation explicitly. A null module selects the current executable." },
        { name: "LoadLibraryExW", task: "Load a DLL with explicit search or mapping flags", detail: "Use a trusted path or documented LOAD_LIBRARY_SEARCH_* policy, check a null HMODULE, and release an owned executable mapping with FreeLibrary." },
        { name: "SetDefaultDllDirectories", task: "Set the process default DLL search policy", detail: "Choose documented LOAD_LIBRARY_SEARCH_* flags early in process initialization. This is process-wide configuration, not a one-call path argument." },
        { name: "AddDllDirectory", task: "Add an explicit DLL search directory", detail: "The returned cookie identifies the added directory for later RemoveDllDirectory. Combine it with a safe default search policy." },
        { name: "CreateProcessW", task: "Create a process through the native ABI", detail: "Declare STARTUPINFOW and PROCESS_INFORMATION exactly, pass a mutable command-line buffer, set cb, and close both returned process/thread handles." },
        { name: "RegOpenKeyExW", task: "Open an existing Registry key through the native ABI", detail: "Pass root, subkey, options, desired access, and an output HKEY pointer, then close success with RegCloseKey." },
        { name: "AccessCheck", task: "Evaluate a descriptor through the native ABI", detail: "Current pywin32 builds do not expose this call. Declare the impersonation token, mapped access, GENERIC_MAPPING, privilege-set buffer, granted mask, and access-status outputs explicitly." },
        { name: "OpenSCManagerW", task: "Open the Service Control Manager database", detail: "Request SC_MANAGER_CONNECT for ordinary service opens, check a null SC_HANDLE, and close it with CloseServiceHandle." },
        { name: "OpenServiceW", task: "Open one service by internal name", detail: "Request only action-specific SERVICE_* rights, check a null result, and keep ownership separate from the SCM handle." },
        { name: "StartServiceW", task: "Request service startup", detail: "A nonzero BOOL means the request was accepted. Query status through pending states before reporting RUNNING." },
        { name: "ControlService", task: "Send a service control code", detail: "Pass an output SERVICE_STATUS structure and treat the immediate result separately from eventual service state." },
        { name: "QueryServiceStatusEx", task: "Read extended service status", detail: "Fill SERVICE_STATUS_PROCESS to obtain state, controls, exit codes, checkpoint, wait hint, PID, and flags." },
        { name: "CloseServiceHandle", task: "Release an SCM or service SC_HANDLE", detail: "Use this matching closer exactly once for each successful OpenSCManagerW or OpenServiceW result." },
        { name: "IsWow64Process2", task: "Identify process and native machine types", detail: "More precise than a single WoW64 Boolean for x86, x64, ARM64, and compatibility combinations." },
        { name: "OpenSCManagerW / OpenServiceW", task: "Open service-control handles", detail: "Request only the SCM/service rights needed, test null handles, raise from last error, and close each with CloseServiceHandle." },
        { name: "StartServiceW / ControlService", task: "Start or control a Windows service", detail: "Declare argument and SERVICE_STATUS pointer types precisely; state transitions are asynchronous, so query/wait rather than assuming completion." }
      ]
    }
  ],

  sysinternalsTools: [
    {
      name: "Process Explorer",
      exe: "procexp.exe / procexp64.exe",
      category: "Processes",
      short: "Live process, thread, handle, DLL, token, and resource inspection",
      description: "The primary live-system viewer for this course. Its process tree explains ancestry; properties expose image, command line, threads, token, environment, handles, DLLs, memory, and performance.",
      modules: "Foundations · Processes · Threads · Security · Synchronisation · Linking · Injection",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer",
      firstSteps: ["Run normally first; elevate only when a protected detail is unavailable.", "Enable View → Show Process Tree and useful columns such as PID, User Name, Integrity, Command Line, CPU Time, Handles, Threads, and Private Bytes.", "Open View → Lower Pane View and switch between Handles and DLLs.", "Open process Properties for Image, Threads, Token, Environment, Strings, TCP/IP, and performance tabs."],
      capabilities: [
        ["Process tree", "Trace parent/child creation and recognise short-lived descendants."],
        ["Threads", "Inspect TIDs, CPU use, state, start address, priorities, and stacks when symbols are configured."],
        ["Handles", "List object type, handle value, granted access, and object name in the lower pane."],
        ["DLLs and mappings", "See loaded modules and memory-mapped files; verify path, company, signature, and base address."],
        ["Tokens", "Inspect user, groups, privileges, integrity level, elevation, and AppContainer information."],
        ["Find Handle or DLL", "Search system-wide for an object-name fragment or loaded module."],
        ["Performance history", "Compare CPU, private bytes, working set, I/O, handles, and thread counts over time."],
        ["Verify signatures", "Enable image signature verification and optionally VirusTotal only when its data-sharing implications are acceptable."]
      ],
      workflow: ["Identify the process by PID rather than name alone.", "Read Image details: path, command line, parent, user, start time, and architecture.", "Inspect the one subsystem relevant to the question: threads, handles, DLLs, token, or memory.", "Search for a specific handle/DLL if the question is system-wide.", "Record evidence before terminating or changing anything."],
      practice: ["Correlate a Python PID with its parent terminal and loaded Python DLL.", "Compare thread count and CPU time during prime_threads.py experiments.", "Find named event and mutex handles created by the synchronisation exercises.", "Inspect token groups, privileges, elevation, and integrity before running the security lab.", "Compare module lists before and after loading a DLL."],
      cautions: ["Closing handles or terminating processes from Process Explorer changes live state and can cause data loss or crashes.", "A verified signature establishes signer/integrity, not that behaviour is safe."]
    },
    {
      name: "Process Monitor",
      exe: "procmon.exe / procmon64.exe",
      category: "Tracing",
      short: "Real-time file, Registry, process, thread, and image-load tracing",
      description: "The main causal tracing tool. It captures operations with process/thread identity, path, result, detail, time, and optional stack, then uses non-destructive filters to reduce millions of events to an explanation.",
      modules: "Processes · Threads · Linking · Management · IPC · Injection",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/procmon",
      firstSteps: ["Stop capture immediately with Ctrl+E, clear existing events with Ctrl+X, and define filters before the experiment.", "Include the target by Process Name or PID; add Operation, Path, Result, or Category filters for the hypothesis.", "Start capture, reproduce one controlled action, then stop capture before analysing.", "Open Event Properties to inspect Event, Process, and Stack information."],
      capabilities: [
        ["Non-destructive filters", "Include/exclude by any field without discarding captured events."],
        ["File activity", "Trace CreateFile, ReadFile, WriteFile, QueryInformation, directory, and close-related behaviour."],
        ["Registry activity", "Trace key/value opens, queries, writes, enumeration, and failures."],
        ["Process/thread activity", "Capture process creation/exit, thread creation/exit, and image loads."],
        ["Stacks", "Attribute an operation to the calling code path when symbols are available."],
        ["Process Tree", "Review the processes referenced by a trace even after they exit."],
        ["Boot logging", "Capture early boot operations that ordinary live capture misses."],
        ["PML/CSV/XML output", "Preserve full fidelity in PML; export filtered data for analysis when appropriate."]
      ],
      workflow: ["Write a precise question, such as 'Why does BadLog perform more file opens?'.", "Filter to the target PID/name and relevant operations.", "Capture only one repeatable run.", "Compare Result and Detail fields; NAME NOT FOUND and ACCESS DENIED can be meaningful probes.", "Use stacks and process metadata only after the event sequence is understood.", "Save the PML when evidence must be reproducible."],
      practice: ["Compare CreateFile/WriteFile/Close behaviour in GoodLog.exe and BadLog.exe.", "Measure interleaved CreateFile/ReadFile operations in the threaded file processor.", "Find Registry paths touched by regedit or a Python winreg script.", "Trace service controller access to the SCM and service Registry keys.", "Discover a challenge program's named-pipe path and image-loading sequence."],
      commands: [
        ["procmon /AcceptEula /Quiet /Minimized /BackingFile trace.pml", "Start a scripted backing-file capture."],
        ["procmon /Terminate", "Stop an existing Process Monitor capture instance."],
        ["procmon /OpenLog trace.pml", "Open a saved native trace."]
      ],
      cautions: ["Capture can grow extremely quickly; narrow the time window and use a backing file for long runs.", "Filter order and Include rules matter. Always confirm that expected target events remain visible."]
    },
    {
      name: "VMMap",
      exe: "vmmap.exe / vmmap64.exe",
      category: "Memory",
      short: "Per-process virtual-memory layout and working-set analysis",
      description: "Breaks a process address space into images, heaps, stacks, private data, mapped files, shareable pages, and free space while separating reserved, committed, private, working-set, and shareable quantities.",
      modules: "Memory management · Linking · Injection",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/vmmap",
      firstSteps: ["Select a process whose architecture VMMap can inspect.", "Read the Summary view before drilling into regions.", "Expand a type such as Heap, Stack, Image, or Private Data.", "Use Details and Timeline/Snapshots to connect allocation changes to an action."],
      capabilities: [
        ["Type summary", "Compare reserved, committed, private, total working set, private working set, and shareable working set by allocation type."],
        ["Region map", "Inspect base/end address, size, protection, details, and mapped file for each region."],
        ["Heap view", "Break heaps into committed/uncommitted ranges and allocation details where available."],
        ["Working set", "See which committed pages are resident and whether pages are private or shareable."],
        ["Snapshots", "Compare memory before and after a controlled feature or allocation."],
        ["Export", "Save native VMMap data or text/CSV-style outputs for later comparison."]
      ],
      workflow: ["Record total commit/private bytes and working set.", "Find the allocation type responsible for the change.", "Expand to regions and inspect protection and backing.", "Correlate image regions with loaded DLLs and stack regions with threads.", "Compare with VirtualQueryEx output; explain differences in classification rather than expecting identical labels."],
      practice: ["Find the current Python process's image, heaps, stacks, mapped files, and free regions.", "Run alligator.py and compare reserved versus committed memory.", "Change page protection in a lab allocation and locate the region.", "Take before/after snapshots while allocating and freeing memory."],
      cautions: ["Virtual size, commit, working set, and private bytes answer different questions; do not use them interchangeably."]
    },
    {
      name: "RAMMap",
      exe: "rammap.exe / rammap64.exe",
      category: "Memory",
      short: "System-wide physical-memory ownership and page-list analysis",
      description: "Explains where physical RAM is assigned across processes, the file cache, kernel/driver allocations, page tables, and the active/standby/modified/free page lists.",
      modules: "Memory management",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/rammap",
      firstSteps: ["Start with Use Counts for a system-wide summary.", "Use Processes for working-set distribution, not total virtual allocation.", "Use Priority Summary for standby-page priorities.", "Use File Summary/Details to see cached file pages."],
      capabilities: [
        ["Use Counts", "Summarise physical pages by usage and list state."],
        ["Processes", "Attribute resident working-set pages to processes."],
        ["Priority Summary", "Inspect standby pages grouped by replacement priority."],
        ["Physical Pages/Ranges", "Inspect individual PFNs and installed physical ranges."],
        ["File Summary", "See which files occupy RAM through cache or mappings."],
        ["File Details", "Inspect individual physical pages belonging to a file."]
      ],
      workflow: ["Check total active, standby, modified, and free memory.", "Identify the dominant usage type.", "Move to Processes or File Summary based on the question.", "Explain whether memory is private, shareable, cached, standby, or immediately reusable.", "Refresh and compare after a controlled workload rather than drawing conclusions from one snapshot."],
      practice: ["Compare RAMMap's Processes view with VMMap for one Python process.", "Read a large file and observe file-cache/standby effects.", "Explain why low 'Free' memory does not necessarily mean memory pressure."],
      cautions: ["The Empty menu changes system memory state and invalidates an observational experiment; do not use it casually."]
    },
    {
      name: "WinObj",
      exe: "winobj.exe / winobj64.exe",
      category: "Objects",
      short: "NT Object Manager namespace browser",
      description: "Browses named kernel objects through the native NT namespace, including directories, devices, symbolic links, sections, events, mutexes, semaphores, and session-specific object directories.",
      modules: "Processes and handles · Synchronisation · IPC",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/winobj",
      firstSteps: ["Browse the root namespace and identify major directories such as Device, GLOBAL??, KnownDlls, Sessions, and BaseNamedObjects.", "Use search/filter for a name created by a lab.", "Open properties to inspect type-specific details, handle count, reference count, and security where available.", "Refresh while creating/closing an object to observe lifetime."],
      capabilities: [
        ["Namespace tree", "See where named objects live and how directories partition visibility."],
        ["Object types", "Distinguish Event, Mutant (mutex), Semaphore, Section, Device, SymbolicLink, and more."],
        ["Dynamic updates", "Observe objects appearing and disappearing as handles are created/closed."],
        ["Security", "Inspect security descriptors and access on named objects where supported."],
        ["Symbolic links", "Follow DOS/NT device mappings and namespace aliases."],
        ["Sessions", "Understand Local, Global, and per-session named-object scope."]
      ],
      workflow: ["Predict the object's namespace path from its Local\\ or Global\\ name.", "Create the object from Python and refresh/search.", "Confirm object type and counts.", "Open it from a second process and observe handle/reference changes.", "Close every handle and verify when the object disappears."],
      practice: ["Locate Local\\ThreadBirthdayDance and the party mutex/event.", "Compare WinObj object counts with Process Explorer handle entries.", "Trace a DOS drive letter through GLOBAL?? to its device target."],
      cautions: ["A named object may disappear immediately when the last handle closes; prepare the search before ending the lab."]
    },
    {
      name: "Handle",
      exe: "handle.exe / handle64.exe",
      category: "Objects",
      short: "Command-line search for open files and kernel-object handles",
      description: "Finds which process has a file or named object open, lists handles owned by a process, includes non-file object types with -a, and can report granted access.",
      modules: "Processes and handles · Synchronisation · IPC",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/handle",
      firstSteps: ["Run from an elevated terminal for complete system coverage.", "Search by a distinctive case-insensitive path/name fragment.", "Use -p with a PID when the process is known.", "Add -a for events, mutexes, sections, Registry keys, threads, and other object types."],
      capabilities: [
        ["Name search", "Find file or object paths across every process."],
        ["Process filter", "List handles for a process name prefix or PID."],
        ["All object types", "Use -a to include non-file handles."],
        ["Granted access", "Use -g to print the access mask."],
        ["Type counts", "Use -s to summarise handles by object type."],
        ["CSV/tab output", "Use -v/-vt for machine-readable analysis."]
      ],
      commands: [
        ["handle64 path-fragment", "Find which processes hold a matching file/directory."],
        ["handle64 -a -p 1234", "List all object types held by PID 1234."],
        ["handle64 -a -g -p python", "List Python handles with granted-access masks."],
        ["handle64 -s -p 1234", "Summarise PID 1234's handles by type."]
      ],
      workflow: ["Identify the target by PID.", "Search narrowly, then add -a if the target is not a file.", "Read handle value, object type, and object name together.", "Correlate the entry with Process Explorer/WinObj and the code that created it.", "Close the handle in the owning program and repeat to prove lifetime."],
      practice: ["Find pipe, event, and mutex handles from the IPC/synchronisation labs.", "Find which process keeps a test file open.", "Compare handle counts before and after correcting a leak."],
      cautions: ["The -c option forcibly closes another process's handle and can cause corruption or crashes; it is intentionally not part of normal course workflows."]
    },
    {
      name: "ListDLLs",
      exe: "listdlls.exe / listdlls64.exe",
      category: "Images",
      short: "Command-line loaded-module and signature inventory",
      description: "Lists DLLs mapped into all processes or a target process, finds processes using one DLL, reports version information, and highlights unsigned modules.",
      modules: "Linking and loading · Hooking and injection",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/listdlls",
      firstSteps: ["Choose a PID rather than a partial name when multiple instances exist.", "Capture a baseline before loading the lab DLL.", "Repeat after LoadLibrary/import modification and compare paths/base addresses.", "Use signature/version options as evidence, not as a verdict."],
      capabilities: [
        ["Per-process modules", "List DLL path, base, size, and metadata for one PID/name."],
        ["Reverse lookup", "Find every process that loaded a specified DLL with -d."],
        ["Version metadata", "Use -v for file/product/company and version information."],
        ["Unsigned-only", "Use -u to narrow to modules without a valid signature."],
        ["Relocations", "Use -r to flag images not loaded at their preferred base."]
      ],
      commands: [
        ["listdlls64 -v 1234", "Show versioned modules for PID 1234."],
        ["listdlls64 -u", "List unsigned DLLs loaded system-wide."],
        ["listdlls64 -d msgbox.dll", "Find processes that loaded msgbox.dll."],
        ["listdlls64 -r target.exe", "Flag relocated modules in a target process."]
      ],
      workflow: ["Record target PID and architecture.", "Capture baseline module list.", "Trigger the load action once.", "Compare new module path, base, size, version, and signature.", "Confirm imports/exports separately with a PE inspection tool."],
      practice: ["Verify open_the_box.py loads the intended DLL.", "Confirm the modified executable loads msgbox.dll.", "Compare Process Explorer DLL view with ListDLLs output."],
      cautions: ["Unsigned is a useful lead, not proof of maliciousness; many legitimate private builds are unsigned."]
    },
    {
      name: "Autoruns",
      exe: "autoruns.exe / autorunsc.exe",
      category: "Persistence",
      short: "Comprehensive Windows auto-start inventory",
      description: "Enumerates logon, services, drivers, scheduled tasks, Winlogon, Explorer extensions, AppInit DLLs, image hijacks, WMI, Winsock, codecs, and many other persistence locations.",
      modules: "Windows management · Security · Hooking",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns",
      firstSteps: ["Run as administrator for system-wide entries.", "Enable signature verification; optionally hide Microsoft entries to focus on third-party items.", "Use category tabs rather than judging the full Everything list at once.", "Open Properties or Jump to Entry/Image before disabling anything."],
      capabilities: [
        ["Category views", "Separate Logon, Services, Drivers, Scheduled Tasks, Winlogon, Explorer, WMI, and more."],
        ["Signature verification", "Check publisher and image signature status."],
        ["Image/entry navigation", "Jump directly to the Registry/file-system configuration and executable."],
        ["Offline scan", "Inspect auto-starts from another Windows installation."],
        ["Autorunsc export", "Produce CSV, tab, or XML for comparison and automation."],
        ["Disable without delete", "Uncheck an entry for a reversible diagnostic test."]
      ],
      commands: [
        ["autorunsc64 -a * -m -s -h -c", "CSV inventory of all non-Microsoft entries with signatures and hashes."],
        ["autorunsc64 -a s -m -s", "Inspect third-party auto-start services and drivers."],
        ["autorunsc64 -a l -s", "Inspect logon startup entries with signature verification."]
      ],
      workflow: ["Select one persistence category tied to the lesson.", "Hide Microsoft entries only after understanding what the filter removes.", "Inspect publisher, path, timestamp, signature, and configuration location.", "Correlate an active image with Process Explorer.", "Export before changing; prefer disable over delete for controlled testing."],
      practice: ["Find HKCU/HKLM Run entries from the Registry lesson.", "Locate services from the SCM lab and connect them to image paths.", "Compare a clean baseline with a purpose-built lab persistence entry."],
      cautions: ["Disabling drivers, Winlogon, LSA, or essential services can prevent boot/logon. Use a VM snapshot and change only purpose-built entries.", "VirusTotal options can submit hashes or files to a third party; understand and accept the terms first."]
    },
    {
      name: "AccessChk",
      exe: "accesschk.exe / accesschk64.exe",
      category: "Security",
      short: "Effective access and security-descriptor inspection",
      description: "Answers who can read, write, query, start, stop, modify, or control files, Registry keys, services, processes, shares, and Object Manager objects.",
      modules: "Handles · Windows management · Windows security · IPC",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/accesschk",
      firstSteps: ["Run from an elevated terminal when inspecting system resources.", "State the subject and object before choosing switches.", "Use -v for specific rights or -l for the full security descriptor.", "Compare the result with the token and DACL model from the lesson."],
      capabilities: [
        ["Files/directories", "Check effective read/write rights and recurse with -s."],
        ["Registry", "Use -k for keys and optionally recurse/filter."],
        ["Services/SCM", "Use -c with a service name, *, or scmanager."],
        ["Processes/tokens", "Use -p, with -f for groups and privileges and -t for threads."],
        ["Object Manager", "Use -o and optional object type to inspect named kernel objects."],
        ["Integrity levels", "Use -e/-v to expose explicitly set mandatory labels."],
        ["Full descriptor", "Use -l to show the security descriptor rather than simplified R/W output."]
      ],
      commands: [
        ["accesschk64 -p -f 1234", "Show PID 1234's token groups and privileges."],
        ["accesschk64 users -cw *", "Find services writable by the Users group."],
        ["accesschk64 -k -l HKLM\\Software", "Show the Registry key's full security descriptor."],
        ["accesschk64 -v everyone C:\\Lab", "Show Everyone's specific rights to a lab directory."],
        ["accesschk64 -wuo everyone \\BaseNamedObjects", "Find named objects Everyone can modify."]
      ],
      workflow: ["Identify the subject SID/group and exact object type.", "Run the narrow effective-access query.", "Add verbose/full descriptor output to explain the result.", "Inspect token groups/privileges and integrity level when DAC alone does not explain behaviour.", "Predict the API open result, then test it with minimum requested rights."],
      practice: ["Predict and verify access to a lab file after changing its DACL.", "Inspect who can start/stop/reconfigure a disposable service.", "Compare process token output with win32security.GetTokenInformation.", "Inspect a named event or pipe's security."],
      cautions: ["AccessChk reports permissions; it does not grant authority. Avoid changing production ACLs merely to make a lab call succeed."]
    },
    {
      name: "PsTools",
      exe: "pslist / pskill / pssuspend / psservice / psexec",
      category: "Administration",
      short: "Command-line process, thread, service, and remote administration",
      description: "A suite rather than one tool. The course mainly uses PsList for process/thread data, PsSuspend for scheduling experiments, PsService for SCM inspection, and PsKill only for controlled cleanup.",
      modules: "Processes · Threads · Windows management",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/pstools",
      firstSteps: ["Run each tool with -? because switches belong to the individual utility.", "Prefer local targets until the security and remote-service implications are understood.", "Identify by PID where duplicate names exist.", "Record original state before suspend, priority, or service changes."],
      capabilities: [
        ["PsList", "List processes and optionally threads, CPU time, elapsed time, and memory details."],
        ["PsSuspend", "Suspend/resume a process or selected target for controlled scheduler observation."],
        ["PsService", "Query, enumerate, start, stop, pause, continue, and configure local/remote services."],
        ["PsKill", "Terminate a process by name or PID when cooperative exit is unavailable."],
        ["PsInfo", "Collect OS, installation, uptime, and hardware summary information."],
        ["PsLoggedOn", "Show local and resource-share logon information."],
        ["PsExec", "Run a process locally/remotely in a different execution context; advanced and high impact."]
      ],
      commands: [
        ["pslist64 -t", "Show a process tree."],
        ["pslist64 -d 1234", "Show thread detail for PID 1234."],
        ["pssuspend64 1234", "Suspend PID 1234; run with -r to resume."],
        ["psservice64 query servicename", "Query a service's state and configuration."],
        ["pskill64 1234", "Force PID 1234 to terminate only when safe."]
      ],
      workflow: ["Choose the smallest PsTool matching the question.", "Query state before mutation.", "Perform one controlled operation.", "Confirm the result in Process Explorer or Services.", "Restore/resume the target and record what changed."],
      practice: ["Compare PsList thread output with Process Explorer.", "Suspend/resume a purpose-built CPU worker and observe scheduler/resource graphs.", "Query and safely control the disposable service used in the management lab."],
      cautions: ["PsExec and remote PsTools can create services, cross machine boundaries, and trigger security controls. They are not required for ordinary local labs.", "Suspending a process that owns locks can block other programs."]
    },
    {
      name: "Sigcheck",
      exe: "sigcheck.exe / sigcheck64.exe",
      category: "Images",
      short: "File metadata, hashes, digital signatures, and certificate trust",
      description: "Reports executable version/timestamp metadata, hashes, signer and certificate-chain details, catalog membership, entropy, manifests, and optional VirusTotal status.",
      modules: "Linking and loading · Security · Hooking and injection",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/sigcheck",
      firstSteps: ["Inspect one known file without VirusTotal first.", "Compare architecture/subsystem/manifest metadata with the PE headers.", "Use signature-chain information to establish who signed the exact bytes.", "Hash before and after file modification to prove content changed."],
      capabilities: [
        ["Version metadata", "Show company, product, description, version, and timestamps."],
        ["Hashes", "Calculate cryptographic file hashes for identity/comparison."],
        ["Signatures", "Verify embedded/catalog signatures and display certificate chains."],
        ["Manifest", "Dump executable manifest, including requested execution level."],
        ["Entropy", "Report file entropy as one investigation signal."],
        ["Recursive scans", "Inspect files under a directory and filter unsigned results."],
        ["Certificate stores", "List certificates and validate against trusted roots."],
        ["VirusTotal", "Optional reputation querying/submission with explicit terms and privacy implications."]
      ],
      commands: [
        ["sigcheck64 -a -h -i target.exe", "Show extended metadata, hashes, and signature chain."],
        ["sigcheck64 -m target.exe", "Dump the executable manifest."],
        ["sigcheck64 -u -e C:\\Lab", "List unsigned executable images in the lab directory."],
        ["sigcheck64 -c -h C:\\Lab\\*.exe", "Produce CSV-style hash inventory."]
      ],
      workflow: ["Hash and record file path/size first.", "Inspect version and PE-related metadata.", "Verify the signature and certificate chain.", "Compare with loaded-module path in Process Explorer/ListDLLs.", "Use reputation only as optional supporting evidence."],
      practice: ["Compare original and import-modified executable hashes.", "Inspect requested execution level in a manifest.", "Check signatures for DLLs loaded into a target process."],
      cautions: ["A valid signature does not guarantee safe behaviour; it proves integrity and signer identity under the trust chain.", "VirusTotal options may upload unknown files. Do not submit private or sensitive binaries."]
    },
    {
      name: "PipeList",
      exe: "pipelist.exe / pipelist64.exe",
      category: "IPC",
      short: "Named-pipe inventory with instance and capacity information",
      description: "Lists named pipes on the system and reports current/max instances. It complements Procmon discovery and Handle ownership searches during named-pipe exercises.",
      modules: "Inter-process communication",
      source: "https://learn.microsoft.com/en-us/sysinternals/downloads/pipelist",
      firstSteps: ["Capture a baseline list before starting the pipe server.", "Start the server and diff/search for the new pipe name.", "Correlate the name with Handle and Process Explorer to identify ownership.", "Connect the client and observe instance changes where applicable."],
      capabilities: [
        ["Pipe names", "Enumerate currently visible named-pipe endpoints."],
        ["Instances", "Show active and maximum server-instance counts."],
        ["Before/after discovery", "Reveal a challenge pipe by comparing controlled snapshots."],
        ["Ownership correlation", "Feed the discovered name to Handle or Process Explorer search."]
      ],
      commands: [
        ["pipelist64", "List named pipes and instance information."],
        ["pipelist64 | findstr /i lab", "Narrow the console list to a known name fragment."]
      ],
      workflow: ["Save baseline output.", "Launch the server and keep it alive.", "Capture the second output and find the new name.", "Use Handle to identify the owning PID.", "Use the full \\\\.\\pipe\\name path in win32pipe/win32file client code."],
      practice: ["Discover the pipe required by whats_my_name.py.", "Verify a CreateNamedPipe server creates the expected number of instances."],
      cautions: ["A pipe's presence/name is not authentication. Inspect its security descriptor and protocol before trusting the peer."]
    }
  ]
};
