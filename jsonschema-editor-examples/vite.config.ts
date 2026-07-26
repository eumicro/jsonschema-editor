import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

/** Defaults to `/` for custom domain; override with `VITE_BASE_PATH` if needed. */
const base = process.env.VITE_BASE_PATH ?? "/";
const assetsDir = process.env.VITE_ASSETS_DIR ?? "assets";
const entryFile = process.env.VITE_ENTRY_FILE;

export default defineConfig({
  base,
  plugins: [vue()],
  resolve: {
    alias: {
      "@jsonschema-editor/json-schema-extensions/cel-editor": resolve(
        __dirname,
        "../jsonschema-editor-json-schema-extensions/src/cel-editor/index.ts",
      ),
      "@jsonschema-editor/json-schema-extensions": resolve(
        __dirname,
        "../jsonschema-editor-json-schema-extensions/src/index.ts",
      ),
      "@jsonschema-editor/vue": resolve(__dirname, "../jsonschema-editor-vue/src/index.ts"),
      "@jsonschema-editor/vue/style.css": resolve(
        __dirname,
        "../jsonschema-editor-vue/src/style.css",
      ),
      "@jsonschema-editor/vue-extensions": resolve(
        __dirname,
        "../jsonschema-editor-vue-extensions/src/index.ts",
      ),
    },
  },
  build: {
    assetsDir,
    rollupOptions: entryFile
      ? {
          output: {
            entryFileNames: entryFile,
            chunkFileNames: `${assetsDir}/[name]-[hash].js`,
            assetFileNames: `${assetsDir}/[name]-[hash][extname]`,
          },
        }
      : undefined,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: "/en/examples/vue/occupational-health-g37",
  },
});
