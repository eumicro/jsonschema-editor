<script setup lang="ts">
import { computed } from "vue";
import type { AppLocale } from "../../app-routing";
import { imprintFor } from "../i18n/imprint";
import { paragraphParts } from "../utils/linkify";

const props = defineProps<{
  locale: AppLocale;
}>();

const content = computed(() => imprintFor(props.locale));
</script>

<template>
  <article class="legal-page">
    <header class="legal-page__header">
      <h1 class="legal-page__title">{{ content.pageTitle }}</h1>
      <p class="legal-page__meta">
        {{ locale === "de" ? "Stand:" : "Last updated:" }} {{ content.lastUpdated }}
      </p>
      <p v-if="content.translationNote" class="legal-page__note">{{ content.translationNote }}</p>
    </header>

    <section
      v-for="section in content.sections"
      :key="section.id"
      class="legal-page__section"
      :aria-labelledby="`legal-${section.id}`"
    >
      <h2 :id="`legal-${section.id}`" class="legal-page__section-title">{{ section.title }}</h2>

      <p
        v-for="(paragraph, index) in section.paragraphs"
        :key="`${section.id}-p-${index}`"
        class="legal-page__paragraph"
      >
        <template
          v-for="(part, partIndex) in paragraphParts(paragraph)"
          :key="`${section.id}-p-${index}-${partIndex}`"
        >
          <a
            v-if="part.type === 'link'"
            :href="part.value"
            class="legal-page__link"
            rel="noopener noreferrer"
            target="_blank"
          >
            {{ part.value }}
          </a>
          <span v-else>{{ part.value }}</span>
        </template>
      </p>

      <ul v-if="section.list?.length" class="legal-page__list">
        <li v-for="(item, index) in section.list" :key="`${section.id}-l-${index}`">{{ item }}</li>
      </ul>

      <div
        v-for="subsection in section.subsections"
        :key="`${section.id}-${subsection.title}`"
        class="legal-page__subsection"
      >
        <h3 class="legal-page__subsection-title">{{ subsection.title }}</h3>
        <p
          v-for="(paragraph, index) in subsection.paragraphs"
          :key="`${section.id}-${subsection.title}-p-${index}`"
          class="legal-page__paragraph"
        >
          <template
            v-for="(part, partIndex) in paragraphParts(paragraph)"
            :key="`${section.id}-${subsection.title}-p-${index}-${partIndex}`"
          >
            <a
              v-if="part.type === 'link'"
              :href="part.value"
              class="legal-page__link"
              rel="noopener noreferrer"
              target="_blank"
            >
              {{ part.value }}
            </a>
            <span v-else>{{ part.value }}</span>
          </template>
        </p>
        <ul v-if="subsection.list?.length" class="legal-page__list">
          <li
            v-for="(item, index) in subsection.list"
            :key="`${section.id}-${subsection.title}-l-${index}`"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </section>
  </article>
</template>
