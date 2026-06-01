import { recommendSamplingDesign } from "@/lib/audit/vnext/sampling-scaffolds";
import type { SamplingPlanRecord } from "@/lib/audit/engagement-vnext-store";
import {
  getEngagementVNextStore,
  updateEngagementVNextStore,
} from "@/lib/audit/engagement-vnext-persistence";

export async function listSamplingPlans(
  organizationId: string,
  engagementId: string,
): Promise<SamplingPlanRecord[]> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  return store?.samplingPlans ?? [];
}

export async function createSamplingPlan(
  organizationId: string,
  engagementId: string,
  input: {
    populationSize: number;
    totalMonetaryValue: number;
    materialityThreshold: number;
  },
): Promise<SamplingPlanRecord> {
  const design = recommendSamplingDesign(input);
  const plan: SamplingPlanRecord = {
    id: `sample-${Date.now().toString(36)}`,
    engagementId,
    method: design.method,
    populationSize: input.populationSize,
    sampleSize: design.sampleSize,
    coveragePct: design.coveragePct,
    status: "designed",
    exceptionCount: 0,
    selectionRationaleAr: design.selectionRationaleAr,
    evidenceRefs: [],
    updatedAt: new Date().toISOString(),
  };
  const store = await getEngagementVNextStore(organizationId, engagementId);
  const list = [...(store?.samplingPlans ?? []), plan];
  await updateEngagementVNextStore(organizationId, engagementId, {
    samplingPlans: list,
  });
  return plan;
}

export async function updateSamplingPlanStatus(
  organizationId: string,
  engagementId: string,
  planId: string,
  status: SamplingPlanRecord["status"],
  exceptionCount?: number,
): Promise<SamplingPlanRecord | null> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  const list = store?.samplingPlans ?? [];
  const idx = list.findIndex((p) => p.id === planId);
  if (idx < 0) return null;
  const updated: SamplingPlanRecord = {
    ...list[idx],
    status,
    exceptionCount: exceptionCount ?? list[idx].exceptionCount,
    updatedAt: new Date().toISOString(),
  };
  const next = [...list];
  next[idx] = updated;
  await updateEngagementVNextStore(organizationId, engagementId, {
    samplingPlans: next,
  });
  return updated;
}

export async function linkSamplingException(
  organizationId: string,
  engagementId: string,
  planId: string,
  input: {
    riskId?: string;
    findingId?: string;
    evidenceId?: string;
    exceptionCount?: number;
  },
): Promise<SamplingPlanRecord | null> {
  const store = await getEngagementVNextStore(organizationId, engagementId);
  const list = store?.samplingPlans ?? [];
  const idx = list.findIndex((p) => p.id === planId);
  if (idx < 0) return null;
  const current = list[idx];
  const linkedRiskIds = new Set(current.linkedRiskIds ?? []);
  const linkedFindingIds = new Set(current.linkedFindingIds ?? []);
  const evidenceRefs = new Set(current.evidenceRefs ?? []);
  if (input.riskId) linkedRiskIds.add(input.riskId);
  if (input.findingId) linkedFindingIds.add(input.findingId);
  if (input.evidenceId) evidenceRefs.add(input.evidenceId);
  const updated: SamplingPlanRecord = {
    ...current,
    linkedRiskIds: [...linkedRiskIds],
    linkedFindingIds: [...linkedFindingIds],
    evidenceRefs: [...evidenceRefs],
    exceptionCount: input.exceptionCount ?? current.exceptionCount,
    status: "exceptions_review",
    updatedAt: new Date().toISOString(),
  };
  const next = [...list];
  next[idx] = updated;
  await updateEngagementVNextStore(organizationId, engagementId, {
    samplingPlans: next,
  });
  return updated;
}
