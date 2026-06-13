import type { JseLocale } from "@jsonschema-editor/vue";

const appUi = {
  de: {
    title: "JSON Schema Editor – Beispiel",
    lead:
      "Strukturieren Sie das JSON Schema, passen Sie die Formular-Oberfläche an und testen Sie das Ergebnis – ohne zwischen Tools wechseln zu müssen.",
    workflowAria: "Arbeitsablauf",
    stepEdit: "Schema & UI bearbeiten",
    stepTest: "Formular testen",
    exampleLabel: "Beispiel",
    localeLabel: "Sprache",
    tabsAria: "Ansichtsmodus",
    tabEditor: "Form-Editor",
    tabForm: "Ausfüllbares Formular",
    formHintBefore: "Vorschau des generierten Formulars. Änderungen am Schema nehmen Sie im",
    formHintLink: "Form-Editor",
    formHintAfter: "vor.",
    formPanelAria: "Ausfüllbares Formular",
    formDataSummary: "Formulardaten (JSON)",
  },
  en: {
    title: "JSON Schema Editor – Demo",
    lead:
      "Structure your JSON schema, customize the form UI, and test the result — without switching between tools.",
    workflowAria: "Workflow",
    stepEdit: "Edit schema & UI",
    stepTest: "Test form",
    exampleLabel: "Example",
    localeLabel: "Language",
    tabsAria: "View mode",
    tabEditor: "Form editor",
    tabForm: "Fillable form",
    formHintBefore: "Preview of the generated form. Edit the schema in the",
    formHintLink: "form editor",
    formHintAfter: ".",
    formPanelAria: "Fillable form",
    formDataSummary: "Form data (JSON)",
  },
} as const satisfies Record<JseLocale, Record<string, string>>;

export const localeOptions: { value: JseLocale; label: string }[] = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "English" },
];

export function appUiFor(locale: JseLocale) {
  return appUi[locale as keyof typeof appUi] ?? appUi.de;
}

export function fallbackLocaleFor(locale: JseLocale): JseLocale {
  return locale === "en" ? "de" : "en";
}
