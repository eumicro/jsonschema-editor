export type AppPage = "examples" | "get-started" | "imprint";
export type AppLocale =
  | "de"
  | "en"
  | "fr"
  | "it"
  | "pl"
  | "uk"
  | "ru"
  | "zh"
  | "ja";
export type AppStack = "vue" | "react";

export interface AppLocation {
  locale: AppLocale;
  page: AppPage;
  /** Stack segment for `examples` and `get-started` (imprint falls back to owned stack). */
  stack: AppStack;
  /** Present when `page === "examples"`; otherwise the default example id. */
  exampleId: string;
}

export const DEFAULT_LOCALE: AppLocale = "en";
export const DEFAULT_VUE_STACK: AppStack = "vue";
export const DEFAULT_REACT_STACK: AppStack = "react";

export const APP_LOCALES: readonly AppLocale[] = [
  "de",
  "en",
  "fr",
  "it",
  "pl",
  "uk",
  "ru",
  "zh",
  "ja",
];
const LOCALES = new Set<string>(APP_LOCALES);
const STACKS = new Set<string>(["vue", "react"]);

/** Public site origin used for absolute SEO URLs. */
export const SITE_ORIGIN = "https://jsonschema-editor.cloudapplication.net";

export function isAppLocale(value: string): value is AppLocale {
  return LOCALES.has(value);
}

export function isAppStack(value: string): value is AppStack {
  return STACKS.has(value);
}

export function parseAppLocation(
  pathname: string,
  options: {
    defaultExampleId: string;
    /** Stack this app instance owns (dev) or accepts (production bootstrap). */
    ownedStack: AppStack;
    knownExampleIds?: ReadonlySet<string>;
  },
): AppLocation {
  const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  const locale = isAppLocale(segments[0] ?? "") ? (segments[0] as AppLocale) : DEFAULT_LOCALE;

  if (segments[1] === "get-started") {
    return {
      locale,
      page: "get-started",
      stack: isAppStack(segments[2] ?? "") ? (segments[2] as AppStack) : options.ownedStack,
      exampleId: options.defaultExampleId,
    };
  }
  if (segments[1] === "imprint") {
    return {
      locale,
      page: "imprint",
      stack: options.ownedStack,
      exampleId: options.defaultExampleId,
    };
  }

  const stack =
    segments[1] === "examples" && isAppStack(segments[2] ?? "")
      ? (segments[2] as AppStack)
      : options.ownedStack;
  const rawExampleId = segments[1] === "examples" ? segments[3] : undefined;
  const exampleId =
    rawExampleId &&
    (!options.knownExampleIds || options.knownExampleIds.has(rawExampleId))
      ? rawExampleId
      : options.defaultExampleId;

  return {
    locale,
    page: "examples",
    stack,
    exampleId,
  };
}

export function pathFor(location: {
  locale: AppLocale;
  page: AppPage;
  stack?: AppStack;
  exampleId?: string;
  defaultExampleId: string;
  ownedStack: AppStack;
}): string {
  const locale = location.locale;
  const stack = location.stack ?? location.ownedStack;
  if (location.page === "get-started") return `/${locale}/get-started/${stack}`;
  if (location.page === "imprint") return `/${locale}/imprint`;
  const exampleId = location.exampleId ?? location.defaultExampleId;
  return `/${locale}/examples/${stack}/${exampleId}`;
}

export function navigateTo(path: string, replace = false): void {
  const next = path.startsWith("/") ? path : `/${path}`;
  if (window.location.pathname === next) return;
  if (replace) {
    window.history.replaceState(null, "", next);
  } else {
    window.history.pushState(null, "", next);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Same-origin path for an example on either stack (unified site). */
export function hrefForStackExample(
  _ownedStack: AppStack,
  target: { locale: AppLocale; stack: AppStack; exampleId: string },
): string {
  return `/${target.locale}/examples/${target.stack}/${target.exampleId}`;
}

/** Stack-switch target: keep get-started on get-started; otherwise open examples. */
export function hrefForStackSwitch(target: {
  locale: AppLocale;
  page: AppPage;
  stack: AppStack;
  exampleId: string;
}): string {
  if (target.page === "get-started") {
    return `/${target.locale}/get-started/${target.stack}`;
  }
  return `/${target.locale}/examples/${target.stack}/${target.exampleId}`;
}
