jest.mock("@/lib/platform/rate-limit", () => ({
  getRateLimiterProvider: jest.fn(),
}));

import { getRateLimiterProvider } from "@/lib/platform/rate-limit";
import { enforceAuditRateLimit, resetRateLimit } from "../rate-limit";

const mockProvider = {
  type: "memory" as const,
  increment: jest.fn(),
  reset: jest.fn(),
  healthCheck: jest.fn(),
};

const actor = {
  actorId: "user-123",
  actorName: "Audit Reviewer",
  actorRole: "manager",
  organizationId: "org-456",
};

describe("audit rate-limit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getRateLimiterProvider as jest.Mock).mockReturnValue(mockProvider);
    mockProvider.increment.mockResolvedValue({
      allowed: true,
      remaining: 29,
      resetAt: Date.now() + 60_000,
    });
    mockProvider.reset.mockResolvedValue(undefined);
  });

  it("uses the actor + action composite key and category-specific limit", async () => {
    await enforceAuditRateLimit(actor, "evidence.download", "download");

    expect(mockProvider.increment).toHaveBeenCalledWith(
      "org-456:user-123:evidence.download",
      60_000,
      30,
    );
  });

  it("falls back to the default limit when no category is provided", async () => {
    await enforceAuditRateLimit(actor, "notes.view");

    expect(mockProvider.increment).toHaveBeenCalledWith(
      "org-456:user-123:notes.view",
      60_000,
      60,
    );
  });

  it("throws a user-facing error when the provider blocks the request", async () => {
    mockProvider.increment.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    await expect(
      enforceAuditRateLimit(actor, "exports.generate", "export"),
    ).rejects.toThrow("Rate limit exceeded. Please try again later.");
  });

  it("resets the same composite key", async () => {
    await resetRateLimit(actor, "exports.generate");

    expect(mockProvider.reset).toHaveBeenCalledWith(
      "org-456:user-123:exports.generate",
    );
  });
});
