import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerDefaultReactExtensions } from "@jsonschema-editor/react-extensions";
import { App } from "./App.js";
import "../../jsonschema-editor-examples/src/app.css";
import "../../jsonschema-editor-react/src/style.css";

registerDefaultReactExtensions();

const mount = document.getElementById("app");
if (!mount) {
  throw new Error('Missing mount element "#app"');
}

createRoot(mount).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
