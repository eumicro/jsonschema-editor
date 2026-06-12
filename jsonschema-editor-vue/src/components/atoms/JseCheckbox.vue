<script setup lang="ts">
defineProps<{
  modelValue?: boolean;
  disabled?: boolean;
  id?: string;
}>();

defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>

<template>
  <input
    :id="id"
    class="jse-checkbox"
    type="checkbox"
    :checked="modelValue"
    :disabled="disabled"
    @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
  />
</template>
