import { prisma } from "@/lib/prisma";
import type { ClassificationResult, ClassificationSource } from "./types";
import {
  lookupAuditFirmMemory,
  recordAuditFirmMemoryFromConfirmation,
  FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE,
  isFirmMemoryAutoSuggestEligible,
} from "./firm-memory-engine";

export {
  lookupAuditFirmMemory,
  recordAuditFirmMemoryFromConfirmation,
  backfillFirmMemoryFromConfirmedMappings,
  getClassificationHintsForAccount,
  deprecateFirmMemoryPattern,
  FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE,
  isFirmMemoryAutoSuggestEligible,
  buildNameFingerprint,
  pickErpMapLabels,
} from "./firm-memory-engine";
export type {
  FirmMemoryLookupInput,
  FirmMemoryRecordInput,
  FirmMemoryMatchTier,
} from "./firm-memory-engine";

/** Confidence from hit count: 10+ hits → 0.99 (ADR-001 commercial example) */
export function confidenceFromHitCount(hitCount: number): number {
  if (hitCount >= 10) return 0.99;
  if (hitCount <= 1) return 0.75;
  return Math.min(0.98, 0.75 + (hitCount - 1) * 0.025);
}

/** @deprecated Use lookupAuditFirmMemory — GL code only wrapper for legacy callers. */
export async function lookupFirmMemory(
  organizationId: string,
  accountCode: string,
  accountName?: string,
  classificationHints?: string[],
): Promise<ClassificationResult | null> {
  return lookupAuditFirmMemory({
    organizationId,
    accountCode,
    accountName: accountName ?? accountCode,
    classificationHints,
  });
}

export async function recordFirmMemoryFeedback(params: {
  organizationId: string;
  engagementId?: string;
  clientAccountCode: string;
  clientAccountName?: string;
  suggestedCanonicalId?: string | null;
  acceptedCanonicalId: string;
  wasAccepted: boolean;
  reviewerId: string;
  classificationHints?: string[];
}): Promise<void> {
  await recordAuditFirmMemoryFromConfirmation({
    organizationId: params.organizationId,
    engagementId: params.engagementId,
    clientAccountCode: params.clientAccountCode,
    clientAccountName: params.clientAccountName ?? params.clientAccountCode,
    acceptedCanonicalId: params.acceptedCanonicalId,
    suggestedCanonicalId: params.suggestedCanonicalId,
    wasAccepted: params.wasAccepted,
    reviewerId: params.reviewerId,
    classificationHints: params.classificationHints,
  });
}

export async function getLatestClassificationSources(
  engagementId: string,
): Promise<Record<string, ClassificationSource>> {
  const rows = await prisma.tBClassificationHistory.findMany({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
    select: { accountCode: true, source: true },
  });

  const map: Record<string, ClassificationSource> = {};
  for (const row of rows) {
    if (!map[row.accountCode]) {
      map[row.accountCode] = row.source as ClassificationSource;
    }
  }
  return map;
}

export async function logClassificationHistory(params: {
  organizationId: string;
  engagementId?: string;
  accountCode: string;
  accountName?: string;
  result: ClassificationResult;
  mappingHints?: string[];
}): Promise<void> {
  const { buildExplanationFromResult } = await import(
    "./classification-explanation"
  );
  const classificationDetail = buildExplanationFromResult(
    params.result,
    params.mappingHints,
  );

  await prisma.tBClassificationHistory.create({
    data: {
      organizationId: params.organizationId,
      engagementId: params.engagementId,
      accountCode: params.accountCode,
      accountName: params.accountName,
      resultCategory: params.result.category,
      canonicalCode: params.result.canonicalCode,
      confidence: params.result.confidence,
      source: params.result.source,
      providerId: params.result.providerId,
      mappingHints:
        params.mappingHints && params.mappingHints.length > 0
          ? params.mappingHints
          : undefined,
      classificationDetail: classificationDetail as object,
    },
  });
}
