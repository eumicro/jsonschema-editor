<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  DEFAULT_PROGRESS_BAR_COLOR,
  DEFAULT_PROGRESS_BAR_COLOR_HIGH,
  DEFAULT_PROGRESS_BAR_COLOR_LOW,
  DEFAULT_PROGRESS_BAR_COLOR_MID,
  isCssHexColor,
  isProgressBarExtensionConfig,
  type ProgressBarColorMode,
  type ProgressBarExtensionConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput, useJseI18n } from "@jsonschema-editor/vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const { t } = useJseI18n();
const modelValue = defineModel<unknown>();

interface DraftConfig {
  step: number;
  colorMode: ProgressBarColorMode;
  color: string;
  colorLow: string;
  colorMid: string;
  colorHigh: string;
}

function readDraft(value: unknown): DraftConfig {
  const base: ProgressBarExtensionConfig =
    value === true
      ? {}
      : isProgressBarExtensionConfig(value) && value !== true
        ? value
        : {};
  return {
    step: base.step && base.step > 0 ? base.step : 0.1,
    colorMode: base.colorMode === "solid" ? "solid" : "gradient",
    color: isCssHexColor(base.color) ? base.color : DEFAULT_PROGRESS_BAR_COLOR,
    colorLow: isCssHexColor(base.colorLow) ? base.colorLow : DEFAULT_PROGRESS_BAR_COLOR_LOW,
    colorMid: isCssHexColor(base.colorMid) ? base.colorMid : DEFAULT_PROGRESS_BAR_COLOR_MID,
    colorHigh: isCssHexColor(base.colorHigh) ? base.colorHigh : DEFAULT_PROGRESS_BAR_COLOR_HIGH,
  };
}

function toStored(draft: DraftConfig): ProgressBarExtensionConfig {
  if (draft.colorMode === "solid") {
    return {
      step: draft.step,
      colorMode: "solid",
      color: draft.color,
    };
  }
  return {
    step: draft.step,
    colorMode: "gradient",
    colorLow: draft.colorLow,
    colorMid: draft.colorMid,
    colorHigh: draft.colorHigh,
  };
}

const draft = ref(readDraft(modelValue.value));

watch(
  modelValue,
  (value) => {
    draft.value = readDraft(value);
  },
  { immediate: true },
);

const enabled = computed(
  () =>
    modelValue.value === true ||
    isProgressBarExtensionConfig(modelValue.value),
);

const isGradient = computed(() => draft.value.colorMode === "gradient");

function setEnabled(next: boolean): void {
  if (!next) {
    modelValue.value = undefined;
    return;
  }
  modelValue.value = toStored(draft.value);
}

function commit(next: DraftConfig): void {
  draft.value = next;
  if (!enabled.value) return;
  modelValue.value = toStored(next);
}

function patch(partial: Partial<DraftConfig>): void {
  commit({ ...draft.value, ...partial });
}

function onStep(raw: string | number): void {
  const parsed = typeof raw === "number" ? raw : Number(raw);
  patch({ step: Number.isFinite(parsed) && parsed > 0 ? parsed : 0.1 });
}

function onColor(key: "color" | "colorLow" | "colorMid" | "colorHigh", raw: string): void {
  if (!isCssHexColor(raw)) return;
  patch({ [key]: raw.toLowerCase() });
}
</script>

<template>
  <div class="jse-progress-bar-attr">
    <label class="jse-progress-bar-attr__label">{{ label }}</label>

    <label class="jse-progress-bar-attr__enable">
      <input
        type="checkbox"
        :checked="enabled"
        :disabled="readonly"
        @change="setEnabled(($event.target as HTMLInputElement).checked)"
      />
      <span>{{ t("schemaAttributes.extensionEnabled") }}</span>
    </label>

    <label class="jse-progress-bar-attr__field">
      <span class="jse-progress-bar-attr__field-label">step</span>
      <JseInput
        :model-value="draft.step"
        class="jse-progress-bar-attr__input"
        type="number"
        :disabled="readonly || !enabled"
        @update:model-value="onStep"
      />
    </label>

    <label class="jse-progress-bar-attr__field">
      <span class="jse-progress-bar-attr__field-label">colorMode</span>
      <select
        class="jse-progress-bar-attr__select"
        :value="draft.colorMode"
        :disabled="readonly || !enabled"
        @change="
          patch({
            colorMode: ($event.target as HTMLSelectElement).value as ProgressBarColorMode,
          })
        "
      >
        <option value="gradient">gradient</option>
        <option value="solid">solid</option>
      </select>
    </label>

    <label v-if="!isGradient" class="jse-progress-bar-attr__color">
      <span class="jse-progress-bar-attr__field-label">color</span>
      <div class="jse-progress-bar-attr__color-row">
        <input
          type="color"
          class="jse-progress-bar-attr__swatch"
          :value="draft.color"
          :disabled="readonly || !enabled"
          @input="onColor('color', ($event.target as HTMLInputElement).value)"
        />
        <JseInput
          :model-value="draft.color"
          class="jse-progress-bar-attr__input"
          :disabled="readonly || !enabled"
          @update:model-value="onColor('color', String($event))"
        />
      </div>
    </label>

    <template v-else>
      <label class="jse-progress-bar-attr__color">
        <span class="jse-progress-bar-attr__field-label">colorLow</span>
        <div class="jse-progress-bar-attr__color-row">
          <input
            type="color"
            class="jse-progress-bar-attr__swatch"
            :value="draft.colorLow"
            :disabled="readonly || !enabled"
            @input="onColor('colorLow', ($event.target as HTMLInputElement).value)"
          />
          <JseInput
            :model-value="draft.colorLow"
            class="jse-progress-bar-attr__input"
            :disabled="readonly || !enabled"
            @update:model-value="onColor('colorLow', String($event))"
          />
        </div>
      </label>
      <label class="jse-progress-bar-attr__color">
        <span class="jse-progress-bar-attr__field-label">colorMid</span>
        <div class="jse-progress-bar-attr__color-row">
          <input
            type="color"
            class="jse-progress-bar-attr__swatch"
            :value="draft.colorMid"
            :disabled="readonly || !enabled"
            @input="onColor('colorMid', ($event.target as HTMLInputElement).value)"
          />
          <JseInput
            :model-value="draft.colorMid"
            class="jse-progress-bar-attr__input"
            :disabled="readonly || !enabled"
            @update:model-value="onColor('colorMid', String($event))"
          />
        </div>
      </label>
      <label class="jse-progress-bar-attr__color">
        <span class="jse-progress-bar-attr__field-label">colorHigh</span>
        <div class="jse-progress-bar-attr__color-row">
          <input
            type="color"
            class="jse-progress-bar-attr__swatch"
            :value="draft.colorHigh"
            :disabled="readonly || !enabled"
            @input="onColor('colorHigh', ($event.target as HTMLInputElement).value)"
          />
          <JseInput
            :model-value="draft.colorHigh"
            class="jse-progress-bar-attr__input"
            :disabled="readonly || !enabled"
            @update:model-value="onColor('colorHigh', String($event))"
          />
        </div>
      </label>
    </template>

    <p class="jse-progress-bar-attr__hint">
      {{ t("schemaAttributes.x-progress-bar.hint") }}
    </p>
  </div>
</template>

<style scoped>
.jse-progress-bar-attr {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.jse-progress-bar-attr__label {
  font-weight: 600;
}

.jse-progress-bar-attr__enable {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.jse-progress-bar-attr__field,
.jse-progress-bar-attr__color {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.jse-progress-bar-attr__field-label {
  font-size: 0.9rem;
}

.jse-progress-bar-attr__select {
  width: 100%;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--jse-border, #c8c8c8);
  border-radius: 0.25rem;
  background: var(--jse-surface, #fff);
  font: inherit;
}

.jse-progress-bar-attr__color-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jse-progress-bar-attr__swatch {
  flex: 0 0 2.25rem;
  width: 2.25rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--jse-border, #c8c8c8);
  border-radius: 0.25rem;
  background: transparent;
  cursor: pointer;
}

.jse-progress-bar-attr__swatch:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.jse-progress-bar-attr__color-row .jse-progress-bar-attr__input {
  flex: 1 1 auto;
  min-width: 0;
}

.jse-progress-bar-attr__hint {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.85;
}
</style>
