/**
 * README-Demo: Attribut anlegen → UI platzieren → Formular ausfüllen.
 *
 * Toolchain: Playwright (Screenshots) → gifenc (PNG-Frames → GIF)
 */
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PNG } from "pngjs";
import { chromium, type Page } from "playwright";

const require = createRequire(import.meta.url);
const { default: GIFEncoder, applyPalette, quantize } = require("gifenc") as {
  default: () => ReturnType<typeof import("gifenc").default>;
  applyPalette: (data: Uint8Array, palette: number[][]) => Uint8Array;
  quantize: (data: Uint8Array, maxColors: number) => number[][];
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(examplesRoot, "..");
const outputGif = path.join(repoRoot, "docs", "demo.gif");
const framesDir = path.join(examplesRoot, "scripts", ".demo-frames");

const VIEWPORT = { width: 1100, height: 640 };
const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:5173";
const FRAME_DELAY_MS = 840;
const PROPERTY_NAME = "notiz";
const PROPERTY_TITLE = "Notiz";
const PROPERTY_VALUE = "Wichtige Anmerkung";

let frameCounter = 0;

async function pause(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function snap(page: Page, label: string): Promise<void> {
  const framePath = path.join(framesDir, `${String(frameCounter++).padStart(3, "0")}-${label}.png`);
  await page.screenshot({ path: framePath, type: "png", animations: "disabled" });
}

async function panelClick(page: Page, dialogName: string | RegExp, buttonName: string | RegExp): Promise<void> {
  const button = page.getByRole("dialog", { name: dialogName }).getByRole("button", { name: buttonName });
  await button.evaluate((element) => {
    (element as HTMLButtonElement).click();
  });
}

async function closeFloatingPanels(page: Page): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const dialogs = page.getByRole("dialog");
    if ((await dialogs.count()) === 0) return;
    const closeButton = dialogs.first().getByRole("button", { name: "Schließen" });
    if (await closeButton.count()) {
      await closeButton.evaluate((element) => {
        (element as HTMLButtonElement).click();
      });
    } else {
      await page.keyboard.press("Escape");
    }
    await pause(120);
  }
}

async function preparePage(page: Page): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: `
      .app__lead, .app__workflow, .app__example-desc, .app__form-hint, .app__output-details {
        display: none !important;
      }
    `,
  });
  await page.locator(".app__example-select").selectOption("person-with-defs");
  await page.getByRole("tab", { name: "Form-Editor" }).click();
  await page.getByRole("tab", { name: "Schema", exact: true }).click();
}

async function addSchemaProperty(page: Page): Promise<void> {
  const schemaPanel = page.locator("#jse-editor-schema");

  await snap(page, "schema-start");
  await schemaPanel.getByRole("button", { name: "Element zu Mensch hinzufügen" }).click();
  await snap(page, "add-dialog");

  const addPanel = page.getByRole("dialog", { name: "Element hinzufügen" });
  await addPanel.getByPlaceholder("z. B. name").fill(PROPERTY_NAME);
  await snap(page, "add-name");
  await panelClick(page, "Element hinzufügen", "+ string");
  await snap(page, "add-created");
  await closeFloatingPanels(page);
  await schemaPanel.getByText(PROPERTY_NAME, { exact: true }).waitFor();
  await snap(page, "schema-done");
}

async function placeInUiSchema(page: Page): Promise<void> {
  await page.locator("#jse-editor-tab-ui").click();
  await page.locator("#jse-editor-ui .jse-layout-editor").waitFor({ state: "visible" });
  await snap(page, "ui-tab");

  const uiPanel = page.locator("#jse-editor-ui");
  await page.locator('[aria-label="Element zu VerticalLayout hinzufügen"]').evaluate((element) => {
    (element as HTMLButtonElement).click();
  });

  await panelClick(page, "UI-Element hinzufügen", "+ Control");
  await snap(page, "ui-control-added");

  const newControl = uiPanel.locator(".jse-layout-block--control").filter({ hasText: "Feld" }).last();
  await newControl.locator('[aria-label="Feld bearbeiten"]').evaluate((element) => {
    (element as HTMLButtonElement).click();
  });

  const uiAttrPanel = page.getByRole("dialog", { name: "UI – Feld" });
  await uiAttrPanel
    .locator(".jse-attribute-control")
    .filter({ hasText: "scope" })
    .locator("input")
    .fill(`#/$defs/Mensch/properties/${PROPERTY_NAME}`);
  await uiAttrPanel
    .locator(".jse-attribute-control")
    .filter({ hasText: "label" })
    .locator("input")
    .fill(PROPERTY_TITLE);
  await snap(page, "ui-scope-set");
  await page.getByRole("button", { name: "Schließen" }).click({ force: true });
  await snap(page, "ui-layout");

  const emailControl = uiPanel
    .locator(".jse-layout-block--control")
    .filter({ hasText: PROPERTY_TITLE })
    .first();
  await emailControl.dragTo(uiPanel.locator(".jse-layout-dropzone").first());
  await snap(page, "ui-placed");
  await snap(page, "ui-done");
}

async function fillForm(page: Page): Promise<void> {
  await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
  await snap(page, "form-tab");

  const oneOfSelect = page.locator(".jse-oneof-field select").first();
  await oneOfSelect.selectOption("0");
  await snap(page, "form-mensch");

  const emailInput = page
    .locator(".jse-field")
    .filter({ has: page.locator(".jse-field__label", { hasText: PROPERTY_TITLE }) })
    .locator("input")
    .first();
  await emailInput.click();
  await emailInput.fill(PROPERTY_VALUE);
  await snap(page, "form-filled");
  await pause(500);
  await snap(page, "form-end");
}

function encodeGif(framePaths: string[]): void {
  const gif = GIFEncoder();

  framePaths.forEach((framePath, index) => {
    const png = PNG.sync.read(readFileSync(framePath));
    const palette = quantize(png.data, 128);
    const indices = applyPalette(png.data, palette);

    gif.writeFrame(indices, png.width, png.height, {
      palette,
      delay: FRAME_DELAY_MS,
      first: index === 0,
    });
  });

  gif.finish();
  writeFileSync(outputGif, Buffer.from(gif.bytes()));
}

async function runDemo(): Promise<string[]> {
  mkdirSync(framesDir, { recursive: true });
  rmSync(outputGif, { force: true });
  frameCounter = 0;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });

  try {
    await preparePage(page);
    await addSchemaProperty(page);
    await placeInUiSchema(page);
    await fillForm(page);
  } finally {
    await browser.close();
  }

  return readdirSync(framesDir)
    .filter((name) => name.endsWith(".png"))
    .sort()
    .map((name) => path.join(framesDir, name));
}

async function main(): Promise<void> {
  console.log("Workflow-Demo aufnehmen …");
  const frames = await runDemo();

  console.log(`${frames.length} Frames → GIF …`);
  mkdirSync(path.dirname(outputGif), { recursive: true });
  encodeGif(frames);

  rmSync(framesDir, { recursive: true, force: true });
  console.log(`Fertig: ${outputGif}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
