<script setup lang="ts">
import { useJseI18n } from "../../composables/useJseI18n";

defineProps<{
  active?: boolean;
  label?: string;
}>();

defineEmits<{
  dragover: [event: DragEvent];
  dragleave: [];
  drop: [event: DragEvent];
}>();

const { t } = useJseI18n();
</script>

<template>
  <div
    class="jse-layout-dropzone"
    :class="{ 'jse-layout-dropzone--active': active }"
    role="presentation"
    @dragover.prevent="$emit('dragover', $event)"
    @dragleave="$emit('dragleave')"
    @drop.prevent="$emit('drop', $event)"
  >
    <span v-if="active" class="jse-layout-dropzone__label">{{ label ?? t("layout.dropHere") }}</span>
  </div>
</template>
