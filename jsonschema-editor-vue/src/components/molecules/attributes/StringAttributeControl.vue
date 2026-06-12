<script setup lang="ts">
import JseInput from "../../atoms/JseInput.vue";
import JseFormField from "../JseFormField.vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const modelValue = defineModel<string>({ default: "" });
</script>

<template>
  <JseFormField :label="label">
    <JseInput v-model="modelValue" :disabled="readonly" />
  </JseFormField>
</template>
