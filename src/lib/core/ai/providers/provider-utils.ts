export interface RetryOptions {
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  retryableStatuses: number[]
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatuses: [429, 500, 502, 503, 504],
}

function isRetryable(status: number, opts: RetryOptions): boolean {
  return opts.retryableStatuses.includes(status)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export interface FetchResponse {
  ok: boolean
  status: number
  text(): Promise<string>
  json(): Promise<unknown>
  headers: { get(name: string): string | null }
  body: ReadableStream<Uint8Array> | null
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit & { signal?: AbortSignal },
  options: Partial<RetryOptions> = {},
): Promise<Response> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetch(url, init)

      if (response.ok) {
        return response
      }

      if (isRetryable(response.status, opts) && attempt < opts.maxRetries) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
        const delay = Math.min(opts.baseDelayMs * Math.pow(2, attempt), opts.maxDelayMs)
        await sleep(delay)
        continue
      }

      return response
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt < opts.maxRetries && !isAbortError(err)) {
        const delay = Math.min(opts.baseDelayMs * Math.pow(2, attempt), opts.maxDelayMs)
        await sleep(delay)
        continue
      }

      throw lastError
    }
  }

  throw lastError ?? new Error("fetchWithRetry: exhausted retries")
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError"
}

export function createTimeoutSignal(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  }
}

export function buildOpenAIStreamBody(
  model: string,
  prompt: string,
  temperature: number,
  maxTokens: number,
): string {
  return JSON.stringify({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature,
    max_tokens: maxTokens,
    stream: true,
  })
}

export function buildAnthropicStreamBody(
  model: string,
  prompt: string,
  temperature: number,
  maxTokens: number,
): string {
  return JSON.stringify({
    model,
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature,
    stream: true,
  })
}
