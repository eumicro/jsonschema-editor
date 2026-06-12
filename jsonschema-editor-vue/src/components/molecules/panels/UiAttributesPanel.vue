<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Control, Group, HorizontalLayout, Label, VerticalLayout } from "@jsonschema-editor/ui-schema";
import JseButton from "../../atoms/JseButton.vue";
import JseInput from "../../atoms/JseInput.vue";
import JseFormField from "../JseFormField.vue";
import {
  changeUiLayoutKind,
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  updateControlScope,
  updateGroupLabel,
  updateLabelText,
  type UiLayoutKind,
  type UiPath,
} from "../../../utils/ui-editor";

const props = defineProps<{
  root: UiElement;
  selectedPath: UiPath;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
}>();

const groupLabelInput = ref("");
const labelTextInput = ref("");
const controlScopeInput = ref("");
const controlLabelInput = ref("");

const selectedElement = computed(() => {
  try {
    return getUiElementAt(props.root, props.selectedPath);
  } catch {
    return props.root;
  }
});

const isControl = computed(() => selectedElement.value instanceof Control);
const isGroup = computed(() => selectedElement.value instanceof Group);
const isLayout = computed(() => isLayoutElement(selectedElement.value));
const isLabel = computed(() => selectedElement.value instanceof Label);

const layoutKind = computed((): UiLayoutKind | null => {
  const element = selectedElement.value;
  if (element instanceof VerticalLayout) return "VerticalLayout";
  if (element instanceof HorizontalLayout) return "HorizontalLayout";
  if (element instanceof Group) return "Group";
  return null;
});

watch(
  selectedElement,
  (element) => {
    if (element instanceof Control) {
      controlScopeInput.value = element.scope;
      controlLabelInput.value = element.label ?? "";
    }
    if (element instanceof Group) {
      groupLabelInput.value = element.label ?? "";
    }
    if (element instanceof Label) {
      labelTextInput.value = element.text;
    }
  },
  { immediate: true },
);

function patch(next: UiElement) {
  emit("update:root", next);
}

function setLayoutKind(kind: UiLayoutKind) {
  if (!layoutKind.value) return;
  patch(
    changeUiLayoutKind(
      props.root,
      props.selectedPath,
      kind,
      kind === "Group" ? groupLabelInput.value || undefined : undefined,
    ),
  );
}

function commitGroupLabel() {
  if (!(selectedElement.value instanceof Group)) return;
  patch(updateGroupLabel(props.root, props.selectedPath, groupLabelInput.value));
}

function commitControlScope() {
  if (!(selectedElement.value instanceof Control)) return;
  patch(updateControlScope(props.root, props.selectedPath, controlScopeInput.value.trim() || "#"));
}

function commitControlLabel() {
  if (!(selectedElement.value instanceof Control)) return;
  patch(
    updateControlScope(
      props.root,
      props.selectedPath,
      selectedElement.value.scope,
      controlLabelInput.value.trim() || undefined,
    ),
  );
}

function commitLabelText() {
  if (!(selectedElement.value instanceof Label)) return;
  patch(updateLabelText(props.root, props.selectedPath, labelTextInput.value));
}
</script>

<template>
  <div class="jse-attributes-panel">
    <p v-if="selectedPath.length === 0" class="jse-structure-editor__hint">
      Root-Layout: {{ getUiElementLabel(selectedElement) }}
    </p>

    <JseFormField v-if="isGroup" label="Gruppen-Label">
      <JseInput
        :model-value="groupLabelInput"
        placeholder="label"
        @update:model-value="groupLabelInput = String($event)"
        @blur="commitGroupLabel"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />
    </JseFormField>

    <JseFormField v-if="isLayout" label="Layout-Typ">
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

    <template v-if="isControl">
      <JseFormField label="scope">
        <JseInput
          :model-value="controlScopeInput"
          placeholder="#/properties/..."
          @update:model-value="controlScopeInput = String($event)"
          @blur="commitControlScope"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
      </JseFormField>
      <JseFormField label="label">
        <JseInput
          :model-value="controlLabelInput"
          placeholder="label"
          @update:model-value="controlLabelInput = String($event)"
          @blur="commitControlLabel"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
      </JseFormField>
    </template>

    <JseFormField v-if="isLabel" label="Text">
      <JseInput
        :model-value="labelTextInput"
        @update:model-value="labelTextInput = String($event)"
        @blur="commitLabelText"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />
    </JseFormField>
  </div>
</template>
