(() => {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);
  }

  function activitiesFor(page) {
    if (Array.isArray(page?.activities)) return page.activities;
    if (Array.isArray(page?.questions)) return page.questions;
    return [];
  }

  function validActivity(activity) {
    if (!activity || typeof activity !== "object" || typeof activity.id !== "string" || !activity.id || typeof activity.prompt !== "string") return false;
    if (activity.kind === "single") {
      return Array.isArray(activity.options)
        && activity.options.length >= 2
        && Number.isInteger(activity.answer)
        && activity.answer >= 0
        && activity.answer < activity.options.length;
    }
    if (activity.kind === "multiple") {
      return Array.isArray(activity.options)
        && activity.options.length >= 2
        && Array.isArray(activity.answers)
        && activity.answers.length > 0
        && new Set(activity.answers).size === activity.answers.length
        && activity.answers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer < activity.options.length);
    }
    if (activity.kind === "ordering") {
      if (!Array.isArray(activity.items) || activity.items.length < 2 || !Array.isArray(activity.answer)) return false;
      const itemIds = activity.items.map((item) => item?.id);
      return activity.items.every((item) => item && typeof item.id === "string" && item.id && typeof item.label === "string")
        && new Set(itemIds).size === itemIds.length
        && activity.answer.length === itemIds.length
        && new Set(activity.answer).size === activity.answer.length
        && activity.answer.every((itemId) => itemIds.includes(itemId));
    }
    return false;
  }

  function initialActivityState(activity) {
    const common = { completed: false, attempted: false, attempts: 0, latestAttemptCorrect: null, feedback: "", status: "neutral" };
    if (activity.kind === "single") return { ...common, selected: null, incorrect: [] };
    if (activity.kind === "multiple") return { ...common, selected: [] };
    if (activity.kind === "ordering") return { ...common, order: (activity.items || []).map((item) => item.id) };
    return common;
  }

  function createState(page) {
    return {
      activities: Object.fromEntries(activitiesFor(page).filter(validActivity).map((activity) => [activity.id, initialActivityState(activity)])),
      activeCaseId: Array.isArray(page?.cases) ? page.cases[0]?.id || "" : "",
      practicalReviewed: false,
      notes: {}
    };
  }

  function cloneState(state) {
    return {
      activities: Object.fromEntries(Object.entries(state.activities || {}).map(([id, activity]) => [id, {
        ...activity,
        incorrect: activity.incorrect ? [...activity.incorrect] : undefined,
        selected: Array.isArray(activity.selected) ? [...activity.selected] : activity.selected,
        order: activity.order ? [...activity.order] : undefined
      }])),
      activeCaseId: String(state.activeCaseId || ""),
      practicalReviewed: Boolean(state.practicalReviewed),
      notes: { ...(state.notes || {}) }
    };
  }

  function sameValues(left, right) {
    if (left.length !== right.length) return false;
    const sortedLeft = [...left].sort();
    const sortedRight = [...right].sort();
    return sortedLeft.every((value, index) => value === sortedRight[index]);
  }

  function restoreState(page, storageKey) {
    const fresh = createState(page);
    if (!storageKey) return fresh;
    try {
      const record = JSON.parse(localStorage.getItem(storageKey));
      if (![1, 2].includes(record?.version) || record.contentVersion !== (page?.version || 1) || !record.state || typeof record.state !== "object") return fresh;
      const saved = record.state;
      if (page?.cases?.some((caseFile) => caseFile.id === saved.activeCaseId)) fresh.activeCaseId = saved.activeCaseId;
      for (const activity of activitiesFor(page).filter(validActivity)) {
        const source = saved.activities?.[activity.id];
        const target = fresh.activities[activity.id];
        if (!source || typeof source !== "object") continue;
        target.attempts = Number.isInteger(source.attempts) && source.attempts >= 0 ? source.attempts : 0;
        target.attempted = Boolean(source.attempted || target.attempts);
        target.feedback = typeof source.feedback === "string" ? source.feedback : "";
        target.status = ["neutral", "incorrect", "correct"].includes(source.status) ? source.status : "neutral";
        if (activity.kind === "single") {
          target.incorrect = [...new Set((Array.isArray(source.incorrect) ? source.incorrect : []).filter((index) => Number.isInteger(index) && index >= 0 && index < activity.options.length && index !== activity.answer))];
          target.selected = Number.isInteger(source.selected) && source.selected >= 0 && source.selected < activity.options.length ? source.selected : null;
          target.completed = Boolean(source.completed && target.selected === activity.answer);
        } else if (activity.kind === "multiple") {
          target.selected = [...new Set((Array.isArray(source.selected) ? source.selected : []).filter((index) => Number.isInteger(index) && index >= 0 && index < activity.options.length))];
          target.completed = Boolean(source.completed && sameValues(target.selected, activity.answers));
        } else if (activity.kind === "ordering") {
          const itemIds = activity.items.map((item) => item.id);
          const savedOrder = Array.isArray(source.order) ? source.order : [];
          target.order = savedOrder.length === itemIds.length && sameValues(savedOrder, itemIds) ? [...savedOrder] : [...itemIds];
          target.completed = Boolean(source.completed && target.order.every((item, index) => item === activity.answer[index]));
        }
        if (target.completed) target.status = "correct";
        target.latestAttemptCorrect = typeof source.latestAttemptCorrect === "boolean"
          ? source.latestAttemptCorrect
          : target.attempted
            ? target.completed || target.status === "correct"
            : null;
      }
      return fresh;
    } catch (_) {
      return fresh;
    }
  }

  function persistState(page, state, storageKey) {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 2, contentVersion: page?.version || 1, state: cloneState(state) }));
    } catch (_) {
      // The assessment remains usable for the current visit when storage is unavailable.
    }
  }

  function reduceState(page, currentState, action) {
    if (action?.type === "reset-page") return createState(page);
    const state = cloneState(currentState);
    if (action?.type === "select-case") {
      if (page?.cases?.some((caseFile) => caseFile.id === action.caseId)) state.activeCaseId = action.caseId;
      return state;
    }
    if (action?.type === "update-note") {
      state.notes[action.prompt] = String(action.value ?? "");
      return state;
    }
    if (action?.type === "reveal-practical") {
      state.practicalReviewed = true;
      return state;
    }

    const activity = activitiesFor(page).find((item) => item?.id === action?.id);
    const activityState = state.activities[action?.id];
    if (!validActivity(activity) || !activityState || activityState.completed) return state;

    if (action.type === "select-single" && activity.kind === "single") {
      const option = Number(action.option);
      if (!Number.isInteger(option) || option < 0 || option >= activity.options.length || activityState.incorrect.includes(option)) return state;
      activityState.selected = option;
      activityState.attempted = true;
      activityState.attempts += 1;
      activityState.latestAttemptCorrect = option === activity.answer;
      if (option === activity.answer) {
        activityState.completed = true;
        activityState.status = "correct";
        activityState.feedback = "Correct. Activity complete.";
      } else {
        activityState.incorrect.push(option);
        activityState.status = "incorrect";
        activityState.feedback = "Try another option.";
      }
    }

    if (action.type === "toggle-multiple" && activity.kind === "multiple") {
      const option = Number(action.option);
      if (!Number.isInteger(option) || option < 0 || option >= activity.options.length) return state;
      activityState.selected = activityState.selected.includes(option)
        ? activityState.selected.filter((item) => item !== option)
        : [...activityState.selected, option];
      activityState.feedback = "";
      activityState.status = "neutral";
    }

    if (action.type === "check-multiple" && activity.kind === "multiple") {
      if (!activityState.selected.length) {
        activityState.feedback = "Choose at least one option before checking.";
        activityState.status = "neutral";
        return state;
      }
      activityState.attempted = true;
      activityState.attempts += 1;
      activityState.latestAttemptCorrect = sameValues(activityState.selected, activity.answers);
      if (sameValues(activityState.selected, activity.answers)) {
        activityState.completed = true;
        activityState.status = "correct";
        activityState.feedback = "Correct. Activity complete.";
      } else {
        activityState.status = "incorrect";
        activityState.feedback = "That combination is incomplete or includes an incorrect choice. Adjust it and try again.";
      }
    }

    if (action.type === "move-ordering" && activity.kind === "ordering") {
      const index = activityState.order.indexOf(action.item);
      const target = index + (action.direction === "up" ? -1 : action.direction === "down" ? 1 : 0);
      if (index < 0 || target < 0 || target >= activityState.order.length || target === index) return state;
      [activityState.order[index], activityState.order[target]] = [activityState.order[target], activityState.order[index]];
      activityState.feedback = "";
      activityState.status = "neutral";
    }

    if (action.type === "check-ordering" && activity.kind === "ordering") {
      activityState.attempted = true;
      activityState.attempts += 1;
      activityState.latestAttemptCorrect = activityState.order.every((item, index) => item === activity.answer[index]);
      if (activityState.order.every((item, index) => item === activity.answer[index])) {
        activityState.completed = true;
        activityState.status = "correct";
        activityState.feedback = "Correct. Activity complete.";
      } else {
        activityState.status = "incorrect";
        activityState.feedback = "The sequence is not contract-correct yet. Move the steps and try again.";
      }
    }

    return state;
  }

  function progress(page, state) {
    const total = activitiesFor(page).length;
    const completed = activitiesFor(page).filter((activity) => state.activities?.[activity.id]?.completed).length;
    const latestAttemptScored = activitiesFor(page).filter((activity) => typeof state.activities?.[activity.id]?.latestAttemptCorrect === "boolean").length;
    const latestAttemptCorrect = activitiesFor(page).filter((activity) => state.activities?.[activity.id]?.latestAttemptCorrect === true).length;
    return { completed, total, latestAttemptScored, latestAttemptCorrect, practicalReviewed: Boolean(page?.practical && state.practicalReviewed) };
  }

  function renderFeedback(activity, state) {
    const explanation = state.attempted ? `<p class="assessment-explanation">${escapeHtml(activity.explanation)}</p>` : "";
    return `<div class="assessment-feedback ${escapeHtml(state.status)}" data-assessment-feedback="${escapeHtml(activity.id)}" tabindex="-1">${state.feedback ? `<strong>${escapeHtml(state.feedback)}</strong>` : ""}${explanation}</div>`;
  }

  function renderSingle(activity, state, number) {
    return `
      <fieldset class="assessment-activity assessment-single" data-assessment-id="${escapeHtml(activity.id)}">
        <legend><span>Activity ${number}</span>${escapeHtml(activity.prompt)}</legend>
        <div class="assessment-skill"><span>${escapeHtml(activity.dimension)}</span><span>${escapeHtml(activity.skill)}</span></div>
        <div class="assessment-options">
          ${activity.options.map((option, index) => {
            const incorrect = state.incorrect.includes(index);
            const correct = state.completed && index === activity.answer;
            const disabled = state.completed || incorrect;
            return `<button class="assessment-option${incorrect ? " incorrect" : ""}${correct ? " correct" : ""}" type="button" data-assessment-action="single" data-activity="${escapeHtml(activity.id)}" data-option="${index}"${disabled ? " disabled" : ""}><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`;
          }).join("")}
        </div>
        ${renderFeedback(activity, state)}
      </fieldset>`;
  }

  function renderMultiple(activity, state, number) {
    return `
      <fieldset class="assessment-activity assessment-multiple" data-assessment-id="${escapeHtml(activity.id)}">
        <legend><span>Activity ${number} · Select all that apply</span>${escapeHtml(activity.prompt)}</legend>
        <div class="assessment-skill"><span>${escapeHtml(activity.dimension)}</span><span>${escapeHtml(activity.skill)}</span></div>
        <div class="assessment-options">
          ${activity.options.map((option, index) => `<label class="assessment-checkbox${state.selected.includes(index) ? " selected" : ""}"><input type="checkbox" data-assessment-action="multiple" data-activity="${escapeHtml(activity.id)}" data-option="${index}"${state.selected.includes(index) ? " checked" : ""}${state.completed ? " disabled" : ""}><span>${escapeHtml(option)}</span></label>`).join("")}
        </div>
        <button class="assessment-check" type="button" data-assessment-action="check-multiple" data-activity="${escapeHtml(activity.id)}"${state.completed ? " disabled" : ""}>Check selection</button>
        ${renderFeedback(activity, state)}
      </fieldset>`;
  }

  function renderOrdering(activity, state, number) {
    const itemMap = new Map(activity.items.map((item) => [item.id, item]));
    return `
      <fieldset class="assessment-activity assessment-ordering" data-assessment-id="${escapeHtml(activity.id)}">
        <legend><span>Activity ${number} · Put in order</span>${escapeHtml(activity.prompt)}</legend>
        <div class="assessment-skill"><span>${escapeHtml(activity.dimension)}</span><span>${escapeHtml(activity.skill)}</span></div>
        <ol class="assessment-order-list">
          ${state.order.map((itemId, index) => {
            const item = itemMap.get(itemId);
            if (!item) return "";
            const upDisabled = state.completed || index === 0;
            const downDisabled = state.completed || index === state.order.length - 1;
            return `<li><span class="assessment-order-number">${index + 1}</span><strong>${escapeHtml(item.label)}</strong><span class="assessment-order-actions"><button type="button" aria-label="Move ${escapeHtml(item.label)} up" data-assessment-action="move" data-activity="${escapeHtml(activity.id)}" data-item="${escapeHtml(itemId)}" data-direction="up"${upDisabled ? " disabled" : ""}>Move up</button><button type="button" aria-label="Move ${escapeHtml(item.label)} down" data-assessment-action="move" data-activity="${escapeHtml(activity.id)}" data-item="${escapeHtml(itemId)}" data-direction="down"${downDisabled ? " disabled" : ""}>Move down</button></span></li>`;
          }).join("")}
        </ol>
        <button class="assessment-check" type="button" data-assessment-action="check-ordering" data-activity="${escapeHtml(activity.id)}"${state.completed ? " disabled" : ""}>Check order</button>
        ${renderFeedback(activity, state)}
      </fieldset>`;
  }

  function renderActivity(activity, state, number) {
    if (!validActivity(activity) || !state) return '<section class="assessment-activity unavailable"><p>This activity is unavailable.</p></section>';
    if (activity.kind === "single") return renderSingle(activity, state, number);
    if (activity.kind === "multiple") return renderMultiple(activity, state, number);
    if (activity.kind === "ordering") return renderOrdering(activity, state, number);
    return '<section class="assessment-activity unavailable"><p>This activity is unavailable.</p></section>';
  }

  function renderPractical(practical, state) {
    if (!practical) return "";
    return `
      <section class="assessment-practical">
        <span class="assessment-kicker">Final practical · ungraded</span>
        <h2>${escapeHtml(practical.title)}</h2>
        <p>${escapeHtml(practical.scenario)}</p>
        <div class="assessment-practical-prompts">
          ${practical.prompts.map((prompt) => `<label><strong>${escapeHtml(prompt.label)}</strong><span>${escapeHtml(prompt.prompt)}</span><textarea data-assessment-action="note" data-prompt="${escapeHtml(prompt.id)}" rows="4">${escapeHtml(state.notes[prompt.id] || "")}</textarea></label>`).join("")}
        </div>
        <aside class="assessment-evidence"><h3>Evidence your reasoning should account for</h3><ul>${practical.evidenceExpectations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></aside>
        <button class="assessment-check" type="button" data-assessment-action="reveal-practical"${state.practicalReviewed ? " disabled" : ""}>${state.practicalReviewed ? "Model reasoning revealed" : "Reveal model reasoning"}</button>
        ${state.practicalReviewed ? `<section class="assessment-model" data-assessment-model tabindex="-1"><span>One defensible reasoning path</span>${practical.modelReasoning.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`).join("")}</section>` : ""}
      </section>`;
  }

  function renderPage(page, state, context = {}, isFinal = false) {
    const status = progress(page, state);
    const activities = activitiesFor(page);
    const practicalStatus = page.practical ? `<span>${status.practicalReviewed ? "Practical reviewed" : "Practical not yet reviewed"}</span>` : "";
    return `
      <div class="content-wrap narrow assessment-page">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>${isFinal ? "Final assessment" : escapeHtml(context.moduleNumber ? `Module ${context.moduleNumber} review` : "Module review")}</span></div>
        <header class="assessment-hero">
          <span class="assessment-kicker">${isFinal ? "Course assessment" : "Cumulative module review"}</span>
          <h1>${escapeHtml(page.title)}</h1>
          <p>${escapeHtml(page.summary)}</p>
          <div class="assessment-progress" aria-live="polite"><strong>${status.completed} of ${status.total} complete</strong>${practicalStatus}</div>
          <button class="assessment-reset" type="button" data-assessment-action="reset">Reset this review</button>
        </header>
        <section class="assessment-stack" aria-label="${escapeHtml(page.title)} activities">
          ${activities.map((activity, index) => renderActivity(activity, state.activities[activity?.id], index + 1)).join("")}
        </section>
        ${renderPractical(page.practical, state)}
        ${context.nextHref ? `<nav class="assessment-next" aria-label="Continue course"><a class="button primary" href="${escapeHtml(context.nextHref)}">${escapeHtml(context.nextLabel || "Continue")}</a></nav>` : ""}
      </div>`;
  }

  function renderReview(review, state, context = {}) {
    return renderPage(review, state, context, false);
  }

  function renderCaseArtifact(artifact) {
    return `
      <article class="assessment-artifact">
        <span>${escapeHtml(artifact.label)}</span>
        <pre><code>${escapeHtml(artifact.content)}</code></pre>
      </article>`;
  }

  function renderFinalAssessment(assessment, state, context = {}) {
    const cases = Array.isArray(assessment?.cases) ? assessment.cases : [];
    if (!cases.length) return renderPage(assessment, state, context, true);
    const status = progress(assessment, state);
    const activeCase = cases.find((caseFile) => caseFile.id === state.activeCaseId) || cases[0];
    const activeIndex = cases.indexOf(activeCase);
    const allActivities = activitiesFor(assessment);
    const caseStatus = (caseFile) => {
      const total = caseFile.questions.length;
      const completed = caseFile.questions.filter((question) => state.activities?.[question.id]?.completed).length;
      return { completed, total };
    };
    return `
      <div class="content-wrap assessment-width assessment-page final-assessment-page">
        <div class="breadcrumb"><span><a href="#/">Course</a></span><span>Final assessment</span></div>
        <header class="assessment-hero final-assessment-hero">
          <span class="assessment-kicker">Course assessment · five integrated cases</span>
          <h1>${escapeHtml(assessment.title)}</h1>
          <p>${escapeHtml(assessment.summary)}</p>
          <div class="assessment-progress" aria-live="polite">
            <strong>${status.completed} of ${status.total} mastered</strong>
            <span>${status.latestAttemptCorrect} of ${status.total} latest-attempt score</span>
            <span>${status.latestAttemptScored} submitted</span>
          </div>
          <p class="assessment-score-note">Your most recently checked answer determines the score. Correcting an answer updates it, and your progress is saved on this device.</p>
          <button class="assessment-reset" type="button" data-assessment-action="reset">Reset final assessment</button>
        </header>

        <div class="assessment-case-layout">
          <aside class="assessment-case-rail" aria-label="Assessment cases">
            <div>
              <span class="assessment-kicker">Case files</span>
              <nav>
                ${cases.map((caseFile, index) => {
                  const caseProgress = caseStatus(caseFile);
                  const active = caseFile.id === activeCase.id;
                  return `<button type="button" class="assessment-case-link${active ? " active" : ""}${caseProgress.completed === caseProgress.total ? " complete" : ""}" data-assessment-action="case" data-case="${escapeHtml(caseFile.id)}"${active ? ' aria-current="step"' : ""}><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(caseFile.title)}</strong><small>${caseProgress.completed} / ${caseProgress.total} mastered</small></button>`;
                }).join("")}
              </nav>
              <div class="assessment-rail-score"><strong>${status.latestAttemptCorrect} / ${status.total}</strong><span>Latest-attempt score</span><small>${status.latestAttemptScored} questions submitted</small></div>
            </div>
          </aside>

          <section class="assessment-case-workspace" data-assessment-case-workspace tabindex="-1">
            <header class="assessment-case-head">
              <span class="assessment-kicker">Case ${activeIndex + 1} of ${cases.length}</span>
              <h2>${escapeHtml(activeCase.title)}</h2>
              <p>${escapeHtml(activeCase.summary)}</p>
              <div class="assessment-case-modules">${activeCase.modules.map((module) => `<span>${escapeHtml(module.replaceAll("-", " "))}</span>`).join("")}</div>
            </header>
            <section class="assessment-case-brief">
              <div><span>Situation</span><p>${escapeHtml(activeCase.scenario)}</p></div>
              <div class="assessment-artifacts">${activeCase.artifacts.map(renderCaseArtifact).join("")}</div>
            </section>
            <section class="assessment-stack" aria-label="${escapeHtml(activeCase.title)} questions">
              ${activeCase.questions.map((activity) => renderActivity(activity, state.activities[activity.id], allActivities.findIndex((item) => item.id === activity.id) + 1)).join("")}
            </section>
            <nav class="assessment-case-pagination" aria-label="Case navigation">
              ${activeIndex > 0 ? `<button type="button" data-assessment-action="case" data-case="${escapeHtml(cases[activeIndex - 1].id)}">Previous case</button>` : "<span></span>"}
              ${activeIndex < cases.length - 1 ? `<button type="button" data-assessment-action="case" data-case="${escapeHtml(cases[activeIndex + 1].id)}">Next case</button>` : ""}
            </nav>
            ${status.completed === status.total ? `<section class="assessment-results" aria-label="Assessment results"><span class="assessment-kicker">Assessment mastered</span><h2>${status.latestAttemptCorrect} / ${status.total} latest-attempt score</h2><p>You mastered all ${status.total} questions. This score reflects the latest checked answer for each question, including successful corrections.</p></section>` : ""}
          </section>
        </div>
      </div>`;
  }

  function renderUnavailable(id) {
    return `<div class="content-wrap narrow assessment-page"><div class="breadcrumb"><span><a href="#/">Course</a></span><span>Review unavailable</span></div><header class="assessment-hero"><span class="assessment-kicker">Unavailable route</span><h1>Review unavailable</h1><p>No module review exists for <code>${escapeHtml(id)}</code>. Return to the course index and choose a listed module.</p><a class="button primary" href="#/">Return to course</a></header></div>`;
  }

  function mount(container, page, options = {}) {
    let state = restoreState(page, options.storageKey || "");
    container.innerHTML = '<div data-assessment-render></div><div class="assessment-announcer sr-only" data-assessment-announcer aria-live="polite" aria-atomic="true"></div>';
    const renderRoot = container.querySelector("[data-assessment-render]");
    const announcer = container.querySelector("[data-assessment-announcer]");

    const activityControl = (id, predicate) => [...renderRoot.querySelectorAll("[data-activity]")]
      .find((control) => control.dataset.activity === id && predicate(control));

    const focusAfter = (action) => {
      let target = null;
      const activityState = state.activities[action?.id];
      if (action?.type === "reset-page") {
        target = renderRoot.querySelector('[data-assessment-action="reset"]');
      } else if (action?.type === "select-case") {
        target = renderRoot.querySelector("[data-assessment-case-workspace]");
      } else if (action?.type === "select-single") {
        target = activityState?.completed
          ? [...renderRoot.querySelectorAll("[data-assessment-feedback]")].find((control) => control.dataset.assessmentFeedback === action.id)
          : activityControl(action.id, (control) => control.dataset.assessmentAction === "single" && !control.disabled);
      } else if (action?.type === "toggle-multiple") {
        target = activityControl(action.id, (control) => control.dataset.assessmentAction === "multiple" && Number(control.dataset.option) === action.option);
      } else if (action?.type === "check-multiple" || action?.type === "check-ordering") {
        target = activityState?.completed
          ? [...renderRoot.querySelectorAll("[data-assessment-feedback]")].find((control) => control.dataset.assessmentFeedback === action.id)
          : activityControl(action.id, (control) => control.dataset.assessmentAction === action.type);
      } else if (action?.type === "move-ordering") {
        const itemControls = [...renderRoot.querySelectorAll('[data-assessment-action="move"]')]
          .filter((control) => control.dataset.activity === action.id && control.dataset.item === action.item && !control.disabled);
        target = itemControls.find((control) => control.dataset.direction === action.direction) || itemControls[0];
      } else if (action?.type === "reveal-practical") {
        target = renderRoot.querySelector("[data-assessment-model]");
      }
      if (target?.matches("[data-assessment-feedback], [data-assessment-model]")) {
        target.dataset.assessmentFocusTarget = "";
        target.addEventListener("blur", () => target.removeAttribute("data-assessment-focus-target"), { once: true });
      }
      target?.focus();
    };

    const announcementFor = (action) => {
      if (action?.type === "reset-page") return "Review reset.";
      if (action?.type === "select-case") {
        const caseFile = page?.cases?.find((item) => item.id === action.caseId);
        return caseFile ? `${caseFile.title} opened.` : "Case opened.";
      }
      if (action?.type === "reveal-practical") return "Model reasoning revealed.";
      if (action?.type === "toggle-multiple") return "Selection updated.";
      if (action?.type === "move-ordering") {
        const activity = activitiesFor(page).find((item) => item?.id === action.id);
        const item = activity?.items?.find((candidate) => candidate.id === action.item);
        return item ? `${item.label} moved ${action.direction}.` : "Order updated.";
      }
      return state.activities[action?.id]?.feedback || "";
    };

    const draw = (action) => {
      if (action) persistState(page, state, options.storageKey || "");
      renderRoot.innerHTML = Array.isArray(page?.questions) ? renderFinalAssessment(page, state, options.context) : renderReview(page, state, options.context);
      if (action) {
        announcer.textContent = announcementFor(action);
        focusAfter(action);
      }
    };
    draw();

    container.onclick = (event) => {
      const control = event.target.closest("[data-assessment-action]");
      if (!control) return;
      const action = control.dataset.assessmentAction;
      if (action === "reset") {
        const confirmReset = options.confirmReset || (() => window.confirm("Reset this review and clear the current page's answers and notes?"));
        if (!confirmReset()) return;
        const stateAction = { type: "reset-page" };
        state = reduceState(page, state, stateAction);
        draw(stateAction);
      } else if (action === "case") {
        const stateAction = { type: "select-case", caseId: control.dataset.case };
        state = reduceState(page, state, stateAction);
        draw(stateAction);
      } else if (action === "single") {
        const stateAction = { type: "select-single", id: control.dataset.activity, option: Number(control.dataset.option) };
        state = reduceState(page, state, stateAction);
        draw(stateAction);
      } else if (action === "check-multiple") {
        const stateAction = { type: "check-multiple", id: control.dataset.activity };
        state = reduceState(page, state, stateAction);
        draw(stateAction);
      } else if (action === "move") {
        const stateAction = { type: "move-ordering", id: control.dataset.activity, item: control.dataset.item, direction: control.dataset.direction };
        state = reduceState(page, state, stateAction);
        draw(stateAction);
      } else if (action === "check-ordering") {
        const stateAction = { type: "check-ordering", id: control.dataset.activity };
        state = reduceState(page, state, stateAction);
        draw(stateAction);
      } else if (action === "reveal-practical") {
        const stateAction = { type: "reveal-practical" };
        state = reduceState(page, state, stateAction);
        draw(stateAction);
      } else {
        return;
      }
    };

    container.onchange = (event) => {
      const control = event.target.closest('[data-assessment-action="multiple"]');
      if (!control) return;
      const stateAction = { type: "toggle-multiple", id: control.dataset.activity, option: Number(control.dataset.option) };
      state = reduceState(page, state, stateAction);
      draw(stateAction);
    };

    container.oninput = (event) => {
      const control = event.target.closest('[data-assessment-action="note"]');
      if (!control) return;
      state = reduceState(page, state, { type: "update-note", prompt: control.dataset.prompt, value: control.value });
      persistState(page, state, options.storageKey || "");
    };

    return { getState: () => cloneState(state), reset: () => { state = createState(page); draw({ type: "reset-page" }); } };
  }

  window.ILOVEOS_ASSESSMENT_VIEW = {
    createState,
    mount,
    progress,
    reduceState,
    renderFinalAssessment,
    renderReview,
    renderUnavailable
  };
})();
