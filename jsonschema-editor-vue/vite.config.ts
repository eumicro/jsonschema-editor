import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: ["src"],
      rollupTypes: true,
    }),
  ],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "JsonSchemaEditorVue",
      fileName: "jsonschema-editor-vue",
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        assetFileNames: "style.css",
      },
      external: [
        "vue",
        "@jsonschema-editor/json-schema",
        "@jsonschema-editor/ui-schema",
        "@jsonschema-editor/ui-schema/bridge",
      ],
    },
  },
});
