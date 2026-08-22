window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "registry-structure": {
    apis: ["winreg.OpenKey", "winreg.QueryValueEx", "winreg.EnumKey", "winreg.EnumValue", "RegOpenKeyExW"],
    phases: {
      learn: ["Build the Registry model", "Separate keys, values, types, hives, roots, aliases, and merged views."],
      windows: ["Observe configuration access", "Connect Registry operations to handles, security, Regedit, and Process Monitor."],
      investigation: ["Trace one preference", "Turn a setting change into a precise sequence of Registry evidence."],
      review: ["Check the model", "Test paths, types, roots, and the limits of Registry analogies."]
    },
    learning: [
      {
        title: "A Registry path reaches a key, then an operation names a value",
        paragraphs: [
          "The Registry is a hierarchical, typed configuration database used by Windows and many applications. Keys form the hierarchy and can contain subkeys. Values live inside a key and contain a name, type, and data. The unnamed value sometimes displayed as (Default) is simply a value whose name is an empty string, not a value that Windows automatically uses for every setting.",
          "Keep the key path and value name separate in code. In HKCU\\Software\\ILOVEOSLab with a value named DemoMode, OpenKey receives Software\\ILOVEOSLab and QueryValueEx receives DemoMode. Treating DemoMode as another key produces a different lookup and usually ERROR_FILE_NOT_FOUND."
        ],
        inlineCheck: ["What does winreg.QueryValueEx need after a key is open?", ["A PID", "A value name", "A DLL base", "A service control code"], 1, "The open handle identifies the key. The separate name identifies one value inside it."]
      },
      {
        title: "The type is part of the stored meaning",
        paragraphs: [
          "REG_SZ stores one Unicode string. REG_EXPAND_SZ stores text that a consumer may expand using environment variables. REG_DWORD stores a 32-bit integer. REG_QWORD stores a 64-bit integer. REG_MULTI_SZ stores a sequence of strings, and REG_BINARY stores uninterpreted bytes. A correct backup records the data and its type because the same visible characters can have different meaning under a different type.",
          "The Registry does not validate every application's schema. A syntactically valid value can still be ignored, misread, or dangerous to the consumer. Learn the owning component's contract before changing its data."
        ]
      },
      {
        title: "Root handles expose logical views",
        paragraphs: [
          "HKEY_LOCAL_MACHINE contains machine-oriented configuration, while HKEY_CURRENT_USER resolves to the profile of the security context performing the access. HKEY_CLASSES_ROOT is a merged view of machine and user class registration. These roots are API entry points, not proof that each is one independent disk file.",
          "Persistent data is backed by hive files and loaded into the namespace, but applications should use Registry APIs. The Configuration Manager handles locking, caching, security, transactions used internally, and in-memory state that direct hive-file editing would bypass."
        ],
        callout: { label: "Use an exact lab boundary", text: "Practice under HKCU\\Software\\ILOVEOSLab. Do not experiment with Run, Winlogon, AppInit_DLLs, Image File Execution Options, SAM, or SECURITY on your ordinary system." }
      }
    ],
    visuals: [{
      type: "map",
      title: "Resolve a Registry lookup from root to typed data",
      intro: "Each layer answers a different question.",
      items: [
        { meta: "Root handle", label: "HKEY_CURRENT_USER", detail: "Which logical root and user context?", linkAfter: "open subkey" },
        { meta: "Key path", label: "Software\\ILOVEOSLab", detail: "Which container?", linkAfter: "query name" },
        { meta: "Value", label: "DemoMode", detail: "Which record inside the key?", linkAfter: "interpret type" },
        { meta: "Typed data", label: "REG_DWORD: 1", detail: "32-bit numeric value" }
      ],
      caption: "A full-looking path in a UI may combine the key path and value name, while the API keeps them separate."
    }],
    workedExamples: [{
      type: "trace",
      title: "Translate a Regedit row into API calls",
      prompt: "Regedit shows HKCU\\Software\\ILOVEOSLab and a DemoMode REG_DWORD containing 1.",
      steps: [
        { title: "Select the root", action: "Use winreg.HKEY_CURRENT_USER.", why: "The root is supplied as a predefined handle rather than included in the subkey string.", result: "The access is scoped to the current user view." },
        { title: "Open the key", action: "OpenKey(root, r'Software\\ILOVEOSLab', 0, KEY_QUERY_VALUE).", why: "The requested mask states the intended operation and avoids write access.", result: "The returned HKEY identifies one opened key object." },
        { title: "Query the record", action: "Call QueryValueEx(key, 'DemoMode').", why: "The value name is not part of the open key path.", result: "Python receives (1, REG_DWORD)." },
        { title: "Release ownership", action: "Exit the with block or call CloseKey.", why: "Open Registry keys are resources with finite kernel bookkeeping.", result: "The handle can no longer be used." }
      ],
      conclusion: "A useful Registry note records root, key path, value name, type, data, access mask, and observed operation."
    }],
    windowsLearning: [
      { title: "Registry APIs are object opens and queries", paragraphs: ["RegOpenKeyEx requests access and returns an HKEY. The key has a security descriptor, and access can differ by user, elevation, view, and requested mask. Querying a value does not return another handle, while opening or creating a subkey does.", "A failed lookup can mean an absent key, absent value, wrong view, wrong user profile, insufficient rights, or a race with another component. Record the exact operation and path before interpreting ERROR_FILE_NOT_FOUND as proof that no corresponding configuration exists anywhere."] },
      { title: "Use traces to learn behavior, not just locations", paragraphs: ["Process Monitor shows operation, process, path, result, and detail. Filter to one controlled process, clear old events, begin capture, make one change, stop capture, and compare the read and write sequence. Repeated NAME NOT FOUND probes can be normal fallback behavior.", "Regedit is a current-state browser. Autoruns interprets selected persistence-related locations. Neither replaces a time-based trace when the question is which process read or changed a value during an action."] }
    ],
    practice: {
      title: "Map one harmless application preference",
      time: "30 min",
      intro: "Choose a reversible per-user preference in a disposable application profile and observe it before changing anything else.",
      expectedOutcome: "A narrow Process Monitor capture should show the application opening one or more candidate keys, querying values, and possibly writing after the UI action. The relevant value may be per-user, may be absent until changed, and may not be the only state the application consults.",
      safety: "Do not trace or change credential, logon, shell, debugger, service, security-policy, or persistence locations. Restore the chosen preference through the application's own UI.",
      steps: [
        { action: "Record the application's executable path and current preference, then launch Process Monitor elevated only if required for capture.", why: "A trace needs a precise subject and a known starting state.", observe: "Confirm the process name and PID instead of filtering only by a broad path fragment." },
        { action: "Filter to that PID and Registry operations, clear the display, begin capture, and change the preference once.", why: "A short causal window reduces unrelated configuration noise.", observe: "Look for RegOpenKey, RegQueryValue, RegSetValue, CreateKey, NAME NOT FOUND, and SUCCESS in chronological order." },
        { action: "Identify the root, key, value, type, and data from the event detail and confirm current state in Regedit.", why: "The trace explains behavior and Regedit independently confirms present state.", observe: "Separate the value name from the containing key and note whether the value existed before the action." },
        { action: "Restore the preference through the application and capture the reverse sequence.", why: "Reversibility is part of a management experiment, not an afterthought.", observe: "The application may delete the value to represent its default rather than writing the old visible choice." }
      ],
      hints: [{ title: "There are thousands of events", body: "Filter to the exact PID first, then include only Registry event classes and capture a single UI action. Do not begin by filtering to one guessed key because that can hide discovery probes." }],
      cleanup: ["Restore the preference and close the application.", "Stop Process Monitor and remove the temporary filters if they would confuse later captures."],
      extension: { title: "Independent variation", prompt: "Explain one NAME NOT FOUND followed by a successful lookup as a fallback policy, using only evidence from the ordered trace." }
    },
    checks: [
      ["Which Registry type preserves a list of separate strings?", ["REG_DWORD", "REG_MULTI_SZ", "REG_BINARY only", "REG_NONE"], 1, "REG_MULTI_SZ represents multiple null-terminated strings and ends with an additional terminator."],
      ["Does HKCR necessarily identify one independent hive file?", ["Yes", "No, it is a merged classes view", "Only on 32-bit Windows", "Only for services"], 1, "HKCR merges relevant per-user and machine class registration views."],
      ["Why record a value's type during backup?", ["The type is needed to preserve interpretation", "It contains the key handle", "It replaces the value name", "It identifies the PID"], 0, "Data alone is insufficient when restoring a typed record."]
    ]
  },

  "registry-python": {
    apis: ["winreg.OpenKey", "winreg.CreateKeyEx", "winreg.QueryValueEx", "winreg.SetValueEx", "winreg.EnumValue", "winreg.DeleteValue"],
    phases: {
      learn: ["Design a reversible Registry operation", "Choose access, view, type, ownership, and restoration before writing."],
      windows: ["Connect Python to native behavior", "Read winreg calls as Registry API contracts and diagnose exact failures."],
      investigation: ["Run the safe probe", "Inspect architecture views and prove a reversible HKCU change."],
      review: ["Check the contract", "Test creation, querying, types, views, and cleanup."]
    },
    learning: [
      { title: "Opening and creating are different promises", paragraphs: ["OpenKey requires the key to exist. CreateKeyEx creates missing path components as permitted but can also return an existing key. Use it only when creation is intended, because a typo can otherwise become new persistent configuration instead of a visible failure.", "Request KEY_QUERY_VALUE, KEY_ENUMERATE_SUB_KEYS, KEY_SET_VALUE, or a suitable combination based on the next operations. KEY_READ and KEY_WRITE are convenient composites, but narrower masks make failures and intent easier to explain."], inlineCheck: ["Which call should a read-only inspector prefer when absence should remain visible?", ["CreateKeyEx", "OpenKey", "SetValueEx", "DeleteKey"], 1, "OpenKey does not silently create the misspelled or missing path."] },
      { title: "Backup must distinguish absent from present", paragraphs: ["A reversible value edit has three starting cases: the value exists with data and type, it is absent while the key exists, or the key itself is absent. Store which case you observed. Restoration means writing the original data and type in the first case, deleting only your new value in the second, and removing only an otherwise-empty lab key you created in the third.", "Do not catch every OSError and label it absent. FileNotFoundError can represent expected absence. PermissionError means the security contract differs. Other errors may indicate invalid data, a deleted key, or another condition that deserves its own report."] },
      { title: "Enumeration is indexed and can race", paragraphs: ["EnumKey and EnumValue accept zero-based indexes until Windows reports no more items. Another process can add or remove entries during enumeration, so results are a snapshot-like observation, not an atomic database transaction.", "QueryInfoKey returns counts and a last-write time that can guide enumeration. Code should preserve full names and types and should avoid assuming an enumeration order has semantic meaning."] }
    ],
    visuals: [{ type: "flow", title: "One reversible value transaction", items: [
      { meta: "Observe", label: "Open narrow key", detail: "Record absent or (data, type)", linkAfter: "change" },
      { meta: "Write", label: "Set exact type", detail: "Only inside owned lab path", linkAfter: "verify" },
      { meta: "Read back", label: "Query and trace", detail: "Confirm data and view", linkAfter: "restore" },
      { meta: "Cleanup", label: "Replace or delete", detail: "Return to exact prior state" }
    ], caption: "The prior-state record determines cleanup. A generic delete is not a safe rollback." }],
    workedExamples: [{ type: "branch", title: "Handle the three query outcomes", prompt: "QueryValueEx(key, 'DemoMode') is used before a reversible write.", setupCode: "QueryValueEx(key, 'DemoMode')", branches: [
      { value: "returns (data, type)", meaning: "The value exists.", action: "Store both, then restore with SetValueEx using the same type." },
      { value: "FileNotFoundError", meaning: "This value is absent in the opened key and view.", action: "After the lab, delete only the value created by the lab." },
      { value: "PermissionError", meaning: "The requested Registry access was denied.", action: "Report root, subkey, view, and mask. Do not reinterpret it as absence." },
      { value: "other OSError", meaning: "Another Registry failure occurred.", action: "Report the Win32 code and stop before changing state." }
    ], conclusion: "Expected absence is a data state. Access denied and other errors are operational failures." }],
    windowsLearning: [
      { title: "winreg preserves the native separation", paragraphs: ["winreg is part of Python's standard library, not pywin32, but it wraps the same Windows Registry interfaces. Predefined HKEY values represent roots, returned PyHKEY objects own open handles, and access constants correspond to native masks.", "Use with statements wherever possible. A closed PyHKEY must not be reused, and a raw integer detached from a wrapper can create unclear ownership."] },
      { title: "Cross-architecture tools should state their view", paragraphs: ["On 64-bit Windows, selected locations have 32-bit and 64-bit logical views. KEY_WOW64_32KEY and KEY_WOW64_64KEY combine with the base access mask. A default view can depend on interpreter architecture, so automation that compares machines should be explicit.", "The view flag does not mean every path is redirected. Microsoft documents which keys are shared or redirected for each supported version. Verify the effective path with Process Monitor when the distinction matters."] }
    ],
    practice: {
      title: "Run a reversible Registry probe",
      time: "30 min",
      intro: "The starter performs read-only view inspection by default and changes only HKCU\\Software\\ILOVEOSLab when explicitly requested.",
      download: ["downloads/registry_views_lab.py", "registry_views_lab.py"],
      expectedOutcome: "The default run reports interpreter width and reads a harmless value through explicit 32-bit and 64-bit flags. The --write-lab run records whether DemoMode existed, writes REG_DWORD 1, reads it back, then restores the original data and type or removes only the value it created.",
      safety: "Review LAB_KEY and VALUE_NAME before execution. Keep the target under HKCU\\Software\\ILOVEOSLab and do not adapt the write exercise to startup or security-policy locations.",
      steps: [
        { action: "Read the starter and identify every requested access mask, view flag, handle owner, and restoration branch.", why: "The safety of the run comes from its contract, not from the filename.", observe: "Confirm the default path has no SetValueEx call and that the write target is exact." },
        { action: "Run py registry_views_lab.py under a Process Monitor filter for the Python PID.", why: "The default run establishes architecture and actual resolved reads before any write.", observe: "Compare 32-bit and 64-bit view operations and note whether the chosen value differs." },
        { action: "Run py registry_views_lab.py --write-lab and watch the HKCU lab path.", why: "The short experiment demonstrates typed write, read-back, and restoration.", observe: "Expect a set followed by either restoration or deletion of DemoMode." },
        { action: "Confirm the final value state in Regedit and explain the relevant branch.", why: "Independent state verification checks that cleanup actually matched the starting case.", observe: "If DemoMode existed before, its original type and data should be present. If absent, it should remain absent." }
      ],
      hints: [{ title: "The two ProductName reads look identical", body: "That is a valid result. Explicit views can return the same data at a shared or equivalent location. The API flags and Process Monitor paths still demonstrate deliberate view selection." }],
      cleanup: ["Confirm DemoMode matches its starting state.", "Delete the ILOVEOSLab key only if you created it and it is empty. Do not recursively delete an unexpected key tree."],
      extension: { title: "Independent variation", prompt: "Add read-only enumeration of the lab key that stops only on the documented no-more-data condition and retains every value type." }
    },
    checks: [
      ["What should be preserved before overwriting an existing value?", ["Only its string form", "Its data and type", "The Python PID", "The HKEY address forever"], 1, "Restoration needs both data and the Registry type."],
      ["Why can CreateKeyEx hide a spelling error?", ["It may create the unintended key", "It changes CPU mode", "It disables exceptions", "It always opens HKLM"], 0, "Creation semantics can turn a missing path into persistent state."],
      ["Which failure should not be reported as ordinary absence?", ["FileNotFoundError for an optional value", "PermissionError", "A recorded absent flag", "An empty REG_SZ"], 1, "Access denied is a distinct authorization outcome."]
    ]
  },

  "services-scm": {
    apis: ["win32service.OpenSCManager", "win32service.OpenService", "win32service.QueryServiceStatusEx", "win32service.QueryServiceConfig", "win32service.EnumServicesStatusEx"],
    phases: {
      learn: ["Model a Windows service", "Separate service registration, host process, runtime state, control, and identity."],
      windows: ["Inspect the SCM", "Use handles, status records, configuration, and complementary management tools."],
      investigation: ["Explain one service", "Build a read-only map from SCM record to process and security context."],
      review: ["Check service reasoning", "Test names, states, access, and lifecycle."]
    },
    learning: [
      { title: "A service is a managed contract, not a synonym for background process", paragraphs: ["The Service Control Manager, hosted by services.exe, maintains a database of registered services and coordinates their lifecycle. A service record contains an internal service name, display name, service type, binary path or host arrangement, start type, account, dependencies, and optional recovery, trigger, and security configuration.", "A service process connects to the SCM dispatcher, registers a control handler, and reports status. Scheduled tasks, startup applications, tray programs, and ordinary detached processes can also run in the background, but they follow different activation and control contracts."] },
      { title: "Configuration and live status answer different questions", paragraphs: ["QueryServiceConfig describes how the SCM should start a service. QueryServiceStatusEx describes the current state, process ID, accepted controls, exit information, checkpoint, and wait hint. A service can be configured for automatic start yet currently stopped, or configured for demand start yet currently running.", "The internal service name is the stable API identifier passed to OpenService. The display name is for people and may contain spaces or change independently. A process filename is neither of those identities."] , inlineCheck: ["Which value should be passed to OpenService?", ["The current PID", "The internal service name", "The display description only", "The thread ID"], 1, "OpenService uses the SCM database key name, not the host PID or friendly description."] },
      { title: "State changes are asynchronous", paragraphs: ["StartService requests a transition. ControlService sends a supported control such as stop. Either can return before the service reaches RUNNING or STOPPED. During START_PENDING or STOP_PENDING, the service reports progress through checkpoint and wait-hint fields.", "A controller should query status, wait a bounded interval derived from the wait hint, check that progress continues, and enforce its own overall timeout. Sleeping once for a hard-coded number of seconds confuses a delayed transition with success or failure."] }
    ],
    visuals: [{ type: "flow", title: "Follow a service start request", items: [
      { meta: "Configuration", label: "SCM database record", detail: "Name, image, account, dependencies", linkAfter: "request start" },
      { meta: "Transition", label: "START_PENDING", detail: "Checkpoint and wait hint should progress", linkAfter: "launch/connect" },
      { meta: "Execution", label: "Service process", detail: "Own PID or shared host, service token", linkAfter: "report" },
      { meta: "Stable state", label: "RUNNING", detail: "Accepted controls describe valid requests" }
    ], caption: "A successful request and a completed transition are two separate observations." }],
    workedExamples: [{ type: "state", title: "Interpret one startup sequence", prompt: "StartService returns success, but the first status query reports START_PENDING.", steps: [
      { title: "STOPPED", action: "The service is registered but has no running instance.", why: "Configuration persists independently of execution.", result: "PID is normally zero." },
      { title: "START_PENDING", action: "The SCM and service are still initializing.", why: "Checkpoint and wait hint communicate bounded progress.", result: "Do not report running yet." },
      { title: "START_PENDING", action: "A later query has a larger checkpoint.", why: "Progress resets the reasonable wait window within the overall deadline.", result: "Continue a bounded poll." },
      { title: "RUNNING", action: "The service reports its stable state and accepted controls.", why: "This is the completion condition for the start operation.", result: "Record PID and final status." }
    ], conclusion: "The state machine, not the return from StartService alone, establishes completion." }],
    windowsLearning: [
      { title: "SCM handles carry independent access decisions", paragraphs: ["OpenSCManager checks rights to the SCM database and returns an SC_HANDLE. OpenService uses that handle plus a service name and requested SERVICE_* rights to return another SC_HANDLE. SC_MANAGER_CONNECT does not itself grant SERVICE_STOP on every service.", "Query status, start, stop, change configuration, delete, and read security are separate service rights. Requesting SERVICE_ALL_ACCESS can fail where a smaller, correct request succeeds and obscures which authority the program truly needs."] },
      { title: "Use complementary evidence", paragraphs: ["Services.msc and Get-Service provide friendly state views. sc qc and QueryServiceConfig expose configuration. Process Explorer maps running services into processes and shows tokens. Process Monitor captures image, Registry, file, and IPC activity during startup. AccessChk explains service permissions.", "A service can share an svchost PID with other services. Attribute an event to the host process carefully and use service-specific paths, endpoints, or control timing before claiming one hosted service caused it."] }
    ],
    practice: {
      title: "Build a read-only service record",
      time: "30 min",
      intro: "Inspect a documented Windows service without starting, stopping, or reconfiguring it.",
      download: ["downloads/service_inventory_lab.py", "service_inventory_lab.py"],
      expectedOutcome: "The starter should print configuration and live status for the internal service name. If running, QueryServiceStatusEx reports a PID that can be correlated with Process Explorer. Hosted services may share that PID, while stopped services normally report PID zero.",
      safety: "Use a read-only service name and do not substitute change-config, delete, start, or stop access. Avoid drawing conclusions about a critical service from a single display name.",
      steps: [
        { action: "Choose a service in Services.msc and record both its display name and internal service name.", why: "The distinction prevents the most common OpenService lookup error.", observe: "Also record current state without changing it." },
        { action: "Run py service_inventory_lab.py <service-name> and label every status and configuration field.", why: "The script keeps desired access and handle ownership visible.", observe: "Distinguish start type from current state, and binary configuration from live PID." },
        { action: "Correlate the reported PID in Process Explorer and note hosted service membership, account, command line, and integrity.", why: "SCM identity and process identity are related but not interchangeable.", observe: "A shared host should list multiple service names for one PID." },
        { action: "Confirm the service's effective control permissions with a read-only AccessChk or sc sdshow query.", why: "Configuration and running state do not explain who may control it.", observe: "Identify query, start, stop, or change rights without modifying the descriptor." }
      ],
      hints: [{ title: "OpenService says the service does not exist", body: "Check that you supplied the internal service name shown in the service properties or sc getkeyname, not only the display name." }],
      cleanup: ["Close the inspection tools.", "No service state or configuration should have changed."],
      extension: { title: "Independent variation", prompt: "Compare two services in the same svchost PID and identify which evidence belongs to the host versus one registered service." }
    },
    checks: [
      ["Does automatic start mean the service is currently running?", ["Always", "No, configuration and current state differ", "Only on x86", "Only for drivers"], 1, "Start type is persistent configuration, while running state is live status."],
      ["What makes a pending transition observable?", ["Only the display name", "Checkpoint and wait hint", "The Registry value type", "A DLL ordinal"], 1, "These status fields communicate expected progress and timing."],
      ["Does SC_MANAGER_CONNECT grant permission to stop every service?", ["Yes", "No", "Only through Python", "Only after reboot"], 1, "The SCM handle and service handle are separate access checks."]
    ]
  },

  "control-services-python": {
    apis: ["OpenSCManagerW", "OpenServiceW", "StartServiceW", "ControlService", "QueryServiceStatusEx", "CloseServiceHandle", "win32service.ControlService"],
    phases: {
      learn: ["Specify the controller contract", "Declare native types, access, results, state transitions, and ownership."],
      windows: ["Diagnose every branch", "Connect ctypes behavior to Advapi32, last error, service state, and safe control."],
      investigation: ["Complete the service controller", "Use query-first behavior and an explicit confirmation boundary."],
      review: ["Check service control", "Test ABI, rights, failure capture, waiting, and cleanup."]
    },
    learning: [
      { title: "pywin32 and ctypes expose the same SCM model at different levels", paragraphs: ["win32service functions already convert many native structures into Python tuples or dictionaries and raise pywintypes.error on failure. ctypes is useful here because the repository practice is specifically about reading native documentation, defining SERVICE_STATUS, assigning argtypes and restype, handling BOOL and null SC_HANDLE results, and selecting the matching closer.", "Do not mix the two models accidentally. A pywin32 service handle is a Python wrapper, while a ctypes SC_HANDLE is a pointer-sized native value. The ownership rule is still one successful open, one CloseServiceHandle."] },
      { title: "Every function has a different input and output contract", paragraphs: ["OpenSCManagerW and OpenServiceW return null on failure. StartServiceW, ControlService, QueryServiceStatusEx, and CloseServiceHandle return zero on failure. ControlService writes an immediate SERVICE_STATUS record, while QueryServiceStatusEx fills a larger SERVICE_STATUS_PROCESS buffer and reports the bytes required.", "Configure use_last_error=True and capture ctypes.get_last_error immediately after a failure. If cleanup must run before raising, preserve the code across cleanup because another API call can replace thread-local last-error state."], inlineCheck: ["Which result indicates OpenServiceW failure?", ["WAIT_TIMEOUT", "A null SC_HANDLE", "SERVICE_RUNNING", "An empty Python list"], 1, "OpenServiceW returns null and sets last error when it cannot open the service."] },
      { title: "Minimum access is selected from the action", paragraphs: ["Query requires SERVICE_QUERY_STATUS. Start requires SERVICE_START plus status query if completion will be verified. Stop requires SERVICE_STOP plus status query. The SCM itself usually needs only SC_MANAGER_CONNECT for these opens.", "Already running, not active, dependent services running, access denied, cannot accept control, and timeout are distinct results. A usable controller names the failed operation and current state instead of printing only a generic failure number."] }
    ],
    visuals: [{ type: "map", title: "Own the two-handle control path", items: [
      { meta: "Advapi32", label: "OpenSCManagerW", detail: "SC_MANAGER_CONNECT", linkAfter: "owns SCM handle" },
      { meta: "SCM database", label: "OpenServiceW", detail: "Action-specific SERVICE_* mask", linkAfter: "owns service handle" },
      { meta: "Service", label: "Request and query", detail: "BOOL result plus status state", linkAfter: "finally" },
      { meta: "Release", label: "Close service, then SCM", detail: "CloseServiceHandle exactly once" }
    ], caption: "If OpenServiceW fails, only the already-open SCM handle needs cleanup." }],
    workedExamples: [
      { type: "contract", title: "Declare ControlService without guessing", prompt: "Translate the native signature into ctypes.", steps: [
        { title: "hService", action: "wintypes.HANDLE", why: "An input SC_HANDLE returned by OpenServiceW.", result: "Pointer-sized value" },
        { title: "dwControl", action: "wintypes.DWORD", why: "SERVICE_CONTROL_STOP or another documented control code.", result: "32-bit unsigned integer" },
        { title: "lpServiceStatus", action: "ctypes.POINTER(SERVICE_STATUS)", why: "Caller-owned output structure passed with ctypes.byref(status).", result: "Seven DWORD fields receive immediate status" },
        { title: "return", action: "wintypes.BOOL", why: "Nonzero means the request was accepted, zero means capture last error.", result: "Not the final service state" }
      ], conclusion: "The output structure and BOOL answer what happened at request time. Later queries establish transition completion." },
      { type: "branch", title: "Handle a start request completely", prompt: "StartServiceW has returned and the controller must decide what to report.", setupCode: "StartServiceW(service, 0, None)", branches: [
        { value: "nonzero", meaning: "The start request was accepted.", action: "Query until RUNNING, a terminal failure state, stalled progress, or overall timeout." },
        { value: "ERROR_SERVICE_ALREADY_RUNNING", meaning: "The desired stable state already exists.", action: "Report it as an idempotent outcome if that matches the tool contract." },
        { value: "ERROR_ACCESS_DENIED", meaning: "The service handle could not exercise SERVICE_START.", action: "Report the requested rights and target. Do not retry with all access." },
        { value: "other error", meaning: "The request failed for another documented reason.", action: "Format the exact error and preserve cleanup." }
      ], conclusion: "A request result, expected idempotent state, authorization failure, and transition timeout deserve different messages." }
    ],
    windowsLearning: [
      { title: "The supplied practice needs a completion loop", paragraphs: ["The repository real_service_controller.py correctly defines the seven SERVICE_STATUS fields, declares the five requested functions, uses action-specific rights, and closes service handles in reverse order. Its success message, however, means only that a start or stop request was sent. It does not query through pending states or prove the target state.", "The improved starter adds QueryServiceStatusEx, read-only query as the default-safe operation, an explicit --confirm gate for changes, progress output, and bounded waiting. This makes the gap between accepted control and completed transition visible."] },
      { title: "Cleanup must not destroy the evidence", paragraphs: ["When OpenServiceW fails after OpenSCManagerW succeeds, read last error first, close the SCM handle, restore the saved code if necessary, then raise. Otherwise CloseServiceHandle can overwrite or confuse the original diagnostic.", "CloseServiceHandle itself can fail, but cleanup reporting should not hide an earlier primary failure. Keep the first causal error and treat cleanup errors as additional context."] }
    ],
    codeWalkthroughs: [{
      title: "The corrected control sequence",
      intro: "Read each stage as an ownership and state contract.",
      stages: [
        { title: "Open the database", explanation: "A successful call creates exactly one owned SCM handle.", code: "scm = OpenSCManagerW(None, None, SC_MANAGER_CONNECT)\nif not scm:\n    fail('OpenSCManagerW')" },
        { title: "Open the named service", explanation: "The access mask contains only status query and the selected action right.", code: "service = OpenServiceW(\n    scm, name, SERVICE_QUERY_STATUS | action_right\n)" },
        { title: "Record initial state", explanation: "This prevents already-running or already-stopped conditions from looking mysterious.", code: "before = query_status(service)\nprint(before.dwCurrentState)" },
        { title: "Request, then wait", explanation: "The immediate BOOL and later state queries answer different questions.", code: "request_change(service)\nfinal = wait_for_state(service, target)" },
        { title: "Close in reverse order", explanation: "The service handle depends conceptually on the SCM session, so release it first.", code: "finally:\n    if service:\n        CloseServiceHandle(service)\n    if scm:\n        CloseServiceHandle(scm)" }
      ]
    }],
    practice: {
      title: "Audit and run the corrected controller",
      time: "50 min",
      intro: "Start with query mode. Change state only for a documented non-critical target in a disposable VM.",
      download: ["downloads/service_controller_lab.py", "service_controller_lab.py"],
      expectedOutcome: "Query mode prints current state and PID without changing anything. Start or stop without --confirm also remains read-only. With explicit confirmation and sufficient rights, the controller prints each observed state until the target stable state is reached or a bounded error is reported.",
      safety: "Do not stop security, storage, networking, logon, update, endpoint-protection, hypervisor, or other critical services. Prefer a lab service you created or a documented harmless service in a disposable VM and record its starting state.",
      steps: [
        { action: "Compare real_service_controller.py with the starter and list each added guarantee.", why: "The goal is to understand why the controller changed, not merely run a replacement.", observe: "Find QueryServiceStatusEx, confirmation, initial status, bounded waiting, progress fields, and complete cleanup." },
        { action: "Run py service_controller_lab.py query <service> from an ordinary terminal.", why: "Read-only mode validates name, signatures, handles, and status access.", observe: "Record state, PID, and any access error with the exact operation." },
        { action: "Run a start or stop command without --confirm and verify that no transition occurs.", why: "The explicit action boundary protects against accidental changes while arguments are being checked.", observe: "The script should print the current state and explain how to confirm." },
        { action: "In the VM, record the starting state, run the appropriate confirmed change from an authorised terminal, and compare with Get-Service.", why: "Independent state evidence verifies the completion loop.", observe: "Follow pending state, checkpoint, wait hint, final state, and PID changes." },
        { action: "Return the lab service to its starting state using the same controlled path.", why: "Restoration is part of completing a management exercise.", observe: "Confirm the final status independently." }
      ],
      hints: [{ title: "The request succeeds but the wait times out", body: "Inspect the last reported state, checkpoint, wait hint, service exit codes, dependencies, and Event Viewer. Do not simply increase the timeout until it looks successful." }],
      cleanup: ["Restore the exact starting state of the lab service.", "Confirm both SCM handles closed even on the failure branch."],
      extension: { title: "Independent variation", prompt: "Add explicit handling for already running and not active, then test that both are reported as stable idempotent outcomes without hiding unrelated errors." }
    },
    checks: [
      ["Which function closes an SC_HANDLE?", ["CloseHandle", "CloseServiceHandle", "FreeLibrary", "RegCloseKey only"], 1, "SCM and service handles use CloseServiceHandle."],
      ["What does a nonzero StartServiceW return prove?", ["The service reached RUNNING", "The request was accepted", "The process can never fail", "The service is automatic"], 1, "Status must be queried to establish completion."],
      ["Why capture last error before cleanup?", ["Cleanup can alter last-error state", "Handles contain the error text", "Python integers expire", "SCM runs in kernel mode"], 0, "Another API call can replace thread-local last-error evidence."]
    ]
  },

  "svchost-background": {
    apis: ["win32service.EnumServicesStatusEx", "win32service.QueryServiceConfig", "win32process.EnumProcessModulesEx", "win32api.OpenProcess"],
    phases: {
      learn: ["Separate service from host", "Distinguish executable services, DLL services, shared hosts, tasks, and startup apps."],
      windows: ["Correlate service and process identity", "Use SCM, Process Explorer, tasklist, Autoruns, and signatures together."],
      investigation: ["Map one host", "Build a bounded service-to-process attribution table."],
      review: ["Check attribution", "Test PID, service name, image path, account, and evidence lifetime."]
    },
    learning: [
      { title: "One PID can host several independently managed services", paragraphs: ["Executable services can run their own image. Many Windows services are implemented in DLLs and need a service host such as svchost.exe to load them and connect their entry points to the SCM. The SCM still tracks each service name, configuration, state, accepted controls, and security separately.", "Modern Windows often splits service groups into more host processes when memory allows, but grouping is policy and version dependent. Never memorize one PID or assume two machines use the same grouping."] },
      { title: "A PID identifies a current host instance, not durable service identity", paragraphs: ["If three services share one svchost PID, process CPU and memory counters belong to the combined host. A service-specific Registry path, endpoint, ETW provider, or carefully timed control experiment may narrow attribution, but a process total cannot be assigned equally or automatically to one service.", "After a host exits, Windows may reuse its PID. Record process creation time and observation interval with service-to-PID mappings."], inlineCheck: ["What does tasklist /svc primarily add to a PID?", ["Hosted service names", "The DACL of every file", "CPU instructions", "Registry value types"], 0, "It maps service names to current process instances."] },
      { title: "Background activation has several mechanisms", paragraphs: ["A scheduled task follows Task Scheduler triggers and credentials. A Run-key entry normally starts in a user logon session. A packaged background task follows app platform rules. A service follows the SCM contract. Autoruns groups many activation locations for investigation, but the mechanisms still have different identities and lifecycles.", "Classify the mechanism before selecting a management API. OpenService cannot manage an arbitrary tray process, and ending a process is not the same as disabling the configuration that starts it."] }
    ],
    visuals: [{ type: "map", title: "Keep three identities in one hosted-service investigation", items: [
      { meta: "SCM identity", label: "Service name", detail: "Durable configuration and control target", linkAfter: "currently hosted by" },
      { meta: "Process identity", label: "PID plus creation time", detail: "One live svchost instance", linkAfter: "loaded from" },
      { meta: "File identity", label: "Full path and signature", detail: "Image provenance", linkAfter: "contains" },
      { meta: "Membership", label: "One or more services", detail: "Shared resource and failure boundary" }
    ], caption: "A familiar basename alone is weaker evidence than the combined identities." }],
    workedExamples: [{ type: "comparison", title: "Classify three background programs", prompt: "Choose the correct identity and control mechanism before changing anything.", columns: [
      { title: "Executable service", rows: [["Registered by", "SCM"], ["Process", "Usually its own image"], ["Control", "Service name and SERVICE_* rights"], ["Evidence", "SCM config plus PID"]] },
      { title: "DLL service", rows: [["Registered by", "SCM"], ["Process", "Loaded into a service host"], ["Control", "Individual service name"], ["Evidence", "Host membership plus ServiceDll"]] },
      { title: "Startup app", rows: [["Registered by", "Run key, Startup folder, or other mechanism"], ["Process", "Ordinary user process"], ["Control", "Owning startup mechanism"], ["Evidence", "Autoruns entry plus process trace"]] }
    ], shared: "All are processes while executing, but their persistent configuration and lifecycle authority differ.", conclusion: "Name the activation mechanism before selecting the management action." }],
    windowsLearning: [
      { title: "Process Explorer and SCM views answer complementary questions", paragraphs: ["Process Explorer can display services inside a selected svchost instance, along with image path, verified signer, token, threads, handles, and counters. EnumServicesStatusEx or sc queryex starts from service records and reports current PIDs. tasklist /svc provides a quick cross-check.", "QueryServiceConfig may show svchost.exe rather than the service DLL. For hosted services, advanced configuration and service-specific Registry data can identify the DLL, but treat configuration as sensitive and remain read-only."] },
      { title: "A shared host creates a shared failure boundary", paragraphs: ["Ending a shared host can interrupt every service inside it, and the SCM may restart the host or services according to policy. Do not use process termination to control one hosted service.", "When investigating load or resource spikes, record service membership before and after the event because host composition can change across restarts and versions."] }
    ],
    practice: {
      title: "Map one current service host",
      time: "25 min",
      intro: "Build the map with read-only tools and state exactly which facts belong to the process versus its services.",
      expectedOutcome: "Process Explorer, tasklist /svc, and SCM status should agree on the current PID and hosted service names. Process-level path, signer, account, integrity, CPU, and memory apply to the host. Service name, configuration, state, accepted controls, and permissions remain per-service facts.",
      steps: [
        { action: "Choose one svchost instance in Process Explorer and record PID, creation time, full path, signer, user, and integrity.", why: "This establishes the live process and file identities.", observe: "Verify that the path is the expected system location rather than trusting the basename." },
        { action: "Record every service listed for that process and confirm the mapping with tasklist /svc or sc queryex.", why: "Two independent views reduce attribution mistakes.", observe: "Expect several services in some hosts and one in others." },
        { action: "For two listed services, query display name, current state, account, and binary configuration without changing them.", why: "The comparison separates host-wide from service-specific properties.", observe: "Note whether configuration names svchost and whether additional data identifies a service DLL." },
        { action: "Write a failure-boundary statement for the host.", why: "The operational consequence of sharing is more important than memorizing one grouping.", observe: "Name every service that could be affected if this exact host exited at the observation time." }
      ],
      hints: [{ title: "Different tools show a different grouping", body: "Refresh both views, check PID reuse and process creation time, and verify that you are comparing the same moment and machine." }],
      cleanup: ["Close the inspection tools without ending or reconfiguring the host.", "Treat the mapping as time-bounded evidence, not permanent inventory."],
      extension: { title: "Independent variation", prompt: "Compare the same service after a reboot or host restart and explain which identities remained stable." }
    },
    checks: [
      ["Can CPU usage of a shared svchost PID be assigned automatically to one hosted service?", ["Yes", "No", "Only if elevated", "Only on x86"], 1, "The process counter covers the host; stronger service-specific evidence is needed."],
      ["What is the durable SCM identity?", ["PID", "Service name", "Thread ID", "Base address"], 1, "The service name persists across process instances."],
      ["Should one hosted service be controlled by terminating svchost?", ["Yes", "No", "Only with Process Explorer", "Only after changing priority"], 1, "Use the individual service control contract and avoid harming co-hosted services."]
    ]
  },

  "wow64-redirection": {
    apis: ["IsWow64Process2", "win32process.IsWow64Process", "winreg.KEY_WOW64_32KEY", "winreg.KEY_WOW64_64KEY", "Wow64DisableWow64FsRedirection"],
    phases: {
      learn: ["Model architecture compatibility", "Separate instruction compatibility, process bitness, DLL bitness, and logical views."],
      windows: ["Trace redirection", "Observe actual file and Registry resolution without relying on historical folder names."],
      investigation: ["Compare explicit views", "Use read-only probes from available interpreter architectures."],
      review: ["Check WoW64 reasoning", "Test System32, SysWOW64, Sysnative, views, and UAC virtualization."]
    },
    learning: [
      { title: "WoW64 lets an x86 process participate in an x64 system", paragraphs: ["On x64 Windows, WoW64 combines CPU compatibility execution, user-mode support DLLs, and operating-system support for 32-bit processes. The process still has 32-bit pointers and loads x86 in-process DLLs. WoW64 does not make one process able to mix x86 and x64 native modules.", "Current ARM64 Windows has additional architecture combinations, so IsWow64Process2 is clearer than inferring everything from one Boolean. It reports the process machine and native machine types used by the compatibility environment."], inlineCheck: ["Can a normal x86 process load an x64 DLL in-process through WoW64?", ["Yes", "No", "Only from System32", "Only with Python"], 1, "In-process native modules must match the process architecture."] },
      { title: "Historical directory names describe a compatibility contract", paragraphs: ["On x64 Windows, System32 contains native 64-bit system components and SysWOW64 contains 32-bit system components. Selected file-system accesses from a 32-bit process are redirected so old applications that ask for System32 receive compatible binaries. The Sysnative alias lets a 32-bit process explicitly reach native System32 where supported.", "Do not hard-code the claim that every path is redirected. Windows documents exclusions, and redirection can depend on operation and version. Use Process Monitor to see the effective resolved path for the actual call."] },
      { title: "Registry views and UAC virtualization are separate mechanisms", paragraphs: ["Selected Registry locations expose 32-bit and 64-bit views. KEY_WOW64_32KEY and KEY_WOW64_64KEY select deliberately. Some keys are shared, and behavior has changed across Windows versions, so the old shortcut that all other keys are shared is not a safe universal rule.", "UAC virtualization is a legacy compatibility feature for selected unelevated applications attempting protected writes. It is based on application compatibility and elevation, not CPU instruction translation. Modern manifested applications should use supported per-user locations instead."] }
    ],
    visuals: [{ type: "map", title: "Resolve one apparent system path", items: [
      { meta: "Caller", label: "Process machine", detail: "x86, x64, ARM64, or compatibility type", linkAfter: "applies policy" },
      { meta: "API layer", label: "WoW64 view", detail: "Selected calls may be redirected", linkAfter: "resolves" },
      { meta: "Effective path", label: "Native or 32-bit component", detail: "Observe full path in Process Monitor", linkAfter: "must match" },
      { meta: "Loader", label: "Process architecture", detail: "In-process DLL architecture remains compatible" }
    ], caption: "The string supplied by the program and the path that Windows opens can differ." }],
    workedExamples: [{ type: "decision", title: "Choose the correct architecture question", prompt: "A 32-bit Python management tool runs on x64 Windows.", steps: [
      { title: "Need the interpreter's pointer width?", action: "Use ctypes.sizeof(c_void_p) or struct.calcsize('P').", why: "This determines local structure and pointer representation.", result: "32 bits" },
      { title: "Need the native host architecture?", action: "Use IsWow64Process2 or a native-system query.", why: "The compatibility process view may differ from the host.", result: "x64 host" },
      { title: "Need a Registry view?", action: "Add KEY_WOW64_32KEY or KEY_WOW64_64KEY to the requested mask.", why: "Explicit selection prevents interpreter defaults from deciding silently.", result: "Known logical view" },
      { title: "Need the actual file opened?", action: "Capture the operation in Process Monitor.", why: "A hard-coded folder-name rule cannot cover every exclusion and version.", result: "Observed resolved path" }
    ], conclusion: "Process width, host architecture, Registry view, and effective file path are related but separate facts." }],
    windowsLearning: [
      { title: "Architecture evidence should agree across layers", paragraphs: ["Process Explorer marks 32-bit processes and lists module paths. PE headers identify machine type. Python pointer size identifies the interpreter process. IsWow64Process2 identifies process and native machine context. Combine the smallest set needed for the question.", "A module-listing tool also has cross-bitness limitations. Prefer EnumProcessModulesEx or a matching observer architecture and state when a tool cannot enumerate every target module."] },
      { title: "Avoid broad redirection disabling", paragraphs: ["Wow64DisableWow64FsRedirection affects the calling thread and can cause unrelated library operations to open architecture-incompatible components. If legacy code truly needs it, keep the scope tiny and always call the matching revert function in finally.", "Explicit paths, supported system APIs, and architecture-matched helpers are clearer. A teaching probe should remain read-only and show redirection rather than disabling it."] }
    ],
    practice: {
      title: "Prove process width and Registry view",
      time: "30 min",
      intro: "Use the read-only starter and Process Monitor. Repeat with both 32-bit and 64-bit Python if both are installed.",
      download: ["downloads/wow64_views_lab.py", "wow64_views_lab.py"],
      expectedOutcome: "The script reports its own pointer width and queries one harmless Registry value through both explicit views. Values may match. A Process Monitor capture should still show the access context, and two interpreter architectures may resolve selected system paths differently.",
      steps: [
        { action: "Run the starter and record pointer width, machine labels, and both view results.", why: "This establishes the observer's architecture before interpreting paths or structures.", observe: "Do not treat identical Registry data as proof that view flags were ignored." },
        { action: "Capture only the Python PID's Registry operations in Process Monitor and repeat the run.", why: "The trace confirms which calls and paths Windows processed.", observe: "Compare the 32-bit and 64-bit view accesses and results." },
        { action: "If both interpreter architectures exist, run the same script under each and compare Process Explorer module lists.", why: "A controlled pair exposes pointer width and architecture-matched DLL selection.", observe: "Record interpreter executable, bitness, and loaded Python DLL path." },
        { action: "Explain System32, SysWOW64, and Sysnative without saying that all file operations are always redirected.", why: "The bounded statement stays correct across documented exclusions.", observe: "Tie every specific claim to an observed operation or current Microsoft rule." }
      ],
      hints: [{ title: "Only one Python architecture is installed", body: "Complete the explicit Registry-view comparison and use a known signed 32-bit application for read-only Process Explorer observation. Do not install unknown binaries merely for this lab." }],
      cleanup: ["Stop the Process Monitor capture and close the test processes.", "The starter performs no Registry or file-system writes."],
      extension: { title: "Independent variation", prompt: "Add a typed IsWow64Process2 ctypes call and report processMachine and nativeMachine symbolically rather than as unexplained integers." }
    },
    checks: [
      ["What does System32 contain on x64 Windows?", ["Native 64-bit system components", "Only x86 DLLs", "Registry hives", "Only drivers for Python"], 0, "The historical name is retained while SysWOW64 holds 32-bit system components."],
      ["Are all Registry keys redirected under WoW64?", ["Yes", "No", "Only on Windows 11", "Only from PowerShell"], 1, "Keys can be shared or redirected according to current documented rules."],
      ["Is UAC virtualization the same as WoW64 redirection?", ["Yes", "No", "Only for administrators", "Only for services"], 1, "They solve different compatibility problems and use different conditions."]
    ]
  }
};
