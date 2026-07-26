<script setup lang="ts">
import { computed, useId } from "vue";

export interface JseSuggestionOption {
  value: string;
  label?: string;
}

const props = defineProps<{
  modelValue?: string;
  suggestions?: readonly JseSuggestionOption[];
  disabled?: boolean;
  placeholder?: string;
  listId?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const generatedId = useId();
const datalistId = computed(() => props.listId ?? `jse-suggestions-${generatedId}`);
</script>

<template>
  <div class="jse-suggestion-input">
    <input
      class="jse-input jse-suggestion-input__field"
      type="text"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="Boolean(suggestions?.length)"
      :list="datalistId"
      :value="modelValue ?? ''"
      :disabled="disabled"
      :placeholder="placeholder"
      autocomplete="off"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <datalist :id="datalistId">
      <option
        v-for="option in suggestions ?? []"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label ?? option.value }}
      </option>
    </datalist>
  </div>
</template>
