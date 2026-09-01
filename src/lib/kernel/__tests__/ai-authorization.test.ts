import { getAITaskSensitivity } from "@/lib/core/ai/ai-authorization";
import type { AIAuthorizationRequest } from "@/lib/core/ai/ai-authorization";

jest.mock("@/lib/platform/feature-flags/registry", () => ({
  isEnabled: jest.fn((key: string) => {
    if (key === "platform.ai-authorization") return true;
    if (key === "ai.rag") return false;
    return false;
  }),
}));

function makeRequest(overrides: Partial<AIAuthorizationRequest> = {}): AIAuthorizationRequest {
  return {
    taskType: "analysis",
    organizationId: "org-1",
    actorId: "user-1",
    actorRoles: ["manager"],
    ...overrides,
  };
}

describe("AI Authorization Gate", () => {
  describe("authorizeAIAction", () => {
    it("allows authorized task for manager role", () => {
      const { authorizeAIAction } = require("@/lib/core/ai/ai-authorization");
      const result = authorizeAIAction(makeRequest());
      expect(result.allowed).toBe(true);
    });

    it("denies generation task for viewer role", () => {
      const { authorizeAIAction } = require("@/lib/core/ai/ai-authorization");
      const result = authorizeAIAction(makeRequest({ actorRoles: ["viewer"], taskType: "generation" }));
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not authorized");
    });

    it("denies extraction task for viewer role", () => {
      const { authorizeAIAction } = require("@/lib/core/ai/ai-authorization");
      const result = authorizeAIAction(makeRequest({ actorRoles: ["viewer"], taskType: "extraction" }));
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not authorized");
    });

    it("denies classification task for external_auditor", () => {
      const { authorizeAIAction } = require("@/lib/core/ai/ai-authorization");
      const result = authorizeAIAction(makeRequest({ actorRoles: ["external_auditor"], taskType: "classification" }));
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not authorized");
    });

    it("allows extraction task for manager role", () => {
      const { authorizeAIAction } = require("@/lib/core/ai/ai-authorization");
      const result = authorizeAIAction(makeRequest({ taskType: "extraction" }));
      expect(result.allowed).toBe(true);
    });

    it("denies missing tenant or actor even when the feature flag is off", () => {
      const { isEnabled } = require("@/lib/platform/feature-flags/registry");
      isEnabled.mockReturnValue(false);

      const { authorizeAIAction } = require("@/lib/core/ai/ai-authorization");
      const result = authorizeAIAction(
        makeRequest({ actorId: "", organizationId: "", actorRoles: ["viewer"], taskType: "generation" }),
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("authenticated tenant context");

      isEnabled.mockImplementation((key: string) => {
        if (key === "platform.ai-authorization") return true;
        return false;
      });
    });

    it("allows any task when feature flag is off", () => {
      const { isEnabled } = require("@/lib/platform/feature-flags/registry");
      isEnabled.mockReturnValue(false);

      const { authorizeAIAction } = require("@/lib/core/ai/ai-authorization");
      const result = authorizeAIAction(makeRequest({ actorRoles: ["viewer"], taskType: "generation" }));
      expect(result.allowed).toBe(true);

      isEnabled.mockImplementation((key: string) => {
        if (key === "platform.ai-authorization") return true;
        return false;
      });
    });
  });

  describe("getAITaskSensitivity", () => {
    it("returns correct sensitivity levels", () => {
      expect(getAITaskSensitivity("analysis")).toBe("medium");
      expect(getAITaskSensitivity("generation")).toBe("low");
      expect(getAITaskSensitivity("review")).toBe("medium");
      expect(getAITaskSensitivity("extraction")).toBe("high");
      expect(getAITaskSensitivity("classification")).toBe("medium");
      expect(getAITaskSensitivity("embedding")).toBe("low");
    });
  });
});
