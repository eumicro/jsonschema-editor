import type { Locator, Page } from "@playwright/test";

import type { ExampleId } from "../src/examples/catalog";

export async function selectExample(page: Page, id: ExampleId): Promise<void> {
  await page.locator("#app-example-select").waitFor({ state: "attached" });
  await page.locator("#app-example-select").selectOption(id);
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
