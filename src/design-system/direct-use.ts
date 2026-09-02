export type WhiteboatDshSurfacePolicy = "host" | "whiteboat" | "hybrid";
export type WhiteboatDshThemePreference = "light" | "dark" | "system";

export interface WhiteboatDshDesignSystemContext {
  policy?: WhiteboatDshSurfacePolicy;
  theme?: WhiteboatDshThemePreference;
}

export interface WhiteboatDshDesignSystemAttributes {
  className: "wb-design-system";
  "data-wb-host": "dsh";
  "data-wb-surface": WhiteboatDshSurfacePolicy;
  "data-wb-theme"?: "light" | "dark";
}

const DSH_COMMON_BINDINGS = Object.freeze({
  "--wb-semantic-type-family-ui":
    "var(--dsw-font-family, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif)",
  "--wb-semantic-type-family-reading":
    "var(--dsw-font-family, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif)",
});

const DSH_HYBRID_BINDINGS = Object.freeze({
  "--wb-semantic-color-background": "var(--dsw-alias-bg-base)",
  "--wb-semantic-color-layer-01": "var(--dsw-alias-bg-layer-1)",
  "--wb-semantic-color-layer-02": "var(--dsw-alias-bg-layer-2)",
  "--wb-semantic-color-text-primary": "var(--dsw-alias-label-primary)",
  "--wb-semantic-color-text-secondary": "var(--dsw-alias-label-tertiary)",
  "--wb-semantic-color-border-subtle": "var(--dsw-alias-border-l2)",
  "--wb-semantic-color-border-strong": "var(--dsw-alias-border-l3)",
});

const DSH_HOST_BINDINGS = Object.freeze({
  ...DSH_HYBRID_BINDINGS,
  "--wb-semantic-color-interactive": "var(--dsw-alias-brand-primary)",
  "--wb-semantic-color-focus": "var(--dsw-alias-brand-primary)",
  "--wb-semantic-color-support-error":
    "var(--dsw-alias-state-error-primary)",
});

export function resolveWhiteboatDshDesignSystemAttributes(
  context: WhiteboatDshDesignSystemContext = {},
): WhiteboatDshDesignSystemAttributes {
  const policy = context.policy ?? "whiteboat";
  const attributes: WhiteboatDshDesignSystemAttributes = {
    className: "wb-design-system",
    "data-wb-host": "dsh",
    "data-wb-surface": policy,
  };
  if (context.theme && context.theme !== "system") {
    attributes["data-wb-theme"] = context.theme;
  }
  return attributes;
}

export function getWhiteboatDshHostBindings(
  policy: WhiteboatDshSurfacePolicy,
): Readonly<Record<string, string>> {
  if (policy === "host") {
    return Object.freeze({ ...DSH_COMMON_BINDINGS, ...DSH_HOST_BINDINGS });
  }
  if (policy === "hybrid") {
    return Object.freeze({ ...DSH_COMMON_BINDINGS, ...DSH_HYBRID_BINDINGS });
  }
  return DSH_COMMON_BINDINGS;
}

export function createWhiteboatDshBindingCss(
  policy: WhiteboatDshSurfacePolicy,
): string {
  const selector =
    `.wb-design-system[data-wb-host="dsh"][data-wb-surface="${policy}"]`;
  const declarations = Object.entries(getWhiteboatDshHostBindings(policy))
    .map(([property, value]) => `  ${property}: ${value};`)
    .join("\n");
  return `${selector} {\n${declarations}\n}`;
}

export const WHITEBOAT_DSH_DIRECT_USE_STATUS = Object.freeze({
  maturity: "draft",
  wiredToRuntime: false,
  requirement: "WB-DEV-009",
  note: "Owned DSH surfaces default to Whiteboat values; this boundary is not mounted by the current water surface.",
});
