<script setup lang="ts">
defineProps<{
  forId?: string;
  hint?: string;
}>();
</script>

<template>
  <label class="jse-label" :for="forId">
    <span class="jse-label__text"><slot /></span>
    <span v-if="hint" class="jse-label__hint">{{ hint }}</span>
  </label>
</template>
