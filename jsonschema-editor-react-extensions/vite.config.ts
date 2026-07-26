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
      name: "JsonSchemaEditorReactExtensions",
      fileName: "jsonschema-editor-react-extensions",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "@jsonschema-editor/react",
        "@jsonschema-editor/json-schema",
        "@jsonschema-editor/json-schema-extensions",
        "@jsonschema-editor/json-schema-extensions/cel-editor",
        /^@codemirror\//,
        "codemirror",
        /^@lezer\//,
      ],
    },
  },
});
