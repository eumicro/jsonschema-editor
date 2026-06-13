import type { JsonSchemaAttributeRegistry, SchemaNode } from "@jsonschema-editor/json-schema";
import { ObjectSchema } from "@jsonschema-editor/json-schema";
import { defaultExtensionsRegistry } from "./registry.js";

export const GEOMETRY_ATTRIBUTE = "x-geometry";

export const DEFAULT_GEOMETRY_STYLE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export interface GeometryExtensionConfig {
  styleUrl?: string;
  point?: boolean;
  line?: boolean;
  polygon?: boolean;
  minObjects?: number;
  maxObjects?: number;
  /** When set, exactly this many geometries are required (min = max = exactObjects). */
  exactObjects?: number;
}

export interface GeoJsonGeometry {
  type: string;
  coordinates?: unknown;
  geometries?: GeoJsonGeometry[];
}

export interface GeoJsonGeometryCollection {
  type: "GeometryCollection";
  geometries: GeoJsonGeometry[];
}

export interface NormalizedGeometryConfig {
  styleUrl: string;
  point: boolean;
  line: boolean;
  polygon: boolean;
  minObjects: number;
  maxObjects: number;
  exactObjects?: number;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isGeometryExtensionConfig(value: unknown): value is GeometryExtensionConfig {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.styleUrl !== undefined && typeof record.styleUrl !== "string") return false;
  if (record.point !== undefined && typeof record.point !== "boolean") return false;
  if (record.line !== undefined && typeof record.line !== "boolean") return false;
  if (record.polygon !== undefined && typeof record.polygon !== "boolean") return false;
  if (record.minObjects !== undefined && !isNonNegativeInteger(record.minObjects)) return false;
  if (record.maxObjects !== undefined && !isNonNegativeInteger(record.maxObjects)) return false;
  if (record.exactObjects !== undefined && !isNonNegativeInteger(record.exactObjects)) return false;
  return true;
}

export function normalizeGeometryConfig(
  config?: GeometryExtensionConfig,
): NormalizedGeometryConfig {
  const point = config?.point ?? true;
  const line = config?.line ?? true;
  const polygon = config?.polygon ?? true;
  const maxObjects = config?.maxObjects ?? 10;

  if (config?.exactObjects !== undefined) {
    const exactObjects = config.exactObjects;
    return {
      styleUrl: config?.styleUrl ?? DEFAULT_GEOMETRY_STYLE_URL,
      point,
      line,
      polygon,
      minObjects: exactObjects,
      maxObjects: exactObjects,
      exactObjects,
    };
  }

  const minObjects = Math.min(config?.minObjects ?? 0, maxObjects);

  return {
    styleUrl: config?.styleUrl ?? DEFAULT_GEOMETRY_STYLE_URL,
    point,
    line,
    polygon,
    minObjects,
    maxObjects,
  };
}

export function readGeometryConfig(node: SchemaNode): GeometryExtensionConfig | undefined {
  const raw = node.getCustomAttribute(GEOMETRY_ATTRIBUTE);
  return isGeometryExtensionConfig(raw) ? raw : undefined;
}

export function createEmptyGeometryCollection(): GeoJsonGeometryCollection {
  return { type: "GeometryCollection", geometries: [] };
}

export function isGeometryCollection(value: unknown): value is GeoJsonGeometryCollection {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.type === "GeometryCollection" && Array.isArray(record.geometries);
}

function isAllowedGeometryType(type: string, config: NormalizedGeometryConfig): boolean {
  switch (type) {
    case "Point":
    case "MultiPoint":
      return config.point;
    case "LineString":
    case "MultiLineString":
      return config.line;
    case "Polygon":
    case "MultiPolygon":
      return config.polygon;
    default:
      return false;
  }
}

export function validateGeometryCollection(
  value: unknown,
  config?: GeometryExtensionConfig,
): boolean {
  if (!isGeometryCollection(value)) return false;

  const normalized = normalizeGeometryConfig(config);
  const count = value.geometries.length;
  if (count < normalized.minObjects || count > normalized.maxObjects) return false;

  return value.geometries.every(
    (geometry) =>
      geometry &&
      typeof geometry === "object" &&
      typeof geometry.type === "string" &&
      isAllowedGeometryType(geometry.type, normalized),
  );
}

export function createGeometryCollectionSchema(
  config: GeometryExtensionConfig = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): ObjectSchema {
  const schema = new ObjectSchema(registry);
  schema.title = "Geometry (OGC)";
  schema.description = "GeoJSON GeometryCollection edited on a map.";
  schema.setCustomAttribute(GEOMETRY_ATTRIBUTE, normalizeGeometryConfig(config));
  return schema;
}
