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
  /** Present when `page === "examples"`. */
  stack: AppStack;
  /** Present when `page === "examples"`. */
  exampleId: string;
}

export const DEFAULT_LOCALE: AppLocale = "en";
export const DEFAULT_VUE_STACK: AppStack = "vue";
export const DEFAULT_REACT_STACK: AppStack = "react";

const LOCALES = new Set<string>(["de", "en", "fr", "it", "pl", "uk", "ru", "zh", "ja"]);
const STACKS = new Set<string>(["vue", "react"]);

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
      stack: options.ownedStack,
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
  if (location.page === "get-started") return `/${locale}/get-started`;
  if (location.page === "imprint") return `/${locale}/imprint`;
  const stack = location.stack ?? location.ownedStack;
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
