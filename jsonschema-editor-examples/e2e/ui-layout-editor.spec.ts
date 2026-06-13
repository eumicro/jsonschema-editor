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

  test("Drag & Drop zeigt Drag-Handle an verschiebbaren Elementen", async ({ page }) => {
    const panel = page.locator("#jse-editor-ui");
    await expect(panel.locator(".jse-layout-block__drag-handle").first()).toBeVisible();
  });

  test("G37: VerticalLayout hinzufügen und Drag-Handle anzeigen", async ({ page }) => {
    await page.locator("#app-example-select").selectOption("occupational-health-g37");

    const panel = page.locator("#jse-editor-ui");
    const groupBlock = panel.locator(".jse-layout-block--group").filter({ hasText: "Untersuchte Person" });
    const groupStack = groupBlock.locator(":scope > .jse-layout-editor__stack");

    await groupBlock.getByRole("button", { name: "Element zu Untersuchte Person hinzufügen" }).click();
    await page.getByRole("button", { name: "+ VerticalLayout" }).click();

    const nameLayout = groupStack.locator(":scope > .jse-layout-block--vertical").last();
    await expect(nameLayout).toBeVisible();
    await expect(nameLayout.locator(":scope > .jse-layout-editor__stack .jse-layout-dropzone")).toBeVisible();

    const nachname = groupStack.locator(".jse-layout-block--control").filter({ hasText: "nachname" });
    await expect(nachname.locator(".jse-layout-block__drag-handle")).toBeVisible();
  });
});
