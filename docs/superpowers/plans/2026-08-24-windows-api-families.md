# Windows API Families and Contextual Parameter Choices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat Windows API guide with compact family popups that switch between documented variants, and add concise, copyable parameter-value guidance to relevant native and pywin32 functions.

**Architecture:** A new static `windows-api-families.js` module owns reviewed family relationships, aliases, reusable choice sets, bindings, builders, and validation. `windows-api-data.js` continues to generate complete callable contracts, then feeds them through the family builder. `windows-api-view.js` renders and searches families, while `app.js` owns dialog interaction and reuses the choice renderer in pywin32 popups.

**Tech Stack:** Static HTML/CSS, browser JavaScript IIFEs, Node.js VM data/view tests, headless Microsoft Edge integration/layout tests, PowerShell release commands, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-24-windows-api-families-design.md`

## Global Constraints

- Cover only native API families already represented by the 69-contract baseline; do not follow See Also links into unrelated families.
- Preserve every baseline contract through exactly one family and variant.
- Never infer a family by suffix; every multi-variant family is an explicit reviewed manifest record.
- Prefer the explicit Unicode `W` export when a family has one.
- Generic C/C++ names such as `CreateEvent` are aliases, not ctypes exports.
- One popup shows one family; changing a variant replaces the visible contract in place.
- Do not add nested popups, dropdowns, or accordions inside an API popup.
- A variant has one `useWhen` sentence of at most 24 words and zero to five `keyBehaviors`, each at most 30 words.
- Contextual choices appear only beside parameters they fit; a parameter has at most one copyable combination example.
- Microsoft Learn is authoritative for native contracts, family relations, values, behavior, availability, errors, and ownership; paraphrase rather than copying its prose.
- Keep the pywin32 guide's current module/function structure and add only contextual parameter choices to its popup.
- Retain the existing dialog close, focus, Escape, content-size, responsive, and full-scroll behavior.
- Use no new runtime package or build step.
- After every task, commit, push `main`, wait for the exact GitHub Pages commit to succeed, and verify the public assets before continuing.

## File Structure

- Create `windows-api-families.js`: reviewed family manifest, baseline-name ledger, choice sets, native/pywin32 bindings, pure builder/resolver/validator functions.
- Modify `windows-api-data.js`: add complete sibling contracts and emit both the temporary compatibility `entries` array and the new `families` array until Task 2 removes renderer dependence on `entries`.
- Modify `windows-api-view.js`: family search results, variant selector, aliases, behavior, availability, and shared parameter-choice markup.
- Modify `app.js`: family-aware open/switch behavior, variant keyboard behavior, shared copy interaction, pywin32 parameter bindings.
- Modify `styles.css`: compact family and choice controls using the established reference-guide design.
- Modify `index.html`: load-order entry for `windows-api-families.js` and one fresh release cache key per task.
- Create `scripts/test-windows-api-families.mjs`: data schema, legacy coverage, family boundaries, aliases, prose limits, bindings, and malformed fixtures.
- Modify `scripts/test-windows-api-guide.mjs`: contract correctness against family variants rather than flat entries.
- Modify `scripts/test-windows-api-view.mjs`: family search/render contract and cache-version assertions.
- Create `scripts/test-windows-api-family-browser.mjs`: real-browser selector, keyboard, focus, and search-selected variant behavior.
- Create `scripts/test-api-parameter-choices.mjs`: native and pywin32 choice rendering/copy behavior.
- Create `scripts/test-windows-api-family-layout.mjs`: responsive containment and scroll reachability for the largest popup.
- Modify `scripts/test-api-dialog-scroll.mjs`: reopen/switch scroll regression coverage.
- Modify cache-key expectations in `scripts/test-practice-command-view.mjs`, `scripts/test-practice-checkpoint-view.mjs`, and `scripts/test-practice-case-study-view.mjs` whenever the site-wide key changes.
- Create `docs/windows-api-source-audit.md`: one compact evidence row per baseline contract recording the official family and parameter-choice review.
- Modify `PLAN.md`: record completion metrics, tests, and publication SHA after the final audit.

---

### Task 1: Family schema, validation, and backward-compatible data

**Files:**

- Create: `windows-api-families.js`
- Create: `scripts/test-windows-api-families.mjs`
- Modify: `windows-api-data.js`
- Modify: `scripts/test-windows-api-guide.mjs`
- Modify: `index.html`
- Modify: `scripts/test-windows-api-view.mjs`
- Modify: `scripts/test-practice-command-view.mjs`
- Modify: `scripts/test-practice-checkpoint-view.mjs`
- Modify: `scripts/test-practice-case-study-view.mjs`

**Interfaces:**

- Produces `window.ILOVEOS_WINDOWS_API_FAMILY_DATA` with:
  - `legacyApiNames: readonly string[]`
  - `familyDefinitions: readonly FamilyDefinition[]`
  - `choiceSets: Record<string, ChoiceSet>`
  - `nativeBindings: Record<string, ParameterBinding>`
  - `pywin32Bindings: Record<string, ParameterBinding>`
  - `buildFamilies(contracts: ApiContract[]): ApiFamily[]`
  - `resolveSelection(family: ApiFamily, query?: string): string`
  - `resolveParameterChoices(bindingKey: string, surface: "native" | "pywin32"): ResolvedChoiceSet | null`
  - `validateGuide(guide: WindowsApiGuide): string[]`
- Changes `window.ILOVEOS_WINDOWS_API_GUIDE` to `{ typeMappings, entries, families, legacyApiNames }` for Task 1 compatibility.
- `entries` remains unchanged for the existing page during Task 1; Task 2 changes all renderer consumers to `families`.

- [ ] **Step 1: Write the failing family-schema test**

Create `scripts/test-windows-api-families.mjs`. Load `windows-api-families.js` before `windows-api-data.js` in a VM and assert the new global exists. Assert that `legacyApiNames` contains exactly these 69 names:

```js
const expectedLegacyNames = [
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
```

Add malformed fixtures that must return specific validation errors for duplicate family IDs, duplicate variants, a missing recommended variant, an alias with no target, a missing legacy contract, a variant without a Microsoft Learn source, six key behaviors, a 25-word `useWhen`, a 31-word behavior, an unknown choice set, an unknown choice value, and two combination examples.

Add a valid fixture proving that an ungrouped contract becomes a single-variant family and an explicit four-variant family remains one family.

- [ ] **Step 2: Run the new test and verify RED**

Run:

```powershell
node .\scripts\test-windows-api-families.mjs
```

Expected: non-zero exit with `missing windows-api-families.js` or `missing ILOVEOS_WINDOWS_API_FAMILY_DATA`.

- [ ] **Step 3: Implement the family module and validator**

Create `windows-api-families.js` as an IIFE. Define the 69-name array exactly as tested. Use these data shapes:

```js
const familyDefinitions = [
  {
    id: "create-event",
    name: "CreateEvent",
    summary: "Create or open a named or unnamed event object.",
    recommendedVariant: "CreateEventW",
    variantNames: ["CreateEventW", "CreateEventA", "CreateEventExW", "CreateEventExA"],
    aliases: [
      { name: "CreateEvent", target: "CreateEventW", note: "C/C++ selects the A or W declaration according to UNICODE." },
      { name: "CreateEventEx", target: "CreateEventExW", note: "C/C++ selects the A or W declaration according to UNICODE." },
    ],
  },
];
```

`buildFamilies()` must index contracts by exact name, consume every name listed by an explicit definition once, and create one stable kebab-case singleton family for each unconsumed contract. It must preserve each contract object as a variant rather than copying only selected fields.

`resolveSelection()` follows this order: exact variant name, exact alias target, family recommended variant. Matching is case-insensitive.

`validateGuide()` returns strings and never throws for malformed fixture data. It performs every validation named in Step 1, uses whitespace-delimited word counts, escapes no data itself, and checks each legacy name occurs in exactly one variant.

- [ ] **Step 4: Add the complete `CreateEvent` exemplar contracts**

Extend `extraSignatures` and the existing result/cleanup/example metadata in `windows-api-data.js` with `CreateEventA`, `CreateEventExW`, and `CreateEventExA`. Use the official signatures:

```c
HANDLE CreateEventA(LPSECURITY_ATTRIBUTES, BOOL, BOOL, LPCSTR);
HANDLE CreateEventExW(LPSECURITY_ATTRIBUTES, LPCWSTR, DWORD, DWORD);
HANDLE CreateEventExA(LPSECURITY_ATTRIBUTES, LPCSTR, DWORD, DWORD);
```

Give each variant an explicit `useWhen`, availability string, zero-to-five behavior notes, and direct Microsoft Learn source. `CreateEventW` is recommended. The `A` variants explain code-page names in one short sentence; the `Ex` variants explain `CREATE_EVENT_*` flags and explicit desired access without repeating all parameter text.

After contracts are built, call `familyData.buildFamilies(entries)` and publish:

```js
window.ILOVEOS_WINDOWS_API_GUIDE = {
  typeMappings,
  entries,
  families,
  legacyApiNames: familyData.legacyApiNames,
};
```

- [ ] **Step 5: Convert guide correctness tests to inspect variants**

In `scripts/test-windows-api-guide.mjs`, load `windows-api-families.js` before `windows-api-data.js`. Create a variant map with:

```js
const variants = new Map(
  guide.families.flatMap((family) => family.variants.map((variant) => [variant.name, variant])),
);
```

Run every existing ABI/result/cleanup assertion against `variants`. Add assertions that validation returns zero errors, all 69 legacy names are present exactly once, the `CreateEvent` family has exactly the four required variants, and both aliases resolve to their `W` target.

- [ ] **Step 6: Load the module and release the data checkpoint**

In `index.html`, load `windows-api-families.js` after `api-signatures-stage6.js` and before `windows-api-data.js`. Change all site asset query keys to `windows-api-families-1`. Update the three guided-investigation cache-key expectations and `scripts/test-windows-api-view.mjs` to expect all tied assets, including the new module, to share that key.

- [ ] **Step 7: Run Task 1 verification**

Run:

```powershell
node .\scripts\test-windows-api-families.mjs
node .\scripts\test-windows-api-guide.mjs
node .\scripts\test-windows-api-view.mjs
node .\scripts\test-practice-command-view.mjs
node .\scripts\test-practice-checkpoint-view.mjs
node .\scripts\test-practice-case-study-view.mjs
node .\scripts\audit-course.mjs
git diff --check
```

Expected: every command exits zero; the family validator reports 69 legacy contracts covered and the course audit reports zero errors and zero warnings.

- [ ] **Step 8: Commit and publish Task 1**

```powershell
git add windows-api-families.js windows-api-data.js index.html scripts\test-windows-api-families.mjs scripts\test-windows-api-guide.mjs scripts\test-windows-api-view.mjs scripts\test-practice-command-view.mjs scripts\test-practice-checkpoint-view.mjs scripts\test-practice-case-study-view.mjs
git commit -m "feat: add Windows API family data model"
git push origin main
$Commit = git rev-parse HEAD
gh -R Joelwang22/ILOVEOS run list --commit $Commit --limit 1 --json databaseId,status,conclusion,headSha,url
```

Capture and wait for that exact run:

```powershell
$Run = gh -R Joelwang22/ILOVEOS run list --commit $Commit --limit 1 --json databaseId,headSha | ConvertFrom-Json
if ($Run.headSha -ne $Commit) { throw "Pages run does not match $Commit" }
gh -R Joelwang22/ILOVEOS run watch $Run.databaseId --exit-status
```

Verify `https://joelwang22.github.io/ILOVEOS/windows-api-families.js?v=windows-api-families-1` contains `create-event` and the public guide still opens existing entries.

---

### Task 2: One-popup family search and variant selector

**Files:**

- Modify: `windows-api-view.js`
- Modify: `app.js`
- Modify: `styles.css`
- Modify: `scripts/test-windows-api-view.mjs`
- Create: `scripts/test-windows-api-family-browser.mjs`
- Modify: `scripts/test-api-dialog-scroll.mjs`
- Modify: `index.html`
- Modify: `scripts/test-practice-command-view.mjs`
- Modify: `scripts/test-practice-checkpoint-view.mjs`
- Modify: `scripts/test-practice-case-study-view.mjs`

**Interfaces:**

- Replaces `filterEntries(entries, query): ApiContract[]` with `filterFamilies(families, query): FamilyMatch[]`.
- `FamilyMatch` is `{ family: ApiFamily, selectedVariant: string }`.
- Replaces `renderDialog(entry)` with `renderDialog(family, selectedVariantName)`.
- Changes row attributes to `data-windows-api-family` and `data-windows-api-variant`.
- `openWindowsApiDetails(familyId, variantName)` opens exactly one existing dialog.

- [ ] **Step 1: Write failing view and browser tests**

Update `scripts/test-windows-api-view.mjs` to assert:

- searching `CreateEventExA` returns one `CreateEvent` family match selected to `CreateEventExA`;
- searching alias `CreateEventEx` returns the same family selected to `CreateEventExW`;
- searching `Unicode event` returns the family once;
- the family row has both family and selected-variant data attributes;
- the family popup contains a four-button `role="tablist"`, one selected tab, a `Recommended` marker on `CreateEventW`, and no nested `<dialog>`, `<details>`, or `<summary>`;
- only the selected variant's signature and source are in the contract panel;
- a singleton family has no tab list.

Create `scripts/test-windows-api-family-browser.mjs` using the repository's temporary-copy/headless-Edge pattern. Load `#/reference/windows-api`, open `CreateEvent`, and assert click selection plus ArrowRight, ArrowLeft, Home, and End navigation update `aria-selected`, the title/signature, and the selected button's `tabindex` while retaining focus.

Assert a filtered `CreateEventExA` route opens the one family popup with `CreateEventExA` already selected. Assert closing and reopening starts at the recommended variant unless the new open action supplies an exact variant.

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
node .\scripts\test-windows-api-view.mjs
node .\scripts\test-windows-api-family-browser.mjs
```

Expected: failures mention missing family matches, family data attributes, and variant controls.

- [ ] **Step 3: Implement family matching and rendering**

In `windows-api-view.js`, add:

```js
function filterFamilies(families, query = "") {
  const required = tokens(query);
  return families
    .map((family) => ({ family, selectedVariant: selectForQuery(family, query) }))
    .filter(({ family }) => !required.length || required.every((token) => familySearchText(family).includes(token)));
}
```

`familySearchText()` includes every variant and alias field without repeating a family result. `selectForQuery()` delegates exact selection to `familyData.resolveSelection()` and otherwise returns the recommended variant.

Render rows with the family name, DLL or `Multiple DLLs`, family purpose, compact variant labels, `data-windows-api-family`, and `data-windows-api-variant`. Category counts and the sticky count report families.

`renderDialog()` looks up exactly one selected variant and renders:

1. family heading and purpose;
2. optional alias strip;
3. optional tab list;
4. selected `useWhen`, availability, and pywin32 path;
5. native/Python signatures and translated parameters;
6. checked call;
7. optional zero-to-five behavior list;
8. result, cleanup, and sources.

All dynamic strings continue through `escapeHtml()`.

- [ ] **Step 4: Wire selection and keyboard behavior**

Change `renderWindowsApiGuide()` and `openWindowsApiDetails()` in `app.js` to use `guide.families`. Add one delegated `click` listener on `#api-detail-dialog` for `[data-api-variant]`. Re-render the same family into `#api-detail-content`, preserve the dialog's current `scrollTop`, restore focus to the newly rendered selected button, and rewire only the close button.

Add delegated `keydown` handling on the tab list:

```js
const keys = { ArrowRight: 1, ArrowLeft: -1 };
if (event.key === "Home") nextIndex = 0;
else if (event.key === "End") nextIndex = tabs.length - 1;
else if (event.key in keys) nextIndex = (currentIndex + keys[event.key] + tabs.length) % tabs.length;
else return;
```

Prevent the default action, select the target, and keep focus on it. Do not store selection in local storage or create a nested dialog.

- [ ] **Step 5: Style the selector without changing guide geometry**

Add focused selectors for `.api-family-variants`, `.api-variant-tab`, `.api-variant-aliases`, `.api-variant-availability`, and `.api-key-behaviors`. Use the existing category accent variable and current API dialog colors. The buttons must wrap, retain a 40-pixel minimum target, show selected/focus state without color alone, and keep long export names contained.

At the existing compact breakpoint, keep selector buttons reachable and allow the alias strip to wrap. Do not set a fixed dialog-body height.

- [ ] **Step 6: Extend the scroll regression**

In `scripts/test-api-dialog-scroll.mjs`, open the longest `CreateEvent` variant, scroll to the final Microsoft Learn link, switch variants, scroll to the new final link, close, and reopen another family. Assert the final link is reachable after both switches and the newly opened popup starts at `scrollTop === 0`.

- [ ] **Step 7: Release and verify Task 2**

Change all site asset keys and the three tied-asset test expectations to `windows-api-families-2`. Run:

```powershell
node .\scripts\test-windows-api-families.mjs
node .\scripts\test-windows-api-guide.mjs
node .\scripts\test-windows-api-view.mjs
node .\scripts\test-windows-api-family-browser.mjs
node .\scripts\test-api-dialog-scroll.mjs
Get-ChildItem .\scripts -File -Filter test-*.mjs | Sort-Object Name | ForEach-Object { node $_.FullName; if ($LASTEXITCODE) { exit $LASTEXITCODE } }
node .\scripts\audit-course.mjs
git diff --check
```

Commit and publish:

```powershell
git add windows-api-view.js app.js styles.css index.html scripts\test-windows-api-view.mjs scripts\test-windows-api-family-browser.mjs scripts\test-api-dialog-scroll.mjs scripts\test-practice-command-view.mjs scripts\test-practice-checkpoint-view.mjs scripts\test-practice-case-study-view.mjs
git commit -m "feat: add Windows API variant selector"
git push origin main
```

Wait for the exact Pages SHA. On the public site, verify `CreateEventExA` search opens one popup with the matching selection, every button switches in place, keyboard navigation works, and the bottom source link is reachable at desktop and narrow widths.

---

### Task 3: Contextual parameter choices in native and pywin32 popups

**Files:**

- Modify: `windows-api-families.js`
- Modify: `windows-api-data.js`
- Modify: `windows-api-view.js`
- Modify: `app.js`
- Modify: `styles.css`
- Modify: `scripts/test-windows-api-families.mjs`
- Create: `scripts/test-api-parameter-choices.mjs`
- Modify: `scripts/test-windows-api-view.mjs`
- Modify: `index.html`
- Modify: `scripts/test-practice-command-view.mjs`
- Modify: `scripts/test-practice-checkpoint-view.mjs`
- Modify: `scripts/test-practice-case-study-view.mjs`

**Interfaces:**

- `resolveParameterChoices(bindingKey, surface)` returns `{ id, kind, source, values, example }` or `null`.
- Native binding keys use `FunctionName.ParameterName`.
- Pywin32 binding keys use `module::FunctionName#overloadIndex.ParameterName`, where overload indexes are zero-based.
- `windowsApiView.renderParameterChoices(resolved, copyIdPrefix)` returns escaped markup shared by both popup surfaces.
- Copy controls use `data-copy-api-value`, `data-api-value-code`, and a sibling `[data-api-value-status]` live region.

- [ ] **Step 1: Add failing choice-resolution tests**

Extend `scripts/test-windows-api-families.mjs` with these exact required bindings:

```js
const requiredBindings = [
  ["native", "OpenProcessToken.DesiredAccess", "token-access"],
  ["native", "DuplicateToken.ImpersonationLevel", "security-impersonation-level"],
  ["pywin32", "win32security::OpenProcessToken#0.DesiredAccess", "token-access"],
  ["pywin32", "win32security::DuplicateTokenEx#0.ImpersonationLevel", "security-impersonation-level"],
  ["pywin32", "win32security::DuplicateTokenEx#0.TokenType", "token-type"],
  ["pywin32", "win32security::DuplicateTokenEx#0.DesiredAccess", "token-access"],
];
```

Assert the token-access set includes `TOKEN_QUERY`, `TOKEN_DUPLICATE`, `TOKEN_ADJUST_PRIVILEGES`, and the exact Python spelling for each. Assert the local combination is exactly:

```python
win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE
```

Assert the impersonation set contains all four values in order: `SecurityAnonymous`, `SecurityIdentification`, `SecurityImpersonation`, `SecurityDelegation`. Assert the token-type set contains `TokenPrimary` and `TokenImpersonation`.

Create `scripts/test-api-parameter-choices.mjs`. Its static-render assertions require native `OpenProcessToken`, native `DuplicateToken`, pywin32 `OpenProcessToken`, and pywin32 `DuplicateTokenEx` to show only the values bound to their exact parameter. Assert `CloseHandle` contains no contextual-choice section.

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
node .\scripts\test-windows-api-families.mjs
node .\scripts\test-api-parameter-choices.mjs
```

Expected: missing choice sets, bindings, and choice markup.

- [ ] **Step 3: Define the required choice sets and bindings**

In `windows-api-families.js`, define `token-access`, `security-impersonation-level`, and `token-type` using direct Microsoft Learn sources. Keep every use-case sentence within 24 words. Use these meanings:

- `TOKEN_QUERY`: read token identity, groups, privileges, and token information.
- `TOKEN_DUPLICATE`: pass the token to `DuplicateToken` or `DuplicateTokenEx`.
- `TOKEN_ADJUST_PRIVILEGES`: enable or disable privileges already present in the token.
- `SecurityAnonymous`: expose neither usable identity nor impersonation authority.
- `SecurityIdentification`: inspect client identity without acting as that client.
- `SecurityImpersonation`: act as the client on the local computer; the normal local impersonation choice.
- `SecurityDelegation`: act as the client on remote systems only when the wider security configuration permits delegation.
- `TokenPrimary`: create a token suitable for assignment to a process when the destination API accepts a primary token.
- `TokenImpersonation`: create a token intended for a thread impersonation context.

`resolveParameterChoices()` returns a fresh resolved object, preserves catalogue order filtered by the binding's `choices`, and validates the one optional example.

- [ ] **Step 4: Render choices beside their owning parameter**

In `windows-api-data.js`, attach the native binding key to the built parameter object when one exists. In `windows-api-view.js`, render a compact choice region inside the parameter's explanation cell. Each row contains a copyable `<code>` expression, one short use case, and a `Copy` button. A bitmask example appears once beneath its values. The full-list source link appears once per parameter, not once per value.

Export `renderParameterChoices` and reuse it from the pywin32 parameter mapping in `app.js`. Resolve a binding with the exact module, signature index, and parameter name so overloads cannot accidentally share incompatible values.

- [ ] **Step 5: Implement shared accessible copy behavior**

Use one delegated dialog click listener. On success, copy `button.dataset.apiValueCode`, set the local status to `Copied`, and leave focus on the button. On `navigator.clipboard.writeText` absence or rejection, select the local `<code>` text with a `Range`, set status to `Value selected. Press Ctrl+C to copy.`, and do not alter another value row.

Reset only the affected status when another value is copied. Copying must never execute or persist code.

- [ ] **Step 6: Add browser assertions and styling**

Extend `scripts/test-api-parameter-choices.mjs` with headless Edge assertions that:

- the relevant parameter and its value remain semantically associated;
- copying `TOKEN_QUERY` produces the exact module-qualified expression;
- the combination copies the exact OR expression;
- clipboard rejection selects only that expression and announces the fallback;
- switching a Windows family variant removes choices that do not belong to the new parameter contract;
- reopening a pywin32 popup resets all copy statuses.

Style `.api-parameter-choices`, `.api-choice-row`, `.api-choice-copy`, `.api-choice-example`, and `.api-choice-status` using the current code/parameter colors. Permit code to wrap or horizontally scroll inside its own cell without widening the popup. Preserve visible focus and a 40-pixel minimum button target.

- [ ] **Step 7: Release and verify Task 3**

Change all site asset keys and tied-asset expectations to `windows-api-families-3`. Run:

```powershell
node .\scripts\test-windows-api-families.mjs
node .\scripts\test-windows-api-guide.mjs
node .\scripts\test-windows-api-view.mjs
node .\scripts\test-windows-api-family-browser.mjs
node .\scripts\test-api-parameter-choices.mjs
node .\scripts\test-api-dialog-scroll.mjs
Get-ChildItem .\scripts -File -Filter test-*.mjs | Sort-Object Name | ForEach-Object { node $_.FullName; if ($LASTEXITCODE) { exit $LASTEXITCODE } }
node .\scripts\audit-course.mjs
git diff --check
```

Commit and publish:

```powershell
git add windows-api-families.js windows-api-data.js windows-api-view.js app.js styles.css index.html scripts\test-windows-api-families.mjs scripts\test-api-parameter-choices.mjs scripts\test-windows-api-view.mjs scripts\test-practice-command-view.mjs scripts\test-practice-checkpoint-view.mjs scripts\test-practice-case-study-view.mjs
git commit -m "feat: add contextual Windows parameter choices"
git push origin main
```

Wait for the exact Pages SHA. Verify public native and pywin32 popups for `OpenProcessToken` and `DuplicateTokenEx`, including copy success and the fallback path.

---

### Task 4: Full represented-family and parameter audit, layout gate, and completion record

**Files:**

- Modify: `windows-api-families.js`
- Modify: `windows-api-data.js`
- Modify: `windows-api-view.js`
- Modify: `app.js`
- Modify: `styles.css`
- Create: `docs/windows-api-source-audit.md`
- Modify: `scripts/test-windows-api-families.mjs`
- Modify: `scripts/test-windows-api-guide.mjs`
- Modify: `scripts/test-windows-api-view.mjs`
- Modify: `scripts/test-api-parameter-choices.mjs`
- Create: `scripts/test-windows-api-family-layout.mjs`
- Modify: `scripts/test-api-dialog-scroll.mjs`
- Modify: `PLAN.md`
- Modify: `index.html`
- Modify: `scripts/test-practice-command-view.mjs`
- Modify: `scripts/test-practice-checkpoint-view.mjs`
- Modify: `scripts/test-practice-case-study-view.mjs`

**Interfaces:**

- Adds `familyReview: Record<LegacyApiName, FamilyReview>` where `FamilyReview` is `{ decision: "single" | "encoding" | "extended" | "separate", familyId: string, source: string, note: string }`.
- Adds `parameterReview: Record<string, "plain" | ChoiceSetId>` keyed by exact native or pywin32 parameter binding key for every reviewed named-choice candidate.
- Final `guide` retains `legacyApiNames` and `families`; renderer code no longer reads `entries`.

- [ ] **Step 1: Write the failing completeness audit**

Extend `scripts/test-windows-api-families.mjs` to require one `familyReview` record for every one of the 69 legacy names. Require valid decision values, a real family ID, a direct `https://learn.microsoft.com/` source, and a non-empty note explaining why the contract is grouped or remains distinct.

Require every new sibling variant to have a unique name, full native and Python declarations, checked call, parameters, result, cleanup, availability, direct Microsoft source, and compact prose. Require every `A` variant in a family with `W` to leave the `W` variant recommended.

Add exact regression assertions for these distinct shapes:

- `CreateEvent`: base/extended plus `A`/`W` in one family.
- `MessageBox`: existing `MessageBoxA` preserved and `MessageBoxW` recommended.
- `GetProcAddress`: one byte-oriented export, no invented `GetProcAddressA/W`.
- `InterlockedExchangePointer`: compiler intrinsic, no invented DLL export.
- `VirtualAlloc` and `VirtualAllocEx`: separate families despite similar names.
- a `W`-only or explicitly Unicode contract remains actionable without an invented `A` sibling.

Run the test and require RED on the missing 69 review records and unaudited siblings.

- [ ] **Step 2: Perform and record the official family audit**

Create `docs/windows-api-source-audit.md` with one row for each of the 69 baseline names. Use these columns:

```markdown
| Baseline contract | Family decision | Included siblings | Kept separate from | Parameter-choice sets | Official source |
```

For each baseline contract, read its Microsoft Learn Syntax, Parameters, Return value, Remarks, Requirements, and linked encoding/extended counterpart pages. Record a `familyReview` entry in `windows-api-families.js` with the same decision.

At minimum, explicitly investigate and record the direct siblings of these represented string/extended operations: `CreateNamedPipeW`, `MessageBoxA`, `SetWindowsHookExW`, `CreateFileMappingW`, `OpenFileMappingW`, `GetModuleFileNameW`, `GetModuleFileNameExW`, `GetModuleHandleW`, `LoadLibraryA/W/ExW`, `CreateEventW`, `CreateMutexW`, `CreateProcessW`, `CreateRemoteThread`, `WaitForSingleObject`, `WaitForMultipleObjects`, `ReadFile`, `WriteFile`, `EnumProcessModules`, `IsWow64Process2`, `GetNamedSecurityInfoW`, `OpenSCManagerW`, `OpenServiceW`, `StartServiceW`, `RegOpenKeyExW`, and `GetWindowsDirectoryW`.

Do not automatically group the counterpart. Apply the family-boundary rule and record `separate` when the target process, synchronization model, callback model, output contract, or ownership model makes it a different operation. Every included sibling receives a complete contract; every excluded sibling receives a short audit rationale, not a hidden assumption.

- [ ] **Step 3: Complete the plain-English native contract audit**

For every included variant, rewrite only correctness-critical content from the official source:

- one family purpose;
- one variant `useWhen` sentence;
- availability when it distinguishes siblings;
- parameter differences;
- zero-to-five non-duplicative key behaviors;
- exact result/failure rule;
- ownership and cleanup;
- direct source links.

Delete generic generated sentences when the official contract gives a more useful concise explanation. Do not paste Microsoft paragraphs. Run `node .\scripts\test-windows-api-families.mjs` after each category and keep zero prose-limit or source errors.

- [ ] **Step 4: Complete the contextual parameter audit**

Review every parameter in every included native variant and every pywin32 function already represented in `reference-data.js`. Add a choice binding only when the learner must choose among named flags, masks, enum members, information classes, object types, controls, or sentinels.

Record the decision in the source-audit row and add reusable choice sets for the course-relevant values. Cover at least these represented families where their parameters require named choices: process/thread access, token access, token type, impersonation level, memory allocation/free/protection, file mapping access, waits/timeouts, process creation, named pipes, file I/O creation/share/access, service manager/service access and controls, Registry access/views, security-information flags, securable-object types, hook identifiers, module-loading flags, event/mutex creation flags, and architecture/machine identifiers.

Large bitmask sets expose only values used by represented course calls plus a complete-list Microsoft Learn link. Small finite enums may show every value. Keep one combination example maximum per parameter and use module-qualified pywin32 expressions where that wrapper is the recommended path.

- [ ] **Step 5: Add full search, compactness, and source assertions**

Extend the tests to iterate every family, variant, behavior, binding, and choice. Assert:

- a search for every variant and alias returns exactly one family;
- exact variant searches select that variant;
- every choice constant is searchable from its owning family/function;
- no parameter renders an unbound choice set;
- all copy expressions are non-empty and HTML-escaped;
- every choice set and behavior has a direct authoritative source;
- result, cleanup, and choice prose do not duplicate a key behavior verbatim;
- family and variant counts are printed separately;
- the 69 legacy contracts are still covered exactly once.

Update `scripts/test-windows-api-guide.mjs` to print the actual values:

```js
console.log(`Windows API families: ${guide.families.length}`);
console.log(`callable variants: ${variants.size}`);
console.log(`legacy contracts covered: ${coveredLegacyNames.size}`);
console.log(`family review records: ${Object.keys(familyData.familyReview).length}`);
console.log(`errors: ${errors.length}`);
```

- [ ] **Step 6: Build the responsive and full-scroll release test**

Create `scripts/test-windows-api-family-layout.mjs` using true CDP device metrics rather than only `--window-size`. At widths 1440, 900, 500, and 390 pixels, and small/default/large content sizes, open the family with the most variants and the parameter with the longest permitted choice list. Assert:

- dialog, header, selector, signatures, parameter rows, choices, behavior list, result, cleanup, and sources remain within the viewport width;
- no page-level horizontal overflow occurs;
- every variant button and copy control remains at least 40 pixels high;
- selector wrapping does not overlap the contract panel;
- code is contained by wrapping or a local horizontal scroller;
- scrolling the dialog reaches the last source link;
- switching to every variant still permits reaching its last source link;
- the full text width available to the popup is used rather than reintroducing narrow prose caps.

Extend `scripts/test-api-dialog-scroll.mjs` only for behavioral regressions not duplicated by the layout matrix.

- [ ] **Step 7: Remove compatibility use and update the course plan**

Search for `windowsApiGuide.entries` and change every renderer/search consumer to `windowsApiGuide.families`. Keep the generated flat contracts private inside `windows-api-data.js`; do not expose `entries` from the final guide object.

Update `PLAN.md` with a completed Windows API family/parameter stage containing the measured family count, callable-variant count, 69/69 review coverage, number of contextual choice sets and bindings, test names, final commit, Pages run, and public verification outcome.

- [ ] **Step 8: Run the complete release gate**

Change every site asset key and tied-asset expectation to `windows-api-families-4`. Then run:

```powershell
$JavaScriptFiles = Get-ChildItem . -File -Filter *.js
foreach ($File in $JavaScriptFiles) { node --check $File.FullName; if ($LASTEXITCODE) { exit $LASTEXITCODE } }
node .\scripts\audit-course.mjs
Get-ChildItem .\scripts -File -Filter test-*.mjs | Sort-Object Name | ForEach-Object { node $_.FullName; if ($LASTEXITCODE) { exit $LASTEXITCODE } }
$PythonFiles = Get-ChildItem .\downloads -File -Filter *.py
foreach ($File in $PythonFiles) { py -m py_compile $File.FullName; if ($LASTEXITCODE) { exit $LASTEXITCODE } }
git diff --check
git status --short
```

Expected: all JavaScript parses, all browser/data/view tests exit zero, the course audit has zero errors and warnings, every download parses, whitespace validation passes, and the status contains only intended Task 4 files.

- [ ] **Step 9: Review, commit, publish, and verify Task 4**

Review every popup category for accurate family boundaries, concise language, lack of nested controls, and meaningful contextual values. Fix every Critical or Important review finding and rerun Step 8.

Commit:

```powershell
git add windows-api-families.js windows-api-data.js windows-api-view.js app.js styles.css index.html docs\windows-api-source-audit.md scripts\test-windows-api-families.mjs scripts\test-windows-api-guide.mjs scripts\test-windows-api-view.mjs scripts\test-api-parameter-choices.mjs scripts\test-windows-api-family-layout.mjs scripts\test-api-dialog-scroll.mjs scripts\test-practice-command-view.mjs scripts\test-practice-checkpoint-view.mjs scripts\test-practice-case-study-view.mjs PLAN.md
git commit -m "feat: complete Windows API family guide"
git push origin main
$Commit = git rev-parse HEAD
gh -R Joelwang22/ILOVEOS run list --commit $Commit --limit 1 --json databaseId,status,conclusion,headSha,url
```

Wait for the exact workflow with `gh run watch`. Verify the public site's `index.html` and changed assets carry `windows-api-families-4`. In real Edge, verify representative family shapes, exact-variant searches, native and pywin32 choices, copy fallback, all content sizes, and full dialog scrolling. Finish with `git status --short` and require a clean worktree.
