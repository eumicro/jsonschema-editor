<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import {
  ArraySchema,
  CompositionSchema,
  ObjectSchema,
} from "@jsonschema-editor/json-schema";
import ArrayItemsTypeControl from "./ArrayItemsTypeControl.vue";
import JseButton from "../atoms/JseButton.vue";
import JseInput from "../atoms/JseInput.vue";
import JseLabel from "../atoms/JseLabel.vue";
import JseSelect from "../atoms/JseSelect.vue";
import {
  addCompositionBranchRef,
  addCompositionBranchToDocument,
  addDefinition,
  addObjectPropertyRef,
  addObjectPropertyToDocument,
  canAddToDefsContainer,
  getDocumentKindLabel,
  getDocumentNodeLabel,
  tryGetNodeAtPath,
  setArrayItemsInDocument,
  setPropertyKindInDocument,
  suggestDefName,
} from "../../utils/schema-document";
import { getArrayItemsKind, suggestPropertyName, type SchemaPath } from "../../utils/schema-editor";
import {
  OBJECT_PROPERTY_KINDS,
  SCHEMA_CHANGE_KINDS,
  type ArrayItemTypeKind,
} from "../../utils/schema-type-kinds";
import { useJseI18n } from "../../composables/useJseI18n";

const props = defineProps<{
  document: SchemaDocument;
  targetPath: SchemaPath;
}>();

const emit = defineEmits<{
  "update:document": [document: SchemaDocument];
  done: [];
  "items-set": [arrayPath: SchemaPath, kind: string];
}>();

const { t } = useJseI18n();

const compositionOperators = ["allOf", "anyOf", "oneOf"] as const;

const newPropertyName = ref("");
const newDefName = ref("");
const propertyNameError = ref("");
const defNameError = ref("");
const selectedDefRef = ref("");

const targetNode = computed(() => tryGetNodeAtPath(props.document, props.targetPath));
const targetLabel = computed(() =>
  targetNode.value
    ? getDocumentNodeLabel(targetNode.value, props.targetPath)
    : props.targetPath.join("."),
);
const targetKindLabel = computed(() =>
  targetNode.value ? getDocumentKindLabel(targetNode.value) : "",
);
const availableDefs = computed(() => props.document.listDefNames());

const isDefsContainer = computed(() => canAddToDefsContainer(props.targetPath));
const canAddProperty = computed(() => targetNode.value instanceof ObjectSchema);
const canAddBranch = computed(
  () =>
    targetNode.value instanceof CompositionSchema ||
    (props.targetPath.length === 0 && targetNode.value && !(targetNode.value instanceof ArraySchema)),
);
const isArray = computed(() => targetNode.value instanceof ArraySchema);
const arrayItemsKind = computed(() =>
  isArray.value ? getArrayItemsKind(targetNode.value as ArraySchema) : undefined,
);
const canChangeKind = computed(
  () =>
    props.targetPath.length > 0 &&
    !isArray.value &&
    !(targetNode.value instanceof CompositionSchema) &&
    !isDefsContainer.value,
);
const canUseDefRef = computed(
  () => availableDefs.value.length > 0 && (canAddProperty.value || canAddBranch.value),
);

watch(
  () => [props.targetPath, props.document] as const,
  () => {
    propertyNameError.value = "";
    defNameError.value = "";
    selectedDefRef.value = availableDefs.value[0] ?? "";
    if (targetNode.value instanceof ObjectSchema) {
      newPropertyName.value = suggestPropertyName(targetNode.value);
    } else {
      newPropertyName.value = "";
    }
    if (isDefsContainer.value) {
      newDefName.value = suggestDefName(props.document);
    }
  },
  { immediate: true },
);

function patch(next: SchemaDocument, close = true) {
  emit("update:document", next);
  if (close) emit("done");
}

function addProperty(kind: string) {
  if (!(targetNode.value instanceof ObjectSchema)) return;

  const name = newPropertyName.value.trim();
  if (!name) {
    propertyNameError.value = t("validation.propertyNameRequired");
    return;
  }
  if (targetNode.value.getProperty(name)) {
    propertyNameError.value = t("validation.propertyNameExists", { name });
    return;
  }

  const next = addObjectPropertyToDocument(props.document, props.targetPath, kind, name);
  if (next === props.document) {
    propertyNameError.value = t("validation.propertyNameExists", { name });
    return;
  }

  propertyNameError.value = "";
  patch(next);
}

function addPropertyFromDef() {
  if (!selectedDefRef.value || !(targetNode.value instanceof ObjectSchema)) return;

  const name = newPropertyName.value.trim();
  if (!name) {
    propertyNameError.value = t("validation.propertyNameRequired");
    return;
  }

  const next = addObjectPropertyRef(
    props.document,
    props.targetPath,
    selectedDefRef.value,
    name,
  );
  if (next === props.document) {
    propertyNameError.value = t("validation.propertyNameExists", { name });
    return;
  }

  propertyNameError.value = "";
  patch(next);
}

function addDef(kind: string) {
  const name = newDefName.value.trim();
  if (!name) {
    defNameError.value = t("validation.defNameRequired");
    return;
  }
  if (props.document.hasDef(name)) {
    defNameError.value = t("validation.defNameExists", { name });
    return;
  }

  defNameError.value = "";
  patch(addDefinition(props.document, kind, name));
}

function addBranch(operator: "allOf" | "anyOf" | "oneOf") {
  patch(addCompositionBranchToDocument(props.document, props.targetPath, operator));
}

function addBranchFromDef(operator: "allOf" | "anyOf" | "oneOf") {
  if (!selectedDefRef.value) return;
  patch(addCompositionBranchRef(props.document, props.targetPath, operator, selectedDefRef.value));
}

function setItems(kind: ArrayItemTypeKind) {
  const next = setArrayItemsInDocument(props.document, props.targetPath, kind);
  emit("update:document", next);
  emit("items-set", props.targetPath, kind);
  const close = kind !== "object" && kind !== "array";
  if (close) emit("done");
}

function changeKind(kind: string) {
  patch(setPropertyKindInDocument(props.document, props.targetPath, kind));
}
</script>

<template>
  <div class="jse-element-actions">
    <p class="jse-element-actions__target">
      {{ t("elementActions.target") }} <strong>{{ targetLabel }}</strong>
      <span class="jse-element-actions__kind">({{ targetKindLabel }})</span>
    </p>

    <div v-if="isDefsContainer" class="jse-element-actions__section">
      <div class="jse-attribute-control">
        <JseLabel>{{ t("elementActions.defName") }}</JseLabel>
        <JseInput
          v-model="newDefName"
          :placeholder="t('elementActions.defNamePlaceholder')"
          @update:model-value="defNameError = ''"
        />
      </div>
      <p v-if="defNameError" class="jse-element-actions__error">{{ defNameError }}</p>

      <span class="jse-structure-editor__hint">{{ t("elementActions.type") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton
          v-for="kind in OBJECT_PROPERTY_KINDS"
          :key="`def-${kind}`"
          type="button"
          @click="addDef(kind)"
        >
          + {{ kind }}
        </JseButton>
      </div>
    </div>

    <div v-if="canAddProperty" class="jse-element-actions__section">
      <div class="jse-attribute-control">
        <JseLabel>{{ t("elementActions.fieldName") }}</JseLabel>
        <JseInput
          v-model="newPropertyName"
          :placeholder="t('elementActions.fieldNamePlaceholder')"
          @update:model-value="propertyNameError = ''"
        />
      </div>
      <p v-if="propertyNameError" class="jse-element-actions__error">{{ propertyNameError }}</p>

      <span class="jse-structure-editor__hint">{{ t("elementActions.type") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton
          v-for="kind in OBJECT_PROPERTY_KINDS"
          :key="kind"
          type="button"
          @click="addProperty(kind)"
        >
          + {{ kind }}
        </JseButton>
      </div>
    </div>

    <div v-if="canUseDefRef" class="jse-element-actions__section">
      <span class="jse-structure-editor__hint">{{ t("elementActions.ref") }}</span>
      <JseSelect v-model="selectedDefRef" class="jse-field__input">
        <option v-for="name in availableDefs" :key="name" :value="name">{{ name }}</option>
      </JseSelect>
      <div class="jse-structure-editor__buttons">
        <JseButton v-if="canAddProperty" type="button" @click="addPropertyFromDef">
          {{ t("elementActions.refAsProperty") }}
        </JseButton>
        <template v-if="canAddBranch">
          <JseButton
            v-for="op in compositionOperators"
            :key="`ref-${op}`"
            type="button"
            @click="addBranchFromDef(op)"
          >
            {{ t("elementActions.refInComposition", { operator: op }) }}
          </JseButton>
        </template>
      </div>
    </div>

    <div v-if="canAddBranch" class="jse-element-actions__section">
      <span class="jse-structure-editor__hint">{{ t("elementActions.compositionBranch") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton v-for="op in compositionOperators" :key="op" type="button" @click="addBranch(op)">
          + {{ op }}
        </JseButton>
      </div>
    </div>

    <div v-if="isArray" class="jse-element-actions__section">
      <span class="jse-structure-editor__hint">{{ t("elementActions.setItemsType") }}</span>
      <ArrayItemsTypeControl :current-kind="arrayItemsKind" @select="setItems" />
    </div>

    <div v-if="canChangeKind" class="jse-element-actions__section">
      <span class="jse-structure-editor__hint">{{ t("elementActions.changeType") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton
          v-for="kind in SCHEMA_CHANGE_KINDS"
          :key="`change-${kind}`"
          type="button"
          @click="changeKind(kind)"
        >
          → {{ kind }}
        </JseButton>
      </div>
    </div>
  </div>
</template>
