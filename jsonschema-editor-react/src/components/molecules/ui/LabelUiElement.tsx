import { resolveUiI18nString, type Label } from "@jsonschema-editor/ui-schema";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";

export interface LabelUiElementProps extends UiElementRendererProps {
  element: Label;
}

export function LabelUiElement({ element }: LabelUiElementProps) {
  const { t, te } = useJseI18n();
  const displayText = resolveUiI18nString(
    { i18n: element.i18n, defaultMessage: element.text, suffix: "text" },
    (key) => (te(key) ? t(key) : undefined),
  );

  return <p className="jse-label">{displayText}</p>;
}
