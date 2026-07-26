import { uiI18nMessageKey, type UiI18nSuffix } from "@jsonschema-editor/ui-schema";
import type { JseLocale } from "../i18n/types.js";

export type UiLabelMessages = Partial<Record<JseLocale, Record<string, string>>>;

export function readUiLabelMessage(
  messages: UiLabelMessages | undefined,
  locale: JseLocale,
  key: string,
): string {
  return messages?.[locale]?.[key] ?? "";
}

/** Immutable merge: set or clear one message key for one locale. */
export function writeUiLabelMessage(
  messages: UiLabelMessages | undefined,
  locale: JseLocale,
  key: string,
  value: string,
): UiLabelMessages {
  const next: UiLabelMessages = { ...messages };
  const localeMap = { ...(next[locale] ?? {}) };
  const trimmed = value.trim();
  if (!trimmed) {
    delete localeMap[key];
  } else {
    localeMap[key] = trimmed;
  }
  if (Object.keys(localeMap).length === 0) {
    delete next[locale];
  } else {
    next[locale] = localeMap;
  }
  return next;
}

/** Move `.label` / `.text` keys from one i18n prefix to another across all locales. */
export function relocateUiLabelMessages(
  messages: UiLabelMessages | undefined,
  oldPrefix: string,
  newPrefix: string,
  suffixes: readonly UiI18nSuffix[] = ["label", "text", "description"],
): UiLabelMessages {
  if (!messages || !oldPrefix || !newPrefix || oldPrefix === newPrefix) {
    return messages ?? {};
  }
  let next: UiLabelMessages = messages;
  for (const locale of Object.keys(messages) as JseLocale[]) {
    for (const suffix of suffixes) {
      const oldKey = uiI18nMessageKey(oldPrefix, suffix);
      const value = messages[locale]?.[oldKey];
      if (value === undefined) continue;
      const newKey = uiI18nMessageKey(newPrefix, suffix);
      next = writeUiLabelMessage(next, locale, newKey, value);
      next = writeUiLabelMessage(next, locale, oldKey, "");
    }
  }
  return next;
}
