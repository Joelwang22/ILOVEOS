import { delay, evaluate, filePage, navigate, reportChecks, setViewport, waitFor, withBrowser } from "./browser-test-helpers.mjs";

const layouts = [];
const fontSizes = [];

await withBrowser(async (client) => {
  await navigate(client, filePage("#/reference/windows-api?q=CreateNamedPipeW"));
  await delay(80);
  await evaluate(client, `(() => {
    const row = [...document.querySelectorAll('.parameter-list > div')].find((item) => item.firstElementChild?.textContent.trim() === 'dwOpenMode');
    const section = row?.querySelector('.api-parameter-choices');
    section?.querySelector('[data-choice-name="PIPE_ACCESS_DUPLEX"]')?.click();
    section?.querySelector('[data-choice-name="FILE_FLAG_OVERLAPPED"]')?.click();
    section?.querySelector('[data-generate-api-choices]')?.click();
  })()`);
  await delay(60);

  for (const scenario of [
    { width: 1440, height: 900, size: "small" },
    { width: 900, height: 760, size: "default" },
    { width: 500, height: 720, size: "large" },
    { width: 390, height: 700, size: "large" },
  ]) {
    await setViewport(client, scenario.width, scenario.height, scenario.width <= 500);
    await evaluate(client, `document.documentElement.dataset.contentSize = ${JSON.stringify(scenario.size)}`);
    await delay(50);
    const result = await evaluate(client, `(() => {
      const dialog = document.querySelector('#api-generated-dialog');
      const api = document.querySelector('#api-detail-dialog');
      const rect = dialog.getBoundingClientRect();
      const header = dialog.querySelector('.api-generated-head');
      const blocks = [...dialog.querySelectorAll('.api-generated-block')];
      const buttons = [...dialog.querySelectorAll('button:not([disabled])')];
      const preformatted = [...dialog.querySelectorAll('pre')];
      dialog.scrollTop = dialog.scrollHeight;
      const headerRect = header.getBoundingClientRect();
      const lastRect = blocks.at(-1).getBoundingClientRect();
      return {
        dialogOpenOnTop: dialog.open && dialog.matches(':modal') && api.open,
        dialogWithinViewport: rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1,
        noDocumentOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
        blocksContained: blocks.every((block) => {
          const item = block.getBoundingClientRect();
          return item.left >= rect.left - 1 && item.right <= rect.right + 1;
        }),
        codeScrollContained: preformatted.every((pre) => pre.scrollWidth <= pre.clientWidth + 1 || ['auto', 'scroll'].includes(getComputedStyle(pre).overflowX)),
        buttonTargetsAtLeast40: buttons.every((button) => button.getBoundingClientRect().height >= 39.5),
        stickyHeaderVisibleAfterScroll: headerRect.top >= rect.top - 1 && headerRect.bottom <= rect.bottom + 1,
        finalSectionReachable: lastRect.top >= rect.top - 1 && lastRect.bottom <= rect.bottom + 1,
        codeFontSize: parseFloat(getComputedStyle(dialog.querySelector('code')).fontSize),
      };
    })()`);
    layouts.push({ ...scenario, ...result });
  }
});

// Use a fresh desktop browsing context for the reading-size check. Switching a
// live Chromium context from mobile emulation back to desktop can briefly
// recreate its layout viewport and race a preference update under a busy gate.
await withBrowser(async (client) => {
  await navigate(client, filePage("#/reference/windows-api?q=CreateNamedPipeW"));
  await evaluate(client, `(() => {
    const row = [...document.querySelectorAll('.parameter-list > div')].find((item) => item.firstElementChild?.textContent.trim() === 'dwOpenMode');
    const section = row?.querySelector('.api-parameter-choices');
    section?.querySelector('[data-choice-name="PIPE_ACCESS_DUPLEX"]')?.click();
    section?.querySelector('[data-generate-api-choices]')?.click();
  })()`);
  await waitFor(client, `document.querySelector('#api-generated-dialog')?.open`, "generated code dialog");
  for (const [size, expected] of [["small", 10], ["default", 11], ["large", 13]]) {
    await evaluate(client, `document.querySelector('[data-content-size="${size}"]').click()`);
    await waitFor(
      client,
      `document.documentElement.dataset.contentSize === ${JSON.stringify(size)} && parseFloat(getComputedStyle(document.querySelector('#api-generated-dialog code')).fontSize) === ${expected}`,
      `${size} generated-code reading size`,
    );
    fontSizes.push(await evaluate(client, `parseFloat(getComputedStyle(document.querySelector('#api-generated-dialog code')).fontSize)`));
  }
}, { width: 900, height: 760, mobile: false });

console.log(JSON.stringify(layouts));
console.log(JSON.stringify({ fontSizes }));
reportChecks({
  allGeneratedLayoutsPass: layouts.every((layout) => Object.entries(layout).filter(([key]) => !["width", "height", "size", "codeFontSize"].includes(key)).every(([, value]) => value === true)) || layouts,
  generatedCodeFollowsReadingSize: fontSizes[0] < fontSizes[1] && fontSizes[1] < fontSizes[2],
});
