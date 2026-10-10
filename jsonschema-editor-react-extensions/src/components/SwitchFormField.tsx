import {
  JseSwitch,
  JseSchemaFormField,
  useFormFieldLabel,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";

export function SwitchFormField({
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
      <JseSwitch
        modelValue={value === true}
        disabled={readonly}
        onModelValueChange={setValue}
      />
    </JseSchemaFormField>
  );
}
