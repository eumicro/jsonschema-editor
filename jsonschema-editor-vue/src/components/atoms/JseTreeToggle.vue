<script setup lang="ts">
defineProps<{
  expanded?: boolean;
  hasChildren?: boolean;
}>();

defineEmits<{ toggle: [] }>();
</script>

<template>
  <button
    v-if="hasChildren"
    type="button"
    class="jse-tree-node__toggle"
    :aria-label="expanded ? 'Einklappen' : 'Ausklappen'"
    :aria-expanded="hasChildren ? expanded : undefined"
    @click.stop="$emit('toggle')"
  >
    {{ expanded ? "▼" : "▶" }}
  </button>
  <span v-else class="jse-tree-node__spacer" :aria-hidden="true" />
</template>
