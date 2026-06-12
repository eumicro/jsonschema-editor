import type { UiElementKind, UiSchemaObject } from "../types.js";
import type { UiSchemaFactory } from "./factory.js";
import type { UiElementVisitor } from "./visitor.js";
import { UiCustomAttributeCollection } from "./custom-attributes.js";
import { UiRule } from "./ui-rule.js";

export type { UiElementKind };

export abstract class UiElement {
  protected _rule?: UiRule;
  protected _options: Record<string, unknown> = {};
  protected _i18n?: string;

  protected constructor(protected readonly customAttributes: UiCustomAttributeCollection) {}

  abstract readonly elementKind: UiElementKind;

  abstract accept<T>(visitor: UiElementVisitor<T>): T;
  abstract deepClone(): UiElement;

  protected abstract writeElementDefinition(json: UiSchemaObject): void;

  get rule(): UiRule | undefined {
    return this._rule;
  }

  set rule(value: UiRule | undefined) {
    this._rule = value;
  }

  get i18n(): string | undefined {
    return this._i18n;
  }

  set i18n(value: string | undefined) {
    this._i18n = value;
  }

  get options(): Readonly<Record<string, unknown>> {
    return this._options;
  }

  setOption(key: string, value: unknown): this {
    this._options[key] = value;
    return this;
  }

  toJSON(): UiSchemaObject {
    const json: UiSchemaObject = { type: this.elementKind };
    this.writeElementDefinition(json);
    this.writeI18nTo(json);
    this.writeRuleTo(json);
    this.writeOptionsTo(json);
    this.customAttributes.writeTo(json);
    return json;
  }

  clone(): UiElement {
    return this.deepClone();
  }

  get elementType(): UiElementKind {
    return this.elementKind;
  }

  getCustomAttribute<T = unknown>(name: string): T | undefined {
    return this.customAttributes.get(name) as T | undefined;
  }

  setCustomAttribute(name: string, value: unknown): void {
    this.customAttributes.set(name, value);
  }

  protected cloneAttributes(): UiCustomAttributeCollection {
    return this.customAttributes.clone();
  }

  protected applyCustomAttributes(json: UiSchemaObject): void {
    this.customAttributes.applyFrom(json);
  }

  protected applyRuleFrom(json: UiSchemaObject): void {
    this._rule = json.rule ? UiRule.fromJSON(json.rule) : undefined;
  }

  protected applyOptionsFrom(json: UiSchemaObject): void {
    this._options = json.options ? { ...json.options } : {};
  }

  protected applyI18nFrom(json: UiSchemaObject): void {
    this._i18n = typeof json.i18n === "string" ? json.i18n : undefined;
  }

  protected writeRuleTo(json: UiSchemaObject): void {
    if (this._rule) json.rule = this._rule.toJSON();
  }

  protected writeOptionsTo(json: UiSchemaObject): void {
    if (Object.keys(this._options).length) {
      json.options = { ...this._options };
    }
  }

  protected writeI18nTo(json: UiSchemaObject): void {
    if (this._i18n !== undefined) json.i18n = this._i18n;
  }

  protected copyElementStateTo(target: UiElement): void {
    target._rule = this._rule?.clone();
    target._options = { ...this._options };
    target._i18n = this._i18n;
  }
}

export abstract class UiLayout extends UiElement {
  protected readonly childElements: UiElement[] = [];

  get elements(): readonly UiElement[] {
    return this.childElements;
  }

  protected validateChild(_child: UiElement): void {
    // Unterklassen können Kind-Typen einschränken.
  }

  addChild(element: UiElement): this {
    this.validateChild(element);
    this.childElements.push(element);
    return this;
  }

  getChild(index: number): UiElement | undefined {
    return this.childElements[index];
  }

  setChild(index: number, element: UiElement): this {
    if (index < 0 || index >= this.childElements.length) {
      throw new Error(`Kind-Index ${index} außerhalb des Bereichs.`);
    }
    this.validateChild(element);
    this.childElements[index] = element;
    return this;
  }

  removeChild(index: number): this {
    if (index < 0 || index >= this.childElements.length) {
      throw new Error(`Kind-Index ${index} außerhalb des Bereichs.`);
    }
    this.childElements.splice(index, 1);
    return this;
  }

  insertChild(index: number, element: UiElement): this {
    this.validateChild(element);
    const insertAt = Math.max(0, Math.min(index, this.childElements.length));
    this.childElements.splice(insertAt, 0, element);
    return this;
  }

  moveChild(fromIndex: number, toIndex: number): this {
    if (fromIndex < 0 || fromIndex >= this.childElements.length) {
      throw new Error(`Kind-Index ${fromIndex} außerhalb des Bereichs.`);
    }
    const [moved] = this.childElements.splice(fromIndex, 1);
    const insertAt = Math.max(0, Math.min(toIndex, this.childElements.length));
    this.childElements.splice(insertAt, 0, moved);
    return this;
  }

  protected applyLayoutMetadataFrom(json: UiSchemaObject, factory: UiSchemaFactory): void {
    this.readChildElements(json, factory);
    this.applyOptionsFrom(json);
    this.applyRuleFrom(json);
    this.applyI18nFrom(json);
    this.applyCustomAttributes(json);
  }

  protected cloneChildrenTo(target: UiLayout): void {
    for (const child of this.childElements) {
      target.addChild(child.deepClone());
    }
  }

  protected writeChildElements(json: UiSchemaObject): void {
    if (this.childElements.length) {
      json.elements = this.childElements.map((element) => element.toJSON());
    }
  }

  protected readChildElements(json: UiSchemaObject, factory: UiSchemaFactory): void {
    this.childElements.length = 0;
    for (const childJson of json.elements ?? []) {
      this.addChild(factory.fromJSON(childJson));
    }
  }
}
