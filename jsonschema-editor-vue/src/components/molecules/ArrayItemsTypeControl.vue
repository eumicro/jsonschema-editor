<script setup lang="ts">
import { computed } from "vue";
import JseButton from "../atoms/JseButton.vue";
import { useJseI18n } from "../../composables/useJseI18n";
import {
  COMPOSITE_SCHEMA_KINDS,
  listExtensionTypeOptions,
  PRIMITIVE_SCHEMA_KINDS,
  STRING_FORMAT_SCHEMA_KINDS,
} from "../../utils/schema-editor-types";

defineProps<{
  currentKind?: string;
  compact?: boolean;
}>();

const emit = defineEmits<{
  select: [kind: string];
}>();

const { t } = useJseI18n();

const extensionTypeOptions = computed(() => listExtensionTypeOptions());

function select(kind: string) {
  emit("select", kind);
}
</script>

<template>
  <div class="jse-array-items-type">
    <p v-if="currentKind" class="jse-array-items-type__current">
      {{ t("arrayItems.current", { kind: currentKind }) }}
    </p>
    <p v-else class="jse-array-items-type__current jse-array-items-type__current--empty">
      {{ t("arrayItems.none") }}
    </p>

    <div class="jse-array-items-type__group">
      <span class="jse-structure-editor__hint">{{ t("arrayItems.primitive") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton
          v-for="kind in PRIMITIVE_SCHEMA_KINDS"
          :key="kind"
          type="button"
          :class="{ 'jse-btn--active': currentKind === kind }"
          @click="select(kind)"
        >
          {{ kind }}
        </JseButton>
        <JseButton
          v-for="option in extensionTypeOptions"
          :key="option.id"
          type="button"
          :class="{ 'jse-btn--active': currentKind === option.id }"
          @click="select(option.id)"
        >
          {{ option.label }}
        </JseButton>
      </div>
    </div>

    <div class="jse-array-items-type__group">
      <span class="jse-structure-editor__hint">{{ t("arrayItems.stringFormat") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton
          v-for="kind in STRING_FORMAT_SCHEMA_KINDS"
          :key="kind"
          type="button"
          :class="{ 'jse-btn--active': currentKind === kind }"
          @click="select(kind)"
        >
          {{ kind }}
        </JseButton>
      </div>
    </div>

    <div class="jse-array-items-type__group">
      <span class="jse-structure-editor__hint">{{ t("arrayItems.structure") }}</span>
      <div class="jse-structure-editor__buttons">
        <JseButton
          v-for="kind in COMPOSITE_SCHEMA_KINDS"
          :key="kind"
          type="button"
          :class="{ 'jse-btn--active': currentKind === kind }"
          @click="select(kind)"
        >
          {{ kind }}
        </JseButton>
      </div>
    </div>

    <p v-if="!compact" class="jse-structure-editor__note">
      {{ t("arrayItems.note") }}
    </p>
  </div>
</template>
