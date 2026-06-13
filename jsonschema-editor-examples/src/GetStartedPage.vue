<script setup lang="ts">
import type { JseLocale } from "@jsonschema-editor/vue";
import { computed } from "vue";
import { getStartedFor } from "./get-started-i18n";

const props = defineProps<{
  locale: JseLocale;
}>();

const emit = defineEmits<{
  openExamples: [];
}>();

const content = computed(() => getStartedFor(props.locale));
</script>

<template>
  <article class="get-started">
    <header class="get-started__header">
      <h1 class="get-started__title">{{ content.title }}</h1>
      <p class="get-started__lead">{{ content.lead }}</p>
    </header>

    <section class="get-started__section" :aria-labelledby="'get-started-concepts'">
      <h2 id="get-started-concepts" class="get-started__section-title">{{ content.conceptsHeading }}</h2>
      <div class="get-started__cards">
        <div v-for="concept in content.concepts" :key="concept.title" class="get-started__card">
          <h3 class="get-started__card-title">{{ concept.title }}</h3>
          <p class="get-started__card-body">{{ concept.body }}</p>
        </div>
      </div>
    </section>

    <section class="get-started__section" :aria-labelledby="'get-started-steps'">
      <h2 id="get-started-steps" class="get-started__section-title">{{ content.stepsHeading }}</h2>
      <ol class="get-started__steps">
        <li v-for="(step, index) in content.steps" :key="step.title" class="get-started__step">
          <div class="get-started__step-marker" aria-hidden="true">{{ index + 1 }}</div>
          <div class="get-started__step-body">
            <h3 class="get-started__step-title">{{ step.title }}</h3>
            <p class="get-started__step-text">{{ step.body }}</p>
            <pre v-if="step.code" class="get-started__code"><code>{{ step.code }}</code></pre>
          </div>
        </li>
      </ol>
    </section>

    <section class="get-started__section" :aria-labelledby="'get-started-packages'">
      <h2 id="get-started-packages" class="get-started__section-title">{{ content.packagesHeading }}</h2>
      <div class="get-started__packages">
        <div v-for="pkg in content.packages" :key="pkg.name" class="get-started__package">
          <code class="get-started__package-name">{{ pkg.name }}</code>
          <span class="get-started__package-role">{{ pkg.role }}</span>
        </div>
      </div>
    </section>

    <section class="get-started__cta" :aria-labelledby="'get-started-try'">
      <h2 id="get-started-try" class="get-started__cta-title">{{ content.tryHeading }}</h2>
      <p class="get-started__cta-body">{{ content.tryBody }}</p>
      <button type="button" class="get-started__cta-button" @click="emit('openExamples')">
        {{ content.tryCta }}
      </button>
    </section>
  </article>
</template>
