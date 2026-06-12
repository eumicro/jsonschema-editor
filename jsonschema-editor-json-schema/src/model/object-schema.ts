import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import type { SchemaFactory } from "./factory.js";
import { CompositeSchema, SchemaNode } from "./node.js";
import { SchemaMetadata } from "./metadata.js";
import { PropertyCollection } from "./property-collection.js";
import type { SchemaVisitor } from "./visitor.js";

export class ObjectSchema extends CompositeSchema {
  readonly nodeKind = "object" as const;

  private readonly propertyCollection = new PropertyCollection();
  private _additionalProperties: boolean | SchemaNode = true;

  constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(metadata, customAttributes ?? new CustomAttributeCollection(registry));
  }

  get properties(): ReadonlyMap<string, SchemaNode> {
    return this.propertyCollection.asMap();
  }

  get required(): readonly string[] {
    return this.propertyCollection.requiredNames;
  }

  get propertyCount(): number {
    return this.propertyCollection.size;
  }

  get additionalProperties(): boolean | SchemaNode {
    return this._additionalProperties;
  }

  set additionalProperties(value: boolean | SchemaNode) {
    this._additionalProperties = value;
  }

  getProperty(name: string): SchemaNode | undefined {
    return this.propertyCollection.get(name);
  }

  setProperty(name: string, schema: SchemaNode, isRequired = false): this {
    this.propertyCollection.add(name, schema, { required: isRequired });
    return this;
  }

  removeProperty(name: string): boolean {
    return this.propertyCollection.remove(name);
  }

  isPropertyRequired(name: string): boolean {
    return this.propertyCollection.isRequired(name);
  }

  setPropertyRequired(name: string, isRequired: boolean): this {
    this.propertyCollection.setRequired(name, isRequired);
    return this;
  }

  getChildren(): readonly SchemaNode[] {
    const children = [...this.propertyCollection.entries()].map(([, schema]) => schema);
    if (this._additionalProperties !== true && this._additionalProperties !== false) {
      children.push(this._additionalProperties);
    }
    return children;
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): ObjectSchema {
    const node = new ObjectSchema(factory.attributeRegistry);
    node.applyMetadata(json);
    node.applyTypeFrom(json);

    for (const [name, propJson] of Object.entries(json.properties ?? {})) {
      const prop = factory.fromJSON(propJson);
      const isRequired = (json.required ?? []).includes(name);
      node.propertyCollection.add(name, prop, { required: isRequired });
    }

    if (json.additionalProperties === false) {
      node._additionalProperties = false;
    } else if (
      json.additionalProperties &&
      typeof json.additionalProperties === "object"
    ) {
      node._additionalProperties = factory.fromJSON(json.additionalProperties);
    }

    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitObject(this);
  }

  deepClone(): ObjectSchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new ObjectSchema(undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;

    for (const [name, schema] of this.propertyCollection.entries()) {
      copy.setProperty(name, schema.deepClone(), this.propertyCollection.isRequired(name));
    }

    copy._additionalProperties =
      this._additionalProperties === true || this._additionalProperties === false
        ? this._additionalProperties
        : this._additionalProperties.deepClone();
    return copy;
  }

  createDefaultValue(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const [name, schema] of this.propertyCollection) {
      data[name] = schema.createDefaultValue();
    }
    return data;
  }

  protected writeTypeDefinition(json: JsonSchemaObject): void {
    const properties: Record<string, JsonSchemaObject> = {};
    for (const [name, schema] of this.propertyCollection) {
      properties[name] = schema.toJSON();
    }

    this.writeTypeTo(json, "object");
    json.properties = properties;

    const required = this.propertyCollection.requiredNames;
    if (required.length) json.required = [...required];

    if (this._additionalProperties === false) {
      json.additionalProperties = false;
    } else if (this._additionalProperties !== true) {
      json.additionalProperties = this._additionalProperties.toJSON();
    }
  }

  protected resolvePathImpl(segments: readonly string[]): SchemaNode | undefined {
    if (segments.length === 0) return this;
    const [head, ...tail] = segments;
    const child = this.propertyCollection.get(head);
    if (!child) return undefined;
    return tail.length ? child.resolvePath(tail) : child;
  }
}
