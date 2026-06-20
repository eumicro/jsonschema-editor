import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

const base = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
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
  server: {
    port: 5174,
    open: true,
  },
});
