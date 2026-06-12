<script setup lang="ts">
defineProps<{
  label: string;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
}>();

defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <button
    type="button"
    class="jse-icon-btn"
    :class="{
      'jse-icon-btn--primary': variant === 'primary',
      'jse-icon-btn--danger': variant === 'danger',
    }"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot>+</slot>
  </button>
</template>
