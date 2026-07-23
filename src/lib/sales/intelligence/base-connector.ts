/**
 * BaseApiKeyConnector — shared HTTP foundation for all sales intelligence connectors.
 *
 * Provides: retry with exponential backoff, rate-limit awareness,
 * circuit-breaker compatible health checks, and standardized error handling.
 *
 * All connectors (Apollo, Ocean, Clay, SmartLead, LinkedIn) extend this base.
 */
import "server-only";

export interface HttpRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export interface HttpResponse<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
}

export interface ConnectionTestResult {
  success: boolean;
  latencyMs: number;
  error?: string;
}

export interface ProviderHealth {
  status: "healthy" | "degraded" | "unhealthy";
  lastCheck: Date;
  latencyMs: number;
  consecutiveFailures: number;
  rateLimitRemaining?: number;
}

export interface RateLimitState {
  remaining: number;
  resetAt: Date;
  limit: number;
}

export abstract class BaseApiKeyConnector {
  protected readonly apiKey: string;
  protected readonly baseUrl: string;
  protected readonly maxRetries: number;
  protected readonly requestTimeout: number;

  protected rateLimit: RateLimitState = {
    remaining: 999,
    resetAt: new Date(0),
    limit: 1000,
  };

  private consecutiveFailures = 0;

  constructor(config: {
    apiKey: string;
    baseUrl: string;
    maxRetries?: number;
    requestTimeout?: number;
  }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.maxRetries = config.maxRetries ?? 3;
    this.requestTimeout = config.requestTimeout ?? 30_000;
  }

  abstract readonly providerId: string;
  abstract readonly providerName: string;

  // ── HTTP Core ──

  protected async request<T = unknown>(
    opts: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const timeout = opts.timeoutMs ?? this.requestTimeout;
    const url = this.buildUrl(opts.path, opts.query);
    const headers = this.buildHeaders(opts.headers);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30_000);
          await new Promise((r) => setTimeout(r, delay));
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: opts.method ?? "GET",
          headers,
          body: opts.body ? JSON.stringify(opts.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timer);

        // Parse rate limit headers
        this.updateRateLimit(response.headers);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((v, k) => {
          responseHeaders[k] = v;
        });

        let data: T;
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          data = (await response.json()) as T;
        } else {
          data = (await response.text()) as unknown as T;
        }

        if (response.status === 429) {
          // Rate limited — wait and retry
          const retryAfter = parseInt(
            response.headers.get("retry-after") ?? "5",
            10,
          );
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          continue;
        }

        if (response.status >= 500) {
          lastError = new Error(
            `Server error ${response.status} from ${this.providerId}`,
          );
          continue;
        }

        if (response.status >= 400) {
          this.consecutiveFailures++;
          throw new Error(
            `${this.providerId} API error ${response.status}: ${JSON.stringify(data)}`,
          );
        }

        this.consecutiveFailures = 0;
        return {
          status: response.status,
          data,
          headers: responseHeaders,
          rateLimitRemaining: this.rateLimit.remaining,
          rateLimitReset: this.rateLimit.resetAt.getTime(),
        };
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          lastError = new Error(`Request timeout after ${timeout}ms`);
        } else if (err instanceof Error && !err.message.includes("API error")) {
          lastError = err;
        } else if (err instanceof Error) {
          throw err; // Don't retry client errors
        }
      }
    }

    this.consecutiveFailures++;
    throw lastError ?? new Error(`Request failed after ${this.maxRetries} retries`);
  }

  // ── Health ──

  async testConnection(): Promise<ConnectionTestResult> {
    const start = Date.now();
    try {
      await this.healthCheck();
      return { success: true, latencyMs: Date.now() - start };
    } catch (err) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Connection failed",
      };
    }
  }

  async health(): Promise<ProviderHealth> {
    const result = await this.testConnection();
    return {
      status: result.success
        ? "healthy"
        : this.consecutiveFailures >= 3
          ? "unhealthy"
          : "degraded",
      lastCheck: new Date(),
      latencyMs: result.latencyMs,
      consecutiveFailures: this.consecutiveFailures,
      rateLimitRemaining: this.rateLimit.remaining,
    };
  }

  getRateLimitState(): RateLimitState {
    return { ...this.rateLimit };
  }

  // ── Abstract ──

  protected abstract healthCheck(): Promise<void>;

  // ── Helpers ──

  private buildUrl(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): string {
    const url = new URL(path.startsWith("http") ? path : `${this.baseUrl}${path}`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined) {
          url.searchParams.set(k, String(v));
        }
      }
    }
    return url.toString();
  }

  private buildHeaders(
    extra?: Record<string, string>,
  ): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": `AQLIYA-SalesOS/1.0 (${this.providerId})`,
      ...extra,
    };
  }

  private updateRateLimit(headers: Headers): void {
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    const limit = headers.get("x-ratelimit-limit");

    if (remaining) this.rateLimit.remaining = parseInt(remaining, 10);
    if (reset)
      this.rateLimit.resetAt = new Date(parseInt(reset, 10) * 1000);
    if (limit) this.rateLimit.limit = parseInt(limit, 10);
  }
}
