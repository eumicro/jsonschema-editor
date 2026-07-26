<script setup lang="ts">
import type { AppLocale } from "../../../app-routing";
import { categoryLabelFor } from "../../i18n/app-ui";
import {
  exampleCopyFor,
  examplesByCategory,
  type ExampleCategory,
  type ExampleId,
  type ExampleManifest,
} from "../../../examples/catalog";

defineProps<{
  locale: AppLocale;
  scenariosHeading: string;
  visibleCategories: ExampleCategory[];
  activeExampleId: ExampleId;
  exampleHref: (id: ExampleId) => string;
}>();

const emit = defineEmits<{
  selectExample: [id: ExampleId];
}>();

function copy(entry: ExampleManifest, locale: AppLocale) {
  return exampleCopyFor(entry, locale);
}
</script>

<template>
  <aside class="app__sidebar" :aria-label="scenariosHeading">
    <h2 class="app__sidebar-heading">{{ scenariosHeading }}</h2>
    <nav v-for="category in visibleCategories" :key="category" class="app__nav-group">
      <h3 class="app__nav-group-title">{{ categoryLabelFor(locale, category) }}</h3>
      <ul class="app__nav-list">
        <li v-for="entry in examplesByCategory[category]" :key="entry.id">
          <a
            :href="exampleHref(entry.id)"
            class="app__nav-item"
            :class="{ 'app__nav-item--active': activeExampleId === entry.id }"
            :aria-current="activeExampleId === entry.id ? 'page' : undefined"
            @click.prevent="emit('selectExample', entry.id)"
          >
            <span class="app__nav-item-label">{{ copy(entry, locale).label }}</span>
            <span class="app__nav-item-tagline">{{ copy(entry, locale).tagline }}</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>
