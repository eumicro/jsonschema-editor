<script setup lang="ts">
import { ref, shallowRef, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { JsonSchemaForm, JsonSchemaFormEditor } from "@jsonschema-editor/vue";
import {
  defaultExampleId,
  exampleCatalog,
  type ExampleId,
} from "./examples/catalog";
import { loadExampleFromJson } from "./examples/load-example";

const initial = loadExampleFromJson(exampleCatalog[defaultExampleId]);

const activeExampleId = ref<ExampleId>(defaultExampleId);
const schema = shallowRef<SchemaDocument>(initial.schema);
const uiSchema = shallowRef<UiSchema>(initial.uiSchema);
const formData = ref<Record<string, unknown>>(initial.defaults);
const mode = ref<"editor" | "form">("editor");

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
      <h1 id="json-schema-editor-beispiel">JSON Schema Editor – Beispiel</h1>
      <p class="app__lead">
        Strukturieren Sie das JSON Schema, passen Sie die Formular-Oberfläche an und testen
        Sie das Ergebnis – ohne zwischen Tools wechseln zu müssen.
      </p>

      <nav class="app__workflow" aria-label="Arbeitsablauf">
        <ol class="app__workflow-steps">
          <li
            class="app__workflow-step"
            :class="{ 'app__workflow-step--active': mode === 'editor' }"
          >
            <span class="app__workflow-step-num" aria-hidden="true">1</span>
            <span class="app__workflow-step-text">Schema &amp; UI bearbeiten</span>
          </li>
          <li class="app__workflow-step app__workflow-step--connector" aria-hidden="true" />
          <li
            class="app__workflow-step"
            :class="{ 'app__workflow-step--active': mode === 'form' }"
          >
            <span class="app__workflow-step-num" aria-hidden="true">2</span>
            <span class="app__workflow-step-text">Formular testen</span>
          </li>
        </ol>
      </nav>

      <div class="app__example-picker">
        <label class="app__example-picker-label" for="app-example-select">Beispiel</label>
        <select
          id="app-example-select"
          v-model="activeExampleId"
          class="app__example-select"
        >
          <option v-for="(entry, id) in exampleCatalog" :key="id" :value="id">
            {{ entry.label }}
          </option>
        </select>
      </div>

      <p v-if="activeExample().description" class="app__example-desc" v-html="activeExample().description" />

      <div class="app__tabs" role="tablist" aria-label="Ansichtsmodus">
        <button
          type="button"
          role="tab"
          :class="{ 'app__tab--active': mode === 'editor' }"
          :aria-selected="mode === 'editor'"
          aria-controls="app-panel-editor"
          @click="mode = 'editor'"
        >
          Form-Editor
        </button>
        <button
          type="button"
          role="tab"
          :class="{ 'app__tab--active': mode === 'form' }"
          :aria-selected="mode === 'form'"
          aria-controls="app-panel-form"
          @click="mode = 'form'"
        >
          Ausfüllbares Formular
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
      />
    </section>

    <section
      v-else
      id="app-panel-form"
      class="app__form-only"
      role="tabpanel"
      aria-label="Ausfüllbares Formular"
    >
      <p class="app__form-hint">
        Vorschau des generierten Formulars. Änderungen am Schema nehmen Sie im
        <button type="button" class="app__inline-link" @click="mode = 'editor'">
          Form-Editor
        </button>
        vor.
      </p>
      <JsonSchemaForm v-model="formData" :schema="schema" :ui-schema="uiSchema" />
      <details class="app__output-details">
        <summary>Formulardaten (JSON)</summary>
        <pre class="app__output">{{ JSON.stringify(formData, null, 2) }}</pre>
      </details>
    </section>
  </main>
</template>
