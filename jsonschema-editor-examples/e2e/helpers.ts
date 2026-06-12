import type { Page } from "@playwright/test";

import type { ExampleId } from "../src/examples/catalog";

export async function selectExample(page: Page, id: ExampleId): Promise<void> {
  await page.locator(".app__example-select").selectOption(id);
}

export async function openFormMode(page: Page): Promise<void> {
  await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
}

export async function openEditorMode(page: Page): Promise<void> {
  await page.getByRole("tab", { name: "Form-Editor" }).click();
}

export function oneOfSelect(page: Page) {
  return page.locator(".jse-oneof-field select");
}

export async function readFormOutput(page: Page): Promise<Record<string, unknown>> {
  const raw = await page.locator(".app__output").textContent();
  return JSON.parse(raw ?? "{}") as Record<string, unknown>;
}

export async function fieldLabels(page: Page): Promise<string[]> {
  return page.locator(".jse-field__label").allTextContents();
}
