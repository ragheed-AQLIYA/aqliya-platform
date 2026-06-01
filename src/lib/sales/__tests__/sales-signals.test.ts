// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAccount: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    salesAuditEvent: { create: jest.fn() },
  },
}));

import { describe, expect, it, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { SalesAuditActions } from "../audit-events";
import {
  createSalesSignal,
  listSignalsForAccount,
  listSignalsForOrganization,
  readSignalsFromMetadata,
  MAX_SIGNALS_PER_ACCOUNT,
} from "../signals";
import { validateCreateSalesSignalInput } from "../validation";

const SCOPE = { organizationId: "org-a", platformOrganizationId: "plat-1" };
const ACTOR = { id: "user-1", name: "Test User" };

const BASE_ACCOUNT = {
  id: "acc-1",
  name: "Acme Demo",
  metadata: {
    signals: [
      {
        id: "sig-1",
        type: "intent",
        title: "Pricing page visits",
        summary: "Stub signal",
        severity: "high",
        source: "demo",
        detectedAt: "2026-06-01T10:00:00.000Z",
        createdAt: "2026-06-01T10:00:00.000Z",
        createdById: "system",
      },
    ],
  },
};

describe("SalesOS signals (metadata stub)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.salesAuditEvent.create.mockResolvedValue({ id: "evt-1" });
  });

  describe("validateCreateSalesSignalInput", () => {
    it("requires accountId, type, and title", () => {
      expect(() =>
        validateCreateSalesSignalInput({
          accountId: "",
          type: "intent",
          title: "Test",
        }),
      ).toThrow(/accountId/);
      expect(() =>
        validateCreateSalesSignalInput({
          accountId: "acc-1",
          type: "invalid",
          title: "Test",
        }),
      ).toThrow(/signal type/);
    });

    it("normalizes type and optional fields", () => {
      expect(
        validateCreateSalesSignalInput({
          accountId: "acc-1",
          type: "Risk",
          title: "  Churn risk  ",
          summary: "  note  ",
          severity: "HIGH",
          source: " manual ",
        }),
      ).toEqual(
        expect.objectContaining({
          accountId: "acc-1",
          type: "risk",
          title: "Churn risk",
          summary: "note",
          severity: "high",
          source: "manual",
        }),
      );
    });
  });

  describe("readSignalsFromMetadata", () => {
    it("parses and sorts signals by detectedAt desc", () => {
      const signals = readSignalsFromMetadata({
        signals: [
          {
            id: "a",
            type: "news",
            title: "Older",
            detectedAt: "2026-05-01T00:00:00.000Z",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
          {
            id: "b",
            type: "intent",
            title: "Newer",
            detectedAt: "2026-06-01T00:00:00.000Z",
            createdAt: "2026-06-01T00:00:00.000Z",
          },
        ],
      });
      expect(signals.map((s) => s.id)).toEqual(["b", "a"]);
    });

    it("returns empty for missing or invalid metadata", () => {
      expect(readSignalsFromMetadata(null)).toEqual([]);
      expect(readSignalsFromMetadata({ signals: "bad" })).toEqual([]);
    });
  });

  describe("listSignalsForAccount", () => {
    it("returns org-scoped signals for account", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue(BASE_ACCOUNT);

      const signals = await listSignalsForAccount(SCOPE, "acc-1");
      expect(signals).toHaveLength(1);
      expect(signals[0]).toMatchObject({
        id: "sig-1",
        accountId: "acc-1",
        type: "intent",
      });
    });

    it("throws when account not in org", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue(null);
      await expect(listSignalsForAccount(SCOPE, "missing")).rejects.toThrow(
        /account not found/,
      );
    });
  });

  describe("listSignalsForOrganization", () => {
    it("flattens signals across accounts", async () => {
      prisma.salesAccount.findMany.mockResolvedValue([
        BASE_ACCOUNT,
        {
          id: "acc-2",
          name: "Beta",
          metadata: {
            signals: [
              {
                id: "sig-2",
                type: "engagement",
                title: "Email open",
                detectedAt: "2026-06-02T00:00:00.000Z",
                createdAt: "2026-06-02T00:00:00.000Z",
              },
            ],
          },
        },
      ]);

      const signals = await listSignalsForOrganization(SCOPE);
      expect(signals).toHaveLength(2);
      expect(signals[0].accountName).toBe("Beta");
      expect(signals[1].accountName).toBe("Acme Demo");
    });
  });

  describe("createSalesSignal", () => {
    it("appends signal to metadata and records audit", async () => {
      prisma.salesAccount.findFirst.mockResolvedValue(BASE_ACCOUNT);
      prisma.salesAccount.update.mockResolvedValue({});

      const signal = await createSalesSignal(
        SCOPE,
        {
          accountId: "acc-1",
          type: "risk",
          title: "Budget freeze",
          summary: "CFO mentioned freeze",
          severity: "medium",
          source: "manual",
        },
        ACTOR,
      );

      expect(signal.accountId).toBe("acc-1");
      expect(signal.type).toBe("risk");
      expect(prisma.salesAccount.update).toHaveBeenCalled();
      expect(prisma.salesAuditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: SalesAuditActions.SIGNAL_CREATED,
            targetType: "SalesAccount",
            targetId: "acc-1",
          }),
        }),
      );
    });

    it("enforces max signals per account", async () => {
      const manySignals = Array.from({ length: MAX_SIGNALS_PER_ACCOUNT }, (_, i) => ({
        id: `sig-${i}`,
        type: "other",
        title: `Signal ${i}`,
        detectedAt: "2026-06-01T00:00:00.000Z",
        createdAt: "2026-06-01T00:00:00.000Z",
      }));
      prisma.salesAccount.findFirst.mockResolvedValue({
        ...BASE_ACCOUNT,
        metadata: { signals: manySignals },
      });

      await expect(
        createSalesSignal(
          SCOPE,
          { accountId: "acc-1", type: "other", title: "Overflow" },
          ACTOR,
        ),
      ).rejects.toThrow(/signal limit reached/);
      expect(prisma.salesAccount.update).not.toHaveBeenCalled();
    });
  });
});
