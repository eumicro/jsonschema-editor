import type { AppLocale } from "../types/locale.js";

export function imprintFor(locale: AppLocale) {
  const isDe = locale === "de";
  return {
    pageTitle: isDe ? "Impressum & Datenschutz" : "Legal notice & privacy",
    lastUpdated: "2025",
    intro: isDe
      ? "Diese React-Demo ist Teil des Open-Source-Projekts jsonschema-editor."
      : "This React demo is part of the open-source jsonschema-editor project.",
    repositoryLabel: isDe ? "Quellcode" : "Source code",
    repositoryUrl: "https://github.com/eumicro/jsonschema-editor",
    vueDemoLabel: isDe ? "Vue-Demo (Produktion)" : "Vue demo (production)",
    vueDemoUrl: "https://jsonschema-editor.cloudapplication.net/",
  };
}
