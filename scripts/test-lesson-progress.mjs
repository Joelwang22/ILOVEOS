import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { delay, evaluate, navigate, repositoryRoot, waitFor, withBrowser } from "./browser-test-helpers.mjs";

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
    await navigate(client, `${baseUrl}#/lessons`);
    await evaluate(client, `localStorage.removeItem('iloveos-lesson-progress')`);
    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && document.querySelectorAll('.lesson-index-row').length === 62`, "empty lesson progress reload");

    Object.assign(checks, await evaluate(client, `(() => {
      const rows = [...document.querySelectorAll('.lesson-index-row')];
      const current = document.querySelector('[data-route="lesson"]');
      return {
        allLessonsStartIncomplete: rows.length === 62 && rows.every((row) => !row.classList.contains('is-completed')),
        incompleteRowsHaveNoGreenLine: rows.every((row) => getComputedStyle(row).boxShadow === 'none'),
        initialCurrentLessonUsesFirstLesson: current.getAttribute('href') === '#/lesson/cpu-architecture-data',
      };
    })()`));

    const target = await evaluate(client, `(() => {
      const row = document.querySelectorAll('.lesson-index-row')[3];
      return { href: row.getAttribute('href'), id: row.getAttribute('href').split('/').pop(), title: row.querySelector('strong').textContent.trim() };
    })()`);
    await evaluate(client, `location.hash = ${JSON.stringify(target.href)}`);
    await waitFor(client, `document.querySelector('.lesson-copy h1')?.textContent.trim() === ${JSON.stringify(target.title)}`, "target lesson route");

    Object.assign(checks, await evaluate(client, `(() => {
      const stored = JSON.parse(localStorage.getItem('iloveos-lesson-progress'));
      const current = document.querySelector('[data-route="lesson"]');
      return {
        openingLessonUpdatesCurrent: stored.version === 1 && stored.currentLessonId === ${JSON.stringify(target.id)},
        currentLessonLinkUpdatesImmediately: current.getAttribute('href') === ${JSON.stringify(target.href)} && current.getAttribute('aria-label').includes(${JSON.stringify(target.title)}),
        openingAloneDoesNotComplete: stored.completedLessonIds.length === 0,
        manualCompletionControlRemoved: !document.querySelector('[data-lesson-complete]') && Boolean(document.querySelector('[data-complete-current-lesson]')),
      };
    })()`));

    const next = await evaluate(client, `(() => {
      const link = document.querySelector('[data-complete-current-lesson]');
      return { href: link.getAttribute('href'), id: link.getAttribute('href').split('/').pop() };
    })()`);
    await evaluate(client, `document.querySelector('[data-complete-current-lesson]').click()`);
    await waitFor(client, `location.hash === ${JSON.stringify(next.href)}`, "advance to next lesson");
    Object.assign(checks, await evaluate(client, `(() => {
      const stored = JSON.parse(localStorage.getItem('iloveos-lesson-progress'));
      return {
        nextLinkCompletesCurrentLesson: stored.completedLessonIds.length === 1 && stored.completedLessonIds[0] === ${JSON.stringify(target.id)},
        advancingUpdatesCurrentLesson: stored.currentLessonId === ${JSON.stringify(next.id)},
      };
    })()`));

    await evaluate(client, `location.hash = '#/lessons'`);
    await waitFor(client, `document.querySelectorAll('.lesson-index-row').length === 62`, "completed lesson index");
    Object.assign(checks, await evaluate(client, `(() => {
      const completed = [...document.querySelectorAll('.lesson-index-row.is-completed')];
      return {
        onlyCompletedLessonHasGreenLine: completed.length === 1 && completed[0].getAttribute('href') === ${JSON.stringify(target.href)} && getComputedStyle(completed[0]).boxShadow !== 'none',
        completedStatusIsExplicit: completed[0]?.querySelector('.lesson-availability')?.textContent.trim() === 'Completed',
        incompleteStatusStaysNeutral: [...document.querySelectorAll('.lesson-index-row:not(.is-completed) .lesson-availability')].every((item) => item.textContent.trim() === 'Read lesson'),
      };
    })()`));

    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && document.querySelectorAll('.lesson-index-row').length === 62`, "persisted lesson index reload");
    Object.assign(checks, await evaluate(client, `(() => {
      const current = document.querySelector('[data-route="lesson"]');
      const completed = document.querySelector('.lesson-index-row.is-completed');
      return {
        completionSurvivesRefresh: completed?.getAttribute('href') === ${JSON.stringify(target.href)},
        currentLessonSurvivesRefresh: current.getAttribute('href') === ${JSON.stringify(next.href)},
      };
    })()`));

    const scrollTarget = await evaluate(client, `(() => {
      const row = document.querySelectorAll('.lesson-index-row')[8];
      return { href: row.getAttribute('href'), id: row.getAttribute('href').split('/').pop(), title: row.querySelector('strong').textContent.trim() };
    })()`);
    await evaluate(client, `location.hash = ${JSON.stringify(scrollTarget.href)}`);
    await waitFor(client, `document.querySelector('.lesson-copy h1')?.textContent.trim() === ${JSON.stringify(scrollTarget.title)}`, "scroll completion lesson route");
    checks.lessonStillIncompleteBeforeBottom = await evaluate(client, `!JSON.parse(localStorage.getItem('iloveos-lesson-progress')).completedLessonIds.includes(${JSON.stringify(scrollTarget.id)})`);
    await evaluate(client, `window.scrollTo(0, document.documentElement.scrollHeight); window.dispatchEvent(new Event('scroll'))`);
    await delay(40);
    checks.bottomScrollCompletesLesson = await evaluate(client, `JSON.parse(localStorage.getItem('iloveos-lesson-progress')).completedLessonIds.includes(${JSON.stringify(scrollTarget.id)})`);

    await evaluate(client, `location.hash = '#/lessons'`);
    await waitFor(client, `document.querySelectorAll('.lesson-index-row').length === 62`, "scroll-completed lesson index");
    checks.bothCompletionPathsHighlightExactly = await evaluate(client, `(() => {
      const completed = [...document.querySelectorAll('.lesson-index-row.is-completed')].map((row) => row.getAttribute('href'));
      return completed.length === 2 && completed.includes(${JSON.stringify(target.href)}) && completed.includes(${JSON.stringify(scrollTarget.href)});
    })()`);

    await evaluate(client, `localStorage.setItem('iloveos-lesson-progress', JSON.stringify({ version: 999, currentLessonId: ${JSON.stringify(target.id)}, completedLessonIds: [${JSON.stringify(target.id)}] }))`);
    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && document.querySelectorAll('.lesson-index-row').length === 62`, "unknown lesson progress version reload");
    Object.assign(checks, await evaluate(client, `(() => ({
      unknownVersionUsesDefaults: document.querySelectorAll('.lesson-index-row.is-completed').length === 0 && document.querySelector('[data-route="lesson"]').getAttribute('href') === '#/lesson/cpu-architecture-data',
    }))()`));
    await delay(20);
  }, { width: 1000, height: 800 });
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
