// ─── EmailProvider Adapter — wraps function-based email into EmailProvider interface ───

import "server-only";
import { IntegrationType } from "@/lib/integration/types";
import type {
  EmailProvider,
  EmailSendOptions,
  EmailDeliveryResult,
  ConnectionTestResult,
  ProviderHealth,
} from "@/lib/integration/types";

export interface SmtpProviderConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
}

/**
 * Adapter that wraps SMTP configuration into the EmailProvider interface.
 * Uses nodemailer directly with pre-resolved credentials (no process.env reads).
 */
export class SmtpEmailProviderAdapter implements EmailProvider {
  readonly providerId = "smtp";
  readonly providerType = IntegrationType.EMAIL as const;

  private config: SmtpProviderConfig;

  constructor(config: SmtpProviderConfig) {
    this.config = config;
  }

  async send(options: EmailSendOptions): Promise<EmailDeliveryResult> {
    const deliveredAt = new Date();
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      });

      await transporter.sendMail({
        from: this.config.from,
        to: options.recipientEmail,
        subject: options.subject,
        text: options.body,
        ...(options.htmlBody ? { html: options.htmlBody } : {}),
      });

      return { success: true, deliveredAt };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown SMTP error";
      return { success: false, deliveredAt, error };
    }
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      });
      await transporter.verify();
      return { success: true, message: "SMTP connection verified" };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "SMTP verification failed",
      };
    }
  }

  async health(): Promise<ProviderHealth> {
    const startMs = Date.now();
    try {
      await this.testConnection();
      return {
        healthy: true,
        latencyMs: Date.now() - startMs,
        lastCheck: new Date(),
      };
    } catch {
      return {
        healthy: false,
        latencyMs: Date.now() - startMs,
        lastCheck: new Date(),
        error: "SMTP health check failed",
      };
    }
  }
}
