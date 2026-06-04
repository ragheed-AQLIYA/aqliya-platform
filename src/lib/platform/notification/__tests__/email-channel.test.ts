import { describe, expect, it, jest } from "@jest/globals";

// Mock process.env before importing the module
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
});

afterAll(() => {
  process.env = originalEnv;
});

describe("email channel - dev mode", () => {
  it("logs to console when SMTP is not configured", async () => {
    const { sendEmail } = await import("../email-channel");
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const result = await sendEmail({
      recipientEmail: "test@example.com",
      subject: "Test Subject",
      body: "Test body",
    });

    expect(result.success).toBe(true);
    expect(result.channel).toBe("email");
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("returns failure result on error gracefully", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user";
    process.env.SMTP_PASS = "pass";

    const { sendEmail } = await import("../email-channel");

    const result = await sendEmail({
      recipientEmail: "test@example.com",
      subject: "Test",
      body: "Test body",
    });

    // Will fail because SMTP is unreachable, but should not throw
    expect(result.success).toBe(false);
    expect(result.channel).toBe("email");
    expect(result.error).toBeTruthy();
  });
});
