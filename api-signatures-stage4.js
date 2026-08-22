Object.assign(window.ILOVEOS_API_SIGNATURES, {
  "winreg::OpenKey": {
    kind: "function",
    signatures: [{ name: "OpenKey", parameters: [
      { name: "key", type: "PyHKEY | int", optional: false, description: "Predefined root or already-open parent key." },
      { name: "sub_key", type: "str | None", optional: false, description: "Subkey path relative to key. Use an empty string or None for the same key." },
      { name: "reserved", type: "int", optional: true, description: "Reserved, pass zero." },
      { name: "access", type: "int", optional: true, description: "KEY_* desired access, optionally combined with one KEY_WOW64_* view flag." }
    ], returns: "PyHKEY" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.OpenKey"]
  },
  "winreg::CreateKeyEx": {
    kind: "function",
    signatures: [{ name: "CreateKeyEx", parameters: [
      { name: "key", type: "PyHKEY | int", optional: false, description: "Predefined root or open parent key." },
      { name: "sub_key", type: "str", optional: false, description: "Relative key path to create or open." },
      { name: "reserved", type: "int", optional: true, description: "Reserved, pass zero." },
      { name: "access", type: "int", optional: true, description: "Desired KEY_* access and optional architecture-view flag." }
    ], returns: "PyHKEY" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.CreateKeyEx"]
  },
  "winreg::CloseKey": {
    kind: "function",
    signatures: [{ name: "CloseKey", parameters: [{ name: "hkey", type: "PyHKEY | int", optional: false, description: "Owned Registry handle to close." }], returns: "None" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.CloseKey"]
  },
  "winreg::QueryValueEx": {
    kind: "function",
    signatures: [{ name: "QueryValueEx", parameters: [
      { name: "key", type: "PyHKEY | int", optional: false, description: "Open key with KEY_QUERY_VALUE access." },
      { name: "value_name", type: "str | None", optional: false, description: "Value name, or an empty string or None for the unnamed value." }
    ], returns: "tuple[Any, int]" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.QueryValueEx"]
  },
  "winreg::SetValueEx": {
    kind: "function",
    signatures: [{ name: "SetValueEx", parameters: [
      { name: "key", type: "PyHKEY | int", optional: false, description: "Open key with KEY_SET_VALUE access." },
      { name: "value_name", type: "str | None", optional: false, description: "Value name, or empty or None for the unnamed value." },
      { name: "reserved", type: "int", optional: false, description: "Reserved, pass zero." },
      { name: "type", type: "int", optional: false, description: "REG_* value type that determines data representation." },
      { name: "value", type: "str | int | bytes | list[str] | None", optional: false, description: "Python data compatible with the selected Registry type." }
    ], returns: "None" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.SetValueEx"]
  },
  "winreg::DeleteValue": {
    kind: "function",
    signatures: [{ name: "DeleteValue", parameters: [
      { name: "key", type: "PyHKEY | int", optional: false, description: "Open key with KEY_SET_VALUE access." },
      { name: "value", type: "str", optional: false, description: "Exact value name to remove." }
    ], returns: "None" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.DeleteValue"]
  },
  "winreg::DeleteKey": {
    kind: "function",
    signatures: [{ name: "DeleteKey", parameters: [
      { name: "key", type: "PyHKEY | int", optional: false, description: "Parent root or key." },
      { name: "sub_key", type: "str", optional: false, description: "Exact child key to delete." }
    ], returns: "None" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.DeleteKey"]
  },
  "winreg::EnumKey": {
    kind: "function",
    signatures: [{ name: "EnumKey", parameters: [
      { name: "key", type: "PyHKEY | int", optional: false, description: "Open key with enumeration access." },
      { name: "index", type: "int", optional: false, description: "Zero-based subkey index." }
    ], returns: "str" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.EnumKey"]
  },
  "winreg::EnumValue": {
    kind: "function",
    signatures: [{ name: "EnumValue", parameters: [
      { name: "key", type: "PyHKEY | int", optional: false, description: "Open key with value-query access." },
      { name: "index", type: "int", optional: false, description: "Zero-based value index." }
    ], returns: "tuple[str, Any, int]" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.EnumValue"]
  },
  "winreg::QueryInfoKey": {
    kind: "function",
    signatures: [{ name: "QueryInfoKey", parameters: [{ name: "key", type: "PyHKEY | int", optional: false, description: "Open key to inspect." }], returns: "tuple[int, int, int]" }],
    sources: ["https://docs.python.org/3/library/winreg.html#winreg.QueryInfoKey"]
  },
  "ctypes / ctypes.wintypes::AccessCheck": {
    kind: "function",
    signatures: [{ name: "AccessCheck", parameters: [
      { name: "pSecurityDescriptor", type: "ctypes.c_void_p", optional: false, description: "Security descriptor whose owner and DACL are evaluated." },
      { name: "ClientToken", type: "wintypes.HANDLE", optional: false, description: "Impersonation token with TOKEN_QUERY access." },
      { name: "DesiredAccess", type: "wintypes.DWORD", optional: false, description: "Object-specific requested mask after generic bits are mapped." },
      { name: "GenericMapping", type: "ctypes.POINTER(GENERIC_MAPPING)", optional: false, description: "Four object-specific generic-right expansions." },
      { name: "PrivilegeSet", type: "ctypes.c_void_p", optional: false, description: "Caller-owned output buffer for privileges used by the check." },
      { name: "PrivilegeSetLength", type: "ctypes.POINTER(wintypes.DWORD)", optional: false, description: "Input buffer size and output required or used size in bytes." },
      { name: "GrantedAccess", type: "ctypes.POINTER(wintypes.DWORD)", optional: false, description: "Output receiving the granted object-specific mask." },
      { name: "AccessStatus", type: "ctypes.POINTER(wintypes.BOOL)", optional: false, description: "Output receiving true for allowed or false for denied when the API succeeds." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/securitybaseapi/nf-securitybaseapi-accesscheck"]
  },
  "win32security::MapGenericMask": {
    kind: "function",
    signatures: [{ name: "MapGenericMask", parameters: [
      { name: "accessMask", type: "int", optional: false, description: "Mask whose GENERIC_* bits are replaced." },
      { name: "genericMapping", type: "dict[str, int]", optional: false, description: "Object-specific expansion for the four generic rights." }
    ], returns: "int" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/win32security__MapGenericMask_meth.html"]
  },
  "win32security::LookupPrivilegeName": {
    kind: "function",
    signatures: [{ name: "LookupPrivilegeName", parameters: [
      { name: "systemName", type: "str | None", optional: false, description: "Remote system name, or None for the local system." },
      { name: "luid", type: "PyLUID", optional: false, description: "Locally unique privilege identifier returned in a token or by LookupPrivilegeValue." }
    ], returns: "str" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/win32security__LookupPrivilegeName_meth.html"]
  },
  "win32security::GetSecurityDescriptorDacl": {
    kind: "method",
    signatures: [{ name: "GetSecurityDescriptorDacl", parameters: [], returns: "PyACL | None" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/PySECURITY_DESCRIPTOR__GetSecurityDescriptorDacl_meth.html"]
  },
  "win32security::GetAce": {
    kind: "method",
    signatures: [{ name: "GetAce", parameters: [{ name: "index", type: "int", optional: false, description: "Zero-based ACE index below GetAceCount()." }], returns: "tuple" }],
    sources: ["https://timgolden.me.uk/pywin32-docs/PyACL__GetAce_meth.html"]
  },
  "ctypes / ctypes.wintypes::OpenSCManagerW": {
    kind: "function",
    signatures: [{ name: "OpenSCManagerW", parameters: [
      { name: "lpMachineName", type: "wintypes.LPCWSTR | None", optional: false, description: "Remote machine name, or null for the local computer." },
      { name: "lpDatabaseName", type: "wintypes.LPCWSTR | None", optional: false, description: "Service database name, or null for SERVICES_ACTIVE_DATABASE." },
      { name: "dwDesiredAccess", type: "wintypes.DWORD", optional: false, description: "SC_MANAGER_* access mask, commonly SC_MANAGER_CONNECT." }
    ], returns: "wintypes.HANDLE | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winsvc/nf-winsvc-openscmanagerw"]
  },
  "ctypes / ctypes.wintypes::OpenServiceW": {
    kind: "function",
    signatures: [{ name: "OpenServiceW", parameters: [
      { name: "hSCManager", type: "wintypes.HANDLE", optional: false, description: "SCM handle with SC_MANAGER_CONNECT access." },
      { name: "lpServiceName", type: "wintypes.LPCWSTR", optional: false, description: "Internal service name, not the display name." },
      { name: "dwDesiredAccess", type: "wintypes.DWORD", optional: false, description: "Action-specific SERVICE_* access mask." }
    ], returns: "wintypes.HANDLE | None" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winsvc/nf-winsvc-openservicew"]
  },
  "ctypes / ctypes.wintypes::StartServiceW": {
    kind: "function",
    signatures: [{ name: "StartServiceW", parameters: [
      { name: "hService", type: "wintypes.HANDLE", optional: false, description: "Service handle with SERVICE_START access." },
      { name: "dwNumServiceArgs", type: "wintypes.DWORD", optional: false, description: "Count of service-specific arguments." },
      { name: "lpServiceArgVectors", type: "ctypes.POINTER(wintypes.LPCWSTR) | None", optional: false, description: "Argument array, or null when the count is zero." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winsvc/nf-winsvc-startservicew"]
  },
  "ctypes / ctypes.wintypes::ControlService": {
    kind: "function",
    signatures: [{ name: "ControlService", parameters: [
      { name: "hService", type: "wintypes.HANDLE", optional: false, description: "Service handle with the right required by the control." },
      { name: "dwControl", type: "wintypes.DWORD", optional: false, description: "SERVICE_CONTROL_* code such as SERVICE_CONTROL_STOP." },
      { name: "lpServiceStatus", type: "ctypes.POINTER(SERVICE_STATUS)", optional: false, description: "Caller-owned output structure receiving immediate status." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winsvc/nf-winsvc-controlservice"]
  },
  "ctypes / ctypes.wintypes::QueryServiceStatusEx": {
    kind: "function",
    signatures: [{ name: "QueryServiceStatusEx", parameters: [
      { name: "hService", type: "wintypes.HANDLE", optional: false, description: "Service handle with SERVICE_QUERY_STATUS." },
      { name: "InfoLevel", type: "int", optional: false, description: "SC_STATUS_PROCESS_INFO." },
      { name: "lpBuffer", type: "ctypes.POINTER(wintypes.BYTE)", optional: false, description: "Output buffer interpreted as SERVICE_STATUS_PROCESS." },
      { name: "cbBufSize", type: "wintypes.DWORD", optional: false, description: "Output-buffer size in bytes." },
      { name: "pcbBytesNeeded", type: "ctypes.POINTER(wintypes.DWORD)", optional: false, description: "Output receiving the required byte count." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winsvc/nf-winsvc-queryservicestatusex"]
  },
  "ctypes / ctypes.wintypes::CloseServiceHandle": {
    kind: "function",
    signatures: [{ name: "CloseServiceHandle", parameters: [{ name: "hSCObject", type: "wintypes.HANDLE", optional: false, description: "Owned SCM or service handle." }], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winsvc/nf-winsvc-closeservicehandle"]
  },
  "ctypes / ctypes.wintypes::IsWow64Process2": {
    kind: "function",
    signatures: [{ name: "IsWow64Process2", parameters: [
      { name: "hProcess", type: "wintypes.HANDLE", optional: false, description: "Process handle with query access." },
      { name: "pProcessMachine", type: "ctypes.POINTER(wintypes.USHORT)", optional: false, description: "Output receiving the compatibility process IMAGE_FILE_MACHINE_* value or UNKNOWN." },
      { name: "pNativeMachine", type: "ctypes.POINTER(wintypes.USHORT)", optional: false, description: "Output receiving the native host machine value." }
    ], returns: "wintypes.BOOL" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/wow64apiset/nf-wow64apiset-iswow64process2"]
  },
  "ctypes / ctypes.wintypes::GetLastError": {
    kind: "function",
    signatures: [{ name: "GetLastError", parameters: [], returns: "wintypes.DWORD" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/errhandlingapi/nf-errhandlingapi-getlasterror"]
  },
  "ctypes / ctypes.wintypes::RegOpenKeyExW": {
    kind: "function",
    signatures: [{ name: "RegOpenKeyExW", parameters: [
      { name: "hKey", type: "wintypes.HKEY", optional: false, description: "Predefined root or open parent key." },
      { name: "lpSubKey", type: "wintypes.LPCWSTR | None", optional: false, description: "Relative subkey path, or null or empty for the same key." },
      { name: "ulOptions", type: "wintypes.DWORD", optional: false, description: "Options, normally zero." },
      { name: "samDesired", type: "wintypes.DWORD", optional: false, description: "KEY_* access mask and optional WOW64 view flag." },
      { name: "phkResult", type: "ctypes.POINTER(wintypes.HKEY)", optional: false, description: "Output receiving an owned HKEY on ERROR_SUCCESS." }
    ], returns: "wintypes.LONG" }],
    sources: ["https://learn.microsoft.com/windows/win32/api/winreg/nf-winreg-regopenkeyexw"]
  }
});
