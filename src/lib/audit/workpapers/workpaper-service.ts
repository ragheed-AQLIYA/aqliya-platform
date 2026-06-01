import {
  createWorkpaperMetadata,
  transitionWorkpaperStatus,
  type WorkpaperMetadata,
} from "@/lib/audit/vnext/workpaper-metadata";
import type { WorkpaperStatus } from "@/lib/audit/vnext/types";
import {
  getEngagementVNextStore,
  updateEngagementVNextStore,
} from "@/lib/audit/engagement-vnext-persistence";

export async function listWorkpapers(
  organizationId: string,
  engagementId: string,
): Promise<WorkpaperMetadata[]> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  return store?.workpapers ?? [];
}

export async function createWorkpaper(
  organizationId: string,
  engagementId: string,
  input: {
    sectionRef: string;
    title: string;
    titleAr: string;
    evidenceRefs?: string[];
  },
): Promise<WorkpaperMetadata> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  const id = `wp-${Date.now().toString(36)}`;
  const wp = createWorkpaperMetadata({
    id,
    engagementId,
    sectionRef: input.sectionRef,
    title: input.title,
    titleAr: input.titleAr,
    evidenceRefs: input.evidenceRefs,
  });
  const list = [...(store?.workpapers ?? []), wp];
  await updateEngagementVNextStore(organizationId, engagementId, {
    workpapers: list,
  });
  return wp;
}

export async function transitionWorkpaper(
  organizationId: string,
  engagementId: string,
  workpaperId: string,
  nextStatus: WorkpaperStatus,
  actorId: string,
): Promise<WorkpaperMetadata | null> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  const list = store?.workpapers ?? [];
  const idx = list.findIndex((w) => w.id === workpaperId);
  if (idx < 0) return null;
  const { workpaper } = transitionWorkpaperStatus(
    list[idx],
    nextStatus,
    actorId,
  );
  const updated = [...list];
  updated[idx] = workpaper;
  await updateEngagementVNextStore(organizationId, engagementId, {
    workpapers: updated,
  });
  return workpaper;
}

export async function linkWorkpaperEvidence(
  organizationId: string,
  engagementId: string,
  workpaperId: string,
  evidenceId: string,
): Promise<WorkpaperMetadata | null> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  const list = store?.workpapers ?? [];
  const idx = list.findIndex((w) => w.id === workpaperId);
  if (idx < 0) return null;
  const refs = new Set([...(list[idx].evidenceRefs ?? []), evidenceId]);
  const updated = { ...list[idx], evidenceRefs: [...refs] };
  const next = [...list];
  next[idx] = updated;
  await updateEngagementVNextStore(organizationId, engagementId, {
    workpapers: next,
  });
  return updated;
}

export async function linkWorkpaperFinding(
  organizationId: string,
  engagementId: string,
  workpaperId: string,
  findingId: string,
): Promise<WorkpaperMetadata | null> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  const list = store?.workpapers ?? [];
  const idx = list.findIndex((w) => w.id === workpaperId);
  if (idx < 0) return null;
  const updated = {
    ...list[idx],
    findingId,
    crossReferences: [
      ...new Set([...list[idx].crossReferences, `finding:${findingId}`]),
    ],
  };
  const next = [...list];
  next[idx] = updated;
  await updateEngagementVNextStore(organizationId, engagementId, {
    workpapers: next,
  });
  return updated;
}

export async function attachWorkpaperOutputRef(
  organizationId: string,
  engagementId: string,
  workpaperId: string,
  outputPackageRef: string,
): Promise<WorkpaperMetadata | null> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  const list = store?.workpapers ?? [];
  const idx = list.findIndex((w) => w.id === workpaperId);
  if (idx < 0) return null;
  const updated = { ...list[idx], outputPackageRef };
  const next = [...list];
  next[idx] = updated;
  await updateEngagementVNextStore(organizationId, engagementId, {
    workpapers: next,
  });
  return updated;
}

export function summarizeWorkpapers(workpapers: WorkpaperMetadata[]) {
  const byStatus: Record<string, number> = {};
  for (const w of workpapers) {
    byStatus[w.status] = (byStatus[w.status] ?? 0) + 1;
  }
  return { total: workpapers.length, byStatus };
}
