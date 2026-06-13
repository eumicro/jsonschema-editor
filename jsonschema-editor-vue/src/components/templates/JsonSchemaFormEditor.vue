<script setup lang="ts">
import { toRef } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { JseI18nOptions, JseLocale } from "../../i18n/types";
import JseButton from "../atoms/JseButton.vue";
import JseTabs from "../atoms/JseTabs.vue";
import JseTextarea from "../atoms/JseTextarea.vue";
import SchemaStructureEditor from "../organisms/SchemaStructureEditor.vue";
import UiStructureEditor from "../organisms/UiStructureEditor.vue";
import {
  resolveJseI18nOptions,
  setupJseI18n,
  useJseI18n,
} from "../../composables/useJseI18n";
import { useSchemaFormEditorState } from "../../composables/useSchemaFormEditorState";

const props = defineProps<{
  schema: SchemaDocument;
  uiSchema: UiSchema;
  locale?: JseLocale;
  fallbackLocale?: JseLocale;
  messages?: JseI18nOptions["messages"];
  translate?: JseI18nOptions["translate"];
}>();

const emit = defineEmits<{
  "update:schema": [schema: SchemaDocument];
  "update:uiSchema": [uiSchema: UiSchema];
}>();

setupJseI18n(() => resolveJseI18nOptions(props));
const { t } = useJseI18n();

const {
  editorTab,
  editorTabs,
  selectedSchemaPath,
  selectedUiPath,
  uiManualEdit,
  showAdvancedJson,
  documentRef,
  uiRoot,
  updateDocument,
  updateUiRoot,
  regenerateUiFromSchema,
  schemaJson,
  uiSchemaJson,
} = useSchemaFormEditorState(toRef(props, "schema"), toRef(props, "uiSchema"), emit);
</script>

<template>
  <div class="jse-editor">
    <section class="jse-editor__panel jse-editor__panel--main">
      <JseTabs v-model="editorTab" panel-id-prefix="jse-editor" :tabs="editorTabs" />

      <div
        v-show="editorTab === 'schema'"
        id="jse-editor-schema"
        class="jse-editor__tab-panel"
        role="tabpanel"
        aria-labelledby="jse-editor-tab-schema"
      >
        <SchemaStructureEditor
          :document="documentRef"
          :selected-path="selectedSchemaPath"
          @update:document="updateDocument"
          @update:selected-path="selectedSchemaPath = $event"
        />
      </div>

      <div
        v-show="editorTab === 'ui'"
        id="jse-editor-ui"
        class="jse-editor__tab-panel"
        role="tabpanel"
        aria-labelledby="jse-editor-tab-ui"
      >
        <div v-if="uiManualEdit" class="jse-editor__banner">
          {{ t("editor.banner.manualUi") }}
          <JseButton type="button" @click="regenerateUiFromSchema">
            {{ t("editor.banner.regenerate") }}
          </JseButton>
        </div>
        <UiStructureEditor
          :root="uiRoot"
          :selected-path="selectedUiPath"
          @update:root="updateUiRoot"
          @update:selected-path="selectedUiPath = $event"
        />
      </div>

      <details class="jse-editor__advanced" :open="showAdvancedJson">
        <summary @click.prevent="showAdvancedJson = !showAdvancedJson">
          {{ t("editor.advanced.summary") }}
        </summary>
        <label v-show="editorTab === 'schema'" class="jse-editor__json">
          {{ t("editor.advanced.schemaJson") }}
          <JseTextarea v-model="schemaJson" :rows="8" />
        </label>
        <label v-show="editorTab === 'ui'" class="jse-editor__json">
          {{ t("editor.advanced.uiJson") }}
          <JseTextarea v-model="uiSchemaJson" :rows="8" />
        </label>
      </details>
    </section>
  </div>
</template>
