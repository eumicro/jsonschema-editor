import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { openFormMode, readFormOutput, selectExample, uploadToFileField } from "./helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sampleImage = path.join(__dirname, "fixtures", "sample.png");

test.describe("Datei-Upload (x-file)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "file-qa");
    await openFormMode(page);
  });

  test("lädt Einzelbild und schreibt FileDescriptor ins JSON", async ({ page }) => {
    const avatarField = page.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: /Profilbild/ }),
    });

    await uploadToFileField(page, avatarField, sampleImage);
    await expect(avatarField.locator(".jse-file-field__name")).toHaveText("sample.png");
    await expect(avatarField.locator(".jse-file-field__thumb-image")).toBeVisible();

    const output = await readFormOutput(page);
    const avatar = output.avatar as Record<string, unknown>;
    expect(avatar.name).toBe("sample.png");
    expect(avatar.mimeType).toBe("image/png");
    expect(typeof avatar.id).toBe("string");
  });

  test("Mehrfach-Upload: Galerie öffnen und Datei löschen", async ({ page }) => {
    const listField = page.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: /Anhänge/ }),
    });

    await uploadToFileField(page, listField, [sampleImage, sampleImage]);
    await expect(listField.locator(".jse-file-field__item")).toHaveCount(2);

    await listField.locator(".jse-file-field__icon-btn").first().click();
    await expect(page.locator(".jse-file-gallery")).toBeVisible();
    await expect(page.locator(".jse-file-gallery__image")).toBeVisible();

    await page.locator(".jse-file-gallery__icon-btn--danger").click();
    await expect(listField.locator(".jse-file-field__item")).toHaveCount(1);
    await expect(page.locator(".jse-file-gallery__counter")).toHaveText("1 / 1");

    await page.getByRole("button", { name: "Close gallery" }).click();
    await expect(page.locator(".jse-file-gallery")).toHaveCount(0);

    const output = await readFormOutput(page);
    expect(Array.isArray(output.anhaenge)).toBe(true);
    expect((output.anhaenge as unknown[]).length).toBe(1);
  });
});
