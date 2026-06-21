/** @jest-environment node */

const mockFindMany = jest.fn();
const mockUpdateMany = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformOutboxEvent: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
  },
}));

jest.mock("@/lib/platform/feature-flags/registry", () => ({
  isEnabled: jest.fn(() => true),
}));

import { retryFailedOutboxEvents } from "@/lib/core/events/outbox-service";

describe("retryFailedOutboxEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindMany.mockResolvedValue([{ id: "evt-1" }, { id: "evt-2" }]);
    mockUpdateMany.mockResolvedValue({ count: 2 });
  });

  it("resets failed events to pending", async () => {
    const result = await retryFailedOutboxEvents({ limit: 10 });
    expect(result.retried).toBe(2);
    expect(result.ids).toEqual(["evt-1", "evt-2"]);
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["evt-1", "evt-2"] } },
        data: expect.objectContaining({ status: "pending", attempts: 0 }),
      }),
    );
  });
});
