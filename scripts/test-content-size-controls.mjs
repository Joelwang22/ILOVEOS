import { delay, evaluate, filePage, navigate, reportChecks, withBrowser } from "./browser-test-helpers.mjs";

const checks = await withBrowser(async (client) => {
  await navigate(client, filePage("#/lesson/cpu-architecture-data"));
  const snapshot = async (selector) => evaluate(client, `(() => ({
      size: document.documentElement.dataset.contentSize,
      pressed: [...document.querySelectorAll('[data-content-size][aria-pressed="true"]')].map((item) => item.dataset.contentSize),
      font: parseFloat(getComputedStyle(document.querySelector(${JSON.stringify(selector)})).fontSize),
    }))()`);
  const clickSize = async (size) => {
    await evaluate(client, `(async () => {
      document.querySelector('[data-content-size="${size}"]').click();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    })()`);
  };
  const selector = ".lesson-copy .lesson-lead";
  const initial = await snapshot(selector);
  await clickSize("small");
  const small = await snapshot(selector);
  await clickSize("default");
  const normal = await snapshot(selector);
  await clickSize("large");
  const large = await snapshot(selector);
  const controls = { initial, small, normal, large, stored: await evaluate(client, `localStorage.getItem('iloveos-content-size')`) };

  await client.send("Page.reload", { ignoreCache: true });
  await delay(150);
  const persisted = await evaluate(client, `({
    size: document.documentElement.dataset.contentSize,
    pressed: [...document.querySelectorAll('[data-content-size][aria-pressed="true"]')].map((item) => item.dataset.contentSize)
  })`);
  await evaluate(client, `localStorage.setItem('iloveos-content-size', 'enormous')`);
  await client.send("Page.reload", { ignoreCache: true });
  await delay(150);
  const invalidFallback = await evaluate(client, `({
    size: document.documentElement.dataset.contentSize,
    pressed: [...document.querySelectorAll('[data-content-size][aria-pressed="true"]')].map((item) => item.dataset.contentSize)
  })`);

  const routeSamples = [
    ["#/lesson/cpu-architecture-data", ".lesson-copy .lesson-lead"],
    ["#/reference/pywin32", ".api-purpose p"],
    ["#/toolbox", ".tool-intro p"],
    ["#/assessment/final", ".assessment-activity legend"],
    ["#/lesson/cpu-architecture-data", ".visual-head h3"],
  ];
  const routeScaling = [];
  for (const [hash, selector] of routeSamples) {
    await evaluate(client, `location.hash = ${JSON.stringify(hash)}`);
    await delay(80);
    await evaluate(client, `document.querySelector('#main-content details')?.setAttribute('open', '')`);
    const missing = await evaluate(client, `!document.querySelector(${JSON.stringify(selector)})`);
    if (missing) {
      routeScaling.push({ route: hash, selector, missing: true });
      continue;
    }
    const sizes = {};
    for (const value of ["small", "default", "large"]) {
      await evaluate(client, `(async () => {
        document.documentElement.dataset.contentSize = ${JSON.stringify(value)};
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      })()`);
      await delay(100);
      sizes[value === "default" ? "normal" : value] = await evaluate(client, `parseFloat(getComputedStyle(document.querySelector(${JSON.stringify(selector)})).fontSize)`);
    }
    routeScaling.push({ route: hash, selector, ...sizes });
  }

  return {
    exactlyOnePressedInitially: controls.initial.pressed.length === 1 && controls.initial.pressed[0] === "default",
    smallControlChangesText: controls.small.pressed.length === 1 && controls.small.pressed[0] === "small" && controls.small.font < controls.normal.font || { controls },
    defaultControlRestoresText: controls.normal.pressed.length === 1 && controls.normal.pressed[0] === "default",
    largeControlChangesText: controls.large.pressed.length === 1 && controls.large.pressed[0] === "large" && controls.large.font > controls.normal.font || { controls },
    largeValueStored: controls.stored === "large",
    persistenceAfterReload: persisted.size === "large" && persisted.pressed.length === 1 && persisted.pressed[0] === "large",
    invalidValueFallsBack: invalidFallback.size === "default" && invalidFallback.pressed.length === 1 && invalidFallback.pressed[0] === "default",
    lessonReferenceToolAssessmentDiagramScale: routeScaling.every((sample) => !sample.missing && sample.small < sample.normal && sample.large > sample.normal) || routeScaling,
  };
});

reportChecks(checks);
