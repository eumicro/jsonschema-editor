<script setup lang="ts">
defineProps<{
  active?: boolean;
  label?: string;
}>();

defineEmits<{
  dragover: [event: DragEvent];
  dragleave: [];
  drop: [event: DragEvent];
}>();
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
    <span v-if="active" class="jse-layout-dropzone__label">{{ label ?? "Hier ablegen" }}</span>
  </div>
</template>
