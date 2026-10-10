import { useMemo } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { JseButton } from "../atoms/JseButton.js";
import { JseTabs } from "../atoms/JseTabs.js";
import { JseTextarea } from "../atoms/JseTextarea.js";
import { SchemaStructureEditor } from "../organisms/SchemaStructureEditor.js";
import { UiStructureEditor } from "../organisms/UiStructureEditor.js";
import { EditorContextProvider } from "../../context/EditorContext.js";
import { JseI18nProvider, resolveJseI18nOptions } from "../../context/JseI18nContext.js";
import { RegistriesProvider } from "../../context/RegistriesContext.js";
import type { JseI18nOptions, JseLocale } from "../../i18n/types.js";
import { registerDefaultControls } from "../../registry/register-defaults.js";
import {
  setupJseReactExtensions,
  type JseReactExtension,
} from "../../registry/react-extension.js";
import { useSchemaFormEditorState } from "../../hooks/useSchemaFormEditorState.js";
import { useJseI18n } from "../../context/JseI18nContext.js";

registerDefaultControls();

export interface JsonSchemaFormEditorProps {
  schema: SchemaDocument;
  uiSchema: UiSchema;
  onSchemaChange: (schema: SchemaDocument) => void;
  onUiSchemaChange: (uiSchema: UiSchema) => void;
  locale?: JseI18nOptions["locale"];
  fallbackLocale?: JseI18nOptions["fallbackLocale"];
  messages?: JseI18nOptions["messages"];
  translate?: JseI18nOptions["translate"];
  /** Opt-in locales for editing UI label translations in the attributes panel. */
  labelLocales?: readonly JseLocale[];
  onMessagesChange?: (messages: NonNullable<JseI18nOptions["messages"]>) => void;
  extensions?: JseReactExtension[];
  /** When true, schema and UI schema stay visible but are not editable. */
  readonly?: boolean;
}

function JsonSchemaFormEditorBody({
  schema,
  uiSchema,
  onSchemaChange,
  onUiSchemaChange,
  labelLocales,
  messages,
  onMessagesChange,
  readonly = false,
}: Pick<
  JsonSchemaFormEditorProps,
  | "schema"
  | "uiSchema"
  | "onSchemaChange"
  | "onUiSchemaChange"
  | "labelLocales"
  | "messages"
  | "onMessagesChange"
  | "readonly"
>) {
  const { t } = useJseI18n();

  const {
    editorTab,
    setEditorTab,
    editorTabs,
    selectedSchemaPath,
    setSelectedSchemaPath,
    selectedUiPath,
    setSelectedUiPath,
    uiManualEdit,
    showAdvancedJson,
    setShowAdvancedJson,
    documentRef,
    uiRoot,
    updateDocument,
    updateUiRoot,
    regenerateUiFromSchema,
    schemaJson,
    setSchemaJson,
    uiSchemaJson,
    setUiSchemaJson,
    editorContext,
  } = useSchemaFormEditorState(
    schema,
    uiSchema,
    {
      onSchemaChange,
      onUiSchemaChange,
    },
    { readonly },
  );

  return (
    <EditorContextProvider value={editorContext}>
      <div className="jse-editor">
        <section className="jse-editor__panel jse-editor__panel--main">
          <JseTabs
            modelValue={editorTab}
            onModelValueChange={(id) => setEditorTab(id as "schema" | "ui")}
            panelIdPrefix="jse-editor"
            tabs={editorTabs}
          />

          {editorTab === "schema" ? (
            <div
              id="jse-editor-schema"
              className="jse-editor__tab-panel"
              role="tabpanel"
              aria-labelledby="jse-editor-tab-schema"
            >
              <SchemaStructureEditor
                document={documentRef}
                selectedPath={selectedSchemaPath}
                onDocumentChange={updateDocument}
                onSelectedPathChange={setSelectedSchemaPath}
              />
            </div>
          ) : null}

          {editorTab === "ui" ? (
            <div
              id="jse-editor-ui"
              className="jse-editor__tab-panel"
              role="tabpanel"
              aria-labelledby="jse-editor-tab-ui"
            >
              {uiManualEdit && !readonly ? (
                <div className="jse-editor__banner">
                  {t("editor.banner.manualUi")}
                  <JseButton type="button" onClick={regenerateUiFromSchema}>
                    {t("editor.banner.regenerate")}
                  </JseButton>
                </div>
              ) : null}
              <UiStructureEditor
                root={uiRoot}
                selectedPath={selectedUiPath}
                document={documentRef}
                onRootChange={updateUiRoot}
                onSelectedPathChange={setSelectedUiPath}
                labelLocales={labelLocales}
                messages={messages}
                onMessagesChange={onMessagesChange}
              />
            </div>
          ) : null}

          <details className="jse-editor__advanced" open={showAdvancedJson}>
            <summary
              onClick={(event) => {
                event.preventDefault();
                setShowAdvancedJson((value) => !value);
              }}
            >
              {t("editor.advanced.summary")}
            </summary>
            {editorTab === "schema" ? (
              <label className="jse-editor__json">
                {t("editor.advanced.schemaJson")}
                <JseTextarea
                  modelValue={schemaJson}
                  rows={8}
                  disabled={readonly}
                  onModelValueChange={setSchemaJson}
                />
              </label>
            ) : null}
            {editorTab === "ui" ? (
              <label className="jse-editor__json">
                {t("editor.advanced.uiJson")}
                <JseTextarea
                  modelValue={uiSchemaJson}
                  rows={8}
                  disabled={readonly}
                  onModelValueChange={setUiSchemaJson}
                />
              </label>
            ) : null}
          </details>
        </section>
      </div>
    </EditorContextProvider>
  );
}

export function JsonSchemaFormEditor(props: JsonSchemaFormEditorProps) {
  setupJseReactExtensions(props.extensions);

  const i18nOptions = useMemo(
    () =>
      resolveJseI18nOptions({
        locale: props.locale,
        fallbackLocale: props.fallbackLocale,
        messages: props.messages,
        translate: props.translate,
      }),
    [props.fallbackLocale, props.locale, props.messages, props.translate],
  );

  return (
    <JseI18nProvider options={i18nOptions}>
      <RegistriesProvider>
        <JsonSchemaFormEditorBody
          schema={props.schema}
          uiSchema={props.uiSchema}
          onSchemaChange={props.onSchemaChange}
          onUiSchemaChange={props.onUiSchemaChange}
          labelLocales={props.labelLocales}
          messages={props.messages}
          onMessagesChange={props.onMessagesChange}
          readonly={props.readonly}
        />
      </RegistriesProvider>
    </JseI18nProvider>
  );
}
