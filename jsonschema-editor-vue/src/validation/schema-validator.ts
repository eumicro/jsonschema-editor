import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import type { JsonSchemaObject, SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import {
  CompositionSchema,
  ObjectSchema,
  RefSchema,
} from "@jsonschema-editor/json-schema";
import { buildPropertyScope, scopeToPath } from "@jsonschema-editor/ui-schema";

export type FormValidationTranslate = (
  key: string,
  params?: Record<string, string | number>,
) => string;

let sharedAjv: Ajv | null = null;

function getAjv(): Ajv {
  if (!sharedAjv) {
    sharedAjv = addFormats(
      new Ajv({
        allErrors: true,
        strict: false,
        validateFormats: true,
      }),
    );
  }
  return sharedAjv;
}

export function instancePathToScope(instancePath: string): string {
  if (!instancePath || instancePath === "/") return "#";
  const segments = instancePath.split("/").filter(Boolean);
  return segments.reduce((scope, segment) => buildPropertyScope(scope, segment), "#");
}

export function mapErrorToScope(error: ErrorObject): string {
  if (error.keyword === "required") {
    const missing = error.params.missingProperty;
    if (typeof missing === "string") {
      return buildPropertyScope(instancePathToScope(error.instancePath), missing);
    }
  }

  if (error.keyword === "additionalProperties") {
    const additional = error.params.additionalProperty;
    if (typeof additional === "string") {
      return buildPropertyScope(instancePathToScope(error.instancePath), additional);
    }
  }

  return instancePathToScope(error.instancePath);
}

export function formatValidationError(
  error: ErrorObject,
  t: FormValidationTranslate,
): string {
  switch (error.keyword) {
    case "required":
      return t("form.validation.required");
    case "minLength":
      return t("form.validation.minLength", { limit: String(error.params.limit ?? "") });
    case "maxLength":
      return t("form.validation.maxLength", { limit: String(error.params.limit ?? "") });
    case "minimum":
      return t("form.validation.minimum", { limit: String(error.params.limit ?? "") });
    case "maximum":
      return t("form.validation.maximum", { limit: String(error.params.limit ?? "") });
    case "pattern":
      return t("form.validation.pattern");
    case "format":
      return t("form.validation.format");
    case "type":
      return t("form.validation.type");
    case "enum":
      return t("form.validation.enum");
    default:
      return error.message ?? t("form.validation.invalid");
  }
}

export function validationSchemaFromDocument(schema: JsonSchemaObject): JsonSchemaObject {
  const { $schema: _schema, ...rest } = schema;
  return rest;
}

export function createFormValidator(schema: JsonSchemaObject): ValidateFunction {
  return getAjv().compile(validationSchemaFromDocument(schema));
}

export function collectValidationErrorsByScope(
  errors: ErrorObject[] | null | undefined,
  t: FormValidationTranslate,
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const error of errors ?? []) {
    const scope = mapErrorToScope(error);
    const message = formatValidationError(error, t);
    const existing = map.get(scope) ?? [];
    if (!existing.includes(message)) {
      existing.push(message);
    }
    map.set(scope, existing);
  }

  return map;
}

export function validateFormData(
  validate: ValidateFunction,
  data: unknown,
  t: FormValidationTranslate,
  document?: SchemaDocument,
): Map<string, string[]> {
  validate(data);
  const map = collectValidationErrorsByScope(validate.errors, t);
  if (document) {
    augmentEmptyRequiredErrors(document, data, map, t);
  }
  return map;
}

function getDataAtScope(data: unknown, scope: string): unknown {
  if (scope === "#") return data;
  let current: unknown = data;
  for (const key of scopeToPath(scope)) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function resolveDocumentNode(
  document: SchemaDocument,
  node: SchemaNode,
): SchemaNode {
  if (node instanceof RefSchema) {
    const resolved = document.resolveRef(node.ref);
    return resolved ? resolveDocumentNode(document, resolved) : node;
  }
  return node;
}

function isEmptyRequiredValue(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

export function augmentEmptyRequiredErrors(
  document: SchemaDocument,
  data: unknown,
  map: Map<string, string[]>,
  t: FormValidationTranslate,
  node: SchemaNode = document.root,
  scope = "#",
): void {
  const resolved = resolveDocumentNode(document, node);

  if (resolved instanceof ObjectSchema) {
    const record = getDataAtScope(data, scope);
    const objectData =
      record && typeof record === "object" && !Array.isArray(record)
        ? (record as Record<string, unknown>)
        : undefined;

    for (const name of resolved.required) {
      const propScope = buildPropertyScope(scope, name);
      const value = objectData?.[name];
      if (isEmptyRequiredValue(value)) {
        addScopeError(map, propScope, t("form.validation.required"));
      }
    }

    for (const [name, propSchema] of resolved.properties) {
      augmentEmptyRequiredErrors(
        document,
        data,
        map,
        t,
        propSchema,
        buildPropertyScope(scope, name),
      );
    }
    return;
  }

  if (resolved instanceof CompositionSchema) {
    if (resolved.oneOf.length > 0 || resolved.anyOf.length > 0) {
      const branchData = getDataAtScope(data, scope);
      if (!branchData || typeof branchData !== "object" || Array.isArray(branchData)) {
        return;
      }

      const branches = (resolved.oneOf.length > 0 ? resolved.oneOf : resolved.anyOf).map((branch) =>
        resolveDocumentNode(document, branch),
      );
      const record = branchData as Record<string, unknown>;

      let activeBranch: SchemaNode | undefined;
      for (const branch of branches) {
        if (!(branch instanceof ObjectSchema)) continue;
        if ([...branch.properties.keys()].some((key) => key in record)) {
          activeBranch = branch;
          break;
        }
      }
      activeBranch ??= branches.find((branch): branch is ObjectSchema => branch instanceof ObjectSchema);

      if (activeBranch) {
        augmentEmptyRequiredErrors(document, data, map, t, activeBranch, scope);
      }
      return;
    }

    for (const branch of resolved.allOf) {
      augmentEmptyRequiredErrors(document, data, map, t, branch, scope);
    }
  }
}

function addScopeError(map: Map<string, string[]>, scope: string, message: string): void {
  const existing = map.get(scope) ?? [];
  if (!existing.includes(message)) {
    existing.push(message);
  }
  map.set(scope, existing);
}
