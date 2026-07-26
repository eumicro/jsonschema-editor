<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  DEFAULT_RATING_COLOR,
  DEFAULT_RATING_COLOR_HIGH,
  DEFAULT_RATING_COLOR_LOW,
  DEFAULT_RATING_COLOR_MID,
  DEFAULT_RATING_SYMBOL,
  isCssHexColor,
  isRatingExtensionConfig,
  isRatingSymbolGlyph,
  resolveRatingSymbolGlyph,
  RATING_SYMBOL_PALETTE,
  type RatingColorMode,
  type RatingExtensionConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput, useJseI18n } from "@jsonschema-editor/vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const { t } = useJseI18n();
const modelValue = defineModel<unknown>();

interface DraftConfig {
  symbol: string;
  step: number;
  colorMode: RatingColorMode;
  color: string;
  colorLow: string;
  colorMid: string;
  colorHigh: string;
}

function readDraft(value: unknown): DraftConfig {
  const base: RatingExtensionConfig =
    value === true
      ? {}
      : isRatingExtensionConfig(value) && value !== true
        ? value
        : {};
  return {
    symbol: resolveRatingSymbolGlyph(base.symbol, base.character),
    step: base.step && base.step > 0 ? base.step : 1,
    colorMode: base.colorMode === "solid" ? "solid" : "gradient",
    color: isCssHexColor(base.color) ? base.color : DEFAULT_RATING_COLOR,
    colorLow: isCssHexColor(base.colorLow) ? base.colorLow : DEFAULT_RATING_COLOR_LOW,
    colorMid: isCssHexColor(base.colorMid) ? base.colorMid : DEFAULT_RATING_COLOR_MID,
    colorHigh: isCssHexColor(base.colorHigh) ? base.colorHigh : DEFAULT_RATING_COLOR_HIGH,
  };
}

function toStored(draft: DraftConfig): RatingExtensionConfig {
  const stored: RatingExtensionConfig = {
    symbol: draft.symbol || DEFAULT_RATING_SYMBOL,
    step: draft.step,
    colorMode: draft.colorMode,
  };
  if (draft.colorMode === "solid") {
    stored.color = draft.color;
  } else {
    stored.colorLow = draft.colorLow;
    stored.colorMid = draft.colorMid;
    stored.colorHigh = draft.colorHigh;
  }
  return stored;
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
  () => modelValue.value === true || isRatingExtensionConfig(modelValue.value),
);

const isGradient = computed(() => draft.value.colorMode === "gradient");
const palette = RATING_SYMBOL_PALETTE;

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
  patch({ step: Number.isFinite(parsed) && parsed > 0 ? parsed : 1 });
}

function onColor(key: "color" | "colorLow" | "colorMid" | "colorHigh", raw: string): void {
  if (!isCssHexColor(raw)) return;
  patch({ [key]: raw.toLowerCase() });
}

function selectSymbol(glyph: string): void {
  patch({ symbol: glyph });
}

function onCustomSymbol(raw: string | number): void {
  const text = String(raw ?? "").trim();
  if (!text) {
    patch({ symbol: DEFAULT_RATING_SYMBOL });
    return;
  }
  if (!isRatingSymbolGlyph(text)) return;
  patch({ symbol: resolveRatingSymbolGlyph(text) });
}
</script>

<template>
  <div class="jse-rating-attr">
    <label class="jse-rating-attr__label">{{ label }}</label>

    <label class="jse-rating-attr__enable">
      <input
        type="checkbox"
        :checked="enabled"
        :disabled="readonly"
        @change="setEnabled(($event.target as HTMLInputElement).checked)"
      />
      <span>{{ t("schemaAttributes.extensionEnabled") }}</span>
    </label>

    <div class="jse-rating-attr__field">
      <span class="jse-rating-attr__field-label">{{ t("schemaAttributes.x-rating.symbolPalette") }}</span>
      <div
        class="jse-rating-attr__palette"
        role="listbox"
        :aria-label="t('schemaAttributes.x-rating.symbolPalette')"
      >
        <button
          v-for="glyph in palette"
          :key="glyph"
          type="button"
          class="jse-rating-attr__symbol-option"
          :class="{ 'jse-rating-attr__symbol-option--active': draft.symbol === glyph }"
          role="option"
          :aria-selected="draft.symbol === glyph"
          :title="glyph"
          :disabled="readonly || !enabled"
          @click="selectSymbol(glyph)"
        >
          {{ glyph }}
        </button>
      </div>
    </div>

    <label class="jse-rating-attr__field">
      <span class="jse-rating-attr__field-label">{{ t("schemaAttributes.x-rating.customSymbol") }}</span>
      <div class="jse-rating-attr__selected-row">
        <span class="jse-rating-attr__selected-preview" aria-hidden="true">{{ draft.symbol }}</span>
        <JseInput
          class="jse-rating-attr__input"
          type="text"
          :model-value="draft.symbol"
          :disabled="readonly || !enabled"
          :placeholder="t('schemaAttributes.x-rating.customSymbolPlaceholder')"
          @update:model-value="onCustomSymbol"
        />
      </div>
    </label>

    <label class="jse-rating-attr__field">
      <span class="jse-rating-attr__field-label">step</span>
      <JseInput
        class="jse-rating-attr__input"
        type="number"
        :model-value="draft.step"
        :disabled="readonly || !enabled"
        :min="0.1"
        :step="0.5"
        @update:model-value="onStep"
      />
    </label>

    <label class="jse-rating-attr__field">
      <span class="jse-rating-attr__field-label">colorMode</span>
      <select
        class="jse-rating-attr__select"
        :value="draft.colorMode"
        :disabled="readonly || !enabled"
        @change="patch({ colorMode: ($event.target as HTMLSelectElement).value as RatingColorMode })"
      >
        <option value="gradient">gradient</option>
        <option value="solid">solid</option>
      </select>
    </label>

    <label v-if="!isGradient" class="jse-rating-attr__color">
      <span class="jse-rating-attr__field-label">color</span>
      <div class="jse-rating-attr__color-row">
        <input
          class="jse-rating-attr__swatch"
          type="color"
          :value="draft.color"
          :disabled="readonly || !enabled"
          @input="onColor('color', ($event.target as HTMLInputElement).value)"
        />
        <JseInput
          class="jse-rating-attr__input"
          type="text"
          :model-value="draft.color"
          :disabled="readonly || !enabled"
          @update:model-value="onColor('color', String($event ?? ''))"
        />
      </div>
    </label>

    <template v-else>
      <label class="jse-rating-attr__color">
        <span class="jse-rating-attr__field-label">colorLow</span>
        <div class="jse-rating-attr__color-row">
          <input
            class="jse-rating-attr__swatch"
            type="color"
            :value="draft.colorLow"
            :disabled="readonly || !enabled"
            @input="onColor('colorLow', ($event.target as HTMLInputElement).value)"
          />
          <JseInput
            class="jse-rating-attr__input"
            type="text"
            :model-value="draft.colorLow"
            :disabled="readonly || !enabled"
            @update:model-value="onColor('colorLow', String($event ?? ''))"
          />
        </div>
      </label>
      <label class="jse-rating-attr__color">
        <span class="jse-rating-attr__field-label">colorMid</span>
        <div class="jse-rating-attr__color-row">
          <input
            class="jse-rating-attr__swatch"
            type="color"
            :value="draft.colorMid"
            :disabled="readonly || !enabled"
            @input="onColor('colorMid', ($event.target as HTMLInputElement).value)"
          />
          <JseInput
            class="jse-rating-attr__input"
            type="text"
            :model-value="draft.colorMid"
            :disabled="readonly || !enabled"
            @update:model-value="onColor('colorMid', String($event ?? ''))"
          />
        </div>
      </label>
      <label class="jse-rating-attr__color">
        <span class="jse-rating-attr__field-label">colorHigh</span>
        <div class="jse-rating-attr__color-row">
          <input
            class="jse-rating-attr__swatch"
            type="color"
            :value="draft.colorHigh"
            :disabled="readonly || !enabled"
            @input="onColor('colorHigh', ($event.target as HTMLInputElement).value)"
          />
          <JseInput
            class="jse-rating-attr__input"
            type="text"
            :model-value="draft.colorHigh"
            :disabled="readonly || !enabled"
            @update:model-value="onColor('colorHigh', String($event ?? ''))"
          />
        </div>
      </label>
    </template>

    <p class="jse-rating-attr__hint">
      {{ t("schemaAttributes.x-rating.hint") }}
    </p>
  </div>
</template>

<style scoped>
.jse-rating-attr {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.jse-rating-attr__label {
  font-weight: 600;
}

.jse-rating-attr__enable {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.jse-rating-attr__field,
.jse-rating-attr__color {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.jse-rating-attr__field-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.jse-rating-attr__palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(2.25rem, 1fr));
  gap: 0.3rem;
  max-height: 11rem;
  overflow: auto;
  padding: 0.4rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.45rem;
  background: #f8fafc;
}

.jse-rating-attr__symbol-option {
  appearance: none;
  min-width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 0.35rem;
  background: #fff;
  font-size: 1.15rem;
  line-height: 1;
  cursor: pointer;
}

.jse-rating-attr__symbol-option--active {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb;
  background: #eff6ff;
}

.jse-rating-attr__selected-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jse-rating-attr__selected-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.4rem;
  background: #fff;
  font-size: 1.35rem;
}

.jse-rating-attr__color-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jse-rating-attr__swatch {
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  background: transparent;
  cursor: pointer;
}

.jse-rating-attr__hint {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.75;
}
</style>
