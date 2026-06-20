import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function selectExample(page: Page, id: string): Promise<void> {
  const select = page.locator("#app-example-select");
  await select.waitFor({ state: "attached" });
  const label = await select.locator(`option[value="${id}"]`).textContent();
  await select.selectOption(id);
  await expect(select).toHaveValue(id);
  if (label) {
    await expect(page.locator(".app__scenario-title")).toHaveText(label.trim(), {
      timeout: 30_000,
    });
  }
}

export async function openFormMode(page: Page): Promise<void> {
  await page.getByRole("tab", { name: "Formular testen" }).click();
}

export async function openEditorMode(page: Page): Promise<void> {
  await page.getByRole("tab", { name: "Schema bearbeiten" }).click();
}

/** Upload via the visible button so the browser fires change on the file input. */
export async function uploadToFileField(
  page: Page,
  field: Locator,
  files: string | string[],
): Promise<void> {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await field.getByRole("button", { name: /Add files|Choose file/i }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(files);
}

/** Variant selector of the root oneOf field (excludes nested property selects). */
export function oneOfSelect(page: Page) {
  return page.locator(".jse-oneof-field > .jse-field").first().locator("select");
}

export async function readFormOutput(page: Page): Promise<Record<string, unknown>> {
  const raw = await page.locator(".app__form-data-output").textContent();
  return JSON.parse(raw ?? "{}") as Record<string, unknown>;
}

export async function fieldLabels(page: Page): Promise<string[]> {
  return page.locator(".jse-field__label").allTextContents();
}
