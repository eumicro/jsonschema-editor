<script setup lang="ts">
import { ref } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  canAcceptUiChild,
  getUiElementAt,
  insertUiElement,
  moveUiElementTo,
  parseUiPathKey,
  uiPathKey,
  type UiPath,
} from "../../utils/ui-editor";
import {
  clearLayoutDragState,
  parsePaletteDragData,
  setActiveLayoutDragSourcePath,
} from "../../utils/ui-layout-drag";
import {
  createPaletteUiElement,
  type UiPaletteKind,
} from "../../utils/ui-palette";
import { useJseI18n } from "../../composables/useJseI18n";
import UiLayoutEditorNode from "../molecules/UiLayoutEditorNode.vue";

const props = defineProps<{
  root: UiElement;
  selectedPath: UiPath;
  document?: SchemaDocument | null;
  paletteKind?: string | null;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
  "update:selectedPath": [path: UiPath];
  add: [path: UiPath, event: MouseEvent];
  edit: [path: UiPath, event: MouseEvent];
  delete: [path: UiPath];
  "palette-drag-end": [];
}>();

const { t } = useJseI18n();
const dragSourcePath = ref<UiPath | null>(null);

function patchRoot(next: UiElement, path?: UiPath) {
  emit("update:root", next);
  if (path) emit("update:selectedPath", path);
}

function onDragStart(path: UiPath) {
  dragSourcePath.value = path;
  setActiveLayoutDragSourcePath(path, uiPathKey);
}

function onDragEnd() {
  window.setTimeout(() => {
    dragSourcePath.value = null;
    clearLayoutDragState();
    emit("palette-drag-end");
  }, 0);
}

function resolvePaletteKind(event?: DragEvent): string | null {
  if (props.paletteKind) return props.paletteKind;
  return parsePaletteDragData(event?.dataTransfer?.getData("text/plain"));
}

function onDropAt(parentPath: UiPath, insertIndex: number, event?: DragEvent) {
  const paletteKind = resolvePaletteKind(event);
  if (paletteKind) {
    const parent = getUiElementAt(props.root, parentPath);
    const element = createPaletteUiElement(paletteKind as UiPaletteKind, {
      root: props.root,
      document: props.document,
      translate: t,
    });
    if (!canAcceptUiChild(parent, element)) return;
    const next = insertUiElement(props.root, parentPath, element, insertIndex);
    dragSourcePath.value = null;
    clearLayoutDragState();
    emit("palette-drag-end");
    patchRoot(next, [...parentPath, insertIndex]);
    return;
  }

  let sourcePath = dragSourcePath.value;
  if (!sourcePath && event?.dataTransfer) {
    const key = event.dataTransfer.getData("text/plain");
    if (key && !parsePaletteDragData(key)) sourcePath = parseUiPathKey(key);
  }
  if (!sourcePath) return;
  dragSourcePath.value = null;
  clearLayoutDragState();
  patchRoot(moveUiElementTo(props.root, sourcePath, parentPath, insertIndex), sourcePath);
}
</script>

<template>
  <div
    class="jse-layout-editor"
    :class="{
      'jse-layout-editor--dragging': dragSourcePath !== null || Boolean(paletteKind),
    }"
    @dragend="onDragEnd"
  >
    <UiLayoutEditorNode
      :root="root"
      :path="[]"
      :selected-path="selectedPath"
      :drag-source-path="dragSourcePath"
      :palette-kind="paletteKind"
      @select="emit('update:selectedPath', $event)"
      @add="(path, event) => emit('add', path, event)"
      @edit="(path, event) => emit('edit', path, event)"
      @delete="emit('delete', $event)"
      @drag-start="onDragStart"
      @drop-at="onDropAt"
    />
  </div>
</template>
