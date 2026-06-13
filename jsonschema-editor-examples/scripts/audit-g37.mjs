import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "..", "docs", "g37-audit");

const findings = [];

function log(section, message, extra = {}) {
  findings.push({ section, message, ...extra });
  console.log(`[${section}] ${message}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto("http://localhost:5173", { waitUntil: "networkidle", timeout: 60_000 });
await page.locator("#app-example-select").selectOption("occupational-health-g37");
await page.waitForTimeout(500);

async function snap(name) {
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
}

// --- Form mode ---
await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
await page.waitForTimeout(400);
await snap("form-step1-aufnahme");

const labels = await page.locator(".jse-field__label").allTextContents();
const badLabels = labels.filter((t) => t.includes("G37 –") && t.length > 40);
log("form-labels", `${labels.length} labels, ${badLabels.length} with root title fallback`);
if (badLabels.length) log("form-labels", `Bad: ${badLabels.slice(0, 3).join(" | ")}`);

const step1Fields = await page.locator(".jse-stepper__panel .jse-field").count();
log("form-step1", `${step1Fields} fields visible on Aufnahme`);

// Step 2 Anamnese
await page.getByRole("button", { name: "Weiter" }).click();
await page.waitForTimeout(300);
await snap("form-step2-anamnese-allgemein");

const tabs = await page.getByRole("tab").allTextContents();
log("form-anamnese", `Tabs: ${tabs.join(", ")}`);

await page.getByRole("tab", { name: "Arbeitsplatz" }).click();
await page.waitForTimeout(200);
await snap("form-step2-anamnese-arbeit");

// Step 3 Untersuchung
await page.getByRole("button", { name: "Weiter" }).click();
await page.waitForTimeout(300);
await snap("form-step3-untersuchung-erst");

const oneOfCount = await page.locator(".jse-oneof-field").count();
const nestedFields = await page.locator(".jse-stepper__panel .jse-field").count();
log("form-untersuchung", `oneOf blocks: ${oneOfCount}, total fields: ${nestedFields}`);

// Switch program types
const programSelect = page
  .getByRole("group", { name: "Erst- / Nach- / Ergänzungsuntersuchung" })
  .locator("select.jse-field__input")
  .first();
for (const label of ["Nachuntersuchung", "Ergänzungsuntersuchung", "Erstuntersuchung"]) {
  await programSelect.selectOption({ label });
  await page.waitForTimeout(400);
  await snap(`form-step3-${label.toLowerCase().replace(/[^a-z]/g, "")}`);
  const fields = await page.locator(".jse-stepper__panel .jse-field").count();
  log("form-program", `${label}: ${fields} fields`);
}

// Step 4 Beurteilung
await page.getByRole("button", { name: "Weiter" }).click();
await page.waitForTimeout(300);
await snap("form-step4-beurteilung");

const beurteilungSelect = page.locator(".jse-stepper__panel .jse-oneof-field").first().locator("select");
const beurteilungOptions = await beurteilungSelect.locator("option").allTextContents();
log("form-beurteilung", `Options: ${beurteilungOptions.join(", ")}`);

for (let i = 0; i < beurteilungOptions.length; i++) {
  await beurteilungSelect.selectOption(String(i));
  await page.waitForTimeout(200);
}
await snap("form-step4-beurteilung-variants");

// --- Editor mode ---
await page.getByRole("tab", { name: "Form-Editor" }).click();
await page.waitForTimeout(600);
await snap("editor-overview");

await page.getByRole("tab", { name: "Schema-UI" }).click();
await page.waitForTimeout(400);
await snap("editor-ui-layout");

await page.getByRole("tab", { name: "Schema", exact: true }).click();
await page.waitForTimeout(400);
await snap("editor-schema-tree");

if (errors.length) {
  log("console", `${errors.length} page errors`, { errors: errors.slice(0, 10) });
} else {
  log("console", "No page errors");
}

writeFileSync(join(outDir, "findings.json"), JSON.stringify(findings, null, 2));
await browser.close();
console.log(`\nAudit written to ${outDir}`);
