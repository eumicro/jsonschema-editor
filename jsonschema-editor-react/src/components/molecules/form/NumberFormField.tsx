import { JseInput } from "../../atoms/JseInput.js";
import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useScopedField } from "../../../hooks/useScopedField.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { JseSchemaFormField } from "./JseSchemaFormField.js";

export function NumberFormField({
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
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <JseInput
        className="jse-field__input"
        type="number"
        modelValue={typeof value === "number" ? value : String(value ?? "")}
        disabled={readonly}
        onModelValueChange={(next) => setValue(next === "" ? undefined : Number(next))}
      />
    </JseSchemaFormField>
  );
}
