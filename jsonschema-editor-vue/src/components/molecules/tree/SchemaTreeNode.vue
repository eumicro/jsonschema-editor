<script setup lang="ts">
import { computed } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import {
  canAcceptSchemaChildren,
} from "../../../utils/schema-tree-actions";
import {
  canDeleteDocumentNode,
  getDocumentKindLabel,
  getDocumentNodeLabel,
  tryGetNodeAtPath,
  listDocumentChildren,
} from "../../../utils/schema-document";
import { schemaPathKey, type SchemaPath } from "../../../utils/schema-editor";
import { useTreeNodeActionLabels } from "../../../composables/useTreeNodeActionLabels";
import JseTreeToggle from "../../atoms/JseTreeToggle.vue";
import JseTreeNodeActions from "../JseTreeNodeActions.vue";

defineOptions({ name: "SchemaTreeNode" });

const props = defineProps<{
  document: SchemaDocument;
  path: SchemaPath;
  selectedPath: SchemaPath;
  expandedKeys: ReadonlySet<string>;
  depth?: number;
}>();

const emit = defineEmits<{
  select: [path: SchemaPath];
  toggle: [path: SchemaPath];
  add: [path: SchemaPath, event: MouseEvent];
  edit: [path: SchemaPath, event: MouseEvent];
  delete: [path: SchemaPath];
}>();

const node = computed(() => tryGetNodeAtPath(props.document, props.path));
const children = computed(() => listDocumentChildren(props.document, props.path));
const label = computed(() =>
  node.value ? getDocumentNodeLabel(node.value, props.path) : props.path.join("."),
);
const kindLabel = computed(() => (node.value ? getDocumentKindLabel(node.value) : ""));
const pathKey = computed(() => schemaPathKey(props.path));
const isSelected = computed(() => schemaPathKey(props.selectedPath) === pathKey.value);
const isExpanded = computed(
  () => props.path.length === 0 || props.expandedKeys.has(pathKey.value),
);
const hasChildren = computed(() => children.value.length > 0);
const showAdd = computed(() => node.value !== undefined && canAcceptSchemaChildren(node.value));
const showDelete = computed(() => canDeleteDocumentNode(props.path));
const { addLabel, editLabel, deleteLabel } = useTreeNodeActionLabels(label, "schema");
</script>

<template>
  <div v-if="node" class="jse-tree-node">
    <div
      class="jse-tree-node__row"
      :class="{ 'jse-tree-node__row--selected': isSelected }"
      :style="{ paddingLeft: `${((depth ?? 0) * 16) + 4}px` }"
      @click="emit('select', path)"
    >
      <JseTreeToggle
        :has-children="hasChildren"
        :expanded="isExpanded"
        @toggle="emit('toggle', path)"
      />

      <span class="jse-tree-node__kind">{{ kindLabel }}</span>
      <span class="jse-tree-node__label">{{ label }}</span>
      <span v-if="node.title && node.title !== label" class="jse-tree-node__title">
        {{ node.title }}
      </span>

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
      <SchemaTreeNode
        v-for="childPath in children"
        :key="schemaPathKey(childPath)"
        :document="document"
        :path="childPath"
        :selected-path="selectedPath"
        :expanded-keys="expandedKeys"
        :depth="(depth ?? 0) + 1"
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @add="(childPath, event) => emit('add', childPath, event)"
        @edit="(childPath, event) => emit('edit', childPath, event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
