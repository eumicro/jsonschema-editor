<script setup lang="ts">
defineProps<{
  modelValue?: string;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
}>();

defineEmits<{ "update:modelValue": [value: string] }>();
</script>

<template>
  <textarea
    class="jse-textarea"
    :value="modelValue"
    :rows="rows ?? 3"
    :disabled="disabled"
    :placeholder="placeholder"
    spellcheck="false"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
