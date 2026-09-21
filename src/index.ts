import type { Context } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import {
  DEFAULT_WHITEBOAT_DSH_SETTINGS,
  DSH_BOAT_FOLLOW_SPEED_LIMITS,
  WHITEBOAT_DSH_SETTINGS_NAMESPACE,
  normalizeDshBoatFollowSpeed,
  type WhiteboatDshSettings,
} from "./features/water-surface/settings";

export * from "./design-system/direct-use";

export interface Config extends WhiteboatDshSettings {}

export const Config = z.object({
  soundEnabled: z.boolean().default(true).description("水面音效"),
  boatFollowSpeed: z.number()
    .min(DSH_BOAT_FOLLOW_SPEED_LIMITS.min)
    .max(DSH_BOAT_FOLLOW_SPEED_LIMITS.max)
    .step(DSH_BOAT_FOLLOW_SPEED_LIMITS.step)
    .default(DSH_BOAT_FOLLOW_SPEED_LIMITS.defaultValue)
    .description("小船跟随速度（1 = 100%）"),
});

export function apply(
  ctx: Context,
  config: Config = DEFAULT_WHITEBOAT_DSH_SETTINGS,
): void {
  const base: WhiteboatDshSettings = {
    boatFollowSpeed: normalizeDshBoatFollowSpeed(config.boatFollowSpeed),
    soundEnabled: typeof config.soundEnabled === "boolean" ? config.soundEnabled : true,
  };
  ctx.inject(["settings"], (settingsContext) => {
    settingsContext.settings.register(
      settingsNamespace(WHITEBOAT_DSH_SETTINGS_NAMESPACE),
      Config,
      { base, applies: "live" },
    );
  });
}
