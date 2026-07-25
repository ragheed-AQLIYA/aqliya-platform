/**
 * LocalContentOS AI Advisor — shared infrastructure
 *
 * Shared types, logging, and pattern-matching helpers used by all
 * AI advisor domain modules.
 */

import "server-only";

import { prisma } from "@/lib/prisma";
import { WORKBOOK_TEMPLATE, getTemplateLineByCode } from "../template";
import type { WorkbookTemplateLine, TbLine } from "../types";
import { updatePatternLearningMetrics, recordPatternOutcome } from "../learning-loop";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "AIAdvisor" });

export function logAdvisor(event: string, payload: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "test") return;
  logger.info(event, { product: "localcontentos", action: event, ...payload });
}

// ─── Shared types ───

/** Wrapper type for AI advisor results */
export interface AdvisorResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  reviewRequired: boolean;
}

export function ok<T>(data: T): AdvisorResult<T> {
  return { success: true, data, reviewRequired: true };
}

export function fail(error: string): AdvisorResult<never> {
  return { success: false, error, reviewRequired: true };
}

// ─── Pattern-matching helpers ───

/** Describe which pattern from the template matched a given account */
export function describeMatchPattern(
  accountName: string,
  accountCode: string,
  line: WorkbookTemplateLine,
): { matchedPattern: string; confidence: number } | null {
  if (!line.tbAccountPatterns) return null;

  for (const pattern of line.tbAccountPatterns) {
    try {
      const regex = new RegExp(pattern, "iu");
      if (regex.test(accountName) || regex.test(accountCode)) {
        return { matchedPattern: pattern, confidence: Math.min(100, pattern.length * 5) };
      }
    } catch {
      continue;
    }
  }
  return null;
}

/** Calculate a risk score for a match */
export function calculateMatchRisk(
  accountName: string,
  accountCode: string,
  line: WorkbookTemplateLine,
  matchedPattern: string | null,
): { riskLevel: "low" | "medium" | "high"; riskReason: string } {
  const genericIndicators = [
    "متنوع", "general", "other", "أخرى", "متفرقة",
    "miscellaneous", "sundry", "different",
  ];
  const lowerName = accountName.toLowerCase();

  for (const indicator of genericIndicators) {
    if (lowerName.includes(indicator)) {
      return { riskLevel: "high", riskReason: `Generic account name matches too broadly (contains "${indicator}")` };
    }
  }

  if (matchedPattern && matchedPattern.length < 15) {
    return { riskLevel: "high", riskReason: `Pattern too short (${matchedPattern.length} chars), likely over-matches` };
  }

  if (!line.accountCodeRanges || line.accountCodeRanges.length === 0) {
    return { riskLevel: "medium", riskReason: "No account code range filter — pattern-only match" };
  }

  if (line.accountCodeRanges) {
    const inRange = line.accountCodeRanges.some((r) => accountCode.startsWith(r.prefix));
    if (!inRange) {
      return { riskLevel: "medium", riskReason: `Account code ${accountCode} outside expected range prefixes` };
    }
  }

  return { riskLevel: "low", riskReason: "Match within expected code range and with sufficient pattern specificity" };
}

// Re-export prisma for domain modules
export { prisma };

// Re-export template helpers
export { WORKBOOK_TEMPLATE, getTemplateLineByCode };
export type { WorkbookTemplateLine, TbLine };

// Re-export learning loop
export { updatePatternLearningMetrics, recordPatternOutcome };
