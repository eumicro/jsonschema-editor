<script setup lang="ts">
defineProps<{
  copyright: string;
  imprintLabel: string;
  imprintHref: string;
  imprintActive?: boolean;
}>();

const emit = defineEmits<{
  openImprint: [];
}>();
</script>

<template>
  <footer class="app__footer">
    <p class="app__footer-copy">{{ copyright }}</p>
    <a
      :href="imprintHref"
      class="app__footer-link"
      :aria-current="imprintActive ? 'page' : undefined"
      @click.prevent="emit('openImprint')"
    >
      {{ imprintLabel }}
    </a>
  </footer>
</template>
