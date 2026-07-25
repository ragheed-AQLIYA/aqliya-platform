/**
 * LocalContentOS AI Advisor — P1 Match Confidence Calibration
 * Calibrates confidence levels using industry benchmarks, organization history,
 * and pattern analysis.
 */

import { prisma } from "./common";
import { logAdvisor, ok, fail, type AdvisorResult } from "./common";
import { getTemplateLineByCode } from "./common";

// ─── Types ───

export interface CalibratedMatch {
  lineId: string;
  lineCode: string;
  lineName: string;
  accountCode: string | null;
  currentConfidence: string;
  calibratedConfidence: string;
  calibratedScore: number;
  factors: {
    industryEffectiveness: number | null;
    organizationHistory: "positive" | "negative" | "neutral";
    patternSpecificity: number;
    riskLevel: string;
  };
}

/**
 * Calibrate confidence levels across all lines in a workbook
 * using industry benchmarks, organization history, and pattern analysis.
 * P1 — Runs as a post-population step for more accurate confidence reporting.
 */
export async function calibrateWorkbookConfidence(
  organizationId: string,
  workbookId: string,
): Promise<AdvisorResult<CalibratedMatch[]>> {
  if (!organizationId || !workbookId) {
    return fail("Organization ID and workbook ID are required");
  }

  try {
    const workbook = await prisma.lcWorkbook.findFirst({
      where: { id: workbookId, project: { organizationId } },
      include: { lines: { orderBy: { displayOrder: "asc" } } },
    });

    if (!workbook) {
      return fail("Workbook not found");
    }

    // Get organization's industry
    const project = await prisma.localContentProject.findFirst({
      where: { organizationId },
      select: { metadata: true },
      orderBy: { updatedAt: "desc" },
    });
    const industry = (project?.metadata as { industry?: string } | null)?.industry ?? "general";

    const calibrated: CalibratedMatch[] = [];

    const linesToProcess = workbook.lines.filter((line) => line.autoFillable || line.autoFilled);

    // Collect all line codes and account codes for batch queries
    const allLineCodes = linesToProcess.map((l) => l.code);
    const allAccountCodes = linesToProcess
      .filter((l) => l.autoFillSource?.startsWith("tb:"))
      .map((l) => l.autoFillSource!.replace("tb:", ""));

    const uniqueAccountCodes = [...new Set(allAccountCodes)];

    // Pre-fetch all supporting data in parallel
    const [industryRecords, orgMemories, matchReviews] = await Promise.all([
      allLineCodes.length > 0
        ? prisma.lcIndustryPatternMemory.findMany({
            take: 100,
            where: { industry, workbookLineCode: { in: allLineCodes } },
          })
        : Promise.resolve([]),
      uniqueAccountCodes.length > 0
        ? prisma.lcOrganizationMatchMemory.findMany({
            take: 100,
            where: {
              organizationId,
              workbookLineCode: { in: allLineCodes },
              accountCode: { in: uniqueAccountCodes },
            },
          })
        : Promise.resolve([]),
      prisma.lcMatchReview.findMany({
        take: 100,
        where: {
          organizationId,
          workbookLineId: { in: linesToProcess.map((l) => l.id) },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const industryMap = new Map(industryRecords.map((r) => [`${r.workbookLineCode}:${r.pattern}`, r]));
    const memoryMap = new Map(orgMemories.map((m) => [`${m.workbookLineCode}:${m.accountCode}`, m]));
    const reviewMap = new Map<string, typeof matchReviews[0]>();
    for (const r of matchReviews) {
      const key = r.workbookLineId;
      if (key && !reviewMap.has(key)) reviewMap.set(key, r);
    }

    const linesToUpdate: { id: string; confidence: string }[] = [];

    for (const line of linesToProcess) {
      const tmpl = getTemplateLineByCode(line.code);

      // Factor 1: Industry pattern effectiveness
      let industryEffectiveness: number | null = null;
      if (tmpl?.tbAccountPatterns && tmpl.tbAccountPatterns.length > 0) {
        const patternKey = tmpl.tbAccountPatterns.join("|");
        const industryRecord = industryMap.get(`${line.code}:${patternKey}`);
        industryEffectiveness = industryRecord?.effectivenessPct ?? null;
      }

      // Factor 2: Organization memory
      let orgMemoryType: "positive" | "negative" | "neutral" = "neutral";
      if (line.autoFillSource?.startsWith("tb:")) {
        const accountCode = line.autoFillSource.replace("tb:", "");
        const orgMemory = memoryMap.get(`${line.code}:${accountCode}`);
        if (orgMemory) {
          orgMemoryType = orgMemory.previousResult === "matched" ? "positive"
            : orgMemory.previousResult === "overridden" ? "negative" : "neutral";
        }
      }

      // Factor 3: Pattern specificity
      const patternSpecificity = tmpl?.tbAccountPatterns
        ? Math.min(100, tmpl.tbAccountPatterns.reduce((max, p) => Math.max(max, p.length), 0) * 2)
        : 0;

      // Factor 4: Risk from match reviews
      const matchReview = reviewMap.get(line.id);

      // Compute calibrated score (0-100)
      let score = line.confidence === "high" ? 85 : line.confidence === "medium" ? 55 : 25;

      if (industryEffectiveness !== null) {
        score = score * 0.4 + industryEffectiveness * 0.3;
      }
      if (orgMemoryType === "positive") score += 10;
      if (orgMemoryType === "negative") score -= 20;
      score += patternSpecificity * 0.1;
      if (matchReview?.riskLevel === "high") score -= 25;
      if (matchReview?.riskLevel === "medium") score -= 10;

      score = Math.max(0, Math.min(100, Math.round(score)));

      const calibratedConfidence = score >= 70 ? "high" : score >= 40 ? "medium" : "low";

      calibrated.push({
        lineId: line.id,
        lineCode: line.code,
        lineName: line.name,
        accountCode: line.autoFillSource?.startsWith("tb:")
          ? line.autoFillSource.replace("tb:", "")
          : null,
        currentConfidence: line.confidence,
        calibratedConfidence,
        calibratedScore: score,
        factors: {
          industryEffectiveness,
          organizationHistory: orgMemoryType,
          patternSpecificity,
          riskLevel: matchReview?.riskLevel ?? "low",
        },
      });

      if (calibratedConfidence !== line.confidence) {
        linesToUpdate.push({ id: line.id, confidence: calibratedConfidence });
      }
    }

    if (linesToUpdate.length > 0) {
      await Promise.all(
        linesToUpdate.map((u) =>
          prisma.lcWorkbookLine.update({
            where: { id: u.id },
            data: { confidence: u.confidence as "high" | "medium" | "low" },
          }),
        ),
      );
    }

    logAdvisor("confidence_calibration_complete", {
      organizationId,
      workbookId,
      calibratedCount: calibrated.length,
    });

    return ok(calibrated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("confidence_calibration_failed", { organizationId, workbookId, error: message });
    return fail(message);
  }
}
