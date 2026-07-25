import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createConnector } from "@/lib/sales/crm/connector-factory";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

// ─── HubSpot webhook event types we handle ───

interface HubSpotWebhookEvent {
  eventId: number;
  subscriptionId: number;
  portalId: number;
  appId: number;
  occurredAt: number;
  subscriptionType: string;
  attemptNumber: number;
  objectId: number;
  objectType: string;
  propertyName?: string;
  propertyValue?: string;
  changeSource?: string;
  changeFlag?: string;
}

// ─── Verify HubSpot webhook signature ───

function verifySignature(
  signature: string | null,
  body: string,
  clientSecret: string,
): boolean {
  if (!signature) return false;
  const hash = crypto
    .createHmac("sha256", clientSecret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

// ─── POST /api/crm/webhook ───

export async function POST(request: Request) {
  const signature = request.headers.get("X-HubSpot-Signature");
  const body = await request.text();

  const clientSecret = process.env.HUBSPOT_WEBHOOK_SECRET;
  if (!clientSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  if (!verifySignature(signature, body, clientSecret)) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 },
    );
  }

  let events: HubSpotWebhookEvent[];
  try {
    events = JSON.parse(body) as HubSpotWebhookEvent[];
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!Array.isArray(events)) {
    return NextResponse.json(
      { error: "Expected array of events" },
      { status: 400 },
    );
  }

  const portalId = events[0]?.portalId;

  const connection = await prisma.crmConnection.findFirst({
    where: {
      provider: "hubspot",
      syncEnabled: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!connection) {
    return NextResponse.json(
      { error: "No active HubSpot connection" },
      { status: 404 },
    );
  }

  const connector = createConnector(connection);

  if (!connector.syncToLocal) {
    return NextResponse.json(
      { error: "Connector does not support syncToLocal" },
      { status: 500 },
    );
  }

  for (const event of events) {
    try {
      await processEvent(event, connector, connection.organizationId);
    } catch {
      await writePlatformAuditLog({
        productKey: "salesos",
        action: "crm.webhook.event_failed",
        platformOrganizationId: connection.organizationId,
        sourceSystem: "crm-webhook",
        actorId: "system",
        actorName: "HubSpot Webhook",
        targetType: "CrmConnection",
        targetId: connection.id,
        targetLabel: `Webhook event ${event.eventId}`,
        severity: "error",
        status: "failure",
        metadata: {
          eventId: event.eventId,
          subscriptionType: event.subscriptionType,
          objectId: event.objectId,
        },
      });
    }
  }

  return NextResponse.json({ received: events.length });
}

async function processEvent(
  event: HubSpotWebhookEvent,
  connector: ReturnType<typeof createConnector>,
  organizationId: string,
): Promise<void> {
  if (!connector.syncToLocal) return;

  const objectId = String(event.objectId);

  if (event.subscriptionType.startsWith("deal")) {
    const deals = await connector.fetchOpportunities();
    const deal = deals.find((d) => d.id === objectId);
    if (deal) {
      await connector.syncToLocal(organizationId, {
        accounts: [],
        contacts: [],
        opportunities: [deal],
      });
    }
  } else if (event.subscriptionType.startsWith("contact")) {
    const contacts = await connector.fetchContacts();
    const contact = contacts.find((c) => c.id === objectId);
    if (contact) {
      await connector.syncToLocal(organizationId, {
        accounts: [],
        contacts: [contact],
        opportunities: [],
      });
    }
  } else if (event.subscriptionType.startsWith("company")) {
    const accounts = await connector.fetchAccounts();
    const account = accounts.find((a) => a.id === objectId);
    if (account) {
      await connector.syncToLocal(organizationId, {
        accounts: [account],
        contacts: [],
        opportunities: [],
      });
    }
  }
}
