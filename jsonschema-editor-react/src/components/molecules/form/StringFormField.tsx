import { StringSchema } from "@jsonschema-editor/json-schema";
import { JseInput } from "../../atoms/JseInput.js";
import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useScopedField } from "../../../hooks/useScopedField.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { JseSchemaFormField } from "./JseSchemaFormField.js";

export function StringFormField({
  schema,
  document,
  scope,
  label,
  i18nKey,
  readonly,
}: FormFieldProps) {
  const { fieldSchema, value, setValue } = useScopedField(schema, scope, document);
  const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
    schema,
    scope,
    label,
    fieldSchema,
    i18nKey,
  );

  let inputType = "text";
  if (resolvedSchema instanceof StringSchema) {
    if (resolvedSchema.format === "date") inputType = "date";
    else if (resolvedSchema.format === "date-time") inputType = "datetime-local";
  }

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <JseInput
        className="jse-field__input"
        type={inputType}
        modelValue={typeof value === "string" ? value : String(value ?? "")}
        disabled={readonly}
        onModelValueChange={setValue}
      />
    </JseSchemaFormField>
  );
}
