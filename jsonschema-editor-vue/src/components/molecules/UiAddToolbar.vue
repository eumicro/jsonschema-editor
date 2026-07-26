<script setup lang="ts">
import { computed } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  canAcceptUiChild,
  createUiElement,
  getUiElementAt,
  getUiElementLabel,
  getUiInsertParentPath,
  type UiPath,
} from "../../utils/ui-editor";
import {
  encodePaletteDragData,
  setActivePaletteKind,
} from "../../utils/ui-layout-drag";
import { UI_PALETTE_KINDS, type UiPaletteKind } from "../../utils/ui-palette";
import { useJseI18n } from "../../composables/useJseI18n";

const props = defineProps<{
  root: UiElement;
  selectedPath: UiPath;
}>();

const emit = defineEmits<{
  "palette-drag": [kind: string | null];
}>();

const { t } = useJseI18n();

const insertParentPath = computed(() =>
  getUiInsertParentPath(props.root, props.selectedPath),
);
const insertParent = computed(() => getUiElementAt(props.root, insertParentPath.value));
const targetLabel = computed(() => getUiElementLabel(insertParent.value));

function isKindAllowed(kind: UiPaletteKind): boolean {
  return canAcceptUiChild(insertParent.value, createUiElement(kind, { translate: t }));
}

function onDragStart(kind: UiPaletteKind, event: DragEvent) {
  if (!isKindAllowed(kind)) {
    event.preventDefault();
    return;
  }
  setActivePaletteKind(kind);
  emit("palette-drag", kind);
  event.dataTransfer?.setData("text/plain", encodePaletteDragData(kind));
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
  }
}

function onDragEnd() {
  setActivePaletteKind(null);
  emit("palette-drag", null);
}
</script>

<template>
  <div class="jse-structure-editor__toolbar" data-testid="ui-add-toolbar">
    <p class="jse-structure-editor__hint">
      {{ t("uiStructure.toolbarDragHint", { label: targetLabel }) }}
    </p>

    <div class="jse-structure-editor__buttons jse-structure-editor__buttons--palette">
      <button
        v-for="kind in UI_PALETTE_KINDS"
        :key="kind"
        type="button"
        class="jse-palette-chip"
        :class="{ 'jse-palette-chip--disabled': !isKindAllowed(kind) }"
        :draggable="isKindAllowed(kind)"
        :disabled="!isKindAllowed(kind)"
        :aria-disabled="!isKindAllowed(kind)"
        :title="
          isKindAllowed(kind)
            ? t('uiStructure.paletteDragTitle', { kind })
            : t('uiStructure.paletteDisabledTitle', { kind, label: targetLabel })
        "
        @dragstart="onDragStart(kind, $event)"
        @dragend="onDragEnd"
      >
        {{ t("elementActions.addKind", { kind }) }}
      </button>
    </div>
  </div>
</template>
