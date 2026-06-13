<script setup lang="ts">
import { useFieldValidation } from "../../../composables/useFormValidation";

const props = defineProps<{
  label: string;
  description?: string;
  boolean?: boolean;
  scope?: string;
}>();

const { error, onBlur } = useFieldValidation(() => props.scope ?? "");

function onFieldFocusOut(event: FocusEvent) {
  if (!props.scope) return;
  const current = event.currentTarget as HTMLElement;
  const next = event.relatedTarget as Node | null;
  if (!next || !current.contains(next)) {
    onBlur();
  }
}
</script>

<template>
  <div
    class="jse-field"
    :class="{ 'jse-field--invalid': !!error }"
    @focusout="onFieldFocusOut"
  >
    <label class="jse-field__label">
      <template v-if="boolean">
        <slot />
        {{ label }}
      </template>
      <template v-else>
        {{ label }}
      </template>
      <span v-if="description" class="jse-field__hint">{{ description }}</span>
    </label>
    <slot v-if="!boolean" />
    <p v-if="error" class="jse-field__error" role="alert">{{ error }}</p>
  </div>
</template>
