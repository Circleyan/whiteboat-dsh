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
  DSH_WATER_SCALE_LIMITS,
  normalizeDshWaterScale,
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
  const [scaleDraft, setScaleDraft] = useState<number | undefined>();
  const [scaleError, setScaleError] = useState(false);
  const scaleGeneration = useRef(0);
  const waterScale = scaleDraft ?? normalizeDshWaterScale(snapshot.value?.waterScale);
  const [writeError, setWriteError] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const [soundSaving, setSoundSaving] = useState(false);
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

  const updateScale = async (value: number) => {
    const next = normalizeDshWaterScale(value);
    const generation = ++scaleGeneration.current;
    setScaleDraft(next); setScaleError(false);
    try { await preferences.set("waterScale", next); }
    catch { if (generation === scaleGeneration.current) setScaleError(true); }
    finally { if (generation === scaleGeneration.current) setScaleDraft(undefined); }
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
        <p className="wb-dsh-settings__eyebrow">白舟 Whiteboat</p>
        <h2 id="wb-dsh-settings-title">水面</h2>
        <p>在开始工作前留一点空白，让尚未定形的想法慢慢浮现。</p>
        <nav className="wb-dsh-settings__links" aria-label="了解白舟 Whiteboat">
          <a href="https://github.com/Circleyan/whiteboat-dsh" target="_blank" rel="noopener noreferrer">项目与使用说明</a>
          <a href="https://dshplugin.app/plugins/whiteboat-dsh" target="_blank" rel="noopener noreferrer">DSH 社区页面</a>
        </nav>
      </header>
      <div className="wb-dsh-settings__row">
        <div className="wb-dsh-settings__copy">
          <label htmlFor="wb-dsh-water-scale">水纹大小</label>
          <span>默认 90%，可在 50% 到 200% 之间调整。</span>
        </div>
        <output className="wb-dsh-settings__value" htmlFor="wb-dsh-water-scale" aria-live="polite">
          {Math.round(waterScale * 100)}%
        </output>
        <input id="wb-dsh-water-scale" type="range"
          min={DSH_WATER_SCALE_LIMITS.min} max={DSH_WATER_SCALE_LIMITS.max}
          step={DSH_WATER_SCALE_LIMITS.step} value={waterScale} disabled={!writable}
          aria-describedby="wb-dsh-water-scale-status"
          onChange={(event) => void updateScale(Number(event.currentTarget.value))} />
        <p id="wb-dsh-water-scale-status" className="wb-dsh-settings__status"
          data-error={scaleError || undefined} aria-live="polite">
          {scaleError ? "水纹大小没有保存，请再试一次。" : "保存后立即用于水面。"}
        </p>
      </div>
      <div className="wb-dsh-settings__row">
        <div className="wb-dsh-settings__copy">
          <label htmlFor="wb-dsh-water-sound">水面音效</label>
          <span>让小船航行带起轻柔水声，关闭后保持安静。</span>
        </div>
        <input id="wb-dsh-water-sound" type="checkbox"
          checked={snapshot.value?.soundEnabled ?? true} disabled={!writable || soundSaving}
          onChange={async (event) => {
            const enabled = event.currentTarget.checked;
            setSoundSaving(true); setSoundError(false);
            try { await preferences.set("soundEnabled", enabled); }
            catch { setSoundError(true); }
            finally { setSoundSaving(false); }
          }} />
        {soundError && <p role="status">音效设置没有保存，请再试一次。</p>}
      </div>
      <div className="wb-dsh-settings__row">
        <div className="wb-dsh-settings__copy">
          <label htmlFor="wb-dsh-boat-follow-speed">小船跟随速度</label>
          <span>默认 60%，可在 50% 到 200% 之间调整。</span>
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
