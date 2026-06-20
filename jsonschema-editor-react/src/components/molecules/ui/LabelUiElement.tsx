import type { Label } from "@jsonschema-editor/ui-schema";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";

export interface LabelUiElementProps extends UiElementRendererProps {
  element: Label;
}

export function LabelUiElement({ element }: LabelUiElementProps) {
  return <p className="jse-label">{element.text}</p>;
}
