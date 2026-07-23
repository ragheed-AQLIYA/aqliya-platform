/**
 * Ocean.io Connector — Account Intelligence & Lookalike Search
 *
 * API: https://api.ocean.io
 * Auth: API Key (Bearer token)
 * Key value: ICP enrichment, lookalike company discovery
 */
import "server-only";
import { BaseApiKeyConnector } from "../base-connector";
import type { SalesIntelligenceProvider, EnrichedCompany, CompanySearchCriteria } from "../types";

interface OceanCompany {
  id: string;
  domain: string;
  name: string;
  legal_name?: string;
  description?: string;
  industry_name?: string;
  employee_count?: number;
  employee_range?: string;
  estimated_revenue?: number;
  revenue_range?: string;
  year_founded?: number;
  hq_country?: string;
  hq_city?: string;
  linkedin_url?: string;
  technologies?: string[];
  tags?: string[];
  score?: number;
}

interface OceanSearchResponse {
  data: OceanCompany[];
  meta: { total: number; page: number; per_page: number };
}

export class OceanConnector
  extends BaseApiKeyConnector
  implements SalesIntelligenceProvider
{
  readonly providerId = "ocean";
  readonly providerName = "Ocean.io";

  constructor(config: { apiKey: string }) {
    super({
      apiKey: config.apiKey,
      baseUrl: "https://api.ocean.io/v1",
      maxRetries: 2,
      requestTimeout: 30_000,
    });
  }

  protected async healthCheck(): Promise<void> {
    await this.request({ path: "/account" });
  }

  async enrichCompany(domain: string): Promise<EnrichedCompany> {
    const response = await this.request<OceanCompany>({
      path: "/companies/enrich",
      query: { domain },
    });
    return this.mapCompany(response.data);
  }

  async searchCompanies(
    criteria: CompanySearchCriteria,
  ): Promise<EnrichedCompany[]> {
    // Ocean.io uses a "lookalike" search pattern — find companies similar to a seed
    const body: Record<string, unknown> = {};

    if (criteria.domain) {
      body.seed_domain = criteria.domain;
    }
    if (criteria.industry?.length) {
      body.industries = criteria.industry;
    }
    if (criteria.employeeRange) {
      body.employee_range = criteria.employeeRange;
    }
    if (criteria.revenueRange) {
      body.revenue_range = criteria.revenueRange;
    }
    if (criteria.country?.length) {
      body.countries = criteria.country;
    }
    if (criteria.technologies?.length) {
      body.technologies = criteria.technologies;
    }

    body.limit = criteria.limit ?? 25;
    body.offset = criteria.offset ?? 0;

    const response = await this.request<OceanSearchResponse>({
      path: "/companies/search",
      method: "POST",
      body,
    });

    return response.data.data.map((c) => this.mapCompany(c));
  }

  private mapCompany(c: OceanCompany): EnrichedCompany {
    return {
      id: c.id,
      domain: c.domain,
      name: c.name,
      legalName: c.legal_name,
      description: c.description,
      industry: c.industry_name,
      employeeCount: c.employee_count,
      employeeRange: c.employee_range,
      revenue: c.estimated_revenue,
      revenueRange: c.revenue_range,
      founded: c.year_founded,
      headquarters: c.hq_country,
      country: c.hq_country,
      city: c.hq_city,
      linkedinUrl: c.linkedin_url,
      technologies: c.technologies,
      keywords: c.tags,
      score: c.score,
      source: "ocean",
      enrichedAt: new Date(),
      raw: c as unknown as Record<string, unknown>,
    };
  }
}
