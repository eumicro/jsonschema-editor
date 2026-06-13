export { deMessages } from "./messages/de.js";
export { enMessages } from "./messages/en.js";
export type { JseMessageKey } from "./messages/de.js";
export {
  builtInMessages,
  createTranslator,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  mergeMessages,
  type TranslatorContext,
} from "./createTranslator.js";
export { createVueI18nAdapter } from "./createVueI18nAdapter.js";
export type { JseI18nOptions, JseLocale, JseTranslateParams, TranslateFn } from "./types.js";
