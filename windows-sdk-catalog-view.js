(() => {
  const catalog = window.ILOVEOS_WINDOWS_SDK_CATALOG;
  if (!catalog) return;

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
  const namespaceMap = new Map(catalog.namespaces.map((item) => [item.name, item]));
  const records = catalog.namespaces.flatMap((namespace) => namespace.functions.map((item) => ({
    ...item,
    namespace: namespace.name,
    key: `${namespace.name}::${item.n}`,
    search: [item.n, item.e, item.d, item.h, namespace.name].filter(Boolean).join(" ").toLowerCase(),
  })));
  const functionMap = new Map(records.map((item) => [item.key, item]));
  const projectSource = catalog.projectUrl;

  function displayNamespace(value) {
    return value.replace(/^Windows\.Win32\./, "").replaceAll(".", " › ");
  }

  function signatureText(item, signature) {
    const [returns, parameters] = signature;
    if (!parameters.length) return `${returns} ${item.n}(void)`;
    const rows = parameters.map(([name, type]) => `    ${type} ${name}`);
    return `${returns} ${item.n}(\n${rows.join(",\n")}\n)`;
  }

  function parameterDescription(flags = "") {
    if (flags.includes("inout")) return "Input/output parameter. Initialize any required fields and preserve valid storage for the complete call.";
    if (flags.includes("out")) return "Output parameter. Supply writable storage of the declared native type.";
    if (flags.includes("optional")) return "Optional input. Use a null value only when the native contract permits it.";
    return "Input parameter using the displayed native type and lifetime contract.";
  }

  function resultDescription(item, returns) {
    if (returns === "void") return "The function does not return a value. Check documented output parameters and side effects.";
    if (returns === "BOOL") return item.l
      ? "A zero value commonly indicates failure. Retrieve the thread's last-error code immediately, but confirm the linked function-specific contract."
      : "Interpret the Boolean result using the linked function-specific contract.";
    if (returns === "HRESULT") return "Use SUCCEEDED/FAILED semantics and preserve the full HRESULT for diagnosis.";
    if (/^(?:H[A-Z_]+|HANDLE|P[A-Z_]+|.*\*)$/.test(returns)) return "This is a handle or pointer-like result. Consult the linked contract for its failure sentinel, ownership, and matching release operation.";
    return "Interpret this native result using the function-specific documentation; zero is not universally a failure value.";
  }

  function architectureLabel(values = []) {
    const labels = { "1": "x86", "2": "x64", "4": "Arm64", "7": "x86, x64, and Arm64" };
    return values.map((value) => labels[value] || value).join(", ");
  }

  function functionRow(item) {
    const parameterCount = item.s[0]?.[1]?.length || 0;
    return `<button class="feature-row api-detail-trigger sdk-function-row" type="button" data-windows-sdk-key="${escapeHtml(item.key)}" aria-label="Open SDK contract for ${escapeHtml(item.n)}">
      <code>${escapeHtml(item.n)}</code>
      <strong>${escapeHtml(item.d)}</strong>
      <span>${escapeHtml(item.s[0]?.[0] || "unknown")} return · ${parameterCount} ${parameterCount === 1 ? "parameter" : "parameters"}${item.s.length > 1 ? ` · ${item.s.length} signatures` : ""}</span>
      <span class="feature-open" aria-hidden="true">+</span>
    </button>`;
  }

  function renderFunctionTable(items) {
    return `<div class="feature-table sdk-function-table" role="table">
      <div class="feature-row feature-head" role="row"><span>SDK function</span><span>DLL</span><span>Native contract</span><span></span></div>
      ${items.map(functionRow).join("")}
    </div>`;
  }

  function renderOverview() {
    return `<section class="sdk-catalog-section" aria-labelledby="sdk-catalog-title">
      <header class="sdk-catalog-head"><div><span>Complete Microsoft Win32 metadata inventory</span><h2 id="sdk-catalog-title">Windows API function catalogue</h2><p>Browse by metadata namespace. Functions load only when you open a namespace.</p></div>
        <div><strong>${catalog.functionCount.toLocaleString()}</strong><span>functions</span></div></header>
      <div class="sdk-namespace-list">
        ${catalog.namespaces.map((item) => `<details class="api-module sdk-namespace" data-sdk-namespace="${escapeHtml(item.name)}">
          <summary><span class="api-module-title"><code>${escapeHtml(displayNamespace(item.name))}</code></span>
            <span class="api-summary-meta"><span class="entry-count">${item.functions.length.toLocaleString()} functions</span><span class="details-chevron">⌄</span></span></summary>
          <div class="api-module-body sdk-namespace-body" data-sdk-namespace-body><p class="sdk-namespace-prompt">Open this namespace to load its functions.</p></div>
        </details>`).join("")}
      </div>
    </section>`;
  }

  function renderNamespace(namespaceName, limit = 100) {
    const namespace = namespaceMap.get(namespaceName);
    if (!namespace) return '<div class="search-empty">This SDK namespace is unavailable.</div>';
    const items = namespace.functions.slice(0, limit).map((item) => functionMap.get(`${namespaceName}::${item.n}`));
    return `${renderFunctionTable(items)}
      ${limit < namespace.functions.length ? `<button class="button sdk-load-more" type="button" data-sdk-load-more="${escapeHtml(namespaceName)}" data-sdk-next-limit="${Math.min(namespace.functions.length, limit + 100)}">Load 100 more <span>${limit.toLocaleString()} of ${namespace.functions.length.toLocaleString()}</span></button>` : `<p class="sdk-all-loaded">All ${namespace.functions.length.toLocaleString()} functions loaded.</p>`}`;
  }

  function filter(query, maximum = 200) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return { total: records.length, items: [] };
    const tokens = normalized.replace(/[^a-z0-9_.]+/g, " ").split(/\s+/).filter(Boolean);
    const matches = records
      .filter((item) => tokens.every((token) => item.search.includes(token)))
      .map((item) => ({
        item,
        score: item.n.toLowerCase() === normalized ? 1000
          : item.n.toLowerCase().startsWith(normalized) ? 600
            : item.n.toLowerCase().includes(normalized) ? 400
              : item.namespace.toLowerCase().includes(normalized) ? 150 : 50,
      }))
      .sort((left, right) => right.score - left.score || left.item.n.localeCompare(right.item.n));
    return { total: matches.length, items: matches.slice(0, maximum).map(({ item }) => item) };
  }

  function renderSearch(query) {
    const result = filter(query);
    return `<section class="sdk-catalog-section sdk-search-section" aria-labelledby="sdk-catalog-title">
      <header class="sdk-catalog-head"><div><span>Complete Microsoft Win32 metadata inventory</span><h2 id="sdk-catalog-title">SDK catalogue matches</h2><p>${result.total.toLocaleString()} ${result.total === 1 ? "function matches" : "functions match"} “${escapeHtml(query)}”.${result.total > result.items.length ? ` Showing the first ${result.items.length}; refine the search to narrow it.` : ""}</p></div>
        <div><strong>${catalog.functionCount.toLocaleString()}</strong><span>total</span></div></header>
      ${result.items.length ? renderFunctionTable(result.items) : '<div class="search-empty">No SDK function matches this query.</div>'}
    </section>`;
  }

  function renderDialog(item) {
    if (!item) return '<div class="api-dialog-body"><p class="search-empty">This SDK function is unavailable.</p></div>';
    const overloads = item.s.map((signature, index) => `<section class="signature-block sdk-contract-block">
      ${item.s.length > 1 ? `<h3>Signature ${index + 1} of ${item.s.length}</h3>` : ""}
      <pre><code>${escapeHtml(signatureText(item, signature))}</code></pre>
      <h3>Parameters</h3>
      ${signature[1].length ? `<div class="parameter-list">${signature[1].map(([name, type, flags = ""]) => `<div><code>${escapeHtml(name)}</code><span class="parameter-type">${escapeHtml(type)}</span><div class="parameter-description">${flags.includes("optional") ? "Optional. " : "Required. "}${escapeHtml(parameterDescription(flags))}</div></div>`).join("")}</div>` : '<p class="no-parameters">This function takes no parameters.</p>'}
      <h3>Output</h3><div class="return-card"><code>${escapeHtml(signature[0])}</code><span>${escapeHtml(resultDescription(item, signature[0]))}</span></div>
    </section>`).join("");
    const metadataRows = [
      ["Entry point", item.e || item.n],
      ["DLL", item.d],
      item.h ? ["Header", item.h] : null,
      item.o ? ["Minimum platform metadata", item.o] : null,
      item.a?.length ? ["Architectures", architectureLabel(item.a)] : null,
      ["Last-error metadata", item.l ? "The metadata marks this function as setting last error." : "The metadata does not mark this function as setting last error."],
    ].filter(Boolean);
    return `<header class="api-dialog-head">
      <div><span>Microsoft Win32 metadata · ${escapeHtml(item.d)}</span><h2 id="api-detail-title">${escapeHtml(item.n)}</h2><p>${escapeHtml(displayNamespace(item.namespace))}</p></div>
      <button class="api-dialog-close" type="button" aria-label="Close API details">×</button>
    </header>
    <div class="api-dialog-body windows-api-dialog-body sdk-dialog-body">
      <section class="api-dialog-summary"><p>This is an exhaustive SDK catalogue entry generated from Microsoft’s Win32 metadata. Use the curated guide when available for a checked ctypes translation, examples, failure semantics, and cleanup guidance.</p></section>
      ${item.x ? `<aside class="caution-box"><strong>Obsolete metadata</strong><p>${escapeHtml(item.x)}</p></aside>` : ""}
      ${overloads}
      <section class="signature-block sdk-metadata-block"><h3>SDK metadata</h3><div class="sdk-metadata-list">${metadataRows.map(([label, value]) => `<div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`).join("")}</div></section>
      <div class="api-source-links"><a href="${escapeHtml(item.u || projectSource)}" target="_blank" rel="noreferrer">${item.u ? "Microsoft Learn documentation" : "Microsoft Win32 metadata source"} ↗</a></div>
    </div>`;
  }

  function searchItems() {
    return records.map((item) => ({
      title: item.n,
      detail: `${item.namespace} · ${item.d} · SDK metadata function`,
      searchText: item.search,
      kind: "Windows SDK API",
      scope: "windows-api",
      href: `#/reference/windows-api?q=${encodeURIComponent(item.n)}&sdk=${encodeURIComponent(item.key)}`,
    }));
  }

  window.ILOVEOS_WINDOWS_SDK_VIEW = {
    catalog,
    filter,
    get: (key) => functionMap.get(key),
    renderDialog,
    renderNamespace,
    renderOverview,
    renderSearch,
    searchItems,
  };
})();
