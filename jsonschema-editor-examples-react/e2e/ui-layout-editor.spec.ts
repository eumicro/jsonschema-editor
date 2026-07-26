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
    await expect(page.getByTestId("ui-add-toolbar")).toBeVisible();
    await expect(page.getByRole("button", { name: "+ VerticalLayout" })).toBeVisible();
  });

  test("Palette liegt unter dem Layout-Editor", async ({ page }) => {
    const panel = page.locator("#jse-editor-ui");
    const layoutBox = await panel.locator(".jse-layout-editor").boundingBox();
    const toolbarBox = await panel.getByTestId("ui-add-toolbar").boundingBox();
    expect(layoutBox).toBeTruthy();
    expect(toolbarBox).toBeTruthy();
    expect(toolbarBox!.y).toBeGreaterThan(layoutBox!.y);
  });

  test("fügt VerticalLayout per Palette-Drag hinzu", async ({ page }) => {
    const panel = page.locator("#jse-editor-ui");
    const before = await panel.locator(".jse-layout-block--vertical").count();
    const chip = panel.getByTestId("ui-add-toolbar").getByRole("button", { name: "+ VerticalLayout" });
    const dropTarget = panel.locator(".jse-layout-editor__stack").first();
    await chip.dragTo(dropTarget);
    await expect(panel.locator(".jse-layout-block--vertical")).toHaveCount(before + 1);
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

  test("G37: VerticalLayout per Palette-Drag und Drag-Handle anzeigen", async ({ page }) => {
    await selectExample(page, "occupational-health-g37");
    await openEditorMode(page);
    await page.getByRole("tab", { name: "Schema-UI" }).click();

    const panel = page.locator("#jse-editor-ui");
    const groupBlock = panel.locator(".jse-layout-block--group").filter({ hasText: "Untersuchte Person" });
    const groupStack = groupBlock.locator(":scope > .jse-layout-editor__stack");

    await groupBlock.locator(":scope > .jse-layout-block__header").click();
    const chip = panel.getByTestId("ui-add-toolbar").getByRole("button", { name: "+ VerticalLayout" });
    await expect(chip).toBeEnabled();
    await chip.dragTo(groupStack);

    const nameLayout = groupStack.locator(":scope > .jse-layout-block--vertical").last();
    await expect(nameLayout).toBeVisible();
    await expect(nameLayout.locator(":scope > .jse-layout-editor__stack .jse-layout-dropzone")).toBeVisible();

    const nachname = groupStack.locator(".jse-layout-block--control").filter({ hasText: "nachname" });
    await expect(nachname.locator(".jse-layout-block__drag-handle")).toBeVisible();
  });

  test("G37: am Stepper-Root sind unverträgliche Palette-Chips ausgegraut", async ({ page }) => {
    await selectExample(page, "occupational-health-g37");
    await openEditorMode(page);
    await page.getByRole("tab", { name: "Schema-UI" }).click();

    const toolbar = page.locator("#jse-editor-ui").getByTestId("ui-add-toolbar");
    await expect(toolbar.getByRole("button", { name: "+ Step", exact: true })).toBeEnabled();
    await expect(toolbar.getByRole("button", { name: "+ VerticalLayout" })).toBeDisabled();
    await expect(toolbar.getByRole("button", { name: "+ Control" })).toBeDisabled();
  });
});
