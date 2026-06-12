<script setup lang="ts">
import JseCheckbox from "../../atoms/JseCheckbox.vue";
import JseFormField from "../JseFormField.vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const modelValue = defineModel<boolean>({ default: false });
</script>

<template>
  <JseFormField :label="label" boolean>
    <JseCheckbox v-model="modelValue" :disabled="readonly" />
  </JseFormField>
</template>
