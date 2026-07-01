/**
 * Phase 28.2 hardening — DB transaction before artifacts, shadow path deprecation.
 */

import { jest } from "@jest/globals";

const mockEmitFoundationEvent = jest.fn<() => Promise<void>>();
const mockFindUniqueOrThrowVersion = jest.fn();
const mockBindingsFindMany = jest.fn();
const mockBindingsUpdateMany = jest.fn();
const mockBindingsCount = jest.fn();
const mockVersionUpdate = jest.fn();
const mockReleaseCreate = jest.fn();
const mockReleaseUpdate = jest.fn();
const mockTransaction = jest.fn();
const mockWriteFile = jest.fn<() => Promise<void>>();
const mockMkdir = jest.fn<() => Promise<void>>();

const callOrder: string[] = [];

jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: mockEmitFoundationEvent,
  onFoundationEvent: jest.fn().mockReturnValue(() => {}),
  onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),
  clearFoundationHandlers: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn().mockResolvedValue({
    id: "user-op",
    role: "OPERATOR",
  }),
}));

jest.mock("@/lib/knowledge-foundation/audit-handler", () => ({
  registerFoundationAuditHandler: jest.fn(),
}));

jest.mock("@/lib/knowledge-foundation/trust-chain", () => ({
  resolveChainParentRelease: jest.fn().mockResolvedValue(null),
}));

jest.mock("fs", () => ({
  promises: {
    mkdir: (...args: unknown[]) => {
      callOrder.push("fs:mkdir");
      return mockMkdir(...args);
    },
    writeFile: (...args: unknown[]) => {
      callOrder.push("fs:writeFile");
      return mockWriteFile(...args);
    },
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findUniqueOrThrow: mockFindUniqueOrThrowVersion,
    },
    knowledgeFoundationVersionCandidate: {
      findMany: mockBindingsFindMany,
      count: mockBindingsCount,
      updateMany: mockBindingsUpdateMany,
    },
    knowledgeFoundationRelease: {
      create: mockReleaseCreate,
      update: mockReleaseUpdate,
    },
    $transaction: (...args: unknown[]) => {
      callOrder.push("db:transaction");
      return mockTransaction(...args);
    },
  },
}));

import { generateReleasePackage } from "@/lib/knowledge-foundation/release-generator";
import { releaseVersion } from "@/lib/knowledge-foundation/kf-service";
import { releaseFoundationVersion } from "@/actions/knowledge-foundation/actions";

const boundRow = {
  id: "bind-1",
  versionId: "kfv-v1",
  candidateId: "kc-1",
  boundById: "user-op",
  boundAt: new Date(),
  includedInRelease: false,
  releasedAt: null,
  notes: null,
  candidate: {
    id: "kc-1",
    candidatePhrase: "Rule",
    canonicalCode: "CA-1010",
    category: "asset",
    confidence: 0.8,
    supportCount: 1,
    organizationCount: 1,
    promotionHistory: [{ promotedAt: new Date() }],
    evidence: [{ evidenceType: "pattern", organizationId: "org-1" }],
  },
};

beforeEach(() => {
  callOrder.length = 0;
  jest.clearAllMocks();
  mockMkdir.mockResolvedValue(undefined);
  mockWriteFile.mockResolvedValue(undefined);
  mockBindingsUpdateMany.mockResolvedValue({ count: 1 });
  mockBindingsCount.mockResolvedValue(1);
  mockReleaseCreate.mockResolvedValue({ id: "kfr-hardening" });
  mockReleaseUpdate.mockResolvedValue({ id: "kfr-hardening" });
  mockFindUniqueOrThrowVersion.mockResolvedValue({
    id: "kfv-v1",
    versionNumber: "1.0.0",
    status: "APPROVED",
  });
  mockBindingsFindMany.mockResolvedValue([boundRow]);
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
    callOrder.push("db:transaction-body");
    return fn({
      knowledgeFoundationVersionCandidate: {
        updateMany: mockBindingsUpdateMany,
        count: mockBindingsCount,
      },
      knowledgeFoundationVersion: {
        update: mockVersionUpdate,
      },
      knowledgeFoundationRelease: {
        create: mockReleaseCreate,
      },
    });
  });
});

describe("Phase 28.2 release hardening", () => {
  it("commits DB transaction before filesystem writes", async () => {
    await generateReleasePackage({
      versionId: "kfv-v1",
      versionNumber: "1.0.0",
      actorId: "user-op",
    });

    const txIndex = callOrder.indexOf("db:transaction");
    const fsIndex = callOrder.findIndex((e) => e.startsWith("fs:"));
    expect(txIndex).toBeGreaterThanOrEqual(0);
    expect(fsIndex).toBeGreaterThan(txIndex);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("marks artifactStatus FAILED when filesystem write fails", async () => {
    mockWriteFile.mockRejectedValueOnce(new Error("disk full"));

    await expect(
      generateReleasePackage({
        versionId: "kfv-v1",
        versionNumber: "1.0.0",
        actorId: "user-op",
      }),
    ).rejects.toThrow("disk full");

    expect(mockReleaseUpdate).toHaveBeenCalledWith({
      where: { id: "kfr-hardening" },
      data: { artifactStatus: "FAILED" },
    });
    expect(mockEmitFoundationEvent).not.toHaveBeenCalled();
  });

  it("rejects deprecated releaseVersion service path", async () => {
    await expect(releaseVersion({ versionId: "kfv-v1" })).rejects.toThrow(
      /deprecated after Phase 28.2/,
    );
  });

  it("rejects deprecated releaseFoundationVersion action", async () => {
    await expect(
      releaseFoundationVersion({ versionId: "kfv-v1" }),
    ).rejects.toThrow(/deprecated after Phase 28.2/);
  });
});
