import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = join(root, "site");
const vueDist = join(root, "jsonschema-editor-examples", "dist");
const reactDist = join(root, "jsonschema-editor-examples-react", "dist");
const defaultExampleId = "occupational-health-g37";

function assertDist(label, dir) {
  if (!existsSync(dir)) {
    throw new Error(`Missing ${label} dist at ${dir}. Build the examples apps first.`);
  }
}

/** Vite emits extracted CSS + JS linked from dist/index.html. */
function assetsFromDist(dist) {
  const indexPath = join(dist, "index.html");
  if (!existsSync(indexPath)) return { script: undefined, css: [] };
  const html = readFileSync(indexPath, "utf8");
  const script = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
  const css = [...html.matchAll(/href="(\/assets\/[^"]+\.css)"/g)].map((m) => m[1]);
  return { script, css };
}

/** Stable entry names (main.js) need a content hash or CDNs/browsers keep stale JS. */
function withContentHash(urlPath) {
  if (!urlPath) return urlPath;
  const filePath = join(siteDir, urlPath.replace(/^\//, ""));
  if (!existsSync(filePath)) return urlPath;
  const hash = createHash("sha256").update(readFileSync(filePath)).digest("hex").slice(0, 8);
  return `${urlPath}?v=${hash}`;
}

assertDist("Vue", vueDist);
assertDist("React", reactDist);

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });

cpSync(join(vueDist, "assets"), join(siteDir, "assets"), { recursive: true });
cpSync(join(reactDist, "assets"), join(siteDir, "assets"), { recursive: true });

const vueAssets = assetsFromDist(vueDist);
const reactAssets = assetsFromDist(reactDist);

const vueCss = vueAssets.css;
const reactCss = reactAssets.css;
const vueEntry = withContentHash(vueAssets.script ?? "/assets/vue/main.js");
const reactEntry = withContentHash(reactAssets.script ?? "/assets/react/main.js");

if (vueCss.length === 0) {
  console.warn("Warning: no Vue CSS linked in dist/index.html — site will render unstyled.");
}
if (reactCss.length === 0) {
  console.warn("Warning: no React CSS linked in dist/index.html — site will render unstyled.");
}

const bootstrap = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JSON Schema Editor</title>
    <script>
      (function () {
        var STACK_KEY = "jse.site.stack";
        var VUE_CSS = ${JSON.stringify(vueCss)};
        var REACT_CSS = ${JSON.stringify(reactCss)};
        var VUE_ENTRY = ${JSON.stringify(vueEntry)};
        var REACT_ENTRY = ${JSON.stringify(reactEntry)};
        function preferredStack() {
          try {
            var raw = sessionStorage.getItem(STACK_KEY);
            if (raw === "react" || raw === "vue") return raw;
          } catch (e) {}
          return "vue";
        }
        function injectStyles(hrefs) {
          for (var i = 0; i < hrefs.length; i++) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.crossOrigin = "";
            link.href = hrefs[i];
            document.head.appendChild(link);
          }
        }
        var path = location.pathname.replace(/\\/+$/, "") || "/";
        if (path === "/" || path === "") {
          location.replace("/en/examples/vue/${defaultExampleId}");
          return;
        }
        var parts = path.split("/").filter(Boolean);
        var stack =
          parts[1] === "examples" && (parts[2] === "vue" || parts[2] === "react")
            ? parts[2]
            : preferredStack();
        injectStyles(stack === "react" ? REACT_CSS : VUE_CSS);
        var s = document.createElement("script");
        s.type = "module";
        s.src = stack === "react" ? REACT_ENTRY : VUE_ENTRY;
        document.head.appendChild(s);
      })();
    </script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
`;

writeFileSync(join(siteDir, "index.html"), bootstrap, "utf8");
writeFileSync(join(siteDir, "404.html"), bootstrap, "utf8");

// Static root files (e.g. Google Search Console verification).
const publicDir = join(root, "jsonschema-editor-examples-site", "public");
if (existsSync(publicDir)) {
  cpSync(publicDir, siteDir, { recursive: true });
}

console.log(`Assembled examples site at ${siteDir}`);
console.log(`  Vue:  ${vueEntry} + ${vueCss.join(", ") || "(no css)"}`);
console.log(`  React: ${reactEntry} + ${reactCss.join(", ") || "(no css)"}`);
