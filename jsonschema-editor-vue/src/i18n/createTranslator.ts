import { deMessages } from "./messages/de.js";
import { enMessages } from "./messages/en.js";
import type { JseLocale, JseTranslateParams, TranslateFn } from "./types.js";

export const DEFAULT_LOCALE: JseLocale = "de";
export const FALLBACK_LOCALE: JseLocale = "en";

export const builtInMessages: Record<JseLocale, Record<string, string>> = {
  de: { ...deMessages },
  en: { ...enMessages },
};

function interpolate(template: string, params?: JseTranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}

export interface TranslatorContext {
  locale: JseLocale;
  fallbackLocale: JseLocale;
  messages: Record<JseLocale, Record<string, string>>;
  translate?: TranslateFn;
  t: TranslateFn;
  te: (key: string) => boolean;
}

export function mergeMessages(
  base: Record<JseLocale, Record<string, string>>,
  overrides?: Partial<Record<JseLocale, Record<string, string>>>,
): Record<JseLocale, Record<string, string>> {
  if (!overrides) return base;
  const merged: Record<JseLocale, Record<string, string>> = { ...base };
  for (const [locale, messages] of Object.entries(overrides) as [JseLocale, Record<string, string>][]) {
    merged[locale] = { ...merged[locale], ...messages };
  }
  return merged;
}

export function createTranslator(options?: {
  locale?: JseLocale;
  fallbackLocale?: JseLocale;
  messages?: Partial<Record<JseLocale, Record<string, string>>>;
  translate?: TranslateFn;
}): TranslatorContext {
  const locale = options?.locale ?? DEFAULT_LOCALE;
  const fallbackLocale = options?.fallbackLocale ?? FALLBACK_LOCALE;
  const messages = mergeMessages(builtInMessages, options?.messages);
  const customTranslate = options?.translate;

  function lookup(key: string, activeLocale: JseLocale): string | undefined {
    return messages[activeLocale]?.[key] ?? messages[fallbackLocale]?.[key];
  }

  function te(key: string): boolean {
    return lookup(key, locale) !== undefined;
  }

  function t(key: string, params?: JseTranslateParams): string {
    if (customTranslate) {
      const custom = customTranslate(key, params);
      if (custom !== key || te(key)) return custom;
    }
    const template = lookup(key, locale);
    if (template !== undefined) return interpolate(template, params);
    return key;
  }

  return { locale, fallbackLocale, messages, translate: customTranslate, t, te };
}
