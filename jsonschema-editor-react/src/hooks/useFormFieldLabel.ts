import { useMemo } from "react";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { useJseI18n } from "../context/JseI18nContext.js";

export function useFormFieldLabel(
  rootSchema: SchemaNode,
  scope: string,
  label?: string,
  fieldSchema?: SchemaNode,
  i18nKey?: string,
) {
  const { t } = useJseI18n();
  const resolvedSchema = fieldSchema ?? rootSchema;

  const displayLabel = useMemo(() => {
    if (label) return label;
    if (i18nKey) return t(i18nKey);
    if (resolvedSchema?.title) return resolvedSchema.title;
    const segment = scope.split("/").pop();
    if (segment) return segment;
    return t("form.fallbackLabel");
  }, [i18nKey, label, resolvedSchema?.title, scope, t]);

  const description = resolvedSchema?.description;

  return { resolvedSchema, displayLabel, description };
}
