import type { AppStack } from "../../../app-routing.js";

interface StackSwitchProps {
  ariaLabel: string;
  ownedStack: AppStack;
  vueHref: string;
  reactHref: string;
  onSelect: (stack: AppStack) => void;
}

export function StackSwitch({
  ariaLabel,
  ownedStack,
  vueHref,
  reactHref,
  onSelect,
}: StackSwitchProps) {
  return (
    <nav className="app__stack-switch" aria-label={ariaLabel}>
      <a
        href={vueHref}
        className={`app__stack-switch-link${ownedStack === "vue" ? " app__stack-switch-link--active" : ""}`}
        aria-current={ownedStack === "vue" ? "page" : undefined}
        onClick={(event) => {
          if (ownedStack === "vue") {
            event.preventDefault();
            return;
          }
          onSelect("vue");
        }}
      >
        Vue
      </a>
      <a
        href={reactHref}
        className={`app__stack-switch-link${ownedStack === "react" ? " app__stack-switch-link--active" : ""}`}
        aria-current={ownedStack === "react" ? "page" : undefined}
        onClick={(event) => {
          if (ownedStack === "react") {
            event.preventDefault();
            return;
          }
          onSelect("react");
        }}
      >
        React
      </a>
    </nav>
  );
}
