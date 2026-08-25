import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { WaterSurfaceSnapshot } from "./surface-store";

type SelectorHook<T> = <S>(selector: (snapshot: T) => S) => S;

interface InputStateLike {
  draft: string;
  phase: "plain" | "adjudicating" | "claimed" | "submitting";
}

interface InputActionsLike {
  setDraft(text: string): void;
  submit(): void;
}

interface ComposerKeyboardLike {
  readonly snapshot: InputStateLike;
  setDraft(text: string, editRange?: {
    start: number;
    end: number;
    insertedLength: number;
  }): void;
  track(draft: string, caret: number): void;
}

interface SessionSnapshotLike {
  running?: boolean;
  removed?: boolean;
  promptError?: { error?: { message?: string } } | null;
}

interface SessionListSnapshotLike {
  current?: string;
  byId: Record<string, { cwd?: string; blank?: boolean } | undefined>;
}

interface WorkspaceListSnapshotLike {
  items: readonly {
    workspaceId: string;
    title?: string;
    path?: string;
    sessionIds: readonly string[];
  }[];
  recentWorkspaceId?: string;
}

interface PermissionStateLike {
  currentValue: string;
  options: readonly {
    value: string;
    name: string;
    description?: string;
  }[];
}

interface ModelSelectionLike {
  provider: string;
  model: string;
  reasoningEffort?: string;
}

interface ModelDirectoryStateLike {
  current: ModelSelectionLike | null;
  groups: readonly {
    id: string;
    name: string;
    models: readonly {
      id: string;
      name: string;
      description?: string;
      reasoning?: {
        defaultEffort?: string;
        efforts: readonly { id: string; name: string; description?: string }[];
      };
    }[];
  }[];
  failures: readonly { id: string; name: string; message: string }[];
  status: "idle" | "loading" | "ready" | "selecting" | "error";
  error: string | null;
}

interface AgentPresetStateLike {
  options: readonly {
    id: string;
    name?: string;
    description?: string;
  }[];
  current: string;
  error: string | null;
  busy: boolean;
}

interface NoticeLike {
  level: "info" | "error";
  text: string;
}

type ComposerMenu = "workspace" | "preset" | "command" | "access" | "model";

const DSH_COMMAND_CHOICES = [
  { id: "compact", label: "Compact", description: "压缩较早的对话历史" },
  { id: "export", label: "Export", description: "导出当前 Session 日志" },
  { id: "feedback", label: "Feedback", description: "记录本 Session 反馈" },
  { id: "goal", label: "Goal", description: "设置或查看长期任务目标" },
  { id: "permission", label: "Permission", description: "切换权限模式" },
  { id: "plan", label: "Plan", description: "进入或退出计划模式" },
  { id: "model", label: "Model", description: "选择本 Session 模型" },
] as const;

export interface DshWaterComposerProps {
  sessionId?: string;
  variant?: "hero" | "composer";
  disabled?: boolean;
  blocked?: { reason?: string };
  placeholder?: string;
  overlay?: ReactNode;
  leftItems?: ReactNode;
  rightItems?: ReactNode;
  useSurface: SelectorHook<WaterSurfaceSnapshot>;
  useInput: SelectorHook<InputStateLike | undefined>;
  useSession: SelectorHook<SessionSnapshotLike | undefined>;
  useSessions: SelectorHook<SessionListSnapshotLike>;
  useWorkspaces: SelectorHook<WorkspaceListSnapshotLike>;
  useProjection<T = unknown>(key: string, selector?: (value: T | undefined) => unknown): unknown;
  useNotices: SelectorHook<NoticeLike | null>;
  useModelDirectory: SelectorHook<ModelDirectoryStateLike>;
  useAgentPresetSeat: SelectorHook<AgentPresetStateLike>;
  inputActions?: InputActionsLike;
  keyboard?: ComposerKeyboardLike;
  command?(line: string): Promise<boolean>;
  loadModels?(): void;
  selectModel?(selection: ModelSelectionLike): Promise<boolean>;
  loadAgentPresets?(): Promise<void>;
  selectAgentPreset?(id: string): Promise<void>;
  onSelectWorkspace(workspaceId: string): Promise<void>;
  onDismiss(): void;
  onAccepted(): void;
}

function Icon({ name }: { name: "arrow" | "chevron" | "folder" | "plus" | "spark" }) {
  if (name === "arrow") {
    return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15V2M2.5 7.5 8 2l5.5 5.5" /></svg>;
  }
  if (name === "chevron") {
    return <svg viewBox="0 0 14 14" aria-hidden="true"><path d="m3.5 5.5 3.5 3 3.5-3" /></svg>;
  }
  if (name === "folder") {
    return <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M2 4.5h5l1.4 1.7H16v7.3H2z" /></svg>;
  }
  if (name === "spark") {
    return <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2.5a5.7 5.7 0 0 0 0 11M9 2.5a5.7 5.7 0 0 1 0 11M3.5 6.2l11 5.6M3.5 11.8l11-5.6" /></svg>;
  }
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v12M2 8h12" /></svg>;
}

function displayName(value: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)) return value;
  return value.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
}

function AccessControl({
  value,
  disabled,
  command,
  open,
  onOpenChange,
}: {
  value: PermissionStateLike | undefined;
  disabled: boolean;
  command?: (line: string) => Promise<boolean>;
  open: boolean;
  onOpenChange(open: boolean): void;
}) {
  const [busy, setBusy] = useState(false);
  const [confirmFull, setConfirmFull] = useState<string | null>(null);
  useEffect(() => {
    if (!open) setConfirmFull(null);
  }, [open]);
  if (!value) return null;
  const current = value.options.find((option) => option.value === value.currentValue);
  const label = current?.value === "full-access"
    ? "Full access"
    : displayName(current?.name ?? value.currentValue);
  const select = async (id: string) => {
    if (!command || busy) return;
    setBusy(true);
    try {
      await command(`/permission ${id}`);
      onOpenChange(false);
      setConfirmFull(null);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="wb-dsh-native-control" data-open={open || undefined}>
      <button
        type="button"
        className="wb-dsh-native-trigger"
        aria-label={`访问模式，当前：${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled || busy || !command}
        onClick={() => onOpenChange(!open)}
      >
        <span>{label}</span><Icon name="chevron" />
      </button>
      {open && (
        <div className="wb-dsh-native-menu" role="menu" aria-label="访问模式">
          {confirmFull ? (
            <div className="wb-dsh-native-confirm">
              <strong>启用 Full access？</strong>
              <span>DSH 将允许本 Session 使用完整工作区权限。</span>
              <div>
                <button type="button" onClick={() => setConfirmFull(null)}>取消</button>
                <button type="button" data-primary onClick={() => void select(confirmFull)}>确认启用</button>
              </div>
            </div>
          ) : value.options.filter((option) => option.value !== "custom").map((option) => (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value.currentValue}
              key={option.value}
              title={option.description}
              onClick={() => {
                if (option.value === "full-access") setConfirmFull(option.value);
                else void select(option.value);
              }}
            >
              <span>{option.value === "full-access" ? "Full access" : displayName(option.name)}</span>
              {option.value === value.currentValue && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModelControl({
  state,
  disabled,
  load,
  select,
  open,
  onOpenChange,
}: {
  state: ModelDirectoryStateLike;
  disabled: boolean;
  load?: () => void;
  select?: (selection: ModelSelectionLike) => Promise<boolean>;
  open: boolean;
  onOpenChange(open: boolean): void;
}) {
  const [pane, setPane] = useState<"root" | "model" | "effort">("root");
  useEffect(() => {
    if (!open) setPane("root");
  }, [open]);
  const choices = useMemo(() => state.groups.flatMap((group) =>
    group.models.map((model) => ({ group, model }))), [state.groups]);
  const currentChoice = choices.find(({ group, model }) =>
    group.id === state.current?.provider && model.id === state.current.model);
  const reasoning = currentChoice?.model.reasoning;
  const effortId = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
  const effortLabel = reasoning?.efforts.find((effort) => effort.id === effortId)?.name ?? effortId;
  const modelLabel = currentChoice?.model.name ?? "选择模型";
  const choose = async (selection: ModelSelectionLike) => {
    if (!select) return;
    const accepted = await select(selection);
    if (accepted) {
      onOpenChange(false);
      setPane("root");
    }
  };
  return (
    <div className="wb-dsh-native-control wb-dsh-native-model" data-open={open || undefined}>
      <button
        type="button"
        className="wb-dsh-native-trigger"
        aria-label={effortLabel
          ? `选择模型，当前 ${modelLabel}，推理等级 ${effortLabel}`
          : `选择模型，当前 ${modelLabel}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled || !select}
        onClick={() => {
          if (!open) load?.();
          setPane("root");
          onOpenChange(!open);
        }}
      >
        <span>{modelLabel}</span>
        {effortLabel && <span data-secondary>{effortLabel}</span>}
        <Icon name="chevron" />
      </button>
      {open && (
        <div className="wb-dsh-native-menu wb-dsh-native-model-menu" role="menu" aria-label="模型与推理等级">
          {pane === "root" && (
            <>
              <button type="button" role="menuitem" onClick={() => setPane("model")}>
                <span>模型</span><span>{modelLabel} ›</span>
              </button>
              {reasoning && (
                <button type="button" role="menuitem" onClick={() => setPane("effort")}>
                  <span>推理等级</span><span>{effortLabel ?? "Default"} ›</span>
                </button>
              )}
            </>
          )}
          {pane === "model" && (
            <>
              <button type="button" data-back onClick={() => setPane("root")}>‹ 模型</button>
              {state.status === "loading" && <div className="wb-dsh-native-menu-status">正在刷新模型列表…</div>}
              {state.groups.map((group) => (
                <section role="group" aria-label={group.name} key={group.id}>
                  <div className="wb-dsh-native-menu-heading">{group.name}</div>
                  {group.models.map((model) => {
                    const selected = group.id === state.current?.provider && model.id === state.current.model;
                    return (
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={selected}
                        key={model.id}
                        onClick={() => void choose({
                          provider: group.id,
                          model: model.id,
                          ...(model.reasoning?.defaultEffort
                            ? { reasoningEffort: model.reasoning.defaultEffort }
                            : {}),
                        })}
                      >
                        <span>{model.name}</span>{selected && <span aria-hidden="true">✓</span>}
                      </button>
                    );
                  })}
                </section>
              ))}
            </>
          )}
          {pane === "effort" && reasoning && state.current && (
            <>
              <button type="button" data-back onClick={() => setPane("root")}>‹ 推理等级</button>
              {reasoning.efforts.map((effort) => (
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={effort.id === effortId}
                  key={effort.id}
                  title={effort.description}
                  onClick={() => void choose({
                    provider: state.current!.provider,
                    model: state.current!.model,
                    reasoningEffort: effort.id,
                  })}
                >
                  <span>{effort.name}</span>{effort.id === effortId && <span aria-hidden="true">✓</span>}
                </button>
              ))}
            </>
          )}
          {state.error && <div className="wb-dsh-native-menu-error">{state.error}</div>}
        </div>
      )}
    </div>
  );
}

export function DshWaterComposer(props: DshWaterComposerProps) {
  const surface = props.useSurface((state) => state);
  const input = props.useInput((state) => state);
  const session = props.useSession((state) => state);
  const sessions = props.useSessions((state) => state);
  const workspaces = props.useWorkspaces((state) => state);
  const notice = props.useNotices((state) => state);
  const model = props.useModelDirectory((state) => state);
  const agentPreset = props.useAgentPresetSeat((state) => state);
  const permissions = props.useProjection<PermissionStateLike>("permissions", (value) => value) as PermissionStateLike | undefined;
  const [openMenu, setOpenMenu] = useState<ComposerMenu | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const submittedRef = useRef(false);
  const loadModelsRef = useRef(props.loadModels);
  const loadAgentPresetsRef = useRef(props.loadAgentPresets);

  loadModelsRef.current = props.loadModels;
  loadAgentPresetsRef.current = props.loadAgentPresets;

  const activeWorkspace = workspaces.items.find((workspace) =>
    props.sessionId !== undefined && workspace.sessionIds.includes(props.sessionId));
  const activePreset = agentPreset.options.find((option) => option.id === agentPreset.current);
  const ready = surface.open && surface.composerOpen &&
    surface.preparedSessionId !== undefined &&
    surface.preparedSessionId === props.sessionId;
  const draft = input?.draft ?? "";
  const machineBusy = input?.phase === "adjudicating" || input?.phase === "submitting";
  const disabled = Boolean(
    props.disabled || props.blocked || session?.removed || !input ||
    !props.inputActions || !props.keyboard || machineBusy,
  );
  const workspaceOpen = openMenu === "workspace";
  const presetOpen = openMenu === "preset";
  const commandOpen = openMenu === "command";
  const dismissDropdowns = () => setOpenMenu(null);

  useEffect(() => {
    if (!ready) return;
    loadModelsRef.current?.();
    void loadAgentPresetsRef.current?.();
    window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  }, [ready, props.sessionId]);

  useEffect(() => {
    if (!submittedRef.current || input?.phase !== "plain") return;
    if (draft === "") {
      submittedRef.current = false;
      props.onAccepted();
      return;
    }
    submittedRef.current = false;
  }, [draft, input?.phase, props.onAccepted]);

  useEffect(() => {
    if (!ready) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      props.onDismiss();
    };
    window.addEventListener("keydown", onEscape, true);
    return () => window.removeEventListener("keydown", onEscape, true);
  }, [props.onDismiss, ready]);

  if (!ready) return null;

  const submit = () => {
    if (disabled || !draft.trim() || !props.inputActions) return;
    submittedRef.current = true;
    props.inputActions.submit();
  };

  return createPortal((
    <div
      className="wb-dsh-water-composer-layer"
      data-device-mode={surface.composerX === undefined ? "phone" : "desktop"}
      data-motion-phase={surface.composerMotion}
      style={{
        "--wb-native-composer-x": surface.composerX === undefined ? undefined : `${surface.composerX}px`,
        "--wb-native-composer-y": surface.composerY === undefined ? undefined : `${surface.composerY}px`,
      } as CSSProperties}
    >
      <div className="wb-dsh-native-context" aria-label="DSH 会话上下文">
        <div className="wb-dsh-native-control" data-open={workspaceOpen || undefined}>
          <button
            type="button"
            className="wb-dsh-native-context-trigger"
            aria-label="选择工作区"
            aria-haspopup="menu"
            aria-expanded={workspaceOpen}
            onClick={() => setOpenMenu(workspaceOpen ? null : "workspace")}
          >
            <Icon name="folder" /><span>{activeWorkspace?.title ?? activeWorkspace?.path ?? "选择工作区"}</span><Icon name="chevron" />
          </button>
          {workspaceOpen && (
            <div className="wb-dsh-native-menu" role="menu" aria-label="工作区">
              {workspaces.items.map((workspace) => (
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={workspace.workspaceId === activeWorkspace?.workspaceId}
                  key={workspace.workspaceId}
                  onClick={() => {
                    setOpenMenu(null);
                    void props.onSelectWorkspace(workspace.workspaceId);
                  }}
                >
                  <span>{workspace.title ?? workspace.path ?? workspace.workspaceId}</span>
                  {workspace.workspaceId === activeWorkspace?.workspaceId && <span aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        {agentPreset.options.length > 0 && (
          <div className="wb-dsh-native-control" data-open={presetOpen || undefined}>
            <button
              type="button"
              className="wb-dsh-native-context-trigger"
              aria-label={`Agent preset，当前：${activePreset?.name ?? agentPreset.current}`}
              aria-haspopup="menu"
              aria-expanded={presetOpen}
              disabled={agentPreset.busy}
              onClick={() => setOpenMenu(presetOpen ? null : "preset")}
            >
              <Icon name="spark" /><span>{activePreset?.name ?? agentPreset.current}</span><Icon name="chevron" />
            </button>
            {presetOpen && (
              <div className="wb-dsh-native-menu" role="menu" aria-label="Agent preset">
                {agentPreset.options.map((option) => (
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={option.id === agentPreset.current}
                    key={option.id}
                    title={option.description}
                    onClick={() => {
                      setOpenMenu(null);
                      void props.selectAgentPreset?.(option.id);
                    }}
                  >
                    <span>{option.name ?? option.id}</span>
                    {option.id === agentPreset.current && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="wb-dsh-native-card" data-composer-card="water">
        {props.overlay && <div className="wb-dsh-native-overlay">{props.overlay}</div>}
        <textarea
          ref={inputRef}
          className="wb-dsh-native-input"
          value={draft}
          rows={2}
          placeholder={props.placeholder ?? "描述你想要构建的内容"}
          disabled={disabled && !machineBusy}
          readOnly={machineBusy}
          data-phase={input?.phase ?? "inert"}
          onPointerDown={dismissDropdowns}
          onFocus={dismissDropdowns}
          onChange={(event) => {
            if (!props.keyboard || machineBusy) return;
            const next = event.currentTarget.value;
            props.keyboard.setDraft(next);
            props.keyboard.track(next, event.currentTarget.selectionStart ?? next.length);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
            event.preventDefault();
            submit();
          }}
        />
        <div className="wb-dsh-native-row">
          <div className="wb-dsh-native-tools">
            <div className="wb-dsh-native-control" data-open={commandOpen || undefined}>
              <button
                type="button"
                className="wb-dsh-native-plus"
                aria-label="命令"
                aria-haspopup="menu"
                aria-expanded={commandOpen}
                disabled={disabled || !props.keyboard}
                onClick={() => setOpenMenu(commandOpen ? null : "command")}
              ><Icon name="plus" /></button>
              {commandOpen && (
                <div className="wb-dsh-native-menu wb-dsh-native-command-menu" role="menu" aria-label="DSH 命令">
                  {DSH_COMMAND_CHOICES.map((choice) => (
                    <button
                      type="button"
                      role="menuitem"
                      key={choice.id}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        const el = inputRef.current;
                        const start = el?.selectionStart ?? draft.length;
                        const end = el?.selectionEnd ?? draft.length;
                        const command = `/${choice.id} `;
                        const next = `${draft.slice(0, start)}${command}${draft.slice(end)}`;
                        props.keyboard?.setDraft(next);
                        props.keyboard?.track(next, start + command.length);
                        setOpenMenu(null);
                        window.requestAnimationFrame(() => {
                          inputRef.current?.focus({ preventScroll: true });
                          inputRef.current?.setSelectionRange(start + command.length, start + command.length);
                        });
                      }}
                    >
                      <span>{choice.label}</span><span data-secondary>{choice.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <AccessControl
              value={permissions}
              disabled={disabled}
              command={props.command}
              open={openMenu === "access"}
              onOpenChange={(open) => setOpenMenu(open ? "access" : null)}
            />
            {props.leftItems}
          </div>
          <div className="wb-dsh-native-trailing">
            {props.rightItems}
            <ModelControl
              state={model}
              disabled={disabled}
              load={props.loadModels}
              select={props.selectModel}
              open={openMenu === "model"}
              onOpenChange={(open) => setOpenMenu(open ? "model" : null)}
            />
            <button
              type="button"
              className="wb-dsh-native-send"
              aria-label="发送消息"
              disabled={disabled || !draft.trim()}
              onClick={submit}
            ><Icon name="arrow" /></button>
          </div>
        </div>
      </div>
      {(notice?.text || session?.promptError?.error?.message || agentPreset.error) && (
        <div
          className="wb-dsh-native-status"
          data-error={notice?.level === "error" || Boolean(session?.promptError) || Boolean(agentPreset.error) || undefined}
          role="status"
        >
          {notice?.text || session?.promptError?.error?.message || agentPreset.error}
        </div>
      )}
    </div>
  ), document.body);
}
