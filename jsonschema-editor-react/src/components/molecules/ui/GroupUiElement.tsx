import { resolveUiI18nString, type Group, type UiElement } from "@jsonschema-editor/ui-schema";
import { useJseI18n } from "../../../context/JseI18nContext.js";
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
  scopePrefix,
}: GroupUiElementProps) {
  const { t, te } = useJseI18n();
  const displayLabel = resolveUiI18nString(
    { i18n: element.i18n, defaultMessage: element.label, suffix: "label" },
    (key) => (te(key) ? t(key) : undefined),
  );

  return (
    <fieldset className="jse-group">
      {displayLabel ? <legend>{displayLabel}</legend> : null}
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
    </fieldset>
  );
}
