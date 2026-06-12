<script setup lang="ts">
import { computed } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import JseButton from "../atoms/JseButton.vue";
import {
  createUiElement,
  getUiElementAt,
  getUiElementLabel,
  getUiInsertParentPath,
  insertUiElement,
  type UiPath,
} from "../../utils/ui-editor";

const props = defineProps<{
  root: UiElement;
  targetPath: UiPath;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
  done: [];
}>();

const targetElement = computed(() => getUiElementAt(props.root, props.targetPath));
const targetLabel = computed(() => getUiElementLabel(targetElement.value));
const insertParentPath = computed(() => getUiInsertParentPath(props.root, props.targetPath));

function addElement(
  kind:
    | "Control"
    | "Group"
    | "VerticalLayout"
    | "HorizontalLayout"
    | "Label"
    | "Categorization"
    | "Category"
    | "Stepper"
    | "Step",
) {
  const element = createUiElement(kind);
  emit("update:root", insertUiElement(props.root, insertParentPath.value, element));
  emit("done");
}
</script>

<template>
  <div class="jse-element-actions">
    <p class="jse-element-actions__target">
      Ziel: <strong>{{ targetLabel }}</strong>
      <span class="jse-element-actions__kind">({{ targetElement.elementKind }})</span>
    </p>

    <div class="jse-element-actions__section">
      <span class="jse-structure-editor__hint">UI-Element hinzufügen:</span>
      <div class="jse-structure-editor__buttons">
        <JseButton type="button" @click="addElement('Control')">+ Control</JseButton>
        <JseButton type="button" @click="addElement('Group')">+ Group</JseButton>
        <JseButton type="button" @click="addElement('VerticalLayout')">+ VerticalLayout</JseButton>
        <JseButton type="button" @click="addElement('HorizontalLayout')">+ HorizontalLayout</JseButton>
        <JseButton type="button" @click="addElement('Label')">+ Label</JseButton>
        <JseButton type="button" @click="addElement('Categorization')">+ Categorization</JseButton>
        <JseButton type="button" @click="addElement('Category')">+ Category</JseButton>
        <JseButton type="button" @click="addElement('Stepper')">+ Stepper</JseButton>
        <JseButton type="button" @click="addElement('Step')">+ Step</JseButton>
      </div>
    </div>
  </div>
</template>
