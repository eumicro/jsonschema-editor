import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import type { UiSchemaObject } from "../types.js";
import { UiCustomAttributeCollection } from "./custom-attributes.js";
import type { UiSchemaFactory } from "./factory.js";
import { UiElement } from "./node.js";
import type { UiElementVisitor } from "./visitor.js";

export class Control extends UiElement {
  readonly elementKind = "Control" as const;

  constructor(
    private _scope: string,
    private _label?: string,
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
  }

  get scope(): string {
    return this._scope;
  }

  set scope(value: string) {
    this._scope = value;
  }

  get label(): string | undefined {
    return this._label;
  }

  set label(value: string | undefined) {
    this._label = value;
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): Control {
    const control = new Control(json.scope ?? "#", json.label, factory.attributeRegistry);
    control.applyOptionsFrom(json);
    control.applyRuleFrom(json);
    control.applyI18nFrom(json);
    control.applyCustomAttributes(json);
    return control;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitControl(this);
  }

  deepClone(): Control {
    const copy = new Control(this._scope, this._label, undefined, this.cloneAttributes());
    this.copyElementStateTo(copy);
    return copy;
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    json.scope = this._scope;
    if (this._label !== undefined) json.label = this._label;
  }
}
