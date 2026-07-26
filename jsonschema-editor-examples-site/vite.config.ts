import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const rootDir = resolve(__dirname, "..");

export default defineConfig({
  appType: "spa",
  plugins: [vue(), react()],
  resolve: {
    alias: {
      "@jsonschema-editor/json-schema-extensions/cel-editor": resolve(
        rootDir,
        "jsonschema-editor-json-schema-extensions/src/cel-editor/index.ts",
      ),
      "@jsonschema-editor/json-schema-extensions": resolve(
        rootDir,
        "jsonschema-editor-json-schema-extensions/src/index.ts",
      ),
      "@jsonschema-editor/vue": resolve(rootDir, "jsonschema-editor-vue/src/index.ts"),
      "@jsonschema-editor/vue/style.css": resolve(
        rootDir,
        "jsonschema-editor-vue/src/style.css",
      ),
      "@jsonschema-editor/vue-extensions": resolve(
        rootDir,
        "jsonschema-editor-vue-extensions/src/index.ts",
      ),
      "@jsonschema-editor/react": resolve(rootDir, "jsonschema-editor-react/src/index.ts"),
      "@jsonschema-editor/react/style.css": resolve(
        rootDir,
        "jsonschema-editor-react/src/style.css",
      ),
      "@jsonschema-editor/react-extensions": resolve(
        rootDir,
        "jsonschema-editor-react-extensions/src/index.ts",
      ),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    open: "/en/examples/vue/occupational-health-g37",
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
});
