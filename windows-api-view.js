(() => {
  const overviewView = window.ILOVEOS_REFERENCE_OVERVIEW_VIEW;
  const familyData = window.ILOVEOS_WINDOWS_API_FAMILY_DATA;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
    })[character]);
  }

  function tokens(query) {
    return query.trim().toLowerCase().replace(/[^a-z0-9_*]+/g, " ").split(/\s+/).filter(Boolean);
  }

  function variantSearchText(variant) {
    const choiceText = (variant.parameters || []).flatMap((parameter) => {
      const resolved = familyData.resolveParameterChoices(parameter.choiceBinding, "native");
      if (!resolved) return [];
      return [
        resolved.id,
        resolved.source,
        ...(resolved.values || []).flatMap((value) => [value.name, value.code, value.useWhen]),
        resolved.example?.code || "",
        resolved.example?.useWhen || "",
      ];
    });
    return [
      variant.name, variant.category, variant.dll, variant.summary, variant.nativeSignature, variant.python,
      variant.example, variant.result, variant.cleanup,
      ...(variant.sources || []),
      ...(variant.keyBehaviors || []),
      ...(variant.parameters || []).flatMap((parameter) => [parameter.name, parameter.direction, parameter.native, parameter.python, parameter.explanation]),
      ...choiceText,
    ].join(" ");
  }

  function familySearchText(family) {
    return [
      family.name, family.summary, family.recommendedVariant,
      ...(family.aliases || []).flatMap((alias) => [alias.name, alias.target, alias.note]),
      ...(family.variants || []).map(variantSearchText),
    ].join(" ").toLowerCase().replace(/[^a-z0-9_*]+/g, " ");
  }

  function selectForQuery(family, query) {
    return familyData.resolveSelection(family, query);
  }

  function filterFamilies(families, query = "") {
    const normalized = String(query || "").trim().toLocaleLowerCase();
    if (normalized) {
      const exact = families
        .filter((family) => family.variants.some((variant) => variant.name.toLocaleLowerCase() === normalized)
          || family.aliases.some((alias) => alias.name.toLocaleLowerCase() === normalized))
        .map((family) => ({ family, selectedVariant: selectForQuery(family, query) }));
      if (exact.length) return exact;
    }
    const required = tokens(query);
    return families
      .map((family) => ({ family, selectedVariant: selectForQuery(family, query) }))
      .filter(({ family }) => !required.length || required.every((token) => familySearchText(family).includes(token)));
  }

  function renderTypeMappings() {
    return overviewView.renderButton({
      kind: "windows-types",
      title: "Native Windows type translations",
      summary: "Scalar, handle, address, string, pointer, structure, and callback mappings.",
    });
  }

  function renderParameterList(variant) {
    if (!variant.parameters.length) return '<p class="no-parameters">This function takes no parameters.</p>';
    return `<div class="parameter-list" aria-label="${escapeHtml(variant.name)} parameter translations">
      ${variant.parameters.map((parameter, index) => `<div>
        <code>${escapeHtml(parameter.name)}</code>
        <span class="parameter-type">${escapeHtml(parameter.direction)} · ${escapeHtml(parameter.native)} → ${escapeHtml(parameter.python)}</span>
        <div class="parameter-description">${escapeHtml(parameter.explanation)}${renderParameterChoices(familyData.resolveParameterChoices(parameter.choiceBinding, "native"), `${variant.name}-${index}`)}</div>
      </div>`).join("")}
    </div>`;
  }

  function renderParameterChoices(resolved, copyIdPrefix) {
    if (!resolved) return "";
    const prefix = String(copyIdPrefix || "api-choice").replace(/[^A-Za-z0-9_-]+/g, "-");
    const renderRow = (value, index) => {
      const inputId = `${prefix}-value-${index}`;
      const groupName = `${prefix}-${value.group || value.name}`;
      const displayCode = resolved.surface === "native" ? value.name : value.code;
      return `<label class="api-choice-row" for="${escapeHtml(inputId)}">
        <input id="${escapeHtml(inputId)}" type="${value.control}" name="${escapeHtml(groupName)}" value="${escapeHtml(value.name)}" data-api-choice-select data-choice-name="${escapeHtml(value.name)}" data-choice-code="${escapeHtml(value.code)}" data-choice-definition="${escapeHtml(value.definition)}" data-choice-surface="${escapeHtml(resolved.surface)}" data-choice-zero="${value.zero ? "true" : "false"}" data-choice-standalone="${value.standalone ? "true" : "false"}" />
        <span class="api-choice-control" aria-hidden="true"></span>
        <span class="api-choice-code"><code>${escapeHtml(displayCode)}</code>${resolved.surface === "native" ? `<small>Python definition: ${escapeHtml(value.definition)}</small>` : ""}</span>
        <span>${escapeHtml(value.useWhen)}</span>
      </label>`;
    };
    const preset = resolved.example?.names?.length
      ? `<div class="api-choice-preset"><span><strong>Suggested combination</strong><code>${escapeHtml(resolved.example.code)}</code><small>${escapeHtml(resolved.example.useWhen)}</small></span><button type="button" data-api-choice-preset="${escapeHtml(resolved.example.names.join("|"))}">Select</button></div>`
      : "";
    return `<section class="api-parameter-choices" aria-label="${escapeHtml(resolved.id)} choices">
      <strong>Select common ${escapeHtml(resolved.kind === "bitmask" ? "flags" : "values")}</strong>
      ${resolved.values.map(renderRow).join("")}
      ${preset}
      <div class="api-choice-generator">
        <span data-api-choice-count aria-live="polite">0 selected</span>
        <button type="button" data-clear-api-choices disabled>Clear</button>
        <button type="button" class="button primary" data-generate-api-choices data-choice-set="${escapeHtml(resolved.id)}" data-choice-surface="${escapeHtml(resolved.surface)}" data-choice-parameter="${escapeHtml(resolved.parameter)}" disabled>Generate code</button>
      </div>
      <a href="${escapeHtml(resolved.source)}" target="_blank" rel="noreferrer">Full list on Microsoft Learn &#8599;</a>
    </section>`;
  }

  function formatUsage(expressions) {
    if (expressions.length <= 2) return expressions.join(" | ");
    return `(\n    ${expressions.join("\n    | ")}\n)`;
  }

  function nativePrelude(values) {
    const names = new Set(values.map((value) => value.name));
    if (names.has("WINTRUST_ACTION_GENERIC_VERIFY_V2")) {
      return `import ctypes
from ctypes import wintypes

class GUID(ctypes.Structure):
    _fields_ = [
        ("Data1", wintypes.DWORD),
        ("Data2", wintypes.WORD),
        ("Data3", wintypes.WORD),
        ("Data4", wintypes.BYTE * 8),
    ]`;
    }
    return names.has("PAGE_FILE_BACKING") ? "import ctypes" : "";
  }

  function buildGeneratedCode(surface, parameter, values) {
    const selected = Array.isArray(values) ? values.filter((value) => value?.name && value?.code) : [];
    const expressions = selected.map((value) => surface === "native" ? value.name : value.code);
    const usage = formatUsage(expressions);
    let definitions = "";
    let definitionsLabel = "Definitions";
    if (surface === "native") {
      const prelude = nativePrelude(selected);
      const constants = selected.map((value) => `${value.name} = ${value.definition}`).join("\n");
      definitions = [prelude, constants].filter(Boolean).join("\n\n");
    } else {
      definitionsLabel = "Required imports";
      const modules = [...new Set(selected.map((value) => value.code.match(/^([A-Za-z_]\w*)\./)?.[1]).filter(Boolean))].sort();
      definitions = modules.map((module) => `import ${module}`).join("\n");
    }
    const parameterNote = parameter ? `# Use for ${parameter}` : "# Use as the argument value";
    return {
      surface,
      parameter,
      definitionsLabel,
      definitions,
      usage,
      complete: [definitions, `${parameterNote}\n${usage}`].filter(Boolean).join("\n\n"),
    };
  }

  function selectedVariant(match) {
    return match.family.variants.find((variant) => variant.name === match.selectedVariant)
      || match.family.variants.find((variant) => variant.name === match.family.recommendedVariant)
      || match.family.variants[0];
  }

  function renderFamilyRow(match) {
    const { family } = match;
    const variant = selectedVariant(match);
    const dlls = [...new Set(family.variants.map((item) => item.dll))];
    return `<button class="feature-row api-detail-trigger windows-api-detail-trigger" type="button"
      data-windows-api-family="${escapeHtml(family.id)}" data-windows-api-variant="${escapeHtml(variant.name)}"
      aria-label="View the ${escapeHtml(family.name)} Windows API family, selected variant ${escapeHtml(variant.name)}">
      <code>${escapeHtml(family.name)}</code>
      <strong>${escapeHtml(dlls.length === 1 ? dlls[0] : "Multiple DLLs")}</strong>
      <span>${escapeHtml(family.summary)} <small class="api-family-variant-labels">${family.variants.map((item) => escapeHtml(item.name)).join(" · ")}</small></span>
      <span class="feature-open" aria-hidden="true">+</span>
    </button>`;
  }

  function categoryAccent(category) {
    return ({
      "Files, pipes, and devices": "green", "Hooks and desktop APIs": "orange",
      "Memory and address spaces": "teal", "Modules and loading": "violet",
      "Processes, threads, and handles": "blue", "Security and trust": "rose",
      "Services and Registry": "amber", "System information and errors": "cyan",
    })[category] || "violet";
  }

  function familyCategory(match) {
    return selectedVariant(match).category;
  }

  function renderEntries(matches, openCategories = false) {
    const groups = new Map();
    for (const match of matches) {
      const category = familyCategory(match);
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(match);
    }
    if (!matches.length) return '<div class="search-empty">No matching Windows API family. Try its family name, variant, alias, DLL, type, parameter, result, or cleanup rule.</div>';
    return [...groups.entries()].map(([category, categoryMatches]) => `<details class="api-module windows-api-module" style="--reference-color: var(--${categoryAccent(category)})" ${openCategories ? "open" : ""}>
      <summary><span class="api-module-title"><code>${escapeHtml(category)}</code></span>
        <span class="api-summary-meta"><span class="entry-count">${categoryMatches.length} ${categoryMatches.length === 1 ? "family" : "families"}</span><span class="details-chevron">⌄</span></span>
      </summary>
      <div class="api-module-body windows-api-module-body"><div class="feature-table">
        <div class="feature-row feature-head"><span>API family</span><span>DLL</span><span>What it does</span><span></span></div>
        ${categoryMatches.map(renderFamilyRow).join("")}
      </div></div>
    </details>`).join("");
  }

  function renderTabs(family, selectedName) {
    if (family.variants.length < 2) return "";
    return `<div class="api-family-alias-picker">
      <strong>Aliases:</strong>
      <div class="api-family-variants" role="tablist" aria-label="${escapeHtml(family.name)} aliases">
        ${family.variants.map((variant) => {
        const isSelected = variant.name === selectedName;
        return `<button class="api-variant-tab" type="button" role="tab" data-api-variant="${escapeHtml(variant.name)}"
          aria-selected="${isSelected}" tabindex="${isSelected ? "0" : "-1"}">${escapeHtml(variant.name)}</button>`;
        }).join("")}
      </div>
    </div>`;
  }

  function renderDialog(family, selectedVariantName) {
    if (!family) return '<div class="api-dialog-body"><p class="search-empty">This Windows API family is unavailable.</p></div>';
    const name = familyData.resolveSelection(family, selectedVariantName);
    const variant = family.variants.find((item) => item.name === name) || family.variants[0];
    return `<header class="api-dialog-head">
      <div><span>${escapeHtml(variant.category)} · ${escapeHtml(variant.dll)}</span><h2 id="api-detail-title">${escapeHtml(family.name)} · ${escapeHtml(variant.name)}</h2><p>${escapeHtml(family.summary)}</p></div>
      <button class="api-dialog-close" type="button" aria-label="Close API details">×</button>
    </header>
    <div class="api-dialog-body windows-api-dialog-body" style="--reference-color: var(--${categoryAccent(variant.category)})">
      ${renderTabs(family, variant.name)}
      <section class="signature-block windows-contract-block">
        <div class="windows-signature-grid"><section><h3>Native declaration</h3><pre><code>${escapeHtml(variant.nativeSignature)}</code></pre></section>
          <section><h3>Python translation</h3><pre><code>${escapeHtml(variant.python)}</code></pre></section></div>
        <h3>Parameters</h3>${renderParameterList(variant)}
      </section>
      <section class="signature-block windows-call-block"><h3>Checked call pattern</h3><pre><code>${escapeHtml(variant.example)}</code></pre></section>
      ${variant.keyBehaviors.length ? `<section class="signature-block api-key-behaviors"><h3>Key behaviors</h3><ul>${variant.keyBehaviors.map((behavior) => `<li>${escapeHtml(behavior)}</li>`).join("")}</ul></section>` : ""}
      <section class="signature-block windows-outcome-block"><h3>Result and failure</h3><div class="return-card"><code>Result</code><span>${escapeHtml(variant.result)}</span></div>
        <h3>Ownership and cleanup</h3><div class="return-card"><code>Cleanup</code><span>${escapeHtml(variant.cleanup)}</span></div></section>
      <div class="api-source-links">${variant.sources.map((source, index) => `<a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">Microsoft Learn${variant.sources.length > 1 ? ` ${index + 1}` : ""} ↗</a>`).join("")}</div>
    </div>`;
  }

  function render(guide, query = "") {
    const matches = filterFamilies(guide.families, query);
    return `<div class="content-wrap reference-width">
      <div class="breadcrumb"><span><a href="#/">Course</a></span><span>Windows API guide</span></div>
      <header class="reference-hero compact-reference-hero"><h1>Find the native Windows API you need.</h1>
        <span class="source-note">Cross-checked with <a href="https://learn.microsoft.com/windows/win32/apiindex/windows-api-list" target="_blank" rel="noreferrer">the Microsoft Windows API index ↗</a></span></header>
      ${query ? "" : renderTypeMappings()}
      <div class="reference-filter sticky-filter"><input id="windows-api-filter" type="search" value="${escapeHtml(query)}" placeholder="Try: VirtualAllocEx, SIZE_T, output pointer, Kernel32…" aria-label="Search the Windows API guide" autocomplete="off" />
        <span class="reference-count" id="windows-api-count">${matches.length} ${matches.length === 1 ? "Family" : "Families"}</span></div>
      <section class="reference-list" id="windows-api-results" aria-live="polite">${renderEntries(matches, Boolean(query))}</section>
    </div>`;
  }

  window.ILOVEOS_WINDOWS_API_VIEW = { buildGeneratedCode, filterFamilies, render, renderDialog, renderEntries, renderParameterChoices };
})();
