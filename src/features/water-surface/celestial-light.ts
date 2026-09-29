import {
  normalizeCanvasCreationLightIntensity,
  sampleCanvasCreationCelestialProjection,
} from "whiteboat-core/light";

/** DSH owns its dark-theme attribute; the shared sampler owns orbital geometry. */
export function applyDshCelestialProjection(root: HTMLElement, options: {
  elapsedSeconds: number;
  reducedMotion: boolean;
  deviceMode: "desktop" | "tablet" | "phone";
  lightIntensity?: number;
}) {
  const light = document.body.hasAttribute("data-ds-dark-theme") ? "moon" : "sun";
  const projection = sampleCanvasCreationCelestialProjection({ ...options, light });
  root.style.setProperty("--wb-entry-celestial-light", light);
  root.style.setProperty("--wb-entry-celestial-projection-angle", `${projection.angleDeg}deg`);
  root.style.setProperty("--wb-entry-celestial-projection-counter-angle", `${projection.counterAngleDeg}deg`);
  // Keep the 2D fallback rim aligned with the same moon angle used by WebGL.
  const rimAngle = (projection.angleDeg * Math.PI) / 180;
  root.style.setProperty("--wb-entry-boat-rim-offset-x", `${Math.sin(rimAngle) * 0.9}px`);
  root.style.setProperty("--wb-entry-boat-rim-offset-y", `${-Math.cos(rimAngle) * 0.9}px`);
  root.style.setProperty("--wb-entry-boat-rim-angle", `${projection.angleDeg + 90}deg`);
  for (const tier of ["boat", "pointer", "composer"] as const) {
    const scale = options.deviceMode === "phone" ? (tier === "boat" ? 0.8 : tier === "composer" ? 0.2 : 1) : 1;
    root.style.setProperty(`--wb-entry-${tier}-projection-distance`, `${projection[tier].distance * scale}px`);
    root.style.setProperty(`--wb-entry-${tier}-projection-blur`, `${projection[tier].blur}px`);
    root.style.setProperty(`--wb-entry-${tier}-projection-opacity`, String(projection[tier].opacity));
  }
  root.dataset.celestialLight = light;
  root.dataset.celestialElevation = String(projection.elevation);
  root.dataset.celestialLightIntensity = String(
    normalizeCanvasCreationLightIntensity(options.lightIntensity),
  );
  return projection;
}
