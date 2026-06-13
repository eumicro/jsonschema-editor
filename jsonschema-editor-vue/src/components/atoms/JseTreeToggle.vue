<script setup lang="ts">
import { useJseI18n } from "../../composables/useJseI18n";

defineProps<{
  expanded?: boolean;
  hasChildren?: boolean;
}>();

defineEmits<{ toggle: [] }>();

const { t } = useJseI18n();
</script>

<template>
  <button
    v-if="hasChildren"
    type="button"
    class="jse-tree-node__toggle"
    :aria-label="expanded ? t('tree.toggle.collapse') : t('tree.toggle.expand')"
    :aria-expanded="hasChildren ? expanded : undefined"
    @click.stop="$emit('toggle')"
  >
    {{ expanded ? "▼" : "▶" }}
  </button>
  <span v-else class="jse-tree-node__spacer" :aria-hidden="true" />
</template>
