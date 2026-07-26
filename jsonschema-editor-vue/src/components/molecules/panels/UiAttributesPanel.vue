<script setup lang="ts">
import { computed, toRef, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  Control,
  deriveUiI18nPrefix,
  resolveControlDetailSchema,
  slugifySchemaTitle,
  uiI18nMessageKey,
} from "@jsonschema-editor/ui-schema";
import JseButton from "../../atoms/JseButton.vue";
import JseFormField from "../JseFormField.vue";
import JseInput from "../../atoms/JseInput.vue";
import JseSuggestionInput from "../../atoms/JseSuggestionInput.vue";
import AttributeControlResolver from "../attributes/AttributeControlResolver.vue";
import ControlScopeField from "../ControlScopeField.vue";
import { useJseI18n } from "../../../composables/useJseI18n";
import { useUiAttributesPanel } from "../../../composables/useUiAttributesPanel";
import { listElementLabelPropSuggestions } from "../../../utils/array-item-label";
import { listUsedControlScopes } from "../../../utils/control-scope-suggestions";
import { findEnclosingDetailPath, getUiElementAt, type UiPath } from "../../../utils/ui-editor";
import type { JseLocale } from "../../../i18n/types";
import {
  readUiLabelMessage,
  relocateUiLabelMessages,
  writeUiLabelMessage,
  type UiLabelMessages,
} from "../../../utils/ui-label-messages";

const props = defineProps<{
  root: UiElement;
  selectedPath: UiPath;
  document?: SchemaDocument | null;
  /** Opt-in: when set, show i18n prefix + one translation input per locale. */
  labelLocales?: JseLocale[];
  messages?: UiLabelMessages;
}>();

const emit = defineEmits<{
  "update:root": [root: UiElement];
  "update:messages": [messages: UiLabelMessages];
}>();

const { t } = useJseI18n();
const documentRef = toRef(props, "document");
const labelLocalesRef = toRef(props, "labelLocales");

const {
  selectedElement,
  isLayout,
  layoutKind,
  attributeFields,
  multilangEnabled,
  i18nSuffix,
  readAttribute,
  updateAttribute,
  setLayoutKind,
  getUiElementLabel,
} = useUiAttributesPanel(
  toRef(props, "root"),
  toRef(props, "selectedPath"),
  emit,
  documentRef,
  labelLocalesRef,
);

const scopeValue = computed(() => {
  const value = readAttribute("scope");
  return typeof value === "string" ? value : "";
});

const elementLabelPropValue = computed({
  get: () => {
    const value = readAttribute("elementLabelProp");
    return typeof value === "string" ? value : "";
  },
  set: (value: string) => updateAttribute("elementLabelProp", value),
});

const derivedI18nPrefix = computed(() => {
  const element = selectedElement.value;
  return deriveUiI18nPrefix(
    slugifySchemaTitle(props.document?.root.title),
    {
      elementKind: element.elementKind,
      scope: element instanceof Control ? element.scope : undefined,
    },
    props.selectedPath,
  );
});

const i18nPrefix = computed(() => {
  if (multilangEnabled.value) return derivedI18nPrefix.value;
  const value = readAttribute("i18n");
  return typeof value === "string" ? value.trim() : "";
});

watch(
  [multilangEnabled, derivedI18nPrefix, () => props.selectedPath.join(".")],
  () => {
    if (!multilangEnabled.value) return;
    const derived = derivedI18nPrefix.value;
    const current = String(selectedElement.value.i18n ?? "").trim();
    if (current === derived) return;
    if (current) {
      emit(
        "update:messages",
        relocateUiLabelMessages(props.messages, current, derived),
      );
    }
    updateAttribute("i18n", derived);
  },
  { immediate: true },
);

const detailPath = computed(() => findEnclosingDetailPath(props.selectedPath));

const suggestionSchema = computed(() => {
  const path = detailPath.value;
  if (!path || !props.document) return null;
  try {
    const control = getUiElementAt(props.root, path.slice(0, -1));
    if (!(control instanceof Control)) return null;
    return resolveControlDetailSchema(props.document, control.scope) ?? null;
  } catch {
    return null;
  }
});

const elementLabelPropSuggestions = computed(() => {
  if (!(selectedElement.value instanceof Control)) return [];
  return listElementLabelPropSuggestions(props.document, selectedElement.value.scope).map(
    (name) => ({
      value: name,
      label: name,
    }),
  );
});

const usedScopes = computed(() => {
  if (detailPath.value) {
    return listUsedControlScopes(props.root, { subtreeRoot: detailPath.value });
  }
  return listUsedControlScopes(props.root, { skipDetail: true });
});

const conflictScopes = computed(() => {
  if (detailPath.value) {
    return listUsedControlScopes(props.root, {
      subtreeRoot: detailPath.value,
      ignorePath: props.selectedPath,
    });
  }
  return listUsedControlScopes(props.root, {
    skipDetail: true,
    ignorePath: props.selectedPath,
  });
});

function translationKey(): string | undefined {
  if (!i18nPrefix.value) return undefined;
  return uiI18nMessageKey(i18nPrefix.value, i18nSuffix.value);
}

function readLocaleTranslation(locale: JseLocale): string {
  const key = translationKey();
  if (!key) return "";
  return readUiLabelMessage(props.messages, locale, key);
}

function updateLocaleTranslation(locale: JseLocale, value: string | number): void {
  const key = translationKey();
  if (!key) return;
  emit(
    "update:messages",
    writeUiLabelMessage(props.messages, locale, key, String(value ?? "")),
  );
}
</script>

<template>
  <div class="jse-attributes-panel">
    <p v-if="selectedPath.length === 0" class="jse-structure-editor__hint">
      {{ t("uiAttributes.rootLayout", { label: getUiElementLabel(selectedElement) }) }}
    </p>

    <JseFormField v-if="isLayout" :label="t('uiAttributes.layoutType')">
      <div class="jse-structure-editor__buttons">
        <JseButton
          type="button"
          :class="{ 'jse-btn--active': layoutKind === 'VerticalLayout' }"
          @click="setLayoutKind('VerticalLayout')"
        >
          VerticalLayout
        </JseButton>
        <JseButton
          type="button"
          :class="{ 'jse-btn--active': layoutKind === 'HorizontalLayout' }"
          @click="setLayoutKind('HorizontalLayout')"
        >
          HorizontalLayout
        </JseButton>
        <JseButton
          type="button"
          :class="{ 'jse-btn--active': layoutKind === 'Group' }"
          @click="setLayoutKind('Group')"
        >
          Group
        </JseButton>
      </div>
    </JseFormField>

    <template v-for="field in attributeFields" :key="field.name">
      <ControlScopeField
        v-if="field.name === 'scope'"
        :model-value="scopeValue"
        :document="document"
        :suggestion-schema="suggestionSchema"
        :used-scopes="usedScopes"
        :conflict-scopes="conflictScopes"
        @update:model-value="updateAttribute('scope', $event)"
      />
      <JseFormField
        v-else-if="field.name === 'elementLabelProp'"
        :label="t(field.labelKey)"
      >
        <JseSuggestionInput
          v-model="elementLabelPropValue"
          :suggestions="elementLabelPropSuggestions"
          :placeholder="t('uiAttributes.elementLabelPropPlaceholder')"
        />
        <p class="jse-structure-editor__hint">{{ t("uiAttributes.elementLabelPropHint") }}</p>
      </JseFormField>
      <JseFormField v-else-if="field.name === 'i18n'" :label="t(field.labelKey)">
        <JseInput
          :model-value="i18nPrefix"
          readonly
          :placeholder="t('uiAttributes.i18nPlaceholder')"
        />
        <p class="jse-structure-editor__hint">{{ t("uiAttributes.i18nHint") }}</p>
      </JseFormField>
      <AttributeControlResolver
        v-else
        :node="selectedElement"
        :attribute-name="field.name"
        :label="t(field.labelKey)"
        mode="ui"
        :model-value="readAttribute(field.name)"
        @update:model-value="updateAttribute(field.name, $event)"
      />
    </template>

    <template v-if="multilangEnabled">
      <JseFormField
        v-for="locale in labelLocales"
        :key="locale"
        :label="t('uiAttributes.translatedLabel', { locale })"
      >
        <JseInput
          :model-value="readLocaleTranslation(locale)"
          :placeholder="uiI18nMessageKey(i18nPrefix, i18nSuffix)"
          @update:model-value="updateLocaleTranslation(locale, $event)"
        />
      </JseFormField>
    </template>
  </div>
</template>
