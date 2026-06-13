import type { JseLocale } from "@jsonschema-editor/vue";

const appUi = {
  de: {
    brandPrefix: "JSON Schema",
    brandSuffix: "Editor",
    navGetStarted: "Erste Schritte",
    navExamples: "Szenarien",
    topNavAria: "Hauptnavigation",
    tagline: "Praxisformulare aus JSON Schema",
    subtitle:
      "Szenario wählen, Schema und UI anpassen, Formular sofort testen — ohne Toolwechsel.",
    scenariosHeading: "Einsatzszenarien",
    localeLabel: "Sprache",
    tabsAria: "Arbeitsbereich",
    tabForm: "Formular testen",
    tabEditor: "Schema bearbeiten",
    tabJson: "JSON",
    jsonTabsAria: "JSON-Ansicht",
    jsonSchema: "Schema",
    jsonUi: "UI-Schema",
    jsonData: "Daten",
    formPanelAria: "Ausfüllbares Formular",
    formDataSummary: "Live-Daten",
    dataPanelTitle: "Formulardaten",
    editorPanelAria: "Schema- und UI-Editor",
    jsonPanelAria: "JSON-Quelltext",
    categoryLabels: {
      "Gesundheit & Arbeitsschutz": "Gesundheit & Arbeitsschutz",
      "Vertrieb & Konfiguration": "Vertrieb & Konfiguration",
      "Anträge & Prozesse": "Anträge & Prozesse",
      "Versicherung & Service": "Versicherung & Service",
      "Logistik & Transport": "Logistik & Transport",
      Stammdaten: "Stammdaten",
    },
  },
  en: {
    brandPrefix: "JSON Schema",
    brandSuffix: "Editor",
    navGetStarted: "Get started",
    navExamples: "Examples",
    topNavAria: "Main navigation",
    tagline: "Real-world forms from JSON Schema",
    subtitle: "Pick a scenario, edit schema and UI, test the form — all in one workspace.",
    scenariosHeading: "Use cases",
    localeLabel: "Language",
    tabsAria: "Workspace",
    tabForm: "Test form",
    tabEditor: "Edit schema",
    tabJson: "JSON",
    jsonTabsAria: "JSON view",
    jsonSchema: "Schema",
    jsonUi: "UI schema",
    jsonData: "Data",
    formPanelAria: "Fillable form",
    formDataSummary: "Live data",
    dataPanelTitle: "Form data",
    editorPanelAria: "Schema and UI editor",
    jsonPanelAria: "JSON source",
    categoryLabels: {
      "Gesundheit & Arbeitsschutz": "Health & occupational safety",
      "Vertrieb & Konfiguration": "Sales & configuration",
      "Anträge & Prozesse": "Applications & processes",
      "Versicherung & Service": "Insurance & service",
      "Logistik & Transport": "Logistics & transport",
      Stammdaten: "Master data",
    },
  },
} as const satisfies Record<
  JseLocale,
  {
    brandPrefix: string;
    brandSuffix: string;
    navGetStarted: string;
    navExamples: string;
    topNavAria: string;
    tagline: string;
    subtitle: string;
    scenariosHeading: string;
    localeLabel: string;
    tabsAria: string;
    tabForm: string;
    tabEditor: string;
    tabJson: string;
    jsonTabsAria: string;
    jsonSchema: string;
    jsonUi: string;
    jsonData: string;
    formPanelAria: string;
    formDataSummary: string;
    dataPanelTitle: string;
    editorPanelAria: string;
    jsonPanelAria: string;
    categoryLabels: Record<string, string>;
  }
>;

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

export function categoryLabelFor(locale: JseLocale, category: string): string {
  const labels = appUiFor(locale).categoryLabels as Record<string, string>;
  return labels[category] ?? category;
}
