import { describe, expect, it } from "@jest/globals";
import {
  INTELLIGENCE_HUB_TABS,
  parseIntelligenceHubTab,
} from "@/components/sales/intelligence-hub-tabs";

describe("intelligence hub tabs", () => {
  it("parses known hash fragments", () => {
    expect(parseIntelligenceHubTab("#market")).toBe("market");
    expect(parseIntelligenceHubTab("#proof")).toBe("proof");
    expect(parseIntelligenceHubTab("#memory")).toBe("memory");
    expect(parseIntelligenceHubTab("#graph")).toBe("graph");
  });

  it("maps legacy hash aliases", () => {
    expect(parseIntelligenceHubTab("#proof-network")).toBe("proof");
    expect(parseIntelligenceHubTab("#knowledge-graph")).toBe("graph");
  });

  it("defaults to market for unknown or empty hash", () => {
    expect(parseIntelligenceHubTab("")).toBe("market");
    expect(parseIntelligenceHubTab("#unknown")).toBe("market");
  });

  it("exposes four hub tabs in UX order", () => {
    expect(INTELLIGENCE_HUB_TABS).toEqual([
      "market",
      "proof",
      "memory",
      "graph",
    ]);
  });
});
