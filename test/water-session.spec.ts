import { describe, expect, it, vi } from "vitest";
import {
  prepareWaterSurfaceSession,
  resolveWaterSurfaceWorkspaceId,
  startWaterSurfaceSession,
  WaterSurfaceSubmitError,
  type WaterSurfaceRuntime,
} from "../src/features/water-surface/water-session";

function runtime(options: {
  current?: string;
  recent?: string;
  promptOk?: boolean;
  binding?: boolean;
} = {}) {
  const prompt = vi.fn().mockResolvedValue({
    ok: options.promptOk ?? true,
    error: { code: "rejected", message: "no" },
  });
  const open = vi.fn();
  const connectWorkspace = vi.fn().mockResolvedValue("blank-session");
  const value: WaterSurfaceRuntime = {
    sessions: {
      list: {
        getSnapshot: () => ({
          current: options.current,
          byId: {},
        }),
      },
      binding: () => options.binding === false ? undefined : { session: { prompt } },
      open,
    },
    workspaces: {
      list: {
        getSnapshot: () => ({
          items: [{ workspaceId: "current-workspace", sessionIds: ["current-session"] }],
          recentWorkspaceId: options.recent,
        }),
      },
      connectWorkspace,
    },
  };
  return { value, prompt, open, connectWorkspace };
}

describe("DSH water surface session admission", () => {
  it("prefers the current session workspace and falls back to recent", () => {
    expect(resolveWaterSurfaceWorkspaceId(
      { current: "current-session", byId: {} },
      { items: [{ workspaceId: "current-workspace", sessionIds: ["current-session"] }], recentWorkspaceId: "recent" },
    )).toBe("current-workspace");
    expect(resolveWaterSurfaceWorkspaceId(
      { current: undefined, byId: {} },
      { items: [], recentWorkspaceId: "recent" },
    )).toBe("recent");
  });

  it("does nothing for blank input", async () => {
    const harness = runtime({ recent: "recent" });
    await expect(startWaterSurfaceSession(harness.value, "   ")).rejects.toBeInstanceOf(WaterSurfaceSubmitError);
    expect(harness.connectWorkspace).not.toHaveBeenCalled();
    expect(harness.prompt).not.toHaveBeenCalled();
    expect(harness.open).not.toHaveBeenCalled();
  });

  it("prepares one real blank Session without admitting a Prompt", async () => {
    const harness = runtime({ current: "current-session", recent: "recent" });
    await expect(prepareWaterSurfaceSession(harness.value)).resolves.toBe(
      "blank-session",
    );
    expect(harness.connectWorkspace).toHaveBeenCalledOnce();
    expect(harness.prompt).not.toHaveBeenCalled();
    expect(harness.open).toHaveBeenCalledWith("blank-session");
  });

  it("sends the original text once and opens only after acceptance", async () => {
    const harness = runtime({ current: "current-session", recent: "recent" });
    await expect(startWaterSurfaceSession(harness.value, "  一个想法  ")).resolves.toBe("blank-session");
    expect(harness.connectWorkspace).toHaveBeenCalledWith("current-workspace");
    expect(harness.prompt).toHaveBeenCalledTimes(1);
    expect(harness.prompt).toHaveBeenCalledWith([{ type: "text", text: "  一个想法  " }], "queue");
    expect(harness.open).toHaveBeenCalledWith("blank-session");
  });

  it("keeps native navigation closed when the prompt is rejected", async () => {
    const harness = runtime({ recent: "recent", promptOk: false });
    await expect(startWaterSurfaceSession(harness.value, "继续")).rejects.toMatchObject({
      userMessage: expect.stringContaining("输入仍在"),
    });
    expect(harness.open).not.toHaveBeenCalled();
  });

  it("fails recoverably when there is no workspace or binding", async () => {
    const noWorkspace = runtime();
    await expect(startWaterSurfaceSession(noWorkspace.value, "继续")).rejects.toMatchObject({
      userMessage: expect.stringContaining("选择一个工作区"),
    });
    expect(noWorkspace.prompt).not.toHaveBeenCalled();

    const noBinding = runtime({ recent: "recent", binding: false });
    await expect(startWaterSurfaceSession(noBinding.value, "继续")).rejects.toMatchObject({
      userMessage: expect.stringContaining("页面还没准备好"),
    });
    expect(noBinding.open).not.toHaveBeenCalled();
  });
});
