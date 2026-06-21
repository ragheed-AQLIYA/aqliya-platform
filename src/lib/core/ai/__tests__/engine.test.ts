/** @jest-environment node */

jest.mock("@/lib/platform/product-ai-bridge", () => ({
  isProductAICoreEnabled: jest.fn(() => true),
  runGovernedProductAI: jest.fn(async () => ({
    output: "product draft",
    providerId: "deterministic",
    warnings: [],
    route: {},
    governedBridge: true,
    reviewRequired: true,
  })),
}));

jest.mock("@/lib/audit/audit-ai-bridge", () => ({
  isAuditAICoreEnabled: jest.fn(() => true),
  runGovernedAuditAI: jest.fn(async () => ({
    outputs: [{ id: "o1", type: "suggestion", content: "audit draft" }],
    providerId: "deterministic",
    warnings: [],
    reviewRequired: true,
  })),
}));

jest.mock("@/lib/office-ai/office-ai-orchestrator-bridge", () => ({
  runGovernedOfficeAI: jest.fn(async () => ({
    content: "office draft",
    format: "markdown",
    aiProvider: "deterministic",
    aiModel: "deterministic",
    aiPromptVersion: "office-ai-orchestrator-v1",
    warnings: [],
  })),
}));

import { AIEngine, execute, isCoreAIEnabled } from "@/lib/core/ai/engine";
import { runGovernedAuditAI } from "@/lib/audit/audit-ai-bridge";
import { runGovernedOfficeAI } from "@/lib/office-ai/office-ai-orchestrator-bridge";
import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge";

describe("AIEngine (IC-P1-03)", () => {
  it("reports core AI enabled when product or audit flags are on", () => {
    expect(isCoreAIEnabled()).toBe(true);
  });

  it("routes product domain to runGovernedProductAI", async () => {
    const response = await execute({
      domain: "product",
      productKey: "decisionos",
      useCase: "pilot_decision",
      organizationId: "org-1",
      userId: "user-1",
      resourceId: "dec-1",
      query: "test query",
    });

    expect(response.domain).toBe("product");
    expect(response.result?.output).toBe("product draft");
    expect(runGovernedProductAI).toHaveBeenCalled();
  });

  it("routes audit domain to runGovernedAuditAI", async () => {
    const response = await AIEngine.executeAudit({
      engagementId: "eng-1",
      taskType: "audit_finding",
      userId: "user-1",
    });

    expect(response.domain).toBe("audit");
    expect(response.result.outputs).toHaveLength(1);
    expect(runGovernedAuditAI).toHaveBeenCalled();
  });

  it("routes office domain to runGovernedOfficeAI", async () => {
    const response = await AIEngine.executeOffice({
      taskId: "task-1",
      title: "Draft memo",
      taskType: "report_draft",
      organizationId: "org-1",
      userId: "user-1",
    });

    expect(response.domain).toBe("office");
    expect(response.result?.content).toBe("office draft");
    expect(runGovernedOfficeAI).toHaveBeenCalled();
  });
});
