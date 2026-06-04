// @ts-nocheck
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/audit/actor-context", () => ({
  getAuditActor: jest.fn(),
  requireRole: jest.fn(),
}));

jest.mock("@/lib/audit/tenant-guard", () => ({
  assertEngagementAccess: jest.fn(),
}));

jest.mock("@/lib/audit/rate-limit", () => ({
  enforceAuditRateLimit: jest.fn(),
}));

jest.mock("@/lib/audit/services", () => ({
  getTrialBalanceLines: jest.fn(),
  recordAuditEvent: jest.fn(),
}));

import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { getAuditActor } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import { enforceAuditRateLimit } from "@/lib/audit/rate-limit";
import {
  getTrialBalanceLines,
  recordAuditEvent,
} from "@/lib/audit/services";
import { generateAuditSamplingAction } from "@/actions/audit-actions";

const ACTOR = {
  actorId: "user-1",
  actorName: "Reviewer",
  actorRole: "senior",
  organizationId: "org-1",
};

const LINES = [
  {
    id: "line-1",
    accountCode: "1000",
    accountName: "Cash",
    debitAmount: 100,
    creditAmount: 0,
    balance: 100,
  },
  {
    id: "line-2",
    accountCode: "2000",
    accountName: "Payables",
    debitAmount: 0,
    creditAmount: 50,
    balance: -50,
  },
];

describe("generateAuditSamplingAction (A1-02)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuditActor as jest.Mock).mockResolvedValue(ACTOR);
    (assertEngagementAccess as jest.Mock).mockResolvedValue(undefined);
    (enforceAuditRateLimit as jest.Mock).mockResolvedValue(undefined);
    (getTrialBalanceLines as jest.Mock).mockResolvedValue(LINES);
    (recordAuditEvent as jest.Mock).mockResolvedValue(undefined);
  });

  it("generates stratified sample and logs audit event", async () => {
    const result = await generateAuditSamplingAction({
      engagementId: "eng-1",
      method: "stratified",
      sampleSize: 2,
      seed: "audit-action-seed",
      confidenceLevel: 0.95,
    });

    expect(result.method).toBe("stratified");
    expect(result.selectedItems.length).toBeGreaterThan(0);
    expect(result.populationCount).toBe(2);
    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        engagementId: "eng-1",
        eventType: "sampling.generated",
        aiRelated: false,
      }),
    );
  });

  it("rejects empty trial balance population", async () => {
    (getTrialBalanceLines as jest.Mock).mockResolvedValue([]);

    await expect(
      generateAuditSamplingAction({
        engagementId: "eng-1",
        method: "random",
        sampleSize: 5,
      }),
    ).rejects.toThrow(/ميزان مراجعة/);
  });
});
