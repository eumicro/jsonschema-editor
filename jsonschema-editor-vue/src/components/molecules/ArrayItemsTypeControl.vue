<script setup lang="ts">
import JseButton from "../atoms/JseButton.vue";
import {
  COMPOSITE_SCHEMA_KINDS,
  PRIMITIVE_SCHEMA_KINDS,
  STRING_FORMAT_SCHEMA_KINDS,
  type ArrayItemTypeKind,
} from "../../utils/schema-type-kinds";

defineProps<{
  currentKind?: string;
  compact?: boolean;
}>();

const emit = defineEmits<{
  select: [kind: ArrayItemTypeKind];
}>();

function select(kind: ArrayItemTypeKind) {
  emit("select", kind);
}
</script>

<template>
  <div class="jse-array-items-type">
    <p v-if="currentKind" class="jse-array-items-type__current">
      Aktueller Items-Typ: <strong>{{ currentKind }}</strong>
    </p>
    <p v-else class="jse-array-items-type__current jse-array-items-type__current--empty">
      Noch kein Items-Typ festgelegt
    </p>

    <div class="jse-array-items-type__group">
      <span class="jse-structure-editor__hint">Primitiv:</span>
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
      </div>
    </div>

    <div class="jse-array-items-type__group">
      <span class="jse-structure-editor__hint">String (format):</span>
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
      <span class="jse-structure-editor__hint">Struktur:</span>
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
      Bei <code>object</code> oder <code>array</code> im Baum unter „items“ weiter bearbeiten.
    </p>
  </div>
</template>
