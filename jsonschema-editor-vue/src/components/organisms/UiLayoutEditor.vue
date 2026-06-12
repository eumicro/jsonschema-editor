<script setup lang="ts">
import { ref } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { moveUiElementTo, type UiPath } from "../../utils/ui-editor";
import UiLayoutEditorNode from "../molecules/UiLayoutEditorNode.vue";

const props = defineProps<{
  root: UiElement;
  selectedPath: UiPath;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
  "update:selectedPath": [path: UiPath];
  add: [path: UiPath, event: MouseEvent];
  edit: [path: UiPath, event: MouseEvent];
  delete: [path: UiPath];
}>();

const dragSourcePath = ref<UiPath | null>(null);

function patchRoot(next: UiElement, path?: UiPath) {
  emit("update:root", next);
  if (path) emit("update:selectedPath", path);
}

function onDragStart(path: UiPath) {
  dragSourcePath.value = path;
}

function onDragEnd() {
  dragSourcePath.value = null;
}

function onDropAt(parentPath: UiPath, insertIndex: number) {
  if (!dragSourcePath.value) return;
  const sourcePath = dragSourcePath.value;
  dragSourcePath.value = null;
  patchRoot(moveUiElementTo(props.root, sourcePath, parentPath, insertIndex), sourcePath);
}
</script>

<template>
  <div
    class="jse-layout-editor"
    :class="{ 'jse-layout-editor--dragging': dragSourcePath !== null }"
    @dragend="onDragEnd"
  >
    <UiLayoutEditorNode
      :root="root"
      :path="[]"
      :selected-path="selectedPath"
      :drag-source-path="dragSourcePath"
      @select="emit('update:selectedPath', $event)"
      @add="(path, event) => emit('add', path, event)"
      @edit="(path, event) => emit('edit', path, event)"
      @delete="emit('delete', $event)"
      @drag-start="onDragStart"
      @drop-at="onDropAt"
    />
  </div>
</template>
