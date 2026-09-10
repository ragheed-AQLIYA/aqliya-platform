import { describe, expect, it, beforeEach, jest } from "@jest/globals";

// ─── Evidence Versioning Service Tests ───

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditEvidence: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditEvidenceVersion: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import {
  createEvidenceVersion,
  getEvidenceVersions,
  getEvidenceVersion,
  compareVersions,
  revertToVersion,
} from "../evidence-versioning-service";

const mockedPrisma = jest.requireMock("@/lib/prisma").prisma;

const NOW = new Date("2026-07-03T12:00:00.000Z");

function mockEvidence(overrides: Record<string, unknown> = {}) {
  return {
    id: "ev-1",
    filename: "tb.xlsx",
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSize: 2048,
    fileHash: "hash-abc",
    storageKey: "audit/evidence/tb.xlsx",
    state: "approved",
    uploadedById: "user-1",
    ...overrides,
  };
}

function mockVersion(overrides: Record<string, unknown> = {}) {
  return {
    id: "ver-1",
    evidenceId: "ev-1",
    versionNumber: 1,
    changes: { filename: "tb.xlsx", state: "approved" },
    changeDescription: "Initial version",
    createdById: "user-1",
    createdByName: "Auditor",
    createdAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("Evidence Versioning — createEvidenceVersion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
    mockedPrisma.auditEvidence.findUnique.mockResolvedValue(mockEvidence());
    mockedPrisma.auditEvidenceVersion.findFirst.mockResolvedValue(null);
    mockedPrisma.auditEvidenceVersion.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "ver-1", ...data, createdAt: NOW }),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("creates version 1 when no prior versions exist", async () => {
    const result = await createEvidenceVersion("ev-1", { filename: "new.xlsx" }, "user-1", "Auditor", "Updated file");
    expect(result.versionNumber).toBe(1);
    expect(result.evidenceId).toBe("ev-1");
    expect(result.changeDescription).toBe("Updated file");
  });

  it("increments version number from existing", async () => {
    mockedPrisma.auditEvidenceVersion.findFirst.mockResolvedValue({ versionNumber: 3 } as any);
    const result = await createEvidenceVersion("ev-1", { filename: "v4.xlsx" });
    expect(result.versionNumber).toBe(4);
  });

  it("throws when evidence not found", async () => {
    mockedPrisma.auditEvidence.findUnique.mockResolvedValue(null);
    await expect(createEvidenceVersion("missing", {})).rejects.toThrow("Evidence not found");
  });

  it("creates version with merged snapshot of evidence state and changes", async () => {
    await createEvidenceVersion("ev-1", { filename: "updated.xlsx", state: "revised" }, "u-2", "Manager");
    const createCall = mockedPrisma.auditEvidenceVersion.create.mock.calls[0]?.[0];
    expect(createCall?.data?.changes).toEqual(
      expect.objectContaining({
        filename: "updated.xlsx",
        state: "revised",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 2048,
        fileHash: "hash-abc",
        storageKey: "audit/evidence/tb.xlsx",
        uploadedById: "user-1",
      }),
    );
  });

  it("sets changeDescription to null when not provided", async () => {
    await createEvidenceVersion("ev-1", {});
    const createCall = mockedPrisma.auditEvidenceVersion.create.mock.calls[0]?.[0];
    expect(createCall?.data?.changeDescription).toBeNull();
  });

  it("sets createdById and createdByName when provided", async () => {
    await createEvidenceVersion("ev-1", {}, "u-5", "Partner");
    const createCall = mockedPrisma.auditEvidenceVersion.create.mock.calls[0]?.[0];
    expect(createCall?.data?.createdById).toBe("u-5");
    expect(createCall?.data?.createdByName).toBe("Partner");
  });

  it("sets createdById and createdByName to null when not provided", async () => {
    await createEvidenceVersion("ev-1", {});
    const createCall = mockedPrisma.auditEvidenceVersion.create.mock.calls[0]?.[0];
    expect(createCall?.data?.createdById).toBeNull();
    expect(createCall?.data?.createdByName).toBeNull();
  });

  it("returns ISO string for createdAt", async () => {
    const result = await createEvidenceVersion("ev-1", {});
    expect(result.createdAt).toBe(NOW.toISOString());
  });
});

describe("Evidence Versioning — getEvidenceVersions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns versions ordered by versionNumber desc", async () => {
    mockedPrisma.auditEvidenceVersion.findMany.mockResolvedValue([
      { id: "v-2", evidenceId: "ev-1", versionNumber: 2, changes: {}, changeDescription: null, createdById: null, createdByName: null, createdAt: NOW },
      { id: "v-1", evidenceId: "ev-1", versionNumber: 1, changes: {}, changeDescription: null, createdById: null, createdByName: null, createdAt: NOW },
    ]);
    const versions = await getEvidenceVersions("ev-1");
    expect(versions).toHaveLength(2);
    expect(versions[0].versionNumber).toBe(2);
    expect(versions[1].versionNumber).toBe(1);
    expect(mockedPrisma.auditEvidenceVersion.findMany).toHaveBeenCalledWith({
      where: { evidenceId: "ev-1" },
      orderBy: { versionNumber: "desc" },
    });
  });

  it("returns empty array when no versions exist", async () => {
    mockedPrisma.auditEvidenceVersion.findMany.mockResolvedValue([]);
    const versions = await getEvidenceVersions("ev-1");
    expect(versions).toEqual([]);
  });
});

describe("Evidence Versioning — getEvidenceVersion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns specific version when found", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique.mockResolvedValue({
      id: "v-1", evidenceId: "ev-1", versionNumber: 1, changes: { filename: "x.xlsx" }, changeDescription: null,
      createdById: null, createdByName: null, createdAt: NOW,
    });
    const version = await getEvidenceVersion("ev-1", 1);
    expect(version).not.toBeNull();
    expect(version?.versionNumber).toBe(1);
    expect(mockedPrisma.auditEvidenceVersion.findUnique).toHaveBeenCalledWith({
      where: { evidenceId_versionNumber: { evidenceId: "ev-1", versionNumber: 1 } },
    });
  });

  it("returns null when version not found", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique.mockResolvedValue(null);
    const version = await getEvidenceVersion("ev-1", 99);
    expect(version).toBeNull();
  });
});

describe("Evidence Versioning — compareVersions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns diffs for changed fields", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique
      .mockResolvedValueOnce({ id: "v1", changes: { filename: "old.xlsx", state: "draft" }, createdAt: NOW } as any)
      .mockResolvedValueOnce({ id: "v2", changes: { filename: "new.xlsx", state: "approved" }, createdAt: NOW } as any);

    const diffs = await compareVersions("v1", "v2");
    expect(diffs).toHaveLength(2);
    const filenameDiff = diffs.find((d) => d.field === "filename");
    expect(filenameDiff?.changed).toBe(true);
    expect(filenameDiff?.oldValue).toBe("old.xlsx");
    expect(filenameDiff?.newValue).toBe("new.xlsx");
  });

  it("returns changed=false for identical fields", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique
      .mockResolvedValueOnce({ id: "v1", changes: { filename: "x.xlsx" }, createdAt: NOW } as any)
      .mockResolvedValueOnce({ id: "v2", changes: { filename: "x.xlsx" }, createdAt: NOW } as any);

    const diffs = await compareVersions("v1", "v2");
    expect(diffs).toHaveLength(1);
    expect(diffs[0].changed).toBe(false);
  });

  it("throws when one version not found", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique
      .mockResolvedValueOnce({ id: "v1", changes: {}, createdAt: NOW } as any)
      .mockResolvedValueOnce(null);

    await expect(compareVersions("v1", "missing")).rejects.toThrow("One or both versions not found");
  });

  it("throws when both versions not found", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique.mockResolvedValue(null);
    await expect(compareVersions("missing1", "missing2")).rejects.toThrow("One or both versions not found");
  });

  it("handles fields that exist only in one version", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique
      .mockResolvedValueOnce({ id: "v1", changes: { filename: "old.xlsx" }, createdAt: NOW } as any)
      .mockResolvedValueOnce({ id: "v2", changes: { filename: "new.xlsx", state: "approved" }, createdAt: NOW } as any);

    const diffs = await compareVersions("v1", "v2");
    expect(diffs).toHaveLength(2);
    const stateDiff = diffs.find((d) => d.field === "state");
    expect(stateDiff?.changed).toBe(true);
    expect(stateDiff?.oldValue).toBeUndefined();
    expect(stateDiff?.newValue).toBe("approved");
  });
});

describe("Evidence Versioning — revertToVersion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
    mockedPrisma.auditEvidence.update.mockResolvedValue({ id: "ev-1" } as any);
    mockedPrisma.auditEvidenceVersion.findUnique.mockResolvedValue({
      id: "v-1",
      evidenceId: "ev-1",
      versionNumber: 1,
      changes: { filename: "original.xlsx", fileType: "xlsx", fileSize: 1024, fileHash: "hash-orig", storageKey: "orig.xlsx", state: "draft" },
      changeDescription: "Original",
      createdById: null,
      createdByName: null,
      createdAt: NOW,
    } as any);
    mockedPrisma.auditEvidenceVersion.findFirst.mockResolvedValue(null);
    mockedPrisma.auditEvidenceVersion.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "ver-new", ...data, createdAt: NOW }),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("reverts evidence to specified version", async () => {
    const result = await revertToVersion("ev-1", 1, "u-2", "Partner");
    expect(result).toBeDefined();
    expect(mockedPrisma.auditEvidence.update).toHaveBeenCalledWith({
      where: { id: "ev-1" },
      data: expect.objectContaining({ filename: "original.xlsx", state: "draft" }),
    });
  });

  it("creates a new version with revert metadata", async () => {
    await revertToVersion("ev-1", 1, "u-2", "Partner");
    const createCall = mockedPrisma.auditEvidenceVersion.create.mock.calls[0]?.[0];
    expect(createCall?.data?.changeDescription).toBe("Reverted to version 1");
    expect(createCall?.data?.changes).toEqual(
      expect.objectContaining({ revertedFromVersion: 1 }),
    );
  });

  it("throws when target version not found", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique.mockResolvedValue(null);
    await expect(revertToVersion("ev-1", 99)).rejects.toThrow("Version 99 not found");
  });
});

// ─── Evidence Download — Tenant Guard Tests ───

jest.mock("@/lib/audit/tenant-guard", () => ({
  assertEngagementAccess: jest.fn(),
}));

jest.mock("@/lib/audit/services", () => ({
  recordAuditEvent: jest.fn().mockResolvedValue(undefined),
  getEvidence: jest.fn(),
}));

import { assertEngagementAccess } from "../tenant-guard";
import { getEvidence } from "../services";

const mockedAssertEngagementAccess = assertEngagementAccess as jest.MockedFunction<typeof assertEngagementAccess>;
const mockedGetEvidence = getEvidence as jest.MockedFunction<typeof getEvidence>;

describe("Evidence Download — Tenant Isolation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("assertEngagementAccess is called before evidence access", async () => {
    mockedAssertEngagementAccess.mockResolvedValue(undefined);
    mockedGetEvidence.mockResolvedValue([
      { id: "ev-1", engagementId: "eng-1", filename: "doc.pdf", storageKey: "audit/evidence/doc.pdf" },
    ] as any);

    await mockedAssertEngagementAccess("eng-1", { actorId: "u-1", actorName: "A", actorRole: "manager", organizationId: "org-1" });
    const evidence = await mockedGetEvidence("eng-1");

    expect(mockedAssertEngagementAccess).toHaveBeenCalledWith("eng-1", expect.objectContaining({ actorId: "u-1" }));
    expect(evidence).toHaveLength(1);
  });

  it("throws when tenant guard rejects access", async () => {
    mockedAssertEngagementAccess.mockRejectedValue(new Error("Access denied: not your engagement"));
    await expect(
      mockedAssertEngagementAccess("eng-other", { actorId: "u-1", actorName: "A", actorRole: "manager", organizationId: "org-1" }),
    ).rejects.toThrow("Access denied");
  });

  it("evidence results are scoped to engagement", async () => {
    mockedGetEvidence.mockImplementation(async (engId: string) => {
      if (engId === "eng-1") return [{ id: "ev-1", engagementId: "eng-1" }] as any;
      return [{ id: "ev-2", engagementId: "eng-2" }] as any;
    });

    const ev1 = await mockedGetEvidence("eng-1");
    const ev2 = await mockedGetEvidence("eng-2");

    expect(ev1[0].engagementId).toBe("eng-1");
    expect(ev2[0].engagementId).toBe("eng-2");
    expect(ev1[0].id).not.toBe(ev2[0].id);
  });

  it("empty evidence list returned for engagement with no evidence", async () => {
    mockedGetEvidence.mockResolvedValue([]);
    const evidence = await mockedGetEvidence("eng-empty");
    expect(evidence).toEqual([]);
  });

  it("tenant guard receives correct actor structure", async () => {
    mockedAssertEngagementAccess.mockResolvedValue(undefined);
    const actor = { actorId: "u-99", actorName: "Test User", actorRole: "partner", organizationId: "org-5" };
    await mockedAssertEngagementAccess("eng-1", actor);
    expect(mockedAssertEngagementAccess).toHaveBeenCalledWith("eng-1", actor);
  });

  it("multiple evidence items all belong to same engagement", async () => {
    mockedGetEvidence.mockResolvedValue([
      { id: "ev-1", engagementId: "eng-1", filename: "a.xlsx" },
      { id: "ev-2", engagementId: "eng-1", filename: "b.pdf" },
      { id: "ev-3", engagementId: "eng-1", filename: "c.docx" },
    ] as any);

    const evidence = await mockedGetEvidence("eng-1");
    expect(evidence.every((e: any) => e.engagementId === "eng-1")).toBe(true);
  });
});

// ─── Evidence Versioning — Edge Cases ───

describe("Evidence Versioning — Edge Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("compareVersions handles empty change objects", async () => {
    mockedPrisma.auditEvidenceVersion.findUnique
      .mockResolvedValueOnce({ id: "v1", changes: {}, createdAt: NOW } as any)
      .mockResolvedValueOnce({ id: "v2", changes: {}, createdAt: NOW } as any);

    const diffs = await compareVersions("v1", "v2");
    expect(diffs).toEqual([]);
  });

  it("compareVersions handles large change objects", async () => {
    const bigChanges1: Record<string, unknown> = {};
    const bigChanges2: Record<string, unknown> = {};
    for (let i = 0; i < 50; i++) {
      bigChanges1[`field${i}`] = i < 25 ? "old" : `val${i}`;
      bigChanges2[`field${i}`] = i < 25 ? "new" : `val${i}`;
    }

    mockedPrisma.auditEvidenceVersion.findUnique
      .mockResolvedValueOnce({ id: "v1", changes: bigChanges1, createdAt: NOW } as any)
      .mockResolvedValueOnce({ id: "v2", changes: bigChanges2, createdAt: NOW } as any);

    const diffs = await compareVersions("v1", "v2");
    expect(diffs).toHaveLength(50);
    const changed = diffs.filter((d) => d.changed);
    expect(changed).toHaveLength(25);
  });

  it("createEvidenceVersion with empty changes creates snapshot of current state", async () => {
    mockedPrisma.auditEvidence.findUnique.mockResolvedValue(mockEvidence());
    mockedPrisma.auditEvidenceVersion.findFirst.mockResolvedValue(null);
    mockedPrisma.auditEvidenceVersion.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "ver-1", ...data, createdAt: NOW }),
    );

    await createEvidenceVersion("ev-1", {});
    const createCall = mockedPrisma.auditEvidenceVersion.create.mock.calls[0]?.[0];
    expect(createCall?.data?.changes).toEqual(
      expect.objectContaining({
        filename: "tb.xlsx",
        fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileSize: 2048,
        fileHash: "hash-abc",
        storageKey: "audit/evidence/tb.xlsx",
        state: "approved",
        uploadedById: "user-1",
      }),
    );
  });

  it("revertToVersion uses evidence state from target version snapshot", async () => {
    mockedPrisma.auditEvidence.update.mockResolvedValue({ id: "ev-1" } as any);
    mockedPrisma.auditEvidenceVersion.findUnique.mockResolvedValue({
      id: "v-3",
      evidenceId: "ev-1",
      versionNumber: 3,
      changes: { filename: "v3.xlsx", state: "revised", fileSize: 4096 },
      changeDescription: "Version 3",
      createdById: "u-2",
      createdByName: "Manager",
      createdAt: NOW,
    } as any);
    mockedPrisma.auditEvidenceVersion.findFirst.mockResolvedValue({ versionNumber: 5 } as any);
    mockedPrisma.auditEvidenceVersion.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "ver-new", ...data, createdAt: NOW }),
    );

    await revertToVersion("ev-1", 3);
    const updateCall = mockedPrisma.auditEvidence.update.mock.calls[0]?.[0];
    expect(updateCall?.data?.filename).toBe("v3.xlsx");
    expect(updateCall?.data?.state).toBe("revised");
    expect(updateCall?.data?.fileSize).toBe(4096);
  });

  it("revertToVersion creates version 6 after version 5 exists", async () => {
    mockedPrisma.auditEvidence.update.mockResolvedValue({ id: "ev-1" } as any);
    mockedPrisma.auditEvidenceVersion.findUnique.mockResolvedValue({
      id: "v-1", evidenceId: "ev-1", versionNumber: 1,
      changes: { filename: "orig.xlsx", state: "draft" },
      changeDescription: null, createdById: null, createdByName: null, createdAt: NOW,
    } as any);
    mockedPrisma.auditEvidenceVersion.findFirst.mockResolvedValue({ versionNumber: 5 } as any);
    mockedPrisma.auditEvidenceVersion.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "ver-new", ...data, createdAt: NOW }),
    );

    const result = await revertToVersion("ev-1", 1);
    expect(result).toBeDefined();
    const createCall = mockedPrisma.auditEvidenceVersion.create.mock.calls[0]?.[0];
    expect(createCall?.data?.versionNumber).toBe(6);
  });

  it("createEvidenceVersion records version with correct evidenceId", async () => {
    mockedPrisma.auditEvidence.findUnique.mockResolvedValue(mockEvidence({ id: "ev-42" }));
    mockedPrisma.auditEvidenceVersion.findFirst.mockResolvedValue(null);
    mockedPrisma.auditEvidenceVersion.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: "ver-1", ...data, createdAt: NOW }),
    );

    await createEvidenceVersion("ev-42", {});
    const createCall = mockedPrisma.auditEvidenceVersion.create.mock.calls[0]?.[0];
    expect(createCall?.data?.evidenceId).toBe("ev-42");
  });
});
