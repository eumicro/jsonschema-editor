import { expect, test } from "@playwright/test";
import { openEditorMode, openFormMode, selectExample } from "./helpers";

type GeometryScenario = {
  title: string;
  point: boolean;
  line: boolean;
  polygon: boolean;
  countPattern: RegExp;
  drawButtons: string[];
  hiddenDrawButtons: string[];
};

const scenarios: GeometryScenario[] = [
  {
    title: "Nur Punkt",
    point: true,
    line: false,
    polygon: false,
    countPattern: /0 \/ max\. 1 Geometrie\(n\)/,
    drawButtons: ["Punkt setzen"],
    hiddenDrawButtons: ["Linie zeichnen", "Polygon zeichnen"],
  },
  {
    title: "Nur Linie",
    point: false,
    line: true,
    polygon: false,
    countPattern: /0 \/ max\. 2 Geometrie\(n\)/,
    drawButtons: ["Linie zeichnen"],
    hiddenDrawButtons: ["Punkt setzen", "Polygon zeichnen"],
  },
  {
    title: "Nur Polygon",
    point: false,
    line: false,
    polygon: true,
    countPattern: /0 \/ max\. 1 Geometrie\(n\)/,
    drawButtons: ["Polygon zeichnen"],
    hiddenDrawButtons: ["Punkt setzen", "Linie zeichnen"],
  },
  {
    title: "Punkt + Linie",
    point: true,
    line: true,
    polygon: false,
    countPattern: /0 \/ max\. 3 Geometrie\(n\)/,
    drawButtons: ["Punkt setzen", "Linie zeichnen"],
    hiddenDrawButtons: ["Polygon zeichnen"],
  },
  {
    title: "Punkt + Polygon",
    point: true,
    line: false,
    polygon: true,
    countPattern: /0 \/ max\. 2 Geometrie\(n\)/,
    drawButtons: ["Punkt setzen", "Polygon zeichnen"],
    hiddenDrawButtons: ["Linie zeichnen"],
  },
  {
    title: "Linie + Polygon",
    point: false,
    line: true,
    polygon: true,
    countPattern: /0 \/ max\. 2 Geometrie\(n\)/,
    drawButtons: ["Linie zeichnen", "Polygon zeichnen"],
    hiddenDrawButtons: ["Punkt setzen"],
  },
  {
    title: "Alle Typen",
    point: true,
    line: true,
    polygon: true,
    countPattern: /0 \/ max\. 5 Geometrie\(n\)/,
    drawButtons: ["Punkt setzen", "Linie zeichnen", "Polygon zeichnen"],
    hiddenDrawButtons: [],
  },
  {
    title: "Polygon 1–3",
    point: false,
    line: false,
    polygon: true,
    countPattern: /1 \/ 1–3 Geometrie\(n\)/,
    drawButtons: ["Polygon zeichnen"],
    hiddenDrawButtons: ["Punkt setzen", "Linie zeichnen"],
  },
  {
    title: "Exakt 2",
    point: true,
    line: true,
    polygon: true,
    countPattern: /0 \/ exakt 2 Geometrie\(n\)/,
    drawButtons: ["Punkt setzen", "Linie zeichnen", "Polygon zeichnen"],
    hiddenDrawButtons: [],
  },
];

function fieldByTitle(page: import("@playwright/test").Page, title: string) {
  return page.locator(".jse-field").filter({
    has: page.locator(".jse-field__label", { hasText: title }),
  });
}

test.describe("Geometry-Konfigurationen (Browser)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "geometry-qa");
    await openFormMode(page);
  });

  for (const scenario of scenarios) {
    test(`Formular: ${scenario.title}`, async ({ page }) => {
      const field = fieldByTitle(page, scenario.title);
      await field.scrollIntoViewIfNeeded();
      await expect(field).toBeVisible();

      const map = field.locator(".jse-geometry-map.leaflet-container");
      await expect(map).toBeVisible({ timeout: 10_000 });

      for (const label of scenario.drawButtons) {
        await expect(field.getByRole("button", { name: label })).toBeVisible();
      }
      for (const label of scenario.hiddenDrawButtons) {
        await expect(field.getByRole("button", { name: label })).toHaveCount(0);
      }

      await expect(field.getByText(scenario.countPattern)).toBeVisible();
    });
  }

  test("Schema-Editor: x-geometry Attribute (Punkt/Linie/Polygon, Anzahl)", async ({ page }) => {
    await openEditorMode(page);
    await page.getByRole("button", { name: "Attribute von pointOnly bearbeiten" }).click();

    const panel = page.locator(".jse-attributes-panel");
    await expect(panel.getByText("Geometrie (Karte)")).toBeVisible();
    await expect(panel.getByText("Punkt")).toBeVisible();
    await expect(panel.getByText("Linie")).toBeVisible();
    await expect(panel.getByText("Polygon")).toBeVisible();
    await expect(panel.getByText("Anzahl-Modus")).toBeVisible();

    const pointCheckbox = panel.locator(".jse-geometry-attr__check").filter({ hasText: "Punkt" }).locator("input");
    await expect(pointCheckbox).toBeChecked();
    await pointCheckbox.setChecked(false);
    await pointCheckbox.setChecked(true);

    await panel.getByText("Anzahl-Modus").locator("..").locator("select").selectOption("exact");
    await panel.getByText("exactObjects").locator("..").locator("input").fill("2");

    await openFormMode(page);
    const field = fieldByTitle(page, "Nur Punkt");
    await expect(field.getByText(/0 \/ exakt 2 Geometrie\(n\)/)).toBeVisible();
  });

  test("Formular: Mindestanzahl verhindert Löschen (Polygon 1–3)", async ({ page }) => {
    const field = fieldByTitle(page, "Polygon 1–3");
    await field.scrollIntoViewIfNeeded();
    const map = field.locator(".jse-geometry-map.leaflet-container");

    await expect(field.getByText(/1 \/ 1–3 Geometrie\(n\)/)).toBeVisible({ timeout: 10_000 });

    await field.getByRole("button", { name: "Löschen" }).click();
    await field
      .locator(".jse-geometry-map .leaflet-overlay-pane path.leaflet-interactive")
      .click({ force: true });

    await expect(field.getByText(/Mindestens 1 Geometrie\(n\) erforderlich\./)).toBeVisible({
      timeout: 5000,
    });
    await expect(field.getByText(/1 \/ 1–3 Geometrie\(n\)/)).toBeVisible();
  });
});
