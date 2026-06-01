export interface DealNextAction {
  nextAction: string | null;
  nextActionAt: Date | null;
}

export function readDealNextAction(
  metadata: unknown,
): DealNextAction {
  if (!metadata || typeof metadata !== "object") {
    return { nextAction: null, nextActionAt: null };
  }
  const m = metadata as Record<string, unknown>;
  const nextAction =
    typeof m.nextAction === "string" && m.nextAction.trim()
      ? m.nextAction.trim()
      : null;
  let nextActionAt: Date | null = null;
  if (typeof m.nextActionAt === "string" && m.nextActionAt) {
    const d = new Date(m.nextActionAt);
    if (!Number.isNaN(d.getTime())) nextActionAt = d;
  }
  return { nextAction, nextActionAt };
}

export function mergeDealNextActionMetadata(
  existing: Record<string, unknown>,
  patch: { nextAction?: string | null; nextActionAt?: Date | null },
): Record<string, unknown> {
  const merged = { ...existing };
  if (patch.nextAction !== undefined) {
    if (patch.nextAction === null || patch.nextAction === "") {
      delete merged.nextAction;
    } else {
      merged.nextAction = patch.nextAction;
    }
  }
  if (patch.nextActionAt !== undefined) {
    if (patch.nextActionAt === null) {
      delete merged.nextActionAt;
    } else {
      merged.nextActionAt = patch.nextActionAt.toISOString();
    }
  }
  return merged;
}
