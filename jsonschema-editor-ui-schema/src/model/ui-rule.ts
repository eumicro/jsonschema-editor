import type { UiSchemaObject } from "../types.js";

export type UiRuleEffect = "SHOW" | "HIDE" | "ENABLE" | "DISABLE";

export type UiRuleObject = NonNullable<UiSchemaObject["rule"]>;

export class UiRule {
  constructor(
    public effect: UiRuleEffect,
    public conditionScope: string,
    public conditionSchema: Record<string, unknown>,
  ) {}

  static fromJSON(json: UiRuleObject): UiRule {
    return new UiRule(json.effect, json.condition.scope, json.condition.schema);
  }

  toJSON(): UiRuleObject {
    return {
      effect: this.effect,
      condition: {
        scope: this.conditionScope,
        schema: { ...this.conditionSchema },
      },
    };
  }

  clone(): UiRule {
    return new UiRule(this.effect, this.conditionScope, { ...this.conditionSchema });
  }
}
