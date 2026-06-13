<script setup lang="ts">
import { computed, ref } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Control, HorizontalLayout } from "@jsonschema-editor/ui-schema";
import {
  canMoveUiElementTo,
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  listUiChildren,
  parseUiPathKey,
  uiPathKey,
  type UiPath,
} from "../../utils/ui-editor";
import { canAcceptUiChildren, canDeleteUiElement } from "../../utils/ui-tree-actions";
import { resolveStackInsertIndex, setActiveLayoutDragSourcePath, getActiveLayoutDragSourcePath } from "../../utils/ui-layout-drag";
import { useJseI18n } from "../../composables/useJseI18n";
import { useTreeNodeActionLabels } from "../../composables/useTreeNodeActionLabels";
import UiLayoutDropZone from "../atoms/UiLayoutDropZone.vue";
import JseTreeNodeActions from "./JseTreeNodeActions.vue";

defineOptions({ name: "UiLayoutEditorNode" });

const props = defineProps<{
  root: UiElement;
  path: UiPath;
  selectedPath: UiPath;
  dragSourcePath: UiPath | null;
  depth?: number;
}>();

const emit = defineEmits<{
  select: [path: UiPath];
  add: [path: UiPath, event: MouseEvent];
  edit: [path: UiPath, event: MouseEvent];
  delete: [path: UiPath];
  dragStart: [path: UiPath];
  dropAt: [parentPath: UiPath, insertIndex: number, event?: DragEvent];
}>();

const activeDropIndex = ref<number | null>(null);

const element = computed(() => getUiElementAt(props.root, props.path));
const label = computed(() => getUiElementLabel(element.value));
const pathKey = computed(() => uiPathKey(props.path));
const isSelected = computed(() => uiPathKey(props.selectedPath) === pathKey.value);
const isLayout = computed(() => isLayoutElement(element.value));
const isHorizontal = computed(() => element.value instanceof HorizontalLayout);
const children = computed(() =>
  isLayout.value ? listUiChildren(element.value, props.path) : [],
);
const showAdd = computed(() => canAcceptUiChildren(element.value));
const showDelete = computed(() => canDeleteUiElement(props.path));
const { t } = useJseI18n();
const { addLabel, editLabel, deleteLabel } = useTreeNodeActionLabels(label, "ui");
const isDragging = computed(
  () => props.dragSourcePath !== null && uiPathKey(props.dragSourcePath) === pathKey.value,
);

const scopeHint = computed(() => {
  if (!(element.value instanceof Control)) return "";
  const segments = element.value.scope.split("/");
  return segments[segments.length - 1] ?? element.value.scope;
});

const blockClass = computed(() => {
  const kind = element.value.elementKind;
  if (kind === "Control") return "jse-layout-block--control";
  if (kind === "Group") return "jse-layout-block--group";
  if (kind === "Label") return "jse-layout-block--label";
  if (kind === "HorizontalLayout") return "jse-layout-block--horizontal";
  if (kind === "VerticalLayout") return "jse-layout-block--vertical";
  if (kind === "Category" || kind === "Step") return "jse-layout-block--section";
  if (kind === "Categorization" || kind === "Stepper") return "jse-layout-block--container";
  return "jse-layout-block--default";
});

function resolveDragSourcePath(event?: DragEvent): UiPath | null {
  if (props.dragSourcePath) return props.dragSourcePath;
  const activePath = getActiveLayoutDragSourcePath(parseUiPathKey);
  if (activePath) return activePath;
  const key = event?.dataTransfer?.getData("text/plain");
  return key ? parseUiPathKey(key) : null;
}

function canDropAt(insertIndex: number, event?: DragEvent): boolean {
  const sourcePath = resolveDragSourcePath(event);
  if (!sourcePath) return false;
  return canMoveUiElementTo(props.root, sourcePath, props.path, insertIndex);
}

function onDragStart(event: DragEvent) {
  emit("dragStart", props.path);
  setActiveLayoutDragSourcePath(props.path, uiPathKey);
  event.dataTransfer?.setData("text/plain", pathKey.value);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function onLayoutDragEnter(event: DragEvent) {
  if (!isLayout.value) return;
  if (!resolveDragSourcePath(event)) return;
  event.preventDefault();
}

function onLayoutDragOver(event: DragEvent) {
  if (!isLayout.value) return;
  event.stopPropagation();
  const stack = (event.currentTarget as HTMLElement).querySelector(":scope > .jse-layout-editor__stack");
  if (!(stack instanceof HTMLElement)) return;
  const insertIndex = resolveStackInsertIndex(stack, event.clientY);
  if (!canDropAt(insertIndex, event)) return;
  event.preventDefault();
  activeDropIndex.value = insertIndex;
}

function onLayoutDrop(event: DragEvent) {
  if (!isLayout.value) return;
  event.stopPropagation();
  const stack = (event.currentTarget as HTMLElement).querySelector(":scope > .jse-layout-editor__stack");
  if (!(stack instanceof HTMLElement)) return;
  event.preventDefault();
  const insertIndex = resolveStackInsertIndex(stack, event.clientY);
  activeDropIndex.value = null;
  if (!canDropAt(insertIndex, event)) return;
  emit("dropAt", props.path, insertIndex, event);
}

function onStackDragOver(event: DragEvent) {
  if (!isLayout.value) return;
  const stack = event.currentTarget;
  if (!(stack instanceof HTMLElement)) return;
  const insertIndex = resolveStackInsertIndex(stack, event.clientY);
  if (!canDropAt(insertIndex, event)) return;
  event.preventDefault();
  event.stopPropagation();
  activeDropIndex.value = insertIndex;
}

function onStackDrop(event: DragEvent) {
  if (!isLayout.value) return;
  const stack = event.currentTarget;
  if (!(stack instanceof HTMLElement)) return;
  event.preventDefault();
  event.stopPropagation();
  const insertIndex = resolveStackInsertIndex(stack, event.clientY);
  activeDropIndex.value = null;
  if (!canDropAt(insertIndex, event)) return;
  emit("dropAt", props.path, insertIndex, event);
}

function onDropZoneDragOver(insertIndex: number, event: DragEvent) {
  if (!canDropAt(insertIndex, event)) return;
  event.preventDefault();
  activeDropIndex.value = insertIndex;
}

function onDropZoneDragLeave() {
  activeDropIndex.value = null;
}

function onDropZoneDrop(insertIndex: number, event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  activeDropIndex.value = null;
  if (!canDropAt(insertIndex, event)) return;
  emit("dropAt", props.path, insertIndex, event);
}
</script>

<template>
  <article
    class="jse-layout-block"
    :class="[
      blockClass,
      {
        'jse-layout-block--selected': isSelected,
        'jse-layout-block--dragging': isDragging,
      },
    ]"
    :data-ui-path="pathKey"
    @click.stop="emit('select', path)"
    @dragenter="onLayoutDragEnter"
    @dragover="onLayoutDragOver"
    @drop="onLayoutDrop"
  >
    <header class="jse-layout-block__header">
      <span
        v-if="path.length > 0"
        class="jse-layout-block__drag-handle"
        draggable="true"
        role="presentation"
        aria-hidden="true"
        @dragstart.stop="onDragStart"
        @dragend.stop="activeDropIndex = null"
      >⠿</span>
      <span class="jse-tree-node__kind">{{ element.elementKind }}</span>
      <span class="jse-layout-block__title">{{ label }}</span>
      <span v-if="scopeHint" class="jse-tree-node__meta">{{ scopeHint }}</span>

      <JseTreeNodeActions
        :show-add="showAdd"
        :show-edit="true"
        :show-delete="showDelete"
        :add-label="addLabel"
        :edit-label="editLabel"
        :delete-label="deleteLabel"
        @add="emit('add', path, $event)"
        @edit="emit('edit', path, $event)"
        @delete="emit('delete', path)"
      />
    </header>

    <div
      v-if="isLayout"
      class="jse-layout-editor__stack"
      :class="{ 'jse-layout-editor__stack--horizontal': isHorizontal }"
      @dragover="onStackDragOver"
      @dragleave="onDropZoneDragLeave"
      @drop="onStackDrop"
    >
      <template v-for="(childPath, index) in children" :key="uiPathKey(childPath)">
        <UiLayoutDropZone
          :active="activeDropIndex === index && dragSourcePath !== null"
          @dragover="onDropZoneDragOver(index, $event)"
          @dragleave="onDropZoneDragLeave"
          @drop="onDropZoneDrop(index, $event)"
        />
        <UiLayoutEditorNode
          :root="root"
          :path="childPath"
          :selected-path="selectedPath"
          :drag-source-path="dragSourcePath"
          :depth="(depth ?? 0) + 1"
          @select="emit('select', $event)"
          @add="(childPath, event) => emit('add', childPath, event)"
          @edit="(childPath, event) => emit('edit', childPath, event)"
          @delete="emit('delete', $event)"
          @drag-start="emit('dragStart', $event)"
          @drop-at="(parentPath, insertIndex, event) => emit('dropAt', parentPath, insertIndex, event)"
        />
      </template>

      <UiLayoutDropZone
        v-if="children.length === 0 || dragSourcePath"
        :active="activeDropIndex === children.length && dragSourcePath !== null"
        :label="children.length === 0 ? t('layout.dropElement') : undefined"
        @dragover="onDropZoneDragOver(children.length, $event)"
        @dragleave="onDropZoneDragLeave"
        @drop="onDropZoneDrop(children.length, $event)"
      />
    </div>
  </article>
</template>
