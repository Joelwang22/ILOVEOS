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

  function renderButton({ kind, title, summary }) {
    return `
      <section class="reference-overview">
        <button class="reference-overview-button" type="button" data-reference-overview="${escapeHtml(kind)}" aria-label="Open ${escapeHtml(title)}">
          <span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(summary)}</small></span>
          <span class="feature-open" aria-hidden="true">+</span>
        </button>
      </section>`;
  }

  function renderHeader(label, title, summary) {
    return `
      <header class="api-dialog-head">
        <div><span>${escapeHtml(label)}</span><h2 id="api-detail-title">${escapeHtml(title)}</h2><p>${escapeHtml(summary)}</p></div>
        <button class="api-dialog-close" type="button" aria-label="Close reference guide">×</button>
      </header>`;
  }

  function renderTypeList(mappings) {
    return `
      <div class="windows-type-list">
        ${mappings.map((mapping) => `
          <div>
            <span><code>${escapeHtml(mapping.native)}</code><i aria-hidden="true">→</i><code>${escapeHtml(mapping.python)}</code></span>
            <p>${escapeHtml(mapping.meaning)}</p>
          </div>`).join("")}
      </div>`;
  }

  function renderWindowsTypesDialog(mappings) {
    const midpoint = Math.ceil(mappings.length / 2);
    const groups = [
      ["Scalar, handle, and address types", mappings.slice(0, midpoint)],
      ["Strings, pointers, structures, and callbacks", mappings.slice(midpoint)],
    ];
    return `
      ${renderHeader("Windows API guide", "Native Windows type translations", "Native Windows types and their Python declarations in one reference.")}
      <div class="api-dialog-body reference-overview-dialog-body">
        ${groups.map(([title, items]) => `
          <section class="signature-block reference-overview-section">
            <h3>${escapeHtml(title)}</h3>
            ${renderTypeList(items)}
          </section>`).join("")}
      </div>`;
  }

  function renderPywin32PatternsDialog(patterns) {
    return `
      ${renderHeader("pywin32 guide", "pywin32 essentials", "The recurring setup, ownership, error, access, wrapper, and constant patterns in one reference.")}
      <div class="api-dialog-body reference-overview-dialog-body">
        ${patterns.map((pattern) => `
          <section class="signature-block reference-overview-section">
            <h3>${escapeHtml(pattern.title)}</h3>
            <p class="reference-overview-summary">${escapeHtml(pattern.summary)}</p>
            <pre><code>${escapeHtml(pattern.code)}</code></pre>
          </section>`).join("")}
      </div>`;
  }

  function renderDialog(kind, { mappings = [], patterns = [] } = {}) {
    if (kind === "windows-types") return renderWindowsTypesDialog(mappings);
    if (kind === "pywin32-essentials") return renderPywin32PatternsDialog(patterns);
    return `${renderHeader("Reference guide", "Reference unavailable", "This reference overview could not be found.")}<div class="api-dialog-body"><p class="search-empty">This reference overview is unavailable.</p></div>`;
  }

  window.ILOVEOS_REFERENCE_OVERVIEW_VIEW = { renderButton, renderDialog, renderPywin32PatternsDialog, renderWindowsTypesDialog };
})();
