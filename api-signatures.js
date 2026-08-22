/* Generated from typeshed annotations and linked pywin32 or Microsoft documentation. */
window.ILOVEOS_API_SIGNATURES = {
  "win32api::GetCurrentProcess": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetCurrentProcess",
        "parameters": [],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetCurrentProcess_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetCurrentProcessId": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetCurrentProcessId",
        "parameters": [],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetCurrentProcessId_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetCurrentThreadId": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetCurrentThreadId",
        "parameters": [],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetCurrentThreadId_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetEnvironmentVariable": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetEnvironmentVariable",
        "parameters": [
          {
            "name": "name",
            "type": "str",
            "optional": false,
            "description": "Name of the environment variable to read from the calling process environment."
          }
        ],
        "returns": "str"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetEnvironmentVariable_meth.html"
    ]
  },
  "win32api::QueryDosDevice": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryDosDevice",
        "parameters": [
          {
            "name": "deviceName",
            "type": "str",
            "optional": false,
            "description": "DOS device name to translate, for example C:."
          }
        ],
        "returns": "str"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__QueryDosDevice_meth.html"
    ]
  },
  "win32api::OpenProcess": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenProcess",
        "parameters": [
          {
            "name": "reqdAccess",
            "type": "int",
            "optional": false,
            "description": "The required access."
          },
          {
            "name": "bInherit",
            "type": "int",
            "optional": false,
            "description": "Specifies whether the returned handle can be inherited by a new process created by the current process. If TRUE, the handle is inheritable."
          },
          {
            "name": "pid",
            "type": "int",
            "optional": false,
            "description": "The process ID"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__OpenProcess_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::CloseHandle": {
    "kind": "function",
    "signatures": [
      {
        "name": "CloseHandle",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE | int",
            "optional": false,
            "description": "A previously opened handle."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__CloseHandle_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::DuplicateHandle": {
    "kind": "function",
    "signatures": [
      {
        "name": "DuplicateHandle",
        "parameters": [
          {
            "name": "hSourceProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Identifies the process containing the handle to duplicate."
          },
          {
            "name": "hSource",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Identifies the handle to duplicate. This is an open object handle that is valid in the context of the source process."
          },
          {
            "name": "hTargetProcessHandle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Identifies the process that is to receive the duplicated handle. The handle must have PROCESS_DUP_HANDLE access."
          },
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "Specifies the access requested for the new handle. This parameter is ignored if the dwOptions parameter specifies the DUPLICATE_SAME_ACCESS flag. Otherwise, the flags that can be specified depend on the type of object whose handle is being duplicated. For the flags that can be specified for each object type, see the following Remarks section. Note that the new handle can have more access than the original handle."
          },
          {
            "name": "bInheritHandle",
            "type": "int",
            "optional": false,
            "description": "Indicates whether the handle is inheritable. If TRUE, the duplicate handle can be inherited by new processes created by the target process. If FALSE, the new handle cannot be inherited."
          },
          {
            "name": "options",
            "type": "int",
            "optional": false,
            "description": "Specifies optional actions. This parameter can be zero, or any combination of the following flags"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__DuplicateHandle_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetHandleInformation": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetHandleInformation",
        "parameters": [
          {
            "name": "Object",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to an object"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetHandleInformation_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::SetHandleInformation": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetHandleInformation",
        "parameters": [
          {
            "name": "Object",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to an object"
          },
          {
            "name": "Mask",
            "type": "int",
            "optional": false,
            "description": "Bitmask specifying which flags should be set"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": false,
            "description": "Bitmask of flag values to be set. Valid Flags are HANDLE_FLAG_INHERIT, HANDLE_FLAG_PROTECT_FROM_CLOSE"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__SetHandleInformation_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetStdHandle": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetStdHandle",
        "parameters": [
          {
            "name": "handle",
            "type": "int",
            "optional": false,
            "description": "input, output, or error device"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetStdHandle_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetUserName": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetUserName",
        "parameters": [],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetUserName_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetComputerName": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetComputerName",
        "parameters": [],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetComputerName_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetSystemInfo": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetSystemInfo",
        "parameters": [],
        "returns": "tuple"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetSystemInfo_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetNativeSystemInfo": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetNativeSystemInfo",
        "parameters": [],
        "returns": "tuple"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetNativeSystemInfo_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetModuleHandle": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetModuleHandle",
        "parameters": [
          {
            "name": "fileName",
            "type": "string",
            "optional": true,
            "description": "Specifies the file name of the module to load."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetModuleHandle_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::LoadLibrary": {
    "kind": "function",
    "signatures": [
      {
        "name": "LoadLibrary",
        "parameters": [
          {
            "name": "fileName",
            "type": "string",
            "optional": false,
            "description": "Specifies the file name of the module to load."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__LoadLibrary_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::FreeLibrary": {
    "kind": "function",
    "signatures": [
      {
        "name": "FreeLibrary",
        "parameters": [
          {
            "name": "hModule",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Specifies the handle to the module."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__FreeLibrary_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetProcAddress": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetProcAddress",
        "parameters": [
          {
            "name": "hModule",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Specifies the handle to the module."
          },
          {
            "name": "functionName",
            "type": "PyResourceId",
            "optional": false,
            "description": "Specifies the name of the procedure, or its ordinal value"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetProcAddress_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::GetModuleFileName": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetModuleFileName",
        "parameters": [
          {
            "name": "hModule",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Specifies the handle to the module."
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__GetModuleFileName_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::FormatMessage": {
    "kind": "function",
    "signatures": [
      {
        "name": "FormatMessage",
        "parameters": [
          {
            "name": "flags",
            "type": "int",
            "optional": false
          },
          {
            "name": "source",
            "type": "str | None",
            "optional": true
          },
          {
            "name": "messageId",
            "type": "int",
            "optional": true
          },
          {
            "name": "languageID",
            "type": "int",
            "optional": true
          },
          {
            "name": "inserts",
            "type": "Iterable[str] | None",
            "optional": true
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__FormatMessage_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32api::ShellExecute": {
    "kind": "function",
    "signatures": [
      {
        "name": "ShellExecute",
        "parameters": [
          {
            "name": "hwnd",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle of the parent window, or 0 for no parent. This window receives any message boxes an application produces (for example, for error reporting)."
          },
          {
            "name": "op",
            "type": "string",
            "optional": false,
            "description": "The operation to perform. May be \"open\", \"print\", or None, which defaults to \"open\"."
          },
          {
            "name": "file",
            "type": "string",
            "optional": false,
            "description": "The name of the file to open."
          },
          {
            "name": "params",
            "type": "string",
            "optional": false,
            "description": "The parameters to pass, if the file name contains an executable. Should be None for a document file."
          },
          {
            "name": "_dir",
            "type": "str",
            "optional": false
          },
          {
            "name": "bShow",
            "type": "int",
            "optional": false,
            "description": "Specifies whether the application is shown when it is opened. If the lpszFile parameter specifies a document file, this parameter is zero."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32api__ShellExecute_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32api.pyi"
    ]
  },
  "win32process::STARTUPINFO": {
    "kind": "function",
    "signatures": [
      {
        "name": "STARTUPINFO",
        "parameters": [],
        "returns": "PySTARTUPINFO"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__STARTUPINFO_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::CreateProcess": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateProcess",
        "parameters": [
          {
            "name": "appName",
            "type": "string",
            "optional": false,
            "description": "name of executable module, or None"
          },
          {
            "name": "commandLine",
            "type": "string",
            "optional": false,
            "description": "command line string, or None"
          },
          {
            "name": "processAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "process security attributes, or None"
          },
          {
            "name": "threadAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "thread security attributes, or None"
          },
          {
            "name": "bInheritHandles",
            "type": "int",
            "optional": false,
            "description": "handle inheritance flag"
          },
          {
            "name": "dwCreationFlags",
            "type": "int",
            "optional": false,
            "description": "creation flags. May be a combination of the following values from the win32con module:"
          },
          {
            "name": "newEnvironment",
            "type": "dictionary | None",
            "optional": false,
            "description": "A dictionary of string or Unicode pairs to define the environment for the process, or None to inherit the current environment."
          },
          {
            "name": "currentDirectory",
            "type": "string",
            "optional": false,
            "description": "current directory name, or None"
          },
          {
            "name": "startupinfo",
            "type": "PySTARTUPINFO",
            "optional": false,
            "description": "a STARTUPINFO object that specifies how the main window for the new process should appear."
          }
        ],
        "returns": "tuple[PyHANDLE, PyHANDLE, int, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__CreateProcess_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::CreateProcessAsUser": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateProcessAsUser",
        "parameters": [
          {
            "name": "hToken",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to a token that represents a logged-on user"
          },
          {
            "name": "appName",
            "type": "string",
            "optional": false,
            "description": "name of executable module, or None"
          },
          {
            "name": "commandLine",
            "type": "string",
            "optional": false,
            "description": "command line string, or None"
          },
          {
            "name": "processAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "process security attributes, or None"
          },
          {
            "name": "threadAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "thread security attributes, or None"
          },
          {
            "name": "bInheritHandles",
            "type": "int",
            "optional": false,
            "description": "handle inheritance flag"
          },
          {
            "name": "dwCreationFlags",
            "type": "int",
            "optional": false,
            "description": "creation flags"
          },
          {
            "name": "newEnvironment",
            "type": "None",
            "optional": false,
            "description": "A dictionary of stringor Unicode pairs to define the environment for the process, or None to inherit the current environment."
          },
          {
            "name": "currentDirectory",
            "type": "string",
            "optional": false,
            "description": "current directory name, or None"
          },
          {
            "name": "startupinfo",
            "type": "PySTARTUPINFO",
            "optional": false,
            "description": "a STARTUPINFO object that specifies how the main window for the new process should appear."
          }
        ],
        "returns": "tuple[PyHANDLE, PyHANDLE, int, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__CreateProcessAsUser_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::EnumProcesses": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumProcesses",
        "parameters": [],
        "returns": "tuple[long,....]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__EnumProcesses_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::EnumProcessModules": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumProcessModules",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Process handle as returned by OpenProcess"
          }
        ],
        "returns": "tuple[long,....]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__EnumProcessModules_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::EnumProcessModulesEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumProcessModulesEx",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Process handle as returned by OpenProcess"
          },
          {
            "name": "FilterFlag",
            "type": "int",
            "optional": true,
            "description": "Controls whether 32 or 64-bit modules are returned"
          }
        ],
        "returns": "tuple[long,....]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__EnumProcessModulesEx_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::GetModuleFileNameEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetModuleFileNameEx",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Process handle as returned by OpenProcess"
          },
          {
            "name": "hModule",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Module handle"
          }
        ],
        "returns": "PyUNICODE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetModuleFileNameEx_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::GetProcessMemoryInfo": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetProcessMemoryInfo",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Process handle as returned by OpenProcess"
          }
        ],
        "returns": "dict"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetProcessMemoryInfo_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::GetProcessTimes": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetProcessTimes",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Process handle as returned by OpenProcess"
          }
        ],
        "returns": "dict"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetProcessTimes_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::GetThreadTimes": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetThreadTimes",
        "parameters": [
          {
            "name": "hThread",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Open handle to the thread whose timing information will be read."
          }
        ],
        "returns": "dict"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetThreadTimes_meth.html"
    ]
  },
  "win32process::GetProcessIoCounters": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetProcessIoCounters",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Process handle as returned by OpenProcess"
          }
        ],
        "returns": "dict"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetProcessIoCounters_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::GetExitCodeProcess": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetExitCodeProcess",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the process"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetExitCodeProcess_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::GetPriorityClass": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetPriorityClass",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the thread"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetPriorityClass_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::SetPriorityClass": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetPriorityClass",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the process"
          },
          {
            "name": "dwPriorityClass",
            "type": "int",
            "optional": false,
            "description": "priority class value"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__SetPriorityClass_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::GetThreadPriority": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetThreadPriority",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the thread"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetThreadPriority_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::SetThreadPriority": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetThreadPriority",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the thread"
          },
          {
            "name": "nPriority",
            "type": "int",
            "optional": false,
            "description": "thread priority level"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__SetThreadPriority_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::GetProcessAffinityMask": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetProcessAffinityMask",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the process of interest"
          }
        ],
        "returns": "tuple[int, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__GetProcessAffinityMask_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::SetProcessAffinityMask": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetProcessAffinityMask",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the process of interest"
          },
          {
            "name": "mask",
            "type": "int",
            "optional": false,
            "description": "a processor affinity mask"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__SetProcessAffinityMask_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::SuspendThread": {
    "kind": "function",
    "signatures": [
      {
        "name": "SuspendThread",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the thread"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__SuspendThread_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::ResumeThread": {
    "kind": "function",
    "signatures": [
      {
        "name": "ResumeThread",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the thread"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__ResumeThread_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::TerminateProcess": {
    "kind": "function",
    "signatures": [
      {
        "name": "TerminateProcess",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to the process"
          },
          {
            "name": "exitCode",
            "type": "int",
            "optional": false,
            "description": "The exit code for the process."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__TerminateProcess_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::VirtualAllocEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "VirtualAllocEx",
        "parameters": [
          {
            "name": "hProcess",
            "type": "object",
            "optional": false
          },
          {
            "name": "address",
            "type": "int",
            "optional": false
          },
          {
            "name": "size",
            "type": "int",
            "optional": false
          },
          {
            "name": "allocationType",
            "type": "int",
            "optional": false
          },
          {
            "name": "flProtect",
            "type": "int",
            "optional": false
          }
        ],
        "returns": "object (not annotated)"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::VirtualFreeEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "VirtualFreeEx",
        "parameters": [
          {
            "name": "hProcess",
            "type": "object",
            "optional": false
          },
          {
            "name": "address",
            "type": "int",
            "optional": false
          },
          {
            "name": "size",
            "type": "int",
            "optional": false
          },
          {
            "name": "freeType",
            "type": "int",
            "optional": false
          }
        ],
        "returns": "object (not annotated)"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::ReadProcessMemory": {
    "kind": "function",
    "signatures": [
      {
        "name": "ReadProcessMemory",
        "parameters": [
          {
            "name": "hProcess",
            "type": "object",
            "optional": false
          },
          {
            "name": "address",
            "type": "int",
            "optional": false
          },
          {
            "name": "size",
            "type": "int",
            "optional": false
          }
        ],
        "returns": "bytes"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::WriteProcessMemory": {
    "kind": "function",
    "signatures": [
      {
        "name": "WriteProcessMemory",
        "parameters": [
          {
            "name": "hProcess",
            "type": "object",
            "optional": false
          },
          {
            "name": "address",
            "type": "object",
            "optional": false
          },
          {
            "name": "buf",
            "type": "object",
            "optional": false
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::CreateRemoteThread": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateRemoteThread",
        "parameters": [
          {
            "name": "hprocess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the remote process."
          },
          {
            "name": "sa",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "The security attributes, or None"
          },
          {
            "name": "stackSize",
            "type": "int",
            "optional": false,
            "description": "Stack size for the new thread, or zero for the default size."
          },
          {
            "name": "entryPoint",
            "type": "function",
            "optional": false,
            "description": "The thread function's address."
          },
          {
            "name": "Parameter",
            "type": "int",
            "optional": false,
            "description": "Arg passed to the function in the form of a void pointer"
          },
          {
            "name": "flags",
            "type": "int",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "tuple[PyHANDLE, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__CreateRemoteThread_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32process::IsWow64Process": {
    "kind": "function",
    "signatures": [
      {
        "name": "IsWow64Process",
        "parameters": [
          {
            "name": "Process",
            "type": "PyHANDLE",
            "optional": true,
            "description": "Handle to a process as returned by win32api::OpenProcess , win32api::GetCurrentProcess , etc, or will use the current process handle if None (the default) is passed."
          }
        ],
        "returns": "bool"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32process__IsWow64Process_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32process.pyi"
    ]
  },
  "win32event::CreateEvent": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateEvent",
        "parameters": [
          {
            "name": "EventAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "The security attributes, or None"
          },
          {
            "name": "bManualReset",
            "type": "bool",
            "optional": false,
            "description": "flag for manual-reset event"
          },
          {
            "name": "bInitialState",
            "type": "bool",
            "optional": false,
            "description": "flag for initial state"
          },
          {
            "name": "Name",
            "type": "PyUnicode",
            "optional": false,
            "description": "event-object name, or None"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__CreateEvent_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::OpenEvent": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenEvent",
        "parameters": [
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "access flag - one of win32event::EVENT_ALL_ACCESS , win32event::EVENT_MODIFY_STATE , or (NT only) win32event::SYNCHRONIZE"
          },
          {
            "name": "bInheritHandle",
            "type": "bool",
            "optional": false,
            "description": "inherit flag"
          },
          {
            "name": "name",
            "type": "PyUnicode",
            "optional": false,
            "description": "name of event to open."
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__OpenEvent_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::SetEvent": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetEvent",
        "parameters": [
          {
            "name": "hEvent",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle of event object"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__SetEvent_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::ResetEvent": {
    "kind": "function",
    "signatures": [
      {
        "name": "ResetEvent",
        "parameters": [
          {
            "name": "hEvent",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle of event object"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__ResetEvent_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::CreateMutex": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateMutex",
        "parameters": [
          {
            "name": "MutexAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "Specifies inheritance and security descriptor for object, or None for defaults"
          },
          {
            "name": "InitialOwner",
            "type": "bool",
            "optional": false,
            "description": "flag for initial ownership"
          },
          {
            "name": "Name",
            "type": "PyUnicode",
            "optional": false,
            "description": "Mutex-object name, or None"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__CreateMutex_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::OpenMutex": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenMutex",
        "parameters": [
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "access flag"
          },
          {
            "name": "bInheritHandle",
            "type": "bool",
            "optional": false,
            "description": "inherit flag"
          },
          {
            "name": "name",
            "type": "PyUnicode",
            "optional": false,
            "description": "name of mutex to open."
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__OpenMutex_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::ReleaseMutex": {
    "kind": "function",
    "signatures": [
      {
        "name": "ReleaseMutex",
        "parameters": [
          {
            "name": "hEvent",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle of mutex object"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__ReleaseMutex_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::CreateSemaphore": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateSemaphore",
        "parameters": [
          {
            "name": "SemaphoreAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "Specifies inheritance and security descriptor for object, or None for defaults"
          },
          {
            "name": "InitialCount",
            "type": "int",
            "optional": false,
            "description": "Initial count"
          },
          {
            "name": "MaximumCount",
            "type": "int",
            "optional": false,
            "description": "Maximum count"
          },
          {
            "name": "SemaphoreName",
            "type": "str",
            "optional": false,
            "description": "Semaphore-object name, or None"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__CreateSemaphore_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::OpenSemaphore": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenSemaphore",
        "parameters": [
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "access flag"
          },
          {
            "name": "bInheritHandle",
            "type": "bool",
            "optional": false,
            "description": "inherit flag"
          },
          {
            "name": "name",
            "type": "PyUnicode",
            "optional": false,
            "description": "name of semaphore to open."
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__OpenSemaphore_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::ReleaseSemaphore": {
    "kind": "function",
    "signatures": [
      {
        "name": "ReleaseSemaphore",
        "parameters": [
          {
            "name": "hEvent",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle of the semaphore object"
          },
          {
            "name": "lReleaseCount",
            "type": "int",
            "optional": false,
            "description": "amount to add to current count"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__ReleaseSemaphore_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::WaitForSingleObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "WaitForSingleObject",
        "parameters": [
          {
            "name": "hHandle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle of object to wait for"
          },
          {
            "name": "milliseconds",
            "type": "int",
            "optional": false,
            "description": "time-out interval in milliseconds"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__WaitForSingleObject_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::WaitForMultipleObjects": {
    "kind": "function",
    "signatures": [
      {
        "name": "WaitForMultipleObjects",
        "parameters": [
          {
            "name": "handlelist",
            "type": "tuple[[ PyHANDLE, ...]]",
            "optional": false,
            "description": "A sequence of handles to wait on."
          },
          {
            "name": "bWaitAll",
            "type": "bool",
            "optional": false,
            "description": "wait flag"
          },
          {
            "name": "milliseconds",
            "type": "int",
            "optional": false,
            "description": "time-out interval in milliseconds"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__WaitForMultipleObjects_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::CreateWaitableTimer": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateWaitableTimer",
        "parameters": [
          {
            "name": "TimerAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "Specifies inheritance and security descriptor for object, or None for defaults"
          },
          {
            "name": "ManualReset",
            "type": "bool",
            "optional": false,
            "description": "True for manual reset timer, or False to create a synchronization timer"
          },
          {
            "name": "TimerName",
            "type": "str",
            "optional": false,
            "description": "Timer object name, or None"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__CreateWaitableTimer_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::SetWaitableTimer": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetWaitableTimer",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to timer"
          },
          {
            "name": "dueTime",
            "type": "long",
            "optional": false,
            "description": "timer due time"
          },
          {
            "name": "period",
            "type": "int",
            "optional": false,
            "description": "timer interval"
          },
          {
            "name": "func",
            "type": "object",
            "optional": false,
            "description": "completion routine - must be None"
          },
          {
            "name": "param",
            "type": "object",
            "optional": false,
            "description": "completion routine parameter - must be None"
          },
          {
            "name": "resume_state",
            "type": "bool",
            "optional": false,
            "description": "resume state"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__SetWaitableTimer_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32event::WaitForInputIdle": {
    "kind": "function",
    "signatures": [
      {
        "name": "WaitForInputIdle",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle of process to wait for"
          },
          {
            "name": "milliseconds",
            "type": "int",
            "optional": false,
            "description": "time-out interval in milliseconds"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32event__WaitForInputIdle_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32event.pyi"
    ]
  },
  "win32file::CreateFile": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateFile",
        "parameters": [
          {
            "name": "fileName",
            "type": "PyUnicode",
            "optional": false,
            "description": "The name of the file"
          },
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "access (read-write) mode Specifies the type of access to the object. An application can obtain read access, write access, read-write access, or device query access. This parameter can be any combination of the following values."
          },
          {
            "name": "shareMode",
            "type": "int",
            "optional": false,
            "description": "Set of bit flags that specifies how the object can be shared. If dwShareMode is 0, the object cannot be shared. Subsequent open operations on the object will fail, until the handle is closed. To share the object, use a combination of one or more of the following values:"
          },
          {
            "name": "attributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": "The security attributes, or None"
          },
          {
            "name": "CreationDisposition",
            "type": "int",
            "optional": false,
            "description": "Specifies which action to take on files that exist, and which action to take when files do not exist. For more information about this parameter, see the Remarks section. This parameter must be one of the following values:"
          },
          {
            "name": "flagsAndAttributes",
            "type": "int",
            "optional": false,
            "description": "file attributes"
          },
          {
            "name": "hTemplateFile",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Specifies a handle with GENERIC_READ access to a template file. The template file supplies file attributes and extended attributes for the file being created. Under Win95, this must be 0, else an exception will be raised."
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__CreateFile_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::ReadFile": {
    "kind": "function",
    "signatures": [
      {
        "name": "ReadFile",
        "parameters": [
          {
            "name": "hFile",
            "type": "PyHANDLE | int",
            "optional": false,
            "description": "Handle to the file"
          },
          {
            "name": "bufSize",
            "type": "int",
            "optional": false
          }
        ],
        "returns": "tuple[int, string]"
      },
      {
        "name": "ReadFile",
        "parameters": [
          {
            "name": "hFile",
            "type": "PyHANDLE | int",
            "optional": false,
            "description": "Handle to the file"
          },
          {
            "name": "buffer",
            "type": "PyOVERLAPPEDReadBuffer",
            "optional": false
          },
          {
            "name": "overlapped",
            "type": "PyOVERLAPPED",
            "optional": true,
            "description": "An overlapped structure"
          }
        ],
        "returns": "tuple[int, string]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__ReadFile_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::WriteFile": {
    "kind": "function",
    "signatures": [
      {
        "name": "WriteFile",
        "parameters": [
          {
            "name": "hFile",
            "type": "PyHANDLE | int",
            "optional": false,
            "description": "Handle to the file"
          },
          {
            "name": "data",
            "type": "string | PyOVERLAPPEDReadBuffer",
            "optional": false,
            "description": "The data to write."
          },
          {
            "name": "ol",
            "type": "PyOVERLAPPED",
            "optional": true,
            "description": "An overlapped structure"
          }
        ],
        "returns": "tuple[int, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__WriteFile_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::FlushFileBuffers": {
    "kind": "function",
    "signatures": [
      {
        "name": "FlushFileBuffers",
        "parameters": [
          {
            "name": "hFile",
            "type": "PyHANDLE",
            "optional": false,
            "description": "open handle to file whose buffers are to be flushed"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__FlushFileBuffers_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::GetFileInformationByHandle": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetFileInformationByHandle",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE | int",
            "optional": false,
            "description": "Handle to the file for which to obtain information. This handle should not be a pipe handle. The GetFileInformationByHandle function does not work with pipe handles."
          }
        ],
        "returns": "tuple"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__GetFileInformationByHandle_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::GetFinalPathNameByHandle": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetFinalPathNameByHandle",
        "parameters": [
          {
            "name": "File",
            "type": "PyHANDLE",
            "optional": false,
            "description": "An open file handle"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": false,
            "description": "Specifies type of path to return. (win32con.FILE_NAME_NORMALIZED,FILE_NAME_OPENED,VOLUME_NAME_DOS,VOLUME_NAME_GUID,VOLUME_NAME_NONE,VOLUME_NAME_NT)"
          }
        ],
        "returns": "PyUnicode"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__GetFinalPathNameByHandle_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::GetFileSize": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetFileSize",
        "parameters": [],
        "returns": "long"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__GetFileSize_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::GetFileTime": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetFileTime",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to the file."
          },
          {
            "name": "creationTime",
            "type": "PyTime",
            "optional": false,
            "description": ""
          },
          {
            "name": "accessTime",
            "type": "PyTime",
            "optional": false,
            "description": ""
          },
          {
            "name": "writeTime",
            "type": "PyTime",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "tuple[PyTime, PyTime, PyTime]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__GetFileTime_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::SetFilePointer": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetFilePointer",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The file to perform the operation on."
          },
          {
            "name": "offset",
            "type": "Py_LARGEINTEGER",
            "optional": false,
            "description": "Offset to move the file pointer."
          },
          {
            "name": "moveMethod",
            "type": "int",
            "optional": false,
            "description": "Starting point for the file pointer move. This parameter can be one of the following values."
          }
        ],
        "returns": "None"
      },
      {
        "name": "SetFilePointer",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The file to perform the operation on."
          },
          {
            "name": "offset",
            "type": "Py_LARGEINTEGER",
            "optional": false,
            "description": "Offset to move the file pointer."
          },
          {
            "name": "moveMethod",
            "type": "int",
            "optional": false,
            "description": "Starting point for the file pointer move. This parameter can be one of the following values."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__SetFilePointer_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::SetEndOfFile": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetEndOfFile",
        "parameters": [
          {
            "name": "hFile",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle of file whose EOF is to be set"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__SetEndOfFile_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::GetFileAttributes": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetFileAttributes",
        "parameters": [
          {
            "name": "fileName",
            "type": "PyUnicode",
            "optional": false,
            "description": "Name of the file to retrieve attributes for."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__GetFileAttributes_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::SetFileAttributes": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetFileAttributes",
        "parameters": [
          {
            "name": "filename",
            "type": "PyUnicode",
            "optional": false,
            "description": "filename"
          },
          {
            "name": "newAttributes",
            "type": "int",
            "optional": false,
            "description": "attributes to set"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__SetFileAttributes_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::FindFilesIterator": {
    "kind": "function",
    "signatures": [
      {
        "name": "FindFilesIterator",
        "parameters": [
          {
            "name": "FileName",
            "type": "string",
            "optional": false,
            "description": "A string that specifies a valid directory or path and filename, which can contain wildcard characters (* and ?)."
          },
          {
            "name": "Transaction",
            "type": "PyHANDLE",
            "optional": true,
            "description": "Handle to a transaction, can be None. If this parameter is not None, FindFirstFileTransacted will be called to perform a transacted search"
          }
        ],
        "returns": "iterator"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__FindFilesIterator_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::FindStreams": {
    "kind": "function",
    "signatures": [
      {
        "name": "FindStreams",
        "parameters": [
          {
            "name": "FileName",
            "type": "PyUnicode",
            "optional": false,
            "description": "Name of file (or directory) to operate on"
          },
          {
            "name": "Transaction",
            "type": "PyHANDLE",
            "optional": true,
            "description": "Handle to a transaction, can be None"
          }
        ],
        "returns": "tuple[[(long, PyUnicode),...]]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__FindStreams_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::FindFirstChangeNotification": {
    "kind": "function",
    "signatures": [
      {
        "name": "FindFirstChangeNotification",
        "parameters": [
          {
            "name": "pathName",
            "type": "PyUnicode",
            "optional": false,
            "description": "Name of directory to watch"
          },
          {
            "name": "bWatchSubtree",
            "type": "int",
            "optional": false,
            "description": "flag for monitoring directory or directory tree"
          },
          {
            "name": "notifyFilter",
            "type": "int",
            "optional": false,
            "description": "filter conditions to watch for. See win32api::FindFirstChangeNotification for details."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__FindFirstChangeNotification_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::ReadDirectoryChangesW": {
    "kind": "function",
    "signatures": [
      {
        "name": "ReadDirectoryChangesW",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to the directory to be monitored. This directory must be opened with the FILE_LIST_DIRECTORY access right."
          },
          {
            "name": "size",
            "type": "int",
            "optional": false,
            "description": "Size of the buffer to allocate for the results."
          },
          {
            "name": "bWatchSubtree",
            "type": "int",
            "optional": false,
            "description": "Specifies whether the ReadDirectoryChangesW function will monitor the directory or the directory tree. If TRUE is specified, the function monitors the directory tree rooted at the specified directory. If FALSE is specified, the function monitors only the directory specified by the hDirectory parameter."
          },
          {
            "name": "dwNotifyFilter",
            "type": "int",
            "optional": false,
            "description": "Specifies filter criteria the function checks to determine if the wait operation has completed. This parameter can be one or more of the FILE_NOTIFY_CHANGE_* values."
          },
          {
            "name": "overlapped",
            "type": "PyOVERLAPPED",
            "optional": true,
            "description": "An overlapped object. The directory must also be opened with FILE_FLAG_OVERLAPPED."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__ReadDirectoryChangesW_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::DeviceIoControl": {
    "kind": "function",
    "signatures": [
      {
        "name": "DeviceIoControl",
        "parameters": [
          {
            "name": "Device",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to a file, device, or volume"
          },
          {
            "name": "IoControlCode",
            "type": "int",
            "optional": false,
            "description": "IOControl Code to use, from winioctlcon"
          },
          {
            "name": "InBuffer",
            "type": "str | buffer",
            "optional": false,
            "description": "The input data for the operation, can be None for some operations."
          },
          {
            "name": "OutBuffer",
            "type": "int | buffer",
            "optional": false,
            "description": "Size of the buffer to allocate for output, or a writeable buffer as returned by win32file::AllocateReadBuffer ."
          },
          {
            "name": "Overlapped",
            "type": "PyOVERLAPPED",
            "optional": true,
            "description": "An overlapped object for async operations. Device handle must have been opened with FILE_FLAG_OVERLAPPED."
          }
        ],
        "returns": "str | buffer"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__DeviceIoControl_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::GetOverlappedResult": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetOverlappedResult",
        "parameters": [
          {
            "name": "hFile",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the pipe or file"
          },
          {
            "name": "overlapped",
            "type": "PyOVERLAPPED",
            "optional": false,
            "description": "The overlapped object to check."
          },
          {
            "name": "bWait",
            "type": "int",
            "optional": false,
            "description": "Indicates if the function should wait for data to become available."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__GetOverlappedResult_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::Wow64DisableWow64FsRedirection": {
    "kind": "function",
    "signatures": [
      {
        "name": "Wow64DisableWow64FsRedirection",
        "parameters": [],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__Wow64DisableWow64FsRedirection_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32file::QueryDosDevice": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryDosDevice",
        "parameters": [
          {
            "name": "DeviceName",
            "type": "string",
            "optional": false,
            "description": "Name of device to query, or None to return all defined devices"
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32file__QueryDosDevice_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32file.pyi"
    ]
  },
  "win32pipe::CreatePipe": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreatePipe",
        "parameters": [
          {
            "name": "sa",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": ""
          },
          {
            "name": "nSize",
            "type": "int",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "tuple[PyHANDLE, PyHANDLE]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__CreatePipe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::CreateNamedPipe": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateNamedPipe",
        "parameters": [
          {
            "name": "pipeName",
            "type": "PyUnicode",
            "optional": false,
            "description": "The name of the pipe"
          },
          {
            "name": "openMode",
            "type": "int",
            "optional": false,
            "description": "OpenMode of the pipe"
          },
          {
            "name": "pipeMode",
            "type": "int",
            "optional": false,
            "description": ""
          },
          {
            "name": "nMaxInstances",
            "type": "int",
            "optional": false,
            "description": ""
          },
          {
            "name": "nOutBufferSize",
            "type": "int",
            "optional": false,
            "description": ""
          },
          {
            "name": "nInBufferSize",
            "type": "int",
            "optional": false,
            "description": ""
          },
          {
            "name": "nDefaultTimeOut",
            "type": "int",
            "optional": false,
            "description": ""
          },
          {
            "name": "sa",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__CreateNamedPipe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::ConnectNamedPipe": {
    "kind": "function",
    "signatures": [
      {
        "name": "ConnectNamedPipe",
        "parameters": [
          {
            "name": "hPipe",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the pipe."
          },
          {
            "name": "overlapped",
            "type": "PyOVERLAPPED",
            "optional": true,
            "description": "An overlapped object to use, else None"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__ConnectNamedPipe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::DisconnectNamedPipe": {
    "kind": "function",
    "signatures": [
      {
        "name": "DisconnectNamedPipe",
        "parameters": [
          {
            "name": "hFile",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the pipe to disconnect."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__DisconnectNamedPipe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::WaitNamedPipe": {
    "kind": "function",
    "signatures": [
      {
        "name": "WaitNamedPipe",
        "parameters": [
          {
            "name": "pipeName",
            "type": "PyUnicode",
            "optional": false,
            "description": "The name of the pipe"
          },
          {
            "name": "timeout",
            "type": "int",
            "optional": false,
            "description": "The number of milliseconds the function will wait. instead of a literal value, you can specify one of the following values for the timeout:"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__WaitNamedPipe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::SetNamedPipeHandleState": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetNamedPipeHandleState",
        "parameters": [
          {
            "name": "hPipe",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the pipe."
          },
          {
            "name": "Mode",
            "type": "int | None",
            "optional": false,
            "description": "The pipe read mode."
          },
          {
            "name": "MaxCollectionCount",
            "type": "int | None",
            "optional": false,
            "description": "Maximum bytes collected before transmission to the server."
          },
          {
            "name": "CollectDataTimeout",
            "type": "int | None",
            "optional": false,
            "description": "Maximum time to wait, in milliseconds, before transmission to server."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__SetNamedPipeHandleState_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::GetNamedPipeHandleState": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetNamedPipeHandleState",
        "parameters": [
          {
            "name": "hPipe",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the pipe."
          },
          {
            "name": "bGetCollectionData",
            "type": "int",
            "optional": true,
            "description": "Determines of the collection data should be returned. If not, None is returned in their place."
          }
        ],
        "returns": "tuple[(int, int, int | None, int | None, PyUnicode]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__GetNamedPipeHandleState_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::GetNamedPipeInfo": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetNamedPipeInfo",
        "parameters": [
          {
            "name": "hNamedPipe",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to a named pipe"
          }
        ],
        "returns": "tuple[int, int, int, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__GetNamedPipeInfo_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::PeekNamedPipe": {
    "kind": "function",
    "signatures": [
      {
        "name": "PeekNamedPipe",
        "parameters": [
          {
            "name": "hPipe",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the pipe."
          },
          {
            "name": "size",
            "type": "int",
            "optional": false,
            "description": "The size of the buffer."
          }
        ],
        "returns": "tuple[string, int, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__PeekNamedPipe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::CallNamedPipe": {
    "kind": "function",
    "signatures": [
      {
        "name": "CallNamedPipe",
        "parameters": [
          {
            "name": "pipeName",
            "type": "PyUNICODE",
            "optional": false,
            "description": "The name of the pipe."
          },
          {
            "name": "data",
            "type": "string",
            "optional": false,
            "description": "The data to write."
          },
          {
            "name": "bufSize",
            "type": "int",
            "optional": false,
            "description": "The size of the result buffer to allocate for the read."
          },
          {
            "name": "timeOut",
            "type": "int",
            "optional": false,
            "description": "Specifies the number of milliseconds to wait for the named pipe to be available. In addition to numeric values, the following special values can be specified."
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__CallNamedPipe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::TransactNamedPipe": {
    "kind": "function",
    "signatures": [
      {
        "name": "TransactNamedPipe",
        "parameters": [
          {
            "name": "pipeName",
            "type": "PyUNICODE",
            "optional": false,
            "description": "The name of the pipe."
          },
          {
            "name": "writeData",
            "type": "string | buffer",
            "optional": false,
            "description": "The data to write to the pipe."
          },
          {
            "name": "buffer_bufSize",
            "type": "PyOVERLAPPEDReadBuffer",
            "optional": false
          },
          {
            "name": "overlapped",
            "type": "PyOVERLAPPED",
            "optional": true,
            "description": "An overlapped structure or None"
          }
        ],
        "returns": "string | buffer"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__TransactNamedPipe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::GetNamedPipeClientProcessId": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetNamedPipeClientProcessId",
        "parameters": [
          {
            "name": "hPipe",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the pipe."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__GetNamedPipeClientProcessId_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32pipe::GetNamedPipeServerProcessId": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetNamedPipeServerProcessId",
        "parameters": [
          {
            "name": "hPipe",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the pipe."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32pipe__GetNamedPipeServerProcessId_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32pipe.pyi"
    ]
  },
  "win32security::OpenProcessToken": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenProcessToken",
        "parameters": [
          {
            "name": "processHandle",
            "type": "int",
            "optional": false,
            "description": "The handle of the process to open."
          },
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "Desired access to process"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__OpenProcessToken_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::OpenThreadToken": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenThreadToken",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "handle to thread"
          },
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "access to process"
          },
          {
            "name": "openAsSelf",
            "type": "int",
            "optional": false,
            "description": "Flag for process or thread security"
          }
        ],
        "returns": "PyHandle"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__OpenThreadToken_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::GetTokenInformation": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetTokenInformation",
        "parameters": [
          {
            "name": "TokenHandle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to an access token."
          },
          {
            "name": "TokenInformationClass",
            "type": "int",
            "optional": false,
            "description": "Specifies a value from the TOKEN_INFORMATION_CLASS enumerated type identifying the type of information the function retrieves."
          }
        ],
        "returns": "object"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__GetTokenInformation_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::LookupAccountName": {
    "kind": "function",
    "signatures": [
      {
        "name": "LookupAccountName",
        "parameters": [
          {
            "name": "systemName",
            "type": "string",
            "optional": false,
            "description": "The system name, or None"
          },
          {
            "name": "accountName",
            "type": "string",
            "optional": false,
            "description": "The account name"
          }
        ],
        "returns": "tuple[PySID, string, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__LookupAccountName_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::LookupAccountSid": {
    "kind": "function",
    "signatures": [
      {
        "name": "LookupAccountSid",
        "parameters": [
          {
            "name": "systemName",
            "type": "string",
            "optional": false,
            "description": "The system name, or None"
          },
          {
            "name": "sid",
            "type": "PySID",
            "optional": false,
            "description": "The SID"
          }
        ],
        "returns": "tuple[string, string, int]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__LookupAccountSid_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::ConvertSidToStringSid": {
    "kind": "function",
    "signatures": [
      {
        "name": "ConvertSidToStringSid",
        "parameters": [
          {
            "name": "Sid",
            "type": "PySID",
            "optional": false,
            "description": "PySID object"
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__ConvertSidToStringSid_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::ConvertStringSidToSid": {
    "kind": "function",
    "signatures": [
      {
        "name": "ConvertStringSidToSid",
        "parameters": [
          {
            "name": "StringSid",
            "type": "string",
            "optional": false,
            "description": "String representation of a SID"
          }
        ],
        "returns": "PySID"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__ConvertStringSidToSid_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::CreateWellKnownSid": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateWellKnownSid",
        "parameters": [
          {
            "name": "WellKnownSidType",
            "type": "int",
            "optional": false,
            "description": "One of the Win*Sid constants"
          },
          {
            "name": "DomainSid",
            "type": "PySID",
            "optional": true,
            "description": "Domain for the new SID, or None for local machine"
          }
        ],
        "returns": "PySID"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__CreateWellKnownSid_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::CheckTokenMembership": {
    "kind": "function",
    "signatures": [
      {
        "name": "CheckTokenMembership",
        "parameters": [
          {
            "name": "TokenHandle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to an access token, current process token used if None"
          },
          {
            "name": "SidToCheck",
            "type": "PySID",
            "optional": false,
            "description": "Sid to be checked for presence in token"
          }
        ],
        "returns": "bool"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__CheckTokenMembership_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::LookupPrivilegeValue": {
    "kind": "function",
    "signatures": [
      {
        "name": "LookupPrivilegeValue",
        "parameters": [
          {
            "name": "systemName",
            "type": "string",
            "optional": false,
            "description": "String specifying the system, use None for local machine"
          },
          {
            "name": "privilegeName",
            "type": "string",
            "optional": false,
            "description": "String specifying the privilege (win32security.SE_*_NAME)"
          }
        ],
        "returns": "LARGE_INTEGER"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__LookupPrivilegeValue_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::AdjustTokenPrivileges": {
    "kind": "function",
    "signatures": [
      {
        "name": "AdjustTokenPrivileges",
        "parameters": [
          {
            "name": "TokenHandle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to an access token"
          },
          {
            "name": "bDisableAllPrivileges",
            "type": "int",
            "optional": false,
            "description": "Flag for disabling all privileges"
          },
          {
            "name": "NewState",
            "type": "PyTOKEN_PRIVILEGES",
            "optional": false,
            "description": "The new state, can be None if bDisableAllPrivileges is True"
          }
        ],
        "returns": "PyTOKEN_PRIVILEGES"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__AdjustTokenPrivileges_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::DuplicateTokenEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "DuplicateTokenEx",
        "parameters": [
          {
            "name": "ExistingToken",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Logon token opened with TOKEN_DUPLICATE access"
          },
          {
            "name": "ImpersonationLevel",
            "type": "int",
            "optional": false,
            "description": "One of win32security.Security* values"
          },
          {
            "name": "DesiredAccess",
            "type": "int",
            "optional": false,
            "description": "Type of access required for the handle, combination of win32security.TOKEN_* flags"
          },
          {
            "name": "TokenType",
            "type": "int",
            "optional": false,
            "description": "Type of token to be created, TokenPrimary or TokenImpersonation"
          },
          {
            "name": "TokenAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": true,
            "description": "Specifies security and inheritance for the new handle. None results in default DACL and no inheritance,"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__DuplicateTokenEx_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::CreateRestrictedToken": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateRestrictedToken",
        "parameters": [
          {
            "name": "ExistingTokenHandle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to an access token (see win32security::LogonUser , win32security::OpenProcessToken"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": false,
            "description": "Valid values are zero or a combination of DISABLE_MAX_PRIVILEGE and SANDBOX_INERT"
          },
          {
            "name": "SidsToDisable",
            "type": "tuple[PySID_AND_ATTRIBUTES,...]",
            "optional": false,
            "description": "Ssequence of PySID_AND_ATTRIBUTES tuples, or None"
          },
          {
            "name": "PrivilegesToDelete",
            "type": "tuple[PyLUID_AND_ATTRIBUTES,...]",
            "optional": false,
            "description": "Privilege LUIDS to remove from token (attributes are ignored), or None"
          },
          {
            "name": "SidsToRestrict",
            "type": "tuple[PySID_AND_ATTRIBUTES,...]",
            "optional": false,
            "description": "Sequence of PySID_AND_ATTRIBUTES tuples (attributes must be 0). Can be None."
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__CreateRestrictedToken_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::ImpersonateLoggedOnUser": {
    "kind": "function",
    "signatures": [
      {
        "name": "ImpersonateLoggedOnUser",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to a token that represents a logged-on user"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__ImpersonateLoggedOnUser_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::ImpersonateNamedPipeClient": {
    "kind": "function",
    "signatures": [
      {
        "name": "ImpersonateNamedPipeClient",
        "parameters": [
          {
            "name": "handle",
            "type": "int",
            "optional": false,
            "description": "handle of a named pipe."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__ImpersonateNamedPipeClient_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::RevertToSelf": {
    "kind": "function",
    "signatures": [
      {
        "name": "RevertToSelf",
        "parameters": [],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__RevertToSelf_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::GetNamedSecurityInfo": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetNamedSecurityInfo",
        "parameters": [
          {
            "name": "ObjectName",
            "type": "str | unicode",
            "optional": false,
            "description": "Name of object"
          },
          {
            "name": "ObjectType",
            "type": "int",
            "optional": false,
            "description": "Value from SE_OBJECT_TYPE enum"
          },
          {
            "name": "SecurityInfo",
            "type": "int",
            "optional": false,
            "description": "Combination of SECURITY_INFORMATION constants"
          }
        ],
        "returns": "PySECURITY_DESCRIPTOR"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__GetNamedSecurityInfo_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::SetNamedSecurityInfo": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetNamedSecurityInfo",
        "parameters": [
          {
            "name": "ObjectName",
            "type": "str | unicode",
            "optional": false,
            "description": "Name of object"
          },
          {
            "name": "ObjectType",
            "type": "int",
            "optional": false,
            "description": "Value from SE_OBJECT_TYPE enum"
          },
          {
            "name": "SecurityInfo",
            "type": "int",
            "optional": false,
            "description": "Combination of SECURITY_INFORMATION constants"
          },
          {
            "name": "Owner",
            "type": "PySID",
            "optional": false,
            "description": "Sid to set as owner of object, can be None"
          },
          {
            "name": "Group",
            "type": "PySID",
            "optional": false,
            "description": "Group Sid, can be None"
          },
          {
            "name": "Dacl",
            "type": "PyACL",
            "optional": false,
            "description": "Discretionary ACL to set for object, can be None"
          },
          {
            "name": "Sacl",
            "type": "PyACL",
            "optional": false,
            "description": "System Audit ACL to set for object, can be None"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__SetNamedSecurityInfo_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::GetSecurityInfo": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetSecurityInfo",
        "parameters": [
          {
            "name": "handle",
            "type": "int | PyHANDLE",
            "optional": false,
            "description": "Handle to object"
          },
          {
            "name": "ObjectType",
            "type": "int",
            "optional": false,
            "description": "Value from SE_OBJECT_TYPE enum"
          },
          {
            "name": "SecurityInfo",
            "type": "int",
            "optional": false,
            "description": "Combination of SECURITY_INFORMATION constants"
          }
        ],
        "returns": "PySECURITY_DESCRIPTOR"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__GetSecurityInfo_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::SetSecurityInfo": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetSecurityInfo",
        "parameters": [
          {
            "name": "handle",
            "type": "int | PyHANDLE",
            "optional": false,
            "description": "Handle to object"
          },
          {
            "name": "ObjectType",
            "type": "int",
            "optional": false,
            "description": "Value from SE_OBJECT_TYPE enum"
          },
          {
            "name": "SecurityInfo",
            "type": "int",
            "optional": false,
            "description": "Combination of SECURITY_INFORMATION constants"
          },
          {
            "name": "Owner",
            "type": "PySID",
            "optional": false,
            "description": "Sid to set as owner of object, can be None"
          },
          {
            "name": "Group",
            "type": "PySID",
            "optional": false,
            "description": "Group Sid, can be None"
          },
          {
            "name": "Dacl",
            "type": "PyACL",
            "optional": false,
            "description": "Discretionary ACL to set for object, can be None"
          },
          {
            "name": "Sacl",
            "type": "PyACL",
            "optional": false,
            "description": "System Audit ACL to set for object, can be None"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__SetSecurityInfo_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::GetFileSecurity": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetFileSecurity",
        "parameters": [
          {
            "name": "filename",
            "type": "string",
            "optional": false,
            "description": "The name of the file"
          },
          {
            "name": "info",
            "type": "int",
            "optional": true,
            "description": "Flags that specify the information requested."
          }
        ],
        "returns": "PySECURITY_DESCRIPTOR"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__GetFileSecurity_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::ACL": {
    "kind": "function",
    "signatures": [
      {
        "name": "ACL",
        "parameters": [
          {
            "name": "bufSize",
            "type": "int",
            "optional": true,
            "description": "The size of the buffer for the ACL."
          }
        ],
        "returns": "PyACL"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__ACL_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::SECURITY_ATTRIBUTES": {
    "kind": "function",
    "signatures": [
      {
        "name": "SECURITY_ATTRIBUTES",
        "parameters": [],
        "returns": "PySECURITY_ATTRIBUTES"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__SECURITY_ATTRIBUTES_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::SECURITY_DESCRIPTOR": {
    "kind": "function",
    "signatures": [
      {
        "name": "SECURITY_DESCRIPTOR",
        "parameters": [],
        "returns": "PySECURITY_DESCRIPTOR"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__SECURITY_DESCRIPTOR_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::ConvertSecurityDescriptorToStringSecurityDescriptor": {
    "kind": "function",
    "signatures": [
      {
        "name": "ConvertSecurityDescriptorToStringSecurityDescriptor",
        "parameters": [
          {
            "name": "SecurityDescriptor",
            "type": "PySECURITY_DESCRIPTOR",
            "optional": false,
            "description": "PySECURITY_DESCRIPTOR object"
          },
          {
            "name": "RequestedStringSDRevision",
            "type": "int",
            "optional": false,
            "description": "Only SDDL_REVISION_1 currently valid"
          },
          {
            "name": "SecurityInformation",
            "type": "int",
            "optional": false,
            "description": "Combination of bit flags from SECURITY_INFORMATION enum"
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__ConvertSecurityDescriptorToStringSecurityDescriptor_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::LogonUser": {
    "kind": "function",
    "signatures": [
      {
        "name": "LogonUser",
        "parameters": [
          {
            "name": "Username",
            "type": "PyUnicode",
            "optional": false,
            "description": "The name of the user account to log on to. This may also be a marshalled credential (see win32cred::CredMarshalCredential )."
          },
          {
            "name": "Domain",
            "type": "PyUnicode",
            "optional": false,
            "description": "The name of the domain, or None for the current domain"
          },
          {
            "name": "Password",
            "type": "PyUnicode",
            "optional": false,
            "description": "User's password. Use a blank string if Username contains a marshalled credential."
          },
          {
            "name": "LogonType",
            "type": "int",
            "optional": false,
            "description": "One of LOGON32_LOGON_* values"
          },
          {
            "name": "LogonProvider",
            "type": "int",
            "optional": false,
            "description": "One of LOGON32_PROVIDER_* values"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__LogonUser_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::LsaEnumerateLogonSessions": {
    "kind": "function",
    "signatures": [
      {
        "name": "LsaEnumerateLogonSessions",
        "parameters": [],
        "returns": "tuple[long,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__LsaEnumerateLogonSessions_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32security::LsaGetLogonSessionData": {
    "kind": "function",
    "signatures": [
      {
        "name": "LsaGetLogonSessionData",
        "parameters": [
          {
            "name": "LogonId",
            "type": "PyLARGE_INTEGER",
            "optional": false,
            "description": "An LUID identifying a logon session"
          }
        ],
        "returns": "tuple[dict,...]"
      },
      {
        "name": "LsaGetLogonSessionData",
        "parameters": [
          {
            "name": "LogonId",
            "type": "PyLARGE_INTEGER",
            "optional": false,
            "description": "An LUID identifying a logon session"
          }
        ],
        "returns": "tuple[dict,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32security__LsaGetLogonSessionData_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32security.pyi"
    ]
  },
  "win32service::OpenSCManager": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenSCManager",
        "parameters": [
          {
            "name": "machineName",
            "type": "PyUnicode",
            "optional": false,
            "description": "The name of the computer, or None"
          },
          {
            "name": "dbName",
            "type": "PyUnicode",
            "optional": false,
            "description": "The name of the service database, or None"
          },
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "The access desired. (combination of win32service.SC_MANAGER_* flags)"
          }
        ],
        "returns": "PySC_HANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__OpenSCManager_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::CloseServiceHandle": {
    "kind": "function",
    "signatures": [
      {
        "name": "CloseServiceHandle",
        "parameters": [
          {
            "name": "scHandle",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to close"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__CloseServiceHandle_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::EnumServicesStatusEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumServicesStatusEx",
        "parameters": [
          {
            "name": "SCManager",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to service control manager as returned by win32service::OpenSCManager"
          },
          {
            "name": "ServiceType",
            "type": "int",
            "optional": true,
            "description": "Types of services to enumerate (SERVICE_DRIVER and/or SERVICE_WIN32)"
          },
          {
            "name": "ServiceState",
            "type": "int",
            "optional": true,
            "description": "Limits to services in specified state"
          },
          {
            "name": "InfoLevel",
            "type": "int",
            "optional": true,
            "description": "Currently SC_ENUM_PROCESS_INFO is only level defined"
          },
          {
            "name": "GroupName",
            "type": "str",
            "optional": true,
            "description": "Name of group - use None for all, or '' for services that don't belong to a group"
          }
        ],
        "returns": "tuple[dict,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__EnumServicesStatusEx_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::OpenService": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenService",
        "parameters": [
          {
            "name": "scHandle",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to the Service Control Mananger"
          },
          {
            "name": "name",
            "type": "PyUnicode",
            "optional": false,
            "description": "The name of the service to open."
          },
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "The access desired."
          }
        ],
        "returns": "PySC_HANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__OpenService_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::QueryServiceStatusEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryServiceStatusEx",
        "parameters": [
          {
            "name": "hService",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to service to be queried"
          }
        ],
        "returns": "SERVICE_STATUS"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__QueryServiceStatusEx_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::QueryServiceConfig": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryServiceConfig",
        "parameters": [
          {
            "name": "hService",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Service handle as returned by win32service::OpenService"
          }
        ],
        "returns": "tuple"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__QueryServiceConfig_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::QueryServiceConfig2": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryServiceConfig2",
        "parameters": [
          {
            "name": "hService",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Service handle as returned by win32service::OpenService"
          },
          {
            "name": "InfoLevel",
            "type": "int",
            "optional": false,
            "description": "One of win32service.SERVICE_CONFIG_* values"
          }
        ],
        "returns": "object"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__QueryServiceConfig2_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::StartService": {
    "kind": "function",
    "signatures": [
      {
        "name": "StartService",
        "parameters": [
          {
            "name": "hService",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to the service to be started"
          },
          {
            "name": "args",
            "type": "tuple[[string, ...]]",
            "optional": false,
            "description": "Arguments to the service."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__StartService_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::ControlService": {
    "kind": "function",
    "signatures": [
      {
        "name": "ControlService",
        "parameters": [
          {
            "name": "scHandle",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to control"
          },
          {
            "name": "code",
            "type": "int",
            "optional": false,
            "description": "The service control code."
          }
        ],
        "returns": "SERVICE_STATUS"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__ControlService_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::EnumDependentServices": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumDependentServices",
        "parameters": [
          {
            "name": "hService",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to service for which to list dependent services (as returned by win32service::OpenService )"
          },
          {
            "name": "ServiceState",
            "type": "int",
            "optional": true,
            "description": "Limits to services in specified state - One of SERVICE_STATE_ALL, SERVICE_ACTIVE, SERVICE_INACTIVE"
          }
        ],
        "returns": "tuple[tuple,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__EnumDependentServices_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::CreateService": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateService",
        "parameters": [
          {
            "name": "scHandle",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "handle to service control manager database"
          },
          {
            "name": "name",
            "type": "PyUnicode",
            "optional": false,
            "description": "Name of service"
          },
          {
            "name": "displayName",
            "type": "PyUnicode",
            "optional": false,
            "description": "Display name"
          },
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": "type of access to service"
          },
          {
            "name": "serviceType",
            "type": "int",
            "optional": false,
            "description": "type of service"
          },
          {
            "name": "startType",
            "type": "int",
            "optional": false,
            "description": "When/how to start service"
          },
          {
            "name": "errorControl",
            "type": "int",
            "optional": false,
            "description": "severity if service fails to start"
          },
          {
            "name": "binaryFile",
            "type": "PyUnicode",
            "optional": false,
            "description": "name of binary file"
          },
          {
            "name": "loadOrderGroup",
            "type": "PyUnicode",
            "optional": false,
            "description": "name of load ordering group , or None"
          },
          {
            "name": "bFetchTag",
            "type": "int",
            "optional": false,
            "description": "Should the tag be fetched and returned? If TRUE, the result is a tuple of (handle, tag), otherwise just handle."
          },
          {
            "name": "serviceDeps",
            "type": "tuple[[ PyUnicode,...]]",
            "optional": false,
            "description": "sequence of dependency names"
          },
          {
            "name": "acctName",
            "type": "PyUnicode",
            "optional": false,
            "description": "account name of service, or None"
          },
          {
            "name": "password",
            "type": "PyUnicode",
            "optional": false,
            "description": "password for service account , or None"
          }
        ],
        "returns": "tuple[PySC_HANDLE | (PySC_HANDLE, int)]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__CreateService_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::DeleteService": {
    "kind": "function",
    "signatures": [
      {
        "name": "DeleteService",
        "parameters": [
          {
            "name": "scHandle",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to service to be deleted"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__DeleteService_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::ChangeServiceConfig": {
    "kind": "function",
    "signatures": [
      {
        "name": "ChangeServiceConfig",
        "parameters": [
          {
            "name": "hService",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "handle to service to be modified"
          },
          {
            "name": "serviceType",
            "type": "int",
            "optional": false,
            "description": "type of service, or SERVICE_NO_CHANGE"
          },
          {
            "name": "startType",
            "type": "int",
            "optional": false,
            "description": "When/how to start service, or SERVICE_NO_CHANGE"
          },
          {
            "name": "errorControl",
            "type": "int",
            "optional": false,
            "description": "severity if service fails to start, or SERVICE_NO_CHANGE"
          },
          {
            "name": "binaryFile",
            "type": "PyUnicode",
            "optional": false,
            "description": "name of binary file, or None"
          },
          {
            "name": "loadOrderGroup",
            "type": "PyUnicode",
            "optional": false,
            "description": "name of load ordering group , or None"
          },
          {
            "name": "bFetchTag",
            "type": "int",
            "optional": false,
            "description": "Should the tag be fetched and returned? If TRUE, the result is the tag, else None."
          },
          {
            "name": "serviceDeps",
            "type": "tuple[[ PyUnicode,...]]",
            "optional": false,
            "description": "sequence of dependency names"
          },
          {
            "name": "acctName",
            "type": "PyUnicode",
            "optional": false,
            "description": "account name of service, or None"
          },
          {
            "name": "password",
            "type": "PyUnicode",
            "optional": false,
            "description": "password for service account , or None"
          },
          {
            "name": "displayName",
            "type": "PyUnicode",
            "optional": false,
            "description": "Display name"
          }
        ],
        "returns": "int | None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__ChangeServiceConfig_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::QueryServiceObjectSecurity": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryServiceObjectSecurity",
        "parameters": [
          {
            "name": "Handle",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Service handle"
          },
          {
            "name": "SecurityInformation",
            "type": "int",
            "optional": false,
            "description": "Type of infomation to retrieve, combination of values from SECURITY_INFORMATION enum"
          }
        ],
        "returns": "PySECURITY_DESCRIPTOR"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__QueryServiceObjectSecurity_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::SetServiceObjectSecurity": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetServiceObjectSecurity",
        "parameters": [
          {
            "name": "Handle",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Service handle"
          },
          {
            "name": "SecurityInformation",
            "type": "int",
            "optional": false,
            "description": "Type of infomation to set, combination of values from SECURITY_INFORMATION enum"
          },
          {
            "name": "SecurityDescriptor",
            "type": "PySECURITY_DESCRIPTOR",
            "optional": false,
            "description": "PySECURITY_DESCRIPTOR containing infomation to set"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__SetServiceObjectSecurity_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::GetServiceKeyName": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetServiceKeyName",
        "parameters": [
          {
            "name": "hSCManager",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to service control manager as returned by win32service::OpenSCManager"
          },
          {
            "name": "DisplayName",
            "type": "PyUNICODE",
            "optional": false,
            "description": "Display name of a service"
          }
        ],
        "returns": "PyUNICODE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__GetServiceKeyName_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32service::GetServiceDisplayName": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetServiceDisplayName",
        "parameters": [
          {
            "name": "hSCManager",
            "type": "PySC_HANDLE",
            "optional": false,
            "description": "Handle to service control manager as returned by win32service::OpenSCManager"
          },
          {
            "name": "ServiceName",
            "type": "PyUNICODE",
            "optional": false,
            "description": "Name of service"
          }
        ],
        "returns": "PyUNICODE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32service__GetServiceDisplayName_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32service.pyi"
    ]
  },
  "win32serviceutil::StartService": {
    "kind": "function",
    "signatures": [
      {
        "name": "StartService",
        "parameters": [
          {
            "name": "serviceName",
            "type": "object",
            "optional": false
          },
          {
            "name": "args",
            "type": "object | None",
            "optional": true
          },
          {
            "name": "machine",
            "type": "object | None",
            "optional": true
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/win32serviceutil.pyi"
    ]
  },
  "win32serviceutil::StopService": {
    "kind": "function",
    "signatures": [
      {
        "name": "StopService",
        "parameters": [
          {
            "name": "serviceName",
            "type": "object",
            "optional": false
          },
          {
            "name": "machine",
            "type": "object | None",
            "optional": true
          }
        ],
        "returns": "object (not annotated)"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/win32serviceutil.pyi"
    ]
  },
  "win32serviceutil::QueryServiceStatus": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryServiceStatus",
        "parameters": [
          {
            "name": "serviceName",
            "type": "object",
            "optional": false
          },
          {
            "name": "machine",
            "type": "object | None",
            "optional": true
          }
        ],
        "returns": "object (not annotated)"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/win32serviceutil.pyi"
    ]
  },
  "win32serviceutil::HandleCommandLine": {
    "kind": "function",
    "signatures": [
      {
        "name": "HandleCommandLine",
        "parameters": [
          {
            "name": "cls",
            "type": "type[ServiceFramework]",
            "optional": false
          },
          {
            "name": "serviceClassString",
            "type": "object | None",
            "optional": true
          },
          {
            "name": "argv",
            "type": "Sequence[str] | None",
            "optional": true
          },
          {
            "name": "customInstallOptions",
            "type": "str",
            "optional": true
          },
          {
            "name": "customOptionHandler",
            "type": "object | None",
            "optional": true
          }
        ],
        "returns": "object (not annotated)"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/win32serviceutil.pyi"
    ]
  },
  "win32serviceutil::LocateSpecificServiceExe": {
    "kind": "function",
    "signatures": [
      {
        "name": "LocateSpecificServiceExe",
        "parameters": [
          {
            "name": "serviceName",
            "type": "object",
            "optional": false
          }
        ],
        "returns": "object (not annotated)"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/win32serviceutil.pyi"
    ]
  },
  "pywintypes::HANDLE / PyHANDLE": {
    "kind": "function",
    "signatures": [
      {
        "name": "HANDLE",
        "parameters": [],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/pywintypes.pyi"
    ]
  },
  "pywintypes::OVERLAPPED": {
    "kind": "function",
    "signatures": [
      {
        "name": "OVERLAPPED",
        "parameters": [],
        "returns": "PyOVERLAPPED"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/pywintypes.pyi"
    ]
  },
  "pywintypes::SECURITY_ATTRIBUTES": {
    "kind": "function",
    "signatures": [
      {
        "name": "SECURITY_ATTRIBUTES",
        "parameters": [],
        "returns": "PySECURITY_ATTRIBUTES"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/pywintypes.pyi"
    ]
  },
  "pywintypes::SECURITY_DESCRIPTOR": {
    "kind": "function",
    "signatures": [
      {
        "name": "SECURITY_DESCRIPTOR",
        "parameters": [],
        "returns": "PySECURITY_DESCRIPTOR"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/pywintypes.pyi"
    ]
  },
  "pywintypes::SID": {
    "kind": "function",
    "signatures": [
      {
        "name": "SID",
        "parameters": [
          {
            "name": "buffer",
            "type": "object",
            "optional": false
          },
          {
            "name": "idAuthority",
            "type": "object",
            "optional": false
          },
          {
            "name": "subAuthorities",
            "type": "object",
            "optional": false
          },
          {
            "name": "bufSize",
            "type": "object",
            "optional": true
          }
        ],
        "returns": "PySID"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/pywintypes.pyi"
    ]
  },
  "pywintypes::Time": {
    "kind": "function",
    "signatures": [
      {
        "name": "Time",
        "parameters": [
          {
            "name": "timeRepr",
            "type": "SupportsInt | Sequence[SupportsInt] | TimeType",
            "optional": false
          }
        ],
        "returns": "TimeType"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/pywintypes.pyi"
    ]
  },
  "pywintypes::IID": {
    "kind": "function",
    "signatures": [
      {
        "name": "IID",
        "parameters": [
          {
            "name": "iidString",
            "type": "str",
            "optional": false
          },
          {
            "name": "is_bytes",
            "type": "bool",
            "optional": true
          }
        ],
        "returns": "PyIID"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/lib/pywintypes.pyi"
    ]
  },
  "win32evtlog::OpenEventLog": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenEventLog",
        "parameters": [
          {
            "name": "serverName",
            "type": "PyUnicode",
            "optional": false,
            "description": "The server name, or None"
          },
          {
            "name": "sourceName",
            "type": "PyUnicode",
            "optional": false,
            "description": "specifies the name of the source that the returned handle will reference. The source name must be a subkey of a logfile entry under the EventLog key in the registry."
          }
        ],
        "returns": "PyEVTLOG_HANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__OpenEventLog_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32evtlog.pyi"
    ]
  },
  "win32evtlog::ReadEventLog": {
    "kind": "function",
    "signatures": [
      {
        "name": "ReadEventLog",
        "parameters": [
          {
            "name": "Handle",
            "type": "Py_HANDLE",
            "optional": false,
            "description": "Handle to a an opened event log (see win32evtlog::OpenEventLog )"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": false,
            "description": "Reading flags"
          },
          {
            "name": "Offset",
            "type": "int",
            "optional": false,
            "description": "Record offset to read (in SEEK mode)."
          },
          {
            "name": "Size",
            "type": "int",
            "optional": true,
            "description": "Output buffer size."
          }
        ],
        "returns": "tuple[[object,...]]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__ReadEventLog_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32evtlog.pyi"
    ]
  },
  "win32evtlog::GetNumberOfEventLogRecords": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetNumberOfEventLogRecords",
        "parameters": [
          {
            "name": "handle",
            "type": "int",
            "optional": false,
            "description": "Handle to the event log to query."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__GetNumberOfEventLogRecords_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32evtlog.pyi"
    ]
  },
  "win32evtlog::NotifyChangeEventLog": {
    "kind": "function",
    "signatures": [
      {
        "name": "NotifyChangeEventLog",
        "parameters": [
          {
            "name": "handle",
            "type": "int",
            "optional": false,
            "description": "A handle to a Win32 event. This is the event that becomes signaled when an event is written to the event log file specified by the hEventLog parameter."
          },
          {
            "name": "handle1",
            "type": "object",
            "optional": false
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__NotifyChangeEventLog_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32evtlog.pyi"
    ]
  },
  "win32evtlog::EvtRender": {
    "kind": "function",
    "signatures": [
      {
        "name": "EvtRender",
        "parameters": [
          {
            "name": "Event",
            "type": "PyEVT_HANDLE",
            "optional": false,
            "description": "Handle to an event or bookmark"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": false,
            "description": "EvtRenderEventXml or EvtRenderBookmark indicating type of handle"
          },
          {
            "name": "Context",
            "type": "object",
            "optional": true
          }
        ],
        "returns": "str"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtRender_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32evtlog.pyi"
    ]
  },
  "win32evtlog::EvtSubscribe": {
    "kind": "function",
    "signatures": [
      {
        "name": "EvtSubscribe",
        "parameters": [
          {
            "name": "ChannelPath",
            "type": "str",
            "optional": false,
            "description": "Name of an event log channel"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": false,
            "description": "Combination of EvtSubscribe* flags determining how subscription is initiated"
          },
          {
            "name": "SignalEvent",
            "type": "Py_HANDLE",
            "optional": true,
            "description": "An event handle to be set when events are available (see win32event::CreateEvent )"
          },
          {
            "name": "Callback",
            "type": "function",
            "optional": true,
            "description": "Python function to be called with each event"
          },
          {
            "name": "Context",
            "type": "object",
            "optional": true,
            "description": "Arbitrary object to be passed to the callback function"
          },
          {
            "name": "Query",
            "type": "str",
            "optional": true,
            "description": "XML query used to select specific events, use None or '*' for all events"
          },
          {
            "name": "Session",
            "type": "PyEVT_HANDLE",
            "optional": true,
            "description": "Handle to a session on another machine, or None for local"
          },
          {
            "name": "Bookmark",
            "type": "PyEVT_HANDLE",
            "optional": true,
            "description": "If Flags contains EvtSubscribeStartAfterBookmark, used as starting point"
          }
        ],
        "returns": "PyEVT_HANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtSubscribe_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32evtlog.pyi"
    ]
  },
  "win32evtlog::EvtCreateBookmark": {
    "kind": "function",
    "signatures": [
      {
        "name": "EvtCreateBookmark",
        "parameters": [
          {
            "name": "BookmarkXML",
            "type": "str",
            "optional": true,
            "description": "XML representation of a bookmark as returned by win32evtlog::EvtRender , or None for a new bookmark"
          }
        ],
        "returns": "PyEVT_HANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtCreateBookmark_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32evtlog.pyi"
    ]
  },
  "win32evtlog::EvtUpdateBookmark": {
    "kind": "function",
    "signatures": [
      {
        "name": "EvtUpdateBookmark",
        "parameters": [
          {
            "name": "Bookmark",
            "type": "PyEVT_HANDLE",
            "optional": false,
            "description": "Handle to a bookmark"
          },
          {
            "name": "Event",
            "type": "PyEVT_HANDLE",
            "optional": false,
            "description": "Handle to an event"
          }
        ],
        "returns": "PyEVT_HANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtUpdateBookmark_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32evtlog.pyi"
    ]
  },
  "win32job::CreateJobObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateJobObject",
        "parameters": [
          {
            "name": "jobAttributes",
            "type": "PySECURITY_ATTRIBUTES",
            "optional": false,
            "description": ""
          },
          {
            "name": "name",
            "type": "unicode",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32job__CreateJobObject_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32job.pyi"
    ]
  },
  "win32job::OpenJobObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenJobObject",
        "parameters": [
          {
            "name": "desiredAccess",
            "type": "int",
            "optional": false,
            "description": ""
          },
          {
            "name": "inheritHandles",
            "type": "bool",
            "optional": false,
            "description": ""
          },
          {
            "name": "name",
            "type": "unicode",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32job__OpenJobObject_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32job.pyi"
    ]
  },
  "win32job::AssignProcessToJobObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "AssignProcessToJobObject",
        "parameters": [
          {
            "name": "hJob",
            "type": "PyHANDLE",
            "optional": false,
            "description": ""
          },
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32job__AssignProcessToJobObject_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32job.pyi"
    ]
  },
  "win32job::IsProcessInJob": {
    "kind": "function",
    "signatures": [
      {
        "name": "IsProcessInJob",
        "parameters": [
          {
            "name": "hProcess",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to a process"
          },
          {
            "name": "hJob",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to a job, use None to check if process is part of any job"
          }
        ],
        "returns": "boolean"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32job__IsProcessInJob_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32job.pyi"
    ]
  },
  "win32job::SetInformationJobObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetInformationJobObject",
        "parameters": [
          {
            "name": "Job",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to a job"
          },
          {
            "name": "JobObjectInfoClass",
            "type": "int",
            "optional": false,
            "description": "The type of data required, one of JobObject* values"
          },
          {
            "name": "JobObjectInfo",
            "type": "dict",
            "optional": false,
            "description": "Dictionary containing info to be set, as returned by win32job::QueryInformationJobObject"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32job__SetInformationJobObject_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32job.pyi"
    ]
  },
  "win32job::QueryInformationJobObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryInformationJobObject",
        "parameters": [
          {
            "name": "Job",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Handle to a job, use None for job that calling process is part of"
          },
          {
            "name": "JobObjectInfoClass",
            "type": "int",
            "optional": false,
            "description": "The type of data required, one of JobObject* values"
          }
        ],
        "returns": "dict"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32job__QueryInformationJobObject_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32job.pyi"
    ]
  },
  "win32job::TerminateJobObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "TerminateJobObject",
        "parameters": [
          {
            "name": "hJob",
            "type": "PyHANDLE",
            "optional": false,
            "description": ""
          },
          {
            "name": "exitCode",
            "type": "int",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32job__TerminateJobObject_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32job.pyi"
    ]
  },
  "win32gui::EnumWindows": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumWindows",
        "parameters": [
          {
            "name": "callback",
            "type": "function",
            "optional": false,
            "description": "A Python function to be used as the callback. Function can return False to stop enumeration, or raise an exception."
          },
          {
            "name": "extra",
            "type": "object",
            "optional": false,
            "description": "Any python object - this is passed to the callback function as the second param (first is the hwnd)."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__EnumWindows_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::EnumChildWindows": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumChildWindows",
        "parameters": [
          {
            "name": "hwnd",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the window to enumerate."
          },
          {
            "name": "callback",
            "type": "object",
            "optional": false,
            "description": "A Python function to be used as the callback."
          },
          {
            "name": "extra",
            "type": "object",
            "optional": false,
            "description": "Any python object - this is passed to the callback function as the second param (first is the hwnd)."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__EnumChildWindows_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::FindWindow": {
    "kind": "function",
    "signatures": [
      {
        "name": "FindWindow",
        "parameters": [
          {
            "name": "ClassName",
            "type": "PyResourceId",
            "optional": false,
            "description": "Name or atom of window class to find, can be None"
          },
          {
            "name": "WindowName",
            "type": "string",
            "optional": false,
            "description": "Title of window to find, can be None"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__FindWindow_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::FindWindowEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "FindWindowEx",
        "parameters": [
          {
            "name": "Parent",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Window whose child windows will be searched. If 0, desktop window is assumed."
          },
          {
            "name": "ChildAfter",
            "type": "PyHANDLE",
            "optional": false,
            "description": "Child window after which to search in Z-order, can be 0 to search all"
          },
          {
            "name": "ClassName",
            "type": "PyResourceId",
            "optional": false,
            "description": "Name or atom of window class to find, can be None"
          },
          {
            "name": "WindowName",
            "type": "string",
            "optional": false,
            "description": "Title of window to find, can be None"
          }
        ],
        "returns": "PyHANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__FindWindowEx_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::GetWindowText": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetWindowText",
        "parameters": [
          {
            "name": "hwnd",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the window"
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__GetWindowText_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::GetClassName": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetClassName",
        "parameters": [
          {
            "name": "hwnd",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the window"
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__GetClassName_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::GetWindowRect": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetWindowRect",
        "parameters": [
          {
            "name": "hwnd",
            "type": "int",
            "optional": false,
            "description": "The handle to the window"
          }
        ],
        "returns": "tuple[left, top, right, bottom]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__GetWindowRect_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::IsWindowVisible": {
    "kind": "function",
    "signatures": [
      {
        "name": "IsWindowVisible",
        "parameters": [
          {
            "name": "hwnd",
            "type": "int",
            "optional": false,
            "description": "The handle to the window"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__IsWindowVisible_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::ShowWindow": {
    "kind": "function",
    "signatures": [
      {
        "name": "ShowWindow",
        "parameters": [
          {
            "name": "hWnd",
            "type": "int",
            "optional": false,
            "description": "The handle to the window"
          },
          {
            "name": "cmdShow",
            "type": "int",
            "optional": false,
            "description": "Combination of win32con.SW_* flags"
          }
        ],
        "returns": "boolean"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__ShowWindow_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::SendMessage": {
    "kind": "function",
    "signatures": [
      {
        "name": "SendMessage",
        "parameters": [
          {
            "name": "hwnd",
            "type": "int",
            "optional": false,
            "description": "The handle to the Window"
          },
          {
            "name": "message",
            "type": "int",
            "optional": false,
            "description": "The ID of the message to post"
          },
          {
            "name": "wparam",
            "type": "int | str",
            "optional": true,
            "description": "Type depends on the message"
          },
          {
            "name": "lparam",
            "type": "int | str",
            "optional": true,
            "description": "Type depends on the message"
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__SendMessage_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::PostMessage": {
    "kind": "function",
    "signatures": [
      {
        "name": "PostMessage",
        "parameters": [
          {
            "name": "hwnd",
            "type": "int",
            "optional": false,
            "description": "The handle to the Window"
          },
          {
            "name": "message",
            "type": "int",
            "optional": false,
            "description": "The ID of the message to post"
          },
          {
            "name": "wparam",
            "type": "int",
            "optional": true,
            "description": "An integer whose value depends on the message"
          },
          {
            "name": "lparam",
            "type": "int",
            "optional": true,
            "description": "An integer whose value depends on the message"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__PostMessage_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::SetForegroundWindow": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetForegroundWindow",
        "parameters": [
          {
            "name": "hwnd",
            "type": "int",
            "optional": false,
            "description": "The handle to the window"
          }
        ],
        "returns": "HWND"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__SetForegroundWindow_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::GetWindowLong": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetWindowLong",
        "parameters": [
          {
            "name": "hwnd",
            "type": "int",
            "optional": false,
            "description": ""
          },
          {
            "name": "index",
            "type": "int",
            "optional": false,
            "description": ""
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__GetWindowLong_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32gui::SetWindowLong": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetWindowLong",
        "parameters": [
          {
            "name": "hwnd",
            "type": "PyHANDLE",
            "optional": false,
            "description": "The handle to the window"
          },
          {
            "name": "index",
            "type": "int",
            "optional": false,
            "description": "The index of the item to set."
          },
          {
            "name": "value",
            "type": "object",
            "optional": false,
            "description": "The value to set."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32gui__SetWindowLong_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32gui.pyi"
    ]
  },
  "win32clipboard::OpenClipboard": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenClipboard",
        "parameters": [
          {
            "name": "hWnd",
            "type": "PyHANDLE",
            "optional": true,
            "description": "Integer handle to the window to be associated with the open clipboard. If this parameter is None, the open clipboard is associated with the current task."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__OpenClipboard_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32clipboard::CloseClipboard": {
    "kind": "function",
    "signatures": [
      {
        "name": "CloseClipboard",
        "parameters": [],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__CloseClipboard_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32clipboard::EmptyClipboard": {
    "kind": "function",
    "signatures": [
      {
        "name": "EmptyClipboard",
        "parameters": [],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__EmptyClipboard_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32clipboard::GetClipboardData": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetClipboardData",
        "parameters": [
          {
            "name": "_format",
            "type": "object",
            "optional": false
          }
        ],
        "returns": "string | unicode"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__GetClipboardData_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32clipboard::SetClipboardData": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetClipboardData",
        "parameters": [
          {
            "name": "_format",
            "type": "object",
            "optional": false
          },
          {
            "name": "hMem",
            "type": "int | buffer",
            "optional": false,
            "description": "Integer handle to the data in the specified format, or string, unicode, or any object that supports the buffer interface. A global memory object is allocated, and the object's buffer is copied to the new memory. This parameter can be 0, indicating that the window provides data in the specified clipboard format (renders the format) upon request. If a window delays rendering, it must process the WM_RENDERFORMAT and WM_RENDERALLFORMATS messages. After SetClipboardData is called, the system owns the object identified by the hMem parameter. The application can read the data, but must not free the handle or leave it locked. If the hMem parameter identifies a memory object, the object must have been allocated using the GlobalAlloc function with the GMEM_MOVEABLE and GMEM_DDESHARE flags."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__SetClipboardData_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32clipboard::IsClipboardFormatAvailable": {
    "kind": "function",
    "signatures": [
      {
        "name": "IsClipboardFormatAvailable",
        "parameters": [
          {
            "name": "format",
            "type": "int",
            "optional": false,
            "description": "Specifies a clipboard format. For a description of the standard clipboard formats, see Standard Clipboard Formats."
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__IsClipboardFormatAvailable_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32clipboard::EnumClipboardFormats": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumClipboardFormats",
        "parameters": [
          {
            "name": "_format",
            "type": "int",
            "optional": true
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__EnumClipboardFormats_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32clipboard::RegisterClipboardFormat": {
    "kind": "function",
    "signatures": [
      {
        "name": "RegisterClipboardFormat",
        "parameters": [
          {
            "name": "name",
            "type": "string",
            "optional": false,
            "description": "String that names the new format."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__RegisterClipboardFormat_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32clipboard::GetClipboardSequenceNumber": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetClipboardSequenceNumber",
        "parameters": [],
        "returns": "int"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32clipboard__GetClipboardSequenceNumber_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32clipboard.pyi"
    ]
  },
  "win32cred::CredRead": {
    "kind": "function",
    "signatures": [
      {
        "name": "CredRead",
        "parameters": [
          {
            "name": "TargetName",
            "type": "PyUnicode",
            "optional": false,
            "description": "The target of the credentials to retrieve"
          },
          {
            "name": "Type",
            "type": "int",
            "optional": false,
            "description": "One of the CRED_TYPE_* constants"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Reserved, use 0"
          }
        ],
        "returns": "dict"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32cred__CredRead_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32cred.pyi"
    ]
  },
  "win32cred::CredWrite": {
    "kind": "function",
    "signatures": [
      {
        "name": "CredWrite",
        "parameters": [
          {
            "name": "Credential",
            "type": "dict",
            "optional": false,
            "description": "PyCREDENTIAL dict containing the credentials to be stored"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "CRED_PRESERVE_CREDENTIAL_BLOB is only defined flag"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32cred__CredWrite_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32cred.pyi"
    ]
  },
  "win32cred::CredDelete": {
    "kind": "function",
    "signatures": [
      {
        "name": "CredDelete",
        "parameters": [
          {
            "name": "TargetName",
            "type": "PyUnicode",
            "optional": false,
            "description": "Target of credential to be deleted"
          },
          {
            "name": "Type",
            "type": "int",
            "optional": false,
            "description": "One of the CRED_TYPE_* values"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Reserved, use only 0"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32cred__CredDelete_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32cred.pyi"
    ]
  },
  "win32cred::CredEnumerate": {
    "kind": "function",
    "signatures": [
      {
        "name": "CredEnumerate",
        "parameters": [
          {
            "name": "Filter",
            "type": "PyUnicode",
            "optional": true,
            "description": "Matches credentials' target names by prefix, can be None"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Reserved, use 0 if passed in"
          }
        ],
        "returns": "tuple[dict,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32cred__CredEnumerate_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32cred.pyi"
    ]
  },
  "win32cred::CredGetSessionTypes": {
    "kind": "function",
    "signatures": [
      {
        "name": "CredGetSessionTypes",
        "parameters": [
          {
            "name": "MaximumPersistCount",
            "type": "int",
            "optional": true
          }
        ],
        "returns": "tuple[int, ...]"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32cred.pyi"
    ]
  },
  "win32cred::CredReadDomainCredentials": {
    "kind": "function",
    "signatures": [
      {
        "name": "CredReadDomainCredentials",
        "parameters": [
          {
            "name": "TargetInfo",
            "type": "dict",
            "optional": false,
            "description": "PyCREDENTIAL_TARGET_INFORMATION identifying a domain or server. At least one of the Names is required."
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "CRED_CACHE_TARGET_INFORMATION is only valid flag"
          }
        ],
        "returns": "tuple[dict,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32cred__CredReadDomainCredentials_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32cred.pyi"
    ]
  },
  "win32crypt::CryptProtectData": {
    "kind": "function",
    "signatures": [
      {
        "name": "CryptProtectData",
        "parameters": [
          {
            "name": "DataIn",
            "type": "bytes",
            "optional": false,
            "description": "Data to be encrypted."
          },
          {
            "name": "DataDescr",
            "type": "PyUnicode",
            "optional": true,
            "description": "Description to add to the data"
          },
          {
            "name": "OptionalEntropy",
            "type": "bytes",
            "optional": true,
            "description": "Extra entropy (eg password) for encryption process, can be None"
          },
          {
            "name": "Reserved",
            "type": "None",
            "optional": true,
            "description": "Must be None"
          },
          {
            "name": "PromptStruct",
            "type": "PyCRYPTPROTECT_PROMPTSTRUCT",
            "optional": true,
            "description": "Contains options for UI display during encryption and decryption, can be None"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Combination of CRYPTPROTECT_* flags"
          }
        ],
        "returns": "bytes"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32crypt__CryptProtectData_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32crypt.pyi"
    ]
  },
  "win32crypt::CryptUnprotectData": {
    "kind": "function",
    "signatures": [
      {
        "name": "CryptUnprotectData",
        "parameters": [
          {
            "name": "DataIn",
            "type": "bytes",
            "optional": false,
            "description": "Data to be decrypted."
          },
          {
            "name": "OptionalEntropy",
            "type": "bytes",
            "optional": true,
            "description": "Extra entropy passed to CryptProtectData"
          },
          {
            "name": "Reserved",
            "type": "None",
            "optional": true,
            "description": "Must be None"
          },
          {
            "name": "PromptStruct",
            "type": "PyCRYPTPROTECT_PROMPTSTRUCT",
            "optional": true,
            "description": "Contains options for UI display during encryption and decryption, can be None"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Combination of CRYPTPROTECT_* flags"
          }
        ],
        "returns": "tuple[str, bytes]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32crypt__CryptUnprotectData_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32crypt.pyi"
    ]
  },
  "win32crypt::CertOpenSystemStore": {
    "kind": "function",
    "signatures": [
      {
        "name": "CertOpenSystemStore",
        "parameters": [
          {
            "name": "SubsystemProtocol",
            "type": "PyUnicode",
            "optional": false,
            "description": "Name of store to open, will be created if it doesn't already exist"
          },
          {
            "name": "Prov",
            "type": "PyCRYPTPROV",
            "optional": true,
            "description": "Handle to CSP, use None for default provider"
          }
        ],
        "returns": "PyCERTSTORE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32crypt__CertOpenSystemStore_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32crypt.pyi"
    ]
  },
  "win32crypt::CryptQueryObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "CryptQueryObject",
        "parameters": [
          {
            "name": "ObjectType",
            "type": "int",
            "optional": false,
            "description": "Type of input, CERT_QUERY_OBJECT_BLOB or CERT_QUERY_OBJECT_FILE"
          },
          {
            "name": "Object",
            "type": "str",
            "optional": false,
            "description": "Raw data or a filename containing the data to be queried depending on ObjectType"
          },
          {
            "name": "ExpectedContentTypeFlags",
            "type": "int",
            "optional": true,
            "description": "One of the CERT_QUERY_CONTENT_FLAG_* constants"
          },
          {
            "name": "ExpectedFormatTypeFlags",
            "type": "int",
            "optional": true,
            "description": "One of the CERT_QUERY_FORMAT_FLAG_* constants"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Reserved, use only 0"
          }
        ],
        "returns": "dict"
      },
      {
        "name": "CryptQueryObject",
        "parameters": [
          {
            "name": "ObjectType",
            "type": "int",
            "optional": false,
            "description": "Type of input, CERT_QUERY_OBJECT_BLOB or CERT_QUERY_OBJECT_FILE"
          },
          {
            "name": "Object",
            "type": "str",
            "optional": false,
            "description": "Raw data or a filename containing the data to be queried depending on ObjectType"
          },
          {
            "name": "ExpectedContentTypeFlags",
            "type": "int",
            "optional": true,
            "description": "One of the CERT_QUERY_CONTENT_FLAG_* constants"
          },
          {
            "name": "ExpectedFormatTypeFlags",
            "type": "int",
            "optional": true,
            "description": "One of the CERT_QUERY_FORMAT_FLAG_* constants"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Reserved, use only 0"
          }
        ],
        "returns": "dict"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32crypt__CryptQueryObject_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32crypt.pyi"
    ]
  },
  "win32net / win32wnet::win32net.NetUserEnum": {
    "kind": "function",
    "signatures": [
      {
        "name": "NetUserEnum",
        "parameters": [
          {
            "name": "server",
            "type": "string | PyUnicode",
            "optional": false,
            "description": "The name of the server, or None."
          },
          {
            "name": "level",
            "type": "int",
            "optional": false,
            "description": "The level of data required."
          },
          {
            "name": "arg",
            "type": "object",
            "optional": false
          },
          {
            "name": "prefLen",
            "type": "int",
            "optional": true,
            "description": "The preferred length of the data buffer."
          },
          {
            "name": "resumeHandle",
            "type": "int",
            "optional": true,
            "description": "A resume handle. See the return description for more information."
          }
        ],
        "returns": "tuple[[dict, ...], total, resumeHandle]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32net__NetUserEnum_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32net.pyi"
    ]
  },
  "win32net / win32wnet::win32net.NetLocalGroupEnum": {
    "kind": "function",
    "signatures": [
      {
        "name": "NetLocalGroupEnum",
        "parameters": [
          {
            "name": "server",
            "type": "string | PyUnicode",
            "optional": false,
            "description": "The name of the server, or None."
          },
          {
            "name": "level",
            "type": "int",
            "optional": false,
            "description": "The level of data required."
          },
          {
            "name": "resumeHandle",
            "type": "int",
            "optional": true,
            "description": "A resume handle. See the return description for more information."
          },
          {
            "name": "prefLen",
            "type": "int",
            "optional": true,
            "description": "The preferred length of the data buffer."
          }
        ],
        "returns": "tuple[[dict, ...], total, resumeHandle]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32net__NetLocalGroupEnum_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32net.pyi"
    ]
  },
  "win32net / win32wnet::win32net.NetLocalGroupGetMembers": {
    "kind": "function",
    "signatures": [
      {
        "name": "NetLocalGroupGetMembers",
        "parameters": [
          {
            "name": "server",
            "type": "string | PyUnicode",
            "optional": false,
            "description": "The name of the server, or None."
          },
          {
            "name": "groupName",
            "type": "string | PyUnicode",
            "optional": false,
            "description": "The name of the local group."
          },
          {
            "name": "level",
            "type": "int",
            "optional": false,
            "description": "The level of data required."
          },
          {
            "name": "resumeHandle",
            "type": "int",
            "optional": true,
            "description": "A resume handle. See the return description for more information."
          },
          {
            "name": "prefLen",
            "type": "int",
            "optional": true,
            "description": "The preferred length of the data buffer."
          }
        ],
        "returns": "tuple[[dict, ...], total, resumeHandle]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32net__NetLocalGroupGetMembers_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32net.pyi"
    ]
  },
  "win32net / win32wnet::win32net.NetShareEnum": {
    "kind": "function",
    "signatures": [
      {
        "name": "NetShareEnum",
        "parameters": [
          {
            "name": "server",
            "type": "string | PyUnicode",
            "optional": false,
            "description": "The name of the server, or None."
          },
          {
            "name": "level",
            "type": "int",
            "optional": false,
            "description": "The level of data required."
          },
          {
            "name": "prefLen",
            "type": "int",
            "optional": true,
            "description": "The preferred length of the data buffer."
          },
          {
            "name": "serverName",
            "type": "object",
            "optional": false
          },
          {
            "name": "resumeHandle",
            "type": "int",
            "optional": true,
            "description": "A resume handle. See the return description for more information."
          }
        ],
        "returns": "tuple[[dict, ...], total, resumeHandle]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32net__NetShareEnum_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32net.pyi"
    ]
  },
  "win32net / win32wnet::win32net.NetSessionEnum": {
    "kind": "function",
    "signatures": [
      {
        "name": "NetSessionEnum",
        "parameters": [
          {
            "name": "level",
            "type": "int",
            "optional": false,
            "description": "Level of information requested, currently accepts 0, 1, 2, 10, and 502"
          },
          {
            "name": "server",
            "type": "string | PyUnicode",
            "optional": true,
            "description": "The name of the server for which to list sessions, local machine assumed if None"
          },
          {
            "name": "client",
            "type": "string | PyUnicode",
            "optional": true,
            "description": "Name of client computer, or None to list all computer sessions"
          },
          {
            "name": "username",
            "type": "string | PyUnicode",
            "optional": true,
            "description": "User name, or None to list all connected users"
          }
        ],
        "returns": "tuple[dict,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32net__NetSessionEnum_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32net.pyi"
    ]
  },
  "win32net / win32wnet::win32net.NetFileEnum": {
    "kind": "function",
    "signatures": [
      {
        "name": "NetFileEnum",
        "parameters": [
          {
            "name": "level",
            "type": "int",
            "optional": false,
            "description": "Level of information, 2 or 3 supported"
          },
          {
            "name": "servername",
            "type": "string | PyUnicode",
            "optional": true,
            "description": "The name of the server for which to list open resources, local machine assumed if None"
          },
          {
            "name": "basepath",
            "type": "string | PyUnicode",
            "optional": true,
            "description": "If specified, limits returned list to files on given path"
          },
          {
            "name": "username",
            "type": "string | PyUnicode",
            "optional": true,
            "description": "User that opened resource, or None to list open files for all users"
          }
        ],
        "returns": "tuple[dict,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32net__NetFileEnum_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32net.pyi"
    ]
  },
  "win32net / win32wnet::win32wnet.WNetAddConnection2": {
    "kind": "function",
    "signatures": [
      {
        "name": "WNetAddConnection2",
        "parameters": [
          {
            "name": "NetResource",
            "type": "PyNETRESOURCE",
            "optional": false,
            "description": "Describes the network resource for the connection."
          },
          {
            "name": "Password",
            "type": "str",
            "optional": true,
            "description": "The password to use. Use None for default credentials."
          },
          {
            "name": "UserName",
            "type": "str",
            "optional": true,
            "description": "The user name to connect as. Use None for default credentials."
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Combination win32netcon.CONNECT_* flags"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32wnet__WNetAddConnection2_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32wnet.pyi"
    ]
  },
  "win32net / win32wnet::win32wnet.WNetCancelConnection2": {
    "kind": "function",
    "signatures": [
      {
        "name": "WNetCancelConnection2",
        "parameters": [
          {
            "name": "name",
            "type": "string",
            "optional": false,
            "description": "Name of existing connection to be closed"
          },
          {
            "name": "flags",
            "type": "int",
            "optional": false,
            "description": "Currently determines if the persisent connection information will be updated as a result of this call."
          },
          {
            "name": "force",
            "type": "int",
            "optional": false,
            "description": "indicates if the close operation should be forced. (i.e. ignore open files and connections)"
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32wnet__WNetCancelConnection2_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32wnet.pyi"
    ]
  },
  "win32net / win32wnet::win32wnet.WNetGetConnection": {
    "kind": "function",
    "signatures": [
      {
        "name": "WNetGetConnection",
        "parameters": [
          {
            "name": "connection",
            "type": "string",
            "optional": true,
            "description": "A string that is a drive-based path for a network resource. For example, if drive H has been mapped to a network drive share, and the network resource of interest is a file named Sample.doc in the directory \\\\Win32\\\\Examples on that share, the drive-based path is H:\\\\Win32\\\\Examples\\\\Sample.doc."
          }
        ],
        "returns": "string"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32wnet__WNetGetConnection_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32wnet.pyi"
    ]
  },
  "win32net / win32wnet::win32wnet.WNetEnumResource": {
    "kind": "function",
    "signatures": [
      {
        "name": "WNetEnumResource",
        "parameters": [
          {
            "name": "handle",
            "type": "PyHANDLE",
            "optional": false,
            "description": "A handle to an open Enumeration Object (from win32wnet::WNetOpenEnum )"
          },
          {
            "name": "maxExtries",
            "type": "int",
            "optional": true,
            "description": "The maximum number of entries to return."
          }
        ],
        "returns": "tuple[[ PyNETRESOURCE, ...]]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32wnet__WNetEnumResource_meth.html",
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32/win32wnet.pyi"
    ]
  },
  "win32com.client / pythoncom::win32com.client.Dispatch": {
    "kind": "function",
    "signatures": [
      {
        "name": "Dispatch",
        "parameters": [
          {
            "name": "dispatch",
            "type": "str | dynamic.PyIDispatchType | IIDType | dynamic.PyIUnknownType",
            "optional": false
          },
          {
            "name": "userName",
            "type": "str | None",
            "optional": true
          },
          {
            "name": "resultCLSID",
            "type": "_Stringifiable | None",
            "optional": true
          },
          {
            "name": "typeinfo",
            "type": "PyITypeInfo | None",
            "optional": true
          },
          {
            "name": "clsctx",
            "type": "int",
            "optional": true
          }
        ],
        "returns": "dynamic.CDispatch"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32com/client/__init__.pyi"
    ]
  },
  "win32com.client / pythoncom::win32com.client.GetObject": {
    "kind": "function",
    "signatures": [
      {
        "name": "GetObject",
        "parameters": [
          {
            "name": "Pathname",
            "type": "str | None",
            "optional": true
          },
          {
            "name": "Class",
            "type": "object",
            "optional": true
          },
          {
            "name": "clsctx",
            "type": "object",
            "optional": true
          }
        ],
        "returns": "CDispatch"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/win32com/client/__init__.pyi"
    ]
  },
  "win32com.client / pythoncom::pythoncom.CoInitialize": {
    "kind": "function",
    "signatures": [
      {
        "name": "CoInitialize",
        "parameters": [],
        "returns": "None"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/pythoncom.pyi"
    ]
  },
  "win32com.client / pythoncom::pythoncom.CoUninitialize": {
    "kind": "function",
    "signatures": [
      {
        "name": "CoUninitialize",
        "parameters": [],
        "returns": "None"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/pythoncom.pyi"
    ]
  },
  "win32com.client / pythoncom::pythoncom.MakeIID": {
    "kind": "function",
    "signatures": [
      {
        "name": "MakeIID",
        "parameters": [
          {
            "name": "iidString",
            "type": "str",
            "optional": false
          },
          {
            "name": "is_bytes",
            "type": "bool",
            "optional": true
          }
        ],
        "returns": "PyIID"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stubs/pywin32/pythoncom.pyi"
    ]
  },
  "winreg (standard library companion)::OpenKey": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenKey",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "sub_key",
            "type": "str | None",
            "optional": false
          },
          {
            "name": "reserved",
            "type": "int",
            "optional": true
          },
          {
            "name": "access",
            "type": "int",
            "optional": true
          }
        ],
        "returns": "HKEYType"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "winreg (standard library companion)::CreateKeyEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateKeyEx",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "sub_key",
            "type": "str | None",
            "optional": false
          },
          {
            "name": "reserved",
            "type": "int",
            "optional": true
          },
          {
            "name": "access",
            "type": "int",
            "optional": true
          }
        ],
        "returns": "HKEYType"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "winreg (standard library companion)::QueryValueEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "QueryValueEx",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "name",
            "type": "str",
            "optional": false
          }
        ],
        "returns": "tuple[Any, int]"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "winreg (standard library companion)::SetValueEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "SetValueEx",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "value_name",
            "type": "str | None",
            "optional": false
          },
          {
            "name": "reserved",
            "type": "Unused",
            "optional": false
          },
          {
            "name": "type",
            "type": "Literal[4, 5]",
            "optional": false
          },
          {
            "name": "value",
            "type": "int | None",
            "optional": false
          }
        ],
        "returns": "None"
      },
      {
        "name": "SetValueEx",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "value_name",
            "type": "str | None",
            "optional": false
          },
          {
            "name": "reserved",
            "type": "Unused",
            "optional": false
          },
          {
            "name": "type",
            "type": "Literal[1, 2]",
            "optional": false
          },
          {
            "name": "value",
            "type": "str | None",
            "optional": false
          }
        ],
        "returns": "None"
      },
      {
        "name": "SetValueEx",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "value_name",
            "type": "str | None",
            "optional": false
          },
          {
            "name": "reserved",
            "type": "Unused",
            "optional": false
          },
          {
            "name": "type",
            "type": "Literal[7]",
            "optional": false
          },
          {
            "name": "value",
            "type": "list[str] | None",
            "optional": false
          }
        ],
        "returns": "None"
      },
      {
        "name": "SetValueEx",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "value_name",
            "type": "str | None",
            "optional": false
          },
          {
            "name": "reserved",
            "type": "Unused",
            "optional": false
          },
          {
            "name": "type",
            "type": "Literal[0, 3, 8, 9, 10, 11]",
            "optional": false
          },
          {
            "name": "value",
            "type": "ReadableBuffer | None",
            "optional": false
          }
        ],
        "returns": "None"
      },
      {
        "name": "SetValueEx",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "value_name",
            "type": "str | None",
            "optional": false
          },
          {
            "name": "reserved",
            "type": "Unused",
            "optional": false
          },
          {
            "name": "type",
            "type": "int",
            "optional": false
          },
          {
            "name": "value",
            "type": "int | str | list[str] | ReadableBuffer | None",
            "optional": false
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "winreg (standard library companion)::EnumKey": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumKey",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "index",
            "type": "int",
            "optional": false
          }
        ],
        "returns": "str"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "winreg (standard library companion)::EnumValue": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnumValue",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "index",
            "type": "int",
            "optional": false
          }
        ],
        "returns": "tuple[str, Any, int]"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "winreg (standard library companion)::DeleteValue": {
    "kind": "function",
    "signatures": [
      {
        "name": "DeleteValue",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "value",
            "type": "str",
            "optional": false
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "winreg (standard library companion)::DeleteKey": {
    "kind": "function",
    "signatures": [
      {
        "name": "DeleteKey",
        "parameters": [
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          },
          {
            "name": "sub_key",
            "type": "str",
            "optional": false
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "winreg (standard library companion)::ConnectRegistry": {
    "kind": "function",
    "signatures": [
      {
        "name": "ConnectRegistry",
        "parameters": [
          {
            "name": "computer_name",
            "type": "str | None",
            "optional": false
          },
          {
            "name": "key",
            "type": "_KeyType",
            "optional": false
          }
        ],
        "returns": "HKEYType"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/winreg.pyi"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.WinError": {
    "kind": "function",
    "signatures": [
      {
        "name": "WinError",
        "parameters": [
          {
            "name": "code",
            "type": "int | None",
            "optional": true
          },
          {
            "name": "descr",
            "type": "str | None",
            "optional": true
          }
        ],
        "returns": "OSError"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/ctypes/__init__.pyi"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.POINTER": {
    "kind": "function",
    "signatures": [
      {
        "name": "POINTER",
        "parameters": [
          {
            "name": "cls",
            "type": "str",
            "optional": false
          }
        ],
        "returns": "type[Any]"
      },
      {
        "name": "POINTER",
        "parameters": [
          {
            "name": "cls",
            "type": "None",
            "optional": false
          }
        ],
        "returns": "type[c_void_p]"
      },
      {
        "name": "POINTER",
        "parameters": [
          {
            "name": "cls",
            "type": "type[_CT]",
            "optional": false
          }
        ],
        "returns": "type[_Pointer[_CT]]"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/ctypes/__init__.pyi"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.pointer": {
    "kind": "function",
    "signatures": [
      {
        "name": "pointer",
        "parameters": [
          {
            "name": "obj",
            "type": "_CT",
            "optional": false
          }
        ],
        "returns": "_Pointer[_CT]"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/ctypes/__init__.pyi"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.create_unicode_buffer": {
    "kind": "function",
    "signatures": [
      {
        "name": "create_unicode_buffer",
        "parameters": [
          {
            "name": "init",
            "type": "int | str",
            "optional": false
          },
          {
            "name": "size",
            "type": "int | None",
            "optional": true
          }
        ],
        "returns": "Array[c_wchar]"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/ctypes/__init__.pyi"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.create_string_buffer": {
    "kind": "function",
    "signatures": [
      {
        "name": "create_string_buffer",
        "parameters": [
          {
            "name": "init",
            "type": "int | bytes",
            "optional": false
          },
          {
            "name": "size",
            "type": "int | None",
            "optional": true
          }
        ],
        "returns": "Array[c_char]"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/ctypes/__init__.pyi"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.cast": {
    "kind": "function",
    "signatures": [
      {
        "name": "cast",
        "parameters": [
          {
            "name": "obj",
            "type": "_CData | _CDataType | _CArgObject | int",
            "optional": false
          },
          {
            "name": "typ",
            "type": "type[_CastT]",
            "optional": false
          }
        ],
        "returns": "_CastT"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/ctypes/__init__.pyi"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.WINFUNCTYPE": {
    "kind": "function",
    "signatures": [
      {
        "name": "WINFUNCTYPE",
        "parameters": [
          {
            "name": "restype",
            "type": "type[_CData | _CDataType] | None",
            "optional": false
          },
          {
            "name": "argtypes",
            "type": "type[_CData | _CDataType]",
            "optional": false
          },
          {
            "name": "use_errno",
            "type": "bool",
            "optional": true
          },
          {
            "name": "use_last_error",
            "type": "bool",
            "optional": true
          }
        ],
        "returns": "type[_CFunctionType]"
      }
    ],
    "sources": [
      "https://raw.githubusercontent.com/python/typeshed/main/stdlib/ctypes/__init__.pyi"
    ]
  },
  "ctypes / ctypes.wintypes::VirtualQueryEx": {
    "kind": "function",
    "signatures": [
      {
        "name": "VirtualQueryEx",
        "parameters": [
          {
            "name": "hProcess",
            "type": "wintypes.HANDLE",
            "optional": false
          },
          {
            "name": "lpAddress",
            "type": "ctypes.c_void_p",
            "optional": false
          },
          {
            "name": "lpBuffer",
            "type": "ctypes.POINTER(MEMORY_BASIC_INFORMATION)",
            "optional": false
          },
          {
            "name": "dwLength",
            "type": "ctypes.c_size_t",
            "optional": false
          }
        ],
        "returns": "ctypes.c_size_t"
      }
    ],
    "sources": [
      "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualqueryex"
    ]
  },
  "ctypes / ctypes.wintypes::CreateProcessW": {
    "kind": "function",
    "signatures": [
      {
        "name": "CreateProcessW",
        "parameters": [
          {
            "name": "lpApplicationName",
            "type": "wintypes.LPCWSTR | None",
            "optional": false
          },
          {
            "name": "lpCommandLine",
            "type": "wintypes.LPWSTR | None",
            "optional": false
          },
          {
            "name": "lpProcessAttributes",
            "type": "POINTER(SECURITY_ATTRIBUTES) | None",
            "optional": false
          },
          {
            "name": "lpThreadAttributes",
            "type": "POINTER(SECURITY_ATTRIBUTES) | None",
            "optional": false
          },
          {
            "name": "bInheritHandles",
            "type": "wintypes.BOOL",
            "optional": false
          },
          {
            "name": "dwCreationFlags",
            "type": "wintypes.DWORD",
            "optional": false
          },
          {
            "name": "lpEnvironment",
            "type": "ctypes.c_void_p | None",
            "optional": false
          },
          {
            "name": "lpCurrentDirectory",
            "type": "wintypes.LPCWSTR | None",
            "optional": false
          },
          {
            "name": "lpStartupInfo",
            "type": "POINTER(STARTUPINFOW)",
            "optional": false
          },
          {
            "name": "lpProcessInformation",
            "type": "POINTER(PROCESS_INFORMATION)",
            "optional": false
          }
        ],
        "returns": "wintypes.BOOL"
      }
    ],
    "sources": [
      "https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw"
    ]
  },
  "ctypes / ctypes.wintypes::OpenSCManagerW / OpenServiceW": {
    "kind": "function",
    "signatures": [
      {
        "name": "OpenSCManagerW",
        "parameters": [
          {
            "name": "lpMachineName",
            "type": "wintypes.LPCWSTR | None",
            "optional": false
          },
          {
            "name": "lpDatabaseName",
            "type": "wintypes.LPCWSTR | None",
            "optional": false
          },
          {
            "name": "dwDesiredAccess",
            "type": "wintypes.DWORD",
            "optional": false
          }
        ],
        "returns": "SC_HANDLE"
      },
      {
        "name": "OpenServiceW",
        "parameters": [
          {
            "name": "hSCManager",
            "type": "SC_HANDLE",
            "optional": false
          },
          {
            "name": "lpServiceName",
            "type": "wintypes.LPCWSTR",
            "optional": false
          },
          {
            "name": "dwDesiredAccess",
            "type": "wintypes.DWORD",
            "optional": false
          }
        ],
        "returns": "SC_HANDLE"
      }
    ],
    "sources": [
      "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-openscmanagerw",
      "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-openservicew"
    ]
  },
  "ctypes / ctypes.wintypes::StartServiceW / ControlService": {
    "kind": "function",
    "signatures": [
      {
        "name": "StartServiceW",
        "parameters": [
          {
            "name": "hService",
            "type": "SC_HANDLE",
            "optional": false
          },
          {
            "name": "dwNumServiceArgs",
            "type": "wintypes.DWORD",
            "optional": false
          },
          {
            "name": "lpServiceArgVectors",
            "type": "POINTER(wintypes.LPCWSTR) | None",
            "optional": false
          }
        ],
        "returns": "wintypes.BOOL"
      },
      {
        "name": "ControlService",
        "parameters": [
          {
            "name": "hService",
            "type": "SC_HANDLE",
            "optional": false
          },
          {
            "name": "dwControl",
            "type": "wintypes.DWORD",
            "optional": false
          },
          {
            "name": "lpServiceStatus",
            "type": "POINTER(SERVICE_STATUS)",
            "optional": false
          }
        ],
        "returns": "wintypes.BOOL"
      }
    ],
    "sources": [
      "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-startservicew",
      "https://learn.microsoft.com/en-us/windows/win32/api/winsvc/nf-winsvc-controlservice"
    ]
  },
  "win32serviceutil::RestartService": {
    "kind": "function",
    "signatures": [
      {
        "name": "RestartService",
        "parameters": [
          {
            "name": "serviceName",
            "type": "str",
            "optional": false
          },
          {
            "name": "args",
            "type": "Sequence[str] | None",
            "optional": true
          },
          {
            "name": "machine",
            "type": "str | None",
            "optional": true
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://github.com/mhammond/pywin32/blob/main/win32/Lib/win32serviceutil.py"
    ]
  },
  "win32evtlog::EvtQuery": {
    "kind": "function",
    "signatures": [
      {
        "name": "EvtQuery",
        "parameters": [
          {
            "name": "Path",
            "type": "str",
            "optional": false,
            "description": "Log channel or exported log file, depending on Flags"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": false,
            "description": "Combination of EVT_QUERY_FLAGS (EvtQuery*)"
          },
          {
            "name": "Query",
            "type": "str",
            "optional": true,
            "description": "Selects events to return, None or '*' for all events"
          },
          {
            "name": "Session",
            "type": "PyEVT_HANDLE",
            "optional": true,
            "description": "Handle to a remote session (see win32evtlog::EvtOpenSession ), or None for local machine."
          }
        ],
        "returns": "PyEVT_HANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtQuery_meth.html"
    ]
  },
  "win32evtlog::EvtNext": {
    "kind": "function",
    "signatures": [
      {
        "name": "EvtNext",
        "parameters": [
          {
            "name": "ResultSet",
            "type": "PyEVT_HANDLE",
            "optional": false,
            "description": "Handle to event query or subscription"
          },
          {
            "name": "Count",
            "type": "int",
            "optional": false,
            "description": "Number of events to return"
          },
          {
            "name": "Timeout",
            "type": "int",
            "optional": true,
            "description": "Time to wait in milliseconds, use -1 for infinite"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Reserved, use only 0"
          }
        ],
        "returns": "tuple[PyEVT_HANDLE,...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtNext_meth.html"
    ]
  },
  "win32evtlog::EvtExportLog": {
    "kind": "function",
    "signatures": [
      {
        "name": "EvtExportLog",
        "parameters": [
          {
            "name": "Path",
            "type": "str",
            "optional": false,
            "description": "Path of a live event log channel or exported log file"
          },
          {
            "name": "Query",
            "type": "str",
            "optional": true,
            "description": "Selects specific events to export"
          },
          {
            "name": "TargetFilePath",
            "type": "str",
            "optional": false,
            "description": "File to create, cannot already exist"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": false,
            "description": "Combination of EvtExportLog* flags specifying the type of path"
          },
          {
            "name": "Session",
            "type": "PyEVT_HANDLE",
            "optional": true,
            "description": "Handle to a remote session (see win32evtlog::EvtOpenSession ), or None for local machine."
          }
        ],
        "returns": "None"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtExportLog_meth.html"
    ]
  },
  "win32evtlog::EvtOpenSession": {
    "kind": "function",
    "signatures": [
      {
        "name": "EvtOpenSession",
        "parameters": [
          {
            "name": "LoginClass",
            "type": "int",
            "optional": true,
            "description": "Type of login to perform, EvtRpcLogin is only defined value"
          },
          {
            "name": "Login",
            "type": "PyEVT_RPC_LOGIN",
            "optional": false,
            "description": "Credentials to be used to access remote machine"
          },
          {
            "name": "Timeout",
            "type": "int",
            "optional": true,
            "description": "Reserved, use only 0"
          },
          {
            "name": "Flags",
            "type": "int",
            "optional": true,
            "description": "Reserved, use only 0"
          }
        ],
        "returns": "PyEVT_HANDLE"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/win32evtlog__EvtOpenSession_meth.html"
    ]
  },
  "win32crypt::CryptProtectMemory": {
    "kind": "function",
    "signatures": [
      {
        "name": "CryptProtectMemory",
        "parameters": [
          {
            "name": "pDataIn",
            "type": "ctypes.c_void_p",
            "optional": false
          },
          {
            "name": "cbDataIn",
            "type": "wintypes.DWORD",
            "optional": false
          },
          {
            "name": "dwFlags",
            "type": "wintypes.DWORD",
            "optional": false
          }
        ],
        "returns": "wintypes.BOOL"
      }
    ],
    "sources": [
      "https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectmemory"
    ]
  },
  "win32crypt::CryptUnprotectMemory": {
    "kind": "function",
    "signatures": [
      {
        "name": "CryptUnprotectMemory",
        "parameters": [
          {
            "name": "pDataIn",
            "type": "ctypes.c_void_p",
            "optional": false
          },
          {
            "name": "cbDataIn",
            "type": "wintypes.DWORD",
            "optional": false
          },
          {
            "name": "dwFlags",
            "type": "wintypes.DWORD",
            "optional": false
          }
        ],
        "returns": "wintypes.BOOL"
      }
    ],
    "sources": [
      "https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptunprotectmemory"
    ]
  },
  "win32crypt::CertEnumCertificatesInStore": {
    "kind": "function",
    "signatures": [
      {
        "name": "PyCERTSTORE.CertEnumCertificatesInStore",
        "parameters": [],
        "returns": "tuple[PyCERT_CONTEXT, ...]"
      }
    ],
    "sources": [
      "https://timgolden.me.uk/pywin32-docs/PyCERTSTORE.html"
    ]
  },
  "win32com.client / pythoncom::win32com.client.gencache.EnsureDispatch": {
    "kind": "function",
    "signatures": [
      {
        "name": "EnsureDispatch",
        "parameters": [
          {
            "name": "prog_id",
            "type": "str | object",
            "optional": false
          },
          {
            "name": "bForDemand",
            "type": "int | bool",
            "optional": true
          }
        ],
        "returns": "DispatchBaseClass"
      }
    ],
    "sources": [
      "https://github.com/mhammond/pywin32/blob/main/com/win32com/client/gencache.py"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.WinDLL": {
    "kind": "function",
    "signatures": [
      {
        "name": "ctypes.WinDLL",
        "parameters": [
          {
            "name": "name",
            "type": "str | os.PathLike[str] | None",
            "optional": false
          },
          {
            "name": "mode",
            "type": "int",
            "optional": true
          },
          {
            "name": "handle",
            "type": "int | None",
            "optional": true
          },
          {
            "name": "use_errno",
            "type": "bool",
            "optional": true
          },
          {
            "name": "use_last_error",
            "type": "bool",
            "optional": true
          },
          {
            "name": "winmode",
            "type": "int | None",
            "optional": true
          }
        ],
        "returns": "ctypes.WinDLL"
      }
    ],
    "sources": [
      "https://docs.python.org/3/library/ctypes.html#ctypes.WinDLL"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.get_last_error": {
    "kind": "function",
    "signatures": [
      {
        "name": "ctypes.get_last_error",
        "parameters": [],
        "returns": "int"
      }
    ],
    "sources": [
      "https://docs.python.org/3/library/ctypes.html#ctypes.get_last_error"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.GetLastError / ctypes.set_last_error": {
    "kind": "function",
    "signatures": [
      {
        "name": "ctypes.GetLastError",
        "parameters": [],
        "returns": "int"
      },
      {
        "name": "ctypes.set_last_error",
        "parameters": [
          {
            "name": "value",
            "type": "int",
            "optional": false
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://docs.python.org/3/library/ctypes.html#ctypes.GetLastError",
      "https://docs.python.org/3/library/ctypes.html#ctypes.set_last_error"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.byref": {
    "kind": "function",
    "signatures": [
      {
        "name": "ctypes.byref",
        "parameters": [
          {
            "name": "obj",
            "type": "ctypes instance",
            "optional": false
          },
          {
            "name": "offset",
            "type": "int",
            "optional": true
          }
        ],
        "returns": "CArgObject"
      }
    ],
    "sources": [
      "https://docs.python.org/3/library/ctypes.html#ctypes.byref"
    ]
  },
  "ctypes / ctypes.wintypes::ctypes.sizeof": {
    "kind": "function",
    "signatures": [
      {
        "name": "ctypes.sizeof",
        "parameters": [
          {
            "name": "obj_or_type",
            "type": "ctypes instance | ctypes type",
            "optional": false
          }
        ],
        "returns": "int"
      }
    ],
    "sources": [
      "https://docs.python.org/3/library/ctypes.html#ctypes.sizeof"
    ]
  }
};
