/**
 * LocalContentOS AI Advisor — P0 Account Explanation Engine
 * Generates human-readable explanations for each matched account in a workbook.
 */

import { prisma } from "./common";
import { logAdvisor, ok, fail, type AdvisorResult, describeMatchPattern, calculateMatchRisk } from "./common";
import { getTemplateLineByCode } from "./common";
import type { WorkbookTemplateLine, TbLine } from "./common";
import { isAccountInCodeRange } from "../population";

// ─── Types ───

export interface AccountMatchExplanation {
  workbookLineCode: string;
  workbookLineName: string;
  accountCode: string;
  accountName: string;
  matchedPattern: string;
  confidence: number;
  riskLevel: string;
  riskReason: string;
  evidence: {
    codeRangeMatch: boolean;
    patternMatch: boolean;
    formulaDerived: boolean;
    manualEntry: boolean;
  };
}

/**
 * Generate human-readable explanations for each matched account in a workbook.
 * P0 — AI-assisted, always shows evidence for auditability.
 */
export async function explainAccountMatches(
  organizationId: string,
  workbookId: string,
  tbLines: TbLine[],
): Promise<AdvisorResult<AccountMatchExplanation[]>> {
  if (!organizationId || !workbookId || !tbLines.length) {
    return fail("Organization ID, workbook ID, and TB lines are required");
  }

  try {
    const workbook = await prisma.lcWorkbook.findFirst({
      where: { id: workbookId, project: { organizationId } },
      include: { lines: { orderBy: { displayOrder: "asc" } } },
    });

    if (!workbook) {
      return fail("Workbook not found");
    }

    const explanations: AccountMatchExplanation[] = [];

    // Collect all (lineCode, accountCode) pairs for batch queries
    const allPairs: { lineCode: string; lineName: string; lineId: string; source: string; accountCode: string; accountName: string; tmpl: NonNullable<ReturnType<typeof getTemplateLineByCode>> }[] = [];

    for (const line of workbook.lines) {
      if (!line.autoFillable) continue;
      const tmpl = getTemplateLineByCode(line.code);
      if (!tmpl || !tmpl.tbAccountPatterns) continue;

      const matchedTbLines = tbLines.filter((tb) => {
        for (const pattern of tmpl.tbAccountPatterns!) {
          try {
            const regex = new RegExp(pattern, "iu");
            if (regex.test(tb.accountName) || regex.test(tb.accountCode)) {
              if (isAccountInCodeRange(tb.accountCode, tmpl.accountCodeRanges)) return true;
            }
          } catch { continue; }
        }
        return false;
      });

      for (const tb of matchedTbLines) {
        allPairs.push({ lineCode: line.code, lineName: line.name, lineId: line.id, source: line.source ?? "manual", accountCode: tb.accountCode, accountName: tb.accountName, tmpl });
      }
    }

    if (allPairs.length > 0) {
      const lineCodes = [...new Set(allPairs.map((p) => p.lineCode))];
      const accountCodes = [...new Set(allPairs.map((p) => p.accountCode))];

      const [existingReviews, orgMemories] = await Promise.all([
        prisma.lcMatchReview.findMany({
          take: 100,
          where: {
            organizationId,
            workbookLineCode: { in: lineCodes },
            accountCode: { in: accountCodes },
          },
        }),
        prisma.lcOrganizationMatchMemory.findMany({
          take: 100,
          where: {
            organizationId,
            workbookLineCode: { in: lineCodes },
            accountCode: { in: accountCodes },
          },
        }),
      ]);

      const reviewMap = new Map(existingReviews.map((r) => [`${r.workbookLineCode}:${r.accountCode}`, r]));
      const memoryMap = new Map(orgMemories.map((m) => [`${m.workbookLineCode}:${m.accountCode}`, m]));

      const newReviews: Promise<unknown>[] = [];

      for (const pair of allPairs) {
        const reviewKey = `${pair.lineCode}:${pair.accountCode}`;
        const existingReview = reviewMap.get(reviewKey);
        const patternInfo = describeMatchPattern(pair.accountName, pair.accountCode, pair.tmpl);
        const risk = calculateMatchRisk(pair.accountName, pair.accountCode, pair.tmpl, patternInfo?.matchedPattern ?? null);

        if (existingReview) {
          explanations.push({
            workbookLineCode: pair.lineCode,
            workbookLineName: pair.lineName,
            accountCode: pair.accountCode,
            accountName: pair.accountName,
            matchedPattern: existingReview.patternUsed ?? patternInfo?.matchedPattern ?? "unknown",
            confidence: existingReview.confidence,
            riskLevel: existingReview.riskLevel,
            riskReason: existingReview.riskReason ?? risk.riskReason,
            evidence: {
              codeRangeMatch: !!pair.tmpl.accountCodeRanges?.length,
              patternMatch: !!patternInfo,
              formulaDerived: pair.source === "formula",
              manualEntry: pair.source === "manual",
            },
          });
          continue;
        }

        const orgMemory = memoryMap.get(reviewKey);
        const finalConfidence = orgMemory?.previousResult === "matched"
          ? Math.min(100, patternInfo?.confidence ?? 70 + 15)
          : orgMemory?.previousResult === "overridden"
            ? Math.max(20, (patternInfo?.confidence ?? 70) - 30)
            : patternInfo?.confidence ?? 70;

        const explanation: AccountMatchExplanation = {
          workbookLineCode: pair.lineCode,
          workbookLineName: pair.lineName,
          accountCode: pair.accountCode,
          accountName: pair.accountName,
          matchedPattern: patternInfo?.matchedPattern ?? "unknown",
          confidence: finalConfidence,
          riskLevel: risk.riskLevel,
          riskReason: risk.riskReason,
          evidence: {
            codeRangeMatch: !!pair.tmpl.accountCodeRanges?.length,
            patternMatch: !!patternInfo,
            formulaDerived: pair.source === "formula",
            manualEntry: pair.source === "manual",
          },
        };

        newReviews.push(prisma.lcMatchReview.create({
          data: {
            organizationId,
            workbookLineId: pair.lineId,
            workbookLineCode: pair.lineCode,
            accountCode: pair.accountCode,
            accountName: pair.accountName,
            patternUsed: patternInfo?.matchedPattern ?? null,
            matchType: pair.source === "formula" ? "formula" : "code_range",
            confidence: finalConfidence,
            riskLevel: risk.riskLevel,
            riskReason: risk.riskReason,
            evidence: JSON.parse(JSON.stringify(explanation.evidence)),
            isFalsePositive: risk.riskLevel === "high",
            status: "pending",
          },
        }));

        explanations.push(explanation);
      }

      if (newReviews.length > 0) {
        await Promise.all(newReviews);
      }
    }

    logAdvisor("account_explanations_created", {
      organizationId,
      workbookId,
      explanationCount: explanations.length,
    });

    return ok(explanations);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("account_explanations_failed", { organizationId, workbookId, error: message });
    return fail(message);
  }
}
