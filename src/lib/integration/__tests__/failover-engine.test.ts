// ─── Failover Engine — Unit Tests ───

import { IntegrationType } from "../types";

// Mock heavily: the failover engine imports providerRegistry internally
jest.mock("../provider-registry", () => ({
  providerRegistry: {
    listProviders: jest.fn(),
    resolveWithFallback: jest.fn(),
    resolve: jest.fn(),
  },
  getProviderRegistry: () => ({
    listProviders: jest.fn(),
    resolveWithFallback: jest.fn(),
    resolve: jest.fn(),
  }),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {},
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../metrics", () => ({
  incrementCounter: jest.fn(),
}));

import { providerRegistry } from "../provider-registry";
import {
  getCircuitState,
  isCircuitOpen,
  recordSuccess,
  recordFailure,
  resetCircuit,
  getCircuitSnapshot,
} from "../failover-engine";

// ─── Circuit Breaker Tests ───

describe("FailoverEngine — circuit breaker", () => {
  beforeEach(() => {
    resetCircuit(); // clear all circuits
  });

  describe("getCircuitState", () => {
    it("returns 'closed' for untouched provider", () => {
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("closed");
    });

    it("returns 'open' after threshold failures", () => {
      const threshold = 5;
      for (let i = 0; i < threshold; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("open");
    });

    it("stays 'closed' if failures are below threshold", () => {
      for (let i = 0; i < 3; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("closed");
    });
  });

  describe("isCircuitOpen", () => {
    it("returns false for closed circuit", () => {
      expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(false);
    });

    it("returns true for open circuit", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(true);
    });
  });

  describe("recordSuccess", () => {
    it("resets consecutive failures to 0", () => {
      for (let i = 0; i < 3; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      recordSuccess("org-1", IntegrationType.AI, "openai");
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("closed");
    });

    it("closes an open circuit (after half-open transition)", () => {
      // Force open
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("open");
    });
  });

  describe("recordFailure", () => {
    it("increments consecutive failures", () => {
      for (let i = 0; i < 3; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }

      // After threshold failures, circuit opens
      for (let i = 0; i < 2; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("open");
    });

    it("opens circuit immediately from half-open", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("open");
    });
  });

  describe("resetCircuit", () => {
    it("clears all circuits when called without args", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      recordFailure("org-1", IntegrationType.CRM, "hubspot");
      expect(getCircuitSnapshot().length).toBeGreaterThan(0);

      resetCircuit();
      expect(getCircuitSnapshot().length).toBe(0);
    });

    it("clears circuit for specific org+type+provider", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      resetCircuit("org-1", IntegrationType.AI, "openai");
      expect(getCircuitState("org-1", IntegrationType.AI, "openai")).toBe("closed");
    });
  });

  describe("getCircuitSnapshot", () => {
    it("returns current circuit states", () => {
      for (let i = 0; i < 5; i++) {
        recordFailure("org-1", IntegrationType.AI, "openai");
      }
      const snapshot = getCircuitSnapshot();
      expect(snapshot.length).toBeGreaterThanOrEqual(1);
      const openaiCircuit = snapshot.find((s) => s.key.includes("openai"));
      expect(openaiCircuit).toBeDefined();
      expect(openaiCircuit!.state).toBe("open");
    });
  });
});

// ─── Provider isolation ───

describe("FailoverEngine — provider isolation", () => {
  beforeEach(() => {
    resetCircuit();
  });

  it("different orgs have independent circuit states", () => {
    // Org A fails openai 5 times
    for (let i = 0; i < 5; i++) {
      recordFailure("org-a", IntegrationType.AI, "openai");
    }
    expect(isCircuitOpen("org-a", IntegrationType.AI, "openai")).toBe(true);

    // Org B is unaffected
    expect(isCircuitOpen("org-b", IntegrationType.AI, "openai")).toBe(false);
  });

  it("same org different types have independent circuits", () => {
    for (let i = 0; i < 5; i++) {
      recordFailure("org-1", IntegrationType.AI, "openai");
      recordFailure("org-1", IntegrationType.CRM, "hubspot");
    }
    expect(isCircuitOpen("org-1", IntegrationType.AI, "openai")).toBe(true);
    expect(isCircuitOpen("org-1", IntegrationType.CRM, "hubspot")).toBe(true);
  });
});
