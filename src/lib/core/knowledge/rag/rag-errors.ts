/**
 * Structured error types for the RAG pipeline.
 */

export class RagError extends Error {
  constructor(
    message: string,
    public code: RagErrorCode,
    public recoverable: boolean = true,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = "RagError"
  }
}

export type RagErrorCode =
  | "EMBEDDING_FAILED"
  | "VECTOR_SEARCH_FAILED"
  | "RATE_LIMITED"
  | "CACHE_ERROR"
  | "DATABASE_ERROR"
  | "TIMEOUT"
  | "UNKNOWN"

/**
 * Wrap an unknown error into a RagError.
 */
export function wrapRagError(error: unknown, context: string): RagError {
  if (error instanceof RagError) return error

  const message = error instanceof Error ? error.message : String(error)

  if (message.includes("rate_limit")) {
    return new RagError(`Rate limited: ${context}`, "RATE_LIMITED", true)
  }
  if (message.includes("timeout") || message.includes("TIMEOUT")) {
    return new RagError(`Timeout: ${context}`, "TIMEOUT", true)
  }
  if (message.includes("ECONNREFUSED") || message.includes("database")) {
    return new RagError(`Database error: ${context}`, "DATABASE_ERROR", true)
  }
  if (message.includes("embedding") || message.includes("openai")) {
    return new RagError(`Embedding failed: ${context}`, "EMBEDDING_FAILED", true)
  }

  return new RagError(`Unknown error: ${context}`, "UNKNOWN", true, { originalMessage: message })
}

/**
 * Log a RAG error with structured context.
 */
export function logRagError(error: RagError, context: Record<string, unknown>): void {
  console.error(JSON.stringify({
    level: "error",
    component: "rag",
    code: error.code,
    message: error.message,
    recoverable: error.recoverable,
    ...context,
    timestamp: new Date().toISOString(),
  }))
}
