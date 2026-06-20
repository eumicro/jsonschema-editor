import type { ComponentType } from "react";

export interface TypeMatcher<T> {
  priority?: number;
  instanceOf?: abstract new (...args: never[]) => T;
  kind?: string;
  elementKind?: string;
  match?: (value: T, context?: unknown) => boolean;
}

export interface TypeControlRegistration<T> {
  id?: string;
  matcher: TypeMatcher<T>;
  component: ComponentType<any>;
}

export class TypeControlRegistry<T> {
  private registrations: TypeControlRegistration<T>[] = [];
  private defaultComponent: ComponentType<any> | null = null;

  register(registration: TypeControlRegistration<T>): this {
    this.registrations.push(registration);
    return this;
  }

  registerInstanceOf<C extends T>(
    ctor: abstract new (...args: never[]) => C,
    component: ComponentType<any>,
    options?: { priority?: number; id?: string },
  ): this {
    return this.register({
      id: options?.id,
      matcher: { instanceOf: ctor, priority: options?.priority },
      component,
    });
  }

  registerKind(kind: string, component: ComponentType<any>, priority = 0, id?: string): this {
    return this.register({ id, matcher: { kind, priority }, component });
  }

  registerElementKind(
    elementKind: string,
    component: ComponentType<any>,
    priority = 0,
    id?: string,
  ): this {
    return this.register({ id, matcher: { elementKind, priority }, component });
  }

  registerMatch(
    match: (value: T, context?: unknown) => boolean,
    component: ComponentType<any>,
    priority = 0,
    id?: string,
  ): this {
    return this.register({ id, matcher: { match, priority }, component });
  }

  setDefault(component: ComponentType<any>): this {
    this.defaultComponent = component;
    return this;
  }

  unregister(id: string): boolean {
    const before = this.registrations.length;
    this.registrations = this.registrations.filter((entry) => entry.id !== id);
    return this.registrations.length < before;
  }

  list(): readonly TypeControlRegistration<T>[] {
    return this.registrations;
  }

  resolve(value: T, context?: unknown): ComponentType<any> | null {
    const sorted = [...this.registrations].sort(
      (a, b) => (b.matcher.priority ?? 0) - (a.matcher.priority ?? 0),
    );

    for (const entry of sorted) {
      if (this.matches(entry.matcher, value, context)) {
        return entry.component;
      }
    }

    return this.defaultComponent;
  }

  private matches(matcher: TypeMatcher<T>, value: T, context?: unknown): boolean {
    if (matcher.instanceOf !== undefined && !(value instanceof matcher.instanceOf)) {
      return false;
    }

    if (matcher.kind !== undefined) {
      const kind = (value as { kind?: string }).kind;
      if (kind !== matcher.kind) return false;
    }

    if (matcher.elementKind !== undefined) {
      const elementKind = (value as { elementKind?: string }).elementKind;
      if (elementKind !== matcher.elementKind) return false;
    }

    if (matcher.match !== undefined) {
      return matcher.match(value, context);
    }

    return (
      matcher.instanceOf !== undefined ||
      matcher.kind !== undefined ||
      matcher.elementKind !== undefined
    );
  }
}
