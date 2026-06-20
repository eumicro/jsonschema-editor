import { useMemo } from "react";
import { StringSchema } from "@jsonschema-editor/json-schema";
import {
  JseInput,
  JseSchemaFormField,
  useFormFieldLabel,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";

export function ExtendedFormatFormField({
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

  const format = resolvedSchema instanceof StringSchema ? resolvedSchema.format : undefined;

  const inputType = useMemo((): string => {
    switch (format) {
      case "email":
        return "email";
      case "uri":
        return "url";
      case "phone":
        return "tel";
      default:
        return "text";
    }
  }, [format]);

  const autocomplete = useMemo((): string | undefined => {
    switch (format) {
      case "email":
        return "email";
      case "uri":
        return "url";
      case "phone":
        return "tel";
      default:
        return undefined;
    }
  }, [format]);

  const linkHref = useMemo((): string | null => {
    if (format !== "uri") return null;
    const raw = value;
    if (typeof raw !== "string" || raw.length === 0) return null;
    try {
      const parsed = new URL(raw);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return raw;
    } catch {
      return null;
    }
    return null;
  }, [format, value]);

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <JseInput
        className="jse-field__input jse-field__input--format"
        type={inputType}
        autoComplete={autocomplete}
        modelValue={typeof value === "string" ? value : String(value ?? "")}
        disabled={readonly}
        onModelValueChange={setValue}
      />
      {linkHref ? (
        <a
          className="jse-field__link"
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkHref}
        </a>
      ) : null}
    </JseSchemaFormField>
  );
}
