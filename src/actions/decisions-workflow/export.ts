"use server";

import {
  prisma,
  getCurrentUser,
  enforce,
  lookupDecisionOrg,
  handleError,
  logAudit,
  ok,
  fail
} from "./common";
import { getDecisionAuditLogs } from "@/lib/decision/decision-audit";

export async function exportDecisionReport(decisionId: string) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await lookupDecisionOrg(decisionId);
    if (!decisionLookup) return fail("Decision not found");
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update");
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "export");
    const decision = (await prisma.decision.findUnique({
      where: { id: decisionId },
      include: {
        owner: true,
        organization: true,
        tenderProfile: true,
        scenarios: {
          include: { simulation: true },
        },
        recommendation: true,
      },
    })) as unknown as {
      id: string;
      title: string;
      status: string;
      organizationId: string;
      owner: { name: string | null } | null;
      organization: { name: string | null } | null;
      createdAt: Date;
      tenderProfile: {
        clientName: string;
        estimatedContractValue: number;
        estimatedCost: number;
        durationMonths: number;
        marginEstimate: number;
        riskLevel: string;
        requiredCapacity: number;
        internalAvailableCapacity: number;
        strategicFitScore: number;
      } | null;
      recommendation: {
        type: string;
        confidenceScore: number | null;
        reasoning: string | null;
        conditions: string | null;
        riskNotes: string | null;
      } | null;
      scenarios: {
        type: string;
        simulation: {
          feasibilityScore: number;
          financialScore: number;
          capacityScore: number;
          riskScore: number;
          strategicFitScore: number;
          overallDecisionScore: number;
        } | null;
      }[];
    };

    if (!decision) {
      return fail("Decision not found");
    }

    const auditLogRows = await getDecisionAuditLogs(decisionId, { orderBy: "desc" });

    const { buildDecisionReportPDF } = await import("@/lib/decision/decision-export-pdf");

    const pdfResult = await buildDecisionReportPDF({
      decisionId,
      title: decision.title,
      status: decision.status,
      ownerName: decision.owner?.name ?? null,
      organizationName: decision.organization?.name ?? null,
      createdAt: decision.createdAt,
      recommendation: decision.recommendation
        ? {
            type: decision.recommendation.type,
            confidenceScore: decision.recommendation.confidenceScore,
            reasoning: decision.recommendation.reasoning,
            conditions: decision.recommendation.conditions,
            riskNotes: decision.recommendation.riskNotes,
          }
        : null,
      tenderProfile: decision.tenderProfile
        ? {
            clientName: decision.tenderProfile.clientName,
            estimatedContractValue: decision.tenderProfile.estimatedContractValue,
            estimatedCost: decision.tenderProfile.estimatedCost,
            durationMonths: decision.tenderProfile.durationMonths,
            marginEstimate: decision.tenderProfile.marginEstimate,
            riskLevel: String(decision.tenderProfile.riskLevel),
            requiredCapacity: String(decision.tenderProfile.requiredCapacity),
            internalAvailableCapacity: String(decision.tenderProfile.internalAvailableCapacity),
            strategicFitScore: decision.tenderProfile.strategicFitScore,
          }
        : null,
      scenarios: decision.scenarios.map((s) => ({
        type: s.type,
        feasibilityScore: s.simulation?.feasibilityScore ?? null,
        financialScore: s.simulation?.financialScore ?? null,
        capacityScore: s.simulation?.capacityScore ?? null,
        riskScore: s.simulation?.riskScore ?? null,
        strategicFitScore: s.simulation?.strategicFitScore ?? null,
        overallDecisionScore: s.simulation?.overallDecisionScore ?? null,
      })),
      auditLogs: auditLogRows.map((log) => ({
        action: log.action,
        userName: log.user?.name ?? null,
        createdAt: log.createdAt,
      })),
      exportedAt: new Date(),
      exportedById: user.id,
    });

    await logAudit(
      user.id,
      decisionId,
      "OUTPUT_PUBLISHED",
      "DecisionReport",
      undefined,
      JSON.stringify({ format: "pdf", exportedAt: new Date().toISOString() }),
      user.organizationId,
    );

    return {
      success: true as const,
      content: pdfResult.content.toString("base64"),
      mimeType: pdfResult.mimeType,
      filename: pdfResult.filename,
    };
  } catch (error) {
    return handleError(error, "exporting decision report");
  }
}
