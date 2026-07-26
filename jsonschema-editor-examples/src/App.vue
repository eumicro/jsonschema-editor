<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { JseLocale } from "@jsonschema-editor/vue";
import {
  createInMemoryFileFieldProvider,
  provideFileFieldProvider,
} from "@jsonschema-editor/vue-extensions";
import {
  defaultExampleId,
  exampleCatalog,
  exampleCategoryOrder,
  exampleCopyFor,
  examplesByCategory,
  type ExampleId,
} from "./examples/catalog";
import { seedDemoFilesForExample } from "./examples/demo-file-seeds";
import { loadExampleFromJson } from "./examples/load-example";
import { appUiFor, fallbackLocaleFor } from "./site/i18n/app-ui";
import { getStartedFor } from "./site/i18n/get-started";
import { imprintFor } from "./site/i18n/imprint";
import { applyDocumentMeta, buildPageMeta } from "./site/seo";
import {
  hrefForStackExample,
  hrefForStackSwitch,
  navigateTo,
  parseAppLocation,
  pathFor,
  type AppLocale,
  type AppPage,
  type AppStack,
} from "./app-routing";
import { writePreferredStack } from "./site/stack-preference";
import SiteShell from "./site/components/templates/SiteShell.vue";
import ExamplesWorkspace from "./site/components/organisms/ExamplesWorkspace.vue";
import GetStartedPage from "./site/pages/GetStartedPage.vue";
import ImprintPage from "./site/pages/ImprintPage.vue";

type WorkspaceMode = "form" | "editor" | "json" | "code";
type JsonPane = "schema" | "ui" | "data";

const OWNED_STACK = "vue" as const;
const knownExampleIds = new Set<string>(Object.keys(exampleCatalog));

function readLocation() {
  return parseAppLocation(window.location.pathname, {
    defaultExampleId,
    ownedStack: OWNED_STACK,
    knownExampleIds,
  });
}

const boot = readLocation();
const initialExampleId = (
  boot.exampleId in exampleCatalog ? boot.exampleId : defaultExampleId
) as ExampleId;
const initial = loadExampleFromJson(exampleCatalog[initialExampleId]);

const fileProvider = createInMemoryFileFieldProvider();
provideFileFieldProvider(fileProvider);

const activePage = ref<AppPage>(boot.page);
const activeExampleId = ref<ExampleId>(initialExampleId);
const locale = ref<AppLocale>(boot.locale);
const schema = shallowRef<SchemaDocument>(initial.schema);
const uiSchema = shallowRef<UiSchema>(initial.uiSchema);
const formData = ref<Record<string, unknown>>(initial.defaults);
const uiLabelMessages = ref<Partial<Record<JseLocale, Record<string, string>>>>(
  structuredClone(exampleCatalog[initialExampleId].messages),
);
const labelLocales: JseLocale[] = ["de", "en", "fr", "it", "pl", "uk", "ru", "zh", "ja"];
const mode = ref<WorkspaceMode>("form");
const jsonPane = ref<JsonPane>("schema");
const syncingFromUrl = ref(false);

const ui = computed(() => appUiFor(locale.value));
const fallbackLocale = computed(() => fallbackLocaleFor(locale.value));
const activeExample = computed(() => exampleCatalog[activeExampleId.value]);
const activeExampleCopy = computed(() =>
  exampleCopyFor(activeExample.value, locale.value),
);
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

const examplesHref = computed(() =>
  pathFor({
    locale: locale.value,
    page: "examples",
    stack: OWNED_STACK,
    exampleId: activeExampleId.value,
    defaultExampleId,
    ownedStack: OWNED_STACK,
  }),
);
const getStartedHref = computed(() =>
  pathFor({
    locale: locale.value,
    page: "get-started",
    stack: OWNED_STACK,
    defaultExampleId,
    ownedStack: OWNED_STACK,
  }),
);
const imprintHref = computed(() =>
  pathFor({
    locale: locale.value,
    page: "imprint",
    defaultExampleId,
    ownedStack: OWNED_STACK,
  }),
);

async function applyLocationFromUrl() {
  const loc = readLocation();
  syncingFromUrl.value = true;
  activePage.value = loc.page;
  locale.value = loc.locale;
  if (loc.exampleId in exampleCatalog) {
    activeExampleId.value = loc.exampleId as ExampleId;
  }

  const canonical = pathFor({
    locale: loc.locale,
    page: loc.page,
    stack: OWNED_STACK,
    exampleId: activeExampleId.value,
    defaultExampleId,
    ownedStack: OWNED_STACK,
  });
  if (window.location.pathname !== canonical) {
    window.history.replaceState(null, "", canonical);
  }
  await nextTick();
  syncingFromUrl.value = false;
}

function pushCurrentUrl() {
  if (syncingFromUrl.value) return;
  navigateTo(
    pathFor({
      locale: locale.value,
      page: activePage.value,
      stack: OWNED_STACK,
      exampleId: activeExampleId.value,
      defaultExampleId,
      ownedStack: OWNED_STACK,
    }),
  );
}

function openGetStarted() {
  activePage.value = "get-started";
  pushCurrentUrl();
}

function openImprint() {
  activePage.value = "imprint";
  pushCurrentUrl();
}

function openExamples() {
  activePage.value = "examples";
  pushCurrentUrl();
}

async function loadExample(id: ExampleId) {
  const manifest = exampleCatalog[id];
  const loaded = loadExampleFromJson(manifest);
  await seedDemoFilesForExample(fileProvider, id);
  schema.value = loaded.schema;
  uiSchema.value = loaded.uiSchema;
  formData.value = loaded.defaults;
  uiLabelMessages.value = structuredClone(manifest.messages);
}

function selectExample(id: ExampleId) {
  activePage.value = "examples";
  activeExampleId.value = id;
  pushCurrentUrl();
}

function exampleHref(id: ExampleId): string {
  return hrefForStackExample(OWNED_STACK, {
    locale: locale.value,
    stack: OWNED_STACK,
    exampleId: id,
  });
}

function stackHref(stack: AppStack): string {
  return hrefForStackSwitch({
    locale: locale.value,
    page: activePage.value,
    stack,
    exampleId: activeExampleId.value,
  });
}

function onSelectStack(stack: AppStack) {
  writePreferredStack(stack);
}

watch(activeExampleId, (id) => {
  void loadExample(id);
  if (!syncingFromUrl.value) pushCurrentUrl();
});

watch(locale, () => {
  if (!syncingFromUrl.value) pushCurrentUrl();
});

function syncDocumentMeta() {
  const getStarted = getStartedFor(locale.value, OWNED_STACK);
  const imprint = imprintFor(locale.value);
  applyDocumentMeta(
    buildPageMeta({
      locale: locale.value,
      page: activePage.value,
      stack: OWNED_STACK,
      exampleId: activeExampleId.value,
      defaultExampleId,
      exampleLabel: activeExampleCopy.value.label,
      exampleTagline: activeExampleCopy.value.tagline,
      exampleDescription: activeExampleCopy.value.description,
      getStartedTitle: getStarted.title,
      getStartedLead: getStarted.lead,
      imprintTitle: imprint.pageTitle,
      fallbackDescription: ui.value.subtitle,
    }),
  );
}

watch(
  [activePage, locale, activeExampleId, activeExampleCopy, ui],
  () => {
    syncDocumentMeta();
  },
  { immediate: true },
);

onMounted(() => {
  writePreferredStack(OWNED_STACK);
  void applyLocationFromUrl().then(() => loadExample(activeExampleId.value));
  window.addEventListener("popstate", () => {
    void applyLocationFromUrl();
  });
});

onUnmounted(() => {
  window.removeEventListener("popstate", applyLocationFromUrl);
});
</script>

<template>
  <SiteShell
    v-model:locale="locale"
    :ui="ui"
    :active-page="activePage"
    :owned-stack="OWNED_STACK"
    :examples-href="examplesHref"
    :get-started-href="getStartedHref"
    :imprint-href="imprintHref"
    :vue-href="stackHref('vue')"
    :react-href="stackHref('react')"
    @open-examples="openExamples"
    @open-get-started="openGetStarted"
    @open-imprint="openImprint"
    @select-stack="onSelectStack"
  >
    <GetStartedPage
      v-if="activePage === 'get-started'"
      :locale="locale"
      :stack="OWNED_STACK"
      @open-examples="openExamples"
      @open-example="selectExample($event as ExampleId)"
    />
    <ImprintPage v-else-if="activePage === 'imprint'" :locale="locale" />
    <ExamplesWorkspace
      v-else
      v-model:active-example-id="activeExampleId"
      v-model:schema="schema"
      v-model:ui-schema="uiSchema"
      v-model:form-data="formData"
      v-model:ui-label-messages="uiLabelMessages"
      v-model:mode="mode"
      v-model:json-pane="jsonPane"
      :locale="locale"
      :fallback-locale="fallbackLocale"
      :label-locales="labelLocales"
      :ui="ui"
      :visible-categories="visibleCategories"
      :active-example="activeExample"
      :active-example-copy="activeExampleCopy"
      :data-json="dataJson"
      :active-json-content="activeJsonContent"
      :example-href="exampleHref"
      @select-example="selectExample"
    />
  </SiteShell>
</template>
