// @ts-nocheck
import { describe, expect, it } from "@jest/globals";
import { mapSalesAuditEventsToTimeline } from "../audit-timeline";
import { SalesAuditActions } from "../audit-events";

describe("mapSalesAuditEventsToTimeline", () => {
  it("maps stage change events", () => {
    const events = mapSalesAuditEventsToTimeline([
      {
        id: "evt-1",
        action: SalesAuditActions.DEAL_STAGE_CHANGED,
        actorId: "u1",
        actorName: "Tester",
        metadata: { fromStageId: "a", toStageId: "b" },
        createdAt: new Date("2026-06-01T10:00:00Z"),
      },
    ]);

    expect(events[0].type).toBe("status_change");
    expect(events[0].description).toContain("a");
    expect(events[0].actor).toBe("Tester");
  });
});
