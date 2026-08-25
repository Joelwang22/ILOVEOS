import { delay, evaluate, filePage, navigate, setViewport, withBrowser } from "./browser-test-helpers.mjs";

const failures = [];
let diagrams = 0;

await withBrowser(async (client) => {
  await setViewport(client, 390, 1000, true);
  await navigate(client, filePage("#/"));
  const lessonIds = await evaluate(client, `window.ILOVEOS_LESSONS.map((item) => item.id)`);
  await evaluate(client, `document.documentElement.dataset.contentSize = 'large'`);
  for (const lessonId of lessonIds) {
    await evaluate(client, `location.hash = ${JSON.stringify(`#/lesson/${lessonId}`)}`);
    await delay(20);
    const result = await evaluate(client, `[...document.querySelectorAll('.lesson-visual')].map((figure) => {
      const nodes = [...figure.querySelectorAll('.visual-node strong')].map((item) => item.textContent.trim()).filter(Boolean);
      const rect = figure.getBoundingClientRect();
      return {
        name: figure.getAttribute('aria-label') || '',
        title: figure.querySelector('.visual-head h3')?.textContent.trim() || '',
        nodes,
        caption: figure.querySelector('figcaption')?.textContent.trim() || '',
        contained: rect.left >= -1 && rect.right <= innerWidth + 1 && figure.scrollWidth <= figure.clientWidth + 1,
        sequenceInDomOrder: nodes.length >= 2,
      };
    })`);
    diagrams += result.length;
    result.forEach((diagram, index) => {
      if (!diagram.name || !diagram.title || !diagram.sequenceInDomOrder || !diagram.caption || !diagram.contained) {
        failures.push({ lessonId, index, ...diagram });
      }
    });
  }
});

console.log(JSON.stringify({ lessons: 62, diagrams, failures: failures.slice(0, 20) }));
if (!diagrams || failures.length) {
  console.error(`ERROR ${failures.length || 1} diagram accessibility/layout checks failed`);
  process.exitCode = 1;
}
