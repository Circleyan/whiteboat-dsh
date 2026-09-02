import { describe, expect, it } from "vitest";
import {
  WHITEBOAT_DSH_DIRECT_USE_STATUS,
  createWhiteboatDshBindingCss,
  getWhiteboatDshHostBindings,
  resolveWhiteboatDshDesignSystemAttributes,
} from "../src/design-system/direct-use";

describe("Whiteboat DSH design-system direct-use boundary", () => {
  it("defaults owned surfaces to Whiteboat design language", () => {
    expect(resolveWhiteboatDshDesignSystemAttributes()).toEqual({
      className: "wb-design-system",
      "data-wb-host": "dsh",
      "data-wb-surface": "whiteboat",
    });
    expect(getWhiteboatDshHostBindings("whiteboat")).toEqual({
      "--wb-semantic-type-family-ui":
        "var(--dsw-font-family, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif)",
      "--wb-semantic-type-family-reading":
        "var(--dsw-font-family, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif)",
    });
  });

  it("binds a system-adjacent DSH surface without replacing Whiteboat's source", () => {
    const bindings = getWhiteboatDshHostBindings("host");
    expect(bindings["--wb-semantic-color-background"]).toBe(
      "var(--dsw-alias-bg-base)",
    );
    expect(bindings["--wb-semantic-color-interactive"]).toBe(
      "var(--dsw-alias-brand-primary)",
    );
  });

  it("keeps brand spectrum values direct on hybrid surfaces", () => {
    const bindings = getWhiteboatDshHostBindings("hybrid");
    expect(bindings["--wb-semantic-color-background"]).toBe(
      "var(--dsw-alias-bg-base)",
    );
    expect(bindings["--wb-semantic-color-interactive"]).toBeUndefined();
    expect(bindings["--wb-semantic-color-signal-resonance"]).toBeUndefined();
  });

  it("emits scoped CSS and remains disconnected from the stable water surface", () => {
    const css = createWhiteboatDshBindingCss("whiteboat");
    expect(css).toContain('data-wb-host="dsh"');
    expect(css).toContain('data-wb-surface="whiteboat"');
    expect(css).not.toContain(":root");
    expect(WHITEBOAT_DSH_DIRECT_USE_STATUS.wiredToRuntime).toBe(false);
  });
});
