import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import type { UiSchemaObject } from "../types.js";
import { UiCustomAttributeCollection } from "./custom-attributes.js";
import type { UiSchemaFactory } from "./factory.js";
import { UiElement } from "./node.js";
import type { UiElementVisitor } from "./visitor.js";

export class Label extends UiElement {
  readonly elementKind = "Label" as const;

  constructor(
    private _text: string,
    registry?: UiSchemaAttributeRegistry,
    customAttributes?: UiCustomAttributeCollection,
  ) {
    super(customAttributes ?? new UiCustomAttributeCollection(registry));
  }

  get text(): string {
    return this._text;
  }

  set text(value: string) {
    this._text = value;
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): Label {
    const label = new Label(json.text ?? "", factory.attributeRegistry);
    label.applyRuleFrom(json);
    label.applyI18nFrom(json);
    label.applyCustomAttributes(json);
    return label;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitLabel(this);
  }

  deepClone(): Label {
    const copy = new Label(this._text, undefined, this.cloneAttributes());
    this.copyElementStateTo(copy);
    return copy;
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    json.text = this._text;
  }
}
