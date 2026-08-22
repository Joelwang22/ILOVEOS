(function () {
  "use strict";

  const data = window.ILOVEOS_DATA;
  const referenceData = window.ILOVEOS_REFERENCE;
  const apiSignatures = window.ILOVEOS_API_SIGNATURES || {};
  const main = document.querySelector("#main-content");
  const sidebar = document.querySelector("#sidebar");
  const scrim = document.querySelector("#sidebar-scrim");
  const menuButton = document.querySelector("#menu-button");
  const sidebarToggle = document.querySelector("#sidebar-toggle");
  const searchDialog = document.querySelector("#search-dialog");
  const searchInput = document.querySelector("#search-input");
  const searchResults = document.querySelector("#search-results");
  const apiDialog = document.querySelector("#api-detail-dialog");
  const apiDetailContent = document.querySelector("#api-detail-content");

  const icons = {
    arrow: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>',
    terminal: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 7 4 4-4 4m7 0h7"/></svg>'
  };

  function accentStyle(name, property = "--card-accent") {
    return `style="${property}: var(--${name})"`;
  }

  function renderHome() {
    main.innerHTML = `
      <div class="content-wrap">
        <section class="hero">
          <h1>Understand what Windows is actually doing.</h1>
          <div class="hero-actions">
            <a class="button primary" href="#/lesson/os-foundations">Start the first lesson ${icons.arrow}</a>
            <a class="button" href="#/lessons">View all lessons</a>
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
            <div class="hero-actions"><a class="button" href="#/reference/pywin32">Open the pywin32 guide ${icons.arrow}</a></div>
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
                  const isAvailable = module.id === "foundations" && index === 0;
                  const href = isAvailable ? "#/lesson/os-foundations" : `#/module/${module.id}`;
                  return `
                    <li>
                      <a class="lesson-index-row${isAvailable ? " is-available" : ""}" href="${href}">
                        <span class="lesson-sequence">${module.number}.${String(index + 1).padStart(2, "0")}</span>
                        <strong>${title}</strong>
                        <span class="lesson-availability${isAvailable ? " available" : ""}">${isAvailable ? "Read lesson" : "Module outline"}</span>
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
              ${module.id === "foundations" ? `<a class="button primary" href="#/lesson/os-foundations">Begin module ${icons.arrow}</a>` : `<span class="button" aria-disabled="true">Lesson content is next to be authored</span>`}
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
            <div class="outline-item">
              <span class="outline-number">${String(index + 1).padStart(2, "0")}</span>
              <strong>${lesson.title}</strong>
              <small>${lesson.type}</small>
            </div>`).join("")}
        </section>
      </div>`;
  }

  function renderLesson() {
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
          card.querySelectorAll(".quiz-option").forEach((item) => {
            item.disabled = true;
            if (item.dataset.option === answer) item.classList.add("correct");
          });
          if (option.dataset.option !== answer) option.classList.add("incorrect");
          feedback.classList.add("visible");
        });
      });
    });
  }

  function moduleSearchText(module) {
    return [module.name, module.category, module.label, module.description, module.useWhen, module.course, ...(module.constants || [])].join(" ").toLowerCase();
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
    return module.features.filter((feature) => containsEveryToken(`${moduleSearchText(module)} ${feature.name} ${feature.task} ${feature.detail}`, query));
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
            <div class="api-context"><span>${escapeHtml(module.category)}</span><span>${escapeHtml(module.course)}</span></div>
          </div>
          ${(module.constants || []).length ? `<div class="constant-strip"><strong>Constants you will meet</strong><div class="call-chips">${module.constants.map((constant) => `<code class="call-chip">${escapeHtml(constant)}</code>`).join("")}</div></div>` : ""}
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
        <section class="reference-patterns" aria-label="Patterns used throughout the guide">
          ${referenceData.pywin32Patterns.map((pattern) => `<details class="pattern-card"><summary>${escapeHtml(pattern.title)}<span>+</span></summary><p>${escapeHtml(pattern.summary)}</p><pre><code>${escapeHtml(pattern.code)}</code></pre></details>`).join("")}
        </section>
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
    else if (root === "lesson") renderLesson();
    else if (root === "reference" && parts[1] === "pywin32") renderPywin32(params.get("q") || "", params.get("api") || "");
    else if (root === "toolbox") renderToolbox(params.get("q") || "");
    else renderHome();

    updateActiveNav(root);
    wireInPageLinks();
    closeSidebar();
    if (!hash.includes("#")) window.scrollTo(0, 0);
    else window.scrollTo({ top: 0, behavior: "instant" });
    main.focus({ preventScroll: true });
  }

  function updateActiveNav(root) {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    const key = root === "reference" ? "pywin32" : root === "module" ? "home" : root || "home";
    document.querySelector(`[data-route="${key}"]`)?.classList.add("active");
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
        <section class="api-dialog-summary"><p>${escapeHtml(feature.detail)}</p><span>${escapeHtml(module.category)} · ${escapeHtml(module.course)}</span></section>
        ${signatures.length ? signatures.map((signature, index) => `
          <section class="signature-block">
            ${signatures.length > 1 ? `<h3>${escapeHtml(signature.name)}${index > 0 && signature.name === signatures[index - 1]?.name ? `, overload ${index + 1}` : ""}</h3>` : ""}
            <pre><code>${escapeHtml(displaySignature(signature))}</code></pre>
            <h3>Parameters</h3>
            ${signature.parameters.length ? `<div class="parameter-list">${signature.parameters.map((parameter) => `<div><code>${escapeHtml(parameter.name)}</code><span class="parameter-type">${escapeHtml(parameter.type)}</span><span>${parameter.optional ? "Optional. " : "Required. "}${escapeHtml(parameter.description || parameterRole(parameter.name, parameter.type))}</span></div>`).join("")}</div>` : '<p class="no-parameters">This function takes no parameters.</p>'}
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
    apiDetailContent.querySelector(".api-dialog-close").addEventListener("click", () => apiDialog.close());
    apiDialog.showModal();
  }

  function wireInPageLinks() {
    document.querySelectorAll("[data-scroll-target]").forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.getElementById(link.dataset.scrollTarget);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function openSidebar() {
    sidebar.classList.add("open");
    scrim.classList.add("visible");
    menuButton.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    scrim.classList.remove("visible");
    menuButton.setAttribute("aria-expanded", "false");
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

  function allSearchItems() {
    return [
      ...data.modules.map((item) => ({ title: item.title, detail: item.description, kind: "Module", href: `#/module/${item.id}` })),
      ...data.modules.flatMap((module) => module.lessonTitles.map((title, index) => ({
        title,
        detail: `${module.title} · Lesson ${index + 1}`,
        kind: "Lesson",
        href: module.id === "foundations" && index === 0 ? "#/lesson/os-foundations" : "#/lessons"
      }))),
      ...referenceData.pywin32Modules.map((item) => ({ title: item.name, detail: `${item.label} · ${item.useWhen}`, kind: "pywin32 module", href: `#/reference/pywin32?q=${encodeURIComponent(item.name)}` })),
      ...referenceData.pywin32Modules.flatMap((module) => module.features.map((feature) => ({
        title: feature.name,
        detail: `${module.name} · ${feature.task} · ${feature.detail}`,
        kind: "pywin32 API",
        href: `#/reference/pywin32?q=${encodeURIComponent(feature.name)}&api=${encodeURIComponent(feature.name)}`
      }))),
      ...referenceData.sysinternalsTools.map((item) => ({ title: item.name, detail: `${item.short} · ${item.description}`, kind: "Tool", href: `#/toolbox?q=${encodeURIComponent(item.name)}` })),
      ...referenceData.sysinternalsTools.flatMap((tool) => tool.capabilities.map(([name, detail]) => ({
        title: name,
        detail: `${tool.name} · ${detail}`,
        kind: "Tool capability",
        href: `#/toolbox?q=${encodeURIComponent(name)}`
      })))
    ];
  }

  function updateSearch(query = "") {
    const term = query.trim().toLowerCase();
    const items = allSearchItems().filter((item) => !term || containsEveryToken(`${item.title} ${item.detail} ${item.kind}`, term)).slice(0, 10);
    searchResults.innerHTML = items.length ? items.map((item) => `
      <a class="search-result" href="${item.href}">
        <span><strong>${item.title}</strong><small>${item.detail}</small></span>
        <span class="search-kind">${item.kind}</span>
      </a>`).join("") : '<div class="search-empty">No matching lesson, module, or tool.</div>';
  }

  function openSearch() {
    searchInput.value = "";
    updateSearch();
    searchDialog.showModal();
    window.setTimeout(() => searchInput.focus(), 20);
  }

  menuButton.addEventListener("click", () => sidebar.classList.contains("open") ? closeSidebar() : openSidebar());
  sidebarToggle.addEventListener("click", () => setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed")));
  scrim.addEventListener("click", closeSidebar);
  document.querySelector("#search-trigger").addEventListener("click", openSearch);
  document.querySelector("#search-close").addEventListener("click", () => searchDialog.close());
  searchInput.addEventListener("input", () => updateSearch(searchInput.value));
  searchResults.addEventListener("click", () => searchDialog.close());
  main.addEventListener("click", (event) => {
    const trigger = event.target.closest(".api-detail-trigger");
    if (trigger) openApiDetails(trigger.dataset.apiModule, trigger.dataset.apiFeature);
  });
  apiDialog.addEventListener("click", (event) => {
    if (event.target === apiDialog) apiDialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
  });
  window.addEventListener("hashchange", route);
  try {
    setSidebarCollapsed(localStorage.getItem("iloveos-sidebar-collapsed") === "true");
  } catch (_) {
    setSidebarCollapsed(false);
  }
  route();
})();
