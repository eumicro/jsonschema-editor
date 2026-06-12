import type { UiSchemaObject } from "../types.js";
import type { UiSchemaFactory } from "./factory.js";
import { UiLayout, type UiElement } from "./node.js";

/** Gemeinsame Logik für Layouts ohne eigenes Label-Feld. */
export abstract class UnlabeledLayout extends UiLayout {
  protected populateFromJSON(json: UiSchemaObject, factory: UiSchemaFactory): void {
    this.applyLayoutMetadataFrom(json, factory);
  }

  protected finishClone<T extends UnlabeledLayout>(copy: T): T {
    this.copyElementStateTo(copy);
    this.cloneChildrenTo(copy);
    return copy;
  }

  protected writeUnlabeledDefinition(json: UiSchemaObject): void {
    this.writeChildElements(json);
  }
}

/** Gemeinsame Logik für Layouts mit optionalem `label`. */
export abstract class LabeledLayout extends UnlabeledLayout {
  protected _label?: string;

  get label(): string | undefined {
    return this._label;
  }

  set label(value: string | undefined) {
    this._label = value;
  }

  protected populateFromJSON(json: UiSchemaObject, factory: UiSchemaFactory): void {
    this._label = json.label;
    super.populateFromJSON(json, factory);
  }

  protected writeLabeledDefinition(json: UiSchemaObject): void {
    if (this._label !== undefined) json.label = this._label;
    this.writeUnlabeledDefinition(json);
  }

  protected copyElementStateTo(target: UiElement): void {
    super.copyElementStateTo(target);
    if (target instanceof LabeledLayout) {
      target._label = this._label;
    }
  }
}
