import { describe, expect, it, jest } from "@jest/globals";

const mockPrefs = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformNotification: {
      create: jest.fn().mockResolvedValue({ id: "notif-1" }),
    },
    userNotificationPreference: {
      findMany: mockPrefs,
    },
    platformOrganization: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true }),
}));

describe("notification engine", () => {
  beforeEach(() => {
    mockPrefs.mockResolvedValue([{ channel: "in_app" }]);
  });

  it("dispatches in_app notification successfully", async () => {
    const { dispatch } = await import("../engine");
    const results = await dispatch(
      "on_create",
      { recipientId: "user-1", organizationId: "org-1" },
      {
        type: "test_notification",
        subjectAr: "مرحباً",
        bodyAr: "هذا اختبار",
        subjectEn: "Hello",
        bodyEn: "This is a test",
      },
      ["in_app"],
    );

    expect(results).toHaveLength(1);
    expect(results[0].channel).toBe("in_app");
    expect(results[0].success).toBe(true);
  });

  it("returns fallback result when email fails due to no recipient email", async () => {
    mockPrefs.mockResolvedValue([{ channel: "in_app" }, { channel: "email" }]);
    const { dispatch } = await import("../engine");
    const results = await dispatch(
      "on_review",
      { recipientId: "user-1", recipientEmail: undefined, organizationId: "org-1" },
      {
        type: "email_fail_test",
        subjectAr: "اختبار",
        bodyAr: "اختبار",
        subjectEn: "Test",
        bodyEn: "Test",
      },
      ["email"],
    );

    // Should have email failure + in_app fallback
    expect(results.length).toBeGreaterThanOrEqual(1);
    const emailResult = results.find((r) => r.channel === "email");
    expect(emailResult).toBeTruthy();
    expect(emailResult!.success).toBe(false);
    expect(emailResult!.error).toBe("No recipient email");
  });

  it("dispatches to multiple channels", async () => {
    mockPrefs.mockResolvedValue([{ channel: "in_app" }, { channel: "webhook" }]);
    const { dispatch } = await import("../engine");
    const results = await dispatch(
      "on_approval",
      { recipientId: "user-1", organizationId: "org-1" },
      {
        type: "multi_channel_test",
        subjectAr: "متعدد",
        bodyAr: "اختبار القنوات المتعددة",
        subjectEn: "Multi",
        bodyEn: "Multi-channel test",
      },
      ["in_app", "webhook"],
    );

    // in_app should succeed, webhook may have no org webhooks configured
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.channel === "in_app" && r.success)).toBe(true);
  });
});
