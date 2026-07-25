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
import type { SalesProofAsset } from "@/lib/sales/types";

import type {
  RuntimeSignal,
  SalesProofEvidenceAlert,
  SalesProofEvidenceAlertKind,
} from "./types";
import { coreEvidenceIdForProofAsset, STALE_PROOF_MS } from "./store";

export const SALES_CORE_FILES_ADOPTION_BLOCKER =
  "Core file storage adoption pending — link-only scaffold";
export const SALES_FILE_BACKED_PROOF_ASSET_TYPES = [
  "case_study",
  "customer_quote",
  "audit_evidence",
] as const;

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

export const collectSalesEvidenceAlerts = collectSalesProofEvidenceAlerts;
export const collectSalesProofEvidenceAlertSignals =
  collectSalesProofEvidenceRuntimeSignals;
