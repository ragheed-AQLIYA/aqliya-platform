import { sendEmail } from "../sender"
import { registerEmailHandler } from "../handler"
import { registerHandler } from "../../operations/queue-runtime"

describe("Email Sender — SMTP Delivery Test", () => {
  const origEnv = process.env

  beforeEach(() => {
    process.env = { ...origEnv }
    delete process.env.NOTIFICATIONS_SMTP_HOST
    process.env.FF_QUEUE_ENABLED = "false"
  })

  afterAll(() => {
    process.env = origEnv
  })

  it("sends with dev fallback when SMTP not configured", async () => {
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      body: "Test body content",
    })
    expect(result.success).toBe(true)
    expect(result.messageId).toBe("dev-fallback")
  })

  it("handles empty recipient gracefully", async () => {
    const result = await sendEmail({
      to: "",
      subject: "Test",
      body: "Body",
    })
    expect(result.success).toBe(true)
    expect(result.messageId).toBe("dev-fallback")
  })

  it("registerEmailHandler registers send_email handler", () => {
    expect(() => registerEmailHandler()).not.toThrow()
  })

  it("handler rejects duplicate registration", () => {
    expect(() => registerEmailHandler()).toThrow(
      "Handler already registered for queue type: send_email",
    )
  })
})
