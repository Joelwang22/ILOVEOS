import { delay, evaluate, filePage, navigate, pressKey, reportChecks, withBrowser } from "./browser-test-helpers.mjs";

const checks = await withBrowser(async (client) => {
  await navigate(client, filePage("#/reference/windows-api"));

  async function openAndInspect(triggerSelector, dialogSelector, expectedInitialSelector) {
    await evaluate(client, `(() => {
      const trigger = document.querySelector(${JSON.stringify(triggerSelector)});
      trigger.closest('details')?.setAttribute('open', '');
      trigger.focus();
      trigger.click();
    })()`);
    await evaluate(client, `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
    return evaluate(client, `(() => {
      const dialog = document.querySelector(${JSON.stringify(dialogSelector)});
      const labelledBy = dialog.getAttribute('aria-labelledby');
      const label = dialog.getAttribute('aria-label') || (labelledBy ? document.getElementById(labelledBy)?.textContent.trim() : '');
      const focusables = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((item) => !item.disabled && item.getClientRects().length);
      return {
        open: dialog.open === true || !dialog.hidden,
        name: label,
        initialInside: dialog.contains(document.activeElement),
        expectedInitial: document.activeElement.matches(${JSON.stringify(expectedInitialSelector)}),
        active: document.activeElement.outerHTML?.slice(0, 180) || document.activeElement.tagName,
        focusableCount: focusables.length,
        scrollable: dialog.scrollHeight > dialog.clientHeight,
        triggerSelector: ${JSON.stringify(triggerSelector)},
      };
    })()`);
  }

  const windowsApi = await openAndInspect(".api-detail-trigger", "#api-detail-dialog", ".api-dialog-close");
  await pressKey(client, "Tab");
  const windowsTabContained = await evaluate(client, `document.querySelector('#api-detail-dialog').contains(document.activeElement)`);
  await evaluate(client, `(() => { const d = document.querySelector('#api-detail-dialog'); d.scrollTop = d.scrollHeight; })()`);
  const windowsScrollReachable = await evaluate(client, `(() => { const d = document.querySelector('#api-detail-dialog'); return d.scrollTop > 0 && d.scrollTop + d.clientHeight >= d.scrollHeight - 2; })()`);
  await pressKey(client, "Escape");
  const windowsReturnsFocus = await evaluate(client, `!document.querySelector('#api-detail-dialog').open && document.activeElement.matches('.api-detail-trigger')`);
  const windowsActive = await evaluate(client, `document.activeElement.outerHTML?.slice(0, 180) || document.activeElement.tagName`);

  await evaluate(client, `location.hash = '#/reference/windows-api?q=CreateNamedPipeW'`);
  await delay(100);
  await evaluate(client, `(() => {
    const section = [...document.querySelectorAll('.parameter-list > div')].find((row) => row.firstElementChild?.textContent.trim() === 'dwOpenMode')?.querySelector('.api-parameter-choices');
    section?.querySelector('[data-choice-name="PIPE_ACCESS_DUPLEX"]')?.click();
    const generate = section?.querySelector('[data-generate-api-choices]');
    generate?.focus();
    generate?.click();
  })()`);
  await delay(60);
  const generated = await evaluate(client, `(() => {
    const dialog = document.querySelector('#api-generated-dialog');
    const label = document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent.trim();
    return {
      named: label === 'Generated code',
      openAboveApi: dialog.open && dialog.matches(':modal') && document.querySelector('#api-detail-dialog').open,
      initialCloseFocus: document.activeElement.matches('[data-close-generated-code]'),
    };
  })()`);
  await pressKey(client, "Tab");
  const generatedTabContained = await evaluate(client, `document.querySelector('#api-generated-dialog').contains(document.activeElement)`);
  await pressKey(client, "Escape");
  await delay(40);
  const generatedEscapeReturnsToApi = await evaluate(client, `!document.querySelector('#api-generated-dialog').open && document.querySelector('#api-detail-dialog').open && document.activeElement.matches('[data-generate-api-choices]')`);
  await pressKey(client, "Escape");

  await evaluate(client, `location.hash = '#/reference/pywin32'`);
  await delay(100);
  const pywin32 = await openAndInspect("[data-reference-overview]", "#api-detail-dialog", ".api-dialog-close");
  await pressKey(client, "Tab");
  const pywin32TabContained = await evaluate(client, `document.querySelector('#api-detail-dialog').contains(document.activeElement)`);
  await evaluate(client, `(() => { const d = document.querySelector('#api-detail-dialog'); d.scrollTop = d.scrollHeight; })()`);
  const pywin32ScrollReachable = await evaluate(client, `(() => { const d = document.querySelector('#api-detail-dialog'); return d.scrollTop > 0 && d.scrollTop + d.clientHeight >= d.scrollHeight - 2; })()`);
  await evaluate(client, `document.querySelector('#api-detail-dialog').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
  await delay(40);
  const pywin32BackdropReturnsFocus = await evaluate(client, `!document.querySelector('#api-detail-dialog').open && document.activeElement.matches('[data-reference-overview]')`);

  const search = await openAndInspect("#search-trigger", "#search-dialog", "#search-input");
  await pressKey(client, "Tab");
  const searchTabContained = await evaluate(client, `document.querySelector('#search-dialog').contains(document.activeElement)`);
  await pressKey(client, "Escape");
  const searchReturnsFocus = await evaluate(client, `!document.querySelector('#search-dialog').open && document.activeElement.id === 'search-trigger'`);

  const settings = await openAndInspect("#settings-trigger", "#settings-panel", "#settings-close");
  await pressKey(client, "Escape");
  const settingsReturnsFocus = await evaluate(client, `document.querySelector('#settings-panel').hidden && document.activeElement.id === 'settings-trigger'`);

  return {
    windowsApiNamed: Boolean(windowsApi.name),
    windowsApiInitialFocus: windowsApi.initialInside && windowsApi.expectedInitial || windowsApi,
    windowsApiTabContained: windowsTabContained,
    windowsApiScrollReachable: windowsScrollReachable,
    windowsApiEscapeReturnsFocus: windowsReturnsFocus || { active: windowsActive },
    generatedCodeNamed: generated.named,
    generatedCodeLayered: generated.openAboveApi,
    generatedCodeInitialFocus: generated.initialCloseFocus,
    generatedCodeTabContained: generatedTabContained,
    generatedCodeEscapeReturnsToApi: generatedEscapeReturnsToApi,
    pywin32OverviewNamed: Boolean(pywin32.name),
    pywin32OverviewInitialFocus: pywin32.initialInside && pywin32.expectedInitial,
    pywin32OverviewTabContained: pywin32TabContained,
    pywin32OverviewScrollReachable: pywin32ScrollReachable,
    pywin32BackdropReturnsFocus,
    searchNamed: Boolean(search.name),
    searchInitialFocus: search.initialInside && search.expectedInitial,
    searchTabContained,
    searchEscapeReturnsFocus: searchReturnsFocus,
    settingsNamed: Boolean(settings.name),
    settingsInitialFocus: settings.initialInside && settings.expectedInitial,
    settingsEscapeReturnsFocus: settingsReturnsFocus,
  };
});

reportChecks(checks);
