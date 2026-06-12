import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import type { UiSchemaObject } from "../types.js";
import { UiCustomAttributeCollection } from "./custom-attributes.js";
import type { UiSchemaFactory } from "./factory.js";
import { LabeledLayout, UnlabeledLayout } from "./simple-layout.js";
import type { UiElementVisitor } from "./visitor.js";

export class VerticalLayout extends UnlabeledLayout {
  readonly elementKind = "VerticalLayout" as const;

  constructor(
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): VerticalLayout {
    const layout = new VerticalLayout(factory.attributeRegistry);
    layout.populateFromJSON(json, factory);
    return layout;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitVerticalLayout(this);
  }

  deepClone(): VerticalLayout {
    return this.finishClone(new VerticalLayout(undefined, this.cloneAttributes()));
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    this.writeUnlabeledDefinition(json);
  }
}

export class HorizontalLayout extends UnlabeledLayout {
  readonly elementKind = "HorizontalLayout" as const;

  constructor(
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): HorizontalLayout {
    const layout = new HorizontalLayout(factory.attributeRegistry);
    layout.populateFromJSON(json, factory);
    return layout;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitHorizontalLayout(this);
  }

  deepClone(): HorizontalLayout {
    return this.finishClone(new HorizontalLayout(undefined, this.cloneAttributes()));
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    this.writeUnlabeledDefinition(json);
  }
}

export class Group extends LabeledLayout {
  readonly elementKind = "Group" as const;

  constructor(
    label?: string,
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
    this._label = label;
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): Group {
    const group = new Group(json.label, factory.attributeRegistry);
    group.populateFromJSON(json, factory);
    return group;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitGroup(this);
  }

  deepClone(): Group {
    return this.finishClone(new Group(this._label, undefined, this.cloneAttributes()));
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    this.writeLabeledDefinition(json);
  }
}
