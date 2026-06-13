import type { JseLocale } from "@jsonschema-editor/vue";

export type GetStartedConcept = {
  title: string;
  body: string;
};

export type GetStartedStep = {
  title: string;
  body: string;
  code?: string;
};

export type GetStartedPackage = {
  name: string;
  role: string;
};

export type GetStartedContent = {
  title: string;
  lead: string;
  conceptsHeading: string;
  concepts: GetStartedConcept[];
  stepsHeading: string;
  steps: GetStartedStep[];
  packagesHeading: string;
  packages: GetStartedPackage[];
  tryHeading: string;
  tryBody: string;
  tryCta: string;
};

const content = {
  de: {
    title: "Erste Schritte",
    lead: "Formulare deklarieren statt manuell bauen: JSON Schema für Validierung und Struktur, UI-Schema für Layout und Sichtbarkeit, Vue-Komponenten für die Darstellung.",
    conceptsHeading: "Drei Bausteine",
    concepts: [
      {
        title: "JSON Schema",
        body: "Felder, Typen, Pflichtangaben und Erweiterungen wie x-computed oder x-geometry.",
      },
      {
        title: "UI-Schema",
        body: "Anordnung in Layouts, Stepper, Gruppen und Regeln — unabhängig vom Datenmodell.",
      },
      {
        title: "Formulardaten",
        body: "Das ausgefüllte JSON-Objekt, gebunden an Ihre Anwendung oder API.",
      },
    ],
    stepsHeading: "In vier Schritten starten",
    steps: [
      {
        title: "Pakete installieren",
        body: "Im Monorepo genügt pnpm install am Repository-Root. In eigenen Projekten die benötigten @jsonschema-editor/* Pakete hinzufügen.",
        code: `pnpm add @jsonschema-editor/vue @jsonschema-editor/vue-extensions \\
  @jsonschema-editor/json-schema @jsonschema-editor/json-schema-extensions \\
  @jsonschema-editor/ui-schema`,
      },
      {
        title: "Erweiterungen registrieren",
        body: "Format-Felder, Geometrie, berechnete Werte und Wertelisten werden über registerDefaultVueExtensions() aktiviert.",
        code: `import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";

registerDefaultVueExtensions();`,
      },
      {
        title: "Schema und UI laden",
        body: "Custom-Attribute bleiben nur erhalten, wenn documentFromJSONWithExtensions() statt documentFromJSON() verwendet wird.",
        code: `import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

const schema = documentFromJSONWithExtensions(schemaJson);
const uiSchema = UiSchema.fromJSON(uiSchemaJson);`,
      },
      {
        title: "Formular rendern",
        body: "JsonSchemaForm bindet Daten per v-model. JsonSchemaFormEditor bearbeitet Schema und UI-Schema im gleichen Modell.",
        code: `<JsonSchemaForm
  v-model="formData"
  :schema="schema"
  :ui-schema="uiSchema"
  locale="de"
/>`,
      },
    ],
    packagesHeading: "Pakete im Überblick",
    packages: [
      { name: "@jsonschema-editor/json-schema", role: "Schema-Modell, Validierung, Pfade" },
      { name: "@jsonschema-editor/json-schema-extensions", role: "x-geometry, x-computed, Formate" },
      { name: "@jsonschema-editor/ui-schema", role: "UI-Schema-Typen und Bridge" },
      { name: "@jsonschema-editor/vue", role: "JsonSchemaForm, JsonSchemaFormEditor" },
      { name: "@jsonschema-editor/vue-extensions", role: "Karte, CEL, Format-Widgets" },
    ],
    tryHeading: "Direkt ausprobieren",
    tryBody:
      "In den Einsatzszenarien finden Sie fertige Schema-/UI-Paare — von G37-Vorsorge bis Fahrzeugbestellung. Formular testen, Schema bearbeiten und JSON live mitverfolgen.",
    tryCta: "Zu den Szenarien",
  },
  en: {
    title: "Get started",
    lead: "Declare forms instead of hand-building them: JSON Schema for structure and validation, UI schema for layout and rules, Vue components for rendering.",
    conceptsHeading: "Three building blocks",
    concepts: [
      {
        title: "JSON Schema",
        body: "Fields, types, required properties, and extensions such as x-computed or x-geometry.",
      },
      {
        title: "UI schema",
        body: "Layouts, steppers, groups, and visibility — separate from the data model.",
      },
      {
        title: "Form data",
        body: "The filled JSON object, bound to your application or API.",
      },
    ],
    stepsHeading: "Start in four steps",
    steps: [
      {
        title: "Install packages",
        body: "In this monorepo, run pnpm install at the repository root. In your own app, add the @jsonschema-editor/* packages you need.",
        code: `pnpm add @jsonschema-editor/vue @jsonschema-editor/vue-extensions \\
  @jsonschema-editor/json-schema @jsonschema-editor/json-schema-extensions \\
  @jsonschema-editor/ui-schema`,
      },
      {
        title: "Register extensions",
        body: "Format fields, map geometry, computed values, and value lists are enabled via registerDefaultVueExtensions().",
        code: `import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";

registerDefaultVueExtensions();`,
      },
      {
        title: "Load schema and UI",
        body: "Custom attributes are preserved only when you use documentFromJSONWithExtensions() instead of documentFromJSON().",
        code: `import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

const schema = documentFromJSONWithExtensions(schemaJson);
const uiSchema = UiSchema.fromJSON(uiSchemaJson);`,
      },
      {
        title: "Render the form",
        body: "JsonSchemaForm binds data with v-model. JsonSchemaFormEditor edits schema and UI schema in the same model.",
        code: `<JsonSchemaForm
  v-model="formData"
  :schema="schema"
  :ui-schema="uiSchema"
  locale="en"
/>`,
      },
    ],
    packagesHeading: "Packages at a glance",
    packages: [
      { name: "@jsonschema-editor/json-schema", role: "Schema model, validation, paths" },
      { name: "@jsonschema-editor/json-schema-extensions", role: "x-geometry, x-computed, formats" },
      { name: "@jsonschema-editor/ui-schema", role: "UI schema types and bridge" },
      { name: "@jsonschema-editor/vue", role: "JsonSchemaForm, JsonSchemaFormEditor" },
      { name: "@jsonschema-editor/vue-extensions", role: "Map, CEL, format widgets" },
    ],
    tryHeading: "Try it now",
    tryBody:
      "The use-case scenarios include ready-made schema/UI pairs — from G37 screening to vehicle orders. Test the form, edit the schema, and watch JSON update live.",
    tryCta: "Browse scenarios",
  },
} as const satisfies Record<JseLocale, GetStartedContent>;

export function getStartedFor(locale: JseLocale): GetStartedContent {
  return content[locale as keyof typeof content] ?? content.de;
}
