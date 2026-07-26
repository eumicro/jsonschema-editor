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

assertDist("Vue", vueDist);
assertDist("React", reactDist);

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });

cpSync(join(vueDist, "assets"), join(siteDir, "assets"), { recursive: true });
cpSync(join(reactDist, "assets"), join(siteDir, "assets"), { recursive: true });

const bootstrap = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JSON Schema Editor</title>
    <script>
      (function () {
        var STACK_KEY = "jse.site.stack";
        function preferredStack() {
          try {
            var raw = sessionStorage.getItem(STACK_KEY);
            if (raw === "react" || raw === "vue") return raw;
          } catch (e) {}
          return "vue";
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

// Keep a copy of each app's built CSS entry references if emitted beside assets.
for (const [label, dist] of [
  ["vue", vueDist],
  ["react", reactDist],
]) {
  const indexPath = join(dist, "index.html");
  if (!existsSync(indexPath)) continue;
  const html = readFileSync(indexPath, "utf8");
  const cssMatches = [...html.matchAll(/href="(\/assets\/[^"]+\.css)"/g)].map((m) => m[1]);
  if (cssMatches.length === 0) continue;
  // Bootstrap loads only JS entry; Vite injects CSS via JS. No extra link needed.
  void label;
  void cssMatches;
}

console.log(`Assembled examples site at ${siteDir}`);
