import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const base = process.env.VITE_BASE_PATH ?? "/";
const assetsDir = process.env.VITE_ASSETS_DIR ?? "assets";
const entryFile = process.env.VITE_ENTRY_FILE;

export default defineConfig({
  base,
  plugins: [react()],
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
      "@jsonschema-editor/react": resolve(__dirname, "../jsonschema-editor-react/src/index.ts"),
      "@jsonschema-editor/react/style.css": resolve(
        __dirname,
        "../jsonschema-editor-react/src/style.css",
      ),
      "@jsonschema-editor/react-extensions": resolve(
        __dirname,
        "../jsonschema-editor-react-extensions/src/index.ts",
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
    port: 5174,
    open: "/en/examples/react/field-extensions-qa",
  },
});
