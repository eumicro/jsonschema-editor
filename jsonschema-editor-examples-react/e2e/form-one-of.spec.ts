import { expect, test } from "@playwright/test";
import {
  fieldLabels,
  oneOfSelect,
  openFormMode,
  readFormOutput,
  selectExample,
} from "./helpers";

test.describe("oneOf-Formular", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "person-one-of");
    await openFormMode(page);
  });

  test("startet mit Name-Feld (Mensch)", async ({ page }) => {
    await expect(page.locator(".jse-field__label", { hasText: /^Name/ })).toBeVisible();
    const output = await readFormOutput(page);
    expect(output.name).toBe("Max Mustermann");
    expect(output).not.toHaveProperty("nummer");
  });

  test("Wechsel Mensch → Maschine zeigt Nummer-Feld", async ({ page }) => {
    await oneOfSelect(page).selectOption("1");

    await expect(page.locator(".jse-field__label", { hasText: /^Nummer/ })).toBeVisible();
    await expect(page.locator(".jse-field__label", { hasText: /^Name/ })).toHaveCount(0);

    const output = await readFormOutput(page);
    expect(output).toHaveProperty("nummer");
    expect(output).not.toHaveProperty("name");
  });

  test("Wechsel Maschine → Mensch stellt Name wieder her", async ({ page }) => {
    await oneOfSelect(page).selectOption("1");
    await oneOfSelect(page).selectOption("0");

    const labels = await fieldLabels(page);
    expect(labels.some((l) => l.startsWith("Name"))).toBe(true);
    expect(labels.some((l) => l.startsWith("Nummer"))).toBe(false);
  });
});
