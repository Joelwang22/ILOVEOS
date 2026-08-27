(function () {
  "use strict";

  const data = window.ILOVEOS_DATA;
  const lessons = window.ILOVEOS_LESSONS || [];
  const lessonDepth = window.ILOVEOS_LESSON_DEPTH || {};
  lessons.forEach((lesson) => Object.assign(lesson, lessonDepth[lesson.id] || {}));
  const referenceData = window.ILOVEOS_REFERENCE;
  const apiSignatures = window.ILOVEOS_API_SIGNATURES || {};
  const windowsApiGuide = window.ILOVEOS_WINDOWS_API_GUIDE;
  const windowsApiView = window.ILOVEOS_WINDOWS_API_VIEW;
  const referenceOverviewView = window.ILOVEOS_REFERENCE_OVERVIEW_VIEW;
  const assessments = window.ILOVEOS_ASSESSMENTS || { moduleReviews: [], finalAssessment: null };
  const assessmentView = window.ILOVEOS_ASSESSMENT_VIEW;
  const main = document.querySelector("#main-content");
  const sidebar = document.querySelector("#sidebar");
  const scrim = document.querySelector("#sidebar-scrim");
  const menuButton = document.querySelector("#menu-button");
  const sidebarToggle = document.querySelector("#sidebar-toggle");
  const searchDialog = document.querySelector("#search-dialog");
  const searchInput = document.querySelector("#search-input");
  const searchFilters = document.querySelector("#search-filters");
  const searchFilterInputs = [...document.querySelectorAll("[data-search-filter]")];
  const searchResults = document.querySelector("#search-results");
  const mobileDrawerBackground = [document.querySelector(".skip-link"), main, document.querySelector("#search-trigger"), document.querySelector(".settings-control")];
  const apiDialog = document.querySelector("#api-detail-dialog");
  const apiDetailContent = document.querySelector("#api-detail-content");
  let openWindowsApiFamilyId = "";
  const settingsTrigger = document.querySelector("#settings-trigger");
  const settingsPanel = document.querySelector("#settings-panel");
  const settingsClose = document.querySelector("#settings-close");
  const sizeOptions = [...document.querySelectorAll("[data-content-size]")];
  let apiDialogInvoker = null;
  const searchFilterStorageKey = "iloveos-search-filters";
  const searchFilterVersion = 1;
  const defaultSearchScopes = searchFilterInputs.map((input) => input.dataset.searchFilter);

  const icons = {
    arrow: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
    terminal: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 7 4 4-4 4m7 0h7"/></svg>'
  };

  function accentStyle(name, property = "--card-accent") {
    return `style="${property}: var(--${name})"`;
  }

  function moduleLessons(moduleId) {
    return lessons.filter((lesson) => lesson.module === moduleId);
  }

  function findLesson(id) {
    return lessons.find((lesson) => lesson.id === id || (lesson.aliases || []).includes(id)) || lessons[0];
  }

  function firstLessonId(moduleId) {
    return moduleLessons(moduleId)[0]?.id || lessons[0]?.id || "cpu-architecture-data";
  }

  function renderHome() {
    main.innerHTML = `
      <div class="content-wrap">
        <section class="hero">
          <h1>Understand what Windows is actually doing.</h1>
          <div class="hero-actions">
            <a class="button primary" href="#/lesson/${firstLessonId("foundations")}">Start the first lesson ${icons.arrow}</a>
            <a class="button" href="#/lessons">View all lessons</a>
            <a class="button" href="#/assessment/final">Open final assessment</a>
          </div>
        </section>

        <section id="course-outline">
          <div class="section-heading">
            <h2>Ten modules, in order.</h2>
            <p>Each concept prepares the ground for the next. The path moves from the machine itself to advanced process behaviour.</p>
          </div>
          <div class="module-list">
            ${data.modules.map(moduleCard).join("")}
          </div>
        </section>

        <section class="feature-split">
          <article class="feature-card">
            <h2>The Win32 API, without the documentation maze.</h2>
            <p>Learn what each module is for before confronting hundreds of function names. Examples begin with the intent, then expose the handle, flag, or structure beneath it.</p>
            <div class="code-card">
              <div class="code-head"><span>inspect_process.py</span><span class="window-dots"><i></i><i></i><i></i></span></div>
              <pre><span class="code-keyword">import</span> <span class="code-module">win32api</span>
<span class="code-keyword">import</span> <span class="code-module">win32process</span>

pid = <span class="code-function">win32api.GetCurrentProcessId</span>()
handle = <span class="code-function">win32process.GetCurrentProcess</span>()

<span class="code-function">print</span>(<span class="code-string">f"PID: {pid}  Handle: {handle}"</span>)</pre>
            </div>
            <div class="hero-actions"><a class="button" href="#/reference/pywin32">Open the pywin32 guide ${icons.arrow}</a><a class="button" href="#/reference/windows-api">Open the Windows API guide</a></div>
          </article>

          <article class="feature-card">
            <h2>Sysinternals is part of every relevant lesson.</h2>
            <p>No separate tool dump. Process Explorer appears when processes do; VMMap appears when virtual memory does.</p>
            <div class="hero-actions"><a class="button" href="#/toolbox">Explore the toolbox ${icons.arrow}</a></div>
            <div class="tool-orbit" aria-hidden="true">
              <span class="orbit-chip">ProcExp</span>
              <span class="orbit-chip">VMMap</span>
              <span class="orbit-chip">Procmon</span>
              <span class="orbit-chip">WinObj</span>
            </div>
          </article>
        </section>
      </div>`;
  }

  function moduleCard(module) {
    return `
      <a class="module-card" href="#/module/${module.id}" ${accentStyle(module.accent)}>
        <span class="module-index">${module.number}</span>
        <span class="module-title"><strong>${module.title}</strong></span>
        <p class="module-description">${module.description}</p>
        <span class="module-meta"><span>${module.lessons} lessons</span><span>${module.time}</span></span>
        <span class="module-arrow" aria-hidden="true">→</span>
      </a>`;
  }

  function renderLessons() {
    const totalLessons = data.modules.reduce((total, module) => total + module.lessonTitles.length, 0);

    main.innerHTML = `
      <div class="content-wrap narrow lesson-index-page">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>All lessons</span></div>
        <header class="lessons-hero">
          <h1>All lessons, in order.</h1>
          <p>Follow the sequence from operating-system fundamentals to advanced Windows process behaviour. Each module builds on the ideas introduced before it.</p>
          <span class="lessons-summary">${totalLessons} lessons across ${data.modules.length} modules</span>
        </header>

        <section class="lesson-index-list" aria-label="Complete lesson list">
          ${data.modules.map((module) => `
            <article class="lesson-module">
              <a class="lesson-module-head" href="#/module/${module.id}">
                <span class="lesson-module-number">${module.number}</span>
                <h2>${module.title}</h2>
                <span>${module.lessonTitles.length} lessons</span>
              </a>
              <ol>
                ${module.lessonTitles.map((title, index) => {
                  const lesson = moduleLessons(module.id)[index];
                  const href = lesson ? `#/lesson/${lesson.id}` : `#/module/${module.id}`;
                  return `
                    <li>
                      <a class="lesson-index-row${lesson ? " is-available" : ""}" href="${href}">
                        <span class="lesson-sequence">${module.number}.${String(index + 1).padStart(2, "0")}</span>
                        <strong>${title}</strong>
                        <span class="lesson-availability${lesson ? " available" : ""}">${lesson ? "Read lesson" : "Module outline"}</span>
                        <span class="lesson-row-arrow" aria-hidden="true">→</span>
                      </a>
                    </li>`;
                }).join("")}
              </ol>
            </article>`).join("")}
        </section>
      </div>`;
  }

  function renderModule(id) {
    const module = data.modules.find((item) => item.id === id) || data.modules[0];
    const lessonNames = module.lessonTitles.map((title, index) => ({
      title,
      type: index === module.lessonTitles.length - 1 ? "Investigation & review" : index % 2 ? "Concept + lab" : "Core lesson"
    }));

    main.innerHTML = `
      <div class="content-wrap">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>Module ${module.number}</span></div>
        <section class="module-hero-grid">
          <div>
            <h1>${module.title}</h1>
            <p class="hero-lead">${module.description}</p>
            <div class="topic-chips">${module.topics.map((topic) => `<span class="topic-chip">${topic}</span>`).join("")}</div>
            <div class="hero-actions">
              <a class="button primary" href="#/lesson/${firstLessonId(module.id)}">Begin module ${icons.arrow}</a>
            </div>
          </div>
          <aside class="module-facts" aria-label="Module details">
            <div class="fact-row"><span>Lessons</span><strong>${module.lessons}</strong></div>
            <div class="fact-row"><span>Reading time</span><strong>${module.time}</strong></div>
            <div class="fact-row"><span>Tools</span><strong>${module.tools.join(", ")}</strong></div>
            <div class="fact-row"><span>Python</span><strong>${module.python.join(", ")}</strong></div>
          </aside>
        </section>

        <section class="lesson-outline">
          <h2>Lesson sequence</h2>
          ${lessonNames.map((lesson, index) => `
            <a class="outline-item" href="#/lesson/${moduleLessons(module.id)[index]?.id || firstLessonId(module.id)}">
              <span class="outline-number">${String(index + 1).padStart(2, "0")}</span>
              <strong>${lesson.title}</strong>
              <small>${lesson.type}</small>
            </a>`).join("")}
          <a class="outline-item outline-review" href="#/review/${module.id}">
            <span class="outline-number">R</span>
            <strong>${escapeHtml(module.title)} review</strong>
            <small>5 cumulative activities</small>
          </a>
        </section>
      </div>`;
  }

  function lessonApiChip(api) {
    const featureName = api.includes(".") ? api.split(".").pop() : api;
    const apiLower = api.toLowerCase();
    const featureLower = featureName.toLowerCase();
    const preferredModule = api.startsWith("ctypes.") ? "ctypes / ctypes.wintypes" : api.split(".")[0];
    const nativeEntry = windowsApiGuide.families.flatMap((family) => family.variants)
      .find((entry) => entry.name.toLowerCase() === featureLower);
    if (nativeEntry && !api.includes(".")) {
      return `<a class="lesson-api-chip linked" href="#/reference/windows-api?q=${encodeURIComponent(nativeEntry.name)}"><code>${escapeHtml(api)}</code><span>Open guide</span></a>`;
    }
    const matches = referenceData.pywin32Modules.flatMap((module) => module.features.map((feature) => ({ module, feature }))).filter(({ feature }) => {
      const name = feature.name.toLowerCase();
      return name === apiLower || name === featureLower || name.endsWith(`.${featureLower}`);
    });
    const match = matches.find(({ module }) => module.name === preferredModule) || matches[0];
    if (!match) return `<span class="lesson-api-chip"><code>${escapeHtml(api)}</code></span>`;
    return `<a class="lesson-api-chip linked" href="#/reference/pywin32?q=${encodeURIComponent(match.feature.name)}&api=${encodeURIComponent(match.feature.name)}"><code>${escapeHtml(api)}</code><span>Open guide</span></a>`;
  }

  function renderParagraphs(paragraphs) {
    return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  }

  function renderInlineCheck(check) {
    if (!check) return "";
    const optionLetters = ["A", "B", "C", "D", "E"];
    return `
      <aside class="quiz-card inline-check" data-answer="${optionLetters[check[2]].toLowerCase()}">
        <span class="quiz-kicker">Pause and predict</span>
        <h3>${escapeHtml(check[0])}</h3>
        <div class="quiz-options">${check[1].map((option, index) => `<button class="quiz-option" type="button" data-option="${optionLetters[index].toLowerCase()}"><span class="option-letter">${optionLetters[index]}</span>${escapeHtml(option)}</button>`).join("")}</div>
        <p class="quiz-feedback">${escapeHtml(check[3])}</p>
      </aside>`;
  }

  function renderLearningBlocks(blocks) {
    return blocks.map((block) => `
      <section class="learning-block">
        <h3>${escapeHtml(block.title)}</h3>
        ${renderParagraphs(block.paragraphs || [])}
        ${block.bullets?.length ? `<ul>${block.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
        ${block.callout ? `<aside class="rich-callout ${escapeHtml(block.callout.tone || "note")}"><strong>${escapeHtml(block.callout.label)}</strong><p>${escapeHtml(block.callout.text)}</p></aside>` : ""}
        ${renderInlineCheck(block.inlineCheck)}
      </section>`).join("");
  }

  function renderVisual(visual) {
    return `
      <figure class="lesson-visual visual-${escapeHtml(visual.type || "flow")}" aria-label="${escapeHtml(visual.alt || visual.title)}">
        <div class="visual-head"><span>Visual model</span><h3>${escapeHtml(visual.title)}</h3>${visual.intro ? `<p>${escapeHtml(visual.intro)}</p>` : ""}</div>
        <div class="visual-track">
          ${visual.items.map((item, index) => `
            <div class="visual-unit">
              <div class="visual-node tone-${escapeHtml(item.tone || String((index % 4) + 1))}">
                ${item.meta ? `<small>${escapeHtml(item.meta)}</small>` : ""}
                <strong>${escapeHtml(item.label)}</strong>
                ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ""}
              </div>
              ${index < visual.items.length - 1 ? `<div class="visual-link" aria-hidden="true"><span>${escapeHtml(item.linkAfter || "then")}</span><i></i></div>` : ""}
            </div>`).join("")}
        </div>
        ${visual.caption ? `<figcaption>${escapeHtml(visual.caption)}</figcaption>` : ""}
      </figure>`;
  }

  function workedHeader(example, label) {
    return `<header class="worked-format-head"><span>${escapeHtml(label)}</span><h3>${escapeHtml(example.title)}</h3><p>${escapeHtml(example.prompt)}</p></header>`;
  }

  function workedTakeaway(example, label = "Key insight") {
    return example.conclusion ? `<footer class="worked-takeaway"><span>${escapeHtml(label)}</span><p>${escapeHtml(example.conclusion)}</p></footer>` : "";
  }

  function renderCalculationExample(example) {
    return `
      <section class="worked-format worked-calculation">
        ${workedHeader(example, "Worked calculation")}
        <ol class="calculation-working">
          ${example.steps.map((step, index) => `<li>
            <div class="calculation-step"><span>${String(index + 1).padStart(2, "0")}</span><h4>${escapeHtml(step.title)}</h4></div>
            <p class="calculation-action">${escapeHtml(step.action)}</p>
            ${step.result ? `<div class="calculation-line"><code>${escapeHtml(step.result)}</code></div>` : ""}
            <p class="calculation-explanation">${escapeHtml(step.why)}</p>
          </li>`).join("")}
        </ol>
        ${workedTakeaway(example, "Answer and insight")}
      </section>`;
  }

  function renderTraceExample(example) {
    return `
      <section class="worked-format worked-trace">
        ${workedHeader(example, "Execution trace")}
        <ol class="trace-path">
          ${example.steps.map((step, index) => `<li>
            <span class="trace-marker">${index + 1}</span>
            <div class="trace-copy"><h4>${escapeHtml(step.title)}</h4><p>${escapeHtml(step.action)}</p>${step.result ? `<div class="trace-state"><span>State after</span><strong>${escapeHtml(step.result)}</strong></div>` : ""}<small>${escapeHtml(step.why)}</small></div>
          </li>`).join("")}
        </ol>
        ${workedTakeaway(example, "Resulting model")}
      </section>`;
  }

  function renderComparisonExample(example) {
    const columns = example.columns || [];
    return `
      <section class="worked-format worked-comparison">
        ${workedHeader(example, "Side-by-side comparison")}
        <div class="comparison-columns">
          ${columns.map((column, columnIndex) => `<article class="comparison-column comparison-tone-${columnIndex + 1}"><h4>${escapeHtml(column.title)}</h4><dl>${column.rows.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl></article>`).join("")}
        </div>
        ${example.shared ? `<div class="comparison-shared"><span>What remains the same</span><p>${escapeHtml(example.shared)}</p></div>` : ""}
        ${workedTakeaway(example)}
      </section>`;
  }

  function renderDecisionExample(example) {
    return `
      <section class="worked-format worked-decision">
        ${workedHeader(example, "Decision guide")}
        <ol class="decision-path">
          ${example.steps.map((step, index) => `<li><span class="decision-index">${index + 1}</span><div><h4>${escapeHtml(step.title)}</h4><p class="decision-choice">${escapeHtml(step.action)}</p><p>${escapeHtml(step.why)}</p>${step.result ? `<small>${escapeHtml(step.result)}</small>` : ""}</div></li>`).join("")}
        </ol>
        ${workedTakeaway(example, "Decision")}
      </section>`;
  }

  function renderContractExample(example) {
    return `
      <section class="worked-format worked-contract">
        ${workedHeader(example, "API contract example")}
        <div class="contract-parts">
          ${example.steps.map((step, index) => `<section><div class="contract-key"><span>${String(index + 1).padStart(2, "0")}</span><h4>${escapeHtml(step.title)}</h4></div><div class="contract-value"><p>${escapeHtml(step.action)}</p><small>${escapeHtml(step.why)}</small>${step.result ? `<strong>${escapeHtml(step.result)}</strong>` : ""}</div></section>`).join("")}
        </div>
        ${workedTakeaway(example, "Complete contract")}
      </section>`;
  }

  function renderBranchExample(example) {
    return `
      <section class="worked-format worked-branch">
        ${workedHeader(example, "Result branches")}
        ${example.setupCode ? `<div class="branch-input"><span>Returned status</span><pre><code>${escapeHtml(example.setupCode)}</code></pre></div>` : ""}
        <div class="branch-grid">
          ${(example.branches || []).map((branch, index) => `<article class="branch-card branch-tone-${(index % 4) + 1}"><code>${escapeHtml(branch.value)}</code><p>${escapeHtml(branch.meaning)}</p><div>${escapeHtml(branch.action)}</div></article>`).join("")}
        </div>
        ${workedTakeaway(example, "Handling rule")}
      </section>`;
  }

  function renderStateExample(example) {
    return `
      <section class="worked-format worked-state">
        ${workedHeader(example, "State transition")}
        <div class="state-path">${example.steps.map((step) => `<article><span>${escapeHtml(step.title)}</span><p>${escapeHtml(step.action)}</p>${step.result ? `<strong>${escapeHtml(step.result)}</strong>` : ""}<small>${escapeHtml(step.why)}</small></article>`).join("")}</div>
        ${workedTakeaway(example, "Resulting state")}
      </section>`;
  }

  function renderWorkedExamples(examples) {
    const renderers = {
      calculation: renderCalculationExample,
      trace: renderTraceExample,
      comparison: renderComparisonExample,
      decision: renderDecisionExample,
      contract: renderContractExample,
      branch: renderBranchExample,
      state: renderStateExample
    };
    return (examples || []).map((example) => (renderers[example.type] || renderDecisionExample)(example)).join("");
  }

  function renderCodeWalkthroughs(walkthroughs) {
    return (walkthroughs || []).map((walkthrough) => `
      <section class="code-walkthrough">
        <div class="code-walkthrough-head"><span>Code walkthrough</span><h3>${escapeHtml(walkthrough.title)}</h3><p>${escapeHtml(walkthrough.intro)}</p></div>
        ${walkthrough.stages.map((stage, index) => `
          <div class="code-stage">
            <div class="code-stage-copy"><span>Step ${index + 1}</span><h4>${escapeHtml(stage.title)}</h4><p>${escapeHtml(stage.explanation)}</p></div>
            <pre><code>${escapeHtml(stage.code)}</code></pre>
          </div>`).join("")}
      </section>`).join("");
  }

  function normalizedPractice(lesson) {
    const practice = lesson.practice;
    const steps = practice.steps.map((step) => typeof step === "string" ? {
      action: step
    } : step);
    return {
      ...practice,
      expectedOutcome: practice.expectedOutcome || "The named tool or script should expose the system state described by the steps. Exact identifiers and addresses will differ on each machine, but the relationships and result types should match the lesson.",
      steps,
      cleanup: practice.cleanup || ["Close handles, tools, files, and test processes opened for the investigation.", "Remove or restore any temporary configuration change you made."],
      hints: practice.hints || [{ title: "If you are stuck", body: "Return to the expected observation for the current step. Check the tool filter, process identity, permissions, and whether the event happened after capture began." }]
    };
  }

  function renderPracticeCommands(step, stepIndex) {
    return (step.commands || []).map((command, commandIndex) => {
      const commandId = `practice-command-${stepIndex}-${commandIndex}`;
      const label = escapeHtml(command.label);
      return `
        <section class="practice-command" data-practice-command="${commandId}">
          <div class="practice-command-head">
            <span data-command-label>${label}</span>
            <button class="practice-command-copy" type="button" data-copy-practice-command data-command-id="${commandId}" aria-label="Copy ${label} command">Copy</button>
          </div>
          <pre><code data-practice-command-code="${commandId}">${escapeHtml(command.code)}</code></pre>
          <p data-copy-status aria-live="polite"></p>
        </section>`;
    }).join("");
  }

  function renderPracticeCaseStudy(practice) {
    if (!practice.caseStudy) return "";
    const caseStudy = practice.caseStudy;
    return `
      <section class="practice-case-study" data-practice-case-study>
        <header class="practice-case-study-head">
          <span class="practice-case-study-label">${escapeHtml(caseStudy.label)}</span>
          <h4 class="practice-case-study-title">${escapeHtml(caseStudy.title)}</h4>
          <p class="practice-case-study-summary">${escapeHtml(caseStudy.summary)}</p>
        </header>
        ${(caseStudy.sections || []).map((section) => `
          <section class="practice-case-study-section" data-case-study-section>
            <h5>${escapeHtml(section.title)}</h5>
            ${section.body ? `<p>${escapeHtml(section.body)}</p>` : ""}
            ${section.facts ? `
              <dl class="practice-case-study-facts" data-case-study-facts>
                ${section.facts.map(([term, description]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(description)}</dd></div>`).join("")}
              </dl>` : ""}
            ${section.code ? `<pre><code>${escapeHtml(section.code)}</code></pre>` : ""}
          </section>`).join("")}
      </section>`;
  }

  function renderPracticeCaseStudyReferences(step) {
    if (!step.caseStudySections?.length) return "";
    return `<div class="practice-case-study-references">${step.caseStudySections
      .map((sectionTitle) => `<span data-case-study-reference>Use case study: ${escapeHtml(sectionTitle)}</span>`)
      .join("")}</div>`;
  }

  function renderPracticeCheckpoints(practice, afterStep) {
    return (practice.checkpoints || []).map((checkpoint, checkpointIndex) => ({ checkpoint, checkpointIndex }))
      .filter(({ checkpoint }) => checkpoint.afterStep === afterStep)
      .map(({ checkpoint, checkpointIndex }) => {
        const checkpointId = `practice-checkpoint-${checkpointIndex}`;
        const feedbackId = `${checkpointId}-feedback`;
        const prompt = escapeHtml(checkpoint.prompt);
        const control = checkpoint.type === "choice"
          ? `<fieldset>
              <legend data-checkpoint-prompt>${prompt}</legend>
              <div class="practice-checkpoint-options">
                ${checkpoint.options.map((option, optionIndex) => `
                  <label>
                    <input type="radio" name="${checkpointId}" value="${optionIndex}" data-checkpoint-option aria-describedby="${feedbackId}">
                    <span>${escapeHtml(option)}</span>
                  </label>`).join("")}
              </div>
            </fieldset>`
          : `<label for="${checkpointId}-input" data-checkpoint-prompt>${prompt}</label>
            <input id="${checkpointId}-input" type="text" autocomplete="off" spellcheck="false" data-checkpoint-input aria-describedby="${feedbackId}">`;
        return `
          <section class="practice-checkpoint" data-practice-checkpoint="${checkpointIndex}" data-checkpoint-type="${escapeHtml(checkpoint.type)}">
            ${control}
            <button type="button" data-checkpoint-check>Check answer</button>
            <p id="${feedbackId}" data-checkpoint-feedback role="status" aria-live="polite"></p>
          </section>`;
      }).join("");
  }

  function renderPractice(lesson) {
    const practice = normalizedPractice(lesson);
    const downloads = practice.downloads || (practice.download ? [practice.download] : []);
    return `
      <div class="practice-workspace" data-practice-workspace="${escapeHtml(lesson.id)}">
        <div class="lab-head">
          <div><small>Guided investigation</small><h3>${escapeHtml(practice.title)}</h3></div>
          <div class="lab-actions">
            ${downloads.map((artifact) => `<a class="download-button" href="${escapeHtml(artifact[0])}" download="${escapeHtml(artifact[1])}" aria-label="${escapeHtml(`${artifact[2] || "Download starter"}: ${artifact[1]}`)}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M5 20h14"/></svg><span>${escapeHtml(artifact[2] || "Download starter")}</span></a>`).join("")}
            <span class="lab-time">${escapeHtml(practice.time)}</span>
          </div>
        </div>
        <div class="practice-intro"><p>${escapeHtml(practice.intro)}</p></div>
        ${practice.safety ? `<aside class="rich-callout caution"><strong>Safety boundary</strong><p>${escapeHtml(practice.safety)}</p></aside>` : ""}
        ${renderPracticeCaseStudy(practice)}
        <details class="practice-expectation"><summary><span>What should happen?</span><span class="details-chevron" aria-hidden="true">+</span></summary><p>${escapeHtml(practice.expectedOutcome)}</p></details>
        <ol class="practice-steps">
          ${practice.steps.map((step, index) => `
            <li>
              <span class="practice-number">${String(index + 1).padStart(2, "0")}</span>
              <div class="practice-step-copy"><h4>${escapeHtml(step.action)}</h4>${renderPracticeCaseStudyReferences(step)}${renderPracticeCommands(step, index)}${step.why ? `<p><strong>Why this step matters:</strong> ${escapeHtml(step.why)}</p>` : ""}${step.observe ? `<p class="practice-observe"><strong>Look for:</strong> ${escapeHtml(step.observe)}</p>` : ""}${step.hint ? `<details><summary>Hint for this step</summary><p>${escapeHtml(step.hint)}</p></details>` : ""}${renderPracticeCheckpoints(practice, index + 1)}</div>
            </li>`).join("")}
        </ol>
        <details class="practice-hints"><summary>Need a nudge?</summary>${practice.hints.map((hint) => `<div><strong>${escapeHtml(hint.title)}</strong><p>${escapeHtml(hint.body)}</p></div>`).join("")}</details>
        ${practice.extension ? `<aside class="practice-extension"><strong>${escapeHtml(practice.extension.title)}</strong><p>${escapeHtml(practice.extension.prompt)}</p></aside>` : ""}
        <div class="cleanup-block"><h4>Cleanup</h4><ul>${practice.cleanup.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
      </div>`;
  }

  function renderChecks(lesson, optionLetters) {
    const checks = lesson.checks || [lesson.check];
    return checks.map((check, checkIndex) => `
      <div class="quiz-card" data-answer="${optionLetters[check[2]].toLowerCase()}">
        <span class="quiz-kicker">Question ${checkIndex + 1} of ${checks.length}</span>
        <h3>${escapeHtml(check[0])}</h3>
        <div class="quiz-options">${check[1].map((option, index) => `<button class="quiz-option" data-option="${optionLetters[index].toLowerCase()}"><span class="option-letter">${optionLetters[index]}</span>${escapeHtml(option)}</button>`).join("")}</div>
        <p class="quiz-feedback">${escapeHtml(check[3])}</p>
      </div>`).join("");
  }

  function phaseDetails(lesson) {
    const defaultsByModule = {
      foundations: {
        learn: ["Build the model", "Establish the idea and the distinctions this lesson depends on."],
        windows: ["Connect it to Windows", "Relate the model to Windows interfaces and observable state."],
        investigation: ["Test the model", "Use a controlled investigation to compare the model with evidence."],
        review: ["Check your understanding", "Resolve the main decisions before continuing."]
      },
      "processes-handles": {
        learn: ["Understand the mechanism", "Build the process and object model behind the lesson."],
        windows: ["Find it in Windows", "Connect the mechanism to Windows objects, APIs, and tools."],
        investigation: ["Inspect it", "Use live evidence to test the distinctions introduced above."],
        review: ["Check the model", "Retain the process and lifetime rules that later lessons use."]
      },
      "threads-scheduling": {
        learn: ["Follow the execution", "Build the thread and scheduling model for this lesson."],
        windows: ["Observe the scheduler", "Connect execution state to Windows APIs and tool evidence."],
        investigation: ["Run the experiment", "Compare predicted thread behaviour with what Windows reports."],
        review: ["Check the reasoning", "Test the scheduling decisions and state changes that matter."]
      },
      memory: {
        learn: ["Map the memory model", "Establish the address and lifetime relationships for this lesson."],
        windows: ["Read Windows memory", "Connect the model to Windows regions, APIs, and inspection tools."],
        investigation: ["Inspect the address space", "Use evidence to test the memory relationships introduced above."],
        review: ["Check the map", "Retain the address, state, and protection distinctions."]
      },
      "linking-loading": {
        learn: ["Follow the loader", "Build the file, symbol, and runtime relationship for this lesson."],
        windows: ["Trace it in Windows", "Connect loader behavior to Windows structures, APIs, and tools."],
        investigation: ["Inspect the load", "Observe the relevant files, modules, and addresses."],
        review: ["Check the trace", "Test the loader relationships before continuing."]
      },
      management: {
        learn: ["Build the management model", "Establish the configuration or service mechanism in this lesson."],
        windows: ["Control it safely", "Connect the model to Windows management APIs and reversible actions."],
        investigation: ["Verify the change", "Observe the requested state and confirm what actually changed."],
        review: ["Check the operation", "Retain the access, state, and cleanup rules."]
      },
      security: {
        learn: ["Build the security model", "Establish the identity, policy, and access relationships."],
        windows: ["Read the security context", "Connect the model to Windows tokens, descriptors, and APIs."],
        investigation: ["Test the boundary", "Compare a predicted access decision with controlled evidence."],
        review: ["Check the decision", "Retain the security rules that explain the result."]
      },
      synchronisation: {
        learn: ["Model the shared state", "Establish the ordering and coordination problem."],
        windows: ["Choose the Windows primitive", "Connect the required behavior to waitable objects and APIs."],
        investigation: ["Test the interleaving", "Observe the result under a controlled execution order."],
        review: ["Check the coordination", "Test the state and wait-result decisions."]
      },
      ipc: {
        learn: ["Map the communication", "Establish the endpoints, data flow, and lifetime rules."],
        windows: ["Build the Windows channel", "Connect the design to Windows IPC objects and APIs."],
        investigation: ["Trace the exchange", "Observe messages, handles, blocking, and shutdown behavior."],
        review: ["Check the protocol", "Retain the framing, ownership, and failure rules."]
      },
      "hooking-injection": {
        learn: ["Understand the mechanism", "Build a defensive model of the code and control-flow change."],
        windows: ["Recognise it in Windows", "Connect the mechanism to modules, memory, and observable evidence."],
        investigation: ["Inspect the evidence", "Use a constrained lab to distinguish facts from inference."],
        review: ["Check the analysis", "Test the boundaries, indicators, and limitations."]
      }
    };
    const defaults = defaultsByModule[lesson.module] || defaultsByModule.foundations;
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) => {
      const custom = lesson.phases?.[key];
      return [key, { title: custom?.[0] || value[0], subtitle: custom?.[1] || value[1] }];
    }));
  }

  function renderLesson(id) {
    const lesson = findLesson(id);
    const module = data.modules.find((item) => item.id === lesson.module) || data.modules[0];
    const moduleLessonList = moduleLessons(module.id);
    const moduleIndex = moduleLessonList.indexOf(lesson);
    const allIndex = lessons.indexOf(lesson);
    const previous = lessons[allIndex - 1];
    const next = moduleLessonList[moduleIndex + 1];
    const optionLetters = ["A", "B", "C", "D", "E"];
    const phases = phaseDetails(lesson);
    const sections = [["learn", phases.learn.title], ["windows", phases.windows.title], ["investigation", phases.investigation.title], ["review", phases.review.title]];
    const learningBlocks = lesson.learning || [
      { title: "The core idea", paragraphs: lesson.core },
      { title: "How it works", paragraphs: lesson.mechanics }
    ];
    const windowsBlocks = lesson.windowsLearning || [{ title: "Windows in practice", paragraphs: lesson.windows }];

    main.innerHTML = `
      <div class="content-wrap lesson-wrap">
        <div class="lesson-page">
          <article class="lesson-copy">
            <div class="breadcrumb"><span><a href="#/">Course</a></span><span><a href="#/module/${module.id}">${escapeHtml(module.title)}</a></span><span>Lesson ${moduleIndex + 1}</span></div>
            <div class="lesson-position">Module ${module.number}, lesson ${String(moduleIndex + 1).padStart(2, "0")} of ${moduleLessonList.length}</div>
            <h1>${escapeHtml(lesson.title)}</h1>
            <p class="lesson-lead">${escapeHtml(lesson.lead)}</p>
            <details class="mobile-lesson-sections">
              <summary><span>Lesson sections</span><span class="details-chevron" aria-hidden="true">+</span></summary>
              <nav aria-label="Lesson sections">${sections.map(([target, title], index) => `<a href="#/lesson/${lesson.id}" data-scroll-target="${target}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(title)}</a>`).join("")}</nav>
            </details>

            <section id="learn" class="lesson-phase">
              <div class="phase-heading"><span>01</span><div><h2>${escapeHtml(phases.learn.title)}</h2><p>${escapeHtml(phases.learn.subtitle)}</p></div></div>
              ${renderLearningBlocks(learningBlocks)}
              ${(lesson.visuals || []).filter((visual) => (visual.phase || "learn") === "learn").map(renderVisual).join("")}
              ${renderWorkedExamples(lesson.workedExamples)}
            </section>

            <section id="windows" class="lesson-phase">
              <div class="phase-heading"><span>02</span><div><h2>${escapeHtml(phases.windows.title)}</h2><p>${escapeHtml(phases.windows.subtitle)}</p></div></div>
              ${renderLearningBlocks(windowsBlocks)}
              ${(lesson.visuals || []).filter((visual) => visual.phase === "windows").map(renderVisual).join("")}
              ${renderCodeWalkthroughs(lesson.codeWalkthroughs)}
              <div class="lesson-api-panel">
                <span>APIs and concepts to recognise</span>
                <div>${lesson.apis.map(lessonApiChip).join("")}</div>
              </div>
            </section>

            <section id="investigation" class="lesson-phase">
              <div class="phase-heading"><span>03</span><div><h2>${escapeHtml(phases.investigation.title)}</h2><p>${escapeHtml(phases.investigation.subtitle)}</p></div></div>
              ${renderPractice(lesson)}
            </section>

            <section id="review" class="lesson-phase review-phase">
              <div class="phase-heading"><span>04</span><div><h2>${escapeHtml(phases.review.title)}</h2><p>${escapeHtml(phases.review.subtitle)}</p></div></div>
              <div class="quiz-stack">${renderChecks(lesson, optionLetters)}</div>
              <div class="take-forward"><h3>What to take forward</h3><ul>${lesson.keys.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
              <div class="lesson-sources"><span>Continue with primary documentation</span>${lesson.sources.map(([label, url]) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)} <span aria-hidden="true">&#8599;</span></a>`).join("")}</div>
            </section>

            <nav class="lesson-footer-nav" aria-label="Lesson navigation">
              ${previous ? `<a class="lesson-nav-card" href="#/lesson/${previous.id}">Previous lesson<strong>${escapeHtml(previous.title)}</strong></a>` : `<a class="lesson-nav-card" href="#/module/${module.id}">Module overview<strong>${escapeHtml(module.title)}</strong></a>`}
              ${next ? `<a class="lesson-nav-card" href="#/lesson/${next.id}">Next lesson<strong>${escapeHtml(next.title)}</strong></a>` : `<a class="lesson-nav-card" href="#/review/${module.id}">Module review<strong>${escapeHtml(module.title)}</strong></a>`}
            </nav>
          </article>

          <aside class="lesson-aside">
            <nav class="on-page" aria-label="On this page">
              <p>On this page</p>
              ${sections.map(([target, title]) => `<a href="#/lesson/${lesson.id}" data-scroll-target="${target}">${title}</a>`).join("")}
            </nav>
          </aside>
        </div>
      </div>`;

    wireQuizzes();
    wirePracticeCommands();
    wirePracticeCheckpoints(normalizedPractice(lesson));
  }

  function renderLegacyLesson() {
    main.innerHTML = `
      <div class="content-wrap lesson-wrap">
        <div class="lesson-page">
          <article class="lesson-copy">
            <div class="breadcrumb"><span><a href="#/">Course</a></span><span><a href="#/module/foundations">OS foundations</a></span><span>Lesson 1</span></div>
            <h1>Why does an operating system exist?</h1>
            <p class="lesson-lead">Before processes, pages, and handles make sense, we need to understand the two problems an operating system is always solving: managing scarce resources and hiding awkward hardware details.</p>

            <section id="machine">
              <h2>Begin with the machine</h2>
              <p>A computer has components that can store data, transform it, or move it. The CPU executes instructions, RAM holds the active working set, and storage keeps data after power is removed. Devices communicate through controllers and buses.</p>
              <p>An application could theoretically control these components itself. In practice, that would mean every program needs to understand every storage controller, keyboard, display, and network adapter it might encounter.</p>
              <div class="concept-diagram" role="img" aria-label="User, application, operating system, and hardware layers">
                <div class="diagram-node"><small>Intent</small><strong>User</strong></div>
                <div class="diagram-node"><small>Program</small><strong>Application</strong></div>
                <div class="diagram-node os"><small>Manager + interface</small><strong>Operating system</strong></div>
                <div class="diagram-node"><small>Resources</small><strong>Hardware</strong></div>
              </div>
              <div class="callout">
                <span class="callout-label">Keep this model</span>
                <p>The OS sits between intent and mechanism. Applications ask for outcomes; the OS decides how and whether those outcomes happen.</p>
              </div>
            </section>

            <section id="two-jobs">
              <h2>The OS has two fundamental jobs</h2>
              <h3>1. Provide abstractions</h3>
              <p>Applications open a <strong>file</strong>, not sectors on a particular SSD. They create a <strong>process</strong>, not a hand-written collection of page tables and scheduler records. These abstractions give software a stable interface even when the underlying hardware changes.</p>
              <h3>2. Manage shared resources</h3>
              <p>Many programs want the CPU, memory, storage, and devices at the same time. The OS schedules access, isolates programs from one another, enforces permissions, and recovers resources when they are no longer needed.</p>

              <div class="quiz-card" data-answer="b">
                <p class="quiz-kicker">Check your model</p>
                <h3>A music player is waiting for data from storage. Why might Windows schedule another thread?</h3>
                <div class="quiz-options">
                  <button class="quiz-option" data-option="a"><span class="option-letter">A</span>Because the first process has lost its virtual memory</button>
                  <button class="quiz-option" data-option="b"><span class="option-letter">B</span>To use CPU time that would otherwise be idle</button>
                  <button class="quiz-option" data-option="c"><span class="option-letter">C</span>Because every I/O request terminates its thread</button>
                </div>
                <p class="quiz-feedback">While one thread waits for slow I/O, the scheduler can run a ready thread and keep the processor doing useful work.</p>
              </div>
            </section>

            <section id="windows-boundary">
              <h2>The Windows boundary</h2>
              <p>Modern Windows separates execution into <strong>user mode</strong> and <strong>kernel mode</strong>. Applications normally run in user mode with restricted access. Core operating-system code and drivers run in kernel mode with the ability to access protected memory and hardware.</p>
              <p>When an application needs a protected operation, such as opening a file, it calls a Windows API. If kernel work is required, that request eventually crosses the boundary through a system call. Windows checks the request and performs the operation on the application's behalf.</p>
              <div class="callout warning">
                <span class="callout-label">Important distinction</span>
                <p>A Win32 API call and a system call are not synonymous. Some Win32 functions operate entirely in user mode; others eventually invoke the Native API and cross into the kernel.</p>
              </div>
            </section>

            <section id="python-window">
              <h2>Your first view through pywin32</h2>
              <p><code>win32api</code> groups common Windows operations into Python-callable functions. This small example asks Windows for the current process identifier and the account associated with the current thread.</p>
              <div class="code-card lesson-code">
                <div class="code-head"><span>who_am_i.py</span><span class="window-dots"><i></i><i></i><i></i></span></div>
                <pre><span class="code-keyword">import</span> <span class="code-module">win32api</span>

pid = <span class="code-function">win32api.GetCurrentProcessId</span>()
user = <span class="code-function">win32api.GetUserName</span>()

<span class="code-function">print</span>(<span class="code-string">f"{user} is running process {pid}"</span>)</pre>
              </div>
              <p>There is no need to memorise the module. The useful mental shortcut is: <strong><code>win32api</code> is a collection of general Windows utilities</strong>. More focused work moves to modules such as <code>win32process</code> or <code>win32security</code>.</p>
            </section>

            <section id="inspect">
              <h2>Inspect it with Process Explorer</h2>
              <div class="lab-card">
                <div class="lab-head">
                  <div><small>Guided investigation</small><h3>Find Python inside Windows</h3></div>
                  <div class="lab-actions">
                    <a class="download-button" href="downloads/who_am_i.py" download="who_am_i.py" aria-label="Download the who_am_i.py starter file">
                      <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M5 20h14"/></svg>
                      <span>Download starter</span>
                    </a>
                    <span class="lab-time">10–15 min</span>
                  </div>
                </div>
                <div class="lab-body">
                  <ol>
                    <li>Before running the script, predict where its process will appear and which process will be its parent.</li>
                    <li>Open Process Explorer and enable the <strong>Process ID</strong> column.</li>
                    <li>Download and run the starter from a terminal. It pauses so the process stays alive while you inspect it.</li>
                    <li>Find the matching PID. Inspect its image path, parent, user, integrity level, threads, and loaded modules.</li>
                    <li>Explain which details belong to the program and which are supplied or managed by Windows.</li>
                  </ol>
                </div>
              </div>
            </section>

            <section id="summary">
              <h2>What to take forward</h2>
              <ul>
                <li>An operating system provides useful abstractions over hardware.</li>
                <li>It manages and protects resources shared by competing programs.</li>
                <li>Windows separates ordinary applications from privileged kernel code.</li>
                <li>The Win32 API is the application-facing interface; kernel operations eventually require a system call.</li>
                <li>pywin32 lets Python use many of those Windows interfaces directly.</li>
              </ul>
            </section>

            <nav class="lesson-footer-nav" aria-label="Lesson navigation">
              <a class="lesson-nav-card" href="#/module/foundations">← Module overview<strong>OS foundations</strong></a>
              <a class="lesson-nav-card" href="#/module/foundations">Next lesson →<strong>How Windows is organised</strong></a>
            </nav>
          </article>

          <aside class="lesson-aside">
            <nav class="on-page" aria-label="On this page">
              <p>On this page</p>
              <a href="#/lesson/os-foundations" data-scroll-target="machine">Begin with the machine</a>
              <a href="#/lesson/os-foundations" data-scroll-target="two-jobs">The OS's two jobs</a>
              <a href="#/lesson/os-foundations" data-scroll-target="windows-boundary">The Windows boundary</a>
              <a href="#/lesson/os-foundations" data-scroll-target="python-window">First pywin32 view</a>
              <a href="#/lesson/os-foundations" data-scroll-target="inspect">Process Explorer lab</a>
              <a href="#/lesson/os-foundations" data-scroll-target="summary">Summary</a>
            </nav>
          </aside>
        </div>
      </div>`;

    wireQuizzes();
  }

  function wireQuizzes() {
    document.querySelectorAll(".quiz-card").forEach((card) => {
      const answer = card.dataset.answer;
      const feedback = card.querySelector(".quiz-feedback");
      card.querySelectorAll(".quiz-option").forEach((option) => {
        option.addEventListener("click", () => {
          if (option.dataset.option !== answer) {
            option.disabled = true;
            option.classList.add("incorrect");
            feedback.classList.add("visible");
            return;
          }
          card.querySelectorAll(".quiz-option").forEach((item) => { item.disabled = true; });
          option.classList.add("correct");
          feedback.classList.add("visible");
        });
      });
    });
  }

  function wirePracticeCommands() {
    document.querySelectorAll("[data-copy-practice-command]").forEach((button) => {
      const command = button.closest("[data-practice-command]")?.querySelector("[data-practice-command-code]");
      const status = button.closest("[data-practice-command]")?.querySelector("[data-copy-status]");
      const label = button.closest("[data-practice-command]")?.querySelector("[data-command-label]")?.textContent.trim() || "Command";
      if (!command || !status) return;

      button.addEventListener("click", async () => {
        try {
          if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
          await navigator.clipboard.writeText(command.textContent);
          button.textContent = "Copied";
          status.textContent = `${label} command copied.`;
          button.focus();
        } catch {
          const range = document.createRange();
          range.selectNodeContents(command);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          status.textContent = "Command selected. Press Ctrl+C to copy.";
          button.focus();
        }
      });
      button.addEventListener("blur", () => {
        if (button.textContent === "Copied") button.textContent = "Copy";
      });
    });
  }

  function wirePracticeCheckpoints(practice) {
    document.querySelectorAll("[data-practice-checkpoint]").forEach((container) => {
      const checkpoint = practice.checkpoints?.[Number(container.dataset.practiceCheckpoint)];
      const button = container.querySelector("[data-checkpoint-check]");
      const feedback = container.querySelector("[data-checkpoint-feedback]");
      if (!checkpoint || !button || !feedback) return;

      const setResult = (correct, empty = false) => {
        container.classList.toggle("correct", correct);
        container.classList.toggle("incorrect", !correct);
        feedback.textContent = correct
          ? `Correct. ${checkpoint.feedback}`
          : `${empty ? "Choose or enter an answer, then try again." : "Try again."} ${checkpoint.feedback}`;
      };

      button.addEventListener("click", () => {
        if (checkpoint.type === "short") {
          const input = container.querySelector("[data-checkpoint-input]");
          const submitted = input?.value.trim().toLocaleLowerCase() || "";
          const answers = [checkpoint.answer, ...(checkpoint.acceptedAnswers || [])]
            .map((answer) => answer.trim().toLocaleLowerCase());
          setResult(Boolean(submitted) && answers.includes(submitted), !submitted);
          return;
        }

        const selected = container.querySelector("[data-checkpoint-option]:checked");
        setResult(Boolean(selected) && Number(selected.value) === checkpoint.answerIndex, !selected);
      });
    });
  }

  function renderModuleReview(id) {
    const review = assessments.moduleReviews.find((item) => item.module === id);
    if (!review) {
      main.innerHTML = assessmentView.renderUnavailable(id);
      return;
    }
    const moduleIndex = data.modules.findIndex((item) => item.id === id);
    const module = data.modules[moduleIndex];
    const nextModule = data.modules[moduleIndex + 1];
    assessmentView.mount(main, review, {
      context: {
        moduleNumber: module?.number,
        nextHref: nextModule ? `#/module/${nextModule.id}` : "#/assessment/final",
        nextLabel: nextModule ? `Continue to Module ${nextModule.number}` : "Open final assessment"
      }
    });
  }

  function renderFinalAssessment() {
    assessmentView.mount(main, assessments.finalAssessment, { context: {} });
  }

  function moduleSearchText(module) {
    return [module.name, module.category, module.label, module.description, module.useWhen, module.course].join(" ").toLowerCase();
  }

  function featureChoiceSearchText(module, feature) {
    const detail = apiSignatures[`${module.name}::${feature.name}`];
    return (detail?.signatures || []).flatMap((signature, signatureIndex) => signature.parameters.flatMap((parameter) => {
      const bindingKey = `${module.name}::${signature.name}#${signatureIndex}.${parameter.name}`;
      const resolved = window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveParameterChoices(bindingKey, "pywin32");
      if (!resolved) return [];
      return [
        resolved.id,
        resolved.source,
        ...resolved.values.flatMap((value) => [value.name, value.code, value.useWhen]),
        resolved.example?.code || "",
        resolved.example?.useWhen || "",
      ];
    })).join(" ");
  }

  function searchTokens(query) {
    return query.trim().toLowerCase().replace(/[^a-z0-9_]+/g, " ").split(/\s+/).filter(Boolean);
  }

  function containsEveryToken(text, query) {
    const searchable = text.toLowerCase().replace(/[^a-z0-9_]+/g, " ");
    return searchTokens(query).every((token) => searchable.includes(token));
  }

  function matchingFeatures(module, query) {
    if (!query || containsEveryToken(moduleSearchText(module), query)) return module.features;
    return module.features.filter((feature) => containsEveryToken(`${moduleSearchText(module)} ${feature.name} ${feature.task} ${feature.detail} ${featureChoiceSearchText(module, feature)}`, query));
  }

  function pywin32Accent(category) {
    return ({
      Core: "violet",
      Processes: "blue",
      Synchronisation: "pink",
      "Files and I/O": "green",
      IPC: "teal",
      Security: "rose",
      Management: "amber",
      Observation: "cyan",
      Desktop: "orange",
      Networking: "indigo",
      Automation: "lime",
      "Low-level companion": "red"
    })[category] || "violet";
  }

  function toolboxAccent(category) {
    return ({
      Processes: "blue",
      Tracing: "cyan",
      Memory: "green",
      Objects: "teal",
      Images: "violet",
      Persistence: "rose",
      Security: "red",
      Administration: "amber",
      IPC: "pink"
    })[category] || "violet";
  }

  function pywin32ModuleCard(module, query) {
    const features = matchingFeatures(module, query);
    return `
      <details class="api-module" style="--reference-color: var(--${pywin32Accent(module.category)})" ${query ? "open" : ""}>
        <summary>
          <span class="api-module-title"><code>${escapeHtml(module.name)}</code><span>${escapeHtml(module.label)}</span></span>
          <span class="api-summary-meta"><span class="reference-category">${escapeHtml(module.category)}</span><span class="entry-count">${features.length} ${features.length === 1 ? "entry" : "entries"}</span><span class="details-chevron">⌄</span></span>
        </summary>
        <div class="api-module-body">
          <div class="api-purpose">
            <p>${escapeHtml(module.description)}</p>
            <p><strong>Use it when:</strong> ${escapeHtml(module.useWhen)}</p>
          </div>
          <div class="feature-table" role="table" aria-label="${escapeHtml(module.name)} functions and concepts">
            <div class="feature-row feature-head" role="row"><span>API / concept</span><span>What you use it for</span><span>What to know</span><span></span></div>
            ${features.map((feature) => `<button class="feature-row api-detail-trigger" type="button" data-api-module="${escapeHtml(module.name)}" data-api-feature="${escapeHtml(feature.name)}" aria-label="View parameters and return types for ${escapeHtml(feature.name)}"><code>${escapeHtml(feature.name)}</code><strong>${escapeHtml(feature.task)}</strong><span>${escapeHtml(feature.detail)}</span><span class="feature-open" aria-hidden="true">+</span></button>`).join("")}
          </div>
        </div>
      </details>`;
  }

  function renderPywin32(filter = "", openFeature = "") {
    const query = filter.trim().toLowerCase();
    const modules = referenceData.pywin32Modules.filter((module) => matchingFeatures(module, query).length);
    const featureCount = modules.reduce((count, module) => count + matchingFeatures(module, query).length, 0);

    main.innerHTML = `
      <div class="content-wrap reference-width">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>pywin32 guide</span></div>
        <header class="reference-hero compact-reference-hero">
          <h1>Find the Windows capability you need.</h1>
          <span class="source-note">Cross-checked with <a href="https://timgolden.me.uk/pywin32-docs/win32_modules.html" target="_blank" rel="noreferrer">the pywin32 module reference ↗</a></span>
        </header>
        ${referenceOverviewView.renderButton({
          kind: "pywin32-essentials",
          title: "pywin32 essentials",
          summary: "Installation, cleanup, errors, access rights, wrapper selection, and constants.",
        })}
        <div class="reference-filter sticky-filter">
          <input id="module-filter" type="search" value="${escapeHtml(filter)}" placeholder="Try: create process, named pipe, token privilege, VirtualAllocEx…" aria-label="Search the pywin32 guide" autocomplete="off" />
          <span class="reference-count">${modules.length} modules · ${featureCount} entries</span>
        </div>
        <section class="reference-list" id="reference-list" aria-live="polite">
          ${modules.length ? modules.map((module) => pywin32ModuleCard(module, query)).join("") : '<div class="search-empty">No exact entry found. Try the Windows object, outcome, module, API, or constant name.</div>'}
        </section>
      </div>`;
    document.querySelector("#module-filter").addEventListener("input", (event) => updatePywin32Results(event.target.value));
    if (openFeature) {
      const match = referenceData.pywin32Modules.flatMap((module) => module.features.map((feature) => ({ module, feature }))).find((item) => item.feature.name.toLowerCase() === openFeature.toLowerCase());
      if (match) window.setTimeout(() => openApiDetails(match.module.name, match.feature.name), 0);
    }
  }

  function updatePywin32Results(filter) {
    const query = filter.trim().toLowerCase();
    const modules = referenceData.pywin32Modules.filter((module) => matchingFeatures(module, query).length);
    const featureCount = modules.reduce((count, module) => count + matchingFeatures(module, query).length, 0);
    document.querySelector("#reference-list").innerHTML = modules.length ? modules.map((module) => pywin32ModuleCard(module, query)).join("") : '<div class="search-empty">No exact entry found. Try the Windows object, outcome, module, API, or constant name.</div>';
    document.querySelector(".reference-count").textContent = `${modules.length} modules · ${featureCount} entries`;
  }

  function renderWindowsApiGuide(filter = "") {
    main.innerHTML = windowsApiView.render(windowsApiGuide, filter);
    document.querySelector("#windows-api-filter").addEventListener("input", (event) => {
      const matches = windowsApiView.filterFamilies(windowsApiGuide.families, event.target.value);
      document.querySelector("#windows-api-results").innerHTML = windowsApiView.renderEntries(matches, Boolean(event.target.value.trim()));
      document.querySelector("#windows-api-count").textContent = `${matches.length} ${matches.length === 1 ? "Family" : "Families"}`;
    });
    const normalized = filter.trim().toLowerCase();
    const exact = windowsApiView.filterFamilies(windowsApiGuide.families, filter).find(({ family, selectedVariant }) => (
      selectedVariant.toLowerCase() === normalized || family.aliases.some((alias) => alias.name.toLowerCase() === normalized)
    ));
    if (exact) window.setTimeout(() => openWindowsApiDetails(exact.family.id, exact.selectedVariant), 0);
  }

  function manualList(items) {
    return `<ol class="manual-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
  }

  function toolManual(tool, query) {
    return `
      <details class="tool-manual" style="--reference-color: var(--${toolboxAccent(tool.category)})" ${query ? "open" : ""}>
        <summary>
          <span><code>${escapeHtml(tool.exe)}</code><strong>${escapeHtml(tool.name)}</strong><small>${escapeHtml(tool.short)}</small></span>
          <span class="api-summary-meta"><span class="reference-category">${escapeHtml(tool.category)}</span><span class="entry-count">${tool.capabilities.length} capabilities</span><span class="details-chevron">⌄</span></span>
        </summary>
        <div class="tool-manual-body">
          <div class="tool-intro"><p>${escapeHtml(tool.description)}</p><div class="api-context"><span>${escapeHtml(tool.category)}</span><span>Course: ${escapeHtml(tool.modules)}</span></div></div>
          <section class="manual-section"><h2>Start here</h2>${manualList(tool.firstSteps)}</section>
          <section class="manual-section"><h2>What it can answer</h2><div class="capability-list">${tool.capabilities.map(([name, detail]) => `<div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(detail)}</span></div>`).join("")}</div></section>
          <section class="manual-section"><h2>Repeatable workflow</h2>${manualList(tool.workflow)}</section>
          ${(tool.commands || []).length ? `<section class="manual-section"><h2>Useful commands</h2><div class="command-list">${tool.commands.map(([command, detail]) => `<div><code>${escapeHtml(command)}</code><span>${escapeHtml(detail)}</span></div>`).join("")}</div></section>` : ""}
          <section class="manual-section"><h2>Use it in the practices</h2><ul class="manual-list">${tool.practice.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <aside class="caution-box"><strong>Be careful</strong><ul>${tool.cautions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></aside>
          <a class="official-link" href="${tool.source}" target="_blank" rel="noreferrer">Official ${escapeHtml(tool.name)} documentation ↗</a>
        </div>
      </details>`;
  }

  function toolboxMatches(tool, query) {
    return !query || containsEveryToken(JSON.stringify(tool), query);
  }

  function renderToolbox(filter = "") {
    const query = filter.trim().toLowerCase();
    const tools = referenceData.sysinternalsTools.filter((tool) => toolboxMatches(tool, query));
    main.innerHTML = `
      <div class="content-wrap reference-width">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>Sysinternals toolbox</span></div>
        <header class="reference-hero compact-reference-hero">
          <h1>Choose the right view into Windows.</h1>
          <span class="source-note">Cross-checked with <a href="https://learn.microsoft.com/en-us/sysinternals/downloads/" target="_blank" rel="noreferrer">Microsoft Sysinternals documentation ↗</a></span>
        </header>
        <div class="reference-filter sticky-filter">
          <input id="tool-filter" type="search" value="${escapeHtml(filter)}" placeholder="Try: find a DLL, trace file access, inspect memory, discover a pipe…" aria-label="Search the Sysinternals toolbox" autocomplete="off" />
          <span class="reference-count">${tools.length} tools</span>
        </div>
        <section class="tool-manuals" id="tool-list" aria-live="polite">
          ${tools.length ? tools.map((tool) => toolManual(tool, query)).join("") : '<div class="search-empty">No matching tool. Try the artifact, symptom, question, command, or tool name.</div>'}
        </section>
      </div>`;
    document.querySelector("#tool-filter").addEventListener("input", (event) => {
      const nextQuery = event.target.value.trim().toLowerCase();
      const matches = referenceData.sysinternalsTools.filter((tool) => toolboxMatches(tool, nextQuery));
      document.querySelector("#tool-list").innerHTML = matches.length ? matches.map((tool) => toolManual(tool, nextQuery)).join("") : '<div class="search-empty">No matching tool. Try the artifact, symptom, question, command, or tool name.</div>';
      document.querySelector(".reference-count").textContent = `${matches.length} tools`;
    });
  }

  function route() {
    if (apiDialog.open) apiDialog.close();
    const hash = window.location.hash || "#/";
    const [path, queryString = ""] = hash.replace(/^#\//, "").split("?");
    const parts = path.split("/");
    const params = new URLSearchParams(queryString);
    const root = parts[0];

    if (root === "module") renderModule(parts[1]);
    else if (root === "lessons") renderLessons();
    else if (root === "lesson") renderLesson(parts[1]);
    else if (root === "review") renderModuleReview(parts[1]);
    else if (root === "assessment" && parts[1] === "final") renderFinalAssessment();
    else if (root === "reference" && parts[1] === "pywin32") renderPywin32(params.get("q") || "", params.get("api") || "");
    else if (root === "reference" && parts[1] === "windows-api") renderWindowsApiGuide(params.get("q") || "");
    else if (root === "toolbox") renderToolbox(params.get("q") || "");
    else renderHome();

    updateActiveNav(root, parts[1]);
    wireInPageLinks();
    closeSidebar();
    if (!hash.includes("#")) window.scrollTo(0, 0);
    else window.scrollTo({ top: 0, behavior: "instant" });
    main.focus({ preventScroll: true });
  }

  function updateActiveNav(root, referencePage = "") {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
      item.removeAttribute("aria-current");
    });
    const key = root === "reference" ? (referencePage === "windows-api" ? "windows-api" : "pywin32") : ["module", "review", "assessment"].includes(root) ? "home" : root || "home";
    const activeItem = document.querySelector(`[data-route="${key}"]`);
    activeItem?.classList.add("active");
    activeItem?.setAttribute("aria-current", "page");
  }

  function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function parameterRole(name, type) {
    const value = name.toLowerCase();
    if (/^(h|handle)/.test(value) || value.includes("handle")) return "Handle identifying the Windows object used by this call.";
    if (value === "pid" || value.includes("processid")) return "Numeric process identifier.";
    if (value.includes("access") || value.startsWith("dwdesired")) return "Integer access mask built from the relevant constants.";
    if (value.includes("flags") || value === "flag") return "Integer bitmask that changes the operation's behavior.";
    if (value.startsWith("b") && type.includes("bool")) return "Boolean switch controlling this option.";
    if (value.includes("callback") || value.includes("function") || value.includes("entrypoint")) return "Callable or native function address invoked by the API.";
    if (value.includes("attributes") || value === "sa") return "Security attributes object, often None when defaults are acceptable.";
    if (value.includes("buffer") || value.includes("data") || value === "buf") return "Input or output storage whose ownership and size must remain valid for the call.";
    if (value.includes("size") || value.includes("length") || value.includes("count")) return "Number of bytes or items, as defined by this API.";
    if (value.includes("name") || value.includes("path") || value.includes("directory") || value.includes("commandline")) return "String naming the target, path, or command input.";
    if (value.includes("timeout")) return "Wait duration in milliseconds, with the API's documented infinite value when supported.";
    if (value.includes("address") || value.includes("pointer")) return "Pointer-sized address. Match the target process architecture.";
    return "Value passed to the wrapper using the displayed Python type.";
  }

  function returnMeaning(type) {
    const value = type.toLowerCase();
    if (value === "none") return "Returns no Python value after successful completion.";
    if (value.includes("pyhandle") || value.includes("handle")) return "Returns a Windows handle. Close an owned handle with its documented matching close function.";
    if (value.includes("tuple")) return "Returns a tuple. The type arguments show the order and Python type of each item.";
    if (value.includes("list") || value.includes("sequence")) return "Returns a Python collection containing the requested records or handles.";
    if (value.includes("bool")) return "Returns True or False. For ctypes calls, a false value commonly indicates failure and requires a last-error check.";
    if (value.includes("bytes")) return "Returns immutable Python bytes containing the requested binary data.";
    if (value.includes("str")) return "Returns a Python Unicode string.";
    if (value.includes("int")) return "Returns a Python integer representing an identifier, count, status, bitmask, address, or native scalar as described above.";
    if (value.includes("object")) return "The maintained stub does not narrow this value further. Inspect the documented shape before relying on individual fields.";
    return "Returns the displayed Python or pywin32 wrapper type.";
  }

  function displaySignature(signature) {
    const parameters = signature.parameters.map((parameter) => `${parameter.name}: ${parameter.type}${parameter.optional ? " = ..." : ""}`).join(", ");
    return `${signature.name}(${parameters}) -> ${signature.returns}`;
  }

  function conceptType(module, feature) {
    if (module.name === "winerror") return "int error-code constant";
    if (module.name === "win32con" || feature.name.startsWith("KEY_")) return "int flag, mask, or constant";
    if (/error|com_error/.test(feature.name)) return "exception class";
    if (/HANDLE|OVERLAPPED|ATTRIBUTES|DESCRIPTOR|SID|Time|IID|ACL|Framework|Structure|Union/.test(feature.name)) return "class or wrapper object";
    if (/argtypes|restype|errcheck/.test(feature.name)) return "ctypes function attribute";
    if (/wintypes|c_byte|c_void_p/.test(feature.name)) return "ctypes native type or type alias";
    return "Windows API concept or configuration value";
  }

  function resultHandlingGuide(module, feature, hasSignatures) {
    if (!hasSignatures && module.name !== "winerror") return "";

    if (module.name === "winerror") {
      return `
        <details class="result-guide">
          <summary><span><strong>How to use this error code</strong><small>Open for a practical exception example</small></span><span class="details-chevron">⌄</span></summary>
          <div class="result-guide-body">
            <p>Compare this constant with <code>error.winerror</code> when you want to handle this one Windows error differently. Re-raise errors you did not expect.</p>
            <pre><code>${escapeHtml(`import pywintypes
import winerror

try:
    result = some_win32_call()
except pywintypes.error as error:
    if error.winerror == winerror.${feature.name}:
        print("Handled the expected condition")
    else:
        raise`)}</code></pre>
          </div>
        </details>`;
    }

    const isWait = module.name === "win32event" && feature.name.startsWith("Wait");
    if (isWait) {
      return `
        <details class="result-guide">
          <summary><span><strong>How to handle wait results</strong><small>Open for WAIT_OBJECT_0, timeout, and abandoned-mutex examples</small></span><span class="details-chevron">⌄</span></summary>
          <div class="result-guide-body">
            <p>A wait completing normally does not always mean the object was signalled. Compare the returned status with the documented <code>WAIT_*</code> constants, then handle every state your program permits.</p>
            <pre><code>${escapeHtml(`result = win32event.WaitForSingleObject(handle, 1_000)

if result == win32event.WAIT_OBJECT_0:
    print("The object was signalled")
elif result == win32event.WAIT_TIMEOUT:
    print("Nothing was signalled within one second")
elif result == win32event.WAIT_ABANDONED:
    # Applies when waiting for a mutex.
    # You own it now, but the previous owner exited unexpectedly.
    repair_or_discard_shared_state()
else:
    raise RuntimeError(f"Unexpected wait result: {result}")`)}</code></pre>
            <div class="result-note"><strong>Why timeout is not an exception</strong><span>The wait function worked correctly. It is reporting that its time limit expired. An invalid handle or an actual API failure can still raise <code>pywintypes.error</code>.</span></div>
          </div>
        </details>`;
    }

    const isCtypes = module.name.startsWith("ctypes") || feature.detail.toLowerCase().includes("through ctypes");
    if (isCtypes) {
      return `
        <details class="result-guide">
          <summary><span><strong>How to check this ctypes call</strong><small>Open for return-value and last-error handling</small></span><span class="details-chevron">⌄</span></summary>
          <div class="result-guide-body">
            <p>ctypes knows the native return type, but it does not automatically know which value means failure. Check the sentinel documented for the function immediately after the call.</p>
            <pre><code>${escapeHtml(`success = function(...)

if not success:
    error_code = ctypes.get_last_error()
    raise ctypes.WinError(error_code)`)}</code></pre>
            <div class="result-note"><strong>Important</strong><span>Some APIs use <code>NULL</code>, zero, or <code>INVALID_HANDLE_VALUE</code> for failure. Use the specific rule documented for the selected function rather than assuming every ctypes call uses <code>False</code>.</span></div>
          </div>
        </details>`;
    }

    if (module.name.startsWith("winreg")) {
      return `
        <details class="result-guide">
          <summary><span><strong>How to handle a Registry error</strong><small>Open for missing-key and access-denied examples</small></span><span class="details-chevron">⌄</span></summary>
          <div class="result-guide-body">
            <p><code>winreg</code> uses Python's standard <code>OSError</code> subclasses. Catch a narrow exception when that outcome is expected, and let other failures surface.</p>
            <pre><code>${escapeHtml(`try:
    result = winreg.${feature.name}(...)
except FileNotFoundError:
    print("The Registry key or value does not exist")
except PermissionError:
    print("The requested Registry access was denied")`)}</code></pre>
          </div>
        </details>`;
    }

    if (module.name.startsWith("win32com")) {
      return `
        <details class="result-guide">
          <summary><span><strong>How to handle a COM error</strong><small>Open for an HRESULT example</small></span><span class="details-chevron">⌄</span></summary>
          <div class="result-guide-body">
            <p>COM failures raise <code>pythoncom.com_error</code>. The HRESULT identifies the COM failure, while the exception may also contain source and description details.</p>
            <pre><code>${escapeHtml(`import pythoncom

try:
    result = ${feature.name}(...)
except pythoncom.com_error as error:
    print(f"HRESULT: 0x{error.hresult & 0xFFFFFFFF:08X}")
    print(error)
    raise`)}</code></pre>
          </div>
        </details>`;
    }

    const callableName = feature.name.split(" / ")[0].split(".").at(-1);
    const moduleName = module.name.split(" / ")[0].replace(" (standard library companion)", "");
    return `
      <details class="result-guide">
        <summary><span><strong>How to handle a pywin32 error</strong><small>Open for a try/except example</small></span><span class="details-chevron">⌄</span></summary>
        <div class="result-guide-body">
          <p>Most pywin32 wrappers raise <code>pywintypes.error</code> instead of returning an invalid result. Handle errors you expect and can recover from. Re-raise unexpected errors.</p>
          <pre><code>${escapeHtml(`import pywintypes
import winerror

try:
    result = ${moduleName}.${callableName}(...)
except pywintypes.error as error:
    if error.winerror == winerror.ERROR_ACCESS_DENIED:
        print("The operation needs different access rights")
    else:
        raise`)}</code></pre>
          <div class="result-note"><strong>Useful fields</strong><span><code>error.winerror</code> is the numeric Windows code, <code>error.funcname</code> identifies the failed function, and <code>error.strerror</code> contains readable text.</span></div>
        </div>
      </details>`;
  }

  function showApiDialog(resetScroll = true) {
    apiDetailContent.querySelector(".api-dialog-close").addEventListener("click", () => apiDialog.close());
    if (!apiDialog.open) {
      if (document.activeElement && !apiDialog.contains(document.activeElement)) apiDialogInvoker = document.activeElement;
      apiDialog.showModal();
    }
    if (resetScroll) apiDialog.scrollTop = 0;
    apiDetailContent.querySelector(".api-dialog-close")?.focus({ preventScroll: true });
  }

  function renderPywin32ParameterChoices(moduleName, signature, signatureIndex, parameter, parameterIndex) {
    const bindingKey = `${moduleName}::${signature.name}#${signatureIndex}.${parameter.name}`;
    const resolved = window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveParameterChoices(bindingKey, "pywin32");
    return windowsApiView.renderParameterChoices(resolved, `pywin32-${moduleName}-${signature.name}-${signatureIndex}-${parameterIndex}`);
  }

  function openApiDetails(moduleName, featureName) {
    const module = referenceData.pywin32Modules.find((item) => item.name === moduleName);
    const feature = module?.features.find((item) => item.name === featureName);
    if (!module || !feature) return;
    const detail = apiSignatures[`${moduleName}::${featureName}`];
    const signatures = detail?.signatures || [];
    apiDetailContent.innerHTML = `
      <header class="api-dialog-head">
        <div><span>${escapeHtml(module.name)}</span><h2 id="api-detail-title">${escapeHtml(feature.name)}</h2><p>${escapeHtml(feature.task)}</p></div>
        <button class="api-dialog-close" type="button" aria-label="Close API details">×</button>
      </header>
      <div class="api-dialog-body">
        <section class="api-dialog-summary"><p>${escapeHtml(feature.detail)}</p></section>
        ${signatures.length ? signatures.map((signature, index) => `
          <section class="signature-block">
            ${signatures.length > 1 ? `<h3>${escapeHtml(signature.name)}${index > 0 && signature.name === signatures[index - 1]?.name ? `, overload ${index + 1}` : ""}</h3>` : ""}
            <pre><code>${escapeHtml(displaySignature(signature))}</code></pre>
            <h3>Parameters</h3>
            ${signature.parameters.length ? `<div class="parameter-list">${signature.parameters.map((parameter, parameterIndex) => `<div><code>${escapeHtml(parameter.name)}</code><span class="parameter-type">${escapeHtml(parameter.type)}</span><div class="parameter-description">${parameter.optional ? "Optional. " : "Required. "}${escapeHtml(parameter.description || parameterRole(parameter.name, parameter.type))}${renderPywin32ParameterChoices(module.name, signature, index, parameter, parameterIndex)}</div></div>`).join("")}</div>` : '<p class="no-parameters">This function takes no parameters.</p>'}
            <h3>Output</h3>
            <div class="return-card"><code>${escapeHtml(signature.returns)}</code><span>${escapeHtml(returnMeaning(signature.returns))}</span></div>
          </section>`).join("") : `
          <section class="signature-block concept-detail">
            <h3>Value type</h3>
            <div class="return-card"><code>${escapeHtml(conceptType(module, feature))}</code><span>This entry is a concept, constant, attribute, structure, or wrapper rather than a directly callable function, so function parameters and a return value do not apply.</span></div>
          </section>`}
        ${resultHandlingGuide(module, feature, Boolean(signatures.length))}
        ${detail?.sources?.length ? `<div class="api-source-links">${detail.sources.map((source, index) => `<a href="${source}" target="_blank" rel="noreferrer">${index ? "Additional type source" : "Type signature source"} ↗</a>`).join("")}</div>` : ""}
      </div>`;
    showApiDialog();
  }

  function renderWindowsApiDetails(family, variantName, preserveScroll = false) {
    const scrollTop = apiDialog.scrollTop;
    apiDetailContent.innerHTML = windowsApiView.renderDialog(family, variantName);
    showApiDialog(!preserveScroll);
    if (preserveScroll) apiDialog.scrollTop = scrollTop;
    if (preserveScroll) apiDetailContent.querySelector(`[data-api-variant="${CSS.escape(variantName)}"]`)?.focus({ preventScroll: true });
  }

  function openWindowsApiDetails(familyId, variantName) {
    const family = windowsApiGuide.families.find((item) => item.id === familyId);
    if (!family) return;
    openWindowsApiFamilyId = familyId;
    renderWindowsApiDetails(family, window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveSelection(family, variantName));
  }

  function openReferenceOverview(kind) {
    apiDetailContent.innerHTML = referenceOverviewView.renderDialog(kind, {
      mappings: windowsApiGuide.typeMappings,
      patterns: referenceData.pywin32Patterns,
    });
    showApiDialog();
  }

  function wireInPageLinks() {
    document.querySelectorAll("[data-scroll-target]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.getElementById(link.dataset.scrollTarget);
        if (!target) return;
        event.preventDefault();
        link.closest(".mobile-lesson-sections")?.removeAttribute("open");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function isMobileSidebar() {
    return window.matchMedia("(max-width: 780px)").matches;
  }

  function setMobileDrawerBackgroundInert(inert) {
    mobileDrawerBackground.forEach((element) => {
      element.inert = inert;
    });
  }

  function openSidebar() {
    sidebar.classList.add("open");
    scrim.classList.add("visible");
    menuButton.setAttribute("aria-expanded", "true");
    if (!isMobileSidebar()) return;
    setMobileDrawerBackgroundInert(true);
    sidebar.tabIndex = -1;
    sidebar.focus();
  }

  function closeSidebar({ restoreFocus = false } = {}) {
    const restoreMobileMenuFocus = restoreFocus && isMobileSidebar() && sidebar.classList.contains("open");
    sidebar.classList.remove("open");
    scrim.classList.remove("visible");
    menuButton.setAttribute("aria-expanded", "false");
    setMobileDrawerBackgroundInert(false);
    if (restoreMobileMenuFocus) menuButton.focus();
  }

  function setSidebarCollapsed(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    sidebarToggle.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    sidebarToggle.setAttribute("title", collapsed ? "Expand sidebar" : "Collapse sidebar");
    sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    try {
      localStorage.setItem("iloveos-sidebar-collapsed", String(collapsed));
    } catch (_) {
      // The layout still works when storage is unavailable.
    }
  }

  function setContentSize(size, persist = true) {
    const selectedSize = ["small", "default", "large"].includes(size) ? size : "default";
    document.documentElement.dataset.contentSize = selectedSize;
    sizeOptions.forEach((option) => {
      option.setAttribute("aria-pressed", String(option.dataset.contentSize === selectedSize));
    });
    if (!persist) return;
    try {
      localStorage.setItem("iloveos-content-size", selectedSize);
    } catch (_) {
      // The setting still applies for the current visit when storage is unavailable.
    }
  }

  function setSettingsOpen(open) {
    settingsPanel.hidden = !open;
    settingsTrigger.setAttribute("aria-expanded", String(open));
    if (open) settingsClose.focus();
  }

  function allSearchItems() {
    return [
      ...data.modules.map((item) => ({ title: item.title, detail: item.description, kind: "Module", scope: "lessons", href: `#/module/${item.id}` })),
      ...assessments.moduleReviews.map((review) => {
        const module = data.modules.find((item) => item.id === review.module);
        return {
          title: review.title,
          detail: `${module?.title || review.module} \u00b7 ${review.summary}`,
          searchText: JSON.stringify(review.activities),
          kind: "Module review",
          scope: "assessments",
          href: `#/review/${review.module}`
        };
      }),
      ...(assessments.finalAssessment ? [{
        title: assessments.finalAssessment.title,
        detail: assessments.finalAssessment.summary,
        searchText: JSON.stringify({ questions: assessments.finalAssessment.questions, practical: assessments.finalAssessment.practical }),
        kind: "Final assessment",
        scope: "assessments",
        href: "#/assessment/final"
      }] : []),
      ...lessons.map((lesson) => {
        const module = data.modules.find((item) => item.id === lesson.module);
        const index = moduleLessons(lesson.module).indexOf(lesson);
        return {
          title: lesson.title,
          searchText: JSON.stringify({
            learning: lesson.learning,
            windowsLearning: lesson.windowsLearning,
            workedExamples: lesson.workedExamples,
            codeWalkthroughs: lesson.codeWalkthroughs,
            practice: lesson.practice,
            core: lesson.core,
            mechanics: lesson.mechanics,
            windows: lesson.windows
          }),
          detail: `${module.title} · Lesson ${index + 1} · ${lesson.lead} ${lesson.keys.join(" ")} ${lesson.apis.join(" ")}`,
          kind: "Lesson",
          scope: "lessons",
          href: `#/lesson/${lesson.id}`
        };
      }),
      ...referenceData.pywin32Modules.map((item) => ({ title: item.name, detail: `${item.label} · ${item.useWhen}`, kind: "pywin32 module", scope: "pywin32", href: `#/reference/pywin32?q=${encodeURIComponent(item.name)}` })),
      ...referenceData.pywin32Modules.flatMap((module) => module.features.map((feature) => ({
        title: feature.name,
        detail: `${module.name} · ${feature.task} · ${feature.detail}`,
        kind: "pywin32 API",
        scope: "pywin32",
        href: `#/reference/pywin32?q=${encodeURIComponent(feature.name)}&api=${encodeURIComponent(feature.name)}`
      }))),
      ...windowsApiGuide.families.flatMap((family) => family.variants.map((entry) => ({
        title: entry.name,
        detail: `${family.name} · ${entry.category} · ${entry.dll} · ${entry.summary}`,
        searchText: `${family.aliases.map((alias) => `${alias.name} ${alias.note}`).join(" ")} ${entry.nativeSignature} ${entry.python} ${entry.parameters.map((parameter) => `${parameter.name} ${parameter.native} ${parameter.python} ${parameter.explanation}`).join(" ")}`,
        kind: "Windows API",
        scope: "windows-api",
        href: `#/reference/windows-api?q=${encodeURIComponent(entry.name)}`
      }))),
      ...referenceData.sysinternalsTools.map((item) => ({ title: item.name, detail: `${item.short} · ${item.description}`, kind: "Tool", scope: "tools", href: `#/toolbox?q=${encodeURIComponent(item.name)}` })),
      ...referenceData.sysinternalsTools.flatMap((tool) => tool.capabilities.map(([name, detail]) => ({
        title: name,
        detail: `${tool.name} · ${detail}`,
        kind: "Tool capability",
        scope: "tools",
        href: `#/toolbox?q=${encodeURIComponent(name)}`
      })))
    ];
  }

  function selectedSearchScopes() {
    return new Set(searchFilterInputs.filter((input) => input.checked).map((input) => input.dataset.searchFilter));
  }

  function restoreSearchFilters() {
    let selected = defaultSearchScopes;
    try {
      const stored = JSON.parse(localStorage.getItem(searchFilterStorageKey));
      if (stored?.version === searchFilterVersion && Array.isArray(stored.scopes) && stored.scopes.every((scope) => defaultSearchScopes.includes(scope))) {
        selected = stored.scopes;
      }
    } catch (_) {
      // All categories remain enabled when storage is unavailable or malformed.
    }
    const selectedSet = new Set(selected);
    searchFilterInputs.forEach((input) => { input.checked = selectedSet.has(input.dataset.searchFilter); });
  }

  function persistSearchFilters() {
    try {
      localStorage.setItem(searchFilterStorageKey, JSON.stringify({
        version: searchFilterVersion,
        scopes: [...selectedSearchScopes()]
      }));
    } catch (_) {
      // Filtering still works for the current visit when storage is unavailable.
    }
  }

  function updateSearch(query = "") {
    const term = query.trim().toLowerCase();
    const tokens = term.split(/\s+/).filter(Boolean);
    const selectedScopes = selectedSearchScopes();
    const score = (item) => {
      const title = item.title.toLowerCase();
      const kind = item.kind.toLowerCase();
      const detail = item.detail.toLowerCase();
      let value = title === term ? 1000 : title.startsWith(term) ? 600 : title.includes(term) ? 400 : 0;
      if (kind === term) value += 250;
      else if (kind.includes(term)) value += 120;
      if (detail.includes(term)) value += 100;
      for (const token of tokens) {
        if (title.includes(token)) value += 45;
        if (kind.includes(token)) value += 20;
        if (detail.includes(token)) value += 10;
      }
      return value;
    };
    const items = allSearchItems()
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => selectedScopes.has(item.scope))
      .filter(({ item }) => !term || containsEveryToken(`${item.title} ${item.detail} ${item.kind} ${item.searchText || ""}`, term))
      .sort((left, right) => score(right.item) - score(left.item) || left.index - right.index)
      .slice(0, 10)
      .map(({ item }) => item);
    if (selectedScopes.size === 0) {
      searchResults.innerHTML = '<div class="search-empty">Select at least one category to search.</div>';
      return;
    }
    searchResults.innerHTML = items.length ? items.map((item) => `
      <a class="search-result" href="${item.href}">
        <span><strong>${item.title}</strong><small>${item.detail}</small></span>
        <span class="search-kind">${item.kind}</span>
      </a>`).join("") : '<div class="search-empty">No matches in the selected categories.</div>';
  }

  function openSearch() {
    searchInput.value = "";
    updateSearch();
    searchDialog.showModal();
    window.setTimeout(() => searchInput.focus(), 20);
  }

  menuButton.addEventListener("click", () => sidebar.classList.contains("open") ? closeSidebar({ restoreFocus: true }) : openSidebar());
  sidebarToggle.addEventListener("click", () => setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed")));
  scrim.addEventListener("click", () => closeSidebar({ restoreFocus: true }));
  document.querySelector("#search-trigger").addEventListener("click", openSearch);
  document.querySelector("#search-close").addEventListener("click", () => searchDialog.close());
  settingsTrigger.addEventListener("click", () => setSettingsOpen(settingsPanel.hidden));
  settingsClose.addEventListener("click", () => {
    setSettingsOpen(false);
    settingsTrigger.focus();
  });
  settingsPanel.addEventListener("click", (event) => {
    const option = event.target.closest("[data-content-size]");
    if (option) setContentSize(option.dataset.contentSize);
  });
  searchInput.addEventListener("input", () => updateSearch(searchInput.value));
  searchFilters.addEventListener("change", (event) => {
    if (!event.target.matches("[data-search-filter]")) return;
    persistSearchFilters();
    updateSearch(searchInput.value);
  });
  searchResults.addEventListener("click", () => searchDialog.close());
  main.addEventListener("click", (event) => {
    const overviewTrigger = event.target.closest("[data-reference-overview]");
    if (overviewTrigger) {
      apiDialogInvoker = overviewTrigger;
      openReferenceOverview(overviewTrigger.dataset.referenceOverview);
      return;
    }
    const trigger = event.target.closest(".api-detail-trigger");
    if (!trigger) return;
    apiDialogInvoker = trigger;
    if (trigger.dataset.windowsApiFamily) openWindowsApiDetails(trigger.dataset.windowsApiFamily, trigger.dataset.windowsApiVariant);
    else openApiDetails(trigger.dataset.apiModule, trigger.dataset.apiFeature);
  });
  async function copyApiValue(button) {
    const row = button.closest(".api-choice-row");
    const status = row?.querySelector("[data-api-value-status]");
    const code = row?.querySelector("[data-api-value-code]");
    if (!status || !code) return;
    status.textContent = "";
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(button.dataset.apiValueCode);
      status.textContent = "Copied";
    } catch (_) {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Value selected. Press Ctrl+C to copy.";
    }
  }
  apiDialog.addEventListener("click", (event) => {
    if (event.target === apiDialog) apiDialog.close();
    const copyControl = event.target.closest("[data-copy-api-value]");
    if (copyControl) {
      copyApiValue(copyControl);
      return;
    }
    const variant = event.target.closest("[data-api-variant]");
    if (!variant) return;
    const family = windowsApiGuide.families.find((item) => item.id === openWindowsApiFamilyId);
    if (family) renderWindowsApiDetails(family, variant.dataset.apiVariant, true);
  });
  apiDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    const invoker = apiDialogInvoker;
    apiDialog.close();
    if (invoker?.isConnected) invoker.focus({ preventScroll: true });
  });
  apiDialog.addEventListener("close", () => {
    const invoker = apiDialogInvoker;
    if (invoker?.isConnected) window.setTimeout(() => invoker.focus({ preventScroll: true }), 0);
    apiDialogInvoker = null;
  });
  apiDialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      const invoker = apiDialogInvoker;
      apiDialog.close();
      if (invoker?.isConnected) invoker.focus({ preventScroll: true });
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...apiDialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (first && (focusable.length === 1 || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
      return;
    }
    const currentTab = event.target.closest("[data-api-variant]");
    if (!currentTab || !currentTab.closest('[role="tablist"]')) return;
    const tabs = [...currentTab.closest('[role="tablist"]').querySelectorAll("[data-api-variant]")];
    const currentIndex = tabs.indexOf(currentTab);
    const keys = { ArrowRight: 1, ArrowLeft: -1 };
    let nextIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else if (event.key in keys) nextIndex = (currentIndex + keys[event.key] + tabs.length) % tabs.length;
    else return;
    event.preventDefault();
    const family = windowsApiGuide.families.find((item) => item.id === openWindowsApiFamilyId);
    if (family) renderWindowsApiDetails(family, tabs[nextIndex].dataset.apiVariant, true);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && apiDialog.open) {
      event.preventDefault();
      const invoker = apiDialogInvoker;
      apiDialog.close();
      if (invoker?.isConnected) invoker.focus({ preventScroll: true });
      return;
    }
    if (event.key === "Escape" && sidebar.classList.contains("open") && isMobileSidebar()) {
      event.preventDefault();
      closeSidebar({ restoreFocus: true });
      return;
    }
    if (event.key === "Escape" && !settingsPanel.hidden) {
      setSettingsOpen(false);
      settingsTrigger.focus();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });
  document.addEventListener("click", (event) => {
    if (!settingsPanel.hidden && !event.target.closest(".settings-control")) setSettingsOpen(false);
  });
  window.addEventListener("resize", () => {
    if (!isMobileSidebar() && sidebar.classList.contains("open")) closeSidebar();
  });
  window.addEventListener("hashchange", route);
  try {
    setSidebarCollapsed(localStorage.getItem("iloveos-sidebar-collapsed") === "true");
  } catch (_) {
    setSidebarCollapsed(false);
  }
  try {
    setContentSize(localStorage.getItem("iloveos-content-size") || "default", false);
  } catch (_) {
    setContentSize("default", false);
  }
  restoreSearchFilters();
  route();
})();
