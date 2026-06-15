import { buildReportingGraph } from "@/lib/audit/reporting-graph/graph-builder";

describe("buildReportingGraph", () => {
  const engagementId = "eng-1";

  it("builds TB → mapping → FS → note chain", () => {
    const graph = buildReportingGraph({
      engagementId,
      tbLines: [
        {
          id: "tbline-1",
          accountCode: "1000",
          accountName: "Cash",
          balance: 50000,
        },
      ],
      mappings: [
        {
          id: "map-1",
          sourceAccountId: "src-1",
          sourceAccountCode: "1000",
          sourceAccountName: "Cash",
          debitAmount: 50000,
          creditAmount: 0,
          canonicalAccountCode: "BS-CASH",
          canonicalAccountName: "Cash and equivalents",
          status: "confirmed",
        },
      ],
      statements: [
        {
          id: "fs-1",
          title: "Balance Sheet",
          statementType: "balance_sheet",
          status: "draft",
          lines: [
            {
              id: "line-1",
              label: "Cash",
              amount: 50000,
              isTotal: false,
              linkedAccountMappings: ["map-1"],
            },
          ],
        },
      ],
      notes: [
        {
          id: "note-1",
          noteNumber: "1",
          title: "Cash policy",
          noteType: "accounting_policy",
          status: "draft",
          linkedStatementLine: "line-1",
        },
      ],
    });

    expect(graph.stats.mappings).toBe(1);
    expect(graph.stats.fsLines).toBe(1);
    expect(graph.stats.notes).toBe(1);
    expect(graph.stats.edges).toBeGreaterThan(0);

    const mapToLine = graph.edges.find(
      (e) => e.sourceId === "map-map-1" && e.targetId === "fsl-line-1",
    );
    expect(mapToLine?.edgeType).toBe("rolls_into");

    const lineToNote = graph.edges.find(
      (e) => e.targetId === "note-note-1" && e.edgeType === "discloses",
    );
    expect(lineToNote?.sourceId).toBe("fsl-line-1");
  });

  it("returns empty secondary layers when no mappings", () => {
    const graph = buildReportingGraph({
      engagementId,
      tbLines: [],
      mappings: [],
      statements: [],
      notes: [],
    });

    expect(graph.stats.mappings).toBe(0);
    expect(graph.nodes.some((n) => n.nodeType === "engagement")).toBe(true);
    expect(graph.nodes.some((n) => n.nodeType === "tb_root")).toBe(true);
  });
});
