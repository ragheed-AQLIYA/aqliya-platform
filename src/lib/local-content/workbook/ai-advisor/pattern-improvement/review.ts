import { prisma, logAdvisor, ok, fail, type AdvisorResult, updatePatternLearningMetrics } from "../common";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "platform", action: "lib-local-content-workbook-ai-advisor-pattern-improvement-re" });

export async function listPendingPatternSuggestions(
  organizationId: string,
): Promise<AdvisorResult<Array<{
  id: string;
  workbookLineCode: string;
  currentPattern: string;
  suggestedPattern: string;
  reasoning: string;
  confidence: number;
  status: string;
}>>> {
  if (!organizationId) {
    return fail("Organization ID is required");
  }

  try {
    const suggestions = await prisma.lcPatternSuggestion.findMany({
      where: { organizationId, status: "pending" },
      orderBy: [{ confidence: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    return ok(
      suggestions.map((s) => ({
        id: s.id,
        workbookLineCode: s.workbookLineCode,
        currentPattern: s.currentPattern,
        suggestedPattern: s.suggestedPattern,
        reasoning: s.reasoning ?? "",
        confidence: s.confidence,
        status: s.status,
      })),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message);
  }
}

export async function reviewPatternSuggestion(
  organizationId: string,
  suggestionId: string,
  decision: "approved" | "rejected",
  reviewNotes: string,
  reviewerId: string,
): Promise<AdvisorResult<unknown>> {
  if (!organizationId || !suggestionId || !decision || !reviewerId) {
    return fail("Organization ID, suggestion ID, decision, and reviewer ID are required");
  }

  try {
    const suggestion = await prisma.lcPatternSuggestion.findFirst({
      where: { id: suggestionId, organizationId },
    });

    if (!suggestion) {
      return fail("Pattern suggestion not found");
    }

    if (suggestion.status !== "pending") {
      return fail(`Suggestion already ${suggestion.status}`);
    }

    const updated = await prisma.lcPatternSuggestion.update({
      where: { id: suggestionId },
      data: {
        status: decision,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    await updatePatternLearningMetrics(suggestionId, decision).catch((err) => {
      logger.warn("[LocalContentOS AI Advisor] Failed to update learning metrics:", { error: err instanceof Error ? err.message : err, });
    });

    if (decision === "rejected" && suggestion.organizationId && suggestion.workbookLineCode) {
      await prisma.lcOrganizationMatchMemory.upsert({
        where: {
          organizationId_workbookLineCode_accountCode: {
            organizationId: suggestion.organizationId,
            workbookLineCode: suggestion.workbookLineCode,
            accountCode: `pattern_${suggestion.workbookLineCode}`,
          },
        },
        update: {
          previousResult: "rejected",
          manualOverride: true,
          overrideReason: reviewNotes || "Rejected by reviewer",
          updatedAt: new Date(),
        },
        create: {
          organizationId: suggestion.organizationId,
          workbookLineCode: suggestion.workbookLineCode,
          accountCode: `pattern_${suggestion.workbookLineCode}`,
          accountName: `Pattern: ${suggestion.workbookLineCode}`,
          previousResult: "rejected",
          manualOverride: true,
          overrideReason: reviewNotes || "Rejected by reviewer",
        },
      }).catch(() => {});
    }

    logAdvisor("pattern_suggestion_reviewed", {
      suggestionId,
      decision,
      reviewerId,
    });

    return ok(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("pattern_suggestion_review_failed", { suggestionId, error: message });
    return fail(message);
  }
}
