<script setup lang="ts">
import { computed, ref } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { resolveUiI18nString, type Category, type Categorization } from "@jsonschema-editor/ui-schema";
import JseTabs from "../../atoms/JseTabs.vue";
import { useJseI18n } from "../../../composables/useJseI18n";
import { buildUiElementKey } from "../../../utils/ui-element-key";
import UiFormElementResolver from "./UiFormElementResolver.vue";

const props = defineProps<{
  element: Categorization;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
  scopePrefix?: string;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });

const { t, te } = useJseI18n();
const activeTab = ref("0");

const categories = computed(() =>
  props.element.elements.filter((child): child is Category => child.elementKind === "Category"),
);

const tabs = computed(() =>
  categories.value.map((category, index) => ({
    id: String(index),
    label:
      resolveUiI18nString(
        { i18n: category.i18n, defaultMessage: category.label, suffix: "label" },
        (key) => (te(key) ? t(key) : undefined),
      ) ?? t("categorization.category", { index: index + 1 }),
  })),
);

const activeCategory = computed(
  () => categories.value[Number(activeTab.value)] ?? categories.value[0],
);
</script>

<template>
  <div class="jse-categorization">
    <JseTabs v-if="tabs.length > 1" v-model="activeTab" :tabs="tabs" />

    <div v-if="activeCategory" class="jse-categorization__panel">
      <UiFormElementResolver
        v-for="(child, index) in activeCategory.elements"
        :key="buildUiElementKey(`tab-${activeTab}`, child, index)"
        v-model="data"
        :element="child"
        :schema="schema"
        :document="document"
        :readonly="readonly"
        :scope-prefix="scopePrefix"
      />
    </div>
  </div>
</template>
