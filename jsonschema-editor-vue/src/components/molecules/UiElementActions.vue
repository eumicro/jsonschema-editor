<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Control, VerticalLayout, resolveControlDetailSchema } from "@jsonschema-editor/ui-schema";
import JseButton from "../atoms/JseButton.vue";
import ControlScopeField from "./ControlScopeField.vue";
import {
  canAcceptUiChild,
  createUiElement,
  findEnclosingDetailPath,
  getUiElementAt,
  getUiElementLabel,
  getUiInsertParentPath,
  insertUiElement,
  type UiPath,
} from "../../utils/ui-editor";
import {
  findControlScopeSuggestion,
  listDetailControlScopeSuggestions,
  listControlScopeSuggestions,
  listUsedControlScopes,
} from "../../utils/control-scope-suggestions";
import { useJseI18n } from "../../composables/useJseI18n";

type UiLayoutElementKind =
  | "Group"
  | "VerticalLayout"
  | "HorizontalLayout"
  | "Label"
  | "Categorization"
  | "Category"
  | "Stepper"
  | "Step";

const LAYOUT_KINDS: readonly UiLayoutElementKind[] = [
  "Group",
  "VerticalLayout",
  "HorizontalLayout",
  "Label",
  "Categorization",
  "Category",
  "Stepper",
  "Step",
];

const props = defineProps<{
  root: UiElement;
  targetPath: UiPath;
  document?: SchemaDocument | null;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
  done: [];
}>();

const { t } = useJseI18n();
const controlScope = ref("");

const targetElement = computed(() => getUiElementAt(props.root, props.targetPath));
const targetLabel = computed(() => getUiElementLabel(targetElement.value));
const insertParentPath = computed(() =>
  getUiInsertParentPath(props.root, props.targetPath, props.document),
);

const insertParent = computed((): UiElement => {
  const path = insertParentPath.value;
  if (path[path.length - 1] === "detail") {
    try {
      return getUiElementAt(props.root, path);
    } catch {
      return new VerticalLayout();
    }
  }
  return getUiElementAt(props.root, path);
});

const detailPath = computed(
  () =>
    (insertParentPath.value[insertParentPath.value.length - 1] === "detail"
      ? insertParentPath.value
      : findEnclosingDetailPath(insertParentPath.value)),
);

const suggestionSchema = computed(() => {
  const path = detailPath.value;
  if (!path || !props.document) return null;
  try {
    const control = getUiElementAt(props.root, path.slice(0, -1));
    if (!(control instanceof Control)) return null;
    return resolveControlDetailSchema(props.document, control.scope) ?? null;
  } catch {
    return null;
  }
});

const usedScopes = computed(() => {
  if (detailPath.value) {
    return listUsedControlScopes(props.root, { subtreeRoot: detailPath.value });
  }
  return listUsedControlScopes(props.root, { skipDetail: true });
});

const availableSuggestions = computed(() => {
  if (detailPath.value) {
    return listDetailControlScopeSuggestions(props.document, props.root, detailPath.value, {
      excludeScopes: usedScopes.value,
    });
  }
  return listControlScopeSuggestions(props.document, { excludeScopes: usedScopes.value });
});

const allSuggestions = computed(() => {
  if (detailPath.value) {
    return listDetailControlScopeSuggestions(props.document, props.root, detailPath.value);
  }
  return listControlScopeSuggestions(props.document);
});

const compatibleKinds = computed(() =>
  LAYOUT_KINDS.filter((kind) =>
    canAcceptUiChild(insertParent.value, createUiElement(kind, { translate: t })),
  ),
);

const canAddControl = computed(() =>
  canAcceptUiChild(insertParent.value, createUiElement("Control", { translate: t })),
);

watch(
  () => [props.targetPath, availableSuggestions.value] as const,
  () => {
    if (!controlScope.value.trim()) {
      controlScope.value = availableSuggestions.value[0]?.scope ?? "";
    }
  },
  { immediate: true },
);

function addElement(kind: UiLayoutElementKind) {
  const element = createUiElement(kind, { translate: t });
  if (!canAcceptUiChild(insertParent.value, element)) return;
  emit("update:root", insertUiElement(props.root, insertParentPath.value, element));
  emit("done");
}

function addControl() {
  if (!canAddControl.value) return;
  const scope = controlScope.value.trim() || "#/properties/field";
  const suggestion = findControlScopeSuggestion(allSuggestions.value, scope);
  const element = createUiElement("Control", {
    translate: t,
    scope,
    label: suggestion?.label,
  });
  emit("update:root", insertUiElement(props.root, insertParentPath.value, element));
  const next = detailPath.value
    ? listDetailControlScopeSuggestions(props.document, props.root, detailPath.value, {
        excludeScopes: [...usedScopes.value, scope],
      })
    : listControlScopeSuggestions(props.document, {
        excludeScopes: [...usedScopes.value, scope],
      });
  controlScope.value = next[0]?.scope ?? "";
  emit("done");
}
</script>

<template>
  <div class="jse-element-actions">
    <p class="jse-element-actions__target">
      {{ t("elementActions.target") }} <strong>{{ targetLabel }}</strong>
      <span class="jse-element-actions__kind">({{ targetElement.elementKind }})</span>
    </p>

    <div v-if="compatibleKinds.length > 0" class="jse-element-actions__section">
      <span class="jse-structure-editor__hint">{{ t("elementActions.addUiElement") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton
          v-for="kind in compatibleKinds"
          :key="kind"
          type="button"
          @click="addElement(kind)"
        >
          {{ t("elementActions.addKind", { kind }) }}
        </JseButton>
      </div>
    </div>

    <div v-if="canAddControl" class="jse-element-actions__section">
      <ControlScopeField
        v-model="controlScope"
        :document="document"
        :suggestion-schema="suggestionSchema"
        :used-scopes="usedScopes"
      />
      <div class="jse-structure-editor__buttons">
        <JseButton type="button" @click="addControl">
          {{ t("elementActions.addKind", { kind: "Control" }) }}
        </JseButton>
      </div>
    </div>

    <p
      v-if="compatibleKinds.length === 0 && !canAddControl"
      class="jse-structure-editor__note"
    >
      {{ t("uiStructure.toolbarNoCompatible", { label: targetLabel }) }}
    </p>
  </div>
</template>
