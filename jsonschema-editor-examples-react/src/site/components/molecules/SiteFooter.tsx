interface SiteFooterProps {
  copyright: string;
  imprintLabel: string;
  imprintHref: string;
  imprintActive?: boolean;
  onOpenImprint: () => void;
}

export function SiteFooter({
  copyright,
  imprintLabel,
  imprintHref,
  imprintActive,
  onOpenImprint,
}: SiteFooterProps) {
  return (
    <footer className="app__footer">
      <p className="app__footer-copy">{copyright}</p>
      <a
        href={imprintHref}
        className="app__footer-link"
        aria-current={imprintActive ? "page" : undefined}
        onClick={(event) => {
          event.preventDefault();
          onOpenImprint();
        }}
      >
        {imprintLabel}
      </a>
    </footer>
  );
}
