import nodemailer from "nodemailer"
import type { SentMessageInfo } from "nodemailer"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"

export interface SendEmailInput {
  to: string
  subject: string
  body: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

let transporter: nodemailer.Transporter<SentMessageInfo> | null = null

function getTransporter(): nodemailer.Transporter<SentMessageInfo> | null {
  if (transporter) return transporter

  const host = process.env.NOTIFICATIONS_SMTP_HOST
  if (host) {
    const port = parseInt(process.env.NOTIFICATIONS_SMTP_PORT || "587", 10)
    const user = process.env.NOTIFICATIONS_SMTP_USER
    const pass = process.env.NOTIFICATIONS_SMTP_PASS
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    })
  } else {
    console.warn("[email] No SMTP configured — emails will be logged only")
  }

  return transporter
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const t = getTransporter()

  if (!t) {
    console.log("[email] Dev fallback — would send:", { to: input.to, subject: input.subject })
    await writePlatformAuditLog({
      productKey: "platform",
      action: "email.dev_fallback",
      targetType: "email",
      targetId: input.to,
      actorId: "system",
      severity: "info",
      sourceSystem: "email_sender",
      metadata: { subject: input.subject, devFallback: true },
    })
    return { success: true, messageId: "dev-fallback" }
  }

  try {
    const from = process.env.NOTIFICATIONS_EMAIL_FROM || "noreply@aqliya.com"
    const info = await t.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.body,
    })

    await writePlatformAuditLog({
      productKey: "platform",
      action: "email.sent",
      targetType: "email",
      targetId: input.to,
      actorId: "system",
      severity: "info",
      sourceSystem: "email_sender",
      metadata: { messageId: info.messageId, subject: input.subject },
    })

    return { success: true, messageId: info.messageId }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[email] Send failed:", msg)

    await writePlatformAuditLog({
      productKey: "platform",
      action: "email.send_failed",
      targetType: "email",
      targetId: input.to,
      actorId: "system",
      severity: "error",
      sourceSystem: "email_sender",
      metadata: { error: msg, subject: input.subject },
    })

    return { success: false, error: msg }
  }
}
