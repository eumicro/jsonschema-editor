import type { ReactNode } from "react";
import type { AppLocale, AppPage, AppStack } from "../../../app-routing.js";
import { SiteFooter } from "../molecules/SiteFooter.js";
import { SiteHero } from "../molecules/SiteHero.js";
import { SiteTopbar, type SiteChromeUi } from "../molecules/SiteTopbar.js";

interface SiteShellProps {
  ui: SiteChromeUi & {
    tagline: string;
    subtitle: string;
    footerCopyright: string;
    footerImprint: string;
  };
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
  children: ReactNode;
}

export function SiteShell({
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
  children,
}: SiteShellProps) {
  return (
    <div className="app">
      <SiteTopbar
        ui={ui}
        activePage={activePage}
        ownedStack={ownedStack}
        locale={locale}
        examplesHref={examplesHref}
        getStartedHref={getStartedHref}
        imprintHref={imprintHref}
        vueHref={vueHref}
        reactHref={reactHref}
        onLocaleChange={onLocaleChange}
        onOpenExamples={onOpenExamples}
        onOpenGetStarted={onOpenGetStarted}
        onOpenImprint={onOpenImprint}
        onSelectStack={onSelectStack}
      />
      <SiteHero tagline={ui.tagline} subtitle={ui.subtitle} />
      {children}
      <SiteFooter
        copyright={ui.footerCopyright}
        imprintLabel={ui.footerImprint}
        imprintHref={imprintHref}
        imprintActive={activePage === "imprint"}
        onOpenImprint={onOpenImprint}
      />
    </div>
  );
}
