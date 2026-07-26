<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  type?: string;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
}>();

defineEmits<{ "update:modelValue": [value: string | number] }>();
</script>

<template>
  <input
    class="jse-input"
    :value="modelValue"
    :type="type ?? 'text'"
    :disabled="disabled"
    :readonly="readonly"
    :placeholder="placeholder"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
