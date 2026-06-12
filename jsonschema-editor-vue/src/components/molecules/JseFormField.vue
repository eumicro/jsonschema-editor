<script setup lang="ts">
import JseLabel from "../atoms/JseLabel.vue";

defineProps<{
  label?: string;
  boolean?: boolean;
}>();
</script>

<template>
  <div
    class="jse-attribute-control"
    :class="{ 'jse-attribute-control--boolean': boolean }"
  >
    <template v-if="boolean">
      <slot />
      <slot name="label">
        <JseLabel v-if="label">{{ label }}</JseLabel>
      </slot>
    </template>
    <template v-else>
      <slot name="label">
        <JseLabel v-if="label">{{ label }}</JseLabel>
      </slot>
      <slot />
    </template>
  </div>
</template>
