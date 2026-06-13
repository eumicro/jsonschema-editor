import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173/";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
await page.locator("#app-example-select").selectOption("car-configurator");
await page.waitForTimeout(1000);

const info = await page.evaluate(() => {
  const stepper = document.querySelector(".jse-stepper");
  const categorization = document.querySelector(".jse-categorization");
  const fields = document.querySelectorAll(".jse-field").length;
  const stepIndicators = document.querySelectorAll(".jse-stepper__step-indicator").length;
  const html = document.querySelector(".jse-form")?.innerHTML?.slice(0, 500) ?? "no form";
  return { stepper: !!stepper, categorization: !!categorization, fields, stepIndicators, html };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
