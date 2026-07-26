import { resolveUiI18nString, type Category, type UiElement } from "@jsonschema-editor/ui-schema";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";
import { UiFormElementResolver } from "./UiFormElementResolver.js";

export interface CategoryUiElementProps extends UiElementRendererProps {
  element: Category;
}

export function CategoryUiElement({
  element,
  schema,
  document,
  data,
  onDataChange,
  readonly,
  scopePrefix,
}: CategoryUiElementProps) {
  const { t, te } = useJseI18n();
  const displayLabel = resolveUiI18nString(
    { i18n: element.i18n, defaultMessage: element.label, suffix: "label" },
    (key) => (te(key) ? t(key) : undefined),
  );

  return (
    <section className="jse-category">
      {displayLabel ? <h3 className="jse-category__title">{displayLabel}</h3> : null}
      {element.elements.map((child: UiElement, index: number) => (
        <UiFormElementResolver
          key={index}
          element={child}
          schema={schema}
          document={document}
          data={data}
          onDataChange={onDataChange}
          readonly={readonly}
          scopePrefix={scopePrefix}
        />
      ))}
    </section>
  );
}
