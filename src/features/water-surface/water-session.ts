interface SessionSummaryLike {
  blank: boolean;
}

interface SessionListLike {
  current?: string;
  byId: Record<string, SessionSummaryLike | undefined>;
}

interface WorkspaceLike {
  workspaceId: string;
  sessionIds: readonly string[];
}

interface WorkspaceListLike {
  items: readonly WorkspaceLike[];
  recentWorkspaceId?: string;
}

interface PromptResultLike {
  ok: boolean;
  error?: { code?: string; message?: string };
}

interface SessionLike {
  prompt(
    content: Array<{ type: "text"; text: string }>,
    mode: "queue",
  ): Promise<PromptResultLike>;
}

export interface WaterSurfaceRuntime {
  sessions: {
    list: { getSnapshot(): SessionListLike };
    binding(id: string): { session: SessionLike } | undefined;
    open(id: string): void;
  };
  workspaces: {
    list: { getSnapshot(): WorkspaceListLike };
    connectWorkspace(id: string): Promise<string>;
  };
}

export class WaterSurfaceSubmitError extends Error {
  constructor(
    message: string,
    readonly userMessage: string,
  ) {
    super(message);
    this.name = "WaterSurfaceSubmitError";
  }
}

export function resolveWaterSurfaceWorkspaceId(
  sessions: SessionListLike,
  workspaces: WorkspaceListLike,
): string | undefined {
  const current = sessions.current;
  if (current) {
    const owner = workspaces.items.find((workspace) =>
      workspace.sessionIds.includes(current),
    );
    if (owner) {
      return owner.workspaceId;
    }
  }
  return workspaces.recentWorkspaceId;
}

/**
 * Prepare the blank Session scope required by DSH's real composer controls.
 * This never admits a Prompt; the native input machine remains the only
 * submission owner once the composer is visible.
 */
export async function prepareWaterSurfaceSession(
  runtime: WaterSurfaceRuntime,
  workspaceId = resolveWaterSurfaceWorkspaceId(
    runtime.sessions.list.getSnapshot(),
    runtime.workspaces.list.getSnapshot(),
  ),
): Promise<string> {
  if (!workspaceId) {
    throw new WaterSurfaceSubmitError(
      "water surface found no current or recent workspace",
      "先在 DSH 中选择一个工作区，再回来投入想法。",
    );
  }

  let sessionId: string;
  try {
    sessionId = await runtime.workspaces.connectWorkspace(workspaceId);
  } catch (error) {
    throw new WaterSurfaceSubmitError(
      `water surface could not connect workspace: ${String(error)}`,
      "还没能准备好 DSH 输入框。可以留在水面，稍后再试。",
    );
  }

  if (!runtime.sessions.binding(sessionId)) {
    throw new WaterSurfaceSubmitError(
      `water surface session ${sessionId} is not locally addressable`,
      "空白 Session 已创建，但页面还没准备好。请再试一次。",
    );
  }

  runtime.sessions.open(sessionId);
  return sessionId;
}

/**
 * Admit exactly one non-blank first prompt, then navigate to native DSH UI.
 * The caller owns the in-flight lock and preserves its draft on rejection.
 */
export async function startWaterSurfaceSession(
  runtime: WaterSurfaceRuntime,
  text: string,
): Promise<string> {
  if (!text.trim()) {
    throw new WaterSurfaceSubmitError(
      "water surface refused a blank prompt",
      "先写下一点什么，再投入水面。",
    );
  }

  const workspaceId = resolveWaterSurfaceWorkspaceId(
    runtime.sessions.list.getSnapshot(),
    runtime.workspaces.list.getSnapshot(),
  );
  if (!workspaceId) {
    throw new WaterSurfaceSubmitError(
      "water surface found no current or recent workspace",
      "先在 DSH 中选择一个工作区，再回来投入想法。",
    );
  }

  let sessionId: string;
  try {
    sessionId = await runtime.workspaces.connectWorkspace(workspaceId);
  } catch (error) {
    throw new WaterSurfaceSubmitError(
      `water surface could not connect workspace: ${String(error)}`,
      "还没能开始 Session。输入仍在，可以稍后再试。",
    );
  }

  const binding = runtime.sessions.binding(sessionId);
  if (!binding) {
    throw new WaterSurfaceSubmitError(
      `water surface session ${sessionId} is not locally addressable`,
      "Session 已创建，但页面还没准备好。输入仍在，请再试一次。",
    );
  }

  let result: PromptResultLike;
  try {
    result = await binding.session.prompt(
      [{ type: "text", text }],
      "queue",
    );
  } catch (error) {
    throw new WaterSurfaceSubmitError(
      `water surface prompt transport failed: ${String(error)}`,
      "想法还没投入成功。输入仍在，请检查连接后再试。",
    );
  }
  if (!result.ok) {
    const reason = [result.error?.code, result.error?.message]
      .filter(Boolean)
      .join(": ");
    throw new WaterSurfaceSubmitError(
      `water surface prompt was rejected${reason ? `: ${reason}` : ""}`,
      "DSH 没有接受这次投入。输入仍在，可以调整后再试。",
    );
  }

  runtime.sessions.open(sessionId);
  return sessionId;
}
