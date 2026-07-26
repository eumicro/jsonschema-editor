import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { openFormMode, readFormOutput, selectExample, uploadToFileField } from "./helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleImage = path.join(__dirname, "fixtures", "sample.png");

async function openAbschlussStep(page: import("@playwright/test").Page): Promise<void> {
  await page.getByRole("button", { name: "Abschluss" }).click();
  await expect(
    page.locator(".jse-stepper__panel .jse-field__label", { hasText: "Schadenfotos & Belege" }),
  ).toBeVisible();
  await expect(
    page.locator(".jse-stepper__panel .jse-file-field__name", { hasText: "schadensfall-1.png" }),
  ).toBeVisible({ timeout: 15_000 });
}

test.describe("Schadensmeldung: Datei-Upload", () => {
  test.beforeEach(async ({ page }) => {
    await selectExample(page, "insurance-claim");
    await openFormMode(page);
    await openAbschlussStep(page);
  });

  test("zeigt Demo-Schadenfoto und lädt weiteres Foto hoch", async ({ page }) => {
    const uploadField = page.locator(".jse-stepper__panel .jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: /Schadenfotos & Belege/ }),
    });

    await expect(uploadField.locator(".jse-file-field__item")).toHaveCount(1);
    await expect(uploadField.locator(".jse-file-field__name")).toHaveText("schadensfall-1.png");
    await expect(uploadField.locator(".jse-file-field__thumb-image")).toBeVisible();

    await uploadToFileField(page, uploadField, sampleImage);

    await expect(uploadField.locator(".jse-file-field__item")).toHaveCount(2);
    await expect(uploadField.locator(".jse-file-field__name").filter({ hasText: "sample.png" })).toBeVisible();

    const output = await readFormOutput(page);
    const abschluss = output.abschluss as Record<string, unknown>;
    const fotos = abschluss.schadenfotos as Array<Record<string, unknown>>;
    expect(fotos).toHaveLength(2);
    expect(fotos.some((file) => file.name === "schadensfall-1.png")).toBe(true);
    expect(fotos.some((file) => file.name === "sample.png")).toBe(true);
  });

  test("Mehrfach-Upload: Galerie öffnen und Datei entfernen", async ({ page }) => {
    const uploadField = page.locator(".jse-stepper__panel .jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: /Schadenfotos & Belege/ }),
    });

    await expect(uploadField.locator(".jse-file-field__item")).toHaveCount(1);

    await uploadToFileField(page, uploadField, [sampleImage, sampleImage]);
    await expect(uploadField.locator(".jse-file-field__item")).toHaveCount(3);

    await uploadField.locator(".jse-file-field__icon-btn").first().click();
    await expect(page.locator(".jse-file-gallery")).toBeVisible();
    await expect(page.locator(".jse-file-gallery__image")).toBeVisible();

    await page.locator(".jse-file-gallery__icon-btn--danger").click();
    await expect(uploadField.locator(".jse-file-field__item")).toHaveCount(2);
    await expect(page.locator(".jse-file-gallery__counter")).toHaveText("1 / 2");

    await page.getByRole("button", { name: "Close gallery" }).click();
    await expect(page.locator(".jse-file-gallery")).toHaveCount(0);

    const output = await readFormOutput(page);
    const abschluss = output.abschluss as Record<string, unknown>;
    expect((abschluss.schadenfotos as unknown[]).length).toBe(2);
  });
});
