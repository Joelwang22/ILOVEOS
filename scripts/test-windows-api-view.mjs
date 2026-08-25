import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptsDirectory, "..");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const errors = [];
const requireCondition = (condition, message) => { if (!condition) errors.push(message); };

globalThis.window = {};
for (const filename of [
  "reference-data.js", "api-signatures.js", "api-signatures-stage3.js", "api-signatures-stage4.js",
  "api-signatures-stage6.js", "windows-api-families.js", "windows-api-data.js",
  "reference-overview-view.js", "windows-api-view.js",
]) vm.runInThisContext(fs.readFileSync(path.join(root, filename), "utf8"), { filename });

const guide = window.ILOVEOS_WINDOWS_API_GUIDE;
const view = window.ILOVEOS_WINDOWS_API_VIEW;
const createEvent = guide.families.find((family) => family.id === "create-event");

// This catches a search implementation that returns one result per variant instead of one family.
const exaMatches = view.filterFamilies?.(guide.families, "CreateEventExA") || [];
requireCondition(exaMatches.length === 1, `expected one CreateEventExA family match, found ${exaMatches.length}`);
requireCondition(exaMatches[0]?.family?.name === "CreateEvent", "CreateEventExA did not resolve to the CreateEvent family");
requireCondition(exaMatches[0]?.selectedVariant === "CreateEventExA", "CreateEventExA did not select its exact variant");

// This catches aliases being searched but not routed to the alias target.
const aliasMatches = view.filterFamilies?.(guide.families, "CreateEventEx") || [];
requireCondition(aliasMatches.length === 1, `expected one CreateEventEx alias match, found ${aliasMatches.length}`);
requireCondition(aliasMatches[0]?.family?.id === "create-event", "CreateEventEx alias did not return CreateEvent");
requireCondition(aliasMatches[0]?.selectedVariant === "CreateEventExW", "CreateEventEx alias did not select CreateEventExW");

// This catches search text that omits variant-only descriptive fields.
const unicodeMatches = view.filterFamilies?.(guide.families, "Unicode event") || [];
requireCondition(unicodeMatches.filter((match) => match.family.id === "create-event").length === 1, "Unicode event search did not return CreateEvent exactly once");

// This catches source URLs being omitted from variant search text.
const sourceMatches = view.filterFamilies?.(guide.families, "nf-synchapi-createeventexa") || [];
requireCondition(sourceMatches.length === 1 && sourceMatches[0]?.family?.id === "create-event", "variant Microsoft Learn source is not searchable");

const familyRows = view.renderEntries?.(exaMatches, true) || "";
requireCondition(familyRows.includes('data-windows-api-family="create-event"'), "family row is missing its family data attribute");
requireCondition(familyRows.includes('data-windows-api-variant="CreateEventExA"'), "family row is missing its selected-variant data attribute");
requireCondition(familyRows.includes("CreateEventExA"), "family row omits compact variant labels");
requireCondition(!familyRows.includes("Native Windows contracts and Python translations"), "Windows API category header repeats the guide purpose subtitle");

const dialogHtml = view.filterFamilies ? view.renderDialog?.(createEvent, "CreateEventExA") || "" : "";
requireCondition(dialogHtml.includes('role="tablist"'), "family popup is missing its variant tab list");
requireCondition((dialogHtml.match(/data-api-variant=/g) || []).length === 4, "family popup does not render four variant buttons");
requireCondition((dialogHtml.match(/aria-selected="true"/g) || []).length === 1, "family popup does not expose exactly one selected variant");
const variantTabsHtml = dialogHtml.match(/<div class="api-family-variants"[\s\S]*?<\/div>/)?.[0] || "";
requireCondition(!variantTabsHtml.includes("Recommended") && !variantTabsHtml.includes("api-variant-recommended"), "family popup still renders a visible recommended marker");
requireCondition(!dialogHtml.includes("<dialog") && !dialogHtml.includes("<details") && !dialogHtml.includes("<summary"), "family popup contains a nested disclosure or dialog");
requireCondition(dialogHtml.includes("CreateEventExA.argtypes"), "selected variant Python signature is absent");
requireCondition(dialogHtml.includes("CreateEventExA("), "selected variant native signature is absent");
requireCondition(!dialogHtml.includes("CreateEventW.argtypes") && !dialogHtml.includes("CreateEventExW.argtypes"), "family popup leaks a non-selected variant signature");
requireCondition(!dialogHtml.includes("nf-synchapi-createeventw"), "family popup leaks a non-selected variant source");
requireCondition(!dialogHtml.includes("api-variant-availability") && !dialogHtml.includes("<strong>Availability</strong>"), "family popup still renders an Availability section");
requireCondition(!dialogHtml.includes("<span>Use when</span>") && !dialogHtml.includes("<span>Recommended Python path</span>"), "family popup still renders removed guidance panels");
requireCondition(/<div class="api-family-alias-picker">\s*<strong>Aliases:<\/strong>\s*<div class="api-family-variants"/.test(dialogHtml), "Aliases label is not directly above the clickable variant buttons");
requireCondition(!dialogHtml.includes("api-variant-aliases") && !dialogHtml.includes("api-variant-alias-list"), "family popup still renders the explanatory alias mapping section");

const defaultDialogHtml = view.renderDialog?.(createEvent) || "";
requireCondition(defaultDialogHtml.includes("CreateEvent · CreateEventW"), "removing the visible marker changed the preferred default variant");

const availabilityOnlyFamily = {
  ...createEvent,
  id: "availability-only-fixture",
  name: "AvailabilityOnlyFixture",
  summary: "Fixture without the search phrase.",
  aliases: [],
  variants: createEvent.variants.map((variant) => ({
    ...variant,
    availability: "UniqueAvailabilitySearchToken",
    useWhen: "UniqueUseWhenSearchToken",
    pywin32: "UniquePythonPathSearchToken",
  })),
};
requireCondition((view.filterFamilies?.([availabilityOnlyFamily], "UniqueAvailabilitySearchToken") || []).length === 0, "removed availability metadata is still included in guide search");
requireCondition((view.filterFamilies?.([availabilityOnlyFamily], "UniqueUseWhenSearchToken") || []).length === 0, "removed useWhen metadata is still included in guide search");
requireCondition((view.filterFamilies?.([availabilityOnlyFamily], "UniquePythonPathSearchToken") || []).length === 0, "removed pywin32-path metadata is still included in guide search");

// This catches dynamic family text being interpolated into the dialog without escaping.
const unsafeFamily = {
  ...createEvent,
  name: '<script>alert("family")</script>',
  summary: '<img src=x onerror="alert(1)">',
};
const unsafeDialog = view.renderDialog?.(unsafeFamily, "CreateEventW") || "";
requireCondition(!unsafeDialog.includes('<script>alert("family")</script>') && unsafeDialog.includes("&lt;script&gt;alert(&quot;family&quot;)&lt;/script&gt;"), "family heading is not HTML escaped");
requireCondition(!unsafeDialog.includes('<img src=x onerror="alert(1)">') && unsafeDialog.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"), "family summary is not HTML escaped");

const singleton = guide.families.find((family) => family.variants.length === 1);
const singletonHtml = view.filterFamilies ? view.renderDialog?.(singleton, singleton?.recommendedVariant) || "" : "";
requireCondition(!singletonHtml.includes('role="tablist"'), "singleton family renders unnecessary variant controls");

// Exhaustive release search: exact callable and alias terms collapse to one
// owning family, select the intended contract, and include contextual values.
for (const family of guide.families) {
  for (const variant of family.variants) {
    const matches = view.filterFamilies?.(guide.families, variant.name) || [];
    requireCondition(matches.length === 1, `${variant.name} search returned ${matches.length} families`);
    requireCondition(matches[0]?.family.id === family.id, `${variant.name} search returned the wrong family`);
    requireCondition(matches[0]?.selectedVariant === variant.name, `${variant.name} search did not select the exact variant`);
    for (const parameter of variant.parameters) {
      const resolved = window.ILOVEOS_WINDOWS_API_FAMILY_DATA.resolveParameterChoices(parameter.choiceBinding, "native");
      if (parameter.choiceBinding) requireCondition(Boolean(resolved), `${variant.name}.${parameter.name} renders an unbound choice set`);
      for (const value of resolved?.values || []) {
        const valueMatches = view.filterFamilies?.(guide.families, value.code) || [];
        requireCondition(valueMatches.some((match) => match.family.id === family.id), `${variant.name}.${parameter.name} choice ${value.code} is not searchable`);
      }
    }
    for (const behavior of variant.keyBehaviors) {
      requireCondition(variant.sources.some((source) => source.startsWith("https://learn.microsoft.com/")), `${variant.name} behavior lacks an authoritative source`);
      requireCondition(behavior !== variant.result && behavior !== variant.cleanup, `${variant.name} duplicates behavior prose in an outcome`);
    }
  }
  for (const alias of family.aliases) {
    const matches = view.filterFamilies?.(guide.families, alias.name) || [];
    requireCondition(matches.length === 1 && matches[0].family.id === family.id, `${alias.name} alias search did not return exactly one family`);
    requireCondition(matches[0]?.selectedVariant === alias.target, `${alias.name} alias did not select ${alias.target}`);
  }
}

const escapedChoices = view.renderParameterChoices?.({
  id: "unsafe-choice",
  kind: "enum",
  source: "https://learn.microsoft.com/example?x=<unsafe>",
  values: [{ name: "unsafe", code: '<VALUE & "quote">', useWhen: "Escape this value." }],
  example: { code: "A < B & C", useWhen: "Escape this example." },
}, "unsafe") || "";
requireCondition(!escapedChoices.includes('<VALUE & "quote">') && escapedChoices.includes("&lt;VALUE &amp; &quot;quote&quot;&gt;"), "choice copy expression is not HTML escaped");
requireCondition(escapedChoices.includes('data-api-value-code="&lt;VALUE &amp; &quot;quote&quot;&gt;"'), "escaped copy expression is missing from its control");

const bitmaskChoices = view.renderParameterChoices?.({
  id: "creation-flags",
  kind: "bitmask",
  source: "https://learn.microsoft.com/en-us/windows/win32/example",
  values: [{ name: "CREATE_ONE", code: "CREATE_ONE", useWhen: "Select this creation behavior." }],
}, "bitmask") || "";
requireCondition(bitmaskChoices.includes("<strong>Common flags</strong>"), "bitmask choice heading must use neutral flag wording");
requireCondition(!bitmaskChoices.includes("Common access values"), "bitmask choice heading incorrectly implies every flag is an access right");

const html = view.render?.(guide, "CreateEventExA") || "";
requireCondition(html.includes('id="windows-api-count">1 Family'), "family guide count does not use family terminology");
requireCondition(!html.includes("CreateEventExA.argtypes"), "filtered family guide renders contract details inline");
for (const expected of [
  "windowsApiView.filterFamilies(windowsApiGuide.families",
  "openWindowsApiDetails(exact.family.id, exact.selectedVariant)",
  "trigger.dataset.windowsApiFamily",
  "trigger.dataset.windowsApiVariant",
]) requireCondition(appSource.includes(expected), `family popup integration is missing: ${expected}`);
for (const selector of [".api-family-alias-picker", ".api-family-variants", ".api-variant-tab", ".api-key-behaviors"]) {
  requireCondition(styles.includes(selector), `family selector stylesheet is missing ${selector}`);
}

const versions = [...indexHtml.matchAll(/(?:href|src)="[^"]+\?v=([^"]+)"/g)];
requireCondition(versions.length > 0 && versions.every((match) => match[1] === "stage-8-accessibility-1"), "every tied asset must use the stage-8-accessibility-1 release key");

console.log(`family matches: ${exaMatches.length}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
