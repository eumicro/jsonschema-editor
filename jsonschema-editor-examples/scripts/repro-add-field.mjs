import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:5173/";

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(url, { waitUntil: "networkidle" });
await page.locator("#app-example-select").selectOption("car-configurator");
await page.getByRole("tab", { name: "Form-Editor" }).click();
await page.getByRole("button", { name: "Element zu Auto-Konfigurator hinzufügen" }).click();
const dialog = page.getByRole("dialog", { name: "Element hinzufügen" });
await dialog.getByPlaceholder("z. B. name").fill("extra");
await dialog.getByRole("button", { name: "+ string", exact: true }).click();
await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
await page.waitForTimeout(800);

const fields = await page.locator(".jse-field").count();
const stepper = await page.locator(".jse-stepper").count();
const stepIndicators = await page.locator(".jse-stepper__step-indicator").count();
console.log(JSON.stringify({ fields, stepper, stepIndicators, errors }, null, 2));
await browser.close();
