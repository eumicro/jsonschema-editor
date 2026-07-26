import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("pnpm", ["--filter", "jsonschema-editor-examples", "run", "build"], {
  VITE_BASE_PATH: "/",
  VITE_ASSETS_DIR: "assets/vue",
  VITE_ENTRY_FILE: "assets/vue/main.js",
});

run("pnpm", ["--filter", "jsonschema-editor-examples-react", "run", "build"], {
  VITE_BASE_PATH: "/",
  VITE_ASSETS_DIR: "assets/react",
  VITE_ENTRY_FILE: "assets/react/main.js",
});

run("node", ["scripts/assemble-examples-site.mjs"]);
run("node", ["scripts/prerender-examples-site.mjs"]);
