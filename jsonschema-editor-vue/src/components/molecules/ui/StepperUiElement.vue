<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import {
  resolveStepIndicatorLabel,
  resolveUiI18nString,
  type Step,
  type Stepper,
} from "@jsonschema-editor/ui-schema";
import JseButton from "../../atoms/JseButton.vue";
import { useJseI18n } from "../../../composables/useJseI18n";
import { useStepperStepsDisplayMode } from "../../../composables/useStepperStepsDisplayMode";
import { buildUiElementKey } from "../../../utils/ui-element-key";
import UiFormElementResolver from "./UiFormElementResolver.vue";

const props = defineProps<{
  element: Stepper;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
  scopePrefix?: string;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });

const { t, te } = useJseI18n();

function stepLabel(step: Step, index: number): string {
  return (
    resolveUiI18nString(
      { i18n: step.i18n, defaultMessage: step.label, suffix: "label" },
      (key) => (te(key) ? t(key) : undefined),
    ) ?? t("stepper.step", { index: index + 1 })
  );
}
const activeStep = ref(0);

const steps = computed(() =>
  props.element.elements.filter((child): child is Step => child.elementKind === "Step"),
);

const stepsRef = ref<HTMLOListElement | null>(null);
const layoutWatchSource = computed(() => [steps.value.length, activeStep.value] as const);
const { displayMode } = useStepperStepsDisplayMode(stepsRef, layoutWatchSource);

function stepIndicatorLabel(step: Step, index: number): string | undefined {
  const fullLabel = stepLabel(step, index);
  return resolveStepIndicatorLabel(displayMode.value, fullLabel, index === activeStep.value);
}

const activeStepElement = computed(
  () => steps.value[activeStep.value] ?? steps.value[0],
);

const isFirst = computed(() => activeStep.value <= 0);
const isLast = computed(() => activeStep.value >= steps.value.length - 1);

function scrollActiveStepIntoView() {
  void nextTick(() => {
    stepsRef.value
      ?.querySelector<HTMLElement>(".jse-stepper__step-indicator--active")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

function goToStep(index: number) {
  if (index < 0 || index >= steps.value.length) return;
  activeStep.value = index;
  scrollActiveStepIntoView();
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
    <ol
      ref="stepsRef"
      class="jse-stepper__steps"
      :class="`jse-stepper__steps--${displayMode}`"
      role="list"
    >
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
          :aria-label="`${index + 1}. ${stepLabel(step, index)}`"
          :title="stepLabel(step, index)"
          @click="goToStep(index)"
        >
          <span class="jse-stepper__step-number">{{ index + 1 }}</span>
          <span v-if="stepIndicatorLabel(step, index)" class="jse-stepper__step-label">
            {{ stepIndicatorLabel(step, index) }}
          </span>
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
        :scope-prefix="scopePrefix"
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
