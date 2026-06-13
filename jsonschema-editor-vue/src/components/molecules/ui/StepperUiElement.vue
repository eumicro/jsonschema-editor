<script setup lang="ts">
import { computed, ref } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { Step, Stepper } from "@jsonschema-editor/ui-schema";
import JseButton from "../../atoms/JseButton.vue";
import { useJseI18n } from "../../../composables/useJseI18n";
import { buildUiElementKey } from "../../../utils/ui-element-key";
import UiFormElementResolver from "./UiFormElementResolver.vue";

const props = defineProps<{
  element: Stepper;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });

const { t } = useJseI18n();
const activeStep = ref(0);

const steps = computed(() =>
  props.element.elements.filter((child): child is Step => child.elementKind === "Step"),
);

const activeStepElement = computed(
  () => steps.value[activeStep.value] ?? steps.value[0],
);

const isFirst = computed(() => activeStep.value <= 0);
const isLast = computed(() => activeStep.value >= steps.value.length - 1);

function goToStep(index: number) {
  if (index < 0 || index >= steps.value.length) return;
  activeStep.value = index;
}

function previousStep() {
  goToStep(activeStep.value - 1);
}

function nextStep() {
  goToStep(activeStep.value + 1);
}
</script>

<template>
  <div class="jse-stepper">
    <ol class="jse-stepper__steps" role="list">
      <li
        v-for="(step, index) in steps"
        :key="index"
        class="jse-stepper__step-indicator"
        :class="{
          'jse-stepper__step-indicator--active': index === activeStep,
          'jse-stepper__step-indicator--done': index < activeStep,
        }"
      >
        <button
          type="button"
          class="jse-stepper__step-button"
          :aria-current="index === activeStep ? 'step' : undefined"
          @click="goToStep(index)"
        >
          <span class="jse-stepper__step-number">{{ index + 1 }}</span>
          <span class="jse-stepper__step-label">{{ step.label ?? t("stepper.step", { index: index + 1 }) }}</span>
        </button>
      </li>
    </ol>

    <div v-if="activeStepElement" class="jse-stepper__panel">
      <UiFormElementResolver
        v-for="(child, index) in activeStepElement.elements"
        :key="buildUiElementKey(`step-${activeStep}`, child, index)"
        v-model="data"
        :element="child"
        :schema="schema"
        :document="document"
        :readonly="readonly"
      />
    </div>

    <div v-if="steps.length > 1" class="jse-stepper__nav">
      <JseButton type="button" :disabled="isFirst || readonly" @click="previousStep">
        {{ t("stepper.back") }}
      </JseButton>
      <JseButton type="button" :disabled="isLast || readonly" @click="nextStep">
        {{ t("stepper.next") }}
      </JseButton>
    </div>
  </div>
</template>
