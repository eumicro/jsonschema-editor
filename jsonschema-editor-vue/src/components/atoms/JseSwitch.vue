<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean;
  disabled?: boolean;
  id?: string;
  /** Accessible name when not wrapped by a visible label. */
  ariaLabel?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <button
    :id="id"
    type="button"
    class="jse-switch"
    role="switch"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="jse-switch__track" aria-hidden="true">
      <span class="jse-switch__thumb" />
    </span>
  </button>
</template>
