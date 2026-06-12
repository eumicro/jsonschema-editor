import type { JsonSchemaObject } from "../types.js";

export class SchemaMetadata {
  private _title?: string;
  private _description?: string;
  private _defaultValue?: unknown;
  private _examples?: unknown[];
  private _enumValues?: unknown[];
  private _constValue?: unknown;

  get title(): string | undefined {
    return this._title;
  }

  set title(value: string | undefined) {
    this._title = value;
  }

  get description(): string | undefined {
    return this._description;
  }

  set description(value: string | undefined) {
    this._description = value;
  }

  get defaultValue(): unknown {
    return this._defaultValue;
  }

  set defaultValue(value: unknown) {
    this._defaultValue = value;
  }

  get examples(): unknown[] | undefined {
    return this._examples;
  }

  set examples(value: unknown[] | undefined) {
    this._examples = value;
  }

  get enumValues(): unknown[] | undefined {
    return this._enumValues;
  }

  set enumValues(value: unknown[] | undefined) {
    this._enumValues = value;
  }

  get constValue(): unknown {
    return this._constValue;
  }

  set constValue(value: unknown) {
    this._constValue = value;
  }

  applyFrom(json: JsonSchemaObject): void {
    this._title = json.title;
    this._description = json.description;
    this._defaultValue = json.default;
    this._examples = json.examples;
    this._enumValues = json.enum;
    this._constValue = json.const;
  }

  writeTo(json: JsonSchemaObject): void {
    if (this._title !== undefined) json.title = this._title;
    if (this._description !== undefined) json.description = this._description;
    if (this._defaultValue !== undefined) json.default = this._defaultValue;
    if (this._examples !== undefined) json.examples = this._examples;
    if (this._enumValues !== undefined) json.enum = this._enumValues;
    if (this._constValue !== undefined) json.const = this._constValue;
  }

  clone(): SchemaMetadata {
    const copy = new SchemaMetadata();
    copy._title = this._title;
    copy._description = this._description;
    copy._defaultValue = this._defaultValue;
    copy._examples = this._examples ? [...this._examples] : undefined;
    copy._enumValues = this._enumValues ? [...this._enumValues] : undefined;
    copy._constValue = this._constValue;
    return copy;
  }
}
