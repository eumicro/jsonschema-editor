import type { Component } from "vue";

export type AttributeValueType = "string" | "number" | "boolean" | "array" | "unknown";

export interface AttributeControlContext<TNode = unknown> {
  node: TNode;
  attributeName: string;
  label: string;
  value: unknown;
  readonly?: boolean;
}

export interface AttributeMatcher<TNode = unknown> {
  priority?: number;
  /** Exakter Attributname. */
  name?: string;
  /** Mehrere Attributnamen. */
  names?: readonly string[];
  /** Erwarteter Werttyp (Heuristik). */
  valueType?: AttributeValueType;
  /** Freie Logik – z. B. Custom-Attribute aus JsonSchemaAttributeRegistry. */
  match?: (context: AttributeControlContext<TNode>) => boolean;
}

export interface AttributeControlRegistration<TNode = unknown> {
  id?: string;
  matcher: AttributeMatcher<TNode>;
  component: Component;
}

/**
 * Registry für Editor-Controls pro Schema-/UI-Attribut.
 * Erweiterbar per Name, valueType oder eigener match-Funktion.
 */
export class AttributeControlRegistry<TNode = unknown> {
  private registrations: AttributeControlRegistration<TNode>[] = [];
  private defaultComponent: Component | null = null;

  register(registration: AttributeControlRegistration<TNode>): this {
    this.registrations.push(registration);
    return this;
  }

  registerName(
    name: string,
    component: Component,
    priority = 0,
    id?: string,
  ): this {
    return this.register({ id, matcher: { name, priority }, component });
  }

  registerNames(
    names: readonly string[],
    component: Component,
    priority = 0,
    id?: string,
  ): this {
    return this.register({ id, matcher: { names, priority }, component });
  }

  registerValueType(
    valueType: AttributeValueType,
    component: Component,
    priority = 0,
    id?: string,
  ): this {
    return this.register({ id, matcher: { valueType, priority }, component });
  }

  registerMatch(
    match: (context: AttributeControlContext<TNode>) => boolean,
    component: Component,
    priority = 0,
    id?: string,
  ): this {
    return this.register({ id, matcher: { match, priority }, component });
  }

  setDefault(component: Component): this {
    this.defaultComponent = component;
    return this;
  }

  unregister(id: string): boolean {
    const before = this.registrations.length;
    this.registrations = this.registrations.filter((entry) => entry.id !== id);
    return this.registrations.length < before;
  }

  resolve(context: AttributeControlContext<TNode>): Component | null {
    const sorted = [...this.registrations].sort(
      (a, b) => (b.matcher.priority ?? 0) - (a.matcher.priority ?? 0),
    );

    for (const entry of sorted) {
      if (this.matches(entry.matcher, context)) {
        return entry.component;
      }
    }

    return this.defaultComponent;
  }

  private matches(matcher: AttributeMatcher<TNode>, context: AttributeControlContext<TNode>): boolean {
    if (matcher.name !== undefined && context.attributeName !== matcher.name) {
      return false;
    }

    if (matcher.names !== undefined && !matcher.names.includes(context.attributeName)) {
      return false;
    }

    if (matcher.valueType !== undefined) {
      const actual = inferValueType(context.value);
      if (actual !== matcher.valueType) return false;
    }

    if (matcher.match !== undefined) {
      return matcher.match(context);
    }

    return (
      matcher.name !== undefined ||
      matcher.names !== undefined ||
      matcher.valueType !== undefined
    );
  }
}

export function inferValueType(value: unknown): AttributeValueType {
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return "array";
  return "unknown";
}
