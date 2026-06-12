<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { ObjectSchema } from "@jsonschema-editor/json-schema";
import { buildPropertyScope, scopeToPath } from "@jsonschema-editor/ui-schema";
import { resolveCompositionAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { createEmptyDataForSchema, getValueAtPath, setValueAtPath } from "../../../utils/data-path";
import JseLabel from "../../atoms/JseLabel.vue";
import JseSelect from "../../atoms/JseSelect.vue";
import SchemaFormFieldResolver from "./SchemaFormFieldResolver.vue";

const props = defineProps<{
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });

const rootSchema = computed(() => props.document?.root ?? props.schema);
const dataPath = computed(() => scopeToPath(props.scope));

const composition = computed(() => resolveCompositionAtScope(rootSchema.value, props.scope));

const branches = computed(() => {
  const comp = composition.value;
  if (!comp) return [];
  return comp.oneOf.length > 0 ? comp.oneOf : comp.anyOf;
});

const branchLabels = computed(() =>
  branches.value.map((branch, index) => {
    const resolved = props.document ? props.document.resolveNode(branch) : branch;
    return resolved.title ?? branch.title ?? `Option ${index + 1}`;
  }),
);

const selectedIndex = ref(0);

function branchPropertyKeys(branch: SchemaNode): string[] {
  const resolved = props.document ? props.document.resolveNode(branch) : branch;
  if (!(resolved instanceof ObjectSchema)) return [];
  return [...resolved.properties.keys()];
}

function resolvedBranch(index: number): SchemaNode {
  const branch = branches.value[index];
  return props.document ? props.document.resolveNode(branch) : branch;
}

function readBranchData(formData: Record<string, unknown>): Record<string, unknown> {
  const value = getValueAtPath(formData, dataPath.value);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function inferSelectedIndex(branchRecord: Record<string, unknown>): number {
  for (let i = 0; i < branches.value.length; i++) {
    const resolved = resolvedBranch(i);
    if (!(resolved instanceof ObjectSchema)) continue;

    const constProps = [...resolved.properties.entries()].filter(
      ([, prop]) => prop.constValue !== undefined,
    );
    if (
      constProps.length > 0 &&
      constProps.every(([name, prop]) => branchRecord[name] === prop.constValue)
    ) {
      return i;
    }
  }

  const allBranchKeys = branches.value.map(branchPropertyKeys);
  for (let i = 0; i < branches.value.length; i++) {
    const uniqueKeys = allBranchKeys[i].filter(
      (key) => allBranchKeys.filter((_, j) => j !== i).every((keys) => !keys.includes(key)),
    );
    if (uniqueKeys.some((key) => key in branchRecord)) return i;
  }

  for (let i = 0; i < branches.value.length; i++) {
    if (branchPropertyKeys(branches.value[i]).some((key) => key in branchRecord)) {
      return i;
    }
  }
  return 0;
}

watch(
  () => data.value,
  (formData) => {
    selectedIndex.value = inferSelectedIndex(readBranchData(formData));
  },
  { immediate: true, deep: true },
);

const activeBranch = computed(() => {
  const branch = branches.value[selectedIndex.value];
  if (!branch) return undefined;
  return props.document ? props.document.resolveNode(branch) : branch;
});

const activeBranchProperties = computed(() => {
  const branch = activeBranch.value;
  if (!(branch instanceof ObjectSchema)) return [];
  return [...branch.properties.entries()];
});

function writeBranchData(next: Record<string, unknown>) {
  if (dataPath.value.length === 0) {
    data.value = next;
    return;
  }
  data.value = setValueAtPath(data.value, dataPath.value, next);
}

function onVariantChange(raw: string | number) {
  const index = Number(raw);
  if (Number.isNaN(index) || index < 0 || index >= branches.value.length) return;

  selectedIndex.value = index;

  const current = readBranchData(data.value);
  const oneOfKeys = new Set(branches.value.flatMap(branchPropertyKeys));
  const preserved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(current)) {
    if (!oneOfKeys.has(key)) preserved[key] = value;
  }

  const branchData = createEmptyDataForSchema(resolvedBranch(index));
  writeBranchData(
    typeof branchData === "object" && branchData !== null && !Array.isArray(branchData)
      ? { ...preserved, ...(branchData as Record<string, unknown>) }
      : preserved,
  );
}
</script>

<template>
  <fieldset v-if="composition && activeBranch" class="jse-group jse-oneof-field">
    <legend v-if="label">{{ label }}</legend>

    <div v-if="branches.length > 1" class="jse-field">
      <JseLabel>Typ</JseLabel>
      <JseSelect
        :model-value="selectedIndex"
        class="jse-field__input"
        :disabled="readonly"
        @update:model-value="onVariantChange"
      >
        <option v-for="(optionLabel, index) in branchLabels" :key="index" :value="index">
          {{ optionLabel }}
        </option>
      </JseSelect>
    </div>

    <SchemaFormFieldResolver
      v-for="[name, propSchema] in activeBranchProperties"
      :key="`${selectedIndex}-${name}`"
      v-model="data"
      :schema="activeBranch"
      :document="document"
      :scope="buildPropertyScope('#', name)"
      :label="propSchema.title ?? name"
      :readonly="readonly"
    />
  </fieldset>
</template>
