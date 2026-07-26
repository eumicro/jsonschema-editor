/**
 * JSON Forms–compatible UI Schema label resolution.
 * @see https://jsonforms.io/docs/i18n
 *
 * Keys: `{i18n}.label` (Control/Group/Category/Step), `{i18n}.text` (Label),
 * or `{i18n}.description` (Control field description).
 */

import { scopeToPath } from "./scope.js";

export type UiI18nSuffix = "label" | "text" | "description";

/** UI editor path segment (child index or `options.detail`). */
export type UiI18nPathSegment = number | "detail";

export function uiI18nMessageKey(i18nPrefix: string, suffix: UiI18nSuffix): string {
  return `${i18nPrefix}.${suffix}`;
}

/**
 * Slugify a schema root title for use as the leading i18n prefix segment.
 * Empty / unusable titles fall back to `schema`.
 */
export function slugifySchemaTitle(title: string | undefined): string {
  const raw = (title ?? "").trim();
  if (!raw) return "schema";
  const slug = raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "schema";
}

/**
 * Derive a unique JSON Forms `i18n` prefix:
 * `{rootSlug}.{dataPath}` for Controls with scope, else `{rootSlug}.ui.{uiPath}`.
 */
export function deriveUiI18nPrefix(
  rootSlug: string,
  element: { elementKind: string; scope?: string },
  uiPath: readonly UiI18nPathSegment[],
): string {
  const slug = rootSlug.trim() || "schema";
  if (element.elementKind === "Control") {
    const scope = element.scope?.trim();
    if (scope) {
      const segments = scopeToPath(scope);
      if (segments.length > 0) {
        return `${slug}.${segments.join(".")}`;
      }
    }
  }
  const pathKey = uiPath.length > 0 ? uiPath.map(String).join(".") : "root";
  return `${slug}.ui.${pathKey}`;
}

/**
 * Resolve a UI label/text using an external message lookup (e.g. messages[locale][key]).
 * Returns `undefined` when neither a translation nor a default message is available.
 */
export function resolveUiI18nString(
  options: {
    i18n?: string;
    defaultMessage?: string;
    suffix: UiI18nSuffix;
  },
  lookup: (key: string) => string | undefined,
): string | undefined {
  const prefix = options.i18n?.trim();
  if (prefix) {
    const translated = lookup(uiI18nMessageKey(prefix, options.suffix));
    if (translated !== undefined && translated !== "") return translated;
  }

  const fallback = options.defaultMessage;
  if (fallback !== undefined && fallback !== "") {
    const asKey = lookup(fallback);
    if (asKey !== undefined && asKey !== "") return asKey;
    return fallback;
  }

  return undefined;
}
