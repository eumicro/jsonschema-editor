/**
 * README demo: complete G37 occupational-health walkthrough (all Stepper steps).
 *
 * Toolchain: Playwright (screenshots) → gifenc (PNG frames → GIF)
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

const VIEWPORT = { width: 1200, height: 760 };
const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:5173";
const FRAME_DELAY_MS = 900;

const G37_STEPS = [
  { label: "Aufnahme", slug: "aufnahme" },
  { label: "Vorgeschichte", slug: "vorgeschichte" },
  { label: "Anamnese", slug: "anamnese" },
  { label: "Untersuchung", slug: "untersuchung" },
  { label: "Beurteilung", slug: "beurteilung" },
  { label: "Beratung", slug: "beratung" },
  { label: "Mitteilung", slug: "mitteilung" },
  { label: "Attest", slug: "attest" },
] as const;

let frameCounter = 0;

async function pause(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function snap(page: Page, label: string): Promise<void> {
  const framePath = path.join(framesDir, `${String(frameCounter++).padStart(3, "0")}-${label}.png`);
  await page.screenshot({ path: framePath, type: "png", animations: "disabled" });
}

async function waitForActiveStep(page: Page, stepLabel: string): Promise<void> {
  await page
    .locator(".jse-stepper__step-indicator--active")
    .filter({ hasText: stepLabel })
    .waitFor({ state: "visible" });
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

  await page.locator("#app-example-select").selectOption("occupational-health-g37");
  await page.getByRole("tab", { name: "Formular testen" }).click();
  await page.locator(".jse-stepper").waitFor({ state: "visible" });
  await waitForActiveStep(page, "Aufnahme");
}

async function highlightStep(page: Page, step: (typeof G37_STEPS)[number]): Promise<void> {
  if (step.label === "Aufnahme") {
    await page.locator(".jse-geometry-map").scrollIntoViewIfNeeded();
    await pause(350);
    return;
  }

  if (step.label === "Anamnese") {
    await page.getByRole("tab", { name: "Arbeitsplatz" }).click();
    await pause(250);
    return;
  }

  if (step.label === "Untersuchung") {
    await page.getByText("Sehschärfe Ferne").scrollIntoViewIfNeeded();
    await pause(250);
    return;
  }

  if (step.label === "Mitteilung") {
    await page.getByText("Beurteilungskategorie").scrollIntoViewIfNeeded();
    await pause(250);
  }
}

async function walkThroughG37(page: Page): Promise<void> {
  await snap(page, "g37-overview");

  for (let index = 0; index < G37_STEPS.length; index += 1) {
    const step = G37_STEPS[index];

    if (index > 0) {
      await page.getByRole("button", { name: "Weiter" }).click();
      await waitForActiveStep(page, step.label);
    }

    await highlightStep(page, step);
    await snap(page, `g37-${step.slug}`);
    await pause(350);
  }

  await pause(600);
  await snap(page, "g37-complete");
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
    await walkThroughG37(page);
  } finally {
    await browser.close();
  }

  return readdirSync(framesDir)
    .filter((name) => name.endsWith(".png"))
    .sort()
    .map((name) => path.join(framesDir, name));
}

async function main(): Promise<void> {
  console.log("Recording G37 walkthrough demo …");
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
