import { afterEach, expect, it, vi } from "vitest";

const engine = vi.hoisted(() => ({
  activate: vi.fn(), setEnabled: vi.fn(), setBoatSpeed: vi.fn(),
  setSuspended: vi.fn(), setReducedMotion: vi.fn(), destroy: vi.fn(),
}));
vi.mock("howler", () => ({ Howl: vi.fn() }));
vi.mock("whiteboat-core/boat-water-source", () => ({ BOAT_WATER_SOURCE: "offline" }));
vi.mock("whiteboat-core/boat-water-sound", () => ({
  WhiteboatBoatSoundscape: class {
    constructor() { return engine; }
  },
}));
import { mountDshWaterAudio } from "../src/features/water-surface/audio";

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

it("routes trusted gestures, background and motion changes and removes every listener on exit", () => {
  const listeners = new Map<string, (event: { isTrusted: boolean }) => void>();
  const document = { hidden: true,
    addEventListener: vi.fn((name, fn) => listeners.set(name, fn)),
    removeEventListener: vi.fn((name, fn) => {
      expect(listeners.get(name)).toBe(fn); listeners.delete(name);
    }),
  };
  let motionChange: (() => void) | undefined;
  const motion = { matches: false,
    addEventListener: vi.fn((_, fn) => { motionChange = fn; }),
    removeEventListener: vi.fn((_, fn) => { expect(fn).toBe(motionChange); }),
  };
  vi.stubGlobal("document", document);
  vi.stubGlobal("window", { matchMedia: () => motion });
  const audio = mountDshWaterAudio({ dataset: {} } as HTMLElement, true);
  expect(engine.setSuspended).toHaveBeenLastCalledWith("document-hidden", true);
  expect(engine.activate).toHaveBeenCalledTimes(1);
  listeners.get("pointerdown")!({ isTrusted: false });
  expect(engine.activate).toHaveBeenCalledTimes(1);
  for (const name of ["pointerdown", "touchend", "keydown"]) listeners.get(name)!({ isTrusted: true });
  expect(engine.activate).toHaveBeenCalledTimes(4);
  document.hidden = false;
  listeners.get("visibilitychange")!({ isTrusted: true });
  expect(engine.setSuspended).toHaveBeenLastCalledWith("document-hidden", false);
  motion.matches = true; motionChange!();
  expect(engine.setReducedMotion).toHaveBeenCalledWith(true);
  audio.setEnabled(false); audio.setBoatSpeed(0.7);
  expect(engine.setEnabled).toHaveBeenCalledWith(false);
  expect(engine.setBoatSpeed).toHaveBeenCalledWith(0.7);
  audio.destroy();
  expect(listeners.size).toBe(0);
  expect(motion.removeEventListener).toHaveBeenCalledOnce();
  expect(engine.destroy).toHaveBeenCalledOnce();
});
