window.ILOVEOS_LESSON_DEPTH = {
  ...(window.ILOVEOS_LESSON_DEPTH || {}),

  "security-model": {
    apis: ["win32api.OpenProcess", "win32security.OpenProcessToken", "win32security.GetNamedSecurityInfo", "AccessCheck", "GetLastError"],
    phases: {
      learn: ["Build the authorization model", "Reason from subject, requested rights, object policy, and additional Windows boundaries."],
      windows: ["Locate the enforcement points", "Connect tokens, object opens, granted handles, the SRM, LSASS, and auditing."],
      investigation: ["Explain one denied open", "Collect enough evidence to identify the failed policy layer."],
      review: ["Check security reasoning", "Test authentication, authorization, handles, auditing, and minimum rights."]
    },
    learning: [
      { title: "Authorization asks who, what action, and which object", paragraphs: ["A Windows access request can be framed as subject, requested action, and protected object. The subject is the effective security context of the calling thread, normally supplied by its process token. The action is an access mask meaningful to the object's type. The object might be a file, Registry key, process, service, event, section, or another securable resource.", "This model is more precise than saying a user can access a file. One token may open the same object for read but not write, or query a process but not terminate it. The call must request the rights needed by the next operation."], inlineCheck: ["Which item is missing from 'Joel opens a process'?", ["The requested access mask", "A Registry type", "A PE section name", "A CPU cache line"], 0, "Authorization evaluates the specific action requested against that object."] },
      { title: "Authentication, authorization, and auditing are separate", paragraphs: ["Authentication establishes an identity and produces a logon context. Authorization decides whether a requested operation is allowed. Auditing records selected security events only when audit policy and the object's SACL request the relevant audit. A denied operation is not guaranteed to create the exact event you expect.", "LSASS participates in logon policy, authentication packages, account and policy work. The Security Reference Monitor in the kernel enforces object access checks. The SAM and Active Directory store different account scopes. These components cooperate, but they are not interchangeable names for one permission database."] },
      { title: "A successful open creates a capability-like handle", paragraphs: ["When a caller opens an object, Windows evaluates the token, requested mask, object security descriptor, and additional policy. A successful handle table entry records the granted access. Later operations usually validate the required bits against that handle rather than reopening the object's name.", "Changing a DACL later does not normally remove rights already granted to open handles. This is why access investigation must record both current descriptors and handle creation time. Some object-specific protection and revocation mechanisms add constraints beyond this simplified flow."] }
    ],
    visuals: [{ type: "flow", title: "Follow one object-open decision", items: [
      { meta: "Subject", label: "Effective thread token", detail: "User, groups, privileges, integrity", linkAfter: "requests" },
      { meta: "Action", label: "Object-specific mask", detail: "For example PROCESS_QUERY_LIMITED_INFORMATION", linkAfter: "against" },
      { meta: "Object", label: "Security descriptor and policy", detail: "DACL plus mandatory and protection rules", linkAfter: "returns" },
      { meta: "Result", label: "Denied error or granted handle", detail: "Handle stores allowed rights" }
    ], caption: "The username is only one input. Requested rights and object policy complete the question." }],
    workedExamples: [{ type: "trace", title: "Diagnose OpenProcess access denied", prompt: "A tool asks for PROCESS_ALL_ACCESS to read one target's image path and receives error 5.", steps: [
      { title: "State the actual goal", action: "The tool needs only a stable image-path query.", why: "The outcome determines the smallest suitable access right.", result: "PROCESS_QUERY_LIMITED_INFORMATION may be sufficient." },
      { title: "Record the failed contract", action: "Log API, PID and creation time, requested PROCESS_ALL_ACCESS mask, caller token, and error 5.", why: "Without the mask, 'access denied' is underspecified.", result: "The broad request is now visible." },
      { title: "Retry the designed request", action: "Open the owned or permitted target with only the documented query right.", why: "A smaller request can be allowed without changing the caller's identity.", result: "The query may succeed." },
      { title: "Bound the conclusion", action: "Explain that the DACL, integrity, protected-process rules, and target lifetime can all matter.", why: "One successful smaller open does not prove every larger right should be granted.", result: "The fix is least privilege, not blanket elevation." }
    ], conclusion: "Diagnose the exact contract before changing authority." }],
    windowsLearning: [
      { title: "The effective subject can be thread-specific", paragraphs: ["A process normally has a primary token. If a thread is impersonating, its impersonation token supplies the effective subject for supported access checks. This is why the lecture shortcut that only the user matters regardless of thread context is incomplete.", "Process Explorer shows process tokens. Thread impersonation may require a debugger, program output, or OpenThreadToken from within an appropriate context. Always state which token you inspected."] },
      { title: "Access denied is a result to explain", paragraphs: ["Record the precise API, object identity, requested mask, error code, token user and groups, elevation, integrity, relevant privileges, and target descriptor when accessible. AccessChk can estimate effective rights for many object types and Process Explorer shows existing handles and token details.", "Do not begin by requesting all access, enabling every privilege, taking ownership, or changing the DACL. Those actions destroy evidence and increase risk while often failing to address mandatory integrity, protected-process, share-mode, or application-policy boundaries."] }
    ],
    practice: {
      title: "Inspect one process-access contract",
      time: "30 min",
      intro: "Use harmless read-only queries against one process you own.",
      download: ["downloads/process_access_lab.py", "process_access_lab.py"],
      expectedOutcome: "The owned Notepad target should expose one stable PID and creation time. Both read-only OpenProcess probes may succeed, but their output must show the difference between the current Windows SDK PROCESS_ALL_ACCESS composite (0x001FFFFF, including PROCESS_QUERY_LIMITED_INFORMATION) and the image-query minimum PROCESS_QUERY_LIMITED_INFORMATION (0x1000).",
      safety: "Do not change ownership, DACLs, privileges, service configuration, or process memory. Use only the owned Notepad target created by the supplied block.",
      steps: [
        { action: "Open ordinary PowerShell and start one owned Notepad target. Use its printed PID and creation time throughout this investigation.", commands: [{ label: "PowerShell", code: "$ownedTarget = Start-Process -FilePath \"$env:WINDIR\\System32\\notepad.exe\" -PassThru\n$targetPid = $ownedTarget.Id\n\"Owned target: notepad.exe, PID=$targetPid, creation=$($ownedTarget.StartTime.ToString('o'))\"" }], why: "A process created by the learner supplies a stable authorised target without weakening any policy.", observe: "The console shows notepad.exe, a PID, and creation time. If Notepad redirects or exits, Get-Process -Id $targetPid fails and the target must be started again before any probe." },
        { action: "Download process_access_lab.py into this PowerShell folder. In the same ordinary PowerShell, run its read-only open with the current Windows SDK PROCESS_ALL_ACCESS composite (0x001FFFFF); the artifact closes any returned handle without changing process memory.", commands: [{ label: "PowerShell", code: "$target = Get-Process -Id $targetPid -ErrorAction Stop\n\"Target: $($target.ProcessName), PID=$targetPid, creation=$($target.StartTime.ToString('o'))\"\npy .\\process_access_lab.py $targetPid --access all" }], why: "The complete downloaded artifact reports the exact API, object, requested mask, Win32 result, and CloseHandle evidence.", observe: "The OpenProcess line names PROCESS_ALL_ACCESS, requested=0x001FFFFF, handle, numeric error, and message. Error 5 is access denied; on success CloseHandle confirms cleanup. An exited PID is a target-state failure, not a DACL conclusion." },
        { action: "For the same PID, select notepad.exe in Process Explorer's top pane and open Properties > Security; then run AccessChk against that PID if accesschk.exe is installed.", commands: [{ label: "PowerShell", code: "$target = Get-Process -Id $targetPid -ErrorAction Stop\n$accesschk = Get-Command accesschk.exe -ErrorAction SilentlyContinue\nif ($null -eq $accesschk) {\n  'AccessChk unavailable; retain Process Explorer and OpenProcess evidence.'\n} else {\n  & $accesschk.Source -nobanner -p -f $targetPid\n  & $accesschk.Source -nobanner -l -p $targetPid\n}" }], why: "Subject-token and target-object evidence must be correlated to the same process instance.", observe: "Properties > Security shows user, groups and attributes, integrity, elevation, and privilege state. AccessChk shows token and descriptor/mask output. Access denial, an exited PID, or unavailable AccessChk is a visible limitation rather than a reason to change policy." },
        { action: "In the same PowerShell, repeat the downloaded artifact against the same target with only PROCESS_QUERY_LIMITED_INFORMATION (0x1000).", commands: [{ label: "PowerShell", code: "$target = Get-Process -Id $targetPid -ErrorAction Stop\n\"Target: $($target.ProcessName), PID=$targetPid, creation=$($target.StartTime.ToString('o'))\"\npy .\\process_access_lab.py $targetPid --access query-limited" }], why: "The smaller request isolates the access right commonly sufficient for a later image-path query.", observe: "The OpenProcess line names PROCESS_QUERY_LIMITED_INFORMATION and requested=0x00001000; on success CloseHandle confirms cleanup. If it fails, the exact Win32 error remains visible; no privilege or DACL change follows." }
      ],
      hints: [{ title: "The descriptor appears to allow access", body: "Check object-specific mask translation, deny-only groups, integrity policy, protected-process rules, target exit, file share modes, and whether the inspected descriptor is the exact object used by the API." }],
      cleanup: ["Close the owned Notepad window and Process Explorer.", "Both probe handles close immediately; the target token, descriptor, and configuration remain unchanged."],
    },
    checks: [
      ["What does a successful object open normally produce?", ["A handle with granted access", "A new user account", "A Registry hive", "A kernel driver"], 0, "The handle table entry records rights granted by the access check."],
      ["Is authentication the same as authorization?", ["Yes", "No", "Only for services", "Only when elevated"], 1, "Authentication establishes identity, while authorization evaluates a requested action."],
      ["Is every denied access automatically audited?", ["Yes", "No", "Only from Python", "Only for files"], 1, "Audit policy and SACL configuration determine which events are recorded."]
    ]
  },

  "users-groups-sids": {
    apis: ["win32security.LookupAccountName", "win32security.LookupAccountSid", "win32security.ConvertSidToStringSid", "win32security.CreateWellKnownSid", "win32security.CheckTokenMembership"],
    phases: {
      learn: ["Read identity correctly", "Separate account names, SIDs, groups, attributes, domains, and logon-specific identities."],
      windows: ["Resolve and inspect SIDs", "Use whoami, token tools, and pywin32 without treating names as durable keys."],
      investigation: ["Build an identity map", "Resolve current token SIDs and explain their authorization role."],
      review: ["Check identity reasoning", "Test SID structure, renaming, well-known identities, and group attributes."]
    },
    learning: [
      { title: "A SID is the durable authorization identity", paragraphs: ["Windows stores security principals in access-control entries as variable-length security identifiers. A string SID such as S-1-5-32-544 represents revision 1, identifier authority 5, and subauthorities 32 and 544. Account names are human-readable translations that can be renamed and can require a local or domain lookup.", "Local users commonly receive a machine-specific domain SID followed by a relative identifier. Domain accounts use the domain SID plus their RID. Do not infer one exact administrator SID from a partial prefix such as S-1-5-21, because the authority and full subauthority sequence matter."], inlineCheck: ["Why should an audit record retain the SID string?", ["Names can change or fail to resolve", "SIDs are process handles", "The SID contains a password", "It determines CPU bitness"], 0, "The SID remains the authorization identity even when its display name changes."] },
      { title: "Tokens contain more than user plus ordinary groups", paragraphs: ["A token contains the user SID and group SIDs with attributes such as enabled, deny-only, mandatory, owner, and logon identifier. UAC can mark an administrator group deny-only in a filtered token. Restricted SIDs, capabilities, AppContainer SIDs, integrity SIDs, and per-logon SIDs serve specialized policy roles.", "Everyone, Local System, and built-in Administrators are well-known SIDs, but group presence alone does not prove effective authority. Inspect attributes, integrity, token type, elevation, privileges, and requested access."] },
      { title: "Resolution can be incomplete and environment-dependent", paragraphs: ["LookupAccountSid returns account name, domain, and SID type when a resolver knows the identity. Domain resolution can require network services and a deleted account can leave an unresolvable SID on an ACL. Keep the SID string and display unresolved rather than discarding the ACE.", "LookupAccountName can be ambiguous across local and domain scopes. Prefer fully qualified names where possible and verify the returned SID before using it in an access-control change."] }
    ],
    visuals: [{ type: "map", title: "Decode one local account SID", items: [
      { meta: "Revision", label: "S-1", detail: "SID format revision", linkAfter: "authority" },
      { meta: "Authority", label: "5", detail: "NT authority", linkAfter: "domain portion" },
      { meta: "Subauthorities", label: "21-a-b-c", detail: "Machine or domain-specific identity", linkAfter: "relative ID" },
      { meta: "RID", label: "1001", detail: "One account inside that authority" }
    ], caption: "The entire SID identifies the principal. Individual numbers need context." }],
    workedExamples: [{ type: "comparison", title: "Separate identity facts from authorization conclusions", prompt: "An unelevated administrator token contains the Administrators SID.", columns: [
      { title: "What the SID proves", rows: [["Identity", "Built-in Administrators group"], ["Storage", "Group represented in the token"], ["Translation", "Name may resolve locally"]] },
      { title: "What attributes decide", rows: [["Enabled", "Can participate in allows"], ["Deny-only", "Can participate in denies, not allows"], ["Integrity", "Separate mandatory policy input"]] },
      { title: "What still remains", rows: [["Action", "Requested object-specific mask"], ["Object", "DACL and protection policy"], ["Privilege", "Present and enabled state"]] }
    ], conclusion: "Group membership is evidence about the subject, not a universal access grant." }],
    windowsLearning: [
      { title: "Use multiple representations deliberately", paragraphs: ["whoami /user prints the current user SID, and whoami /groups includes attributes. Process Explorer shows token groups for a selected process. ConvertSidToStringSid gives stable text, while LookupAccountSid adds a current friendly translation.", "CheckTokenMembership tests whether a SID is enabled for membership semantics in a token. It is more useful than scanning names, but it still does not replace a complete object access check."] },
      { title: "Object reuse protection is not undelete prevention", paragraphs: ["Windows clears or initializes memory and object data before exposing it across security boundaries so one user cannot simply receive another user's discarded kernel or memory contents. This security-model property is distinct from file-system forensics, where deleted file clusters may remain recoverable until overwritten.", "Keep the object and storage layers separate when interpreting the lecture phrase discarded data."] }
    ],
    practice: {
      title: "Resolve the current token's identities",
      time: "25 min",
      intro: "Use token_summary_lab.py and focus this pass on user and group SIDs.",
      download: ["downloads/token_summary_lab.py", "token_summary_lab.py"],
      expectedOutcome: "The user SID should resolve to the current account. Group rows should contain SID strings, attributes, and names where resolvable. The output may include logon, integrity, capability, deny-only, or unresolved identities that do not fit a simple username list.",
      steps: [
        { action: "Download token_summary_lab.py, open ordinary PowerShell in its folder, and run whoami plus token_summary_lab.py from that one security context.", commands: [{ label: "PowerShell", code: "whoami.exe /user\nwhoami.exe /groups\npy .\\token_summary_lab.py" }], why: "Two read-only views verify the inherited current-token context.", observe: "The User SID matches exactly. whoami and token_summary_lab.py show group SID, hexadecimal attributes, and resolved or unresolved name. If pywin32 is unavailable, whoami remains visible with the dependency error." },
        { action: "In token_summary_lab.py output, locate User, User SID, Integrity SID, and the ordered Groups rows.", why: "The named fields separate account identity, mandatory integrity, and group membership.", observe: "User SID is stable text; Integrity SID is a mandatory label; group rows can include well-known, machine/domain, logon-specific, capability, deny-only, or unresolved identities." },
        { action: "In the same token_summary_lab.py output, inspect hexadecimal group attributes and any unresolved name row.", why: "Attributes determine how a present SID participates in access checks, while name lookup is only a translation.", observe: "Enabled, deny-only, and disabled attributes remain distinct. An unresolved name retains its raw SID and does not disappear from the output." }
      ],
      hints: [{ title: "No group is marked deny-only", body: "That can be valid for the selected account and token. Compare an ordinary and elevated administrator token later in the UAC lesson rather than manufacturing a group state." }],
      cleanup: ["Close the terminal.", "token_summary_lab.py changes no token or account state."],
    },
    checks: [
      ["What do ACLs store for a principal?", ["Only its current display name", "Its SID", "Its password", "Its PID"], 1, "SIDs are the durable identities used in access-control entries."],
      ["Can an unresolved SID still be meaningful?", ["Yes", "No", "Only on x86", "Only for services"], 0, "The identity remains in the token or ACL even if no current name translation exists."],
      ["Does Administrators SID presence alone prove every access request will succeed?", ["Yes", "No", "Only in Python", "Only for files"], 1, "Attributes, integrity, privileges, requested mask, and object policy still matter."]
    ]
  },

  "access-tokens": {
    apis: ["win32security.OpenProcessToken", "win32security.OpenThreadToken", "win32security.GetTokenInformation", "win32security.LookupPrivilegeName", "win32api.CloseHandle"],
    phases: {
      learn: ["Read the token as a security snapshot", "Understand primary and impersonation tokens, information classes, access rights, and lifetime."],
      windows: ["Inspect effective context", "Turn token tuples into identity, group, privilege, elevation, and integrity evidence."],
      investigation: ["Build a token summary", "Compare the same script across ordinary and elevated contexts."],
      review: ["Check token reasoning", "Test ownership, token type, access masks, and effective-thread rules."]
    },
    learning: [
      { title: "A token packages effective security state", paragraphs: ["After authentication, Windows creates an access token that references a logon session and contains user and group SIDs with attributes, privileges, token type, impersonation level where relevant, integrity label, elevation information, session, default DACL, owner, primary group, and other restrictions. It does not contain the user's password.", "A process normally has a primary token used as the default subject for its threads. A thread can carry an impersonation token. When present and usable for the operation, the thread token takes precedence over the process token for access checks."], inlineCheck: ["What token does a non-impersonating thread normally use?", ["Its process primary token", "The target object's owner token", "A random service token", "No token"], 0, "The process primary token supplies the default security context."] },
      { title: "Token handles have their own access mask", paragraphs: ["OpenProcessToken requires a process handle suitable for token query and returns a token handle. TOKEN_QUERY permits information reads. TOKEN_ADJUST_PRIVILEGES permits privilege-state changes. TOKEN_DUPLICATE permits copying. TOKEN_ASSIGN_PRIMARY concerns use as a primary token. These handle rights are separate from the privileges stored inside the token.", "Opening a process with PROCESS_ALL_ACCESS does not automatically grant every token right, and holding SeDebugPrivilege does not make cleanup optional. Request the smallest process and token rights required by the next call."] },
      { title: "GetTokenInformation changes output shape by information class", paragraphs: ["TokenUser returns a SID-and-attributes record, TokenGroups returns a sequence, TokenPrivileges returns LUID-and-attribute entries, TokenType identifies primary or impersonation, TokenElevationType describes UAC linkage, and TokenIntegrityLevel contains a label SID. The caller must interpret each class according to its contract.", "A readable report translates SIDs and privilege LUIDs while retaining raw values and attributes. Avoid dumping tuples with no labels because that hides which fields drive authorization."] }
    ],
    visuals: [{ type: "map", title: "Read the current security context", items: [
      { meta: "Process", label: "Primary token", detail: "Default subject for threads", linkAfter: "thread may override" },
      { meta: "Thread", label: "Impersonation token?", detail: "If absent, fall back to primary", linkAfter: "effective token" },
      { meta: "Contents", label: "SIDs, attributes, privileges", detail: "Integrity, elevation, restrictions", linkAfter: "access check" },
      { meta: "Object open", label: "Requested rights", detail: "Produces denial or granted handle" }
    ], caption: "The effective token is chosen before its contents are evaluated against the object." }],
    workedExamples: [{ type: "contract", title: "Open and summarize the current token", prompt: "The program needs user, groups, privileges, elevation, and integrity only.", steps: [
      { title: "Process reference", action: "GetCurrentProcess()", why: "This pseudo-handle identifies the current process and is not owned for closing.", result: "No CloseHandle for the pseudo-handle" },
      { title: "Token open", action: "OpenProcessToken(process, TOKEN_QUERY)", why: "All requested information classes are read-only.", result: "One owned token handle" },
      { title: "Information reads", action: "Call GetTokenInformation for each named class.", why: "Each output has a different documented Python shape.", result: "Typed security evidence" },
      { title: "Translation", action: "Resolve SIDs and LUIDs while retaining their raw forms.", why: "Names improve readability but are not durable identifiers.", result: "Human-readable report" },
      { title: "Cleanup", action: "Close the token in finally.", why: "The successful open created an owned kernel handle.", result: "No token-handle leak" }
    ], conclusion: "TOKEN_QUERY is sufficient for inspection. Stored privileges do not change merely because the token was opened." }],
    windowsLearning: [
      { title: "Token views are time and process specific", paragraphs: ["Process Explorer Properties > Security and token_summary_lab.py should describe the same process instance and context. Launching another Python from an elevated terminal creates a separate process with a different token; it does not upgrade the already-running ordinary process.", "A service process may use Local System, Network Service, Local Service, a virtual account, a managed service account, or a configured user. Account name alone still does not summarize restrictions, integrity, privileges, session, or protection level."] },
      { title: "Token output needs interpretation", paragraphs: ["Privilege attributes distinguish enabled, enabled by default, removed, and used for access. Group attributes distinguish enabled and deny-only behavior. Integrity is encoded as a mandatory label SID whose RID maps to levels such as Low, Medium, High, and System.", "If an information class is not available on an older environment, report that limitation rather than inventing a default value."] }
    ],
    practice: {
      title: "Compare two current-token summaries",
      time: "35 min",
      intro: "Run the read-only token_summary_lab.py first normally, then from an elevated terminal if UAC is available.",
      download: ["downloads/token_summary_lab.py", "token_summary_lab.py"],
      expectedOutcome: "Both reports should show the same user SID but may differ in Administrators group attributes, elevation type, elevated flag, integrity SID, and enabled privileges. Each run opens and closes only its own token.",
      steps: [
        { action: "Open token_summary_lab.py and locate the TokenUser, TokenGroups, TokenPrivileges, TokenType, TokenElevationType, TokenElevation, and TokenIntegrityLevel queries beside their printed fields.", why: "The report is useful only if tuple fields are interpreted correctly.", observe: "The file labels User/User SID, group SID/hex-attribute/name, privilege name/state, numeric token and elevation type, Boolean Elevated, and Integrity SID. Unsupported information classes surface as errors, not automatic defaults." },
        { action: "From ordinary PowerShell in the folder containing token_summary_lab.py, display the terminal PID and run the report.", commands: [{ label: "Ordinary PowerShell", code: "\"Ordinary PowerShell PID: $PID\"\nwhoami.exe /user\nwhoami.exe /groups\npy .\\token_summary_lab.py" }], why: "The PowerShell PID provides a stable inherited-token peer that remains visible after the short Python child exits.", observe: "Select that PID in Process Explorer's top pane and open Properties > Security. User SID, group attributes, integrity, elevation, and privilege states correspond to token_summary_lab.py. pywin32 or Process Explorer access limitations remain explicit missing fields." },
        { action: "Through the normal UAC flow, open a separate elevated PowerShell in the same folder, display that terminal PID, and run token_summary_lab.py there.", commands: [{ label: "Elevated PowerShell", code: "\"Elevated PowerShell PID: $PID\"\nwhoami.exe /user\nwhoami.exe /groups\npy .\\token_summary_lab.py" }], why: "A separate process isolates token differences introduced by elevation without changing the ordinary terminal.", observe: "Select the elevated PID in Process Explorer's top pane and open Properties > Security. The same named fields can differ in group attributes, integrity, elevation, and enabled privileges. UAC unavailable or cancelled leaves this branch unavailable while the ordinary result remains valid." }
      ],
      hints: [{ title: "TokenElevation information fails", body: "The named query error remains visible while supported classes continue. A missing query does not imply a non-elevated token." }],
      cleanup: ["Close both PowerShell comparison terminals and Process Explorer.", "token_summary_lab.py closes its TOKEN_QUERY handle in finally before each short Python process exits."],
    },
    checks: [
      ["Does TOKEN_QUERY enable contained privileges?", ["Yes", "No", "Only for administrators", "Only for services"], 1, "Token-handle access and the privilege attributes inside the token are distinct."],
      ["What does TokenPrivileges return?", ["LUID and attribute entries", "File paths", "Service PIDs only", "Registry keys"], 0, "Privilege names can be resolved from their LUIDs."],
      ["Should GetCurrentProcess's pseudo-handle be closed?", ["Yes", "No", "Only after elevation", "Only with CloseServiceHandle"], 1, "The pseudo-handle is not an owned real handle from an open call."]
    ]
  },

  "security-descriptors-dacls-aces": {
    apis: ["win32security.GetNamedSecurityInfo", "win32security.SetNamedSecurityInfo", "win32security.SECURITY_DESCRIPTOR", "win32security.ACL", "GetSecurityDescriptorDacl", "GetAce"],
    phases: {
      learn: ["Decode the object policy", "Separate owner, group, DACL, SACL, control flags, ACE order, inheritance, and object-specific masks."],
      windows: ["Read descriptors safely", "Translate pywin32 structures and corroborate them with icacls and AccessChk."],
      investigation: ["Decode a lab-file DACL", "Explain every ACE without rewriting the descriptor."],
      review: ["Check descriptor reasoning", "Test null and empty DACLs, canonical order, inheritance, and generic mapping."]
    },
    learning: [
      { title: "A security descriptor is a structured policy record", paragraphs: ["A self-relative or absolute security descriptor can identify an owner SID, primary group SID, discretionary ACL, system ACL, and control flags. The DACL governs discretionary access. The SACL can contain audit ACEs and mandatory labels and normally requires additional rights or privilege to inspect.", "The owner does not simply bypass all DACL checks. Ownership grants the ability to request rights such as READ_CONTROL and WRITE_DAC under defined rules, and owner rights can also be represented explicitly. Continue to reason from requested mask and the complete descriptor."], inlineCheck: ["Which component normally governs discretionary access?", ["DACL", "SACL only", "PID", "PE import table"], 0, "The DACL contains allow and deny ACEs used for discretionary authorization."] },
      { title: "Null, empty, absent-from-query, and not-present are different", paragraphs: ["A null DACL means no discretionary restriction and therefore grants full access subject to other policy. A present empty DACL contains no allows and grants no discretionary access. A caller that did not request DACL_SECURITY_INFORMATION simply has no DACL data in its result, which says nothing about the object's actual policy.", "These states must be displayed explicitly. Converting all of them to an empty Python list can reverse the security conclusion."] },
      { title: "An ACE mask only has meaning for its object type", paragraphs: ["Each ACE has a type, flags, access mask, and SID, with additional fields for object ACE variants. The same numeric bit can mean different operations for files, processes, Registry keys, services, and synchronization objects. Generic rights must be mapped through an object-specific GENERIC_MAPPING before evaluation.", "Canonical DACLs normally order explicit deny ACEs before explicit allows, then inherited groups in canonical order. Inheritance flags describe propagation and origin. A tool should retain unknown ACE types rather than dropping them."] }
    ],
    visuals: [{ type: "map", title: "Open one security descriptor", items: [
      { meta: "Control", label: "Present, protected, self-relative", detail: "Flags describe descriptor form and inheritance", linkAfter: "contains" },
      { meta: "Identity", label: "Owner and primary group", detail: "SIDs, not display names", linkAfter: "policy" },
      { meta: "DACL", label: "Ordered ACE list or null", detail: "Discretionary access", linkAfter: "additional policy" },
      { meta: "SACL", label: "Audit and mandatory labels", detail: "Separate access requirements" }
    ], caption: "A descriptor is more than a permission string, and a DACL is more than unordered user names." }],
    workedExamples: [{ type: "branch", title: "Interpret DACL presence correctly", prompt: "pywin32 returns the ACL directly, so use descriptor control flags to retain native presence semantics.", setupCode: "control, revision = sd.GetSecurityDescriptorControl()\npresent = bool(control & SE_DACL_PRESENT)\ndacl = sd.GetSecurityDescriptorDacl()", branches: [
      { value: "present=False", meaning: "No DACL is present in the descriptor.", action: "Treat discretionary access as unrestricted, while still considering mandatory and other policy." },
      { value: "present=True, dacl=None", meaning: "The DACL is null.", action: "Report the dangerous grant-all discretionary state explicitly." },
      { value: "present=True, ACE count 0", meaning: "The DACL is present and empty.", action: "No discretionary allow ACE can grant requested access." },
      { value: "present=True, ACEs", meaning: "An ordered policy exists.", action: "Interpret each applicable ACE by type, SID attributes, mask, flags, and object type." }
    ], conclusion: "Null and empty DACLs have opposite authorization effects." }],
    windowsLearning: [
      { title: "Read first and preserve unknown structure", paragraphs: ["GetNamedSecurityInfo can retrieve owner, group, DACL, or SACL for files, Registry keys, services, and other named object types. The selected SE_OBJECT_TYPE changes name interpretation and access masks. Ask only for the components needed.", "Before any permitted lab edit, retain the original descriptor or exact DACL, inheritance flags, and order. SetNamedSecurityInfo is a high-impact operation and should not be used on production targets merely to demonstrate a read lesson."] },
      { title: "Cross-check translations", paragraphs: ["The starter prints ACE types, raw hexadecimal masks, flags, SID strings, and resolved names. icacls presents file permissions and inheritance in a compact familiar form. AccessChk shows effective or verbose access. Differences often reflect generic-right expansion, inherited shorthand, unsupported ACE types, or tool formatting.", "A child file normally inherits ACEs from its parent according to flags. It does not inherit the parent's token or use the parent process DACL as its main security identity. Keep object policy inheritance separate from process-token inheritance at creation."] }
    ],
    practice: {
      title: "Decode a disposable file DACL",
      time: "35 min",
      intro: "Create one named disposable file, inspect it with dacl_reader_lab.py, and leave its descriptor unchanged.",
      download: ["downloads/dacl_reader_lab.py", "dacl_reader_lab.py"],
      expectedOutcome: "dacl_reader_lab.py should print the owner and every DACL ACE with order, type, mask, flags, SID, and name where resolvable. icacls and AccessChk should describe the same policy using different formatting. Inherited ACE flags should relate to the parent directory.",
      steps: [
        { action: "Download dacl_reader_lab.py, open PowerShell in its folder, create only .\\iloveos-dacl-lab\\sample.txt, and display the lab directory and file permissions.", commands: [{ label: "PowerShell", code: "$lab = Join-Path $PWD 'iloveos-dacl-lab'\n$file = Join-Path $lab 'sample.txt'\nif (Test-Path -LiteralPath $lab) { throw \"Remove or rename the existing lab folder first: $lab\" }\nNew-Item -ItemType Directory -Path $lab | Out-Null\nSet-Content -LiteralPath $file -Value 'ILOVEOS disposable DACL target' -Encoding utf8\nicacls.exe $lab\nicacls.exe $file" }], why: "The named parent supplies context for inherited ACEs and the guard avoids overwriting prior data.", observe: "PowerShell shows the resolved lab path context and icacls rows without /grant, /deny, /inheritance, /setowner, or /reset. A file-creation error stops before descriptor analysis." },
        { action: "Run dacl_reader_lab.py against the exact .\\iloveos-dacl-lab\\sample.txt target.", commands: [{ label: "PowerShell", code: "$file = Join-Path $PWD 'iloveos-dacl-lab\\sample.txt'\nif (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw \"Disposable file not found: $file\" }\npy .\\dacl_reader_lab.py $file" }], why: "Raw structure prevents friendly UI text from hiding semantics.", observe: "The report shows Path, Owner name/SID, DACL present/defaulted flags, ACE count, and every ordered type/mask/flags/SID/name row. Unresolved SID strings and numeric type labels remain visible." },
        { action: "Compare that exact sample.txt descriptor with icacls and AccessChk without changing it.", commands: [{ label: "PowerShell", code: "$file = Join-Path $PWD 'iloveos-dacl-lab\\sample.txt'\nicacls.exe $file\n$accesschk = Get-Command accesschk.exe -ErrorAction SilentlyContinue\nif ($null -eq $accesschk) {\n  'AccessChk unavailable; retain dacl_reader_lab.py and icacls evidence.'\n} else {\n  & $accesschk.Source -nobanner -l $file\n}" }], why: "Independent tools verify the descriptor while presenting different abstractions.", observe: "Map generic or shorthand rights back to dacl_reader_lab.py hexadecimal file-specific masks. Access denied or unavailable AccessChk limits the comparison but does not justify altering the descriptor." },
        { action: "Remove only sample.txt and remove iloveos-dacl-lab only if it is empty.", commands: [{ label: "PowerShell cleanup", code: "$lab = Join-Path $PWD 'iloveos-dacl-lab'\n$file = Join-Path $lab 'sample.txt'\nif (Test-Path -LiteralPath $file -PathType Leaf) { Remove-Item -LiteralPath $file }\nif ((Test-Path -LiteralPath $lab -PathType Container) -and -not (Get-ChildItem -LiteralPath $lab -Force)) { Remove-Item -LiteralPath $lab }\n\"sample.txt present after cleanup: $(Test-Path -LiteralPath $file)\"" }], why: "Cleanup is bounded to the two names created by this investigation.", observe: "PowerShell prints sample.txt present after cleanup: False. An unexpected item preserves the folder instead of triggering recursive deletion." }
      ],
      hints: [{ title: "dacl_reader_lab.py encounters an unfamiliar ACE tuple", body: "The raw tuple and ACE type remain visible. dacl_reader_lab.py intentionally handles the common basic allow and deny form without hiding other data." }],
      cleanup: ["Delete only the disposable text file you created.", "No descriptor should have been changed."],
    },
    checks: [
      ["What does an empty DACL grant?", ["Full access", "No discretionary access", "Read only", "Administrator only"], 1, "It contains no allowing ACEs."],
      ["What does a null DACL grant?", ["No access", "Full discretionary access", "Execute only", "Owner only"], 1, "A null DACL imposes no discretionary restriction."],
      ["Can one numeric ACE mask be interpreted without the object type?", ["Reliably, yes", "No", "Only on x64", "Only if elevated"], 1, "Object-specific rights give the bits their meaning."]
    ]
  },

  "access-check": {
    apis: ["AccessCheck", "win32security.MapGenericMask", "win32security.DuplicateTokenEx", "win32file.CreateFile", "GetLastError"],
    phases: {
      learn: ["Evaluate requested bits", "Follow generic mapping, token SIDs, ACE order, owner rules, privileges, and mandatory policy."],
      windows: ["Predict before opening", "Use AccessCheck as a model and a real open as the operational result."],
      investigation: ["Verify a disposable target", "Compare predicted read and write with an actual file open."],
      review: ["Check access evaluation", "Test denies, allows, remaining bits, existing handles, and non-DACL failures."]
    },
    learning: [
      { title: "The access check works on requested bits", paragraphs: ["The caller supplies an access mask. Generic bits such as GENERIC_READ are mapped to the object's specific standard and object rights. The algorithm tracks rights still required, considers applicable token SIDs and owner or privilege rules, and processes relevant DACL ACEs in order until requested bits are denied or all are granted.", "An allow ACE grants matching remaining bits for an enabled SID. A deny ACE denies matching remaining bits for an applicable SID. This is why canonical ordering matters and why adding together every allow while ignoring order gives incorrect results."], inlineCheck: ["What must happen before interpreting GENERIC_READ against a file DACL?", ["Map it to file-specific rights", "Convert it to a SID", "Enable SeDebugPrivilege", "Load Advapi32 twice"], 0, "Generic rights are expanded with the object's GENERIC_MAPPING."] },
      { title: "SID attributes change applicability", paragraphs: ["The user SID and enabled group SIDs can satisfy allow and deny ACEs. A deny-only group participates in denies but cannot grant an allow. Disabled groups normally do not participate. Restricted tokens add another limiting pass in which both ordinary and restricting SID sets must permit the access.", "Privileges can grant particular system operations or bypass selected checks under documented rules, but they are not a general override. Ownership and mandatory integrity policy add further inputs."] },
      { title: "AccessCheck predicts a policy decision, while a real open includes object behavior", paragraphs: ["The AccessCheck API evaluates a security descriptor for an impersonation token and generic mapping. A real CreateFile or OpenProcess can additionally fail because the object disappeared, file sharing conflicts, a path component denied traversal, protected-process policy applied, or application and device rules rejected the operation.", "Treat the real API result as authoritative for the attempted operation. Use AccessCheck and descriptor reasoning to explain the discretionary portion, not to promise the open must succeed in every surrounding condition."] }
    ],
    visuals: [{ type: "flow", title: "Evaluate one requested mask", items: [
      { meta: "Request", label: "GENERIC_READ", detail: "Caller intent", linkAfter: "map" },
      { meta: "Specific bits", label: "FILE_GENERIC_READ", detail: "Read data, attributes, EA, synchronize, standard read", linkAfter: "walk ACEs" },
      { meta: "DACL", label: "Deny and allow in order", detail: "Only applicable SIDs and remaining bits", linkAfter: "layer policy" },
      { meta: "Decision", label: "Granted mask or denial", detail: "Integrity and object rules may further restrict" }
    ], caption: "The algorithm evaluates one object type and one requested mask, not a generic yes or no permission." }],
    workedExamples: [{ type: "trace", title: "Walk a mixed DACL", prompt: "Joel is in Readers. The requested mask contains READ and WRITE. The canonical DACL denies Joel WRITE, then allows Readers READ and WRITE.", steps: [
      { title: "Start with required bits", action: "Remaining = READ | WRITE.", why: "Only requested bits affect this decision.", result: "READ and WRITE unresolved" },
      { title: "Apply explicit deny", action: "Joel SID matches DENY WRITE.", why: "WRITE is still requested and the SID applies.", result: "The request is denied for WRITE" },
      { title: "Do not rescue denied access", action: "The later Readers allow cannot reverse the matching explicit denial.", why: "Canonical deny ordering makes the policy deterministic.", result: "Combined READ | WRITE request fails" },
      { title: "Change the request", action: "A READ-only request does not intersect the WRITE deny and can be granted by Readers.", why: "Access checks evaluate the exact requested mask.", result: "READ-only can succeed" }
    ], conclusion: "A broad request can fail even when the subset actually needed would be granted." }],
    windowsLearning: [
      { title: "AccessCheck is a deliberate ctypes edge", paragraphs: ["Current pywin32 builds expose token and descriptor helpers but not AccessCheck itself. The starter therefore declares the native Advapi32 call, obtains an impersonation-token duplicate, and owns the privilege-set buffer, granted-mask output, and access-status output explicitly.", "Provide the correct GENERIC_MAPPING for the object. File mappings are not valid for process, service, Registry, or event masks. A false AccessStatus is a completed denied decision, while a zero API BOOL means the evaluation call itself failed."] },
      { title: "Existing handles keep their granted mask", paragraphs: ["If a process already owns a file handle with write access, tightening the file DACL does not normally erase the WRITE bit in that handle table entry. New opens face the new descriptor. This does not mean every operation is immune to object deletion, lease, file-system, or application rules.", "AccessChk is useful for a current effective view, while Process Explorer can show access masks on existing handles. Record which time boundary each tool describes."] }
    ],
    practice: {
      title: "Inspect and verify file access",
      time: "35 min",
      intro: "access_check_lab.py creates its own temporary file, evaluates read and write with AccessCheck, verifies a read open, and removes the file.",
      download: ["downloads/access_check_lab.py", "access_check_lab.py"],
      expectedOutcome: "For the creator's current token, the temporary file should normally allow generic read and write under its inherited DACL, and the real read open should succeed. The script uses an impersonation-token duplicate for AccessCheck and closes every token and file handle before deleting the target.",
      safety: "Keep the target as access_check_lab.py's temporary iloveos_access_*.txt file. Do not adapt the first run to protected files, process tokens, or production ACL changes.",
      steps: [
        { action: "Open access_check_lab.py and locate GENERIC_READ/GENERIC_WRITE, the four FILE_GENERIC_* mappings, TOKEN_QUERY|TOKEN_DUPLICATE, the SecurityImpersonation duplicate, the LocalFree descriptor, both token handles, and the temporary file lifetime.", why: "AccessCheck is easy to misuse when token type, mapping, or ownership is implicit.", observe: "access_check_lab.py creates its own iloveos_access_*.txt target, accepts no production path, changes no DACL, and releases the descriptor, tokens, and file in finally." },
        { action: "From PowerShell in the folder containing access_check_lab.py, run the complete controlled check.", commands: [{ label: "PowerShell", code: "py .\\access_check_lab.py" }], why: "The artifact supplies both the discretionary check and the real read operation.", observe: "The console shows Disposable target, then each generic, mapped, granted, and allowed field. API failure is distinct from allowed=False and includes the named operation and Win32 error." },
        { action: "Inspect access_check_lab.py's GENERIC_READ row beside 'The real read open also succeeded.' and the final cleanup line.", why: "The adjacent output separates discretionary evaluation, operational confirmation, and resource lifetime.", observe: "The stable local file normally shows allowed=True and a successful real read, followed by 'Removed the disposable file.' A disagreement or earlier error remains visible without any permission rewrite." }
      ],
      hints: [{ title: "AccessCheck itself returns zero", body: "Check the ctypes declaration, impersonation token, mapped specific mask, GENERIC_MAPPING layout, privilege-set buffer size, and saved Win32 error. Do not treat a completed access-status false result as an API failure." }],
      cleanup: ["Confirm the temporary file was removed.", "Confirm token duplicates and file handles close in finally blocks."],
    },
    checks: [
      ["Can a later allow ACE reverse a matching canonical explicit deny for a requested bit?", ["Yes", "No", "Only if elevated", "Only for files"], 1, "The denied requested bit causes the access request to fail."],
      ["Why can READ-only succeed when READ|WRITE fails?", ["The exact requested bits differ", "PIDs change the DACL", "Python disables write", "The SID is deleted"], 0, "The write denial does not intersect a read-only request."],
      ["Does AccessCheck model every possible reason CreateFile can fail?", ["Yes", "No", "Only under UAC", "Only with MAXIMUM_ALLOWED"], 1, "Object state, sharing, path traversal, and other policy can add failure conditions."]
    ]
  },

  "privileges-impersonation": {
    apis: ["win32security.LookupPrivilegeValue", "win32security.AdjustTokenPrivileges", "win32security.DuplicateTokenEx", "win32security.ImpersonateLoggedOnUser", "win32security.RevertToSelf", "win32process.CreateProcessAsUser"],
    phases: {
      learn: ["Separate privilege, impersonation, and primary-token use", "Track possession, enabled state, token type, impersonation level, access, and ownership."],
      windows: ["Audit the leverage chain", "Correct the supplied script's duplication, privilege-result, environment, and cleanup paths."],
      investigation: ["Inspect before launching", "Use safe starters to observe privilege state and a same-user dry-run token duplicate."],
      review: ["Check elevated operations", "Test missing privileges, thread scope, token types, process creation, and restoration."]
    },
    learning: [
      { title: "Privileges are named token capabilities, not object ACEs", paragraphs: ["Privileges authorize defined system-wide operations such as debugging processes, backing up data, restoring data, taking ownership, assigning a primary token, increasing quotas, or shutting down. A privilege must be present in the token and often enabled when used. Account rights determine which privileges can appear at logon.", "AdjustTokenPrivileges changes attributes of privileges already represented in the token. It cannot add SeDebugPrivilege or another absent privilege. The native function can return success while setting ERROR_NOT_ALL_ASSIGNED, so the caller must distinguish call completion from requested-state completion."], inlineCheck: ["Can AdjustTokenPrivileges grant an absent privilege?", ["Yes", "No", "Only when elevated", "Only to services"], 1, "It changes attributes for privileges already held by the token."] },
      { title: "Impersonation changes one thread's effective subject", paragraphs: ["A server can impersonate a client so file, Registry, and other access checks use the client's context while servicing that request. Impersonation levels control what identity information can be used and whether remote delegation is permitted. An impersonation token is not automatically suitable as a process primary token.", "Always place RevertToSelf in finally immediately around the work that needs impersonation. Performing unrelated logging, callbacks, or control operations while impersonating can apply the wrong identity and leak authority across requests."] },
      { title: "Process creation needs a primary token and a full launch contract", paragraphs: ["DuplicateTokenEx can produce TokenPrimary or TokenImpersonation. CreateProcessAsUser requires a suitable primary token, relevant handle access, and often SeIncreaseQuotaPrivilege or SeAssignPrimaryTokenPrivilege depending on the token relationship and environment. It returns owned process and thread handles plus IDs.", "The new process does not automatically receive the source user's loaded profile or a correct user-specific environment when None is supplied. Production code may need LoadUserProfile and CreateEnvironmentBlock with matching cleanup. A command line also needs safe quoting and application-path rules."] }
    ],
    visuals: [{ type: "map", title: "Keep the token operations distinct", items: [
      { meta: "Current token", label: "Privilege present?", detail: "Enabled or disabled attribute", linkAfter: "may adjust" },
      { meta: "Thread scope", label: "Impersonation token", detail: "Temporary effective subject, always revert", linkAfter: "or duplicate" },
      { meta: "Process scope", label: "Primary token", detail: "Suitable type and access for launch", linkAfter: "CreateProcessAsUser" },
      { meta: "Owned outputs", label: "Process and thread handles", detail: "Close both plus every token and process open" }
    ], caption: "Privilege adjustment, thread impersonation, and primary-token process creation solve different problems." }],
    workedExamples: [
      { type: "branch", title: "Interpret privilege adjustment", prompt: "The caller asks to enable SeAssignPrimaryTokenPrivilege.", setupCode: "AdjustTokenPrivileges(token, False, [(luid, SE_PRIVILEGE_ENABLED)])", branches: [
        { value: "enabled", meaning: "The token contained the privilege and its state changed.", action: "Perform only the scoped operation, then restore the previous attributes." },
        { value: "ERROR_NOT_ALL_ASSIGNED", meaning: "One or more requested privileges were absent.", action: "Stop and report missing possession. Do not claim elevation can manufacture it." },
        { value: "access denied", meaning: "The token handle lacks TOKEN_ADJUST_PRIVILEGES or policy rejects the operation.", action: "Report the open and requested mask." },
        { value: "already enabled", meaning: "The required state already exists.", action: "Retain the previous state record and avoid disabling a privilege you did not enable." }
      ], conclusion: "Presence, enabled state, and token-handle access are three separate checks." },
      { type: "trace", title: "Audit get_my_leverage.py before execution", prompt: "The supplied script tries to create a process from another process's token.", steps: [
        { title: "Open caller privilege tokens", action: "Two token handles are appended after adjustment.", why: "They keep the adjusted tokens alive but must be restored and closed.", result: "The supplied finally never closes them." },
        { title: "Open target process and token", action: "The script acquires both handles.", why: "Each successful open creates ownership.", result: "The supplied finally does not close either." },
        { title: "Duplicate primary token", action: "main creates primary_token once.", why: "This is the token intended for process creation.", result: "One owned token duplicate exists." },
        { title: "Duplicate again inside launch", action: "create_process_with_token duplicates its primary_token argument a second time.", why: "The second duplicate is unnecessary and is never returned for cleanup.", result: "A leaked token handle and confused ownership." },
        { title: "Launch and cleanup", action: "Only child process, child thread, and the first primary duplicate are closed.", why: "Source process, source token, privilege-token handles, and inner duplicate remain.", result: "The happy path still leaks several handles." }
      ], conclusion: "The corrected design creates one primary duplicate, keeps every acquisition in one ownership table, and closes in reverse order." }
    ],
    windowsLearning: [
      { title: "The supplied script demonstrates a chain, not a final template", paragraphs: ["get_my_leverage.py correctly highlights process access, token query and duplication, privilege names, DuplicateTokenEx, CreateProcessAsUser, and child handles. It does not check the effective result of privilege adjustment, duplicates the primary token twice, omits several closes, does not restore privilege state, and reports only the Win32 number on pywintypes.error.", "It also accepts an arbitrary PID and command with no ownership boundary. The improved launch starter defaults to dry-run, refuses a different-user source SID, requests a narrower source process right, creates one primary duplicate, and closes every owned handle."] },
      { title: "Same-user success still has environment limits", paragraphs: ["A child launched with a duplicated same-user token can inherit a caller-style environment when None is supplied, not necessarily the environment associated with the source process or user's full profile. Desktop, session, job, application control, and endpoint policy can also affect the outcome.", "If CreateProcessAsUser fails, record the operation, required privileges, source token type, desired access, source/current SID, session, command parsing, and policy evidence. Do not respond by copying a SYSTEM token or disabling security controls."] }
    ],
    codeWalkthroughs: [{
      title: "One-token launch ownership table",
      intro: "The corrected starter keeps every handle visible in main.",
      stages: [
        { title: "Verify scope", explanation: "Compare source and current user SIDs before duplication and refuse a different-user lab target.", code: "process = OpenProcess(QUERY_LIMITED, False, pid)\nsource = OpenProcessToken(process, TOKEN_QUERY | TOKEN_DUPLICATE)\nif source_sid != current_sid:\n    raise SystemExit('Select a process you own')" },
        { title: "Duplicate once", explanation: "The primary token passed to CreateProcessAsUser is the same owned handle later closed.", code: "primary = DuplicateTokenEx(\n    source, SecurityImpersonation, desired, TokenPrimary, None\n)" },
        { title: "Treat launch outputs as owned", explanation: "Both process and initial thread handles need CloseHandle even if only their IDs are printed.", code: "child_process, child_thread, pid, tid = (\n    CreateProcessAsUser(primary, ...)\n)" },
        { title: "Unwind every open", explanation: "Reverse-order cleanup covers partial success as well as the happy path.", code: "finally:\n    close(child_thread)\n    close(child_process)\n    close(primary)\n    close(source)\n    close(process)" }
      ]
    }],
    practice: {
      title: "Audit privilege state and a same-user token dry run",
      time: "35 min",
      intro: "Run privilege_state_lab.py, then use an owned same-user cmd.exe source for token_launch_lab.py's non-launching dry run.",
      downloads: [["downloads/privilege_state_lab.py", "privilege_state_lab.py", "Privilege starter"], ["downloads/token_launch_lab.py", "token_launch_lab.py", "Token launch starter"]],
      expectedOutcome: "privilege_state_lab.py reports whether SeChangeNotifyPrivilege is present and enabled, then restores any temporary enable. token_launch_lab.py compares the owned source and current SIDs, creates one primary-token duplicate, prints Dry run complete, and closes every owned handle without creating a child process.",
      safety: "Use only the owned cmd.exe source started by the supplied block. Keep token_launch_lab.py in its default dry-run mode; do not pass a launch flag or target another user's process.",
      steps: [
        { action: "Download privilege_state_lab.py and token_launch_lab.py, open ordinary PowerShell in their folder, and run privilege_state_lab.py with its default SeChangeNotifyPrivilege read-only mode.", commands: [{ label: "PowerShell", code: "py .\\privilege_state_lab.py" }], why: "The first pass separates privilege inspection from adjustment.", observe: "The output shows Privilege, Present, attributes before, and the read-only instruction. Present with attributes 0 is disabled; a nonzero attribute has explicit flag meaning. Missing pywin32 is a dependency branch." },
        { action: "Run privilege_state_lab.py with --enable and verify its own restoration line.", commands: [{ label: "PowerShell", code: "py .\\privilege_state_lab.py --enable" }], why: "Temporary privilege changes require exact previous-state restoration.", observe: "If SeChangeNotifyPrivilege is present, attributes before, while enabled, and restored are visible and the restored value equals before. If absent, privilege_state_lab.py refuses and performs no adjustment." },
        { action: "Create one owned same-user cmd.exe source, pass its PID directly to token_launch_lab.py without any launch option, and leave the source window open until the dry run finishes.", commands: [{ label: "PowerShell", code: "$source = Start-Process -FilePath $env:ComSpec -ArgumentList '/k title ILOVEOS Token Source' -PassThru\n\"Owned source PID: $($source.Id)\"\n\"Owned source creation time: $($source.StartTime.ToString('o'))\"\nGet-Process -Id $source.Id -ErrorAction Stop | Select-Object Id,ProcessName,StartTime,Path\npy .\\token_launch_lab.py $source.Id" }], why: "Default dry-run validates PROCESS_QUERY_LIMITED_INFORMATION, token query/duplicate rights, same-SID scope, one primary duplicate, and cleanup without attempting process creation.", observe: "The output shows matching Source SID and Current SID, 'Created one owned primary-token duplicate', 'Dry run complete', and no child PID. An exited source, access denial, or different SID stops the branch without switching targets." }
      ],
      hints: [{ title: "The source open is denied", body: "Confirm the supplied cmd.exe is still live under the current account. Do not choose a different or higher-value target to force success." }],
      cleanup: ["Close the owned ILOVEOS Token Source cmd.exe window after the dry run.", "Confirm the process and token handles close and the temporary privilege returns to its previous attributes."],
    },
    checks: [
      ["Which token type does CreateProcessAsUser require?", ["A suitable primary token", "Only an impersonation token", "A process handle", "A SID string"], 0, "DuplicateTokenEx can create the required TokenPrimary copy."],
      ["What is wrong with duplicating again inside the launch helper?", ["It changes CPU mode", "It creates unnecessary ownership and leaks in the supplied path", "It removes the SID", "It closes the SCM"], 1, "The already-created primary token can be passed directly and closed by its clear owner."],
      ["What cleanup ends thread impersonation?", ["FreeLibrary", "RevertToSelf", "DeleteService", "RegCloseKey"], 1, "RevertToSelf belongs in finally around the impersonated work."]
    ]
  },

  "uac-integrity": {
    apis: ["win32security.GetTokenInformation", "CheckTokenMembership", "ShellExecute", "TokenElevationType", "TokenIntegrityLevel"],
    phases: {
      learn: ["Separate elevation and integrity", "Understand filtered and full tokens, manifests, consent, mandatory labels, and virtualization."],
      windows: ["Compare real token contexts", "Use the same executable in ordinary and elevated processes without confusing integrity with CPU mode."],
      investigation: ["Run the controlled pair", "Explain every meaningful difference in two token summaries."],
      review: ["Check UAC reasoning", "Test membership, elevation, integrity, manifests, virtualization, and remaining policy."]
    },
    learning: [
      { title: "Administrator membership and elevation are not the same state", paragraphs: ["With UAC enabled, an administrator logon commonly produces linked tokens: a filtered token used for ordinary desktop processes and a full token available through an elevation flow after consent or credentials. Elevation starts a new process with a different token. It does not mutate the existing process in place.", "The filtered token can contain the Administrators SID as deny-only and remove or disable powerful privileges. A standard user may receive a credential prompt that starts a process under a different administrative account, so compare user SID as well as elevation state."], inlineCheck: ["What happens to an already-running ordinary process when a new elevated copy starts?", ["Its token changes in place", "It remains under its original token", "It enters kernel mode", "Its architecture doubles"], 1, "Elevation creates another process and does not upgrade existing process tokens."] },
      { title: "Integrity level is mandatory policy layered with the DACL", paragraphs: ["Tokens and securable objects can carry mandatory integrity labels. Common levels include Low, Medium, High, and System. The usual no-write-up policy blocks a lower-integrity subject from writing to a higher-integrity object even if a simplified DACL reading appears permissive.", "Mandatory policy is not a universal trust score and does not replace DACLs. A High-integrity process still needs object-specific rights, and protected-process, AppContainer, capability, service, and enterprise policies can impose additional boundaries."] },
      { title: "Manifests and virtualization shape compatibility behavior", paragraphs: ["An application manifest can request asInvoker, highestAvailable, or requireAdministrator. The shell's runas verb requests elevation through UAC. A shield indicates a boundary request, not proof that the program is safe.", "UAC file and Registry virtualization can redirect selected writes from legacy, unelevated, 32-bit applications without suitable manifests. It is not available to all programs, does not apply to elevated processes, and should not be a design dependency."] }
    ],
    visuals: [{ type: "map", title: "Compare linked administrator contexts", items: [
      { meta: "Logon", label: "Administrator account", detail: "Authentication establishes user SID", linkAfter: "ordinary launch" },
      { meta: "Filtered process", label: "Medium integrity", detail: "Admin group may be deny-only, fewer usable privileges", linkAfter: "consent or credentials" },
      { meta: "New elevated process", label: "High integrity", detail: "Fuller token under confirmed account", linkAfter: "still subject to" },
      { meta: "Object policy", label: "DACL, privileges, protection", detail: "Elevation is not universal access" }
    ], caption: "Both application processes remain user mode. Integrity and processor privilege mode are different axes." }],
    workedExamples: [{ type: "comparison", title: "Read two token summaries", prompt: "The same Python script runs normally and from an elevated administrator terminal.", columns: [
      { title: "Ordinary process", rows: [["User SID", "Administrator account SID"], ["Elevation", "Limited or filtered"], ["Integrity", "Usually Medium"], ["Admin group", "Often deny-only"], ["Privileges", "Reduced or disabled set"]] },
      { title: "Elevated process", rows: [["User SID", "Usually the same after consent"], ["Elevation", "Full"], ["Integrity", "Usually High"], ["Admin group", "Enabled"], ["Privileges", "Broader set, not all necessarily enabled"]] }
    ], shared: "Both are ordinary user-mode processes and still face object-specific and system policy.", conclusion: "Describe exact token fields rather than saying one process is simply admin and the other is not." }],
    windowsLearning: [
      { title: "Process Explorer makes the pair visible", paragraphs: ["Add User Name, Integrity Level, and Elevation columns, then open each process Security tab. Correlate by PID and creation time. The same executable path can run simultaneously under different tokens.", "TokenElevationTypeDefault can mean UAC linkage is not applicable in that context, not necessarily that the account lacks administrative group membership. Interpret it with user SID, groups, integrity, and environment."] },
      { title: "Integrity terminology needs a bounded correction", paragraphs: ["The lecture phrase no-read-up for processes reflects additional process-protection behavior often observed across integrity levels, while mandatory integrity control's standard policy focus is no-write-up. Do not present a universal no-read-up rule for every securable object.", "Low-integrity code may read many Medium-integrity resources whose DACL permits it, while write attempts are more broadly constrained. Object type and mandatory policy bits determine the exact decision."] }
    ],
    practice: {
      title: "Compare filtered and elevated processes",
      time: "35 min",
      intro: "Use token_summary_lab.py for both runs and keep both PowerShell processes visible in Process Explorer.",
      download: ["downloads/token_summary_lab.py", "token_summary_lab.py"],
      expectedOutcome: "On a UAC administrator account, the ordinary and elevated reports usually share a user SID but differ in elevation type, integrity SID, Administrators attributes, and privilege state. On a standard-user credential elevation, the user SID may also differ. Neither process becomes kernel mode.",
      steps: [
        { action: "Download token_summary_lab.py, open ordinary PowerShell in its folder, display that terminal PID, and run the fixed token field set.", commands: [{ label: "Ordinary PowerShell", code: "\"Ordinary PowerShell PID: $PID\"\npy .\\token_summary_lab.py" }], why: "A fixed field set makes the comparison meaningful.", observe: "In Process Explorer select that PowerShell PID in the top pane, choose View > Select Columns > Process Image, enable User Name and Integrity Level, then open Properties > Security. The page and artifact show User SID, Elevation type, Elevated, Integrity SID, Administrators attributes, and named privilege states; unsupported fields or access denial remain visible." },
        { action: "Launch a separate PowerShell with Run as administrator through the normal UAC consent or credential flow, open the folder containing token_summary_lab.py, and run this complete elevated block.", commands: [{ label: "Elevated PowerShell", code: "\"Elevated PowerShell PID: $PID\"\npy .\\token_summary_lab.py" }], why: "Elevation creates a comparison process rather than changing the ordinary process.", observe: "The elevated output shows whether the User SID stayed the same or credential entry selected another account. UAC disabled/unavailable or a cancelled prompt leaves this branch unavailable; the window title alone is not evidence." },
        { action: "Keep both PowerShell processes open in Process Explorer's top pane with User Name and Integrity Level visible, then open Properties > Security for each printed PID in turn.", why: "The same tool path exposes the security inputs without turning them into an off-page worksheet.", observe: "The two process rows and Security pages visibly distinguish user SID, integrity, elevation, Administrators attributes, and present versus enabled privileges. Both remain user-mode processes." }
      ],
      hints: [{ title: "Both runs report the same context", body: "Confirm that the second terminal is actually elevated, compare its PID and integrity in Process Explorer, and check whether UAC is enabled in the VM. Do not infer elevation from window title alone." }],
      checkpoints: [{ afterStep: 3, type: "choice", prompt: "Does UAC elevation move PowerShell into kernel mode?", options: ["No", "Yes"], answerIndex: 0, feedback: "Elevation changes the user-mode process token; it does not move PowerShell into kernel mode." }],
      cleanup: ["Close the elevated and ordinary PowerShell terminals and Process Explorer.", "token_summary_lab.py makes no token, DACL, or system configuration changes."],
    },
    checks: [
      ["Does elevation turn user-mode application code into kernel mode?", ["Yes", "No", "Only on x64", "Only through Python"], 1, "Elevation changes the security token and integrity context, not processor privilege mode."],
      ["Can a High-integrity process ignore every DACL?", ["Yes", "No", "Only for services", "Only with a manifest"], 1, "It still needs applicable rights or defined privileges and faces other policy."],
      ["Is UAC virtualization a recommended storage design?", ["Yes", "No", "Only for new 64-bit apps", "Only for drivers"], 1, "It is a limited legacy compatibility mechanism."]
    ]
  }
};
