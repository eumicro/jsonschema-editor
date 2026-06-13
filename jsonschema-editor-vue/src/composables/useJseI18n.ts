import { computed, inject, provide, type InjectionKey } from "vue";
import {
  createTranslator,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  mergeMessages,
  builtInMessages,
  type TranslatorContext,
} from "../i18n/createTranslator.js";
import type { JseI18nOptions, JseLocale, JseTranslateParams } from "../i18n/types.js";

export const JSE_I18N_KEY: InjectionKey<TranslatorContext> = Symbol("jseI18n");

const globalTranslator = createTranslator();

function interpolate(template: string, params?: JseTranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}

export function setupJseI18n(optionsSource: () => JseI18nOptions = () => ({})): TranslatorContext {
  const options = computed(() => {
    const o = optionsSource();
    return {
      locale: o.locale ?? DEFAULT_LOCALE,
      fallbackLocale: o.fallbackLocale ?? FALLBACK_LOCALE,
      messages: mergeMessages(builtInMessages, o.messages),
      translate: o.translate,
    };
  });

  function lookup(key: string, activeLocale: JseLocale): string | undefined {
    const { messages, fallbackLocale } = options.value;
    return messages[activeLocale]?.[key] ?? messages[fallbackLocale]?.[key];
  }

  function te(key: string): boolean {
    return lookup(key, options.value.locale) !== undefined;
  }

  function t(key: string, params?: JseTranslateParams): string {
    const { translate: customTranslate } = options.value;
    if (customTranslate) {
      const custom = customTranslate(key, params);
      if (custom !== key || te(key)) return custom;
    }
    const template = lookup(key, options.value.locale);
    if (template !== undefined) return interpolate(template, params);
    return key;
  }

  const context: TranslatorContext = {
    get locale() {
      return options.value.locale;
    },
    get fallbackLocale() {
      return options.value.fallbackLocale;
    },
    get messages() {
      return options.value.messages;
    },
    get translate() {
      return options.value.translate;
    },
    t,
    te,
  };

  provide(JSE_I18N_KEY, context);
  return context;
}

export function useJseI18n(): TranslatorContext {
  return inject(JSE_I18N_KEY, globalTranslator);
}

export function resolveJseI18nOptions(props: {
  locale?: JseLocale;
  fallbackLocale?: JseLocale;
  messages?: JseI18nOptions["messages"];
  translate?: JseI18nOptions["translate"];
}): JseI18nOptions {
  return {
    locale: props.locale ?? DEFAULT_LOCALE,
    fallbackLocale: props.fallbackLocale,
    messages: props.messages,
    translate: props.translate,
  };
}
