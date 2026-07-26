import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LOCALES = ["de", "en", "fr", "it", "pl", "uk", "ru", "zh", "ja"];
/** SEO canonical stack only — React URLs stay reachable but are not listed. */
const SEO_STACK = "vue";
const DEFAULT_ORIGIN = "https://jsonschema-editor.cloudapplication.net";

/**
 * Build sitemap.xml + robots.txt from public example metas and app locales (Vue-only).
 *
 * @param {object} options
 * @param {string} options.dataRoot Absolute path to examples data (…/src/examples/data)
 * @param {string} options.outDir Absolute path to assembled site root
 * @param {string} [options.origin] Site origin without trailing slash
 * @param {string} [options.cnamePath] Optional CNAME file to derive origin
 */
export function generateExamplesSitemap({ dataRoot, outDir, origin, cnamePath }) {
  const siteOrigin = resolveOrigin(origin, cnamePath);
  const exampleIds = publicExampleIds(dataRoot);
  const lastmod = new Date().toISOString().slice(0, 10);

  /** @type {{ pathTemplate: string, priority: string, changefreq: string }[]} */
  const pages = [
    {
      pathTemplate: `/get-started/${SEO_STACK}`,
      priority: "0.9",
      changefreq: "weekly",
    },
  ];

  for (const exampleId of exampleIds) {
    pages.push({
      pathTemplate: `/examples/${SEO_STACK}/${exampleId}`,
      priority: "0.8",
      changefreq: "weekly",
    });
  }

  pages.push({
    pathTemplate: "/imprint",
    priority: "0.3",
    changefreq: "yearly",
  });

  const urlEntries = [];
  for (const page of pages) {
    for (const locale of LOCALES) {
      const loc = `${siteOrigin}/${locale}${page.pathTemplate}`;
      const alternates = LOCALES.map(
        (alt) =>
          `    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(`${siteOrigin}/${alt}${page.pathTemplate}`)}"/>`,
      ).join("\n");
      const xDefault = `${siteOrigin}/en${page.pathTemplate}`;
      urlEntries.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(xDefault)}"/>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join("\n")}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${siteOrigin}/sitemap.xml
`;

  writeFileSync(join(outDir, "sitemap.xml"), sitemap, "utf8");
  writeFileSync(join(outDir, "robots.txt"), robots, "utf8");

  return {
    origin: siteOrigin,
    exampleCount: exampleIds.length,
    urlCount: urlEntries.length,
    paths: pages.flatMap((page) => LOCALES.map((locale) => `/${locale}${page.pathTemplate}`)),
  };
}

export function listSitemapPaths(dataRoot) {
  const exampleIds = publicExampleIds(dataRoot);
  const paths = [];
  for (const locale of LOCALES) {
    paths.push(`/${locale}/get-started/${SEO_STACK}`);
    for (const exampleId of exampleIds) {
      paths.push(`/${locale}/examples/${SEO_STACK}/${exampleId}`);
    }
    paths.push(`/${locale}/imprint`);
  }
  return paths;
}

function resolveOrigin(origin, cnamePath) {
  if (origin) return origin.replace(/\/+$/, "");
  if (cnamePath && existsSync(cnamePath)) {
    const host = readFileSync(cnamePath, "utf8").trim().split(/\s+/)[0];
    if (host) return `https://${host}`;
  }
  return DEFAULT_ORIGIN;
}

function publicExampleIds(dataRoot) {
  if (!existsSync(dataRoot)) {
    throw new Error(`Examples data root missing: ${dataRoot}`);
  }
  const ids = [];
  for (const id of readdirSync(dataRoot, { withFileTypes: true })) {
    if (!id.isDirectory()) continue;
    const metaPath = join(dataRoot, id.name, "meta.json");
    if (!existsSync(metaPath)) continue;
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    if (meta.visibility === "public") ids.push(id.name);
  }
  return ids.sort();
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
