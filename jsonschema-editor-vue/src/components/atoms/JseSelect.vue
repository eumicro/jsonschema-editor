<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  disabled?: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [value: string | number] }>();

function parseSelectValue(raw: string): string | number {
  if (raw !== "" && !Number.isNaN(Number(raw)) && /^\d+$/.test(raw)) {
    return Number(raw);
  }
  return raw;
}

function emitValue(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit("update:modelValue", parseSelectValue(target.value));
}
</script>

<template>
  <select
    class="jse-select"
    :value="modelValue"
    :disabled="disabled"
        @change="emitValue($event)"
  >
    <slot />
  </select>
</template>
