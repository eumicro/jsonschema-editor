import { expect, test } from "@playwright/test";
import { oneOfSelect, openEditorMode, openFormMode, readFormOutput, selectExample } from "./helpers";

type GeometryCollection = {
  type: string;
  geometries: Array<{ type: string; coordinates?: unknown }>;
};

function readBetriebsgelaende(output: Record<string, unknown>): GeometryCollection {
  const arbeitgeber = output.arbeitgeber as Record<string, unknown>;
  return arbeitgeber.betriebsgelaende as GeometryCollection;
}

test.describe("Geometry-Anforderungen (Browser)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "occupational-health-g37");
    await openFormMode(page);
  });

  test("1. Kartenfeld statt Textfeld (Custom Renderer)", async ({ page }) => {
    await expect(page.locator(".jse-geometry-map.leaflet-container")).toBeVisible();
    await expect(page.locator(".jse-geometry-map")).not.toContainText("[object Object]");
    await expect(page.getByText("Betriebsgelände (Karte)")).toBeVisible();
  });

  test("2. OpenStreetMap als Kartenhintergrund (styleUrl)", async ({ page }) => {
    await expect(page.locator(".jse-geometry-map .leaflet-tile-pane img").first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("© OpenStreetMap contributors")).toBeVisible();
  });

  test("3. Ergebnis ist GeometryCollection", async ({ page }) => {
    const gelaende = readBetriebsgelaende(await readFormOutput(page));
    expect(gelaende.type).toBe("GeometryCollection");
    expect(Array.isArray(gelaende.geometries)).toBe(true);
    expect(gelaende.geometries[0]?.type).toBe("Polygon");
  });

  test("4. G37: Polygon am Standort Zum Wäldchen 3 Neulehe", async ({ page }) => {
    const output = await readFormOutput(page);
    expect((output.arbeitgeber as Record<string, unknown>).standort).toContain("Neulehe");

    const ring = readBetriebsgelaende(output).geometries[0]?.coordinates as number[][][];
    expect(ring).toBeDefined();
    const lngs = ring![0].map((c) => c[0]);
    const lats = ring![0].map((c) => c[1]);
    expect(Math.min(...lngs)).toBeGreaterThan(7.41);
    expect(Math.max(...lngs)).toBeLessThan(7.42);
    expect(Math.min(...lats)).toBeGreaterThan(53.006);
    expect(Math.max(...lats)).toBeLessThan(53.007);
  });

  test("5. Konfiguration polygon-only, maxObjects=1 (G37 x-geometry)", async ({ page }) => {
    await expect(page.getByText(/1 \/ max\. 1 Geometrie\(n\)/)).toBeVisible();
    await expect(page.getByText(/· Polygon/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Polygon zeichnen" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Punkt setzen" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Linie zeichnen" })).toHaveCount(0);
  });

  test("6. Löschen und neu zeichnen", async ({ page }) => {
    const map = page.locator(".jse-geometry-map.leaflet-container");
    await map.scrollIntoViewIfNeeded();

    await page.getByRole("button", { name: "Löschen" }).click();
    await map.locator("path.leaflet-interactive, .leaflet-interactive").first().click({ force: true });

    await expect
      .poll(async () => readBetriebsgelaende(await readFormOutput(page)).geometries.length)
      .toBe(0);

    await expect(page.getByRole("button", { name: "Polygon zeichnen" })).toBeVisible();

    await page.getByRole("button", { name: "Polygon zeichnen" }).click();
    const box = await map.boundingBox();
    expect(box).toBeTruthy();
    if (!box) return;

    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.click(cx - 40, cy - 20);
    await page.mouse.click(cx + 40, cy - 20);
    await page.mouse.click(cx + 40, cy + 20);
    await page.mouse.click(cx - 40, cy + 20);
    await page.mouse.click(cx - 40, cy - 20);

    await expect
      .poll(async () => readBetriebsgelaende(await readFormOutput(page)).geometries.length)
      .toBe(1);

    const redrawn = readBetriebsgelaende(await readFormOutput(page));
    expect(redrawn.type).toBe("GeometryCollection");
    expect(redrawn.geometries[0]?.type).toBe("Polygon");
  });

  test("7. Bearbeiten aktualisiert GeometryCollection", async ({ page }) => {
    const before = readBetriebsgelaende(await readFormOutput(page));
    const beforeRing = JSON.stringify(before.geometries[0]?.coordinates);

    await page.getByRole("button", { name: "Bearbeiten", exact: true }).click();
    const map = page.locator(".jse-geometry-map.leaflet-container");
    await map.scrollIntoViewIfNeeded();
    const vertex = map.locator(".leaflet-marker-pane .leaflet-marker-icon").first();
    await expect(vertex).toBeVisible({ timeout: 5000 });

    const box = await vertex.boundingBox();
    expect(box).toBeTruthy();
    if (!box) return;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 20);
    await page.mouse.up();

    await expect
      .poll(async () => {
        const after = readBetriebsgelaende(await readFormOutput(page));
        return JSON.stringify(after.geometries[0]?.coordinates);
      })
      .not.toBe(beforeRing);
  });

  test("8. Schema-Editor: geometry-collection Typ mit Punkt/Linie/Polygon", async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "person-with-defs");
    await openEditorMode(page);

    await page.getByRole("button", { name: "Ausklappen", exact: true }).first().click();
    await page.getByRole("button", { name: "Element zu Mensch hinzufügen" }).click();

    const dialog = page.getByRole("dialog", { name: "Element hinzufügen" });
    await expect(dialog.getByRole("button", { name: "+ geometry-collection", exact: true })).toBeVisible();

    await dialog.getByPlaceholder("z. B. name").fill("geoTest");
    await dialog
      .getByRole("button", { name: "+ geometry-collection", exact: true })
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "geoTest löschen" }).first()).toBeVisible();

    await openFormMode(page);
    await oneOfSelect(page).selectOption("0");

    const geoField = page.locator(".jse-field").filter({ hasText: "Geometry (OGC)" });
    await expect(geoField).toBeVisible();

    const geoMap = geoField.locator(".jse-geometry-map.leaflet-container");
    await expect(geoMap.locator(".leaflet-pm-icon-marker")).toBeVisible();
    await expect(geoMap.locator(".leaflet-pm-icon-polyline")).toBeVisible();
    await expect(geoMap.locator(".leaflet-pm-icon-polygon")).toBeVisible();
    await expect(geoField.getByText(/0 \/ max\. 5 Geometrie\(n\)/)).toBeVisible();
  });
});
