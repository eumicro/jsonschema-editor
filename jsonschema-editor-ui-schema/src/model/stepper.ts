import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import type { UiSchemaObject } from "../types.js";
import { UiCustomAttributeCollection } from "./custom-attributes.js";
import type { UiSchemaFactory } from "./factory.js";
import type { UiElement } from "./node.js";
import { LabeledLayout, UnlabeledLayout } from "./simple-layout.js";
import type { UiElementVisitor } from "./visitor.js";

export class Stepper extends UnlabeledLayout {
  readonly elementKind = "Stepper" as const;

  constructor(
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
  }

  protected validateChild(child: UiElement): void {
    if (child.elementKind !== "Step") {
      throw new Error("Stepper darf nur Step-Elemente enthalten.");
    }
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): Stepper {
    const node = new Stepper(factory.attributeRegistry);
    node.populateFromJSON(json, factory);
    return node;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitStepper(this);
  }

  deepClone(): Stepper {
    return this.finishClone(new Stepper(undefined, this.cloneAttributes()));
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    this.writeUnlabeledDefinition(json);
  }
}

export class Step extends LabeledLayout {
  readonly elementKind = "Step" as const;

  constructor(
    label?: string,
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
    this._label = label;
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): Step {
    const node = new Step(json.label, factory.attributeRegistry);
    node.populateFromJSON(json, factory);
    return node;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitStep(this);
  }

  deepClone(): Step {
    return this.finishClone(new Step(this._label, undefined, this.cloneAttributes()));
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    this.writeLabeledDefinition(json);
  }
}
