import { useMemo } from "react";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { resolveUiI18nString } from "@jsonschema-editor/ui-schema";
import { useJseI18n } from "../context/JseI18nContext.js";

export function useFormFieldLabel(
  rootSchema: SchemaNode,
  scope: string,
  label?: string,
  fieldSchema?: SchemaNode,
  i18nKey?: string,
) {
  const { t, te } = useJseI18n();
  const resolvedSchema = fieldSchema ?? rootSchema;

  const displayLabel = useMemo(() => {
    const fromI18n = resolveUiI18nString(
      { i18n: i18nKey, defaultMessage: label, suffix: "label" },
      (key) => (te(key) ? t(key) : undefined),
    );
    if (fromI18n) return fromI18n;
    if (resolvedSchema?.title) return resolvedSchema.title;
    const segment = scope.split("/").pop();
    if (segment) return segment;
    return t("form.fallbackLabel");
  }, [i18nKey, label, resolvedSchema?.title, scope, t, te]);

  const description = useMemo(() => {
    return resolveUiI18nString(
      {
        i18n: i18nKey,
        defaultMessage: resolvedSchema?.description,
        suffix: "description",
      },
      (key) => (te(key) ? t(key) : undefined),
    );
  }, [i18nKey, resolvedSchema?.description, t, te]);

  return { resolvedSchema, displayLabel, description };
}
