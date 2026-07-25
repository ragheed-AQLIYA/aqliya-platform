import { prisma, logAdvisor, ok, fail, type AdvisorResult, WORKBOOK_TEMPLATE } from "../common";
import type { TbLine } from "../common";
import { runGroundedLocalContentAI } from "../../rag-integration";
import { reasonedFallback, type PatternSuggestion } from "./common";

export async function suggestPatternImprovements(
  organizationId: string,
  workbookId: string,
  tbLines: TbLine[],
): Promise<AdvisorResult<PatternSuggestion[]>> {
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

    const suggestions: PatternSuggestion[] = [];

    for (const tmpl of WORKBOOK_TEMPLATE.lines) {
      if (!tmpl.autoFillable || !tmpl.tbAccountPatterns) continue;

      const matchedAccounts: TbLine[] = [];
      const unmatchedAccounts: TbLine[] = [];

      for (const tb of tbLines) {
        let matched = false;
        for (const pattern of tmpl.tbAccountPatterns) {
          try {
            const regex = new RegExp(pattern, "iu");
            if (regex.test(tb.accountName) || regex.test(tb.accountCode)) {
              matched = true;
              break;
            }
          } catch {
            continue;
          }
        }

        const codeInRange = !tmpl.accountCodeRanges ||
          tmpl.accountCodeRanges.length === 0 ||
          tmpl.accountCodeRanges.some((r) => tb.accountCode.startsWith(r.prefix));

        if (matched && codeInRange) {
          matchedAccounts.push(tb);
        } else if (tmpl.autoFillable && !matched) {
          if (codeInRange) {
            unmatchedAccounts.push(tb);
          }
        }
      }

      const existingFPs = await prisma.lcMatchReview.findMany({
        take: 100,
        where: {
          organizationId,
          workbookLineCode: tmpl.code,
          isFalsePositive: true,
          status: "confirmed",
        },
      });

      if (existingFPs.length > 0 || unmatchedAccounts.length > 0) {
        const fpAccountCodes = existingFPs.map((fp) => fp.accountCode);

        let suggestedPattern = "";
        let reasoning = "";

        if (existingFPs.length > 0 || unmatchedAccounts.length >= 2) {
          const groundedResult = await runGroundedLocalContentAI({
            organizationId,
            workbookId,
            industry: undefined,
            useCase: "pattern_improvement",
            prompt: `Improve pattern for ${tmpl.code} (${tmpl.name}).
Current patterns: ${tmpl.tbAccountPatterns?.join(", ")}
False positive accounts: ${fpAccountCodes.join(", ") || "none"}
Unmatched account names: ${unmatchedAccounts.slice(0, 10).map((a) => a.accountName).join(", ") || "none"}

Suggest improved regex patterns that reduce false positives while maintaining true matches.`,
            userId: "system",
          }).catch(() => null);

          const governedResult = groundedResult?.result ?? null;

          const aiOutput = governedResult?.output ?? "";
          const isValidPattern = aiOutput.length > 20
            && !/how can i assist|hello|i'm here to|you like me to/i.test(aiOutput)
            && /[*.()+|?^$[\]{}]/.test(aiOutput);

          if (isValidPattern) {
            suggestedPattern = aiOutput;
            reasoning = "AI-suggested improvement based on FP analysis and unmatched accounts";
          } else {
            const fallback = reasonedFallback(
              tmpl,
              existingFPs,
              unmatchedAccounts,
              fpAccountCodes,
            );
            suggestedPattern = fallback.suggestedPattern;
            reasoning = fallback.reasoning;
          }
        }

        suggestions.push({
          workbookLineCode: tmpl.code,
          currentPattern: tmpl.tbAccountPatterns.join("|"),
          suggestedPattern: suggestedPattern || tmpl.tbAccountPatterns.join("|"),
          reasoning: reasoning || "No significant pattern change needed",
          falsePositiveAccounts: fpAccountCodes,
          unmatchedAccounts: unmatchedAccounts.map((a) => `${a.accountCode}:${a.accountName}`),
          confidence: existingFPs.length > 0 ? Math.max(30, 100 - existingFPs.length * 15) : 50,
        });
      }
    }

    if (suggestions.length > 0) {
      await prisma.lcPatternSuggestion.createMany({
        data: suggestions.map((suggestion) => ({
          organizationId,
          workbookLineCode: suggestion.workbookLineCode,
          currentPattern: suggestion.currentPattern,
          suggestedPattern: suggestion.suggestedPattern,
          reasoning: suggestion.reasoning,
          falsePositiveAccounts: suggestion.falsePositiveAccounts,
          unmatchedAccounts: suggestion.unmatchedAccounts,
          confidence: suggestion.confidence,
          status: "pending",
          source: "ai",
        })),
      });
    }

    logAdvisor("pattern_suggestions_created", {
      organizationId,
      workbookId,
      suggestionCount: suggestions.length,
    });

    return ok(suggestions);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("pattern_suggestions_failed", { organizationId, workbookId, error: message });
    return fail(message);
  }
}
