import { isValidElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DshWaterComposer, type DshWaterComposerProps } from "../src/features/water-surface/dsh-composer";
import { WaterSurfaceStore } from "../src/features/water-surface/surface-store";

// Exercise the composer callbacks and effect lifecycle without pretending this
// lightweight React host is a browser or the real DSH Slot runtime.
const hooks = vi.hoisted(() => {
  const contexts = new Map<string, { slots: unknown[]; cursor: number }>();
  let current = "root";
  let pending: (() => void)[] = [];
  const slot = () => {
    const context = contexts.get(current)!;
    return { context, index: context.cursor++ };
  };
  return {
    enter(id: string) {
      current = id;
      const context = contexts.get(id) ?? { slots: [], cursor: 0 };
      context.cursor = 0;
      contexts.set(id, context);
    },
    reset() { contexts.clear(); pending = []; },
    flush() { const effects = pending; pending = []; effects.forEach((effect) => effect()); },
    useState<T>(initial: T) {
      const { context, index } = slot();
      if (!(index in context.slots)) context.slots[index] = initial;
      return [context.slots[index], (value: T) => { context.slots[index] = value; }];
    },
    useRef<T>(initial: T) {
      const { context, index } = slot();
      if (!(index in context.slots)) context.slots[index] = { current: initial };
      return context.slots[index];
    },
    useId() { slot(); return `disclosure-${current}`; },
    useMemo<T>(factory: () => T) { slot(); return factory(); },
    useEffect(effect: () => void | (() => void), deps: unknown[]) {
      const { context, index } = slot();
      const previous = context.slots[index] as { deps: unknown[]; cleanup?: () => void } | undefined;
      if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return;
      const next = { deps, cleanup: undefined as (() => void) | undefined };
      context.slots[index] = next;
      pending.push(() => { previous?.cleanup?.(); next.cleanup = effect() || undefined; });
    },
  };
});

vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState: hooks.useState,
  useRef: hooks.useRef,
  useId: hooks.useId,
  useMemo: hooks.useMemo,
  useEffect: hooks.useEffect,
}));
vi.mock("react-dom", () => ({ createPortal: (children: ReactNode) => children }));

type HostProps = Record<string, any>;

function createComposer() {
  hooks.reset();
  const keydowns = new Set<(event: KeyboardEvent) => void>();
  const frames: (() => void)[] = [];
  vi.stubGlobal("window", {
    addEventListener: (type: string, handler: (event: KeyboardEvent) => void) => {
      if (type === "keydown") keydowns.add(handler);
    },
    removeEventListener: (_type: string, handler: (event: KeyboardEvent) => void) => keydowns.delete(handler),
    requestAnimationFrame: (callback: () => void) => { frames.push(callback); },
  });
  vi.stubGlobal("document", { body: {}, dispatchEvent: vi.fn() });
  const surface = new WaterSurfaceStore().getSnapshot();
  const input = { draft: "kept draft", phase: "plain" as const };
  const props: DshWaterComposerProps = {
    sessionId: "draft-session",
    useSurface: (select) => select({ ...surface, composerOpen: true, preparedSessionId: "draft-session" }),
    useInput: (select) => select(input),
    useSession: (select) => select({}),
    useSessions: (select) => select({ current: "draft-session", byId: {} }),
    useWorkspaces: (select) => select({ items: [{ workspaceId: "work", title: "Work", sessionIds: ["draft-session"] }] }),
    useNotices: (select) => select(null),
    useModelDirectory: (select) => select({
      current: { provider: "provider", model: "model", reasoningEffort: "high" },
      groups: [{ id: "provider", name: "Provider", models: [{
        id: "model", name: "Model", reasoning: { efforts: [{ id: "high", name: "High" }] },
      }] }],
      failures: [], status: "ready", error: null,
    }),
    useAgentPresetSeat: (select) => select({ options: [{ id: "preset", name: "Preset" }], current: "preset", busy: false, error: null }),
    useProjection: () => ({ currentValue: "read-only", options: [
      { value: "read-only", name: "Read only" }, { value: "full-access", name: "Full access" },
    ] }),
    inputActions: { setDraft: vi.fn(), submit: vi.fn() },
    keyboard: { snapshot: input, setDraft: vi.fn(), track: vi.fn() },
    command: vi.fn(async () => true),
    selectModel: vi.fn(async () => true),
    selectAgentPreset: vi.fn(async () => {}),
    onSelectWorkspace: vi.fn(async () => {}),
    onDismiss: vi.fn(),
    onAccepted: vi.fn(),
  };
  const nodes = new Map<string, HostProps>();
  let elements: { type: string; props: HostProps; node: HostProps }[] = [];
  const walk = (value: ReactNode, path: string): void => {
    if (Array.isArray(value)) { value.forEach((child, i) => walk(child, `${path}.${i}`)); return; }
    if (!isValidElement<HostProps>(value)) return;
    if (typeof value.type === "function") {
      hooks.enter(path);
      walk((value.type as (props: HostProps) => ReactNode)(value.props), `${path}.component`);
      return;
    }
    if (typeof value.type === "string") {
      const node = nodes.get(path) ?? {
        focus: vi.fn(), setSelectionRange: vi.fn(), selectionStart: 5, selectionEnd: 5,
        getBoundingClientRect: () => ({ left: 10, top: 20, width: 100, height: 50 }),
      };
      nodes.set(path, node);
      node.disabled = Boolean(value.props.disabled);
      node.querySelector = () => elements.find((element) => element.type === "button" && !element.node.disabled)?.node;
      const ref = (value as typeof value & {
        ref?: ((node: HostProps) => void) | { current: HostProps | null };
      }).ref;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
      elements.push({ type: value.type, props: value.props, node });
    }
    walk(value.props.children, `${path}.children`);
  };
  const render = () => {
    elements = [];
    hooks.enter("composer");
    walk(DshWaterComposer(props), "tree");
    hooks.flush();
  };
  render();
  return {
    props, input, render,
    elements: () => elements,
    named: (name: string) => elements.find((element) => element.props["aria-label"] === name)!,
    key(key: string) {
      const event = { key, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      keydowns.forEach((handler) => handler(event as unknown as KeyboardEvent));
      render();
      return event;
    },
    flushFrames() { frames.splice(0).forEach((frame) => frame()); },
  };
}

afterEach(() => { hooks.reset(); vi.unstubAllGlobals(); });

describe("DSH composer disclosure accessibility", () => {
  it.each([
    ["选择工作区", "工作区"],
    ["Agent preset，当前：Preset", "Agent preset"],
    ["命令", "DSH 命令"],
    ["访问模式，当前：Read only", "访问模式"],
    ["选择模型，当前 Model，推理等级 High", "模型与推理等级"],
  ])("closes %s before dismissing the composer and restores its trigger", (triggerName, panelName) => {
    const composer = createComposer();
    composer.named(triggerName).props.onClick();
    composer.render();
    const trigger = composer.named(triggerName);
    const panel = composer.named(panelName);
    expect(trigger.props["aria-expanded"]).toBe(true);
    expect(trigger.props["aria-controls"]).toBe(panel.props.id);
    expect(panel.props.role).toBe("group");
    expect(composer.elements().filter((element) => element.props.role?.startsWith("menu"))).toEqual([]);
    const escape = composer.key("Escape");
    expect(escape.preventDefault).toHaveBeenCalledOnce();
    expect(composer.props.onDismiss).not.toHaveBeenCalled();
    expect(trigger.node.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(composer.named(triggerName).props["aria-expanded"]).toBe(false);
    expect(composer.input.draft).toBe("kept draft");
    expect(composer.props.keyboard!.setDraft).not.toHaveBeenCalled();
    expect(composer.props.inputActions!.submit).not.toHaveBeenCalled();
    composer.key("Escape");
    expect(composer.props.onDismiss).toHaveBeenCalledOnce();
  });

  it("leaves other keys alone and gives the textarea a persistent name", () => {
    const composer = createComposer();
    expect(composer.named("消息内容").type).toBe("textarea");
    expect(composer.key("Tab").preventDefault).not.toHaveBeenCalled();
    expect(composer.props.onDismiss).not.toHaveBeenCalled();
  });

  it("keeps command insertion at the caret and the existing submit handoff order", () => {
    const composer = createComposer();
    composer.named("命令").props.onClick();
    composer.render();
    composer.elements().find((element) => element.type === "button" && element.props.children?.[0]?.props?.children === "Compact")!.props.onClick();
    expect(composer.props.keyboard!.setDraft).toHaveBeenCalledWith("kept /compact draft");
    expect(composer.props.keyboard!.track).toHaveBeenCalledWith("kept /compact draft", 14);
    composer.flushFrames();
    expect(composer.named("消息内容").node.setSelectionRange).toHaveBeenCalledWith(14, 14);
    composer.render();
    composer.named("发送消息").props.onClick();
    expect(composer.props.onAccepted).toHaveBeenCalledOnce();
    expect(composer.props.inputActions!.submit).not.toHaveBeenCalled();
    composer.flushFrames();
    expect(composer.props.inputActions!.submit).toHaveBeenCalledOnce();
  });

  it("still requires confirmation before enabling full workspace access", async () => {
    const composer = createComposer();
    composer.named("访问模式，当前：Read only").props.onClick();
    composer.render();
    const selected = composer.elements().find((element) => element.props["aria-pressed"] === true)!;
    expect(selected.type).toBe("button");
    expect(selected.props.role).toBeUndefined();
    composer.elements().find((element) => element.type === "button" && element.props.children?.[0]?.props?.children === "Full access")!.props.onClick();
    composer.render();
    expect(composer.props.command).not.toHaveBeenCalled();
    composer.elements().find((element) => element.type === "button" && element.props.children === "确认启用")!.props.onClick();
    await Promise.resolve();
    expect(composer.props.command).toHaveBeenCalledWith("/permission full-access");
  });

  it("returns Escape focus to the input while the permission trigger is busy", async () => {
    const composer = createComposer();
    let complete!: (accepted: boolean) => void;
    const pending = new Promise<boolean>((resolve) => { complete = resolve; });
    composer.props.command = vi.fn(() => pending);
    composer.render();
    composer.named("访问模式，当前：Read only").props.onClick();
    composer.render();
    composer.elements().find((element) => element.props["aria-pressed"] === true)!.props.onClick();
    composer.render();
    const trigger = composer.named("访问模式，当前：Read only");
    expect(trigger.node.disabled).toBe(true);
    composer.key("Escape");
    expect(trigger.node.focus).not.toHaveBeenCalled();
    expect(composer.named("消息内容").node.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(composer.props.onDismiss).not.toHaveBeenCalled();
    expect(composer.props.command).toHaveBeenCalledOnce();
    expect(composer.props.command).toHaveBeenCalledWith("/permission read-only");
    complete(true);
    await pending;
    composer.render();
    expect(composer.named("访问模式，当前：Read only").node.disabled).toBe(false);
  });
});
