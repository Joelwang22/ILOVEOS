const unresolvedPatterns = [
  /\bfrom this lesson\b/i,
  /\bthe (?:code|example|script|starter|reader|inspector|survey|copy)\b/i,
  /\bthe same (?:command|script|workload)\b/i,
];

const terminalPattern = /\b(?:powershell|terminal|command prompt|cmd(?:\.exe)?|bash|shell)\b/i;
const terminalInstructionPattern = /\b(?:run|paste|type|enter|execute|launch|start|invoke)\b/i;
const codeInstructionPattern = /\b(?:run|paste|type|enter|execute|launch|start|invoke)\b.*\b(?:code|command|script)\b/i;
const offPageTaskPattern = /\b(?:record|explain|classify|calculate|draw|research|reconstruct|document|summari[sz]e|produce)\b|\bdesign\s+(?:an?\s+|the\s+|your\s+)?(?:system|protocol|solution|policy|channel|workflow|experiment|table|report|record)\b|\bwrite\s+(?:an?\s+|the\s+|your\s+|one\s+)?(?:five-part\s+)?(?:explanation|conclusion|table|list|casebook|report|statement|timeline|comparison|verdict|distinction|prediction|summary)\b|\b(?:create|build|make)\s+(?:an?\s+)?(?:table|list|report|casebook|diagram|map|timeline|comparison)\b/i;
const dynamicCheckpointPattern = /\b(?:live|printed|recorded|current|actual|your|machine[- ]specific)\s+(?:pid|process id|address|base address|timing|elapsed time|path|inventory|module list)\b|\b(?:pid|process id|address|base address|timing|elapsed time|path|inventory|module list)\s+(?:did|does|was|were|is|are)\b|\b(?:pid|process id|address|base address|timing|elapsed time|path|inventory|module list)\b(?:\s+\w+){0,6}\s+(?:printed|shown|displayed|reported|observed|measured|recorded)\b/i;

const shortCheckpointFields = new Set(["afterStep", "type", "prompt", "answer", "acceptedAnswers", "feedback"]);
const choiceCheckpointFields = new Set(["afterStep", "type", "prompt", "options", "answerIndex", "feedback"]);

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
  const clarityFinding = (message) => {
    (options.enforceClarity ? errors : warnings).push(`${context}: ${message}`);
  };
  const steps = practice.steps || [];

  if (practice.extension !== undefined) clarityFinding("extension fields are not allowed");

  const taskFields = [
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
    if (typeof value === "string" && offPageTaskPattern.test(value)) clarityFinding(`${field}: off-page task verb`);
  }

  if (!Array.isArray(steps)) {
    errors.push(`${context}: steps must be an array`);
    return { errors, warnings, downloadPaths: downloads.map((item) => item.path), commandCount, checkpointCount, choiceCheckpointCount };
  }

  for (const [index, step] of steps.entries()) {
    const stepName = `step ${index + 1}`;
    const prefix = `${context}: ${stepName}`;
    if (!step || typeof step !== "object" || Array.isArray(step)) {
      errors.push(`${prefix}: must be an object`);
      continue;
    }
    if (typeof step.action !== "string" || !step.action.trim()) errors.push(`${prefix}: action is required`);
    if (typeof step.observe !== "string" || !step.observe.trim()) errors.push(`${prefix}: observe is required`);

    for (const [field, value] of [["action", step.action], ["observe", step.observe], ["hint", step.hint]]) {
      if (typeof value === "string" && offPageTaskPattern.test(value)) clarityFinding(`${stepName}: ${field}: off-page task verb`);
    }

    const stepText = [step.action, step.why, step.observe, step.hint].filter((item) => typeof item === "string").join(" ");
    if (unresolvedPatterns.some((pattern) => pattern.test(stepText))) clarityFinding(`${stepName}: unresolved reference`);

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
      if (typeof command.code !== "string" || !command.code.trim()) errors.push(`${commandPrefix}: code is required`);
      if (typeof command.code === "string" && /<[^>]+>/.test(command.code)) errors.push(`${commandPrefix}: paste-hostile placeholder`);
    }
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
  }

  return { errors, warnings, downloadPaths: downloads.map((item) => item.path), commandCount, checkpointCount, choiceCheckpointCount };
}
