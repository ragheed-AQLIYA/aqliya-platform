import "server-only";

import { InMemoryEvidenceStore } from "@/core/evidence/evidence-store";
import { PrismaEvidenceStore } from "@/core/evidence/evidence-store-prisma";
import type { EvidenceCategory, EvidenceStore } from "@/core/evidence/types";
import { SALESOS_PRODUCT_KEY } from "@/lib/sales/core-adoption";
import {
  STAGE_PROOF_REQUIREMENTS,
  listProofAssetsForOpportunity,
} from "@/lib/sales/proof-linkage-service";
import {
  ensureSalesSeed,
  listEvidenceForOpportunity,
  listObjections,
  listOpportunities,
  listProofAssets,
} from "@/lib/sales/store";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { SalesProofAsset } from "@/lib/sales/types";
// SALESOS_PLACEHOLDER: inline type — implement when @/lib/platform/signals/types exists
interface RuntimeSignal {
  id: string;
  organizationId: string;
  productSlug: string;
  kind?: string;
  action: string;
  severity: string;
  summaryEn?: string;
  summaryAr?: string;
  resourceId: string;
  resourceType?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const STALE_PROOF_MS = 180 * 24 * 60 * 60 * 1000;

let store: EvidenceStore = new PrismaEvidenceStore();

export type SalesProofEvidenceAlertKind =
  | "proof_missing_evidence_ref"
  | "proof_stale"
  | "proof_missing_for_stage"
  | "objection_without_proof"
  | "commercial_evidence_missing";

export interface SalesProofEvidenceAlert {
  id: string;
  organizationId: string;
  kind: SalesProofEvidenceAlertKind;
  resourceType: string;
  resourceId: string;
  labelEn: string;
  labelAr: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  href: string;
  metadata?: Record<string, unknown>;
}

export interface ProofEvidenceLinkage {
  proofAssetId: string;
  coreEvidenceId: string;
  salesEvidenceRefIds: string[];
  evidenceRef?: string;
}

export interface ProofUsageTraceEntry {
  proofAssetId: string;
  title: string;
  coreEvidenceId: string;
  evidenceRef?: string;
  linkedOpportunityIds: string[];
  linkedAccountIds: string[];
  usageScore: number;
}

export interface EvidenceBackedRecommendationCheck {
  ok: boolean;
  missingProofRefs: string[];
  missingEvidenceRefs: string[];
}

function proofCategory(assetType: string): EvidenceCategory {
  if (assetType === "audit_evidence") return "document";
  if (assetType === "customer_quote" || assetType === "benchmark") {
    return "source_record";
  }
  return "report";
}

export function coreEvidenceIdForProofAsset(proofAssetId: string): string {
  return `sales-proof:${proofAssetId}`;
}

export function coreEvidenceIdForCommercialRef(refId: string): string {
  return `sales-commercial-ref:${refId}`;
}

export function getSalesEvidenceStore(): EvidenceStore {
  return store;
}

export function resetSalesEvidenceStoreForTests(): void {
  store = new InMemoryEvidenceStore();
}

export async function syncProofAssetToCore(params: {
  tenantId: string;
  proofAsset: SalesProofAsset;
  createdById: string;
}): Promise<void> {
  try {
    const coreId = coreEvidenceIdForProofAsset(params.proofAsset.id);
    const existing = await store.getById(coreId);
    const metadata = {
      proofAssetId: params.proofAsset.id,
      assetType: params.proofAsset.assetType,
      externalRef: params.proofAsset.externalRef,
      evidenceRef: params.proofAsset.evidenceRef,
      linkedOpportunityIds: params.proofAsset.linkedOpportunityIds ?? [],
      linkedAccountIds: params.proofAsset.linkedAccountIds ?? [],
    };
    if (existing) {
      await store.update(coreId, {
        status: params.proofAsset.status === "archived" ? "archived" : "attached",
        title: params.proofAsset.title,
        metadata,
      });
      return;
    }
    await store.create({
      id: coreId,
      tenantId: params.tenantId,
      productKey: SALESOS_PRODUCT_KEY,
      category: proofCategory(params.proofAsset.assetType),
      status: params.proofAsset.status === "archived" ? "archived" : "attached",
      title: params.proofAsset.title,
      description: params.proofAsset.description,
      source: `sales_proof_asset:${params.proofAsset.id}`,
      metadata,
      createdById: params.createdById,
    } as never);
  } catch {
    // Dual-write failure must never affect the primary action
  }
}

export async function syncCommercialEvidenceRefToCore(params: {
  tenantId: string;
  ref: SalesEvidenceRef;
  createdById: string;
}): Promise<void> {
  try {
    const coreId = coreEvidenceIdForCommercialRef(params.ref.id);
    const existing = await store.getById(coreId);
    const metadata = {
      salesEvidenceRefId: params.ref.id,
      opportunityId: params.ref.opportunityId,
      typeId: params.ref.typeId,
    };
    if (existing) {
      await store.update(coreId, { status: "attached", metadata });
      return;
    }
    await store.create({
      id: coreId,
      tenantId: params.tenantId,
      productKey: SALESOS_PRODUCT_KEY,
      category: "note",
      status: "attached",
      title: params.ref.label,
      source: `sales_opportunity:${params.ref.opportunityId}`,
      metadata,
      createdById: params.createdById,
    } as never);
    await store.link(
      coreId,
      "SalesOpportunity",
      params.ref.opportunityId,
      "commercial_evidence",
    );
  } catch {
    // Dual-write failure must never affect the primary action
  }
}

export async function linkProofAssetToCore(params: {
  proofAssetId: string;
  targetType: string;
  targetId: string;
  relationship?: string;
}): Promise<void> {
  try {
    const coreId = coreEvidenceIdForProofAsset(params.proofAssetId);
    await store.link(
      coreId,
      params.targetType,
      params.targetId,
      params.relationship ?? "supports",
    );
  } catch {
    // Dual-write failure must never affect the primary action
  }
}

export async function refreshSalesProofCoreSnapshots(
  organizationId: string,
  ownerId = "system",
): Promise<void> {
  try {
    await ensureSalesSeed(organizationId, ownerId);
    const proofAssets = listProofAssets(organizationId);
    const actorId = ownerId;
    await Promise.all(
      proofAssets.map((asset) =>
        syncProofAssetToCore({
          tenantId: organizationId,
          proofAsset: asset,
          createdById: actorId,
        }),
      ),
    );
    const opportunities = listOpportunities(organizationId);
    for (const opp of opportunities) {
      const refs = listEvidenceForOpportunity(organizationId, opp.id);
      for (const ref of refs) {
        await syncCommercialEvidenceRefToCore({
          tenantId: organizationId,
          ref,
          createdById: actorId,
        });
      }
    }
  } catch {
    // Snapshot refresh is best-effort only
  }
}

export function mapProofAssetToCoreRef(
  asset: SalesProofAsset,
  evidenceRefs: SalesEvidenceRef[],
): ProofEvidenceLinkage {
  const linkedRefIds = evidenceRefs
    .filter((ref) => {
      const oppIds = asset.linkedOpportunityIds ?? [];
      return (
        ref.opportunityId === asset.opportunityId ||
        oppIds.includes(ref.opportunityId)
      );
    })
    .map((ref) => ref.id);
  return {
    proofAssetId: asset.id,
    coreEvidenceId: coreEvidenceIdForProofAsset(asset.id),
    salesEvidenceRefIds: linkedRefIds,
    evidenceRef: asset.evidenceRef,
  };
}

export async function buildProofEvidenceLinkageMap(
  organizationId: string,
  ownerId = "system",
): Promise<ProofEvidenceLinkage[]> {
  await ensureSalesSeed(organizationId, ownerId);
  const proofAssets = listProofAssets(organizationId);
  const allRefs = listOpportunities(organizationId).flatMap((opp) =>
    listEvidenceForOpportunity(organizationId, opp.id),
  );
  return proofAssets.map((asset) => mapProofAssetToCoreRef(asset, allRefs));
}

function isStaleProof(asset: SalesProofAsset, now = Date.now()): boolean {
  if (asset.status !== "active") return false;
  const updated = new Date(asset.updatedAt).getTime();
  return Number.isFinite(updated) && now - updated > STALE_PROOF_MS;
}

function objectionLacksProof(
  objection: {
    resolved?: boolean;
    opportunityId?: string;
    category: string;
  },
  proofAssets: SalesProofAsset[],
): boolean {
  if (objection.resolved || !objection.opportunityId) return false;
  const oppId = objection.opportunityId;
  return !proofAssets.some(
    (p) =>
      p.status === "active" &&
      (p.linkedOpportunityIds?.includes(oppId) ||
        p.opportunityId === oppId) &&
      (p.assetType === "objection_response" ||
        p.assetType === "case_study" ||
        p.assetType === "customer_quote"),
  );
}

export async function collectSalesProofEvidenceAlerts(
  organizationId: string,
  ownerId = "system",
): Promise<SalesProofEvidenceAlert[]> {
  await ensureSalesSeed(organizationId, ownerId);
  const proofAssets = listProofAssets(organizationId);
  const objections = listObjections(organizationId);
  const opportunities = listOpportunities(organizationId);
  const alerts: SalesProofEvidenceAlert[] = [];
  const nowIso = new Date().toISOString();

  for (const asset of proofAssets) {
    if (asset.status === "active" && !asset.evidenceRef) {
      alerts.push({
        id: `sales-proof-missing-ref-${asset.id}`,
        organizationId,
        kind: "proof_missing_evidence_ref",
        resourceType: "SalesProofAsset",
        resourceId: asset.id,
        labelEn: `Proof asset missing evidence ref: ${asset.title}`,
        labelAr: `أصل إثبات بدون مرجع دليل: ${asset.title}`,
        timestamp: asset.updatedAt ?? nowIso,
        severity: "warning",
        href: asset.opportunityId
          ? `/sales/opportunities/${asset.opportunityId}`
          : "/sales/intelligence",
        metadata: { assetType: asset.assetType },
      });
    }
    if (isStaleProof(asset)) {
      alerts.push({
        id: `sales-proof-stale-${asset.id}`,
        organizationId,
        kind: "proof_stale",
        resourceType: "SalesProofAsset",
        resourceId: asset.id,
        labelEn: `Stale proof asset: ${asset.title}`,
        labelAr: `أصل إثبات قديم: ${asset.title}`,
        timestamp: asset.updatedAt ?? nowIso,
        severity: "warning",
        href: "/sales/intelligence",
        metadata: { assetType: asset.assetType },
      });
    }
  }

  for (const objection of objections) {
    if (!objectionLacksProof(objection, proofAssets)) continue;
    alerts.push({
      id: `sales-objection-no-proof-${objection.id}`,
      organizationId,
      kind: "objection_without_proof",
      resourceType: "SalesObjection",
      resourceId: objection.id,
      labelEn: `Objection without linked proof: ${objection.category}`,
      labelAr: `اعتراض بدون إثبات مرتبط: ${objection.category}`,
      timestamp: objection.updatedAt ?? nowIso,
      severity:
        objection.frequency && objection.frequency >= 2 ? "critical" : "warning",
      href: objection.opportunityId
        ? `/sales/opportunities/${objection.opportunityId}`
        : "/sales/intelligence",
      metadata: {
        category: objection.category,
        opportunityId: objection.opportunityId,
      },
    });
  }

  for (const opp of opportunities) {
    const stageReq = STAGE_PROOF_REQUIREMENTS[opp.stage];
    if (!stageReq?.length) continue;
    const linked = listProofAssetsForOpportunity(
      proofAssets,
      organizationId,
      opp.id,
    );
    const presentTypes = new Set(linked.map((p) => p.assetType));
    const missingTypes = stageReq.filter((t) => !presentTypes.has(t));
    if (missingTypes.length === 0) continue;
    alerts.push({
      id: `sales-proof-stage-gap-${opp.id}`,
      organizationId,
      kind: "proof_missing_for_stage",
      resourceType: "SalesOpportunity",
      resourceId: opp.id,
      labelEn: `Missing proof for ${opp.stage}: ${missingTypes.join(", ")}`,
      labelAr: `إثبات ناقص للمرحلة ${opp.stage}`,
      timestamp: nowIso,
      severity: "warning",
      href: `/sales/opportunities/${opp.id}`,
      metadata: { stage: opp.stage, missingTypes },
    });

    const commercialEvidence = listEvidenceForOpportunity(organizationId, opp.id);
    const needsEvidence =
      opp.stage === "Qualification" ||
      opp.reviewStatus === "InReview" ||
      opp.approvalStatus === "PendingApproval";
    if (needsEvidence && commercialEvidence.length === 0 && linked.length === 0) {
      alerts.push({
        id: `sales-commercial-ev-missing-${opp.id}`,
        organizationId,
        kind: "commercial_evidence_missing",
        resourceType: "SalesOpportunity",
        resourceId: opp.id,
        labelEn: `Missing commercial evidence and proof: ${opp.name}`,
        labelAr: `دليل تجاري وإثبات مفقودان: ${opp.name}`,
        timestamp: nowIso,
        severity: "critical",
        href: `/sales/opportunities/${opp.id}`,
        metadata: { stage: opp.stage, reviewStatus: opp.reviewStatus },
      });
    }
  }

  return alerts;
}

export async function collectSalesProofEvidenceRuntimeSignals(
  organizationId: string,
  ownerId = "system",
): Promise<RuntimeSignal[]> {
  const alerts = await collectSalesProofEvidenceAlerts(organizationId, ownerId);
  return alerts.map((alert) => ({
    id: alert.id,
    organizationId: alert.organizationId,
    productSlug: "sales" as const,
    kind: "evidence" as const,
    action: `sales.proof.${alert.kind}`,
    resourceType: alert.resourceType,
    resourceId: alert.resourceId,
    timestamp: alert.timestamp,
    summaryEn: alert.labelEn,
    summaryAr: alert.labelAr,
    severity: alert.severity,
    metadata: {
      ...alert.metadata,
      opportunityId:
        typeof alert.metadata?.opportunityId === "string"
          ? alert.metadata.opportunityId
          : alert.resourceType === "SalesOpportunity"
            ? alert.resourceId
            : undefined,
      href: alert.href,
    },
  }));
}

export async function traceProofUsage(
  organizationId: string,
  ownerId = "system",
): Promise<ProofUsageTraceEntry[]> {
  await ensureSalesSeed(organizationId, ownerId);
  const proofAssets = listProofAssets(organizationId);
  return proofAssets.map((asset) => {
    const linkedOpportunityIds = [
      ...new Set([
        ...(asset.linkedOpportunityIds ?? []),
        ...(asset.opportunityId ? [asset.opportunityId] : []),
      ]),
    ];
    const linkedAccountIds = [
      ...new Set([
        ...(asset.linkedAccountIds ?? []),
        ...(asset.accountId ? [asset.accountId] : []),
      ]),
    ];
    const usageScore =
      linkedOpportunityIds.length * 2 +
      linkedAccountIds.length +
      (asset.evidenceRef ? 1 : 0) +
      (asset.status === "active" ? 0.5 : 0);
    return {
      proofAssetId: asset.id,
      title: asset.title,
      coreEvidenceId: coreEvidenceIdForProofAsset(asset.id),
      evidenceRef: asset.evidenceRef,
      linkedOpportunityIds,
      linkedAccountIds,
      usageScore,
    };
  });
}

export function checkEvidenceBackedRecommendation(input: {
  evidence: Array<{ source?: string; refId?: string }>;
  requireProof?: boolean;
}): EvidenceBackedRecommendationCheck {
  const missingProofRefs: string[] = [];
  const missingEvidenceRefs: string[] = [];
  for (const item of input.evidence) {
    if (!item.refId) {
      missingEvidenceRefs.push("unknown");
      continue;
    }
    if (item.source === "proof" && !item.refId.startsWith("sales-proof")) {
      missingProofRefs.push(item.refId);
    }
    if (
      item.source === "objection" ||
      item.source === "opportunity" ||
      item.source === "evidence"
    ) {
      if (!item.refId) missingEvidenceRefs.push(item.refId);
    }
  }
  const hasProof =
    !input.requireProof ||
    input.evidence.some((e) => e.source === "proof" && e.refId);
  const ok =
    missingProofRefs.length === 0 &&
    missingEvidenceRefs.length === 0 &&
    hasProof;
  return { ok, missingProofRefs, missingEvidenceRefs };
}

export const syncSalesProofAssetToCore = syncProofAssetToCore;
export const syncSalesEvidenceRefToCore = syncCommercialEvidenceRefToCore;
export const linkSalesProofToCore = linkProofAssetToCore;
export const syncAllSalesProofAssetsToCore = refreshSalesProofCoreSnapshots;
export const collectSalesEvidenceAlerts = collectSalesProofEvidenceAlerts;
export const collectSalesProofEvidenceAlertSignals =
  collectSalesProofEvidenceRuntimeSignals;

export const SALES_CORE_FILES_ADOPTION_BLOCKER =
  "Core file storage adoption pending — link-only scaffold";
export const SALES_FILE_BACKED_PROOF_ASSET_TYPES = [
  "case_study",
  "customer_quote",
  "audit_evidence",
] as const;

export async function bridgeProofAssetsToEvidenceRefs(
  organizationId: string,
  ownerId = "system",
): Promise<ProofEvidenceLinkage[]> {
  return buildProofEvidenceLinkageMap(organizationId, ownerId);
}

export function proofAssetToEvidenceRef(asset: SalesProofAsset) {
  return coreEvidenceIdForProofAsset(asset.id);
}

export async function detectMissingCommercialEvidence(
  organizationId: string,
  ownerId = "system",
): Promise<SalesProofEvidenceAlert[]> {
  const alerts = await collectSalesProofEvidenceAlerts(organizationId, ownerId);
  return alerts.filter((a) => a.kind === "commercial_evidence_missing");
}

export async function detectObjectionsWithoutProof(
  organizationId: string,
  ownerId = "system",
): Promise<SalesProofEvidenceAlert[]> {
  const alerts = await collectSalesProofEvidenceAlerts(organizationId, ownerId);
  return alerts.filter((a) => a.kind === "objection_without_proof");
}

export async function detectStaleProofAssets(
  organizationId: string,
  ownerId = "system",
): Promise<SalesProofEvidenceAlert[]> {
  const alerts = await collectSalesProofEvidenceAlerts(organizationId, ownerId);
  return alerts.filter((a) => a.kind === "proof_stale");
}

export async function evaluateSalesEvidenceCoverage(
  organizationId: string,
  ownerId = "system",
): Promise<{ alerts: SalesProofEvidenceAlert[]; alertCount: number }> {
  const alerts = await collectSalesProofEvidenceAlerts(organizationId, ownerId);
  return { alerts, alertCount: alerts.length };
}

export type SalesProofEvidenceBridge = ProofEvidenceLinkage;
export type SalesProofUsageTrace = ProofUsageTraceEntry;
export type SalesEvidenceAlert = SalesProofEvidenceAlert;
export type SalesEvidenceAlertKind = SalesProofEvidenceAlertKind;
export type CommercialEvidenceRefShape = SalesEvidenceRef;
