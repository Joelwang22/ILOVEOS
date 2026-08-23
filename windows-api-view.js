(() => {
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    })[character]);
  }

  function tokens(query) {
    return query.trim().toLowerCase().replace(/[^a-z0-9_*]+/g, " ").split(/\s+/).filter(Boolean);
  }

  function entrySearchText(entry) {
    return [
      entry.name,
      entry.category,
      entry.dll,
      entry.summary,
      entry.nativeSignature,
      entry.python,
      entry.result,
      entry.cleanup,
      entry.pywin32,
      ...entry.parameters.flatMap((parameter) => [parameter.name, parameter.direction, parameter.native, parameter.python, parameter.explanation]),
    ].join(" ").toLowerCase().replace(/[^a-z0-9_*]+/g, " ");
  }

  function filterEntries(entries, query = "") {
    const required = tokens(query);
    if (!required.length) return entries;
    return entries.filter((entry) => {
      const searchable = entrySearchText(entry);
      return required.every((token) => searchable.includes(token));
    });
  }

  function renderTypeMappings(mappings) {
    const midpoint = Math.ceil(mappings.length / 2);
    const groups = [
      ["Scalar, handle, and address types", mappings.slice(0, midpoint)],
      ["Strings, pointers, structures, and callbacks", mappings.slice(midpoint)],
    ];
    return `
      <section class="reference-patterns windows-api-patterns" aria-label="Native types to Python types">
        ${groups.map(([title, items]) => `
          <details class="pattern-card windows-type-card">
            <summary>${escapeHtml(title)}<span>+</span></summary>
            <div class="windows-type-list">
              ${items.map((mapping) => `
                <div>
                  <span><code>${escapeHtml(mapping.native)}</code><i aria-hidden="true">→</i><code>${escapeHtml(mapping.python)}</code></span>
                  <p>${escapeHtml(mapping.meaning)}</p>
                </div>`).join("")}
            </div>
          </details>`).join("")}
      </section>`;
  }

  function renderParameterList(entry) {
    if (!entry.parameters.length) return '<p class="no-parameters">This function takes no parameters.</p>';
    return `
      <div class="parameter-list" aria-label="${escapeHtml(entry.name)} parameter translations">
        ${entry.parameters.map((parameter) => `
          <div>
            <code>${escapeHtml(parameter.name)}</code>
            <span class="parameter-type">${escapeHtml(parameter.direction)} · ${escapeHtml(parameter.native)} → ${escapeHtml(parameter.python)}</span>
            <span>${escapeHtml(parameter.explanation)}</span>
          </div>`).join("")}
      </div>`;
  }

  function renderEntryRow(entry) {
    return `
      <button class="feature-row api-detail-trigger windows-api-detail-trigger" type="button" data-windows-api="${escapeHtml(entry.name)}" aria-label="View the native and Python contracts for ${escapeHtml(entry.name)}">
        <code>${escapeHtml(entry.name)}</code>
        <strong>${escapeHtml(entry.dll)}</strong>
        <span>${escapeHtml(entry.summary)}</span>
        <span class="feature-open" aria-hidden="true">+</span>
      </button>`;
  }

  function categoryAccent(category) {
    return ({
      "Files, pipes, and devices": "green",
      "Hooks and desktop APIs": "orange",
      "Memory and address spaces": "teal",
      "Modules and loading": "violet",
      "Processes, threads, and handles": "blue",
      "Security and trust": "rose",
      "Services and Registry": "amber",
      "System information and errors": "cyan",
    })[category] || "violet";
  }

  function renderEntries(entries, openCategories = false) {
    const groups = new Map();
    for (const entry of entries) {
      if (!groups.has(entry.category)) groups.set(entry.category, []);
      groups.get(entry.category).push(entry);
    }
    if (!entries.length) return '<div class="search-empty">No matching API. Try its name, DLL, native type, parameter, result, failure, or cleanup rule.</div>';
    return [...groups.entries()].map(([category, categoryEntries]) => `
      <details class="api-module windows-api-module" style="--reference-color: var(--${categoryAccent(category)})" ${openCategories ? "open" : ""}>
        <summary>
          <span class="api-module-title"><code>${escapeHtml(category)}</code><span>Native Windows contracts and Python translations</span></span>
          <span class="api-summary-meta"><span class="entry-count">${categoryEntries.length} ${categoryEntries.length === 1 ? "entry" : "entries"}</span><span class="details-chevron">⌄</span></span>
        </summary>
        <div class="api-module-body windows-api-module-body">
          <div class="feature-table">
            <div class="feature-row feature-head"><span>API</span><span>DLL</span><span>What it does</span><span></span></div>
            ${categoryEntries.map(renderEntryRow).join("")}
          </div>
        </div>
      </details>`).join("");
  }

  function renderDialog(entry) {
    if (!entry) return '<div class="api-dialog-body"><p class="search-empty">This Windows API entry is unavailable.</p></div>';
    return `
      <header class="api-dialog-head">
        <div><span>${escapeHtml(entry.category)} · ${escapeHtml(entry.dll)}</span><h2 id="api-detail-title">${escapeHtml(entry.name)}</h2><p>${escapeHtml(entry.summary)}</p></div>
        <button class="api-dialog-close" type="button" aria-label="Close API details">×</button>
      </header>
      <div class="api-dialog-body windows-api-dialog-body">
        <section class="api-dialog-summary"><p>${escapeHtml(entry.pywin32)}</p><span>Recommended Python path</span></section>
        <section class="signature-block windows-contract-block">
          <div class="windows-signature-grid">
            <section><h3>Native declaration</h3><pre><code>${escapeHtml(entry.nativeSignature)}</code></pre></section>
            <section><h3>Python translation</h3><pre><code>${escapeHtml(entry.python)}</code></pre></section>
          </div>
          <h3>Parameters</h3>
          ${renderParameterList(entry)}
        </section>
        <section class="signature-block windows-call-block">
          <h3>Checked call pattern</h3>
          <pre><code>${escapeHtml(entry.example)}</code></pre>
        </section>
        <section class="signature-block windows-outcome-block">
          <h3>Result and failure</h3>
          <div class="return-card"><code>Result</code><span>${escapeHtml(entry.result)}</span></div>
          <h3>Ownership and cleanup</h3>
          <div class="return-card"><code>Cleanup</code><span>${escapeHtml(entry.cleanup)}</span></div>
        </section>
        <div class="api-source-links">
          ${entry.sources.map((source, index) => `<a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">Microsoft Learn${entry.sources.length > 1 ? ` ${index + 1}` : ""} ↗</a>`).join("")}
        </div>
      </div>`;
  }

  function render(guide, query = "") {
    const matches = filterEntries(guide.entries, query);
    return `
      <div class="content-wrap reference-width">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>Windows API guide</span></div>
        <header class="reference-hero compact-reference-hero">
          <h1>Find the native Windows API you need.</h1>
          <span class="source-note">Cross-checked with <a href="https://learn.microsoft.com/windows/win32/apiindex/windows-api-list" target="_blank" rel="noreferrer">the Microsoft Windows API index ↗</a></span>
        </header>
        ${query ? "" : renderTypeMappings(guide.typeMappings)}
        <div class="reference-filter sticky-filter">
          <input id="windows-api-filter" type="search" value="${escapeHtml(query)}" placeholder="Try: VirtualAllocEx, SIZE_T, output pointer, Kernel32…" aria-label="Search the Windows API guide" autocomplete="off" />
          <span class="reference-count" id="windows-api-count">${matches.length} APIs</span>
        </div>
        <section class="reference-list" id="windows-api-results" aria-live="polite">
          ${renderEntries(matches, Boolean(query))}
        </section>
      </div>`;
  }

  window.ILOVEOS_WINDOWS_API_VIEW = { filterEntries, render, renderDialog, renderEntries };
})();
