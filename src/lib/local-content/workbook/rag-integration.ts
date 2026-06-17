// ─── LocalContentOS — RAG Integration Layer (V3.5 Phase 6) ───
// Mandatory: Before every AI call, build LocalContentContext, format it,
// and inject it as grounded context into the AI prompt.
// Reuses existing infrastructure: runGovernedProductAI, AIOrchestrator,
// embedding services, retriever services.
// Does NOT build a second AI stack.

import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge";
import { buildLocalContentContext, formatLocalContentContext, formatLocalContentContextSummary } from "./context-builder";
import type {
  LocalContentContext,
} from "./context-builder";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";
import type { GovernedProductAIInput, GovernedProductAIResult } from "@/lib/platform/product-ai-bridge";

// ─── Types ───

export interface GroundedAIInput {
  organizationId: string;
  workbookId?: string;
  industry?: string;
  useCase: string;
  prompt: string;
  systemPrompt?: string;
  userId?: string;
  /** Additional context to merge with auto-retrieved context */
  additionalContext?: string;
}

export interface GroundedAIOutput {
  result: GovernedProductAIResult | null;
  context: LocalContentContext;
  contextFormatted: string;
  durationMs: number;
}

// ─── Grounded AI Execution ───

/**
 * Execute an AI call with full LocalContentContext grounding.
 * Step 1: Build context from all available knowledge sources.
 * Step 2: Format context for prompt injection.
 * Step 3: Call runGovernedProductAI with enriched prompt.
 * Step 4: Return result + context for audit.
 *
 * P0: This is the mandatory entry point for all LocalContentOS AI calls.
 */
export async function runGroundedLocalContentAI(
  input: GroundedAIInput,
): Promise<GroundedAIOutput> {
  const startedAt = Date.now();

  // Step 1: Build grounded context
  const context = await buildLocalContentContext(
    input.organizationId,
    input.industry,
    input.workbookId,
  );

  // Step 2: Format context for injection
  const contextBlock = formatLocalContentContext(context);
  const contextSummary = formatLocalContentContextSummary(context);

  // Step 3: Build enriched prompt with grounded context
  const enrichedPrompt = [
    `## Grounded Context\n${contextBlock}\n`,
    `## Task\n${input.prompt}`,
  ].join("\n\n");

  const enrichedSystemPrompt = input.systemPrompt
    ? [
        input.systemPrompt,
        `\n\n## Context Summary\n${contextSummary}`,
        "\n\nIMPORTANT: Use the Grounded Context above as your primary knowledge source. ",
        "Every response must cite evidence sources where applicable.",
        "If context is insufficient, state what additional information would help.",
      ].join("")
    : undefined;

  // Step 4: Call existing governed AI infrastructure
  const aiInput: GovernedProductAIInput = {
    productKey: "localcontentos",
    useCase: input.useCase as GovernanceTaskType,
    organizationId: input.organizationId,
    userId: input.userId ?? "system",
    resourceId: input.workbookId ?? input.organizationId,
    query: input.prompt.slice(0, 200),
    taskInput: {
      enrichedPrompt,
      ...(input.additionalContext ? { additionalContext: input.additionalContext } : {}),
    },
    evidenceComplete: false,
  };

  const result = await runGovernedProductAI(aiInput);

  const durationMs = Date.now() - startedAt;

  return {
    result,
    context,
    contextFormatted: contextBlock,
    durationMs,
  };
}
