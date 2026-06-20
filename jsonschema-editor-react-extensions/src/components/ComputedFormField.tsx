import { useEffect, useMemo, useState } from "react";
import {
  BooleanSchema,
  IntegerSchema,
  NumberSchema,
} from "@jsonschema-editor/json-schema";
import {
  evaluateComputedExpression,
  readComputedConfig,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseInput,
  JseSchemaFormField,
  useFormFieldLabel,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";

export function ComputedFormField({
  schema,
  document,
  scope,
  label,
  i18nKey,
  readonly: _readonly,
}: FormFieldProps) {
  const { fieldSchema, value, setValue, formData } = useScopedField(schema, scope, document);
  const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
    schema,
    scope,
    label,
    fieldSchema,
    i18nKey,
  );

  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const computedConfig = useMemo(
    () => (resolvedSchema ? readComputedConfig(resolvedSchema) : undefined),
    [resolvedSchema],
  );

  const inputType = useMemo(() => {
    const node = resolvedSchema;
    if (node instanceof BooleanSchema) return "checkbox";
    if (node instanceof NumberSchema || node instanceof IntegerSchema) return "number";
    return "text";
  }, [resolvedSchema]);

  useEffect(() => {
    if (!computedConfig) {
      setEvaluationError(null);
      return;
    }

    const result = evaluateComputedExpression(computedConfig.expression, formData);
    if (!result.ok) {
      setEvaluationError(result.error);
      return;
    }

    setEvaluationError(null);
    if (!Object.is(value, result.value)) {
      setValue(result.value);
    }
  }, [computedConfig, formData, setValue, value]);

  const displayValue = useMemo(() => {
    if (inputType === "checkbox") {
      return value === true ? "true" : value === false ? "false" : "";
    }
    if (value === null || value === undefined) {
      return "";
    }
    return String(value);
  }, [inputType, value]);

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      {inputType !== "checkbox" ? (
        <JseInput
          className="jse-field__input"
          type={inputType}
          modelValue={displayValue}
          disabled
          readOnly
        />
      ) : (
        <label className="jse-field__checkbox">
          <input type="checkbox" checked={value === true} disabled />
          <span>{displayValue === "true" ? "Ja" : "Nein"}</span>
        </label>
      )}
      {evaluationError ? (
        <p className="jse-field__hint jse-field__hint--error">{evaluationError}</p>
      ) : null}
    </JseSchemaFormField>
  );
}
