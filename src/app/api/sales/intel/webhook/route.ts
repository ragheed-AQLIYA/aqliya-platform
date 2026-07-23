/**
 * POST /api/sales/intel/webhook
 *
 * Generic webhook receiver for Sales Intelligence providers.
 * Supports: Apollo, SmartLead, HubSpot, custom.
 *
 * Headers required:
 *   X-Webhook-Provider: apollo|smartlead|hubspot|custom
 *   X-Webhook-Signature: HMAC-SHA256 signature
 */
import { NextRequest, NextResponse } from "next/server";
import { receiveWebhook } from "@/lib/sales/intelligence/webhook/receiver";
import type { WebhookProvider } from "@/lib/sales/intelligence/webhook/receiver";

// Import handlers at module load — registers SmartLead/Apollo event processors
import "@/lib/sales/intelligence/webhook/salesos-handlers";

export async function POST(request: NextRequest) {
  try {
    const providerId = request.headers.get("x-webhook-provider") as
      | WebhookProvider
      | null;
    const signature = request.headers.get("x-webhook-signature") ?? "";

    if (!providerId) {
      return NextResponse.json(
        { error: "Missing X-Webhook-Provider header" },
        { status: 400 },
      );
    }

    const validProviders: WebhookProvider[] = [
      "apollo",
      "smartlead",
      "hubspot",
      "custom",
    ];
    if (!validProviders.includes(providerId)) {
      return NextResponse.json(
        { error: `Unknown provider: ${providerId}` },
        { status: 400 },
      );
    }

    const body = await request.text();

    // Resolve webhook secret from environment or vault
    const secretEnvKey = `${providerId.toUpperCase()}_WEBHOOK_SECRET`;
    const webhookSecret = process.env[secretEnvKey] ?? "";

    if (!webhookSecret) {
      console.warn(`[Webhook] No secret configured for ${providerId}`);
    }

    const result = await receiveWebhook(
      {
        providerId,
        webhookSecret,
        enabled: true,
        organizationId: "system", // Tenant resolved from webhook payload
      },
      body,
      signature,
      Object.fromEntries(request.headers.entries()),
    );

    if (!result.accepted) {
      return NextResponse.json(
        { error: result.error ?? "Webhook rejected", eventId: result.eventId },
        { status: 403 },
      );
    }

    return NextResponse.json({
      accepted: true,
      eventId: result.eventId,
    });
  } catch (err) {
    console.error(
      "[Webhook] Error:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { error: "Internal webhook processing error" },
      { status: 500 },
    );
  }
}
