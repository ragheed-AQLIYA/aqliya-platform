import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { CrmConnector, ConnectionTestResult, RateLimitStatus } from "./connector";
import type {
  CrmAccount,
  CrmContact,
  CrmOpportunity,
  CrmProvider,
  SalesforceConfig,
  SyncToLocalResult,
} from "./types";
import { CrmAuthError, CrmConnectionError, CrmRateLimitError } from "./types";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SalesforceAuthResponse {
  access_token: string;
  instance_url: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

interface SalesforceQueryResponse<T> {
  totalSize: number;
  done: boolean;
  records: T[];
  nextRecordsUrl?: string;
}

export class SalesforceConnector implements CrmConnector {
  readonly provider: CrmProvider = "salesforce";
  private config: SalesforceConfig;
  private accessToken: string;
  private remaining = 5000;
  private resetAt = new Date(Date.now() + 60_000);

  constructor(config: SalesforceConfig) {
    this.config = {
      apiVersion: "v58.0",
      ...config,
    };
    this.accessToken = config.accessToken ?? "";
  }

  private get instanceUrl(): string {
    return this.config.instanceUrl;
  }

  private get apiVersion(): string {
    return this.config.apiVersion ?? "v58.0";
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
    }
  }

  private async authenticate(): Promise<void> {
    const { clientId, clientSecret, username, password } = this.config;
    if (!clientId || !clientSecret || !username || !password) {
      throw new CrmAuthError(
        "Salesforce OAuth credentials missing",
        "salesforce",
      );
    }

    try {
      const response = await fetch(
        `${this.instanceUrl}/services/oauth2/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "password",
            client_id: clientId,
            client_secret: clientSecret,
            username,
            password,
          }),
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new CrmAuthError(
          `Salesforce OAuth failed (${response.status}): ${body.slice(0, 200)}`,
          "salesforce",
        );
      }

      const data = (await response.json()) as SalesforceAuthResponse;
      this.accessToken = data.access_token;
    } catch (err) {
      if (err instanceof CrmAuthError) throw err;
      throw new CrmAuthError(
        `Salesforce OAuth error: ${err instanceof Error ? err.message : "unknown"}`,
        "salesforce",
      );
    }
  }

  private async query<T>(
    soql: string,
  ): Promise<T[]> {
    await this.ensureAuthenticated();

    const all: T[] = [];
    let nextUrl: string | undefined;

    do {
      const url = nextUrl ?? `${this.instanceUrl}/services/data/${this.apiVersion}/query?q=${encodeURIComponent(soql)}`;

      let lastError: Error | null = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const response = await fetch(url, {
            headers: this.headers,
            signal: AbortSignal.timeout(30_000),
          });

          this.updateRateLimit(response);

          if (response.status === 401) {
            this.accessToken = "";
            await this.ensureAuthenticated();
            continue;
          }

          if (response.status === 429) {
            const retryAfter = this.parseRetryAfter(response);
            throw new CrmRateLimitError(
              `Salesforce rate limit hit — retry after ${retryAfter}s`,
              "salesforce",
              retryAfter,
            );
          }

          if (!response.ok) {
            const body = await response.text().catch(() => "");
            throw new CrmConnectionError(
              `Salesforce API error (${response.status}): ${body.slice(0, 200)}`,
              "salesforce",
              response.status,
            );
          }

          const data = (await response.json()) as SalesforceQueryResponse<T>;
          all.push(...data.records);
          nextUrl = data.done
            ? undefined
            : data.nextRecordsUrl
              ? `${this.instanceUrl}${data.nextRecordsUrl}`
              : undefined;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          if (err instanceof CrmRateLimitError) {
            const retryAfter = err.retryAfterSeconds;
            if (retryAfter) {
              await sleep(retryAfter * 1000);
              continue;
            }
          }

          if (err instanceof CrmAuthError) {
            throw err;
          }

          if (attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            await sleep(delay);
          }
        }
      }

      if (lastError) throw lastError;
    } while (nextUrl);

    return all;
  }

  private updateRateLimit(response: Response): void {
    const header = response.headers.get("Sforce-Limit-Info");
    if (header) {
      const match = header.match(/api-usage=(\d+)\/(\d+)/);
      if (match) {
        this.remaining = parseInt(match[2], 10) - parseInt(match[1], 10);
      }
    }
  }

  private parseRetryAfter(response: Response): number {
    const header = response.headers.get("Retry-After");
    if (header) {
      const seconds = parseInt(header, 10);
      if (!isNaN(seconds)) return seconds;
    }
    return 15;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      await this.ensureAuthenticated();
      await this.query<Record<string, unknown>>(
        "SELECT Id FROM Account LIMIT 1",
      );
      return { success: true, message: "اتصال Salesforce نشط" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل الاتصال";
      return { success: false, message };
    }
  }

  async fetchAccounts(since?: Date): Promise<CrmAccount[]> {
    let soql = `
      SELECT Id, Name, Industry, Website, Phone, Description,
             Owner.Email, Owner.Name,
             CreatedDate, LastModifiedDate
      FROM Account
    `;

    if (since) {
      soql += ` WHERE LastModifiedDate >= ${since.toISOString()}`;
    }

    soql += " ORDER BY LastModifiedDate ASC";

    const raw = await this.query<Record<string, unknown>>(soql);

    return raw.map((record) => {
      const owner = (record.Owner as Record<string, string | undefined>) ?? {};
      return {
        id: String(record.Id ?? ""),
        name: String(record.Name ?? ""),
        industry: (record.Industry as string) ?? undefined,
        website: (record.Website as string) ?? undefined,
        phone: (record.Phone as string) ?? undefined,
        description: (record.Description as string) ?? undefined,
        ownerEmail: owner.Email,
        ownerName: owner.Name,
        createdAt: String(record.CreatedDate ?? new Date().toISOString()),
        updatedAt: String(record.LastModifiedDate ?? new Date().toISOString()),
        raw: record,
      };
    });
  }

  async fetchContacts(since?: Date): Promise<CrmContact[]> {
    let soql = `
      SELECT Id, AccountId, FirstName, LastName, Email, Phone, Title,
             Owner.Email,
             CreatedDate, LastModifiedDate
      FROM Contact
    `;

    if (since) {
      soql += ` WHERE LastModifiedDate >= ${since.toISOString()}`;
    }

    soql += " ORDER BY LastModifiedDate ASC";

    const raw = await this.query<Record<string, unknown>>(soql);

    return raw.map((record) => {
      const owner = (record.Owner as Record<string, string | undefined>) ?? {};
      return {
        id: String(record.Id ?? ""),
        accountId: String(record.AccountId ?? ""),
        firstName: String(record.FirstName ?? ""),
        lastName: String(record.LastName ?? ""),
        email: (record.Email as string) ?? undefined,
        phone: (record.Phone as string) ?? undefined,
        title: (record.Title as string) ?? undefined,
        ownerEmail: owner.Email,
        createdAt: String(record.CreatedDate ?? new Date().toISOString()),
        updatedAt: String(record.LastModifiedDate ?? new Date().toISOString()),
        raw: record,
      };
    });
  }

  async fetchOpportunities(since?: Date): Promise<CrmOpportunity[]> {
    let soql = `
      SELECT Id, AccountId, Name, Amount, CurrencyIsoCode, StageName,
             Probability, CloseDate,
             Owner.Email, Owner.Name,
             CreatedDate, LastModifiedDate
      FROM Opportunity
    `;

    if (since) {
      soql += ` WHERE LastModifiedDate >= ${since.toISOString()}`;
    }

    soql += " ORDER BY LastModifiedDate ASC";

    const raw = await this.query<Record<string, unknown>>(soql);

    return raw.map((record) => {
      const owner = (record.Owner as Record<string, string | undefined>) ?? {};
      return {
        id: String(record.Id ?? ""),
        accountId: String(record.AccountId ?? ""),
        name: String(record.Name ?? ""),
        amount: (record.Amount as number) ?? undefined,
        currency: (record.CurrencyIsoCode as string) ?? undefined,
        stage: (record.StageName as string) ?? undefined,
        probability: (record.Probability as number) ?? undefined,
        closeDate: (record.CloseDate as string) ?? undefined,
        ownerEmail: owner.Email,
        ownerName: owner.Name,
        createdAt: String(record.CreatedDate ?? new Date().toISOString()),
        updatedAt: String(record.LastModifiedDate ?? new Date().toISOString()),
        raw: record,
      };
    });
  }

  async syncToLocal(
    organizationId: string,
    entities: { accounts: CrmAccount[]; contacts: CrmContact[]; opportunities: CrmOpportunity[] },
    conflictPolicy = "crm_wins",
  ): Promise<SyncToLocalResult> {
    const result: SyncToLocalResult = {
      accounts: { created: 0, updated: 0, skipped: 0, failed: 0 },
      contacts: { created: 0, updated: 0, skipped: 0, failed: 0 },
      opportunities: { created: 0, updated: 0, skipped: 0, failed: 0 },
    };

    for (const acct of entities.accounts) {
      try {
        const existing = await prisma.salesAccount.findFirst({
          where: { organizationId, metadata: { path: ["crmId"], equals: acct.id } },
          select: { id: true },
        });
        if (existing) {
          if (conflictPolicy === "crm_wins") {
            await prisma.salesAccount.update({
              where: { id: existing.id },
              data: {
                name: acct.name,
                industry: acct.industry ?? null,
                metadata: {
                  crmId: acct.id,
                  crmWebsite: acct.website,
                  crmPhone: acct.phone,
                  crmDescription: acct.description,
                } as Prisma.InputJsonValue,
              },
            });
            result.accounts.updated++;
          } else {
            result.accounts.skipped++;
          }
        } else {
          await prisma.salesAccount.create({
            data: {
              organizationId,
              name: acct.name,
              industry: acct.industry ?? null,
              metadata: {
                crmId: acct.id,
                crmWebsite: acct.website,
                crmPhone: acct.phone,
                crmDescription: acct.description,
              } as Prisma.InputJsonValue,
              createdById: "crm-sync",
              updatedById: "crm-sync",
            },
          });
          result.accounts.created++;
        }
      } catch {
        result.accounts.failed++;
      }
    }

    for (const ct of entities.contacts) {
      try {
        const existing = await prisma.salesContact.findFirst({
          where: { organizationId, email: ct.email ?? undefined },
          select: { id: true, email: true },
        });
        if (existing) {
          if (conflictPolicy === "crm_wins") {
            await prisma.salesContact.update({
              where: { id: existing.id },
              data: {
                name: `${ct.firstName} ${ct.lastName}`.trim(),
                email: ct.email ?? null,
                role: ct.title ?? null,
              },
            });
            result.contacts.updated++;
          } else {
            result.contacts.skipped++;
          }
        } else {
          await prisma.salesContact.create({
            data: {
              organizationId,
              accountId: "SYNC_PENDING",
              name: `${ct.firstName} ${ct.lastName}`.trim(),
              email: ct.email ?? null,
              role: ct.title ?? null,
              createdById: "crm-sync",
            },
          });
          result.contacts.created++;
        }
      } catch {
        result.contacts.failed++;
      }
    }

    for (const opp of entities.opportunities) {
      try {
        const existing = await prisma.salesDeal.findFirst({
          where: { organizationId, metadata: { path: ["crmId"], equals: opp.id } },
          select: { id: true },
        });
        if (existing) {
          if (conflictPolicy === "crm_wins") {
            await prisma.salesDeal.update({
              where: { id: existing.id },
              data: {
                title: opp.name,
                amount: opp.amount ?? null,
                currency: opp.currency ?? "SAR",
                probability: opp.probability ?? null,
                expectedCloseDate: opp.closeDate ? new Date(opp.closeDate) : null,
              },
            });
            result.opportunities.updated++;
          } else {
            result.opportunities.skipped++;
          }
        } else {
          await prisma.salesDeal.create({
            data: {
              organizationId,
              accountId: "SYNC_PENDING",
              title: opp.name,
              amount: opp.amount ?? null,
              currency: opp.currency ?? "SAR",
              probability: opp.probability ?? null,
              expectedCloseDate: opp.closeDate ? new Date(opp.closeDate) : null,
              createdById: "crm-sync",
              updatedById: "crm-sync",
            },
          });
          result.opportunities.created++;
        }
      } catch {
        result.opportunities.failed++;
      }
    }

    return result;
  }

  async getRateLimitStatus(): Promise<RateLimitStatus> {
    return {
      remaining: this.remaining,
      resetAt: this.resetAt,
    };
  }
}
