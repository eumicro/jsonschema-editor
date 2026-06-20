import type { HorizontalLayout, VerticalLayout, UiElement } from "@jsonschema-editor/ui-schema";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";
import { UiFormElementResolver } from "./UiFormElementResolver.js";

export interface LayoutUiElementProps extends UiElementRendererProps {
  element: VerticalLayout | HorizontalLayout;
}

export function LayoutUiElement({
  element,
  schema,
  document,
  data,
  onDataChange,
  readonly,
}: LayoutUiElementProps) {
  return (
    <div
      className={
        element.elementKind === "HorizontalLayout"
          ? "jse-layout jse-layout--horizontal"
          : "jse-layout"
      }
    >
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
    </div>
  );
}
