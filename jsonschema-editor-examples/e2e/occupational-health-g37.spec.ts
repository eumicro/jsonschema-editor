import { expect, test } from "@playwright/test";
import { openFormMode, readFormOutput, selectExample } from "./helpers";

test.describe("G37 Arbeitsmedizin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "occupational-health-g37");
    await openFormMode(page);
  });

  test("lädt Stepper mit vier Schritten und Default-Daten", async ({ page }) => {
    await expect(page.locator(".jse-stepper")).toBeVisible();
    await expect(page.locator(".jse-stepper__step-indicator")).toHaveCount(4);
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Aufnahme");

    await expect(page.locator(".jse-field").filter({ hasText: /^Nachname/ })).toBeVisible();

    const output = await readFormOutput(page);
    expect(output.aktenzeichen).toBe("G37-2026-0042");
    expect(output.untersuchter).toMatchObject({
      nachname: "Krämer",
      vorname: "Sabine",
    });
    expect(output.programm).toMatchObject({ art: "erst" });
    expect(output.beurteilung).toMatchObject({ ergebnis: "empfehlungen" });
    const arbeitgeber = output.arbeitgeber as Record<string, unknown>;
    expect(arbeitgeber.betriebsgelaende).toMatchObject({
      type: "GeometryCollection",
      geometries: [{ type: "Polygon" }],
    });
  });

  test("Aufnahme: Betriebsgelände rendert Karte", async ({ page }) => {
    await expect(page.getByText("Betriebsgelände (Karte)")).toBeVisible();
    await expect(page.locator(".jse-geometry-map")).toBeVisible();
    await expect(page.getByRole("button", { name: "Bearbeiten" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Löschen" })).toBeVisible();

    const output = await readFormOutput(page);
    const gelaende = (output.arbeitgeber as Record<string, unknown>).betriebsgelaende as Record<
      string,
      unknown
    >;
    expect(gelaende.type).toBe("GeometryCollection");
    expect(Array.isArray(gelaende.geometries)).toBe(true);
    expect((gelaende.geometries as unknown[]).length).toBeGreaterThan(0);
  });

  test("Aufnahme: Betriebsgelände lässt sich löschen", async ({ page }) => {
    const map = page.locator(".jse-geometry-map.leaflet-container");
    await expect(map).toBeVisible();

    await page.getByRole("button", { name: "Löschen" }).click();
    await expect(map.locator("path.leaflet-interactive, .leaflet-interactive").first()).toBeVisible();
    await map.locator("path.leaflet-interactive, .leaflet-interactive").first().click({ force: true });

    await expect
      .poll(async () => {
        const output = await readFormOutput(page);
        const gelaende = (output.arbeitgeber as Record<string, unknown>).betriebsgelaende as Record<
          string,
          unknown
        >;
        return (gelaende.geometries as unknown[]).length;
      })
      .toBe(0);
  });

  test("Anamnese: Categorization-Tabs und Untersuchungsschritt", async ({ page }) => {
    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(page.getByRole("tab", { name: "Allgemein" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Arbeitsplatz" })).toBeVisible();

    await page.getByRole("button", { name: "Weiter" }).click();
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Untersuchung");
    await expect(
      page.getByRole("group", { name: "Erst- / Nach- / Ergänzungsuntersuchung" }).getByText("Typ"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Weiter" }).click();
    const output = await readFormOutput(page);
    expect(output.attest).toMatchObject({
      arztName: "Dr. med. Julia Hoffmann",
      unterschriftErteilt: true,
    });
  });

  test("Programm oneOf: Wechsel zu Ergänzungsuntersuchung zeigt Detailblock", async ({ page }) => {
    await page.getByRole("button", { name: "Weiter" }).click();
    await page.getByRole("button", { name: "Weiter" }).click();

    const programSelect = page
      .getByRole("group", { name: "Erst- / Nach- / Ergänzungsuntersuchung" })
      .locator("select.jse-field__input")
      .first();
    await programSelect.selectOption({ label: "Ergänzungsuntersuchung" });

    await expect
      .poll(async () => {
        const output = await readFormOutput(page);
        return (output.programm as Record<string, unknown>).art;
      })
      .toBe("ergaenzung");

    const output = await readFormOutput(page);
    const programm = output.programm as Record<string, unknown>;
    expect(programm).toHaveProperty("detailuntersuchung");
    expect(programm).toHaveProperty("ausloeser");
  });

  test("Untersuchung: Siebtest rendert verschachtelte Felder, kein [object Object]", async ({ page }) => {
    await page.getByRole("button", { name: "Weiter" }).click();
    await page.getByRole("button", { name: "Weiter" }).click();

    await expect(page.locator(".jse-stepper__panel")).not.toContainText("[object Object]");
    await expect(page.getByText("Sehschärfe Ferne")).toBeVisible();
    await expect(page.getByText("Sehschärfe Nähe (arbeitsplatzbezogen)")).toBeVisible();
    await expect(page.locator(".jse-stepper__panel .jse-field")).not.toHaveCount(3);
  });
});
