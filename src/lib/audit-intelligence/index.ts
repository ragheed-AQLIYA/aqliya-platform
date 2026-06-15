/**
 * Audit Intelligence — variance and risk signals (Cycle 3, ADR-001).
 */

import { prisma } from "@/lib/prisma";

export interface AuditIntelligenceFinding {
  type: "variance" | "material_change" | "risk_indicator" | "missing_evidence";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  accountCode?: string;
  confidence: number;
  requiresHumanReview: true;
}

export async function analyzeEngagementIntelligence(
  engagementId: string,
  organizationId: string,
): Promise<AuditIntelligenceFinding[]> {
  const { resolveFirmMemoryOrganizationId } = await import(
    "@/lib/tb-intelligence/org-resolver"
  );
  const resolvedOrgId =
    (await resolveFirmMemoryOrganizationId(organizationId)) ?? organizationId;

  const findings: AuditIntelligenceFinding[] = [];

  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId },
    include: { canonicalAccount: true },
  });

  const unmapped = mappings.filter((m) => !m.canonicalAccountId);
  if (unmapped.length > 0) {
    findings.push({
      type: "missing_evidence",
      severity: unmapped.length > 5 ? "high" : "medium",
      title: "Unmapped accounts",
      description: `${unmapped.length} accounts lack canonical mapping — review before FS publication.`,
      confidence: 1,
      requiresHumanReview: true,
    });
  }

  for (const mapping of mappings) {
    const amount = Math.abs(mapping.debitAmount - mapping.creditAmount);
    if (amount > 1_000_000) {
      findings.push({
        type: "material_change",
        severity: "high",
        title: "Material balance",
        description: `Account ${mapping.sourceAccountCode} (${mapping.sourceAccountName}) exceeds materiality threshold.`,
        accountCode: mapping.sourceAccountCode,
        confidence: 0.85,
        requiresHumanReview: true,
      });
    }

    if (mapping.confidence != null && mapping.confidence < 0.7) {
      findings.push({
        type: "risk_indicator",
        severity: "medium",
        title: "Low mapping confidence",
        description: `Mapping for ${mapping.sourceAccountCode} has confidence ${Math.round(mapping.confidence * 100)}%.`,
        accountCode: mapping.sourceAccountCode,
        confidence: mapping.confidence,
        requiresHumanReview: true,
      });
    }
  }

  const lowConfidenceHistory = await prisma.tBClassificationHistory.count({
    where: {
      organizationId: resolvedOrgId,
      engagementId,
      confidence: { lt: 0.7 },
    },
  });

  if (lowConfidenceHistory > 0) {
    findings.push({
      type: "variance",
      severity: "medium",
      title: "Classification quality variance",
      description: `${lowConfidenceHistory} accounts classified with confidence below 70%.`,
      confidence: 0.8,
      requiresHumanReview: true,
    });
  }

  return findings;
}
