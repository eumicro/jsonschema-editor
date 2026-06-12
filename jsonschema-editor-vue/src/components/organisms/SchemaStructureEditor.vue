<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import SchemaTreeNode from "../molecules/tree/SchemaTreeNode.vue";
import SchemaAttributesPanel from "../molecules/panels/SchemaAttributesPanel.vue";
import JseFloatingPanel from "../molecules/JseFloatingPanel.vue";
import JseTreeNodeActions from "../molecules/JseTreeNodeActions.vue";
import SchemaElementActions from "../molecules/SchemaElementActions.vue";
import {
  DEFS_SEGMENT,
  getDocumentKindLabel,
  getDocumentNodeLabel,
  isDefsContainerPath,
  isValidDocumentPath,
  listDocumentChildren,
  removeNodeAtPath,
  tryGetNodeAtPath,
} from "../../utils/schema-document";
import { schemaPathKey, type SchemaPath } from "../../utils/schema-editor";

const props = defineProps<{
  document: SchemaDocument;
  selectedPath: SchemaPath;
}>();

const emit = defineEmits<{
  "update:document": [document: SchemaDocument];
  "update:selectedPath": [path: SchemaPath];
}>();

const expandedKeys = ref(new Set<string>(["root", DEFS_SEGMENT]));
const addDialogOpen = ref(false);
const attributesDialogOpen = ref(false);
const addTargetPath = ref<SchemaPath>([]);
const attributesTargetPath = ref<SchemaPath>([]);
const addPanelRef = ref<InstanceType<typeof JseFloatingPanel> | null>(null);
const attributesPanelRef = ref<InstanceType<typeof JseFloatingPanel> | null>(null);

watch(
  () => props.document,
  (document) => {
    expandedKeys.value.add("root");
    expandedKeys.value.add(DEFS_SEGMENT);

    if (!isValidDocumentPath(document, attributesTargetPath.value)) {
      attributesDialogOpen.value = false;
      attributesTargetPath.value = [];
    }
    if (!isValidDocumentPath(document, addTargetPath.value)) {
      addDialogOpen.value = false;
      addTargetPath.value = [];
    }
    if (!isValidDocumentPath(document, props.selectedPath)) {
      emit("update:selectedPath", []);
    }
  },
);

const selectedLabel = computed(() => {
  const node = tryGetNodeAtPath(props.document, props.selectedPath);
  if (!node) return "Kein Element ausgewählt";
  return getDocumentNodeLabel(node, props.selectedPath);
});

const selectedKind = computed(() => {
  const node = tryGetNodeAtPath(props.document, props.selectedPath);
  return node ? getDocumentKindLabel(node) : "";
});

const attributesPanelTitle = computed(() => {
  const node = tryGetNodeAtPath(props.document, attributesTargetPath.value);
  if (!node) return "Attribute";
  const label = getDocumentNodeLabel(node, attributesTargetPath.value);
  return `Attribute – ${label}`;
});

const defsChildren = computed(() => listDocumentChildren(props.document, [DEFS_SEGMENT]));

function pathsOverlap(deletedPath: SchemaPath, targetPath: SchemaPath): boolean {
  if (targetPath.length === 0) return false;
  if (deletedPath.length > targetPath.length) return false;
  return deletedPath.every((segment, index) => segment === targetPath[index]);
}

function selectPath(path: SchemaPath) {
  emit("update:selectedPath", path);
}

function togglePath(path: SchemaPath) {
  const key = schemaPathKey(path);
  const next = new Set(expandedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expandedKeys.value = next;
}

function patchDocument(next: SchemaDocument, newPath?: SchemaPath) {
  emit("update:document", next);
  if (newPath) emit("update:selectedPath", newPath);
}

function expandPath(path: SchemaPath) {
  expandedKeys.value = new Set([...expandedKeys.value, schemaPathKey(path)]);
}

async function anchorPanel(
  panelRef: InstanceType<typeof JseFloatingPanel> | null,
  event: MouseEvent,
) {
  await nextTick();
  const target = event.currentTarget;
  const row =
    target instanceof HTMLElement ? target.closest(".jse-tree-node__row") : null;
  if (row instanceof HTMLElement) panelRef?.anchorNear(row);
}

async function openAddDialog(path: SchemaPath, event: MouseEvent) {
  attributesDialogOpen.value = false;
  addTargetPath.value = path;
  emit("update:selectedPath", path);
  addDialogOpen.value = true;
  await anchorPanel(addPanelRef.value, event);
}

async function openAttributesDialog(path: SchemaPath, event: MouseEvent) {
  if (!isValidDocumentPath(props.document, path)) return;
  addDialogOpen.value = false;
  attributesTargetPath.value = path;
  emit("update:selectedPath", path);
  attributesDialogOpen.value = true;
  await anchorPanel(attributesPanelRef.value, event);
}

function deleteAtPath(path: SchemaPath) {
  if (path.length === 0 || isDefsContainerPath(path)) return;
  if (pathsOverlap(path, attributesTargetPath.value)) {
    attributesDialogOpen.value = false;
    attributesTargetPath.value = [];
  }
  if (pathsOverlap(path, addTargetPath.value)) {
    addDialogOpen.value = false;
    addTargetPath.value = [];
  }
  patchDocument(removeNodeAtPath(props.document, path), []);
}

function onDocumentUpdated(next: SchemaDocument) {
  patchDocument(next);
  expandPath(addTargetPath.value);
}

function onItemsSet(arrayPath: SchemaPath) {
  expandPath(arrayPath);
  expandPath([...arrayPath, "items"]);
}

function onAttributesPathChange(path: SchemaPath) {
  attributesTargetPath.value = path;
  emit("update:selectedPath", path);
}

const defsExpanded = computed(() => expandedKeys.value.has(DEFS_SEGMENT));
const defsSelected = computed(() => schemaPathKey(props.selectedPath) === DEFS_SEGMENT);
</script>

<template>
  <div class="jse-structure-editor">
    <p class="jse-structure-editor__hint jse-structure-editor__hint--top">
      Klicken Sie ein Element an, um es auszuwählen. Mit
      <strong>+</strong> fügen Sie Kinder hinzu, mit dem Stift bearbeiten Sie Attribute.
    </p>

    <div
      class="jse-structure-editor__tree"
      role="tree"
      aria-label="Schema-Struktur"
    >
      <SchemaTreeNode
        :document="document"
        :path="[]"
        :selected-path="selectedPath"
        :expanded-keys="expandedKeys"
        @select="selectPath"
        @toggle="togglePath"
        @add="openAddDialog"
        @edit="openAttributesDialog"
        @delete="deleteAtPath"
      />

      <div class="jse-tree-node">
        <div
          class="jse-tree-node__row"
          :class="{ 'jse-tree-node__row--selected': defsSelected }"
          style="padding-left: 4px"
          @click="selectPath([DEFS_SEGMENT])"
        >
          <button
            type="button"
            class="jse-tree-node__toggle"
            @click.stop="togglePath([DEFS_SEGMENT])"
          >
            {{ defsExpanded ? "▼" : "▶" }}
          </button>
          <span class="jse-tree-node__kind">$defs</span>
          <span class="jse-tree-node__label">Definitionen</span>
          <JseTreeNodeActions
            :show-add="true"
            :show-edit="false"
            :show-delete="false"
            add-label="Definition hinzufügen"
            @add="openAddDialog([DEFS_SEGMENT], $event)"
          />
        </div>

        <div v-if="defsExpanded" class="jse-tree-node__children">
          <SchemaTreeNode
            v-for="defPath in defsChildren"
            :key="schemaPathKey(defPath)"
            :document="document"
            :path="defPath"
            :selected-path="selectedPath"
            :expanded-keys="expandedKeys"
            :depth="1"
            @select="selectPath"
            @toggle="togglePath"
            @add="openAddDialog"
            @edit="openAttributesDialog"
            @delete="deleteAtPath"
          />
        </div>
      </div>
    </div>

    <div class="jse-structure-editor__status" aria-live="polite">
      <span class="jse-structure-editor__status-label">Ausgewählt:</span>
      <span v-if="selectedKind" class="jse-tree-node__kind">{{ selectedKind }}</span>
      <span class="jse-structure-editor__status-name">{{ selectedLabel }}</span>
    </div>

    <JseFloatingPanel ref="addPanelRef" v-model="addDialogOpen" title="Element hinzufügen">
      <SchemaElementActions
        :document="document"
        :target-path="addTargetPath"
        @update:document="onDocumentUpdated"
        @done="addDialogOpen = false"
        @items-set="(path) => onItemsSet(path)"
      />
    </JseFloatingPanel>

    <JseFloatingPanel
      ref="attributesPanelRef"
      v-model="attributesDialogOpen"
      :title="attributesPanelTitle"
      :initial-width="360"
      :initial-height="420"
    >
      <SchemaAttributesPanel
        v-if="isValidDocumentPath(document, attributesTargetPath)"
        :document="document"
        :selected-path="attributesTargetPath"
        @update:document="(next) => patchDocument(next)"
        @update:selected-path="onAttributesPathChange"
      />
    </JseFloatingPanel>
  </div>
</template>
