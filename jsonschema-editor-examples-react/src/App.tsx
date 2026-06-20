import { useCallback, useEffect, useMemo, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { JsonSchemaForm, JsonSchemaFormEditor } from "@jsonschema-editor/react";
import {
  createInMemoryFileFieldProvider,
  FileFieldProvider,
} from "@jsonschema-editor/react-extensions";
import type { AppLocale } from "./types/locale.js";
import {
  appUiFor,
  categoryLabelFor,
  fallbackLocaleFor,
  localeOptions,
} from "./app-i18n.js";
import {
  navigateToPage,
  pageFromHash,
  type AppPage,
} from "./app-routing.js";
import {
  defaultReactExampleId,
  exampleCatalog,
  exampleCategoryOrder,
  examplesByCategory,
  exampleManifests,
  type ExampleCategory,
  type ExampleId,
} from "./examples/catalog.js";
import { loadExampleFromJson } from "./examples/load-example.js";
import { seedDemoFilesForExample } from "../../jsonschema-editor-examples/src/examples/demo-file-seeds.js";
import { GetStartedPage } from "./pages/GetStartedPage.js";
import { ImprintPage } from "./pages/ImprintPage.js";

type WorkspaceMode = "form" | "editor" | "json";
type JsonPane = "schema" | "ui" | "data";

const initial = loadExampleFromJson(exampleCatalog[defaultReactExampleId]);
const fileProvider = createInMemoryFileFieldProvider();

export function App() {
  const [activePage, setActivePage] = useState<AppPage>(() => pageFromHash());
  const [activeExampleId, setActiveExampleId] = useState<ExampleId>(defaultReactExampleId);
  const [locale, setLocale] = useState<AppLocale>("de");
  const [schema, setSchema] = useState<SchemaDocument>(initial.schema);
  const [uiSchema, setUiSchema] = useState<UiSchema>(initial.uiSchema);
  const [formData, setFormData] = useState<Record<string, unknown>>(initial.defaults);
  const [mode, setMode] = useState<WorkspaceMode>("form");
  const [jsonPane, setJsonPane] = useState<JsonPane>("schema");

  const ui = appUiFor(locale);
  const fallbackLocale = fallbackLocaleFor(locale);
  const activeExample = exampleCatalog[activeExampleId];

  const visibleCategories = useMemo(
    () =>
      exampleCategoryOrder.filter(
        (category: ExampleCategory) => examplesByCategory[category].length > 0,
      ),
    [],
  );

  const schemaJson = useMemo(() => JSON.stringify(schema.toJSON(), null, 2), [schema]);
  const uiSchemaJson = useMemo(() => JSON.stringify(uiSchema.toJSON(), null, 2), [uiSchema]);
  const dataJson = useMemo(() => JSON.stringify(formData, null, 2), [formData]);

  const activeJsonContent =
    jsonPane === "schema" ? schemaJson : jsonPane === "ui" ? uiSchemaJson : dataJson;

  const syncPageFromHash = useCallback(() => {
    setActivePage(pageFromHash());
  }, []);

  useEffect(() => {
    syncPageFromHash();
    window.addEventListener("hashchange", syncPageFromHash);
    return () => window.removeEventListener("hashchange", syncPageFromHash);
  }, [syncPageFromHash]);

  useEffect(() => {
    const loaded = loadExampleFromJson(exampleCatalog[activeExampleId]);
    let cancelled = false;

    void (async () => {
      await seedDemoFilesForExample(fileProvider, activeExampleId);
      if (cancelled) return;
      setSchema(loaded.schema);
      setUiSchema(loaded.uiSchema);
      setFormData(loaded.defaults);
    })();

    return () => {
      cancelled = true;
    };
  }, [activeExampleId]);

  function openGetStarted() {
    navigateToPage("get-started");
  }

  function openImprint() {
    navigateToPage("imprint");
  }

  function openExamples() {
    navigateToPage("examples");
  }

  function selectExample(id: ExampleId) {
    openExamples();
    setActiveExampleId(id);
  }

  return (
    <FileFieldProvider provider={fileProvider}>
      <div className="app">
      <header className="app__topbar">
        <div className="app__topbar-start">
          <a
            href="#/"
            className="app__brand"
            aria-label="JSON Schema Editor"
            onClick={(event) => {
              event.preventDefault();
              openExamples();
            }}
          >
            <span className="app__brand-prefix">{ui.brandPrefix}</span>
            <span className="app__brand-suffix">{ui.brandSuffix}</span>
            <span className="app__react-badge">{ui.reactBadge}</span>
          </a>
          <nav className="app__topnav" aria-label={ui.topNavAria}>
            <a
              href="#/get-started"
              className={`app__topnav-link${activePage === "get-started" ? " app__topnav-link--active" : ""}`}
              aria-current={activePage === "get-started" ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                openGetStarted();
              }}
            >
              {ui.navGetStarted}
            </a>
            <a
              href="#/"
              className={`app__topnav-link${activePage === "examples" ? " app__topnav-link--active" : ""}`}
              aria-current={activePage === "examples" ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                openExamples();
              }}
            >
              {ui.navExamples}
            </a>
            <a
              href="#/imprint"
              className={`app__topnav-link${activePage === "imprint" ? " app__topnav-link--active" : ""}`}
              aria-current={activePage === "imprint" ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault();
                openImprint();
              }}
            >
              {ui.navImprint}
            </a>
          </nav>
        </div>
        <div className="app__topbar-actions">
          <label className="app__locale-picker" htmlFor="app-locale-select">
            <span className="app__locale-label">{ui.localeLabel}</span>
            <select
              id="app-locale-select"
              className="app__select"
              value={locale}
              onChange={(event) => setLocale(event.target.value as AppLocale)}
            >
              {localeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {activePage === "examples" ? (
        <section className="app__hero">
          <p className="app__tagline">{ui.tagline}</p>
          <p className="app__subtitle">{ui.subtitle}</p>
        </section>
      ) : null}

      {activePage === "get-started" ? (
        <GetStartedPage locale={locale} onOpenExamples={openExamples} />
      ) : null}

      {activePage === "imprint" ? <ImprintPage locale={locale} /> : null}

      {activePage === "examples" ? (
        <div className="app__workspace">
          <aside className="app__sidebar" aria-label={ui.scenariosHeading}>
            <h2 className="app__sidebar-heading">{ui.scenariosHeading}</h2>
            {visibleCategories.map((category: ExampleCategory) => (
              <nav key={category} className="app__nav-group">
                <h3 className="app__nav-group-title">{categoryLabelFor(locale, category)}</h3>
                <ul className="app__nav-list">
                  {examplesByCategory[category].map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={`app__nav-item${activeExampleId === entry.id ? " app__nav-item--active" : ""}`}
                        aria-current={activeExampleId === entry.id ? "page" : undefined}
                        onClick={() => selectExample(entry.id)}
                      >
                        <span className="app__nav-item-label">{entry.label}</span>
                        <span className="app__nav-item-tagline">{entry.tagline}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </aside>

          <main className="app__main">
            <select
              id="app-example-select"
              className="app__example-select-hidden"
              tabIndex={-1}
              aria-hidden="true"
              value={activeExampleId}
              onChange={(event) => setActiveExampleId(event.target.value as ExampleId)}
            >
              {exampleManifests.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>

            {activeExample ? (
              <header className="app__scenario-header">
                <h1 id="json-schema-editor-beispiel" className="app__scenario-title">
                  {activeExample.label}
                </h1>
                <p className="app__scenario-desc">{activeExample.description}</p>
              </header>
            ) : null}

            <div className="app__react-notice" role="note">
              <strong>{ui.reactNoticeTitle}:</strong> {ui.reactNoticeBody}
            </div>

            <section className="app__panel">
              <div className="app__view-tabs" role="tablist" aria-label={ui.tabsAria}>
                <button
                  type="button"
                  role="tab"
                  className={`app__view-tab${mode === "form" ? " app__view-tab--active" : ""}`}
                  aria-selected={mode === "form"}
                  aria-controls="app-panel-form"
                  onClick={() => setMode("form")}
                >
                  {ui.tabForm}
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`app__view-tab${mode === "editor" ? " app__view-tab--active" : ""}`}
                  aria-selected={mode === "editor"}
                  aria-controls="app-panel-editor"
                  onClick={() => setMode("editor")}
                >
                  {ui.tabEditor}
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`app__view-tab${mode === "json" ? " app__view-tab--active" : ""}`}
                  aria-selected={mode === "json"}
                  aria-controls="app-panel-json"
                  onClick={() => setMode("json")}
                >
                  {ui.tabJson}
                </button>
              </div>

              {mode === "form" ? (
                <div
                  id="app-panel-form"
                  className="app__panel-body app__split"
                  role="tabpanel"
                  aria-label={ui.formPanelAria}
                >
                  <div className="app__split-main">
                    <JsonSchemaForm
                      schema={schema}
                      uiSchema={uiSchema}
                      data={formData}
                      onDataChange={setFormData}
                      locale={locale}
                      fallbackLocale={fallbackLocale}
                      validationMode="blur"
                    />
                  </div>
                  <aside className="app__split-side">
                    <div className="app__code-header">{ui.dataPanelTitle}</div>
                    <pre className="app__form-data-output app__code-block">{dataJson}</pre>
                  </aside>
                </div>
              ) : null}

              {mode === "editor" ? (
                <div
                  id="app-panel-editor"
                  className="app__panel-body"
                  role="tabpanel"
                  aria-label={ui.editorPanelAria}
                >
                  <JsonSchemaFormEditor
                    key={activeExampleId}
                    schema={schema}
                    uiSchema={uiSchema}
                    onSchemaChange={setSchema}
                    onUiSchemaChange={setUiSchema}
                    locale={locale}
                    fallbackLocale={fallbackLocale}
                  />
                </div>
              ) : null}

              {mode === "json" ? (
                <div
                  id="app-panel-json"
                  className="app__panel-body app__json-view"
                  role="tabpanel"
                  aria-label={ui.jsonPanelAria}
                >
                  <div className="app__json-tabs" role="tablist" aria-label={ui.jsonTabsAria}>
                    {(["schema", "ui", "data"] as const).map((pane) => (
                      <button
                        key={pane}
                        type="button"
                        role="tab"
                        className={`app__json-tab${jsonPane === pane ? " app__json-tab--active" : ""}`}
                        aria-selected={jsonPane === pane}
                        onClick={() => setJsonPane(pane)}
                      >
                        {pane === "schema"
                          ? ui.jsonSchema
                          : pane === "ui"
                            ? ui.jsonUi
                            : ui.jsonData}
                      </button>
                    ))}
                  </div>
                  <pre className="app__json-output app__code-block app__code-block--full">
                    {activeJsonContent}
                  </pre>
                </div>
              ) : null}
            </section>
          </main>
        </div>
      ) : null}

      <footer className="app__footer">
        <p className="app__footer-copy">{ui.footerCopyright}</p>
        <a
          href="#/imprint"
          className="app__footer-link"
          aria-current={activePage === "imprint" ? "page" : undefined}
          onClick={(event) => {
            event.preventDefault();
            openImprint();
          }}
        >
          {ui.footerImprint}
        </a>
      </footer>
      </div>
    </FileFieldProvider>
  );
}
