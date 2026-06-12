import { expect, test } from "@playwright/test";
import { openEditorMode, selectExample } from "./helpers";

test.describe("UI-Schema Layout-Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "person-with-defs");
    await openEditorMode(page);
    await page.getByRole("tab", { name: "Schema-UI" }).click();
  });

  test("zeigt Layout-Editor als Standardansicht", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Layout-Editor", selected: true })).toBeVisible();
    await expect(page.locator(".jse-layout-editor")).toBeVisible();
    await expect(page.locator(".jse-layout-block").first()).toBeVisible();
  });

  test("wechselt zwischen Layout-Editor und Baumansicht", async ({ page }) => {
    await page.getByRole("tab", { name: "Baumansicht" }).click();
    await expect(page.getByRole("tree", { name: "UI-Struktur" })).toBeVisible();

    await page.getByRole("tab", { name: "Layout-Editor" }).click();
    await expect(page.locator("#jse-editor-ui .jse-layout-editor")).toBeVisible();
  });

  test("Drag & Drop verschiebt Control zwischen Layouts", async ({ page }) => {
    const panel = page.locator("#jse-editor-ui");
    const source = panel.locator(".jse-layout-block--control").first();
    const targetZone = panel.locator(".jse-layout-dropzone").last();

    await source.dragTo(targetZone);
    await expect(panel.locator(".jse-structure-editor__status")).toBeVisible();
  });
});
