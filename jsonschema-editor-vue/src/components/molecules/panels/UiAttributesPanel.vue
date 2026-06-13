<script setup lang="ts">
import { toRef } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import JseButton from "../../atoms/JseButton.vue";
import JseFormField from "../JseFormField.vue";
import AttributeControlResolver from "../attributes/AttributeControlResolver.vue";
import { useJseI18n } from "../../../composables/useJseI18n";
import { useUiAttributesPanel } from "../../../composables/useUiAttributesPanel";
import type { UiPath } from "../../../utils/ui-editor";

const props = defineProps<{
  root: UiElement;
  selectedPath: UiPath;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
}>();

const { t } = useJseI18n();

const {
  selectedElement,
  isLayout,
  layoutKind,
  attributeFields,
  readAttribute,
  updateAttribute,
  setLayoutKind,
  getUiElementLabel,
} = useUiAttributesPanel(toRef(props, "root"), toRef(props, "selectedPath"), emit);
</script>

<template>
  <div class="jse-attributes-panel">
    <p v-if="selectedPath.length === 0" class="jse-structure-editor__hint">
      {{ t("uiAttributes.rootLayout", { label: getUiElementLabel(selectedElement) }) }}
    </p>

    <JseFormField v-if="isLayout" :label="t('uiAttributes.layoutType')">
      <div class="jse-structure-editor__buttons">
        <JseButton
          type="button"
          :class="{ 'jse-btn--active': layoutKind === 'VerticalLayout' }"
          @click="setLayoutKind('VerticalLayout')"
        >
          VerticalLayout
        </JseButton>
        <JseButton
          type="button"
          :class="{ 'jse-btn--active': layoutKind === 'HorizontalLayout' }"
          @click="setLayoutKind('HorizontalLayout')"
        >
          HorizontalLayout
        </JseButton>
        <JseButton
          type="button"
          :class="{ 'jse-btn--active': layoutKind === 'Group' }"
          @click="setLayoutKind('Group')"
        >
          Group
        </JseButton>
      </div>
    </JseFormField>

    <AttributeControlResolver
      v-for="field in attributeFields"
      :key="field.name"
      :node="selectedElement"
      :attribute-name="field.name"
      :label="t(field.labelKey)"
      mode="ui"
      :model-value="readAttribute(field.name)"
      @update:model-value="updateAttribute(field.name, $event)"
    />
  </div>
</template>
