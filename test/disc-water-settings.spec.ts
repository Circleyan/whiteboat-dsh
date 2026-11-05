import { describe, expect, it } from "vitest";
import { decodeWhiteboatDshSettings, normalizeDshWaterScale } from "../src/features/water-surface/settings";

describe("DSH disc water preferences", () => {
  it("migrates old documents without changing the saved speed or mute", () => {
    expect(decodeWhiteboatDshSettings({ boatFollowSpeed: 1.25, soundEnabled: false })).toEqual({ boatFollowSpeed: 1.25, waterScale: 0.9, soundEnabled: false });
    expect(decodeWhiteboatDshSettings({})).toEqual({ boatFollowSpeed: 0.6, waterScale: 0.9 });
  });
  it("bounds untrusted persisted scale and keeps a valid choice", () => {
    for (const value of [NaN, Infinity, null, "1.5", undefined]) expect(normalizeDshWaterScale(value)).toBe(0.9);
    expect(decodeWhiteboatDshSettings({ waterScale: 1.7 })?.waterScale).toBe(1.7);
    expect(normalizeDshWaterScale(9)).toBe(2);
    expect(normalizeDshWaterScale(-2)).toBe(0.5);
  });
});
