import { createContext, useContext, type ReactNode } from "react";
import {
  createTranslator,
  type TranslatorContext,
} from "../i18n/createTranslator.js";
import type { JseI18nOptions } from "../i18n/types.js";

const JseI18nContext = createContext<TranslatorContext>(createTranslator());

export function JseI18nProvider({
  options,
  children,
}: {
  options: JseI18nOptions;
  children: ReactNode;
}) {
  const value = createTranslator(options);
  return <JseI18nContext.Provider value={value}>{children}</JseI18nContext.Provider>;
}

export function useJseI18n(): TranslatorContext {
  return useContext(JseI18nContext);
}

export function resolveJseI18nOptions(props: {
  locale?: JseI18nOptions["locale"];
  fallbackLocale?: JseI18nOptions["fallbackLocale"];
  messages?: JseI18nOptions["messages"];
  translate?: JseI18nOptions["translate"];
}): JseI18nOptions {
  return {
    locale: props.locale,
    fallbackLocale: props.fallbackLocale,
    messages: props.messages,
    translate: props.translate,
  };
}
