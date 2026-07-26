import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import {
  STEPPER_STEPS_DISPLAY_MODES,
  activeStepLabelClipped,
  type StepperStepsDisplayMode,
} from "@jsonschema-editor/ui-schema";

export function useStepperStepsDisplayMode(
  containerRef: Ref<HTMLElement | null | undefined>,
  watchSource: Ref<unknown>,
) {
  const displayMode = ref<StepperStepsDisplayMode>("full");
  let observer: ResizeObserver | undefined;

  async function updateDisplayMode() {
    const container = containerRef.value;
    if (!container) return;

    for (const mode of STEPPER_STEPS_DISPLAY_MODES) {
      displayMode.value = mode;
      await nextTick();
      if (!activeStepLabelClipped(container)) return;
    }

    displayMode.value = "minimal";
  }

  onMounted(() => {
    const container = containerRef.value;
    if (!container) return;

    observer = new ResizeObserver(() => {
      void updateDisplayMode();
    });
    observer.observe(container);
    void updateDisplayMode();
  });

  watch(watchSource, () => {
    void updateDisplayMode();
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return { displayMode };
}
