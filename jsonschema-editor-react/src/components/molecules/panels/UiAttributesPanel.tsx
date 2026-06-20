import type { UiElement } from "@jsonschema-editor/ui-schema";
import { JseButton } from "../../atoms/JseButton.js";
import { JseFormField } from "../JseFormField.js";
import { AttributeControlResolver } from "../attributes/AttributeControlResolver.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { useUiAttributesPanel } from "../../../hooks/useUiAttributesPanel.js";
import type { UiPath } from "../../../utils/ui-editor.js";

export interface UiAttributesPanelProps {
  root: UiElement;
  selectedPath: UiPath;
  onRootChange: (root: UiElement) => void;
}

export function UiAttributesPanel({ root, selectedPath, onRootChange }: UiAttributesPanelProps) {
  const { t } = useJseI18n();

  const {
    selectedElement,
    isLayout,
    layoutKind,
    attributeFields,
    readAttribute,
    updateAttribute,
    setLayoutKind,
    getUiElementLabel,
  } = useUiAttributesPanel(root, selectedPath, { onRootChange });

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
              className={layoutKind === "VerticalLayout" ? "jse-btn--active" : ""}
              onClick={() => setLayoutKind("VerticalLayout")}
            >
              VerticalLayout
            </JseButton>
            <JseButton
              type="button"
              className={layoutKind === "HorizontalLayout" ? "jse-btn--active" : ""}
              onClick={() => setLayoutKind("HorizontalLayout")}
            >
              HorizontalLayout
            </JseButton>
            <JseButton
              type="button"
              className={layoutKind === "Group" ? "jse-btn--active" : ""}
              onClick={() => setLayoutKind("Group")}
            >
              Group
            </JseButton>
          </div>
        </JseFormField>
      ) : null}

      {attributeFields.map((field) => (
        <AttributeControlResolver
          key={field.name}
          node={selectedElement}
          attributeName={field.name}
          label={t(field.labelKey)}
          mode="ui"
          modelValue={readAttribute(field.name)}
          onModelValueChange={(value) => updateAttribute(field.name, value)}
        />
      ))}
    </div>
  );
}
