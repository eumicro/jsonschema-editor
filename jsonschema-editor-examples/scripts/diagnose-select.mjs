import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.locator("#app-example-select").selectOption("person-with-defs");
await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
await page.waitForTimeout(1000);

const abteilungField = page.locator(".jse-field").filter({ hasText: "Abteilung" });
await abteilungField.locator("select").selectOption("Entwicklung");
await page.waitForTimeout(200);

const output = await page.locator(".app__output").textContent();
console.log("After abteilung select:", output);

await abteilungField.locator("select").selectOption({ index: 0 });
await page.waitForTimeout(200);
console.log("After index 0:", await page.locator(".app__output").textContent());

await browser.close();
