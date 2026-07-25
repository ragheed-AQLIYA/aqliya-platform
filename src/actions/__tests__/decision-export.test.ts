// ─── Unit/Integration Test: DecisionOS Export ───
// Tests exportDecisionReport with various data shapes.
// Uses mocked Prisma — no database required.

// ─── Mocks (hoisted before imports) ───

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/decision/decision-export-pdf", () => ({
  buildDecisionReportPDF: jest.fn().mockResolvedValue({
    content: Buffer.from("mock-pdf-content"),
    mimeType: "application/pdf",
    filename: "decision-report.pdf",
  }),
}));

const mockGetCurrentUser = jest.fn();
const mockEnforce = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: (...args) => mockGetCurrentUser(...args),
  hasRequiredRole: jest.fn().mockReturnValue(true),
  isExpectedAccessDeniedError: jest.fn((error) =>
    error instanceof Error &&
    (error.message.startsWith("Access denied:") || error.message === "Unauthenticated")
  ),
}));

jest.mock("@/lib/kernel", () => ({
  enforce: mockEnforce,
}));

jest.mock("@/lib/decision/decision-audit", () => ({
  logAudit: jest.fn().mockResolvedValue(undefined),
  logDecisionAudit: jest.fn().mockResolvedValue(undefined),
  toAuditJson: jest.fn((o) => JSON.stringify(o)),
  getDecisionAuditLogs: jest.fn().mockResolvedValue([{ id: "audit-1", action: "DECISION_CREATED", entity: "Decision", createdAt: new Date("2026-06-01"), after: null, user: { name: "مستخدم", email: null } }]),
}));

jest.mock("@/lib/observability/logger", () => ({
  createLogger: jest.fn(() => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  })),
}));

jest.mock("@/lib/platform/cache-strategy", () => ({
  getCachedOrFetch: jest.fn((_key, fn) => fn()),
  invalidateDashboardCaches: jest.fn(),
  warmDashboardCaches: jest.fn(),
  DASHBOARD_CACHE_TTL_MS: 300000,
  ENTITY_CACHE_TTL_MS: 60000,
}));

const mockDecisionFindUnique = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    decision: {
      findUnique: mockDecisionFindUnique,
    },
  },
}));

// ─── Imports (after mocks) ───

import { exportDecisionReport } from "@/actions/decisions";

// ─── Mock Data ───

const mockUser = {
  id: "user-1",
  name: "\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u062e\u062a\u0628\u0627\u0631",
  email: "test@aqliya.com",
  organizationId: "org-1",
  platformOrganizationId: "plat-org-1",
  role: "ADMIN",
  organization: { id: "org-1", name: "\u0645\u0646\u0638\u0645\u0629 \u0627\u062e\u062a\u0628\u0627\u0631" },
};

function makeDecision(overrides = {}) {
  return {
    id: "decision-1",
    title: "\u0642\u0631\u0627\u0631 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u064a \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a",
    status: "APPROVED",
    organizationId: "org-1",
    owner: { name: "\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u062e\u062a\u0628\u0627\u0631" },
    organization: { name: "\u0645\u0646\u0638\u0645\u0629 \u0627\u062e\u062a\u0628\u0627\u0631" },
    createdAt: new Date("2026-06-01"),
    tenderProfile: {
      clientName: "\u0639\u0645\u064a\u0644 \u062a\u062c\u0631\u064a\u0628\u064a",
      estimatedContractValue: 5000000,
      estimatedCost: 3500000,
      durationMonths: 12,
      marginEstimate: 0.3,
      riskLevel: "MEDIUM",
      requiredCapacity: 10,
      internalAvailableCapacity: 8,
      strategicFitScore: 80,
    },
    recommendation: {
      type: "FINAL",
      confidenceScore: 85,
      reasoning: "\u062a\u0648\u0635\u064a\u0629 \u0628\u0627\u0644\u0645\u0636\u064a \u0642\u062f\u0645\u0627\u064b",
      conditions: null,
      riskNotes: null,
    },
    scenarios: [{
      type: "OPTIMISTIC",
      simulation: {
        feasibilityScore: 75,
        financialScore: 80,
        capacityScore: 70,
        riskScore: 65,
        strategicFitScore: 78,
        overallDecisionScore: 74,
      },
    }],
    auditLogs: [{
      action: "DECISION_CREATED",
      user: { name: "\u0645\u0633\u062a\u062e\u062f\u0645" },
      createdAt: new Date("2026-06-01"),
    }],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCurrentUser.mockResolvedValue(mockUser);
  mockEnforce.mockResolvedValue(undefined);
  mockDecisionFindUnique.mockResolvedValue({ organizationId: "org-1" });
});

// ─── exportDecisionReport ───

describe("exportDecisionReport", () => {
  it("exports a decision report with full data successfully", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce(makeDecision());

    const result = await exportDecisionReport("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBeDefined();
      expect(result.mimeType).toBe("application/pdf");
      expect(result.filename).toBe("decision-report.pdf");
    }
    expect(mockEnforce).toHaveBeenCalledTimes(2); // update + export
  });

  it("exports without tender profile", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce(makeDecision({ tenderProfile: null }));

    const result = await exportDecisionReport("decision-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.content).toBeDefined();
    }
  });

  it("exports without recommendation", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce(makeDecision({ recommendation: null }));

    const result = await exportDecisionReport("decision-1");

    expect(result.success).toBe(true);
  });

  it("exports without scenarios or simulations", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce(makeDecision({ scenarios: [] }));

    const result = await exportDecisionReport("decision-1");

    expect(result.success).toBe(true);
  });

  it("exports without audit logs", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce(makeDecision({ auditLogs: [] }));

    const result = await exportDecisionReport("decision-1");

    expect(result.success).toBe(true);
  });

  it("returns error when decision not found", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce(null);

    const result = await exportDecisionReport("nonexistent");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe("Decision not found");
    }
  });

  it("handles lookup failure", async () => {
    mockDecisionFindUnique.mockResolvedValue(null);

    const result = await exportDecisionReport("nonexistent");

    expect(result.success).toBe(false);
  });

  it("handles unauthorized access", async () => {
    mockEnforce.mockRejectedValue(new Error("Access denied: tenant mismatch"));

    const result = await exportDecisionReport("decision-1");

    expect(result.success).toBe(false);
  });

  it("logs audit event on successful export", async () => {
    mockDecisionFindUnique
      .mockResolvedValueOnce({ organizationId: "org-1" })
      .mockResolvedValueOnce(makeDecision());

    const { logAudit } = require("@/lib/decision/decision-audit");

    await exportDecisionReport("decision-1");

    expect(logAudit).toHaveBeenCalledWith(
      "user-1",
      "decision-1",
      "OUTPUT_PUBLISHED",
      "DecisionReport",
      undefined,
      expect.any(String),
      "org-1",
    );
  });
});
