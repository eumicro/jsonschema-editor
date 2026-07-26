import { watch, type Ref } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { applyRegisteredFormDataSync } from "../registry/vue-extension.js";

/** Keeps registered form-data sync plugins (e.g. x-computed) applied to form data. */
export function useFormDataSync(
  schema: Ref<SchemaDocument>,
  data: Ref<Record<string, unknown>>,
): void {
  watch(
    [schema, data],
    () => {
      const synced = applyRegisteredFormDataSync(schema.value, data.value);
      if (synced !== data.value) {
        data.value = synced;
      }
    },
    { deep: true, immediate: true },
  );
}
