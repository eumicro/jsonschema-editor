<script setup lang="ts">
import { computed } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import JseFormField from "./JseFormField.vue";
import JseSuggestionInput from "../atoms/JseSuggestionInput.vue";
import {
  isControlScopeInUse,
  listControlScopeSuggestions,
} from "../../utils/control-scope-suggestions";
import { useJseI18n } from "../../composables/useJseI18n";

const props = defineProps<{
  document?: SchemaDocument | null;
  /** Scopes, die aus der Suggestion-Liste ausgeblendet werden. */
  usedScopes?: readonly string[];
  /** Scopes, die eine „bereits in Verwendung“-Warnung auslösen (Standard: usedScopes). */
  conflictScopes?: readonly string[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const modelValue = defineModel<string>({ default: "" });
const { t } = useJseI18n();

const suggestions = computed(() =>
  listControlScopeSuggestions(props.document, {
    excludeScopes: props.usedScopes,
  }).map((entry) => ({
    value: entry.scope,
    label: entry.display,
  })),
);

const scopeInUse = computed(() =>
  isControlScopeInUse(
    modelValue.value,
    props.conflictScopes ?? props.usedScopes ?? [],
  ),
);

const fieldLabel = computed(() => props.label ?? t("uiAttributes.scope"));
const fieldPlaceholder = computed(
  () => props.placeholder ?? t("uiAttributes.scopeSuggestionPlaceholder"),
);
</script>

<template>
  <JseFormField :label="fieldLabel">
    <JseSuggestionInput
      v-model="modelValue"
      :suggestions="suggestions"
      :disabled="disabled"
      :placeholder="fieldPlaceholder"
      :class="{ 'jse-suggestion-input--warning': scopeInUse }"
    />
    <p v-if="scopeInUse" class="jse-scope-warning" role="alert">
      {{ t("uiAttributes.scopeAlreadyInUse", { scope: modelValue.trim() }) }}
    </p>
    <p v-else-if="suggestions.length > 0" class="jse-structure-editor__hint">
      {{ t("uiAttributes.scopeSuggestionHint") }}
    </p>
    <p v-else class="jse-structure-editor__hint">
      {{ t("uiAttributes.scopeSuggestionEmpty") }}
    </p>
  </JseFormField>
</template>
