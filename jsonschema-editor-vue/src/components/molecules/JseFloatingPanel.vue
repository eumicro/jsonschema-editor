<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from "vue";
import { useFloatingPanel } from "../../composables/useFloatingPanel";
import JseIconButton from "../atoms/JseIconButton.vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    initialX?: number;
    initialY?: number;
    initialWidth?: number;
    initialHeight?: number;
  }>(),
  {
    initialX: 24,
    initialY: 24,
    initialWidth: 320,
    initialHeight: 280,
  },
);

const emit = defineEmits<{ "update:modelValue": [open: boolean] }>();

const panel = useFloatingPanel({
  initialX: props.initialX,
  initialY: props.initialY,
  initialWidth: props.initialWidth,
  initialHeight: props.initialHeight,
});

const panelStyle = computed(() => ({
  left: `${panel.rect.value.x}px`,
  top: `${panel.rect.value.y}px`,
  width: `${panel.rect.value.width}px`,
  height: panel.minimized.value ? `${panel.minimizedHeight}px` : `${panel.rect.value.height}px`,
}));

watch(
  () => props.modelValue,
  (value) => {
    if (value) panel.show();
    else panel.hide();
  },
  { flush: "sync" },
);

watch(
  panel.open,
  (value) => {
    if (value !== props.modelValue) emit("update:modelValue", value);
  },
  { flush: "sync" },
);

function close() {
  emit("update:modelValue", false);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) window.addEventListener("keydown", onKeydown);
    else window.removeEventListener("keydown", onKeydown);
  },
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

function anchorNear(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  panel.show({
    x: Math.min(bounds.right + 8, window.innerWidth - panel.rect.value.width - 16),
    y: Math.max(16, bounds.top),
  });
}

defineExpose({ anchorNear, show: panel.show });
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="jse-floating-panel"
      :style="panelStyle"
      role="dialog"
      :aria-label="title"
    >
      <header class="jse-floating-panel__header" @pointerdown="panel.startDrag">
        <span class="jse-floating-panel__title">{{ title }}</span>
        <div class="jse-floating-panel__controls">
          <JseIconButton
            :label="panel.minimized.value ? 'Vergrößern' : 'Verkleinern'"
            @click.stop="panel.toggleMinimized()"
          >
            {{ panel.minimized.value ? "□" : "−" }}
          </JseIconButton>
          <JseIconButton label="Schließen" @click.stop="close">×</JseIconButton>
        </div>
      </header>

      <div v-show="!panel.minimized.value" class="jse-floating-panel__body">
        <slot />
      </div>

      <div
        v-if="!panel.minimized.value"
        class="jse-floating-panel__resize"
        aria-hidden="true"
        @pointerdown="panel.startResize"
      />
    </div>
  </Teleport>
</template>
