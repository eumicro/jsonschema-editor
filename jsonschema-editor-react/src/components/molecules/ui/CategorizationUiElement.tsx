import { useMemo, useState } from "react";
import {
  resolveUiI18nString,
  type Category,
  type Categorization,
  type UiElement,
} from "@jsonschema-editor/ui-schema";
import { JseTabs } from "../../atoms/JseTabs.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { buildUiElementKey } from "../../../utils/ui-element-key.js";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";
import { UiFormElementResolver } from "./UiFormElementResolver.js";

export interface CategorizationUiElementProps extends UiElementRendererProps {
  element: Categorization;
}

export function CategorizationUiElement({
  element,
  schema,
  document,
  data,
  onDataChange,
  readonly,
  scopePrefix,
}: CategorizationUiElementProps) {
  const { t, te } = useJseI18n();
  const [activeTab, setActiveTab] = useState("0");

  const categories = useMemo(
    () => element.elements.filter((child): child is Category => child.elementKind === "Category"),
    [element.elements],
  );

  const tabs = useMemo(
    () =>
      categories.map((category, index) => ({
        id: String(index),
        label:
          resolveUiI18nString(
            { i18n: category.i18n, defaultMessage: category.label, suffix: "label" },
            (key) => (te(key) ? t(key) : undefined),
          ) ?? t("categorization.category", { index: index + 1 }),
      })),
    [categories, t, te],
  );

  const activeCategory = categories[Number(activeTab)] ?? categories[0];

  return (
    <div className="jse-categorization">
      {tabs.length > 1 ? (
        <JseTabs modelValue={activeTab} onModelValueChange={setActiveTab} tabs={tabs} />
      ) : null}
      {activeCategory ? (
        <div className="jse-categorization__panel">
          {activeCategory.elements.map((child: UiElement, index: number) => (
            <UiFormElementResolver
              key={buildUiElementKey(`tab-${activeTab}`, child, index)}
              element={child}
              schema={schema}
              document={document}
              data={data}
              onDataChange={onDataChange}
              readonly={readonly}
              scopePrefix={scopePrefix}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
