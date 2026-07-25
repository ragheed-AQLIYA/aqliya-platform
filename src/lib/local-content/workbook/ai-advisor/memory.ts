/**
 * LocalContentOS AI Advisor — P1 Industry Memory & Organization Memory
 * Tracks pattern effectiveness across industries and organizations.
 */

import { prisma } from "./common";
import { logAdvisor, ok, fail, type AdvisorResult } from "./common";

// ─── Industry Memory ───

/**
 * Update industry pattern memory based on a match or FP outcome.
 * P1 — Used to improve pattern effectiveness benchmarks over time.
 */
export async function updateIndustryPatternMemory(
  organizationId: string,
  workbookLineCode: string,
  pattern: string,
  isCorrect: boolean,
): Promise<void> {
  try {
    // Get the organization's industry from its project
    const project = await prisma.localContentProject.findFirst({
      where: { organizationId },
      select: {
        metadata: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const industry = (project?.metadata as { industry?: string } | null)?.industry ?? "general";

    await prisma.lcIndustryPatternMemory.upsert({
      where: {
        industry_workbookLineCode_pattern: {
          industry,
          workbookLineCode,
          pattern,
        },
      },
      update: {
        totalMatches: { increment: 1 },
        correctMatches: isCorrect ? { increment: 1 } : undefined,
        falsePositives: isCorrect ? undefined : { increment: 1 },
        effectivenessPct: undefined, // recomputed below
      },
      create: {
        industry,
        workbookLineCode,
        pattern,
        totalMatches: 1,
        correctMatches: isCorrect ? 1 : 0,
        falsePositives: isCorrect ? 0 : 1,
        effectivenessPct: isCorrect ? 100 : 0,
      },
    });

    // Recompute effectivenessPct
    const record = await prisma.lcIndustryPatternMemory.findUnique({
      where: {
        industry_workbookLineCode_pattern: {
          industry,
          workbookLineCode,
          pattern,
        },
      },
    });

    if (record && record.totalMatches > 0) {
      const pct = Math.round((record.correctMatches / record.totalMatches) * 100);
      await prisma.lcIndustryPatternMemory.update({
        where: { id: record.id },
        data: { effectivenessPct: pct },
      });
    }
  } catch (error) {
    logAdvisor("industry_memory_update_failed", {
      organizationId,
      workbookLineCode,
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
}

/**
 * Get industry pattern effectiveness benchmarks.
 * P1 — Used by the dashboard to show pattern quality.
 */
export async function getIndustryPatternBenchmarks(
  industry?: string,
): Promise<AdvisorResult<Array<{
  industry: string;
  workbookLineCode: string;
  totalMatches: number;
  correctMatches: number;
  falsePositives: number;
  effectivenessPct: number;
}>>> {
  try {
    const where = industry ? { industry } : {};
    const records = await prisma.lcIndustryPatternMemory.findMany({
      where,
      orderBy: [{ effectivenessPct: "asc" }, { totalMatches: "desc" }],
      take: 50,
    });

    return ok(records);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message);
  }
}

// ─── Organization Memory ───

/**
 * Get organization match history for decision consistency.
 * P1 — Helps ensure consistent matching across workbook runs.
 */
export async function getOrganizationMatchMemory(
  organizationId: string,
  workbookLineCode?: string,
): Promise<AdvisorResult<Array<{
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  previousResult: string;
  manualOverride: boolean;
  overrideReason: string | null;
}>>> {
  if (!organizationId) {
    return fail("Organization ID is required");
  }

  try {
    const where: Record<string, unknown> = { organizationId };
    if (workbookLineCode) {
      where.workbookLineCode = workbookLineCode;
    }

    const records = await prisma.lcOrganizationMatchMemory.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: 100,
    });

    return ok(
      records.map((r) => ({
        workbookLineCode: r.workbookLineCode,
        accountCode: r.accountCode,
        accountName: r.accountName,
        previousResult: r.previousResult,
        manualOverride: r.manualOverride,
        overrideReason: r.overrideReason,
      })),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(message);
  }
}
