<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  createSiteCodeEditor,
  type SiteCodeEditorHandle,
  type SiteCodeEditorLanguage,
} from "../../code-editor/createSiteCodeEditor";

const props = defineProps<{
  value: string;
  language: SiteCodeEditorLanguage;
  ariaLabel?: string;
}>();

const host = ref<HTMLElement | null>(null);
let editor: SiteCodeEditorHandle | null = null;

function mountEditor() {
  if (!host.value) return;
  editor?.destroy();
  editor = createSiteCodeEditor(host.value, {
    value: props.value,
    language: props.language,
  });
}

onMounted(mountEditor);

watch(
  () => props.language,
  () => {
    mountEditor();
  },
);

watch(
  () => props.value,
  (value) => {
    editor?.setValue(value);
  },
);

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<template>
  <div
    ref="host"
    class="app__site-code-editor"
    role="region"
    :aria-label="ariaLabel"
  />
</template>
