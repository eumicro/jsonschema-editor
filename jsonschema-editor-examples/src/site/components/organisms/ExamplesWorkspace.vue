<script setup lang="ts">
import { computed, ref } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { JsonSchemaForm, JsonSchemaFormEditor, JseCheckbox, type JseLocale } from "@jsonschema-editor/vue";
import type { AppLocale } from "../../../app-routing";
import {
  exampleCopyFor,
  exampleManifests,
  type ExampleId,
  type ExampleManifest,
} from "../../../examples/catalog";
import { exampleEmbedCode } from "../../example-embed-code";
import SiteCodeEditor from "../atoms/SiteCodeEditor.vue";
import ExampleCatalog from "./ExampleCatalog.vue";

export type WorkspaceMode = "form" | "editor" | "json" | "code";
type JsonPane = "schema" | "ui" | "data";

const activeExampleId = defineModel<ExampleId>("activeExampleId", { required: true });
const schema = defineModel<SchemaDocument>("schema", { required: true });
const uiSchema = defineModel<UiSchema>("uiSchema", { required: true });
const formData = defineModel<Record<string, unknown>>("formData", { required: true });
const uiLabelMessages = defineModel<Partial<Record<JseLocale, Record<string, string>>>>(
  "uiLabelMessages",
  { required: true },
);
const mode = defineModel<WorkspaceMode>("mode", { required: true });
const jsonPane = defineModel<JsonPane>("jsonPane", { required: true });

const props = defineProps<{
  locale: AppLocale;
  fallbackLocale: AppLocale;
  labelLocales: JseLocale[];
  ui: {
    scenariosHeading: string;
    tabsAria: string;
    tabForm: string;
    tabEditor: string;
    tabJson: string;
    tabCode: string;
    formPanelAria: string;
    dataPanelTitle: string;
    editorPanelAria: string;
    editorReadonly: string;
    jsonPanelAria: string;
    codePanelAria: string;
    jsonTabsAria: string;
    jsonSchema: string;
    jsonUi: string;
    jsonData: string;
  };
  visibleCategories: import("../../../examples/catalog").ExampleCategory[];
  activeExample: ExampleManifest;
  activeExampleCopy: { label: string; description: string };
  dataJson: string;
  activeJsonContent: string;
  exampleHref: (id: ExampleId) => string;
}>();

const emit = defineEmits<{
  selectExample: [id: ExampleId];
}>();

const embedCode = computed(() =>
  exampleEmbedCode({
    stack: "vue",
    exampleId: activeExampleId.value,
    locale: props.locale,
  }),
);

const editorReadonly = ref(false);
</script>

<template>
  <div class="app__workspace">
    <ExampleCatalog
      :locale="locale"
      :scenarios-heading="ui.scenariosHeading"
      :visible-categories="visibleCategories"
      :active-example-id="activeExampleId"
      :example-href="exampleHref"
      @select-example="emit('selectExample', $event)"
    />

    <main class="app__main">
      <select
        id="app-example-select"
        v-model="activeExampleId"
        class="app__example-select-hidden"
        tabindex="-1"
        aria-hidden="true"
      >
        <option v-for="entry in exampleManifests" :key="entry.id" :value="entry.id">
          {{ exampleCopyFor(entry, locale).label }}
        </option>
      </select>

      <header v-if="activeExample" class="app__scenario-header">
        <h1 id="json-schema-editor-beispiel" class="app__scenario-title">
          {{ activeExampleCopy.label }}
        </h1>
        <p class="app__scenario-desc">{{ activeExampleCopy.description }}</p>
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
          <button
            type="button"
            role="tab"
            class="app__view-tab"
            :class="{ 'app__view-tab--active': mode === 'code' }"
            :aria-selected="mode === 'code'"
            aria-controls="app-panel-code"
            @click="mode = 'code'"
          >
            {{ ui.tabCode }}
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
              :messages="uiLabelMessages"
            />
          </div>
          <aside class="app__split-side">
            <div class="app__code-header">{{ ui.dataPanelTitle }}</div>
            <!-- Machine-readable mirror for E2E; CodeMirror textContent is not reliable JSON. -->
            <pre class="app__form-data-output" hidden>{{ dataJson }}</pre>
            <SiteCodeEditor
              :value="dataJson"
              language="json"
              :aria-label="ui.dataPanelTitle"
            />
          </aside>
        </div>

        <div
          v-if="mode === 'editor'"
          id="app-panel-editor"
          class="app__panel-body app__panel-body--editor"
          role="tabpanel"
          :aria-label="ui.editorPanelAria"
        >
          <label class="app__editor-readonly">
            <JseCheckbox v-model="editorReadonly" />
            <span class="app__editor-readonly__label">{{ ui.editorReadonly }}</span>
          </label>
          <JsonSchemaFormEditor
            v-model:schema="schema"
            v-model:ui-schema="uiSchema"
            v-model:messages="uiLabelMessages"
            :locale="locale"
            :fallback-locale="fallbackLocale"
            :label-locales="labelLocales"
            :readonly="editorReadonly"
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
          <SiteCodeEditor
            class="app__json-editor"
            :value="activeJsonContent"
            language="json"
            :aria-label="ui.jsonPanelAria"
          />
        </div>

        <div
          v-if="mode === 'code'"
          id="app-panel-code"
          class="app__panel-body app__code-view"
          role="tabpanel"
          :aria-label="ui.codePanelAria"
        >
          <SiteCodeEditor
            :value="embedCode"
            language="javascript"
            :aria-label="ui.codePanelAria"
          />
        </div>
      </section>
    </main>
  </div>
</template>
