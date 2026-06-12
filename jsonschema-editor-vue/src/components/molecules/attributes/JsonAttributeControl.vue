<script setup lang="ts">
import JseTextarea from "../../atoms/JseTextarea.vue";
import JseFormField from "../JseFormField.vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const modelValue = defineModel<string>({ default: "" });
</script>

<template>
  <JseFormField :label="label">
    <JseTextarea v-model="modelValue" :disabled="readonly" :rows="3" />
  </JseFormField>
</template>
