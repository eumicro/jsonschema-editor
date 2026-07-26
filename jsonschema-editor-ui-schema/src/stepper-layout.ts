export type StepperStepsDisplayMode = "full" | "compact" | "minimal";

export const STEPPER_STEPS_DISPLAY_MODES: readonly StepperStepsDisplayMode[] = [
  "full",
  "compact",
  "minimal",
];

export function abbreviateStepLabel(label: string, maxLength = 3): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}…`;
}

export function resolveStepIndicatorLabel(
  mode: StepperStepsDisplayMode,
  fullLabel: string,
  isActive: boolean,
): string | undefined {
  if (isActive) return fullLabel;
  if (mode === "full") return fullLabel;
  if (mode === "compact") return abbreviateStepLabel(fullLabel);
  return undefined;
}

export function stepperStepsOverflows(container: HTMLElement): boolean {
  return container.scrollWidth > container.clientWidth + 1;
}

export function activeStepLabelClipped(container: HTMLElement): boolean {
  const activeLabel = container.querySelector<HTMLElement>(
    ".jse-stepper__step-indicator--active .jse-stepper__step-label",
  );
  if (!activeLabel) return stepperStepsOverflows(container);
  return activeLabel.scrollWidth > activeLabel.clientWidth + 1;
}
