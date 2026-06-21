/** @jest-environment node */

const mockFindFirst = jest.fn();
const mockCreateNode = jest.fn();
const mockCreateEdge = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    intelligenceGraphNode: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreateNode(...args),
    },
    intelligenceGraphEdge: {
      findFirst: jest.fn(async () => null),
      create: (...args: unknown[]) => mockCreateEdge(...args),
    },
  },
}));

import { linkEvidenceToGraph } from "@/lib/core/evidence/graph";

describe("Evidence graph linkage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindFirst.mockResolvedValue(null);
    mockCreateNode
      .mockResolvedValueOnce({ id: "node-parent" })
      .mockResolvedValueOnce({ id: "node-evidence" });
    mockCreateEdge.mockResolvedValue({ id: "edge-1" });
  });

  it("creates parent, evidence node, and has_evidence edge", async () => {
    const result = await linkEvidenceToGraph({
      organizationId: "org-1",
      resourceType: "AuditEngagement",
      resourceId: "eng-1",
      evidenceId: "ev-1",
      evidenceLabel: "invoice.pdf",
      productSlug: "audit",
    });

    expect(result.parentNodeId).toBe("node-parent");
    expect(result.evidenceNodeId).toBe("node-evidence");
    expect(result.edgeId).toBe("edge-1");
    expect(mockCreateEdge).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          relationType: "has_evidence",
        }),
      }),
    );
  });
});
