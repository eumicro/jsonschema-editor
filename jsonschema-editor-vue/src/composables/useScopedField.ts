import { computed, toRaw, type Ref } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
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

export function useScopedField(
  rootSchema: Ref<SchemaNode>,
  rootData: Ref<Record<string, unknown>>,
  scope: string,
  document?: Ref<SchemaDocument | undefined>,
) {
  const path = computed(() => scopeToPath(scope));
  const fieldSchema = computed(() => {
    const resolveRef = document?.value
      ? (ref: string) => document.value!.resolveRef(ref)
      : undefined;
    return resolveSchemaAtScope(rootSchema.value, scope, resolveRef);
  });

  const value = computed({
    get: () => {
      let current: unknown = rootData.value;
      for (const key of path.value) {
        if (current === null || current === undefined || typeof current !== "object") {
          return undefined;
        }
        current = (current as Record<string, unknown>)[key];
      }
      return current;
    },
    set: (next: unknown) => {
      const clone = structuredClone(toRaw(rootData.value) as Record<string, unknown>);
      let current: Record<string, unknown> = clone;

      for (let i = 0; i < path.value.length - 1; i++) {
        const key = path.value[i];
        if (
          current[key] === undefined ||
          typeof current[key] !== "object" ||
          current[key] === null
        ) {
          current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
      }

      current[path.value[path.value.length - 1]] = next;
      rootData.value = clone;
    },
  });

  return { path, fieldSchema, value };
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
