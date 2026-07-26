interface SiteHeroProps {
  tagline: string;
  subtitle: string;
}

export function SiteHero({ tagline, subtitle }: SiteHeroProps) {
  return (
    <section className="app__hero">
      <p className="app__tagline">{tagline}</p>
      <p className="app__subtitle">{subtitle}</p>
    </section>
  );
}
