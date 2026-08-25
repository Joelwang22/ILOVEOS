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
    CreateEventW: { parameters: [{ name: "lpEventAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional SECURITY_ATTRIBUTES pointer." }, { name: "bManualReset", type: "wintypes.BOOL", description: "True for manual reset; false for auto reset." }, { name: "bInitialState", type: "wintypes.BOOL", description: "Initial signaled state." }, { name: "lpName", type: "wintypes.LPCWSTR | None", description: "Optional UTF-16 object name." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-createeventw" },
    CreateEventA: { parameters: [{ name: "lpEventAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional SECURITY_ATTRIBUTES pointer." }, { name: "bManualReset", type: "wintypes.BOOL", description: "True for manual reset; false for auto reset." }, { name: "bInitialState", type: "wintypes.BOOL", description: "Initial signaled state." }, { name: "lpName", type: "wintypes.LPCSTR | None", description: "Optional code-page event name as bytes." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-createeventa" },
    CreateEventExW: { parameters: [{ name: "lpEventAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional SECURITY_ATTRIBUTES pointer." }, { name: "lpName", type: "wintypes.LPCWSTR | None", description: "Optional UTF-16 object name." }, { name: "dwFlags", type: "wintypes.DWORD", description: "CREATE_EVENT_* flags selecting event behavior." }, { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Explicit access rights requested for the event handle." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-createeventexw" },
    CreateEventExA: { parameters: [{ name: "lpEventAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional SECURITY_ATTRIBUTES pointer." }, { name: "lpName", type: "wintypes.LPCSTR | None", description: "Optional code-page event name as bytes." }, { name: "dwFlags", type: "wintypes.DWORD", description: "CREATE_EVENT_* flags selecting event behavior." }, { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Explicit access rights requested for the event handle." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-createeventexa" },
    CreateMutexW: { parameters: [{ name: "lpMutexAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional security and inheritance attributes." }, { name: "bInitialOwner", type: "wintypes.BOOL", description: "Whether the creating thread requests initial ownership." }, { name: "lpName", type: "wintypes.LPCWSTR | None", description: "Optional UTF-16 object name." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-createmutexw" },
    WaitForMultipleObjects: { parameters: [{ name: "nCount", type: "wintypes.DWORD", description: "Number of handles in lpHandles." }, { name: "lpHandles", type: "ctypes.POINTER(wintypes.HANDLE)", description: "Input array of waitable handles." }, { name: "bWaitAll", type: "wintypes.BOOL", description: "Wait for all handles or any one handle." }, { name: "dwMilliseconds", type: "wintypes.DWORD", description: "Timeout in milliseconds or INFINITE." }], returns: "wintypes.DWORD", source: "https://learn.microsoft.com/windows/win32/api/synchapi/nf-synchapi-waitformultipleobjects" },
    ReadFile: { parameters: [{ name: "hFile", type: "wintypes.HANDLE", description: "Readable file, pipe, or device handle." }, { name: "lpBuffer", type: "wintypes.LPVOID", description: "Writable output buffer." }, { name: "nNumberOfBytesToRead", type: "wintypes.DWORD", description: "Requested byte count." }, { name: "lpNumberOfBytesRead", type: "ctypes.POINTER(wintypes.DWORD) | None", description: "Output byte count for synchronous I/O." }, { name: "lpOverlapped", type: "ctypes.c_void_p | None", description: "Optional OVERLAPPED pointer for asynchronous I/O." }], returns: "wintypes.BOOL", source: "https://learn.microsoft.com/windows/win32/api/fileapi/nf-fileapi-readfile" },
    WriteFile: { parameters: [{ name: "hFile", type: "wintypes.HANDLE", description: "Writable file, pipe, or device handle." }, { name: "lpBuffer", type: "wintypes.LPCVOID", description: "Caller-owned source bytes." }, { name: "nNumberOfBytesToWrite", type: "wintypes.DWORD", description: "Requested byte count." }, { name: "lpNumberOfBytesWritten", type: "ctypes.POINTER(wintypes.DWORD) | None", description: "Output byte count for synchronous I/O." }, { name: "lpOverlapped", type: "ctypes.c_void_p | None", description: "Optional OVERLAPPED pointer for asynchronous I/O." }], returns: "wintypes.BOOL", source: "https://learn.microsoft.com/windows/win32/api/fileapi/nf-fileapi-writefile" },
    CreateNamedPipeW: { parameters: [{ name: "lpName", type: "wintypes.LPCWSTR", description: "Canonical UTF-16 pipe name." }, { name: "dwOpenMode", type: "wintypes.DWORD", description: "Direction, overlap, and first-instance flags." }, { name: "dwPipeMode", type: "wintypes.DWORD", description: "Byte/message type, read mode, and wait mode." }, { name: "nMaxInstances", type: "wintypes.DWORD", description: "Maximum simultaneous instances." }, { name: "nOutBufferSize", type: "wintypes.DWORD", description: "Advisory output buffer size." }, { name: "nInBufferSize", type: "wintypes.DWORD", description: "Advisory input buffer size." }, { name: "nDefaultTimeOut", type: "wintypes.DWORD", description: "Default client wait timeout." }, { name: "lpSecurityAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional security and inheritance attributes." }], returns: "wintypes.HANDLE", source: "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-createnamedpipew" },
    OpenThread: { parameters: [{ name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Minimum THREAD_* access mask." }, { name: "bInheritHandle", type: "wintypes.BOOL", description: "Whether a child may inherit the handle." }, { name: "dwThreadId", type: "wintypes.DWORD", description: "Target thread identifier." }], returns: "wintypes.HANDLE | None", source: "https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-openthread" },
    VirtualProtectEx: { parameters: [{ name: "hProcess", type: "wintypes.HANDLE", description: "Target process with PROCESS_VM_OPERATION." }, { name: "lpAddress", type: "wintypes.LPVOID", description: "Start of the committed target range." }, { name: "dwSize", type: "ctypes.c_size_t", description: "Byte count to protect." }, { name: "flNewProtect", type: "wintypes.DWORD", description: "New PAGE_* protection." }, { name: "lpflOldProtect", type: "ctypes.POINTER(wintypes.DWORD)", description: "Output receiving the prior protection." }], returns: "wintypes.BOOL", source: "https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-virtualprotectex" },
    MessageBoxA: { parameters: [{ name: "hWnd", type: "wintypes.HWND | None", description: "Optional owner window." }, { name: "lpText", type: "wintypes.LPCSTR", description: "ANSI message bytes." }, { name: "lpCaption", type: "wintypes.LPCSTR", description: "ANSI caption bytes." }, { name: "uType", type: "wintypes.UINT", description: "Buttons, icon, modality, and default-button flags." }], returns: "ctypes.c_int", source: "https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-messageboxa" },
    CreateNamedPipeA: {
      parameters: [
        { name: "lpName", type: "wintypes.LPCSTR", description: "Canonical pipe name encoded as ANSI bytes." },
        { name: "dwOpenMode", type: "wintypes.DWORD", description: "Direction, overlap, and first-instance flags." },
        { name: "dwPipeMode", type: "wintypes.DWORD", description: "Byte/message type, read mode, and wait mode." },
        { name: "nMaxInstances", type: "wintypes.DWORD", description: "Maximum simultaneous instances." },
        { name: "nOutBufferSize", type: "wintypes.DWORD", description: "Advisory output buffer size." },
        { name: "nInBufferSize", type: "wintypes.DWORD", description: "Advisory input buffer size." },
        { name: "nDefaultTimeOut", type: "wintypes.DWORD", description: "Default client wait timeout in milliseconds." },
        { name: "lpSecurityAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional security and inheritance attributes." },
      ],
      returns: "wintypes.HANDLE",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-createnamedpipea",
    },
    MessageBoxW: {
      parameters: [
        { name: "hWnd", type: "wintypes.HWND | None", description: "Optional owner window." },
        { name: "lpText", type: "wintypes.LPCWSTR", description: "UTF-16 message text." },
        { name: "lpCaption", type: "wintypes.LPCWSTR", description: "UTF-16 caption text." },
        { name: "uType", type: "wintypes.UINT", description: "Buttons, icon, modality, and default-button flags." },
      ],
      returns: "ctypes.c_int",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-messageboxw",
    },
    SetWindowsHookExA: {
      parameters: [
        { name: "idHook", type: "ctypes.c_int", description: "WH_* hook type defining callback meaning and delivery rules." },
        { name: "lpfn", type: "HOOKPROC", description: "ABI-correct callback retained for the full hook lifetime." },
        { name: "hmod", type: "wintypes.HINSTANCE | None", description: "Module containing the callback when required for cross-process scope." },
        { name: "dwThreadId", type: "wintypes.DWORD", description: "Target thread ID, or zero for a supported desktop-wide scope." },
      ],
      returns: "HHOOK | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowshookexa",
    },
    CreateFileMappingA: {
      parameters: [
        { name: "hFile", type: "wintypes.HANDLE", description: "File handle, or INVALID_HANDLE_VALUE for page-file-backed storage." },
        { name: "lpFileMappingAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional security and inheritance attributes." },
        { name: "flProtect", type: "wintypes.DWORD", description: "Page protection and optional section attributes." },
        { name: "dwMaximumSizeHigh", type: "wintypes.DWORD", description: "High 32 bits of the maximum mapping size." },
        { name: "dwMaximumSizeLow", type: "wintypes.DWORD", description: "Low 32 bits of the maximum mapping size." },
        { name: "lpName", type: "wintypes.LPCSTR | None", description: "Optional mapping name encoded as ANSI bytes." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-createfilemappinga",
    },
    MapViewOfFileEx: {
      parameters: [
        { name: "hFileMappingObject", type: "wintypes.HANDLE", description: "Open file-mapping handle." },
        { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "FILE_MAP_* access for this view." },
        { name: "dwFileOffsetHigh", type: "wintypes.DWORD", description: "High 32 bits of the allocation-granularity-aligned offset." },
        { name: "dwFileOffsetLow", type: "wintypes.DWORD", description: "Low 32 bits of the mapping offset." },
        { name: "dwNumberOfBytesToMap", type: "ctypes.c_size_t", description: "View size, or zero for the remaining mapping." },
        { name: "lpBaseAddress", type: "wintypes.LPVOID | None", description: "Suggested base address; null lets Windows choose." },
      ],
      returns: "wintypes.LPVOID | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-mapviewoffileex",
    },
    OpenFileMappingA: {
      parameters: [
        { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "FILE_MAP_* access required for the intended view." },
        { name: "bInheritHandle", type: "wintypes.BOOL", description: "Whether child processes may inherit the returned handle." },
        { name: "lpName", type: "wintypes.LPCSTR", description: "Existing mapping name encoded as ANSI bytes." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-openfilemappinga",
    },
    EnumProcessModulesEx: {
      parameters: [
        { name: "hProcess", type: "wintypes.HANDLE", description: "Process whose loaded modules will be enumerated." },
        { name: "lphModule", type: "ctypes.POINTER(wintypes.HMODULE)", description: "Output array receiving borrowed module handles." },
        { name: "cb", type: "wintypes.DWORD", description: "Size of the output array in bytes." },
        { name: "lpcbNeeded", type: "ctypes.POINTER(wintypes.DWORD)", description: "Output receiving bytes required for the complete list." },
        { name: "dwFilterFlag", type: "wintypes.DWORD", description: "LIST_MODULES_* architecture filter." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/psapi/nf-psapi-enumprocessmodulesex",
    },
    GetModuleFileNameExA: {
      parameters: [
        { name: "hProcess", type: "wintypes.HANDLE", description: "Process containing the module." },
        { name: "hModule", type: "wintypes.HMODULE | None", description: "Module handle, or null for the main executable where supported." },
        { name: "lpFilename", type: "wintypes.LPSTR", description: "Writable ANSI path buffer." },
        { name: "nSize", type: "wintypes.DWORD", description: "Buffer capacity in bytes." },
      ],
      returns: "wintypes.DWORD",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/psapi/nf-psapi-getmodulefilenameexa",
    },
    GetModuleFileNameA: {
      parameters: [
        { name: "hModule", type: "wintypes.HMODULE | None", description: "Loaded module handle, or null for the current executable." },
        { name: "lpFilename", type: "wintypes.LPSTR", description: "Caller-owned ANSI output buffer." },
        { name: "nSize", type: "wintypes.DWORD", description: "Output-buffer capacity measured in bytes." },
      ],
      returns: "wintypes.DWORD",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-getmodulefilenamea",
    },
    GetModuleHandleA: {
      parameters: [{ name: "lpModuleName", type: "wintypes.LPCSTR | None", description: "Loaded module basename as ANSI bytes, or null for the executable." }],
      returns: "wintypes.HMODULE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-getmodulehandlea",
    },
    LoadLibraryExA: {
      parameters: [
        { name: "lpLibFileName", type: "wintypes.LPCSTR", description: "ANSI DLL path or name interpreted according to flags and search policy." },
        { name: "hFile", type: "wintypes.HANDLE | None", description: "Reserved; pass null." },
        { name: "dwFlags", type: "wintypes.DWORD", description: "Load behavior and LOAD_LIBRARY_SEARCH_* flags." },
      ],
      returns: "wintypes.HMODULE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibraryexa",
    },
    CreateMutexA: {
      parameters: [
        { name: "lpMutexAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional security and inheritance attributes." },
        { name: "bInitialOwner", type: "wintypes.BOOL", description: "Whether the creating thread requests initial ownership." },
        { name: "lpName", type: "wintypes.LPCSTR | None", description: "Optional mutex name encoded as ANSI bytes." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createmutexa",
    },
    CreateMutexExW: {
      parameters: [
        { name: "lpMutexAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional security and inheritance attributes." },
        { name: "lpName", type: "wintypes.LPCWSTR | None", description: "Optional UTF-16 mutex name." },
        { name: "dwFlags", type: "wintypes.DWORD", description: "CREATE_MUTEX_* creation flags." },
        { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Explicit access requested for the returned mutex handle." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createmutexexw",
    },
    CreateMutexExA: {
      parameters: [
        { name: "lpMutexAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional security and inheritance attributes." },
        { name: "lpName", type: "wintypes.LPCSTR | None", description: "Optional mutex name encoded as ANSI bytes." },
        { name: "dwFlags", type: "wintypes.DWORD", description: "CREATE_MUTEX_* creation flags." },
        { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Explicit access requested for the returned mutex handle." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createmutexexa",
    },
    CreateProcessA: {
      parameters: [
        { name: "lpApplicationName", type: "wintypes.LPCSTR | None", description: "Optional executable module name as ANSI bytes." },
        { name: "lpCommandLine", type: "wintypes.LPSTR | None", description: "Writable ANSI command-line buffer." },
        { name: "lpProcessAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional process-handle security and inheritance attributes." },
        { name: "lpThreadAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional thread-handle security and inheritance attributes." },
        { name: "bInheritHandles", type: "wintypes.BOOL", description: "Whether eligible caller handles are inherited." },
        { name: "dwCreationFlags", type: "wintypes.DWORD", description: "CREATE_* flags controlling process and primary-thread creation." },
        { name: "lpEnvironment", type: "ctypes.c_void_p | None", description: "Optional environment block with encoding matching the flags." },
        { name: "lpCurrentDirectory", type: "wintypes.LPCSTR | None", description: "Optional ANSI current-directory path." },
        { name: "lpStartupInfo", type: "ctypes.POINTER(STARTUPINFOA)", description: "Initialized ANSI startup settings." },
        { name: "lpProcessInformation", type: "ctypes.POINTER(PROCESS_INFORMATION)", description: "Output receiving owned process and thread handles plus identifiers." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessa",
    },
    CreateRemoteThreadEx: {
      parameters: [
        { name: "hProcess", type: "wintypes.HANDLE", description: "Authorized target process handle with the documented combined rights." },
        { name: "lpThreadAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional thread security and inheritance attributes." },
        { name: "dwStackSize", type: "ctypes.c_size_t", description: "Initial stack size, with zero selecting the executable default." },
        { name: "lpStartAddress", type: "LPTHREAD_START_ROUTINE", description: "Valid target-process function following the target ABI." },
        { name: "lpParameter", type: "wintypes.LPVOID | None", description: "Target-process parameter address or null." },
        { name: "dwCreationFlags", type: "wintypes.DWORD", description: "Thread creation flags such as CREATE_SUSPENDED." },
        { name: "lpAttributeList", type: "ctypes.c_void_p | None", description: "Optional initialized PROC_THREAD_ATTRIBUTE_LIST." },
        { name: "lpThreadId", type: "ctypes.POINTER(wintypes.DWORD) | None", description: "Optional output receiving the thread identifier." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createremotethreadex",
    },
    DuplicateTokenEx: {
      parameters: [
        { name: "hExistingToken", type: "wintypes.HANDLE", description: "Existing token handle with TOKEN_DUPLICATE access." },
        { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Access requested for the duplicate, or zero for the source token's access." },
        { name: "lpTokenAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", description: "Optional security and inheritance attributes." },
        { name: "ImpersonationLevel", type: "ctypes.c_int", description: "SECURITY_IMPERSONATION_LEVEL for an impersonation token." },
        { name: "TokenType", type: "ctypes.c_int", description: "TOKEN_TYPE selecting a primary or impersonation token." },
        { name: "phNewToken", type: "ctypes.POINTER(wintypes.HANDLE)", description: "Output receiving an owned duplicate-token handle." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-duplicatetokenex",
    },
    GetNamedSecurityInfoA: {
      parameters: [
        { name: "pObjectName", type: "wintypes.LPCSTR", description: "Named securable object encoded as ANSI bytes." },
        { name: "ObjectType", type: "ctypes.c_int", description: "SE_OBJECT_TYPE identifying the object family." },
        { name: "SecurityInfo", type: "wintypes.DWORD", description: "SECURITY_INFORMATION flags selecting descriptor parts." },
        { name: "ppsidOwner", type: "ctypes.POINTER(ctypes.c_void_p) | None", description: "Optional output for the owner SID pointer." },
        { name: "ppsidGroup", type: "ctypes.POINTER(ctypes.c_void_p) | None", description: "Optional output for the primary-group SID pointer." },
        { name: "ppDacl", type: "ctypes.POINTER(ctypes.c_void_p) | None", description: "Optional output for the DACL pointer." },
        { name: "ppSacl", type: "ctypes.POINTER(ctypes.c_void_p) | None", description: "Optional output for the SACL pointer." },
        { name: "ppSecurityDescriptor", type: "ctypes.POINTER(ctypes.c_void_p)", description: "Output receiving the LocalAlloc-backed descriptor." },
      ],
      returns: "wintypes.DWORD",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getnamedsecurityinfoa",
    },
    OpenSCManagerA: {
      parameters: [
        { name: "lpMachineName", type: "wintypes.LPCSTR | None", description: "Remote machine as ANSI bytes, or null for local." },
        { name: "lpDatabaseName", type: "wintypes.LPCSTR | None", description: "Service database as ANSI bytes, or null for active services." },
        { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "SC_MANAGER_* access requested for the SCM handle." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-openscmanagera",
    },
    OpenServiceA: {
      parameters: [
        { name: "hSCManager", type: "wintypes.HANDLE", description: "SCM handle with SC_MANAGER_CONNECT access." },
        { name: "lpServiceName", type: "wintypes.LPCSTR", description: "Internal service name encoded as ANSI bytes." },
        { name: "dwDesiredAccess", type: "wintypes.DWORD", description: "Action-specific SERVICE_* access requested." },
      ],
      returns: "wintypes.HANDLE | None",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-openservicea",
    },
    QueryServiceStatus: {
      parameters: [
        { name: "hService", type: "wintypes.HANDLE", description: "Service handle with SERVICE_QUERY_STATUS access." },
        { name: "lpServiceStatus", type: "ctypes.POINTER(SERVICE_STATUS)", description: "Output receiving the most recently reported basic status." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-queryservicestatus",
    },
    RegOpenKeyExA: {
      parameters: [
        { name: "hKey", type: "wintypes.HKEY", description: "Predefined root or open parent key." },
        { name: "lpSubKey", type: "wintypes.LPCSTR | None", description: "Relative subkey encoded as ANSI bytes, or null or empty for the same key." },
        { name: "ulOptions", type: "wintypes.DWORD", description: "Open options, normally zero." },
        { name: "samDesired", type: "wintypes.DWORD", description: "KEY_* access mask and optional WOW64 view flag." },
        { name: "phkResult", type: "ctypes.POINTER(wintypes.HKEY)", description: "Output receiving an owned HKEY on ERROR_SUCCESS." },
      ],
      returns: "wintypes.LONG",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regopenkeyexa",
    },
    StartServiceA: {
      parameters: [
        { name: "hService", type: "wintypes.HANDLE", description: "Service handle with SERVICE_START access." },
        { name: "dwNumServiceArgs", type: "wintypes.DWORD", description: "Count of service-specific arguments." },
        { name: "lpServiceArgVectors", type: "ctypes.POINTER(wintypes.LPCSTR) | None", description: "ANSI argument array, or null when the count is zero." },
      ],
      returns: "wintypes.BOOL",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-startservicea",
    },
    GetWindowsDirectoryA: {
      parameters: [
        { name: "lpBuffer", type: "wintypes.LPSTR", description: "Writable ANSI output buffer for the Windows directory." },
        { name: "uSize", type: "wintypes.UINT", description: "Capacity of the buffer in bytes." },
      ],
      returns: "wintypes.UINT",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-getwindowsdirectorya",
    },
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
    "Memory and address spaces": new Set(["GetSystemInfo", "GetNativeSystemInfo", "GlobalMemoryStatusEx", "QueryWorkingSetEx", "VirtualAlloc", "VirtualAllocEx", "VirtualFree", "VirtualFreeEx", "VirtualProtect", "VirtualProtectEx", "VirtualQueryEx", "CreateFileMappingW", "CreateFileMappingA", "OpenFileMappingW", "OpenFileMappingA", "MapViewOfFile", "MapViewOfFileEx", "UnmapViewOfFile", "GetProcessHeap", "HeapAlloc", "HeapSize", "HeapFree", "WriteProcessMemory"]),
    "Processes, threads, and handles": new Set(["CreateProcessW", "CreateProcessA", "GetCurrentProcess", "GetExitCodeProcess", "OpenProcess", "OpenThread", "CreateRemoteThread", "CreateRemoteThreadEx", "WaitForSingleObject", "WaitForMultipleObjects", "CloseHandle", "FlushInstructionCache", "IsWow64Process2", "CreateEventW", "CreateEventA", "CreateEventExW", "CreateEventExA", "CreateMutexW", "CreateMutexA", "CreateMutexExW", "CreateMutexExA"]),
    "Files, pipes, and devices": new Set(["ReadFile", "WriteFile", "CreateNamedPipeW", "CreateNamedPipeA"]),
    "Modules and loading": new Set(["EnumProcessModules", "EnumProcessModulesEx", "GetModuleHandleW", "GetModuleHandleA", "GetModuleFileNameW", "GetModuleFileNameA", "GetModuleFileNameExW", "GetModuleFileNameExA", "GetProcAddress", "LoadLibraryA", "LoadLibraryW", "LoadLibraryExW", "LoadLibraryExA", "FreeLibrary", "SetDefaultDllDirectories", "AddDllDirectory", "RtlAddFunctionTable"]),
    "Services and Registry": new Set(["OpenSCManagerW", "OpenSCManagerA", "OpenServiceW", "OpenServiceA", "StartServiceW", "StartServiceA", "ControlService", "QueryServiceStatusEx", "QueryServiceStatus", "CloseServiceHandle", "RegOpenKeyExW", "RegOpenKeyExA"]),
    "Security and trust": new Set(["AccessCheck", "OpenProcessToken", "DuplicateToken", "DuplicateTokenEx", "GetNamedSecurityInfoW", "GetNamedSecurityInfoA", "MapGenericMask", "LocalFree", "WinVerifyTrust"]),
    "Hooks and desktop APIs": new Set(["SetWindowsHookExW", "SetWindowsHookExA", "CallNextHookEx", "UnhookWindowsHookEx", "InterlockedExchangePointer", "MessageBoxW", "MessageBoxA"]),
    "System information and errors": new Set(["GetLastError", "GetWindowsDirectoryW", "GetWindowsDirectoryA"]),
  };

  const dllGroups = {
    "Advapi32.dll": new Set(["AccessCheck", "OpenProcessToken", "DuplicateToken", "DuplicateTokenEx", "GetNamedSecurityInfoW", "GetNamedSecurityInfoA", "MapGenericMask", "OpenSCManagerW", "OpenSCManagerA", "OpenServiceW", "OpenServiceA", "StartServiceW", "StartServiceA", "ControlService", "QueryServiceStatusEx", "QueryServiceStatus", "CloseServiceHandle", "RegOpenKeyExW", "RegOpenKeyExA"]),
    "User32.dll": new Set(["SetWindowsHookExW", "SetWindowsHookExA", "CallNextHookEx", "UnhookWindowsHookEx", "MessageBoxW", "MessageBoxA"]),
    "Psapi.dll": new Set(["QueryWorkingSetEx", "EnumProcessModules", "EnumProcessModulesEx", "GetModuleFileNameExW", "GetModuleFileNameExA"]),
    "Wintrust.dll": new Set(["WinVerifyTrust"]),
  };

  const pywin32Names = {
    OpenProcess: "win32api.OpenProcess",
    GetCurrentProcess: "win32api.GetCurrentProcess",
    GetExitCodeProcess: "win32process.GetExitCodeProcess",
    GetModuleHandleW: "win32api.GetModuleHandle",
    GetModuleHandleA: "win32api.GetModuleHandle",
    GetProcAddress: "win32api.GetProcAddress",
    LoadLibraryW: "win32api.LoadLibrary",
    LoadLibraryA: "win32api.LoadLibrary",
    LoadLibraryExW: "win32api.LoadLibraryEx",
    LoadLibraryExA: "win32api.LoadLibraryEx",
    FreeLibrary: "win32api.FreeLibrary",
    EnumProcessModules: "win32process.EnumProcessModules",
    EnumProcessModulesEx: "win32process.EnumProcessModulesEx",
    GetModuleFileNameExW: "win32process.GetModuleFileNameEx",
    GetModuleFileNameExA: "win32process.GetModuleFileNameEx",
    GetModuleFileNameW: "win32api.GetModuleFileName",
    GetModuleFileNameA: "win32api.GetModuleFileName",
    CreateProcessW: "win32process.CreateProcess",
    CreateProcessA: "win32process.CreateProcess",
    CreateRemoteThread: "win32process.CreateRemoteThread",
    WaitForSingleObject: "win32event.WaitForSingleObject",
    CloseHandle: "win32api.CloseHandle or PyHANDLE.Close",
    VirtualAllocEx: "win32process.VirtualAllocEx",
    VirtualFreeEx: "win32process.VirtualFreeEx",
    WriteProcessMemory: "win32process.WriteProcessMemory",
    GetLastError: "win32api.GetLastError",
    GetNativeSystemInfo: "win32api.GetNativeSystemInfo",
    GetWindowsDirectoryW: "win32api.GetWindowsDirectory",
    GetWindowsDirectoryA: "win32api.GetWindowsDirectory",
    OpenProcessToken: "win32security.OpenProcessToken",
    DuplicateToken: "win32security.DuplicateToken",
    DuplicateTokenEx: "win32security.DuplicateTokenEx",
    GetNamedSecurityInfoW: "win32security.GetNamedSecurityInfo",
    GetNamedSecurityInfoA: "win32security.GetNamedSecurityInfo",
    RegOpenKeyExW: "winreg.OpenKey",
    RegOpenKeyExA: "winreg.OpenKey",
    OpenSCManagerW: "win32service.OpenSCManager",
    OpenSCManagerA: "win32service.OpenSCManager",
    OpenServiceW: "win32service.OpenService",
    OpenServiceA: "win32service.OpenService",
    StartServiceW: "win32service.StartService",
    StartServiceA: "win32service.StartService",
    ControlService: "win32service.ControlService",
    QueryServiceStatusEx: "win32service.QueryServiceStatusEx",
    QueryServiceStatus: "win32service.QueryServiceStatus",
    CloseServiceHandle: "PySC_HANDLE.Close",
    CreateNamedPipeW: "win32pipe.CreateNamedPipe",
    CreateNamedPipeA: "win32pipe.CreateNamedPipe",
    MessageBoxW: "win32api.MessageBox",
    MessageBoxA: "win32api.MessageBox",
  };

  const cleanupByName = {
    OpenProcess: "An owned process handle must be released once with CloseHandle, normally in finally.",
    CreateProcessW: "Close both hThread and hProcess from PROCESS_INFORMATION with CloseHandle.",
    CreateRemoteThread: "Close the returned thread handle with CloseHandle after waiting or otherwise finishing with it.",
    CloseHandle: "This is the cleanup operation. Do not use the handle again after a successful close.",
    CreateEventW: "Close the returned event handle with CloseHandle.",
    CreateEventA: "Close the returned event handle with CloseHandle.",
    CreateEventExW: "Close the returned event handle with CloseHandle.",
    CreateEventExA: "Close the returned event handle with CloseHandle.",
    CreateMutexW: "Release ownership with ReleaseMutex when held, then close the handle with CloseHandle.",
    CreateMutexA: "Release ownership with ReleaseMutex when held, then close the handle with CloseHandle.",
    CreateMutexExW: "Release ownership with ReleaseMutex when held, then close the handle with CloseHandle.",
    CreateMutexExA: "Release ownership with ReleaseMutex when held, then close the handle with CloseHandle.",
    CreateNamedPipeW: "Disconnect a connected instance where appropriate, then close the pipe handle with CloseHandle.",
    CreateNamedPipeA: "Disconnect a connected instance where appropriate, then close the pipe handle with CloseHandle.",
    OpenThread: "Close the returned thread handle with CloseHandle.",
    VirtualAlloc: "Release the allocation with VirtualFree using the original allocation base and the documented size/free-type combination.",
    VirtualAllocEx: "Release target-process memory with VirtualFreeEx using the same process handle and original allocation base after the target no longer uses it.",
    VirtualFree: "This is a cleanup operation; do not access a released range.",
    VirtualFreeEx: "This is the remote cleanup operation; do not release a region still used by another thread.",
    CreateFileMappingW: "Close the mapping handle with CloseHandle after every mapped view has been unmapped.",
    CreateFileMappingA: "Close the mapping handle with CloseHandle after every mapped view has been unmapped.",
    RtlAddFunctionTable: "Call RtlDeleteFunctionTable for the registered table before its RUNTIME_FUNCTION array or referenced unwind metadata is freed or reused.",
    OpenFileMappingW: "Close the returned mapping handle with CloseHandle.",
    OpenFileMappingA: "Close the returned mapping handle with CloseHandle.",
    MapViewOfFile: "Unmap the returned view with UnmapViewOfFile.",
    MapViewOfFileEx: "Unmap the returned view with UnmapViewOfFile.",
    UnmapViewOfFile: "This releases one mapped view, not the mapping-object handle.",
    HeapAlloc: "Release the block with HeapFree on the same heap.",
    HeapFree: "This is the matching cleanup for HeapAlloc; do not free the same block twice.",
    LoadLibraryW: "A successful call increments a module reference count. Balance an owned reference with FreeLibrary.",
    LoadLibraryA: "A successful call increments a module reference count. Balance an owned reference with FreeLibrary.",
    LoadLibraryExW: "Balance an owned module reference with FreeLibrary.",
    LoadLibraryExA: "Balance an owned module reference with FreeLibrary.",
    FreeLibrary: "This decrements one owned module reference. Do not use addresses that became invalid after the final unload.",
    GetCurrentProcess: "The returned pseudo-handle is borrowed and must not be closed.",
    GetProcessHeap: "The returned process-heap handle is borrowed and must not be closed.",
    OpenProcessToken: "Close the returned token handle with CloseHandle.",
    DuplicateToken: "Close the returned duplicate-token handle with CloseHandle.",
    DuplicateTokenEx: "Close the returned duplicate-token handle with CloseHandle.",
    GetNamedSecurityInfoW: "Release the returned security descriptor once with LocalFree. Component pointers returned alongside it point into that same allocation.",
    GetNamedSecurityInfoA: "Release the returned security descriptor once with LocalFree. Component pointers returned alongside it point into that same allocation.",
    LocalFree: "This releases one LocalAlloc-family allocation. A null return means the free succeeded.",
    AddDllDirectory: "Remove an owned cookie with RemoveDllDirectory when the added search path is no longer needed.",
    OpenSCManagerW: "Release the returned SCM handle with CloseServiceHandle.",
    OpenSCManagerA: "Release the returned SCM handle with CloseServiceHandle.",
    OpenServiceW: "Release the returned service handle with CloseServiceHandle.",
    OpenServiceA: "Release the returned service handle with CloseServiceHandle.",
    CloseServiceHandle: "This is the matching cleanup for SCM and service handles.",
    RegOpenKeyExW: "Close the returned Registry key with RegCloseKey or the owning winreg handle's Close method.",
    RegOpenKeyExA: "Close the returned Registry key with RegCloseKey or the owning winreg handle's Close method.",
    SetWindowsHookExW: "Remove the hook with UnhookWindowsHookEx and retain any callback object until unhooking and in-flight delivery finish.",
    SetWindowsHookExA: "Remove the hook with UnhookWindowsHookEx and retain any callback object until unhooking and in-flight delivery finish.",
    UnhookWindowsHookEx: "This removes the hook; release callback storage only after no native call can reach it.",
    GetModuleHandleW: "The returned module handle is borrowed. Do not balance it with FreeLibrary.",
    GetModuleHandleA: "The returned module handle is borrowed. Do not balance it with FreeLibrary.",
    CreateProcessA: "Close both hThread and hProcess from PROCESS_INFORMATION with CloseHandle.",
    CreateRemoteThreadEx: "Close the returned thread handle with CloseHandle after waiting or otherwise finishing with it.",
  };

  const resultByName = {
    GetLastError: "Returns the calling thread's last-error code. Read it only when the failed API explicitly documents that it sets last error.",
    RegOpenKeyExW: "Returns ERROR_SUCCESS on success or a Win32 error code directly. Do not call get_last_error for this result.",
    RegOpenKeyExA: "Returns ERROR_SUCCESS on success or a Win32 error code directly. Do not call get_last_error for this result.",
    WinVerifyTrust: "Returns zero for trust success and a signed status code otherwise. Interpret the returned code directly rather than using get_last_error.",
    WaitForSingleObject: "Branch explicitly on WAIT_OBJECT_0, WAIT_TIMEOUT, WAIT_ABANDONED, and WAIT_FAILED. Only WAIT_FAILED uses last error.",
    WaitForMultipleObjects: "Decode WAIT_OBJECT_0 plus an index, WAIT_ABANDONED plus an index, WAIT_TIMEOUT, or WAIT_FAILED. Only WAIT_FAILED uses last error.",
    VirtualQueryEx: "Returns the number of bytes written to the information buffer; zero indicates failure and makes last error available.",
    IsWow64Process2: "Nonzero indicates success: pProcessMachine receives IMAGE_FILE_MACHINE_UNKNOWN when the target is not under WOW64, otherwise its IMAGE_FILE_MACHINE_* type; optional pNativeMachine receives the host IMAGE_FILE_MACHINE_* type. Zero indicates failure; then read last error.",
    GetExitCodeProcess: "Nonzero indicates success and lpExitCode receives the process termination status, or STILL_ACTIVE while it is still running. Zero indicates failure; then read last error.",
    GetSystemInfo: "Returns no value and fills the supplied SYSTEM_INFO structure.",
    InterlockedExchangePointer: "Returns the previous pointer value. It is an atomic result, not a BOOL success flag.",
    CallNextHookEx: "Returns the next hook's result. Its meaning depends on the selected hook contract.",
    RtlAddFunctionTable: "Returns nonzero on success and zero on failure; follow the function-table lifetime rules.",
    GetCurrentProcess: "Returns a constant pseudo-handle for the current process. It does not fail and must not be closed.",
    GetNamedSecurityInfoW: "Returns ERROR_SUCCESS on success or a Win32 error code directly. Raise ctypes.WinError(result) for an unexpected nonzero result.",
    GetNamedSecurityInfoA: "Returns ERROR_SUCCESS on success or a Win32 error code directly. Raise ctypes.WinError(result) for an unexpected nonzero result.",
    CreateNamedPipeW: "Returns a pipe handle on success. INVALID_HANDLE_VALUE (not null) indicates failure; then read the last-error code.",
    CreateNamedPipeA: "Returns a pipe handle on success. INVALID_HANDLE_VALUE (not null) indicates failure; then read the last-error code.",
    ReadFile: "For the synchronous pattern shown, nonzero means success and zero means failure; then read last error. Overlapped I/O has an additional pending-completion contract and needs a separate OVERLAPPED lifetime.",
    WriteFile: "For the synchronous pattern shown, nonzero means success and zero means failure; then read last error. Overlapped I/O has an additional pending-completion contract and needs a separate OVERLAPPED lifetime.",
    HeapSize: "Returns the usable block size. SIZE_T(-1) indicates failure; do not treat an ordinary zero as the universal failure rule.",
    LocalFree: "Returns null on success. A non-null return is the still-owned input handle and indicates failure.",
    GetWindowsDirectoryW: "Zero indicates failure. A result greater than the supplied capacity reports the required size, including the terminator.",
    GetWindowsDirectoryA: "Zero indicates failure. A result greater than the supplied capacity reports the required size, including the terminator.",
    GetModuleFileNameExW: "Zero indicates failure. A nonzero result is the number of UTF-16 characters copied, excluding the terminator.",
    GetModuleFileNameExA: "Zero indicates failure. A nonzero result is the number of ANSI bytes copied, excluding the terminator.",
    GetModuleFileNameW: "Zero indicates failure. A nonzero result is the number of UTF-16 characters copied; equality with capacity requires truncation handling.",
    GetModuleFileNameA: "Zero indicates failure. A nonzero result is the number of ANSI bytes copied; equality with capacity requires truncation handling.",
    CreateEventW: "Returns an event handle on success. Null indicates failure; then read the last-error code. ERROR_ALREADY_EXISTS means the named event already existed.",
    CreateEventA: "Returns an event handle on success. Null indicates failure; then read the last-error code. ERROR_ALREADY_EXISTS means the named event already existed.",
    CreateEventExW: "Returns an event handle on success. Null indicates failure; then read the last-error code. ERROR_ALREADY_EXISTS means the named event already existed.",
    CreateEventExA: "Returns an event handle on success. Null indicates failure; then read the last-error code. ERROR_ALREADY_EXISTS means the named event already existed.",
    MessageBoxW: "Returns the ID of the selected button. Zero indicates failure; then read the last-error code.",
    MessageBoxA: "Returns the ID of the selected button. Zero indicates failure; then read the last-error code.",
    SetWindowsHookExW: "Returns an HHOOK on success. Null indicates failure; then read the last-error code.",
    SetWindowsHookExA: "Returns an HHOOK on success. Null indicates failure; then read the last-error code.",
    MapViewOfFileEx: "Returns the mapped base address. Null indicates failure; then read the last-error code.",
    EnumProcessModulesEx: "Nonzero indicates success. Use lpcbNeeded to detect and resize a short module buffer; zero exposes last error.",
    GetModuleHandleW: "Returns a borrowed HMODULE. Null indicates failure; then read the last-error code.",
    GetModuleHandleA: "Returns a borrowed HMODULE. Null indicates failure; then read the last-error code.",
    CreateFileMappingW: "Returns a mapping handle on success. If the named object already exists, this is a handle to the existing mapping with its current size and last error is ERROR_ALREADY_EXISTS. Null indicates failure; then read last error.",
    CreateFileMappingA: "Returns a mapping handle on success. If the named object already exists, this is a handle to the existing mapping with its current size and last error is ERROR_ALREADY_EXISTS. Null indicates failure; then read last error.",
    CreateMutexW: "Returns a mutex handle on success. Null indicates failure; ERROR_ALREADY_EXISTS means the named mutex already existed.",
    CreateMutexA: "Returns a mutex handle on success. Null indicates failure; ERROR_ALREADY_EXISTS means the named mutex already existed.",
    CreateMutexExW: "Returns a mutex handle on success. Null indicates failure; ERROR_ALREADY_EXISTS means the named mutex already existed.",
    CreateMutexExA: "Returns a mutex handle on success. Null indicates failure; ERROR_ALREADY_EXISTS means the named mutex already existed.",
    DuplicateTokenEx: "Nonzero indicates success and phNewToken receives an owned handle. Zero indicates failure; then read last error.",
    QueryServiceStatus: "Nonzero indicates success and fills SERVICE_STATUS. Zero indicates failure; then read the last-error code.",
  };

  const variantMetadata = {
    CreateEventW: {
      useWhen: "Use the Unicode CreateEvent form for normal named or unnamed event creation.",
      keyBehaviors: ["A matching named event opens instead of creating a second object."],
    },
    CreateEventA: {
      useWhen: "Use only when an existing byte-oriented caller must supply an ANSI event name.",
      keyBehaviors: ["ANSI names use the system code page; prefer CreateEventW for Unicode names."],
    },
    CreateEventExW: {
      useWhen: "Use when CREATE_EVENT_* flags or explicit desired access must be selected.",
      keyBehaviors: ["CREATE_EVENT_* flags select event behavior while desired access controls the returned handle."],
    },
    CreateEventExA: {
      useWhen: "Use only when extended event options need a byte-oriented ANSI object name.",
      keyBehaviors: ["ANSI names use the system code page; CREATE_EVENT_* flags and desired access remain explicit."],
    },
    CreateNamedPipeW: {
      useWhen: "Use the Unicode form to create one server instance of a named pipe.",
      keyBehaviors: ["Every additional server instance must repeat compatible type, instance-count, and timeout values."],
    },
    CreateNamedPipeA: {
      useWhen: "Use only for a legacy caller that supplies the pipe name as ANSI bytes.",
      keyBehaviors: ["ANSI pipe names use the system code page; prefer CreateNamedPipeW for normal Python strings."],
    },
    MessageBoxW: {
      useWhen: "Use the Unicode form for a simple modal message whose selected button must be handled.",
      keyBehaviors: ["Decode the returned ID according to the button group selected in uType."],
    },
    MessageBoxA: {
      useWhen: "Use only when a legacy caller already owns ANSI message and caption bytes.",
      keyBehaviors: ["ANSI text uses the system code page; prefer MessageBoxW for normal Unicode text."],
    },
    SetWindowsHookExW: {
      useWhen: "Use the Unicode form for an authorized hook with an ABI-correct, short-lived callback.",
      keyBehaviors: ["A global hook may require the callback in an architecture-matched DLL."],
    },
    SetWindowsHookExA: {
      useWhen: "Use only when the selected hook contract requires legacy ANSI character handling.",
      keyBehaviors: ["Callback ABI, scope, module placement, chain forwarding, and lifetime rules are unchanged."],
    },
    CreateFileMappingA: {
      useWhen: "Use only when an existing caller must name the mapping with ANSI bytes.",
      keyBehaviors: ["INVALID_HANDLE_VALUE selects paging-file backing; null selects an unnamed mapping."],
    },
    MapViewOfFileEx: {
      useWhen: "Use only when a compatible suggested base address is materially required.",
      keyBehaviors: ["Microsoft recommends letting Windows choose the base unless the fixed-address constraint is necessary."],
    },
    OpenFileMappingA: {
      useWhen: "Use only when an existing caller must look up the mapping with ANSI bytes.",
      keyBehaviors: ["The returned handle owns a mapping-object reference, not a mapped view."],
    },
    EnumProcessModulesEx: {
      useWhen: "Use when a 64-bit inspection tool needs an explicit module architecture filter.",
      keyBehaviors: ["A 32-bit caller under WOW64 does not gain cross-bitness enumeration from the filter."],
    },
    GetModuleFileNameExA: {
      useWhen: "Use only for another-process module paths that must be returned as ANSI bytes.",
      keyBehaviors: ["The module handle is borrowed; the caller owns and sizes only the output buffer."],
    },
    GetModuleFileNameA: {
      useWhen: "Use only for current-process module paths that must be returned as ANSI bytes.",
      keyBehaviors: ["A null module selects the current executable; handle a full buffer as truncation."],
    },
    GetModuleHandleA: {
      useWhen: "Use only when an existing caller identifies a loaded module with ANSI bytes.",
      keyBehaviors: ["The result does not add a module reference and can become invalid after another unload."],
    },
    LoadLibraryExA: {
      useWhen: "Use only when extended load flags accompany an ANSI module path.",
      keyBehaviors: ["Some data-file modes return handles that are not suitable for GetProcAddress."],
    },
    CreateMutexW: {
      useWhen: "Use the Unicode base form when initial ownership and an optional name are sufficient.",
      keyBehaviors: ["Initial ownership applies only when this call creates the mutex."],
    },
    CreateMutexA: {
      useWhen: "Use only when the base mutex form needs an ANSI object name.",
      keyBehaviors: ["ANSI names use the system code page; prefer CreateMutexW for Unicode names."],
    },
    CreateMutexExW: {
      useWhen: "Use when mutex creation flags or explicit desired access must be selected.",
      keyBehaviors: ["Initial ownership applies only when the named mutex did not already exist."],
    },
    CreateMutexExA: {
      useWhen: "Use only when extended mutex options need an ANSI object name.",
      keyBehaviors: ["ANSI names use the system code page; flags and desired access remain explicit."],
    },
    CreateProcessA: {
      useWhen: "Use only for a legacy launch path that deliberately uses ANSI buffers and environment data.",
      keyBehaviors: ["The command-line buffer is writable and encoding must match the selected environment contract."],
    },
    CreateRemoteThreadEx: {
      useWhen: "Use when an authorized remote-thread design requires a processor-group or other supported attribute.",
      keyBehaviors: ["With a null attribute list, its behavior matches CreateRemoteThread."],
    },
    DuplicateTokenEx: {
      useWhen: "Use when duplicate access, security attributes, or primary-versus-impersonation token type must be selected.",
      keyBehaviors: ["The source handle needs TOKEN_DUPLICATE; the returned token is independently owned."],
    },
    GetNamedSecurityInfoA: {
      useWhen: "Use only when a named securable object must be identified with ANSI bytes.",
      keyBehaviors: ["All returned component pointers reside inside the one descriptor allocation."],
    },
    OpenSCManagerA: {
      useWhen: "Use only when optional machine or database names must be supplied as ANSI bytes.",
      keyBehaviors: ["Request only the SC_MANAGER_* rights required by the following operation."],
    },
    OpenServiceA: {
      useWhen: "Use only when the service's internal name must be supplied as ANSI bytes.",
      keyBehaviors: ["The service handle and its parent SCM handle have independent ownership."],
    },
    QueryServiceStatus: {
      useWhen: "Use only when basic SERVICE_STATUS fields are sufficient; prefer Ex when PID is needed.",
      keyBehaviors: ["The value is the most recent status reported to the Service Control Manager."],
    },
    RegOpenKeyExA: {
      useWhen: "Use only when a Registry subkey path must be supplied as ANSI bytes.",
      keyBehaviors: ["This call never creates a missing key and returns its error code directly."],
    },
    StartServiceA: {
      useWhen: "Use only when optional service arguments must be supplied as ANSI byte strings.",
      keyBehaviors: ["Success accepts the start request; poll status through pending states before claiming RUNNING."],
    },
    GetWindowsDirectoryA: {
      useWhen: "Use only when the Windows directory must be returned in an ANSI byte buffer.",
      keyBehaviors: ["A result larger than capacity is the required size, including the terminator."],
    },
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
    CreateNamedPipeA: `pipe = CreateNamedPipeA(pipe_name_bytes, open_mode, pipe_mode, max_instances, out_size, in_size, timeout_ms, None)
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
    GetNamedSecurityInfoA: `descriptor = ctypes.c_void_p()
status = GetNamedSecurityInfoA(path_bytes, object_type, security_info, None, None, None, None, ctypes.byref(descriptor))
if status != 0:  # ERROR_SUCCESS
    raise ctypes.WinError(status)`,
    RegOpenKeyExW: `key = wintypes.HKEY()
status = RegOpenKeyExW(root_key, subkey, 0, desired_access, ctypes.byref(key))
if status != 0:  # ERROR_SUCCESS
    raise ctypes.WinError(status)`,
    RegOpenKeyExA: `key = wintypes.HKEY()
status = RegOpenKeyExA(root_key, subkey_bytes, 0, desired_access, ctypes.byref(key))
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
    MessageBoxW: `button = MessageBoxW(owner, text, caption, options)
if button == 0:
    raise ctypes.WinError(ctypes.get_last_error())`,
    MessageBoxA: `button = MessageBoxA(owner, text_bytes, caption_bytes, options)
if button == 0:
    raise ctypes.WinError(ctypes.get_last_error())`,
    GetModuleFileNameW: `buffer = ctypes.create_unicode_buffer(capacity)
copied = GetModuleFileNameW(module, buffer, capacity)
if copied == 0:
    raise ctypes.WinError(ctypes.get_last_error())
if copied >= capacity:
    raise BufferError("module path was truncated")`,
    GetModuleFileNameA: `buffer = ctypes.create_string_buffer(capacity)
copied = GetModuleFileNameA(module, buffer, capacity)
if copied == 0:
    raise ctypes.WinError(ctypes.get_last_error())
if copied >= capacity:
    raise BufferError("module path was truncated")`,
    GetModuleFileNameExW: `buffer = ctypes.create_unicode_buffer(capacity)
copied = GetModuleFileNameExW(process, module, buffer, capacity)
if copied == 0:
    raise ctypes.WinError(ctypes.get_last_error())`,
    GetModuleFileNameExA: `buffer = ctypes.create_string_buffer(capacity)
copied = GetModuleFileNameExA(process, module, buffer, capacity)
if copied == 0:
    raise ctypes.WinError(ctypes.get_last_error())`,
    GetWindowsDirectoryW: `buffer = ctypes.create_unicode_buffer(capacity)
copied = GetWindowsDirectoryW(buffer, capacity)
if copied == 0:
    raise ctypes.WinError(ctypes.get_last_error())
if copied >= capacity:
    raise BufferError(f"resize the buffer to {copied} UTF-16 characters")`,
    GetWindowsDirectoryA: `buffer = ctypes.create_string_buffer(capacity)
copied = GetWindowsDirectoryA(buffer, capacity)
if copied == 0:
    raise ctypes.WinError(ctypes.get_last_error())
if copied >= capacity:
    raise BufferError(f"resize the buffer to {copied} bytes")`,
  };

  const parameterExplanations = {
    "VirtualQueryEx.hProcess": "Process handle with PROCESS_QUERY_INFORMATION access for the address space being inspected.",
    "VirtualQueryEx.lpAddress": "Optional target address; Windows rounds it down to a page boundary before describing the containing region.",
    "VirtualQueryEx.lpBuffer": "Output receiving MEMORY_BASIC_INFORMATION for the consecutive region beginning at the selected page.",
    "VirtualQueryEx.dwLength": "Size in bytes of the MEMORY_BASIC_INFORMATION output buffer.",
    "CreateProcessW.lpApplicationName": "Optional UTF-16 executable path or name; when null, the first command-line token selects the module.",
    "CreateProcessW.lpCommandLine": "Optional writable UTF-16 command-line buffer that Windows may modify while separating the executable name from its arguments.",
    "CreateProcessW.lpProcessAttributes": "Optional process security descriptor and inheritance setting for the returned process handle.",
    "CreateProcessW.lpThreadAttributes": "Optional primary-thread security descriptor and inheritance setting for the returned thread handle.",
    "CreateProcessW.bInheritHandles": "Whether eligible inheritable handles from the caller are copied into the child process.",
    "CreateProcessW.dwCreationFlags": "CREATE_* and priority flags controlling the new process, primary thread, console, and environment interpretation.",
    "CreateProcessW.lpEnvironment": "Optional environment block; include CREATE_UNICODE_ENVIRONMENT for UTF-16 data, or pass null to inherit the caller environment.",
    "CreateProcessW.lpCurrentDirectory": "Optional UTF-16 initial working directory; null inherits the caller's current drive and directory.",
    "CreateProcessW.lpStartupInfo": "Initialized STARTUPINFOW or STARTUPINFOEXW settings, including only valid standard handles when requested.",
    "CreateProcessW.lpProcessInformation": "Output receiving the new process/thread identifiers and two owned handles that must be closed.",
    "CreateProcessA.lpCommandLine": "Optional writable ANSI command-line buffer that may be modified while the executable name and arguments are separated.",
  };

  const directionOverrides = {
    "CreateProcessW.lpCommandLine": "in, out, optional",
    "CreateProcessA.lpCommandLine": "in, out, optional",
    "CreateProcessW.lpProcessInformation": "out",
    "CreateProcessA.lpProcessInformation": "out",
    "CreateRemoteThread.lpThreadId": "out, optional",
    "CreateRemoteThreadEx.lpThreadId": "out, optional",
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
    "RegOpenKeyExA.phkResult": "out",
    "IsWow64Process2.pProcessMachine": "out",
    "IsWow64Process2.pNativeMachine": "out, optional",
    "GetExitCodeProcess.lpExitCode": "out",
    "GetNativeSystemInfo.lpSystemInfo": "out",
    "GetWindowsDirectoryW.lpBuffer": "out",
    "GetWindowsDirectoryA.lpBuffer": "out",
    "OpenProcessToken.TokenHandle": "out",
    "DuplicateToken.DuplicateTokenHandle": "out",
    "DuplicateTokenEx.phNewToken": "out",
    "GetNamedSecurityInfoW.ppsidOwner": "out, optional",
    "GetNamedSecurityInfoW.ppsidGroup": "out, optional",
    "GetNamedSecurityInfoW.ppDacl": "out, optional",
    "GetNamedSecurityInfoW.ppSacl": "out, optional",
    "GetNamedSecurityInfoW.ppSecurityDescriptor": "out",
    "GetNamedSecurityInfoA.ppsidOwner": "out, optional",
    "GetNamedSecurityInfoA.ppsidGroup": "out, optional",
    "GetNamedSecurityInfoA.ppDacl": "out, optional",
    "GetNamedSecurityInfoA.ppSacl": "out, optional",
    "GetNamedSecurityInfoA.ppSecurityDescriptor": "out",
    "MapGenericMask.AccessMask": "in, out",
    "MapGenericMask.GenericMapping": "in",
    "EnumProcessModules.lphModule": "out",
    "EnumProcessModules.lpcbNeeded": "out",
    "EnumProcessModulesEx.lphModule": "out",
    "EnumProcessModulesEx.lpcbNeeded": "out",
    "GetModuleFileNameExW.lpFilename": "out",
    "GetModuleFileNameExA.lpFilename": "out",
    "GetModuleFileNameA.lpFilename": "out",
    "GetModuleFileNameW.nSize": "in",
    "GetModuleFileNameExW.nSize": "in",
    "GetModuleFileNameExA.nSize": "in",
    "GetModuleFileNameA.nSize": "in",
    "QueryServiceStatusEx.cbBufSize": "in",
    "GetWindowsDirectoryW.uSize": "in",
    "GetWindowsDirectoryA.uSize": "in",
    "ReadFile.lpBuffer": "out",
    "ReadFile.lpNumberOfBytesRead": "out",
    "WriteFile.lpBuffer": "in",
    "WriteFile.lpNumberOfBytesWritten": "out",
    "VirtualProtectEx.lpflOldProtect": "out",
    "QueryServiceStatus.lpServiceStatus": "out",
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
    if (name === "CreateProcessW" || name === "CreateProcessA") {
      const suffix = name.endsWith("W") ? "W" : "A";
      const stringType = suffix === "W" ? "wintypes.LPWSTR" : "wintypes.LPSTR";
      prelude.push(`class STARTUPINFO${suffix}(ctypes.Structure):
    _fields_ = [
        ("cb", wintypes.DWORD), ("lpReserved", ${stringType}),
        ("lpDesktop", ${stringType}), ("lpTitle", ${stringType}),
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

  const familyData = window.ILOVEOS_WINDOWS_API_FAMILY_DATA;
  const canonicalVariantSources = {
    CreateFileMappingW: "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-createfilemappingw",
    CreateNamedPipeW: "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-createnamedpipew",
  };
  const familyDefinitionFor = (name) => familyData.familyDefinitions.find((definition) => definition.variantNames.includes(name));
  const familyPurpose = (name) => familyDefinitionFor(name)?.summary || `Perform the documented ${name} operation.`;
  function defaultUseWhen(name) {
    const definition = familyDefinitionFor(name);
    const purpose = familyPurpose(name).replace(/[.]$/, "").replace(/^./, (character) => character.toLowerCase());
    const names = definition?.variantNames || [name];
    if (name.endsWith("A") && names.includes(`${name.slice(0, -1)}W`)) {
      return `Use only for an existing ANSI byte-oriented caller that must ${purpose}.`;
    }
    if (name.endsWith("W") && names.includes(`${name.slice(0, -1)}A`)) {
      return `Use the Unicode form when you need to ${purpose}.`;
    }
    const baseName = name.replace(/Ex$/, "");
    if (name.endsWith("Ex") && names.includes(baseName)) {
      return `Use the extended form when its additional parameters are required to ${purpose}.`;
    }
    return `Use this contract when you need to ${purpose}.`;
  }
  const entries = [...nativeRecords.entries()].map(([name, record]) => {
    const dll = dllFor(name);
    const feature = featureIndex.get(name)?.[0];
    const metadata = variantMetadata[name] || {};
    return {
      name,
      category: categoryFor(name),
      summary: feature ? `${feature.task}. ${feature.detail}` : familyPurpose(name),
      dll,
      nativeSignature: nativeDeclaration(name, record.signature),
      python: pythonDeclaration(name, record.signature, dll),
      example: checkedExample(name, record.signature),
      parameters: record.signature.parameters.map((parameter) => ({
        name: parameter.name,
        direction: direction(name, parameter),
        native: nativeType(parameter.type),
        python: usablePythonType(parameter.type),
        explanation: parameterExplanations[`${name}.${parameter.name}`] || parameter.description || "Use the value required by the Microsoft contract.",
        choiceBinding: familyData.nativeBindings[`${name}.${parameter.name}`] ? `${name}.${parameter.name}` : "",
      })),
      result: resultByName[name] || defaultResult(record.signature),
      cleanup: defaultCleanup(name),
      pywin32: pywin32Names[name] || "No direct pywin32 wrapper is used by this course; use the ctypes declaration when this operation is required.",
      sources: canonicalVariantSources[name] ? [canonicalVariantSources[name]] : record.sources,
      useWhen: metadata.useWhen || defaultUseWhen(name),
      keyBehaviors: metadata.keyBehaviors || [],
    };
  }).sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name));

  const families = familyData.buildFamilies(entries);

  window.ILOVEOS_WINDOWS_API_GUIDE = {
    typeMappings,
    families,
    legacyApiNames: familyData.legacyApiNames,
  };
})();
