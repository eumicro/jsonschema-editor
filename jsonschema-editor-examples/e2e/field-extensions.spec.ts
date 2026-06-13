import { expect, test } from "@playwright/test";
import { openEditorMode, openFormMode, readFormOutput, selectExample } from "./helpers";

test.describe("Felder-Erweiterungen x-read-only / x-hidden", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "field-extensions-qa");
  });

  test("Formular: x-read-only deaktiviert Eingabe", async ({ page }) => {
    await openFormMode(page);

    const emailField = page.locator(".jse-field").filter({ hasText: "E-Mail" });
    await expect(emailField.locator("input")).toBeDisabled();

    const nameField = page.locator(".jse-field").filter({ hasText: /^Name/ });
    await expect(nameField.locator("input")).toBeEnabled();
  });

  test("Formular: x-hidden blendet Feld aus", async ({ page }) => {
    await openFormMode(page);
    await expect(page.getByText("Interne Notiz")).toHaveCount(0);
    const output = await readFormOutput(page);
    expect(output.internalNote).toBe("VIP-Kunde");
  });

  test("Schema-Editor: Feld-Attribute für alle Typen sichtbar", async ({ page }) => {
    await openEditorMode(page);
    await page.getByRole("button", { name: "Attribute von phone bearbeiten" }).click();

    const panel = page.locator(".jse-attributes-panel");
    await expect(panel.getByText("Nur lesen (x-read-only)")).toBeVisible();
    await expect(panel.getByText("Ausblenden (x-hidden)")).toBeVisible();
  });

  test("Schema-Editor: Sammelaktion setzt x-read-only auf Unterbaum", async ({ page }) => {
    await openEditorMode(page);
    await page.getByRole("button", { name: "Attribute von address bearbeiten" }).click();

    const panel = page.locator(".jse-attributes-panel");
    await panel.getByRole("button", { name: "Alle: nur lesen" }).evaluate((btn: HTMLButtonElement) => btn.click());
    await openFormMode(page);

    for (const label of ["Straße", "Ort", "PLZ"]) {
      const field = page.locator(".jse-field").filter({ has: page.getByText(label, { exact: true }) });
      await expect(field.locator("input")).toBeDisabled();
    }
  });
});
