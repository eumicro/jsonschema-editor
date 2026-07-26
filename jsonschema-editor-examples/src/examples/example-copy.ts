import type { AppLocale } from "../app-routing.js";

export type ExampleCopy = {
  label: string;
  tagline: string;
  description: string;
};

type ExampleCopySource = {
  label: string;
  tagline: string;
  description: string;
  locales?: Partial<
    Record<AppLocale, { label?: string; tagline?: string; description?: string }>
  >;
};

/** Localized gallery copy for an example (English base, optional per-locale overrides). */
export function exampleCopyFor(manifest: ExampleCopySource, locale: string): ExampleCopy {
  const base: ExampleCopy = {
    label: manifest.label,
    tagline: manifest.tagline,
    description: manifest.description,
  };
  if (locale === "en") return base;
  const override = manifest.locales?.[locale as AppLocale];
  if (!override) return base;
  return {
    label: override.label?.trim() || base.label,
    tagline: override.tagline?.trim() || base.tagline,
    description: override.description?.trim() || base.description,
  };
}
