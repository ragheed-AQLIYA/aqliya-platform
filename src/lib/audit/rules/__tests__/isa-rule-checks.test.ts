/** @jest-environment node */

import { evaluateIsaRule } from "@/lib/audit/rules/isa-rule-checks";
import type { IsaKnowledgeRule } from "@/lib/audit/rules/types";

const partnerRule: IsaKnowledgeRule = {
  ruleId: "isa-220-r001",
  paragraphReference: "ISA 220.9",
  ruleText: "Engagement partner responsibility",
  topic: "engagement-partner",
  standardCode: "ISA 220",
};

describe("ISA rule checks", () => {
  it("fails when engagement partner missing", () => {
    const evaluation = evaluateIsaRule(partnerRule, {
      engagementId: "eng-1",
      engagementStatus: "draft",
      teamMemberCount: 1,
      hasEngagementPartner: false,
      mappingCount: 0,
      tbLineCount: 0,
      materialityCount: 0,
      findingCount: 0,
    });
    expect(evaluation.status).toBe("fail");
  });

  it("passes when engagement partner assigned", () => {
    const evaluation = evaluateIsaRule(partnerRule, {
      engagementId: "eng-1",
      engagementStatus: "draft",
      teamMemberCount: 2,
      hasEngagementPartner: true,
      mappingCount: 5,
      tbLineCount: 10,
      materialityCount: 1,
      findingCount: 0,
    });
    expect(evaluation.status).toBe("pass");
  });
});
