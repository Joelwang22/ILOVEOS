const unresolvedPatterns = [
  /\bfrom this lesson\b/i,
  /\bthe (?:code|example|script|starter|reader|inspector|survey|copy)\b/i,
  /\bthe same (?:command|script|workload)\b/i,
];
const crossLessonReferencePatterns = [
  /\b(?:the\s+)?displayed(?:\s+[\w:-]+){0,12}\s+(?:example|walkthrough|stage|card|section)\b/i,
  /\b(?:the\s+)?(?:earlier|previous)(?:\s+[\w:-]+){0,5}\s+(?:example|walkthrough|stage|card|section)\b/i,
  /\b(?:the\s+)?same(?:\s+displayed)?(?:\s+[\w:-]+){0,8}\s+(?:example|walkthrough)\b/i,
  /\b(?:example|walkthrough|stage|card|section)\s+(?:above|elsewhere)\b/i,
  /\b(?:example|walkthrough|stage|card|section)\b[^.!?\n]{0,60}\b(?:in|from)\s+(?:this\s+lesson|the\s+(?:earlier|previous)\s+(?:card|section|lesson))\b/i,
];

const terminalPattern = /\b(?:powershell|terminal|command prompt|cmd(?:\.exe)?|bash|shell)\b/i;
const terminalInstructionPattern = /\b(?:run|paste|type|enter|execute|launch|start|invoke)\b/i;
const codeInstructionPattern = /\b(?:run|paste|type|enter|execute|launch|start|invoke)\b.*\b(?:code|command|script)\b/i;
const offPageTaskPattern = /\b(?:record|explain|classify|calculate|draw|research|reconstruct|document|summari[sz]e|produce)\b|\bdesign\s+(?:an?\s+|the\s+|your\s+)?(?:system|protocol|solution|policy|channel|workflow|experiment|table|report|record)\b|\bwrite\s+(?:an?\s+|the\s+|your\s+|one\s+)?(?:five-part\s+)?(?:explanation|conclusion|table|list|casebook|report|statement|timeline|comparison|verdict|distinction|prediction|summary)\b|\b(?:create|build|make)\s+(?:an?\s+)?(?:table|list|report|casebook|diagram|map|timeline|comparison)\b/i;
const unsuppliedChoicePattern = /\bmap one harmless application preference\b|\bchoose\s+a\s+reversible\s+(?:per-user\s+)?preference\b|\bdisposable application profile\b/i;
const unsuppliedEnvironmentPattern = /\bpre[- ]authori[sz]ed\b|\bdisposable\s+(?:VM|virtual machine)\b/i;
const negativeInstructionPattern = /\b(?:do not|don't|never|without|avoid|no need to|must not|should not|is not required to)\b/i;
const readHostPattern = /\bRead-Host\b([^\r\n;|}]*)/gi;
const sourcedInputPattern = /\b(?:printed|reported|shown|displayed|recorded|captured|matched|selected|supplied|fixed)\b|\bfrom\s+(?:step\s+\d+|the\s+[\w.-]+|[\w.-]+)\b|\benter exactly\b/i;
const pauseInputPattern = /\b(?:press Enter|close .+ then press Enter)\b/i;
const dynamicCheckpointPattern = /\b(?:live|printed|recorded|current|actual|your|machine[- ]specific)\s+(?:pid|process id|address|base address|timing|elapsed time|path|inventory|module list)\b|\b(?:pid|process id|address|base address|timing|elapsed time|path|inventory|module list)\s+(?:did|does|was|were|is|are)\b|\b(?:pid|process id|address|base address|timing|elapsed time|path|inventory|module list)\b(?:\s+\w+){0,6}\s+(?:printed|shown|displayed|reported|observed|measured|recorded)\b/i;

const shortCheckpointFields = new Set(["afterStep", "type", "prompt", "answer", "acceptedAnswers", "feedback"]);
const choiceCheckpointFields = new Set(["afterStep", "type", "prompt", "options", "answerIndex", "feedback"]);
const caseStudyFields = new Set(["label", "title", "summary", "sections"]);
const caseStudySectionFields = new Set(["title", "body", "facts", "code"]);
const caseStudyStepFields = new Set(["action", "commands", "why", "observe", "hint", "caseStudySections"]);

function taskIsNegated(prefix) {
  const contrastIndex = Math.max(...[...prefix.matchAll(/\b(?:but|however|then|instead)\b/gi)].map((match) => match.index));
  const negativeIndex = Math.max(...[...prefix.matchAll(new RegExp(negativeInstructionPattern.source, "gi"))].map((match) => match.index));
  return negativeIndex >= 0 && negativeIndex > contrastIndex;
}

function taskFinding(value) {
  if (typeof value !== "string") return null;
  for (const clause of value.split(/(?<=[.!?;])\s+|\n+/)) {
    for (const taskMatch of clause.matchAll(new RegExp(offPageTaskPattern.source, "gi"))) {
      const beforeTask = clause.slice(0, taskMatch.index);
      if (!taskIsNegated(beforeTask)) return "off-page task verb";
    }
    for (const choiceMatch of clause.matchAll(new RegExp(unsuppliedChoicePattern.source, "gi"))) {
      const beforeChoice = clause.slice(0, choiceMatch.index);
      if (!taskIsNegated(beforeChoice)) return "unsupplied external choice";
    }
    for (const environmentMatch of clause.matchAll(new RegExp(unsuppliedEnvironmentPattern.source, "gi"))) {
      const beforeEnvironment = clause.slice(0, environmentMatch.index);
      if (!taskIsNegated(beforeEnvironment)) return "unsupplied external environment";
    }
  }
  return null;
}

function crossLessonReferenceFinding(value) {
  return typeof value === "string" && crossLessonReferencePatterns.some((pattern) => pattern.test(value));
}

function runtimePromptFindings(source) {
  const findings = [];
  const inputPattern = /\binput\s*\(\s*(?:[rubf]{0,2})?(['"])([\s\S]*?)\1\s*\)/gi;
  for (const match of source.matchAll(inputPattern)) {
    const finding = taskFinding(match[2]);
    if (finding) findings.push(finding);
  }
  return findings;
}

export function practiceDownloads(practice = {}) {
  const authored = practice.downloads || (practice.download ? [practice.download] : []);
  return authored.map(([path, filename, label]) => ({
    path,
    filename,
    label: label || "Download starter",
  }));
}

export function validatePractice(practice = {}, context = "practice", options = {}) {
  const errors = [];
  const warnings = [];
  const downloads = practiceDownloads(practice);
  let commandCount = 0;
  const checkpoints = practice.checkpoints === undefined ? [] : practice.checkpoints;
  const checkpointCount = Array.isArray(checkpoints) ? checkpoints.length : 0;
  const choiceCheckpointCount = Array.isArray(checkpoints)
    ? checkpoints.filter((checkpoint) => checkpoint?.type === "choice").length
    : 0;
  const caseStudyCount = practice.caseStudy === undefined ? 0 : 1;
  const clarityFinding = (message) => {
    (options.enforceClarity ? errors : warnings).push(`${context}: ${message}`);
  };
  const steps = practice.steps || [];
  const caseStudySectionTitles = new Set();
  const consumingCaseStudySteps = new Set();

  if (practice.extension !== undefined) clarityFinding("extension fields are not allowed");

  const taskFields = [
    ["title", practice.title],
    ["intro", practice.intro],
    ["safety", practice.safety],
    ["expected outcome", practice.expectedOutcome],
    ...(Array.isArray(practice.hints)
      ? practice.hints.flatMap((hint, index) => [
          [`practice hint ${index + 1} title`, hint?.title],
          [`practice hint ${index + 1} body`, hint?.body],
        ])
      : []),
    ...(Array.isArray(practice.cleanup)
      ? practice.cleanup.map((item, index) => [`cleanup ${index + 1}`, item])
      : []),
  ];
  for (const [field, value] of taskFields) {
    const finding = taskFinding(value);
    if (finding) clarityFinding(`${field}: ${finding}`);
    if (crossLessonReferenceFinding(value)) clarityFinding(`${field}: cross-lesson reference`);
  }

  if (practice.caseStudy !== undefined) {
    const caseStudy = practice.caseStudy;
    if (!caseStudy || typeof caseStudy !== "object" || Array.isArray(caseStudy)) {
      errors.push(`${context}: case study must be an object`);
    } else {
      const unsupported = Object.keys(caseStudy).filter((key) => !caseStudyFields.has(key));
      if (unsupported.length) errors.push(`${context}: unsupported case-study field ${unsupported.join(", ")}`);
      for (const field of ["label", "title", "summary"]) {
        if (typeof caseStudy[field] !== "string" || !caseStudy[field].trim()) {
          errors.push(`${context}: case study ${field} is required`);
        }
      }
      if (!Array.isArray(caseStudy.sections) || !caseStudy.sections.length) {
        errors.push(`${context}: case study sections must be a non-empty array`);
      } else {
        for (const [sectionIndex, section] of caseStudy.sections.entries()) {
          const prefix = `${context}: case study section ${sectionIndex + 1}`;
          if (!section || typeof section !== "object" || Array.isArray(section)) {
            errors.push(`${prefix}: must be an object`);
            continue;
          }
          const unsupportedSectionFields = Object.keys(section).filter((key) => !caseStudySectionFields.has(key));
          if (unsupportedSectionFields.length) {
            errors.push(`${prefix}: unsupported case-study section field ${unsupportedSectionFields.join(", ")}`);
          }
          if (typeof section.title !== "string" || !section.title.trim()) {
            errors.push(`${prefix}: title is required`);
          } else if (caseStudySectionTitles.has(section.title)) {
            errors.push(`${context}: case study section titles must be unique`);
          } else {
            caseStudySectionTitles.add(section.title);
          }

          const hasBody = section.body !== undefined;
          const hasFacts = section.facts !== undefined;
          const hasCode = section.code !== undefined;
          if (!hasBody && !hasFacts && !hasCode) errors.push(`${prefix}: must include body, facts, or code`);
          if (hasBody && (typeof section.body !== "string" || !section.body.trim())) errors.push(`${prefix}: body must be a non-empty string`);
          if (hasCode && (typeof section.code !== "string" || !section.code.trim())) errors.push(`${prefix}: code must be a non-empty string`);
          if (hasFacts) {
            if (!Array.isArray(section.facts) || !section.facts.length) {
              errors.push(`${prefix}: facts must be a non-empty array`);
            } else if (section.facts.some((row) => !Array.isArray(row)
              || row.length !== 2
              || row.some((value) => typeof value !== "string" || !value.trim()))) {
              errors.push(`${prefix}: fact rows must contain exactly two non-empty strings`);
            }
          }
        }
      }
    }
  }

  if (!Array.isArray(steps)) {
    errors.push(`${context}: steps must be an array`);
    return { errors, warnings, downloadPaths: downloads.map((item) => item.path), commandCount, checkpointCount, choiceCheckpointCount, caseStudyCount };
  }

  for (const [index, step] of steps.entries()) {
    const stepName = `step ${index + 1}`;
    const prefix = `${context}: ${stepName}`;
    if (!step || typeof step !== "object" || Array.isArray(step)) {
      errors.push(`${prefix}: must be an object`);
      continue;
    }
    const unsupportedStepFields = Object.keys(step).filter((key) => !caseStudyStepFields.has(key));
    if (unsupportedStepFields.length) errors.push(`${prefix}: unsupported step field ${unsupportedStepFields.join(", ")}`);
    if (typeof step.action !== "string" || !step.action.trim()) errors.push(`${prefix}: action is required`);
    if (typeof step.observe !== "string" || !step.observe.trim()) errors.push(`${prefix}: observe is required`);

    for (const [field, value] of [["action", step.action], ["why", step.why], ["observe", step.observe], ["hint", step.hint]]) {
      const finding = taskFinding(value);
      if (finding) clarityFinding(`${stepName}: ${field}: ${finding}`);
      if (crossLessonReferenceFinding(value)) clarityFinding(`${stepName}: ${field}: cross-lesson reference`);
    }

    const stepText = [step.action, step.why, step.observe, step.hint].filter((item) => typeof item === "string").join(" ");
    if (unresolvedPatterns.some((pattern) => pattern.test(stepText))) clarityFinding(`${stepName}: unresolved reference`);

    if (step.caseStudySections !== undefined) {
      if (!Array.isArray(step.caseStudySections) || !step.caseStudySections.length) {
        errors.push(`${prefix}: caseStudySections must be a non-empty array`);
      } else if (step.caseStudySections.some((title) => typeof title !== "string" || !title.trim())) {
        errors.push(`${prefix}: caseStudySections must contain non-empty strings`);
      } else if (practice.caseStudy === undefined) {
        errors.push(`${prefix}: caseStudySections requires a case study`);
      } else {
        consumingCaseStudySteps.add(index);
        for (const title of step.caseStudySections) {
          if (!caseStudySectionTitles.has(title)) errors.push(`${prefix}: unknown case-study section ${title}`);
        }
      }
    }

    if (step.commands !== undefined && !Array.isArray(step.commands)) {
      errors.push(`${prefix}: commands must be an array`);
      continue;
    }
    const commands = step.commands || [];
    if (((terminalPattern.test(step.action || "") && terminalInstructionPattern.test(step.action || "") && !/\bProcess Monitor\b/i.test(step.action || "")) || codeInstructionPattern.test(step.action || "")) && !commands.length) {
      clarityFinding(`${stepName}: terminal instruction needs a command block`);
    }
    for (const [commandIndex, command] of commands.entries()) {
      const commandPrefix = `${prefix}: command ${commandIndex + 1}`;
      commandCount += 1;
      if (!command || typeof command !== "object" || Array.isArray(command)) {
        errors.push(`${commandPrefix}: must be an object`);
        continue;
      }
      const unsupported = Object.keys(command).filter((key) => key !== "label" && key !== "code");
      if (unsupported.length) errors.push(`${commandPrefix}: unsupported command field ${unsupported.join(", ")}`);
      if (typeof command.label !== "string" || !command.label.trim()) errors.push(`${commandPrefix}: label is required`);
      if (crossLessonReferenceFinding(command.label)) clarityFinding(`${stepName}: command ${commandIndex + 1}: label: cross-lesson reference`);
      if (typeof command.code !== "string" || !command.code.trim()) errors.push(`${commandPrefix}: code is required`);
      if (typeof command.code === "string" && /<[^>]+>/.test(command.code)) errors.push(`${commandPrefix}: paste-hostile placeholder`);
      if (typeof command.code === "string") {
        for (const match of command.code.matchAll(readHostPattern)) {
          const promptMatch = match[1].match(/(?:-Prompt\s+)?(['"])(.*?)\1/i);
          const prompt = promptMatch?.[2] || "";
          if (!sourcedInputPattern.test(prompt) && !pauseInputPattern.test(prompt)) {
            clarityFinding(`${stepName}: command ${commandIndex + 1}: interactive input needs explicit provenance`);
          }
        }
      }
    }
  }

  if (practice.caseStudy !== undefined && consumingCaseStudySteps.size < 2) {
    errors.push(`${context}: at least two distinct steps must consume the case study`);
  }

  if (!Array.isArray(checkpoints)) {
    errors.push(`${context}: checkpoints must be an array`);
  } else {
    if (checkpointCount > 2) errors.push(`${context}: no more than two checkpoints are allowed`);
    if (choiceCheckpointCount > 1) errors.push(`${context}: no more than one choice checkpoint is allowed`);
    for (const [index, checkpoint] of checkpoints.entries()) {
      const prefix = `${context}: checkpoint ${index + 1}`;
      if (!checkpoint || typeof checkpoint !== "object" || Array.isArray(checkpoint)) {
        errors.push(`${prefix}: must be an object`);
        continue;
      }
      const allowedFields = checkpoint.type === "choice" ? choiceCheckpointFields : shortCheckpointFields;
      const unsupported = Object.keys(checkpoint).filter((key) => !allowedFields.has(key));
      if (unsupported.length) errors.push(`${prefix}: unsupported checkpoint field ${unsupported.join(", ")}`);
      if (!Number.isInteger(checkpoint.afterStep) || checkpoint.afterStep < 1 || checkpoint.afterStep > steps.length) {
        errors.push(`${prefix}: afterStep must reference an existing step`);
      }
      if (typeof checkpoint.prompt !== "string" || !checkpoint.prompt.trim()) errors.push(`${prefix}: prompt is required`);
      if (typeof checkpoint.feedback !== "string" || !checkpoint.feedback.trim()) errors.push(`${prefix}: feedback is required`);
      if (typeof checkpoint.prompt === "string" && dynamicCheckpointPattern.test(checkpoint.prompt)) {
        errors.push(`${prefix}: checkpoint must not request a dynamic answer`);
      }

      if (checkpoint.type === "short") {
        if (typeof checkpoint.answer !== "string" || !checkpoint.answer.trim()) {
          errors.push(`${prefix}: answer must be a non-empty fixed string`);
        } else if (dynamicCheckpointPattern.test(checkpoint.answer)) {
          errors.push(`${prefix}: checkpoint must not request a dynamic answer`);
        }
        if (checkpoint.acceptedAnswers !== undefined) {
          if (!Array.isArray(checkpoint.acceptedAnswers)) {
            errors.push(`${prefix}: acceptedAnswers must be an array`);
          } else if (checkpoint.acceptedAnswers.some((answer) => typeof answer !== "string" || !answer.trim())) {
            errors.push(`${prefix}: acceptedAnswers must contain non-empty fixed strings`);
          } else if (checkpoint.acceptedAnswers.some((answer) => dynamicCheckpointPattern.test(answer))) {
            errors.push(`${prefix}: checkpoint must not request a dynamic answer`);
          }
        }
      } else if (checkpoint.type === "choice") {
        if (!Array.isArray(checkpoint.options) || checkpoint.options.length < 2) {
          errors.push(`${prefix}: options must contain at least two choices`);
        } else if (checkpoint.options.some((option) => typeof option !== "string" || !option.trim())) {
          errors.push(`${prefix}: options must contain non-empty strings`);
        }
        if (!Number.isInteger(checkpoint.answerIndex)
          || !Array.isArray(checkpoint.options)
          || checkpoint.answerIndex < 0
          || checkpoint.answerIndex >= checkpoint.options.length) {
          errors.push(`${prefix}: answerIndex must reference an option`);
        } else if (dynamicCheckpointPattern.test(checkpoint.options[checkpoint.answerIndex])) {
          errors.push(`${prefix}: checkpoint must not request a dynamic answer`);
        }
      } else {
        errors.push(`${prefix}: type must be short or choice`);
      }
    }
  }

  for (const download of downloads.filter((item) => item.filename?.endsWith(".py"))) {
    const named = steps.some((step) => typeof step?.action === "string" && step.action.includes(download.filename));
    if (!named) clarityFinding(`downloaded artifact ${download.filename} is not explicitly named in a step`);
    if (typeof options.readDownloadSource === "function") {
      let source;
      try {
        source = options.readDownloadSource(download.path);
      } catch (error) {
        errors.push(`${context}: downloaded artifact ${download.filename}: source read failed (${error.message})`);
      }
      if (typeof source === "string") {
        for (const finding of runtimePromptFindings(source)) {
          clarityFinding(`downloaded artifact ${download.filename}: runtime prompt: ${finding}`);
        }
      }
    }
  }

  return { errors, warnings, downloadPaths: downloads.map((item) => item.path), commandCount, checkpointCount, choiceCheckpointCount, caseStudyCount };
}
