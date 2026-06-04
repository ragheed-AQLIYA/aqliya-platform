import "server-only"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { formatContext } from "@/lib/ai/retrieval/context-builder"
import type { SearchResult } from "@/lib/ai/retrieval/similarity-search"

export interface AISuggestion {
  content: string
  confidence: number
  model: string
  provider: string
  evidence: Array<{ chunkId: string; documentId: string; score: number }>
  limitations: string[]
  generatedAt: string
  reviewed: boolean
  approved: boolean
}

export interface ReviewSuggestionResult {
  suggestion: AISuggestion
  formatted: string
}

export async function generateSuggestion(
  context: SearchResult[],
  prompt: string,
  options?: {
    model?: string
    provider?: string
    confidence?: number
  },
): Promise<AISuggestion> {
  const evidence = context.map((c) => ({
    chunkId: c.chunkId,
    documentId: c.documentId,
    score: c.score,
  }))

  const avgScore =
    context.length > 0
      ? context.reduce((s, c) => s + c.score, 0) / context.length
      : 0

  const confidence = options?.confidence ?? Math.round(avgScore * 100) / 100

  const suggestion: AISuggestion = {
    content: prompt,
    confidence: Math.min(confidence, 0.95),
    model: options?.model ?? "mock-model",
    provider: options?.provider ?? "mock",
    evidence,
    limitations: [
      "AI-generated suggestion — requires human review before use",
      "Confidence is estimated from source relevance, not factual accuracy",
      "Do not use as final decision without human approval",
      "Sources may not be complete or up to date",
    ],
    generatedAt: new Date().toISOString(),
    reviewed: false,
    approved: false,
  }

  return suggestion
}

export function formatSuggestionForReview(suggestion: AISuggestion): string {
  const lines: string[] = [
    "=== AI-Generated Suggestion ===",
    `Generated: ${suggestion.generatedAt}`,
    `Model: ${suggestion.model} (${suggestion.provider})`,
    `Confidence: ${(suggestion.confidence * 100).toFixed(1)}%`,
    "",
    "Content:",
    suggestion.content,
    "",
    `Evidence sources: ${suggestion.evidence.length}`,
    ...suggestion.evidence.map(
      (e, i) => `  [${i + 1}] chunk=${e.chunkId.slice(0, 8)} doc=${e.documentId} score=${(e.score * 100).toFixed(1)}%`,
    ),
    "",
    "Limitations:",
    ...suggestion.limitations.map((l) => `  - ${l}`),
    "",
    "Review status: NOT REVIEWED — requires human approval",
  ]

  return lines.join("\n")
}

export function formatSuggestionForPrompt(
  context: SearchResult[],
  suggestion: AISuggestion,
): string {
  const contextStr = formatContext(context)

  return [
    "Context from knowledge base:",
    contextStr,
    "",
    "AI analysis:",
    suggestion.content,
    "",
    `Confidence: ${(suggestion.confidence * 100).toFixed(1)}%`,
    `Evidence count: ${suggestion.evidence.length}`,
    "Note: This is an AI-generated suggestion. All outputs require human review before use as decision support.",
  ].join("\n")
}

export interface AIActionLogEntry {
  action: string
  input: Record<string, unknown>
  output: Record<string, unknown>
  userId?: string
  organizationId?: string
  metadata?: Record<string, unknown>
}

export async function logAIAction(
  action: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  userId?: string,
  organizationId?: string,
): Promise<void> {
  await writePlatformAuditLog({
    productKey: "ai_core",
    action: `ai_${action}`,
    platformOrganizationId: organizationId,
    actorId: userId,
    severity: "info",
    status: "recorded",
    sourceSystem: "ai_review_gate",
    aiProvider: (output.provider as string) ?? undefined,
    aiModel: (output.model as string) ?? undefined,
    aiOutputReviewStatus: "pending",
    metadata: {
      input,
      output,
    },
  })
}

export async function generateAndLogSuggestion(
  context: SearchResult[],
  prompt: string,
  userId: string,
  organizationId: string,
): Promise<ReviewSuggestionResult> {
  const suggestion = await generateSuggestion(context, prompt)

  await logAIAction(
    "suggestion_generated",
    { prompt, contextChunkCount: context.length },
    {
      content: suggestion.content,
      confidence: suggestion.confidence,
      model: suggestion.model,
      provider: suggestion.provider,
      evidenceCount: suggestion.evidence.length,
    },
    userId,
    organizationId,
  )

  const formatted = formatSuggestionForReview(suggestion)

  return { suggestion, formatted }
}
