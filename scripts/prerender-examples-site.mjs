import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { listSitemapPaths } from "./generate-examples-sitemap.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(root, "site");
const examplesDataRoot = join(root, "jsonschema-editor-examples", "src", "examples", "data");
const playwrightEntry = join(
  root,
  "jsonschema-editor-examples",
  "node_modules",
  "playwright",
  "index.mjs",
);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function contentType(filePath) {
  return MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]).replace(/\\/g, "/");
  const relative = clean.replace(/^\/+/, "");
  const candidates = [
    join(siteDir, relative),
    join(siteDir, relative, "index.html"),
    `${join(siteDir, relative)}.html`,
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return join(siteDir, "404.html");
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = req.url ?? "/";
      const filePath = resolveFile(urlPath);
      const body = readFileSync(filePath);
      // SPA fallback: serve 404.html bootstrap with 200 so deep links boot during prerender.
      res.writeHead(200, {
        "Content-Type": contentType(filePath),
        "Cache-Control": "no-store",
      });
      res.end(body);
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

function waitSelectorForPath(path) {
  if (path.includes("/get-started/")) return ".get-started__title";
  if (path.includes("/imprint")) return ".legal-page__title";
  return "h1.app__scenario-title, .app__scenario-title, .app__workspace h1";
}

async function main() {
  if (!existsSync(join(siteDir, "404.html"))) {
    throw new Error(`Missing assembled site at ${siteDir}. Run assemble first.`);
  }
  if (!existsSync(playwrightEntry)) {
    throw new Error(
      `Playwright not found at ${playwrightEntry}. Install examples deps (pnpm install).`,
    );
  }

  const { chromium } = await import(pathToFileURL(playwrightEntry).href);
  const paths = listSitemapPaths(examplesDataRoot);
  const { server, port } = await startServer();
  const base = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let ok = 0;
  try {
    for (const path of paths) {
      const url = `${base}${path}`;
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      await page.waitForSelector(waitSelectorForPath(path), { timeout: 30_000 });
      // Allow meta watchers to flush.
      await page.waitForTimeout(100);
      const html = await page.content();
      const outFile = join(siteDir, path.replace(/^\/+/, ""), "index.html");
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, html, "utf8");
      ok += 1;
      if (ok % 20 === 0 || ok === paths.length) {
        console.log(`Prerendered ${ok}/${paths.length}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`Prerender complete: ${ok} pages → ${siteDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
