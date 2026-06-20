export interface JseTabItem {
  id: string;
  label: string;
  description?: string;
}

export interface JseTabsProps {
  modelValue: string;
  onModelValueChange: (id: string) => void;
  tabs: JseTabItem[];
  panelIdPrefix?: string;
}

export function JseTabs({ modelValue, onModelValueChange, tabs, panelIdPrefix = "jse-tabpanel" }: JseTabsProps) {
  const activeDescription = tabs.find((tab) => tab.id === modelValue)?.description;

  function panelId(tabId: string) {
    return `${panelIdPrefix}-${tabId}`;
  }

  return (
    <div className="jse-tabs-wrap">
      <div className="jse-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={[
              "jse-tabs__tab",
              modelValue === tab.id ? "jse-tabs__tab--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-selected={modelValue === tab.id}
            aria-controls={panelId(tab.id)}
            id={`${panelIdPrefix}-tab-${tab.id}`}
            onClick={() => onModelValueChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeDescription ? (
        <p className="jse-tabs__description">{activeDescription}</p>
      ) : null}
    </div>
  );
}
