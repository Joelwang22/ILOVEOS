Object.assign(window.ILOVEOS_API_SIGNATURES, {
  "ctypes / ctypes.wintypes::SetWindowsHookExW": {
    kind: "function",
    signatures: [{ name: "SetWindowsHookExW", parameters: [
      { name: "idHook", type: "ctypes.c_int", optional: false, description: "WH_* hook type defining callback meaning and delivery rules." },
      { name: "lpfn", type: "HOOKPROC", optional: false, description: "ABI-correct callback whose native storage remains alive for the full hook lifetime." },
      { name: "hmod", type: "wintypes.HINSTANCE | None", optional: false, description: "Module containing the callback when required by cross-process scope, otherwise null under the documented thread-local case." },
      { name: "dwThreadId", type: "wintypes.DWORD", optional: false, description: "Target thread ID, or zero for the hook type's supported desktop-wide scope." }
    ], returns: "HHOOK | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-setwindowshookexw"]
  },
  "ctypes / ctypes.wintypes::CallNextHookEx": {
    kind: "function",
    signatures: [{ name: "CallNextHookEx", parameters: [
      { name: "hhk", type: "HHOOK | None", optional: false, description: "Hook handle, currently ignored by the API but retained for contract clarity." },
      { name: "nCode", type: "ctypes.c_int", optional: false, description: "Hook code supplied to the callback." },
      { name: "wParam", type: "wintypes.WPARAM", optional: false, description: "Hook-type-specific word-sized parameter." },
      { name: "lParam", type: "wintypes.LPARAM", optional: false, description: "Hook-type-specific pointer-sized parameter." }
    ], returns: "wintypes.LRESULT" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-callnexthookex"]
  },
  "ctypes / ctypes.wintypes::UnhookWindowsHookEx": {
    kind: "function",
    signatures: [{ name: "UnhookWindowsHookEx", parameters: [
      { name: "hhk", type: "HHOOK", optional: false, description: "Owned hook handle returned by SetWindowsHookExW." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winuser/nf-winuser-unhookwindowshookex"]
  },
  "ctypes / ctypes.wintypes::VirtualAllocEx": {
    kind: "function",
    signatures: [{ name: "VirtualAllocEx", parameters: [
      { name: "hProcess", type: "wintypes.HANDLE", optional: false, description: "Target process handle with PROCESS_VM_OPERATION." },
      { name: "lpAddress", type: "wintypes.LPVOID | None", optional: false, description: "Preferred target address or null for system selection." },
      { name: "dwSize", type: "ctypes.c_size_t", optional: false, description: "Requested target byte range." },
      { name: "flAllocationType", type: "wintypes.DWORD", optional: false, description: "MEM_RESERVE, MEM_COMMIT, or a documented combination." },
      { name: "flProtect", type: "wintypes.DWORD", optional: false, description: "Initial PAGE_* protection." }
    ], returns: "wintypes.LPVOID | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-virtualallocex"]
  },
  "ctypes / ctypes.wintypes::WriteProcessMemory": {
    kind: "function",
    signatures: [{ name: "WriteProcessMemory", parameters: [
      { name: "hProcess", type: "wintypes.HANDLE", optional: false, description: "Target process handle with PROCESS_VM_WRITE and PROCESS_VM_OPERATION." },
      { name: "lpBaseAddress", type: "wintypes.LPVOID", optional: false, description: "Writable address in the target process." },
      { name: "lpBuffer", type: "wintypes.LPCVOID", optional: false, description: "Caller-owned source bytes kept alive for the call." },
      { name: "nSize", type: "ctypes.c_size_t", optional: false, description: "Number of bytes requested." },
      { name: "lpNumberOfBytesWritten", type: "ctypes.POINTER(ctypes.c_size_t) | None", optional: false, description: "Optional output count used to verify complete transfer." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-writeprocessmemory"]
  },
  "ctypes / ctypes.wintypes::VirtualFreeEx": {
    kind: "function",
    signatures: [{ name: "VirtualFreeEx", parameters: [
      { name: "hProcess", type: "wintypes.HANDLE", optional: false, description: "Target process that owns the allocation." },
      { name: "lpAddress", type: "wintypes.LPVOID", optional: false, description: "Allocation base or page range under the selected free type." },
      { name: "dwSize", type: "ctypes.c_size_t", optional: false, description: "Zero for MEM_RELEASE, region size for MEM_DECOMMIT." },
      { name: "dwFreeType", type: "wintypes.DWORD", optional: false, description: "MEM_RELEASE or MEM_DECOMMIT under the matching contract." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/memoryapi/nf-memoryapi-virtualfreeex"]
  },
  "ctypes / ctypes.wintypes::CreateRemoteThread": {
    kind: "function",
    signatures: [{ name: "CreateRemoteThread", parameters: [
      { name: "hProcess", type: "wintypes.HANDLE", optional: false, description: "Authorized target process handle with the documented combined rights." },
      { name: "lpThreadAttributes", type: "ctypes.POINTER(SECURITY_ATTRIBUTES) | None", optional: false, description: "Optional thread security and inheritance attributes." },
      { name: "dwStackSize", type: "ctypes.c_size_t", optional: false, description: "Initial stack size, with zero selecting the executable default." },
      { name: "lpStartAddress", type: "LPTHREAD_START_ROUTINE", optional: false, description: "Valid target-process function following the target ABI." },
      { name: "lpParameter", type: "wintypes.LPVOID | None", optional: false, description: "Target-process parameter address or null." },
      { name: "dwCreationFlags", type: "wintypes.DWORD", optional: false, description: "Thread creation flags such as CREATE_SUSPENDED when deliberately required." },
      { name: "lpThreadId", type: "ctypes.POINTER(wintypes.DWORD) | None", optional: false, description: "Optional output TID." }
    ], returns: "wintypes.HANDLE | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-createremotethread"]
  },
  "ctypes / ctypes.wintypes::FlushInstructionCache": {
    kind: "function",
    signatures: [{ name: "FlushInstructionCache", parameters: [
      { name: "hProcess", type: "wintypes.HANDLE", optional: false, description: "Process whose instruction range was changed." },
      { name: "lpBaseAddress", type: "wintypes.LPCVOID | None", optional: false, description: "Start of the changed range, or null under the documented whole-process form." },
      { name: "dwSize", type: "ctypes.c_size_t", optional: false, description: "Changed range size in bytes." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/processthreadsapi/nf-processthreadsapi-flushinstructioncache"]
  },
  "ctypes / ctypes.wintypes::RtlAddFunctionTable": {
    kind: "function",
    signatures: [{ name: "RtlAddFunctionTable", parameters: [
      { name: "FunctionTable", type: "ctypes.POINTER(RUNTIME_FUNCTION)", optional: false, description: "Persistent array describing dynamic function ranges." },
      { name: "EntryCount", type: "wintypes.DWORD", optional: false, description: "Number of runtime-function entries." },
      { name: "BaseAddress", type: "ctypes.c_ulonglong", optional: false, description: "Base used to interpret relative function and unwind addresses." }
    ], returns: "wintypes.BOOLEAN" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winnt/nf-winnt-rtladdfunctiontable"]
  },
  "ctypes / ctypes.wintypes::InterlockedExchangePointer": {
    kind: "function",
    signatures: [{ name: "InterlockedExchangePointer", parameters: [
      { name: "Target", type: "ctypes.POINTER(ctypes.c_void_p)", optional: false, description: "Aligned writable pointer slot to replace atomically." },
      { name: "Value", type: "ctypes.c_void_p", optional: false, description: "New pointer-sized value." }
    ], returns: "ctypes.c_void_p" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winnt/nf-winnt-interlockedexchangepointer"]
  },
  "ctypes / ctypes.wintypes::WinVerifyTrust": {
    kind: "function",
    signatures: [{ name: "WinVerifyTrust", parameters: [
      { name: "hwnd", type: "wintypes.HWND | None", optional: false, description: "Optional owner window or the documented invalid-handle value for no UI." },
      { name: "pgActionID", type: "ctypes.POINTER(GUID)", optional: false, description: "Trust-provider action GUID, commonly WINTRUST_ACTION_GENERIC_VERIFY_V2 for file verification." },
      { name: "pWVTData", type: "ctypes.POINTER(WINTRUST_DATA)", optional: false, description: "Initialized trust request describing file, UI, revocation, state, and provider options." }
    ], returns: "wintypes.LONG" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/wintrust/nf-wintrust-winverifytrust"]
  }
});
