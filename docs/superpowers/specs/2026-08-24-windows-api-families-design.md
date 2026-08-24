# Windows API Families and Contextual Parameter Choices Design

## Purpose

The Windows API guide currently presents one flat popup per native export. That makes a documented entry such as `CreateEventW` useful in isolation, but it does not explain how `CreateEventA`, `CreateEventExA`, `CreateEventExW`, or the encoding-neutral C aliases relate to it. The guide also names parameters such as `DesiredAccess` and `ImpersonationLevel` without consistently showing the Python constants a learner can pass or explaining when each choice fits.

This change groups related exports into one compact family popup, adds buttons that switch the complete visible contract in place, and attaches concise, copyable value guidance to the parameters that accept named flags or enumeration values. Every statement is paraphrased into direct human language from authoritative documentation. The feature remains scoped to APIs already represented in ILOVEOS.

## Scope

The work covers:

- every native Windows API currently represented by the Windows API guide;
- officially documented sibling exports for those represented API families;
- encoding variants, such as `A` and `W`, and directly related base/extended variants where the contracts belong in one understandable family;
- aliases that Windows headers resolve at compile time;
- correctness-critical facts from the Syntax, Parameters, Return value, Remarks, and Requirements sections of Microsoft Learn;
- named parameter values used by relevant native and pywin32 functions already represented in ILOVEOS;
- searching, opening, switching, copying, keyboard interaction, responsive dialog layout, auditing, and publication.

The change does not attempt to catalogue the entire Windows SDK, reproduce every Microsoft Learn remark, add unrelated APIs, add a general constants encyclopaedia, or introduce nested dialogs, dropdowns, or accordions inside an API popup.

## Family Boundary

A family is defined by a reviewed manifest, never by removing a suffix mechanically.

- `A` and `W` exports for one documented operation belong to the same family.
- A generic C/C++ macro such as `CreateEvent` is an alias, not a callable ctypes export. It is recorded as alias metadata and resolves to the `W` or `A` export according to the documented header convention.
- A base and extended export share a family only when Microsoft documents them as direct alternatives for the same operation and presenting them together clarifies the choice. `CreateEventW` and `CreateEventExW` satisfy this rule.
- Similar spelling alone is insufficient. `VirtualAlloc` and `VirtualAllocEx`, for example, remain distinct operations because one allocates in the calling process and the other targets a process handle.
- Every existing guide entry must resolve to exactly one family and exactly one variant within that family. No existing contract may disappear during consolidation.
- Sibling discovery is limited to the reviewed families originating from existing guide entries. An unrelated API encountered through a See Also link remains out of scope.

The default variant is the explicit Unicode `W` export when it exists. An existing course-used export remains available even when it is not the default. A byte-oriented API such as `GetProcAddress`, which intentionally accepts an export name as bytes and has no `A`/`W` pair, remains a single-variant family.

## Data Model

The Windows API guide exposes families rather than flat entries:

```js
{
  id: "create-event",
  name: "CreateEvent",
  category: "Processes, threads, and handles",
  summary: "Create or open a named or unnamed event object.",
  recommendedVariant: "CreateEventW",
  aliases: [
    { name: "CreateEvent", target: "CreateEventW", note: "Selects A or W in C/C++ according to UNICODE." },
    { name: "CreateEventEx", target: "CreateEventExW", note: "Selects A or W in C/C++ according to UNICODE." }
  ],
  variants: [/* complete variant contracts */]
}
```

Each variant owns the fields that can actually differ:

```js
{
  name: "CreateEventExW",
  label: "ExW",
  recommended: false,
  useWhen: "Choose explicit access rights or CREATE_EVENT_* flags.",
  availability: "Windows Vista and later",
  dll: "Kernel32.dll",
  nativeSignature: "...",
  python: "...",
  example: "...",
  parameters: [/* translated parameter contracts and optional choice bindings */],
  keyBehaviors: [/* zero to five concise remarks */],
  result: "...",
  cleanup: "...",
  pywin32: "...",
  sources: [/* direct official pages */]
}
```

Single-contract APIs use the same model with one variant. This avoids a second rendering path and makes the completeness audit uniform.

Family definitions, variant contracts, and reusable parameter choices have separate responsibilities:

- the family manifest declares membership, aliases, order, and the recommended variant;
- each variant contract describes one actual callable export;
- the parameter-choice catalogue defines named values once;
- a parameter binding selects only the catalogue values relevant to that function and may add one contextual combination example.

## Contextual Parameter Choices

Named constants appear where a learner needs them: beside the parameter that accepts them in the native or pywin32 popup. They do not appear as a disconnected list.

A reusable choice set has a stable identifier, a kind (`enum`, `bitmask`, or `sentinel`), an official source, and concise values:

```js
{
  id: "token-access",
  kind: "bitmask",
  source: "https://learn.microsoft.com/windows/win32/secauthz/access-rights-for-access-token-objects",
  values: {
    TOKEN_QUERY: {
      python: "win32security.TOKEN_QUERY",
      native: "TOKEN_QUERY",
      useWhen: "Read token identity, groups, privileges, or other token information."
    },
    TOKEN_DUPLICATE: {
      python: "win32security.TOKEN_DUPLICATE",
      native: "TOKEN_DUPLICATE",
      useWhen: "Pass the token to DuplicateToken or DuplicateTokenEx."
    }
  }
}
```

A function parameter binds a relevant subset and, for a bitmask, may supply one copyable combination:

```js
{
  name: "DesiredAccess",
  choiceSet: "token-access",
  choices: ["TOKEN_QUERY", "TOKEN_DUPLICATE", "TOKEN_ADJUST_PRIVILEGES"],
  example: {
    label: "Inspect and duplicate",
    code: "win32security.TOKEN_QUERY | win32security.TOKEN_DUPLICATE"
  }
}
```

The initial audit includes every represented parameter for which a named value materially helps the learner choose a correct call. This includes relevant access masks, creation and protection flags, wait values, information classes, object types, impersonation levels, token types, service controls, Registry access, mapping access, hook identifiers, and comparable finite choices already used by the course. It does not attach guidance to ordinary identifiers, sizes, buffers, handles, paths, or Boolean parameters whose meaning is already complete in the parameter description.

For `win32security.DuplicateTokenEx`, the `ImpersonationLevel` binding includes `SecurityAnonymous`, `SecurityIdentification`, `SecurityImpersonation`, and `SecurityDelegation`, with `SecurityImpersonation` explained as the usual local impersonation choice rather than an unexplained magic value. For `OpenProcessToken`, `DesiredAccess` explains at least `TOKEN_QUERY`, `TOKEN_DUPLICATE`, and `TOKEN_ADJUST_PRIVILEGES`, including the copyable inspection-and-duplication expression.

### Compactness rules

- A parameter shows no choice section unless the values change how the call is used.
- A use-case sentence is at most 24 words.
- A parameter has at most one copyable combination example.
- A large bitmask family shows only the values relevant to represented course calls and links to the complete official list.
- A small finite enumeration may show all of its values when omission would make the distinction misleading.
- Repeated descriptions are stored once and rendered by reference.
- Choice guidance does not repeat the parameter description, result rule, cleanup rule, or key-behavior text.

Copying a value copies only the displayed Python expression. It does not execute code. The expression uses the module spelling appropriate to the popup, such as `win32security.TOKEN_QUERY`; a native-only declaration may instead show the symbolic native name and the local integer definition required by its checked example.

## Source and Writing Standard

Microsoft Learn is authoritative for native family relationships and contracts. Relevant pywin32 wrapper signatures continue to use the maintained wrapper/type sources already recorded by the site, while Windows meanings and named values link to Microsoft Learn.

For every included native variant, the content audit reads the official Syntax, Parameters, Return value, Remarks, Requirements, and directly relevant family links. The guide paraphrases rather than copying Microsoft prose.

The popup includes only facts that affect one of these decisions:

1. which variant or parameter value to choose;
2. what input or output is valid;
3. whether a parameter is ignored or changes state;
4. what access, security, version, or architecture condition applies;
5. how existing named objects or partial results behave;
6. how failure is reported and when last error is meaningful;
7. who owns the returned resource and how long it remains valid.

Each variant has one short `useWhen` sentence and zero to five `keyBehaviors`. Each behavior is at most 30 words. Remarks already expressed by parameters, result handling, cleanup, availability, or a contextual value are omitted. Source links remain visible so unusual edge cases are discoverable without turning the popup into a copy of Microsoft Learn.

## Popup Interaction

The Windows API list renders one row per family. The row uses the family name and may show compact variant labels so learners can see that alternatives exist before opening it.

Inside the existing dialog:

1. The header shows the family purpose.
2. Families with multiple variants show a native-button tab list immediately below the header.
3. One variant is selected at all times. The recommended variant is labelled `Recommended`.
4. Selecting a button replaces the use case, availability, declarations, parameters, choices, checked call, key behavior, result, cleanup, pywin32 path, and source links in the same popup.
5. Alias notes appear as one compact strip. They never receive duplicate signatures or ctypes examples.
6. A single-variant family omits the selector and alias strip when neither adds information.
7. Parameter choices appear directly below their owning parameter. They never open another popup or dropdown.

The selector uses native buttons with tab semantics, visible selected state, `aria-selected`, roving `tabindex`, Left/Right arrow navigation, and Home/End navigation. Focus stays on the selected variant button while the contract panel updates. The panel title announces the selected export to assistive technology without moving focus.

The existing close behavior, focus containment, Escape behavior, backdrop behavior, content-size settings, and full-height dialog scrolling remain intact.

## Search and Selection

Search indexes the family name, all variant names, aliases, DLL, purpose, parameters, named values, use cases, result, cleanup, and critical behavior.

- A query matching any sibling or alias returns the family once.
- Opening a row from an exact variant match selects that variant.
- Opening a generic family or alias match selects its recorded target, normally the recommended `W` export.
- Broader searches open the recommended variant.
- Result counts report families, while an adjacent compact total may report the number of callable variants. Existing tests that asserted 69 flat APIs are revised to assert complete legacy-contract coverage plus the new family and variant totals.

Search does not produce duplicate family rows and does not add URL routing or persisted variant state.

## Pywin32 Integration

The pywin32 guide keeps its existing module and function rows. Its popup renderer gains the same contextual parameter-choice component used by the Windows API popup.

Bindings attach by exact module, function, overload, and parameter name, for example:

- `win32security.OpenProcessToken.DesiredAccess` → token-access choices;
- `win32security.DuplicateTokenEx.ImpersonationLevel` → security-impersonation-level choices;
- `win32security.DuplicateTokenEx.TokenType` → primary/impersonation token choices.

This does not merge pywin32 functions into native families or change their signatures. It only makes accepted symbolic values and useful combinations available where the existing signature expects them.

## Validation and Error Handling

Static validation runs before release and rejects:

- a legacy Windows API entry absent from the family manifest;
- duplicate family IDs, variant names, or aliases;
- a family without variants or with a missing recommended variant;
- an alias whose target does not exist in its family;
- a parameter binding whose choice set or value does not exist;
- a choice binding whose function, overload, or parameter does not exist;
- a variant without a direct official source;
- more than five key behaviors, overlong use-case text, or overlong behavior text;
- an empty copy expression or more than one combination example per parameter;
- an `A`/`W` or base/extended relationship inferred without an explicit manifest record;
- unsafe HTML entering any displayed field.

Invalid data is a build/test failure rather than a partially rendered release. Runtime lookup failure keeps the existing unavailable-entry message and never opens a second dialog.

## Files and Responsibilities

### `windows-api-data.js`

- Retains low-level contract generation.
- Emits complete variant contracts and single-variant families.
- Attaches concise behavior, availability, and parameter-choice bindings.
- Preserves a traceable list of all legacy entry names.

### `windows-api-families.js`

- Owns the reviewed family manifest, aliases, recommended variants, reusable choice sets, and native/pywin32 bindings.
- Keeps editorial family decisions separate from generated signature material.
- Exposes pure lookup and validation helpers suitable for Node tests and browser rendering.

`index.html` loads this static browser script after the generated signature stages and before `windows-api-data.js`. It adds no runtime dependency.

### `windows-api-view.js`

- Filters and renders families once.
- Renders variant buttons, aliases, availability, key behaviors, and contextual values.
- Exposes pure render helpers for focused tests.

### `app.js`

- Opens a family with the search-selected or recommended variant.
- Wires variant keyboard/click interaction and value-copy feedback.
- Reuses the contextual-value renderer in pywin32 signature popups.

### `styles.css`

- Matches the established pywin32 guide visual language.
- Styles compact variant buttons, selected/recommended states, alias strip, behavior list, value rows, and copy controls.
- Preserves full horizontal use of the dialog body and complete scrolling at every supported viewport and content size.

### Audit and browser tests

- Validate family coverage, official sibling manifest decisions, prose limits, parameter bindings, search selection, rendering, accessibility, copying, and dialog containment.

## Testing

Implementation follows test-driven development. Each task begins with a focused failing test and ends with its focused tests plus the relevant existing suite.

The release gate includes:

1. A data test proving every current guide entry maps to exactly one family variant.
2. Manifest fixtures rejecting guessed suffix families, duplicate names, unresolved aliases, missing defaults, invalid sources, and malformed parameter bindings.
3. Representative family tests for `A`/`W`, base/extended plus `A`/`W`, a `W`-only API, a true single export, and a byte-oriented no-suffix API.
4. Content tests confirming `CreateEventA`, `CreateEventW`, `CreateEventExA`, and `CreateEventExW` are in one family and preserve their distinct signatures, availability, results, and sources.
5. Search tests proving variant, alias, parameter, and constant queries return one family and select the expected variant.
6. Pywin32 tests proving `OpenProcessToken` and `DuplicateTokenEx` show their contextual choices and exact copyable expressions.
7. Browser tests for mouse and keyboard variant switching, focus retention, accessible selection state, copy success, clipboard failure fallback, and dialog closing.
8. Layout tests at desktop and 390-pixel widths across small, default, and large content sizes, using the largest family and longest permitted choice content.
9. Dialog-scroll tests proving the bottom source and cleanup content is reachable after every variant switch.
10. Prose audits enforcing the compactness limits and checking that every critical behavior links to an authoritative source.
11. The complete existing JavaScript syntax, data, view, course-audit, assessment, reference, and browser suite.
12. `git diff --check`, cache-key verification, and a clean worktree review.

## Publication Workflow

The implementation is divided into independently releasable tasks:

1. Family/choice schema, validation, and reviewed coverage manifest.
2. Windows family search, popup selector, aliases, and variant content.
3. Contextual parameter choices and copy interaction in both Windows API and pywin32 popups.
4. Full Microsoft Learn content audit for every represented family, responsive/accessibility verification, cache update, and release audit.

After every task:

1. Run focused tests and the full relevant suite.
2. Review the diff for source accuracy, compactness, and unrelated changes.
3. Commit only the task files.
4. Push `main` to GitHub.
5. Wait for the GitHub Pages run for that exact commit to succeed.
6. Verify the public site serves the changed assets and behavior before starting the next task.

## Completion Criteria

The overhaul is complete only when:

- every native API previously represented remains available through exactly one family and variant;
- every officially reviewed sibling of those represented families is available without adding unrelated API families;
- `CreateEvent` exposes `CreateEventA`, `CreateEventW`, `CreateEventExA`, and `CreateEventExW` in one popup;
- generic C aliases are explained but never presented as ctypes exports;
- an explicit Unicode variant is recommended wherever one exists;
- switching variants replaces the complete contract in place and never nests or duplicates a popup;
- every included variant has concise paraphrased behavior, correct availability, failure, ownership, and direct official sources;
- relevant native and pywin32 parameters show compact, contextual, copyable value choices;
- `TOKEN_QUERY`, useful token-access combinations, and all four `SECURITY_IMPERSONATION_LEVEL` choices appear in their relevant functions;
- no function popup becomes a general constant dump or exceeds the documented compactness limits;
- search finds aliases, siblings, and contextual constants without duplicate family results;
- selector and copy controls work by keyboard and communicate state accessibly;
- all popup content remains horizontally usable and vertically reachable at supported widths and content sizes;
- all focused and existing tests pass;
- every implementation task has been published and verified on GitHub Pages.
