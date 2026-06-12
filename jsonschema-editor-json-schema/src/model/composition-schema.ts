import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import type { SchemaFactory } from "./factory.js";
import { CompositeSchema, SchemaNode } from "./node.js";
import { SchemaMetadata } from "./metadata.js";
import { ObjectSchema } from "./object-schema.js";
import type { SchemaVisitor } from "./visitor.js";

export type CompositionOperator = "allOf" | "anyOf" | "oneOf";

export class CompositionSchema extends CompositeSchema {
  readonly nodeKind = "composition" as const;

  private readonly _allOf: SchemaNode[] = [];
  private readonly _anyOf: SchemaNode[] = [];
  private readonly _oneOf: SchemaNode[] = [];

  constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(metadata, customAttributes ?? new CustomAttributeCollection(registry));
  }

  get allOf(): readonly SchemaNode[] {
    return this._allOf;
  }

  get anyOf(): readonly SchemaNode[] {
    return this._anyOf;
  }

  get oneOf(): readonly SchemaNode[] {
    return this._oneOf;
  }

  get branches(): readonly SchemaNode[] {
    if (this._oneOf.length) return this._oneOf;
    if (this._anyOf.length) return this._anyOf;
    return this._allOf;
  }

  get compositionType(): CompositionOperator | null {
    return this.activeOperators[0] ?? null;
  }

  get activeOperators(): CompositionOperator[] {
    const operators: CompositionOperator[] = [];
    if (this._allOf.length) operators.push("allOf");
    if (this._anyOf.length) operators.push("anyOf");
    if (this._oneOf.length) operators.push("oneOf");
    return operators;
  }

  addBranch(operator: CompositionOperator, schema: SchemaNode): this {
    this.getMutableBranch(operator).push(schema);
    return this;
  }

  getBranch(operator: CompositionOperator, index: number): SchemaNode | undefined {
    return this.getMutableBranch(operator)[index];
  }

  setBranch(operator: CompositionOperator, index: number, schema: SchemaNode): this {
    const branch = this.getMutableBranch(operator);
    if (index < 0 || index >= branch.length) {
      throw new Error(`Branch index ${index} out of range for ${operator}.`);
    }
    branch[index] = schema;
    return this;
  }

  removeBranch(operator: CompositionOperator, index: number): this {
    const branch = this.getMutableBranch(operator);
    if (index < 0 || index >= branch.length) {
      throw new Error(`Branch index ${index} out of range for ${operator}.`);
    }
    branch.splice(index, 1);
    return this;
  }

  getChildren(): readonly SchemaNode[] {
    return [...this._allOf, ...this._anyOf, ...this._oneOf];
  }

  mergeToObject(): ObjectSchema | undefined {
    const merged = new ObjectSchema();

    for (const branch of this._allOf.length ? this._allOf : this.branches) {
      if (!(branch instanceof ObjectSchema)) continue;
      for (const [name, prop] of branch.properties) {
        merged.setProperty(name, prop.deepClone(), branch.isPropertyRequired(name));
      }
    }

    return merged.propertyCount > 0 ? merged : undefined;
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): CompositionSchema {
    const node = new CompositionSchema(factory.attributeRegistry);
    node.applyMetadata(json);
    node._allOf.push(...(json.allOf ?? []).map((s) => factory.fromJSON(s)));
    node._anyOf.push(...(json.anyOf ?? []).map((s) => factory.fromJSON(s)));
    node._oneOf.push(...(json.oneOf ?? []).map((s) => factory.fromJSON(s)));
    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitComposition(this);
  }

  deepClone(): CompositionSchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new CompositionSchema(undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;
    copy._allOf.push(...this._allOf.map((s) => s.deepClone()));
    copy._anyOf.push(...this._anyOf.map((s) => s.deepClone()));
    copy._oneOf.push(...this._oneOf.map((s) => s.deepClone()));
    return copy;
  }

  createDefaultValue(): unknown {
    const first = this.branches[0];
    return first ? first.createDefaultValue() : null;
  }

  protected writeTypeDefinition(json: JsonSchemaObject): void {
    if (this._allOf.length) json.allOf = this._allOf.map((s) => s.toJSON());
    if (this._anyOf.length) json.anyOf = this._anyOf.map((s) => s.toJSON());
    if (this._oneOf.length) json.oneOf = this._oneOf.map((s) => s.toJSON());
  }

  protected resolvePathImpl(segments: readonly string[]): SchemaNode | undefined {
    const merged = this.mergeToObject();
    if (!merged) return undefined;
    return merged.resolvePath(segments);
  }

  private getMutableBranch(operator: CompositionOperator): SchemaNode[] {
    switch (operator) {
      case "allOf":
        return this._allOf;
      case "anyOf":
        return this._anyOf;
      case "oneOf":
        return this._oneOf;
    }
  }
}
