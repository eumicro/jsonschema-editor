<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  DEFAULT_GEOMETRY_STYLE_URL,
  isGeometryExtensionConfig,
  normalizeGeometryConfig,
  type GeometryExtensionConfig,
  type NormalizedGeometryConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput, JseSelect } from "@jsonschema-editor/vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const modelValue = defineModel<unknown>();

type CountMode = "range" | "exact";

function readConfig(value: unknown): NormalizedGeometryConfig {
  return isGeometryExtensionConfig(value) ? normalizeGeometryConfig(value) : normalizeGeometryConfig();
}

function toStoredConfig(
  draft: NormalizedGeometryConfig,
  countMode: CountMode,
): GeometryExtensionConfig {
  const base: GeometryExtensionConfig = {
    styleUrl: draft.styleUrl,
    point: draft.point,
    line: draft.line,
    polygon: draft.polygon,
  };

  if (countMode === "exact") {
    return { ...base, exactObjects: draft.maxObjects };
  }

  return {
    ...base,
    minObjects: draft.minObjects,
    maxObjects: draft.maxObjects,
  };
}

const draft = ref<NormalizedGeometryConfig>(readConfig(modelValue.value));
const countMode = ref<CountMode>(
  readConfig(modelValue.value).exactObjects !== undefined ? "exact" : "range",
);

watch(
  modelValue,
  (value) => {
    draft.value = readConfig(value);
    countMode.value = readConfig(value).exactObjects !== undefined ? "exact" : "range";
  },
  { immediate: true },
);

const atLeastOneType = computed(() => draft.value.point || draft.value.line || draft.value.polygon);

function commit(): void {
  if (!atLeastOneType.value) return;
  modelValue.value = toStoredConfig(draft.value, countMode.value);
}

function setCountMode(mode: CountMode): void {
  countMode.value = mode;
  if (mode === "exact") {
    draft.value = {
      ...draft.value,
      minObjects: draft.value.maxObjects,
      exactObjects: draft.value.maxObjects,
    };
  } else {
    draft.value = {
      ...draft.value,
      exactObjects: undefined,
      minObjects: Math.min(draft.value.minObjects, draft.value.maxObjects),
    };
  }
  commit();
}

function updateStyleUrl(value: string | number): void {
  draft.value = { ...draft.value, styleUrl: String(value) || DEFAULT_GEOMETRY_STYLE_URL };
  commit();
}

function toggleType(key: "point" | "line" | "polygon", enabled: boolean): void {
  draft.value = { ...draft.value, [key]: enabled };
  commit();
}

function updateMin(value: string | number): void {
  const minObjects = Math.max(0, Number(value) || 0);
  draft.value = {
    ...draft.value,
    minObjects: Math.min(minObjects, draft.value.maxObjects),
    exactObjects: undefined,
  };
  commit();
}

function updateMax(value: string | number): void {
  const maxObjects = Math.max(0, Number(value) || 0);
  draft.value = {
    ...draft.value,
    maxObjects,
    minObjects: Math.min(draft.value.minObjects, maxObjects),
    exactObjects: undefined,
  };
  commit();
}

function updateExact(value: string | number): void {
  const exactObjects = Math.max(0, Number(value) || 0);
  draft.value = {
    ...draft.value,
    minObjects: exactObjects,
    maxObjects: exactObjects,
    exactObjects,
  };
  commit();
}
</script>

<template>
  <fieldset class="jse-geometry-attr">
    <legend>{{ label }}</legend>

    <label class="jse-geometry-attr__row">
      <span>styleUrl</span>
      <JseInput
        class="jse-field__input"
        :model-value="draft.styleUrl"
        :disabled="readonly"
        @update:model-value="updateStyleUrl"
      />
    </label>

    <label class="jse-geometry-attr__check">
      <input
        type="checkbox"
        :checked="draft.point"
        :disabled="readonly"
        @change="toggleType('point', ($event.target as HTMLInputElement).checked)"
      />
      Punkt
    </label>

    <label class="jse-geometry-attr__check">
      <input
        type="checkbox"
        :checked="draft.line"
        :disabled="readonly"
        @change="toggleType('line', ($event.target as HTMLInputElement).checked)"
      />
      Linie
    </label>

    <label class="jse-geometry-attr__check">
      <input
        type="checkbox"
        :checked="draft.polygon"
        :disabled="readonly"
        @change="toggleType('polygon', ($event.target as HTMLInputElement).checked)"
      />
      Polygon
    </label>

    <label class="jse-geometry-attr__row">
      <span>Anzahl-Modus</span>
      <JseSelect
        :model-value="countMode"
        class="jse-field__input"
        :disabled="readonly"
        @update:model-value="(value) => setCountMode(String(value) as CountMode)"
      >
        <option value="range">Bereich (min–max)</option>
        <option value="exact">Exakt</option>
      </JseSelect>
    </label>

    <template v-if="countMode === 'range'">
      <label class="jse-geometry-attr__row">
        <span>minObjects</span>
        <JseInput
          class="jse-field__input"
          type="number"
          :model-value="draft.minObjects"
          :disabled="readonly"
          @update:model-value="updateMin"
        />
      </label>
      <label class="jse-geometry-attr__row">
        <span>maxObjects</span>
        <JseInput
          class="jse-field__input"
          type="number"
          :model-value="draft.maxObjects"
          :disabled="readonly"
          @update:model-value="updateMax"
        />
      </label>
    </template>

    <label v-else class="jse-geometry-attr__row">
      <span>exactObjects</span>
      <JseInput
        class="jse-field__input"
        type="number"
        :model-value="draft.maxObjects"
        :disabled="readonly"
        @update:model-value="updateExact"
      />
    </label>

    <p v-if="!atLeastOneType" class="jse-field__hint jse-field__hint--error">
      Mindestens ein Geometrietyp muss aktiv sein.
    </p>
  </fieldset>
</template>

<style scoped>
.jse-geometry-attr {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--jse-border, #c8c8c8);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  margin: 0;
}

.jse-geometry-attr legend {
  padding: 0 0.25rem;
  font-weight: 600;
}

.jse-geometry-attr__row {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 0.5rem;
  align-items: center;
}

.jse-geometry-attr__check {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
