import { computed, toRaw, type Ref } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { getValueAtPath, normalizeArrayValue, setValueAtPath } from "@jsonschema-editor/json-schema";
import { resolveSchemaAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { scopeToPath } from "@jsonschema-editor/ui-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  Control,
  Group,
  HorizontalLayout,
  Label,
  VerticalLayout,
} from "@jsonschema-editor/ui-schema";
import { useFormData } from "./useFormData";

export function useScopedField(
  rootSchema: Ref<SchemaNode>,
  rootData: Ref<Record<string, unknown>>,
  scope: string,
  document?: Ref<SchemaDocument | undefined>,
) {
  const formData = useFormData(rootData);
  const path = computed(() => scopeToPath(scope));
  const fieldSchema = computed(() => {
    const resolveRef = document?.value
      ? (ref: string) => document.value!.resolveRef(ref)
      : undefined;
    return resolveSchemaAtScope(rootSchema.value, scope, resolveRef);
  });

  const value = computed({
    get: () => getValueAtPath(formData.value, path.value),
    set: (next: unknown) => {
      formData.value = setValueAtPath(
        toRaw(formData.value) as Record<string, unknown>,
        path.value,
        next,
      );
    },
  });

  return { path, fieldSchema, value, formData };
}

export function useArrayFieldValue(
  rootData: Ref<Record<string, unknown>>,
  path: Ref<string[]>,
) {
  const formData = useFormData(rootData);

  return computed<unknown[]>({
    get: () => normalizeArrayValue(getValueAtPath(formData.value, path.value)),
    set: (next) => {
      formData.value = setValueAtPath(
        toRaw(formData.value) as Record<string, unknown>,
        path.value,
        next,
      );
    },
  });
}

export function isControl(element: UiElement): element is Control {
  return element.elementKind === "Control";
}

export function isVerticalLayout(element: UiElement): element is VerticalLayout {
  return element.elementKind === "VerticalLayout";
}

export function isHorizontalLayout(element: UiElement): element is HorizontalLayout {
  return element.elementKind === "HorizontalLayout";
}

export function isGroup(element: UiElement): element is Group {
  return element.elementKind === "Group";
}

export function isLabel(element: UiElement): element is Label {
  return element.elementKind === "Label";
}
