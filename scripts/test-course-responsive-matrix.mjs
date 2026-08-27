import { delay, evaluate, filePage, navigate, setViewport, withBrowser } from "./browser-test-helpers.mjs";

const failures = [];
let checked = 0;

await withBrowser(async (client) => {
  await navigate(client, filePage("#/"));
  const routeData = await evaluate(client, `({
    lessons: window.ILOVEOS_LESSONS.map((item) => item.id),
    modules: window.ILOVEOS_DATA.modules.map((item) => item.id)
  })`);
  const routes = [
    "#/",
    "#/lessons",
    ...routeData.modules.map((id) => `#/module/${id}`),
    ...routeData.modules.map((id) => `#/review/${id}`),
    "#/reference/pywin32",
    "#/reference/windows-api",
    "#/toolbox",
    "#/assessment/final",
    ...routeData.lessons.map((id) => `#/lesson/${id}`),
  ];

  for (const width of [1440, 900, 500, 390]) {
    await setViewport(client, width, 1000, width <= 500);
    for (const size of ["default", "large"]) {
      await evaluate(client, `document.documentElement.dataset.contentSize = ${JSON.stringify(size)}`);
      for (const route of routes) {
        await evaluate(client, `location.hash = ${JSON.stringify(route)}`);
        await delay(18);
        const result = await evaluate(client, `(() => {
          const visible = (element) => {
            const style = getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length;
          };
          const controls = [...document.querySelectorAll('#main-content button, #main-content input, #main-content textarea, #main-content .button, #main-content .download-button')].filter(visible);
          const clipped = controls.filter((element) => {
            const rect = element.getBoundingClientRect();
            const horizontalScroller = element.closest('.assessment-case-rail nav');
            const outsideViewport = rect.left < -1 || rect.right > innerWidth + 1;
            return (!horizontalScroller && outsideViewport) || element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
          }).map((element) => element.className || element.tagName).slice(0, 4);
          const reversed = [...document.querySelectorAll('#main-content *')].filter(visible).filter((element) => {
            const style = getComputedStyle(element);
            return style.order !== '0' || style.flexDirection.endsWith('reverse');
          }).map((element) => element.className || element.tagName).slice(0, 4);
          return {
            documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            mainOverflow: document.querySelector('#main-content').scrollWidth - document.querySelector('#main-content').clientWidth,
            clipped,
            reversed,
            heading: document.querySelector('#main-content h1')?.textContent.trim() || '',
          };
        })()`);
        checked += 1;
        if (result.documentOverflow > 1 || result.mainOverflow > 1 || result.clipped.length || result.reversed.length || !result.heading) {
          failures.push({ route, width, size, ...result });
        }
      }
    }
  }
});

console.log(JSON.stringify({ checked, failures: failures.slice(0, 20) }));
if (failures.length) {
  console.error(`ERROR ${failures.length} responsive route/viewport combinations failed`);
  process.exitCode = 1;
}
