/**
 * Backward-compatible re-exports. All AI modules moved to @/lib/core/ai/.
 * New code should import from @/lib/core/ai instead.
 */
export { AIOrchestrator, aiOrchestrator } from "@/lib/core/ai/orchestrator";
export { createAIProvider } from "@/lib/core/ai/provider-factory";
export * from "@/lib/core/ai/providers";
export * from "@/lib/core/ai/types";
export { getPromptBuilder, assemblePrompt } from "@/lib/core/ai/prompt-registry";
