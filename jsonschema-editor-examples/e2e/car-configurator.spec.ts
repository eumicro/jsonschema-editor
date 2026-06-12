import { expect, test } from "@playwright/test";
import { openFormMode, readFormOutput, selectExample } from "./helpers";

test.describe("Auto-Konfigurator (verschachtelt)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "car-configurator");
    await openFormMode(page);
  });

  test("lädt verschachtelte Struktur mit SUV und Sport-Paket", async ({ page }) => {
    const output = await readFormOutput(page);
    expect(output.fahrzeug).toMatchObject({
      modell: { karosserie: "suv", tueren: 5 },
      antrieb: { art: "verbrenner" },
    });
    expect(output.bestellung).toMatchObject({
      ausstattung: { paket: "sport" },
      finanzierung: { finanzArt: "leasing" },
    });
  });

  test("Modell oneOf: SUV → Limousine wechselt Unterfelder", async ({ page }) => {
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Fahrzeug");
    await expect(page.getByRole("tab", { name: "Modell (oneOf)" })).toBeVisible();

    const modellSelect = page.locator(".jse-stepper__panel .jse-oneof-field").first().locator("select");
    await expect(modellSelect).toHaveValue("1");

    await modellSelect.selectOption("0");

    await expect
      .poll(async () => {
        const output = await readFormOutput(page);
        return (output.fahrzeug as Record<string, unknown>).modell as Record<string, unknown>;
      })
      .toMatchObject({ karosserie: "limousine" });

    const output = await readFormOutput(page);
    const modell = (output.fahrzeug as Record<string, unknown>).modell as Record<string, unknown>;
    expect(modell.karosserie).toBe("limousine");
    expect(modell).toHaveProperty("radstandMm");
    expect(modell).not.toHaveProperty("bodenhoeheMm");
  });
});
