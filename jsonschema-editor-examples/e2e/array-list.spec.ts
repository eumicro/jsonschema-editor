import { expect, test } from "@playwright/test";
import { openFormMode, readFormOutput, selectExample } from "./helpers";

test.describe("Array-Listen im Formular", () => {
  test("Einträge hinzufügen und entfernen", async ({ page }) => {
    await page.goto("/");
    await selectExample(page, "array-list-qa");
    await openFormMode(page);

    const list = page.locator(".jse-array-field");
    await expect(list.locator(".jse-array-item")).toHaveCount(1);
    await expect(list.getByRole("button", { name: "Entfernen" })).toHaveCount(0);

    await list.getByRole("button", { name: "Eintrag hinzufügen" }).click();
    await expect(list.locator(".jse-array-item")).toHaveCount(2);

    const secondItem = list.locator(".jse-array-item").nth(1);
    await secondItem.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Bezeichnung" }),
    }).locator("input").fill("Zweite Position");
    await secondItem.locator(".jse-field").filter({
      has: page.locator(".jse-field__label", { hasText: "Betrag" }),
    }).locator("input").fill("99");

    const output = await readFormOutput(page);
    expect(output.positionen).toEqual([
      { bezeichnung: "Erstposition", betrag: 10 },
      { bezeichnung: "Zweite Position", betrag: 99 },
    ]);

    await secondItem.getByRole("button", { name: "Entfernen" }).click();
    await expect(list.locator(".jse-array-item")).toHaveCount(1);
  });
});
