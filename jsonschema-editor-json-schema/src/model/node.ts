import type { JsonSchemaObject, JsonSchemaType } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import { SchemaMetadata } from "./metadata.js";
import { TypeVariants } from "./type-variants.js";
import type { SchemaVisitor } from "./visitor.js";

export type SchemaNodeKind =
  | "ref"
  | "composition"
  | "object"
  | "array"
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "null"
  | "untyped";

export abstract class SchemaNode {
  protected typeVariants = new TypeVariants();

  protected constructor(
    protected readonly metadata: SchemaMetadata,
    protected readonly customAttributes: CustomAttributeCollection,
  ) {}

  abstract readonly nodeKind: SchemaNodeKind;

  abstract accept<T>(visitor: SchemaVisitor<T>): T;
  abstract deepClone(): SchemaNode;
  abstract createDefaultValue(): unknown;

  protected abstract writeTypeDefinition(json: JsonSchemaObject): void;
  protected abstract resolvePathImpl(segments: readonly string[]): SchemaNode | undefined;

  resolvePath(segments: readonly string[]): SchemaNode | undefined {
    return this.resolvePathImpl(segments);
  }

  toJSON(): JsonSchemaObject {
    const json: JsonSchemaObject = {};
    this.writeTypeDefinition(json);
    this.metadata.writeTo(json);
    this.customAttributes.writeTo(json);
    return json;
  }

  resolveAtScope(scope: string): SchemaNode | undefined {
    return this.resolvePath(parseScope(scope));
  }

  clone(): SchemaNode {
    return this.deepClone();
  }

  get kind(): SchemaNodeKind {
    return this.nodeKind;
  }

  get title(): string | undefined {
    return this.metadata.title;
  }

  set title(value: string | undefined) {
    this.metadata.title = value;
  }

  get description(): string | undefined {
    return this.metadata.description;
  }

  set description(value: string | undefined) {
    this.metadata.description = value;
  }

  get defaultValue(): unknown {
    return this.metadata.defaultValue;
  }

  set defaultValue(value: unknown) {
    this.metadata.defaultValue = value;
  }

  get examples(): unknown[] | undefined {
    return this.metadata.examples;
  }

  set examples(value: unknown[] | undefined) {
    this.metadata.examples = value;
  }

  get enumValues(): unknown[] | undefined {
    return this.metadata.enumValues;
  }

  set enumValues(value: unknown[] | undefined) {
    this.metadata.enumValues = value;
  }

  get constValue(): unknown {
    return this.metadata.constValue;
  }

  set constValue(value: unknown) {
    this.metadata.constValue = value;
  }

  getCustomAttribute<T = unknown>(name: string): T | undefined {
    return this.customAttributes.get(name) as T | undefined;
  }

  setCustomAttribute(name: string, value: unknown): void {
    this.customAttributes.set(name, value);
  }

  deleteCustomAttribute(name: string): boolean {
    return this.customAttributes.delete(name);
  }

  protected applyTypeFrom(json: JsonSchemaObject): void {
    this.typeVariants.applyFrom(json);
  }

  protected writeTypeTo(json: JsonSchemaObject, fallback: JsonSchemaType): void {
    this.typeVariants.writeTo(json, fallback);
  }

  protected cloneBase(): {
    metadata: SchemaMetadata;
    customAttributes: CustomAttributeCollection;
    typeVariants: TypeVariants;
  } {
    return {
      metadata: this.metadata.clone(),
      customAttributes: this.customAttributes.clone(),
      typeVariants: this.typeVariants.clone(),
    };
  }

  protected applyMetadata(json: JsonSchemaObject): void {
    this.metadata.applyFrom(json);
    this.customAttributes.applyFrom(json);
  }
}

export abstract class LeafSchema extends SchemaNode {
  protected resolvePathImpl(_segments: readonly string[]): SchemaNode | undefined {
    return undefined;
  }
}

export abstract class CompositeSchema extends SchemaNode {
  abstract getChildren(): readonly SchemaNode[];
}

export function parseScope(scope: string): string[] {
  const segments: string[] = [];
  const regex = /\/properties\/([^/]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(scope)) !== null) {
    segments.push(match[1]);
  }
  return segments;
}
