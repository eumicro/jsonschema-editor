import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import type { UiSchemaObject } from "../types.js";
import { UiCustomAttributeCollection } from "./custom-attributes.js";
import type { UiSchemaFactory } from "./factory.js";
import type { UiElement } from "./node.js";
import { LabeledLayout, UnlabeledLayout } from "./simple-layout.js";
import type { UiElementVisitor } from "./visitor.js";

export class Categorization extends UnlabeledLayout {
  readonly elementKind = "Categorization" as const;

  constructor(
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
  }

  protected validateChild(child: UiElement): void {
    if (child.elementKind !== "Category") {
      throw new Error("Categorization darf nur Category-Elemente enthalten.");
    }
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): Categorization {
    const node = new Categorization(factory.attributeRegistry);
    node.populateFromJSON(json, factory);
    return node;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitCategorization(this);
  }

  deepClone(): Categorization {
    return this.finishClone(new Categorization(undefined, this.cloneAttributes()));
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    this.writeUnlabeledDefinition(json);
  }
}

export class Category extends LabeledLayout {
  readonly elementKind = "Category" as const;

  constructor(
    label?: string,
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
    this._label = label;
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): Category {
    const node = new Category(json.label, factory.attributeRegistry);
    node.populateFromJSON(json, factory);
    return node;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitCategory(this);
  }

  deepClone(): Category {
    return this.finishClone(new Category(this._label, undefined, this.cloneAttributes()));
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    this.writeLabeledDefinition(json);
  }
}
