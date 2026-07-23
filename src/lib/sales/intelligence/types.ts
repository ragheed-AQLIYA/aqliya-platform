/**
 * SalesIntelligenceProvider — unified interface for all sales intelligence tools.
 *
 * Covers: contact finding, company enrichment, ICP search, email verification,
 * waterfall enrichment, and outreach automation.
 */
import "server-only";
import type { ConnectionTestResult, ProviderHealth } from "./base-connector";

// ── Domain Types ──

export interface EnrichedCompany {
  id: string;
  domain: string;
  name: string;
  legalName?: string;
  description?: string;
  industry?: string;
  subIndustry?: string;
  employeeCount?: number;
  employeeRange?: string;
  revenue?: number;
  revenueRange?: string;
  founded?: number;
  headquarters?: string;
  country?: string;
  region?: string;
  city?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  crunchbaseUrl?: string;
  technologies?: string[];
  keywords?: string[];
  funding?: {
    total?: number;
    lastRound?: string;
    lastRoundDate?: string;
    investors?: string[];
  };
  alexaRank?: number;
  phone?: string;
  score?: number;
  source: string;
  enrichedAt: Date;
  raw?: Record<string, unknown>;
}

export interface EnrichedContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  seniority?: string;
  department?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  phone?: string;
  mobilePhone?: string;
  companyName?: string;
  companyDomain?: string;
  emailStatus?: "valid" | "invalid" | "risky" | "unknown" | "catch_all";
  confidence: number;
  source: string;
  enrichedAt: Date;
  raw?: Record<string, unknown>;
}

export interface CompanySearchCriteria {
  industry?: string[];
  employeeRange?: { min?: number; max?: number };
  revenueRange?: { min?: number; max?: number };
  country?: string[];
  region?: string[];
  technologies?: string[];
  keywords?: string[];
  founded?: { min?: number; max?: number };
  funding?: { min?: number };
  domain?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

export interface ContactSearchCriteria {
  companyDomain?: string;
  companyId?: string;
  title?: string[];
  seniority?: string[];
  department?: string[];
  keywords?: string[];
  location?: string;
  emailStatus?: ("valid" | "invalid" | "risky" | "unknown")[];
  limit?: number;
  offset?: number;
}

export interface WaterfallEnrichmentRequest {
  email?: string;
  domain?: string;
  companyName?: string;
  linkedinUrl?: string;
  providers?: string[]; // ordered list of providers to try
  fields?: string[];
  timeout?: number;
}

export interface WaterfallEnrichmentResult {
  company?: Partial<EnrichedCompany>;
  contacts?: Partial<EnrichedContact>[];
  providerChain: string[]; // which providers were tried
  successfulProvider?: string;
  attempts: number;
  totalTimeMs: number;
  gaps: string[]; // fields that couldn't be enriched
}

export interface OutreachCampaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  sequenceSteps: OutreachStep[];
  targetCount: number;
  sentCount: number;
  openCount: number;
  replyCount: number;
  bounceCount: number;
  meetingCount: number;
  createdAt: Date;
}

export interface OutreachStep {
  id: string;
  type: "email" | "linkedin_message" | "linkedin_connect" | "call" | "delay";
  template?: string;
  subject?: string;
  delayDays?: number;
  conditions?: Record<string, unknown>;
}

export interface OutreachEvent {
  id: string;
  campaignId: string;
  contactId: string;
  type: "sent" | "opened" | "clicked" | "replied" | "bounced" | "unsubscribed" | "meeting_booked";
  occurredAt: Date;
  metadata?: Record<string, unknown>;
}

// ── Provider Interface ──

export interface SalesIntelligenceProvider {
  readonly providerId: string;
  readonly providerName: string;

  // Company enrichment
  enrichCompany?(domain: string): Promise<EnrichedCompany>;
  searchCompanies?(criteria: CompanySearchCriteria): Promise<EnrichedCompany[]>;

  // Contact finding
  findContacts?(criteria: ContactSearchCriteria): Promise<EnrichedContact[]>;
  verifyEmail?(email: string): Promise<{ status: string; confidence: number }>;

  // Waterfall enrichment (Clay-like)
  waterfallEnrich?(request: WaterfallEnrichmentRequest): Promise<WaterfallEnrichmentResult>;

  // Outreach
  createCampaign?(config: {
    name: string;
    steps: OutreachStep[];
    contactIds: string[];
  }): Promise<OutreachCampaign>;
  getCampaign?(campaignId: string): Promise<OutreachCampaign>;
  getOutreachEvents?(since?: Date): Promise<OutreachEvent[]>;

  // Health
  testConnection(): Promise<ConnectionTestResult>;
  health(): Promise<ProviderHealth>;
  getRateLimitState?(): { remaining: number; resetAt: Date; limit: number };
}

// ── Provider Registry ──

export type SalesIntelProviderId =
  | "apollo"
  | "ocean"
  | "clay"
  | "smartlead"
  | "linkedin"
  | "custom";

export interface SalesIntelProviderFactory {
  create(config: {
    apiKey: string;
    baseUrl?: string;
    [key: string]: unknown;
  }): SalesIntelligenceProvider;
}
