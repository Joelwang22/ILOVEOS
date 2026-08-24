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

  const choiceSets = {};
  const nativeBindings = {};
  const pywin32Bindings = {};

  function singletonId(name) {
    return String(name || "api")
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
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
    const names = Array.isArray(binding.choices) ? binding.choices : Object.keys(choiceSet.values || {});
    return {
      id: binding.choiceSet,
      kind: choiceSet.kind,
      source: choiceSet.source,
      values: names.filter((name) => choiceSet.values?.[name]).map((name) => ({ name, ...choiceSet.values[name] })),
      example: binding.example || null,
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
    choiceSets,
    nativeBindings,
    pywin32Bindings,
    buildFamilies,
    resolveSelection,
    resolveParameterChoices,
    validateGuide,
  };
})();
