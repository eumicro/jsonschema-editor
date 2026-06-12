<script setup lang="ts">
import { computed, ref } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Control } from "@jsonschema-editor/ui-schema";
import {
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  listUiChildren,
  uiPathKey,
  type UiPath,
} from "../../../utils/ui-editor";
import { canAcceptUiChildren, canDeleteUiElement } from "../../../utils/ui-tree-actions";
import JseTreeNodeActions from "../JseTreeNodeActions.vue";

defineOptions({ name: "UiTreeNode" });

const props = defineProps<{
  root: UiElement;
  path: UiPath;
  selectedPath: UiPath;
  expandedKeys: ReadonlySet<string>;
  depth?: number;
  dragSourcePath: UiPath | null;
}>();

const emit = defineEmits<{
  select: [path: UiPath];
  toggle: [path: UiPath];
  add: [path: UiPath, event: MouseEvent];
  edit: [path: UiPath, event: MouseEvent];
  delete: [path: UiPath];
  dragStart: [path: UiPath];
  drop: [targetPath: UiPath, sourcePath: UiPath];
}>();

const element = computed(() => getUiElementAt(props.root, props.path));
const children = computed(() =>
  isLayoutElement(element.value) ? listUiChildren(element.value, props.path) : [],
);
const label = computed(() => getUiElementLabel(element.value));
const pathKey = computed(() => uiPathKey(props.path));
const isSelected = computed(() => uiPathKey(props.selectedPath) === pathKey.value);
const isExpanded = computed(
  () => props.path.length === 0 || props.expandedKeys.has(pathKey.value),
);
const isLayout = computed(() => isLayoutElement(element.value));
const isDragOver = ref(false);
const showAdd = computed(() => canAcceptUiChildren(element.value));
const showDelete = computed(() => canDeleteUiElement(props.path));

function onDragStart(event: DragEvent) {
  emit("dragStart", props.path);
  event.dataTransfer?.setData("text/plain", pathKey.value);
  event.dataTransfer!.effectAllowed = "move";
}

function onDragOver(event: DragEvent) {
  if (!isLayout.value || !props.dragSourcePath) return;
  event.preventDefault();
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  if (!props.dragSourcePath) return;
  emit("drop", props.path, props.dragSourcePath);
}
</script>

<template>
  <div class="jse-tree-node">
    <div
      class="jse-tree-node__row"
      :class="{
        'jse-tree-node__row--selected': isSelected,
        'jse-tree-node__row--drag-over': isDragOver,
      }"
      :style="{ paddingLeft: `${((depth ?? 0) * 16) + 4}px` }"
      draggable="true"
      @click="emit('select', path)"
      @dragstart="onDragStart"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <button
        v-if="isLayout && children.length"
        type="button"
        class="jse-tree-node__toggle"
        @click.stop="emit('toggle', path)"
      >
        {{ isExpanded ? "▼" : "▶" }}
      </button>
      <span v-else class="jse-tree-node__spacer" />

      <span class="jse-tree-node__kind">{{ element.elementKind }}</span>
      <span class="jse-tree-node__label">{{ label }}</span>
      <span v-if="element instanceof Control" class="jse-tree-node__meta">{{ element.scope }}</span>

      <JseTreeNodeActions
        :show-add="showAdd"
        :show-edit="true"
        :show-delete="showDelete"
        :add-label="`Element zu ${label} hinzufügen`"
        :edit-label="`${label} bearbeiten`"
        :delete-label="`${label} löschen`"
        @add="emit('add', path, $event)"
        @edit="emit('edit', path, $event)"
        @delete="emit('delete', path)"
      />
    </div>

    <div v-if="isExpanded && isLayout && children.length" class="jse-tree-node__children">
      <UiTreeNode
        v-for="childPath in children"
        :key="uiPathKey(childPath)"
        :root="root"
        :path="childPath"
        :selected-path="selectedPath"
        :expanded-keys="expandedKeys"
        :drag-source-path="dragSourcePath"
        :depth="(depth ?? 0) + 1"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @add="(childPath, event) => emit('add', childPath, event)"
        @edit="(childPath, event) => emit('edit', childPath, event)"
        @delete="emit('delete', $event)"
        @drag-start="emit('dragStart', $event)"
        @drop="(target, source) => emit('drop', target, source)"
      />
    </div>
  </div>
</template>
