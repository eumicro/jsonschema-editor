interface BrandLinkProps {
  href: string;
  brandPrefix: string;
  brandSuffix: string;
  onNavigate: () => void;
}

export function BrandLink({ href, brandPrefix, brandSuffix, onNavigate }: BrandLinkProps) {
  return (
    <a
      href={href}
      className="app__brand"
      aria-label="JSON Schema Editor"
      onClick={(event) => {
        event.preventDefault();
        onNavigate();
      }}
    >
      <span className="app__brand-prefix">{brandPrefix}</span>
      <span className="app__brand-suffix">{brandSuffix}</span>
    </a>
  );
}
