import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { delay, evaluate, navigate, repositoryRoot, setViewport, waitFor, withBrowser } from "./browser-test-helpers.mjs";

const mimeTypes = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
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
const storageKey = "iloveos-assessment-progress:final-assessment";
const checks = {};

try {
  await withBrowser(async (client) => {
    await setViewport(client, 1800, 1000, false);
    await navigate(client, `${baseUrl}#/assessment/final`);
    await evaluate(client, `localStorage.removeItem(${JSON.stringify(storageKey)})`);
    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && document.querySelectorAll('.assessment-case-link').length === 5`, "fresh integrated final assessment");

    Object.assign(checks, await evaluate(client, `(() => {
      const page = document.querySelector('.final-assessment-page');
      const caseLinks = [...document.querySelectorAll('.assessment-case-link')];
      return {
        finalUsesApproximatelyFiftyPercentMoreWidth: page.getBoundingClientRect().width >= 1280 && page.getBoundingClientRect().width <= 1300,
        fiveCaseFilesRendered: caseLinks.length === 5 && caseLinks.filter((item) => item.classList.contains('active')).length === 1,
        oneFourQuestionCaseShown: document.querySelectorAll('.assessment-case-workspace .assessment-activity').length === 4,
        evidencePacketShown: document.querySelectorAll('.assessment-artifact').length === 2 && document.querySelectorAll('.assessment-artifact pre').length === 2,
        outdatedPracticalRemoved: !document.querySelector('.assessment-practical') && !document.querySelector('[data-assessment-action="note"]'),
        initialScoreAndMasteryAreZero: document.querySelector('.assessment-progress').textContent.includes('0 of 20 mastered') && document.querySelector('.assessment-progress').textContent.includes('0 of 20 latest-attempt score'),
      };
    })()`));

    const firstQuestion = await evaluate(client, `(() => {
      const question = window.ILOVEOS_ASSESSMENTS.finalAssessment.cases[0].questions[0];
      return { id: question.id, answer: question.answer, wrong: (question.answer + 1) % question.options.length };
    })()`);
    await evaluate(client, `document.querySelector('[data-activity=${JSON.stringify(firstQuestion.id)}][data-option=${JSON.stringify(String(firstQuestion.wrong))}]').click()`);
    await waitFor(client, `JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})).state.activities[${JSON.stringify(firstQuestion.id)}].attempts === 1`, "first incorrect attempt persisted");
    await evaluate(client, `document.querySelector('[data-activity=${JSON.stringify(firstQuestion.id)}][data-option=${JSON.stringify(String(firstQuestion.answer))}]').click()`);
    await waitFor(client, `JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})).state.activities[${JSON.stringify(firstQuestion.id)}].completed === true`, "corrected answer persisted");

    Object.assign(checks, await evaluate(client, `(() => {
      const record = JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)}));
      const activity = record.state.activities[${JSON.stringify(firstQuestion.id)}];
      return {
        correctedRetryUpdatesLatestScore: activity.latestAttemptCorrect === true && activity.attempts === 2 && document.querySelector('.assessment-progress').textContent.includes('1 of 20 latest-attempt score'),
        retryStillIncreasesMastery: activity.completed === true && document.querySelector('.assessment-progress').textContent.includes('1 of 20 mastered'),
        versionedStateStored: record.version === 2 && record.contentVersion === 2,
      };
    })()`));

    await evaluate(client, `document.querySelectorAll('.assessment-case-link')[1].click()`);
    await waitFor(client, `document.querySelectorAll('.assessment-case-link')[1].classList.contains('active')`, "second case navigation");
    checks.caseNavigationStored = await evaluate(client, `JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})).state.activeCaseId === window.ILOVEOS_ASSESSMENTS.finalAssessment.cases[1].id`);

    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && document.querySelectorAll('.assessment-case-link').length === 5`, "persisted integrated assessment reload");
    Object.assign(checks, await evaluate(client, `(() => {
      const links = [...document.querySelectorAll('.assessment-case-link')];
      return {
        activeCaseSurvivesRefresh: links[1].classList.contains('active'),
        answersAndScoreSurviveRefresh: links[0].textContent.includes('1 / 4 mastered') && document.querySelector('.assessment-progress').textContent.includes('1 of 20 mastered') && document.querySelector('.assessment-progress').textContent.includes('1 of 20 latest-attempt score'),
        onlyActiveCaseQuestionsRendered: document.querySelectorAll('.assessment-activity').length === 4,
      };
    })()`));

    await evaluate(client, `(() => {
      const record = JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)}));
      record.version = 1;
      const activity = record.state.activities[${JSON.stringify(firstQuestion.id)}];
      delete activity.latestAttemptCorrect;
      activity.firstAttemptCorrect = false;
      localStorage.setItem(${JSON.stringify(storageKey)}, JSON.stringify(record));
    })()`);
    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && document.querySelectorAll('.assessment-case-link').length === 5`, "legacy assessment progress migration");
    checks.legacyProgressMigratesToLatestScore = await evaluate(client, `document.querySelector('.assessment-progress').textContent.includes('1 of 20 latest-attempt score')`);

    await setViewport(client, 390, 844, true);
    await delay(40);
    Object.assign(checks, await evaluate(client, `(() => {
      const page = document.querySelector('.final-assessment-page');
      const rail = document.querySelector('.assessment-case-rail nav');
      return {
        mobileAssessmentFitsViewport: page.getBoundingClientRect().left >= 0 && page.getBoundingClientRect().right <= innerWidth && document.documentElement.scrollWidth === innerWidth,
        mobileCaseRailScrollsWithinItself: rail.scrollWidth > rail.clientWidth && getComputedStyle(rail).overflowX === 'auto',
        mobileOptionsUseOneColumn: getComputedStyle(document.querySelector('.assessment-options')).gridTemplateColumns.split(' ').length === 1,
      };
    })()`));

    await evaluate(client, `localStorage.setItem(${JSON.stringify(storageKey)}, JSON.stringify({ version: 2, contentVersion: 999, state: { activeCaseId: 'case-threaded-counter', activities: {} } }))`);
    await client.send("Page.reload", { ignoreCache: true });
    await waitFor(client, `document.readyState === 'complete' && document.querySelectorAll('.assessment-case-link').length === 5`, "stale assessment cache reload");
    checks.staleContentVersionUsesFreshState = await evaluate(client, `document.querySelectorAll('.assessment-case-link')[0].classList.contains('active') && document.querySelector('.assessment-progress').textContent.includes('0 of 20 mastered')`);
  }, { width: 1800, height: 1000 });
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
