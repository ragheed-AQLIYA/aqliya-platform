import {
  REPORTING_GRAPH_EDGE_TYPES,
  REPORTING_GRAPH_ENTITY_TYPES,
  REPORTING_GRAPH_NODE_TYPES,
} from "@/lib/audit/reporting-graph/graph-constants";
import { isReportingGraphEnabled } from "@/lib/audit/reporting-graph/graph-sync-service";

describe("reporting-graph constants", () => {
  it("defines factory node types aligned with pipeline", () => {
    expect(REPORTING_GRAPH_NODE_TYPES.TB_ACCOUNT).toBe("tb_account");
    expect(REPORTING_GRAPH_NODE_TYPES.FS_LINE).toBe("fs_line");
    expect(REPORTING_GRAPH_NODE_TYPES.DISCLOSURE_NOTE).toBe("disclosure_note");
  });

  it("maps to existing Prisma entity tables", () => {
    expect(REPORTING_GRAPH_ENTITY_TYPES.TRIAL_BALANCE_LINE).toBe(
      "AuditTrialBalanceLine",
    );
    expect(REPORTING_GRAPH_ENTITY_TYPES.LEAD_SCHEDULE_LINE).toBe(
      "LeadScheduleLine",
    );
  });

  it("defines edge types for traceability", () => {
    expect(REPORTING_GRAPH_EDGE_TYPES.MAPS_TO).toBe("MAPS_TO");
    expect(REPORTING_GRAPH_EDGE_TYPES.DISCLOSES).toBe("DISCLOSES");
  });
});

describe("isReportingGraphEnabled", () => {
  const prev = process.env.FF_AUDIT_REPORTING_GRAPH;

  afterEach(() => {
    if (prev === undefined) delete process.env.FF_AUDIT_REPORTING_GRAPH;
    else process.env.FF_AUDIT_REPORTING_GRAPH = prev;
  });

  it("defaults off", () => {
    delete process.env.FF_AUDIT_REPORTING_GRAPH;
    expect(isReportingGraphEnabled()).toBe(false);
  });

  it("respects env override", () => {
    process.env.FF_AUDIT_REPORTING_GRAPH = "true";
    expect(isReportingGraphEnabled()).toBe(true);
  });
});
