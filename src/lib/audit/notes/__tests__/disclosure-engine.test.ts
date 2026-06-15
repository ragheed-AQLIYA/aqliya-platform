import type { DisclosureNote } from "@/types/audit";
import {
  buildDraftFromTrigger,
  dedupeUnifiedTriggers,
  findMatchingNote,
  mergeMissingInformation,
  mergeTriggerLists,
  nextNoteNumber,
  shouldSkipExistingNote,
  unifyIfrsTriggers,
  unifySocpaTriggers,
} from "../disclosure-engine";
import type { UnifiedDisclosureTrigger } from "../disclosure-engine-types";
import type { DisclosureTrigger } from "@/lib/audit/rules/types";
import { extractRuleCitations } from "../disclosure-types";

const sampleIfrsTrigger: DisclosureTrigger = {
  suggestedTitle: "Revenue from Contracts with Customers",
  suggestedNoteType: "revenue",
  ruleId: "ifrs-15-five-step",
  standardCode: "IFRS 15",
  reasonAr: "يلزم الإفصاح عن سياسات الإيرادات",
  reasonEn: "Revenue recognition policies must be disclosed",
  priority: "high",
};

describe("disclosure-engine", () => {
  it("unifies and dedupes IFRS triggers", () => {
    const unified = unifyIfrsTriggers([sampleIfrsTrigger, sampleIfrsTrigger]);
    const deduped = dedupeUnifiedTriggers(unified);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].source).toBe("ifrs");
    expect(deduped[0].noteType).toBe("revenue");
  });

  it("builds draft with rule citation marker", () => {
    const trigger: UnifiedDisclosureTrigger = unifyIfrsTriggers([
      sampleIfrsTrigger,
    ])[0];
    const draft = buildDraftFromTrigger(trigger);
    expect(draft.content).toContain("human review required");
    expect(draft.missingInformation.some((m) => m.startsWith("RULE_CITATION|"))).toBe(
      true,
    );
    const citations = extractRuleCitations(draft.missingInformation);
    expect(citations[0].standardCode).toBe("IFRS 15");
  });

  it("skips reviewed and approved notes", () => {
    expect(shouldSkipExistingNote("reviewed")).toBe(true);
    expect(shouldSkipExistingNote("approved")).toBe(true);
    expect(shouldSkipExistingNote("draft")).toBe(false);
  });

  it("finds matching note by type and title", () => {
    const notes: DisclosureNote[] = [
      {
        id: "n1",
        engagementId: "e1",
        noteNumber: "1",
        title: "Revenue from Contracts with Customers",
        noteType: "revenue",
        content: "",
        missingInformation: [],
        aiDrafted: false,
        status: "draft",
        reviewComments: [],
        createdAt: "",
        updatedAt: "",
      },
    ];
    const trigger = unifyIfrsTriggers([sampleIfrsTrigger])[0];
    expect(findMatchingNote(notes, trigger)?.id).toBe("n1");
  });

  it("increments note numbers", () => {
    const notes: DisclosureNote[] = [
      {
        id: "n1",
        engagementId: "e1",
        noteNumber: "3",
        title: "A",
        noteType: "other",
        content: "",
        missingInformation: [],
        aiDrafted: false,
        status: "draft",
        reviewComments: [],
        createdAt: "",
        updatedAt: "",
      },
    ];
    expect(nextNoteNumber(notes)).toBe("4");
  });

  it("merges trigger lists from IFRS and SOCPA", () => {
    const ifrs = unifyIfrsTriggers([sampleIfrsTrigger]);
    const socpa = unifySocpaTriggers([
      {
        suggestedTitle: "Zakat Disclosure",
        suggestedNoteType: "zakat",
        ruleId: "socpa-zakat-1",
        standardCode: "SOCPA",
        reasonAr: "إفصاح الزكاة",
        reasonEn: "Zakat disclosure required",
        priority: "high",
      },
    ]);
    const merged = dedupeUnifiedTriggers(mergeTriggerLists(ifrs, socpa));
    expect(merged).toHaveLength(2);
  });

  it("merges missing information without duplicates", () => {
    const merged = mergeMissingInformation(
      ["RULE_CITATION|ifrs|r1|IFRS 15", "HUMAN_REVIEW_REQUIRED"],
      ["RULE_CITATION|ifrs|r1|IFRS 15", "NEW_FIELD"],
    );
    expect(merged).toHaveLength(3);
  });
});
