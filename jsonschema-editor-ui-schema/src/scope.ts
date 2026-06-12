export function scopeToPath(scope: string): string[] {
  const segments: string[] = [];
  const regex = /\/properties\/([^/]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(scope)) !== null) {
    segments.push(match[1]);
  }
  return segments;
}

export function buildPropertyScope(baseScope: string, propertyName: string): string {
  return `${baseScope}/properties/${propertyName}`;
}
