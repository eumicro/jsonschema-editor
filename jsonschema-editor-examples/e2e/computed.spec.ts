import { expect, test } from "@playwright/test";
import { openEditorMode, openFormMode, readFormOutput, selectExample } from "./helpers";

test.describe("x-computed (CEL)", () => {
  test("Kostensumme aktualisiert sich bei Betragsänderung", async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "computed-cost-qa");
    await openFormMode(page);

    const sumField = page.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Gesamtsumme" }),
    });
    await expect(sumField.locator("input")).toHaveValue("248.25");
    await expect(sumField.locator("input")).toBeDisabled();

    const list = page.locator(".jse-array-field");
    const firstItem = list.locator(".jse-array-item").first();
    await firstItem.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Betrag" }),
    }).locator("input").fill("200");
    await firstItem.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Betrag" }),
    }).locator("input").blur();

    await expect(sumField.locator("input")).toHaveValue("327.75");

    const output = await readFormOutput(page);
    expect(output.gesamtsumme).toBe(327.75);
  });

  test("Kostensumme berücksichtigt neu hinzugefügte Positionen", async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "computed-cost-qa");
    await openFormMode(page);

    const sumField = page.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Gesamtsumme" }),
    });
    const list = page.locator(".jse-array-field");

    await expect(sumField.locator("input")).toHaveValue("248.25");
    await list.getByRole("button", { name: "Eintrag hinzufügen" }).click();

    const newItem = list.locator(".jse-array-item").last();
    await newItem.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Betrag" }),
    }).locator("input").fill("100");
    await newItem.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Betrag" }),
    }).locator("input").blur();

    await expect(sumField.locator("input")).toHaveValue("348.25");

    const output = await readFormOutput(page);
    expect(output.gesamtsumme).toBe(348.25);
  });

  test("Antragsstatus folgt Antragsdatum", async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "computed-status-qa");
    await openFormMode(page);

    const panel = page.locator(".jse-stepper__panel");
    const statusField = panel.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Status" }),
    });
    await expect(statusField.locator("input")).toHaveValue("NEU");

    await panel.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Antragsdatum" }),
    }).locator("input").fill("2026-06-01");
    await expect(statusField.locator("input")).toHaveValue("ANTRAG_ANGELEGT");

    const output = await readFormOutput(page);
    expect(output.status).toBe("ANTRAG_ANGELEGT");
  });

  test("Antragsstatus durchläuft alle Stepper-Schritte", async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "computed-status-qa");
    await openFormMode(page);

    const panel = () => page.locator(".jse-stepper__panel");
    const statusField = () =>
      panel().locator(".jse-field").filter({
        has: page.locator(".jse-field__label", { hasText: "Status" }),
      });

    await panel().locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Antragsdatum" }),
    }).locator("input").fill("2026-06-01");
    await expect(statusField().locator("input")).toHaveValue("ANTRAG_ANGELEGT");

    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(
      panel().locator(".jse-field__label", { hasText: "Adresse zum Antrag" }),
    ).toBeVisible();
    await panel().locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Adresse zum Antrag" }),
    }).locator("input").fill("Musterstraße 1");
    await expect(statusField().locator("input")).toHaveValue("BEREIT_ZUR_DURCHFUEHRUNG");

    await page.getByRole("button", { name: "Weiter" }).click();
    await panel().locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Datum der Durchführung" }),
    }).locator("input").fill("2026-07-01");
    await expect(statusField().locator("input")).toHaveValue("DURCHGEFUEHRT");

    await page.getByRole("button", { name: "Weiter" }).click();
    await panel().locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Rechnung beglichen" }),
    }).locator("input[type=checkbox]").check();
    await expect(statusField().locator("input")).toHaveValue("ERLEDIGT");

    const output = await readFormOutput(page);
    expect(output.status).toBe("ERLEDIGT");
  });

  test("G37: Vorsorge-Status wird berechnet", async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "occupational-health-g37");
    await openFormMode(page);

    const statusField = page.locator(".jse-field").filter({ hasText: "Vorsorge-Status" });
    await expect(statusField.locator("input")).toBeDisabled();
    await expect(statusField.locator("input")).not.toHaveValue("NEU");
  });

  test("Schema-Editor: x-computed Attribut sichtbar", async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "computed-cost-qa");
    await openEditorMode(page);
    await page.getByRole("button", { name: "Attribute von gesamtsumme bearbeiten" }).click();

    const panel = page.locator(".jse-attributes-panel");
    await expect(panel.getByText("Berechnet (CEL, x-computed)")).toBeVisible();
  });
});
