import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useScopedField } from "../../../hooks/useScopedField.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { JseSchemaFormField } from "./JseSchemaFormField.js";

export function BooleanFormField({
  schema,
  document,
  scope,
  label,
  i18nKey,
  readonly,
}: FormFieldProps) {
  const { fieldSchema, value, setValue } = useScopedField(schema, scope, document);
  const { displayLabel, description } = useFormFieldLabel(
    schema,
    scope,
    label,
    fieldSchema,
    i18nKey,
  );

  return (
    <JseSchemaFormField
      label={displayLabel}
      description={description}
      scope={scope}
      boolean
    >
      <input
        className="jse-field__checkbox"
        type="checkbox"
        checked={value === true}
        disabled={readonly}
        onChange={(event) => setValue(event.target.checked)}
      />
    </JseSchemaFormField>
  );
}
