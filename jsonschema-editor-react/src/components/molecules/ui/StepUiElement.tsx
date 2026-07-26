import { resolveUiI18nString, type Step, type UiElement } from "@jsonschema-editor/ui-schema";
import { useJseI18n } from "../../../context/JseI18nContext.js";
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
  scopePrefix,
}: StepUiElementProps) {
  const { t, te } = useJseI18n();
  const displayLabel = resolveUiI18nString(
    { i18n: element.i18n, defaultMessage: element.label, suffix: "label" },
    (key) => (te(key) ? t(key) : undefined),
  );

  return (
    <section className="jse-step">
      {displayLabel ? <h3 className="jse-step__title">{displayLabel}</h3> : null}
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
