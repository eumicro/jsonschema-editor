import { expect, test } from "@playwright/test";
import { openEditorMode, openFormMode, readFormOutput, selectExample } from "./helpers";

test.describe("Felder-Erweiterungen x-read-only / x-hidden", () => {
  test.beforeEach(async ({ page }) => {
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

  test("Formular: Progress ist berechneter Durchschnitt (progress-bar)", async ({ page }) => {
    await openFormMode(page);

    const progress = page.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Fortschritt" }),
    });
    await expect(progress.locator(".jse-progress-bar__range")).toBeDisabled();
    await expect(progress.locator(".jse-progress-bar__value")).toHaveText("3.5");

    await page.getByRole("tab", { name: "Konversation" }).click();
    const list = page.locator(".jse-array-field").filter({ hasText: "Kontakte" });
    const first = list.locator(".jse-array-item").first();
    await first.locator(".jse-rating__symbol").nth(2).click();

    await page.getByRole("tab", { name: "Allgemein" }).click();
    // (3+3+5+3+2+4)/6 = 3.333… → 3.3
    await expect(progress.locator(".jse-progress-bar__value")).toHaveText("3.3");

    const output = await readFormOutput(page);
    expect(output.progress).toBeCloseTo(20 / 6, 5);
  });

  test("Formular: Kontakte mit date-today, Kommentar und x-rating", async ({ page }) => {
    await openFormMode(page);
    await page.getByRole("tab", { name: "Konversation" }).click();

    const list = page.locator(".jse-array-field").filter({ hasText: "Kontakte" });
    await expect(list.locator(".jse-array-item")).toHaveCount(6);

    const first = list.locator(".jse-array-item").first();
    await expect(first.locator(".jse-array-item__title-input")).toHaveValue(
      "Erstgespräch: Bedarf an Lizenzverlängerung und Onboarding geklärt.",
    );
    await expect(first.locator(".jse-date-today input[type='date']")).toHaveValue("2026-02-03");
    await expect(first.locator(".jse-rating__symbol--active")).toHaveCount(4);
    await expect(first.locator(".jse-rating__value")).toHaveText("4");

    await first.locator(".jse-rating__symbol").nth(2).click();
    await expect(first.locator(".jse-rating__symbol--active")).toHaveCount(3);
    await expect(first.locator(".jse-rating__value")).toHaveText("3");
    await first.locator(".jse-array-item__title-input").fill("Nachfassung");

    const output = await readFormOutput(page);
    expect(output.kontakte).toHaveLength(6);
    expect(output.kontakte[0]).toEqual({
      datum: "2026-02-03",
      kommentar: "Nachfassung",
      zufriedenheit: 3,
    });
    expect(output.progress).toBeCloseTo(20 / 6, 5);
  });
});
