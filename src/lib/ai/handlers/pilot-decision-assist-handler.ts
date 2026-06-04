import type { DeterministicTaskHandler, AIRequest, AIResponse } from "../types"

export const pilotDecisionAssistHandler: DeterministicTaskHandler = async (
  request: AIRequest,
): Promise<AIResponse> => {
  const title = String(request.taskInput.decisionTitle ?? "Decision")
  const focus = String(request.taskInput.focus ?? "insight")
  const ragBlock =
    typeof request.taskInput.ragContext === "string"
      ? request.taskInput.ragContext.slice(0, 3000)
      : ""

  const output = [
    `## DecisionOS ${focus} (draft)`,
    `**Decision:** ${title}`,
    "",
    ragBlock
      ? `### Institutional context\n${ragBlock}`
      : "_No RAG context retrieved — complete intake and link evidence._",
    "",
    "---",
    "_Pilot decision assist. Committee approval required._",
  ].join("\n")

  return {
    output,
    confidence: ragBlock ? 0.7 : 0.55,
    providerId: "deterministic",
    modelVersion: "pilot-decision-assist-v1",
    tokenUsage: { input: 0, output: 0 },
    metadata: { focus, governedAssist: true },
    warnings: ["Human approval required for final decision record"],
  }
}
