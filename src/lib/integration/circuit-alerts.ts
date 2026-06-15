// ─── Circuit Breaker Alerts — Notify When a Circuit Opens ───
// Triggers email and/or webhook notifications when a provider circuit
// transitions from closed → open, indicating persistent failures.
//
// Configurable per organization via configMetadata on TenantIntegration.

import "server-only";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { IntegrationType } from "./types";

// ═══════════════════════════════════════════════════
//  ALERT CONFIG
// ═══════════════════════════════════════════════════

export interface CircuitAlertConfig {
  /** Email recipients to notify (comma-separated) */
  emailRecipients?: string;
  /** Webhook URL for Slack/Teams */
  webhookUrl?: string;
  /** Whether email alerts are enabled */
  emailEnabled: boolean;
  /** Whether webhook alerts are enabled */
  webhookEnabled: boolean;
}

const DEFAULT_CONFIG: CircuitAlertConfig = {
  emailEnabled: false,
  webhookEnabled: false,
};

// ═══════════════════════════════════════════════════
//  NOTIFICATION LOGIC
// ═══════════════════════════════════════════════════

/**
 * Send a circuit open alert notification.
 * Called when recordFailure() transitions a circuit from closed → open.
 */
export async function notifyCircuitOpen(
  organizationId: string,
  type: IntegrationType,
  provider: string,
  consecutiveFailures: number,
  config?: Partial<CircuitAlertConfig>,
): Promise<void> {
  const cfg: CircuitAlertConfig = { ...DEFAULT_CONFIG, ...config };
  const subject = `[AQLIYA] 🔴 Circuit Open: ${type}/${provider}`;
  const text = [
    `Provider circuit has opened for organization ${organizationId}.`,
    ``,
    `Type: ${type}`,
    `Provider: ${provider}`,
    `Consecutive Failures: ${consecutiveFailures}`,
    `Time: ${new Date().toISOString()}`,
    ``,
    `Automatic half-open probe will occur after 30 seconds.`,
    `Manual reset: call resetCircuit("${organizationId}", "${type}", "${provider}")`,
  ].join("\n");

  // 1. Write to platform audit log
  await writePlatformAuditLog({
    productKey: "integration-layer",
    action: "circuit_opened",
    targetType: "TenantIntegration",
    targetLabel: `${type}/${provider}`,
    severity: "warning",
    platformOrganizationId: organizationId,
    metadata: {
      provider,
      type,
      consecutiveFailures,
      alertSent: cfg.emailEnabled || cfg.webhookEnabled,
    } as Record<string, unknown>,
  }).catch(() => {});

  // 2. Email alert
  if (cfg.emailEnabled && cfg.emailRecipients) {
    try {
      const { sendEmail } = await import(
        "@/lib/platform/notification/email-channel"
      );
      for (const recipient of cfg.emailRecipients.split(",").map((s) => s.trim()).filter(Boolean)) {
        await sendEmail({
          recipientEmail: recipient,
          subject,
          body: text,
          severity: "critical",
        }).catch(() => {});
      }
    } catch {
      // Email failure should not break alert flow
    }
  }

  // 3. Webhook alert (Slack/Teams)
  if (cfg.webhookEnabled && cfg.webhookUrl) {
    try {
      await fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: subject,
          attachments: [
            {
              color: "danger",
              title: `Circuit Open: ${type}/${provider}`,
              text,
              fields: [
                { title: "Organization", value: organizationId, short: true },
                { title: "Type", value: type, short: true },
                { title: "Provider", value: provider, short: true },
                { title: "Failures", value: String(consecutiveFailures), short: true },
              ],
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        }),
      });
    } catch {
      // Webhook failure should not break alert flow
    }
  }
}

/**
 * Notify when a circuit recovers (half-open → closed).
 */
export async function notifyCircuitRecovered(
  organizationId: string,
  type: IntegrationType,
  provider: string,
  config?: Partial<CircuitAlertConfig>,
): Promise<void> {
  await writePlatformAuditLog({
    productKey: "integration-layer",
    action: "circuit_recovered",
    targetType: "TenantIntegration",
    targetLabel: `${type}/${provider}`,
    severity: "info",
    platformOrganizationId: organizationId,
    metadata: {
      provider,
      type,
      recoveredAt: new Date().toISOString(),
    } as Record<string, unknown>,
  }).catch(() => {});

  const cfg: CircuitAlertConfig = { ...DEFAULT_CONFIG, ...config };
  if (!cfg.emailEnabled && !cfg.webhookEnabled) return;

  const subject = `[AQLIYA] 🟢 Circuit Recovered: ${type}/${provider}`;
  const text = [
    `Provider circuit has recovered for organization ${organizationId}.`,
    ``,
    `Type: ${type}`,
    `Provider: ${provider}`,
    `Time: ${new Date().toISOString()}`,
  ].join("\n");

  if (cfg.emailEnabled && cfg.emailRecipients) {
    try {
      const { sendEmail } = await import(
        "@/lib/platform/notification/email-channel"
      );
      for (const recipient of cfg.emailRecipients.split(",").map((s) => s.trim()).filter(Boolean)) {
        await sendEmail({
          recipientEmail: recipient,
          subject,
          body: text,
          severity: "info",
        }).catch(() => {});
      }
    } catch {}
  }

  if (cfg.webhookEnabled && cfg.webhookUrl) {
    try {
      await fetch(cfg.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: subject,
          attachments: [{
            color: "good",
            title: `Circuit Recovered: ${type}/${provider}`,
            text,
          }],
        }),
      });
    } catch {}
  }
}
