/**
 * Apollo.io Connector — Sales Intelligence & Outreach
 *
 * API: https://apollo.io/docs/api
 * Auth: API Key (Bearer token)
 * Rate Limit: 600 req/min (varies by plan)
 */
import "server-only";
import { BaseApiKeyConnector } from "../base-connector";
import type {
  SalesIntelligenceProvider,
  EnrichedCompany,
  EnrichedContact,
  CompanySearchCriteria,
  ContactSearchCriteria,
  OutreachCampaign,
  OutreachStep,
  OutreachEvent,
} from "../types";

interface ApolloCompany {
  id: string;
  name: string;
  website_url?: string;
  domain?: string;
  estimated_num_employees?: number;
  industry?: string;
  sub_industry?: string;
  annual_revenue?: number;
  founded_year?: number;
  city?: string;
  state?: string;
  country?: string;
  linkedin_url?: string;
  twitter_url?: string;
  crunchbase_url?: string;
  technologies?: string[];
  keywords?: string[];
  funding_total?: number;
  alexa_ranking?: number;
  phone?: string;
  description?: string;
}

interface ApolloContact {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  title?: string;
  seniority?: string;
  linkedin_url?: string;
  twitter_url?: string;
  phone_numbers?: Array<{ raw_number: string; type: string }>;
  organization?: { id: string; name: string; domain?: string };
  email_status?: string;
}

interface ApolloSearchResponse<T> {
  [key: string]: T[] | { total_entries?: number; page?: number } | undefined;
  pagination?: { total_entries?: number; page?: number };
}

export class ApolloConnector
  extends BaseApiKeyConnector
  implements SalesIntelligenceProvider
{
  readonly providerId = "apollo";
  readonly providerName = "Apollo.io";

  constructor(config: { apiKey: string }) {
    super({
      apiKey: config.apiKey,
      baseUrl: "https://api.apollo.io/api/v1",
      maxRetries: 3,
      requestTimeout: 30_000,
    });
  }

  protected async healthCheck(): Promise<void> {
    await this.request<{ account: { id: string } }>({
      path: "/auth/health",
    });
  }

  // ── Company Enrichment ──

  async enrichCompany(domain: string): Promise<EnrichedCompany> {
    const response = await this.request<{ organization: ApolloCompany }>({
      path: "/organizations/enrich",
      query: { domain },
    });
    return this.mapCompany(response.data.organization);
  }

  async searchCompanies(
    criteria: CompanySearchCriteria,
  ): Promise<EnrichedCompany[]> {
    const params: Record<string, string | number> = {
      per_page: criteria.limit ?? 25,
      page: Math.floor((criteria.offset ?? 0) / (criteria.limit ?? 25)) + 1,
    };

    if (criteria.industry?.length)
      params.q_organization_industry = criteria.industry.join(",");
    if (criteria.employeeRange?.min)
      params.organization_num_employees_ranges = JSON.stringify([
        `${criteria.employeeRange.min}_${criteria.employeeRange.max ?? 100000}`,
      ]);
    if (criteria.country?.length)
      params.organization_locations = criteria.country.join(",");
    if (criteria.keywords?.length)
      params.q_organization_keyword_tags = criteria.keywords.join(",");
    if (criteria.name) params.q_organization_name = criteria.name;
    if (criteria.domain)
      params.q_organization_domains = criteria.domain;

    const response = await this.request<ApolloSearchResponse<ApolloCompany>>({
      path: "/mixed_companies/search",
      method: "POST",
      body: { ...params, api_key: this.apiKey },
    });

    const companies = (response.data.organizations ??
      response.data.mixed_companies ??
      []) as ApolloCompany[];
    return companies.map((c) => this.mapCompany(c));
  }

  // ── Contact Finding ──

  async findContacts(
    criteria: ContactSearchCriteria,
  ): Promise<EnrichedContact[]> {
    const params: Record<string, unknown> = {
      per_page: criteria.limit ?? 25,
      page: Math.floor((criteria.offset ?? 0) / (criteria.limit ?? 25)) + 1,
    };

    if (criteria.companyDomain)
      params.q_organization_domains = criteria.companyDomain;
    if (criteria.title?.length)
      params.person_titles = criteria.title;
    if (criteria.seniority?.length)
      params.person_seniorities = criteria.seniority;
    if (criteria.keywords?.length)
      params.q_keywords = criteria.keywords.join(",");

    const response = await this.request<ApolloSearchResponse<ApolloContact>>({
      path: "/mixed_people/search",
      method: "POST",
      body: { ...params, api_key: this.apiKey },
    });

    const contacts = (response.data.contacts ??
      response.data.people ??
      []) as ApolloContact[];
    return contacts.map((c) => this.mapContact(c));
  }

  async verifyEmail(
    email: string,
  ): Promise<{ status: string; confidence: number }> {
    const response = await this.request<{
      email: string;
      email_status: string;
      email_confidence?: number;
    }>({
      path: "/email_verifier",
      query: { email },
    });
    return {
      status: response.data.email_status ?? "unknown",
      confidence: response.data.email_confidence ?? 0.5,
    };
  }

  // ── Outreach ──

  async createCampaign(config: {
    name: string;
    steps: OutreachStep[];
    contactIds: string[];
  }): Promise<OutreachCampaign> {
    const response = await this.request<{ sequence: { id: string } }>({
      path: "/sequences",
      method: "POST",
      body: {
        name: config.name,
        contact_ids: config.contactIds,
        steps: config.steps.map((s) => ({
          type: s.type,
          template: s.template,
          subject: s.subject,
          delay_days: s.delayDays ?? 3,
        })),
      },
    });

    return {
      id: response.data.sequence.id,
      name: config.name,
      status: "active",
      sequenceSteps: config.steps,
      targetCount: config.contactIds.length,
      sentCount: 0,
      openCount: 0,
      replyCount: 0,
      bounceCount: 0,
      meetingCount: 0,
      createdAt: new Date(),
    };
  }

  async getCampaign(campaignId: string): Promise<OutreachCampaign> {
    const response = await this.request<{
      sequence: {
        id: string;
        name: string;
        state: string;
        steps: Array<{
          type: string;
          template?: string;
          subject?: string;
          delay_days?: number;
        }>;
        stats?: {
          num_targets?: number;
          num_sent?: number;
          num_open?: number;
          num_reply?: number;
          num_bounce?: number;
          num_meetings?: number;
        };
        created_at: string;
      };
    }>({
      path: `/sequences/${campaignId}`,
    });

    const seq = response.data.sequence;
    return {
      id: seq.id,
      name: seq.name,
      status: seq.state as OutreachCampaign["status"],
      sequenceSteps: seq.steps.map((s: { type: string; template?: string; subject?: string; delay_days?: number }) => ({
        id: `step-${Math.random().toString(36).slice(2, 8)}`,
        type: s.type as OutreachStep["type"],
        template: s.template,
        subject: s.subject,
        delayDays: s.delay_days,
      })),
      targetCount: seq.stats?.num_targets ?? 0,
      sentCount: seq.stats?.num_sent ?? 0,
      openCount: seq.stats?.num_open ?? 0,
      replyCount: seq.stats?.num_reply ?? 0,
      bounceCount: seq.stats?.num_bounce ?? 0,
      meetingCount: seq.stats?.num_meetings ?? 0,
      createdAt: new Date(seq.created_at),
    };
  }

  async getOutreachEvents(since?: Date): Promise<OutreachEvent[]> {
    const params: Record<string, string> = {};
    if (since) params.updated_at_from = since.toISOString();

    const response = await this.request<{
      emailer_actions?: Array<{
        id: string;
        sequence_id: string;
        contact_id: string;
        action_type: string;
        created_at: string;
      }>;
    }>({
      path: "/emailer_actions",
      query: params,
    });

    return (response.data.emailer_actions ?? []).map(
      (e: { id: string; sequence_id: string; contact_id: string; action_type: string; created_at: string }) => ({
        id: e.id,
        campaignId: e.sequence_id,
        contactId: e.contact_id,
        type: this.mapActionType(e.action_type),
        occurredAt: new Date(e.created_at),
      }),
    );
  }

  // ── Mappers ──

  private mapCompany(c: ApolloCompany): EnrichedCompany {
    return {
      id: c.id,
      domain: c.domain ?? c.website_url ?? "",
      name: c.name,
      description: c.description,
      industry: c.industry,
      subIndustry: c.sub_industry,
      employeeCount: c.estimated_num_employees,
      revenue: c.annual_revenue,
      founded: c.founded_year,
      city: c.city,
      country: c.country,
      linkedinUrl: c.linkedin_url,
      twitterUrl: c.twitter_url,
      crunchbaseUrl: c.crunchbase_url,
      technologies: c.technologies,
      keywords: c.keywords,
      funding: c.funding_total ? { total: c.funding_total } : undefined,
      alexaRank: c.alexa_ranking,
      phone: c.phone,
      source: "apollo",
      enrichedAt: new Date(),
      raw: c as unknown as Record<string, unknown>,
    };
  }

  private mapContact(c: ApolloContact): EnrichedContact {
    return {
      id: c.id,
      email: c.email ?? "",
      firstName: c.first_name,
      lastName: c.last_name,
      fullName: c.name ?? `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
      title: c.title,
      seniority: c.seniority,
      linkedinUrl: c.linkedin_url,
      twitterUrl: c.twitter_url,
      phone: c.phone_numbers?.find((p) => p.type === "work")?.raw_number,
      mobilePhone: c.phone_numbers?.find((p) => p.type === "mobile")?.raw_number,
      companyName: c.organization?.name,
      companyDomain: c.organization?.domain,
      emailStatus: (c.email_status as EnrichedContact["emailStatus"]) ?? "unknown",
      confidence: 0.85,
      source: "apollo",
      enrichedAt: new Date(),
      raw: c as unknown as Record<string, unknown>,
    };
  }

  private mapActionType(
    apolloType: string,
  ): OutreachEvent["type"] {
    const map: Record<string, OutreachEvent["type"]> = {
      email_sent: "sent",
      email_opened: "opened",
      email_clicked: "clicked",
      email_replied: "replied",
      email_bounced: "bounced",
      email_unsubscribed: "unsubscribed",
      meeting_booked: "meeting_booked",
    };
    return map[apolloType] ?? "sent";
  }
}
