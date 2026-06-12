import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@jsonschema-editor/vue": resolve(__dirname, "../jsonschema-editor-vue/src/index.ts"),
      "@jsonschema-editor/vue/style.css": resolve(
        __dirname,
        "../jsonschema-editor-vue/src/style.css",
      ),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
