import { useEffect, useMemo, useState } from "react";
import {
  isFetchValuesSource,
  isStaticValuesSource,
  readValuesSourceConfig,
  type FetchValuesSource,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseSchemaFormField,
  JseSelect,
  useFormFieldLabel,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";

type SelectOption = { value: string; label: string };

function resolveItems(data: unknown, config: FetchValuesSource): unknown[] {
  if (Array.isArray(data)) return data;
  if (!config.itemsPath) return [];
  const resolved = config.itemsPath.split(".").reduce<unknown>((current: unknown, segment: string) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, data);
  return Array.isArray(resolved) ? resolved : [];
}

export function ValuesSourceFormField({
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

  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const valuesSource = useMemo(
    () => (resolvedSchema ? readValuesSourceConfig(resolvedSchema) : undefined),
    [resolvedSchema],
  );

  useEffect(() => {
    if (!valuesSource) {
      setOptions([]);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    async function loadOptions(config: NonNullable<typeof valuesSource>): Promise<void> {
      if (isStaticValuesSource(config)) {
        if (!cancelled) {
          setOptions(config.values.map((entry: string) => ({ value: entry, label: entry })));
          setLoadError(null);
        }
        return;
      }

      if (!isFetchValuesSource(config)) {
        if (!cancelled) setOptions([]);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(config.url);
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        const payload = await response.json();
        const items = resolveItems(payload, config);
        if (!Array.isArray(items)) {
          throw new Error("Response does not contain an option list");
        }

        const valueField = config.valueField ?? "id";
        const labelField = config.labelField ?? "name";
        const nextOptions = items.map((item) => {
          if (item && typeof item === "object") {
            const record = item as Record<string, unknown>;
            const optionValue = record[valueField];
            const optionLabel = record[labelField] ?? optionValue;
            return {
              value: String(optionValue ?? ""),
              label: String(optionLabel ?? optionValue ?? ""),
            };
          }
          return { value: String(item), label: String(item) };
        });

        if (!cancelled) setOptions(nextOptions);
      } catch (error) {
        if (!cancelled) {
          setOptions([]);
          setLoadError(error instanceof Error ? error.message : "Failed to load options");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOptions(valuesSource);

    return () => {
      cancelled = true;
    };
  }, [valuesSource]);

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <JseSelect
        className="jse-field__input"
        modelValue={typeof value === "string" || typeof value === "number" ? value : ""}
        disabled={readonly || loading}
        onModelValueChange={setValue}
      >
        {loading ? (
          <option disabled value="">
            …
          </option>
        ) : null}
        {options.map((option) => (
          <option key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </JseSelect>
      {loadError ? <p className="jse-field__hint jse-field__hint--error">{loadError}</p> : null}
    </JseSchemaFormField>
  );
}
