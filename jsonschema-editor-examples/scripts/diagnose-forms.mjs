import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173/";
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

await page.goto(url, { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();

for (const id of ["car-configurator", "person-with-defs", "person-one-of", "simple-composition"]) {
  errors.length = 0;
  await page.locator("#app-example-select").selectOption(id);
  await page.waitForTimeout(800);
  const fields = await page.locator(".jse-field").count();
  console.log(`${id}: fields=${fields} errors=${errors.length ? errors.join(";") : "none"}`);
}

await browser.close();
