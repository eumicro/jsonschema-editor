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
import { useJseI18n } from "../../composables/useJseI18n";

const props = defineProps<{
  root: UiElement;
  targetPath: UiPath;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
  done: [];
}>();

const { t } = useJseI18n();

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
  const element = createUiElement(kind, { translate: t });
  emit("update:root", insertUiElement(props.root, insertParentPath.value, element));
  emit("done");
}
</script>

<template>
  <div class="jse-element-actions">
    <p class="jse-element-actions__target">
      {{ t("elementActions.target") }} <strong>{{ targetLabel }}</strong>
      <span class="jse-element-actions__kind">({{ targetElement.elementKind }})</span>
    </p>

    <div class="jse-element-actions__section">
      <span class="jse-structure-editor__hint">{{ t("elementActions.addUiElement") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton type="button" @click="addElement('Control')">{{ t("elementActions.addKind", { kind: "Control" }) }}</JseButton>
        <JseButton type="button" @click="addElement('Group')">{{ t("elementActions.addKind", { kind: "Group" }) }}</JseButton>
        <JseButton type="button" @click="addElement('VerticalLayout')">{{ t("elementActions.addKind", { kind: "VerticalLayout" }) }}</JseButton>
        <JseButton type="button" @click="addElement('HorizontalLayout')">{{ t("elementActions.addKind", { kind: "HorizontalLayout" }) }}</JseButton>
        <JseButton type="button" @click="addElement('Label')">{{ t("elementActions.addKind", { kind: "Label" }) }}</JseButton>
        <JseButton type="button" @click="addElement('Categorization')">{{ t("elementActions.addKind", { kind: "Categorization" }) }}</JseButton>
        <JseButton type="button" @click="addElement('Category')">{{ t("elementActions.addKind", { kind: "Category" }) }}</JseButton>
        <JseButton type="button" @click="addElement('Stepper')">{{ t("elementActions.addKind", { kind: "Stepper" }) }}</JseButton>
        <JseButton type="button" @click="addElement('Step')">{{ t("elementActions.addKind", { kind: "Step" }) }}</JseButton>
      </div>
    </div>
  </div>
</template>
