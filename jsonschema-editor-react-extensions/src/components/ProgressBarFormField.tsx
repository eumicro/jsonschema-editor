import { useMemo, type CSSProperties } from "react";
import { NumberSchema } from "@jsonschema-editor/json-schema";
import {
  normalizeProgressBarConfig,
  progressBarFillColor,
  progressBarRatio,
  readProgressBarConfig,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseSchemaFormField,
  useFormFieldLabel,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";

export function ProgressBarFormField({
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

  const config = useMemo(() => {
    const node = resolvedSchema ?? new NumberSchema();
    return normalizeProgressBarConfig(node, readProgressBarConfig(node));
  }, [resolvedSchema]);

  const numericValue =
    typeof value === "number" && Number.isFinite(value) ? value : config.min;
  const fillColor = progressBarFillColor(numericValue, config);
  const progressPct = `${progressBarRatio(numericValue, config.min, config.max) * 100}%`;
  const rangeStyle = {
    color: fillColor,
    accentColor: fillColor,
    ["--jse-progress-thumb"]: fillColor,
    ["--jse-progress-pct"]: progressPct,
  } as CSSProperties;

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <div className="jse-progress-bar">
        <div className="jse-progress-bar__controls">
          <input
            className="jse-progress-bar__range"
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={numericValue}
            disabled={readonly}
            aria-valuemin={config.min}
            aria-valuemax={config.max}
            aria-valuenow={numericValue}
            aria-label={displayLabel}
            style={rangeStyle}
            onChange={(event) => {
              if (readonly) return;
              const next = Number(event.target.value);
              setValue(Number.isFinite(next) ? next : config.min);
            }}
          />
          <output className="jse-progress-bar__value" style={{ color: fillColor }}>
            {numericValue.toFixed(1)}
          </output>
        </div>
      </div>
    </JseSchemaFormField>
  );
}
