<script setup lang="ts">
import { computed } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { DEFS_SEGMENT, listDocumentChildren } from "../../../utils/schema-document";
import { schemaPathKey, type SchemaPath } from "../../../utils/schema-editor";
import JseTreeToggle from "../../atoms/JseTreeToggle.vue";
import JseTreeNodeActions from "../JseTreeNodeActions.vue";
import { useJseI18n } from "../../../composables/useJseI18n";
import SchemaTreeNode from "./SchemaTreeNode.vue";

const props = defineProps<{
  document: SchemaDocument;
  selectedPath: SchemaPath;
  expandedKeys: ReadonlySet<string>;
}>();

const emit = defineEmits<{
  select: [path: SchemaPath];
  toggle: [path: SchemaPath];
  add: [path: SchemaPath, event: MouseEvent];
  edit: [path: SchemaPath, event: MouseEvent];
  delete: [path: SchemaPath];
}>();

const { t } = useJseI18n();

const defsPath = [DEFS_SEGMENT] as SchemaPath;
const defsChildren = computed(() => listDocumentChildren(props.document, defsPath));
const defsExpanded = computed(() => props.expandedKeys.has(DEFS_SEGMENT));
const defsSelected = computed(() => schemaPathKey(props.selectedPath) === DEFS_SEGMENT);
</script>

<template>
  <div class="jse-tree-node">
    <div
      class="jse-tree-node__row"
      :class="{ 'jse-tree-node__row--selected': defsSelected }"
      style="padding-left: 4px"
      @click="emit('select', defsPath)"
    >
      <JseTreeToggle
        :has-children="true"
        :expanded="defsExpanded"
        @toggle="emit('toggle', defsPath)"
      />
      <span class="jse-tree-node__kind">$defs</span>
      <span class="jse-tree-node__label">{{ t("schemaStructure.defs.label") }}</span>
      <JseTreeNodeActions
        :show-add="true"
        :show-edit="false"
        :show-delete="false"
        :add-label="t('schemaStructure.defs.addDefinition')"
        @add="emit('add', defsPath, $event)"
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
        @select="emit('select', $event)"
        @toggle="emit('toggle', $event)"
        @add="(path, event) => emit('add', path, event)"
        @edit="(path, event) => emit('edit', path, event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
