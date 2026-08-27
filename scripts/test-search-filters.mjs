import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { delay, evaluate, navigate, repositoryRoot, setViewport, waitFor, withBrowser } from "./browser-test-helpers.mjs";

const mimeTypes = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".py": "text/x-python" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidate = path.resolve(repositoryRoot, relative);
  if (!candidate.startsWith(`${repositoryRoot}${path.sep}`) || !fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": mimeTypes[path.extname(candidate)] || "application/octet-stream" });
  fs.createReadStream(candidate).pipe(response);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}/`;
const checks = {};

try {
  await withBrowser(async (client) => {
    await setViewport(client, 390, 844, true);
    await navigate(client, `${baseUrl}#/`);

    await evaluate(client, `document.querySelector('#search-trigger').click()`);
    await delay(40);
    Object.assign(checks, await evaluate(client, `(() => {
      const filters = [...document.querySelectorAll('[data-search-filter]')];
      const fieldset = document.querySelector('#search-filters fieldset');
      const legend = fieldset?.querySelector('legend');
      const dialog = document.querySelector('#search-dialog');
      return {
        fiveNamedFilters: filters.length === 5 && filters.map((item) => item.nextElementSibling.textContent.trim()).join('|') === 'Lessons|Assessments|pywin32|Windows API|Tools',
        filtersGrouped: fieldset?.tagName === 'FIELDSET' && legend?.textContent.trim() === 'Include in results',
        defaultsEnabled: filters.every((item) => item.checked),
        filterTargetsAtLeast40: filters.every((item) => item.nextElementSibling.getBoundingClientRect().height >= 40),
        dialogFitsMobile: dialog.getBoundingClientRect().left >= 0 && dialog.getBoundingClientRect().right <= innerWidth && dialog.scrollWidth <= dialog.clientWidth,
        filterBarFitsDialog: document.querySelector('#search-filters').scrollWidth <= document.querySelector('#search-filters').clientWidth,
      };
    })()`));

    await evaluate(client, `(() => {
      const input = document.querySelector('#search-input');
      input.value = 'CreateProcessW';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await delay(30);
    checks.windowsApiInitiallyIncluded = await evaluate(client, `[...document.querySelectorAll('#search-results .search-kind')].some((item) => item.textContent.trim() === 'Windows API')`);

    await evaluate(client, `(() => {
      const filter = document.querySelector('[data-search-filter="windows-api"]');
      filter.checked = false;
      filter.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await delay(30);
    Object.assign(checks, await evaluate(client, `(() => {
      const kinds = [...document.querySelectorAll('#search-results .search-kind')].map((item) => item.textContent.trim());
      const stored = JSON.parse(localStorage.getItem('iloveos-search-filters'));
      return {
        windowsApiCanBeExcluded: !kinds.includes('Windows API'),
        exclusionStored: stored.version === 1 && !stored.scopes.includes('windows-api') && stored.scopes.length === 4,
      };
    })()`));

    await evaluate(client, `(() => {
      const filters = [...document.querySelectorAll('[data-search-filter]')];
      filters.forEach((item) => { item.checked = item.dataset.searchFilter === 'pywin32'; });
      filters[0].dispatchEvent(new Event('change', { bubbles: true }));
      const input = document.querySelector('#search-input');
      input.value = 'win32event';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await delay(30);
    Object.assign(checks, await evaluate(client, `(() => {
      const results = [...document.querySelectorAll('#search-results .search-result')];
      return {
        pywin32OnlyResults: results.length > 0 && results.every((item) => item.querySelector('.search-kind').textContent.trim().startsWith('pywin32')),
        pywin32RouteRetained: results.some((item) => item.getAttribute('href').includes('/reference/pywin32')),
      };
    })()`));

    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && Boolean(document.querySelector('#main-content')?.children.length)`, "search-filter persistence reload");
    await evaluate(client, `document.querySelector('#search-trigger').click()`);
    await delay(30);
    Object.assign(checks, await evaluate(client, `(() => {
      const filters = [...document.querySelectorAll('[data-search-filter]')];
      const selected = filters.filter((item) => item.checked).map((item) => item.dataset.searchFilter);
      const input = document.querySelector('#search-input');
      input.value = 'win32event';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const kinds = [...document.querySelectorAll('#search-results .search-kind')].map((item) => item.textContent.trim());
      return {
        selectionSurvivesRefresh: selected.length === 1 && selected[0] === 'pywin32',
        restoredSelectionFiltersImmediately: kinds.length > 0 && kinds.every((kind) => kind.startsWith('pywin32')),
      };
    })()`));

    await evaluate(client, `(() => {
      const selected = document.querySelector('[data-search-filter="pywin32"]');
      selected.checked = false;
      selected.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    checks.emptySelectionExplained = await evaluate(client, `document.querySelector('#search-results .search-empty')?.textContent.trim() === 'Select at least one category to search.'`);

    await evaluate(client, `localStorage.setItem('iloveos-search-filters', JSON.stringify({ version: 999, scopes: [] }))`);
    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && Boolean(document.querySelector('#main-content')?.children.length)`, "search-filter version fallback reload");
    checks.unknownStorageVersionUsesDefaults = await evaluate(client, `[...document.querySelectorAll('[data-search-filter]')].every((item) => item.checked)`);
  }, { width: 390, height: 844, mobile: true });
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

console.log(JSON.stringify(checks));
for (const [name, passed] of Object.entries(checks)) {
  if (passed !== true) {
    console.error(`ERROR ${name}: ${JSON.stringify(passed)}`);
    process.exitCode = 1;
  }
}
