/**
 * Phase 28.4 — Trust chain resolution at release write time.
 */

import { jest } from "@jest/globals";

const mockFindActiveVersion = jest.fn();
const mockFindRelease = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findFirst: mockFindActiveVersion,
    },
    knowledgeFoundationRelease: {
      findFirst: mockFindRelease,
    },
  },
}));

import { resolveChainParentRelease } from "@/lib/knowledge-foundation/trust-chain";

describe("Phase 28.4 — resolveChainParentRelease", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null for bootstrap (no active, no rollback)", async () => {
    mockFindActiveVersion.mockResolvedValue(null);

    const parent = await resolveChainParentRelease("kfv-new", null);

    expect(parent).toBeNull();
    expect(mockFindRelease).not.toHaveBeenCalled();
  });

  it("uses ACTIVE version release as chain parent (not latest globally)", async () => {
    mockFindActiveVersion.mockResolvedValue({ id: "kfv-active" });
    mockFindRelease.mockResolvedValue({
      id: "kfr-active",
      manifestSha256: "abc123hash",
    });

    const parent = await resolveChainParentRelease("kfv-next", null);

    expect(parent).toEqual({
      id: "kfr-active",
      manifestSha256: "abc123hash",
    });
    expect(mockFindRelease).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ versionId: "kfv-active" }),
      }),
    );
  });

  it("uses rollbackVersionId lineage when set", async () => {
    mockFindRelease.mockResolvedValue({
      id: "kfr-rollback-target",
      manifestSha256: "rollbackhash",
    });

    const parent = await resolveChainParentRelease("kfv-patch", "kfv-rollback");

    expect(parent?.id).toBe("kfr-rollback-target");
    expect(mockFindActiveVersion).not.toHaveBeenCalled();
    expect(mockFindRelease).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ versionId: "kfv-rollback" }),
      }),
    );
  });
});
