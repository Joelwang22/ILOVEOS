(function () {
  "use strict";

  const data = window.ILOVEOS_DATA;
  const main = document.querySelector("#main-content");
  const sidebar = document.querySelector("#sidebar");
  const scrim = document.querySelector("#sidebar-scrim");
  const menuButton = document.querySelector("#menu-button");
  const sidebarToggle = document.querySelector("#sidebar-toggle");
  const searchDialog = document.querySelector("#search-dialog");
  const searchInput = document.querySelector("#search-input");
  const searchResults = document.querySelector("#search-results");

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
          <p class="hero-lead">
            A clear, practical path from processes and memory to security, IPC, and hooking—taught with Python, the Win32 API, and the tools that let you see the operating system at work.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="#/lesson/os-foundations">Start the first lesson ${icons.arrow}</a>
            <a class="button" href="#/lessons">View all lessons</a>
          </div>
        </section>

        <section class="principle-grid" aria-label="How lessons work">
          <article class="principle">
            <span class="principle-number">01</span>
            <h3>Build the model</h3>
            <p>Start with a visual explanation of the mechanism and the problem it exists to solve.</p>
          </article>
          <article class="principle">
            <span class="principle-number">02</span>
            <h3>Inspect Windows</h3>
            <p>Use Sysinternals to connect abstract ideas to live processes, objects, memory, and events.</p>
          </article>
          <article class="principle">
            <span class="principle-number">03</span>
            <h3>Control it with Python</h3>
            <p>Reach Windows through pywin32 first, then use ctypes when the lower-level details matter.</p>
          </article>
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
      <div class="content-wrap">
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
              <p>When an application needs a protected operation—such as opening a file—it calls a Windows API. If kernel work is required, that request eventually crosses the boundary through a system call. Windows checks the request and performs the operation on the application's behalf.</p>
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
                  <span class="lab-time">10–15 min</span>
                </div>
                <div class="lab-body">
                  <ol>
                    <li>Before running the script, predict where its process will appear and which process will be its parent.</li>
                    <li>Open Process Explorer and enable the <strong>Process ID</strong> column.</li>
                    <li>Run the script from a terminal and keep it alive temporarily by adding <code>input()</code> at the end.</li>
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

  function renderPywin32(filter = "") {
    const query = filter.trim().toLowerCase();
    const filtered = data.pywin32.filter((item) => JSON.stringify(item).toLowerCase().includes(query));

    main.innerHTML = `
      <div class="content-wrap narrow">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>Reference</span></div>
        <header class="reference-hero">
          <h1>pywin32, explained by purpose.</h1>
          <p>The official-style index tells you what exists. This guide tells you why you would use it, how the modules fit together, and where each one appears in the course.</p>
          <span class="source-note">Coverage informed by <a href="https://timgolden.me.uk/pywin32-docs/win32_modules.html" target="_blank" rel="noreferrer">Tim Golden's pywin32 module reference ↗</a></span>
        </header>

        <div class="reference-filter">
          <input id="module-filter" type="search" value="${escapeHtml(filter)}" placeholder="Filter by module, task, or API call" aria-label="Filter pywin32 modules" />
          <span class="reference-count">${filtered.length} modules</span>
        </div>
        <section class="reference-list" id="reference-list">
          ${filtered.length ? filtered.map(pywin32Card).join("") : '<div class="search-empty">No module matches that search.</div>'}
        </section>
      </div>`;

    const input = document.querySelector("#module-filter");
    input.addEventListener("input", () => updateReferenceList(input.value));
  }

  function updateReferenceList(filter) {
    const query = filter.trim().toLowerCase();
    const filtered = data.pywin32.filter((item) => JSON.stringify(item).toLowerCase().includes(query));
    document.querySelector("#reference-list").innerHTML = filtered.length ? filtered.map(pywin32Card).join("") : '<div class="search-empty">No module matches that search.</div>';
    document.querySelector(".reference-count").textContent = `${filtered.length} modules`;
  }

  function pywin32Card(item) {
    return `
      <article class="reference-card">
        <div class="reference-card-head">
          <div><code>${item.name}</code><h2>${item.label}</h2></div>
          <span class="lesson-tag">${item.lesson}</span>
        </div>
        <p>${item.description}</p>
        <p class="when-line"><strong>Reach for it when:</strong> ${item.useWhen}</p>
        <div class="call-chips">${item.calls.map((call) => `<span class="call-chip">${call}</span>`).join("")}</div>
      </article>`;
  }

  function renderToolbox() {
    main.innerHTML = `
      <div class="content-wrap">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>Toolbox</span></div>
        <header class="reference-hero">
          <h1>Use the right lens.</h1>
          <p>Each tool reveals a different part of Windows. The course introduces one only when it helps answer a concrete question.</p>
        </header>
        <section class="tool-grid">
          ${data.tools.map((tool, index) => `
            <article class="tool-card" ${accentStyle(tool.color, "--tool-color")}>
              <span class="tool-glyph">${String(index + 1).padStart(2, "0")}</span>
              <h2>${tool.name}</h2>
              <p class="tool-short">${tool.short}</p>
              <p>${tool.description}</p>
              <span class="tool-modules">Appears in modules ${tool.modules}</span>
            </article>`).join("")}
        </section>
      </div>`;
  }

  function route() {
    const hash = window.location.hash || "#/";
    const parts = hash.replace(/^#\//, "").split("/");
    const root = parts[0];

    if (root === "module") renderModule(parts[1]);
    else if (root === "lessons") renderLessons();
    else if (root === "lesson") renderLesson();
    else if (root === "reference" && parts[1] === "pywin32") renderPywin32();
    else if (root === "toolbox") renderToolbox();
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
      ...data.pywin32.map((item) => ({ title: item.name, detail: item.label, kind: "pywin32", href: "#/reference/pywin32" })),
      ...data.tools.map((item) => ({ title: item.name, detail: item.short, kind: "Tool", href: "#/toolbox" }))
    ];
  }

  function updateSearch(query = "") {
    const term = query.trim().toLowerCase();
    const items = allSearchItems().filter((item) => !term || `${item.title} ${item.detail} ${item.kind}`.toLowerCase().includes(term)).slice(0, 10);
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
