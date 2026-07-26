import { categoryLabelFor } from "../../../../../jsonschema-editor-examples/src/site/i18n/app-ui.js";
import {
  exampleCopyFor,
  examplesByCategory,
  type ExampleCategory,
  type ExampleId,
} from "../../../examples/catalog.js";
import type { AppLocale } from "../../../app-routing.js";

interface ExampleCatalogProps {
  locale: AppLocale;
  scenariosHeading: string;
  visibleCategories: ExampleCategory[];
  activeExampleId: ExampleId;
  exampleHref: (id: ExampleId) => string;
  onSelectExample: (id: ExampleId) => void;
}

export function ExampleCatalog({
  locale,
  scenariosHeading,
  visibleCategories,
  activeExampleId,
  exampleHref,
  onSelectExample,
}: ExampleCatalogProps) {
  return (
    <aside className="app__sidebar" aria-label={scenariosHeading}>
      <h2 className="app__sidebar-heading">{scenariosHeading}</h2>
      {visibleCategories.map((category) => (
        <nav key={category} className="app__nav-group">
          <h3 className="app__nav-group-title">{categoryLabelFor(locale, category)}</h3>
          <ul className="app__nav-list">
            {examplesByCategory[category].map((entry) => (
              <li key={entry.id}>
                <a
                  href={exampleHref(entry.id)}
                  className={`app__nav-item${activeExampleId === entry.id ? " app__nav-item--active" : ""}`}
                  aria-current={activeExampleId === entry.id ? "page" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelectExample(entry.id);
                  }}
                >
                  <span className="app__nav-item-label">
                    {exampleCopyFor(entry, locale).label}
                  </span>
                  <span className="app__nav-item-tagline">
                    {exampleCopyFor(entry, locale).tagline}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </aside>
  );
}
