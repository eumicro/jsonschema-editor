<script setup lang="ts">
defineProps<{
  href: string;
  brandPrefix: string;
  brandSuffix: string;
}>();

const emit = defineEmits<{
  navigate: [];
}>();
</script>

<template>
  <a
    :href="href"
    class="app__brand"
    aria-label="JSON Schema Editor"
    @click.prevent="emit('navigate')"
  >
    <span class="app__brand-prefix">{{ brandPrefix }}</span>
    <span class="app__brand-suffix">{{ brandSuffix }}</span>
  </a>
</template>
