import { expect, test } from "@playwright/test";
import { openEditorMode, selectExample } from "./helpers";

test.describe("Form-Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "person-with-defs");
    await openEditorMode(page);
  });

  test("zeigt $defs mit Mensch und Maschine", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Definition hinzufügen" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mensch löschen" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Maschine löschen" })).toBeVisible();
    await expect(page.getByRole("button", { name: "oneOf[0] löschen" })).toBeVisible();
  });

  test("oneOf-Zweig löschen", async ({ page }) => {
    await page.getByRole("button", { name: "oneOf[1] löschen" }).click();
    await expect(page.getByRole("button", { name: "oneOf[1] löschen" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "oneOf[0] löschen" })).toBeVisible();
  });

  test("Attribute-Dialog für Definition", async ({ page }) => {
    await page.getByRole("button", { name: "Attribute von Mensch bearbeiten" }).click();

    const panel = page.getByRole("dialog", { name: /Attribute – Mensch/ });
    await expect(panel).toBeVisible();
    await expect(panel.getByPlaceholder("z. B. Person")).toHaveValue("Mensch");
    await expect(panel.getByRole("textbox").nth(1)).toHaveValue("Person");

    await page.getByRole("button", { name: "Schließen" }).click();
    await expect(panel).toHaveCount(0);
  });

  test("oneOf-$ref-Knoten auswählbar ohne Fehler", async ({ page }) => {
    await page.getByRole("button", { name: "Attribute von oneOf[0] bearbeiten" }).click();
    await expect(page.locator(".jse-floating-panel")).toBeVisible();
    await page.getByRole("button", { name: "Schließen" }).click();
  });

  test("Attribute-Dialog: schnelles Navigieren ohne Konsolenfehler", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.getByRole("button", { name: "Ausklappen", exact: true }).first().click();
    await page.getByRole("button", { name: "Attribute von oneOf[0] bearbeiten" }).click();
    await expect(page.locator(".jse-floating-panel")).toBeVisible();
    await page.getByRole("button", { name: "Schließen" }).click();

    await page.getByRole("button", { name: "Attribute von oneOf[1] bearbeiten" }).click();
    await expect(page.locator(".jse-floating-panel")).toBeVisible();
    await page.getByRole("button", { name: "Schließen" }).click();

    await page.getByRole("button", { name: "Attribute von Mensch bearbeiten" }).click();
    await expect(page.locator(".jse-floating-panel")).toBeVisible();
    await page.getByRole("button", { name: "Schließen" }).click();

    expect(errors).toEqual([]);
  });
});
