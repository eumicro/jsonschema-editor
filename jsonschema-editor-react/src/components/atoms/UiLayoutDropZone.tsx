import { useJseI18n } from "../../context/JseI18nContext.js";

export interface UiLayoutDropZoneProps {
  active?: boolean;
  label?: string;
  onDragOver?: (event: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (event: React.DragEvent) => void;
}

export function UiLayoutDropZone({
  active,
  label,
  onDragOver,
  onDragLeave,
  onDrop,
}: UiLayoutDropZoneProps) {
  const { t } = useJseI18n();

  return (
    <div
      className={["jse-layout-dropzone", active ? "jse-layout-dropzone--active" : ""]
        .filter(Boolean)
        .join(" ")}
      role="presentation"
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver?.(event);
      }}
      onDragLeave={() => onDragLeave?.()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop?.(event);
      }}
    >
      {active ? (
        <span className="jse-layout-dropzone__label">{label ?? t("layout.dropHere")}</span>
      ) : null}
    </div>
  );
}
