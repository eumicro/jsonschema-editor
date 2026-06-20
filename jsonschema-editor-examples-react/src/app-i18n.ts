import type { AppLocale } from "./types/locale.js";

export type { AppLocale };

export const localeOptions = [
  { value: "de" as const, label: "Deutsch" },
  { value: "en" as const, label: "English" },
];

export function fallbackLocaleFor(locale: AppLocale): AppLocale {
  return locale === "de" ? "en" : "de";
}

const appUi = {
  de: {
    brandPrefix: "JSON Schema",
    brandSuffix: "Editor",
    reactBadge: "React",
    navGetStarted: "Erste Schritte",
    navExamples: "Szenarien",
    navImprint: "Impressum",
    footerImprint: "Impressum & Datenschutz",
    footerCopyright: "© Eugen Lange",
    topNavAria: "Hauptnavigation",
    tagline: "Praxisformulare aus JSON Schema",
    subtitle:
      "React-Demo: Szenario wählen, Formular testen und JSON-Daten live mitverfolgen.",
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
    editorPanelAria: "Schema- und UI-Editor",
    dataPanelTitle: "Formulardaten",
    jsonPanelAria: "JSON-Quelltext",
    reactNoticeTitle: "React-Demo",
    reactNoticeBody:
      "Diese Demo nutzt @jsonschema-editor/react mit allen react-extensions (Format, Wertelisten, berechnete Felder, Datei-Upload, Geometrie).",
    categoryLabels: {
      "Gesundheit & Arbeitsschutz": "Gesundheit & Arbeitsschutz",
      "Vertrieb & Konfiguration": "Vertrieb & Konfiguration",
      "Anträge & Prozesse": "Anträge & Prozesse",
      "Versicherung & Service": "Versicherung & Service",
      "Logistik & Transport": "Logistik & Transport",
      Stammdaten: "Stammdaten",
      "Standort & Planung": "Standort & Planung",
    },
  },
  en: {
    brandPrefix: "JSON Schema",
    brandSuffix: "Editor",
    reactBadge: "React",
    navGetStarted: "Get started",
    navExamples: "Examples",
    navImprint: "Legal notice",
    footerImprint: "Legal notice & privacy",
    footerCopyright: "© Eugen Lange",
    topNavAria: "Main navigation",
    tagline: "Real-world forms from JSON Schema",
    subtitle: "React demo: pick a scenario, test the form, and inspect live JSON data.",
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
    editorPanelAria: "Schema and UI editor",
    dataPanelTitle: "Form data",
    jsonPanelAria: "JSON source",
    reactNoticeTitle: "React demo",
    reactNoticeBody:
      "This demo uses @jsonschema-editor/react with all react-extensions (formats, value lists, computed fields, file upload, geometry).",
    categoryLabels: {
      "Gesundheit & Arbeitsschutz": "Health & occupational safety",
      "Vertrieb & Konfiguration": "Sales & configuration",
      "Anträge & Prozesse": "Applications & processes",
      "Versicherung & Service": "Insurance & service",
      "Logistik & Transport": "Logistics & transport",
      Stammdaten: "Master data",
      "Standort & Planung": "Location & planning",
    },
  },
} as const;

export function appUiFor(locale: AppLocale) {
  return appUi[locale];
}

export function categoryLabelFor(locale: AppLocale, category: keyof typeof appUi.de.categoryLabels) {
  return appUi[locale].categoryLabels[category] ?? category;
}
