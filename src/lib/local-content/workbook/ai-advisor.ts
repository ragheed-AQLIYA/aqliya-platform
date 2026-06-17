// ─── LocalContentOS Workbook — AI Advisor V2 ───
// AI-assisted pattern improvement, account explanation, false positive review,
// industry/organization memory, and confidence calibration.
// Additive layer on top of the deterministic pattern-matching engine.
// Every AI output is a *suggestion* requiring human review — never autonomous.

import "server-only";

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge";
import { runGroundedLocalContentAI } from "./rag-integration";
import { WORKBOOK_TEMPLATE, getTemplateLineByCode } from "./template";
import type { WorkbookTemplateLine, TbLine } from "./types";

import { updatePatternLearningMetrics, recordPatternOutcome } from "./learning-loop";

// ─── Logging ───

const LOG_PREFIX = "[LocalContentOS AI Advisor]";

function logAdvisor(event: string, payload: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "test") return;
  console.info(LOG_PREFIX, event, { productId: "localcontentos", ...payload });
}

// ─── Shared helpers ───

/** Wrapper type for AI advisor results */
export interface AdvisorResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  reviewRequired: boolean;
}

function ok<T>(data: T): AdvisorResult<T> {
  return { success: true, data, reviewRequired: true };
}

function fail(error: string): AdvisorResult<never> {
  return { success: false, error, reviewRequired: true };
}

/** Describe which pattern from the template matched a given account */
function describeMatchPattern(
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
function calculateMatchRisk(
  accountName: string,
  accountCode: string,
  line: WorkbookTemplateLine,
  matchedPattern: string | null,
): { riskLevel: "low" | "medium" | "high"; riskReason: string } {
  // High risk: generic account names that match too broadly
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

  // High risk: weak pattern specificity
  if (matchedPattern && matchedPattern.length < 15) {
    return { riskLevel: "high", riskReason: `Pattern too short (${matchedPattern.length} chars), likely over-matches` };
  }

  // Medium risk: no code range filter, pattern only
  if (!line.accountCodeRanges || line.accountCodeRanges.length === 0) {
    return { riskLevel: "medium", riskReason: "No account code range filter — pattern-only match" };
  }

  // Medium risk: account code falls outside expected ranges
  if (line.accountCodeRanges) {
    const inRange = line.accountCodeRanges.some((r) => accountCode.startsWith(r.prefix));
    if (!inRange) {
      return { riskLevel: "medium", riskReason: `Account code ${accountCode} outside expected range prefixes` };
    }
  }

  return { riskLevel: "low", riskReason: "Match within expected code range and with sufficient pattern specificity" };
}

// ══════════════════════════════════════════════════════
// P0 — Pattern Learning Assistant
// ══════════════════════════════════════════════════════

export interface PatternSuggestion {
  workbookLineCode: string;
  currentPattern: string;
  suggestedPattern: string;
  reasoning: string;
  falsePositiveAccounts: string[];
  unmatchedAccounts: string[];
  confidence: number;
}

/**
 * Analyze a workbook's match results and suggest pattern improvements
 * for lines with false positives or missed matches.
 * P0 — AI-assisted, always requires human approval.
 */
export async function suggestPatternImprovements(
  organizationId: string,
  workbookId: string,
  tbLines: TbLine[],
): Promise<AdvisorResult<PatternSuggestion[]>> {
  if (!organizationId || !workbookId || !tbLines.length) {
    return fail("Organization ID, workbook ID, and TB lines are required");
  }

  try {
    const workbook = await prisma.lcWorkbook.findUnique({
      where: { id: workbookId },
      include: { lines: { orderBy: { displayOrder: "asc" } } },
    });

    if (!workbook) {
      return fail("Workbook not found");
    }

    const suggestions: PatternSuggestion[] = [];

    // For each auto-fillable template line, analyze patterns against actual TB data
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

        // Check code range filter too
        const codeInRange = !tmpl.accountCodeRanges ||
          tmpl.accountCodeRanges.length === 0 ||
          tmpl.accountCodeRanges.some((r) => tb.accountCode.startsWith(r.prefix));

        if (matched && codeInRange) {
          matchedAccounts.push(tb);
        } else if (tmpl.autoFillable && !matched) {
          // Only consider if it might be a miss — code in range but name didn't match
          if (codeInRange) {
            unmatchedAccounts.push(tb);
          }
        }
      }

      // Check if current patterns produce false positives from previous runs
      const existingFPs = await prisma.lcMatchReview.findMany({
        where: {
          organizationId,
          workbookLineCode: tmpl.code,
          isFalsePositive: true,
          status: "confirmed",
        },
      });

      // Suggest improvement if there are FPs or obvious misses
      if (existingFPs.length > 0 || unmatchedAccounts.length > 0) {
        const fpAccountCodes = existingFPs.map((fp) => fp.accountCode);

        // Use AI to suggest pattern improvement when there's significant signal
        let suggestedPattern = "";
        let reasoning = "";

        if (existingFPs.length > 0 || unmatchedAccounts.length >= 2) {
          // Use grounded AI with LocalContentContext for richer evidence-based suggestions
          const groundedResult = await runGroundedLocalContentAI({
            organizationId,
            workbookId,
            industry: undefined, // inferred from project
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
            && /[*.()+|?^$[\]{}]/.test(aiOutput); // contains regex-like syntax

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

    // Persist suggestions for human review
    if (suggestions.length > 0) {
      for (const suggestion of suggestions) {
        await prisma.lcPatternSuggestion.create({
          data: {
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
          },
        });
      }
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

// Helper for building pattern suggestions without AI
function reasonedFallback(
  tmpl: WorkbookTemplateLine,
  existingFPs: Array<{ accountCode: string }>,
  unmatchedAccounts: TbLine[],
  fpAccountCodes: string[],
): { suggestedPattern: string; reasoning: string } {
  const patterns = [...tmpl.tbAccountPatterns!];
  let reasoningParts: string[] = [];

  if (existingFPs.length > 0) {
    // Add exclusion patterns for confirmed FPs
    const exclusions = fpAccountCodes.map((code) => `(?!.*${code})`).join("");
    for (let i = 0; i < patterns.length; i++) {
      patterns[i] = `${exclusions}${patterns[i]}`;
    }
    reasoningParts.push(`Added ${existingFPs.length} exclusion pattern(s) for known false positive accounts`);
  }

  if (unmatchedAccounts.length >= 2) {
    // Add broader catch patterns for unmatched accounts
    const commonTerms = extractCommonTerms(unmatchedAccounts.map((a) => a.accountName));
    if (commonTerms.length > 0) {
      patterns.push(commonTerms.map((t) => `.*${t}.*`).join("|"));
      reasoningParts.push(`added ${commonTerms.length} broader pattern(s) based on unmatched account names`);
    }
  }

  return {
    suggestedPattern: patterns.join("|"),
    reasoning: reasoningParts.length > 0 ? reasoningParts.join("; ") : "No significant pattern change needed",
  };
}

/** Extract meaningful terms from account names for pattern suggestions */
function extractCommonTerms(names: string[]): string[] {
  const stopWords = new Set([
    "account", "حساب", "ال", "و", "ب", "ل", "في", "من", "على",
    "note", "ملاحظة", "statement", "كشف",
  ]);

  const termCounts = new Map<string, number>();

  for (const name of names) {
    const words = name.split(/[\s\-_/]+/);
    for (const word of words) {
      const clean = word.replace(/[^\w\u0600-\u06FF]/g, "").toLowerCase();
      if (clean.length > 2 && !stopWords.has(clean)) {
        termCounts.set(clean, (termCounts.get(clean) || 0) + 1);
      }
    }
  }

  return Array.from(termCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term);
}

// ══════════════════════════════════════════════════════
// P0 — Account Explanation Engine
// ══════════════════════════════════════════════════════

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
    const workbook = await prisma.lcWorkbook.findUnique({
      where: { id: workbookId },
      include: { lines: { orderBy: { displayOrder: "asc" } } },
    });

    if (!workbook) {
      return fail("Workbook not found");
    }

    const explanations: AccountMatchExplanation[] = [];

    for (const line of workbook.lines) {
      if (!line.autoFillable) continue;

      const tmpl = getTemplateLineByCode(line.code);
      if (!tmpl || !tmpl.tbAccountPatterns) continue;

      // Find which TB accounts matched this line
      const matchedTbLines = tbLines.filter((tb) => {
        for (const pattern of tmpl.tbAccountPatterns!) {
          try {
            const regex = new RegExp(pattern, "iu");
            if (regex.test(tb.accountName) || regex.test(tb.accountCode)) {
              // Check code range
              if (isAccountInCodeRange(tb.accountCode, tmpl.accountCodeRanges)) {
                return true;
              }
            }
          } catch {
            continue;
          }
        }
        return false;
      });

      for (const tb of matchedTbLines) {
        const patternInfo = describeMatchPattern(tb.accountName, tb.accountCode, tmpl);
        const risk = calculateMatchRisk(tb.accountName, tb.accountCode, tmpl, patternInfo?.matchedPattern ?? null);

        // Check if this was already reviewed
        const existingReview = await prisma.lcMatchReview.findFirst({
          where: {
            organizationId,
            workbookLineCode: line.code,
            accountCode: tb.accountCode,
          },
        });

        // Don't duplicate if already explained
        if (existingReview) {
          explanations.push({
            workbookLineCode: line.code,
            workbookLineName: line.name,
            accountCode: tb.accountCode,
            accountName: tb.accountName,
            matchedPattern: existingReview.patternUsed ?? patternInfo?.matchedPattern ?? "unknown",
            confidence: existingReview.confidence,
            riskLevel: existingReview.riskLevel,
            riskReason: existingReview.riskReason ?? risk.riskReason,
            evidence: {
              codeRangeMatch: !!tmpl.accountCodeRanges?.length,
              patternMatch: !!patternInfo,
              formulaDerived: line.source === "formula",
              manualEntry: line.source === "manual",
            },
          });
          continue;
        }

        // Check organization memory for previous decisions
        const orgMemory = await prisma.lcOrganizationMatchMemory.findFirst({
          where: {
            organizationId,
            workbookLineCode: line.code,
            accountCode: tb.accountCode,
          },
        });

        const finalConfidence = orgMemory?.previousResult === "matched"
          ? Math.min(100, patternInfo?.confidence ?? 70 + 15)
          : orgMemory?.previousResult === "overridden"
            ? Math.max(20, (patternInfo?.confidence ?? 70) - 30)
            : patternInfo?.confidence ?? 70;

        const explanation: AccountMatchExplanation = {
          workbookLineCode: line.code,
          workbookLineName: line.name,
          accountCode: tb.accountCode,
          accountName: tb.accountName,
          matchedPattern: patternInfo?.matchedPattern ?? "unknown",
          confidence: finalConfidence,
          riskLevel: risk.riskLevel,
          riskReason: risk.riskReason,
          evidence: {
            codeRangeMatch: !!tmpl.accountCodeRanges?.length,
            patternMatch: !!patternInfo,
            formulaDerived: line.source === "formula",
            manualEntry: line.source === "manual",
          },
        };

        // Persist the match review for audit trail
        await prisma.lcMatchReview.create({
          data: {
            organizationId,
            workbookLineId: line.id,
            workbookLineCode: line.code,
            accountCode: tb.accountCode,
            accountName: tb.accountName,
            patternUsed: patternInfo?.matchedPattern ?? null,
            matchType: line.source === "formula" ? "formula" : "code_range",
            confidence: finalConfidence,
            riskLevel: risk.riskLevel,
            riskReason: risk.riskReason,
            evidence: JSON.parse(JSON.stringify(explanation.evidence)),
            isFalsePositive: risk.riskLevel === "high",
            status: "pending",
          },
        });

        explanations.push(explanation);
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

// ══════════════════════════════════════════════════════
// P0 — False Positive Reviewer
// ══════════════════════════════════════════════════════

export interface FalsePositiveReview {
  id: string;
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  confidence: number;
  riskLevel: string;
  riskReason: string;
  status: string;
}

/**
 * List all pending false positive reviews for an organization's workbook.
 * These are matches flagged as high-risk that need human review.
 * P0 — Human review always required before any action.
 */
export async function listPendingFalsePositives(
  organizationId: string,
): Promise<AdvisorResult<FalsePositiveReview[]>> {
  if (!organizationId) {
    return fail("Organization ID is required");
  }

  try {
    const reviews = await prisma.lcMatchReview.findMany({
      where: {
        organizationId,
        isFalsePositive: true,
        status: "pending",
      },
      orderBy: [{ riskLevel: "desc" }, { createdAt: "desc" }],
      take: 100,
    });

    return ok(
      reviews.map((r) => ({
        id: r.id,
        workbookLineCode: r.workbookLineCode,
        accountCode: r.accountCode,
        accountName: r.accountName,
        confidence: r.confidence,
        riskLevel: r.riskLevel,
        riskReason: r.riskReason ?? "",
        status: r.status,
      })),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("list_false_positives_failed", { organizationId, error: message });
    return fail(message);
  }
}

/**
 * Review a potential false positive match.
 * Human decides whether to confirm or reject the FP flag.
 * P0 — Governed action, never auto-approved.
 */
export async function reviewFalsePositive(
  matchReviewId: string,
  decision: "confirmed" | "rejected",
  reviewNotes: string,
  reviewerId: string,
): Promise<AdvisorResult<unknown>> {
  if (!matchReviewId || !decision || !reviewerId) {
    return fail("Match review ID, decision, and reviewer ID are required");
  }

  try {
    const existing = await prisma.lcMatchReview.findUnique({
      where: { id: matchReviewId },
    });

    if (!existing) {
      return fail("Match review not found");
    }

    if (existing.status !== "pending") {
      return fail(`Match review already ${existing.status}`);
    }

    const updated = await prisma.lcMatchReview.update({
      where: { id: matchReviewId },
      data: {
        isFalsePositive: decision === "confirmed",
        status: decision === "confirmed" ? "confirmed" : "rejected",
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    });

    // If confirmed FP, record in organization memory
    if (decision === "confirmed") {
      await prisma.lcOrganizationMatchMemory.upsert({
        where: {
          organizationId_workbookLineCode_accountCode: {
            organizationId: existing.organizationId,
            workbookLineCode: existing.workbookLineCode,
            accountCode: existing.accountCode,
          },
        },
        update: {
          previousResult: "overridden",
          accountName: existing.accountName,
          currentPattern: existing.patternUsed ?? undefined,
          manualOverride: true,
          overrideReason: reviewNotes || "Confirmed false positive",
        },
        create: {
          organizationId: existing.organizationId,
          workbookLineCode: existing.workbookLineCode,
          accountCode: existing.accountCode,
          accountName: existing.accountName,
          previousResult: "overridden",
          currentPattern: existing.patternUsed ?? null,
          manualOverride: true,
          overrideReason: reviewNotes || "Confirmed false positive",
        },
      });

      // Update industry pattern memory
      await updateIndustryPatternMemory(
        existing.organizationId,
        existing.workbookLineCode,
        existing.patternUsed ?? "",
        false,
      );
    }

    logAdvisor("false_positive_reviewed", {
      matchReviewId,
      decision,
      reviewerId,
    });

    return ok(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("false_positive_review_failed", { matchReviewId, error: message });
    return fail(message);
  }
}

/**
 * Batch-review false positives (approve all or reject all).
 * P0 — Governed action, gets logged as one batch operation.
 */
export async function batchReviewFalsePositives(
  organizationId: string,
  matchReviewIds: string[],
  decision: "confirmed" | "rejected",
  reviewNotes: string,
  reviewerId: string,
): Promise<AdvisorResult<number>> {
  if (!organizationId || !matchReviewIds.length || !decision || !reviewerId) {
    return fail("Organization ID, match IDs, decision, and reviewer ID are required");
  }

  try {
    let count = 0;
    for (const id of matchReviewIds) {
      const result = await reviewFalsePositive(id, decision, reviewNotes, reviewerId);
      if (result.success) count++;
    }

    logAdvisor("batch_false_positive_review", {
      organizationId,
      requestedCount: matchReviewIds.length,
      completedCount: count,
      decision,
      reviewerId,
    });

    return ok(count);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logAdvisor("batch_false_positive_review_failed", { organizationId, error: message });
    return fail(message);
  }
}

// ══════════════════════════════════════════════════════
// P1 — Industry Memory
// ══════════════════════════════════════════════════════

/**
 * Update industry pattern memory based on a match or FP outcome.
 * P1 — Used to improve pattern effectiveness benchmarks over time.
 */
async function updateIndustryPatternMemory(
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

// ══════════════════════════════════════════════════════
// P1 — Organization Memory
// ══════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════
// P1 — Match Confidence Calibration
// ══════════════════════════════════════════════════════

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
    const workbook = await prisma.lcWorkbook.findUnique({
      where: { id: workbookId },
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

    for (const line of workbook.lines) {
      if (!line.autoFillable && !line.autoFilled) continue;

      const tmpl = getTemplateLineByCode(line.code);

      // Factor 1: Industry pattern effectiveness
      let industryEffectiveness: number | null = null;
      if (tmpl?.tbAccountPatterns && tmpl.tbAccountPatterns.length > 0) {
        const patternKey = tmpl.tbAccountPatterns.join("|");
        const industryRecord = await prisma.lcIndustryPatternMemory.findFirst({
          where: {
            industry,
            workbookLineCode: line.code,
            pattern: patternKey,
          },
        });
        industryEffectiveness = industryRecord?.effectivenessPct ?? null;
      }

      // Factor 2: Organization memory
      let orgMemoryType: "positive" | "negative" | "neutral" = "neutral";
      if (line.autoFillSource && line.autoFillSource.startsWith("tb:")) {
        const accountCode = line.autoFillSource.replace("tb:", "");
        const orgMemory = await prisma.lcOrganizationMatchMemory.findFirst({
          where: {
            organizationId,
            workbookLineCode: line.code,
            accountCode,
          },
        });
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
      const matchReview = await prisma.lcMatchReview.findFirst({
        where: {
          organizationId,
          workbookLineId: line.id,
        },
        orderBy: { createdAt: "desc" },
      });

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

      // Update the line confidence if it changed
      if (calibratedConfidence !== line.confidence) {
        await prisma.lcWorkbookLine.update({
          where: { id: line.id },
          data: { confidence: calibratedConfidence },
        });
      }
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

// ══════════════════════════════════════════════════════
// P1 — Pattern Suggestion Review (Approve/Reject)
// ══════════════════════════════════════════════════════

/**
 * List pending pattern suggestions for an organization.
 */
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

/**
 * Review a pattern suggestion (approve or reject it).
 * P0 — Human approval required before pattern changes take effect.
 */
export async function reviewPatternSuggestion(
  suggestionId: string,
  decision: "approved" | "rejected",
  reviewNotes: string,
  reviewerId: string,
): Promise<AdvisorResult<unknown>> {
  if (!suggestionId || !decision || !reviewerId) {
    return fail("Suggestion ID, decision, and reviewer ID are required");
  }

  try {
    const suggestion = await prisma.lcPatternSuggestion.findUnique({
      where: { id: suggestionId },
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

    // ── Learning loop: update metrics after review ──
    await updatePatternLearningMetrics(suggestionId, decision).catch((err) => {
      console.warn(
        "[LocalContentOS AI Advisor] Failed to update learning metrics:",
        err instanceof Error ? err.message : err,
      );
    });

    // If rejected, write to organization memory so future runs know this was rejected
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

// Import isAccountInCodeRange from population
import { isAccountInCodeRange } from "./population";

// The return type for reviewFalsePositive uses the Prisma LcMatchReview type
// which is inferred from the Prisma client update return.
