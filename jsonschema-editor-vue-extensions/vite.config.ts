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
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "JsonSchemaEditorVueExtensions",
      fileName: "jsonschema-editor-vue-extensions",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "vue",
        "@jsonschema-editor/vue",
        "@jsonschema-editor/json-schema",
        "@jsonschema-editor/json-schema-extensions",
      ],
    },
  },
});
