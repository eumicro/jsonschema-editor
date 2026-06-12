import { expect, test } from "@playwright/test";
import { oneOfSelect, openFormMode, readFormOutput, selectExample } from "./helpers";

test.describe("$defs + oneOf-Formular", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "person-with-defs");
    await openFormMode(page);
  });

  test("Dropdown zeigt aufgelöste Definitions-Titel", async ({ page }) => {
    const options = await oneOfSelect(page).locator("option").allTextContents();
    expect(options).toEqual(["Mensch", "Maschine"]);
  });

  test("Wechsel zu Maschine zeigt Nummer aus $defs", async ({ page }) => {
    await oneOfSelect(page).selectOption("1");

    await expect(page.locator(".jse-field__label", { hasText: /^Nummer/ })).toBeVisible();
    await expect(page.locator(".jse-field__label", { hasText: /^Name/ })).toHaveCount(0);

    const output = await readFormOutput(page);
    expect(output).toHaveProperty("nummer");
    expect(output).not.toHaveProperty("name");
  });
});
