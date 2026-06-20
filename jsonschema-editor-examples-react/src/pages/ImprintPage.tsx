import type { AppLocale } from "../types/locale.js";
import { imprintFor } from "../i18n/imprint-i18n.js";

interface ImprintPageProps {
  locale: AppLocale;
}

export function ImprintPage({ locale }: ImprintPageProps) {
  const content = imprintFor(locale);

  return (
    <article className="legal-page">
      <header className="legal-page__header">
        <h1 className="legal-page__title">{content.pageTitle}</h1>
        <p className="legal-page__meta">
          {locale === "de" ? "Stand:" : "Last updated:"} {content.lastUpdated}
        </p>
      </header>
      <section className="legal-page__section">
        <p>{content.intro}</p>
        <p>
          <a href={content.repositoryUrl} target="_blank" rel="noopener noreferrer">
            {content.repositoryLabel}
          </a>
          {" · "}
          <a href={content.vueDemoUrl} target="_blank" rel="noopener noreferrer">
            {content.vueDemoLabel}
          </a>
        </p>
      </section>
    </article>
  );
}
