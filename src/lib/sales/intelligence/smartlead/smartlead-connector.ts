/**
 * SmartLead Connector — Email Outreach Automation
 *
 * API: https://api.smartlead.ai
 * Auth: API Key (Bearer token)
 * Key value: Campaign sending, reply detection, meeting booking
 * Webhooks: email events (sent, opened, replied, bounced, meeting_booked)
 */
import "server-only";
import { BaseApiKeyConnector } from "../base-connector";
import type {
  SalesIntelligenceProvider,
  OutreachCampaign,
  OutreachStep,
  OutreachEvent,
} from "../types";

interface SmartLeadCampaign {
  id: string;
  name: string;
  status: string;
  sequences: Array<{
    id: string;
    type: string;
    subject?: string;
    body?: string;
    delay_days?: number;
  }>;
  stats?: {
    total_leads?: number;
    sent_count?: number;
    open_count?: number;
    reply_count?: number;
    bounce_count?: number;
    meetings_booked?: number;
  };
  created_at: string;
}

interface SmartLeadEvent {
  id: string;
  campaign_id: string;
  lead_id: string;
  event_type: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class SmartLeadConnector
  extends BaseApiKeyConnector
  implements SalesIntelligenceProvider
{
  readonly providerId = "smartlead";
  readonly providerName = "SmartLead AI";

  constructor(config: { apiKey: string }) {
    super({
      apiKey: config.apiKey,
      baseUrl: "https://api.smartlead.ai/api/v1",
      maxRetries: 3,
      requestTimeout: 30_000,
    });
  }

  protected async healthCheck(): Promise<void> {
    await this.request({ path: "/campaigns?limit=1" });
  }

  // ── Campaign Management ──

  async createCampaign(config: {
    name: string;
    steps: OutreachStep[];
    contactIds: string[];
  }): Promise<OutreachCampaign> {
    const response = await this.request<{ campaign: SmartLeadCampaign }>({
      path: "/campaigns",
      method: "POST",
      body: {
        name: config.name,
        lead_ids: config.contactIds,
        sequences: config.steps.map((s) => ({
          type: s.type === "linkedin_message" ? "linkedin" : "email",
          subject: s.subject,
          body: s.template,
          delay_days: s.delayDays ?? 3,
        })),
      },
    });

    const c = response.data.campaign;
    return {
      id: c.id,
      name: c.name,
      status: c.status as OutreachCampaign["status"],
      sequenceSteps: config.steps,
      targetCount: c.stats?.total_leads ?? config.contactIds.length,
      sentCount: c.stats?.sent_count ?? 0,
      openCount: c.stats?.open_count ?? 0,
      replyCount: c.stats?.reply_count ?? 0,
      bounceCount: c.stats?.bounce_count ?? 0,
      meetingCount: c.stats?.meetings_booked ?? 0,
      createdAt: new Date(c.created_at),
    };
  }

  async getCampaign(campaignId: string): Promise<OutreachCampaign> {
    const response = await this.request<{ campaign: SmartLeadCampaign }>({
      path: `/campaigns/${campaignId}`,
    });

    const c = response.data.campaign;
    return {
      id: c.id,
      name: c.name,
      status: c.status as OutreachCampaign["status"],
      sequenceSteps: c.sequences.map(
        (s: { id: string; type: string; subject?: string; body?: string; delay_days?: number }) => ({
          id: s.id,
          type: s.type === "linkedin" ? "linkedin_message" : "email",
          subject: s.subject,
          template: s.body,
          delayDays: s.delay_days,
        }),
      ),
      targetCount: c.stats?.total_leads ?? 0,
      sentCount: c.stats?.sent_count ?? 0,
      openCount: c.stats?.open_count ?? 0,
      replyCount: c.stats?.reply_count ?? 0,
      bounceCount: c.stats?.bounce_count ?? 0,
      meetingCount: c.stats?.meetings_booked ?? 0,
      createdAt: new Date(c.created_at),
    };
  }

  async getOutreachEvents(since?: Date): Promise<OutreachEvent[]> {
    const params: Record<string, string> = {};
    if (since) params.from = since.toISOString();

    const response = await this.request<{ events: SmartLeadEvent[] }>({
      path: "/events",
      query: params,
    });

    return (response.data.events ?? []).map(
      (e: SmartLeadEvent): OutreachEvent => ({
        id: e.id,
        campaignId: e.campaign_id,
        contactId: e.lead_id,
        type: this.mapEventType(e.event_type),
        occurredAt: new Date(e.timestamp),
        metadata: e.metadata,
      }),
    );
  }

  // ── Webhook Event Processing (called by webhook receiver) ──

  static processWebhookEvent(body: Record<string, unknown>): OutreachEvent {
    return {
      id: (body.event_id as string) ?? `evt-${Date.now()}`,
      campaignId: (body.campaign_id as string) ?? "",
      contactId: (body.lead_id as string) ?? "",
      type: (body.event_type as OutreachEvent["type"]) ?? "sent",
      occurredAt: body.timestamp
        ? new Date(body.timestamp as string)
        : new Date(),
      metadata: body.metadata as Record<string, unknown> | undefined,
    };
  }

  private mapEventType(slType: string): OutreachEvent["type"] {
    const map: Record<string, OutreachEvent["type"]> = {
      EMAIL_SENT: "sent",
      EMAIL_OPENED: "opened",
      EMAIL_CLICKED: "clicked",
      EMAIL_REPLIED: "replied",
      EMAIL_BOUNCED: "bounced",
      EMAIL_UNSUBSCRIBED: "unsubscribed",
      MEETING_BOOKED: "meeting_booked",
    };
    return map[slType] ?? "sent";
  }
}
