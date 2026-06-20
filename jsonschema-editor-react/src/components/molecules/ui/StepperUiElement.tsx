import { useMemo, useState } from "react";
import type { Step, Stepper, UiElement } from "@jsonschema-editor/ui-schema";
import { JseButton } from "../../atoms/JseButton.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
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
}: StepperUiElementProps) {
  const { t } = useJseI18n();
  const [activeStep, setActiveStep] = useState(0);

  const steps = useMemo(
    () => element.elements.filter((child): child is Step => child.elementKind === "Step"),
    [element.elements],
  );

  const activeStepElement = steps[activeStep] ?? steps[0];
  const isFirst = activeStep <= 0;
  const isLast = activeStep >= steps.length - 1;

  function goToStep(index: number) {
    if (index < 0 || index >= steps.length) return;
    setActiveStep(index);
  }

  return (
    <div className="jse-stepper">
      <ol className="jse-stepper__steps" role="list">
        {steps.map((step, index) => (
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
              onClick={() => goToStep(index)}
            >
              <span className="jse-stepper__step-number">{index + 1}</span>
              <span className="jse-stepper__step-label">
                {step.label ?? t("stepper.step", { index: index + 1 })}
              </span>
            </button>
          </li>
        ))}
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
