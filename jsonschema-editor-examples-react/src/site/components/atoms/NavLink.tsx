interface NavLinkProps {
  href: string;
  active?: boolean;
  label: string;
  onNavigate: () => void;
}

export function NavLink({ href, active, label, onNavigate }: NavLinkProps) {
  return (
    <a
      href={href}
      className={`app__topnav-link${active ? " app__topnav-link--active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={(event) => {
        event.preventDefault();
        onNavigate();
      }}
    >
      {label}
    </a>
  );
}
