import type { AppLocale, AppPage, AppStack } from "../../../app-routing.js";
import { BrandLink } from "../atoms/BrandLink.js";
import { LocaleSelect } from "../atoms/LocaleSelect.js";
import { NavLink } from "../atoms/NavLink.js";
import { StackSwitch } from "../atoms/StackSwitch.js";

export interface SiteChromeUi {
  brandPrefix: string;
  brandSuffix: string;
  topNavAria: string;
  navGetStarted: string;
  navExamples: string;
  navImprint: string;
  stackAria: string;
  localeLabel: string;
}

interface SiteTopbarProps {
  ui: SiteChromeUi;
  activePage: AppPage;
  ownedStack: AppStack;
  locale: AppLocale;
  examplesHref: string;
  getStartedHref: string;
  imprintHref: string;
  vueHref: string;
  reactHref: string;
  onLocaleChange: (locale: AppLocale) => void;
  onOpenExamples: () => void;
  onOpenGetStarted: () => void;
  onOpenImprint: () => void;
  onSelectStack: (stack: AppStack) => void;
}

export function SiteTopbar({
  ui,
  activePage,
  ownedStack,
  locale,
  examplesHref,
  getStartedHref,
  imprintHref,
  vueHref,
  reactHref,
  onLocaleChange,
  onOpenExamples,
  onOpenGetStarted,
  onOpenImprint,
  onSelectStack,
}: SiteTopbarProps) {
  return (
    <header className="app__topbar">
      <div className="app__topbar-start">
        <BrandLink
          href={examplesHref}
          brandPrefix={ui.brandPrefix}
          brandSuffix={ui.brandSuffix}
          onNavigate={onOpenExamples}
        />
        <nav className="app__topnav" aria-label={ui.topNavAria}>
          <NavLink
            href={getStartedHref}
            active={activePage === "get-started"}
            label={ui.navGetStarted}
            onNavigate={onOpenGetStarted}
          />
          <NavLink
            href={examplesHref}
            active={activePage === "examples"}
            label={ui.navExamples}
            onNavigate={onOpenExamples}
          />
          <NavLink
            href={imprintHref}
            active={activePage === "imprint"}
            label={ui.navImprint}
            onNavigate={onOpenImprint}
          />
        </nav>
      </div>
      <div className="app__topbar-actions">
        <StackSwitch
          ariaLabel={ui.stackAria}
          ownedStack={ownedStack}
          vueHref={vueHref}
          reactHref={reactHref}
          onSelect={onSelectStack}
        />
        <LocaleSelect label={ui.localeLabel} locale={locale} onLocaleChange={onLocaleChange} />
      </div>
    </header>
  );
}
