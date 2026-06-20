import { JseInput } from "../../atoms/JseInput.js";
import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useScopedField } from "../../../hooks/useScopedField.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { JseSchemaFormField } from "./JseSchemaFormField.js";

export function DefaultFormField({
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

  const inputType =
    resolvedSchema?.kind === "integer" || resolvedSchema?.kind === "number"
      ? "number"
      : resolvedSchema?.kind === "boolean"
        ? "checkbox"
        : "text";

  if (inputType === "checkbox") {
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

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <JseInput
        className="jse-field__input"
        type={inputType}
        modelValue={
          typeof value === "string" || typeof value === "number"
            ? value
            : String(value ?? "")
        }
        disabled={readonly}
        onModelValueChange={(next) =>
          setValue(inputType === "number" ? (next === "" ? undefined : Number(next)) : next)
        }
      />
    </JseSchemaFormField>
  );
}
