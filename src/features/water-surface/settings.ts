import {
  CANVAS_CREATION_BOAT_FOLLOW_SPEED_LIMITS,
  normalizeCanvasCreationBoatFollowSpeed,
} from "whiteboat-core/navigation";

export const WHITEBOAT_DSH_SETTINGS_NAMESPACE = "whiteboat-dsh";

export const DSH_BOAT_FOLLOW_SPEED_LIMITS =
  CANVAS_CREATION_BOAT_FOLLOW_SPEED_LIMITS;

export interface WhiteboatDshSettings {
  boatFollowSpeed: number;
}

export const DEFAULT_WHITEBOAT_DSH_SETTINGS: WhiteboatDshSettings = Object.freeze({
  boatFollowSpeed: DSH_BOAT_FOLLOW_SPEED_LIMITS.defaultValue,
});

export function normalizeDshBoatFollowSpeed(
  value: unknown,
  fallback = DSH_BOAT_FOLLOW_SPEED_LIMITS.defaultValue,
): number {
  return normalizeCanvasCreationBoatFollowSpeed(value, fallback);
}

export function decodeWhiteboatDshSettings(
  value: unknown,
): WhiteboatDshSettings | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  const candidate = value as Partial<WhiteboatDshSettings>;
  return {
    boatFollowSpeed: normalizeDshBoatFollowSpeed(candidate.boatFollowSpeed),
  };
}
