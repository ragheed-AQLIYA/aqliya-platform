// ─── Email Provider Factory — SecretResolver-backed Credential Resolution ───
// All email/SMTP credentials SHOULD be resolved through this factory,
// never read directly from process.env by email provider code.
//
// Pattern: try SecretResolver → catch → fall back to process.env SMTP config

import "server-only";
import { secretResolver, SecretPurpose } from "@/lib/integration/secret-resolver";
import { sendEmail } from "./email-channel";
import type { DeliveryResult } from "./types";

export interface EmailOptions {
  recipientEmail: string;
  subject: string;
  body: string;
  severity?: import("./types").NotificationSeverity;
}

export interface ResolvedSmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
}

/**
 * Resolve SMTP configuration via SecretResolver.
 * Falls back to process.env SMTP_* variables when resolver is unavailable.
 */
export async function resolveSmtpConfigFromResolver(
  organizationId: string,
): Promise<ResolvedSmtpConfig | null> {
  const secretResult = await secretResolver
    .getIntegrationSecretByType(
      organizationId,
      "EMAIL",
      "smtp",
      SecretPurpose.EMAIL_SEND,
    )
    .catch(() => null);

  if (!secretResult) {
    return null;
  }

  const host = secretResult.credentials.host ?? secretResult.credentials.smtpHost;
  const port = secretResult.credentials.port ?? secretResult.credentials.smtpPort;
  const user = secretResult.credentials.user ?? secretResult.credentials.smtpUser;
  const pass = secretResult.credentials.pass ?? secretResult.credentials.smtpPass;
  const from = secretResult.credentials.from ?? secretResult.credentials.smtpFrom;
  const secure = secretResult.credentials.secure ?? secretResult.credentials.smtpSecure;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port: parseInt(String(port), 10) || 587,
    user,
    pass,
    from: from || "noreply@aqliya.ai",
    secure: String(secure) === "true",
  };
}

/**
 * Send an email with SecretResolver-backed credential resolution.
 * Resolves SMTP config from vault when available, falls back to process.env.
 */
export async function sendEmailFromResolver(
  options: EmailOptions,
  organizationId: string,
): Promise<DeliveryResult> {
  const smtpConfig = await resolveSmtpConfigFromResolver(organizationId).catch(
    () => null,
  );

  if (smtpConfig) {
    // Send with resolved SMTP config directly (bypass sendEmail's env read)
    return sendWithResolvedConfig(options, smtpConfig);
  }

  // Fall back to env-based sendEmail
  return sendEmail(options);
}

/**
 * Send an email using explicitly resolved SMTP config.
 * No process.env reads — the config has already been resolved from vault.
 */
async function sendWithResolvedConfig(
  options: EmailOptions,
  config: ResolvedSmtpConfig,
): Promise<DeliveryResult> {
  const deliveredAt = new Date();

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const dir = /[\u0600-\u06FF]/.test(options.body) ? "rtl" : "ltr";
    const html = `<!DOCTYPE html>
<html dir="${dir}">
<head><meta charset="utf-8"><title>${options.subject}</title></head>
<body style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
    <div style="text-align: ${dir === "rtl" ? "right" : "left"};">
      ${options.body.split("\n").map((p) => `<p style="margin: 8px 0;">${p}</p>`).join("")}
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #888; font-size: 12px; text-align: center;">
      ${dir === "rtl" ? "عقلية - منصة الذكاء المؤسسي" : "AQLIYA - Institutional Intelligence Platform"}
    </p>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: config.from,
      to: options.recipientEmail,
      subject: options.subject,
      text: options.body,
      html,
    });

    return { channel: "email", success: true, deliveredAt };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown SMTP error";
    console.error("[EmailFactory] Send failed:", error);
    return { channel: "email", success: false, error, deliveredAt };
  }
}
