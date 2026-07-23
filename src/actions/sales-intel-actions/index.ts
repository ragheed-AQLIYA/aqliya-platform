/**
 * Sales Intelligence Server Actions — Barrel
 */
"use server";

import { getCurrentUser, enforce } from "@/lib/kernel";
import { createSalesIntelProvider } from "@/lib/sales/intelligence";
import type {
  SalesIntelProviderId,
  EnrichedCompany,
  EnrichedContact,
  CompanySearchCriteria,
  ContactSearchCriteria,
  WaterfallEnrichmentRequest,
  WaterfallEnrichmentResult,
} from "@/lib/sales/intelligence";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ── Helpers ──

async function getAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required");
  return user;
}

async function getProvider(providerId: SalesIntelProviderId) {
  await getAuth();
  return createSalesIntelProvider(providerId);
}

async function logIntelAction(
  user: Awaited<ReturnType<typeof getAuth>>,
  providerId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  try {
    await prisma.platformAuditLog.create({
      data: {
        platformOrganizationId: user.platformOrganizationId ?? undefined,
        productKey: "salesos",
        actorId: user.id,
        actorName: user.name ?? "unknown",
        action: `sales_intel.${action}`,
        targetType: "SalesIntelligence",
        targetId: providerId,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  } catch { /* non-blocking */ }
}

// ── Company Enrichment ──

export async function enrichCompanyAction(
  providerId: SalesIntelProviderId,
  domain: string,
): Promise<{ success: boolean; data?: EnrichedCompany; error?: string }> {
  try {
    const user = await getAuth();
    const provider = await getProvider(providerId);
    if (!provider.enrichCompany) {
      return { success: false, error: `${providerId} does not support company enrichment` };
    }
    const result = await provider.enrichCompany(domain);
    await logIntelAction(user, providerId, "enrich_company", { domain });
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Enrichment failed" };
  }
}

// ── Company Search ──

export async function searchCompaniesAction(
  providerId: SalesIntelProviderId,
  criteria: CompanySearchCriteria,
): Promise<{ success: boolean; data?: EnrichedCompany[]; total?: number; error?: string }> {
  try {
    const user = await getAuth();
    const provider = await getProvider(providerId);
    if (!provider.searchCompanies) {
      return { success: false, error: `${providerId} does not support company search` };
    }
    const result = await provider.searchCompanies(criteria);
    await logIntelAction(user, providerId, "search_companies", { count: result.length });
    return { success: true, data: result, total: result.length };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Search failed" };
  }
}

// ── Contact Finding ──

export async function findContactsAction(
  providerId: SalesIntelProviderId,
  criteria: ContactSearchCriteria,
): Promise<{ success: boolean; data?: EnrichedContact[]; total?: number; error?: string }> {
  try {
    const user = await getAuth();
    const provider = await getProvider(providerId);
    if (!provider.findContacts) {
      return { success: false, error: `${providerId} does not support contact finding` };
    }
    const result = await provider.findContacts(criteria);
    await logIntelAction(user, providerId, "find_contacts", { count: result.length });
    return { success: true, data: result, total: result.length };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Contact search failed" };
  }
}

// ── Email Verification ──

export async function verifyEmailAction(
  providerId: "apollo" | "clay",
  email: string,
): Promise<{ success: boolean; status?: string; confidence?: number; error?: string }> {
  try {
    const user = await getAuth();
    const provider = await getProvider(providerId);
    if (!provider.verifyEmail) {
      return { success: false, error: `${providerId} does not support email verification` };
    }
    const result = await provider.verifyEmail(email);
    await logIntelAction(user, providerId, "verify_email", { email });
    return { success: true, ...result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Verification failed" };
  }
}

// ── Waterfall Enrichment ──

export async function waterfallEnrichAction(
  request: WaterfallEnrichmentRequest,
): Promise<{ success: boolean; data?: WaterfallEnrichmentResult; error?: string }> {
  try {
    const user = await getAuth();
    const provider = await getProvider("clay");
    if (!provider.waterfallEnrich) {
      return { success: false, error: "Clay waterfall enrichment not available" };
    }
    const result = await provider.waterfallEnrich(request);
    await logIntelAction(user, "clay", "waterfall_enrich", { attempts: result.attempts });
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Waterfall enrichment failed" };
  }
}

// ── Health Check ──

export async function checkIntelProviderHealthAction(
  providerId: SalesIntelProviderId,
): Promise<{ success: boolean; status?: string; latencyMs?: number; rateLimitRemaining?: number; error?: string }> {
  try {
    const provider = await getProvider(providerId);
    const result = await provider.testConnection();
    const rateLimit = provider.getRateLimitState?.();
    return { success: result.success, status: result.success ? "healthy" : "unhealthy", latencyMs: result.latencyMs, rateLimitRemaining: rateLimit?.remaining, error: result.error };
  } catch (err) {
    return { success: false, status: "unhealthy", error: err instanceof Error ? err.message : "Health check failed" };
  }
}

// ── List Providers ──

export async function listIntelProvidersAction(): Promise<{ success: boolean; providers: SalesIntelProviderId[] }> {
  const { listRegisteredProviders } = await import("@/lib/sales/intelligence");
  return { success: true, providers: listRegisteredProviders() };
}

// ── Batch Enrichment ──

interface BatchEnrichResult {
  totalAccounts: number;
  enrichedAccounts: number;
  totalContacts: number;
  enrichedContacts: number;
  failedAccounts: string[];
  failedContacts: string[];
  durationMs: number;
}

export async function batchEnrichAccountsAction(
  providerOrder: ("apollo" | "ocean" | "clay")[] = ["apollo", "ocean", "clay"],
): Promise<{ success: boolean; data?: BatchEnrichResult; error?: string }> {
  const start = Date.now();
  const user = await getAuth();

  const result: BatchEnrichResult = { totalAccounts: 0, enrichedAccounts: 0, totalContacts: 0, enrichedContacts: 0, failedAccounts: [], failedContacts: [], durationMs: 0 };

  try {
    const accounts = await prisma.salesAccount.findMany({
      where: { organizationId: user.organizationId, status: "active" },
      select: { id: true, name: true, industry: true },
      take: 50,
    });
    result.totalAccounts = accounts.length;

    for (const account of accounts) {
      let enriched: EnrichedCompany | null = null;
      for (const providerId of providerOrder) {
        try {
          const resp = await enrichCompanyAction(providerId, account.name);
          if (resp.success && resp.data) { enriched = resp.data; break; }
        } catch { continue; }
      }
      if (enriched) {
        await prisma.salesAccount.update({
          where: { id: account.id },
          data: { industry: enriched.industry ?? account.industry, metadata: { enrichedAt: new Date().toISOString(), enrichedBy: enriched.source, employeeCount: enriched.employeeCount, revenue: enriched.revenue } as unknown as Prisma.InputJsonValue },
        });
        result.enrichedAccounts++;
      } else { result.failedAccounts.push(account.id); }
    }

    result.durationMs = Date.now() - start;
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Batch enrichment failed" };
  }
}

export async function enrichAccountContactsAction(
  accountId: string,
): Promise<{ success: boolean; data?: { contacts: EnrichedContact[]; total: number }; error?: string }> {
  const user = await getAuth();
  try {
    const account = await prisma.salesAccount.findFirst({ where: { id: accountId, organizationId: user.organizationId }, select: { id: true, name: true } });
    if (!account) return { success: false, error: "Account not found" };

    let contacts: EnrichedContact[] = [];
    try {
      const r = await findContactsAction("apollo", { keywords: [account.name], limit: 25 });
      if (r.success && r.data) contacts = r.data;
    } catch { /* fallback */ }

    if (contacts.length === 0) {
      try {
        const r = await waterfallEnrichAction({ companyName: account.name, providers: ["apollo", "linkedin"] });
        if (r.success && r.data?.contacts) contacts = r.data.contacts as EnrichedContact[];
      } catch { /* fallback */ }
    }

    for (const c of contacts.slice(0, 10)) {
      if (!c.email) continue;
      const exists = await prisma.salesContact.findFirst({ where: { email: c.email, organizationId: user.organizationId } });
      if (!exists) {
        await prisma.salesContact.create({ data: { organizationId: user.organizationId ?? "", accountId: account.id, name: c.fullName ?? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() ?? c.email, email: c.email, title: c.title, role: c.department, sensitivityLevel: "standard", createdById: user.id } });
      }
    }

    return { success: true, data: { contacts, total: contacts.length } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Contact enrichment failed" };
  }
}

// ── Outreach Campaign Actions ──

export async function createOutreachCampaignAction(params: {
  dealId: string;
  name: string;
  contactIds: string[];
  steps: Array<{ type: "email" | "linkedin_message" | "delay"; template?: string; subject?: string; delayDays?: number }>;
}): Promise<{ success: boolean; campaignId?: string; error?: string }> {
  const user = await getAuth();
  try {
    const deal = await prisma.salesDeal.findFirst({
      where: { id: params.dealId, organizationId: user.organizationId },
      select: { id: true, accountId: true },
    });
    if (!deal) return { success: false, error: "Deal not found" };

    // Try SmartLead first
    const stepsWithIds = params.steps.map((s, i) => ({
      id: `step-${Date.now()}-${i}`,
      type: s.type,
      template: s.template,
      subject: s.subject,
      delayDays: s.delayDays,
      conditions: {} as Record<string, unknown>,
    }));

    try {
      const provider = createSalesIntelProvider("smartlead");
      if (provider.createCampaign) {
        const campaign = await provider.createCampaign({
          name: params.name,
          steps: stepsWithIds,
          contactIds: params.contactIds,
        });

        await prisma.platformAuditLog.create({
          data: {
            platformOrganizationId: user.platformOrganizationId ?? undefined,
            productKey: "salesos",
            actorId: user.id,
            actorName: user.name ?? "unknown",
            action: "outreach.campaign_created",
            targetType: "SalesDeal",
            targetId: params.dealId,
            metadata: { campaignId: campaign.id, provider: "smartlead", contactCount: params.contactIds.length } as Prisma.InputJsonValue,
          },
        });

        return { success: true, campaignId: campaign.id };
      }
    } catch (err) {
      // SmartLead failed — try Apollo
      try {
        const provider = createSalesIntelProvider("apollo");
        if (provider.createCampaign) {
          const campaign = await provider.createCampaign({
            name: params.name,
            steps: stepsWithIds,
            contactIds: params.contactIds,
          });
          return { success: true, campaignId: campaign.id };
        }
      } catch {
        return { success: false, error: "All outreach providers failed" };
      }
    }

    return { success: false, error: "No outreach provider available" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Campaign creation failed" };
  }
}

export async function getOutreachEventsAction(dealId: string): Promise<{
  success: boolean;
  events?: Array<{
    id: string;
    type: string;
    contactName: string;
    contactEmail: string;
    occurredAt: string;
  }>;
  error?: string;
}> {
  try {
    const user = await getAuth();
    const deal = await prisma.salesDeal.findFirst({
      where: { id: dealId, organizationId: user.organizationId },
      select: { id: true, accountId: true },
    });
    if (!deal) return { success: false, error: "Deal not found" };

    const events = await prisma.salesAuditEvent.findMany({
      where: {
        organizationId: user.organizationId,
        targetType: "SalesDeal",
        targetId: dealId,
        action: { startsWith: "outreach." },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, action: true, actorName: true, createdAt: true, metadata: true },
    });

    return {
      success: true,
      events: events.map((e) => ({
        id: e.id,
        type: e.action.replace("outreach.", ""),
        contactName: e.actorName ?? "جهة اتصال",
        contactEmail: (e.metadata as Record<string, unknown>)?.contactEmail as string ?? "",
        occurredAt: e.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to fetch events" };
  }
}

export async function getOutreachAnalyticsAction(): Promise<{
  success: boolean;
  data?: {
    totalSent: number;
    totalOpened: number;
    totalReplied: number;
    totalBounced: number;
    totalMeetings: number;
    openRate: number;
    replyRate: number;
    activeCampaigns: number;
  };
  error?: string;
}> {
  try {
    const user = await getAuth();

    const events = await prisma.salesAuditEvent.findMany({
      where: {
        organizationId: user.organizationId,
        action: { startsWith: "outreach." },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { action: true },
    });

    const counts = {
      sent: events.filter((e) => e.action.includes("sent")).length,
      opened: events.filter((e) => e.action.includes("opened")).length,
      replied: events.filter((e) => e.action.includes("replied")).length,
      bounced: events.filter((e) => e.action.includes("bounced")).length,
      meetings: events.filter((e) => e.action.includes("meeting")).length,
    };

    return {
      success: true,
      data: {
        totalSent: counts.sent,
        totalOpened: counts.opened,
        totalReplied: counts.replied,
        totalBounced: counts.bounced,
        totalMeetings: counts.meetings,
        openRate: counts.sent > 0 ? (counts.opened / counts.sent) * 100 : 0,
        replyRate: counts.sent > 0 ? (counts.replied / counts.sent) * 100 : 0,
        activeCampaigns: 0,
      },
    };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Analytics failed" };
  }
}

// ── Lead Scoring ──

export async function scoreDealLeadsAction(dealId: string): Promise<{
  success: boolean;
  data?: {
    score: number;
    level: "hot" | "warm" | "cold";
    factors: Array<{ name: string; score: number; weight: number }>;
    recommendation: string;
  };
  error?: string;
}> {
  const user = await getAuth();
  try {
    const deal = await prisma.salesDeal.findFirst({
      where: { id: dealId, organizationId: user.organizationId },
      select: {
        id: true,
        title: true,
        amount: true,
        pipelineStage: true,
        status: true,
        accountId: true,
        metadata: true,
      },
    });
    if (!deal) return { success: false, error: "Deal not found" };

    // Scoring factors
    const factors: Array<{ name: string; score: number; weight: number }> = [];

    // Factor 1: Enrichment data quality (from metadata)
    const enriched = (deal.metadata as Record<string, unknown> | null) ?? {};
    const hasEnrichedData = enriched.enrichedAt ? 1 : 0;
    factors.push({ name: "بيانات مُثراة", score: hasEnrichedData * 100, weight: 0.25 });

    // Factor 2: Deal amount
    const amount = deal.amount ?? 0;
    const amountScore = amount > 100000 ? 100 : amount > 50000 ? 70 : amount > 10000 ? 40 : 20;
    factors.push({ name: "قيمة الصفقة", score: amountScore, weight: 0.30 });

    // Factor 3: Stage progression
    const stageScores: Record<string, number> = {
      closed_won: 100, negotiation: 85, qualified: 70,
      proposal: 60, contacted: 40, open: 25, lead: 10,
    };
    const stageScore = stageScores[deal.pipelineStage] ?? 25;
    factors.push({ name: "مرحلة الصفقة", score: stageScore, weight: 0.25 });

    // Factor 4: Outreach engagement (from audit events)
    const outreachEvents = await prisma.salesAuditEvent.findMany({
      where: {
        organizationId: user.organizationId,
        targetType: "SalesDeal",
        targetId: dealId,
        action: { startsWith: "outreach." },
      },
      select: { action: true },
    });

    const replies = outreachEvents.filter((e) => e.action.includes("replied")).length;
    const meetings = outreachEvents.filter((e) => e.action.includes("meeting")).length;
    const engagementScore = Math.min(100, replies * 30 + meetings * 50);
    factors.push({ name: "تفاعل التواصل", score: engagementScore, weight: 0.20 });

    // Calculate weighted score
    const totalScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
    const level = totalScore >= 70 ? "hot" : totalScore >= 40 ? "warm" : "cold";

    const recommendations: Record<string, string> = {
      hot: "🎯 فرصة ساخنة — تواصل فوراً لحجز اجتماع",
      warm: "🌡️ فرصة دافئة — عزز التواصل وقدم عرضاً مخصصاً",
      cold: "❄️ فرصة باردة — حسّن البيانات وأعد تقييم ICP",
    };

    // Save score to deal metadata
    await prisma.salesDeal.update({
      where: { id: dealId },
      data: {
        metadata: {
          ...(deal.metadata as Record<string, unknown> ?? {}),
          leadScore: totalScore,
          leadLevel: level,
          scoredAt: new Date().toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      success: true,
      data: {
        score: Math.round(totalScore),
        level,
        factors,
        recommendation: recommendations[level],
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Lead scoring failed",
    };
  }
}

// Re-export autoEnrich as wrapper to satisfy "use server" constraints
import { autoEnrichAccount as _autoEnrichAccount } from "./auto-enrich";
export async function autoEnrichAccount(accountId: string, accountName: string, organizationId: string) {
  return _autoEnrichAccount(accountId, accountName, organizationId);
}
