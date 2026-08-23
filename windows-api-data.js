(() => {
  const signatures = window.ILOVEOS_API_SIGNATURES;
  const reference = window.ILOVEOS_REFERENCE;

  const typeMappings = [
    { native: "BOOL", python: "wintypes.BOOL", meaning: "A 32-bit Windows Boolean. Test the documented zero or nonzero result instead of using ctypes.c_bool." },
    { native: "BYTE", python: "wintypes.BYTE", meaning: "An unsigned 8-bit integer." },
    { native: "WORD", python: "wintypes.WORD", meaning: "An unsigned 16-bit integer." },
    { native: "DWORD", python: "wintypes.DWORD", meaning: "An unsigned 32-bit integer commonly used for flags, identifiers, sizes, and status values." },
    { native: "LONG", python: "wintypes.LONG", meaning: "A signed 32-bit integer. Some APIs return an error code directly in this type." },
    { native: "HANDLE", python: "wintypes.HANDLE", meaning: "An opaque, pointer-sized object handle. The API contract determines whether you own and must close it." },
    { native: "HMODULE / HINSTANCE", python: "wintypes.HMODULE / wintypes.HINSTANCE", meaning: "Pointer-sized module or instance handles." },
    { native: "LPVOID / PVOID", python: "wintypes.LPVOID or ctypes.c_void_p", meaning: "A generic address. None represents a permitted null pointer." },
    { native: "LPCVOID", python: "wintypes.LPCVOID", meaning: "A pointer to caller-owned data that the function promises not to modify." },
    { native: "SIZE_T", python: "ctypes.c_size_t", meaning: "An unsigned pointer-sized byte or element count. It is 32 bits in 32-bit Python and 64 bits in 64-bit Python." },
    { native: "SIZE_T *", python: "ctypes.POINTER(ctypes.c_size_t)", meaning: "A pointer to a SIZE_T output or in/out value. Create c_size_t(), then pass ctypes.byref(value)." },
    { native: "LPCWSTR", python: "wintypes.LPCWSTR", meaning: "A read-only pointer to a null-terminated UTF-16 string. Pass a Python str or None when optional." },
    { native: "LPWSTR", python: "wintypes.LPWSTR", meaning: "A writable UTF-16 buffer. Use ctypes.create_unicode_buffer when Windows writes into it." },
    { native: "LPCSTR", python: "wintypes.LPCSTR", meaning: "A read-only pointer to bytes used by an ANSI API or byte-oriented name such as GetProcAddress." },
    { native: "T *", python: "ctypes.POINTER(T)", meaning: "A typed pointer. Use ctypes.byref(instance) for one output object and POINTER(T) for the declared parameter type." },
    { native: "Structure", python: "class NAME(ctypes.Structure)", meaning: "Declare _fields_ in native order with the correct widths, alignment, nested unions, and pointer-sized members." },
    { native: "Callback pointer", python: "ctypes.WINFUNCTYPE(result, *arguments)", meaning: "Build the Windows-calling-convention prototype and keep the resulting Python callback alive for as long as native code can call it." },
    { native: "void", python: "None", meaning: "Use restype = None. There is no return value to interpret." },
  ];

  const extraSignatures = {
    OpenProcess: {
      parameters: [
        { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Access mask required by the operations that will use the returned process handle." },
        { name: "bInheritHandle", type: "wintypes.BOOL", description: "Whether a subsequently created child may inherit the handle." },
        { name: "dwProcessId", type: "wintypes.DWORD", description: "Identifier of the process to open." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocess",
    },
    GetProcAddress: {
      parameters: [
        { name: "hModule", type: "wintypes.HMODULE", description: "Loaded module that owns the export table." },
        { name: "lpProcName", type: "wintypes.LPCSTR", description: "ASCII export name as bytes, or a documented low-word ordinal." },
      ],
      returns: "ctypes.c_void_p | None",
      source: "https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-getprocaddress",
    },
    LoadLibraryW: {
      parameters: [
        { name: "lpLibFileName", type: "wintypes.LPCWSTR", description: "UTF-16 path or module name to load." },
      ],
      returns: "wintypes.HMODULE | None",
      source: "https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibraryw",
    },
    WaitForSingleObject: {
      parameters: [
        { name: "hHandle", type: "wintypes.HANDLE", description: "Handle to one waitable object." },
        { name: "dwMilliseconds", type: "wintypes.DWORD", description: "Timeout in milliseconds or INFINITE." },
      ],
      returns: "wintypes.DWORD",
      source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject",
    },
    CloseHandle: {
      parameters: [
        { name: "hObject", type: "wintypes.HANDLE", description: "Owned kernel-object handle to release." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/windows/win32/api/handleapi/nf-handleapi-closehandle",
    },
    LoadLibraryA: {
      parameters: [{ name: "lpLibFileName", type: "wintypes.LPCSTR", description: "ANSI module path or name supplied as bytes. Prefer LoadLibraryW for normal Unicode paths." }],
      returns: "wintypes.HMODULE | None",
      source: "https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibrarya",
    },
    FreeLibrary: {
      parameters: [{ name: "hLibModule", type: "wintypes.HMODULE", description: "Owned module reference whose count should be decremented." }],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-freelibrary",
    },
    GetCurrentProcess: {
      parameters: [],
      returns: "wintypes.HANDLE",
      source: "https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-getcurrentprocess",
    },
    GetExitCodeProcess: {
      parameters: [
        { name: "hProcess", type: "wintypes.HANDLE", description: "Process handle with PROCESS_QUERY_INFORMATION or PROCESS_QUERY_LIMITED_INFORMATION." },
        { name: "lpExitCode", type: "ctypes.POINTER(wintypes.DWORD)", description: "Output receiving the termination status or STILL_ACTIVE." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-getexitcodeprocess",
    },
    GetNativeSystemInfo: {
      parameters: [{ name: "lpSystemInfo", type: "ctypes.POINTER(SYSTEM_INFO)", description: "Output structure describing the native host architecture and address limits." }],
      returns: "None",
      source: "https://learn.microsoft.com/windows/win32/api/sysinfoapi/nf-sysinfoapi-getnativesysteminfo",
    },
    GetWindowsDirectoryW: {
      parameters: [
        { name: "lpBuffer", type: "wintypes.LPWSTR", description: "Writable UTF-16 output buffer for the Windows directory path." },
        { name: "uSize", type: "wintypes.UINT", description: "Capacity of lpBuffer in UTF-16 characters." },
      ],
      returns: "wintypes.UINT",
      source: "https://learn.microsoft.com/windows/win32/api/sysinfoapi/nf-sysinfoapi-getwindowsdirectoryw",
    },
    GetProcessHeap: {
      parameters: [],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/windows/win32/api/heapapi/nf-heapapi-getprocessheap",
    },
    HeapSize: {
      parameters: [
        { name: "hHeap", type: "wintypes.HANDLE", description: "Heap that owns the block." },
        { name: "dwFlags", type: "wintypes.DWORD", description: "Normally zero for the process heap." },
        { name: "lpMem", type: "wintypes.LPCVOID", description: "Block previously returned by a compatible heap allocation call." },
      ],
      returns: "ctypes.c_size_t",
      source: "https://learn.microsoft.com/windows/win32/api/heapapi/nf-heapapi-heapsize",
    },
    OpenProcessToken: {
      parameters: [
        { name: "ProcessHandle", type: "wintypes.HANDLE", description: "Process whose primary token will be opened." },
        { name: "DesiredAccess", type: "wintypes.DWORD", description: "Minimum TOKEN_* access mask required by later operations." },
        { name: "TokenHandle", type: "ctypes.POINTER(wintypes.HANDLE)", description: "Output receiving an owned token handle." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocesstoken",
    },
    DuplicateToken: {
      parameters: [
        { name: "ExistingTokenHandle", type: "wintypes.HANDLE", description: "Open token with TOKEN_DUPLICATE access." },
        { name: "ImpersonationLevel", type: "ctypes.c_int", description: "SECURITY_IMPERSONATION_LEVEL value for the duplicate." },
        { name: "DuplicateTokenHandle", type: "ctypes.POINTER(wintypes.HANDLE)", description: "Output receiving an owned impersonation-token handle." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/windows/win32/api/securitybaseapi/nf-securitybaseapi-duplicatetoken",
    },
    GetNamedSecurityInfoW: {
      parameters: [
        { name: "pObjectName", type: "wintypes.LPCWSTR", description: "Name of the securable object." },
        { name: "ObjectType", type: "ctypes.c_int", description: "SE_OBJECT_TYPE value identifying the object family." },
        { name: "SecurityInfo", type: "wintypes.DWORD", description: "SECURITY_INFORMATION flags selecting the requested descriptor parts." },
        { name: "ppsidOwner", type: "ctypes.POINTER(ctypes.c_void_p)", description: "Optional output for the owner SID pointer." },
        { name: "ppsidGroup", type: "ctypes.POINTER(ctypes.c_void_p)", description: "Optional output for the primary-group SID pointer." },
        { name: "ppDacl", type: "ctypes.POINTER(ctypes.c_void_p)", description: "Optional output for the DACL pointer." },
        { name: "ppSacl", type: "ctypes.POINTER(ctypes.c_void_p)", description: "Optional output for the SACL pointer." },
        { name: "ppSecurityDescriptor", type: "ctypes.POINTER(ctypes.c_void_p)", description: "Output receiving the LocalAlloc-backed descriptor that owns the returned component pointers." },
      ],
      returns: "wintypes.DWORD",
      source: "https://learn.microsoft.com/windows/win32/api/aclapi/nf-aclapi-getnamedsecurityinfow",
    },
    MapGenericMask: {
      parameters: [
        { name: "AccessMask", type: "ctypes.POINTER(wintypes.DWORD)", description: "In/out access mask whose generic bits are replaced with object-specific rights." },
        { name: "GenericMapping", type: "ctypes.POINTER(GENERIC_MAPPING)", description: "Mapping defining the object type's generic read, write, execute, and all rights." },
      ],
      returns: "None",
      source: "https://learn.microsoft.com/windows/win32/api/securitybaseapi/nf-securitybaseapi-mapgenericmask",
    },
    LocalFree: {
      parameters: [{ name: "hMem", type: "ctypes.c_void_p", description: "LocalAlloc-family memory block to release." }],
      returns: "ctypes.c_void_p | None",
      source: "https://learn.microsoft.com/windows/win32/api/winbase/nf-winbase-localfree",
    },
    EnumProcessModules: {
      parameters: [
        { name: "hProcess", type: "wintypes.HANDLE", description: "Process whose loaded module handles will be enumerated." },
        { name: "lphModule", type: "ctypes.POINTER(wintypes.HMODULE)", description: "Output array receiving module handles." },
        { name: "cb", type: "wintypes.DWORD", description: "Size of the output array in bytes." },
        { name: "lpcbNeeded", type: "ctypes.POINTER(wintypes.DWORD)", description: "Output receiving the bytes required for the complete module list." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/windows/win32/api/psapi/nf-psapi-enumprocessmodules",
    },
    GetModuleFileNameExW: {
      parameters: [
        { name: "hProcess", type: "wintypes.HANDLE", description: "Process containing the module." },
        { name: "hModule", type: "wintypes.HMODULE | None", description: "Module handle, or None for the main executable where supported." },
        { name: "lpFilename", type: "wintypes.LPWSTR", description: "Writable UTF-16 path buffer." },
        { name: "nSize", type: "wintypes.DWORD", description: "Buffer capacity in UTF-16 characters." },
      ],
      returns: "wintypes.DWORD",
      source: "https://learn.microsoft.com/windows/win32/api/psapi/nf-psapi-getmodulefilenameexw",
    },
    CreateEventW: { parameters: [{ name: "lpEventAttributes", type: "ctypes.c_void_p | None", description: "Optional SECURITY_ATTRIBUTES pointer." }, { name: "bManualReset", type: "wintypes.BOOL", description: "True for manual reset; false for auto reset." }, { name: "bInitialState", type: "wintypes.BOOL", description: "Initial signaled state." }, { name: "lpName", type: "wintypes.LPCWSTR | None", description: "Optional UTF-16 object name." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-createeventw" },
    CreateMutexW: { parameters: [{ name: "lpMutexAttributes", type: "ctypes.c_void_p | None", description: "Optional SECURITY_ATTRIBUTES pointer." }, { name: "bInitialOwner", type: "wintypes.BOOL", description: "Whether the creating thread requests initial ownership." }, { name: "lpName", type: "wintypes.LPCWSTR | None", description: "Optional UTF-16 object name." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-createmutexw" },
    WaitForMultipleObjects: { parameters: [{ name: "nCount", type: "wintypes.DWORD", description: "Number of handles in lpHandles." }, { name: "lpHandles", type: "ctypes.POINTER(wintypes.HANDLE)", description: "Input array of waitable handles." }, { name: "bWaitAll", type: "wintypes.BOOL", description: "Wait for all handles or any one handle." }, { name: "dwMilliseconds", type: "wintypes.DWORD", description: "Timeout in milliseconds or INFINITE." }], returns: "wintypes.DWORD", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-waitformultipleobjects" },
    ReadFile: { parameters: [{ name: "hFile", type: "wintypes.HANDLE", description: "Readable file, pipe, or device handle." }, { name: "lpBuffer", type: "wintypes.LPVOID", description: "Writable output buffer." }, { name: "nNumberOfBytesToRead", type: "wintypes.DWORD", description: "Requested byte count." }, { name: "lpNumberOfBytesRead", type: "ctypes.POINTER(wintypes.DWORD) | None", description: "Output byte count for synchronous I/O." }, { name: "lpOverlapped", type: "ctypes.c_void_p | None", description: "Optional OVERLAPPED pointer for asynchronous I/O." }], returns: "wintypes.BOOL", source: "https://learn.microsoft.com/windows/win32/api/fileapi/nf-fileapi-readfile" },
    WriteFile: { parameters: [{ name: "hFile", type: "wintypes.HANDLE", description: "Writable file, pipe, or device handle." }, { name: "lpBuffer", type: "wintypes.LPCVOID", description: "Caller-owned source bytes." }, { name: "nNumberOfBytesToWrite", type: "wintypes.DWORD", description: "Requested byte count." }, { name: "lpNumberOfBytesWritten", type: "ctypes.POINTER(wintypes.DWORD) | None", description: "Output byte count for synchronous I/O." }, { name: "lpOverlapped", type: "ctypes.c_void_p | None", description: "Optional OVERLAPPED pointer for asynchronous I/O." }], returns: "wintypes.BOOL", source: "https://learn.microsoft.com/windows/win32/api/fileapi/nf-fileapi-writefile" },
    CreateNamedPipeW: { parameters: [{ name: "lpName", type: "wintypes.LPCWSTR", description: "Canonical UTF-16 pipe name." }, { name: "dwOpenMode", type: "wintypes.DWORD", description: "Direction, overlap, and first-instance flags." }, { name: "dwPipeMode", type: "wintypes.DWORD", description: "Byte/message type, read mode, and wait mode." }, { name: "nMaxInstances", type: "wintypes.DWORD", description: "Maximum simultaneous instances." }, { name: "nOutBufferSize", type: "wintypes.DWORD", description: "Advisory output buffer size." }, { name: "nInBufferSize", type: "wintypes.DWORD", description: "Advisory input buffer size." }, { name: "nDefaultTimeOut", type: "wintypes.DWORD", description: "Default client wait timeout." }, { name: "lpSecurityAttributes", type: "ctypes.c_void_p | None", description: "Optional SECURITY_ATTRIBUTES pointer." }], returns: "wintypes.HANDLE", source: "https://learn.microsoft.com/windows/win32/api/winbase/nf-winbase-createnamedpipew" },
    OpenThread: { parameters: [{ name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Minimum THREAD_* access mask." }, { name: "bInheritHandle", type: "wintypes.BOOL", description: "Whether a child may inherit the handle." }, { name: "dwThreadId", type: "wintypes.DWORD", description: "Target thread identifier." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-openthread" },
    VirtualProtectEx: { parameters: [{ name: "hProcess", type: "wintypes.HANDLE", description: "Target process with PROCESS_VM_OPERATION." }, { name: "lpAddress", type: "wintypes.LPVOID", description: "Start of the committed target range." }, { name: "dwSize", type: "ctypes.c_size_t", description: "Byte count to protect." }, { name: "flNewProtect", type: "wintypes.DWORD", description: "New PAGE_* protection." }, { name: "lpflOldProtect", type: "ctypes.POINTER(wintypes.DWORD)", description: "Output receiving the prior protection." }], returns: "wintypes.BOOL", source: "https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-virtualprotectex" },
    MessageBoxA: { parameters: [{ name: "hWnd", type: "wintypes.HWND | None", description: "Optional owner window." }, { name: "lpText", type: "wintypes.LPCSTR", description: "ANSI message bytes." }, { name: "lpCaption", type: "wintypes.LPCSTR", description: "ANSI caption bytes." }, { name: "uType", type: "wintypes.UINT", description: "Buttons, icon, modality, and default-button flags." }], returns: "ctypes.c_int", source: "https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-messageboxa" },
  };

  const featureIndex = new Map();
  for (const module of reference.pywin32Modules) {
    for (const feature of module.features) {
      const current = featureIndex.get(feature.name) || [];
      current.push({ module: module.name, task: feature.task, detail: feature.detail });
      featureIndex.set(feature.name, current);
    }
  }

  const moduleGroups = {
    "Memory and address spaces": new Set(["GetSystemInfo", "GetNativeSystemInfo", "GlobalMemoryStatusEx", "QueryWorkingSetEx", "VirtualAlloc", "VirtualAllocEx", "VirtualFree", "VirtualFreeEx", "VirtualProtect", "VirtualProtectEx", "VirtualQueryEx", "CreateFileMappingW", "OpenFileMappingW", "MapViewOfFile", "UnmapViewOfFile", "GetProcessHeap", "HeapAlloc", "HeapSize", "HeapFree", "WriteProcessMemory"]),
    "Processes, threads, and handles": new Set(["CreateProcessW", "GetCurrentProcess", "GetExitCodeProcess", "OpenProcess", "OpenThread", "CreateRemoteThread", "WaitForSingleObject", "WaitForMultipleObjects", "CloseHandle", "FlushInstructionCache", "IsWow64Process2", "CreateEventW", "CreateMutexW"]),
    "Files, pipes, and devices": new Set(["ReadFile", "WriteFile", "CreateNamedPipeW"]),
    "Modules and loading": new Set(["EnumProcessModules", "GetModuleHandleW", "GetModuleFileNameW", "GetModuleFileNameExW", "GetProcAddress", "LoadLibraryA", "LoadLibraryW", "LoadLibraryExW", "FreeLibrary", "SetDefaultDllDirectories", "AddDllDirectory", "RtlAddFunctionTable"]),
    "Services and Registry": new Set(["OpenSCManagerW", "OpenServiceW", "StartServiceW", "ControlService", "QueryServiceStatusEx", "CloseServiceHandle", "RegOpenKeyExW"]),
    "Security and trust": new Set(["AccessCheck", "OpenProcessToken", "DuplicateToken", "GetNamedSecurityInfoW", "MapGenericMask", "LocalFree", "WinVerifyTrust"]),
    "Hooks and desktop APIs": new Set(["SetWindowsHookExW", "CallNextHookEx", "UnhookWindowsHookEx", "InterlockedExchangePointer", "MessageBoxA"]),
    "System information and errors": new Set(["GetLastError", "GetWindowsDirectoryW"]),
  };

  const dllGroups = {
    "Advapi32.dll": new Set(["AccessCheck", "OpenProcessToken", "DuplicateToken", "GetNamedSecurityInfoW", "MapGenericMask", "OpenSCManagerW", "OpenServiceW", "StartServiceW", "ControlService", "QueryServiceStatusEx", "CloseServiceHandle", "RegOpenKeyExW"]),
    "User32.dll": new Set(["SetWindowsHookExW", "CallNextHookEx", "UnhookWindowsHookEx", "MessageBoxA"]),
    "Psapi.dll": new Set(["QueryWorkingSetEx", "EnumProcessModules", "GetModuleFileNameExW"]),
    "Wintrust.dll": new Set(["WinVerifyTrust"]),
  };

  const pywin32Names = {
    OpenProcess: "win32api.OpenProcess",
    GetCurrentProcess: "win32api.GetCurrentProcess",
    GetExitCodeProcess: "win32process.GetExitCodeProcess",
    GetModuleHandleW: "win32api.GetModuleHandle",
    GetProcAddress: "win32api.GetProcAddress",
    LoadLibraryW: "win32api.LoadLibrary",
    LoadLibraryA: "win32api.LoadLibrary",
    LoadLibraryExW: "win32api.LoadLibraryEx",
    FreeLibrary: "win32api.FreeLibrary",
    EnumProcessModules: "win32process.EnumProcessModules",
    GetModuleFileNameExW: "win32process.GetModuleFileNameEx",
    CreateProcessW: "win32process.CreateProcess",
    CreateRemoteThread: "win32process.CreateRemoteThread",
    WaitForSingleObject: "win32event.WaitForSingleObject",
    CloseHandle: "win32api.CloseHandle or PyHANDLE.Close",
    VirtualAllocEx: "win32process.VirtualAllocEx",
    VirtualFreeEx: "win32process.VirtualFreeEx",
    WriteProcessMemory: "win32process.WriteProcessMemory",
    GetLastError: "win32api.GetLastError",
    GetNativeSystemInfo: "win32api.GetNativeSystemInfo",
    GetWindowsDirectoryW: "win32api.GetWindowsDirectory",
    OpenProcessToken: "win32security.OpenProcessToken",
    DuplicateToken: "win32security.DuplicateToken",
    GetNamedSecurityInfoW: "win32security.GetNamedSecurityInfo",
    RegOpenKeyExW: "winreg.OpenKey",
    OpenSCManagerW: "win32service.OpenSCManager",
    OpenServiceW: "win32service.OpenService",
    StartServiceW: "win32service.StartService",
    ControlService: "win32service.ControlService",
    QueryServiceStatusEx: "win32service.QueryServiceStatusEx",
    CloseServiceHandle: "PySC_HANDLE.Close",
  };

  const cleanupByName = {
    OpenProcess: "An owned process handle must be released once with CloseHandle, normally in finally.",
    CreateProcessW: "Close both hThread and hProcess from PROCESS_INFORMATION with CloseHandle.",
    CreateRemoteThread: "Close the returned thread handle with CloseHandle after waiting or otherwise finishing with it.",
    CloseHandle: "This is the cleanup operation. Do not use the handle again after a successful close.",
    CreateEventW: "Close the returned event handle with CloseHandle.",
    CreateMutexW: "Release ownership with ReleaseMutex when held, then close the handle with CloseHandle.",
    CreateNamedPipeW: "Disconnect a connected instance where appropriate, then close the pipe handle with CloseHandle.",
    OpenThread: "Close the returned thread handle with CloseHandle.",
    VirtualAlloc: "Release the allocation with VirtualFree using the original allocation base and the documented size/free-type combination.",
    VirtualAllocEx: "Release target-process memory with VirtualFreeEx using the same process handle and original allocation base after the target no longer uses it.",
    VirtualFree: "This is a cleanup operation; do not access a released range.",
    VirtualFreeEx: "This is the remote cleanup operation; do not release a region still used by another thread.",
    CreateFileMappingW: "Close the mapping handle with CloseHandle after every mapped view has been unmapped.",
    OpenFileMappingW: "Close the returned mapping handle with CloseHandle.",
    MapViewOfFile: "Unmap the returned view with UnmapViewOfFile.",
    UnmapViewOfFile: "This releases one mapped view, not the mapping-object handle.",
    HeapAlloc: "Release the block with HeapFree on the same heap.",
    HeapFree: "This is the matching cleanup for HeapAlloc; do not free the same block twice.",
    LoadLibraryW: "A successful call increments a module reference count. Balance an owned reference with FreeLibrary.",
    LoadLibraryA: "A successful call increments a module reference count. Balance an owned reference with FreeLibrary.",
    LoadLibraryExW: "Balance an owned module reference with FreeLibrary.",
    FreeLibrary: "This decrements one owned module reference. Do not use addresses that became invalid after the final unload.",
    GetCurrentProcess: "The returned pseudo-handle is borrowed and must not be closed.",
    GetProcessHeap: "The returned process-heap handle is borrowed and must not be closed.",
    OpenProcessToken: "Close the returned token handle with CloseHandle.",
    DuplicateToken: "Close the returned duplicate-token handle with CloseHandle.",
    GetNamedSecurityInfoW: "Release the returned security descriptor once with LocalFree. Component pointers returned alongside it point into that same allocation.",
    LocalFree: "This releases one LocalAlloc-family allocation. A null return means the free succeeded.",
    AddDllDirectory: "Remove an owned cookie with RemoveDllDirectory when the added search path is no longer needed.",
    OpenSCManagerW: "Release the returned SCM handle with CloseServiceHandle.",
    OpenServiceW: "Release the returned service handle with CloseServiceHandle.",
    CloseServiceHandle: "This is the matching cleanup for SCM and service handles.",
    RegOpenKeyExW: "Close the returned Registry key with RegCloseKey or the owning winreg handle's Close method.",
    SetWindowsHookExW: "Remove the hook with UnhookWindowsHookEx and retain any callback object until unhooking and in-flight delivery finish.",
    UnhookWindowsHookEx: "This removes the hook; release callback storage only after no native call can reach it.",
  };

  const resultByName = {
    GetLastError: "Returns the calling thread's last-error code. Read it only when the failed API explicitly documents that it sets last error.",
    RegOpenKeyExW: "Returns ERROR_SUCCESS on success or a Win32 error code directly. Do not call get_last_error for this result.",
    WinVerifyTrust: "Returns zero for trust success and a signed status code otherwise. Interpret the returned code directly rather than using get_last_error.",
    WaitForSingleObject: "Branch explicitly on WAIT_OBJECT_0, WAIT_TIMEOUT, WAIT_ABANDONED, and WAIT_FAILED. Only WAIT_FAILED uses last error.",
    WaitForMultipleObjects: "Decode WAIT_OBJECT_0 plus an index, WAIT_ABANDONED plus an index, WAIT_TIMEOUT, or WAIT_FAILED. Only WAIT_FAILED uses last error.",
    VirtualQueryEx: "Returns the number of bytes written to the information buffer; zero indicates failure and makes last error available.",
    GetSystemInfo: "Returns no value and fills the supplied SYSTEM_INFO structure.",
    InterlockedExchangePointer: "Returns the previous pointer value. It is an atomic result, not a BOOL success flag.",
    CallNextHookEx: "Returns the next hook's result. Its meaning depends on the selected hook contract.",
    RtlAddFunctionTable: "Returns nonzero on success and zero on failure; follow the function-table lifetime rules.",
    GetCurrentProcess: "Returns a constant pseudo-handle for the current process. It does not fail and must not be closed.",
    GetNamedSecurityInfoW: "Returns ERROR_SUCCESS on success or a Win32 error code directly. Raise ctypes.WinError(result) for an unexpected nonzero result.",
    CreateNamedPipeW: "Returns a pipe handle on success. INVALID_HANDLE_VALUE (not null) indicates failure; then read the last-error code.",
    ReadFile: "For the synchronous pattern shown, nonzero means success and zero means failure; then read last error. Overlapped I/O has an additional pending-completion contract and needs a separate OVERLAPPED lifetime.",
    WriteFile: "For the synchronous pattern shown, nonzero means success and zero means failure; then read last error. Overlapped I/O has an additional pending-completion contract and needs a separate OVERLAPPED lifetime.",
    HeapSize: "Returns the usable block size. SIZE_T(-1) indicates failure; do not treat an ordinary zero as the universal failure rule.",
    LocalFree: "Returns null on success. A non-null return is the still-owned input handle and indicates failure.",
    GetWindowsDirectoryW: "Zero indicates failure. A result greater than the supplied capacity reports the required size, including the terminator.",
    GetModuleFileNameExW: "Zero indicates failure. A nonzero result is the number of UTF-16 characters copied, excluding the terminator.",
  };

  const examplesByName = {
    OpenProcess: `process_handle = OpenProcess(
    PROCESS_QUERY_INFORMATION | PROCESS_VM_OPERATION | PROCESS_VM_WRITE,
    False,
    target_pid,
)
if not process_handle:
    raise ctypes.WinError(ctypes.get_last_error())`,
    VirtualAllocEx: `remote_address = VirtualAllocEx(
    process_handle,
    None,
    byte_count,
    MEM_COMMIT | MEM_RESERVE,
    PAGE_READWRITE,
)
if not remote_address:
    raise ctypes.WinError(ctypes.get_last_error())`,
    WriteProcessMemory: `source = ctypes.create_string_buffer(dll_bytes)
bytes_written = ctypes.c_size_t()

ok = WriteProcessMemory(
    process_handle,
    remote_address,
    source,
    len(dll_bytes),
    ctypes.byref(bytes_written),
)
if not ok:
    raise ctypes.WinError(ctypes.get_last_error())
if bytes_written.value != len(dll_bytes):
    raise RuntimeError(f"partial write: {bytes_written.value}/{len(dll_bytes)} bytes")`,
    GetModuleHandleW: `module = GetModuleHandleW("kernel32.dll")
if not module:
    raise ctypes.WinError(ctypes.get_last_error())
# This borrowed module handle is not closed.`,
    GetProcAddress: `address = GetProcAddress(module, b"LoadLibraryW")
if not address:
    raise ctypes.WinError(ctypes.get_last_error())
# address is untyped; use it only with the exact documented ABI.`,
    LoadLibraryW: `module = LoadLibraryW(dll_path)
if not module:
    raise ctypes.WinError(ctypes.get_last_error())
try:
    use_module(module)
finally:
    if not kernel32.FreeLibrary(module):
        raise ctypes.WinError(ctypes.get_last_error())`,
    CreateRemoteThread: `thread_id = wintypes.DWORD()
thread_handle = CreateRemoteThread(
    process_handle,
    None,
    0,
    LPTHREAD_START_ROUTINE(load_library_address),
    remote_address,
    0,
    ctypes.byref(thread_id),
)
if not thread_handle:
    raise ctypes.WinError(ctypes.get_last_error())`,
    WaitForSingleObject: `result = WaitForSingleObject(thread_handle, timeout_ms)
if result == WAIT_OBJECT_0:
    pass  # The object became signaled.
elif result == WAIT_TIMEOUT:
    raise TimeoutError("the wait expired")
elif result == WAIT_FAILED:
    raise ctypes.WinError(ctypes.get_last_error())
else:
    raise RuntimeError(f"unexpected wait result: 0x{result:08X}")`,
    VirtualFreeEx: `if not VirtualFreeEx(process_handle, remote_address, 0, MEM_RELEASE):
    raise ctypes.WinError(ctypes.get_last_error())
remote_address = None`,
    CloseHandle: `if handle and not CloseHandle(handle):
    raise ctypes.WinError(ctypes.get_last_error())
handle = None`,
    GetLastError: `code = GetLastError()
# Read this only after a function documents both failure and last-error support.
error = ctypes.WinError(code)`,
    CreateNamedPipeW: `pipe = CreateNamedPipeW(pipe_name, open_mode, pipe_mode, max_instances, out_size, in_size, timeout_ms, None)
if pipe == ctypes.c_void_p(-1).value:  # INVALID_HANDLE_VALUE
    raise ctypes.WinError(ctypes.get_last_error())`,
    LocalFree: `remaining = LocalFree(memory)
if remaining:
    raise ctypes.WinError(ctypes.get_last_error())
memory = None`,
    GetNamedSecurityInfoW: `descriptor = ctypes.c_void_p()
status = GetNamedSecurityInfoW(path, object_type, security_info, None, None, None, None, ctypes.byref(descriptor))
if status != 0:  # ERROR_SUCCESS
    raise ctypes.WinError(status)`,
    RegOpenKeyExW: `key = wintypes.HKEY()
status = RegOpenKeyExW(root_key, subkey, 0, desired_access, ctypes.byref(key))
if status != 0:  # ERROR_SUCCESS
    raise ctypes.WinError(status)`,
    WinVerifyTrust: `status = WinVerifyTrust(window, ctypes.byref(action_id), ctypes.byref(trust_data))
if status != 0:
    raise OSError(status, "WinVerifyTrust rejected the subject")`,
    ReadFile: `buffer = ctypes.create_string_buffer(buffer_size)
bytes_read = wintypes.DWORD()
ok = ReadFile(handle, buffer, buffer_size, ctypes.byref(bytes_read), None)  # synchronous
if not ok:
    raise ctypes.WinError(ctypes.get_last_error())
data = buffer.raw[:bytes_read.value]`,
    WriteFile: `buffer = ctypes.create_string_buffer(data)
bytes_written = wintypes.DWORD()
ok = WriteFile(handle, buffer, len(data), ctypes.byref(bytes_written), None)  # synchronous
if not ok:
    raise ctypes.WinError(ctypes.get_last_error())
if bytes_written.value != len(data):
    raise RuntimeError("partial write")`,
    InterlockedExchangePointer: `# Keep the atomic replacement inside a compiled C/C++ helper:
# previous = InterlockedExchangePointer(target_slot, replacement)
# Expose a purpose-built helper function to Python only if this operation is
# genuinely required; do not attempt kernel32.InterlockedExchangePointer.
previous = compiled_atomic_helper.exchange_pointer(target_slot, replacement)`,
  };

  const directionOverrides = {
    "CreateProcessW.lpProcessInformation": "out",
    "CreateRemoteThread.lpThreadId": "out, optional",
    "GetModuleFileNameW.lpFilename": "out",
    "GetSystemInfo.lpSystemInfo": "out",
    "GlobalMemoryStatusEx.lpBuffer": "in, out",
    "VirtualProtect.lpflOldProtect": "out",
    "VirtualQueryEx.lpBuffer": "out",
    "WriteProcessMemory.lpBuffer": "in",
    "WriteProcessMemory.lpNumberOfBytesWritten": "out",
    "QueryWorkingSetEx.pv": "in, out",
    "AccessCheck.GenericMapping": "in, out",
    "AccessCheck.PrivilegeSet": "out",
    "AccessCheck.PrivilegeSetLength": "in, out",
    "AccessCheck.GrantedAccess": "out",
    "AccessCheck.AccessStatus": "out",
    "QueryServiceStatusEx.lpBuffer": "out",
    "QueryServiceStatusEx.pcbBytesNeeded": "out",
    "ControlService.lpServiceStatus": "out",
    "RegOpenKeyExW.phkResult": "out",
    "IsWow64Process2.pProcessMachine": "out",
    "IsWow64Process2.pNativeMachine": "out",
    "GetExitCodeProcess.lpExitCode": "out",
    "GetNativeSystemInfo.lpSystemInfo": "out",
    "GetWindowsDirectoryW.lpBuffer": "out",
    "OpenProcessToken.TokenHandle": "out",
    "DuplicateToken.DuplicateTokenHandle": "out",
    "GetNamedSecurityInfoW.ppsidOwner": "out, optional",
    "GetNamedSecurityInfoW.ppsidGroup": "out, optional",
    "GetNamedSecurityInfoW.ppDacl": "out, optional",
    "GetNamedSecurityInfoW.ppSacl": "out, optional",
    "GetNamedSecurityInfoW.ppSecurityDescriptor": "out",
    "MapGenericMask.AccessMask": "in, out",
    "MapGenericMask.GenericMapping": "in",
    "EnumProcessModules.lphModule": "out",
    "EnumProcessModules.lpcbNeeded": "out",
    "GetModuleFileNameExW.lpFilename": "out",
    "GetModuleFileNameW.nSize": "in",
    "GetModuleFileNameExW.nSize": "in",
    "QueryServiceStatusEx.cbBufSize": "in",
    "GetWindowsDirectoryW.uSize": "in",
    "ReadFile.lpBuffer": "out",
    "ReadFile.lpNumberOfBytesRead": "out",
    "WriteFile.lpBuffer": "in",
    "WriteFile.lpNumberOfBytesWritten": "out",
    "VirtualProtectEx.lpflOldProtect": "out",
  };

  function dllFor(name) {
    if (name === "InterlockedExchangePointer") return "Compiler intrinsic (no DLL export)";
    for (const [dll, names] of Object.entries(dllGroups)) if (names.has(name)) return dll;
    return "Kernel32.dll";
  }

  function categoryFor(name) {
    for (const [category, names] of Object.entries(moduleGroups)) if (names.has(name)) return category;
    return "Windows API";
  }

  function nativeType(pythonType) {
    return pythonType
      .replace(/ \| None/g, "")
      .replace(/ctypes\.POINTER\(([^)]+)\)/g, "$1 *")
      .replace(/POINTER\(([^)]+)\)/g, "$1 *")
      .replace(/ctypes\.c_size_t/g, "SIZE_T")
      .replace(/ctypes\.c_void_p/g, "PVOID")
      .replace(/ctypes\.c_int/g, "int")
      .replace(/ctypes\.c_ulonglong/g, "DWORD64")
      .replace(/wintypes\./g, "");
  }

  function usablePythonType(type) {
    return type
      .replace(/^int$/, "ctypes.c_int")
      .replace(/ \| None/g, "")
      .replace(/(^|[^.])POINTER\(/g, "$1ctypes.POINTER(")
      .replace(/SC_HANDLE/g, "wintypes.HANDLE")
      .replace(/DLL_DIRECTORY_COOKIE/g, "ctypes.c_void_p")
      .replace(/HHOOK/g, "wintypes.HANDLE")
      .replace(/wintypes\.LRESULT/g, "ctypes.c_ssize_t")
      .replace(/HOOKPROC/g, "HOOKPROC")
      .replace(/LPTHREAD_START_ROUTINE/g, "LPTHREAD_START_ROUTINE");
  }

  function direction(name, parameter) {
    const override = directionOverrides[`${name}.${parameter.name}`];
    if (override) return override;
    if (/output|receives|filled|reports the bytes/i.test(parameter.description || "")) return "out";
    if (parameter.type.includes(" | None") || /optional|null/i.test(parameter.description || "")) return "in, optional";
    return "in";
  }

  function nativeDeclaration(name, signature) {
    if (!signature.parameters.length) return `${nativeType(signature.returns)} ${name}(void);`;
    const params = signature.parameters.length
      ? signature.parameters.map((parameter) => `  [${direction(name, parameter)}] ${nativeType(parameter.type)} ${parameter.name}`).join(",\n")
      : "  void";
    return `${nativeType(signature.returns)} ${name}(\n${params}\n);`;
  }

  const structureDefinitions = {
    SECURITY_ATTRIBUTES: `class SECURITY_ATTRIBUTES(ctypes.Structure):
    _fields_ = [
        ("nLength", wintypes.DWORD),
        ("lpSecurityDescriptor", wintypes.LPVOID),
        ("bInheritHandle", wintypes.BOOL),
    ]`,
    SYSTEM_INFO: `class _SYSTEM_INFO_ARCHITECTURE(ctypes.Structure):
    _fields_ = [
        ("wProcessorArchitecture", wintypes.WORD),
        ("wReserved", wintypes.WORD),
    ]

class _SYSTEM_INFO_UNION(ctypes.Union):
    _anonymous_ = ("architecture",)
    _fields_ = [
        ("dwOemId", wintypes.DWORD),
        ("architecture", _SYSTEM_INFO_ARCHITECTURE),
    ]

class SYSTEM_INFO(ctypes.Structure):
    _anonymous_ = ("processor",)
    _fields_ = [
        ("processor", _SYSTEM_INFO_UNION),
        ("dwPageSize", wintypes.DWORD),
        ("lpMinimumApplicationAddress", wintypes.LPVOID),
        ("lpMaximumApplicationAddress", wintypes.LPVOID),
        ("dwActiveProcessorMask", ctypes.c_size_t),
        ("dwNumberOfProcessors", wintypes.DWORD),
        ("dwProcessorType", wintypes.DWORD),
        ("dwAllocationGranularity", wintypes.DWORD),
        ("wProcessorLevel", wintypes.WORD),
        ("wProcessorRevision", wintypes.WORD),
    ]`,
    PSAPI_WORKING_SET_EX_INFORMATION: `class PSAPI_WORKING_SET_EX_BLOCK(ctypes.Union):
    _fields_ = [("Flags", ctypes.c_size_t)]

class PSAPI_WORKING_SET_EX_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("VirtualAddress", wintypes.LPVOID),
        ("VirtualAttributes", PSAPI_WORKING_SET_EX_BLOCK),
    ]`,
    MEMORYSTATUSEX: `class MEMORYSTATUSEX(ctypes.Structure):
    _fields_ = [
        ("dwLength", wintypes.DWORD),
        ("dwMemoryLoad", wintypes.DWORD),
        ("ullTotalPhys", ctypes.c_ulonglong),
        ("ullAvailPhys", ctypes.c_ulonglong),
        ("ullTotalPageFile", ctypes.c_ulonglong),
        ("ullAvailPageFile", ctypes.c_ulonglong),
        ("ullTotalVirtual", ctypes.c_ulonglong),
        ("ullAvailVirtual", ctypes.c_ulonglong),
        ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
    ]`,
    MEMORY_BASIC_INFORMATION: `class MEMORY_BASIC_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("BaseAddress", wintypes.LPVOID),
        ("AllocationBase", wintypes.LPVOID),
        ("AllocationProtect", wintypes.DWORD),
        ("PartitionId", wintypes.WORD),
        ("RegionSize", ctypes.c_size_t),
        ("State", wintypes.DWORD),
        ("Protect", wintypes.DWORD),
        ("Type", wintypes.DWORD),
    ]`,
    GENERIC_MAPPING: `class GENERIC_MAPPING(ctypes.Structure):
    _fields_ = [
        ("GenericRead", wintypes.DWORD),
        ("GenericWrite", wintypes.DWORD),
        ("GenericExecute", wintypes.DWORD),
        ("GenericAll", wintypes.DWORD),
    ]`,
    SERVICE_STATUS: `class SERVICE_STATUS(ctypes.Structure):
    _fields_ = [
        ("dwServiceType", wintypes.DWORD),
        ("dwCurrentState", wintypes.DWORD),
        ("dwControlsAccepted", wintypes.DWORD),
        ("dwWin32ExitCode", wintypes.DWORD),
        ("dwServiceSpecificExitCode", wintypes.DWORD),
        ("dwCheckPoint", wintypes.DWORD),
        ("dwWaitHint", wintypes.DWORD),
    ]`,
    RUNTIME_FUNCTION: `class RUNTIME_FUNCTION(ctypes.Structure):
    # x64 form; use the architecture-specific Windows definition for other targets.
    _fields_ = [
        ("BeginAddress", wintypes.DWORD),
        ("EndAddress", wintypes.DWORD),
        ("UnwindData", wintypes.DWORD),
    ]`,
    GUID: `class GUID(ctypes.Structure):
    _fields_ = [
        ("Data1", wintypes.DWORD),
        ("Data2", wintypes.WORD),
        ("Data3", wintypes.WORD),
        ("Data4", wintypes.BYTE * 8),
    ]`,
    WINTRUST_DATA: `class WINTRUST_FILE_INFO(ctypes.Structure):
    _fields_ = [
        ("cbStruct", wintypes.DWORD),
        ("pcwszFilePath", wintypes.LPCWSTR),
        ("hFile", wintypes.HANDLE),
        ("pgKnownSubject", ctypes.POINTER(GUID)),
    ]

class _WINTRUST_DATA_UNION(ctypes.Union):
    _fields_ = [
        ("pFile", ctypes.POINTER(WINTRUST_FILE_INFO)),
        ("pCatalog", ctypes.c_void_p),
        ("pBlob", ctypes.c_void_p),
        ("pSgnr", ctypes.c_void_p),
        ("pCert", ctypes.c_void_p),
    ]

class WINTRUST_DATA(ctypes.Structure):
    _anonymous_ = ("subject",)
    _fields_ = [
        ("cbStruct", wintypes.DWORD),
        ("pPolicyCallbackData", ctypes.c_void_p),
        ("pSIPClientData", ctypes.c_void_p),
        ("dwUIChoice", wintypes.DWORD),
        ("fdwRevocationChecks", wintypes.DWORD),
        ("dwUnionChoice", wintypes.DWORD),
        ("subject", _WINTRUST_DATA_UNION),
        ("dwStateAction", wintypes.DWORD),
        ("hWVTStateData", wintypes.HANDLE),
        ("pwszURLReference", wintypes.LPWSTR),
        ("dwProvFlags", wintypes.DWORD),
        ("dwUIContext", wintypes.DWORD),
        ("pSignatureSettings", ctypes.c_void_p),
    ]`,
  };

  function pythonDeclaration(name, signature, dll) {
    const variable = dll.replace(/\.dll$/i, "").toLowerCase();
    if (name === "InterlockedExchangePointer") {
      return `# InterlockedExchangePointer is a compiler intrinsic, not a named
# Kernel32.dll export that ctypes can resolve. Keep this operation in a small,
# architecture-matched compiled helper, or choose a higher-level synchronized
# design. Do not write kernel32.InterlockedExchangePointer.argtypes/restype.`;
    }
    const prelude = [];
    const signatureTypes = [...signature.parameters.map((parameter) => parameter.type), signature.returns].join(" ");
    for (const [structure, declaration] of Object.entries(structureDefinitions)) {
      if (new RegExp(`\\b${structure}\\b`).test(signatureTypes)) prelude.push(declaration);
    }
    if (name === "CreateProcessW") {
      prelude.push(`class STARTUPINFOW(ctypes.Structure):
    _fields_ = [
        ("cb", wintypes.DWORD), ("lpReserved", wintypes.LPWSTR),
        ("lpDesktop", wintypes.LPWSTR), ("lpTitle", wintypes.LPWSTR),
        ("dwX", wintypes.DWORD), ("dwY", wintypes.DWORD),
        ("dwXSize", wintypes.DWORD), ("dwYSize", wintypes.DWORD),
        ("dwXCountChars", wintypes.DWORD), ("dwYCountChars", wintypes.DWORD),
        ("dwFillAttribute", wintypes.DWORD), ("dwFlags", wintypes.DWORD),
        ("wShowWindow", wintypes.WORD), ("cbReserved2", wintypes.WORD),
        ("lpReserved2", ctypes.POINTER(wintypes.BYTE)),
        ("hStdInput", wintypes.HANDLE), ("hStdOutput", wintypes.HANDLE),
        ("hStdError", wintypes.HANDLE),
    ]

class PROCESS_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("hProcess", wintypes.HANDLE), ("hThread", wintypes.HANDLE),
        ("dwProcessId", wintypes.DWORD), ("dwThreadId", wintypes.DWORD),
    ]`);
    }
    if (signature.parameters.some((parameter) => parameter.type.includes("LPTHREAD_START_ROUTINE"))) {
      prelude.push("LPTHREAD_START_ROUTINE = ctypes.WINFUNCTYPE(wintypes.DWORD, wintypes.LPVOID)");
    }
    if (signature.parameters.some((parameter) => parameter.type.includes("HOOKPROC"))) {
      prelude.push("HOOKPROC = ctypes.WINFUNCTYPE(ctypes.c_ssize_t, ctypes.c_int, wintypes.WPARAM, wintypes.LPARAM)");
    }
    const argumentLines = signature.parameters.length
      ? signature.parameters.map((parameter) => `    ${usablePythonType(parameter.type)},  # ${parameter.name}`).join("\n")
      : "";
    return [
      "import ctypes",
      "from ctypes import wintypes",
      "",
      ...prelude,
      ...(prelude.length ? [""] : []),
      `${variable} = ctypes.WinDLL("${dll}", use_last_error=True)`,
      `${name} = ${variable}.${name}`,
      `${name}.argtypes = [${argumentLines ? `\n${argumentLines}\n` : ""}]`,
      `${name}.restype = ${usablePythonType(signature.returns)}`,
    ].join("\n");
  }

  function defaultResult(signature) {
    const result = signature.returns;
    if (/BOOL|BOOLEAN/.test(result)) return "Zero indicates failure; capture ctypes.get_last_error() immediately when Microsoft documents extended error information. Nonzero indicates success.";
    if (/HANDLE|HMODULE|LPVOID|c_void_p|HHOOK/.test(result)) return "A null result indicates failure. Capture ctypes.get_last_error() immediately before another foreign call can replace it.";
    if (result === "None") return "The function returns no value; inspect its documented output parameters or resulting system state.";
    return `Returns ${result}. Compare it with the named values or failure rule documented for this API.`;
  }

  function defaultCleanup(name) {
    return cleanupByName[name] || "The call does not transfer a new resource in the normal path. Keep caller-owned buffers, structures, and callbacks alive for the documented duration.";
  }

  function checkedExample(name, signature) {
    if (examplesByName[name]) return examplesByName[name];
    const argumentsList = signature.parameters.length
      ? signature.parameters.map((parameter) => `    ${parameter.name},`).join("\n")
      : "";
    const call = `${name}(${argumentsList ? `\n${argumentsList}\n` : ""})`;
    if (signature.returns === "None") return `${call}\n# Inspect the documented output object or resulting system state.`;
    if (/BOOL|BOOLEAN/.test(signature.returns)) return `ok = ${call}\nif not ok:\n    raise ctypes.WinError(ctypes.get_last_error())`;
    if (/HANDLE|HMODULE|LPVOID|c_void_p|HHOOK/.test(signature.returns)) return `result = ${call}\nif not result:\n    raise ctypes.WinError(ctypes.get_last_error())`;
    return `result = ${call}\n# Interpret result using the named values and failure rule shown below.`;
  }

  const nativeRecords = new Map();
  for (const [key, value] of Object.entries(signatures)) {
    if (!key.startsWith("ctypes / ctypes.wintypes::")) continue;
    if (!(value.sources || []).some((source) => source.includes("learn.microsoft.com"))) continue;
    for (const signature of value.signatures || []) {
      nativeRecords.set(signature.name, { signature, sources: value.sources });
    }
  }
  for (const [name, value] of Object.entries(extraSignatures)) {
    nativeRecords.set(name, { signature: { name, parameters: value.parameters, returns: value.returns }, sources: [value.source] });
  }

  const entries = [...nativeRecords.entries()].map(([name, record]) => {
    const dll = dllFor(name);
    const feature = featureIndex.get(name)?.[0];
    return {
      name,
      category: categoryFor(name),
      summary: feature ? `${feature.task}. ${feature.detail}` : `Use the Windows ${name} operation through its documented native contract.`,
      dll,
      nativeSignature: nativeDeclaration(name, record.signature),
      python: pythonDeclaration(name, record.signature, dll),
      example: checkedExample(name, record.signature),
      parameters: record.signature.parameters.map((parameter) => ({
        name: parameter.name,
        direction: direction(name, parameter),
        native: nativeType(parameter.type),
        python: usablePythonType(parameter.type),
        explanation: parameter.description || "Use the value required by the Microsoft contract.",
      })),
      result: resultByName[name] || defaultResult(record.signature),
      cleanup: defaultCleanup(name),
      pywin32: pywin32Names[name] || "No direct pywin32 wrapper is used by this course; use the ctypes declaration when this operation is required.",
      sources: record.sources,
    };
  }).sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name));

  window.ILOVEOS_WINDOWS_API_GUIDE = {
    typeMappings,
    entries,
    workflow: [
      ["Choose the Python path", "Use a clear pywin32 wrapper when one exists. Use ctypes for missing coverage or when the assignment is explicitly about the native ABI."],
      ["Read the native declaration", "Identify the DLL, Unicode export, parameter directions, optional pointers, return type, failure sentinel, extended-error rule, and cleanup API."],
      ["Translate the types", "Map each typedef by width and pointer level. SIZE_T is pointer-sized; SIZE_T * is a pointer to a c_size_t output object."],
      ["Declare before calling", "Create an explicit WinDLL with use_last_error=True where appropriate, then assign every argtype and the exact restype before the first call."],
      ["Build owned inputs and outputs", "Create writable strings, byte buffers, structures, output values, and callbacks explicitly, then pass pointers with byref where the declaration expects them."],
      ["Check and clean up", "Test the API-specific result immediately, capture last error only when documented, verify partial outputs, and place every acquired resource in a guaranteed cleanup path."],
    ],
  };
})();
