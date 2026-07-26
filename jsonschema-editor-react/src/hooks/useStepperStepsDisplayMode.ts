import { useCallback, useEffect, useRef, useState } from "react";
import {
  STEPPER_STEPS_DISPLAY_MODES,
  activeStepLabelClipped,
  type StepperStepsDisplayMode,
} from "@jsonschema-editor/ui-schema";

export function useStepperStepsDisplayMode(stepCount: number, activeStep: number) {
  const containerRef = useRef<HTMLOListElement>(null);
  const [displayMode, setDisplayMode] = useState<StepperStepsDisplayMode>("full");

  const updateDisplayMode = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    for (const mode of STEPPER_STEPS_DISPLAY_MODES) {
      setDisplayMode(mode);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      if (!activeStepLabelClipped(container)) return;
    }

    setDisplayMode("minimal");
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      void updateDisplayMode();
    });
    observer.observe(container);
    void updateDisplayMode();

    return () => observer.disconnect();
  }, [stepCount, activeStep, updateDisplayMode]);

  return { containerRef, displayMode };
}
