/**
 * Composes a JSON-Forms detail scope onto a base scope.
 * Detail scopes are relative (`#/properties/x`); the result is absolute under `baseScope`.
 *
 * @see https://jsonforms.io/docs/uischema/controls/#detail
 */
export function composeScope(baseScope: string, relativeScope: string): string {
  const base = baseScope?.trim() || "#";
  const relative = relativeScope?.trim() || "#";
  if (relative === "#") return base;

  const suffix = relative.startsWith("#") ? relative.slice(1) : relative;
  if (!suffix.startsWith("/")) {
    return base === "#" ? `#/${suffix}` : `${base}/${suffix}`;
  }
  return base === "#" ? `#${suffix}` : `${base}${suffix}`;
}
