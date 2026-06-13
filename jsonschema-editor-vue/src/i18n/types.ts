export type JseLocale = "de" | "en" | (string & {});

export type JseTranslateParams = Record<string, string | number>;

export type TranslateFn = (key: string, params?: JseTranslateParams) => string;

export interface JseI18nOptions {
  locale?: JseLocale;
  fallbackLocale?: JseLocale;
  messages?: Partial<Record<JseLocale, Record<string, string>>>;
  translate?: TranslateFn;
}

export type { JseMessageKey } from "./messages/de.js";
