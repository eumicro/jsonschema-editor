import { useMemo } from "react";
import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useScopedField } from "../../../hooks/useScopedField.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { JseSelect } from "../../atoms/JseSelect.js";
import { JseSchemaFormField } from "./JseSchemaFormField.js";

export function EnumFormField(props: FormFieldProps) {
  const { schema, document, scope, label, i18nKey, readonly } = props;
  const { fieldSchema, value, setValue } = useScopedField(schema, scope, document);
  const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
    schema,
    scope,
    label,
    fieldSchema,
    i18nKey,
  );

  const enumValues = useMemo(() => resolvedSchema?.enumValues ?? [], [resolvedSchema]);

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <JseSelect
        modelValue={value as string | number}
        className="jse-field__input"
        disabled={readonly}
        onModelValueChange={(next) => setValue(next)}
      >
        {enumValues.map((option) => (
          <option key={String(option)} value={option as string | number}>
            {String(option)}
          </option>
        ))}
      </JseSelect>
    </JseSchemaFormField>
  );
}
