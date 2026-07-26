import { getStartedFor } from "../../../../jsonschema-editor-examples/src/site/i18n/get-started.js";
import type { AppLocale, AppStack } from "../../app-routing.js";

interface GetStartedPageProps {
  locale: AppLocale;
  stack?: AppStack;
  onOpenExamples: () => void;
  onOpenExample: (exampleId: string) => void;
}

export function GetStartedPage({
  locale,
  stack = "react",
  onOpenExamples,
  onOpenExample,
}: GetStartedPageProps) {
  const content = getStartedFor(locale, stack);

  return (
    <article className="get-started">
      <header className="get-started__header">
        <h1 className="get-started__title">{content.title}</h1>
        <p className="get-started__lead">{content.lead}</p>
      </header>

      <section className="get-started__section" aria-labelledby="get-started-concepts">
        <h2 id="get-started-concepts" className="get-started__section-title">
          {content.conceptsHeading}
        </h2>
        <div className="get-started__cards">
          {content.concepts.map((concept) => (
            <div key={concept.title} className="get-started__card">
              <h3 className="get-started__card-title">{concept.title}</h3>
              <p className="get-started__card-body">{concept.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="get-started__section" aria-labelledby="get-started-features">
        <h2 id="get-started-features" className="get-started__section-title">
          {content.featuresHeading}
        </h2>
        <div className="get-started__cards get-started__cards--features">
          {content.features.map((feature) => (
            <div key={feature.title} className="get-started__card">
              <h3 className="get-started__card-title">{feature.title}</h3>
              <p className="get-started__card-body">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="get-started__section" aria-labelledby="get-started-steps">
        <h2 id="get-started-steps" className="get-started__section-title">
          {content.stepsHeading}
        </h2>
        <ol className="get-started__steps">
          {content.steps.map((step, index) => (
            <li key={step.title} className="get-started__step">
              <div className="get-started__step-marker" aria-hidden="true">
                {index + 1}
              </div>
              <div className="get-started__step-body">
                <h3 className="get-started__step-title">{step.title}</h3>
                <p className="get-started__step-text">{step.body}</p>
                {step.code ? (
                  <pre className="get-started__code">
                    <code>{step.code}</code>
                  </pre>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="get-started__section" aria-labelledby="get-started-packages">
        <h2 id="get-started-packages" className="get-started__section-title">
          {content.packagesHeading}
        </h2>
        <div className="get-started__packages">
          {content.packages.map((pkg) => (
            <div key={pkg.name} className="get-started__package">
              <code className="get-started__package-name">{pkg.name}</code>
              <span className="get-started__package-role">{pkg.role}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="get-started__section" aria-labelledby="get-started-featured">
        <h2 id="get-started-featured" className="get-started__section-title">
          {content.featuredHeading}
        </h2>
        <ul className="get-started__featured">
          {content.featured.map((item) => (
            <li key={item.exampleId}>
              <a
                className="get-started__featured-link"
                href={`/${locale}/examples/vue/${item.exampleId}`}
                onClick={(event) => {
                  event.preventDefault();
                  onOpenExample(item.exampleId);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="get-started__cta" aria-labelledby="get-started-try">
        <h2 id="get-started-try" className="get-started__cta-title">
          {content.tryHeading}
        </h2>
        <p className="get-started__cta-body">{content.tryBody}</p>
        <button type="button" className="get-started__cta-button" onClick={onOpenExamples}>
          {content.tryCta}
        </button>
      </section>
    </article>
  );
}
