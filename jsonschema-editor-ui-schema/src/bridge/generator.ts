import type {
  CompositionSchema,
  ObjectSchema,
  SchemaNode,
} from "@jsonschema-editor/json-schema";
import { RefSchema } from "@jsonschema-editor/json-schema";
import {
  UiSchemaDocument,
  UiSchemaFactory,
  type UiElement,
} from "../model/index.js";
import { buildPropertyScope } from "../scope.js";

export type SchemaRefResolver = (ref: string) => SchemaNode | undefined;

export class UiSchemaGenerator {
  constructor(private readonly factory: UiSchemaFactory = new UiSchemaFactory()) {}

  generateForSchema(
    schema: SchemaNode,
    baseScope = "#",
    resolveRef?: SchemaRefResolver,
  ): UiSchemaDocument {
    const elements = this.buildControlsForSchema(schema, baseScope, resolveRef);
    return new UiSchemaDocument(this.factory.createVerticalLayout(elements));
  }

  private resolveSchema(schema: SchemaNode, resolveRef?: SchemaRefResolver): SchemaNode {
    if (!(schema instanceof RefSchema) || !resolveRef) return schema;
    const resolved = resolveRef(schema.ref);
    return resolved ? this.resolveSchema(resolved, resolveRef) : schema;
  }

  private buildControlsForSchema(
    schema: SchemaNode,
    scope: string,
    resolveRef?: SchemaRefResolver,
  ): UiElement[] {
    schema = this.resolveSchema(schema, resolveRef);

    if (schema.kind === "object") {
      const objectSchema = schema as ObjectSchema;
      const elements: UiElement[] = [];

      for (const [name, propSchema] of objectSchema.properties) {
        const propScope = buildPropertyScope(scope, name);
        elements.push(...this.buildPropertyUi(propSchema, propScope, name, resolveRef));
      }

      return elements;
    }

    if (schema.kind === "composition") {
      const comp = schema as CompositionSchema;
      const elements: UiElement[] = [];

      for (const branch of comp.allOf) {
        elements.push(...this.buildControlsForSchema(branch, scope, resolveRef));
      }

      if (comp.oneOf.length > 0 || comp.anyOf.length > 0) {
        elements.push(this.factory.createControl(scope, comp.title ?? "Variante"));
      }

      return elements;
    }

    const label = schema.title ?? scope.split("/").pop() ?? "Feld";
    return [this.factory.createControl(scope, label)];
  }

  /** Unterobjekte als Group + VerticalLayout, damit das Layout im UI-Editor anpassbar ist. */
  private buildPropertyUi(
    schema: SchemaNode,
    scope: string,
    name: string,
    resolveRef?: SchemaRefResolver,
  ): UiElement[] {
    schema = this.resolveSchema(schema, resolveRef);

    if (schema.kind === "object") {
      const objectSchema = schema as ObjectSchema;
      const inner = this.buildControlsForSchema(objectSchema, scope, resolveRef);
      const layout = this.factory.createVerticalLayout(inner);
      return [this.factory.createGroup(objectSchema.title ?? name, [layout])];
    }

    if (schema.kind === "composition") {
      const inner = this.buildControlsForSchema(schema, scope, resolveRef);
      if (inner.length === 1) return inner;
      return [this.factory.createGroup(schema.title ?? name, inner)];
    }

    return this.buildControlsForSchema(schema, scope, resolveRef);
  }
}

export function resolveSchemaAtScope(
  rootSchema: SchemaNode,
  scope: string,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): SchemaNode | undefined {
  let node = rootSchema.resolveAtScope(scope);
  if (!node) return undefined;
  if (node instanceof RefSchema && resolveRef) {
    const resolved = resolveRef(node.ref);
    if (resolved) node = resolved;
  }
  return node;
}

export { Control, VerticalLayout } from "../model/index.js";
