import { Howl } from "howler";
import { WhiteboatBoatSoundscape, type WhiteboatSoundState } from "whiteboat-core/boat-water-sound";
import { BOAT_WATER_SOURCE } from "whiteboat-core/boat-water-source";

/** DSH owns browser/overlay events; the shared engine owns playback state. */
export function mountDshWaterAudio(root: HTMLElement, enabled: boolean, onState?: (state: WhiteboatSoundState) => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let previousState: WhiteboatSoundState | undefined;
  const sound = new WhiteboatBoatSoundscape({
    enabled,
    source: BOAT_WATER_SOURCE,
    reducedMotion: motion.matches,
    createHowl: (options) => new Howl(options),
    onStateChange: (snapshot) => {
      root.dataset.soundState = snapshot.state;
      root.dataset.soundVolume = String(snapshot.volume);
      if (snapshot.state !== previousState) {
        previousState = snapshot.state;
        onState?.(snapshot.state);
      }
    },
  });
  const onVisibility = () => sound.setSuspended("document-hidden", document.hidden);
  const onMotion = () => sound.setReducedMotion(motion.matches);
  const onGesture = (event: Event) => {
    if (event.isTrusted) sound.activate();
  };
  onVisibility();
  sound.activate();
  document.addEventListener("visibilitychange", onVisibility);
  // The native composer is portaled outside the overlay. Ordinary interaction
  // anywhere in this DSH page can unlock the one active water sound.
  document.addEventListener("pointerdown", onGesture, true);
  document.addEventListener("touchend", onGesture, true);
  document.addEventListener("keydown", onGesture, true);
  motion.addEventListener("change", onMotion);
  return {
    setEnabled: (value: boolean) => sound.setEnabled(value),
    setBoatSpeed: (value: number) => sound.setBoatSpeed(value),
    destroy() {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("pointerdown", onGesture, true);
      document.removeEventListener("touchend", onGesture, true);
      document.removeEventListener("keydown", onGesture, true);
      motion.removeEventListener("change", onMotion);
      sound.destroy();
    },
  };
}
