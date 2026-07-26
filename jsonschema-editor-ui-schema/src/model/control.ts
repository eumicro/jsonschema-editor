import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import type { UiSchemaObject } from "../types.js";
import { UiCustomAttributeCollection } from "./custom-attributes.js";
import type { UiSchemaFactory } from "./factory.js";
import { UiElement } from "./node.js";
import type { UiElementVisitor } from "./visitor.js";

/**
 * JSON Forms Control. Nested item/object UI lives in `options.detail`
 * (@see https://jsonforms.io/docs/uischema/controls/#detail).
 */
export class Control extends UiElement {
  readonly elementKind = "Control" as const;

  private _detail?: UiElement;

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

  /** Nested UI Schema from `options.detail` (object form; `"GENERATE"` is ignored). */
  get detail(): UiElement | undefined {
    return this._detail;
  }

  set detail(value: UiElement | undefined) {
    this._detail = value;
  }

  static fromJSON(json: UiSchemaObject, factory: UiSchemaFactory): Control {
    const control = new Control(json.scope ?? "#", json.label, factory.attributeRegistry);
    const rawOptions = json.options ? { ...json.options } : {};
    const detailRaw = rawOptions.detail;
    delete rawOptions.detail;
    control._options = rawOptions;
    control.applyRuleFrom(json);
    control.applyI18nFrom(json);
    control.applyCustomAttributes(json);

    if (detailRaw && typeof detailRaw === "object" && !Array.isArray(detailRaw)) {
      control._detail = factory.fromJSON(detailRaw as UiSchemaObject);
    }

    return control;
  }

  accept<T>(visitor: UiElementVisitor<T>): T {
    return visitor.visitControl(this);
  }

  deepClone(): Control {
    const copy = new Control(this._scope, this._label, undefined, this.cloneAttributes());
    this.copyElementStateTo(copy);
    copy._detail = this._detail?.clone();
    return copy;
  }

  protected writeElementDefinition(json: UiSchemaObject): void {
    json.scope = this._scope;
    if (this._label !== undefined) json.label = this._label;
  }

  protected writeOptionsTo(json: UiSchemaObject): void {
    const options: Record<string, unknown> = { ...this._options };
    if (this._detail) {
      options.detail = this._detail.toJSON();
    }
    if (Object.keys(options).length) {
      json.options = options;
    }
  }

  protected copyElementStateTo(target: UiElement): void {
    super.copyElementStateTo(target);
    if (target instanceof Control) {
      target._detail = undefined;
    }
  }
}
