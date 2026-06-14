<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import type { FileDescriptor } from "@jsonschema-editor/json-schema-extensions";
import { isPreviewableMimeType } from "@jsonschema-editor/json-schema-extensions";

const props = defineProps<{
  open: boolean;
  files: FileDescriptor[];
  thumbnails: Record<string, string | undefined>;
  startIndex?: number;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  delete: [file: FileDescriptor];
}>();

const activeIndex = ref(0);

watch(
  () => [props.open, props.startIndex] as const,
  ([open, startIndex]) => {
    if (!open) return;
    activeIndex.value = Math.min(
      Math.max(startIndex ?? 0, 0),
      Math.max(props.files.length - 1, 0),
    );
  },
  { immediate: true },
);

const previewableFiles = computed(() =>
  props.files.filter((file) => isPreviewableMimeType(file.mimeType)),
);

const activeFile = computed(() => previewableFiles.value[activeIndex.value]);

function close(): void {
  emit("close");
}

function onBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    close();
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    close();
  } else if (event.key === "ArrowLeft") {
    activeIndex.value = (activeIndex.value - 1 + previewableFiles.value.length) % previewableFiles.value.length;
  } else if (event.key === "ArrowRight") {
    activeIndex.value = (activeIndex.value + 1) % previewableFiles.value.length;
  }
}

function deleteActive(): void {
  const file = activeFile.value;
  if (!file || props.readonly) return;
  emit("delete", file);
  if (previewableFiles.value.length <= 1) {
    close();
    return;
  }
  activeIndex.value = Math.min(activeIndex.value, previewableFiles.value.length - 2);
}

onBeforeUnmount(() => {
  if (props.open) {
    close();
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && previewableFiles.length > 0"
      class="jse-file-gallery"
      role="dialog"
      aria-modal="true"
      aria-label="File preview gallery"
      tabindex="-1"
      @click="onBackdropClick"
      @keydown="onKeydown"
    >
      <div class="jse-file-gallery__panel">
        <header class="jse-file-gallery__header">
          <strong class="jse-file-gallery__title">{{ activeFile?.name }}</strong>
          <span class="jse-file-gallery__counter">
            {{ activeIndex + 1 }} / {{ previewableFiles.length }}
          </span>
          <div class="jse-file-gallery__actions">
            <button
              v-if="!readonly"
              type="button"
              class="jse-file-gallery__icon-btn jse-file-gallery__icon-btn--danger"
              title="Delete"
              aria-label="Delete file"
              @click="deleteActive"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v9h-2V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Z"
                />
              </svg>
            </button>
            <button
              type="button"
              class="jse-file-gallery__icon-btn"
              title="Close"
              aria-label="Close gallery"
              @click="close"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M6.4 4 4 6.4 10.6 13 4 19.6 6.4 22 13 15.4 19.6 22 22 19.6 15.4 13 22 6.4 19.6 4 13 10.6Z"
                />
              </svg>
            </button>
          </div>
        </header>

        <div class="jse-file-gallery__stage">
          <button
            v-if="previewableFiles.length > 1"
            type="button"
            class="jse-file-gallery__nav"
            aria-label="Previous image"
            @click="activeIndex = (activeIndex - 1 + previewableFiles.length) % previewableFiles.length"
          >
            ‹
          </button>

          <img
            v-if="activeFile && thumbnails[activeFile.id]"
            :src="thumbnails[activeFile.id]"
            :alt="activeFile.name"
            class="jse-file-gallery__image"
          />

          <button
            v-if="previewableFiles.length > 1"
            type="button"
            class="jse-file-gallery__nav"
            aria-label="Next image"
            @click="activeIndex = (activeIndex + 1) % previewableFiles.length"
          >
            ›
          </button>
        </div>

        <div v-if="previewableFiles.length > 1" class="jse-file-gallery__thumbs">
          <button
            v-for="(file, index) in previewableFiles"
            :key="file.id"
            type="button"
            class="jse-file-gallery__thumb"
            :class="{ 'jse-file-gallery__thumb--active': index === activeIndex }"
            :aria-label="file.name"
            @click="activeIndex = index"
          >
            <img v-if="thumbnails[file.id]" :src="thumbnails[file.id]" :alt="file.name" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
