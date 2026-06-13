import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await page.locator("#app-example-select").selectOption("person-with-defs");
await page.getByRole("tab", { name: "Ausfüllbares Formular" }).click();
await page.waitForTimeout(1500);

const bad = logs.filter((l) => /error|warn|fail|undefined|JseSelect|ValuesSource|ExtendedFormat/i.test(l));
console.log("Relevant logs:", bad.join("\n") || "(none)");
console.log("Field count:", await page.locator(".jse-field").count());
await browser.close();
