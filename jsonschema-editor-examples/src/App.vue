<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { JsonSchemaForm, JsonSchemaFormEditor, type JseLocale } from "@jsonschema-editor/vue";
import {
  defaultExampleId,
  exampleCatalog,
  exampleCategoryOrder,
  exampleManifests,
  examplesByCategory,
  type ExampleId,
} from "./examples/catalog";
import { loadExampleFromJson } from "./examples/load-example";
import { appUiFor, categoryLabelFor, fallbackLocaleFor, localeOptions } from "./app-i18n";

const initial = loadExampleFromJson(exampleCatalog[defaultExampleId]);

const activeExampleId = ref<ExampleId>(defaultExampleId);
const locale = ref<JseLocale>("de");
const schema = shallowRef<SchemaDocument>(initial.schema);
const uiSchema = shallowRef<UiSchema>(initial.uiSchema);
const formData = ref<Record<string, unknown>>(initial.defaults);
const mode = ref<"editor" | "form">("editor");

const ui = computed(() => appUiFor(locale.value));
const fallbackLocale = computed(() => fallbackLocaleFor(locale.value));

const activeExample = computed(() => exampleCatalog[activeExampleId.value]);

const visibleCategories = computed(() =>
  exampleCategoryOrder.filter((category) => examplesByCategory[category].length > 0),
);

function loadExample(id: ExampleId) {
  const loaded = loadExampleFromJson(exampleCatalog[id]);
  schema.value = loaded.schema;
  uiSchema.value = loaded.uiSchema;
  formData.value = loaded.defaults;
}

function selectExample(id: ExampleId) {
  activeExampleId.value = id;
}

watch(activeExampleId, (id) => loadExample(id));
</script>

<template>
  <main class="app">
    <header class="app__header">
      <div class="app__header-top">
        <div class="app__header-copy">
          <h1 id="json-schema-editor-beispiel">{{ ui.title }}</h1>
          <p class="app__lead">{{ ui.lead }}</p>
        </div>
        <div class="app__locale-picker">
          <label class="app__picker-label" for="app-locale-select">{{ ui.localeLabel }}</label>
          <select id="app-locale-select" v-model="locale" class="app__select app__select--locale">
            <option v-for="option in localeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <section class="app__gallery" :aria-label="ui.scenariosHeading">
        <h2 class="app__gallery-heading">{{ ui.scenariosHeading }}</h2>
        <div v-for="category in visibleCategories" :key="category" class="app__category">
          <h3 class="app__category-title">{{ categoryLabelFor(locale, category) }}</h3>
          <ul class="app__card-grid">
            <li v-for="entry in examplesByCategory[category]" :key="entry.id">
              <button
                type="button"
                class="app__card"
                :class="{ 'app__card--active': activeExampleId === entry.id }"
                :aria-pressed="activeExampleId === entry.id"
                @click="selectExample(entry.id)"
              >
                <span class="app__card-label">{{ entry.label }}</span>
                <span class="app__card-tagline">{{ entry.tagline }}</span>
              </button>
            </li>
          </ul>
        </div>
      </section>

      <!-- Hidden select keeps E2E helpers working (selectExample). -->
      <select
        id="app-example-select"
        v-model="activeExampleId"
        class="app__example-select-hidden"
        tabindex="-1"
        aria-hidden="true"
      >
        <option v-for="entry in exampleManifests" :key="entry.id" :value="entry.id">
          {{ entry.label }}
        </option>
      </select>

      <div v-if="activeExample" class="app__example-detail">
        <p class="app__example-tagline">{{ activeExample.tagline }}</p>
        <p class="app__example-desc">{{ activeExample.description }}</p>
      </div>

      <div class="app__tabs" role="tablist" :aria-label="ui.tabsAria">
        <button
          type="button"
          role="tab"
          :class="{ 'app__tab--active': mode === 'editor' }"
          :aria-selected="mode === 'editor'"
          aria-controls="app-panel-editor"
          @click="mode = 'editor'"
        >
          {{ ui.tabEditor }}
        </button>
        <button
          type="button"
          role="tab"
          :class="{ 'app__tab--active': mode === 'form' }"
          :aria-selected="mode === 'form'"
          aria-controls="app-panel-form"
          @click="mode = 'form'"
        >
          {{ ui.tabForm }}
        </button>
      </div>
    </header>

    <section
      v-if="mode === 'editor'"
      id="app-panel-editor"
      class="app__editor"
      role="tabpanel"
      aria-labelledby="json-schema-editor-beispiel"
    >
      <JsonSchemaFormEditor
        v-model:schema="schema"
        v-model:ui-schema="uiSchema"
        :locale="locale"
        :fallback-locale="fallbackLocale"
      />
    </section>

    <section
      v-else
      id="app-panel-form"
      class="app__form-only"
      role="tabpanel"
      :aria-label="ui.formPanelAria"
    >
      <p class="app__form-hint">
        {{ ui.formHintBefore }}
        <button type="button" class="app__inline-link" @click="mode = 'editor'">
          {{ ui.formHintLink }}
        </button>
        {{ ui.formHintAfter }}
      </p>
      <JsonSchemaForm
        v-model="formData"
        :schema="schema"
        :ui-schema="uiSchema"
        :locale="locale"
        :fallback-locale="fallbackLocale"
      />
      <details class="app__output-details">
        <summary>{{ ui.formDataSummary }}</summary>
        <pre class="app__output">{{ JSON.stringify(formData, null, 2) }}</pre>
      </details>
    </section>
  </main>
</template>
