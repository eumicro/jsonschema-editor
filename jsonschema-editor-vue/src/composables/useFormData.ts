import { inject, provide, type InjectionKey, type Ref } from "vue";

export const FORM_DATA_KEY: InjectionKey<Ref<Record<string, unknown>>> = Symbol("jseFormData");

export function provideFormData(data: Ref<Record<string, unknown>>): void {
  provide(FORM_DATA_KEY, data);
}

/** Root form data; falls back to the nearest `v-model` when no provider exists. */
export function useFormData(fallback: Ref<Record<string, unknown>>): Ref<Record<string, unknown>> {
  return inject(FORM_DATA_KEY, fallback);
}
