/** Engagement Server Actions — same safe() pattern */
import type { EngagementRepository } from "./domain/repository";
import { Engagement } from "./domain/engagement";
import { safe, type ActionResult } from "../lib/salesos/api/safe";
import { NotFoundError, BusinessRuleError } from "./domain/errors";

export async function getEngagementAction(
  repo: EngagementRepository, orgId: string, id: string
): Promise<ActionResult<{ id: string; status: string; clientId: string; period: string; version: number }>> {
  return safe(async () => {
    const e = await repo.findById(id, orgId);
    if (!e) throw new NotFoundError("Engagement not found");
    return { id: e.id, status: e.status, clientId: e.clientId, period: e.period, version: e.version };
  });
}

export async function listEngagementsAction(
  repo: EngagementRepository, orgId: string
): Promise<ActionResult<Array<{ id: string; status: string; clientId: string; version: number }>>> {
  return safe(async () => {
    const items = await repo.findMany({}, orgId);
    return items.map((e) => ({ id: e.id, status: e.status, clientId: e.clientId, version: e.version }));
  });
}

export async function transitionEngagementAction(
  repo: EngagementRepository, orgId: string, id: string, action: string, version: number
): Promise<ActionResult<{ id: string; status: string; version: number; revisionCycles: number }>> {
  return safe(async () => {
    const e = await repo.findById(id, orgId);
    if (!e) throw new NotFoundError("Engagement not found");
    if (version !== e.version) throw new BusinessRuleError("Concurrent modification");
    const e2 = Engagement.reconstitute({ ...e.toJSON() });
    // We need to determine the target status from the action
    // For now, let's use the action as the target status since we don't have a full mapping
    const target = e2.transition(e2.status, action, "");
    const saved = await repo.save(target);
    return { id: saved.id, status: saved.status, version: saved.version, revisionCycles: saved.revisionCycles.length };
  });
}
