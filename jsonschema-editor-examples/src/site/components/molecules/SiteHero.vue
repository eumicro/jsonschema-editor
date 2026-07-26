<script setup lang="ts">
defineProps<{
  tagline: string;
  subtitle: string;
}>();
</script>

<template>
  <section class="app__hero">
    <p class="app__tagline">{{ tagline }}</p>
    <p class="app__subtitle">{{ subtitle }}</p>
  </section>
</template>
