import { computed, type Ref } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { useJseI18n } from "./useJseI18n";

export function useFormFieldLabel(
  rootSchema: Ref<SchemaNode>,
  scope: string,
  label: Ref<string | undefined> | undefined,
  fieldSchema: Ref<SchemaNode | undefined>,
  i18nKey?: Ref<string | undefined>,
) {
  const { t } = useJseI18n();
  const resolvedSchema = computed(() => fieldSchema.value ?? rootSchema.value);

  const displayLabel = computed(() => {
    if (label?.value) return label.value;
    if (i18nKey?.value) return t(i18nKey.value);
    if (resolvedSchema.value?.title) return resolvedSchema.value.title;
    const segment = scope.split("/").pop();
    if (segment) return segment;
    return t("form.fallbackLabel");
  });

  const description = computed(() => resolvedSchema.value?.description);

  return { resolvedSchema, displayLabel, description };
}
