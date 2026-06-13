<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
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
import { navigateToPage, pageFromHash, type AppPage } from "./app-routing";
import GetStartedPage from "./GetStartedPage.vue";

type WorkspaceMode = "form" | "editor" | "json";
type JsonPane = "schema" | "ui" | "data";

const initial = loadExampleFromJson(exampleCatalog[defaultExampleId]);

const activePage = ref<AppPage>(pageFromHash());
const activeExampleId = ref<ExampleId>(defaultExampleId);
const locale = ref<JseLocale>("de");
const schema = shallowRef<SchemaDocument>(initial.schema);
const uiSchema = shallowRef<UiSchema>(initial.uiSchema);
const formData = ref<Record<string, unknown>>(initial.defaults);
const mode = ref<WorkspaceMode>("form");
const jsonPane = ref<JsonPane>("schema");

const ui = computed(() => appUiFor(locale.value));
const fallbackLocale = computed(() => fallbackLocaleFor(locale.value));
const activeExample = computed(() => exampleCatalog[activeExampleId.value]);

const visibleCategories = computed(() =>
  exampleCategoryOrder.filter((category) => examplesByCategory[category].length > 0),
);

const schemaJson = computed(() => JSON.stringify(schema.value.toJSON(), null, 2));
const uiSchemaJson = computed(() => JSON.stringify(uiSchema.value.toJSON(), null, 2));
const dataJson = computed(() => JSON.stringify(formData.value, null, 2));

const activeJsonContent = computed(() => {
  if (jsonPane.value === "schema") return schemaJson.value;
  if (jsonPane.value === "ui") return uiSchemaJson.value;
  return dataJson.value;
});

function syncPageFromHash() {
  activePage.value = pageFromHash();
}

function openGetStarted() {
  navigateToPage("get-started");
}

function openExamples() {
  navigateToPage("examples");
}

function loadExample(id: ExampleId) {
  const loaded = loadExampleFromJson(exampleCatalog[id]);
  schema.value = loaded.schema;
  uiSchema.value = loaded.uiSchema;
  formData.value = loaded.defaults;
}

function selectExample(id: ExampleId) {
  openExamples();
  activeExampleId.value = id;
}

watch(activeExampleId, (id) => loadExample(id));

onMounted(() => {
  syncPageFromHash();
  window.addEventListener("hashchange", syncPageFromHash);
});

onUnmounted(() => {
  window.removeEventListener("hashchange", syncPageFromHash);
});
</script>

<template>
  <div class="app">
    <header class="app__topbar">
      <div class="app__topbar-start">
        <a href="#/" class="app__brand" aria-label="JSON Schema Editor" @click.prevent="openExamples">
          <span class="app__brand-prefix">{{ ui.brandPrefix }}</span>
          <span class="app__brand-suffix">{{ ui.brandSuffix }}</span>
        </a>
        <nav class="app__topnav" :aria-label="ui.topNavAria">
          <a
            href="#/get-started"
            class="app__topnav-link"
            :class="{ 'app__topnav-link--active': activePage === 'get-started' }"
            :aria-current="activePage === 'get-started' ? 'page' : undefined"
            @click.prevent="openGetStarted"
          >
            {{ ui.navGetStarted }}
          </a>
          <a
            href="#/"
            class="app__topnav-link"
            :class="{ 'app__topnav-link--active': activePage === 'examples' }"
            :aria-current="activePage === 'examples' ? 'page' : undefined"
            @click.prevent="openExamples"
          >
            {{ ui.navExamples }}
          </a>
        </nav>
      </div>
      <div class="app__topbar-actions">
        <label class="app__locale-picker" for="app-locale-select">
          <span class="app__locale-label">{{ ui.localeLabel }}</span>
          <select id="app-locale-select" v-model="locale" class="app__select">
            <option v-for="option in localeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>
    </header>

    <section v-if="activePage === 'examples'" class="app__hero">
      <p class="app__tagline">{{ ui.tagline }}</p>
      <p class="app__subtitle">{{ ui.subtitle }}</p>
    </section>

    <GetStartedPage
      v-if="activePage === 'get-started'"
      :locale="locale"
      @open-examples="openExamples"
    />

    <div v-else class="app__workspace">
      <aside class="app__sidebar" :aria-label="ui.scenariosHeading">
        <h2 class="app__sidebar-heading">{{ ui.scenariosHeading }}</h2>
        <nav v-for="category in visibleCategories" :key="category" class="app__nav-group">
          <h3 class="app__nav-group-title">{{ categoryLabelFor(locale, category) }}</h3>
          <ul class="app__nav-list">
            <li v-for="entry in examplesByCategory[category]" :key="entry.id">
              <button
                type="button"
                class="app__nav-item"
                :class="{ 'app__nav-item--active': activeExampleId === entry.id }"
                :aria-current="activeExampleId === entry.id ? 'page' : undefined"
                @click="selectExample(entry.id)"
              >
                <span class="app__nav-item-label">{{ entry.label }}</span>
                <span class="app__nav-item-tagline">{{ entry.tagline }}</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main class="app__main">
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

        <header v-if="activeExample" class="app__scenario-header">
          <h1 id="json-schema-editor-beispiel" class="app__scenario-title">
            {{ activeExample.label }}
          </h1>
          <p class="app__scenario-desc">{{ activeExample.description }}</p>
        </header>

        <section class="app__panel">
          <div class="app__view-tabs" role="tablist" :aria-label="ui.tabsAria">
            <button
              type="button"
              role="tab"
              class="app__view-tab"
              :class="{ 'app__view-tab--active': mode === 'form' }"
              :aria-selected="mode === 'form'"
              aria-controls="app-panel-form"
              @click="mode = 'form'"
            >
              {{ ui.tabForm }}
            </button>
            <button
              type="button"
              role="tab"
              class="app__view-tab"
              :class="{ 'app__view-tab--active': mode === 'editor' }"
              :aria-selected="mode === 'editor'"
              aria-controls="app-panel-editor"
              @click="mode = 'editor'"
            >
              {{ ui.tabEditor }}
            </button>
            <button
              type="button"
              role="tab"
              class="app__view-tab"
              :class="{ 'app__view-tab--active': mode === 'json' }"
              :aria-selected="mode === 'json'"
              aria-controls="app-panel-json"
              @click="mode = 'json'"
            >
              {{ ui.tabJson }}
            </button>
          </div>

          <div
            v-if="mode === 'form'"
            id="app-panel-form"
            class="app__panel-body app__split"
            role="tabpanel"
            :aria-label="ui.formPanelAria"
          >
            <div class="app__split-main">
              <JsonSchemaForm
                v-model="formData"
                :schema="schema"
                :ui-schema="uiSchema"
                :locale="locale"
                :fallback-locale="fallbackLocale"
              />
            </div>
            <aside class="app__split-side">
              <div class="app__code-header">{{ ui.dataPanelTitle }}</div>
              <pre class="app__form-data-output app__code-block">{{ dataJson }}</pre>
            </aside>
          </div>

          <div
            v-if="mode === 'editor'"
            id="app-panel-editor"
            class="app__panel-body"
            role="tabpanel"
            :aria-label="ui.editorPanelAria"
          >
            <JsonSchemaFormEditor
              v-model:schema="schema"
              v-model:ui-schema="uiSchema"
              :locale="locale"
              :fallback-locale="fallbackLocale"
            />
          </div>

          <div
            v-if="mode === 'json'"
            id="app-panel-json"
            class="app__panel-body app__json-view"
            role="tabpanel"
            :aria-label="ui.jsonPanelAria"
          >
            <div class="app__json-tabs" role="tablist" :aria-label="ui.jsonTabsAria">
              <button
                type="button"
                role="tab"
                class="app__json-tab"
                :class="{ 'app__json-tab--active': jsonPane === 'schema' }"
                :aria-selected="jsonPane === 'schema'"
                @click="jsonPane = 'schema'"
              >
                {{ ui.jsonSchema }}
              </button>
              <button
                type="button"
                role="tab"
                class="app__json-tab"
                :class="{ 'app__json-tab--active': jsonPane === 'ui' }"
                :aria-selected="jsonPane === 'ui'"
                @click="jsonPane = 'ui'"
              >
                {{ ui.jsonUi }}
              </button>
              <button
                type="button"
                role="tab"
                class="app__json-tab"
                :class="{ 'app__json-tab--active': jsonPane === 'data' }"
                :aria-selected="jsonPane === 'data'"
                @click="jsonPane = 'data'"
              >
                {{ ui.jsonData }}
              </button>
            </div>
            <pre class="app__json-output app__code-block app__code-block--full">{{ activeJsonContent }}</pre>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
