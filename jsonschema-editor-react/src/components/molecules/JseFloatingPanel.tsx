import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  anchorPanelNearElement,
  useFloatingPanel,
} from "../../hooks/useFloatingPanel.js";
import { useJseI18n } from "../../context/JseI18nContext.js";
import { JseIconButton } from "../atoms/JseIconButton.js";

export interface JseFloatingPanelHandle {
  anchorNear: (element: HTMLElement) => void;
  show: () => void;
}

export interface JseFloatingPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  children: ReactNode;
}

export const JseFloatingPanel = forwardRef<JseFloatingPanelHandle, JseFloatingPanelProps>(
  function JseFloatingPanel(
    {
      open,
      onOpenChange,
      title,
      initialX = 24,
      initialY = 24,
      initialWidth = 320,
      initialHeight = 280,
      children,
    },
    ref,
  ) {
    const { t } = useJseI18n();
    const panel = useFloatingPanel({
      initialX,
      initialY,
      initialWidth,
      initialHeight,
    });
    const rectRef = useRef(panel.rect);
    rectRef.current = panel.rect;

    const { show, hide } = panel;
    useEffect(() => {
      if (open) show();
      else hide();
    }, [open, show, hide]);

    useImperativeHandle(ref, () => ({
      anchorNear(element: HTMLElement) {
        const anchor = anchorPanelNearElement(rectRef.current, element, rectRef.current.width);
        panel.show(anchor);
        onOpenChange(true);
      },
      show() {
        panel.show();
        onOpenChange(true);
      },
    }));

    useEffect(() => {
      if (!open) return;

      function onKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          event.preventDefault();
          onOpenChange(false);
        }
      }

      window.addEventListener("keydown", onKeydown);
      return () => window.removeEventListener("keydown", onKeydown);
    }, [onOpenChange, open]);

    if (!open) return null;

    const panelStyle = {
      left: `${panel.rect.x}px`,
      top: `${panel.rect.y}px`,
      width: `${panel.rect.width}px`,
      height: panel.minimized ? `${panel.minimizedHeight}px` : `${panel.rect.height}px`,
    };

    return createPortal(
      <div
        className="jse-floating-panel"
        style={panelStyle}
        role="dialog"
        aria-label={title}
      >
        <header className="jse-floating-panel__header" onPointerDown={panel.startDrag}>
          <span className="jse-floating-panel__title">{title}</span>
          <div className="jse-floating-panel__controls">
            <JseIconButton
              label={panel.minimized ? t("panel.maximize") : t("panel.minimize")}
              onClick={(event) => {
                event.stopPropagation();
                panel.toggleMinimized();
              }}
            >
              {panel.minimized ? "□" : "−"}
            </JseIconButton>
            <JseIconButton
              label={t("panel.close")}
              onClick={(event) => {
                event.stopPropagation();
                onOpenChange(false);
              }}
            >
              ×
            </JseIconButton>
          </div>
        </header>

        {!panel.minimized ? (
          <div className="jse-floating-panel__body">{children}</div>
        ) : null}

        {!panel.minimized ? (
          <div
            className="jse-floating-panel__resize"
            aria-hidden="true"
            onPointerDown={panel.startResize}
          />
        ) : null}
      </div>,
      document.body,
    );
  },
);
