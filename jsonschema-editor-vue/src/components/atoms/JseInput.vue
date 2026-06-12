<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  type?: string;
  disabled?: boolean;
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
    :placeholder="placeholder"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
