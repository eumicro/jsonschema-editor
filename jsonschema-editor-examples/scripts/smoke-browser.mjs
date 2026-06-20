import { chromium } from "playwright";

const demos = [
  {
    name: "Vue Examples",
    url: "http://localhost:5173",
    react: false,
  },
  {
    name: "React Examples",
    url: "http://localhost:5174",
    react: true,
  },
];

const errors = [];

async function smokeDemo(page, demo) {
  const log = (step, ok, detail = "") => {
    const mark = ok ? "✓" : "✗";
    console.log(`  ${mark} ${step}${detail ? `: ${detail}` : ""}`);
    if (!ok) errors.push(`${demo.name} – ${step}${detail ? `: ${detail}` : ""}`);
  };

  console.log(`\n=== ${demo.name} (${demo.url}) ===`);

  await page.goto(demo.url, { waitUntil: "networkidle" });

  log("Startseite geladen", (await page.title()) !== "");
  log("Szenario-Liste sichtbar", await page.locator(".app__sidebar").isVisible());

  if (demo.react) {
    log("React-Badge", await page.locator(".app__react-badge").isVisible());
  }

  await page.getByRole("tab", { name: "Formular testen" }).click();
  log("Tab Formular", await page.locator("#app-panel-form").isVisible());
  log("JsonSchemaForm Felder", (await page.locator(".jse-field").count()) > 0);

  await page.locator("#app-example-select").selectOption("car-configurator");
  await page.locator(".app__scenario-title").waitFor({ state: "visible" });
  const title = await page.locator(".app__scenario-title").textContent();
  log("Szenario Auto-Konfigurator", title?.includes("Fahrzeug") ?? false, title?.trim());

  log("Stepper im Formular", await page.locator(".jse-stepper").isVisible());

  await page.getByRole("tab", { name: "Schema bearbeiten" }).click();
  log("Tab Schema-Editor", await page.locator("#app-panel-editor").isVisible());
  log("Schema-Struktur-Editor", await page.locator(".jse-structure-editor").first().isVisible());

  await page.getByRole("tab", { name: "Schema-UI" }).click();
  log("UI-Schema Tab", await page.locator("#jse-editor-ui").isVisible());
  log("Layout-Editor", await page.locator(".jse-layout-editor").isVisible());

  await page.getByRole("tab", { name: "JSON" }).click();
  log("Tab JSON", await page.locator("#app-panel-json").isVisible());
  const json = await page.locator(".app__json-output").textContent();
  log("JSON-Ausgabe nicht leer", (json?.length ?? 0) > 10);

  await page.getByRole("link", { name: "Erste Schritte" }).click();
  log("Get-Started Seite", page.url().includes("get-started"));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

for (const demo of demos) {
  pageErrors.length = 0;
  await smokeDemo(page, demo);
  if (pageErrors.length) {
    console.log(`  ✗ Konsolenfehler: ${pageErrors.join("; ")}`);
    errors.push(`${demo.name} – Konsolenfehler: ${pageErrors.join("; ")}`);
  } else {
    console.log("  ✓ Keine Konsolenfehler");
  }
}

await browser.close();

if (errors.length) {
  console.error("\nSmoke-Test fehlgeschlagen:");
  for (const err of errors) console.error(`  - ${err}`);
  process.exit(1);
}

console.log("\n✅ Browser-Smoke-Test für Vue + React Examples bestanden.");
