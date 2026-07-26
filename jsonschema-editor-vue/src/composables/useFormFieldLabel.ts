import { computed, type Ref } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { resolveUiI18nString } from "@jsonschema-editor/ui-schema";
import { useJseI18n } from "./useJseI18n";

export function useFormFieldLabel(
  rootSchema: Ref<SchemaNode>,
  scope: string,
  label: Ref<string | undefined> | undefined,
  fieldSchema: Ref<SchemaNode | undefined>,
  i18nKey?: Ref<string | undefined>,
) {
  const { t, te } = useJseI18n();
  const resolvedSchema = computed(() => fieldSchema.value ?? rootSchema.value);

  const displayLabel = computed(() => {
    const fromI18n = resolveUiI18nString(
      {
        i18n: i18nKey?.value,
        defaultMessage: label?.value,
        suffix: "label",
      },
      (key) => (te(key) ? t(key) : undefined),
    );
    if (fromI18n) return fromI18n;
    if (resolvedSchema.value?.title) return resolvedSchema.value.title;
    const segment = scope.split("/").pop();
    if (segment) return segment;
    return t("form.fallbackLabel");
  });

  const description = computed(() => {
    const fromI18n = resolveUiI18nString(
      {
        i18n: i18nKey?.value,
        defaultMessage: resolvedSchema.value?.description,
        suffix: "description",
      },
      (key) => (te(key) ? t(key) : undefined),
    );
    return fromI18n;
  });

  return { resolvedSchema, displayLabel, description };
}
