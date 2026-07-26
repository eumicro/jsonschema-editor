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

/** Vite emits extracted CSS linked from dist/index.html — bootstrap must load those too. */
function cssHrefsFromDist(dist) {
  const indexPath = join(dist, "index.html");
  if (!existsSync(indexPath)) return [];
  const html = readFileSync(indexPath, "utf8");
  return [...html.matchAll(/href="(\/assets\/[^"]+\.css)"/g)].map((m) => m[1]);
}

assertDist("Vue", vueDist);
assertDist("React", reactDist);

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });

cpSync(join(vueDist, "assets"), join(siteDir, "assets"), { recursive: true });
cpSync(join(reactDist, "assets"), join(siteDir, "assets"), { recursive: true });

const vueCss = cssHrefsFromDist(vueDist);
const reactCss = cssHrefsFromDist(reactDist);
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
        var entry = stack === "react" ? "/assets/react/main.js" : "/assets/vue/main.js";
        var s = document.createElement("script");
        s.type = "module";
        s.src = entry;
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
console.log(`  Vue CSS: ${vueCss.join(", ") || "(none)"}`);
console.log(`  React CSS: ${reactCss.join(", ") || "(none)"}`);
