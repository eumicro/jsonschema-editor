import type { Control } from "@jsonschema-editor/ui-schema";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { SchemaFormFieldResolver } from "../form/SchemaFormFieldResolver.js";

export interface ControlUiElementProps extends FormFieldProps {
  element: Control;
}

export function ControlUiElement({
  element,
  schema,
  document,
  data,
  onDataChange,
  readonly,
}: ControlUiElementProps) {
  if (element.elementKind !== "Control" || !element.scope) {
    return null;
  }

  return (
    <SchemaFormFieldResolver
      schema={schema}
      document={document}
      scope={element.scope}
      label={element.label}
      i18nKey={element.i18n}
      readonly={readonly}
      data={data}
      onDataChange={onDataChange}
    />
  );
}
