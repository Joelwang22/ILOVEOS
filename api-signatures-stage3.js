Object.assign(window.ILOVEOS_API_SIGNATURES, {
  "ctypes / ctypes.wintypes::GetSystemInfo": {
    kind: "function",
    signatures: [{ name: "GetSystemInfo", parameters: [{ name: "lpSystemInfo", type: "ctypes.POINTER(SYSTEM_INFO)", optional: false, description: "Caller-owned structure that receives page size, allocation granularity, address limits, and processor information." }], returns: "None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/sysinfoapi/nf-sysinfoapi-getsysteminfo"]
  },
  "ctypes / ctypes.wintypes::QueryWorkingSetEx": {
    kind: "function",
    signatures: [{ name: "QueryWorkingSetEx", parameters: [
      { name: "hProcess", type: "wintypes.HANDLE", optional: false, description: "Process handle with query access." },
      { name: "pv", type: "ctypes.POINTER(PSAPI_WORKING_SET_EX_INFORMATION)", optional: false, description: "Input address entries that receive working-set attributes." },
      { name: "cb", type: "wintypes.DWORD", optional: false, description: "Total byte size of the information array." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/psapi/nf-psapi-queryworkingsetex"]
  },
  "ctypes / ctypes.wintypes::GlobalMemoryStatusEx": {
    kind: "function",
    signatures: [{ name: "GlobalMemoryStatusEx", parameters: [{ name: "lpBuffer", type: "ctypes.POINTER(MEMORYSTATUSEX)", optional: false, description: "Structure whose dwLength field is initialized before the call and which receives memory totals." }], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/sysinfoapi/nf-sysinfoapi-globalmemorystatusex"]
  },
  "ctypes / ctypes.wintypes::VirtualAlloc": {
    kind: "function",
    signatures: [{ name: "VirtualAlloc", parameters: [
      { name: "lpAddress", type: "wintypes.LPVOID | None", optional: false, description: "Requested base, or null to let Windows choose an aligned address." },
      { name: "dwSize", type: "ctypes.c_size_t", optional: false, description: "Number of bytes to reserve or commit, rounded according to the allocation contract." },
      { name: "flAllocationType", type: "wintypes.DWORD", optional: false, description: "MEM_RESERVE, MEM_COMMIT, or another documented allocation flag combination." },
      { name: "flProtect", type: "wintypes.DWORD", optional: false, description: "Initial page protection for committed pages." }
    ], returns: "wintypes.LPVOID | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc"]
  },
  "ctypes / ctypes.wintypes::VirtualFree": {
    kind: "function",
    signatures: [{ name: "VirtualFree", parameters: [
      { name: "lpAddress", type: "wintypes.LPVOID", optional: false, description: "Allocation base for MEM_RELEASE, or the page-aligned subrange base for MEM_DECOMMIT." },
      { name: "dwSize", type: "ctypes.c_size_t", optional: false, description: "Zero for MEM_RELEASE, or the byte size to decommit." },
      { name: "dwFreeType", type: "wintypes.DWORD", optional: false, description: "MEM_RELEASE or MEM_DECOMMIT." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-virtualfree"]
  },
  "ctypes / ctypes.wintypes::VirtualProtect": {
    kind: "function",
    signatures: [{ name: "VirtualProtect", parameters: [
      { name: "lpAddress", type: "wintypes.LPVOID", optional: false, description: "Address in the committed page range whose protection will change." },
      { name: "dwSize", type: "ctypes.c_size_t", optional: false, description: "Byte range, applied to every page touched by the range." },
      { name: "flNewProtect", type: "wintypes.DWORD", optional: false, description: "New PAGE_* protection value." },
      { name: "lpflOldProtect", type: "ctypes.POINTER(wintypes.DWORD)", optional: false, description: "Output receiving the previous protection of the first affected page." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-virtualprotect"]
  },
  "ctypes / ctypes.wintypes::CreateFileMappingW": {
    kind: "function",
    signatures: [{ name: "CreateFileMappingW", parameters: [
      { name: "hFile", type: "wintypes.HANDLE", optional: false, description: "File handle, or INVALID_HANDLE_VALUE for page-file-backed shared memory." },
      { name: "lpFileMappingAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", optional: false, description: "Optional security and inheritance attributes." },
      { name: "flProtect", type: "wintypes.DWORD", optional: false, description: "Page protection and optional section attributes." },
      { name: "dwMaximumSizeHigh", type: "wintypes.DWORD", optional: false, description: "High 32 bits of maximum mapping size." },
      { name: "dwMaximumSizeLow", type: "wintypes.DWORD", optional: false, description: "Low 32 bits of maximum mapping size." },
      { name: "lpName", type: "wintypes.LPCWSTR | None", optional: false, description: "Optional object name used for cross-process lookup." }
    ], returns: "wintypes.HANDLE | None" }],
    sources: ["https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-createfilemappingw"]
  },
  "ctypes / ctypes.wintypes::OpenFileMappingW": {
    kind: "function",
    signatures: [{ name: "OpenFileMappingW", parameters: [
      { name: "dwDesiredAccess", type: "wintypes.DWORD", optional: false, description: "FILE_MAP_* access required for the intended view." },
      { name: "bInheritHandle", type: "wintypes.BOOL", optional: false, description: "Whether child processes may inherit the returned handle." },
      { name: "lpName", type: "wintypes.LPCWSTR", optional: false, description: "Existing named file-mapping object." }
    ], returns: "wintypes.HANDLE | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-openfilemappingw"]
  },
  "ctypes / ctypes.wintypes::MapViewOfFile": {
    kind: "function",
    signatures: [{ name: "MapViewOfFile", parameters: [
      { name: "hFileMappingObject", type: "wintypes.HANDLE", optional: false, description: "Open file-mapping handle." },
      { name: "dwDesiredAccess", type: "wintypes.DWORD", optional: false, description: "FILE_MAP_* access for this view." },
      { name: "dwFileOffsetHigh", type: "wintypes.DWORD", optional: false, description: "High 32 bits of the allocation-granularity-aligned mapping offset." },
      { name: "dwFileOffsetLow", type: "wintypes.DWORD", optional: false, description: "Low 32 bits of the mapping offset." },
      { name: "dwNumberOfBytesToMap", type: "ctypes.c_size_t", optional: false, description: "View size, or zero for the remaining mapping." }
    ], returns: "wintypes.LPVOID | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-mapviewoffile"]
  },
  "ctypes / ctypes.wintypes::UnmapViewOfFile": {
    kind: "function",
    signatures: [{ name: "UnmapViewOfFile", parameters: [{ name: "lpBaseAddress", type: "wintypes.LPCVOID", optional: false, description: "Exact base returned by MapViewOfFile." }], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-unmapviewoffile"]
  },
  "ctypes / ctypes.wintypes::HeapAlloc": {
    kind: "function",
    signatures: [{ name: "HeapAlloc", parameters: [
      { name: "hHeap", type: "wintypes.HANDLE", optional: false, description: "Heap that will own the returned block." },
      { name: "dwFlags", type: "wintypes.DWORD", optional: false, description: "Per-call heap flags such as HEAP_ZERO_MEMORY." },
      { name: "dwBytes", type: "ctypes.c_size_t", optional: false, description: "Requested block size in bytes." }
    ], returns: "wintypes.LPVOID | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/heapapi/nf-heapapi-heapalloc"]
  },
  "ctypes / ctypes.wintypes::HeapFree": {
    kind: "function",
    signatures: [{ name: "HeapFree", parameters: [
      { name: "hHeap", type: "wintypes.HANDLE", optional: false, description: "Same heap that allocated the block." },
      { name: "dwFlags", type: "wintypes.DWORD", optional: false, description: "Documented per-call heap flags, normally zero." },
      { name: "lpMem", type: "wintypes.LPVOID", optional: false, description: "Block pointer returned by HeapAlloc or HeapReAlloc." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/heapapi/nf-heapapi-heapfree"]
  },
  "ctypes / ctypes.wintypes::GetModuleHandleW": {
    kind: "function",
    signatures: [{ name: "GetModuleHandleW", parameters: [{ name: "lpModuleName", type: "wintypes.LPCWSTR | None", optional: false, description: "Loaded module basename or null for the current executable." }], returns: "wintypes.HMODULE | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-getmodulehandlew"]
  },
  "ctypes / ctypes.wintypes::GetModuleFileNameW": {
    kind: "function",
    signatures: [{ name: "GetModuleFileNameW", parameters: [
      { name: "hModule", type: "wintypes.HMODULE | None", optional: false, description: "Loaded module handle, or null for the current executable." },
      { name: "lpFilename", type: "wintypes.LPWSTR", optional: false, description: "Caller-owned UTF-16 output buffer." },
      { name: "nSize", type: "wintypes.DWORD", optional: false, description: "Output-buffer capacity measured in characters." }
    ], returns: "wintypes.DWORD" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-getmodulefilenamew"]
  },
  "ctypes / ctypes.wintypes::LoadLibraryExW": {
    kind: "function",
    signatures: [{ name: "LoadLibraryExW", parameters: [
      { name: "lpLibFileName", type: "wintypes.LPCWSTR", optional: false, description: "DLL path or name interpreted according to flags and process search policy." },
      { name: "hFile", type: "wintypes.HANDLE | None", optional: false, description: "Reserved, pass null." },
      { name: "dwFlags", type: "wintypes.DWORD", optional: false, description: "Load behavior and LOAD_LIBRARY_SEARCH_* flags." }
    ], returns: "wintypes.HMODULE | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-loadlibraryexw"]
  },
  "ctypes / ctypes.wintypes::SetDefaultDllDirectories": {
    kind: "function",
    signatures: [{ name: "SetDefaultDllDirectories", parameters: [{ name: "DirectoryFlags", type: "wintypes.DWORD", optional: false, description: "Process-wide LOAD_LIBRARY_SEARCH_* directory policy." }], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-setdefaultdlldirectories"]
  },
  "ctypes / ctypes.wintypes::AddDllDirectory": {
    kind: "function",
    signatures: [{ name: "AddDllDirectory", parameters: [{ name: "NewDirectory", type: "wintypes.LPCWSTR", optional: false, description: "Absolute directory path added to the process DLL search set." }], returns: "DLL_DIRECTORY_COOKIE | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/libloaderapi/nf-libloaderapi-adddlldirectory"]
  }
});
