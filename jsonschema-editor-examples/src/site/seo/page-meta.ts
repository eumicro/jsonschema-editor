import {
  APP_LOCALES,
  SITE_ORIGIN,
  pathFor,
  type AppLocale,
  type AppPage,
  type AppStack,
} from "../../app-routing";

export type PageMetaInput = {
  locale: AppLocale;
  page: AppPage;
  /** Current UI stack (may be react; canonical always vue). */
  stack: AppStack;
  exampleId: string;
  defaultExampleId: string;
  /** Localized scenario label (examples page). */
  exampleLabel?: string;
  /** Prefer tagline; fall back to description. */
  exampleTagline?: string;
  exampleDescription?: string;
  getStartedTitle?: string;
  getStartedLead?: string;
  imprintTitle?: string;
  /** App hero subtitle as generic fallback description. */
  fallbackDescription: string;
};

export type HreflangAlternate = {
  hreflang: string;
  href: string;
};

export type PageMeta = {
  title: string;
  description: string;
  lang: AppLocale;
  canonicalPath: string;
  canonicalUrl: string;
  alternates: HreflangAlternate[];
  og: {
    title: string;
    description: string;
    url: string;
    locale: string;
    image: string;
    type: "website";
    siteName: string;
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    image: string;
  };
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const OG_IMAGE_PATH = "/og-default.png";
const SITE_NAME = "JSON Schema Editor";

const OG_LOCALE: Record<AppLocale, string> = {
  de: "de_DE",
  en: "en_US",
  fr: "fr_FR",
  it: "it_IT",
  pl: "pl_PL",
  uk: "uk_UA",
  ru: "ru_RU",
  zh: "zh_CN",
  ja: "ja_JP",
};

function stackLabel(stack: AppStack): string {
  return stack === "react" ? "React" : "Vue";
}

function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function vuePathFor(input: PageMetaInput, locale: AppLocale): string {
  return pathFor({
    locale,
    page: input.page,
    stack: "vue",
    exampleId: input.exampleId,
    defaultExampleId: input.defaultExampleId,
    ownedStack: "vue",
  });
}

export function buildPageMeta(input: PageMetaInput): PageMeta {
  const stackName = stackLabel(input.stack);
  let title: string;
  let description: string;

  if (input.page === "get-started") {
    const heading = input.getStartedTitle?.trim() || "Get started";
    title = `${heading} | ${SITE_NAME} (${stackName})`;
    description =
      input.getStartedLead?.trim() ||
      input.fallbackDescription.trim() ||
      `${SITE_NAME} — low-code JSON Schema forms.`;
  } else if (input.page === "imprint") {
    const heading = input.imprintTitle?.trim() || "Legal notice";
    title = `${heading} | ${SITE_NAME}`;
    description = input.fallbackDescription.trim() || `${SITE_NAME} legal notice.`;
  } else {
    const label = input.exampleLabel?.trim() || input.exampleId;
    title = `${label} | ${SITE_NAME} (${stackName})`;
    description =
      input.exampleTagline?.trim() ||
      input.exampleDescription?.trim() ||
      input.fallbackDescription.trim() ||
      `${label} — ${SITE_NAME} example.`;
  }

  if (description.length > 160) {
    description = `${description.slice(0, 157).trimEnd()}…`;
  }

  const canonicalPath = vuePathFor(input, input.locale);
  const canonicalUrl = absoluteUrl(canonicalPath);
  const alternates: HreflangAlternate[] = [
    ...APP_LOCALES.map((locale) => ({
      hreflang: locale,
      href: absoluteUrl(vuePathFor(input, locale)),
    })),
    {
      hreflang: "x-default",
      href: absoluteUrl(vuePathFor(input, "en")),
    },
  ];

  const ogImage = absoluteUrl(OG_IMAGE_PATH);
  const jsonLd =
    input.page === "get-started"
      ? [
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_ORIGIN + "/",
            inLanguage: input.locale,
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: SITE_NAME,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            url: canonicalUrl,
            description,
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
          },
        ]
      : undefined;

  return {
    title,
    description,
    lang: input.locale,
    canonicalPath,
    canonicalUrl,
    alternates,
    og: {
      title,
      description,
      url: canonicalUrl,
      locale: OG_LOCALE[input.locale],
      image: ogImage,
      type: "website",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image: ogImage,
    },
    jsonLd,
  };
}
