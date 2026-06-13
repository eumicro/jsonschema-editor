import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:5173/";
const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(url, { waitUntil: "networkidle" });
await page.locator("#app-example-select").selectOption("person-with-defs");
await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
await page.locator(".jse-oneof-field select").first().selectOption("0");

const nameField = page.locator(".jse-field").filter({
  has: page.locator(".jse-field__label", { hasText: /^Name/ }),
});
await nameField.locator("input").fill("");
await nameField.locator("input").blur();
await page.waitForTimeout(300);

const invalid = await nameField.evaluate((el) => el.classList.contains("jse-field--invalid"));
const error = await nameField.locator(".jse-field__error").textContent();
console.log(JSON.stringify({ invalid, error }, null, 2));
await browser.close();
