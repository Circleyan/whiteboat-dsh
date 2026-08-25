import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  CanvasCreationWaterField,
  clampWaterValue,
  type CanvasCreationWaterBoat,
} from "whiteboat-core/water-field";
import {
  advanceCanvasCreationBoatFollow,
  resolveCanvasCreationEntryDeviceMode,
  sampleCanvasCreationPhoneRoamTarget,
  shouldCanvasCreationBoatFollowPointer,
  type CanvasCreationEntryDeviceMode,
} from "whiteboat-core/navigation";
import { CANVAS_CREATION_BOAT_ASSETS } from "whiteboat-core/boat-assets";
import { applyCanvasCreationCelestialProjection } from "whiteboat-core/projection";
import { DshWaterComposer } from "./dsh-composer";
import { WATER_SURFACE_STYLES } from "./styles";
import { WaterSurfaceStore, type WaterSurfaceSnapshot } from "./surface-store";
import {
  prepareWaterSurfaceSession,
  WaterSurfaceSubmitError,
  type WaterSurfaceRuntime,
} from "./water-session";

type SelectorHook<T> = <S>(selector: (snapshot: T) => S) => S;

interface SlotsLike {
  inject(name: string, register: () => unknown): void;
  entries(name: string): readonly StoredEntryLike[];
  register(
    options: Record<string, unknown>,
    component: (props: never) => unknown,
  ): () => void;
}

interface StoredEntryLike {
  component: unknown;
  options: { priority?: number };
  inject?: (...args: never[]) => Record<string, unknown>;
  children?: Readonly<Record<string, unknown>>;
  locale?: string;
  registrant?: string;
}

interface ObservableLike<T> {
  getSnapshot(): T;
  subscribe(listener: () => void): () => void;
}

const ABSENT_MODEL_DIRECTORY: ObservableLike<Record<string, unknown>> = {
  getSnapshot: () => ({
    current: null,
    groups: [],
    failures: [],
    status: "idle",
    error: null,
  }),
  subscribe: () => () => {},
};

const ABSENT_AGENT_PRESET: ObservableLike<Record<string, unknown>> = {
  getSnapshot: () => ({
    options: [],
    current: "",
    error: null,
    busy: false,
    introduce: false,
  }),
  subscribe: () => () => {},
};

interface ClientContextLike extends WaterSurfaceRuntime {
  slots: SlotsLike;
  effect(effect: () => void | (() => void), label?: string): void;
}

interface SurfaceInjected {
  useSurface: SelectorHook<WaterSurfaceSnapshot>;
  onClose(): void;
  onPrepareComposer(): Promise<void>;
  onHideComposer(): void;
  onPlaceComposer(x: number, y: number): void;
  onRelocateComposer(x: number, y: number): void;
}

interface EntryInjected {
  wide: boolean;
  useSurface: SelectorHook<WaterSurfaceSnapshot>;
  onOpen(): void;
}

function Icon({ name }: { name: "close" | "water" }) {
  if (name === "close") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0" /></svg>;
}

function useDynamicViewport(root: HTMLElement | null): void {
  useEffect(() => {
    if (!root) return;
    const viewport = window.visualViewport;
    const update = () => {
      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty("--wb-dsh-viewport-height", `${Math.max(1, height)}px`);
    };
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [root]);
}

function resolveDshWaterDeviceMode(): CanvasCreationEntryDeviceMode {
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return resolveCanvasCreationEntryDeviceMode({
    isPhone: coarsePointer && window.innerWidth < 768,
    isTablet: coarsePointer && window.innerWidth >= 768,
  });
}

function WaterSurface({
  useSurface,
  onClose,
  onPrepareComposer,
  onHideComposer,
  onPlaceComposer,
  onRelocateComposer,
}: SurfaceInjected) {
  const open = useSurface((state) => state.open);
  const composerOpen = useSurface((state) => state.composerOpen);
  const preparing = useSurface((state) => state.preparing);
  const surfaceStatus = useSurface((state) => ({
    message: state.status,
    error: state.statusError,
  }));
  const composerX = useSurface((state) => state.composerX);
  const composerY = useSurface((state) => state.composerY);
  const composerMotion = useSurface((state) => state.composerMotion);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [boatEl, setBoatEl] = useState<HTMLButtonElement | null>(null);
  const [pointerEl, setPointerEl] = useState<HTMLSpanElement | null>(null);
  const [composerWrap, setComposerWrap] = useState<HTMLDivElement | null>(null);
  const [deviceMode, setDeviceMode] = useState<CanvasCreationEntryDeviceMode>(
    resolveDshWaterDeviceMode,
  );
  const composerOpenRef = useRef(composerOpen);
  const preparingRef = useRef(preparing);

  composerOpenRef.current = composerOpen;
  preparingRef.current = preparing;
  useDynamicViewport(root);

  useEffect(() => {
    if (!open || !root || !canvas || !boatEl || !pointerEl || !composerWrap) {
      return;
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const water = new CanvasCreationWaterField(canvas, {
      tokenRoot: root,
      reducedMotion: motionQuery.matches,
    });
    let mode = resolveDshWaterDeviceMode();
    const startsWithComposer = mode === "phone";
    if (startsWithComposer && !composerOpenRef.current && !preparingRef.current) {
      void onPrepareComposer();
    }
    let boat: CanvasCreationWaterBoat = {
      x: root.clientWidth * 0.43,
      y: root.clientHeight * 0.5233,
      heading: 0,
      speed: 0,
      visible: true,
    };
    let target: { point: { x: number; y: number }; kind: "pointer" | "click" | "roam" } | null = null;
    let composerAnchor: { x: number; y: number } | null = null;
    let movementFrame: number | null = null;
    let projectionFrame: number | null = null;
    let roamTimer: number | null = null;
    let lastFrameAt = performance.now();
    const projectionStartedAt = performance.now();

    const setMode = (nextMode: CanvasCreationEntryDeviceMode) => {
      mode = nextMode;
      root.dataset.deviceMode = nextMode;
      setDeviceMode(nextMode);
      if (
        nextMode === "phone" &&
        !composerOpenRef.current &&
        !preparingRef.current
      ) {
        void onPrepareComposer();
      }
    };

    const getBoatLimits = () => {
      const halfWidth = boatEl.offsetWidth * 0.5;
      const halfHeight = boatEl.offsetHeight * 0.5;
      return {
        minimumX: halfWidth,
        maximumX: Math.max(halfWidth, root.clientWidth - halfWidth),
        minimumY: halfHeight,
        maximumY: Math.max(halfHeight, root.clientHeight - halfHeight),
      };
    };

    const constrainBoat = (point: { x: number; y: number }) => {
      const limits = getBoatLimits();
      return {
        x: clampWaterValue(point.x, limits.minimumX, limits.maximumX),
        y: clampWaterValue(point.y, limits.minimumY, limits.maximumY),
      };
    };

    const getPhoneRoamLimits = () => {
      const limits = getBoatLimits();
      const offscreenX = boatEl.offsetWidth * 0.5 + 4;
      const rootRect = root.getBoundingClientRect();
      const composerRect = composerWrap.getBoundingClientRect();
      const composerTop = composerOpenRef.current && composerRect.height > 0
        ? composerRect.top - rootRect.top
        : rootRect.height - 84;
      return {
        ...limits,
        minimumX: -offscreenX,
        maximumX: rootRect.width + offscreenX,
        preferredMaximumY: clampWaterValue(
          composerTop - boatEl.offsetHeight * 0.375,
          limits.minimumY,
          limits.maximumY,
        ),
      };
    };

    const placeBoat = () => {
      boatEl.style.transform = [
        `translate3d(${boat.x - boatEl.offsetWidth * 0.5}px,`,
        `${boat.y - boatEl.offsetHeight * 0.5}px, 0)`,
      ].join(" ");
      boatEl.style.setProperty(
        "--wb-entry-boat-heading",
        `${boat.heading + Math.PI * 0.5}rad`,
      );
      water.setBoat(boat);
    };

    const resolveComposerPosition = () => {
      if (mode === "phone") return null;
      const margin = root.clientWidth < 640 ? 12 : 24;
      const width = Math.min(512, Math.max(0, root.clientWidth - margin * 2));
      const height = Math.min(224, Math.max(0, root.clientHeight - margin * 2));
      const anchor = composerAnchor ?? boat;
      const preferredX = anchor.x + 47.5;
      const preferredY = anchor.y - 33.2;
      const x = clampWaterValue(
        preferredX,
        margin,
        Math.max(margin, root.clientWidth - width - margin),
      );
      const y = clampWaterValue(
        preferredY,
        margin,
        Math.max(margin, root.clientHeight - height - margin),
      );
      return { x, y };
    };

    const syncComposerPosition = () => {
      const position = resolveComposerPosition();
      if (!position) return;
      const { x, y } = position;
      onPlaceComposer(x, y);
    };

    const relocateComposer = () => {
      const position = resolveComposerPosition();
      if (!position) return;
      onRelocateComposer(position.x, position.y);
    };

    const openComposer = (anchor: { x: number; y: number }) => {
      if (preparingRef.current || composerOpenRef.current) return;
      composerAnchor = constrainBoat(anchor);
      syncComposerPosition();
      void onPrepareComposer();
    };

    const stopFollowingPointer = () => {
      if (target?.kind !== "pointer") return;
      target = null;
      boat = { ...boat, speed: 0 };
      placeBoat();
    };

    function clearRoamTimer() {
      if (roamTimer === null) return;
      window.clearTimeout(roamTimer);
      roamTimer = null;
    }

    function scheduleMovement() {
      if (movementFrame !== null) return;
      movementFrame = window.requestAnimationFrame(updateMovement);
    }

    function sailBoatTo(
      point: { x: number; y: number },
      kind: "pointer" | "click" | "roam",
    ) {
      const destination = kind === "roam"
        ? {
            x: clampWaterValue(point.x, getPhoneRoamLimits().minimumX, getPhoneRoamLimits().maximumX),
            y: clampWaterValue(point.y, getPhoneRoamLimits().minimumY, getPhoneRoamLimits().maximumY),
          }
        : constrainBoat(point);
      target = { point: destination, kind };
      if (movementFrame === null) lastFrameAt = performance.now();
      scheduleMovement();
    }

    function schedulePhoneRoam(delayMs: number) {
      if (
        mode !== "phone" ||
        motionQuery.matches ||
        preparingRef.current ||
        roamTimer !== null ||
        target?.kind === "roam"
      ) {
        return;
      }
      roamTimer = window.setTimeout(() => {
        roamTimer = null;
        if (mode !== "phone" || motionQuery.matches || preparingRef.current) return;
        sailBoatTo(
          sampleCanvasCreationPhoneRoamTarget(getPhoneRoamLimits(), {
            current: boat,
            minimumTravel: Math.min(root.clientWidth, 420) * 0.22,
          }),
          "roam",
        );
      }, Math.max(0, delayMs));
    }

    function updateMovement(timestamp: number) {
      movementFrame = null;
      if (!target) {
        boat = { ...boat, speed: 0 };
        placeBoat();
        return;
      }
      const currentKind = target.kind;
      const step = advanceCanvasCreationBoatFollow({
        boat,
        target: target.point,
        deltaSeconds: (timestamp - lastFrameAt) / 1000,
        reducedMotion: motionQuery.matches,
        maximumSpeed: currentKind === "roam" ? 42 : undefined,
        slowingDistance: currentKind === "roam" ? 56 : undefined,
      });
      lastFrameAt = timestamp;
      boat = step.boat;
      if (step.arrived) {
        target = null;
        placeBoat();
        if (currentKind === "roam") schedulePhoneRoam(700);
        return;
      }
      placeBoat();
      scheduleMovement();
    }

    const updateProjection = (timestamp: number) => {
      projectionFrame = null;
      applyCanvasCreationCelestialProjection(root, {
        elapsedSeconds: Math.max(0, timestamp - projectionStartedAt) / 1000,
        reducedMotion: motionQuery.matches,
        deviceMode: mode,
      });
      if (!motionQuery.matches) {
        projectionFrame = window.requestAnimationFrame(updateProjection);
      }
    };

    const getPoint = (event: PointerEvent | MouseEvent) => {
      const rect = root.getBoundingClientRect();
      return constrainBoat({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = getPoint(event);
      const eventTarget = event.target instanceof Element ? event.target : null;
      if (
        eventTarget?.closest(
          ".wb-dsh-water__boat, .wb-dsh-water__composer-wrap, .wb-dsh-water__close",
        )
      ) {
        pointerEl.dataset.visible = "false";
        return;
      }
      pointerEl.style.left = `${point.x}px`;
      pointerEl.style.top = `${point.y}px`;
      pointerEl.dataset.visible = "true";
      if (
        shouldCanvasCreationBoatFollowPointer(
          mode,
          composerOpenRef.current,
          preparingRef.current,
        )
      ) {
        sailBoatTo(point, "pointer");
      }
    };

    const onPointerLeave = () => {
      pointerEl.dataset.visible = "false";
      if (!composerOpenRef.current) stopFollowingPointer();
    };

    const onSurfaceClick = (event: MouseEvent) => {
      const eventTarget = event.target instanceof Element ? event.target : null;
      if (preparingRef.current || eventTarget?.closest(".wb-dsh-water__close, .wb-dsh-water__composer-wrap")) {
        return;
      }
      if (eventTarget?.closest(".wb-dsh-water__boat")) {
        event.stopPropagation();
        if (composerOpenRef.current && mode !== "phone") {
          composerOpenRef.current = false;
          onHideComposer();
          window.requestAnimationFrame(() => boatEl.focus());
        } else {
          openComposer(boat);
        }
        return;
      }
      if (mode === "phone" && composerOpenRef.current) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }
      const point = getPoint(event);
      if (mode !== "phone" && composerOpenRef.current) {
        composerAnchor = point;
        relocateComposer();
        sailBoatTo(point, "click");
        return;
      }
      if (mode !== "phone") sailBoatTo(point, "click");
      openComposer(point);
    };

    const onResize = () => {
      const nextMode = resolveDshWaterDeviceMode();
      if (nextMode !== mode) setMode(nextMode);
      const constrained = mode === "phone"
        ? {
            x: clampWaterValue(boat.x, getPhoneRoamLimits().minimumX, getPhoneRoamLimits().maximumX),
            y: clampWaterValue(boat.y, getPhoneRoamLimits().minimumY, getPhoneRoamLimits().maximumY),
          }
        : constrainBoat(boat);
      boat = { ...boat, ...constrained };
      placeBoat();
      syncComposerPosition();
      if (mode === "phone") schedulePhoneRoam(0);
    };

    const onMotionChange = () => {
      water.setReducedMotion(motionQuery.matches);
      if (motionQuery.matches) {
        clearRoamTimer();
        if (target?.kind === "roam") target = null;
      } else if (mode === "phone") {
        schedulePhoneRoam(0);
      }
      if (projectionFrame === null) {
        projectionFrame = window.requestAnimationFrame(updateProjection);
      }
      scheduleMovement();
    };

    setMode(mode);
    if (mode === "phone") {
      const initial = sampleCanvasCreationPhoneRoamTarget(getPhoneRoamLimits());
      boat = { ...boat, ...initial };
    }
    placeBoat();
    syncComposerPosition();
    water.start();
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);
    root.addEventListener("click", onSurfaceClick);
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);
    motionQuery.addEventListener("change", onMotionChange);
    projectionFrame = window.requestAnimationFrame(updateProjection);
    if (mode === "phone") schedulePhoneRoam(700);

    return () => {
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      root.removeEventListener("click", onSurfaceClick);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
      motionQuery.removeEventListener("change", onMotionChange);
      clearRoamTimer();
      if (movementFrame !== null) window.cancelAnimationFrame(movementFrame);
      if (projectionFrame !== null) window.cancelAnimationFrame(projectionFrame);
      water.destroy();
    };
  }, [
    boatEl,
    canvas,
    composerWrap,
    onHideComposer,
    onPlaceComposer,
    onPrepareComposer,
    onRelocateComposer,
    open,
    pointerEl,
    root,
  ]);

  if (!open) return null;

  return (
    <section
      className="wb-dsh-water"
      ref={setRoot}
      aria-label="水面"
      data-wb-dsh-water
      data-device-mode={deviceMode}
      data-composer-open={composerOpen || undefined}
    >
      <canvas className="wb-dsh-water__field" ref={setCanvas} aria-hidden="true" />
      <span className="wb-dsh-water__pointer-shadow" ref={setPointerEl} data-visible="false" aria-hidden="true" />
      <button
        type="button"
        className="wb-dsh-water__boat"
        ref={setBoatEl}
        aria-label="投入一个想法"
        aria-haspopup="dialog"
      >
        <span
          className="wb-dsh-water__boat-shadow"
          style={{
            maskImage: `url("${CANVAS_CREATION_BOAT_ASSETS.boatShadow}")`,
            WebkitMaskImage: `url("${CANVAS_CREATION_BOAT_ASSETS.boatShadow}")`,
          }}
          aria-hidden="true"
        />
        <span className="wb-dsh-water__boat-body" aria-hidden="true">
          <img className="wb-dsh-water__boat-hull" src={CANVAS_CREATION_BOAT_ASSETS.boatHull} alt="" />
          <img className="wb-dsh-water__boat-window" src={CANVAS_CREATION_BOAT_ASSETS.boatWindow} alt="" />
        </span>
      </button>
      <button type="button" className="wb-dsh-water__close" onClick={onClose} aria-label="回到 DSH">
        <Icon name="close" />
      </button>
      <div
        className="wb-dsh-water__composer-wrap"
        ref={setComposerWrap}
        data-open={composerOpen || undefined}
        data-device-mode={deviceMode}
        data-motion-phase={composerMotion}
        style={deviceMode === "phone" ? undefined : {
          "--wb-composer-x": composerX === undefined ? undefined : `${composerX}px`,
          "--wb-composer-y": composerY === undefined ? undefined : `${composerY}px`,
        } as CSSProperties}
        aria-hidden="true"
      >
        {composerOpen && <span className="wb-dsh-water__composer-shadow" />}
      </div>
      {(preparing || surfaceStatus.message) && (
        <div
          className="wb-dsh-water__status"
          data-error={surfaceStatus.error || undefined}
          aria-live="polite"
        >
          {surfaceStatus.message}
        </div>
      )}
    </section>
  );
}

function WaterSurfaceEntry({ wide, useSurface, onOpen }: EntryInjected) {
  const open = useSurface((state) => state.open);
  return (
    <button
      type="button"
      className="wb-dsh-water-entry"
      data-wide={String(wide)}
      aria-label={open ? "水面已打开" : "打开水面"}
      aria-pressed={open}
      onClick={onOpen}
    >
      <Icon name="water" />
      {wide && <span>水面</span>}
    </button>
  );
}

export const inject = ["slots", "sessions", "workspaces"];

export function apply(ctx: ClientContextLike): void {
  const surface = new WaterSurfaceStore();
  let disposeComposerShadow: (() => void) | undefined;
  const callInject = (
    entry: StoredEntryLike | undefined,
    ...args: unknown[]
  ): Record<string, unknown> => {
    const inject = entry?.inject as
      | ((...params: unknown[]) => Record<string, unknown>)
      | undefined;
    return inject?.(...args) ?? {};
  };
  const installComposerShadow = (): void => {
    if (disposeComposerShadow) return;
    const composerEntry = ctx.slots.entries("conversation.composer.bar").find(
      (entry) =>
        entry.children !== undefined &&
        Object.hasOwn(entry.children, "conversation.input.model"),
    );
    if (!composerEntry) {
      console.error("[water-surface] DSH composer slot entry is unavailable");
      return;
    }
    try {
      disposeComposerShadow = ctx.slots.register({
        name: "conversation.composer.bar",
        priority: -100,
        locale: composerEntry.locale,
        inject: (sessionId?: string) => {
        const modelEntry = ctx.slots.entries("conversation.input.model")[0];
        const presetEntry = ctx.slots.entries("conversation.hero.agentPreset")[0];
        const composerFace = callInject(composerEntry, sessionId);
        const modelFace = sessionId === undefined
          ? {}
          : callInject(modelEntry, sessionId);
        const presetFace = callInject(presetEntry);
        const composerHooks = composerFace.hooks as
          | Record<string, unknown>
          | undefined;
        const presetHooks = presetFace.hooks as
          | Record<string, unknown>
          | undefined;
        return {
          ...composerFace,
          hooks: {
            ...composerHooks,
            surface,
            modelDirectory:
              (modelFace.directory as ObservableLike<unknown> | undefined) ??
              ABSENT_MODEL_DIRECTORY,
            agentPresetSeat:
              (presetHooks?.agentPresetSeat as ObservableLike<unknown> | undefined) ??
              ABSENT_AGENT_PRESET,
          },
          loadModels: modelFace.load,
          selectModel: modelFace.select,
          loadAgentPresets: presetFace.load,
          selectAgentPreset: presetFace.select,
          onSelectWorkspace: async (workspaceId: string) => {
            surface.beginPreparing();
            try {
              const nextId = await prepareWaterSurfaceSession(ctx, workspaceId);
              surface.showComposer(nextId);
            } catch (error) {
              const message = error instanceof WaterSurfaceSubmitError
                ? error.userMessage
                : "还没能切换工作区。当前输入仍由 DSH 保留。";
              surface.failPreparing(message);
            }
          },
          onDismiss: surface.hideComposer,
          onAccepted: closeSurface,
        };
        },
      }, DshWaterComposer as (props: never) => unknown);
    } catch (error) {
      console.error("[water-surface] DSH composer shadow failed", error);
      return;
    }
  };
  const closeSurface = (): void => {
    surface.close();
    disposeComposerShadow?.();
    disposeComposerShadow = undefined;
  };
  const openSurface = (): void => {
    installComposerShadow();
    surface.open();
  };
  const prepareComposer = async (workspaceId?: string): Promise<void> => {
    const state = surface.getSnapshot();
    if (state.preparing || state.composerOpen) return;
    if (state.preparedSessionId) {
      surface.revealComposer();
      return;
    }
    surface.beginPreparing();
    try {
      const sessionId = await prepareWaterSurfaceSession(ctx, workspaceId);
      surface.showComposer(sessionId);
    } catch (error) {
      const message = error instanceof WaterSurfaceSubmitError
        ? error.userMessage
        : "还没能准备好 DSH 输入框。可以留在水面，稍后再试。";
      console.error("[water-surface] composer preparation failed", error);
      surface.failPreparing(message);
    }
  };

  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.plugin = "whiteboat-dsh";
    style.textContent = WATER_SURFACE_STYLES;
    document.head.appendChild(style);
    return () => style.remove();
  }, "water-surface: styles");

  ctx.slots.inject("conversation.input.model", () => {
    installComposerShadow();
    return () => {
      disposeComposerShadow?.();
      disposeComposerShadow = undefined;
    };
  });

  ctx.slots.inject("shell.overlay", () => ctx.slots.register({
    name: "shell.overlay",
    id: "whiteboat-water-surface",
    order: 40,
    label: "水面",
    inject: () => ({
      hooks: { surface },
      onClose: closeSurface,
      onPrepareComposer: prepareComposer,
      onHideComposer: surface.hideComposer,
      onPlaceComposer: surface.setComposerPlacement,
      onRelocateComposer: surface.relocateComposer,
    }),
  }, WaterSurface as (props: never) => unknown));

  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "whiteboat-water-surface-entry",
    order: 30,
    label: "水面",
    inject: () => ({
      hooks: { surface },
      onOpen: openSurface,
    }),
  }, WaterSurfaceEntry as (props: never) => unknown));
}
