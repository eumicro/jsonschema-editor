import type { Step, UiElement } from "@jsonschema-editor/ui-schema";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";
import { UiFormElementResolver } from "./UiFormElementResolver.js";

export interface StepUiElementProps extends UiElementRendererProps {
  element: Step;
}

export function StepUiElement({
  element,
  schema,
  document,
  data,
  onDataChange,
  readonly,
}: StepUiElementProps) {
  return (
    <section className="jse-step">
      {element.label ? <h3 className="jse-step__title">{element.label}</h3> : null}
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
