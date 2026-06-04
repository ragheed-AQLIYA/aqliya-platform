import "server-only";
import type { DeliveryResult, NotificationSeverity } from "./types";

export interface EmailOptions {
  recipientEmail: string;
  subject: string;
  body: string;
  severity?: NotificationSeverity;
}

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587", 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? "noreply@aqliya.ai",
    secure: process.env.SMTP_SECURE === "true",
  };
}

function isSmtpConfigured(config: ReturnType<typeof getSmtpConfig>): boolean {
  return !!(config.host && config.user && config.pass);
}

function buildHtmlBody(body: string, subject: string): string {
  const dir = /[\u0600-\u06FF]/.test(body) ? "rtl" : "ltr";
  return `<!DOCTYPE html>
<html dir="${dir}">
<head><meta charset="utf-8"><title>${subject}</title></head>
<body style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
    <div style="text-align: ${dir === "rtl" ? "right" : "left"};">
      ${body.split("\n").map((p) => `<p style="margin: 8px 0;">${p}</p>`).join("")}
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #888; font-size: 12px; text-align: center;">
      ${dir === "rtl" ? "عقلية - منصة الذكاء المؤسسي" : "AQLIYA - Institutional Intelligence Platform"}
    </p>
  </div>
</body>
</html>`;
}

export async function sendEmail(options: EmailOptions): Promise<DeliveryResult> {
  const deliveredAt = new Date();
  const config = getSmtpConfig();

  if (!isSmtpConfigured(config)) {
    console.log("[Notification][Email] SMTP not configured. Dev mode log:");
    console.log(`  To: ${options.recipientEmail}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Body: ${options.body.slice(0, 200)}...`);
    return {
      channel: "email",
      success: true,
      deliveredAt,
    };
  }

  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: config.host!,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const html = buildHtmlBody(options.body, options.subject);

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
    console.error("[Notification][Email] Send failed:", error);
    return { channel: "email", success: false, error, deliveredAt };
  }
}
