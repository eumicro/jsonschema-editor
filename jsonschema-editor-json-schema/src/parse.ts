import type { JsonSchemaAttributeRegistry } from "./attribute-registry.js";
import type { JsonSchemaObject } from "./types.js";
import { SchemaFactory, defaultSchemaFactory, SchemaNode } from "./model/index.js";

export function schemaFromJSON(
  json: JsonSchemaObject,
  registry?: JsonSchemaAttributeRegistry,
): SchemaNode {
  return new SchemaFactory(registry).fromJSON(json);
}

export { defaultSchemaFactory };
