import type { UiSchemaObject } from "../types.js";
import type { UiElement } from "./node.js";

export class UiSchemaDocument {
  constructor(private _root: UiElement) {}

  get root(): UiElement {
    return this._root;
  }

  set root(value: UiElement) {
    this._root = value;
  }

  toJSON(): UiSchemaObject {
    return this._root.toJSON();
  }
}
