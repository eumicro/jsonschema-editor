import type { AppLocale } from "../types/locale.js";

export function getStartedFor(locale: AppLocale) {
  const isDe = locale === "de";
  return {
    title: isDe ? "Erste Schritte mit React" : "Get started with React",
    lead: isDe
      ? "JSON Schema und UI Schema bleiben framework-agnostisch — nur die Formular-Komponenten sind React-spezifisch."
      : "JSON Schema and UI Schema stay framework-agnostic — only the form components are React-specific.",
    conceptsHeading: isDe ? "Architektur" : "Architecture",
    concepts: [
      {
        title: isDe ? "Schema-Modell" : "Schema model",
        body: isDe
          ? "@jsonschema-editor/json-schema liefert ein objektorientiertes JSON-Schema-Modell."
          : "@jsonschema-editor/json-schema provides an object-oriented JSON Schema model.",
      },
      {
        title: isDe ? "UI Schema" : "UI schema",
        body: isDe
          ? "@jsonschema-editor/ui-schema beschreibt Layout und Controls getrennt vom Schema."
          : "@jsonschema-editor/ui-schema describes layout and controls separately from the schema.",
      },
      {
        title: isDe ? "React-Formular" : "React form",
        body: isDe
          ? "@jsonschema-editor/react rendert ausfüllbare Formulare mit Validierung."
          : "@jsonschema-editor/react renders fillable forms with validation.",
      },
    ],
    stepsHeading: isDe ? "Installation" : "Installation",
    steps: [
      {
        title: isDe ? "Pakete installieren" : "Install packages",
        body: isDe ? "React-Kern und Format-Extensions:" : "React core and format extensions:",
        code: `npm install @jsonschema-editor/react @jsonschema-editor/react-extensions \\
  @jsonschema-editor/json-schema-extensions react react-dom`,
      },
      {
        title: isDe ? "Extensions registrieren" : "Register extensions",
        body: isDe
          ? "Einmal beim App-Start — analog zu registerDefaultVueExtensions():"
          : "Once at app startup — similar to registerDefaultVueExtensions():",
        code: `import { registerDefaultReactExtensions } from "@jsonschema-editor/react-extensions";
registerDefaultReactExtensions();`,
      },
      {
        title: isDe ? "Formular einbinden" : "Use the form",
        body: isDe
          ? "Schema mit Extensions laden und JsonSchemaForm rendern:"
          : "Load schema with extensions and render JsonSchemaForm:",
        code: `import { JsonSchemaForm } from "@jsonschema-editor/react";
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import "@jsonschema-editor/react/style.css";`,
      },
    ],
    packagesHeading: isDe ? "npm-Pakete" : "npm packages",
    packages: [
      { name: "@jsonschema-editor/react", role: isDe ? "React-Formular" : "React form" },
      {
        name: "@jsonschema-editor/react-extensions",
        role: isDe ? "Format-Felder (email, url, phone)" : "Format fields (email, url, phone)",
      },
      {
        name: "@jsonschema-editor/json-schema-extensions",
        role: isDe ? "Schema-Extensions & Validatoren" : "Schema extensions & validators",
      },
    ],
    tryHeading: isDe ? "Szenarien ausprobieren" : "Try the scenarios",
    tryBody: isDe
      ? "Wählen Sie ein Praxisbeispiel und testen Sie das React-Formular mit live JSON-Ausgabe."
      : "Pick a real-world scenario and test the React form with live JSON output.",
    tryCta: isDe ? "Zu den Szenarien" : "Open examples",
  };
}
