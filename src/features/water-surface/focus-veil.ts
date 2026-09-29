import { clampWaterValue } from "whiteboat-core/water-field";

/** Time cap for the blur to settle; the boat's voyage share usually binds first. */
export const DSH_WATER_FOCUS_ENTER_MS = 720;
/** Matches `--wb-entry-water-focus-release-duration`. */
export const DSH_WATER_FOCUS_RELEASE_MS = 320;

export interface DshWaterFocusAnchor {
  left: number;
  top: number;
  right: number;
  bottom: number;
  dock: { x: number; y: number };
}

export interface DshWaterFocusState {
  anchor: DshWaterFocusAnchor | null;
  active: boolean;
  amount: number;
  from: number;
  startedAt: number;
  startDistance: number;
}

export function createDshWaterFocusState(): DshWaterFocusState {
  return { anchor: null, active: false, amount: 0, from: 0, startedAt: 0, startDistance: 0 };
}

/** Composer card plus the dock its boat moors at. */
export function resolveDshWaterFocusAnchor(
  composer: { x: number; y: number; width: number; height: number },
  dock: { x: number; y: number },
): DshWaterFocusAnchor {
  return {
    left: Math.min(composer.x, dock.x),
    top: Math.min(composer.y, dock.y),
    right: Math.max(composer.x + composer.width, dock.x),
    bottom: Math.max(composer.y + composer.height, dock.y),
    dock,
  };
}

/** Start the enter or release ramp from wherever the blur currently is. */
export function toggleDshWaterFocus(
  state: DshWaterFocusState,
  active: boolean,
  boat: { x: number; y: number },
  now: number,
): boolean {
  if (state.active === active) return false;
  const dock = state.anchor?.dock;
  state.active = active;
  state.from = state.amount;
  state.startedAt = now;
  state.startDistance = dock ? Math.hypot(dock.x - boat.x, dock.y - boat.y) : 0;
  return true;
}

/**
 * The blur never outruns the boat: it deepens with the boat's progress toward
 * the dock (and no faster than the settle duration). Only the time cap is
 * eased; the voyage share stays linear so the wake is never overtaken.
 */
export function advanceDshWaterFocus(
  state: DshWaterFocusState,
  input: { boat: { x: number; y: number }; sailing: boolean; reducedMotion: boolean; now: number },
): number {
  if (state.active) {
    const dock = state.anchor?.dock;
    const voyage = !input.sailing || !dock || state.startDistance < 1
      ? 1
      : clampWaterValue(
        1 - Math.hypot(dock.x - input.boat.x, dock.y - input.boat.y) / state.startDistance,
        0,
        1,
      );
    const time = clampWaterValue((input.now - state.startedAt) / DSH_WATER_FOCUS_ENTER_MS, 0, 1);
    const progress = input.reducedMotion ? 1 : Math.min(voyage, 1 - Math.pow(1 - time, 3));
    state.amount = Math.max(state.amount, state.from + (1 - state.from) * progress);
  } else {
    const time = input.reducedMotion
      ? 1
      : clampWaterValue((input.now - state.startedAt) / DSH_WATER_FOCUS_RELEASE_MS, 0, 1);
    const eased = time < 0.5 ? 4 * time ** 3 : 1 - Math.pow(-2 * time + 2, 3) / 2;
    state.amount = state.from * (1 - eased);
  }
  return state.amount;
}

/**
 * Clear ellipse around the composer, dock and the live boat. The ellipse is
 * inscribed in their box, so it grows until a boat near a corner stays clear.
 */
export function resolveDshWaterFocusArea(
  anchor: DshWaterFocusAnchor,
  boat: { x: number; y: number },
  boatRadius: number,
): { x: number; y: number; rx: number; ry: number } {
  const left = Math.min(anchor.left, boat.x - boatRadius);
  const right = Math.max(anchor.right, boat.x + boatRadius);
  const top = Math.min(anchor.top, boat.y - boatRadius);
  const bottom = Math.max(anchor.bottom, boat.y + boatRadius);
  const x = (left + right) / 2;
  const y = (top + bottom) / 2;
  const reach = Math.max(
    1,
    Math.hypot((boat.x - x) / ((right - left) / 2 || 1), (boat.y - y) / ((bottom - top) / 2 || 1)),
  );
  return { x, y, rx: ((right - left) / 2) * reach, ry: ((bottom - top) / 2) * reach };
}

export function isDshWaterFocusSettled(state: DshWaterFocusState, sailing: boolean): boolean {
  return state.active ? state.amount >= 1 && !sailing : state.amount <= 0;
}
