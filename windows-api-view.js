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

  function renderWorkflow(workflow) {
    return `
      <section class="windows-guide-section" aria-labelledby="translation-workflow-title">
        <div class="section-heading-row">
          <div><span class="eyebrow">Start here</span><h2 id="translation-workflow-title">How to translate Microsoft declarations</h2></div>
          <p>Follow the same six decisions for every unfamiliar API.</p>
        </div>
        <ol class="translation-workflow">
          ${workflow.map(([title, detail], index) => `
            <li><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div></li>`).join("")}
        </ol>
      </section>`;
  }

  function renderTypeMappings(mappings) {
    return `
      <section class="windows-guide-section" aria-labelledby="type-map-title">
        <div class="section-heading-row">
          <div><span class="eyebrow">Translation table</span><h2 id="type-map-title">Native types to Python types</h2></div>
          <p>Match width, pointer level, mutability, and ownership. Similar-looking typedefs are not interchangeable guesses.</p>
        </div>
        <div class="native-type-table" role="table" aria-label="Native Windows types translated to ctypes">
          <div class="native-type-row native-type-head" role="row"><span>Microsoft type</span><span>Python declaration</span><span>How to reason about it</span></div>
          ${mappings.map((mapping) => `
            <div class="native-type-row" role="row">
              <code>${escapeHtml(mapping.native)}</code>
              <code>${escapeHtml(mapping.python)}</code>
              <p>${escapeHtml(mapping.meaning)}</p>
            </div>`).join("")}
        </div>
      </section>`;
  }

  function renderParameterTable(entry) {
    if (!entry.parameters.length) return '<p class="no-parameters">This function takes no parameters.</p>';
    return `
      <div class="native-parameter-table" role="table" aria-label="${escapeHtml(entry.name)} parameter translations">
        <div class="native-parameter-row native-parameter-head" role="row"><span>Parameter</span><span>Native</span><span>Python</span><span>Meaning</span></div>
        ${entry.parameters.map((parameter) => `
          <div class="native-parameter-row" role="row">
            <span><code>${escapeHtml(parameter.name)}</code><small>${escapeHtml(parameter.direction)}</small></span>
            <code>${escapeHtml(parameter.native)}</code>
            <code>${escapeHtml(parameter.python)}</code>
            <p>${escapeHtml(parameter.explanation)}</p>
          </div>`).join("")}
      </div>`;
  }

  function renderEntry(entry, open = false) {
    return `
      <details class="windows-api-entry" data-windows-api="${escapeHtml(entry.name)}" ${open ? "open" : ""}>
        <summary>
          <span><code>${escapeHtml(entry.name)}</code><strong>${escapeHtml(entry.summary.split(".")[0])}</strong></span>
          <span class="windows-api-meta"><span>${escapeHtml(entry.dll)}</span><span class="details-chevron" aria-hidden="true">+</span></span>
        </summary>
        <div class="windows-api-entry-body">
          <p class="windows-api-summary">${escapeHtml(entry.summary)}</p>
          <div class="binding-choice">
            <span>Recommended Python path</span>
            <p>${escapeHtml(entry.pywin32)}</p>
          </div>
          <div class="signature-pair">
            <section>
              <h3>Native declaration</h3>
              <p>Read this as the operating-system contract.</p>
              <pre><code>${escapeHtml(entry.nativeSignature)}</code></pre>
            </section>
            <section>
              <h3>Python translation</h3>
              <p>Declare the boundary before the first call.</p>
              <pre><code>${escapeHtml(entry.python)}</code></pre>
            </section>
          </div>
          <section class="parameter-translation">
            <h3>Parameter-by-parameter translation</h3>
            ${renderParameterTable(entry)}
          </section>
          <section class="checked-call-pattern">
            <h3>Checked call pattern</h3>
            <p>Replace the descriptive input names with values established by your program, while preserving the result and cleanup branches.</p>
            <pre><code>${escapeHtml(entry.example)}</code></pre>
          </section>
          <div class="contract-outcomes">
            <section><h3>Result and failure</h3><p>${escapeHtml(entry.result)}</p></section>
            <section><h3>Ownership and cleanup</h3><p>${escapeHtml(entry.cleanup)}</p></section>
          </div>
          <div class="windows-api-sources">
            ${entry.sources.map((source, index) => `<a href="${escapeHtml(source)}" target="_blank" rel="noreferrer">Microsoft Learn${entry.sources.length > 1 ? ` ${index + 1}` : ""}<span aria-hidden="true">↗</span></a>`).join("")}
          </div>
        </div>
      </details>`;
  }

  function renderEntries(entries, openFirst = false) {
    const groups = new Map();
    for (const entry of entries) {
      if (!groups.has(entry.category)) groups.set(entry.category, []);
      groups.get(entry.category).push(entry);
    }
    if (!entries.length) return '<div class="windows-api-empty"><h2>No matching Windows API</h2><p>Try an API name, native type, parameter, DLL, task, or result such as <code>SIZE_T</code>, <code>output pointer</code>, or <code>WAIT_TIMEOUT</code>.</p></div>';
    return [...groups.entries()].map(([category, categoryEntries]) => `
      <section class="windows-api-category">
        <div class="windows-api-category-head"><h2>${escapeHtml(category)}</h2><span>${categoryEntries.length} ${categoryEntries.length === 1 ? "API" : "APIs"}</span></div>
        <div class="windows-api-list">${categoryEntries.map((entry, index) => renderEntry(entry, openFirst && index === 0)).join("")}</div>
      </section>`).join("");
  }

  function render(guide, query = "") {
    const matches = filterEntries(guide.entries, query);
    return `
      <div class="content-wrap windows-api-wrap">
        <section class="reference-hero windows-api-hero">
          <div>
            <span class="eyebrow">Native contract, clear Python</span>
            <h1>Windows API guide</h1>
            <p>Start with the Windows operation, use pywin32 when it represents the task clearly, and use the supplied ctypes translation when the wrapper is missing or the native ABI is the lesson.</p>
          </div>
          <div class="windows-guide-principle"><strong>Do not translate by resemblance</strong><p>Follow the documented type width, pointer level, direction, result, error rule, and cleanup obligation.</p></div>
        </section>
        <aside class="windows-api-safety"><strong>Controlled Windows lab only</strong><p>Cross-process memory, remote-thread, hook, token, and service examples are for systems and purpose-built targets you own or are explicitly authorised to test. Request minimum rights, match process architectures, preserve cleanup paths, and do not assume an address resolved in one process is valid in another.</p></aside>
        ${query ? "" : renderWorkflow(guide.workflow)}
        ${query ? "" : renderTypeMappings(guide.typeMappings)}
        <section class="windows-guide-section windows-api-catalogue" aria-labelledby="windows-api-catalogue-title">
          <div class="section-heading-row">
            <div><span class="eyebrow">Assignment reference</span><h2 id="windows-api-catalogue-title">Translated API catalogue</h2></div>
            <p id="windows-api-count">${matches.length} of ${guide.entries.length} APIs shown</p>
          </div>
          <label class="reference-filter windows-api-filter">
            <span class="sr-only">Filter the Windows API guide</span>
            <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg>
            <input id="windows-api-filter" type="search" value="${escapeHtml(query)}" placeholder="Try VirtualAllocEx, SIZE_T, output pointer, or Kernel32" autocomplete="off" />
          </label>
          <div id="windows-api-results">${renderEntries(matches, Boolean(query) && matches.length === 1)}</div>
        </section>
      </div>`;
  }

  window.ILOVEOS_WINDOWS_API_VIEW = { filterEntries, render, renderEntries };
})();
