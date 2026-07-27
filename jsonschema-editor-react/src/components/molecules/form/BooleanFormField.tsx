import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useScopedField } from "../../../hooks/useScopedField.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { JseCheckbox } from "../../atoms/JseCheckbox.js";
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
      <JseCheckbox
        modelValue={value === true}
        disabled={readonly}
        onModelValueChange={setValue}
      />
    </JseSchemaFormField>
  );
}
