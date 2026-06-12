<script setup lang="ts">
defineProps<{
  label: string;
  description?: string;
  boolean?: boolean;
}>();
</script>

<template>
  <div class="jse-field">
    <label class="jse-field__label">
      <template v-if="boolean">
        <slot />
        {{ label }}
      </template>
      <template v-else>
        {{ label }}
      </template>
      <span v-if="description" class="jse-field__hint">{{ description }}</span>
    </label>
    <slot v-if="!boolean" />
  </div>
</template>
