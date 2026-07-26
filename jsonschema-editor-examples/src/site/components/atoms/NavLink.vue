<script setup lang="ts">
defineProps<{
  href: string;
  active?: boolean;
  label: string;
}>();

const emit = defineEmits<{
  navigate: [];
}>();
</script>

<template>
  <a
    :href="href"
    class="app__topnav-link"
    :class="{ 'app__topnav-link--active': active }"
    :aria-current="active ? 'page' : undefined"
    @click.prevent="emit('navigate')"
  >
    {{ label }}
  </a>
</template>
