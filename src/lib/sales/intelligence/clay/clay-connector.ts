/**
 * Clay Connector — Waterfall Data Enrichment
 *
 * API: https://clay.com/api
 * Auth: API Key (Bearer token)
 * Key value: Multi-source waterfall enrichment — try providers in order,
 * fall back when one fails or lacks data.
 */
import "server-only";
import { BaseApiKeyConnector } from "../base-connector";
import type {
  SalesIntelligenceProvider,
  EnrichedCompany,
  EnrichedContact,
  WaterfallEnrichmentRequest,
  WaterfallEnrichmentResult,
  CompanySearchCriteria,
  ContactSearchCriteria,
} from "../types";

interface ClayTableRow {
  id: string;
  data: Record<string, unknown>;
}

interface ClayWaterfallResponse {
  success: boolean;
  rows: ClayTableRow[];
  provider_chain: string[];
  successful_provider?: string;
  gaps: string[];
  attempts: number;
  elapsed_ms: number;
}

export class ClayConnector
  extends BaseApiKeyConnector
  implements SalesIntelligenceProvider
{
  readonly providerId = "clay";
  readonly providerName = "Clay";

  constructor(config: { apiKey: string }) {
    super({
      apiKey: config.apiKey,
      baseUrl: "https://api.clay.com/v2",
      maxRetries: 2,
      requestTimeout: 60_000, // Waterfall can take longer
    });
  }

  protected async healthCheck(): Promise<void> {
    await this.request({ path: "/health" });
  }

  // ── Waterfall Enrichment (Clay's core value prop) ──

  async waterfallEnrich(
    request: WaterfallEnrichmentRequest,
  ): Promise<WaterfallEnrichmentResult> {
    const startTime = Date.now();

    const response = await this.request<ClayWaterfallResponse>({
      path: "/enrich/waterfall",
      method: "POST",
      body: {
        email: request.email,
        domain: request.domain,
        company_name: request.companyName,
        linkedin_url: request.linkedinUrl,
        providers: request.providers ?? [
          "apollo",
          "ocean",
          "linkedin",
          "clearbit",
          "hunter",
        ],
        fields: request.fields,
      },
      timeoutMs: request.timeout ?? 60_000,
    });

    const result: WaterfallEnrichmentResult = {
      providerChain: response.data.provider_chain,
      successfulProvider: response.data.successful_provider,
      attempts: response.data.attempts,
      totalTimeMs: response.data.elapsed_ms,
      gaps: response.data.gaps,
    };

    // Parse enriched data from rows
    if (response.data.rows.length > 0) {
      const row = response.data.rows[0].data;

      if (row.company_name || row.domain) {
        result.company = {
          id: (row.id as string) ?? "",
          domain: (row.domain as string) ?? "",
          name: (row.company_name as string) ?? "",
          industry: row.industry as string,
          employeeCount: row.employee_count as number,
          revenue: row.revenue as number,
          country: row.country as string,
          linkedinUrl: row.linkedin_url as string,
          technologies: row.technologies as string[],
          source: "clay-waterfall",
          enrichedAt: new Date(),
        };
      }

      // Extract contacts from additional rows
      const contacts = response.data.rows
        .filter((r) => r.data.email)
        .map((r) => ({
          id: r.id,
          email: (r.data.email as string) ?? "",
          firstName: r.data.first_name as string,
          lastName: r.data.last_name as string,
          fullName: r.data.full_name as string,
          title: r.data.title as string,
          linkedinUrl: r.data.linkedin_url as string,
          companyName: r.data.company_name as string,
          emailStatus: (r.data.email_status as EnrichedContact["emailStatus"]) ?? "unknown",
          confidence: 0.8,
          source: "clay-waterfall",
          enrichedAt: new Date(),
        }));

      if (contacts.length > 0) {
        result.contacts = contacts;
      }
    }

    return result;
  }

  // ── Company Enrichment (simple, single-source) ──

  async enrichCompany(domain: string): Promise<EnrichedCompany> {
    const response = await this.request<{ company: Record<string, unknown> }>({
      path: "/enrich/company",
      query: { domain },
    });

    const c = response.data.company;
    return {
      id: (c.id as string) ?? domain,
      domain,
      name: (c.name as string) ?? domain,
      industry: c.industry as string,
      employeeCount: c.employee_count as number,
      revenue: c.revenue as number,
      country: c.country as string,
      linkedinUrl: c.linkedin_url as string,
      technologies: c.technologies as string[],
      source: "clay",
      enrichedAt: new Date(),
      raw: c,
    };
  }

  async findContacts(
    criteria: ContactSearchCriteria,
  ): Promise<EnrichedContact[]> {
    const response = await this.request<{ contacts: ClayTableRow[] }>({
      path: "/enrich/contacts",
      method: "POST",
      body: {
        company_domain: criteria.companyDomain,
        titles: criteria.title,
        limit: criteria.limit ?? 25,
      },
      timeoutMs: 45_000,
    });

    return (response.data.contacts ?? []).map(
      (r: ClayTableRow): EnrichedContact => ({
        id: r.id,
        email: (r.data.email as string) ?? "",
        firstName: r.data.first_name as string,
        lastName: r.data.last_name as string,
        fullName: r.data.full_name as string,
        title: r.data.title as string,
        linkedinUrl: r.data.linkedin_url as string,
        companyDomain: criteria.companyDomain,
        emailStatus: (r.data.email_status as EnrichedContact["emailStatus"]) ?? "unknown",
        confidence: 0.8,
        source: "clay",
        enrichedAt: new Date(),
        raw: r.data,
      }),
    );
  }

  async searchCompanies(
    criteria: CompanySearchCriteria,
  ): Promise<EnrichedCompany[]> {
    const response = await this.request<{ companies: Record<string, unknown>[] }>({
      path: "/search/companies",
      method: "POST",
      body: {
        ...criteria,
        limit: criteria.limit ?? 25,
      },
    });

    return (response.data.companies ?? []).map(
      (c: Record<string, unknown>): EnrichedCompany => ({
        id: (c.id as string) ?? "",
        domain: (c.domain as string) ?? "",
        name: (c.name as string) ?? "",
        industry: c.industry as string,
        employeeCount: c.employee_count as number,
        country: c.country as string,
        source: "clay",
        enrichedAt: new Date(),
        raw: c,
      }),
    );
  }
}
