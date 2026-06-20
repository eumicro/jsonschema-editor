import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerDefaultReactExtensions } from "@jsonschema-editor/react-extensions";
import { App } from "./App.js";
import "../../jsonschema-editor-examples/src/app.css";
import "./app-overrides.css";
import "../../jsonschema-editor-react/src/style.css";

registerDefaultReactExtensions();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
