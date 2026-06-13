import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173/";
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.stack || e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto(url, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
await page.locator("#app-example-select").selectOption("car-configurator");
await page.waitForTimeout(1000);

console.log(errors.join("\n\n---\n\n"));
await browser.close();
