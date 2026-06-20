import type { Group, UiElement } from "@jsonschema-editor/ui-schema";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";
import { UiFormElementResolver } from "./UiFormElementResolver.js";

export interface GroupUiElementProps extends UiElementRendererProps {
  element: Group;
}

export function GroupUiElement({
  element,
  schema,
  document,
  data,
  onDataChange,
  readonly,
}: GroupUiElementProps) {
  return (
    <fieldset className="jse-group">
      {element.label ? <legend>{element.label}</legend> : null}
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
    </fieldset>
  );
}
