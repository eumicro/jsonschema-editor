import { expect, test } from "@playwright/test";
import { oneOfSelect, openEditorMode, openFormMode, selectExample } from "./helpers";

function fieldByLabel(page: import("@playwright/test").Page, label: RegExp) {
  return page.locator(".jse-field").filter({
    has: page.locator(".jse-field__label", { hasText: label }),
  });
}

test.describe("Vue-Extensions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "person-with-defs");
  });

  test("Schema-Editor: Extension-Typen in Element-hinzufügen-Dialog", async ({ page }) => {
    await openEditorMode(page);

    await page.getByRole("button", { name: "Ausklappen", exact: true }).first().click();
    await page.getByRole("button", { name: "Element zu Mensch hinzufügen" }).click();

    const dialog = page.getByRole("dialog", { name: "Element hinzufügen" });
    await expect(dialog).toBeVisible();

    for (const typeLabel of ["email", "url", "phone", "select-list", "select-api", "geometry-collection"]) {
      await expect(dialog.getByRole("button", { name: `+ ${typeLabel}`, exact: true })).toBeVisible();
    }

    await expect(dialog.getByText("Format-Erweiterungen")).toHaveCount(0);
    await expect(dialog.getByText("Format extensions")).toHaveCount(0);
  });

  test("Formular: Format-Felder und externe Wertequellen", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await openFormMode(page);
    await oneOfSelect(page).selectOption("0");

    await expect(fieldByLabel(page, /^Email/)).toBeVisible();
    await expect(fieldByLabel(page, /^Website/)).toBeVisible();
    await expect(fieldByLabel(page, /^Phone/)).toBeVisible();
    await expect(fieldByLabel(page, /^Abteilung/)).toBeVisible();
    await expect(fieldByLabel(page, /^Manager \(API\)/)).toBeVisible();

    await expect(fieldByLabel(page, /^Email/).locator("input")).toHaveAttribute("type", "email");

    const abteilungOptions = await fieldByLabel(page, /^Abteilung/)
      .locator("select option")
      .allTextContents();
    expect(abteilungOptions).toEqual(expect.arrayContaining(["Vertrieb", "Entwicklung", "Support"]));

    const managerSelect = fieldByLabel(page, /^Manager \(API\)/).locator("select");
    await expect
      .poll(async () => managerSelect.locator("option").count(), { timeout: 15_000 })
      .toBeGreaterThan(1);

    const managerOptions = await managerSelect.locator("option").allTextContents();
    expect(managerOptions.some((label) => /Leanne|Ervin|Clementine/i.test(label))).toBe(true);

    expect(errors).toEqual([]);
  });

  test("Formular: neues Feld per Extension-Typ anlegbar", async ({ page }) => {
    await openEditorMode(page);

    await page.getByRole("button", { name: "Ausklappen", exact: true }).first().click();
    await page.getByRole("button", { name: "Element zu Mensch hinzufügen" }).click();

    const dialog = page.getByRole("dialog", { name: "Element hinzufügen" });
    await dialog.getByPlaceholder("z. B. name").fill("notiz");
    await dialog.getByRole("button", { name: "+ select-list", exact: true }).click();

    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "notiz löschen" }).first()).toBeVisible();

    await openFormMode(page);
    await oneOfSelect(page).selectOption("0");
    await expect(fieldByLabel(page, /^Selection/)).toBeVisible();

    const options = await fieldByLabel(page, /^Selection/).locator("select option").allTextContents();
    expect(options).toEqual(expect.arrayContaining(["Option A", "Option B", "Option C"]));
  });
});
