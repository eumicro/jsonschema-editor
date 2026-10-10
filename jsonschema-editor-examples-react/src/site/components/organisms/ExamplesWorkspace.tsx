import { useMemo, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { JsonSchemaForm, JsonSchemaFormEditor, JseCheckbox, type JseLocale } from "@jsonschema-editor/react";
import { exampleEmbedCode } from "../../../../../jsonschema-editor-examples/src/site/example-embed-code.js";
import {
  exampleCopyFor,
  exampleManifests,
  type ExampleCategory,
  type ExampleId,
  type ExampleManifest,
} from "../../../examples/catalog.js";
import type { AppLocale } from "../../../app-routing.js";
import { SiteCodeEditor } from "../atoms/SiteCodeEditor.js";
import { ExampleCatalog } from "./ExampleCatalog.js";

export type WorkspaceMode = "form" | "editor" | "json" | "code";
type JsonPane = "schema" | "ui" | "data";

interface ExamplesWorkspaceProps {
  locale: AppLocale;
  fallbackLocale: AppLocale;
  labelLocales: readonly JseLocale[];
  ui: {
    scenariosHeading: string;
    tabsAria: string;
    tabForm: string;
    tabEditor: string;
    tabJson: string;
    tabCode: string;
    formPanelAria: string;
    dataPanelTitle: string;
    editorPanelAria: string;
    editorReadonly: string;
    jsonPanelAria: string;
    codePanelAria: string;
    jsonTabsAria: string;
    jsonSchema: string;
    jsonUi: string;
    jsonData: string;
  };
  visibleCategories: ExampleCategory[];
  activeExampleId: ExampleId;
  activeExample: ExampleManifest;
  activeExampleCopy: { label: string; description: string };
  schema: SchemaDocument;
  uiSchema: UiSchema;
  formData: Record<string, unknown>;
  uiLabelMessages: Partial<Record<JseLocale, Record<string, string>>>;
  mode: WorkspaceMode;
  jsonPane: JsonPane;
  dataJson: string;
  activeJsonContent: string;
  exampleHref: (id: ExampleId) => string;
  onSelectExample: (id: ExampleId) => void;
  onActiveExampleIdChange: (id: ExampleId) => void;
  onFormDataChange: (data: Record<string, unknown>) => void;
  onSchemaChange: (schema: SchemaDocument) => void;
  onUiSchemaChange: (uiSchema: UiSchema) => void;
  onMessagesChange: (messages: Partial<Record<JseLocale, Record<string, string>>>) => void;
  onModeChange: (mode: WorkspaceMode) => void;
  onJsonPaneChange: (pane: JsonPane) => void;
}

export function ExamplesWorkspace({
  locale,
  fallbackLocale,
  labelLocales,
  ui,
  visibleCategories,
  activeExampleId,
  activeExample,
  activeExampleCopy,
  schema,
  uiSchema,
  formData,
  uiLabelMessages,
  mode,
  jsonPane,
  dataJson,
  activeJsonContent,
  exampleHref,
  onSelectExample,
  onActiveExampleIdChange,
  onFormDataChange,
  onSchemaChange,
  onUiSchemaChange,
  onMessagesChange,
  onModeChange,
  onJsonPaneChange,
}: ExamplesWorkspaceProps) {
  const embedCode = useMemo(
    () =>
      exampleEmbedCode({
        stack: "react",
        exampleId: activeExampleId,
        locale,
      }),
    [activeExampleId, locale],
  );

  const [editorReadonly, setEditorReadonly] = useState(false);

  return (
    <div className="app__workspace">
      <ExampleCatalog
        locale={locale}
        scenariosHeading={ui.scenariosHeading}
        visibleCategories={visibleCategories}
        activeExampleId={activeExampleId}
        exampleHref={exampleHref}
        onSelectExample={onSelectExample}
      />

      <main className="app__main">
        <select
          id="app-example-select"
          className="app__example-select-hidden"
          tabIndex={-1}
          aria-hidden="true"
          value={activeExampleId}
          onChange={(event) => onActiveExampleIdChange(event.target.value as ExampleId)}
        >
          {exampleManifests.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {exampleCopyFor(entry, locale).label}
            </option>
          ))}
        </select>

        {activeExample ? (
          <header className="app__scenario-header">
            <h1 id="json-schema-editor-beispiel" className="app__scenario-title">
              {activeExampleCopy.label}
            </h1>
            <p className="app__scenario-desc">{activeExampleCopy.description}</p>
          </header>
        ) : null}

        <section className="app__panel">
          <div className="app__view-tabs" role="tablist" aria-label={ui.tabsAria}>
            <button
              type="button"
              role="tab"
              className={`app__view-tab${mode === "form" ? " app__view-tab--active" : ""}`}
              aria-selected={mode === "form"}
              aria-controls="app-panel-form"
              onClick={() => onModeChange("form")}
            >
              {ui.tabForm}
            </button>
            <button
              type="button"
              role="tab"
              className={`app__view-tab${mode === "editor" ? " app__view-tab--active" : ""}`}
              aria-selected={mode === "editor"}
              aria-controls="app-panel-editor"
              onClick={() => onModeChange("editor")}
            >
              {ui.tabEditor}
            </button>
            <button
              type="button"
              role="tab"
              className={`app__view-tab${mode === "json" ? " app__view-tab--active" : ""}`}
              aria-selected={mode === "json"}
              aria-controls="app-panel-json"
              onClick={() => onModeChange("json")}
            >
              {ui.tabJson}
            </button>
            <button
              type="button"
              role="tab"
              className={`app__view-tab${mode === "code" ? " app__view-tab--active" : ""}`}
              aria-selected={mode === "code"}
              aria-controls="app-panel-code"
              onClick={() => onModeChange("code")}
            >
              {ui.tabCode}
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
                  onDataChange={onFormDataChange}
                  locale={locale}
                  fallbackLocale={fallbackLocale}
                  messages={uiLabelMessages}
                  validationMode="blur"
                />
              </div>
              <aside className="app__split-side">
                <div className="app__code-header">{ui.dataPanelTitle}</div>
                {/* Machine-readable mirror for E2E; CodeMirror textContent is not reliable JSON. */}
                <pre className="app__form-data-output" hidden>
                  {dataJson}
                </pre>
                <SiteCodeEditor
                  value={dataJson}
                  language="json"
                  ariaLabel={ui.dataPanelTitle}
                />
              </aside>
            </div>
          ) : null}

          {mode === "editor" ? (
            <div
              id="app-panel-editor"
              className="app__panel-body app__panel-body--editor"
              role="tabpanel"
              aria-label={ui.editorPanelAria}
            >
              <label className="app__editor-readonly">
                <JseCheckbox
                  modelValue={editorReadonly}
                  onModelValueChange={setEditorReadonly}
                />
                <span className="app__editor-readonly__label">{ui.editorReadonly}</span>
              </label>
              <JsonSchemaFormEditor
                key={activeExampleId}
                schema={schema}
                uiSchema={uiSchema}
                onSchemaChange={onSchemaChange}
                onUiSchemaChange={onUiSchemaChange}
                locale={locale}
                fallbackLocale={fallbackLocale}
                labelLocales={labelLocales}
                messages={uiLabelMessages}
                onMessagesChange={onMessagesChange}
                readonly={editorReadonly}
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
                    onClick={() => onJsonPaneChange(pane)}
                  >
                    {pane === "schema"
                      ? ui.jsonSchema
                      : pane === "ui"
                        ? ui.jsonUi
                        : ui.jsonData}
                  </button>
                ))}
              </div>
              <SiteCodeEditor
                value={activeJsonContent}
                language="json"
                ariaLabel={ui.jsonPanelAria}
              />
            </div>
          ) : null}

          {mode === "code" ? (
            <div
              id="app-panel-code"
              className="app__panel-body app__code-view"
              role="tabpanel"
              aria-label={ui.codePanelAria}
            >
              <SiteCodeEditor
                value={embedCode}
                language="javascript"
                ariaLabel={ui.codePanelAria}
              />
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
