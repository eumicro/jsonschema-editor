import { useEffect, useRef } from "react";
import { todayIsoDate } from "@jsonschema-editor/json-schema-extensions";
import {
  JseInput,
  JseSchemaFormField,
  useFormFieldLabel,
  useJseI18n,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";

export function DateTodayFormField({
  schema,
  document,
  scope,
  label,
  i18nKey,
  readonly,
}: FormFieldProps) {
  const { t } = useJseI18n();
  const { fieldSchema, value, setValue } = useScopedField(
    schema,
    scope,
    document
  );
  const { displayLabel, description } = useFormFieldLabel(
    schema,
    scope,
    label,
    fieldSchema,
    i18nKey
  );

  /** Seed today only once when the control is first created empty. */
  const didSeedInitial = useRef(false);

  useEffect(() => {
    if (didSeedInitial.current || readonly) return;
    didSeedInitial.current = true;
    if (value === undefined || value === null || value === "") {
      setValue(todayIsoDate());
    }
  }, [readonly, setValue, value]);

  return (
    <JseSchemaFormField
      label={displayLabel}
      description={description}
      scope={scope}
    >
      <div className="jse-date-today">
        <JseInput
          className="jse-field__input jse-date-today__input"
          type="date"
          modelValue={typeof value === "string" ? value : ""}
          disabled={readonly}
          onModelValueChange={(next) =>
            setValue(next === "" ? undefined : next)
          }
        />
        <button
          type="button"
          className="jse-date-today__today"
          disabled={readonly}
          onClick={() => setValue(todayIsoDate())}
        >
          {t("extensions.dateToday.today")}
        </button>
      </div>
    </JseSchemaFormField>
  );
}
