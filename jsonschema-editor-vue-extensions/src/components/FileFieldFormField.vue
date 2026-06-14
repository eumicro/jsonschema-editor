<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRef, watch } from "vue";
import { ArraySchema, type SchemaDocument, type SchemaNode } from "@jsonschema-editor/json-schema";
import {
  isFileDescriptor,
  isPreviewableMimeType,
  matchesFileAccept,
  normalizeFileConfig,
  readFileConfig,
  resolveUploadMimeType,
  type FileDescriptor,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseSchemaFormField,
  useArrayFieldValue,
  useFormFieldLabel,
  useScopedField,
} from "@jsonschema-editor/vue";
import FileGalleryDialog from "./FileGalleryDialog.vue";
import { useFileFieldProvider } from "../file-field-provider.js";

const props = defineProps<{
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
}>();

const rootSchema = toRef(props, "schema");
const documentRef = toRef(props, "document");
const labelRef = toRef(props, "label");
const i18nKeyRef = toRef(props, "i18nKey");
const rootData = defineModel<Record<string, unknown>>({ required: true });

const { fieldSchema, value, path } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const arrayValue = useArrayFieldValue(rootData, path);
const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

const provider = useFileFieldProvider();
const fileInput = ref<HTMLInputElement | null>(null);
const uploadError = ref<string | null>(null);
const uploading = ref(false);
const thumbnails = ref<Record<string, string | undefined>>({});
const galleryOpen = ref(false);
const galleryStartIndex = ref(0);

const fileConfig = computed(() => {
  const node = resolvedSchema.value;
  return node ? normalizeFileConfig(readFileConfig(node)) : undefined;
});

const isMultiple = computed(() => {
  const node = resolvedSchema.value;
  if (!node) return false;
  if (node instanceof ArraySchema) return true;
  return fileConfig.value?.multiple ?? false;
});

const files = computed<FileDescriptor[]>(() => {
  if (isMultiple.value) {
    return arrayValue.value.filter(isFileDescriptor);
  }
  return isFileDescriptor(value.value) ? [value.value] : [];
});

const canAddMore = computed(() => {
  if (props.readonly || !fileConfig.value) return false;
  if (!isMultiple.value) return files.value.length === 0;
  return files.value.length < fileConfig.value.maxFiles;
});

const acceptAttribute = computed(() => fileConfig.value?.accept.join(",") ?? undefined);

const fieldContext = computed(() => ({ scope: props.scope }));

async function refreshThumbnails(list: FileDescriptor[]): Promise<void> {
  const next: Record<string, string | undefined> = {};
  for (const file of list) {
    if (!isPreviewableMimeType(file.mimeType) || !provider.renderThumbnail) {
      next[file.id] = undefined;
      continue;
    }
    try {
      next[file.id] = await provider.renderThumbnail(file, fieldContext.value);
    } catch {
      next[file.id] = undefined;
    }
  }
  thumbnails.value = next;
}

watch(files, (list) => {
  void refreshThumbnails(list);
}, { immediate: true });

onBeforeUnmount(() => {
  for (const url of Object.values(thumbnails.value)) {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }
});

function openFilePicker(): void {
  uploadError.value = null;
  fileInput.value?.click();
}

async function onInputChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const batch = Array.from(input.files ?? []);
  input.value = "";
  if (!batch.length || !fileConfig.value) return;

  uploading.value = true;
  uploadError.value = null;

  try {
    const remaining = isMultiple.value
      ? fileConfig.value.maxFiles - files.value.length
      : 1;
    const filesToUpload = batch.slice(0, Math.max(remaining, 0));

    for (const file of filesToUpload) {
      if (fileConfig.value.maxSize !== undefined && file.size > fileConfig.value.maxSize) {
        uploadError.value = `File too large: ${file.name}`;
        continue;
      }
      const meta = {
        name: file.name,
        mimeType: resolveUploadMimeType(file.name, file.type),
        size: file.size,
      };
      if (!matchesFileAccept(meta, fileConfig.value.accept)) {
        uploadError.value = `File type not allowed: ${file.name}`;
        continue;
      }

      const descriptor = await provider.store(file, meta, fieldContext.value);

      if (isMultiple.value) {
        arrayValue.value = [...files.value, descriptor];
      } else {
        value.value = descriptor;
      }
    }
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : "Upload failed";
  } finally {
    uploading.value = false;
  }
}

async function removeFile(file: FileDescriptor): Promise<void> {
  if (props.readonly) return;
  try {
    await provider.delete(file, fieldContext.value);
  } catch {
    // Still remove reference from form data when provider cleanup fails.
  }

  if (isMultiple.value) {
    arrayValue.value = files.value.filter((entry) => entry.id !== file.id);
  } else {
    value.value = null;
  }
}

function openGallery(file: FileDescriptor): void {
  const previewable = files.value.filter((entry) => isPreviewableMimeType(entry.mimeType));
  const index = previewable.findIndex((entry) => entry.id === file.id);
  if (index < 0) return;
  galleryStartIndex.value = index;
  galleryOpen.value = true;
}

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<template>
  <JseSchemaFormField
    :label="displayLabel"
    :description="description"
    :scope="scope"
  >
    <div class="jse-file-field">
      <input
        ref="fileInput"
        class="jse-file-field__input"
        type="file"
        :accept="acceptAttribute"
        :multiple="isMultiple"
        :disabled="readonly || !canAddMore || uploading"
        @change="onInputChange"
      />

      <div v-if="files.length" class="jse-file-field__list">
        <article v-for="file in files" :key="file.id" class="jse-file-field__item">
          <div class="jse-file-field__preview">
            <img
              v-if="thumbnails[file.id]"
              :src="thumbnails[file.id]"
              :alt="file.name"
              class="jse-file-field__thumb-image"
            />
            <div v-else class="jse-file-field__thumb-fallback" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path
                  fill="currentColor"
                  d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM8 11h8v2H8v-2Zm0 4h8v2H8v-2Z"
                />
              </svg>
            </div>
          </div>

          <div class="jse-file-field__meta">
            <span class="jse-file-field__name">{{ file.name }}</span>
            <span class="jse-file-field__size">{{ formatSize(file.size) }}</span>
          </div>

          <div class="jse-file-field__actions">
            <button
              v-if="isPreviewableMimeType(file.mimeType)"
              type="button"
              class="jse-file-field__icon-btn"
              title="Preview"
              aria-label="Preview file"
              @click="openGallery(file)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5C21.3 7.6 17 4.5 12 4.5Zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                />
              </svg>
            </button>
            <button
              v-if="!readonly"
              type="button"
              class="jse-file-field__icon-btn jse-file-field__icon-btn--danger"
              title="Delete"
              aria-label="Delete file"
              @click="removeFile(file)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v9h-2V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Z"
                />
              </svg>
            </button>
          </div>
        </article>
      </div>

      <button
        v-if="canAddMore"
        type="button"
        class="jse-file-field__upload-btn"
        :disabled="uploading"
        @click="openFilePicker"
      >
        {{ uploading ? "Uploading…" : isMultiple ? "Add files" : "Choose file" }}
      </button>

      <p v-if="uploadError" class="jse-file-field__error" role="alert">{{ uploadError }}</p>
    </div>

    <FileGalleryDialog
      :open="galleryOpen"
      :files="files"
      :thumbnails="thumbnails"
      :start-index="galleryStartIndex"
      :readonly="readonly"
      @close="galleryOpen = false"
      @delete="removeFile"
    />
  </JseSchemaFormField>
</template>
