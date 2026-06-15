// ─── AI Observability — Unit Tests ───

jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformAuditLog: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/ai/providers/provider-circuit-breaker", () => ({
  getCircuitBreakerSnapshot: jest.fn(),
}));

jest.mock("@/lib/ai/orchestrator", () => ({
  aiOrchestrator: {
    getAllStatus: jest.fn(),
    getDefaultProviderId: jest.fn(),
  },
}));

jest.mock("@/lib/integration/metrics", () => ({
  getAllCounters: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getCircuitBreakerSnapshot } from "@/lib/ai/providers/provider-circuit-breaker";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { getAllCounters } from "@/lib/integration/metrics";

const mockFindMany = prisma.platformAuditLog.findMany as jest.Mock;
const mockCircuitSnapshot = getCircuitBreakerSnapshot as jest.Mock;
const mockGetAllStatus = aiOrchestrator.getAllStatus as jest.Mock;
const mockGetDefault = aiOrchestrator.getDefaultProviderId as jest.Mock;
const mockGetAllCounters = getAllCounters as jest.Mock;

// ─── Realtime Observability Tests ───

describe("AIRealtimeObservability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns circuit breaker states", async () => {
    mockCircuitSnapshot.mockReturnValue([
      { providerId: "openai", state: "closed", consecutiveFailures: 0 },
      { providerId: "anthropic", state: "closed", consecutiveFailures: 0 },
      { providerId: "cloud", state: "closed", consecutiveFailures: 2 },
      { providerId: "deterministic", state: "closed", consecutiveFailures: 0 },
    ]);

    mockGetAllStatus.mockReturnValue({
      openai: { configured: true, available: true, modelVersion: "gpt-4", latency: 1200, lastError: undefined },
      anthropic: { configured: false, available: false, modelVersion: "", latency: 0, lastError: "No API key" },
      cloud: { configured: true, available: false, modelVersion: "", latency: 0, lastError: "Connection failed" },
      deterministic: { configured: true, available: true, modelVersion: "v1", latency: 5, lastError: undefined },
    });

    mockGetDefault.mockReturnValue("deterministic");

    mockGetAllCounters.mockReturnValue([
      {
        name: "secret_used",
        value: 42,
        labels: { purpose: "AI_INFERENCE", result: "success" },
        updatedAt: new Date(),
      },
    ]);

    // Dynamic import to get fresh module state
    const { getAIRealtimeObservability } = await import("../observability");
    const result = getAIRealtimeObservability();

    expect(result.circuitBreakers).toHaveLength(4);
    expect(result.providerStatus).toBeDefined();
    expect(result.metricCounters).toHaveLength(1);
    expect(result.defaultProvider).toBe("deterministic");
    expect(result.overallHealth).toBeDefined();
  });

  it("computes overallHealth correctly", async () => {
    mockCircuitSnapshot.mockReturnValue([
      { providerId: "openai", state: "closed", consecutiveFailures: 0 },
      { providerId: "anthropic", state: "open", consecutiveFailures: 5 },
      { providerId: "cloud", state: "half-open", consecutiveFailures: 0 },
      { providerId: "deterministic", state: "closed", consecutiveFailures: 0 },
    ]);

    mockGetAllStatus.mockReturnValue({
      openai: { configured: true, available: true, modelVersion: "gpt-4", latency: 1200, lastError: undefined },
      anthropic: { configured: true, available: false, modelVersion: "", latency: 0, lastError: "Open circuit" },
      cloud: { configured: false, available: false, modelVersion: "", latency: 0, lastError: "" },
      deterministic: { configured: true, available: true, modelVersion: "v1", latency: 5, lastError: undefined },
    });

    mockGetDefault.mockReturnValue("deterministic");
    mockGetAllCounters.mockReturnValue([]);

    const { getAIRealtimeObservability } = await import("../observability");
    const result = getAIRealtimeObservability();

    expect(result.overallHealth).toEqual({
      providersConfigured: 3,
      providersAvailable: 2,
      circuitsClosed: 2,
      circuitsOpen: 1,
      circuitsHalfOpen: 1,
    });
  });
});
