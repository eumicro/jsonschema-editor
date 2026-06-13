const SCOPE_SEGMENT_PATTERN = /\/(?:properties\/([^/]+)|items\/(\d+))/g;

/** Parses a JSON-Forms-style scope into a data/schema path (property names and array indices). */
export function parseScope(scope: string): string[] {
  const segments: string[] = [];
  const regex = new RegExp(SCOPE_SEGMENT_PATTERN.source, "g");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(scope)) !== null) {
    segments.push(match[1] ?? match[2]);
  }
  return segments;
}

/** Alias for {@link parseScope} (UI Schema naming). */
export const scopeToPath = parseScope;

export function buildPropertyScope(baseScope: string, propertyName: string): string {
  return `${baseScope}/properties/${propertyName}`;
}

export function buildArrayItemScope(baseScope: string, index: number): string {
  return `${baseScope}/items/${index}`;
}

export function buildArrayItemPropertyScope(
  baseScope: string,
  index: number,
  propertyName: string,
): string {
  return `${buildArrayItemScope(baseScope, index)}/properties/${propertyName}`;
}
