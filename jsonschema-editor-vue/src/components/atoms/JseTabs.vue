<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  tabs: { id: string; label: string; description?: string }[];
  panelIdPrefix?: string;
}>();

defineEmits<{ "update:modelValue": [id: string] }>();

const prefix = computed(() => props.panelIdPrefix ?? "jse-tabpanel");

const activeDescription = computed(
  () => props.tabs.find((tab) => tab.id === props.modelValue)?.description,
);

function panelId(tabId: string) {
  return `${prefix.value}-${tabId}`;
}
</script>

<template>
  <div class="jse-tabs-wrap">
    <div class="jse-tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="jse-tabs__tab"
        :class="{ 'jse-tabs__tab--active': modelValue === tab.id }"
        :aria-selected="modelValue === tab.id"
        :aria-controls="panelId(tab.id)"
        :id="`${prefix}-tab-${tab.id}`"
        @click="$emit('update:modelValue', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
    <p v-if="activeDescription" class="jse-tabs__description">
      {{ activeDescription }}
    </p>
  </div>
</template>
