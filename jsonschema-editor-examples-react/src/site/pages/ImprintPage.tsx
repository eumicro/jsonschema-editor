import { imprintFor } from "../../../../jsonschema-editor-examples/src/site/i18n/imprint.js";
import { paragraphParts } from "../../../../jsonschema-editor-examples/src/site/utils/linkify.js";
import type { AppLocale } from "../../app-routing.js";

interface ImprintPageProps {
  locale: AppLocale;
}

function LinkedParagraph({ text }: { text: string }) {
  return (
    <p className="legal-page__paragraph">
      {paragraphParts(text).map((part, index) =>
        part.type === "link" ? (
          <a
            key={`${part.value}-${index}`}
            href={part.value}
            className="legal-page__link"
            rel="noopener noreferrer"
            target="_blank"
          >
            {part.value}
          </a>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </p>
  );
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
        {content.translationNote ? (
          <p className="legal-page__note">{content.translationNote}</p>
        ) : null}
      </header>

      {content.sections.map((section) => (
        <section
          key={section.id}
          className="legal-page__section"
          aria-labelledby={`legal-${section.id}`}
        >
          <h2 id={`legal-${section.id}`} className="legal-page__section-title">
            {section.title}
          </h2>

          {section.paragraphs.map((paragraph, index) => (
            <LinkedParagraph key={`${section.id}-p-${index}`} text={paragraph} />
          ))}

          {section.list?.length ? (
            <ul className="legal-page__list">
              {section.list.map((item, index) => (
                <li key={`${section.id}-l-${index}`}>{item}</li>
              ))}
            </ul>
          ) : null}

          {section.subsections?.map((subsection) => (
            <div key={`${section.id}-${subsection.title}`} className="legal-page__subsection">
              <h3 className="legal-page__subsection-title">{subsection.title}</h3>
              {subsection.paragraphs.map((paragraph, index) => (
                <LinkedParagraph
                  key={`${section.id}-${subsection.title}-p-${index}`}
                  text={paragraph}
                />
              ))}
              {subsection.list?.length ? (
                <ul className="legal-page__list">
                  {subsection.list.map((item, index) => (
                    <li key={`${section.id}-${subsection.title}-l-${index}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
