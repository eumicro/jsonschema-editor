import type { JsonSchemaAttributeRegistry, JsonSchemaObject } from "@jsonschema-editor/json-schema";
import { documentFromJSON } from "@jsonschema-editor/json-schema";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchemaObject } from "../types.js";
import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import { uiSchemaFromJSON } from "../parse.js";
import type { UiElement } from "../model/node.js";
import { UiSchemaDocument } from "../model/document.js";
import { UiSchemaGenerator } from "./generator.js";

export class FormDefinition {
  constructor(
    public readonly schema: SchemaDocument,
    public readonly uiSchema: UiSchemaDocument,
  ) {}

  static fromJSON(
    schemaJson: JsonSchemaObject,
    uiSchemaJson?: UiSchemaObject,
    schemaRegistry?: JsonSchemaAttributeRegistry,
    uiRegistry?: UiSchemaAttributeRegistry,
  ): FormDefinition {
    const schema = documentFromJSON(schemaJson, schemaRegistry);
    const uiSchema = uiSchemaJson
      ? new UiSchemaDocument(uiSchemaFromJSON(uiSchemaJson, uiRegistry))
      : new UiSchemaGenerator().generateForSchema(
          schema.root,
          "#",
          (ref) => schema.resolveRef(ref),
        );

    return new FormDefinition(schema, uiSchema);
  }

  toJSON(): { schema: JsonSchemaObject; uiSchema: UiSchemaObject } {
    return {
      schema: this.schema.toJSON(),
      uiSchema: this.uiSchema.toJSON(),
    };
  }
}

/** Abwärtskompatibel: UiSchema mit statischen Fabrikmethoden */
export class UiSchema extends UiSchemaDocument {
  constructor(root: UiElement) {
    super(root);
  }

  static fromJSON(
    json: UiSchemaObject,
    registry?: UiSchemaAttributeRegistry,
  ): UiSchema {
    return new UiSchema(uiSchemaFromJSON(json, registry));
  }

  static generateForSchema(
    schema: import("@jsonschema-editor/json-schema").SchemaNode,
    baseScope = "#",
    resolveRef?: import("./generator.js").SchemaRefResolver,
  ): UiSchema {
    const document = new UiSchemaGenerator().generateForSchema(schema, baseScope, resolveRef);
    return new UiSchema(document.root);
  }
}
