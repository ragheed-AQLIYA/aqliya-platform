import type { DeterministicTaskHandler, AIRequest, AIResponse } from "../types"

/**
 * Cross-product commercial claim assist — Office AI, DecisionOS, LocalContentOS.
 * Preserves deterministic fallback when real providers are unavailable.
 */
export const commercialClaimAssistHandler: DeterministicTaskHandler = async (
  request: AIRequest,
): Promise<AIResponse> => {
  const productKey = String(request.taskInput.productKey ?? "unknown")
  const instructions = String(
    request.taskInput.instructions ??
      request.taskInput.contextSummary ??
      request.taskInput.query ??
      "",
  )
  const ragBlock =
    typeof request.taskInput.ragContext === "string"
      ? request.taskInput.ragContext.slice(0, 3000)
      : ""

  const output = [
    `## Governed assist (${productKey})`,
    "",
    instructions || "_No instructions provided._",
    ragBlock ? `\n\n### Retrieved context\n${ragBlock}` : "",
    "",
    "---",
    "_Draft only. Human review required before any operational use._",
  ].join("\n")

  return {
    output,
    confidence: ragBlock ? 0.72 : 0.6,
    providerId: "deterministic",
    modelVersion: "commercial-claim-assist-v1",
    tokenUsage: { input: 0, output: 0 },
    metadata: { productKey, governedAssist: true },
    warnings: ["Human review required — output is draft"],
  }
}
