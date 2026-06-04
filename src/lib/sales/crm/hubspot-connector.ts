import "server-only";

import type { CrmConnector, ConnectionTestResult, RateLimitStatus } from "./connector";
import type {
  CrmAccount,
  CrmContact,
  CrmOpportunity,
  CrmProvider,
  HubSpotConfig,
} from "./types";
import { CrmAuthError, CrmConnectionError, CrmRateLimitError } from "./types";

const DEFAULT_ENDPOINT = "https://api.hubapi.com";
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HubSpotConnector implements CrmConnector {
  readonly provider: CrmProvider = "hubspot";
  private config: HubSpotConfig;
  private remaining = 100;
  private resetAt = new Date(Date.now() + 60_000);

  constructor(config: HubSpotConfig) {
    this.config = {
      apiEndpoint: DEFAULT_ENDPOINT,
      ...config,
    };
  }

  private get baseUrl(): string {
    return this.config.apiEndpoint ?? DEFAULT_ENDPOINT;
  }

  private get token(): string {
    return this.config.accessToken ?? this.config.apiKey ?? "";
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          headers: this.headers,
          signal: AbortSignal.timeout(30_000),
        });

        this.updateRateLimit(response);

        if (response.status === 401) {
          throw new CrmAuthError(
            "HubSpot authentication failed — check token",
            "hubspot",
          );
        }

        if (response.status === 429) {
          const retryAfter = this.parseRetryAfter(response);
          throw new CrmRateLimitError(
            `HubSpot rate limit hit — retry after ${retryAfter}s`,
            "hubspot",
            retryAfter,
          );
        }

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          throw new CrmConnectionError(
            `HubSpot API error (${response.status}): ${body.slice(0, 200)}`,
            "hubspot",
            response.status,
          );
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (
          err instanceof CrmRateLimitError &&
          err.retryAfterSeconds
        ) {
          await sleep(err.retryAfterSeconds * 1000);
          continue;
        }

        if (
          err instanceof CrmAuthError ||
          (err instanceof CrmConnectionError &&
            err.statusCode &&
            err.statusCode >= 400 &&
            err.statusCode !== 429)
        ) {
          throw err;
        }

        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
          await sleep(delay);
        }
      }
    }

    throw lastError ?? new CrmConnectionError("HubSpot request failed", "hubspot");
  }

  private updateRateLimit(response: Response): void {
    const remaining = response.headers.get("X-HubSpot-RateLimit-Remaining");
    const reset = response.headers.get("X-HubSpot-RateLimit-Reset");
    if (remaining) {
      this.remaining = parseInt(remaining, 10);
    }
    if (reset) {
      this.resetAt = new Date(parseInt(reset, 10) * 1000);
    }
  }

  private parseRetryAfter(response: Response): number {
    const header = response.headers.get("Retry-After");
    if (header) {
      const seconds = parseInt(header, 10);
      if (!isNaN(seconds)) return seconds;
    }
    return 10;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      await this.request<{ results: unknown[] }>("/crm/v3/objects/contacts", {
        limit: "1",
      });
      return { success: true, message: "اتصال HubSpot نشط" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل الاتصال";
      return { success: false, message };
    }
  }

  async fetchAccounts(since?: Date): Promise<CrmAccount[]> {
    const params: Record<string, string> = {
      limit: "100",
      properties: "name,industry,website,phone,description,hs_createdate,hs_lastmodifieddate",
    };
    if (since) {
      params["createdAfter"] = since.toISOString();
    }

    const all: CrmAccount[] = [];
    let after: string | undefined;

    do {
      if (after) {
        params.after = after;
      }

      const data = await this.request<{
        results: Array<Record<string, unknown>>;
        paging?: { next?: { after: string } };
      }>("/crm/v3/objects/companies", params);

      for (const item of data.results ?? []) {
        const props = (item.properties as Record<string, string | undefined>) ?? {};
        all.push({
          id: String(item.id ?? ""),
          name: props.name ?? "",
          industry: props.industry,
          website: props.website,
          phone: props.phone,
          description: props.description,
          createdAt: props.hs_createdate ?? new Date().toISOString(),
          updatedAt: props.hs_lastmodifieddate ?? new Date().toISOString(),
          raw: item as Record<string, unknown>,
        });
      }

      after = data.paging?.next?.after;
    } while (after);

    return all;
  }

  async fetchContacts(since?: Date): Promise<CrmContact[]> {
    const params: Record<string, string> = {
      limit: "100",
      properties: "firstname,lastname,email,phone,jobtitle,hs_createdate,hs_lastmodifieddate,associatedcompanyid",
    };
    if (since) {
      params["createdAfter"] = since.toISOString();
    }

    const all: CrmContact[] = [];
    let after: string | undefined;

    do {
      if (after) {
        params.after = after;
      }

      const data = await this.request<{
        results: Array<Record<string, unknown>>;
        paging?: { next?: { after: string } };
      }>("/crm/v3/objects/contacts", params);

      for (const item of data.results ?? []) {
        const props = (item.properties as Record<string, string | undefined>) ?? {};
        const associations = (item.associations as Record<string, unknown>) ?? {};
        const companyAssoc = (associations.companies as { results?: Array<{ id: string }> }) ?? {};
        const companyResults = companyAssoc.results ?? [];
        all.push({
          id: String(item.id ?? ""),
          accountId: companyResults[0]?.id ?? "",
          firstName: props.firstname ?? "",
          lastName: props.lastname ?? "",
          email: props.email,
          phone: props.phone,
          title: props.jobtitle,
          createdAt: props.hs_createdate ?? new Date().toISOString(),
          updatedAt: props.hs_lastmodifieddate ?? new Date().toISOString(),
          raw: item as Record<string, unknown>,
        });
      }

      after = data.paging?.next?.after;
    } while (after);

    return all;
  }

  async fetchOpportunities(since?: Date): Promise<CrmOpportunity[]> {
    const params: Record<string, string> = {
      limit: "100",
      properties: "dealname,amount,dealstage,pipeline,closedate,dealstage_display_order,hs_createdate,hs_lastmodifieddate,probability,hs_object_id",
    };
    if (since) {
      params["createdAfter"] = since.toISOString();
    }

    const all: CrmOpportunity[] = [];
    let after: string | undefined;

    do {
      if (after) {
        params.after = after;
      }

      const data = await this.request<{
        results: Array<Record<string, unknown>>;
        paging?: { next?: { after: string } };
      }>("/crm/v3/objects/deals", params);

      for (const item of data.results ?? []) {
        const props = (item.properties as Record<string, string | undefined>) ?? {};
        const associations = (item.associations as Record<string, unknown>) ?? {};
        const companyAssoc = (associations.companies as { results?: Array<{ id: string }> }) ?? {};
        const companyResults = companyAssoc.results ?? [];

        all.push({
          id: String(item.id ?? ""),
          accountId: companyResults[0]?.id ?? "",
          name: props.dealname ?? "",
          amount: props.amount ? parseFloat(props.amount) : undefined,
          currency: props.currency,
          stage: props.dealstage,
          probability: props.probability ? parseFloat(props.probability) : undefined,
          closeDate: props.closedate,
          createdAt: props.hs_createdate ?? new Date().toISOString(),
          updatedAt: props.hs_lastmodifieddate ?? new Date().toISOString(),
          raw: item as Record<string, unknown>,
        });
      }

      after = data.paging?.next?.after;
    } while (after);

    return all;
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    return {
      remaining: this.remaining,
      resetAt: this.resetAt,
    };
  }
}
