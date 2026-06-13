export type AppPage = "examples" | "get-started" | "imprint";

export function pageFromHash(hash = window.location.hash): AppPage {
  if (hash === "#/get-started") return "get-started";
  if (hash === "#/imprint") return "imprint";
  return "examples";
}

export function hashForPage(page: AppPage): string {
  if (page === "get-started") return "#/get-started";
  if (page === "imprint") return "#/imprint";
  return "#/";
}

export function navigateToPage(page: AppPage): void {
  const nextHash = hashForPage(page);
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }
}
