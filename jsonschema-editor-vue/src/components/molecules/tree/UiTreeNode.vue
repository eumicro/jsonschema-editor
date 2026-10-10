<script setup lang="ts">
import { computed, ref } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Control } from "@jsonschema-editor/ui-schema";
import {
  controlAllowsDetail,
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  listUiChildren,
  uiPathKey,
  type UiPath,
} from "../../../utils/ui-editor";
import { canAcceptUiChildren, canDeleteUiElement } from "../../../utils/ui-tree-actions";
import { useEditorContext } from "../../../composables/useEditorContext";
import { useTreeNodeActionLabels } from "../../../composables/useTreeNodeActionLabels";
import { useJseI18n } from "../../../composables/useJseI18n";
import JseTreeToggle from "../../atoms/JseTreeToggle.vue";
import JseTreeNodeActions from "../JseTreeNodeActions.vue";

defineOptions({ name: "UiTreeNode" });

const props = defineProps<{
  root: UiElement;
  path: UiPath;
  selectedPath: UiPath;
  expandedKeys: ReadonlySet<string>;
  depth?: number;
  dragSourcePath: UiPath | null;
  document?: SchemaDocument | null;
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

const { t } = useJseI18n();
const { readonly } = useEditorContext();
const element = computed(() => getUiElementAt(props.root, props.path));
const children = computed(() => listUiChildren(element.value, props.path));
const label = computed(() => getUiElementLabel(element.value));
const pathKey = computed(() => uiPathKey(props.path));
const isSelected = computed(() => uiPathKey(props.selectedPath) === pathKey.value);
const isExpanded = computed(
  () => props.path.length === 0 || props.expandedKeys.has(pathKey.value),
);
const isLayout = computed(() => isLayoutElement(element.value));
const hasDetail = computed(() => controlAllowsDetail(element.value, props.document));
const hasChildren = computed(() => children.value.length > 0);
const isContainer = computed(() => isLayout.value || hasDetail.value);
const isDragOver = ref(false);
const showAdd = computed(
  () => !readonly.value && canAcceptUiChildren(element.value, props.document),
);
const showDelete = computed(() => !readonly.value && canDeleteUiElement(props.path));
const { addLabel, editLabel, deleteLabel } = useTreeNodeActionLabels(label, "ui");

function onDragStart(event: DragEvent) {
  if (readonly.value) {
    event.preventDefault();
    return;
  }
  emit("dragStart", props.path);
  event.dataTransfer?.setData("text/plain", pathKey.value);
  event.dataTransfer!.effectAllowed = "move";
}

function onDragOver(event: DragEvent) {
  if (readonly.value || !isContainer.value || !props.dragSourcePath) return;
  event.preventDefault();
  isDragOver.value = true;
}

function onDragLeave() {
  isDragOver.value = false;
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
  if (readonly.value || !props.dragSourcePath) return;
  const targetPath =
    hasDetail.value && !isLayout.value ? ([...props.path, "detail"] as UiPath) : props.path;
  emit("drop", targetPath, props.dragSourcePath);
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
      :draggable="!readonly"
      @click="emit('select', path)"
      @dragstart="onDragStart"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <JseTreeToggle
        :has-children="isContainer && hasChildren"
        :expanded="isExpanded"
        @toggle="emit('toggle', path)"
      />

      <span class="jse-tree-node__kind">{{ element.elementKind }}</span>
      <span class="jse-tree-node__label">{{ label }}</span>
      <span v-if="element instanceof Control" class="jse-tree-node__meta">{{ element.scope }}</span>
      <span v-if="hasDetail && !isLayout" class="jse-tree-node__meta">{{ t("layout.detailHint") }}</span>

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
    </div>

    <div v-if="isExpanded && hasChildren" class="jse-tree-node__children">
      <UiTreeNode
        v-for="childPath in children"
        :key="uiPathKey(childPath)"
        :root="root"
        :path="childPath"
        :selected-path="selectedPath"
        :expanded-keys="expandedKeys"
        :drag-source-path="dragSourcePath"
        :document="document"
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
