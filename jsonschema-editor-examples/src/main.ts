import { createApp } from "vue";
import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";
import App from "./App.vue";
import "../../jsonschema-editor-vue/src/style.css";
import "./app.css";

registerDefaultVueExtensions();

createApp(App).mount("#app");
