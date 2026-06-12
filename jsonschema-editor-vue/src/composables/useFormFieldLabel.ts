import { computed, type Ref } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";

export function useFormFieldLabel(
  rootSchema: Ref<SchemaNode>,
  scope: string,
  label: Ref<string | undefined> | undefined,
  fieldSchema: Ref<SchemaNode | undefined>,
) {
  const resolvedSchema = computed(() => fieldSchema.value ?? rootSchema.value);

  const displayLabel = computed(
    () =>
      label?.value ??
      resolvedSchema.value?.title ??
      scope.split("/").pop() ??
      "Feld",
  );

  const description = computed(() => resolvedSchema.value?.description);

  return { resolvedSchema, displayLabel, description };
}
