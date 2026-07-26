import { useMemo, useState } from "react";
import {
  resolveStepIndicatorLabel,
  resolveUiI18nString,
  type Step,
  type Stepper,
  type UiElement,
} from "@jsonschema-editor/ui-schema";
import { JseButton } from "../../atoms/JseButton.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { useStepperStepsDisplayMode } from "../../../hooks/useStepperStepsDisplayMode.js";
import { buildUiElementKey } from "../../../utils/ui-element-key.js";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";
import { UiFormElementResolver } from "./UiFormElementResolver.js";

export interface StepperUiElementProps extends UiElementRendererProps {
  element: Stepper;
}

export function StepperUiElement({
  element,
  schema,
  document,
  data,
  onDataChange,
  readonly,
  scopePrefix,
}: StepperUiElementProps) {
  const { t, te } = useJseI18n();
  const [activeStep, setActiveStep] = useState(0);

  const steps = useMemo(
    () => element.elements.filter((child): child is Step => child.elementKind === "Step"),
    [element.elements],
  );

  const activeStepElement = steps[activeStep] ?? steps[0];
  const isFirst = activeStep <= 0;
  const isLast = activeStep >= steps.length - 1;

  function stepLabel(step: Step, index: number): string {
    return (
      resolveUiI18nString(
        { i18n: step.i18n, defaultMessage: step.label, suffix: "label" },
        (key) => (te(key) ? t(key) : undefined),
      ) ?? t("stepper.step", { index: index + 1 })
    );
  }

  const { containerRef, displayMode } = useStepperStepsDisplayMode(steps.length, activeStep);

  function stepIndicatorLabel(step: Step, index: number): string | undefined {
    const fullLabel = stepLabel(step, index);
    return resolveStepIndicatorLabel(displayMode, fullLabel, index === activeStep);
  }

  function scrollActiveStepIntoView() {
    requestAnimationFrame(() => {
      containerRef.current
        ?.querySelector<HTMLElement>(".jse-stepper__step-indicator--active")
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  function goToStep(index: number) {
    if (index < 0 || index >= steps.length) return;
    setActiveStep(index);
    scrollActiveStepIntoView();
  }

  return (
    <div className="jse-stepper">
      <ol
        ref={containerRef}
        className={`jse-stepper__steps jse-stepper__steps--${displayMode}`}
        role="list"
      >
        {steps.map((step, index) => {
          const fullLabel = stepLabel(step, index);
          const indicatorLabel = stepIndicatorLabel(step, index);

          return (
            <li
              key={index}
              className={[
                "jse-stepper__step-indicator",
                index === activeStep ? "jse-stepper__step-indicator--active" : "",
                index < activeStep ? "jse-stepper__step-indicator--done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <button
                type="button"
                className="jse-stepper__step-button"
                aria-current={index === activeStep ? "step" : undefined}
                aria-label={`${index + 1}. ${fullLabel}`}
                title={fullLabel}
                onClick={() => goToStep(index)}
              >
                <span className="jse-stepper__step-number">{index + 1}</span>
                {indicatorLabel ? (
                  <span className="jse-stepper__step-label">{indicatorLabel}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      {activeStepElement ? (
        <div className="jse-stepper__panel">
          {activeStepElement.elements.map((child: UiElement, index: number) => (
            <UiFormElementResolver
              key={buildUiElementKey(`step-${activeStep}`, child, index)}
              element={child}
              schema={schema}
              document={document}
              data={data}
              onDataChange={onDataChange}
              readonly={readonly}
              scopePrefix={scopePrefix}
            />
          ))}
        </div>
      ) : null}

      {steps.length > 1 ? (
        <div className="jse-stepper__nav">
          <JseButton type="button" disabled={isFirst || readonly} onClick={() => goToStep(activeStep - 1)}>
            {t("stepper.back")}
          </JseButton>
          <JseButton type="button" disabled={isLast || readonly} onClick={() => goToStep(activeStep + 1)}>
            {t("stepper.next")}
          </JseButton>
        </div>
      ) : null}
    </div>
  );
}
