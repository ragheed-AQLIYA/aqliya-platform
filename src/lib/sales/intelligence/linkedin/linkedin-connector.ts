/**
 * LinkedIn Connector — Professional Network Data Enrichment
 *
 * API: https://api.linkedin.com/v2
 * Auth: OAuth2 3-legged (Authorization Code with PKCE)
 * Key value: Profile enrichment, company data, network insights
 */
import "server-only";
import { BaseApiKeyConnector } from "../base-connector";
import type { SalesIntelligenceProvider, EnrichedCompany, EnrichedContact, CompanySearchCriteria, ContactSearchCriteria } from "../types";

interface LinkedInCompany {
  id: string;
  vanityName?: string;
  name: string;
  localizedDescription?: string;
  industries?: { localizedName: string }[];
  employeeCount?: number;
  employeeCountRange?: { start?: number; end?: number };
  foundedOn?: { year: number };
  locations?: Array<{
    country: string;
    city: string;
    geographicArea?: string;
  }>;
  websiteUrl?: string;
}

interface LinkedInPerson {
  id: string;
  firstName?: { localized?: Record<string, string> };
  lastName?: { localized?: Record<string, string> };
  headline?: string;
  positions?: {
    elements?: Array<{
      title: string;
      company?: { name: string };
    }>;
  };
  industry?: { localizedName: string };
  location?: { country: string; city: string };
}

export class LinkedInConnector
  extends BaseApiKeyConnector
  implements SalesIntelligenceProvider
{
  readonly providerId = "linkedin";
  readonly providerName = "LinkedIn";

  constructor(config: { apiKey: string; baseUrl?: string }) {
    super({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? "https://api.linkedin.com/v2",
      maxRetries: 2,
      requestTimeout: 20_000,
    });
  }

  protected async healthCheck(): Promise<void> {
    await this.request({ path: "/me" });
  }

  // ── Company Enrichment ──

  async enrichCompany(domain: string): Promise<EnrichedCompany> {
    const response = await this.request<{
      elements: LinkedInCompany[];
    }>({
      path: "/organizations",
      query: { q: "vanityName", vanityName: domain.split(".")[0] },
      headers: {
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202405",
      },
    });

    const c = response.data.elements?.[0];
    if (!c) throw new Error(`Company not found for domain: ${domain}`);

    return this.mapCompany(c);
  }

  async searchCompanies(
    criteria: CompanySearchCriteria,
  ): Promise<EnrichedCompany[]> {
    // LinkedIn search uses keyword-based query
    const keywords = [
      criteria.name,
      criteria.industry?.[0],
      criteria.keywords?.[0],
    ]
      .filter(Boolean)
      .join(" ");

    const response = await this.request<{
      elements: LinkedInCompany[];
    }>({
      path: "/search",
      query: {
        q: "companies",
        keywords,
        count: criteria.limit ?? 10,
        start: criteria.offset ?? 0,
      },
      headers: {
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202405",
      },
    });

    return (response.data.elements ?? []).map((c) => this.mapCompany(c));
  }

  // ── Contact/Profile ──

  async findContacts(
    criteria: ContactSearchCriteria,
  ): Promise<EnrichedContact[]> {
    const response = await this.request<{
      elements: LinkedInPerson[];
    }>({
      path: "/search",
      query: {
        q: "people",
        keywords: criteria.keywords?.[0] ?? criteria.title?.[0] ?? "",
        ...(criteria.companyDomain
          ? { currentCompany: criteria.companyDomain }
          : {}),
        count: criteria.limit ?? 10,
        start: criteria.offset ?? 0,
      },
      headers: {
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202405",
      },
    });

    return (response.data.elements ?? []).map((p) => this.mapPerson(p));
  }

  // ── Mappers ──

  private mapCompany(c: LinkedInCompany): EnrichedCompany {
    const loc = c.locations?.[0];
    return {
      id: c.id,
      domain: c.vanityName ? `${c.vanityName}.com` : "",
      name: c.name,
      description: c.localizedDescription,
      industry: c.industries?.[0]?.localizedName,
      employeeCount: c.employeeCount,
      employeeRange: c.employeeCountRange?.start
        ? `${c.employeeCountRange.start}-${c.employeeCountRange.end ?? "∞"}`
        : undefined,
      founded: c.foundedOn?.year,
      country: loc?.country,
      city: loc?.city,
      source: "linkedin",
      enrichedAt: new Date(),
      raw: c as unknown as Record<string, unknown>,
    };
  }

  private mapPerson(p: LinkedInPerson): EnrichedContact {
    const firstName = p.firstName?.localized?.["en_US"] ?? "";
    const lastName = p.lastName?.localized?.["en_US"] ?? "";
    return {
      id: p.id,
      email: "",
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      title: p.positions?.elements?.[0]?.title,
      companyName: p.positions?.elements?.[0]?.company?.name,
      linkedinUrl: `https://linkedin.com/in/${p.id}`,
      confidence: 0.9,
      source: "linkedin",
      enrichedAt: new Date(),
      raw: p as unknown as Record<string, unknown>,
    };
  }
}
