<script setup lang="ts">
import type { AppStack } from "../../../app-routing";

defineProps<{
  /** Accessible name for the stack switcher nav. */
  switchAriaLabel: string;
  ownedStack: AppStack;
  vueHref: string;
  reactHref: string;
}>();

const emit = defineEmits<{
  select: [stack: AppStack];
}>();
</script>

<template>
  <nav class="app__stack-switch" :aria-label="switchAriaLabel">
    <a
      :href="vueHref"
      class="app__stack-switch-link"
      :class="{ 'app__stack-switch-link--active': ownedStack === 'vue' }"
      :aria-current="ownedStack === 'vue' ? 'page' : undefined"
      @click="
        (event) => {
          if (ownedStack === 'vue') event.preventDefault();
          else emit('select', 'vue');
        }
      "
    >
      Vue
    </a>
    <a
      :href="reactHref"
      class="app__stack-switch-link"
      :class="{ 'app__stack-switch-link--active': ownedStack === 'react' }"
      :aria-current="ownedStack === 'react' ? 'page' : undefined"
      @click="
        (event) => {
          if (ownedStack === 'react') event.preventDefault();
          else emit('select', 'react');
        }
      "
    >
      React
    </a>
  </nav>
</template>
