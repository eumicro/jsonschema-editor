import { onBeforeUnmount, ref, type Ref } from "vue";

export interface FloatingPanelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseFloatingPanelOptions {
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  minimizedHeight?: number;
}

export function useFloatingPanel(options: UseFloatingPanelOptions = {}) {
  const open = ref(false);
  const minimized = ref(false);
  const rect = ref<FloatingPanelRect>({
    x: options.initialX ?? 24,
    y: options.initialY ?? 24,
    width: options.initialWidth ?? 320,
    height: options.initialHeight ?? 280,
  });

  const minWidth = options.minWidth ?? 260;
  const minHeight = options.minHeight ?? 160;
  const minimizedHeight = options.minimizedHeight ?? 42;

  let dragStart: { x: number; y: number; rectX: number; rectY: number } | null = null;
  let resizeStart: { x: number; y: number; width: number; height: number } | null = null;

  function clampPosition() {
    const maxX = Math.max(0, window.innerWidth - rect.value.width - 8);
    const maxY = Math.max(0, window.innerHeight - 40);
    rect.value.x = Math.min(Math.max(8, rect.value.x), maxX);
    rect.value.y = Math.min(Math.max(8, rect.value.y), maxY);
  }

  function onDragMove(event: PointerEvent) {
    if (!dragStart) return;
    rect.value.x = dragStart.rectX + (event.clientX - dragStart.x);
    rect.value.y = dragStart.rectY + (event.clientY - dragStart.y);
    clampPosition();
  }

  function onDragEnd() {
    dragStart = null;
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragEnd);
  }

  function startDrag(event: PointerEvent) {
    if (event.button !== 0) return;
    dragStart = {
      x: event.clientX,
      y: event.clientY,
      rectX: rect.value.x,
      rectY: rect.value.y,
    };
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDragEnd);
  }

  function onResizeMove(event: PointerEvent) {
    if (!resizeStart) return;
    rect.value.width = Math.max(minWidth, resizeStart.width + (event.clientX - resizeStart.x));
    rect.value.height = Math.max(minHeight, resizeStart.height + (event.clientY - resizeStart.y));
    clampPosition();
  }

  function onResizeEnd() {
    resizeStart = null;
    window.removeEventListener("pointermove", onResizeMove);
    window.removeEventListener("pointerup", onResizeEnd);
  }

  function startResize(event: PointerEvent) {
    if (event.button !== 0 || minimized.value) return;
    event.stopPropagation();
    resizeStart = {
      x: event.clientX,
      y: event.clientY,
      width: rect.value.width,
      height: rect.value.height,
    };
    window.addEventListener("pointermove", onResizeMove);
    window.addEventListener("pointerup", onResizeEnd);
  }

  function toggleMinimized() {
    minimized.value = !minimized.value;
  }

  function show(at?: Partial<FloatingPanelRect>) {
    if (at?.x !== undefined) rect.value.x = at.x;
    if (at?.y !== undefined) rect.value.y = at.y;
    if (at?.width !== undefined) rect.value.width = at.width;
    if (at?.height !== undefined) rect.value.height = at.height;
    minimized.value = false;
    open.value = true;
    clampPosition();
  }

  function hide() {
    open.value = false;
  }

  onBeforeUnmount(() => {
    onDragEnd();
    onResizeEnd();
  });

  return {
    open,
    minimized,
    rect,
    minimizedHeight,
    startDrag,
    startResize,
    toggleMinimized,
    show,
    hide,
  };
}

export type FloatingPanelController = ReturnType<typeof useFloatingPanel>;

export function anchorPanelNearElement(
  panel: Ref<FloatingPanelRect>,
  element: HTMLElement,
  panelWidth = panel.value.width,
) {
  const bounds = element.getBoundingClientRect();
  const x = Math.min(bounds.right + 8, window.innerWidth - panelWidth - 16);
  const y = Math.max(16, bounds.top);
  panel.value.x = x;
  panel.value.y = y;
}
