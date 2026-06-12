<script setup lang="ts">
import JseInput from "../../atoms/JseInput.vue";
import JseFormField from "../JseFormField.vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const modelValue = defineModel<number | undefined>();
</script>

<template>
  <JseFormField :label="label">
    <JseInput
      :model-value="modelValue ?? ''"
      type="number"
      :disabled="readonly"
      @update:model-value="modelValue = $event === '' ? undefined : Number($event)"
    />
  </JseFormField>
</template>
