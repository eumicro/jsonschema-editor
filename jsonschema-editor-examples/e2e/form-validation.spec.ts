import { expect, test } from "@playwright/test";
import { oneOfSelect, openFormMode, selectExample } from "./helpers";

function fieldByLabel(page: import("@playwright/test").Page, label: RegExp) {
  return page.locator(".jse-field").filter({
    has: page.locator(".jse-field__label", { hasText: label }),
  });
}

test.describe("Formular-Validierung", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "person-with-defs");
    await openFormMode(page);
    await oneOfSelect(page).selectOption("0");
  });

  test("Pflichtfeld: leeres Name-Feld nach Blur", async ({ page }) => {
    const nameField = fieldByLabel(page, /^Name/);
    const input = nameField.locator("input");

    await input.fill("");
    await input.blur();

    await expect(nameField).toHaveClass(/jse-field--invalid/);
    await expect(nameField.locator(".jse-field__error")).toContainText("Pflichtfeld");
  });

  test("Ungültige E-Mail nach Blur", async ({ page }) => {
    const emailField = fieldByLabel(page, /^E-Mail/);
    const input = emailField.locator("input");

    await input.fill("not-an-email");
    await input.blur();

    await expect(emailField).toHaveClass(/jse-field--invalid/);
    await expect(emailField.locator(".jse-field__error")).toBeVisible();
  });
});
