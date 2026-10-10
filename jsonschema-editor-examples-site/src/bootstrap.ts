const STACK_KEY = "jse.site.stack";

function preferredStack(): "vue" | "react" {
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    if (raw === "react" || raw === "vue") return raw;
  } catch {
    /* private mode */
  }
  return "vue";
}

const path = location.pathname.replace(/\/+$/, "") || "/";
if (path === "/" || path === "") {
  location.replace("/en/get-started/vue");
} else {
  const parts = path.split("/").filter(Boolean);
  const stack =
    (parts[1] === "examples" || parts[1] === "get-started") &&
    (parts[2] === "vue" || parts[2] === "react")
      ? parts[2]
      : preferredStack();
  if (stack === "react") {
    await import("../../jsonschema-editor-examples-react/src/main.tsx");
  } else {
    await import("../../jsonschema-editor-examples/src/main.ts");
  }
}
