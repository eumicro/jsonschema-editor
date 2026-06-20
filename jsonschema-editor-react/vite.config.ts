import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      rollupTypes: true,
    }),
  ],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "JsonSchemaEditorReact",
      fileName: "jsonschema-editor-react",
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        assetFileNames: "style.css",
      },
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@jsonschema-editor/json-schema",
        "@jsonschema-editor/json-schema-extensions",
        "@jsonschema-editor/ui-schema",
        "@jsonschema-editor/ui-schema/bridge",
      ],
    },
  },
});
