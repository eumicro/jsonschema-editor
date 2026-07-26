import { useMemo, type CSSProperties } from "react";
import { NumberSchema } from "@jsonschema-editor/json-schema";
import {
  normalizeRatingConfig,
  ratingFillColor,
  ratingLevels,
  readRatingConfig,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseSchemaFormField,
  useFormFieldLabel,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";

export function RatingFormField({
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
    return normalizeRatingConfig(node, readRatingConfig(node));
  }, [resolvedSchema]);

  const levels = useMemo(() => ratingLevels(config), [config]);
  const numericValue =
    typeof value === "number" && Number.isFinite(value) ? value : config.min;
  const fillColor = ratingFillColor(numericValue, config);
  const rootStyle = {
    ["--jse-rating-fill"]: fillColor,
  } as CSSProperties;

  function selectLevel(level: number): void {
    if (readonly) return;
    if (Math.abs(numericValue - level) < 1e-9 && config.min === 0) {
      setValue(0);
      return;
    }
    setValue(level);
  }

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <div className="jse-rating" style={rootStyle}>
        <div className="jse-rating__symbols" role="radiogroup" aria-label={displayLabel}>
          {levels.map((level) => {
            const active = numericValue + 1e-9 >= level;
            return (
              <button
                key={level}
                type="button"
                className={`jse-rating__symbol${active ? " jse-rating__symbol--active" : ""}`}
                style={active ? { color: fillColor } : undefined}
                role="radio"
                aria-checked={Math.abs(numericValue - level) < 1e-9}
                aria-label={`${level}`}
                disabled={readonly}
                onClick={() => selectLevel(level)}
              >
                {config.character}
              </button>
            );
          })}
        </div>
        <output className="jse-rating__value">
          {numericValue.toFixed(config.step < 1 ? 1 : 0)}
        </output>
      </div>
    </JseSchemaFormField>
  );
}
