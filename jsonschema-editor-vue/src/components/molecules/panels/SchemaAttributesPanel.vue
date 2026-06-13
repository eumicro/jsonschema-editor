<script setup lang="ts">
import { toRef } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import JseCheckbox from "../../atoms/JseCheckbox.vue";
import JseInput from "../../atoms/JseInput.vue";
import JseFormField from "../JseFormField.vue";
import JseSelect from "../../atoms/JseSelect.vue";
import ArrayItemsTypeControl from "../ArrayItemsTypeControl.vue";
import AttributeControlResolver from "../attributes/AttributeControlResolver.vue";
import SchemaFieldBulkActions from "./SchemaFieldBulkActions.vue";
import { useJseI18n } from "../../../composables/useJseI18n";
import { useSchemaAttributesPanel } from "../../../composables/useSchemaAttributesPanel";
import type { SchemaPath } from "../../../utils/schema-editor";

const props = defineProps<{
  document: SchemaDocument;
  selectedPath: SchemaPath;
}>();

const emit = defineEmits<{
  "update:document": [document: SchemaDocument];
  "update:selectedPath": [path: SchemaPath];
}>();

const { t } = useJseI18n();

const {
  propertyNameInput,
  propertyNameError,
  selectedDefRef,
  selectedNode,
  isRefNode,
  isDefRoot,
  availableDefs,
  parentObject,
  propertyName,
  showPropertyName,
  attributeFields,
  isRequired,
  showItemsTypeControl,
  itemsTypeKind,
  showBulkFieldActions,
  commitPropertyRename,
  readAttribute,
  updateAttribute,
  setRequired,
  commitRefChange,
  setItemsType,
  applyBulkFieldAttribute,
} = useSchemaAttributesPanel(toRef(props, "document"), toRef(props, "selectedPath"), emit);
</script>

<template>
  <div class="jse-attributes-panel">
    <JseFormField
      v-if="showPropertyName"
      :label="isDefRoot ? t('schemaAttributes.defName') : t('schemaAttributes.fieldName')"
    >
      <JseInput
        :model-value="propertyNameInput"
        :placeholder="isDefRoot ? t('schemaAttributes.defNamePlaceholder') : t('schemaAttributes.fieldNamePlaceholder')"
        @update:model-value="(value) => { propertyNameInput = String(value); propertyNameError = ''; }"
        @blur="commitPropertyRename"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />
      <p v-if="propertyNameError" class="jse-element-actions__error">{{ propertyNameError }}</p>
    </JseFormField>

    <JseFormField v-if="isRefNode" :label="t('schemaAttributes.ref')">
      <JseSelect
        :model-value="selectedDefRef"
        class="jse-field__input"
        @update:model-value="(value) => { selectedDefRef = String(value); commitRefChange(); }"
      >
        <option v-for="name in availableDefs" :key="name" :value="name">
          #/$defs/{{ name }}
        </option>
      </JseSelect>
    </JseFormField>

    <AttributeControlResolver
      v-for="field in attributeFields"
      :key="field.name"
      :node="selectedNode"
      :attribute-name="field.name"
      :label="t(field.labelKey)"
      mode="schema"
      :model-value="readAttribute(field.name)"
      @update:model-value="updateAttribute(field.name, $event)"
    />

    <JseFormField
      v-if="parentObject && propertyName && !isDefRoot"
      boolean
      :label="t('schemaAttributes.required')"
    >
      <JseCheckbox :model-value="isRequired" @update:model-value="setRequired($event)" />
    </JseFormField>

    <JseFormField v-if="showItemsTypeControl" :label="t('schemaAttributes.itemsType')">
      <ArrayItemsTypeControl compact :current-kind="itemsTypeKind" @select="setItemsType" />
    </JseFormField>

    <SchemaFieldBulkActions
      v-if="showBulkFieldActions"
      @apply="applyBulkFieldAttribute"
    />
  </div>
</template>
