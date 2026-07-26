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
    title: "Standort markieren",
    point: true,
    line: false,
    polygon: false,
    countPattern: /0 \/ max\. 1 geometry\/geometries/,
    drawButtons: ["Place point"],
    hiddenDrawButtons: ["Draw line", "Draw polygon"],
  },
  {
    title: "Route erfassen",
    point: false,
    line: true,
    polygon: false,
    countPattern: /0 \/ max\. 2 geometry\/geometries/,
    drawButtons: ["Draw line"],
    hiddenDrawButtons: ["Place point", "Draw polygon"],
  },
  {
    title: "Einsatzgebiet abgrenzen",
    point: false,
    line: false,
    polygon: true,
    countPattern: /0 \/ max\. 1 geometry\/geometries/,
    drawButtons: ["Draw polygon"],
    hiddenDrawButtons: ["Place point", "Draw line"],
  },
  {
    title: "Standort und Route",
    point: true,
    line: true,
    polygon: false,
    countPattern: /0 \/ max\. 3 geometry\/geometries/,
    drawButtons: ["Place point", "Draw line"],
    hiddenDrawButtons: ["Draw polygon"],
  },
  {
    title: "Standort und Gebiet",
    point: true,
    line: false,
    polygon: true,
    countPattern: /0 \/ max\. 2 geometry\/geometries/,
    drawButtons: ["Place point", "Draw polygon"],
    hiddenDrawButtons: ["Draw line"],
  },
  {
    title: "Route und Gebiet",
    point: false,
    line: true,
    polygon: true,
    countPattern: /0 \/ max\. 2 geometry\/geometries/,
    drawButtons: ["Draw line", "Draw polygon"],
    hiddenDrawButtons: ["Place point"],
  },
  {
    title: "Gesamtplanung",
    point: true,
    line: true,
    polygon: true,
    countPattern: /0 \/ max\. 5 geometry\/geometries/,
    drawButtons: ["Place point", "Draw line", "Draw polygon"],
    hiddenDrawButtons: [],
  },
  {
    title: "Mehrere Gebiete",
    point: false,
    line: false,
    polygon: true,
    countPattern: /1 \/ 1–3 geometry\/geometries/,
    drawButtons: ["Draw polygon"],
    hiddenDrawButtons: ["Place point", "Draw line"],
  },
  {
    title: "Zwei Kartenelemente",
    point: true,
    line: true,
    polygon: true,
    countPattern: /0 \/ exactly 2 geometry\/geometries/,
    drawButtons: ["Place point", "Draw line", "Draw polygon"],
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
    await page.getByRole("button", { name: "Edit attributes of pointOnly" }).click();

    const panel = page.locator(".jse-attributes-panel");
    await expect(panel.getByText("Geometry (map)")).toBeVisible();
    await expect(panel.getByText("Point")).toBeVisible();
    await expect(panel.getByText("Line")).toBeVisible();
    await expect(panel.getByText("Polygon")).toBeVisible();
    await expect(panel.getByText("Count mode")).toBeVisible();

    const pointCheckbox = panel.locator(".jse-geometry-attr__check").filter({ hasText: "Point" }).locator("input");
    await expect(pointCheckbox).toBeChecked();
    await pointCheckbox.setChecked(false);
    await pointCheckbox.setChecked(true);

    await panel.getByText("Count mode").locator("..").locator("select").selectOption("exact");
    await panel.getByText("exactObjects").locator("..").locator("input").fill("2");

    await openFormMode(page);
    const field = fieldByTitle(page, "Standort markieren");
    await expect(field.getByText(/0 \/ exactly 2 geometry\/geometries/)).toBeVisible();
  });

  test("Formular: Mindestanzahl verhindert Löschen (Mehrere Gebiete)", async ({ page }) => {
    const field = fieldByTitle(page, "Mehrere Gebiete");
    await field.scrollIntoViewIfNeeded();
    const map = field.locator(".jse-geometry-map.leaflet-container");

    await expect(field.getByText(/1 \/ 1–3 geometry\/geometries/)).toBeVisible({ timeout: 10_000 });

    await field.getByRole("button", { name: "Delete" }).click();
    await field
      .locator(".jse-geometry-map .leaflet-overlay-pane path.leaflet-interactive")
      .click({ force: true });

    await expect(field.getByText(/At least 1 geometry\/geometries required./)).toBeVisible({
      timeout: 5000,
    });
    await expect(field.getByText(/1 \/ 1–3 geometry\/geometries/)).toBeVisible();
  });
});
