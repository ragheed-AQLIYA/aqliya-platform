import "server-only"
import { registerHandler } from "@/lib/platform/operations/queue-runtime"
import { sendEmail } from "./sender"
import type { QueueTask } from "@/lib/platform/operations/queue-runtime"

export function registerEmailHandler(): void {
  registerHandler("send_email", async (task: QueueTask) => {
    const { to, subject, body } = task.payload as {
      to: string
      subject: string
      body: string
    }

    if (!to) {
      throw new Error("send_email handler: missing 'to' in payload")
    }

    const result = await sendEmail({ to, subject, body })

    if (!result.success) {
      throw new Error(`send_email handler: delivery failed — ${result.error}`)
    }
  })

  console.log("[email] send_email handler registered")
}
