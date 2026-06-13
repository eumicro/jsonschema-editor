import type { TranslateFn } from "./types.js";

interface VueI18nLike {
  t(key: string, params?: Record<string, unknown>): string;
  te?(key: string): boolean;
}

/**
 * Adapter für Host-Apps mit vue-i18n.
 * Messages können unter dem Präfix `jse.` liegen oder identische Keys verwenden.
 */
export function createVueI18nAdapter(i18n: VueI18nLike, keyPrefix = "jse."): TranslateFn {
  return (key, params) => {
    const prefixed = `${keyPrefix}${key}`;
    if (i18n.te?.(prefixed)) return i18n.t(prefixed, params);
    if (i18n.te?.(key)) return i18n.t(key, params);
    return i18n.t(prefixed, params);
  };
}
