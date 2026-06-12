<script setup lang="ts">
import JseIconButton from "../atoms/JseIconButton.vue";

defineProps<{
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  addLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}>();

defineEmits<{
  add: [event: MouseEvent];
  edit: [event: MouseEvent];
  delete: [];
}>();
</script>

<template>
  <div class="jse-tree-node__actions">
    <JseIconButton
      v-if="showAdd"
      variant="primary"
      :label="addLabel ?? 'Element hinzufügen'"
      @click.stop="$emit('add', $event)"
    >
      +
    </JseIconButton>
    <JseIconButton
      v-if="showEdit"
      :label="editLabel ?? 'Attribute bearbeiten'"
      @click.stop="$emit('edit', $event)"
    >
      <svg
        class="jse-icon-btn__svg"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M11.5 1.5a1.414 1.414 0 0 1 2 2L5.5 11.5 2 12l.5-3.5L11.5 1.5Zm1-1a2.414 2.414 0 0 0-3.414 0L1.086 9.5a.5.5 0 0 0-.121.196l-1 3.5A.5.5 0 0 0 .5 14a.5.5 0 0 0 .121-.01l3.5-1a.5.5 0 0 0 .196-.121l8-8A2.414 2.414 0 0 0 12.5.5Z"
        />
      </svg>
    </JseIconButton>
    <JseIconButton
      v-if="showDelete"
      variant="danger"
      :label="deleteLabel ?? 'Element löschen'"
      @click.stop="$emit('delete')"
    >
      <svg
        class="jse-icon-btn__svg"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="currentColor"
          d="M5.5 2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1h3.5a.5.5 0 0 1 0 1H12v9.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 12.5V3H2.5a.5.5 0 0 1 0-1H5.5Zm1 0h3v-.25a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25V2ZM5 3v9.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V3H5Zm2 2.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Z"
        />
      </svg>
    </JseIconButton>
  </div>
</template>
