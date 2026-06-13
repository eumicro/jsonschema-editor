import type { UiPath } from "./ui-editor";

/** Resolves an insert index from a pointer position over a layout stack. */
export function resolveStackInsertIndex(stack: HTMLElement, clientY: number): number {  const childBlocks = [...stack.querySelectorAll(":scope > .jse-layout-block")];
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

export function setActiveLayoutDragSourcePath(path: UiPath | null, pathKeyFn: (path: UiPath) => string): void {
  activeDragSourcePathKey = path ? pathKeyFn(path) : null;
}

export function getActiveLayoutDragSourcePath(pathKeyFn: (key: string) => UiPath): UiPath | null {
  return activeDragSourcePathKey ? pathKeyFn(activeDragSourcePathKey) : null;
}
