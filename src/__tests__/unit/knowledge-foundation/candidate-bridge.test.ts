/**
 * Phase 28.1 — Candidate bridge binding tests.
 */

import { jest } from "@jest/globals";

const mockEmitFoundationEvent = jest.fn<() => Promise<void>>();

jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: mockEmitFoundationEvent,
  onFoundationEvent: jest.fn().mockReturnValue(() => {}),
  onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),
  clearFoundationHandlers: jest.fn(),
}));

const versionStore = {
  id: "kfv-draft",
  versionNumber: "1.0.0",
  status: "DRAFT",
  candidateCount: 0,
};

const candidateStore = new Map<
  string,
  { id: string; status: string; candidatePhrase: string; canonicalCode: string; category: string; confidence: number; supportCount: number; organizationCount: number }
>([
  [
    "kc-1",
    {
      id: "kc-1",
      status: "PROMOTED",
      candidatePhrase: "مصروف ايجار",
      canonicalCode: "CA-5020",
      category: "expense",
      confidence: 0.82,
      supportCount: 4,
      organizationCount: 3,
    },
  ],
  [
    "kc-2",
    {
      id: "kc-2",
      status: "APPROVED",
      candidatePhrase: "أخرى",
      canonicalCode: "CA-1000",
      category: "expense",
      confidence: 0.7,
      supportCount: 2,
      organizationCount: 1,
    },
  ],
]);

const bindingStore: Array<{
  id: string;
  versionId: string;
  candidateId: string;
  boundById: string;
  boundAt: Date;
  includedInRelease: boolean;
  notes: string | null;
}> = [];

let bindingSeq = 1;

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
        if (where.id !== versionStore.id) throw new Error("not found");
        return { ...versionStore };
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { candidateCount?: number };
      }) => {
        if (where.id === versionStore.id && data.candidateCount !== undefined) {
          versionStore.candidateCount = data.candidateCount;
        }
        return { ...versionStore, ...data };
      },
    },
    knowledgeFoundationVersionCandidate: {
      findMany: async ({
        where,
        select,
      }: {
        where?: { versionId?: string; candidateId?: { in?: string[] } };
        select?: { candidateId?: boolean };
      }) => {
        let rows = [...bindingStore];
        if (where?.versionId) {
          rows = rows.filter((r) => r.versionId === where.versionId);
        }
        if (where?.candidateId?.in) {
          rows = rows.filter((r) => where.candidateId!.in!.includes(r.candidateId));
        }
        if (select?.candidateId) {
          return rows.map((r) => ({ candidateId: r.candidateId }));
        }
        return rows;
      },
      findFirst: async ({
        where,
      }: {
        where: { versionId?: string; candidateId?: string };
      }) =>
        bindingStore.find(
          (r) =>
            (!where.versionId || r.versionId === where.versionId) &&
            (!where.candidateId || r.candidateId === where.candidateId),
        ) ?? null,
      count: async ({ where }: { where?: { versionId?: string; includedInRelease?: boolean } }) =>
        bindingStore.filter(
          (r) =>
            (!where?.versionId || r.versionId === where.versionId) &&
            (where?.includedInRelease === undefined ||
              r.includedInRelease === where.includedInRelease),
        ).length,
      createMany: async ({ data }: { data: Array<Record<string, unknown>> }) => {
        for (const row of data) {
          bindingStore.push({
            id: `bind-${bindingSeq++}`,
            versionId: row.versionId as string,
            candidateId: row.candidateId as string,
            boundById: row.boundById as string,
            boundAt: new Date(),
            includedInRelease: false,
            notes: (row.notes as string | null) ?? null,
          });
        }
        return { count: data.length };
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = bindingStore.findIndex((r) => r.id === where.id);
        if (idx >= 0) bindingStore.splice(idx, 1);
      },
    },
    knowledgeCandidate: {
      findMany: async ({
        where,
      }: {
        where?: { id?: { in?: string[] }; status?: string };
      }) => {
        let rows = [...candidateStore.values()];
        if (where?.status) rows = rows.filter((r) => r.status === where.status);
        if (where?.id?.in) rows = rows.filter((r) => where.id!.in!.includes(r.id));
        return rows;
      },
    },
  },
}));

import {
  bindCandidatesToVersion,
  unbindCandidateFromVersion,
  getVersionCandidateStats,
} from "@/lib/knowledge-foundation/candidate-bridge";

describe("candidate-bridge", () => {
  beforeEach(() => {
    bindingStore.length = 0;
    versionStore.candidateCount = 0;
    versionStore.status = "DRAFT";
    mockEmitFoundationEvent.mockClear();
  });

  it("binds PROMOTED candidates and derives candidateCount", async () => {
    const result = await bindCandidatesToVersion({
      versionId: "kfv-draft",
      candidateIds: ["kc-1"],
      boundById: "user-op",
    });

    expect(result.bound).toBe(1);
    expect(result.candidateCount).toBe(1);
    expect(versionStore.candidateCount).toBe(1);
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "knowledge.foundation.candidate.bound",
        payload: expect.objectContaining({ candidateId: "kc-1" }),
      }),
    );
  });

  it("rejects non-PROMOTED candidates", async () => {
    await expect(
      bindCandidatesToVersion({
        versionId: "kfv-draft",
        candidateIds: ["kc-2"],
        boundById: "user-op",
      }),
    ).rejects.toThrow(/not PROMOTED/);
  });

  it("prevents duplicate binding to another version", async () => {
    await bindCandidatesToVersion({
      versionId: "kfv-draft",
      candidateIds: ["kc-1"],
      boundById: "user-op",
    });

    bindingStore[0]!.versionId = "other-version";

    await expect(
      bindCandidatesToVersion({
        versionId: "kfv-draft",
        candidateIds: ["kc-1"],
        boundById: "user-op",
      }),
    ).rejects.toThrow(/already bound/);
  });

  it("unbinds candidate and updates stats", async () => {
    await bindCandidatesToVersion({
      versionId: "kfv-draft",
      candidateIds: ["kc-1"],
      boundById: "user-op",
    });

    const bindingId = bindingStore[0]!.id;
    const result = await unbindCandidateFromVersion({
      versionId: "kfv-draft",
      candidateId: "kc-1",
      actorId: "user-op",
    });

    expect(result.candidateCount).toBe(0);
    expect(bindingStore.find((b) => b.id === bindingId)).toBeUndefined();
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "knowledge.foundation.candidate.unbound",
      }),
    );

    const stats = await getVersionCandidateStats("kfv-draft");
    expect(stats.boundCount).toBe(0);
  });

  it("rejects bind when version is not DRAFT", async () => {
    versionStore.status = "APPROVED";

    await expect(
      bindCandidatesToVersion({
        versionId: "kfv-draft",
        candidateIds: ["kc-1"],
        boundById: "user-op",
      }),
    ).rejects.toThrow(/Must be DRAFT/);
  });

  it("rejects unbind when version is not DRAFT", async () => {
    await bindCandidatesToVersion({
      versionId: "kfv-draft",
      candidateIds: ["kc-1"],
      boundById: "user-op",
    });

    versionStore.status = "APPROVED";

    await expect(
      unbindCandidateFromVersion({
        versionId: "kfv-draft",
        candidateId: "kc-1",
        actorId: "user-op",
      }),
    ).rejects.toThrow(/Must be DRAFT/);
  });
});
