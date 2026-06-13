<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { JsonSchemaForm, JsonSchemaFormEditor, type JseLocale } from "@jsonschema-editor/vue";
import {
  defaultExampleId,
  exampleCatalog,
  type ExampleId,
} from "./examples/catalog";
import { loadExampleFromJson } from "./examples/load-example";
import { appUiFor, fallbackLocaleFor, localeOptions } from "./app-i18n";

const initial = loadExampleFromJson(exampleCatalog[defaultExampleId]);

const activeExampleId = ref<ExampleId>(defaultExampleId);
const locale = ref<JseLocale>("de");
const schema = shallowRef<SchemaDocument>(initial.schema);
const uiSchema = shallowRef<UiSchema>(initial.uiSchema);
const formData = ref<Record<string, unknown>>(initial.defaults);
const mode = ref<"editor" | "form">("editor");

const ui = computed(() => appUiFor(locale.value));
const fallbackLocale = computed(() => fallbackLocaleFor(locale.value));

const activeExample = () => exampleCatalog[activeExampleId.value];

function loadExample(id: ExampleId) {
  const loaded = loadExampleFromJson(exampleCatalog[id]);
  schema.value = loaded.schema;
  uiSchema.value = loaded.uiSchema;
  formData.value = loaded.defaults;
}

watch(activeExampleId, (id) => loadExample(id));
</script>

<template>
  <main class="app">
    <header class="app__header">
      <h1 id="json-schema-editor-beispiel">{{ ui.title }}</h1>
      <p class="app__lead">
        {{ ui.lead }}
      </p>

      <nav class="app__workflow" :aria-label="ui.workflowAria">
        <ol class="app__workflow-steps">
          <li
            class="app__workflow-step"
            :class="{ 'app__workflow-step--active': mode === 'editor' }"
          >
            <span class="app__workflow-step-num" aria-hidden="true">1</span>
            <span class="app__workflow-step-text">{{ ui.stepEdit }}</span>
          </li>
          <li class="app__workflow-step app__workflow-step--connector" aria-hidden="true" />
          <li
            class="app__workflow-step"
            :class="{ 'app__workflow-step--active': mode === 'form' }"
          >
            <span class="app__workflow-step-num" aria-hidden="true">2</span>
            <span class="app__workflow-step-text">{{ ui.stepTest }}</span>
          </li>
        </ol>
      </nav>

      <div class="app__pickers">
        <div class="app__example-picker">
          <label class="app__picker-label" for="app-example-select">{{ ui.exampleLabel }}</label>
          <select
            id="app-example-select"
            v-model="activeExampleId"
            class="app__select"
          >
            <option v-for="(entry, id) in exampleCatalog" :key="id" :value="id">
              {{ entry.label }}
            </option>
          </select>
        </div>

        <div class="app__locale-picker">
          <label class="app__picker-label" for="app-locale-select">{{ ui.localeLabel }}</label>
          <select id="app-locale-select" v-model="locale" class="app__select">
            <option v-for="option in localeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <p v-if="activeExample().description" class="app__example-desc" v-html="activeExample().description" />

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
