import type { Category, UiElement } from "@jsonschema-editor/ui-schema";
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
}: CategoryUiElementProps) {
  return (
    <section className="jse-category">
      {element.label ? <h3 className="jse-category__title">{element.label}</h3> : null}
      {element.elements.map((child: UiElement, index: number) => (
        <UiFormElementResolver
          key={index}
          element={child}
          schema={schema}
          document={document}
          data={data}
          onDataChange={onDataChange}
          readonly={readonly}
        />
      ))}
    </section>
  );
}
