import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  DSH_WATER_FOCUS_ENTER_MS,
  DSH_WATER_FOCUS_RELEASE_MS,
  advanceDshWaterFocus,
  createDshWaterFocusState,
  isDshWaterFocusSettled,
  resolveDshWaterFocusAnchor,
  resolveDshWaterFocusArea,
  toggleDshWaterFocus,
} from "../src/features/water-surface/focus-veil";
import { WaterSurfaceStore } from "../src/features/water-surface/surface-store";
import { WATER_SURFACE_STYLES } from "../src/features/water-surface/styles";

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

describe("DSH composer focus veil", () => {
  const anchor = resolveDshWaterFocusAnchor(
    { x: 300, y: 200, width: 400, height: 224 },
    { x: 250, y: 230 },
  );

  it("never deepens the blur ahead of the sailing boat", () => {
    const state = createDshWaterFocusState();
    state.anchor = anchor;
    toggleDshWaterFocus(state, true, { x: 50, y: 230 }, 0);
    // Long past the time cap, but only a quarter of the voyage sailed.
    const quarter = advanceDshWaterFocus(state, {
      boat: { x: 100, y: 230 }, sailing: true, reducedMotion: false, now: 5000,
    });
    expect(quarter).toBeCloseTo(0.25, 5);
    const half = advanceDshWaterFocus(state, {
      boat: { x: 150, y: 230 }, sailing: true, reducedMotion: false, now: 5040,
    });
    expect(half).toBeCloseTo(0.5, 5);
    expect(isDshWaterFocusSettled(state, true)).toBe(false);
    const moored = advanceDshWaterFocus(state, {
      boat: { x: 250, y: 230 }, sailing: false, reducedMotion: false, now: 5080,
    });
    expect(moored).toBe(1);
    expect(isDshWaterFocusSettled(state, false)).toBe(true);
  });

  it("caps a stationary boat by the eased enter time and releases smoothly", () => {
    const state = createDshWaterFocusState();
    state.anchor = anchor;
    toggleDshWaterFocus(state, true, { x: 250, y: 230 }, 0);
    const early = advanceDshWaterFocus(state, {
      boat: { x: 250, y: 230 }, sailing: false, reducedMotion: false, now: DSH_WATER_FOCUS_ENTER_MS * 0.1,
    });
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(0.4);
    advanceDshWaterFocus(state, {
      boat: { x: 250, y: 230 }, sailing: false, reducedMotion: false, now: DSH_WATER_FOCUS_ENTER_MS,
    });
    expect(state.amount).toBe(1);
    toggleDshWaterFocus(state, false, { x: 250, y: 230 }, 1000);
    const mid = advanceDshWaterFocus(state, {
      boat: { x: 250, y: 230 }, sailing: false, reducedMotion: false, now: 1000 + DSH_WATER_FOCUS_RELEASE_MS / 2,
    });
    expect(mid).toBeCloseTo(0.5, 5);
    advanceDshWaterFocus(state, {
      boat: { x: 250, y: 230 }, sailing: false, reducedMotion: false, now: 1000 + DSH_WATER_FOCUS_RELEASE_MS,
    });
    expect(state.amount).toBe(0);
  });

  it("holds an established focus while relocating", () => {
    const state = createDshWaterFocusState();
    state.anchor = anchor;
    toggleDshWaterFocus(state, true, { x: 250, y: 230 }, 0);
    advanceDshWaterFocus(state, { boat: { x: 250, y: 230 }, sailing: false, reducedMotion: false, now: 900 });
    state.anchor = resolveDshWaterFocusAnchor({ x: 20, y: 20, width: 400, height: 224 }, { x: 40, y: 60 });
    const sailing = advanceDshWaterFocus(state, {
      boat: { x: 240, y: 220 }, sailing: true, reducedMotion: false, now: 940,
    });
    expect(sailing).toBe(1);
  });

  it("applies instantly under reduced motion", () => {
    const state = createDshWaterFocusState();
    state.anchor = anchor;
    toggleDshWaterFocus(state, true, { x: 50, y: 230 }, 0);
    expect(advanceDshWaterFocus(state, {
      boat: { x: 50, y: 230 }, sailing: true, reducedMotion: true, now: 0,
    })).toBe(1);
    toggleDshWaterFocus(state, false, { x: 50, y: 230 }, 10);
    expect(advanceDshWaterFocus(state, {
      boat: { x: 50, y: 230 }, sailing: false, reducedMotion: true, now: 10,
    })).toBe(0);
  });

  it("keeps the composer, dock and a corner boat inside the clear ellipse", () => {
    const boat = { x: 20, y: 700 };
    const area = resolveDshWaterFocusArea(anchor, boat, 54);
    const inside = (point: { x: number; y: number }) =>
      ((point.x - area.x) / area.rx) ** 2 + ((point.y - area.y) / area.ry) ** 2 <= 1 + 1e-9;
    expect(inside(boat)).toBe(true);
    expect(inside(anchor.dock)).toBe(true);
    expect(area.rx * 2).toBeGreaterThanOrEqual(anchor.right - anchor.left);
    expect(area.ry * 2).toBeGreaterThanOrEqual(anchor.bottom - anchor.top);
  });

  it("releases on dismissal but not on relocation", () => {
    vi.useFakeTimers();
    try {
      const store = new WaterSurfaceStore();
      store.showComposer("session");
      expect(store.getSnapshot().composerClosing).toBe(false);
      store.relocateComposer(10, 20);
      expect(store.getSnapshot().composerClosing).toBe(false);
      vi.runAllTimers();
      store.hideComposer();
      expect(store.getSnapshot()).toMatchObject({ composerOpen: true, composerClosing: true });
      vi.runAllTimers();
      expect(store.getSnapshot()).toMatchObject({ composerOpen: false, composerClosing: false });
    } finally {
      vi.useRealTimers();
    }
  });

  it("layers the blur between water and boat with the shared tokens", () => {
    for (const token of [
      "--wb-entry-water-focus-padding: 96px",
      "--wb-entry-water-focus-blur-near: 1.5px",
      "--wb-entry-water-focus-blur-mid: 3px",
      "--wb-entry-water-focus-blur-far: 6px",
      "--wb-entry-water-focus-release-duration: 320ms",
      "--wb-entry-water-focus-dash-floor: 0.3",
    ]) expect(WATER_SURFACE_STYLES).toContain(token);
    const veil = WATER_SURFACE_STYLES.match(/\.wb-dsh-water__focus-veil \{[^}]*\}/)?.[0] ?? "";
    expect(veil).toContain("z-index: 1;");
    expect(veil).not.toMatch(/opacity/);
    const source = read("../src/features/water-surface/index.tsx");
    expect(source).toContain("pauseDurationMs: 220");
    expect(source).toContain("resumeDurationMs: 320");
    expect(source).not.toContain("flowTimeScale");
    expect(source).toContain("water.setFlowPaused(focused)");
    expect(source).toContain("water.setMooring(waterFocusedRef.current && !target");
    expect(source).toContain("water.setFocus(amount > 0");
    expect(source).toContain('deviceMode !== "phone"');
  });
});
