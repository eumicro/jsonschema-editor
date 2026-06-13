export type AppPage = "examples" | "get-started";

export function pageFromHash(hash = window.location.hash): AppPage {
  return hash === "#/get-started" ? "get-started" : "examples";
}

export function hashForPage(page: AppPage): string {
  return page === "get-started" ? "#/get-started" : "#/";
}

export function navigateToPage(page: AppPage): void {
  const nextHash = hashForPage(page);
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }
}
