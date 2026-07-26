import type { PageMeta } from "./page-meta";

const META_ATTR = "data-jse-meta";
const JSONLD_ATTR = "data-jse-jsonld";

function upsertNamedMeta(name: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"][${META_ATTR}]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    el.setAttribute(META_ATTR, "1");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertPropertyMeta(property: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"][${META_ATTR}]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    el.setAttribute(META_ATTR, "1");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>): void {
  const hreflang = extra?.hreflang;
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"][${META_ATTR}]`
    : `link[rel="${rel}"][${META_ATTR}]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute(META_ATTR, "1");
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        el.setAttribute(key, value);
      }
    }
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function clearManagedAlternates(): void {
  document.head
    .querySelectorAll(`link[rel="alternate"][${META_ATTR}]`)
    .forEach((node) => node.remove());
}

function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | undefined): void {
  document.head.querySelectorAll(`script[${JSONLD_ATTR}]`).forEach((node) => node.remove());
  if (!data) return;
  const items = Array.isArray(data) ? data : [data];
  for (const item of items) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(JSONLD_ATTR, "1");
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  }
}

/** Idempotently sync document head tags from page meta. */
export function applyDocumentMeta(meta: PageMeta): void {
  document.title = meta.title;
  document.documentElement.lang = meta.lang;

  upsertNamedMeta("description", meta.description);
  upsertLink("canonical", meta.canonicalUrl);

  clearManagedAlternates();
  for (const alt of meta.alternates) {
    upsertLink("alternate", alt.href, { hreflang: alt.hreflang });
  }

  upsertPropertyMeta("og:title", meta.og.title);
  upsertPropertyMeta("og:description", meta.og.description);
  upsertPropertyMeta("og:url", meta.og.url);
  upsertPropertyMeta("og:type", meta.og.type);
  upsertPropertyMeta("og:locale", meta.og.locale);
  upsertPropertyMeta("og:image", meta.og.image);
  upsertPropertyMeta("og:site_name", meta.og.siteName);

  upsertNamedMeta("twitter:card", meta.twitter.card);
  upsertNamedMeta("twitter:title", meta.twitter.title);
  upsertNamedMeta("twitter:description", meta.twitter.description);
  upsertNamedMeta("twitter:image", meta.twitter.image);

  upsertJsonLd(meta.jsonLd);
}
