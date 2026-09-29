export const DSH_COMPOSER_ENTER_DURATION_MS = 420;
export const DSH_COMPOSER_EXIT_DURATION_MS = 320;
export const DSH_CONVERSATION_RIPPLE_DURATION_MS = 2660;

export type DshComposerMotionPhase = "entering" | "visible" | "exiting";

function resolveComposerMotionDuration(duration: number): number {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return duration;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

export interface WaterSurfaceSnapshot {
  open: boolean;
  composerOpen: boolean;
  /** The composer is leaving for good (not relocating); the water refocuses out now. */
  composerClosing: boolean;
  preparing: boolean;
  preparedSessionId: string | undefined;
  composerX: number | undefined;
  composerY: number | undefined;
  composerMotion: DshComposerMotionPhase;
  conversationRipple: boolean;
  conversationRippleCenter: { x: number; y: number } | undefined;
  status: string;
  statusError: boolean;
}

/** Page-local water/composer presentation shared by both official Slot seats. */
export class WaterSurfaceStore {
  private snapshot: WaterSurfaceSnapshot = {
    open: true,
    composerOpen: false,
    composerClosing: false,
    preparing: false,
    preparedSessionId: undefined,
    composerX: undefined,
    composerY: undefined,
    composerMotion: "visible",
    conversationRipple: false,
    conversationRippleCenter: undefined,
    status: "",
    statusError: false,
  };
  private readonly listeners = new Set<() => void>();
  private enterTimer: ReturnType<typeof setTimeout> | undefined;
  private exitTimer: ReturnType<typeof setTimeout> | undefined;
  private relocationTimer: ReturnType<typeof setTimeout> | undefined;
  private pendingPlacement: { x: number; y: number } | undefined;
  private conversationRippleTimer: ReturnType<typeof setTimeout> | undefined;

  getSnapshot = (): WaterSurfaceSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  open = (): void => this.patch({ open: true });
  close = (): void => {
    this.clearMotionTimers();
    if (this.conversationRippleTimer !== undefined) {
      clearTimeout(this.conversationRippleTimer);
      this.conversationRippleTimer = undefined;
    }
    this.patch({
      open: false,
      composerOpen: false,
      composerClosing: false,
      composerMotion: "visible",
      conversationRipple: false,
      preparing: false,
      preparedSessionId: undefined,
      status: "",
      statusError: false,
    });
  };

  /**
   * The first DSH prompt is already owned by Session/Conversation at this point.
   * Keep the water surface mounted long enough for a circular reveal centred on
   * DSH's native Conversation column, then hand the screen back to DSH.
   */
  beginConversationRipple(
    center: { x: number; y: number } | undefined,
    onComplete: () => void,
  ): void {
    this.clearMotionTimers();
    if (this.conversationRippleTimer !== undefined) {
      clearTimeout(this.conversationRippleTimer);
    }
    this.patch({
      composerOpen: false,
      composerClosing: false,
      composerMotion: "visible",
      preparing: false,
      conversationRipple: true,
      conversationRippleCenter: center,
      status: "",
      statusError: false,
    });
    const duration = resolveComposerMotionDuration(DSH_CONVERSATION_RIPPLE_DURATION_MS);
    this.conversationRippleTimer = setTimeout(() => {
      this.conversationRippleTimer = undefined;
      onComplete();
    }, duration);
  }

  beginPreparing = (): void => this.patch({
    composerOpen: false,
    composerClosing: false,
    preparing: true,
    status: "正在准备 DSH 输入…",
    statusError: false,
  });

  showComposer = (sessionId: string): void => {
    this.clearMotionTimers();
    this.patch({
      composerOpen: true,
      composerClosing: false,
      composerMotion: "entering",
      preparing: false,
      preparedSessionId: sessionId,
      status: "",
      statusError: false,
    });
    this.scheduleComposerVisible();
  };

  hideComposer = (): void => {
    if (!this.snapshot.composerOpen) return;
    this.clearMotionTimers();
    this.patch({
      composerMotion: "exiting",
      composerClosing: true,
      preparing: false,
      status: "",
      statusError: false,
    });
    this.exitTimer = setTimeout(() => {
      this.exitTimer = undefined;
      this.patch({ composerOpen: false, composerClosing: false, composerMotion: "visible" });
    }, resolveComposerMotionDuration(DSH_COMPOSER_EXIT_DURATION_MS));
  };

  revealComposer = (): boolean => {
    if (!this.snapshot.preparedSessionId) return false;
    this.clearMotionTimers();
    this.patch({
      composerOpen: true,
      composerClosing: false,
      composerMotion: "entering",
      preparing: false,
      status: "",
      statusError: false,
    });
    this.scheduleComposerVisible();
    return true;
  };

  failPreparing = (message: string): void => this.patch({
    composerOpen: false,
    composerClosing: false,
    preparing: false,
    preparedSessionId: undefined,
    status: message,
    statusError: true,
  });

  setComposerPlacement = (x: number, y: number): void => {
    if (this.snapshot.composerX === x && this.snapshot.composerY === y) return;
    this.patch({ composerX: x, composerY: y });
  };

  relocateComposer = (x: number, y: number): void => {
    if (!this.snapshot.composerOpen) {
      this.setComposerPlacement(x, y);
      return;
    }
    this.pendingPlacement = { x, y };
    if (this.relocationTimer !== undefined) return;
    if (this.enterTimer !== undefined) {
      clearTimeout(this.enterTimer);
      this.enterTimer = undefined;
    }
    this.patch({ composerMotion: "exiting" });
    this.relocationTimer = setTimeout(() => {
      this.relocationTimer = undefined;
      const placement = this.pendingPlacement;
      this.pendingPlacement = undefined;
      if (!placement || !this.snapshot.composerOpen) return;
      this.patch({
        composerX: placement.x,
        composerY: placement.y,
        composerMotion: "entering",
      });
      this.scheduleComposerVisible();
    }, resolveComposerMotionDuration(DSH_COMPOSER_EXIT_DURATION_MS));
  };

  private scheduleComposerVisible(): void {
    if (this.enterTimer !== undefined) clearTimeout(this.enterTimer);
    this.enterTimer = setTimeout(() => {
      this.enterTimer = undefined;
      if (this.snapshot.composerOpen) this.patch({ composerMotion: "visible" });
    }, resolveComposerMotionDuration(DSH_COMPOSER_ENTER_DURATION_MS));
  }

  private clearMotionTimers(): void {
    if (this.enterTimer !== undefined) clearTimeout(this.enterTimer);
    if (this.exitTimer !== undefined) clearTimeout(this.exitTimer);
    if (this.relocationTimer !== undefined) clearTimeout(this.relocationTimer);
    this.enterTimer = undefined;
    this.exitTimer = undefined;
    this.relocationTimer = undefined;
    this.pendingPlacement = undefined;
  }

  private patch(next: Partial<WaterSurfaceSnapshot>): void {
    const snapshot = { ...this.snapshot, ...next };
    if (Object.keys(next).every((key) =>
      this.snapshot[key as keyof WaterSurfaceSnapshot] ===
      snapshot[key as keyof WaterSurfaceSnapshot]
    )) return;
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}
