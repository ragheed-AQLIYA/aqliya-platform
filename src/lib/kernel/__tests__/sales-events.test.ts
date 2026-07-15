jest.mock("@/lib/kernel/publish", () => ({
  publishDomainEvent: jest.fn().mockResolvedValue(undefined),
}));

import { publishSalesEvent, SALES_EVENTS } from "../events/sales-events";
import { publishDomainEvent } from "../publish";

describe("Sales Events", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("defines all expected sales event actions", () => {
    expect(SALES_EVENTS.DEAL_CREATED).toBe("deal.created");
    expect(SALES_EVENTS.DEAL_STAGE_CHANGED).toBe("deal.stage_changed");
    expect(SALES_EVENTS.DEAL_STATUS_CHANGED).toBe("deal.status_changed");
    expect(SALES_EVENTS.DEAL_WON).toBe("deal.won");
    expect(SALES_EVENTS.DEAL_LOST).toBe("deal.lost");
  });

  it("publishes a deal created event", async () => {
    await publishSalesEvent(SALES_EVENTS.DEAL_CREATED, {
      actorId: "user-1",
      organizationId: "org-1",
      resourceId: "deal-1",
      metadata: { title: "Test Deal" },
    });

    expect(publishDomainEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        productSlug: "salesos",
        domain: "sales",
        action: "deal.created",
        organizationId: "org-1",
        resourceId: "deal-1",
      }),
    );
  });

  it("publishes a deal won event with metadata", async () => {
    await publishSalesEvent(SALES_EVENTS.DEAL_WON, {
      actorId: "user-1",
      organizationId: "org-1",
      resourceId: "deal-1",
      metadata: { amount: 50000 },
    });

    expect(publishDomainEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "deal.won",
        metadata: { amount: 50000 },
      }),
    );
  });
});
