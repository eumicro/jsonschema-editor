import { useCallback, useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [rect, setRect] = useState<FloatingPanelRect>({
    x: options.initialX ?? 24,
    y: options.initialY ?? 24,
    width: options.initialWidth ?? 320,
    height: options.initialHeight ?? 280,
  });

  const minWidth = options.minWidth ?? 260;
  const minHeight = options.minHeight ?? 160;
  const minimizedHeight = options.minimizedHeight ?? 42;

  const dragStartRef = useRef<{
    x: number;
    y: number;
    rectX: number;
    rectY: number;
  } | null>(null);
  const resizeStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const clampPosition = useCallback((next: FloatingPanelRect): FloatingPanelRect => {
    const maxX = Math.max(0, window.innerWidth - next.width - 8);
    const maxY = Math.max(0, window.innerHeight - 40);
    return {
      ...next,
      x: Math.min(Math.max(8, next.x), maxX),
      y: Math.min(Math.max(8, next.y), maxY),
    };
  }, []);

  const onDragMoveRef = useRef<(event: PointerEvent) => void>(() => undefined);
  const onDragEndRef = useRef<() => void>(() => undefined);
  const onResizeMoveRef = useRef<(event: PointerEvent) => void>(() => undefined);
  const onResizeEndRef = useRef<() => void>(() => undefined);

  onDragMoveRef.current = (event: PointerEvent) => {
    const dragStart = dragStartRef.current;
    if (!dragStart) return;
    setRect((current) =>
      clampPosition({
        ...current,
        x: dragStart.rectX + (event.clientX - dragStart.x),
        y: dragStart.rectY + (event.clientY - dragStart.y),
      }),
    );
  };

  onDragEndRef.current = () => {
    dragStartRef.current = null;
    window.removeEventListener("pointermove", onDragMoveRef.current);
    window.removeEventListener("pointerup", onDragEndRef.current);
  };

  onResizeMoveRef.current = (event: PointerEvent) => {
    const resizeStart = resizeStartRef.current;
    if (!resizeStart) return;
    setRect((current) =>
      clampPosition({
        ...current,
        width: Math.max(minWidth, resizeStart.width + (event.clientX - resizeStart.x)),
        height: Math.max(minHeight, resizeStart.height + (event.clientY - resizeStart.y)),
      }),
    );
  };

  onResizeEndRef.current = () => {
    resizeStartRef.current = null;
    window.removeEventListener("pointermove", onResizeMoveRef.current);
    window.removeEventListener("pointerup", onResizeEndRef.current);
  };

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0) return;
      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        rectX: rect.x,
        rectY: rect.y,
      };
      window.addEventListener("pointermove", onDragMoveRef.current);
      window.addEventListener("pointerup", onDragEndRef.current);
    },
    [rect.x, rect.y],
  );

  const startResize = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0 || minimized) return;
      event.stopPropagation();
      resizeStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        width: rect.width,
        height: rect.height,
      };
      window.addEventListener("pointermove", onResizeMoveRef.current);
      window.addEventListener("pointerup", onResizeEndRef.current);
    },
    [minimized, rect.height, rect.width],
  );

  const toggleMinimized = useCallback(() => {
    setMinimized((value) => !value);
  }, []);

  const show = useCallback(
    (at?: Partial<FloatingPanelRect>) => {
      setRect((current) => {
        const next = {
          x: at?.x ?? current.x,
          y: at?.y ?? current.y,
          width: at?.width ?? current.width,
          height: at?.height ?? current.height,
        };
        return clampPosition(next);
      });
      setMinimized(false);
      setOpen(true);
    },
    [clampPosition],
  );

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      onDragEndRef.current();
      onResizeEndRef.current();
    };
  }, []);

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
  panel: FloatingPanelRect,
  element: HTMLElement,
  panelWidth = panel.width,
): Partial<FloatingPanelRect> {
  const bounds = element.getBoundingClientRect();
  const x = Math.min(bounds.right + 8, window.innerWidth - panelWidth - 16);
  const y = Math.max(16, bounds.top);
  return { x, y };
}
