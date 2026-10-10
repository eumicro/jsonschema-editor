import {
  ObjectSchema,
  StringSchema,
  cloneJsonCompatible,
  type JsonSchemaAttributeRegistry,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";
import { defaultExtensionsRegistry } from "./registry.js";

export const RELATION_REFERENCE_ATTRIBUTE = "x-relation-reference";
export const RELATION_SNAPSHOT_ATTRIBUTE = "x-relation-snapshot";

export interface RelationTargetAllow {
  contextId: string;
  /** Schema ids allowed in the context; `"*"` means all schemas. */
  schemaIds: string[];
}

export interface RelationDisplayConfig {
  schema: Record<string, unknown>;
  uiSchema?: Record<string, unknown>;
}

export interface RelationExtensionConfig {
  targets: RelationTargetAllow[];
  display?: RelationDisplayConfig;
}

export interface NormalizedRelationConfig {
  targets: RelationTargetAllow[];
  display: RelationDisplayConfig;
}

export interface RelationDescriptor {
  contextId: string;
  schemaId: string;
  entityId: string;
  display?: Record<string, unknown>;
}

export interface RelationFieldContext {
  scope: string;
}

/**
 * Application-provided entity lookup for relation form controls.
 */
export interface RelationCatalogItem {
  id: string;
  label: string;
}

export interface RelationFieldProvider {
  search(params: {
    contextId: string;
    schemaId: string;
    query: string;
    limit: number;
  }): Promise<
    Array<{
      entityId: string;
      label: string;
      data: Record<string, unknown>;
    }>
  >;
  get?(params: {
    contextId: string;
    schemaId: string;
    entityId: string;
  }): Promise<
    | {
        entityId: string;
        label: string;
        data: Record<string, unknown>;
      }
    | undefined
  >;
  /** Open the related entity in the host application (e.g. new workspace panel). */
  open?(params: {
    contextId: string;
    schemaId: string;
    entityId: string;
    label?: string;
    data?: Record<string, unknown>;
  }): void | Promise<void>;
  /** Optional catalog for schema-attribute editors (context/schema pickers). */
  listContexts?(): Promise<RelationCatalogItem[]>;
  listSchemas?(contextId: string): Promise<RelationCatalogItem[]>;
  /** Optional field catalog for display-field pickers on a concrete schema. */
  listSchemaFields?(contextId: string, schemaId: string): Promise<RelationCatalogItem[]>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isTargetAllow(value: unknown): value is RelationTargetAllow {
  if (!isPlainObject(value)) return false;
  if (typeof value.contextId !== "string" || value.contextId.length === 0) return false;
  if (!Array.isArray(value.schemaIds) || value.schemaIds.length === 0) return false;
  return value.schemaIds.every((id) => typeof id === "string" && id.length > 0);
}

function isDisplayConfig(value: unknown): value is RelationDisplayConfig {
  if (!isPlainObject(value)) return false;
  return isPlainObject(value.schema);
}

export function isRelationExtensionConfig(value: unknown): value is RelationExtensionConfig {
  if (!isPlainObject(value)) return false;
  if (!Array.isArray(value.targets) || !value.targets.every(isTargetAllow)) return false;
  if (value.display !== undefined && !isDisplayConfig(value.display)) return false;
  return true;
}

export function displayFieldsFromSchema(schema: Record<string, unknown>): string[] {
  const properties = isPlainObject(schema.properties) ? schema.properties : {};
  const keys = Object.keys(properties);
  return keys.length > 0 ? keys : ["name"];
}

export function buildDisplayConfigFromFields(fields: string[]): RelationDisplayConfig {
  const unique = [
    ...new Set(fields.map((field) => field.trim()).filter((field) => field.length > 0)),
  ];
  const names = unique.length > 0 ? unique : ["name"];
  const properties: Record<string, unknown> = {};
  for (const name of names) {
    properties[name] = { type: "string" };
  }
  const schema = {
    type: "object",
    required: [...names],
    properties,
  };
  const uiSchema =
    names.length === 1
      ? { type: "Control", scope: `#/properties/${names[0]}` }
      : {
          type: "VerticalLayout",
          elements: names.map((name) => ({
            type: "Control",
            scope: `#/properties/${name}`,
          })),
        };
  return { schema, uiSchema };
}

export function normalizeRelationConfig(config?: RelationExtensionConfig): NormalizedRelationConfig {
  const targets = (config?.targets ?? []).map((target) => ({
    contextId: target.contextId,
    schemaIds: [...target.schemaIds],
  }));
  if (config?.display?.schema) {
    return {
      targets,
      display: {
        schema: cloneJsonCompatible(config.display.schema),
        uiSchema: config.display.uiSchema
          ? cloneJsonCompatible(config.display.uiSchema)
          : buildDisplayConfigFromFields(displayFieldsFromSchema(config.display.schema)).uiSchema,
      },
    };
  }
  return {
    targets,
    display: buildDisplayConfigFromFields(["name"]),
  };
}

export function readRelationReferenceConfig(node: SchemaNode): RelationExtensionConfig | undefined {
  const raw = node.getCustomAttribute(RELATION_REFERENCE_ATTRIBUTE);
  return isRelationExtensionConfig(raw) ? raw : undefined;
}

export function readRelationSnapshotConfig(node: SchemaNode): RelationExtensionConfig | undefined {
  const raw = node.getCustomAttribute(RELATION_SNAPSHOT_ATTRIBUTE);
  return isRelationExtensionConfig(raw) ? raw : undefined;
}

export function readRelationConfig(node: SchemaNode): RelationExtensionConfig | undefined {
  return readRelationReferenceConfig(node) ?? readRelationSnapshotConfig(node);
}

export function isRelationDescriptor(value: unknown): value is RelationDescriptor {
  if (!isPlainObject(value)) return false;
  return (
    typeof value.contextId === "string" &&
    value.contextId.length > 0 &&
    typeof value.schemaId === "string" &&
    value.schemaId.length > 0 &&
    typeof value.entityId === "string" &&
    value.entityId.length > 0
  );
}

export function isTargetAllowed(
  contextId: string,
  schemaId: string,
  config: RelationExtensionConfig | NormalizedRelationConfig,
): boolean {
  return config.targets.some((target) => {
    if (target.contextId !== contextId) return false;
    return target.schemaIds.includes("*") || target.schemaIds.includes(schemaId);
  });
}

export function projectRelationDisplay(
  entityData: Record<string, unknown>,
  displaySchema: Record<string, unknown>,
): Record<string, unknown> {
  const properties = isPlainObject(displaySchema.properties) ? displaySchema.properties : {};
  const projected: Record<string, unknown> = {};
  for (const key of Object.keys(properties)) {
    if (key in entityData) {
      projected[key] = entityData[key];
    }
  }
  return projected;
}

export function validateRelationFieldValue(
  value: unknown,
  config?: RelationExtensionConfig,
  options?: { requireDisplay?: boolean },
): boolean {
  if (value === null || value === undefined) return true;
  if (!isRelationDescriptor(value)) return false;
  if (config && !isTargetAllowed(value.contextId, value.schemaId, config)) return false;
  if (options?.requireDisplay) {
    return isPlainObject(value.display);
  }
  return true;
}

function createRelationValueSchema(
  registry: JsonSchemaAttributeRegistry | undefined,
  withDisplay: boolean,
): ObjectSchema {
  const schema = new ObjectSchema(registry);
  schema.title = withDisplay ? "Relation snapshot" : "Relation reference";
  schema.setProperty("contextId", new StringSchema(registry), true);
  schema.setProperty("schemaId", new StringSchema(registry), true);
  schema.setProperty("entityId", new StringSchema(registry), true);
  if (withDisplay) {
    schema.setProperty("display", new ObjectSchema(registry), true);
  }
  return schema;
}

export function createRelationReferenceSchema(
  config: RelationExtensionConfig = { targets: [] },
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): ObjectSchema {
  const schema = createRelationValueSchema(registry, false);
  schema.description = "Reference to an entity in an allowed context/schema.";
  schema.setCustomAttribute(RELATION_REFERENCE_ATTRIBUTE, normalizeRelationConfig(config));
  return schema;
}

export function createRelationSnapshotSchema(
  config: RelationExtensionConfig = { targets: [] },
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): ObjectSchema {
  const schema = createRelationValueSchema(registry, true);
  schema.description = "Entity reference with a projected display snapshot.";
  schema.setCustomAttribute(RELATION_SNAPSHOT_ATTRIBUTE, normalizeRelationConfig(config));
  return schema;
}
