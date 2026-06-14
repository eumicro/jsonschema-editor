/**
 * README demo: Schadensmeldung (Geometry, oneOf, x-file, x-computed) and
 * Förderantrag (CEL status workflow). Playwright → gifenc.
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

const VIEWPORT = {
  width: Number(process.env.DEMO_WIDTH ?? 1920),
  height: Number(process.env.DEMO_HEIGHT ?? 1080),
};
const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:5173";

/** Delay between GIF frames — slower = calmer playback. */
const FRAME_DELAY_MS = 1500;
const PAUSE = {
  short: 700,
  medium: 1200,
  long: 2200,
  map: 3200,
} as const;

let frameCounter = 0;

async function pause(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function snap(page: Page, label: string): Promise<void> {
  const framePath = path.join(framesDir, `${String(frameCounter++).padStart(3, "0")}-${label}.png`);
  await page.screenshot({ path: framePath, type: "png", animations: "disabled" });
}

async function preparePage(page: Page): Promise<void> {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.addStyleTag({
    content: `
      .app__hero, .app__scenario-desc, .app__nav-item-tagline {
        display: none !important;
      }
    `,
  });
  await page.getByRole("tab", { name: "Formular testen" }).click();
}

async function selectScenario(page: Page, exampleId: string, heading: string): Promise<void> {
  await page.locator("#app-example-select").waitFor({ state: "attached" });
  await page.locator("#app-example-select").selectOption(exampleId);
  await page.getByRole("heading", { name: heading }).waitFor({ state: "visible", timeout: 15_000 });
  await page.locator(".jse-stepper__step-button").first().waitFor({ state: "visible", timeout: 15_000 });
  await pause(PAUSE.long);
}

async function waitForActiveStep(page: Page, stepLabel: string): Promise<void> {
  await page
    .locator(".jse-stepper__step-indicator--active .jse-stepper__step-label")
    .filter({ hasText: stepLabel })
    .waitFor({ state: "visible", timeout: 15_000 });
}

async function goToStep(page: Page, stepLabel: string): Promise<void> {
  await page
    .locator(".jse-stepper__step-button")
    .filter({ hasText: stepLabel })
    .click();
  await waitForActiveStep(page, stepLabel);
  await pause(PAUSE.medium);
}

function panel(page: Page) {
  return page.locator(".jse-stepper__panel");
}

function statusField(page: Page) {
  return panel(page).locator(".jse-field").filter({
    has: page.locator(".jse-field__label", { hasText: "Bearbeitungsstand" }),
  });
}

async function recordInsuranceClaim(page: Page): Promise<void> {
  await selectScenario(page, "insurance-claim", "Schadensmeldung");
  await waitForActiveStep(page, "Vorgang");
  await pause(PAUSE.short);
  await snap(page, "claim-vorgang");

  await goToStep(page, "Schadenfall");
  await page.locator(".jse-geometry-map").scrollIntoViewIfNeeded();
  await page.locator(".jse-geometry-map .leaflet-tile-pane img").first().waitFor({
    state: "visible",
    timeout: 12_000,
  }).catch(() => undefined);
  await pause(PAUSE.map);
  await snap(page, "claim-geometry");

  await goToStep(page, "Schadendetails");
  await page.locator(".jse-oneof-field select, .jse-field select").first().waitFor({ state: "visible" });
  await pause(PAUSE.long);
  await snap(page, "claim-oneof");

  await goToStep(page, "Abschluss");
  await page.locator(".jse-file-field__name", { hasText: "schadensfall-1.png" }).waitFor({
    state: "visible",
    timeout: 15_000,
  });
  await page.locator(".jse-file-field__thumb-image").waitFor({ state: "visible", timeout: 10_000 });
  await pause(PAUSE.long);
  await snap(page, "claim-files");

  const previewBtn = page.locator(".jse-file-field__icon-btn").first();
  if (await previewBtn.isVisible()) {
    await previewBtn.click();
    await page.locator(".jse-file-gallery").waitFor({ state: "visible" });
    await pause(PAUSE.long);
    await snap(page, "claim-gallery");
    await page.getByRole("button", { name: "Close gallery" }).click();
    await pause(PAUSE.short);
  }
}

async function recordFoerderantrag(page: Page): Promise<void> {
  await selectScenario(page, "computed-status-qa", "Förderantrag");
  await expectStatus(page, "NEU");
  await pause(PAUSE.long);
  await snap(page, "grant-start");

  const dateField = panel(page).locator(".jse-field").filter({
    has: page.locator(".jse-field__label", { hasText: "Antragsdatum" }),
  });
  await dateField.locator("input").fill("2026-06-01");
  await pause(PAUSE.medium);
  await expectStatus(page, "ANTRAG_ANGELEGT");
  await snap(page, "grant-date");

  await goToStep(page, "Auftragsdaten");
  await panel(page).locator(".jse-field").filter({
    has: page.locator(".jse-field__label", { hasText: "Adresse zum Antrag" }),
  }).locator("input").fill("Musterstraße 1, Neulehe");
  await pause(PAUSE.medium);
  await expectStatus(page, "BEREIT_ZUR_DURCHFUEHRUNG");
  await snap(page, "grant-address");

  await goToStep(page, "Durchführung");
  await panel(page).locator(".jse-field").filter({
    has: page.locator(".jse-field__label", { hasText: "Datum der Durchführung" }),
  }).locator("input").fill("2026-07-15");
  await pause(PAUSE.medium);
  await expectStatus(page, "DURCHGEFUEHRT");
  await snap(page, "grant-execution");

  await goToStep(page, "Abrechnung");
  await panel(page).locator(".jse-field").filter({
    has: page.locator(".jse-field__label", { hasText: "Rechnung beglichen" }),
  }).locator("input[type=checkbox]").check();
  await pause(PAUSE.medium);
  await expectStatus(page, "ERLEDIGT");
  await pause(PAUSE.long);
  await snap(page, "grant-done");
}

async function expectStatus(page: Page, value: string): Promise<void> {
  await statusField(page).locator("input").waitFor({ state: "visible" });
  const input = statusField(page).locator("input");
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if ((await input.inputValue()) === value) return;
    await pause(150);
  }
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
    await snap(page, "intro");
    await pause(PAUSE.medium);
    await recordInsuranceClaim(page);
    await pause(PAUSE.medium);
    await recordFoerderantrag(page);
  } finally {
    await browser.close();
  }

  return readdirSync(framesDir)
    .filter((name) => name.endsWith(".png"))
    .sort()
    .map((name) => path.join(framesDir, name));
}

async function main(): Promise<void> {
  console.log("Recording README demo (Schadensmeldung + Förderantrag) …");
  const frames = await runDemo();

  console.log(`${frames.length} frames → GIF …`);
  mkdirSync(path.dirname(outputGif), { recursive: true });
  encodeGif(frames);

  rmSync(framesDir, { recursive: true, force: true });
  console.log(`Done: ${outputGif}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
