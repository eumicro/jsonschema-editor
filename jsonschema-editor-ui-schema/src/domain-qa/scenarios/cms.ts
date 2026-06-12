import type { DomainScenarioDefinition } from "../types.js";
import { categorization, objectSchema, propertyControls, refDef } from "./helpers.js";

export const cmsScenarios: DomainScenarioDefinition[] = [
  {
    id: "landing-page-blocks",
    domain: "cms",
    label: "Landing Page mit Sektions-Blocks",
    description: "Polymorphe sections[] mit if/then-Diskriminator (Headless-CMS-Muster).",
    sources: [
      "https://elmapicms.com/blog/headless-cms-content-modeling-reusable-page-sections-blocks",
      "https://stackoverflow.com/questions/65331064/how-can-i-create-a-json-schema-for-array-of-blocks-of-different-types",
    ],
    schema: objectSchema(
      "Landing Page",
      {
        title: { type: "string" },
        slug: { type: "string", pattern: "^[a-z0-9-]+$" },
        seo: refDef("SeoMeta"),
        sections: { type: "array", minItems: 1, items: refDef("PageSection") },
      },
      ["title", "slug", "sections"],
      {
        SeoMeta: {
          type: "object",
          properties: {
            metaTitle: { type: "string" },
            metaDescription: { type: "string", maxLength: 160 },
            canonicalUrl: { type: "string", format: "uri" },
          },
        },
        PageSection: {
          oneOf: [
            {
              type: "object",
              required: ["type", "id", "headline"],
              properties: {
                type: { const: "hero" },
                id: { type: "string" },
                headline: { type: "string" },
                subheadline: { type: "string" },
                primaryCtaLabel: { type: "string" },
                primaryCtaHref: { type: "string", format: "uri" },
                variant: { type: "string", enum: ["centered", "split", "minimal"] },
              },
            },
            {
              type: "object",
              required: ["type", "id", "items"],
              properties: {
                type: { const: "features" },
                id: { type: "string" },
                items: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["title", "description"],
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      icon: { type: "string" },
                    },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "id", "items"],
              properties: {
                type: { const: "faq" },
                id: { type: "string" },
                items: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["question", "answer"],
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                    },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["type", "id", "headline", "ctaLabel", "ctaHref"],
              properties: {
                type: { const: "cta" },
                id: { type: "string" },
                headline: { type: "string" },
                body: { type: "string" },
                ctaLabel: { type: "string" },
                ctaHref: { type: "string", format: "uri" },
              },
            },
          ],
        },
        HeroSection: {
          type: "object",
          required: ["headline"],
          properties: {
            headline: { type: "string" },
            subheadline: { type: "string" },
            primaryCtaLabel: { type: "string" },
            primaryCtaHref: { type: "string", format: "uri" },
            variant: { type: "string", enum: ["centered", "split", "minimal"] },
          },
        },
        FeaturesSection: {
          type: "object",
          required: ["items"],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["title", "description"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  icon: { type: "string" },
                },
              },
            },
          },
        },
        FaqSection: {
          type: "object",
          required: ["items"],
          properties: {
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["question", "answer"],
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                },
              },
            },
          },
        },
        CtaSection: {
          type: "object",
          required: ["headline", "ctaLabel", "ctaHref"],
          properties: {
            headline: { type: "string" },
            body: { type: "string" },
            ctaLabel: { type: "string" },
            ctaHref: { type: "string", format: "uri" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["title", "slug", "seo", "sections"]),
    valid: {
      title: "Produkt Launch",
      slug: "produkt-launch",
      seo: { metaTitle: "Launch 2026", metaDescription: "Neues Produkt ab sofort verfügbar" },
      sections: [
        { type: "hero", id: "hero-1", headline: "Willkommen", primaryCtaLabel: "Mehr", primaryCtaHref: "https://example.com" },
        { type: "faq", id: "faq-1", items: [{ question: "Wann?", answer: "Jetzt." }] },
      ],
    },
    invalid: { title: "X", slug: "Invalid Slug!", sections: [{ type: "hero", id: "h1" }] },
  },
  {
    id: "blog-article-seo",
    domain: "cms",
    label: "Blog-Artikel mit SEO",
    description: "Artikel mit Autor-Referenz, Kategorien und strukturierten Metadaten.",
    sources: ["https://www.contentful.com/headless-cms/"],
    schema: objectSchema(
      "Blog-Artikel",
      {
        title: { type: "string" },
        slug: { type: "string" },
        authorId: { type: "string" },
        publishedAt: { type: "string", format: "date-time" },
        categories: { type: "array", items: { type: "string" }, minItems: 1 },
        body: refDef("RichTextBody"),
        seo: refDef("ArticleSeo"),
      },
      ["title", "slug", "authorId", "publishedAt", "body"],
      {
        RichTextBody: {
          type: "object",
          required: ["format", "content"],
          properties: {
            format: { type: "string", enum: ["markdown", "html", "portable-text"] },
            content: { type: "string", minLength: 50 },
            wordCount: { type: "integer", minimum: 1 },
          },
        },
        ArticleSeo: {
          type: "object",
          required: ["metaTitle"],
          properties: {
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            ogImageUrl: { type: "string", format: "uri" },
            noIndex: { type: "boolean" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["title", "slug", "authorId", "publishedAt", "categories", "body", "seo"]),
    valid: {
      title: "JSON Schema in der Praxis",
      slug: "json-schema-praxis",
      authorId: "author-001",
      publishedAt: "2026-06-12T10:00:00Z",
      categories: ["tech", "tutorial"],
      body: { format: "markdown", content: "In diesem Artikel erklären wir die Grundlagen von JSON Schema für Formulare und APIs in der Praxis.", wordCount: 1200 },
      seo: { metaTitle: "JSON Schema Praxis", metaDescription: "Tutorial" },
    },
    invalid: { title: "T", slug: "s", authorId: "a", publishedAt: "x", body: { format: "markdown", content: "kurz" } },
  },
  {
    id: "product-catalog-entry",
    domain: "cms",
    label: "Produktkatalog-Eintrag",
    description: "PIM-Produkt mit Varianten, Preisen und Medien-Referenzen.",
    sources: ["https://hygraph.com/blog/structured-content"],
    schema: objectSchema(
      "Produkt",
      {
        sku: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        brand: refDef("BrandRef"),
        variants: { type: "array", minItems: 1, items: refDef("ProductVariant") },
        media: { type: "array", items: refDef("MediaRef") },
      },
      ["sku", "name", "variants"],
      {
        BrandRef: {
          type: "object",
          required: ["id", "name"],
          properties: { id: { type: "string" }, name: { type: "string" } },
        },
        ProductVariant: {
          type: "object",
          required: ["variantId", "attributes", "price"],
          properties: {
            variantId: { type: "string" },
            attributes: {
              type: "object",
              properties: {
                color: { type: "string" },
                size: { type: "string" },
                material: { type: "string" },
              },
            },
            price: refDef("PriceInfo"),
            stock: { type: "integer", minimum: 0 },
          },
        },
        PriceInfo: {
          type: "object",
          required: ["amount", "currency"],
          properties: {
            amount: { type: "number", minimum: 0 },
            currency: { type: "string", enum: ["EUR", "USD", "GBP"] },
            compareAt: { type: "number", minimum: 0 },
          },
        },
        MediaRef: {
          type: "object",
          required: ["assetId", "role"],
          properties: {
            assetId: { type: "string" },
            role: { type: "string", enum: ["thumbnail", "gallery", "video"] },
          },
        },
      },
    ),
    uiSchema: propertyControls(["sku", "name", "description", "brand", "variants", "media"]),
    valid: {
      sku: "PROD-001",
      name: "Laptop Pro 15",
      description: "Leistungsstarker Laptop",
      brand: { id: "brand-1", name: "TechCo" },
      variants: [{ variantId: "v1", attributes: { color: "silver", size: "15 inch" }, price: { amount: 1499, currency: "EUR" }, stock: 42 }],
    },
    invalid: { sku: "P", name: "X", variants: [{ variantId: "v1", attributes: {}, price: { amount: -1, currency: "XXX" } }] },
  },
  {
    id: "multilingual-content",
    domain: "cms",
    label: "Mehrsprachiger Content",
    description: "Lokalisierte Felder mit Fallback-Locale und Übersetzungsstatus.",
    sources: ["https://hygraph.com/blog/structured-content"],
    schema: objectSchema(
      "Mehrsprachiger Inhalt",
      {
        contentId: { type: "string" },
        defaultLocale: { type: "string", enum: ["de", "en", "fr", "es"] },
        localizations: { type: "array", minItems: 1, items: refDef("LocalizationEntry") },
      },
      ["contentId", "defaultLocale", "localizations"],
      {
        LocalizationEntry: {
          type: "object",
          required: ["locale", "title", "status"],
          properties: {
            locale: { type: "string", enum: ["de", "en", "fr", "es"] },
            title: { type: "string" },
            body: { type: "string" },
            status: { type: "string", enum: ["draft", "review", "published"] },
            translatorId: { type: "string" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["contentId", "defaultLocale", "localizations"]),
    valid: {
      contentId: "CNT-001",
      defaultLocale: "de",
      localizations: [
        { locale: "de", title: "Startseite", body: "Willkommen", status: "published" },
        { locale: "en", title: "Home", body: "Welcome", status: "published" },
      ],
    },
    invalid: { contentId: "C", defaultLocale: "xx", localizations: [{ locale: "de", title: "X", status: "invalid" }] },
  },
  {
    id: "faq-page",
    domain: "cms",
    label: "FAQ-Seite",
    description: "FAQ mit Kategorien und JSON-LD-tauglichen Q&A-Paaren.",
    sources: ["https://elmapicms.com/blog/headless-cms-content-modeling-reusable-page-sections-blocks"],
    schema: objectSchema(
      "FAQ-Seite",
      {
        pageTitle: { type: "string" },
        slug: { type: "string" },
        categories: { type: "array", minItems: 1, items: refDef("FaqCategory") },
      },
      ["pageTitle", "slug", "categories"],
      {
        FaqCategory: {
          type: "object",
          required: ["name", "items"],
          properties: {
            name: { type: "string" },
            items: { type: "array", minItems: 1, items: refDef("FaqItem") },
          },
        },
        FaqItem: {
          type: "object",
          required: ["question", "answer", "order"],
          properties: {
            question: { type: "string" },
            answer: { type: "string", minLength: 10 },
            order: { type: "integer", minimum: 0 },
            featured: { type: "boolean" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["pageTitle", "slug", "categories"]),
    valid: {
      pageTitle: "Häufige Fragen",
      slug: "faq",
      categories: [{ name: "Allgemein", items: [{ question: "Was ist JSON Schema?", answer: "Ein Standard zur Validierung strukturierter JSON-Daten.", order: 0 }] }],
    },
    invalid: { pageTitle: "F", slug: "f", categories: [{ name: "X", items: [{ question: "Q", answer: "kurz", order: -1 }] }] },
  },
  {
    id: "newsletter-campaign",
    domain: "cms",
    label: "Newsletter-Kampagne",
    description: "E-Mail-Kampagne mit Segment, Inhalt und A/B-Varianten.",
    sources: ["https://www.contentful.com/headless-cms/"],
    schema: objectSchema(
      "Newsletter",
      {
        campaignId: { type: "string" },
        name: { type: "string" },
        segment: refDef("AudienceSegment"),
        content: refDef("EmailContent"),
        abTest: refDef("AbTestConfig"),
      },
      ["campaignId", "name", "segment", "content"],
      {
        AudienceSegment: {
          type: "object",
          required: ["name", "filters"],
          properties: {
            name: { type: "string" },
            filters: {
              type: "array",
              items: {
                type: "object",
                required: ["field", "operator", "value"],
                properties: {
                  field: { type: "string" },
                  operator: { type: "string", enum: ["equals", "contains", "greaterThan"] },
                  value: { type: "string" },
                },
              },
            },
          },
        },
        EmailContent: {
          type: "object",
          required: ["subject", "preheader", "bodyHtml"],
          properties: {
            subject: { type: "string" },
            preheader: { type: "string", maxLength: 100 },
            bodyHtml: { type: "string", minLength: 20 },
            ctaUrl: { type: "string", format: "uri" },
          },
        },
        AbTestConfig: {
          oneOf: [
            {
              type: "object",
              required: ["enabled"],
              properties: {
                enabled: { const: false },
              },
            },
            {
              type: "object",
              required: ["enabled", "variantBSubject", "splitRatioPct"],
              properties: {
                enabled: { const: true },
                variantBSubject: { type: "string" },
                splitRatioPct: { type: "number", minimum: 10, maximum: 90 },
              },
            },
          ],
        },
      },
    ),
    uiSchema: propertyControls(["campaignId", "name", "segment", "content", "abTest"]),
    valid: {
      campaignId: "NL-2026-001",
      name: "Sommer-Newsletter",
      segment: { name: "Aktive Abonnenten", filters: [{ field: "status", operator: "equals", value: "active" }] },
      content: { subject: "Neuigkeiten", preheader: "Das ist neu", bodyHtml: "<p>Willkommen zu unserem Newsletter.</p>" },
    },
    invalid: { campaignId: "N", name: "X", segment: { name: "S" }, content: { subject: "S", preheader: "P", bodyHtml: "kurz" } },
  },
  {
    id: "media-asset-metadata",
    domain: "cms",
    label: "Media-Asset-Metadaten",
    description: "Digitales Asset mit Copyright, Varianten und Alt-Texten.",
    sources: ["https://hygraph.com/blog/structured-content"],
    schema: objectSchema(
      "Media-Asset",
      {
        assetId: { type: "string" },
        filename: { type: "string" },
        mimeType: { type: "string", enum: ["image/jpeg", "image/png", "image/webp", "video/mp4"] },
        dimensions: refDef("MediaDimensions"),
        copyright: refDef("CopyrightInfo"),
        altTexts: { type: "array", items: refDef("AltTextEntry") },
      },
      ["assetId", "filename", "mimeType"],
      {
        MediaDimensions: {
          type: "object",
          required: ["width", "height"],
          properties: {
            width: { type: "integer", minimum: 1 },
            height: { type: "integer", minimum: 1 },
          },
        },
        CopyrightInfo: {
          type: "object",
          required: ["holder"],
          properties: {
            holder: { type: "string" },
            license: { type: "string", enum: ["all-rights-reserved", "cc-by", "cc-by-sa", "public-domain"] },
            expiryDate: { type: "string", format: "date" },
          },
        },
        AltTextEntry: {
          type: "object",
          required: ["locale", "text"],
          properties: {
            locale: { type: "string" },
            text: { type: "string", minLength: 3 },
          },
        },
      },
    ),
    uiSchema: propertyControls(["assetId", "filename", "mimeType", "dimensions", "copyright", "altTexts"]),
    valid: {
      assetId: "MEDIA-001",
      filename: "hero.jpg",
      mimeType: "image/jpeg",
      dimensions: { width: 1920, height: 1080 },
      copyright: { holder: "Fotograf GmbH", license: "cc-by" },
      altTexts: [{ locale: "de", text: "Produktbild auf weißem Hintergrund" }],
    },
    invalid: { assetId: "M", filename: "x", mimeType: "application/pdf", dimensions: { width: 0, height: 0 } },
  },
  {
    id: "site-navigation",
    domain: "cms",
    label: "Site-Navigation",
    description: "Hierarchisches Menü mit internen/externen Links und Sichtbarkeit.",
    sources: ["https://elmapicms.com/blog/headless-cms-content-modeling-reusable-page-sections-blocks"],
    schema: objectSchema(
      "Navigation",
      {
        menuId: { type: "string" },
        label: { type: "string" },
        items: { type: "array", minItems: 1, items: refDef("NavItem") },
      },
      ["menuId", "label", "items"],
      {
        NavItem: {
          type: "object",
          required: ["label", "link"],
          properties: {
            label: { type: "string" },
            link: refDef("NavLink"),
            children: { type: "array", items: { $ref: "#/$defs/NavItem" } },
            visible: { type: "boolean" },
          },
        },
        NavLink: {
          oneOf: [refDef("InternalLink"), refDef("ExternalLink")],
        },
        InternalLink: {
          type: "object",
          required: ["linkType", "pageSlug"],
          properties: {
            linkType: { const: "internal" },
            pageSlug: { type: "string" },
          },
        },
        ExternalLink: {
          type: "object",
          required: ["linkType", "url"],
          properties: {
            linkType: { const: "external" },
            url: { type: "string", format: "uri" },
            openInNewTab: { type: "boolean" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["menuId", "label", "items"]),
    valid: {
      menuId: "main-nav",
      label: "Hauptnavigation",
      items: [
        { label: "Start", link: { linkType: "internal", pageSlug: "home" }, visible: true },
        { label: "Blog", link: { linkType: "internal", pageSlug: "blog" }, children: [{ label: "Tech", link: { linkType: "internal", pageSlug: "blog/tech" } }] },
      ],
    },
    invalid: { menuId: "m", label: "X", items: [{ label: "Y", link: { linkType: "internal" } }] },
  },
  {
    id: "author-profile",
    domain: "cms",
    label: "Autorenprofil",
    description: "Content-Autor mit Bio, Social Links und Expertise-Tags.",
    sources: ["https://www.contentful.com/headless-cms/"],
    schema: objectSchema(
      "Autor",
      {
        authorId: { type: "string" },
        displayName: { type: "string" },
        bio: refDef("AuthorBio"),
        socialLinks: { type: "array", items: refDef("SocialLink") },
        expertise: { type: "array", items: { type: "string" }, minItems: 1 },
      },
      ["authorId", "displayName", "bio", "expertise"],
      {
        AuthorBio: {
          type: "object",
          required: ["short", "long"],
          properties: {
            short: { type: "string", maxLength: 160 },
            long: { type: "string", minLength: 50 },
            avatarAssetId: { type: "string" },
          },
        },
        SocialLink: {
          type: "object",
          required: ["platform", "url"],
          properties: {
            platform: { type: "string", enum: ["linkedin", "twitter", "github", "website"] },
            url: { type: "string", format: "uri" },
          },
        },
      },
    ),
    uiSchema: propertyControls(["authorId", "displayName", "bio", "socialLinks", "expertise"]),
    valid: {
      authorId: "author-001",
      displayName: "Dr. Julia Richter",
      bio: { short: "Tech-Autorin", long: "Dr. Julia Richter schreibt seit 10 Jahren über Software-Architektur und Datenmodelle." },
      expertise: ["json-schema", "api-design"],
      socialLinks: [{ platform: "linkedin", url: "https://linkedin.com/in/juliarichter" }],
    },
    invalid: { authorId: "a", displayName: "X", bio: { short: "s", long: "kurz" }, expertise: [] },
  },
  {
    id: "ecommerce-product-page",
    domain: "cms",
    label: "E-Commerce Produktseite",
    description: "Produktseite mit Rich Content, Bewertungen und Cross-Selling.",
    sources: ["https://hygraph.com/blog/structured-content"],
    schema: objectSchema(
      "Produktseite",
      {
        productId: { type: "string" },
        hero: refDef("ProductHero"),
        specifications: { type: "array", items: refDef("SpecRow") },
        reviews: { type: "array", items: refDef("ProductReview") },
        crossSell: { type: "array", items: { type: "string" } },
      },
      ["productId", "hero"],
      {
        ProductHero: {
          type: "object",
          required: ["title", "price", "gallery"],
          properties: {
            title: { type: "string" },
            subtitle: { type: "string" },
            price: refDef("PriceInfo"),
            gallery: { type: "array", minItems: 1, items: { type: "string" } },
          },
        },
        PriceInfo: {
          type: "object",
          required: ["amount", "currency"],
          properties: {
            amount: { type: "number", minimum: 0 },
            currency: { type: "string", enum: ["EUR", "USD"] },
            discountPct: { type: "number", minimum: 0, maximum: 100 },
          },
        },
        SpecRow: {
          type: "object",
          required: ["label", "value"],
          properties: {
            label: { type: "string" },
            value: { type: "string" },
          },
        },
        ProductReview: {
          type: "object",
          required: ["rating", "author", "text"],
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5 },
            author: { type: "string" },
            text: { type: "string", minLength: 10 },
            verifiedPurchase: { type: "boolean" },
          },
        },
      },
    ),
    uiSchema: categorization([
      { label: "Hero", scope: "#/properties/hero" },
      { label: "Spezifikationen", scope: "#/properties/specifications" },
      { label: "Bewertungen", scope: "#/properties/reviews" },
    ]),
    valid: {
      productId: "PAGE-001",
      hero: { title: "Smartwatch X", price: { amount: 299, currency: "EUR" }, gallery: ["img-1", "img-2"] },
      specifications: [{ label: "Display", value: "1.9 Zoll AMOLED" }],
      reviews: [{ rating: 5, author: "Max", text: "Sehr zufrieden mit der Qualität.", verifiedPurchase: true }],
    },
    invalid: { productId: "P", hero: { title: "X", price: { amount: -1, currency: "EUR" }, gallery: [] } },
  },
];
