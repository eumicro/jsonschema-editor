import { isAppStack, type AppStack } from "../app-routing";

export const SITE_STACK_STORAGE_KEY = "jse.site.stack";

export function readPreferredStack(fallback: AppStack = "vue"): AppStack {
  try {
    const raw = sessionStorage.getItem(SITE_STACK_STORAGE_KEY);
    if (raw && isAppStack(raw)) return raw;
  } catch {
    /* private mode / SSR */
  }
  return fallback;
}

export function writePreferredStack(stack: AppStack): void {
  try {
    sessionStorage.setItem(SITE_STACK_STORAGE_KEY, stack);
  } catch {
    /* private mode / SSR */
  }
}
