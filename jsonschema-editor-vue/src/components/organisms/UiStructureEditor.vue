<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import UiTreeNode from "../molecules/tree/UiTreeNode.vue";
import UiLayoutEditor from "./UiLayoutEditor.vue";
import UiAttributesPanel from "../molecules/panels/UiAttributesPanel.vue";
import JseFloatingPanel from "../molecules/JseFloatingPanel.vue";
import UiElementActions from "../molecules/UiElementActions.vue";
import {
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  moveUiElement,
  moveUiElementTo,
  removeUiElement,
  uiPathKey,
  type UiPath,
} from "../../utils/ui-editor";

const props = defineProps<{
  root: UiElement;
  selectedPath: UiPath;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
  "update:selectedPath": [path: UiPath];
}>();

const viewMode = ref<"tree" | "layout">("layout");
const expandedKeys = ref(new Set<string>(["root"]));
const dragSourcePath = ref<UiPath | null>(null);
const addDialogOpen = ref(false);
const attributesDialogOpen = ref(false);
const addTargetPath = ref<UiPath>([]);
const attributesTargetPath = ref<UiPath>([]);
const addPanelRef = ref<InstanceType<typeof JseFloatingPanel> | null>(null);
const attributesPanelRef = ref<InstanceType<typeof JseFloatingPanel> | null>(null);

const attributesPanelTitle = computed(() => {
  try {
    const element = getUiElementAt(props.root, attributesTargetPath.value);
    const label = getUiElementLabel(element);
    return `UI – ${label}`;
  } catch {
    return "UI bearbeiten";
  }
});

const selectedLabel = computed(() => {
  try {
    const element = getUiElementAt(props.root, props.selectedPath);
    return getUiElementLabel(element);
  } catch {
    return "Kein Element ausgewählt";
  }
});

function patchRoot(next: UiElement, path?: UiPath) {
  emit("update:root", next);
  if (path) emit("update:selectedPath", path);
}

function selectPath(path: UiPath) {
  emit("update:selectedPath", path);
}

function togglePath(path: UiPath) {
  const key = uiPathKey(path);
  const next = new Set(expandedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expandedKeys.value = next;
}

async function anchorPanel(
  panelRef: InstanceType<typeof JseFloatingPanel> | null,
  event: MouseEvent,
) {
  await nextTick();
  const target = event.currentTarget;
  const row =
    target instanceof HTMLElement
      ? (target.closest(".jse-tree-node__row") ?? target.closest(".jse-layout-block__header"))
      : null;
  if (row instanceof HTMLElement) panelRef?.anchorNear(row);
}

async function openAddDialog(path: UiPath, event: MouseEvent) {
  attributesDialogOpen.value = false;
  addTargetPath.value = path;
  emit("update:selectedPath", path);
  addDialogOpen.value = true;
  await anchorPanel(addPanelRef.value, event);
}

async function openAttributesDialog(path: UiPath, event: MouseEvent) {
  addDialogOpen.value = false;
  attributesTargetPath.value = path;
  emit("update:selectedPath", path);
  attributesDialogOpen.value = true;
  await anchorPanel(attributesPanelRef.value, event);
}

function deleteAtPath(path: UiPath) {
  if (path.length === 0) return;
  patchRoot(removeUiElement(props.root, path), []);
}

function expandPath(path: UiPath) {
  expandedKeys.value = new Set([...expandedKeys.value, uiPathKey(path)]);
}

function onRootUpdated(next: UiElement) {
  patchRoot(next);
  expandPath(addTargetPath.value);
}

function onDragStart(path: UiPath) {
  dragSourcePath.value = path;
}

function onDragEnd() {
  dragSourcePath.value = null;
}

function onTreeDrop(targetPath: UiPath, sourcePath: UiPath) {
  dragSourcePath.value = null;
  if (uiPathKey(sourcePath) === uiPathKey(targetPath)) return;

  const sourceParent = sourcePath.slice(0, -1);
  const targetParent = targetPath.slice(0, -1);

  if (uiPathKey(sourceParent) === uiPathKey(targetParent)) {
    patchRoot(moveUiElement(props.root, sourcePath, targetPath));
    return;
  }

  const targetElement = getUiElementAt(props.root, targetPath);
  if (isLayoutElement(targetElement)) {
    patchRoot(
      moveUiElementTo(props.root, sourcePath, targetPath, targetElement.elements.length),
      sourcePath,
    );
    return;
  }

  patchRoot(
    moveUiElementTo(props.root, sourcePath, targetParent, targetPath[targetPath.length - 1]),
    sourcePath,
  );
}
</script>

<template>
  <div class="jse-structure-editor">
    <div class="jse-structure-editor__view-toggle" role="tablist" aria-label="UI-Schema Ansicht">
      <button
        type="button"
        role="tab"
        class="jse-structure-editor__view-tab"
        :class="{ 'jse-structure-editor__view-tab--active': viewMode === 'layout' }"
        :aria-selected="viewMode === 'layout'"
        @click="viewMode = 'layout'"
      >
        Layout-Editor
      </button>
      <button
        type="button"
        role="tab"
        class="jse-structure-editor__view-tab"
        :class="{ 'jse-structure-editor__view-tab--active': viewMode === 'tree' }"
        :aria-selected="viewMode === 'tree'"
        @click="viewMode = 'tree'"
      >
        Baumansicht
      </button>
    </div>

    <p class="jse-structure-editor__hint jse-structure-editor__hint--top">
      <template v-if="viewMode === 'layout'">
        Felder und Gruppen per Drag &amp; Drop anordnen – auch zwischen Objekten und deren
        Unterelementen. Ganze Gruppen verschieben alle enthaltenen Schema-Felder mit.
      </template>
      <template v-else>
        Hierarchie als Baum. Elemente per Drag &amp; Drop sortieren oder in andere Layouts
        verschieben. + fügt hinzu, Stift bearbeitet Eigenschaften.
      </template>
    </p>

    <UiLayoutEditor
      v-if="viewMode === 'layout'"
      :root="root"
      :selected-path="selectedPath"
      @update:root="patchRoot($event)"
      @update:selected-path="selectPath"
      @add="openAddDialog"
      @edit="openAttributesDialog"
      @delete="deleteAtPath"
    />

    <div
      v-else
      class="jse-structure-editor__tree"
      role="tree"
      aria-label="UI-Struktur"
      @dragend="onDragEnd"
    >
      <UiTreeNode
        :root="root"
        :path="[]"
        :selected-path="selectedPath"
        :expanded-keys="expandedKeys"
        :drag-source-path="dragSourcePath"
        @select="selectPath"
        @toggle="togglePath"
        @add="openAddDialog"
        @edit="openAttributesDialog"
        @delete="deleteAtPath"
        @drag-start="onDragStart"
        @drop="onTreeDrop"
      />
    </div>

    <div class="jse-structure-editor__status" aria-live="polite">
      <span class="jse-structure-editor__status-label">Ausgewählt:</span>
      <span class="jse-structure-editor__status-name">{{ selectedLabel }}</span>
    </div>

    <JseFloatingPanel ref="addPanelRef" v-model="addDialogOpen" title="UI-Element hinzufügen">
      <UiElementActions
        :root="root"
        :target-path="addTargetPath"
        @update:root="onRootUpdated"
        @done="addDialogOpen = false"
      />
    </JseFloatingPanel>

    <JseFloatingPanel
      ref="attributesPanelRef"
      v-model="attributesDialogOpen"
      :title="attributesPanelTitle"
      :initial-width="380"
      :initial-height="360"
    >
      <UiAttributesPanel
        :root="root"
        :selected-path="attributesTargetPath"
        @update:root="(next) => patchRoot(next)"
      />
    </JseFloatingPanel>
  </div>
</template>
