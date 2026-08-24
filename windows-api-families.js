(() => {
  const legacyApiNames = [
    "CreateNamedPipeW", "ReadFile", "WriteFile", "CallNextHookEx",
    "InterlockedExchangePointer", "MessageBoxA", "SetWindowsHookExW",
    "UnhookWindowsHookEx", "CreateFileMappingW", "GetNativeSystemInfo",
    "GetProcessHeap", "GetSystemInfo", "GlobalMemoryStatusEx", "HeapAlloc",
    "HeapFree", "HeapSize", "MapViewOfFile", "OpenFileMappingW",
    "QueryWorkingSetEx", "UnmapViewOfFile", "VirtualAlloc", "VirtualAllocEx",
    "VirtualFree", "VirtualFreeEx", "VirtualProtect", "VirtualProtectEx",
    "VirtualQueryEx", "WriteProcessMemory", "AddDllDirectory",
    "EnumProcessModules", "FreeLibrary", "GetModuleFileNameExW",
    "GetModuleFileNameW", "GetModuleHandleW", "GetProcAddress", "LoadLibraryA",
    "LoadLibraryExW", "LoadLibraryW", "RtlAddFunctionTable",
    "SetDefaultDllDirectories", "CloseHandle", "CreateEventW", "CreateMutexW",
    "CreateProcessW", "CreateRemoteThread", "FlushInstructionCache",
    "GetCurrentProcess", "GetExitCodeProcess", "IsWow64Process2", "OpenProcess",
    "OpenThread", "WaitForMultipleObjects", "WaitForSingleObject", "AccessCheck",
    "DuplicateToken", "GetNamedSecurityInfoW", "LocalFree", "MapGenericMask",
    "OpenProcessToken", "WinVerifyTrust", "CloseServiceHandle", "ControlService",
    "OpenSCManagerW", "OpenServiceW", "QueryServiceStatusEx", "RegOpenKeyExW",
    "StartServiceW", "GetLastError", "GetWindowsDirectoryW",
  ];

  function familyId(name) {
    return String(name || "api")
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  const unicodeAlias = (name, target) => ({
    name,
    target,
    note: "C/C++ selects the A or W declaration according to UNICODE.",
  });
  const defineFamily = (name, summary, variantNames = [name], recommendedVariant = variantNames[0], aliases = []) => ({
    id: familyId(name),
    name,
    summary,
    recommendedVariant,
    variantNames,
    aliases,
  });
  const encodingFamily = (name, summary) => defineFamily(
    name,
    summary,
    [`${name}W`, `${name}A`],
    `${name}W`,
    [unicodeAlias(name, `${name}W`)],
  );

  // This manifest is intentionally complete. A production contract that is
  // not named here would fall back to a singleton only in validator fixtures.
  const familyDefinitions = [
    encodingFamily("CreateNamedPipe", "Create one server instance of a named pipe."),
    defineFamily("ReadFile", "Read bytes from a file, pipe, device, or other readable handle."),
    defineFamily("WriteFile", "Write bytes to a file, pipe, device, or other writable handle."),
    defineFamily("CallNextHookEx", "Pass a hook notification to the next procedure in its chain."),
    defineFamily("InterlockedExchangePointer", "Atomically replace one aligned pointer-sized value."),
    encodingFamily("MessageBox", "Display a modal message box and return the selected control."),
    encodingFamily("SetWindowsHookEx", "Install a hook procedure for a supported hook event stream."),
    defineFamily("UnhookWindowsHookEx", "Remove a hook installed by SetWindowsHookEx."),
    encodingFamily("CreateFileMapping", "Create or open a file-mapping object."),
    defineFamily("GetNativeSystemInfo", "Report the native host architecture and address-space facts."),
    defineFamily("GetProcessHeap", "Borrow the default heap handle for the calling process."),
    defineFamily("GetSystemInfo", "Report architecture and address-space facts as seen by the caller."),
    defineFamily("GlobalMemoryStatusEx", "Report current physical and virtual memory availability."),
    defineFamily("HeapAlloc", "Allocate a block from a specific Windows heap."),
    defineFamily("HeapFree", "Return a block to the Windows heap that allocated it."),
    defineFamily("HeapSize", "Report the usable size of a block owned by a specific heap."),
    defineFamily("MapViewOfFile", "Map a file-mapping object's bytes into the current process.", ["MapViewOfFile", "MapViewOfFileEx"]),
    encodingFamily("OpenFileMapping", "Open an existing named file-mapping object."),
    defineFamily("QueryWorkingSetEx", "Query working-set attributes for selected virtual addresses."),
    defineFamily("UnmapViewOfFile", "Remove one mapped view from the current process."),
    defineFamily("VirtualAlloc", "Reserve or commit virtual memory in the current process."),
    defineFamily("VirtualAllocEx", "Reserve or commit virtual memory in a specified process."),
    defineFamily("VirtualFree", "Decommit or release virtual memory in the current process."),
    defineFamily("VirtualFreeEx", "Decommit or release virtual memory in a specified process."),
    defineFamily("VirtualProtect", "Change page protection in the current process."),
    defineFamily("VirtualProtectEx", "Change page protection in a specified process."),
    defineFamily("VirtualQueryEx", "Describe a virtual-memory region in a specified process."),
    defineFamily("WriteProcessMemory", "Copy caller-owned bytes into a specified process."),
    defineFamily("AddDllDirectory", "Add one Unicode path to the process DLL search set."),
    defineFamily("EnumProcessModules", "Enumerate modules loaded in a process.", ["EnumProcessModulesEx", "EnumProcessModules"], "EnumProcessModulesEx"),
    defineFamily("FreeLibrary", "Release one owned module reference."),
    encodingFamily("GetModuleFileNameEx", "Retrieve a module path from a specified process."),
    encodingFamily("GetModuleFileName", "Retrieve a loaded module path from the current process."),
    encodingFamily("GetModuleHandle", "Borrow a handle for a module already loaded in the current process."),
    defineFamily("GetProcAddress", "Resolve a byte-named or ordinal export from a loaded module."),
    defineFamily(
      "LoadLibrary",
      "Load a module into the current process and acquire a reference.",
      ["LoadLibraryW", "LoadLibraryA", "LoadLibraryExW", "LoadLibraryExA"],
      "LoadLibraryW",
      [unicodeAlias("LoadLibrary", "LoadLibraryW"), unicodeAlias("LoadLibraryEx", "LoadLibraryExW")],
    ),
    defineFamily("RtlAddFunctionTable", "Register unwind metadata for a dynamic code range."),
    defineFamily("SetDefaultDllDirectories", "Set the process-wide default DLL search policy."),
    defineFamily("CloseHandle", "Release one owned kernel-object handle."),
    defineFamily(
      "CreateEvent",
      "Create or open a named or unnamed event object.",
      ["CreateEventW", "CreateEventA", "CreateEventExW", "CreateEventExA"],
      "CreateEventW",
      [unicodeAlias("CreateEvent", "CreateEventW"), unicodeAlias("CreateEventEx", "CreateEventExW")],
    ),
    defineFamily(
      "CreateMutex",
      "Create or open a named or unnamed mutex object.",
      ["CreateMutexW", "CreateMutexA", "CreateMutexExW", "CreateMutexExA"],
      "CreateMutexW",
      [unicodeAlias("CreateMutex", "CreateMutexW"), unicodeAlias("CreateMutexEx", "CreateMutexExW")],
    ),
    encodingFamily("CreateProcess", "Create a process and its primary thread."),
    defineFamily("CreateRemoteThread", "Create a thread in another process.", ["CreateRemoteThread", "CreateRemoteThreadEx"]),
    defineFamily("FlushInstructionCache", "Make modified instruction bytes visible to a processor."),
    defineFamily("GetCurrentProcess", "Return the calling process's pseudo-handle."),
    defineFamily("GetExitCodeProcess", "Read a process termination status or STILL_ACTIVE."),
    defineFamily("IsWow64Process2", "Report process and native machine identifiers."),
    defineFamily("OpenProcess", "Open a process object by process identifier."),
    defineFamily("OpenThread", "Open a thread object by thread identifier."),
    defineFamily("WaitForMultipleObjects", "Wait synchronously for any or all objects in a handle set."),
    defineFamily("WaitForSingleObject", "Wait synchronously for one object."),
    defineFamily("AccessCheck", "Evaluate an access request against a security descriptor."),
    defineFamily("DuplicateToken", "Duplicate an access token.", ["DuplicateToken", "DuplicateTokenEx"]),
    encodingFamily("GetNamedSecurityInfo", "Read selected security-descriptor parts for a named object."),
    defineFamily("LocalFree", "Release memory allocated by the LocalAlloc family."),
    defineFamily("MapGenericMask", "Replace generic access bits with object-specific rights."),
    defineFamily("OpenProcessToken", "Open the primary access token associated with a process."),
    defineFamily("WinVerifyTrust", "Ask a trust provider to evaluate a subject."),
    defineFamily("CloseServiceHandle", "Release one Service Control Manager or service handle."),
    defineFamily("ControlService", "Send a supported control code to a service."),
    encodingFamily("OpenSCManager", "Open the Service Control Manager database."),
    encodingFamily("OpenService", "Open one service object by its internal name."),
    defineFamily("QueryServiceStatus", "Read a service's most recently reported status.", ["QueryServiceStatusEx", "QueryServiceStatus"], "QueryServiceStatusEx"),
    encodingFamily("RegOpenKeyEx", "Open an existing Registry key."),
    encodingFamily("StartService", "Request that a service start."),
    defineFamily("GetLastError", "Read the calling thread's last-error code."),
    encodingFamily("GetWindowsDirectory", "Retrieve the path of the Windows directory."),
  ];

  const review = (decision, familyName, source, note) => ({ decision, familyId: familyId(familyName), source, note });
  const familyReview = {
    CreateNamedPipeW: review("encoding", "CreateNamedPipe", "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-createnamedpipew", "The A and W forms differ only in the pipe-name encoding; callback-based pipe I/O remains a separate concern."),
    ReadFile: review("separate", "ReadFile", "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-readfile", "ReadFile supports synchronous or OVERLAPPED completion; ReadFileEx requires an alertable-wait callback completion model."),
    WriteFile: review("separate", "WriteFile", "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-writefile", "WriteFile supports synchronous or OVERLAPPED completion; WriteFileEx requires an alertable-wait callback completion model."),
    CallNextHookEx: review("single", "CallNextHookEx", "https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-callnexthookex", "The Ex suffix is part of this unsuffixed hook-chain contract; there is no A/W family to invent."),
    InterlockedExchangePointer: review("single", "InterlockedExchangePointer", "https://learn.microsoft.com/en-us/windows/win32/api/winnt/nf-winnt-interlockedexchangepointer", "This compiler intrinsic is one pointer-width atomic operation, not an exported A/W function."),
    MessageBoxA: review("encoding", "MessageBox", "https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-messageboxa", "MessageBoxA and MessageBoxW share controls, result, and ownership; Unicode is recommended."),
    SetWindowsHookExW: review("encoding", "SetWindowsHookEx", "https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowshookexw", "The A/W declarations install the same hook object and differ in character handling for relevant hook procedures."),
    UnhookWindowsHookEx: review("single", "UnhookWindowsHookEx", "https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-unhookwindowshookex", "This suffix-free cleanup call has one handle-based contract."),
    CreateFileMappingW: review("encoding", "CreateFileMapping", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-createfilemappingw", "The A/W forms differ only in an optional mapping name; NUMA creation has additional placement semantics and stays separate."),
    GetNativeSystemInfo: review("separate", "GetNativeSystemInfo", "https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-getnativesysteminfo", "It reports the native host under WOW64, while GetSystemInfo reports the calling process view."),
    GetProcessHeap: review("single", "GetProcessHeap", "https://learn.microsoft.com/en-us/windows/win32/api/heapapi/nf-heapapi-getprocessheap", "This returns one borrowed default-heap handle and has no encoding or extended sibling."),
    GetSystemInfo: review("separate", "GetSystemInfo", "https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-getsysteminfo", "It reports the caller-visible architecture, distinct from GetNativeSystemInfo under WOW64."),
    GlobalMemoryStatusEx: review("separate", "GlobalMemoryStatusEx", "https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-globalmemorystatusex", "The obsolete GlobalMemoryStatus uses a smaller structure, has no failure result, and can misreport large memory."),
    HeapAlloc: review("single", "HeapAlloc", "https://learn.microsoft.com/en-us/windows/win32/api/heapapi/nf-heapapi-heapalloc", "HeapCreate and HeapReAlloc change acquisition or resize semantics rather than forming variants of this allocation call."),
    HeapFree: review("single", "HeapFree", "https://learn.microsoft.com/en-us/windows/win32/api/heapapi/nf-heapapi-heapfree", "This is the matching heap-block release operation and has no encoding or extended form."),
    HeapSize: review("single", "HeapSize", "https://learn.microsoft.com/en-us/windows/win32/api/heapapi/nf-heapapi-heapsize", "This queries one heap allocation and has no encoding or extended form."),
    MapViewOfFile: review("extended", "MapViewOfFile", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-mapviewoffile", "MapViewOfFileEx performs the same mapping and cleanup while accepting a suggested base address."),
    OpenFileMappingW: review("encoding", "OpenFileMapping", "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-openfilemappingw", "The A/W forms differ only in the named mapping lookup string."),
    QueryWorkingSetEx: review("separate", "QueryWorkingSetEx", "https://learn.microsoft.com/en-us/windows/win32/api/psapi/nf-psapi-queryworkingsetex", "It updates per-address extended records; QueryWorkingSet returns a different working-set snapshot structure."),
    UnmapViewOfFile: review("single", "UnmapViewOfFile", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-unmapviewoffile", "This suffix-free view cleanup has one address-based contract."),
    VirtualAlloc: review("separate", "VirtualAlloc", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc", "VirtualAlloc targets the caller; VirtualAllocEx adds a process handle, access requirements, and remote lifetime coordination."),
    VirtualAllocEx: review("separate", "VirtualAllocEx", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualallocex", "VirtualAllocEx changes the target process and required access, so it stays separate from VirtualAlloc."),
    VirtualFree: review("separate", "VirtualFree", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualfree", "VirtualFree releases caller memory; VirtualFreeEx releases memory owned by another process."),
    VirtualFreeEx: review("separate", "VirtualFreeEx", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualfreeex", "The target-process handle and remote-use coordination distinguish it from VirtualFree."),
    VirtualProtect: review("separate", "VirtualProtect", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualprotect", "VirtualProtect changes caller pages; VirtualProtectEx changes another process and requires remote-process access."),
    VirtualProtectEx: review("separate", "VirtualProtectEx", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualprotectex", "The target-process and access contract keep this separate from VirtualProtect."),
    VirtualQueryEx: review("separate", "VirtualQueryEx", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualqueryex", "VirtualQueryEx inspects a specified process; VirtualQuery inspects only the caller."),
    WriteProcessMemory: review("single", "WriteProcessMemory", "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-writeprocessmemory", "ReadProcessMemory reverses data direction and output meaning, so it is not a callable variant of this write."),
    AddDllDirectory: review("single", "AddDllDirectory", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-adddlldirectory", "This suffix-free API explicitly accepts PCWSTR; no ANSI counterpart exists."),
    EnumProcessModules: review("extended", "EnumProcessModules", "https://learn.microsoft.com/en-us/windows/win32/api/psapi/nf-psapi-enumprocessmodules", "EnumProcessModulesEx keeps the same result and borrowed-module ownership while adding an architecture filter."),
    FreeLibrary: review("single", "FreeLibrary", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-freelibrary", "FreeLibraryAndExitThread also terminates a thread, changing control flow and ownership timing."),
    GetModuleFileNameExW: review("encoding", "GetModuleFileNameEx", "https://learn.microsoft.com/en-us/windows/win32/api/psapi/nf-psapi-getmodulefilenameexw", "The A/W forms share a target-process contract; current-process GetModuleFileName stays separate."),
    GetModuleFileNameW: review("encoding", "GetModuleFileName", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-getmodulefilenamew", "The A/W forms share current-process lookup; GetModuleFileNameEx adds another-process targeting."),
    GetModuleHandleW: review("encoding", "GetModuleHandle", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-getmodulehandlew", "The A/W forms return borrowed handles; GetModuleHandleEx can change reference count or pin ownership."),
    GetProcAddress: review("single", "GetProcAddress", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-getprocaddress", "Export names are byte strings by contract; GetProcAddressA/W do not exist."),
    LoadLibraryA: review("extended", "LoadLibrary", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibrarya", "Base and Ex forms acquire the same module ownership; Ex adds mapping and search-policy flags."),
    LoadLibraryExW: review("extended", "LoadLibrary", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibraryexw", "The extended form shares module acquisition and cleanup while making load behavior explicit."),
    LoadLibraryW: review("extended", "LoadLibrary", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibraryw", "Base and Ex forms share module ownership, with Unicode recommended for paths."),
    RtlAddFunctionTable: review("single", "RtlAddFunctionTable", "https://learn.microsoft.com/en-us/windows/win32/api/winnt/nf-winnt-rtladdfunctiontable", "RtlDeleteFunctionTable is the distinct matching cleanup rather than another registration variant."),
    SetDefaultDllDirectories: review("single", "SetDefaultDllDirectories", "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-setdefaultdlldirectories", "This is one process-wide policy operation; per-call LoadLibraryEx flags remain in the load family."),
    CloseHandle: review("single", "CloseHandle", "https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-closehandle", "Service, Registry, and local-memory handles require different closers and stay separate."),
    CreateEventW: review("extended", "CreateEvent", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createeventw", "Base and Ex A/W forms create the same event object; Ex exposes flags and desired access."),
    CreateMutexW: review("extended", "CreateMutex", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createmutexw", "Base and Ex A/W forms create the same mutex object; Ex exposes flags and desired access."),
    CreateProcessW: review("encoding", "CreateProcess", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw", "The A/W forms share process and thread ownership; CreateProcessAsUser changes security context and privileges."),
    CreateRemoteThread: review("extended", "CreateRemoteThread", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createremotethread", "CreateRemoteThreadEx creates the same remote thread and handle while adding an attribute list."),
    FlushInstructionCache: review("single", "FlushInstructionCache", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-flushinstructioncache", "This process-range coherency operation has no encoding or extended form."),
    GetCurrentProcess: review("single", "GetCurrentProcess", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getcurrentprocess", "This returns one non-owning pseudo-handle and has no extended form."),
    GetExitCodeProcess: review("single", "GetExitCodeProcess", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-getexitcodeprocess", "This status query has one output contract; waiting for termination is a separate synchronization operation."),
    IsWow64Process2: review("separate", "IsWow64Process2", "https://learn.microsoft.com/en-us/windows/win32/api/wow64apiset/nf-wow64apiset-iswow64process2", "IsWow64Process returns one Boolean; this API returns process and native machine identifiers."),
    OpenProcess: review("single", "OpenProcess", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocess", "This PID-targeted process open has one suffix-free access-mask contract."),
    OpenThread: review("single", "OpenThread", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openthread", "This TID-targeted thread open has one suffix-free access-mask contract."),
    WaitForMultipleObjects: review("separate", "WaitForMultipleObjects", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitformultipleobjects", "The Ex form enters alertable wait processing, changing the synchronization and callback model."),
    WaitForSingleObject: review("separate", "WaitForSingleObject", "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject", "The Ex form can dispatch queued completion routines, changing the synchronization model."),
    AccessCheck: review("single", "AccessCheck", "https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-accesscheck", "AccessCheckByType adds object-type list semantics and is a distinct authorization operation."),
    DuplicateToken: review("extended", "DuplicateToken", "https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-duplicatetoken", "DuplicateTokenEx preserves duplicate-token ownership and adds access, attributes, and token-type selection."),
    GetNamedSecurityInfoW: review("encoding", "GetNamedSecurityInfo", "https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getnamedsecurityinfow", "The A/W forms share named-object lookup; GetSecurityInfo instead targets an existing handle."),
    LocalFree: review("single", "LocalFree", "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-localfree", "This inverted-result cleanup is specific to LocalAlloc-family storage."),
    MapGenericMask: review("single", "MapGenericMask", "https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-mapgenericmask", "This in-place generic-rights mapping has no encoding or extended form."),
    OpenProcessToken: review("single", "OpenProcessToken", "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openprocesstoken", "OpenThreadToken targets a thread impersonation token and has different fallback semantics."),
    WinVerifyTrust: review("single", "WinVerifyTrust", "https://learn.microsoft.com/en-us/windows/win32/api/wintrust/nf-wintrust-winverifytrust", "The action GUID and provider data select behavior within one suffix-free trust entry point."),
    CloseServiceHandle: review("single", "CloseServiceHandle", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-closeservicehandle", "This closer is specific to SCM and service handles."),
    ControlService: review("separate", "ControlService", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-controlservice", "ControlServiceEx adds reason and control-specific information with an A/W payload contract."),
    OpenSCManagerW: review("encoding", "OpenSCManager", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-openscmanagerw", "The A/W forms share SCM access and ownership and differ only in optional names."),
    OpenServiceW: review("encoding", "OpenService", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-openservicew", "The A/W forms share service access and ownership and differ only in service-name encoding."),
    QueryServiceStatusEx: review("extended", "QueryServiceStatus", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-queryservicestatusex", "The base and Ex calls query the same status; Ex adds process and extended status fields."),
    RegOpenKeyExW: review("encoding", "RegOpenKeyEx", "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regopenkeyexw", "The A/W forms share Registry access and HKEY ownership and differ in subkey encoding."),
    StartServiceW: review("encoding", "StartService", "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-startservicew", "The A/W forms share the start request and differ only in optional argument-vector encoding."),
    GetLastError: review("single", "GetLastError", "https://learn.microsoft.com/en-us/windows/win32/api/errhandlingapi/nf-errhandlingapi-getlasterror", "This thread-local error retrieval has one suffix-free contract."),
    GetWindowsDirectoryW: review("encoding", "GetWindowsDirectory", "https://learn.microsoft.com/en-us/windows/win32/api/sysinfoapi/nf-sysinfoapi-getwindowsdirectoryw", "The A/W forms share buffer sizing and differ only in output encoding."),
  };

  const choiceSets = {
    "token-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/secauthz/access-rights-for-access-token-objects",
      values: {
        SAME_TOKEN_ACCESS: { native: "0", pywin32: "0", useWhen: "Ask DuplicateTokenEx to preserve the existing token handle's access mask." },
        TOKEN_QUERY: { native: "TOKEN_QUERY", pywin32: "win32security.TOKEN_QUERY", useWhen: "Read token identity, groups, privileges, and token information." },
        TOKEN_DUPLICATE: { native: "TOKEN_DUPLICATE", pywin32: "win32security.TOKEN_DUPLICATE", useWhen: "Pass the token to DuplicateToken or DuplicateTokenEx." },
        TOKEN_ADJUST_PRIVILEGES: { native: "TOKEN_ADJUST_PRIVILEGES", pywin32: "win32security.TOKEN_ADJUST_PRIVILEGES", useWhen: "Enable or disable privileges already present in the token." },
      },
    },
    "security-impersonation-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winnt/ne-winnt-security_impersonation_level",
      values: {
        SecurityAnonymous: { native: "SecurityAnonymous", pywin32: "win32security.SecurityAnonymous", useWhen: "Expose neither usable identity nor impersonation authority." },
        SecurityIdentification: { native: "SecurityIdentification", pywin32: "win32security.SecurityIdentification", useWhen: "Inspect client identity without acting as that client." },
        SecurityImpersonation: { native: "SecurityImpersonation", pywin32: "win32security.SecurityImpersonation", useWhen: "Act as the client locally; this is the normal local impersonation choice." },
        SecurityDelegation: { native: "SecurityDelegation", pywin32: "win32security.SecurityDelegation", useWhen: "Act as the client remotely when wider security configuration permits delegation." },
      },
    },
    "token-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winnt/ne-winnt-token_type",
      values: {
        TokenPrimary: { native: "TokenPrimary", pywin32: "win32security.TokenPrimary", useWhen: "Create a token suitable for process assignment when the destination API accepts a primary token." },
        TokenImpersonation: { native: "TokenImpersonation", pywin32: "win32security.TokenImpersonation", useWhen: "Create a token intended for a thread impersonation context." },
      },
    },
    "process-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/procthread/process-security-and-access-rights",
      values: {
        PROCESS_QUERY_LIMITED_INFORMATION: { native: "PROCESS_QUERY_LIMITED_INFORMATION", pywin32: "win32con.PROCESS_QUERY_LIMITED_INFORMATION", useWhen: "Read limited process metadata on supported Windows versions." },
        PROCESS_QUERY_INFORMATION: { native: "PROCESS_QUERY_INFORMATION", pywin32: "win32con.PROCESS_QUERY_INFORMATION", useWhen: "Query process information required by older or broader inspection calls." },
        PROCESS_VM_OPERATION: { native: "PROCESS_VM_OPERATION", pywin32: "win32con.PROCESS_VM_OPERATION", useWhen: "Allocate, free, or change virtual memory in the target process." },
        PROCESS_VM_READ: { native: "PROCESS_VM_READ", pywin32: "win32con.PROCESS_VM_READ", useWhen: "Read bytes or memory information from the target process." },
        PROCESS_VM_WRITE: { native: "PROCESS_VM_WRITE", pywin32: "win32con.PROCESS_VM_WRITE", useWhen: "Write bytes into the target process together with required operation rights." },
        PROCESS_CREATE_THREAD: { native: "PROCESS_CREATE_THREAD", pywin32: "win32con.PROCESS_CREATE_THREAD", useWhen: "Create a thread in the target process under an authorized lab design." },
        SYNCHRONIZE: { native: "SYNCHRONIZE", pywin32: "win32con.SYNCHRONIZE", useWhen: "Wait for the process object to become signaled at termination." },
      },
    },
    "thread-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/procthread/thread-security-and-access-rights",
      values: {
        THREAD_QUERY_LIMITED_INFORMATION: { native: "THREAD_QUERY_LIMITED_INFORMATION", pywin32: "win32con.THREAD_QUERY_LIMITED_INFORMATION", useWhen: "Read limited thread metadata with the smallest practical inspection right." },
        THREAD_QUERY_INFORMATION: { native: "THREAD_QUERY_INFORMATION", pywin32: "win32con.THREAD_QUERY_INFORMATION", useWhen: "Use a thread query that requires the broader legacy information right." },
        THREAD_SUSPEND_RESUME: { native: "THREAD_SUSPEND_RESUME", pywin32: "win32con.THREAD_SUSPEND_RESUME", useWhen: "Suspend or resume a thread under a controlled debugging workflow." },
        SYNCHRONIZE: { native: "SYNCHRONIZE", pywin32: "win32con.SYNCHRONIZE", useWhen: "Wait for the thread object to become signaled at termination." },
      },
    },
    "memory-allocation-type": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc",
      values: {
        MEM_RESERVE: { native: "MEM_RESERVE", pywin32: "win32con.MEM_RESERVE", useWhen: "Reserve an address range without making pages accessible yet." },
        MEM_COMMIT: { native: "MEM_COMMIT", pywin32: "win32con.MEM_COMMIT", useWhen: "Commit pages in an existing or newly reserved address range." },
        MEM_RESET: { native: "MEM_RESET", pywin32: "0x00080000", useWhen: "Mark committed pages as no longer meaningful without decommitting them." },
      },
    },
    "memory-free-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualfree",
      values: {
        MEM_RELEASE: { native: "MEM_RELEASE", pywin32: "win32con.MEM_RELEASE", useWhen: "Release an entire reservation using its original base and a zero size." },
        MEM_DECOMMIT: { native: "MEM_DECOMMIT", pywin32: "win32con.MEM_DECOMMIT", useWhen: "Remove page commitment while keeping the address range reserved." },
      },
    },
    "memory-protection": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/memory/memory-protection-constants",
      values: {
        PAGE_NOACCESS: { native: "PAGE_NOACCESS", pywin32: "win32con.PAGE_NOACCESS", useWhen: "Make committed pages inaccessible." },
        PAGE_READONLY: { native: "PAGE_READONLY", pywin32: "win32con.PAGE_READONLY", useWhen: "Permit reads while rejecting writes and execution." },
        PAGE_READWRITE: { native: "PAGE_READWRITE", pywin32: "win32con.PAGE_READWRITE", useWhen: "Permit ordinary data reads and writes without execution." },
        PAGE_EXECUTE_READ: { native: "PAGE_EXECUTE_READ", pywin32: "win32con.PAGE_EXECUTE_READ", useWhen: "Permit execution and reads after code generation is complete." },
        PAGE_EXECUTE_READWRITE: { native: "PAGE_EXECUTE_READWRITE", pywin32: "win32con.PAGE_EXECUTE_READWRITE", useWhen: "Use only for a narrowly justified transition; avoid lasting writable-executable memory." },
      },
    },
    "file-mapping-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/memory/file-mapping-security-and-access-rights",
      values: {
        FILE_MAP_READ: { native: "FILE_MAP_READ", pywin32: "0x0004", useWhen: "Create a read-only view of a compatible mapping." },
        FILE_MAP_WRITE: { native: "FILE_MAP_WRITE", pywin32: "0x0002", useWhen: "Create a shared writable view of a compatible mapping." },
        FILE_MAP_COPY: { native: "FILE_MAP_COPY", pywin32: "0x0001", useWhen: "Create a copy-on-write view whose changes remain private." },
        FILE_MAP_EXECUTE: { native: "FILE_MAP_EXECUTE", pywin32: "0x0020", useWhen: "Permit execution only when the mapping protection supports it." },
      },
    },
    "wait-timeout": {
      kind: "sentinel",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject",
      values: {
        ZERO_TIMEOUT: { native: "0", pywin32: "0", useWhen: "Poll once and return immediately when the object is not signaled." },
        INFINITE: { native: "INFINITE", pywin32: "win32event.INFINITE", useWhen: "Wait without a timeout only when another path guarantees progress or cancellation." },
      },
    },
    "process-creation-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags",
      values: {
        CREATE_NEW_CONSOLE: { native: "CREATE_NEW_CONSOLE", pywin32: "win32process.CREATE_NEW_CONSOLE", useWhen: "Give a console process a new console instead of inheriting the parent's." },
        CREATE_NO_WINDOW: { native: "CREATE_NO_WINDOW", pywin32: "win32process.CREATE_NO_WINDOW", useWhen: "Run a console application without a console window when compatible." },
        CREATE_SUSPENDED: { native: "CREATE_SUSPENDED", pywin32: "win32process.CREATE_SUSPENDED", useWhen: "Create the primary thread suspended for deliberate setup before ResumeThread." },
        CREATE_UNICODE_ENVIRONMENT: { native: "CREATE_UNICODE_ENVIRONMENT", pywin32: "win32process.CREATE_UNICODE_ENVIRONMENT", useWhen: "Pass lpEnvironment as a UTF-16 environment block." },
      },
    },
    "thread-creation-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createremotethread",
      values: {
        RUN_IMMEDIATELY: { native: "0", pywin32: "0", useWhen: "Allow the new thread to run as soon as scheduling permits." },
        CREATE_SUSPENDED: { native: "CREATE_SUSPENDED", pywin32: "win32process.CREATE_SUSPENDED", useWhen: "Return the thread suspended until an explicit ResumeThread call." },
        STACK_SIZE_PARAM_IS_A_RESERVATION: { native: "STACK_SIZE_PARAM_IS_A_RESERVATION", pywin32: "0x00010000", useWhen: "Interpret dwStackSize as the initial reserve size rather than commit size." },
      },
    },
    "named-pipe-open-mode": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-createnamedpipew",
      values: {
        PIPE_ACCESS_INBOUND: { native: "PIPE_ACCESS_INBOUND", pywin32: "win32pipe.PIPE_ACCESS_INBOUND", useWhen: "Let the server read and clients write through this instance." },
        PIPE_ACCESS_OUTBOUND: { native: "PIPE_ACCESS_OUTBOUND", pywin32: "win32pipe.PIPE_ACCESS_OUTBOUND", useWhen: "Let the server write and clients read through this instance." },
        PIPE_ACCESS_DUPLEX: { native: "PIPE_ACCESS_DUPLEX", pywin32: "win32pipe.PIPE_ACCESS_DUPLEX", useWhen: "Permit both server-side reads and writes." },
        FILE_FLAG_OVERLAPPED: { native: "FILE_FLAG_OVERLAPPED", pywin32: "win32file.FILE_FLAG_OVERLAPPED", useWhen: "Use OVERLAPPED structures and explicit asynchronous completion handling." },
        FILE_FLAG_FIRST_PIPE_INSTANCE: { native: "FILE_FLAG_FIRST_PIPE_INSTANCE", pywin32: "win32pipe.FILE_FLAG_FIRST_PIPE_INSTANCE", useWhen: "Fail if another instance of this pipe name already exists." },
      },
    },
    "named-pipe-mode": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-createnamedpipew",
      values: {
        PIPE_TYPE_BYTE: { native: "PIPE_TYPE_BYTE", pywin32: "win32pipe.PIPE_TYPE_BYTE", useWhen: "Treat writes as a continuous byte stream." },
        PIPE_TYPE_MESSAGE: { native: "PIPE_TYPE_MESSAGE", pywin32: "win32pipe.PIPE_TYPE_MESSAGE", useWhen: "Preserve write boundaries as messages." },
        PIPE_READMODE_BYTE: { native: "PIPE_READMODE_BYTE", pywin32: "win32pipe.PIPE_READMODE_BYTE", useWhen: "Read data as a byte stream." },
        PIPE_READMODE_MESSAGE: { native: "PIPE_READMODE_MESSAGE", pywin32: "win32pipe.PIPE_READMODE_MESSAGE", useWhen: "Read one message at a time from a message-type pipe." },
        PIPE_WAIT: { native: "PIPE_WAIT", pywin32: "win32pipe.PIPE_WAIT", useWhen: "Use blocking behavior when operations cannot complete immediately." },
        PIPE_NOWAIT: { native: "PIPE_NOWAIT", pywin32: "win32pipe.PIPE_NOWAIT", useWhen: "Use only for LAN Manager compatibility; asynchronous I/O should use OVERLAPPED." },
      },
    },
    "named-pipe-instances": {
      kind: "sentinel",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-createnamedpipew",
      values: {
        PIPE_UNLIMITED_INSTANCES: { native: "PIPE_UNLIMITED_INSTANCES", pywin32: "win32pipe.PIPE_UNLIMITED_INSTANCES", useWhen: "Allow the system maximum number of server instances for the pipe name." },
      },
    },
    "file-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew",
      values: {
        GENERIC_READ: { native: "GENERIC_READ", pywin32: "win32con.GENERIC_READ", useWhen: "Read data and metadata permitted by the object's security descriptor." },
        GENERIC_WRITE: { native: "GENERIC_WRITE", pywin32: "win32con.GENERIC_WRITE", useWhen: "Write data or metadata permitted by the object's security descriptor." },
        ZERO_ACCESS: { native: "0", pywin32: "0", useWhen: "Query limited metadata without requesting data access where the object permits it." },
      },
    },
    "file-share-mode": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew",
      values: {
        EXCLUSIVE: { native: "0", pywin32: "0", useWhen: "Deny later read, write, and delete opens until this handle closes." },
        FILE_SHARE_READ: { native: "FILE_SHARE_READ", pywin32: "win32con.FILE_SHARE_READ", useWhen: "Allow later handles to request read access." },
        FILE_SHARE_WRITE: { native: "FILE_SHARE_WRITE", pywin32: "win32con.FILE_SHARE_WRITE", useWhen: "Allow later handles to request write access." },
        FILE_SHARE_DELETE: { native: "FILE_SHARE_DELETE", pywin32: "win32con.FILE_SHARE_DELETE", useWhen: "Allow later delete or rename operations while this handle remains open." },
      },
    },
    "file-creation-disposition": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew",
      values: {
        CREATE_NEW: { native: "CREATE_NEW", pywin32: "win32con.CREATE_NEW", useWhen: "Create a new file and fail if it already exists." },
        CREATE_ALWAYS: { native: "CREATE_ALWAYS", pywin32: "win32con.CREATE_ALWAYS", useWhen: "Create or overwrite a file deliberately." },
        OPEN_EXISTING: { native: "OPEN_EXISTING", pywin32: "win32con.OPEN_EXISTING", useWhen: "Open an existing file or device and fail when absent." },
        OPEN_ALWAYS: { native: "OPEN_ALWAYS", pywin32: "win32con.OPEN_ALWAYS", useWhen: "Open an existing file or create it when absent." },
        TRUNCATE_EXISTING: { native: "TRUNCATE_EXISTING", pywin32: "win32con.TRUNCATE_EXISTING", useWhen: "Truncate an existing writable file and fail when absent." },
      },
    },
    "file-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew",
      values: {
        FILE_ATTRIBUTE_NORMAL: { native: "FILE_ATTRIBUTE_NORMAL", pywin32: "win32con.FILE_ATTRIBUTE_NORMAL", useWhen: "Use no special file attribute when this value stands alone." },
        FILE_FLAG_OVERLAPPED: { native: "FILE_FLAG_OVERLAPPED", pywin32: "win32file.FILE_FLAG_OVERLAPPED", useWhen: "Use explicit OVERLAPPED lifetime and completion handling." },
        FILE_FLAG_BACKUP_SEMANTICS: { native: "FILE_FLAG_BACKUP_SEMANTICS", pywin32: "win32con.FILE_FLAG_BACKUP_SEMANTICS", useWhen: "Open a directory handle or perform authorized backup semantics." },
        FILE_FLAG_DELETE_ON_CLOSE: { native: "FILE_FLAG_DELETE_ON_CLOSE", pywin32: "win32con.FILE_FLAG_DELETE_ON_CLOSE", useWhen: "Request deletion after all compatible handles close." },
      },
    },
    "scm-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/services/service-security-and-access-rights",
      values: {
        SC_MANAGER_CONNECT: { native: "SC_MANAGER_CONNECT", pywin32: "win32service.SC_MANAGER_CONNECT", useWhen: "Open existing services through the SCM handle." },
        SC_MANAGER_ENUMERATE_SERVICE: { native: "SC_MANAGER_ENUMERATE_SERVICE", pywin32: "win32service.SC_MANAGER_ENUMERATE_SERVICE", useWhen: "Enumerate services in the connected database." },
        SC_MANAGER_CREATE_SERVICE: { native: "SC_MANAGER_CREATE_SERVICE", pywin32: "win32service.SC_MANAGER_CREATE_SERVICE", useWhen: "Create a service only in an authorized management workflow." },
      },
    },
    "service-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/services/service-security-and-access-rights",
      values: {
        SERVICE_QUERY_STATUS: { native: "SERVICE_QUERY_STATUS", pywin32: "win32service.SERVICE_QUERY_STATUS", useWhen: "Read service state, accepted controls, exit codes, and wait hints." },
        SERVICE_START: { native: "SERVICE_START", pywin32: "win32service.SERVICE_START", useWhen: "Request service startup." },
        SERVICE_STOP: { native: "SERVICE_STOP", pywin32: "win32service.SERVICE_STOP", useWhen: "Send a stop control when dependencies and policy permit it." },
        SERVICE_QUERY_CONFIG: { native: "SERVICE_QUERY_CONFIG", pywin32: "win32service.SERVICE_QUERY_CONFIG", useWhen: "Read service configuration." },
        SERVICE_CHANGE_CONFIG: { native: "SERVICE_CHANGE_CONFIG", pywin32: "win32service.SERVICE_CHANGE_CONFIG", useWhen: "Modify service configuration in an authorized workflow." },
      },
    },
    "service-control": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-controlservice",
      values: {
        SERVICE_CONTROL_STOP: { native: "SERVICE_CONTROL_STOP", pywin32: "win32service.SERVICE_CONTROL_STOP", useWhen: "Ask a service that accepts stop controls to stop." },
        SERVICE_CONTROL_PAUSE: { native: "SERVICE_CONTROL_PAUSE", pywin32: "win32service.SERVICE_CONTROL_PAUSE", useWhen: "Ask a pausable service to enter its paused state." },
        SERVICE_CONTROL_CONTINUE: { native: "SERVICE_CONTROL_CONTINUE", pywin32: "win32service.SERVICE_CONTROL_CONTINUE", useWhen: "Ask a paused service to resume." },
        SERVICE_CONTROL_INTERROGATE: { native: "SERVICE_CONTROL_INTERROGATE", pywin32: "win32service.SERVICE_CONTROL_INTERROGATE", useWhen: "Prompt the service to report its current status." },
      },
    },
    "registry-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/sysinfo/registry-key-security-and-access-rights",
      values: {
        KEY_QUERY_VALUE: { native: "KEY_QUERY_VALUE", pywin32: "winreg.KEY_QUERY_VALUE", useWhen: "Read named values from the key." },
        KEY_SET_VALUE: { native: "KEY_SET_VALUE", pywin32: "winreg.KEY_SET_VALUE", useWhen: "Create, replace, or delete named values." },
        KEY_ENUMERATE_SUB_KEYS: { native: "KEY_ENUMERATE_SUB_KEYS", pywin32: "winreg.KEY_ENUMERATE_SUB_KEYS", useWhen: "Enumerate immediate subkey names." },
        KEY_READ: { native: "KEY_READ", pywin32: "winreg.KEY_READ", useWhen: "Request the standard read combination for a Registry key." },
        KEY_WRITE: { native: "KEY_WRITE", pywin32: "winreg.KEY_WRITE", useWhen: "Request the standard write combination for a Registry key." },
        KEY_WOW64_32KEY: { native: "KEY_WOW64_32KEY", pywin32: "winreg.KEY_WOW64_32KEY", useWhen: "Select the 32-bit view of a redirected key explicitly." },
        KEY_WOW64_64KEY: { native: "KEY_WOW64_64KEY", pywin32: "winreg.KEY_WOW64_64KEY", useWhen: "Select the 64-bit view of a redirected key explicitly." },
      },
    },
    "registry-open-options": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winreg/nf-winreg-regopenkeyexw",
      values: {
        REGULAR_KEY: { native: "0", pywin32: "0", useWhen: "Open an ordinary Registry key." },
        REG_OPTION_OPEN_LINK: { native: "REG_OPTION_OPEN_LINK", pywin32: "winreg.REG_OPTION_OPEN_LINK", useWhen: "Open a Registry symbolic-link key itself only when explicitly required." },
      },
    },
    "registry-value-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/sysinfo/registry-value-types",
      values: {
        REG_SZ: { native: "REG_SZ", pywin32: "winreg.REG_SZ", useWhen: "Store one null-terminated string." },
        REG_EXPAND_SZ: { native: "REG_EXPAND_SZ", pywin32: "winreg.REG_EXPAND_SZ", useWhen: "Store a string whose environment references expand when requested." },
        REG_DWORD: { native: "REG_DWORD", pywin32: "winreg.REG_DWORD", useWhen: "Store one 32-bit unsigned integer." },
        REG_QWORD: { native: "REG_QWORD", pywin32: "winreg.REG_QWORD", useWhen: "Store one 64-bit unsigned integer." },
        REG_MULTI_SZ: { native: "REG_MULTI_SZ", pywin32: "winreg.REG_MULTI_SZ", useWhen: "Store an ordered sequence of strings." },
        REG_BINARY: { native: "REG_BINARY", pywin32: "winreg.REG_BINARY", useWhen: "Store uninterpreted bytes under an application-defined schema." },
      },
    },
    "security-information": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/aclapi/nf-aclapi-getnamedsecurityinfow",
      values: {
        OWNER_SECURITY_INFORMATION: { native: "OWNER_SECURITY_INFORMATION", pywin32: "win32security.OWNER_SECURITY_INFORMATION", useWhen: "Read or set the security descriptor owner." },
        GROUP_SECURITY_INFORMATION: { native: "GROUP_SECURITY_INFORMATION", pywin32: "win32security.GROUP_SECURITY_INFORMATION", useWhen: "Read or set the primary group." },
        DACL_SECURITY_INFORMATION: { native: "DACL_SECURITY_INFORMATION", pywin32: "win32security.DACL_SECURITY_INFORMATION", useWhen: "Read or set discretionary access control." },
        SACL_SECURITY_INFORMATION: { native: "SACL_SECURITY_INFORMATION", pywin32: "win32security.SACL_SECURITY_INFORMATION", useWhen: "Read or set audit policy with the required privilege." },
      },
    },
    "securable-object-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/accctrl/ne-accctrl-se_object_type",
      values: {
        SE_FILE_OBJECT: { native: "SE_FILE_OBJECT", pywin32: "win32security.SE_FILE_OBJECT", useWhen: "Target a file, directory, named pipe, or compatible file object." },
        SE_SERVICE: { native: "SE_SERVICE", pywin32: "win32security.SE_SERVICE", useWhen: "Target a Windows service object." },
        SE_REGISTRY_KEY: { native: "SE_REGISTRY_KEY", pywin32: "win32security.SE_REGISTRY_KEY", useWhen: "Target a Registry key." },
        SE_KERNEL_OBJECT: { native: "SE_KERNEL_OBJECT", pywin32: "win32security.SE_KERNEL_OBJECT", useWhen: "Target a supported named kernel object." },
        SE_WINDOW_OBJECT: { native: "SE_WINDOW_OBJECT", pywin32: "win32security.SE_WINDOW_OBJECT", useWhen: "Target a window-station or desktop object." },
      },
    },
    "hook-id": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowshookexw",
      values: {
        WH_CALLWNDPROC: { native: "WH_CALLWNDPROC", pywin32: "win32con.WH_CALLWNDPROC", useWhen: "Observe messages before a window procedure processes them." },
        WH_GETMESSAGE: { native: "WH_GETMESSAGE", pywin32: "win32con.WH_GETMESSAGE", useWhen: "Observe messages removed from a thread message queue." },
        WH_KEYBOARD_LL: { native: "WH_KEYBOARD_LL", pywin32: "win32con.WH_KEYBOARD_LL", useWhen: "Observe low-level keyboard input with strict callback latency and lifetime control." },
        WH_MOUSE_LL: { native: "WH_MOUSE_LL", pywin32: "win32con.WH_MOUSE_LL", useWhen: "Observe low-level mouse input with strict callback latency and lifetime control." },
      },
    },
    "module-loading-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibraryexw",
      values: {
        DEFAULT_LOAD_BEHAVIOR: { native: "0", pywin32: "0", useWhen: "Use LoadLibrary-compatible search and initialization behavior." },
        LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR: { native: "LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR", pywin32: "0x00000100", useWhen: "Search the loaded DLL's directory for its dependencies." },
        LOAD_LIBRARY_SEARCH_APPLICATION_DIR: { native: "LOAD_LIBRARY_SEARCH_APPLICATION_DIR", pywin32: "0x00000200", useWhen: "Include the executable's directory in the dependency search." },
        LOAD_LIBRARY_SEARCH_SYSTEM32: { native: "LOAD_LIBRARY_SEARCH_SYSTEM32", pywin32: "0x00000800", useWhen: "Include System32 in a safe dependency search." },
        LOAD_LIBRARY_SEARCH_USER_DIRS: { native: "LOAD_LIBRARY_SEARCH_USER_DIRS", pywin32: "0x00000400", useWhen: "Include directories added with AddDllDirectory or SetDllDirectory." },
        LOAD_LIBRARY_SEARCH_DEFAULT_DIRS: { native: "LOAD_LIBRARY_SEARCH_DEFAULT_DIRS", pywin32: "0x00001000", useWhen: "Use the documented safe combination of application, user, and System32 directories." },
        DONT_RESOLVE_DLL_REFERENCES: { native: "DONT_RESOLVE_DLL_REFERENCES", pywin32: "win32con.DONT_RESOLVE_DLL_REFERENCES", useWhen: "Inspect a module image without dependency loading or normal initialization; do not execute it." },
      },
    },
    "event-creation-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createeventexw",
      values: {
        AUTO_RESET_NONSIGNALED: { native: "0", pywin32: "0", useWhen: "Create an initially nonsignaled auto-reset event." },
        CREATE_EVENT_MANUAL_RESET: { native: "CREATE_EVENT_MANUAL_RESET", pywin32: "0x00000001", useWhen: "Require ResetEvent after the event becomes signaled." },
        CREATE_EVENT_INITIAL_SET: { native: "CREATE_EVENT_INITIAL_SET", pywin32: "0x00000002", useWhen: "Create a new event in the signaled state." },
      },
    },
    "mutex-creation-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-createmutexexw",
      values: {
        NO_INITIAL_OWNERSHIP: { native: "0", pywin32: "0", useWhen: "Create a new mutex without requesting ownership." },
        CREATE_MUTEX_INITIAL_OWNER: { native: "CREATE_MUTEX_INITIAL_OWNER", pywin32: "0x00000001", useWhen: "Request ownership when this call creates the mutex." },
      },
    },
    "event-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/sync/synchronization-object-security-and-access-rights",
      values: {
        EVENT_MODIFY_STATE: { native: "EVENT_MODIFY_STATE", pywin32: "win32con.EVENT_MODIFY_STATE", useWhen: "Set or reset the event state." },
        SYNCHRONIZE: { native: "SYNCHRONIZE", pywin32: "win32con.SYNCHRONIZE", useWhen: "Wait for the event to become signaled." },
      },
    },
    "mutex-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/sync/synchronization-object-security-and-access-rights",
      values: {
        MUTEX_MODIFY_STATE: { native: "MUTEX_MODIFY_STATE", pywin32: "0x0001", useWhen: "Release a mutex owned by the calling thread." },
        SYNCHRONIZE: { native: "SYNCHRONIZE", pywin32: "win32con.SYNCHRONIZE", useWhen: "Wait to acquire the mutex." },
      },
    },
    "machine-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wow64apiset/nf-wow64apiset-iswow64process2",
      values: {
        IMAGE_FILE_MACHINE_UNKNOWN: { native: "IMAGE_FILE_MACHINE_UNKNOWN", pywin32: "win32con.IMAGE_FILE_MACHINE_UNKNOWN", useWhen: "Interpret pProcessMachine as native to the host rather than WOW64." },
        IMAGE_FILE_MACHINE_I386: { native: "IMAGE_FILE_MACHINE_I386", pywin32: "0x014c", useWhen: "Identify an x86 process or native machine." },
        IMAGE_FILE_MACHINE_AMD64: { native: "IMAGE_FILE_MACHINE_AMD64", pywin32: "0x8664", useWhen: "Identify an x64 process or native machine." },
        IMAGE_FILE_MACHINE_ARM64: { native: "IMAGE_FILE_MACHINE_ARM64", pywin32: "0xAA64", useWhen: "Identify an ARM64 process or native machine." },
        IMAGE_FILE_MACHINE_ARM64EC: { native: "IMAGE_FILE_MACHINE_ARM64EC", pywin32: "0xA641", useWhen: "Identify an ARM64EC-compatible process image where supported." },
      },
    },
    "module-filter": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/psapi/nf-psapi-enumprocessmodulesex",
      values: {
        LIST_MODULES_DEFAULT: { native: "LIST_MODULES_DEFAULT", pywin32: "win32process.LIST_MODULES_DEFAULT", useWhen: "Use the wrapper's default architecture filtering." },
        LIST_MODULES_32BIT: { native: "LIST_MODULES_32BIT", pywin32: "win32process.LIST_MODULES_32BIT", useWhen: "Request 32-bit modules." },
        LIST_MODULES_64BIT: { native: "LIST_MODULES_64BIT", pywin32: "win32process.LIST_MODULES_64BIT", useWhen: "Request 64-bit modules." },
        LIST_MODULES_ALL: { native: "LIST_MODULES_ALL", pywin32: "win32process.LIST_MODULES_ALL", useWhen: "Request modules from both architecture classes where supported." },
      },
    },
    "token-information-class": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winnt/ne-winnt-token_information_class",
      values: {
        TokenUser: { native: "TokenUser", pywin32: "win32security.TokenUser", useWhen: "Read the SID representing the token user." },
        TokenGroups: { native: "TokenGroups", pywin32: "win32security.TokenGroups", useWhen: "Read group SIDs and their attributes." },
        TokenPrivileges: { native: "TokenPrivileges", pywin32: "win32security.TokenPrivileges", useWhen: "Read privileges and their enabled state." },
        TokenType: { native: "TokenType", pywin32: "win32security.TokenType", useWhen: "Distinguish a primary token from an impersonation token." },
        TokenElevation: { native: "TokenElevation", pywin32: "win32security.TokenElevation", useWhen: "Read whether the token is elevated where supported." },
      },
    },
    "message-box-options": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-messageboxw",
      values: {
        MB_OK: { native: "MB_OK", pywin32: "win32con.MB_OK", useWhen: "Display one OK button." },
        MB_OKCANCEL: { native: "MB_OKCANCEL", pywin32: "win32con.MB_OKCANCEL", useWhen: "Let the user confirm or cancel." },
        MB_YESNO: { native: "MB_YESNO", pywin32: "win32con.MB_YESNO", useWhen: "Ask a binary yes-or-no question." },
        MB_ICONINFORMATION: { native: "MB_ICONINFORMATION", pywin32: "win32con.MB_ICONINFORMATION", useWhen: "Show the information icon and sound." },
        MB_ICONWARNING: { native: "MB_ICONWARNING", pywin32: "win32con.MB_ICONWARNING", useWhen: "Show the warning icon and sound." },
      },
    },
    "service-status-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/ne-winsvc-sc_status_type",
      values: {
        SC_STATUS_PROCESS_INFO: { native: "SC_STATUS_PROCESS_INFO", pywin32: "0", useWhen: "Request SERVICE_STATUS_PROCESS data, including the service process identifier." },
      },
    },
    "heap-allocation-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/heapapi/nf-heapapi-heapalloc",
      values: {
        DEFAULT_HEAP_FLAGS: { native: "0", pywin32: "0", useWhen: "Use the heap's ordinary serialized behavior and uninitialized contents." },
        HEAP_ZERO_MEMORY: { native: "HEAP_ZERO_MEMORY", pywin32: "win32con.HEAP_ZERO_MEMORY", useWhen: "Initialize every allocated byte to zero." },
        HEAP_NO_SERIALIZE: { native: "HEAP_NO_SERIALIZE", pywin32: "win32con.HEAP_NO_SERIALIZE", useWhen: "Skip serialization only when the caller exclusively synchronizes access to the heap." },
      },
    },
    "generic-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/secauthz/generic-access-rights",
      values: {
        GENERIC_READ: { native: "GENERIC_READ", pywin32: "win32con.GENERIC_READ", useWhen: "Request the object type's mapped read rights." },
        GENERIC_WRITE: { native: "GENERIC_WRITE", pywin32: "win32con.GENERIC_WRITE", useWhen: "Request the object type's mapped write rights." },
        GENERIC_EXECUTE: { native: "GENERIC_EXECUTE", pywin32: "win32con.GENERIC_EXECUTE", useWhen: "Request the object type's mapped execute rights." },
        GENERIC_ALL: { native: "GENERIC_ALL", pywin32: "win32con.GENERIC_ALL", useWhen: "Request every mapped right only when the operation truly requires it." },
      },
    },
    "named-pipe-wait-timeout": {
      kind: "sentinel",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/namedpipeapi/nf-namedpipeapi-waitnamedpipew",
      values: {
        NMPWAIT_USE_DEFAULT_WAIT: { native: "NMPWAIT_USE_DEFAULT_WAIT", pywin32: "win32pipe.NMPWAIT_USE_DEFAULT_WAIT", useWhen: "Use the timeout configured by the pipe server." },
        NMPWAIT_WAIT_FOREVER: { native: "NMPWAIT_WAIT_FOREVER", pywin32: "win32pipe.NMPWAIT_WAIT_FOREVER", useWhen: "Wait indefinitely only when another path guarantees cancellation or progress." },
      },
    },
    "file-mapping-backing": {
      kind: "sentinel",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-createfilemappingw",
      values: {
        PAGE_FILE_BACKING: { native: "INVALID_HANDLE_VALUE", pywin32: "win32file.INVALID_HANDLE_VALUE", useWhen: "Create a mapping backed by the system paging file instead of an existing file." },
      },
    },
    "heap-operation-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/heapapi/nf-heapapi-heapfree",
      values: {
        DEFAULT_HEAP_FLAGS: { native: "0", pywin32: "0", useWhen: "Use the heap's normal synchronization behavior." },
        HEAP_NO_SERIALIZE: { native: "HEAP_NO_SERIALIZE", pywin32: "win32con.HEAP_NO_SERIALIZE", useWhen: "Skip serialization only when the caller exclusively synchronizes every access to this heap." },
      },
    },
    "trust-action": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wintrust/nf-wintrust-winverifytrust",
      values: {
        WINTRUST_ACTION_GENERIC_VERIFY_V2: { native: "WINTRUST_ACTION_GENERIC_VERIFY_V2", pywin32: "WINTRUST_ACTION_GENERIC_VERIFY_V2", useWhen: "Verify a file or object with the Authenticode policy provider represented by the course call." },
      },
    },
    "duplicate-handle-options": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-duplicatehandle",
      values: {
        DEFAULT_DUPLICATE: { native: "0", pywin32: "0", useWhen: "Keep the source open and apply the explicitly requested access mask." },
        DUPLICATE_CLOSE_SOURCE: { native: "DUPLICATE_CLOSE_SOURCE", pywin32: "win32con.DUPLICATE_CLOSE_SOURCE", useWhen: "Close the source handle as part of the operation, including when duplication fails." },
        DUPLICATE_SAME_ACCESS: { native: "DUPLICATE_SAME_ACCESS", pywin32: "win32con.DUPLICATE_SAME_ACCESS", useWhen: "Ignore desiredAccess and preserve the source handle's granted access." },
      },
    },
    "handle-information-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-sethandleinformation",
      values: {
        CLEAR_SELECTED_FLAGS: { native: "0", pywin32: "0", useWhen: "Clear each flag selected by the Mask parameter." },
        HANDLE_FLAG_INHERIT: { native: "HANDLE_FLAG_INHERIT", pywin32: "win32con.HANDLE_FLAG_INHERIT", useWhen: "Allow inheritance when CreateProcess also enables handle inheritance." },
        HANDLE_FLAG_PROTECT_FROM_CLOSE: { native: "HANDLE_FLAG_PROTECT_FROM_CLOSE", pywin32: "win32con.HANDLE_FLAG_PROTECT_FROM_CLOSE", useWhen: "Make CloseHandle reject this handle until the protection flag is cleared." },
      },
    },
    "standard-handle": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/console/getstdhandle",
      values: {
        STD_INPUT_HANDLE: { native: "STD_INPUT_HANDLE", pywin32: "win32api.STD_INPUT_HANDLE", useWhen: "Retrieve the process's standard-input handle." },
        STD_OUTPUT_HANDLE: { native: "STD_OUTPUT_HANDLE", pywin32: "win32api.STD_OUTPUT_HANDLE", useWhen: "Retrieve the process's standard-output handle." },
        STD_ERROR_HANDLE: { native: "STD_ERROR_HANDLE", pywin32: "win32api.STD_ERROR_HANDLE", useWhen: "Retrieve the process's standard-error handle." },
      },
    },
    "format-message-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-formatmessage",
      values: {
        FORMAT_MESSAGE_FROM_SYSTEM: { native: "FORMAT_MESSAGE_FROM_SYSTEM", pywin32: "win32con.FORMAT_MESSAGE_FROM_SYSTEM", useWhen: "Look up a system message for a Win32 error identifier." },
        FORMAT_MESSAGE_FROM_HMODULE: { native: "FORMAT_MESSAGE_FROM_HMODULE", pywin32: "win32con.FORMAT_MESSAGE_FROM_HMODULE", useWhen: "Look up a message-table resource in the module passed as source." },
        FORMAT_MESSAGE_FROM_STRING: { native: "FORMAT_MESSAGE_FROM_STRING", pywin32: "win32con.FORMAT_MESSAGE_FROM_STRING", useWhen: "Treat source as the message template itself." },
        FORMAT_MESSAGE_IGNORE_INSERTS: { native: "FORMAT_MESSAGE_IGNORE_INSERTS", pywin32: "win32con.FORMAT_MESSAGE_IGNORE_INSERTS", useWhen: "Leave insertion placeholders untouched when no trusted insert values are supplied." },
      },
    },
    "show-window-command": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/shellapi/nf-shellapi-shellexecutew",
      values: {
        SW_HIDE: { native: "SW_HIDE", pywin32: "win32con.SW_HIDE", useWhen: "Ask the launched application's window to start hidden." },
        SW_SHOWNORMAL: { native: "SW_SHOWNORMAL", pywin32: "win32con.SW_SHOWNORMAL", useWhen: "Show and activate the window in its normal state." },
        SW_SHOWMINIMIZED: { native: "SW_SHOWMINIMIZED", pywin32: "win32con.SW_SHOWMINIMIZED", useWhen: "Show and activate the window minimized." },
        SW_SHOWMAXIMIZED: { native: "SW_SHOWMAXIMIZED", pywin32: "win32con.SW_SHOWMAXIMIZED", useWhen: "Show and activate the window maximized." },
        SW_SHOWDEFAULT: { native: "SW_SHOWDEFAULT", pywin32: "win32con.SW_SHOWDEFAULT", useWhen: "Use the show state recorded by the process that launched the application." },
      },
    },
    "process-priority-class": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/procthread/scheduling-priorities",
      values: {
        IDLE_PRIORITY_CLASS: { native: "IDLE_PRIORITY_CLASS", pywin32: "win32process.IDLE_PRIORITY_CLASS", useWhen: "Run work only when higher-priority work does not need the processor." },
        BELOW_NORMAL_PRIORITY_CLASS: { native: "BELOW_NORMAL_PRIORITY_CLASS", pywin32: "win32process.BELOW_NORMAL_PRIORITY_CLASS", useWhen: "Reduce background work below normal without using the idle class." },
        NORMAL_PRIORITY_CLASS: { native: "NORMAL_PRIORITY_CLASS", pywin32: "win32process.NORMAL_PRIORITY_CLASS", useWhen: "Use the ordinary process scheduling class." },
        ABOVE_NORMAL_PRIORITY_CLASS: { native: "ABOVE_NORMAL_PRIORITY_CLASS", pywin32: "win32process.ABOVE_NORMAL_PRIORITY_CLASS", useWhen: "Raise controlled responsive work modestly above normal." },
        HIGH_PRIORITY_CLASS: { native: "HIGH_PRIORITY_CLASS", pywin32: "win32process.HIGH_PRIORITY_CLASS", useWhen: "Use only for time-critical work that cannot starve normal applications." },
        REALTIME_PRIORITY_CLASS: { native: "REALTIME_PRIORITY_CLASS", pywin32: "win32process.REALTIME_PRIORITY_CLASS", useWhen: "Avoid in ordinary code because it can preempt essential system work." },
      },
    },
    "thread-priority": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/procthread/scheduling-priorities",
      values: {
        THREAD_PRIORITY_IDLE: { native: "THREAD_PRIORITY_IDLE", pywin32: "win32process.THREAD_PRIORITY_IDLE", useWhen: "Use the lowest relative priority for deferrable thread work." },
        THREAD_PRIORITY_LOWEST: { native: "THREAD_PRIORITY_LOWEST", pywin32: "win32process.THREAD_PRIORITY_LOWEST", useWhen: "Move a thread two levels below its process class." },
        THREAD_PRIORITY_BELOW_NORMAL: { native: "THREAD_PRIORITY_BELOW_NORMAL", pywin32: "win32process.THREAD_PRIORITY_BELOW_NORMAL", useWhen: "Move background work one level below its process class." },
        THREAD_PRIORITY_NORMAL: { native: "THREAD_PRIORITY_NORMAL", pywin32: "win32process.THREAD_PRIORITY_NORMAL", useWhen: "Use the process priority class without a relative adjustment." },
        THREAD_PRIORITY_ABOVE_NORMAL: { native: "THREAD_PRIORITY_ABOVE_NORMAL", pywin32: "win32process.THREAD_PRIORITY_ABOVE_NORMAL", useWhen: "Raise a responsive thread one level within its process class." },
        THREAD_PRIORITY_HIGHEST: { native: "THREAD_PRIORITY_HIGHEST", pywin32: "win32process.THREAD_PRIORITY_HIGHEST", useWhen: "Raise a controlled thread two levels within its process class." },
        THREAD_PRIORITY_TIME_CRITICAL: { native: "THREAD_PRIORITY_TIME_CRITICAL", pywin32: "win32process.THREAD_PRIORITY_TIME_CRITICAL", useWhen: "Avoid for ordinary application work because it can starve other threads." },
      },
    },
    "semaphore-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/sync/synchronization-object-security-and-access-rights",
      values: {
        SEMAPHORE_MODIFY_STATE: { native: "SEMAPHORE_MODIFY_STATE", pywin32: "win32con.SEMAPHORE_MODIFY_STATE", useWhen: "Increase the semaphore count with ReleaseSemaphore." },
        SYNCHRONIZE: { native: "SYNCHRONIZE", pywin32: "win32con.SYNCHRONIZE", useWhen: "Wait to acquire one semaphore count." },
      },
    },
    "final-path-format": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfinalpathnamebyhandlew",
      values: {
        FILE_NAME_NORMALIZED: { native: "FILE_NAME_NORMALIZED", pywin32: "win32con.FILE_NAME_NORMALIZED", useWhen: "Return the normalized path components." },
        FILE_NAME_OPENED: { native: "FILE_NAME_OPENED", pywin32: "win32con.FILE_NAME_OPENED", useWhen: "Preserve the path form used to open the handle." },
        VOLUME_NAME_DOS: { native: "VOLUME_NAME_DOS", pywin32: "win32con.VOLUME_NAME_DOS", useWhen: "Return a DOS drive path when one is available." },
        VOLUME_NAME_GUID: { native: "VOLUME_NAME_GUID", pywin32: "win32con.VOLUME_NAME_GUID", useWhen: "Return a volume-GUID path." },
        VOLUME_NAME_NT: { native: "VOLUME_NAME_NT", pywin32: "win32con.VOLUME_NAME_NT", useWhen: "Return the NT device-object path." },
        VOLUME_NAME_NONE: { native: "VOLUME_NAME_NONE", pywin32: "win32con.VOLUME_NAME_NONE", useWhen: "Return the path without volume information." },
      },
    },
    "file-pointer-origin": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-setfilepointerex",
      values: {
        FILE_BEGIN: { native: "FILE_BEGIN", pywin32: "win32con.FILE_BEGIN", useWhen: "Measure the offset from the beginning of the file." },
        FILE_CURRENT: { native: "FILE_CURRENT", pywin32: "win32con.FILE_CURRENT", useWhen: "Measure the offset from the current synchronous file pointer." },
        FILE_END: { native: "FILE_END", pywin32: "win32con.FILE_END", useWhen: "Measure the offset from the current end of the file." },
      },
    },
    "file-attributes": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-setfileattributesw",
      values: {
        FILE_ATTRIBUTE_NORMAL: { native: "FILE_ATTRIBUTE_NORMAL", pywin32: "win32con.FILE_ATTRIBUTE_NORMAL", useWhen: "Use no special attributes; this value must stand alone." },
        FILE_ATTRIBUTE_READONLY: { native: "FILE_ATTRIBUTE_READONLY", pywin32: "win32con.FILE_ATTRIBUTE_READONLY", useWhen: "Mark a file read-only to ordinary write and delete operations." },
        FILE_ATTRIBUTE_HIDDEN: { native: "FILE_ATTRIBUTE_HIDDEN", pywin32: "win32con.FILE_ATTRIBUTE_HIDDEN", useWhen: "Hide an item from ordinary directory listings." },
        FILE_ATTRIBUTE_SYSTEM: { native: "FILE_ATTRIBUTE_SYSTEM", pywin32: "win32con.FILE_ATTRIBUTE_SYSTEM", useWhen: "Mark an item as used by the operating system." },
        FILE_ATTRIBUTE_ARCHIVE: { native: "FILE_ATTRIBUTE_ARCHIVE", pywin32: "win32con.FILE_ATTRIBUTE_ARCHIVE", useWhen: "Mark a file as changed since the last backup." },
        FILE_ATTRIBUTE_TEMPORARY: { native: "FILE_ATTRIBUTE_TEMPORARY", pywin32: "win32con.FILE_ATTRIBUTE_TEMPORARY", useWhen: "Tell caching that an application expects short-lived file use." },
      },
    },
    "file-notify-filter": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw",
      values: {
        FILE_NOTIFY_CHANGE_FILE_NAME: { native: "FILE_NOTIFY_CHANGE_FILE_NAME", pywin32: "win32con.FILE_NOTIFY_CHANGE_FILE_NAME", useWhen: "Report file creation, deletion, or rename changes." },
        FILE_NOTIFY_CHANGE_DIR_NAME: { native: "FILE_NOTIFY_CHANGE_DIR_NAME", pywin32: "win32con.FILE_NOTIFY_CHANGE_DIR_NAME", useWhen: "Report directory creation, deletion, or rename changes." },
        FILE_NOTIFY_CHANGE_ATTRIBUTES: { native: "FILE_NOTIFY_CHANGE_ATTRIBUTES", pywin32: "win32con.FILE_NOTIFY_CHANGE_ATTRIBUTES", useWhen: "Report attribute changes." },
        FILE_NOTIFY_CHANGE_SIZE: { native: "FILE_NOTIFY_CHANGE_SIZE", pywin32: "win32con.FILE_NOTIFY_CHANGE_SIZE", useWhen: "Report file-size changes." },
        FILE_NOTIFY_CHANGE_LAST_WRITE: { native: "FILE_NOTIFY_CHANGE_LAST_WRITE", pywin32: "win32con.FILE_NOTIFY_CHANGE_LAST_WRITE", useWhen: "Report last-write timestamp changes." },
        FILE_NOTIFY_CHANGE_SECURITY: { native: "FILE_NOTIFY_CHANGE_SECURITY", pywin32: "win32con.FILE_NOTIFY_CHANGE_SECURITY", useWhen: "Report security-descriptor changes." },
      },
    },
    "well-known-sid-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winnt/ne-winnt-well_known_sid_type",
      values: {
        WinWorldSid: { native: "WinWorldSid", pywin32: "win32security.WinWorldSid", useWhen: "Build the Everyone SID without relying on a localized account name." },
        WinAuthenticatedUserSid: { native: "WinAuthenticatedUserSid", pywin32: "win32security.WinAuthenticatedUserSid", useWhen: "Build the SID matching authenticated users." },
        WinLocalSystemSid: { native: "WinLocalSystemSid", pywin32: "win32security.WinLocalSystemSid", useWhen: "Build the LocalSystem account SID." },
        WinLocalServiceSid: { native: "WinLocalServiceSid", pywin32: "win32security.WinLocalServiceSid", useWhen: "Build the LocalService account SID." },
        WinNetworkServiceSid: { native: "WinNetworkServiceSid", pywin32: "win32security.WinNetworkServiceSid", useWhen: "Build the NetworkService account SID." },
        WinBuiltinAdministratorsSid: { native: "WinBuiltinAdministratorsSid", pywin32: "win32security.WinBuiltinAdministratorsSid", useWhen: "Build the local built-in Administrators group SID." },
        WinBuiltinUsersSid: { native: "WinBuiltinUsersSid", pywin32: "win32security.WinBuiltinUsersSid", useWhen: "Build the local built-in Users group SID." },
      },
    },
    "restricted-token-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-createrestrictedtoken",
      values: {
        NO_ADDITIONAL_RESTRICTION_FLAGS: { native: "0", pywin32: "0", useWhen: "Apply only the explicit SID and privilege lists supplied to the call." },
        DISABLE_MAX_PRIVILEGE: { native: "DISABLE_MAX_PRIVILEGE", pywin32: "win32security.DISABLE_MAX_PRIVILEGE", useWhen: "Disable every privilege except SeChangeNotifyPrivilege and ignore the delete-privilege list." },
        SANDBOX_INERT: { native: "SANDBOX_INERT", pywin32: "win32security.SANDBOX_INERT", useWhen: "Use only for the documented setup-system scenario; it bypasses software restriction and AppLocker checks." },
      },
    },
    "security-descriptor-revision": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/sddl/nf-sddl-convertsecuritydescriptortostringsecuritydescriptorw",
      values: {
        SDDL_REVISION_1: { native: "SDDL_REVISION_1", pywin32: "win32security.SDDL_REVISION_1", useWhen: "Use the only currently supported SDDL revision." },
      },
    },
    "logon-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-logonuserw",
      values: {
        LOGON32_LOGON_INTERACTIVE: { native: "LOGON32_LOGON_INTERACTIVE", pywin32: "win32security.LOGON32_LOGON_INTERACTIVE", useWhen: "Create an interactive logon token for a user who will use the computer directly." },
        LOGON32_LOGON_NETWORK: { native: "LOGON32_LOGON_NETWORK", pywin32: "win32security.LOGON32_LOGON_NETWORK", useWhen: "Authenticate for inbound network access without caching credentials." },
        LOGON32_LOGON_BATCH: { native: "LOGON32_LOGON_BATCH", pywin32: "win32security.LOGON32_LOGON_BATCH", useWhen: "Represent unattended batch work under an account with the batch logon right." },
        LOGON32_LOGON_SERVICE: { native: "LOGON32_LOGON_SERVICE", pywin32: "win32security.LOGON32_LOGON_SERVICE", useWhen: "Represent a service account with the service logon right." },
        LOGON32_LOGON_NETWORK_CLEARTEXT: { native: "LOGON32_LOGON_NETWORK_CLEARTEXT", pywin32: "win32security.LOGON32_LOGON_NETWORK_CLEARTEXT", useWhen: "Preserve credentials for outbound network access only in a justified server design." },
        LOGON32_LOGON_NEW_CREDENTIALS: { native: "LOGON32_LOGON_NEW_CREDENTIALS", pywin32: "win32security.LOGON32_LOGON_NEW_CREDENTIALS", useWhen: "Keep the local identity while supplying different credentials for outbound connections." },
      },
    },
    "logon-provider": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-logonuserw",
      values: {
        LOGON32_PROVIDER_DEFAULT: { native: "LOGON32_PROVIDER_DEFAULT", pywin32: "win32security.LOGON32_PROVIDER_DEFAULT", useWhen: "Use the system's standard negotiated provider." },
        LOGON32_PROVIDER_WINNT50: { native: "LOGON32_PROVIDER_WINNT50", pywin32: "win32security.LOGON32_PROVIDER_WINNT50", useWhen: "Select the Negotiate provider, including for new-credentials logons." },
        LOGON32_PROVIDER_WINNT40: { native: "LOGON32_PROVIDER_WINNT40", pywin32: "win32security.LOGON32_PROVIDER_WINNT40", useWhen: "Select the legacy NTLM provider only when compatibility requires it." },
      },
    },
    "service-enumeration-type": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-enumservicesstatusexw",
      values: {
        SERVICE_WIN32: { native: "SERVICE_WIN32", pywin32: "win32service.SERVICE_WIN32", useWhen: "Enumerate Win32 own-process and shared-process services together." },
        SERVICE_DRIVER: { native: "SERVICE_DRIVER", pywin32: "win32service.SERVICE_DRIVER", useWhen: "Enumerate kernel and file-system driver services together." },
        SERVICE_WIN32_OWN_PROCESS: { native: "SERVICE_WIN32_OWN_PROCESS", pywin32: "win32service.SERVICE_WIN32_OWN_PROCESS", useWhen: "Limit results to services hosted in their own process." },
        SERVICE_WIN32_SHARE_PROCESS: { native: "SERVICE_WIN32_SHARE_PROCESS", pywin32: "win32service.SERVICE_WIN32_SHARE_PROCESS", useWhen: "Limit results to services sharing a host process." },
      },
    },
    "service-state-filter": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-enumservicesstatusexw",
      values: {
        SERVICE_ACTIVE: { native: "SERVICE_ACTIVE", pywin32: "win32service.SERVICE_ACTIVE", useWhen: "Return services in an active or pending active state." },
        SERVICE_INACTIVE: { native: "SERVICE_INACTIVE", pywin32: "win32service.SERVICE_INACTIVE", useWhen: "Return stopped services." },
        SERVICE_STATE_ALL: { native: "SERVICE_STATE_ALL", pywin32: "win32service.SERVICE_STATE_ALL", useWhen: "Return both active and inactive services." },
      },
    },
    "service-enumeration-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-enumservicesstatusexw",
      values: {
        SC_ENUM_PROCESS_INFO: { native: "SC_ENUM_PROCESS_INFO", pywin32: "win32service.SC_ENUM_PROCESS_INFO", useWhen: "Return each service's status plus its process identifier when running." },
      },
    },
    "service-config-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-queryserviceconfig2w",
      values: {
        SERVICE_CONFIG_DESCRIPTION: { native: "SERVICE_CONFIG_DESCRIPTION", pywin32: "win32service.SERVICE_CONFIG_DESCRIPTION", useWhen: "Read the service description." },
        SERVICE_CONFIG_FAILURE_ACTIONS: { native: "SERVICE_CONFIG_FAILURE_ACTIONS", pywin32: "win32service.SERVICE_CONFIG_FAILURE_ACTIONS", useWhen: "Read recovery actions configured after service failures." },
        SERVICE_CONFIG_DELAYED_AUTO_START_INFO: { native: "SERVICE_CONFIG_DELAYED_AUTO_START_INFO", pywin32: "win32service.SERVICE_CONFIG_DELAYED_AUTO_START_INFO", useWhen: "Read whether an automatic service uses delayed start." },
        SERVICE_CONFIG_FAILURE_ACTIONS_FLAG: { native: "SERVICE_CONFIG_FAILURE_ACTIONS_FLAG", pywin32: "win32service.SERVICE_CONFIG_FAILURE_ACTIONS_FLAG", useWhen: "Read whether failure actions also apply to non-crash stops." },
        SERVICE_CONFIG_SERVICE_SID_INFO: { native: "SERVICE_CONFIG_SERVICE_SID_INFO", pywin32: "win32service.SERVICE_CONFIG_SERVICE_SID_INFO", useWhen: "Read the service SID type." },
        SERVICE_CONFIG_REQUIRED_PRIVILEGES_INFO: { native: "SERVICE_CONFIG_REQUIRED_PRIVILEGES_INFO", pywin32: "win32service.SERVICE_CONFIG_REQUIRED_PRIVILEGES_INFO", useWhen: "Read the privileges the service declares it requires." },
      },
    },
    "service-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-createservicew",
      values: {
        SERVICE_KERNEL_DRIVER: { native: "SERVICE_KERNEL_DRIVER", pywin32: "win32service.SERVICE_KERNEL_DRIVER", useWhen: "Install a kernel-driver service in an authorized driver workflow." },
        SERVICE_FILE_SYSTEM_DRIVER: { native: "SERVICE_FILE_SYSTEM_DRIVER", pywin32: "win32service.SERVICE_FILE_SYSTEM_DRIVER", useWhen: "Install a file-system-driver service." },
        SERVICE_WIN32_OWN_PROCESS: { native: "SERVICE_WIN32_OWN_PROCESS", pywin32: "win32service.SERVICE_WIN32_OWN_PROCESS", useWhen: "Run the service executable in its own process." },
        SERVICE_WIN32_SHARE_PROCESS: { native: "SERVICE_WIN32_SHARE_PROCESS", pywin32: "win32service.SERVICE_WIN32_SHARE_PROCESS", useWhen: "Host the service with other compatible services in one process." },
        SERVICE_NO_CHANGE: { native: "SERVICE_NO_CHANGE", pywin32: "win32service.SERVICE_NO_CHANGE", useWhen: "Preserve the current service type in ChangeServiceConfig." },
      },
    },
    "service-start-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-createservicew",
      values: {
        SERVICE_BOOT_START: { native: "SERVICE_BOOT_START", pywin32: "win32service.SERVICE_BOOT_START", useWhen: "Start a driver with the system loader." },
        SERVICE_SYSTEM_START: { native: "SERVICE_SYSTEM_START", pywin32: "win32service.SERVICE_SYSTEM_START", useWhen: "Start a driver during kernel initialization." },
        SERVICE_AUTO_START: { native: "SERVICE_AUTO_START", pywin32: "win32service.SERVICE_AUTO_START", useWhen: "Start the service automatically during system startup." },
        SERVICE_DEMAND_START: { native: "SERVICE_DEMAND_START", pywin32: "win32service.SERVICE_DEMAND_START", useWhen: "Start the service only when explicitly requested." },
        SERVICE_DISABLED: { native: "SERVICE_DISABLED", pywin32: "win32service.SERVICE_DISABLED", useWhen: "Prevent the service from starting." },
        SERVICE_NO_CHANGE: { native: "SERVICE_NO_CHANGE", pywin32: "win32service.SERVICE_NO_CHANGE", useWhen: "Preserve the current start type in ChangeServiceConfig." },
      },
    },
    "service-error-control": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-createservicew",
      values: {
        SERVICE_ERROR_IGNORE: { native: "SERVICE_ERROR_IGNORE", pywin32: "win32service.SERVICE_ERROR_IGNORE", useWhen: "Continue startup without logging this service's start failure." },
        SERVICE_ERROR_NORMAL: { native: "SERVICE_ERROR_NORMAL", pywin32: "win32service.SERVICE_ERROR_NORMAL", useWhen: "Log the failure and continue startup." },
        SERVICE_ERROR_SEVERE: { native: "SERVICE_ERROR_SEVERE", pywin32: "win32service.SERVICE_ERROR_SEVERE", useWhen: "Restart with the last-known-good configuration when appropriate." },
        SERVICE_ERROR_CRITICAL: { native: "SERVICE_ERROR_CRITICAL", pywin32: "win32service.SERVICE_ERROR_CRITICAL", useWhen: "Treat startup failure as critical and use last-known-good recovery." },
        SERVICE_NO_CHANGE: { native: "SERVICE_NO_CHANGE", pywin32: "win32service.SERVICE_NO_CHANGE", useWhen: "Preserve the current error-control value in ChangeServiceConfig." },
      },
    },
    "event-log-read-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readeventlogw",
      values: {
        EVENTLOG_SEQUENTIAL_READ: { native: "EVENTLOG_SEQUENTIAL_READ", pywin32: "win32evtlog.EVENTLOG_SEQUENTIAL_READ", useWhen: "Continue reading from the log's current read position." },
        EVENTLOG_SEEK_READ: { native: "EVENTLOG_SEEK_READ", pywin32: "win32evtlog.EVENTLOG_SEEK_READ", useWhen: "Begin at the record number supplied as Offset." },
        EVENTLOG_FORWARDS_READ: { native: "EVENTLOG_FORWARDS_READ", pywin32: "win32evtlog.EVENTLOG_FORWARDS_READ", useWhen: "Read from older records toward newer records." },
        EVENTLOG_BACKWARDS_READ: { native: "EVENTLOG_BACKWARDS_READ", pywin32: "win32evtlog.EVENTLOG_BACKWARDS_READ", useWhen: "Read from newer records toward older records." },
      },
    },
    "evt-render-flags": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winevt/nf-winevt-evtrender",
      values: {
        EvtRenderEventValues: { native: "EvtRenderEventValues", pywin32: "win32evtlog.EvtRenderEventValues", useWhen: "Render the values selected by an event render context." },
        EvtRenderEventXml: { native: "EvtRenderEventXml", pywin32: "win32evtlog.EvtRenderEventXml", useWhen: "Render the complete event as XML." },
        EvtRenderBookmark: { native: "EvtRenderBookmark", pywin32: "win32evtlog.EvtRenderBookmark", useWhen: "Render a bookmark handle as XML for persistence." },
      },
    },
    "evt-subscribe-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winevt/ne-winevt-evt_subscribe_flags",
      values: {
        EvtSubscribeToFutureEvents: { native: "EvtSubscribeToFutureEvents", pywin32: "win32evtlog.EvtSubscribeToFutureEvents", useWhen: "Receive only matching events written after the subscription starts." },
        EvtSubscribeStartAtOldestRecord: { native: "EvtSubscribeStartAtOldestRecord", pywin32: "win32evtlog.EvtSubscribeStartAtOldestRecord", useWhen: "Receive existing matching events before future events." },
        EvtSubscribeStartAfterBookmark: { native: "EvtSubscribeStartAfterBookmark", pywin32: "win32evtlog.EvtSubscribeStartAfterBookmark", useWhen: "Resume after the event identified by the supplied bookmark." },
        EvtSubscribeTolerateQueryErrors: { native: "EvtSubscribeTolerateQueryErrors", pywin32: "win32evtlog.EvtSubscribeTolerateQueryErrors", useWhen: "Continue with valid parts of a multi-part query and inspect extended status." },
        EvtSubscribeStrict: { native: "EvtSubscribeStrict", pywin32: "win32evtlog.EvtSubscribeStrict", useWhen: "Fail when a requested bookmark is missing and report missing records." },
      },
    },
    "evt-query-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winevt/ne-winevt-evt_query_flags",
      values: {
        EvtQueryChannelPath: { native: "EvtQueryChannelPath", pywin32: "win32evtlog.EvtQueryChannelPath", useWhen: "Interpret Path as a live event-log channel." },
        EvtQueryFilePath: { native: "EvtQueryFilePath", pywin32: "win32evtlog.EvtQueryFilePath", useWhen: "Interpret Path as an exported log file." },
        EvtQueryForwardDirection: { native: "EvtQueryForwardDirection", pywin32: "win32evtlog.EvtQueryForwardDirection", useWhen: "Return matching events from oldest to newest." },
        EvtQueryReverseDirection: { native: "EvtQueryReverseDirection", pywin32: "win32evtlog.EvtQueryReverseDirection", useWhen: "Return matching events from newest to oldest." },
        EvtQueryTolerateQueryErrors: { native: "EvtQueryTolerateQueryErrors", pywin32: "win32evtlog.EvtQueryTolerateQueryErrors", useWhen: "Return results from valid query paths and inspect per-path status." },
      },
    },
    "evt-timeout": {
      kind: "sentinel",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winevt/nf-winevt-evtnext",
      values: {
        ZERO_TIMEOUT: { native: "0", pywin32: "0", useWhen: "Poll the result set without waiting." },
        INFINITE: { native: "INFINITE", pywin32: "-1", useWhen: "Wait indefinitely only when another path can cancel or close the operation." },
      },
    },
    "evt-export-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winevt/nf-winevt-evtexportlog",
      values: {
        EvtExportLogChannelPath: { native: "EvtExportLogChannelPath", pywin32: "win32evtlog.EvtExportLogChannelPath", useWhen: "Export from a live event-log channel." },
        EvtExportLogFilePath: { native: "EvtExportLogFilePath", pywin32: "win32evtlog.EvtExportLogFilePath", useWhen: "Export from an existing log file." },
        EvtExportLogTolerateQueryErrors: { native: "EvtExportLogTolerateQueryErrors", pywin32: "win32evtlog.EvtExportLogTolerateQueryErrors", useWhen: "Export valid query paths while retaining diagnostics for invalid paths." },
      },
    },
    "evt-login-class": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winevt/nf-winevt-evtopensession",
      values: {
        EvtRpcLogin: { native: "EvtRpcLogin", pywin32: "win32evtlog.EvtRpcLogin", useWhen: "Use the only defined remote Event Log login class." },
      },
    },
    "job-access": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/procthread/job-object-security-and-access-rights",
      values: {
        JOB_OBJECT_ASSIGN_PROCESS: { native: "JOB_OBJECT_ASSIGN_PROCESS", pywin32: "win32job.JOB_OBJECT_ASSIGN_PROCESS", useWhen: "Assign processes to the job." },
        JOB_OBJECT_SET_ATTRIBUTES: { native: "JOB_OBJECT_SET_ATTRIBUTES", pywin32: "win32job.JOB_OBJECT_SET_ATTRIBUTES", useWhen: "Change limits or other job information." },
        JOB_OBJECT_QUERY: { native: "JOB_OBJECT_QUERY", pywin32: "win32job.JOB_OBJECT_QUERY", useWhen: "Query job limits and accounting information." },
        JOB_OBJECT_TERMINATE: { native: "JOB_OBJECT_TERMINATE", pywin32: "win32job.JOB_OBJECT_TERMINATE", useWhen: "Terminate every process currently assigned to the job." },
        SYNCHRONIZE: { native: "SYNCHRONIZE", pywin32: "win32con.SYNCHRONIZE", useWhen: "Wait for the job to become signaled." },
      },
    },
    "job-information-class": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/jobapi2/nf-jobapi2-queryinformationjobobject",
      values: {
        JobObjectBasicAccountingInformation: { native: "JobObjectBasicAccountingInformation", pywin32: "win32job.JobObjectBasicAccountingInformation", useWhen: "Read process counts and accumulated execution time." },
        JobObjectBasicAndIoAccountingInformation: { native: "JobObjectBasicAndIoAccountingInformation", pywin32: "win32job.JobObjectBasicAndIoAccountingInformation", useWhen: "Read basic plus I/O accounting totals." },
        JobObjectBasicLimitInformation: { native: "JobObjectBasicLimitInformation", pywin32: "win32job.JobObjectBasicLimitInformation", useWhen: "Read or set basic scheduling and process limits." },
        JobObjectBasicProcessIdList: { native: "JobObjectBasicProcessIdList", pywin32: "win32job.JobObjectBasicProcessIdList", useWhen: "List process identifiers currently assigned to the job." },
        JobObjectBasicUIRestrictions: { native: "JobObjectBasicUIRestrictions", pywin32: "win32job.JobObjectBasicUIRestrictions", useWhen: "Read or set user-interface restrictions." },
        JobObjectExtendedLimitInformation: { native: "JobObjectExtendedLimitInformation", pywin32: "win32job.JobObjectExtendedLimitInformation", useWhen: "Read or set memory, process, and kill-on-close limits used by course job examples." },
      },
    },
    "reserved-zero": {
      kind: "sentinel",
      source: "https://learn.microsoft.com/en-us/windows/win32/winprog/windows-data-types",
      values: {
        MUST_BE_ZERO: { native: "0", pywin32: "0", useWhen: "Pass the required reserved value; nonzero input is not a supported option." },
      },
    },
    "reserved-none": {
      kind: "sentinel",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata",
      values: {
        MUST_BE_NONE: { native: "NULL", pywin32: "None", useWhen: "Pass the required reserved null value." },
      },
    },
    "format-message-language": {
      kind: "sentinel",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-formatmessage",
      values: {
        LANGUAGE_SEARCH_ORDER: { native: "0", pywin32: "0", useWhen: "Use the documented neutral, thread, user, system, and US-English language search order." },
      },
    },
    "credential-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wincred/ns-wincred-credentialw",
      values: {
        CRED_TYPE_GENERIC: { native: "CRED_TYPE_GENERIC", pywin32: "win32cred.CRED_TYPE_GENERIC", useWhen: "Store application-defined credential data for an application-specific target." },
        CRED_TYPE_DOMAIN_PASSWORD: { native: "CRED_TYPE_DOMAIN_PASSWORD", pywin32: "win32cred.CRED_TYPE_DOMAIN_PASSWORD", useWhen: "Address a domain password credential used by Windows authentication packages." },
        CRED_TYPE_DOMAIN_CERTIFICATE: { native: "CRED_TYPE_DOMAIN_CERTIFICATE", pywin32: "win32cred.CRED_TYPE_DOMAIN_CERTIFICATE", useWhen: "Address a certificate credential used by Windows authentication packages." },
      },
    },
    "credential-write-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wincred/nf-wincred-credwritew",
      values: {
        REPLACE_CREDENTIAL: { native: "0", pywin32: "0", useWhen: "Write the supplied credential data, including its blob." },
        CRED_PRESERVE_CREDENTIAL_BLOB: { native: "CRED_PRESERVE_CREDENTIAL_BLOB", pywin32: "win32cred.CRED_PRESERVE_CREDENTIAL_BLOB", useWhen: "Update other fields of an existing credential without replacing its secret blob." },
      },
    },
    "credential-enumerate-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wincred/nf-wincred-credenumeratew",
      values: {
        MATCH_FILTER: { native: "0", pywin32: "0", useWhen: "Enumerate credentials whose target names match the supplied filter." },
        CRED_ENUMERATE_ALL_CREDENTIALS: { native: "CRED_ENUMERATE_ALL_CREDENTIALS", pywin32: "win32cred.CRED_ENUMERATE_ALL_CREDENTIALS", useWhen: "Enumerate every credential for the logon session; pass a null filter." },
      },
    },
    "credential-domain-read-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wincred/nf-wincred-credreaddomaincredentialsw",
      values: {
        DEFAULT_DOMAIN_LOOKUP: { native: "0", pywin32: "0", useWhen: "Read matching domain credentials without caching target information." },
        CRED_CACHE_TARGET_INFORMATION: { native: "CRED_CACHE_TARGET_INFORMATION", pywin32: "win32cred.CRED_CACHE_TARGET_INFORMATION", useWhen: "Cache target information for later domain-credential matching." },
      },
    },
    "dpapi-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata",
      values: {
        DEFAULT_DPAPI_SCOPE: { native: "0", pywin32: "0", useWhen: "Bind protection to the current user and allow the documented default UI behavior." },
        CRYPTPROTECT_UI_FORBIDDEN: { native: "CRYPTPROTECT_UI_FORBIDDEN", pywin32: "win32cryptcon.CRYPTPROTECT_UI_FORBIDDEN", useWhen: "Fail instead of showing UI, as required for unattended code." },
        CRYPTPROTECT_LOCAL_MACHINE: { native: "CRYPTPROTECT_LOCAL_MACHINE", pywin32: "win32cryptcon.CRYPTPROTECT_LOCAL_MACHINE", useWhen: "Allow any account on this computer to decrypt under DPAPI machine scope." },
        CRYPTPROTECT_AUDIT: { native: "CRYPTPROTECT_AUDIT", pywin32: "win32cryptcon.CRYPTPROTECT_AUDIT", useWhen: "Generate an audit record when a nonempty description is supplied and policy enables auditing." },
        CRYPTPROTECT_VERIFY_PROTECTION: { native: "CRYPTPROTECT_VERIFY_PROTECTION", pywin32: "win32cryptcon.CRYPTPROTECT_VERIFY_PROTECTION", useWhen: "On unprotect, report when the protected blob should be reprotected under current policy." },
      },
    },
    "cert-query-object-type": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wincrypt/nf-wincrypt-cryptqueryobject",
      values: {
        CERT_QUERY_OBJECT_FILE: { native: "CERT_QUERY_OBJECT_FILE", pywin32: "win32cryptcon.CERT_QUERY_OBJECT_FILE", useWhen: "Treat Object as a file path." },
        CERT_QUERY_OBJECT_BLOB: { native: "CERT_QUERY_OBJECT_BLOB", pywin32: "win32cryptcon.CERT_QUERY_OBJECT_BLOB", useWhen: "Treat Object as encoded data already in memory." },
      },
    },
    "cert-query-content-type": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wincrypt/nf-wincrypt-cryptqueryobject",
      values: {
        CERT_QUERY_CONTENT_FLAG_CERT: { native: "CERT_QUERY_CONTENT_FLAG_CERT", pywin32: "win32cryptcon.CERT_QUERY_CONTENT_FLAG_CERT", useWhen: "Expect one encoded certificate." },
        CERT_QUERY_CONTENT_FLAG_PKCS7_SIGNED: { native: "CERT_QUERY_CONTENT_FLAG_PKCS7_SIGNED", pywin32: "win32cryptcon.CERT_QUERY_CONTENT_FLAG_PKCS7_SIGNED", useWhen: "Expect a signed PKCS #7 message." },
        CERT_QUERY_CONTENT_FLAG_PKCS7_SIGNED_EMBED: { native: "CERT_QUERY_CONTENT_FLAG_PKCS7_SIGNED_EMBED", pywin32: "win32cryptcon.CERT_QUERY_CONTENT_FLAG_PKCS7_SIGNED_EMBED", useWhen: "Expect content embedded in a signed PKCS #7 message." },
        CERT_QUERY_CONTENT_FLAG_PFX: { native: "CERT_QUERY_CONTENT_FLAG_PFX", pywin32: "win32cryptcon.CERT_QUERY_CONTENT_FLAG_PFX", useWhen: "Expect a PFX object without automatically loading it." },
        CERT_QUERY_CONTENT_FLAG_ALL: { native: "CERT_QUERY_CONTENT_FLAG_ALL", pywin32: "win32cryptcon.CERT_QUERY_CONTENT_FLAG_ALL", useWhen: "Probe all supported content types only when the content type is genuinely unknown." },
      },
    },
    "cert-query-format-type": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/wincrypt/nf-wincrypt-cryptqueryobject",
      values: {
        CERT_QUERY_FORMAT_FLAG_BINARY: { native: "CERT_QUERY_FORMAT_FLAG_BINARY", pywin32: "win32cryptcon.CERT_QUERY_FORMAT_FLAG_BINARY", useWhen: "Expect binary encoded input." },
        CERT_QUERY_FORMAT_FLAG_BASE64_ENCODED: { native: "CERT_QUERY_FORMAT_FLAG_BASE64_ENCODED", pywin32: "win32cryptcon.CERT_QUERY_FORMAT_FLAG_BASE64_ENCODED", useWhen: "Expect Base64 encoded input." },
        CERT_QUERY_FORMAT_FLAG_ASN_ASCII_HEX_ENCODED: { native: "CERT_QUERY_FORMAT_FLAG_ASN_ASCII_HEX_ENCODED", pywin32: "win32cryptcon.CERT_QUERY_FORMAT_FLAG_ASN_ASCII_HEX_ENCODED", useWhen: "Expect ASCII hexadecimal input with an ASN prefix." },
        CERT_QUERY_FORMAT_FLAG_ALL: { native: "CERT_QUERY_FORMAT_FLAG_ALL", pywin32: "win32cryptcon.CERT_QUERY_FORMAT_FLAG_ALL", useWhen: "Probe every supported format only when the encoding is unknown." },
      },
    },
    "protect-memory-scope": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectmemory",
      values: {
        CRYPTPROTECTMEMORY_SAME_PROCESS: { native: "CRYPTPROTECTMEMORY_SAME_PROCESS", pywin32: "win32cryptcon.CRYPTPROTECTMEMORY_SAME_PROCESS", useWhen: "Allow decryption only within the process that protected the memory." },
        CRYPTPROTECTMEMORY_CROSS_PROCESS: { native: "CRYPTPROTECTMEMORY_CROSS_PROCESS", pywin32: "win32cryptcon.CRYPTPROTECTMEMORY_CROSS_PROCESS", useWhen: "Allow another process to decrypt the shared protected bytes." },
        CRYPTPROTECTMEMORY_SAME_LOGON: { native: "CRYPTPROTECTMEMORY_SAME_LOGON", pywin32: "win32cryptcon.CRYPTPROTECTMEMORY_SAME_LOGON", useWhen: "Allow decryption across processes in the same user's logon session." },
      },
    },
    "net-user-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/lmaccess/nf-lmaccess-netuserenum",
      values: {
        USER_INFO_LEVEL_0: { native: "0", pywin32: "0", useWhen: "Return account names only." },
        USER_INFO_LEVEL_1: { native: "1", pywin32: "1", useWhen: "Return core account, privilege, and home-directory fields." },
        USER_INFO_LEVEL_2: { native: "2", pywin32: "2", useWhen: "Return the fuller administrative account record used by the course reference." },
      },
    },
    "net-local-group-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/lmaccess/nf-lmaccess-netlocalgroupenum",
      values: {
        LOCALGROUP_INFO_LEVEL_0: { native: "0", pywin32: "0", useWhen: "Return local-group names only." },
        LOCALGROUP_INFO_LEVEL_1: { native: "1", pywin32: "1", useWhen: "Return local-group names and comments." },
      },
    },
    "net-local-group-members-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/lmaccess/nf-lmaccess-netlocalgroupgetmembers",
      values: {
        MEMBER_INFO_LEVEL_0: { native: "0", pywin32: "0", useWhen: "Return member SIDs." },
        MEMBER_INFO_LEVEL_1: { native: "1", pywin32: "1", useWhen: "Return SIDs, SID usage, and resolved names." },
        MEMBER_INFO_LEVEL_2: { native: "2", pywin32: "2", useWhen: "Return SID usage and resolved domain-and-name strings." },
        MEMBER_INFO_LEVEL_3: { native: "3", pywin32: "3", useWhen: "Return resolved domain-and-name strings only." },
      },
    },
    "net-share-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/lmshare/nf-lmshare-netshareenum",
      values: {
        SHARE_INFO_LEVEL_0: { native: "0", pywin32: "0", useWhen: "Return share names only." },
        SHARE_INFO_LEVEL_1: { native: "1", pywin32: "1", useWhen: "Return share names, types, and remarks." },
        SHARE_INFO_LEVEL_2: { native: "2", pywin32: "2", useWhen: "Return share configuration including path and permissions." },
        SHARE_INFO_LEVEL_502: { native: "502", pywin32: "502", useWhen: "Return level-2 data plus the share security descriptor." },
        SHARE_INFO_LEVEL_503: { native: "503", pywin32: "503", useWhen: "Return level-502 data plus the server name for scoped shares." },
      },
    },
    "net-session-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/lmshare/nf-lmshare-netsessionenum",
      values: {
        SESSION_INFO_LEVEL_0: { native: "0", pywin32: "0", useWhen: "Return client computer names only." },
        SESSION_INFO_LEVEL_1: { native: "1", pywin32: "1", useWhen: "Return client, user, connection time, idle time, and flags." },
        SESSION_INFO_LEVEL_2: { native: "2", pywin32: "2", useWhen: "Return level-1 data plus the client transport name." },
        SESSION_INFO_LEVEL_10: { native: "10", pywin32: "10", useWhen: "Return client, user, active time, and idle time without privilege-only fields." },
        SESSION_INFO_LEVEL_502: { native: "502", pywin32: "502", useWhen: "Return the full session record including transport." },
      },
    },
    "net-file-info-level": {
      kind: "enum",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/lmshare/nf-lmshare-netfileenum",
      values: {
        FILE_INFO_LEVEL_2: { native: "2", pywin32: "2", useWhen: "Return identifiers for open server files." },
        FILE_INFO_LEVEL_3: { native: "3", pywin32: "3", useWhen: "Return identifiers plus permissions, locks, paths, and user names." },
      },
    },
    "network-connection-flags": {
      kind: "bitmask",
      source: "https://learn.microsoft.com/en-us/windows/win32/api/winnetwk/nf-winnetwk-wnetaddconnection2w",
      values: {
        NO_CONNECTION_FLAGS: { native: "0", pywin32: "0", useWhen: "Create a temporary connection without UI or profile persistence." },
        CONNECT_UPDATE_PROFILE: { native: "CONNECT_UPDATE_PROFILE", pywin32: "win32netcon.CONNECT_UPDATE_PROFILE", useWhen: "Persist or remove the connection in the user's profile." },
        CONNECT_TEMPORARY: { native: "CONNECT_TEMPORARY", pywin32: "win32netcon.CONNECT_TEMPORARY", useWhen: "Prevent the redirector from restoring the connection later." },
        CONNECT_INTERACTIVE: { native: "CONNECT_INTERACTIVE", pywin32: "win32netcon.CONNECT_INTERACTIVE", useWhen: "Permit the provider to interact with the user when necessary." },
        CONNECT_PROMPT: { native: "CONNECT_PROMPT", pywin32: "win32netcon.CONNECT_PROMPT", useWhen: "Prompt for credentials instead of using defaults; combine with interactive mode." },
      },
    },
  };
  const nativeBindings = {
    "OpenProcessToken.DesiredAccess": {
      choiceSet: "token-access",
      choices: ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"],
      example: { code: "TOKEN_QUERY | TOKEN_DUPLICATE", useWhen: "Query a token before duplicating it." },
    },
    "DuplicateToken.ImpersonationLevel": {
      choiceSet: "security-impersonation-level",
      choices: ["SecurityAnonymous", "SecurityIdentification", "SecurityImpersonation", "SecurityDelegation"],
    },
    "DuplicateTokenEx.dwDesiredAccess": { choiceSet: "token-access", choices: ["SAME_TOKEN_ACCESS", "TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"] },
    "DuplicateTokenEx.ImpersonationLevel": { choiceSet: "security-impersonation-level" },
    "DuplicateTokenEx.TokenType": { choiceSet: "token-type" },
    "OpenProcess.dwDesiredAccess": {
      choiceSet: "process-access",
      example: { code: "PROCESS_QUERY_INFORMATION | PROCESS_VM_OPERATION | PROCESS_VM_WRITE", useWhen: "Prepare a course lab process for a justified remote-memory write." },
    },
    "OpenThread.dwDesiredAccess": { choiceSet: "thread-access" },
    "VirtualAlloc.flAllocationType": { choiceSet: "memory-allocation-type", example: { code: "MEM_RESERVE | MEM_COMMIT", useWhen: "Reserve and commit one new region in a single call." } },
    "VirtualAllocEx.flAllocationType": { choiceSet: "memory-allocation-type", example: { code: "MEM_RESERVE | MEM_COMMIT", useWhen: "Reserve and commit one new target-process region." } },
    "VirtualAlloc.flProtect": { choiceSet: "memory-protection" },
    "VirtualAllocEx.flProtect": { choiceSet: "memory-protection" },
    "VirtualFree.dwFreeType": { choiceSet: "memory-free-type" },
    "VirtualFreeEx.dwFreeType": { choiceSet: "memory-free-type" },
    "VirtualProtect.flNewProtect": { choiceSet: "memory-protection" },
    "VirtualProtectEx.flNewProtect": { choiceSet: "memory-protection" },
    "CreateFileMappingW.flProtect": { choiceSet: "memory-protection", choices: ["PAGE_READONLY", "PAGE_READWRITE", "PAGE_EXECUTE_READ", "PAGE_EXECUTE_READWRITE"] },
    "CreateFileMappingA.flProtect": { choiceSet: "memory-protection", choices: ["PAGE_READONLY", "PAGE_READWRITE", "PAGE_EXECUTE_READ", "PAGE_EXECUTE_READWRITE"] },
    "CreateFileMappingW.hFile": { choiceSet: "file-mapping-backing" },
    "CreateFileMappingA.hFile": { choiceSet: "file-mapping-backing" },
    "MapViewOfFile.dwDesiredAccess": { choiceSet: "file-mapping-access" },
    "MapViewOfFileEx.dwDesiredAccess": { choiceSet: "file-mapping-access" },
    "OpenFileMappingW.dwDesiredAccess": { choiceSet: "file-mapping-access" },
    "OpenFileMappingA.dwDesiredAccess": { choiceSet: "file-mapping-access" },
    "WaitForSingleObject.dwMilliseconds": { choiceSet: "wait-timeout" },
    "WaitForMultipleObjects.dwMilliseconds": { choiceSet: "wait-timeout" },
    "CreateProcessW.dwCreationFlags": { choiceSet: "process-creation-flags" },
    "CreateProcessA.dwCreationFlags": { choiceSet: "process-creation-flags" },
    "CreateRemoteThread.dwCreationFlags": { choiceSet: "thread-creation-flags" },
    "CreateRemoteThreadEx.dwCreationFlags": { choiceSet: "thread-creation-flags" },
    "CreateNamedPipeW.dwOpenMode": { choiceSet: "named-pipe-open-mode" },
    "CreateNamedPipeA.dwOpenMode": { choiceSet: "named-pipe-open-mode" },
    "CreateNamedPipeW.dwPipeMode": { choiceSet: "named-pipe-mode" },
    "CreateNamedPipeA.dwPipeMode": { choiceSet: "named-pipe-mode" },
    "CreateNamedPipeW.nMaxInstances": { choiceSet: "named-pipe-instances" },
    "CreateNamedPipeA.nMaxInstances": { choiceSet: "named-pipe-instances" },
    "OpenSCManagerW.dwDesiredAccess": { choiceSet: "scm-access" },
    "OpenSCManagerA.dwDesiredAccess": { choiceSet: "scm-access" },
    "OpenServiceW.dwDesiredAccess": { choiceSet: "service-access" },
    "OpenServiceA.dwDesiredAccess": { choiceSet: "service-access" },
    "ControlService.dwControl": { choiceSet: "service-control" },
    "QueryServiceStatusEx.InfoLevel": { choiceSet: "service-status-info-level" },
    "RegOpenKeyExW.ulOptions": { choiceSet: "registry-open-options" },
    "RegOpenKeyExA.ulOptions": { choiceSet: "registry-open-options" },
    "RegOpenKeyExW.samDesired": { choiceSet: "registry-access", example: { code: "KEY_READ | KEY_WOW64_64KEY", useWhen: "Read explicitly from the 64-bit view of a redirected key." } },
    "RegOpenKeyExA.samDesired": { choiceSet: "registry-access", example: { code: "KEY_READ | KEY_WOW64_64KEY", useWhen: "Read explicitly from the 64-bit view of a redirected key." } },
    "GetNamedSecurityInfoW.ObjectType": { choiceSet: "securable-object-type" },
    "GetNamedSecurityInfoA.ObjectType": { choiceSet: "securable-object-type" },
    "GetNamedSecurityInfoW.SecurityInfo": { choiceSet: "security-information", example: { code: "OWNER_SECURITY_INFORMATION | DACL_SECURITY_INFORMATION", useWhen: "Read owner and discretionary access control together." } },
    "GetNamedSecurityInfoA.SecurityInfo": { choiceSet: "security-information", example: { code: "OWNER_SECURITY_INFORMATION | DACL_SECURITY_INFORMATION", useWhen: "Read owner and discretionary access control together." } },
    "SetWindowsHookExW.idHook": { choiceSet: "hook-id" },
    "SetWindowsHookExA.idHook": { choiceSet: "hook-id" },
    "LoadLibraryExW.dwFlags": { choiceSet: "module-loading-flags", example: { code: "LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR | LOAD_LIBRARY_SEARCH_DEFAULT_DIRS", useWhen: "Load by trusted full path with a constrained dependency search." } },
    "LoadLibraryExA.dwFlags": { choiceSet: "module-loading-flags", example: { code: "LOAD_LIBRARY_SEARCH_DLL_LOAD_DIR | LOAD_LIBRARY_SEARCH_DEFAULT_DIRS", useWhen: "Load by trusted full path with a constrained dependency search." } },
    "SetDefaultDllDirectories.DirectoryFlags": { choiceSet: "module-loading-flags", choices: ["LOAD_LIBRARY_SEARCH_APPLICATION_DIR", "LOAD_LIBRARY_SEARCH_SYSTEM32", "LOAD_LIBRARY_SEARCH_USER_DIRS", "LOAD_LIBRARY_SEARCH_DEFAULT_DIRS"] },
    "CreateEventExW.dwFlags": { choiceSet: "event-creation-flags" },
    "CreateEventExA.dwFlags": { choiceSet: "event-creation-flags" },
    "CreateEventExW.dwDesiredAccess": { choiceSet: "event-access" },
    "CreateEventExA.dwDesiredAccess": { choiceSet: "event-access" },
    "CreateMutexExW.dwFlags": { choiceSet: "mutex-creation-flags" },
    "CreateMutexExA.dwFlags": { choiceSet: "mutex-creation-flags" },
    "CreateMutexExW.dwDesiredAccess": { choiceSet: "mutex-access" },
    "CreateMutexExA.dwDesiredAccess": { choiceSet: "mutex-access" },
    "EnumProcessModulesEx.dwFilterFlag": { choiceSet: "module-filter" },
    "MessageBoxW.uType": { choiceSet: "message-box-options" },
    "MessageBoxA.uType": { choiceSet: "message-box-options" },
    "HeapAlloc.dwFlags": { choiceSet: "heap-allocation-flags" },
    "HeapFree.dwFlags": { choiceSet: "heap-operation-flags" },
    "HeapSize.dwFlags": { choiceSet: "heap-operation-flags" },
    "MapGenericMask.AccessMask": { choiceSet: "generic-access" },
    "WinVerifyTrust.pgActionID": { choiceSet: "trust-action" },
  };
  const pywin32Bindings = {
    "win32security::OpenProcessToken#0.desiredAccess": {
      choiceSet: "token-access",
      choices: ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"],
      example: { code: "win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE", useWhen: "Query a token before duplicating it." },
    },
    "win32security::DuplicateTokenEx#0.ImpersonationLevel": {
      choiceSet: "security-impersonation-level",
      choices: ["SecurityAnonymous", "SecurityIdentification", "SecurityImpersonation", "SecurityDelegation"],
    },
    "win32security::DuplicateTokenEx#0.TokenType": {
      choiceSet: "token-type",
      choices: ["TokenPrimary", "TokenImpersonation"],
    },
    "win32security::DuplicateTokenEx#0.DesiredAccess": {
      choiceSet: "token-access",
      choices: ["SAME_TOKEN_ACCESS", "TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"],
      example: { code: "win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE", useWhen: "Query a token before duplicating it." },
    },
    "win32api::OpenProcess#0.reqdAccess": { choiceSet: "process-access" },
    "win32process::CreateProcess#0.dwCreationFlags": { choiceSet: "process-creation-flags" },
    "win32process::CreateProcessAsUser#0.dwCreationFlags": { choiceSet: "process-creation-flags" },
    "win32process::EnumProcessModulesEx#0.FilterFlag": { choiceSet: "module-filter" },
    "win32process::VirtualAllocEx#0.allocationType": { choiceSet: "memory-allocation-type", example: { code: "win32con.MEM_RESERVE | win32con.MEM_COMMIT", useWhen: "Reserve and commit one new target-process region." } },
    "win32process::VirtualAllocEx#0.flProtect": { choiceSet: "memory-protection" },
    "win32process::VirtualFreeEx#0.freeType": { choiceSet: "memory-free-type" },
    "win32process::CreateRemoteThread#0.flags": { choiceSet: "thread-creation-flags" },
    "win32event::OpenEvent#0.desiredAccess": { choiceSet: "event-access" },
    "win32event::OpenMutex#0.desiredAccess": { choiceSet: "mutex-access" },
    "win32event::WaitForSingleObject#0.milliseconds": { choiceSet: "wait-timeout" },
    "win32event::WaitForMultipleObjects#0.milliseconds": { choiceSet: "wait-timeout" },
    "win32event::WaitForInputIdle#0.milliseconds": { choiceSet: "wait-timeout" },
    "win32file::CreateFile#0.desiredAccess": { choiceSet: "file-access", example: { code: "win32con.GENERIC_READ | win32con.GENERIC_WRITE", useWhen: "Open a file for both reads and writes." } },
    "win32file::CreateFile#0.shareMode": { choiceSet: "file-share-mode", example: { code: "win32con.FILE_SHARE_READ | win32con.FILE_SHARE_DELETE", useWhen: "Permit readers and rename or deletion while open." } },
    "win32file::CreateFile#0.CreationDisposition": { choiceSet: "file-creation-disposition" },
    "win32file::CreateFile#0.flagsAndAttributes": { choiceSet: "file-flags" },
    "win32pipe::CreateNamedPipe#0.openMode": { choiceSet: "named-pipe-open-mode" },
    "win32pipe::CreateNamedPipe#0.pipeMode": { choiceSet: "named-pipe-mode" },
    "win32pipe::CreateNamedPipe#0.nMaxInstances": { choiceSet: "named-pipe-instances" },
    "win32pipe::SetNamedPipeHandleState#0.Mode": { choiceSet: "named-pipe-mode", choices: ["PIPE_READMODE_BYTE", "PIPE_READMODE_MESSAGE", "PIPE_WAIT", "PIPE_NOWAIT"] },
    "win32pipe::WaitNamedPipe#0.timeout": { choiceSet: "named-pipe-wait-timeout" },
    "win32pipe::CallNamedPipe#0.timeOut": { choiceSet: "named-pipe-wait-timeout" },
    "win32security::OpenThreadToken#0.desiredAccess": { choiceSet: "token-access", choices: ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"] },
    "win32security::GetTokenInformation#0.TokenInformationClass": { choiceSet: "token-information-class" },
    "win32security::GetNamedSecurityInfo#0.ObjectType": { choiceSet: "securable-object-type" },
    "win32security::GetNamedSecurityInfo#0.SecurityInfo": { choiceSet: "security-information" },
    "win32security::SetNamedSecurityInfo#0.ObjectType": { choiceSet: "securable-object-type" },
    "win32security::SetNamedSecurityInfo#0.SecurityInfo": { choiceSet: "security-information" },
    "win32security::GetSecurityInfo#0.ObjectType": { choiceSet: "securable-object-type" },
    "win32security::GetSecurityInfo#0.SecurityInfo": { choiceSet: "security-information" },
    "win32security::SetSecurityInfo#0.ObjectType": { choiceSet: "securable-object-type" },
    "win32security::SetSecurityInfo#0.SecurityInfo": { choiceSet: "security-information" },
    "win32security::GetFileSecurity#0.info": { choiceSet: "security-information" },
    "win32security::ConvertSecurityDescriptorToStringSecurityDescriptor#0.SecurityInformation": { choiceSet: "security-information" },
    "win32service::OpenSCManager#0.desiredAccess": { choiceSet: "scm-access" },
    "win32service::OpenService#0.desiredAccess": { choiceSet: "service-access" },
    "win32service::ControlService#0.code": { choiceSet: "service-control" },
    "win32service::CreateService#0.desiredAccess": { choiceSet: "service-access" },
    "win32service::QueryServiceObjectSecurity#0.SecurityInformation": { choiceSet: "security-information" },
    "win32service::SetServiceObjectSecurity#0.SecurityInformation": { choiceSet: "security-information" },
    "winreg::OpenKey#0.access": { choiceSet: "registry-access" },
    "winreg::CreateKeyEx#0.access": { choiceSet: "registry-access" },
    "winreg::SetValueEx#0.type": { choiceSet: "registry-value-type" },
    "winreg (standard library companion)::OpenKey#0.access": { choiceSet: "registry-access" },
    "winreg (standard library companion)::CreateKeyEx#0.access": { choiceSet: "registry-access" },
    "winreg (standard library companion)::SetValueEx#0.type": { choiceSet: "registry-value-type" },
    "winreg (standard library companion)::SetValueEx#1.type": { choiceSet: "registry-value-type" },
    "winreg (standard library companion)::SetValueEx#2.type": { choiceSet: "registry-value-type" },
    "winreg (standard library companion)::SetValueEx#3.type": { choiceSet: "registry-value-type" },
    "winreg (standard library companion)::SetValueEx#4.type": { choiceSet: "registry-value-type" },
    "win32api::DuplicateHandle#0.options": { choiceSet: "duplicate-handle-options" },
    "win32api::SetHandleInformation#0.Mask": { choiceSet: "handle-information-flags", choices: ["HANDLE_FLAG_INHERIT", "HANDLE_FLAG_PROTECT_FROM_CLOSE"] },
    "win32api::SetHandleInformation#0.Flags": { choiceSet: "handle-information-flags" },
    "win32api::GetStdHandle#0.handle": { choiceSet: "standard-handle" },
    "win32api::FormatMessage#0.flags": {
      choiceSet: "format-message-flags",
      example: { code: "win32con.FORMAT_MESSAGE_FROM_SYSTEM | win32con.FORMAT_MESSAGE_IGNORE_INSERTS", useWhen: "Format an arbitrary system error safely without supplying insert values." },
    },
    "win32api::FormatMessage#0.languageID": { choiceSet: "format-message-language" },
    "win32api::ShellExecute#0.bShow": { choiceSet: "show-window-command" },
    "win32process::SetPriorityClass#0.dwPriorityClass": { choiceSet: "process-priority-class" },
    "win32process::SetThreadPriority#0.nPriority": { choiceSet: "thread-priority" },
    "win32event::OpenSemaphore#0.desiredAccess": { choiceSet: "semaphore-access" },
    "win32file::GetFinalPathNameByHandle#0.Flags": {
      choiceSet: "final-path-format",
      example: { code: "win32con.FILE_NAME_OPENED | win32con.VOLUME_NAME_NT", useWhen: "Preserve the opened path form and return it in the NT device namespace." },
    },
    "win32file::SetFilePointer#0.moveMethod": { choiceSet: "file-pointer-origin" },
    "win32file::SetFilePointer#1.moveMethod": { choiceSet: "file-pointer-origin" },
    "win32file::SetFileAttributes#0.newAttributes": { choiceSet: "file-attributes" },
    "win32file::FindFirstChangeNotification#0.notifyFilter": { choiceSet: "file-notify-filter" },
    "win32file::ReadDirectoryChangesW#0.dwNotifyFilter": { choiceSet: "file-notify-filter" },
    "win32security::CreateWellKnownSid#0.WellKnownSidType": { choiceSet: "well-known-sid-type" },
    "win32security::CreateRestrictedToken#0.Flags": { choiceSet: "restricted-token-flags" },
    "win32security::ConvertSecurityDescriptorToStringSecurityDescriptor#0.RequestedStringSDRevision": { choiceSet: "security-descriptor-revision" },
    "win32security::LogonUser#0.LogonType": { choiceSet: "logon-type" },
    "win32security::LogonUser#0.LogonProvider": { choiceSet: "logon-provider" },
    "win32security::MapGenericMask#0.accessMask": { choiceSet: "generic-access" },
    "win32service::EnumServicesStatusEx#0.ServiceType": { choiceSet: "service-enumeration-type" },
    "win32service::EnumServicesStatusEx#0.ServiceState": { choiceSet: "service-state-filter" },
    "win32service::EnumServicesStatusEx#0.InfoLevel": { choiceSet: "service-enumeration-info-level" },
    "win32service::QueryServiceConfig2#0.InfoLevel": { choiceSet: "service-config-info-level" },
    "win32service::EnumDependentServices#0.ServiceState": { choiceSet: "service-state-filter" },
    "win32service::CreateService#0.serviceType": { choiceSet: "service-type", choices: ["SERVICE_KERNEL_DRIVER", "SERVICE_FILE_SYSTEM_DRIVER", "SERVICE_WIN32_OWN_PROCESS", "SERVICE_WIN32_SHARE_PROCESS"] },
    "win32service::CreateService#0.startType": { choiceSet: "service-start-type", choices: ["SERVICE_BOOT_START", "SERVICE_SYSTEM_START", "SERVICE_AUTO_START", "SERVICE_DEMAND_START", "SERVICE_DISABLED"] },
    "win32service::CreateService#0.errorControl": { choiceSet: "service-error-control", choices: ["SERVICE_ERROR_IGNORE", "SERVICE_ERROR_NORMAL", "SERVICE_ERROR_SEVERE", "SERVICE_ERROR_CRITICAL"] },
    "win32service::ChangeServiceConfig#0.serviceType": { choiceSet: "service-type" },
    "win32service::ChangeServiceConfig#0.startType": { choiceSet: "service-start-type" },
    "win32service::ChangeServiceConfig#0.errorControl": { choiceSet: "service-error-control" },
    "win32evtlog::ReadEventLog#0.Flags": {
      choiceSet: "event-log-read-flags",
      example: { code: "win32evtlog.EVENTLOG_SEQUENTIAL_READ | win32evtlog.EVENTLOG_FORWARDS_READ", useWhen: "Read successive classic log records from oldest toward newest." },
    },
    "win32evtlog::EvtRender#0.Flags": { choiceSet: "evt-render-flags" },
    "win32evtlog::EvtSubscribe#0.Flags": { choiceSet: "evt-subscribe-flags" },
    "win32evtlog::EvtQuery#0.Flags": { choiceSet: "evt-query-flags" },
    "win32evtlog::EvtNext#0.Timeout": { choiceSet: "evt-timeout" },
    "win32evtlog::EvtNext#0.Flags": { choiceSet: "reserved-zero" },
    "win32evtlog::EvtExportLog#0.Flags": { choiceSet: "evt-export-flags" },
    "win32evtlog::EvtOpenSession#0.LoginClass": { choiceSet: "evt-login-class" },
    "win32evtlog::EvtOpenSession#0.Timeout": { choiceSet: "reserved-zero" },
    "win32evtlog::EvtOpenSession#0.Flags": { choiceSet: "reserved-zero" },
    "win32job::OpenJobObject#0.desiredAccess": { choiceSet: "job-access" },
    "win32job::SetInformationJobObject#0.JobObjectInfoClass": { choiceSet: "job-information-class", choices: ["JobObjectBasicLimitInformation", "JobObjectBasicUIRestrictions", "JobObjectExtendedLimitInformation"] },
    "win32job::QueryInformationJobObject#0.JobObjectInfoClass": { choiceSet: "job-information-class" },
    "win32cred::CredRead#0.Type": { choiceSet: "credential-type" },
    "win32cred::CredRead#0.Flags": { choiceSet: "reserved-zero" },
    "win32cred::CredWrite#0.Flags": { choiceSet: "credential-write-flags" },
    "win32cred::CredDelete#0.Type": { choiceSet: "credential-type" },
    "win32cred::CredDelete#0.Flags": { choiceSet: "reserved-zero" },
    "win32cred::CredEnumerate#0.Flags": { choiceSet: "credential-enumerate-flags" },
    "win32cred::CredReadDomainCredentials#0.Flags": { choiceSet: "credential-domain-read-flags" },
    "win32crypt::CryptProtectData#0.Flags": { choiceSet: "dpapi-flags", choices: ["DEFAULT_DPAPI_SCOPE", "CRYPTPROTECT_UI_FORBIDDEN", "CRYPTPROTECT_LOCAL_MACHINE", "CRYPTPROTECT_AUDIT"] },
    "win32crypt::CryptProtectData#0.Reserved": { choiceSet: "reserved-none" },
    "win32crypt::CryptUnprotectData#0.Flags": { choiceSet: "dpapi-flags", choices: ["DEFAULT_DPAPI_SCOPE", "CRYPTPROTECT_UI_FORBIDDEN", "CRYPTPROTECT_VERIFY_PROTECTION"] },
    "win32crypt::CryptUnprotectData#0.Reserved": { choiceSet: "reserved-none" },
    "win32crypt::CryptQueryObject#0.ObjectType": { choiceSet: "cert-query-object-type" },
    "win32crypt::CryptQueryObject#0.ExpectedContentTypeFlags": { choiceSet: "cert-query-content-type" },
    "win32crypt::CryptQueryObject#0.ExpectedFormatTypeFlags": { choiceSet: "cert-query-format-type" },
    "win32crypt::CryptQueryObject#0.Flags": { choiceSet: "reserved-zero" },
    "win32crypt::CryptQueryObject#1.ObjectType": { choiceSet: "cert-query-object-type" },
    "win32crypt::CryptQueryObject#1.ExpectedContentTypeFlags": { choiceSet: "cert-query-content-type" },
    "win32crypt::CryptQueryObject#1.ExpectedFormatTypeFlags": { choiceSet: "cert-query-format-type" },
    "win32crypt::CryptQueryObject#1.Flags": { choiceSet: "reserved-zero" },
    "win32crypt::CryptProtectMemory#0.dwFlags": { choiceSet: "protect-memory-scope" },
    "win32crypt::CryptUnprotectMemory#0.dwFlags": { choiceSet: "protect-memory-scope" },
    "win32net / win32wnet::NetUserEnum#0.level": { choiceSet: "net-user-info-level" },
    "win32net / win32wnet::NetLocalGroupEnum#0.level": { choiceSet: "net-local-group-info-level" },
    "win32net / win32wnet::NetLocalGroupGetMembers#0.level": { choiceSet: "net-local-group-members-info-level" },
    "win32net / win32wnet::NetShareEnum#0.level": { choiceSet: "net-share-info-level" },
    "win32net / win32wnet::NetSessionEnum#0.level": { choiceSet: "net-session-info-level" },
    "win32net / win32wnet::NetFileEnum#0.level": { choiceSet: "net-file-info-level" },
    "win32net / win32wnet::WNetAddConnection2#0.Flags": { choiceSet: "network-connection-flags" },
    "win32net / win32wnet::WNetCancelConnection2#0.flags": { choiceSet: "network-connection-flags", choices: ["NO_CONNECTION_FLAGS", "CONNECT_UPDATE_PROFILE"] },
    "winreg::OpenKey#0.reserved": { choiceSet: "reserved-zero" },
    "winreg::CreateKeyEx#0.reserved": { choiceSet: "reserved-zero" },
    "winreg::SetValueEx#0.reserved": { choiceSet: "reserved-zero" },
    "winreg (standard library companion)::OpenKey#0.reserved": { choiceSet: "reserved-zero" },
    "winreg (standard library companion)::CreateKeyEx#0.reserved": { choiceSet: "reserved-zero" },
    "winreg (standard library companion)::SetValueEx#0.reserved": { choiceSet: "reserved-zero" },
    "winreg (standard library companion)::SetValueEx#1.reserved": { choiceSet: "reserved-zero" },
    "winreg (standard library companion)::SetValueEx#2.reserved": { choiceSet: "reserved-zero" },
    "winreg (standard library companion)::SetValueEx#3.reserved": { choiceSet: "reserved-zero" },
    "winreg (standard library companion)::SetValueEx#4.reserved": { choiceSet: "reserved-zero" },
    "ctypes / ctypes.wintypes::ctypes.WinDLL#0.winmode": { choiceSet: "module-loading-flags" },
    "ctypes / ctypes.wintypes::CreateProcessW#0.dwCreationFlags": { choiceSet: "process-creation-flags" },
    "ctypes / ctypes.wintypes::OpenServiceW#1.dwDesiredAccess": { choiceSet: "service-access" },
    "ctypes / ctypes.wintypes::ControlService#1.dwControl": { choiceSet: "service-control" },
    "ctypes / ctypes.wintypes::VirtualAlloc#0.flAllocationType": { choiceSet: "memory-allocation-type" },
    "ctypes / ctypes.wintypes::VirtualAlloc#0.flProtect": { choiceSet: "memory-protection" },
    "ctypes / ctypes.wintypes::VirtualFree#0.dwFreeType": { choiceSet: "memory-free-type" },
    "ctypes / ctypes.wintypes::CreateFileMappingW#0.hFile": { choiceSet: "file-mapping-backing" },
    "ctypes / ctypes.wintypes::CreateFileMappingW#0.flProtect": { choiceSet: "memory-protection", choices: ["PAGE_READONLY", "PAGE_READWRITE", "PAGE_EXECUTE_READ", "PAGE_EXECUTE_READWRITE"] },
    "ctypes / ctypes.wintypes::OpenFileMappingW#0.dwDesiredAccess": { choiceSet: "file-mapping-access" },
    "ctypes / ctypes.wintypes::MapViewOfFile#0.dwDesiredAccess": { choiceSet: "file-mapping-access" },
    "ctypes / ctypes.wintypes::HeapAlloc#0.dwFlags": { choiceSet: "heap-allocation-flags" },
    "ctypes / ctypes.wintypes::HeapFree#0.dwFlags": { choiceSet: "heap-operation-flags" },
    "ctypes / ctypes.wintypes::LoadLibraryExW#0.dwFlags": { choiceSet: "module-loading-flags" },
    "ctypes / ctypes.wintypes::SetDefaultDllDirectories#0.DirectoryFlags": { choiceSet: "module-loading-flags", choices: ["LOAD_LIBRARY_SEARCH_APPLICATION_DIR", "LOAD_LIBRARY_SEARCH_SYSTEM32", "LOAD_LIBRARY_SEARCH_USER_DIRS", "LOAD_LIBRARY_SEARCH_DEFAULT_DIRS"] },
    "ctypes / ctypes.wintypes::OpenSCManagerW#0.dwDesiredAccess": { choiceSet: "scm-access" },
    "ctypes / ctypes.wintypes::OpenServiceW#0.dwDesiredAccess": { choiceSet: "service-access" },
    "ctypes / ctypes.wintypes::ControlService#0.dwControl": { choiceSet: "service-control" },
    "ctypes / ctypes.wintypes::QueryServiceStatusEx#0.InfoLevel": { choiceSet: "service-status-info-level" },
    "ctypes / ctypes.wintypes::IsWow64Process2#0.pProcessMachine": { choiceSet: "machine-type" },
    "ctypes / ctypes.wintypes::IsWow64Process2#0.pNativeMachine": { choiceSet: "machine-type", choices: ["IMAGE_FILE_MACHINE_I386", "IMAGE_FILE_MACHINE_AMD64", "IMAGE_FILE_MACHINE_ARM64", "IMAGE_FILE_MACHINE_ARM64EC"] },
    "ctypes / ctypes.wintypes::RegOpenKeyExW#0.ulOptions": { choiceSet: "registry-open-options" },
    "ctypes / ctypes.wintypes::RegOpenKeyExW#0.samDesired": { choiceSet: "registry-access" },
    "ctypes / ctypes.wintypes::SetWindowsHookExW#0.idHook": { choiceSet: "hook-id" },
    "ctypes / ctypes.wintypes::VirtualAllocEx#0.flAllocationType": { choiceSet: "memory-allocation-type" },
    "ctypes / ctypes.wintypes::VirtualAllocEx#0.flProtect": { choiceSet: "memory-protection" },
    "ctypes / ctypes.wintypes::VirtualFreeEx#0.dwFreeType": { choiceSet: "memory-free-type" },
    "ctypes / ctypes.wintypes::CreateRemoteThread#0.dwCreationFlags": { choiceSet: "thread-creation-flags" },
  };

  const plainParameterReviews = [
    // Native candidates that resemble choice parameters but are contextual,
    // caller-defined, boolean, or output-only rather than reusable constants.
    "CreateNamedPipeW.nDefaultTimeOut",
    "CreateNamedPipeA.nDefaultTimeOut",
    "CallNextHookEx.nCode",
    "CreateEventW.bInitialState",
    "CreateEventA.bInitialState",
    "CreateProcessW.lpStartupInfo",
    "CreateProcessA.lpStartupInfo",
    "AccessCheck.DesiredAccess",
    "AccessCheck.GrantedAccess",
    "AccessCheck.AccessStatus",
    "ControlService.lpServiceStatus",
    "QueryServiceStatus.lpServiceStatus",

    // Python/reference candidates deliberately kept plain. These include
    // object-specific rights, device contracts, dynamic masks and structures,
    // and values whose meaning comes from another selected parameter.
    "win32api::DuplicateHandle#0.desiredAccess",
    "win32api::FormatMessage#0.source",
    "win32api::FormatMessage#0.messageId",
    "win32api::FormatMessage#0.inserts",
    "win32api::ShellExecute#0.op",
    "win32process::CreateProcess#0.bInheritHandles",
    "win32process::CreateProcess#0.startupinfo",
    "win32process::CreateProcessAsUser#0.bInheritHandles",
    "win32process::CreateProcessAsUser#0.startupinfo",
    "win32process::SetProcessAffinityMask#0.mask",
    "win32process::TerminateProcess#0.exitCode",
    "win32event::CreateEvent#0.bManualReset",
    "win32event::CreateEvent#0.bInitialState",
    "win32event::SetWaitableTimer#0.resume_state",
    "win32file::DeviceIoControl#0.IoControlCode",
    "win32pipe::CreateNamedPipe#0.nDefaultTimeOut",
    "win32pipe::SetNamedPipeHandleState#0.CollectDataTimeout",
    "win32security::AdjustTokenPrivileges#0.NewState",
    "win32security::DuplicateTokenEx#0.TokenAttributes",
    "win32service::EnumServicesStatusEx#0.GroupName",
    "win32job::SetInformationJobObject#0.JobObjectInfo",
    "win32cred::CredEnumerate#0.Filter",
    "win32cred::CredReadDomainCredentials#0.TargetInfo",
    "win32crypt::CryptProtectData#0.OptionalEntropy",
    "win32crypt::CryptProtectData#0.PromptStruct",
    "win32crypt::CryptUnprotectData#0.OptionalEntropy",
    "win32crypt::CryptUnprotectData#0.PromptStruct",
    "win32crypt::CertOpenSystemStore#0.SubsystemProtocol",
    "win32net / win32wnet::WNetCancelConnection2#0.force",
    "win32evtlog::EvtOpenSession#0.Login",
    "win32com.client / pythoncom::GetObject#0.Class",
    "ctypes / ctypes.wintypes::ctypes.WinDLL#0.mode",
    "ctypes / ctypes.wintypes::AccessCheck#0.DesiredAccess",
    "ctypes / ctypes.wintypes::WinVerifyTrust#0.pgActionID",
  ];

  const parameterReview = Object.fromEntries([
    ...plainParameterReviews.map((key) => [key, "plain"]),
    ...Object.entries(nativeBindings).map(([key, binding]) => [key, binding.choiceSet]),
    ...Object.entries(pywin32Bindings).map(([key, binding]) => [key, binding.choiceSet]),
  ]);

  function singletonId(name) {
    return familyId(name);
  }

  function buildFamilies(contracts) {
    const records = Array.isArray(contracts) ? contracts : [];
    const byName = new Map(records.filter((contract) => contract && typeof contract.name === "string").map((contract) => [contract.name, contract]));
    const consumed = new Set();
    const families = [];

    for (const definition of familyDefinitions) {
      const variants = [];
      for (const name of definition.variantNames) {
        const contract = byName.get(name);
        if (!contract || consumed.has(name)) continue;
        consumed.add(name);
        variants.push(contract);
      }
      if (!variants.length) continue;
      families.push({
        id: definition.id,
        name: definition.name,
        summary: definition.summary,
        recommendedVariant: definition.recommendedVariant,
        aliases: definition.aliases,
        variants,
      });
    }

    for (const contract of records) {
      if (!contract || typeof contract.name !== "string" || consumed.has(contract.name)) continue;
      consumed.add(contract.name);
      families.push({
        id: singletonId(contract.name),
        name: contract.name,
        summary: contract.summary || "Windows API contract.",
        recommendedVariant: contract.name,
        aliases: [],
        variants: [contract],
      });
    }
    return families;
  }

  function resolveSelection(family, query = "") {
    const variants = Array.isArray(family?.variants) ? family.variants : [];
    const normalized = String(query || "").toLocaleLowerCase();
    const variant = variants.find((item) => String(item?.name || "").toLocaleLowerCase() === normalized);
    if (variant) return variant.name;
    const alias = (Array.isArray(family?.aliases) ? family.aliases : [])
      .find((item) => String(item?.name || "").toLocaleLowerCase() === normalized);
    if (alias) return alias.target;
    return family?.recommendedVariant || variants[0]?.name || "";
  }

  function resolveParameterChoices(bindingKey, surface) {
    const bindings = surface === "native" ? nativeBindings : surface === "pywin32" ? pywin32Bindings : null;
    const binding = bindings?.[bindingKey];
    const choiceSet = binding && choiceSets[binding.choiceSet];
    if (!choiceSet) return null;
    const allowedNames = new Set(Array.isArray(binding.choices) ? binding.choices : Object.keys(choiceSet.values || {}));
    const names = Object.keys(choiceSet.values || {}).filter((name) => allowedNames.has(name));
    const example = binding.example && typeof binding.example.code === "string" && binding.example.code.trim()
      ? { code: binding.example.code, useWhen: binding.example.useWhen || "" }
      : null;
    return {
      id: binding.choiceSet,
      kind: choiceSet.kind,
      source: choiceSet.source,
      values: names.filter((name) => choiceSet.values?.[name]).map((name) => ({
        name,
        code: choiceSet.values[name][surface === "pywin32" ? "pywin32" : "native"],
        useWhen: choiceSet.values[name].useWhen,
      })),
      example,
    };
  }

  function words(value) {
    return typeof value === "string" ? value.trim().split(/\s+/).filter(Boolean) : [];
  }

  function validateGuide(guide) {
    const errors = [];
    const data = guide && typeof guide === "object" ? guide : {};
    const families = Array.isArray(data.families) ? data.families : [];
    const guideChoiceSets = data.choiceSets && typeof data.choiceSets === "object" ? data.choiceSets : choiceSets;
    const ids = new Set();
    const variants = new Map();

    for (const family of families) {
      const id = family?.id;
      if (typeof id !== "string" || !id) {
        errors.push("family missing id");
      } else if (ids.has(id)) {
        errors.push(`duplicate family id: ${id}`);
      } else {
        ids.add(id);
      }
      const familyVariants = Array.isArray(family?.variants) ? family.variants : [];
      if (!familyVariants.length) errors.push(`family has no variants: ${id || "unknown"}`);
      const names = new Set();
      for (const variant of familyVariants) {
        const name = variant?.name;
        if (typeof name !== "string" || !name) {
          errors.push(`variant missing name: ${id || "unknown"}`);
          continue;
        }
        if (names.has(name) || variants.has(name)) errors.push(`duplicate variant: ${name}`);
        names.add(name);
        variants.set(name, (variants.get(name) || 0) + 1);
        if (!(Array.isArray(variant.sources) && variant.sources.some((source) => typeof source === "string" && source.startsWith("https://learn.microsoft.com/")))) {
          errors.push(`variant missing Microsoft Learn source: ${name}`);
        }
        if (typeof variant.useWhen !== "string") {
          errors.push(`useWhen must be a string: ${name}`);
        } else if (!variant.useWhen.trim()) {
          errors.push(`variant missing useWhen: ${name}`);
        } else if (words(variant.useWhen).length > 24) {
          errors.push(`useWhen exceeds 24 words: ${name}`);
        }
        if (!Array.isArray(variant.keyBehaviors)) {
          errors.push(`keyBehaviors must be an array: ${name}`);
        } else {
          if (variant.keyBehaviors.length > 5) errors.push(`too many key behaviors: ${name}`);
          for (const behavior of variant.keyBehaviors) {
            if (typeof behavior !== "string") {
              errors.push(`key behavior must be a string: ${name}`);
            } else if (words(behavior).length > 30) {
              errors.push(`key behavior exceeds 30 words: ${name}`);
            }
          }
        }
        for (const parameter of Array.isArray(variant.parameters) ? variant.parameters : []) {
          if (parameter?.choiceSet && !guideChoiceSets[parameter.choiceSet]) errors.push(`unknown choice set: ${parameter.choiceSet}`);
          if (parameter?.choiceSet && guideChoiceSets[parameter.choiceSet]) {
            for (const choice of Array.isArray(parameter.choices) ? parameter.choices : []) {
              if (!guideChoiceSets[parameter.choiceSet].values?.[choice]) errors.push(`unknown choice value: ${parameter.choiceSet}/${choice}`);
            }
          }
          const examples = Array.isArray(parameter?.combinations) ? parameter.combinations : Array.isArray(parameter?.combinationExamples) ? parameter.combinationExamples : [];
          if (examples.length > 1) errors.push(`too many combination examples: ${name}/${parameter?.name || "unknown"}`);
        }
      }
      if (!familyVariants.some((variant) => variant?.name === family?.recommendedVariant)) {
        errors.push(`missing recommended variant: ${id || "unknown"}/${family?.recommendedVariant || "unknown"}`);
      }
      const aliases = Array.isArray(family?.aliases) ? family.aliases : [];
      const aliasNames = new Set();
      for (const alias of aliases) {
        if (aliasNames.has(alias?.name)) errors.push(`duplicate alias: ${id || "unknown"}/${alias?.name || "unknown"}`);
        aliasNames.add(alias?.name);
        if (!familyVariants.some((variant) => variant?.name === alias?.target)) {
          errors.push(`alias target missing: ${id || "unknown"}/${alias?.name || "unknown"} -> ${alias?.target || "unknown"}`);
        }
      }
    }

    const legacy = Array.isArray(data.legacyApiNames) ? data.legacyApiNames : legacyApiNames;
    const legacyCounts = new Map();
    for (const name of legacy) {
      legacyCounts.set(name, (legacyCounts.get(name) || 0) + 1);
      const occurrenceCount = variants.get(name) || 0;
      if (occurrenceCount === 0) errors.push(`missing legacy contract: ${name}`);
      if (occurrenceCount > 1) errors.push(`duplicate legacy contract: ${name}`);
    }
    for (const [name, count] of legacyCounts) {
      if (count > 1) errors.push(`duplicate legacy contract: ${name}`);
    }
    return errors;
  }

  window.ILOVEOS_WINDOWS_API_FAMILY_DATA = {
    legacyApiNames,
    familyDefinitions,
    familyReview,
    parameterReview,
    choiceSets,
    nativeBindings,
    pywin32Bindings,
    buildFamilies,
    resolveSelection,
    resolveParameterChoices,
    validateGuide,
  };
})();
