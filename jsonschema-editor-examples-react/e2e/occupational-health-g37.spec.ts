import { expect, test } from "@playwright/test";
import { openFormMode, readFormOutput, selectExample } from "./helpers";

const STEP_COUNT = 8;

async function goToStep(page: import("@playwright/test").Page, stepIndex: number) {
  for (let i = 0; i < stepIndex; i++) {
    await page.getByRole("button", { name: "Next" }).click();
  }
}

test.describe("G37 Arbeitsmedizin", () => {
  test.beforeEach(async ({ page }) => {
    await selectExample(page, "occupational-health-g37");
    await openFormMode(page);
  });

  test("lädt Stepper mit acht Schritten und Default-Daten", async ({ page }) => {
    await expect(page.locator(".jse-stepper")).toBeVisible();
    await expect(page.locator(".jse-stepper__step-indicator")).toHaveCount(STEP_COUNT);
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Recording");

    await expect(page.locator(".jse-field").filter({ hasText: /^Last name/ })).toBeVisible();

    const output = await readFormOutput(page);
    expect(output.aktenzeichen).toBe("G37-2026-0042");
    expect(output.untersuchter).toMatchObject({
      nachname: "Krämer",
      vorname: "Sabine",
    });
    expect(output.vorgeschichte).toMatchObject({
      fruehereVorsorge: true,
      einwilligungDatenverarbeitung: true,
    });
    expect(output.programm).toMatchObject({ art: "erst" });
    expect(output.beurteilung).toMatchObject({ ergebnis: "empfehlungen" });
    expect(output.beratung).toMatchObject({ durchgefuehrt: true });
    expect(output.mitteilungArbeitgeber).toMatchObject({ bedenkenKategorie: "keine_bedenken" });
    const arbeitgeber = output.arbeitgeber as Record<string, unknown>;
    expect(arbeitgeber.betriebsgelaende).toMatchObject({
      type: "GeometryCollection",
      geometries: [{ type: "Polygon" }],
    });
  });

  test("Aufnahme: Betriebsgelände rendert Karte", async ({ page }) => {
    await expect(page.getByText("Company premises (map)")).toBeVisible();
    await expect(page.locator(".jse-geometry-map")).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();

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

    await page.getByRole("button", { name: "Delete" }).click();
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

  test("Vorgeschichte: Einwilligungen und frühere Vorsorge", async ({ page }) => {
    await goToStep(page, 1);
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Prehistory");
    await expect(page.getByText("Previous G37/screen precaution taken")).toBeVisible();
    await expect(page.getByText("Consent to processing the examination data")).toBeVisible();
  });

  test("Anamnese: Categorization-Tabs und Untersuchungsschritt", async ({ page }) => {
    await goToStep(page, 2);
    await expect(page.getByRole("tab", { name: "General" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Workplace" })).toBeVisible();
    await page.getByRole("tab", { name: "Workplace" }).click();
    await expect(page.getByText("Work briefing/briefing at the screen location takes place")).toBeVisible();

    await goToStep(page, 1);
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Investigation");
    await expect(
      page.getByRole("group", { name: "Initial / follow-up / supplementary examination" }).getByText("Type"),
    ).toBeVisible();

    await goToStep(page, 4);
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Certificate");
    const output = await readFormOutput(page);
    expect(output.attest).toMatchObject({
      arztName: "Dr. med. Julia Hoffmann",
      unterschriftErteilt: true,
    });
  });

  test("Beratung und Mitteilung: G37-Abschnitte sichtbar", async ({ page }) => {
    await goToStep(page, 5);
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Advice");
    await expect(page.getByText("Consultation carried out")).toBeVisible();

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.locator(".jse-stepper__step-indicator--active")).toContainText("Notice");
    await expect(page.getByText("Assessment category")).toBeVisible();
  });

  test("Programm oneOf: Wechsel zu Ergänzungsuntersuchung zeigt Detailblock", async ({ page }) => {
    await goToStep(page, 3);

    const programSelect = page
      .getByRole("group", { name: "Initial / follow-up / supplementary examination" })
      .locator("select.jse-field__input")
      .first();
    await programSelect.selectOption({ label: "Supplementary examination" });

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
    await goToStep(page, 3);

    await expect(page.locator(".jse-stepper__panel")).not.toContainText("[object Object]");
    await expect(page.getByText("Distance visual acuity")).toBeVisible();
    await expect(page.getByText("Visual acuity near (workplace-related)")).toBeVisible();
    await expect(page.getByText("Result of the screening test (G37 assessment scheme)")).toBeVisible();
    await expect(page.locator(".jse-stepper__panel .jse-field")).not.toHaveCount(3);
  });
});
