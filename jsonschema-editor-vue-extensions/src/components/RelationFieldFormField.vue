<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { type SchemaDocument, type SchemaNode } from "@jsonschema-editor/json-schema";
import {
  isRelationDescriptor,
  normalizeRelationConfig,
  projectRelationDisplay,
  readRelationConfig,
  type RelationDescriptor,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseInput,
  JseSchemaFormField,
  useFormFieldLabel,
  useJseI18n,
  useScopedField,
} from "@jsonschema-editor/vue";
import { useRelationFieldProvider } from "../relation-field-provider.js";

const props = defineProps<{
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
}>();

const rootSchema = toRef(props, "schema");
const documentRef = toRef(props, "document");
const labelRef = toRef(props, "label");
const i18nKeyRef = toRef(props, "i18nKey");
const rootData = defineModel<Record<string, unknown>>({ required: true });
const { t } = useJseI18n();
const provider = useRelationFieldProvider();

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

const config = computed(() => {
  const node = resolvedSchema.value;
  return node ? normalizeRelationConfig(readRelationConfig(node)) : undefined;
});

const firstTarget = computed(() => config.value?.targets[0]);
const query = ref("");
const hits = ref<Array<{ entityId: string; label: string; data: Record<string, unknown> }>>([]);
const searching = ref(false);
const error = ref<string | null>(null);

const selected = computed<RelationDescriptor | undefined>(() =>
  isRelationDescriptor(value.value) ? value.value : undefined,
);

const selectedLabel = computed(() => {
  const current = selected.value;
  if (!current) return "";
  const display = current.display;
  if (display && typeof display === "object") {
    const first = Object.values(display).find((v) => typeof v === "string" && v.length > 0);
    if (typeof first === "string") return first;
  }
  return current.entityId;
});

watch(query, async (q) => {
  error.value = null;
  hits.value = [];
  const target = firstTarget.value;
  if (!target || props.readonly || q.trim().length < 1) return;
  const schemaId = target.schemaIds.includes("*") ? target.schemaIds[0] : target.schemaIds[0];
  if (!schemaId || schemaId === "*") {
    error.value = t("form.relation.needConcreteSchema");
    return;
  }
  searching.value = true;
  try {
    hits.value = await provider.search({
      contextId: target.contextId,
      schemaId,
      query: q.trim(),
      limit: 20,
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    searching.value = false;
  }
});

function pick(hit: { entityId: string; label: string; data: Record<string, unknown> }): void {
  const target = firstTarget.value;
  const cfg = config.value;
  if (!target || !cfg) return;
  const schemaId = target.schemaIds.includes("*") ? target.schemaIds[0] : target.schemaIds[0];
  if (!schemaId || schemaId === "*") return;
  const display = projectRelationDisplay(hit.data, cfg.display.schema);
  value.value = {
    contextId: target.contextId,
    schemaId,
    entityId: hit.entityId,
    display: Object.keys(display).length > 0 ? display : { name: hit.label },
  } satisfies RelationDescriptor;
  query.value = "";
  hits.value = [];
}

function clear(): void {
  value.value = undefined;
}

function openSelected(): void {
  const current = selected.value;
  if (!current || !provider.open) return;
  void provider.open({
    contextId: current.contextId,
    schemaId: current.schemaId,
    entityId: current.entityId,
    label: selectedLabel.value,
    data: current.display,
  });
}
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description">
    <div class="jse-relation-field">
      <div v-if="selected" class="jse-relation-field__selected">
        <button
          type="button"
          class="jse-relation-field__link"
          :disabled="!provider.open"
          @click="openSelected"
        >
          {{ selectedLabel }}
        </button>
        <button
          v-if="!readonly"
          type="button"
          class="jse-relation-field__clear"
          @click="clear"
        >
          {{ t("form.relation.clear") }}
        </button>
      </div>
      <template v-else-if="!readonly">
        <JseInput
          v-model="query"
          :placeholder="t('form.relation.searchPlaceholder')"
          :disabled="!firstTarget"
        />
        <p v-if="error" class="jse-relation-field__error">{{ error }}</p>
        <p v-else-if="searching" class="jse-relation-field__hint">{{ t("form.relation.searching") }}</p>
        <ul v-else-if="hits.length" class="jse-relation-field__hits">
          <li v-for="hit in hits" :key="hit.entityId">
            <button type="button" @click="pick(hit)">{{ hit.label || hit.entityId }}</button>
          </li>
        </ul>
      </template>
      <p v-else class="jse-relation-field__hint">{{ t("form.relation.empty") }}</p>
    </div>
  </JseSchemaFormField>
</template>

<style scoped>
.jse-relation-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.jse-relation-field__selected {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.jse-relation-field__link {
  background: none;
  border: none;
  color: var(--jse-accent, #2563eb);
  cursor: pointer;
  padding: 0;
  text-align: left;
}
.jse-relation-field__link:disabled {
  color: inherit;
  cursor: default;
  text-decoration: none;
}
.jse-relation-field__clear,
.jse-relation-field__hits button {
  cursor: pointer;
}
.jse-relation-field__hits {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--jse-border, #d1d5db);
  border-radius: 0.375rem;
  max-height: 12rem;
  overflow: auto;
}
.jse-relation-field__hits li button {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.4rem 0.6rem;
}
.jse-relation-field__hits li button:hover {
  background: var(--jse-hover, #f3f4f6);
}
.jse-relation-field__error {
  color: var(--jse-danger, #b91c1c);
  margin: 0;
  font-size: 0.85rem;
}
.jse-relation-field__hint {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.75;
}
</style>
