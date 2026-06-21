/**
 * Backward-compatible re-export. Intelligence Runtime moved to @/lib/core/ai/intelligence-runtime.
 * New code should import from @/lib/core/ai instead.
 */
export {
  routeIntelligenceRequest,
  type IntelligenceRoutingInput,
  type IntelligenceRoutingResult,
} from "@/lib/core/ai/intelligence-runtime";
