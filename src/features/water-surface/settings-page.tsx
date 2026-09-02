import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  SettingsScope,
  SettingsScopeSnapshot,
} from "@deepseek-ai/dsh-client-runtime/client";
import {
  DSH_BOAT_FOLLOW_SPEED_LIMITS,
  normalizeDshBoatFollowSpeed,
  type WhiteboatDshSettings,
} from "./settings";

export interface DshWaterSettingsPageProps {
  preferences: SettingsScope<WhiteboatDshSettings>;
}

export function useWhiteboatDshSettings(
  preferences: SettingsScope<WhiteboatDshSettings>,
): SettingsScopeSnapshot<WhiteboatDshSettings> {
  const subscribe = useCallback(
    (listener: () => void) => preferences.subscribe(listener),
    [preferences],
  );
  const getSnapshot = useCallback(
    () => preferences.getSnapshot(),
    [preferences],
  );
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function DshWaterSettingsPage({
  preferences,
}: DshWaterSettingsPageProps) {
  const snapshot = useWhiteboatDshSettings(preferences);
  const [draft, setDraft] = useState<number | undefined>();
  const [writeError, setWriteError] = useState(false);
  const writeGeneration = useRef(0);
  const resolvedSpeed = normalizeDshBoatFollowSpeed(
    snapshot.value?.boatFollowSpeed,
  );
  const speed = draft ?? resolvedSpeed;
  const ready = snapshot.status === "ready";
  const writable = ready && snapshot.writable;

  const updateSpeed = async (value: number) => {
    const next = normalizeDshBoatFollowSpeed(value);
    const generation = ++writeGeneration.current;
    setDraft(next);
    setWriteError(false);
    try {
      await preferences.set("boatFollowSpeed", next);
    } catch (error) {
      console.error("[water-surface] boat follow speed write failed", error);
      if (generation === writeGeneration.current) setWriteError(true);
    } finally {
      if (generation === writeGeneration.current) setDraft(undefined);
    }
  };

  const status = writeError
    ? "还没能保存。请稍后再试。"
    : snapshot.status === "loading"
      ? "正在载入 DSH 设置…"
      : snapshot.status === "unavailable"
        ? "当前连接不支持持久设置。"
        : !snapshot.writable
          ? "当前设置文档为只读。"
          : "调整后立即用于指针、点击、触控目的地与手机漫游。";

  return (
    <section className="wb-dsh-settings" aria-labelledby="wb-dsh-settings-title">
      <header className="wb-dsh-settings__header">
        <p className="wb-dsh-settings__eyebrow">白舟</p>
        <h2 id="wb-dsh-settings-title">水面</h2>
        <p>调整小船在水面上的航行手感，不改变水面、投影或会话语义。</p>
      </header>
      <div className="wb-dsh-settings__row">
        <div className="wb-dsh-settings__copy">
          <label htmlFor="wb-dsh-boat-follow-speed">小船跟随速度</label>
          <span>默认 100%，可在 50% 到 200% 之间调整。</span>
        </div>
        <output
          className="wb-dsh-settings__value"
          htmlFor="wb-dsh-boat-follow-speed"
          aria-live="polite"
        >
          {Math.round(speed * 100)}%
        </output>
        <input
          id="wb-dsh-boat-follow-speed"
          type="range"
          min={DSH_BOAT_FOLLOW_SPEED_LIMITS.min}
          max={DSH_BOAT_FOLLOW_SPEED_LIMITS.max}
          step={DSH_BOAT_FOLLOW_SPEED_LIMITS.step}
          value={speed}
          disabled={!writable}
          aria-describedby="wb-dsh-boat-follow-speed-status"
          onChange={(event) => void updateSpeed(Number(event.currentTarget.value))}
        />
        <p
          id="wb-dsh-boat-follow-speed-status"
          className="wb-dsh-settings__status"
          data-error={writeError || undefined}
          aria-live="polite"
        >
          {status}
        </p>
      </div>
    </section>
  );
}
