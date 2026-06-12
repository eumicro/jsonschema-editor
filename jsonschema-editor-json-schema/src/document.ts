import type { JsonSchemaAttributeRegistry } from "./attribute-registry.js";
import type { JsonSchemaObject } from "./types.js";
import { SchemaFactory } from "./model/factory.js";
import { RefSchema } from "./model/ref-schema.js";
import type { SchemaNode } from "./model/node.js";

export type DefsKey = "$defs" | "definitions";

const DEFS_SEGMENT = "$defs";

export function buildDefRef(defName: string, defsKey: DefsKey = "$defs"): string {
  return `#/${defsKey}/${defName}`;
}

export function parseDefRef(ref: string): { name: string; defsKey: DefsKey } | null {
  const match = ref.match(/^#\/(\$defs|definitions)\/([^/]+)$/);
  if (!match) return null;
  return { defsKey: match[1] as DefsKey, name: decodeURIComponent(match[2]) };
}

export class SchemaDocument {
  private readonly _defs = new Map<string, SchemaNode>();
  private _defsKey: DefsKey = "$defs";

  constructor(public root: SchemaNode) {}

  get defs(): ReadonlyMap<string, SchemaNode> {
    return this._defs;
  }

  get defsKey(): DefsKey {
    return this._defsKey;
  }

  listDefNames(): string[] {
    return [...this._defs.keys()];
  }

  getDef(name: string): SchemaNode | undefined {
    return this._defs.get(name);
  }

  setDef(name: string, schema: SchemaNode): void {
    this._defs.set(name, schema);
  }

  removeDef(name: string): boolean {
    return this._defs.delete(name);
  }

  renameDef(oldName: string, newName: string): boolean {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName || this._defs.has(trimmed)) return false;
    const schema = this._defs.get(oldName);
    if (!schema) return false;
    this._defs.delete(oldName);
    this._defs.set(trimmed, schema);
    return true;
  }

  hasDef(name: string): boolean {
    return this._defs.has(name);
  }

  resolveRef(ref: string): SchemaNode | undefined {
    const parsed = parseDefRef(ref);
    if (!parsed) return undefined;
    return this._defs.get(parsed.name);
  }

  /** Folgt $ref-Ketten bis zu einer konkreten Definition. */
  resolveNode(node: SchemaNode, depth = 8): SchemaNode {
    if (!(node instanceof RefSchema) || depth <= 0) return node;
    const target = this.resolveRef(node.ref);
    if (!target) return node;
    return this.resolveNode(target, depth - 1);
  }

  static fromRoot(root: SchemaNode): SchemaDocument {
    return new SchemaDocument(root);
  }

  static fromJSON(
    json: JsonSchemaObject,
    registry?: JsonSchemaAttributeRegistry,
  ): SchemaDocument {
    const factory = new SchemaFactory(registry);
    const defsKey: DefsKey = json.$defs ? "$defs" : json.definitions ? "definitions" : "$defs";
    const defsRaw = (json.$defs ?? json.definitions ?? {}) as Record<string, JsonSchemaObject>;

    const rootJson = { ...json };
    delete rootJson.$defs;
    delete rootJson.definitions;

    const doc = new SchemaDocument(factory.fromJSON(rootJson));
    doc._defsKey = Object.keys(defsRaw).length > 0 || json.$defs || json.definitions ? defsKey : "$defs";

    if (json.$schema !== undefined) doc.$schema = json.$schema;
    if (json.$id !== undefined) doc.$id = json.$id;

    for (const [name, defJson] of Object.entries(defsRaw)) {
      doc.setDef(name, factory.fromJSON(defJson));
    }

    return doc;
  }

  $schema?: string;
  $id?: string;

  toJSON(): JsonSchemaObject {
    const json = this.root.toJSON();
    if (this.$schema !== undefined) json.$schema = this.$schema;
    if (this.$id !== undefined) json.$id = this.$id;

    if (this._defs.size > 0) {
      const defsObj: Record<string, JsonSchemaObject> = {};
      for (const [name, node] of this._defs) {
        defsObj[name] = node.toJSON();
      }
      json[this._defsKey] = defsObj;
      if (this._defsKey === "$defs") {
        delete json.definitions;
      } else {
        delete json.$defs;
      }
    }

    return json;
  }

  clone(): SchemaDocument {
    const copy = new SchemaDocument(this.root.clone());
    copy._defsKey = this._defsKey;
    copy.$schema = this.$schema;
    copy.$id = this.$id;
    for (const [name, node] of this._defs) {
      copy.setDef(name, node.clone());
    }
    return copy;
  }
}

export function documentFromJSON(
  json: JsonSchemaObject,
  registry?: JsonSchemaAttributeRegistry,
): SchemaDocument {
  return SchemaDocument.fromJSON(json, registry);
}

export function isSchemaDocument(value: SchemaNode | SchemaDocument): value is SchemaDocument {
  return value instanceof SchemaDocument;
}

export function ensureSchemaDocument(value: SchemaNode | SchemaDocument): SchemaDocument {
  return isSchemaDocument(value) ? value : SchemaDocument.fromRoot(value);
}

export { DEFS_SEGMENT };
