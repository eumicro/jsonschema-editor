<script setup lang="ts">
import type { AppLocale } from "../../../app-routing";
import { localeOptions } from "../../i18n/app-ui";

const locale = defineModel<AppLocale>({ required: true });

defineProps<{
  label: string;
}>();
</script>

<template>
  <label class="app__locale-picker" for="app-locale-select">
    <span class="app__locale-label">{{ label }}</span>
    <select id="app-locale-select" v-model="locale" class="app__select">
      <option v-for="option in localeOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
