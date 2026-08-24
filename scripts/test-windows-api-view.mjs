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
requireCondition(unicodeMatches.length === 1 && unicodeMatches[0]?.family?.id === "create-event", "Unicode event search did not return CreateEvent exactly once");

// This catches source URLs being omitted from variant search text.
const sourceMatches = view.filterFamilies?.(guide.families, "nf-synchapi-createeventexa") || [];
requireCondition(sourceMatches.length === 1 && sourceMatches[0]?.family?.id === "create-event", "variant Microsoft Learn source is not searchable");

const familyRows = view.renderEntries?.(exaMatches, true) || "";
requireCondition(familyRows.includes('data-windows-api-family="create-event"'), "family row is missing its family data attribute");
requireCondition(familyRows.includes('data-windows-api-variant="CreateEventExA"'), "family row is missing its selected-variant data attribute");
requireCondition(familyRows.includes("CreateEventExA"), "family row omits compact variant labels");

const dialogHtml = view.filterFamilies ? view.renderDialog?.(createEvent, "CreateEventExA") || "" : "";
requireCondition(dialogHtml.includes('role="tablist"'), "family popup is missing its variant tab list");
requireCondition((dialogHtml.match(/data-api-variant=/g) || []).length === 4, "family popup does not render four variant buttons");
requireCondition((dialogHtml.match(/aria-selected="true"/g) || []).length === 1, "family popup does not expose exactly one selected variant");
requireCondition(dialogHtml.includes("Recommended") && dialogHtml.includes("CreateEventW"), "recommended CreateEventW marker is missing");
requireCondition(!dialogHtml.includes("<dialog") && !dialogHtml.includes("<details") && !dialogHtml.includes("<summary"), "family popup contains a nested disclosure or dialog");
requireCondition(dialogHtml.includes("CreateEventExA.argtypes"), "selected variant Python signature is absent");
requireCondition(dialogHtml.includes("CreateEventExA("), "selected variant native signature is absent");
requireCondition(!dialogHtml.includes("CreateEventW.argtypes") && !dialogHtml.includes("CreateEventExW.argtypes"), "family popup leaks a non-selected variant signature");
requireCondition(!dialogHtml.includes("nf-synchapi-createeventw"), "family popup leaks a non-selected variant source");

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

const html = view.render?.(guide, "CreateEventExA") || "";
requireCondition(html.includes('id="windows-api-count">1 Family'), "family guide count does not use family terminology");
requireCondition(!html.includes("CreateEventExA.argtypes"), "filtered family guide renders contract details inline");
for (const expected of [
  "windowsApiView.filterFamilies(windowsApiGuide.families",
  "openWindowsApiDetails(exact.family.id, exact.selectedVariant)",
  "trigger.dataset.windowsApiFamily",
  "trigger.dataset.windowsApiVariant",
]) requireCondition(appSource.includes(expected), `family popup integration is missing: ${expected}`);
for (const selector of [".api-family-variants", ".api-variant-tab", ".api-variant-aliases", ".api-variant-availability", ".api-key-behaviors"]) {
  requireCondition(styles.includes(selector), `family selector stylesheet is missing ${selector}`);
}

const versions = [...indexHtml.matchAll(/(?:href|src)="[^"]+\?v=([^"]+)"/g)];
requireCondition(versions.length > 0 && versions.every((match) => match[1] === "windows-api-families-3"), "every tied asset must use the windows-api-families-3 release key");

console.log(`family matches: ${exaMatches.length}`);
console.log(`errors: ${errors.length}`);
for (const error of errors) console.log(`ERROR ${error}`);
if (errors.length) process.exitCode = 1;
