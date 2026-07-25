/**
 * LocalContentOS AI Advisor — barrel export
 *
 * Re-exports all public APIs from domain modules.
 * Existing imports from "@/lib/local-content/workbook/ai-advisor" continue to work.
 */

// Shared types and helpers
export type { AdvisorResult } from "./common";

// P0: Pattern Learning Assistant
export { suggestPatternImprovements } from "./pattern-improvement";
export type { PatternSuggestion } from "./pattern-improvement";

// P1: Pattern Suggestion Review
export { listPendingPatternSuggestions, reviewPatternSuggestion } from "./pattern-improvement";

// P0: Account Explanation Engine
export { explainAccountMatches } from "./account-explanation";
export type { AccountMatchExplanation } from "./account-explanation";

// P0: False Positive Reviewer
export { listPendingFalsePositives, reviewFalsePositive, batchReviewFalsePositives } from "./false-positive-reviewer";
export type { FalsePositiveReview } from "./false-positive-reviewer";

// P1: Industry Memory
export { getIndustryPatternBenchmarks } from "./memory";

// P1: Organization Memory
export { getOrganizationMatchMemory } from "./memory";

// P1: Match Confidence Calibration
export { calibrateWorkbookConfidence } from "./confidence-calibration";
export type { CalibratedMatch } from "./confidence-calibration";
