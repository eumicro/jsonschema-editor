<script setup lang="ts">
defineProps<{
  type?: "button" | "submit";
  variant?: "default" | "danger";
  disabled?: boolean;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
  <button
    class="jse-btn"
    :class="{ 'jse-btn--danger': variant === 'danger' }"
    :type="type ?? 'button'"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
