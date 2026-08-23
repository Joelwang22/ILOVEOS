const unresolvedPatterns = [
  /\bfrom this lesson\b/i,
  /\bthe (?:code|example|script|starter|reader|inspector|survey|copy)\b/i,
  /\bthe same (?:command|script|workload)\b/i,
];

const terminalPattern = /\b(?:powershell|terminal|command prompt|cmd(?:\.exe)?|bash|shell)\b/i;
const terminalInstructionPattern = /\b(?:run|paste|type|enter|execute|launch|start|invoke)\b/i;
const codeInstructionPattern = /\b(?:run|paste|type|enter|execute|launch|start|invoke)\b.*\b(?:code|command|script)\b/i;

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
  const clarityFinding = (message) => {
    (options.enforceClarity ? errors : warnings).push(`${context}: ${message}`);
  };
  const steps = practice.steps || [];

  if (!Array.isArray(steps)) {
    errors.push(`${context}: steps must be an array`);
    return { errors, warnings, downloadPaths: downloads.map((item) => item.path), commandCount };
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

    const stepText = [step.action, step.why, step.observe, step.hint].filter((item) => typeof item === "string").join(" ");
    if (unresolvedPatterns.some((pattern) => pattern.test(stepText))) clarityFinding(`${stepName}: unresolved reference`);

    if (step.commands !== undefined && !Array.isArray(step.commands)) {
      errors.push(`${prefix}: commands must be an array`);
      continue;
    }
    const commands = step.commands || [];
    if (((terminalPattern.test(step.action || "") && terminalInstructionPattern.test(step.action || "")) || codeInstructionPattern.test(step.action || "")) && !commands.length) {
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

  for (const download of downloads.filter((item) => item.filename?.endsWith(".py"))) {
    const named = steps.some((step) => typeof step?.action === "string" && step.action.includes(download.filename));
    if (!named) clarityFinding(`downloaded artifact ${download.filename} is not explicitly named in a step`);
  }

  return { errors, warnings, downloadPaths: downloads.map((item) => item.path), commandCount };
}
