/** @jest-environment node */

jest.mock("@/lib/auth", () => ({
  requireUserContext: jest.fn(),
  getCurrentUser: jest.fn(),
  normalizePrincipalRole: (role: string) => role.toLowerCase(),
}));

import { CORE_ENGINE_KEYS } from "@/lib/core/registry-types";
import * as Audit from "@/lib/core/audit";
import * as Contracts from "@/lib/core/contracts";
import * as Evidence from "@/lib/core/evidence";
import * as Governance from "@/lib/core/governance";
import * as Knowledge from "@/lib/core/knowledge";
import * as Memory from "@/lib/core/memory";
import * as Signals from "@/lib/core/signals";

describe("Intelligence Core registry (IC-P1-01)", () => {
  it("declares eleven engine keys", () => {
    expect(CORE_ENGINE_KEYS).toHaveLength(11);
    expect(CORE_ENGINE_KEYS).toContain("evidence");
    expect(CORE_ENGINE_KEYS).toContain("signals");
    expect(CORE_ENGINE_KEYS).toContain("access");
    expect(CORE_ENGINE_KEYS).toContain("ai");
    expect(CORE_ENGINE_KEYS).toContain("events");
    expect(CORE_ENGINE_KEYS).toContain("workflow");
  });

  it("re-exports audit write path", () => {
    expect(typeof Audit.writePlatformAuditLog).toBe("function");
    expect(typeof Audit.appendToAuditChain).toBe("function");
  });

  it("re-exports evidence registry", () => {
    expect(typeof Evidence.lookupEvidence).toBe("function");
    expect(typeof Evidence.assertEvidenceDownloadAccess).toBe("function");
  });

  it("re-exports governance context router", () => {
    expect(typeof Governance.getGovernanceContext).toBe("function");
    expect(typeof Governance.GovernanceEngine.evaluate).toBe("function");
    const result = Governance.GovernanceEngine.evaluate({ taskType: "pilot_decision" });
    expect(result.humanApprovalRequired).toBe(true);
    expect(result.context.taskType).toBe("pilot_decision");
  });

  it("re-exports knowledge RAG entry", () => {
    expect(typeof Knowledge.retrieveGovernedContext).toBe("function");
  });

  it("re-exports institutional memory", () => {
    expect(typeof Memory.searchMemory).toBe("function");
  });

  it("re-exports signal collectors", () => {
    expect(typeof Signals.collectAuditTaskSignals).toBe("function");
    expect(typeof Signals.collectSalesActivitySignals).toBe("function");
  });

  it("re-exports intelligence contracts", () => {
    expect(typeof Contracts.calculateOverallScore).toBe("function");
  });
});

// AI engine tested in src/lib/core/ai/__tests__/engine.test.ts (avoids auth-config top-level await)
