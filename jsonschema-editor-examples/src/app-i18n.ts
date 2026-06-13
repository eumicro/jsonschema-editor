import type { JseLocale } from "@jsonschema-editor/vue";

const appUi = {
  de: {
    title: "Formulare für echte Einsatzszenarien",
    lead:
      "Wählen Sie ein Praxisbeispiel, passen Sie Schema und Oberfläche an und testen Sie das ausfüllbare Formular — alles in einer Oberfläche.",
    scenariosHeading: "Einsatzszenarien",
    localeLabel: "Sprache",
    tabsAria: "Ansichtsmodus",
    tabEditor: "Schema bearbeiten",
    tabForm: "Formular testen",
    formHintBefore: "Vorschau des Formulars für das gewählte Szenario. Änderungen am Schema nehmen Sie unter",
    formHintLink: "Schema bearbeiten",
    formHintAfter: "vor.",
    formPanelAria: "Ausfüllbares Formular",
    formDataSummary: "Formulardaten (JSON)",
    categoryLabels: {
      "Gesundheit & Arbeitsschutz": "Gesundheit & Arbeitsschutz",
      "Vertrieb & Konfiguration": "Vertrieb & Konfiguration",
      "Anträge & Prozesse": "Anträge & Prozesse",
      Stammdaten: "Stammdaten",
    },
  },
  en: {
    title: "Forms for real-world scenarios",
    lead:
      "Pick a practical example, adjust schema and UI, and test the fillable form — all in one place.",
    scenariosHeading: "Use cases",
    localeLabel: "Language",
    tabsAria: "View mode",
    tabEditor: "Edit schema",
    tabForm: "Test form",
    formHintBefore: "Preview of the form for the selected scenario. Edit the schema under",
    formHintLink: "Edit schema",
    formHintAfter: ".",
    formPanelAria: "Fillable form",
    formDataSummary: "Form data (JSON)",
    categoryLabels: {
      "Gesundheit & Arbeitsschutz": "Health & occupational safety",
      "Vertrieb & Konfiguration": "Sales & configuration",
      "Anträge & Prozesse": "Applications & processes",
      Stammdaten: "Master data",
    },
  },
} as const satisfies Record<
  JseLocale,
  {
    title: string;
    lead: string;
    scenariosHeading: string;
    localeLabel: string;
    tabsAria: string;
    tabEditor: string;
    tabForm: string;
    formHintBefore: string;
    formHintLink: string;
    formHintAfter: string;
    formPanelAria: string;
    formDataSummary: string;
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
