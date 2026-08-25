import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  advanceCanvasCreationBoatFollow,
  sampleCanvasCreationPhoneRoamTarget,
  shouldCanvasCreationBoatFollowPointer,
} from "whiteboat-core/navigation";
import {
  CANVAS_CREATION_STATIONARY_WAKE_RADIUS_SCALE,
  resolveCanvasCreationWakeFadeTier,
  sampleCanvasCreationBoatResponse,
} from "whiteboat-core/water-field";
import {
  DSH_COMPOSER_ENTER_DURATION_MS,
  DSH_COMPOSER_EXIT_DURATION_MS,
  WaterSurfaceStore,
} from "../src/features/water-surface/surface-store";

describe("shared Whiteboat water interaction", () => {
  it("follows a fine pointer only before the composer opens", () => {
    expect(shouldCanvasCreationBoatFollowPointer("desktop", false, false)).toBe(
      true,
    );
    expect(shouldCanvasCreationBoatFollowPointer("tablet", false, false)).toBe(
      true,
    );
    expect(shouldCanvasCreationBoatFollowPointer("desktop", true, false)).toBe(
      false,
    );
    expect(shouldCanvasCreationBoatFollowPointer("phone", false, false)).toBe(
      false,
    );
  });

  it("moves toward the destination with a capped step instead of jumping", () => {
    const step = advanceCanvasCreationBoatFollow({
      boat: { x: 100, y: 100, heading: 0, speed: 0, visible: true },
      target: { x: 400, y: 100 },
      deltaSeconds: 0.05,
    });

    expect(step.arrived).toBe(false);
    expect(step.boat.x).toBeGreaterThan(100);
    expect(step.boat.x).toBeLessThanOrEqual(109);
    expect(step.boat.y).toBe(100);
  });

  it("keeps phone roaming in the shared bounded sampler", () => {
    const values = [0.2, 0.5, 0.2, 0.5];
    const target = sampleCanvasCreationPhoneRoamTarget(
      {
        minimumX: -40,
        maximumX: 430,
        minimumY: 40,
        maximumY: 800,
        preferredMaximumY: 620,
      },
      { random: () => values.shift() ?? 0.5 },
    );

    expect(target.x).toBe(430);
    expect(target.y).toBe(330);
  });

  it("maps the shared fade tiers to the DSH brand-lightness scale", () => {
    const stylesSource = readFileSync(
      fileURLToPath(new URL("../src/features/water-surface/styles.ts", import.meta.url)),
      "utf8",
    );

    expect(resolveCanvasCreationWakeFadeTier(0.9)).toBe(0);
    expect(resolveCanvasCreationWakeFadeTier(0.2)).toBe(4);
    expect(stylesSource).toContain(
      "--wb-entry-wake-color-strong: var(--wb-color-brand-wake-strong)",
    );
    expect(stylesSource).toContain(
      "--wb-entry-wake-color-tail: var(--wb-color-brand-wake-tail)",
    );
    expect(stylesSource).toContain(
      "--wb-color-brand-primary: var(--dsw-alias-brand-primary",
    );
    expect(stylesSource).toContain(
      "--wb-color-brand-wake-bright: color-mix(in oklch, var(--wb-color-brand-primary) 88%",
    );
    expect(stylesSource).toContain(
      "--wb-color-brand-wake-tail: color-mix(in oklch, var(--wb-color-brand-primary) 52%",
    );
    expect(stylesSource).toContain("--wb-entry-wake-opacity-tail: 0.18");
    expect(stylesSource).not.toContain("--dsw-static-deepseek-");
    expect(stylesSource).not.toContain("--wb-entry-accent-green");
    expect(stylesSource).not.toContain("--wb-entry-accent-violet");
  });

  it("expands the shared stationary wake radius by thirty percent", () => {
    const response = sampleCanvasCreationBoatResponse(90, 0, {
      x: 0,
      y: 0,
      heading: 0,
      speed: 0,
      visible: true,
    });

    expect(CANVAS_CREATION_STATIONARY_WAKE_RADIUS_SCALE).toBe(1.3);
    expect(response.influence).toBeGreaterThan(0);
    expect(response.accent).toBeGreaterThan(0);
  });

  it("slowly hides and reveals the same prepared DSH draft session", () => {
    vi.useFakeTimers();
    try {
      const surface = new WaterSurfaceStore();
      surface.showComposer("draft-session");

      expect(surface.getSnapshot()).toMatchObject({
        composerOpen: true,
        composerMotion: "entering",
        preparedSessionId: "draft-session",
      });
      vi.advanceTimersByTime(DSH_COMPOSER_ENTER_DURATION_MS);
      expect(surface.getSnapshot().composerMotion).toBe("visible");

      surface.hideComposer();
      expect(surface.getSnapshot()).toMatchObject({
        composerOpen: true,
        composerMotion: "exiting",
        preparedSessionId: "draft-session",
      });
      vi.advanceTimersByTime(DSH_COMPOSER_EXIT_DURATION_MS - 1);
      expect(surface.getSnapshot().composerOpen).toBe(true);
      vi.advanceTimersByTime(1);
      expect(surface.getSnapshot()).toMatchObject({
        composerOpen: false,
        composerMotion: "visible",
        preparedSessionId: "draft-session",
      });

      expect(surface.revealComposer()).toBe(true);
      expect(surface.getSnapshot()).toMatchObject({
        composerOpen: true,
        composerMotion: "entering",
        preparedSessionId: "draft-session",
      });
      vi.advanceTimersByTime(DSH_COMPOSER_ENTER_DURATION_MS);
      expect(surface.getSnapshot().composerMotion).toBe("visible");
    } finally {
      vi.useRealTimers();
    }
  });

  it("relocates one open composer through exit and enter using the latest anchor", () => {
    vi.useFakeTimers();
    try {
      const surface = new WaterSurfaceStore();
      surface.setComposerPlacement(40, 50);
      surface.showComposer("draft-session");
      vi.advanceTimersByTime(DSH_COMPOSER_ENTER_DURATION_MS);

      surface.relocateComposer(200, 300);
      expect(surface.getSnapshot()).toMatchObject({
        composerOpen: true,
        composerMotion: "exiting",
        composerX: 40,
        composerY: 50,
        preparedSessionId: "draft-session",
      });

      surface.relocateComposer(400, 500);
      vi.advanceTimersByTime(DSH_COMPOSER_EXIT_DURATION_MS);
      expect(surface.getSnapshot()).toMatchObject({
        composerOpen: true,
        composerMotion: "entering",
        composerX: 400,
        composerY: 500,
        preparedSessionId: "draft-session",
      });

      vi.advanceTimersByTime(DSH_COMPOSER_ENTER_DURATION_MS);
      expect(surface.getSnapshot()).toMatchObject({
        composerOpen: true,
        composerMotion: "visible",
        composerX: 400,
        composerY: 500,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("collapses composer motion delays when the host requests reduced motion", () => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      matchMedia: () => ({ matches: true }),
    });
    try {
      const surface = new WaterSurfaceStore();
      surface.setComposerPlacement(40, 50);
      surface.showComposer("draft-session");
      vi.runOnlyPendingTimers();
      expect(surface.getSnapshot().composerMotion).toBe("visible");

      surface.relocateComposer(200, 300);
      vi.runAllTimers();
      expect(surface.getSnapshot()).toMatchObject({
        composerOpen: true,
        composerMotion: "visible",
        composerX: 200,
        composerY: 300,
      });

      surface.hideComposer();
      vi.runOnlyPendingTimers();
      expect(surface.getSnapshot().composerOpen).toBe(false);
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("combines the water scene with a real DSH composer Slot", () => {
    const stylesSource = readFileSync(
      fileURLToPath(new URL("../src/features/water-surface/styles.ts", import.meta.url)),
      "utf8",
    );
    const clientSource = readFileSync(
      fileURLToPath(new URL("../src/features/water-surface/index.tsx", import.meta.url)),
      "utf8",
    );
    const composerSource = readFileSync(
      fileURLToPath(new URL("../src/features/water-surface/dsh-composer.tsx", import.meta.url)),
      "utf8",
    );
    const packageSource = readFileSync(
      fileURLToPath(new URL("../package.json", import.meta.url)),
      "utf8",
    );

    expect(clientSource).toContain('ctx.slots.inject("conversation.input.model"');
    expect(clientSource).toContain("priority: -100");
    expect(clientSource).toContain("installComposerShadow()");
    expect(clientSource).toContain("disposeComposerShadow?.()");
    expect(clientSource).toContain('ctx.slots.entries("conversation.composer.bar")');
    expect(clientSource).toContain('ctx.slots.entries("conversation.input.model")');
    expect(clientSource).toContain('ctx.slots.entries("conversation.hero.agentPreset")');
    expect(clientSource).not.toContain("queueMicrotask");
    expect(packageSource).toContain('"@deepseek-ai/dsh-client-ui-conversation"');
    expect(packageSource).toContain('"@deepseek-ai/dsh-client-ui-model-selection"');
    expect(packageSource).toContain('"@deepseek-ai/dsh-client-ui-agent-preset"');
    expect(clientSource).toContain("prepareWaterSurfaceSession");
    expect(clientSource).not.toContain("document.querySelector");
    expect(clientSource).not.toContain("querySelectorAll");
    expect(composerSource).toContain('aria-label="命令"');
    expect(composerSource).toContain("DSH_COMMAND_CHOICES");
    expect(composerSource).toContain('role="menu" aria-label="DSH 命令"');
    expect(composerSource).toContain("props.keyboard?.setDraft(next");
    expect(composerSource).toContain("访问模式，当前：");
    expect(composerSource).toContain("选择模型，当前");
    expect(composerSource).toContain('aria-label="发送消息"');
    expect(composerSource).toContain('createPortal((');
    expect(composerSource).toContain('), document.body)');
    expect(composerSource).toContain("props.inputActions.submit()");
    expect(composerSource).toContain("props.keyboard.setDraft(next)");
    expect(composerSource).toContain("props.onSelectWorkspace");
    expect(composerSource).toContain("props.selectAgentPreset");
    expect(composerSource).toContain('event.key !== "Escape"');
    expect(composerSource).toContain("props.onDismiss()");
    expect(composerSource).toContain("loadModelsRef.current?.()");
    expect(composerSource).toContain("loadAgentPresetsRef.current?.()");
    expect(composerSource).toContain("[ready, props.sessionId]");
    expect(composerSource).toContain("type ComposerMenu =");
    expect(composerSource).toContain("const dismissDropdowns = () => setOpenMenu(null)");
    expect(composerSource).toContain("onPointerDown={dismissDropdowns}");
    expect(composerSource).toContain("onFocus={dismissDropdowns}");
    expect(composerSource).toContain("if (!ready) return null");
    expect(composerSource).toContain("data-motion-phase={surface.composerMotion}");
    expect(stylesSource).toContain(".wb-dsh-water-composer-layer");
    expect(stylesSource).not.toMatch(
      /\.wb-dsh-water\[data-composer-open\][\s\S]*?pointer-events:\s*none/u,
    );
    expect(stylesSource).toContain("border-radius: 1.375rem");
    expect(stylesSource).toContain("var(--dsw-shadow-lv2");
    expect(stylesSource).toContain("--wb-native-composer-width: min(32rem");
    expect(stylesSource).toContain("--wb-native-control-group-gap: 2rem");
    expect(stylesSource).toContain("gap: var(--wb-native-control-group-gap)");
    expect(stylesSource).toContain("height: min(14rem");
    expect(stylesSource).toContain("min-width: 2.75rem");
    expect(stylesSource).toContain("--wb-native-motion-duration-enter: var(--wb-native-f-duration-enter)");
    expect(stylesSource).toContain("--wb-native-motion-duration-exit: var(--wb-native-f-duration-exit)");
    expect(stylesSource).toContain('[data-motion-phase="entering"]');
    expect(stylesSource).toContain('[data-motion-phase="exiting"]');
    expect(stylesSource).toContain("@keyframes wb-dsh-native-composer-enter");
    expect(stylesSource).toContain("@keyframes wb-dsh-native-composer-exit");
    expect(stylesSource).toContain("--wb-native-motion-duration-enter: 0.01ms");
    expect(stylesSource).not.toContain("wb-dsh-native-composer-arrive");
    expect(stylesSource).toMatch(
      /\.wb-dsh-water__composer-shadow \{[\s\S]*background: var\(--wb-entry-projection-color\);[\s\S]*translateY\(var\(--wb-entry-composer-projection-distance\)\)/u,
    );
  });

  it("crossfades an open composer to the latest anchor while the shared unbranded boat sails", () => {
    const clientSource = readFileSync(
      fileURLToPath(new URL("../src/features/water-surface/index.tsx", import.meta.url)),
      "utf8",
    );
    const boatHullSvg = readFileSync(
      fileURLToPath(
        new URL(
          "../vendor/whiteboat-core/src/assets/canvas-entry-boat-hull.svg",
          import.meta.url,
        ),
      ),
      "utf8",
    );

    expect(clientSource).toContain(
      'root.addEventListener("pointermove", onPointerMove)',
    );
    expect(clientSource).toContain('sailBoatTo(point, "click")');
    expect(clientSource).toContain("openComposer(point)");
    expect(clientSource).toMatch(
      /if \(mode !== "phone" && composerOpenRef\.current\) \{\s*composerAnchor = point;\s*relocateComposer\(\);\s*sailBoatTo\(point, "click"\);\s*return;/u,
    );
    expect(clientSource).toContain("onRelocateComposer: surface.relocateComposer");
    expect(clientSource).toContain("const width = Math.min(512");
    expect(clientSource).not.toContain("revealComposerOnArrival");
    expect(clientSource).not.toContain("onRevealComposer");
    expect(clientSource).toContain("CANVAS_CREATION_BOAT_ASSETS");
    expect(clientSource).not.toContain("CANVAS_CREATION_ENTRY_ASSETS");
    expect(clientSource).not.toContain("logoMark");
    expect(clientSource).not.toContain("logoWordmark");
    expect(clientSource).not.toContain("wb-dsh-water__brand");
    expect(clientSource).not.toContain('aria-label="Whiteboat"');
    const stylesSource = readFileSync(
      fileURLToPath(new URL("../src/features/water-surface/styles.ts", import.meta.url)),
      "utf8",
    );
    expect(stylesSource).not.toContain("--wb-brand-opacity");
    expect(stylesSource).not.toContain(".wb-dsh-water__brand");
    expect(boatHullSvg).not.toContain("fill-opacity");
  });
});
