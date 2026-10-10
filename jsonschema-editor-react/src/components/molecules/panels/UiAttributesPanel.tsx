import { useMemo } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  Control,
  deriveUiI18nPrefix,
  resolveControlDetailSchema,
  slugifySchemaTitle,
  uiI18nMessageKey,
} from "@jsonschema-editor/ui-schema";
import { JseButton } from "../../atoms/JseButton.js";
import { JseInput } from "../../atoms/JseInput.js";
import { JseFormField } from "../JseFormField.js";
import { JseSuggestionInput } from "../../atoms/JseSuggestionInput.js";
import { AttributeControlResolver } from "../attributes/AttributeControlResolver.js";
import { ControlScopeField } from "../ControlScopeField.js";
import { useEditorContext } from "../../../context/EditorContext.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { useUiAttributesPanel } from "../../../hooks/useUiAttributesPanel.js";
import { listElementLabelPropSuggestions } from "../../../utils/array-item-label.js";
import { listUsedControlScopes } from "../../../utils/control-scope-suggestions.js";
import { findEnclosingDetailPath, getUiElementAt, type UiPath } from "../../../utils/ui-editor.js";
import { patchUiAttribute } from "../../../utils/ui-attributes.js";
import { syncUiI18nPrefix } from "../../../utils/sync-ui-i18n-prefix.js";
import type { JseLocale } from "../../../i18n/types.js";
import {
  readUiLabelMessage,
  writeUiLabelMessage,
  type UiLabelMessages,
} from "../../../utils/ui-label-messages.js";

export interface UiAttributesPanelProps {
  root: UiElement;
  selectedPath: UiPath;
  document?: SchemaDocument | null;
  onRootChange: (root: UiElement) => void;
  /** Opt-in: when set, show i18n prefix + one translation input per locale. */
  labelLocales?: readonly JseLocale[];
  messages?: UiLabelMessages;
  onMessagesChange?: (messages: UiLabelMessages) => void;
}

export function UiAttributesPanel({
  root,
  selectedPath,
  document,
  onRootChange,
  labelLocales,
  messages,
  onMessagesChange,
}: UiAttributesPanelProps) {
  const { t } = useJseI18n();
  const { readonly } = useEditorContext();

  const {
    selectedElement,
    isLayout,
    layoutKind,
    attributeFields,
    multilangEnabled,
    i18nSuffix,
    readAttribute,
    updateAttribute,
    setLayoutKind,
    getUiElementLabel,
  } = useUiAttributesPanel(root, selectedPath, { onRootChange }, document, labelLocales);

  const detailPath = useMemo(() => findEnclosingDetailPath(selectedPath), [selectedPath]);

  const suggestionSchema = useMemo(() => {
    const path = detailPath;
    if (!path || !document) return null;
    try {
      const control = getUiElementAt(root, path.slice(0, -1));
      if (!(control instanceof Control)) return null;
      return resolveControlDetailSchema(document, control.scope) ?? null;
    } catch {
      return null;
    }
  }, [detailPath, document, root]);

  const elementLabelPropSuggestions = useMemo(() => {
    if (!(selectedElement instanceof Control)) return [];
    return listElementLabelPropSuggestions(document, selectedElement.scope).map((name) => ({
      value: name,
      label: name,
    }));
  }, [document, selectedElement]);

  const usedScopes = useMemo(() => {
    if (detailPath) {
      return listUsedControlScopes(root, { subtreeRoot: detailPath });
    }
    return listUsedControlScopes(root, { skipDetail: true });
  }, [detailPath, root]);

  const conflictScopes = useMemo(() => {
    if (detailPath) {
      return listUsedControlScopes(root, {
        subtreeRoot: detailPath,
        ignorePath: selectedPath,
      });
    }
    return listUsedControlScopes(root, {
      skipDetail: true,
      ignorePath: selectedPath,
    });
  }, [detailPath, root, selectedPath]);

  const derivedI18nPrefix = useMemo(
    () =>
      deriveUiI18nPrefix(
        slugifySchemaTitle(document?.root.title),
        {
          elementKind: selectedElement.elementKind,
          scope: selectedElement instanceof Control ? selectedElement.scope : undefined,
        },
        selectedPath,
      ),
    [document?.root.title, selectedElement, selectedPath],
  );

  const i18nPrefix = multilangEnabled
    ? derivedI18nPrefix
    : String(readAttribute("i18n") ?? "").trim();
  const translationKey = i18nPrefix ? uiI18nMessageKey(i18nPrefix, i18nSuffix) : undefined;

  function readLocaleTranslation(locale: JseLocale): string {
    return translationKey ? readUiLabelMessage(messages, locale, translationKey) : "";
  }

  function updateLocaleTranslation(locale: JseLocale, value: string): void {
    if (!translationKey || !onMessagesChange) return;
    onMessagesChange(writeUiLabelMessage(messages, locale, translationKey, value));
  }

  function handleAttributeUpdate(name: string, value: unknown) {
    if (name === "scope" && multilangEnabled) {
      const withScope = patchUiAttribute(root, selectedPath, name, value);
      const synced = syncUiI18nPrefix(withScope, selectedPath, document, messages);
      onRootChange(synced.root);
      if (synced.changed && synced.messages && onMessagesChange) {
        onMessagesChange(synced.messages);
      }
      return;
    }
    updateAttribute(name, value);
  }

  return (
    <div className="jse-attributes-panel">
      {selectedPath.length === 0 ? (
        <p className="jse-structure-editor__hint">
          {t("uiAttributes.rootLayout", { label: getUiElementLabel(selectedElement) })}
        </p>
      ) : null}

      {isLayout ? (
        <JseFormField label={t("uiAttributes.layoutType")}>
          <div className="jse-structure-editor__buttons">
            <JseButton
              type="button"
              disabled={readonly}
              className={layoutKind === "VerticalLayout" ? "jse-btn--active" : ""}
              onClick={() => setLayoutKind("VerticalLayout")}
            >
              VerticalLayout
            </JseButton>
            <JseButton
              type="button"
              disabled={readonly}
              className={layoutKind === "HorizontalLayout" ? "jse-btn--active" : ""}
              onClick={() => setLayoutKind("HorizontalLayout")}
            >
              HorizontalLayout
            </JseButton>
            <JseButton
              type="button"
              disabled={readonly}
              className={layoutKind === "Group" ? "jse-btn--active" : ""}
              onClick={() => setLayoutKind("Group")}
            >
              Group
            </JseButton>
          </div>
        </JseFormField>
      ) : null}

      {attributeFields.map((field) => {
        if (field.name === "scope") {
          const value = readAttribute("scope");
          return (
            <ControlScopeField
              key={field.name}
              document={document}
              suggestionSchema={suggestionSchema}
              usedScopes={usedScopes}
              conflictScopes={conflictScopes}
              disabled={readonly}
              modelValue={typeof value === "string" ? value : ""}
              onModelValueChange={(next) => handleAttributeUpdate("scope", next)}
            />
          );
        }

        if (field.name === "elementLabelProp") {
          const value = readAttribute("elementLabelProp");
          return (
            <JseFormField key={field.name} label={t(field.labelKey)}>
              <JseSuggestionInput
                modelValue={typeof value === "string" ? value : ""}
                onModelValueChange={(next) => updateAttribute("elementLabelProp", next)}
                suggestions={elementLabelPropSuggestions}
                placeholder={t("uiAttributes.elementLabelPropPlaceholder")}
                disabled={readonly}
              />
              <p className="jse-structure-editor__hint">
                {t("uiAttributes.elementLabelPropHint")}
              </p>
            </JseFormField>
          );
        }

        if (field.name === "i18n") {
          return (
            <JseFormField key={field.name} label={t(field.labelKey)}>
              <JseInput
                modelValue={i18nPrefix}
                readOnly
                placeholder={t("uiAttributes.i18nPlaceholder")}
              />
              <p className="jse-structure-editor__hint">{t("uiAttributes.i18nHint")}</p>
            </JseFormField>
          );
        }

        return (
          <AttributeControlResolver
            key={field.name}
            node={selectedElement}
            attributeName={field.name}
            label={t(field.labelKey)}
            mode="ui"
            readonly={readonly}
            modelValue={readAttribute(field.name)}
            onModelValueChange={(value) => updateAttribute(field.name, value)}
          />
        );
      })}

      {multilangEnabled
        ? labelLocales?.map((locale) => (
            <JseFormField
              key={locale}
              label={t("uiAttributes.translatedLabel", { locale })}
            >
              <JseInput
                modelValue={readLocaleTranslation(locale)}
                readOnly={readonly}
                placeholder={
                  i18nPrefix
                    ? uiI18nMessageKey(i18nPrefix, i18nSuffix)
                    : t("uiAttributes.translatedLabelNeedsI18n")
                }
                onModelValueChange={(next) => updateLocaleTranslation(locale, next)}
              />
            </JseFormField>
          ))
        : null}
    </div>
  );
}
