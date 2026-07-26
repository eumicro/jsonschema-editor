import type { UiPath } from "./ui-editor";

/** Resolves an insert index from a pointer position over a layout stack. */
export function resolveStackInsertIndex(stack: HTMLElement, clientY: number): number {
  const childBlocks = [...stack.querySelectorAll(":scope > .jse-layout-block")];
  if (childBlocks.length === 0) return 0;

  for (let index = 0; index < childBlocks.length; index += 1) {
    const rect = childBlocks[index].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) {
      return index;
    }
  }

  return childBlocks.length;
}

let activeDragSourcePathKey: string | null = null;
let activePaletteKind: string | null = null;

export const UI_PALETTE_PREFIX = "jse-palette:";

export function setActiveLayoutDragSourcePath(
  path: UiPath | null,
  pathKeyFn: (path: UiPath) => string,
): void {
  activeDragSourcePathKey = path ? pathKeyFn(path) : null;
  if (path) activePaletteKind = null;
}

export function getActiveLayoutDragSourcePath(
  pathKeyFn: (key: string) => UiPath,
): UiPath | null {
  return activeDragSourcePathKey ? pathKeyFn(activeDragSourcePathKey) : null;
}

export function setActivePaletteKind(kind: string | null): void {
  activePaletteKind = kind;
  if (kind) activeDragSourcePathKey = null;
}

export function getActivePaletteKind(): string | null {
  return activePaletteKind;
}

export function encodePaletteDragData(kind: string): string {
  return `${UI_PALETTE_PREFIX}${kind}`;
}

export function parsePaletteDragData(data: string | null | undefined): string | null {
  if (!data || !data.startsWith(UI_PALETTE_PREFIX)) return null;
  const kind = data.slice(UI_PALETTE_PREFIX.length);
  return kind || null;
}

export function clearLayoutDragState(): void {
  activeDragSourcePathKey = null;
  activePaletteKind = null;
}
