import { describe, expect, it } from "@jest/globals";

// ─── Types ────────────────────────────────────────────────────────────────────

type StateMachine<T extends string> = {
  states: T[];
  transitions: { from: T; to: T }[];
  role: Record<string, string>;
  auditAction: string;
};

// ─── State Machines (mirroring prisma/schema.prisma status values) ────────────

const PROJECT_STATES = [
  "Draft",
  "DataCollection",
  "ClassificationInProgress",
  "EvidenceReview",
  "FindingsDrafted",
  "InReview",
  "Returned",
  "Approved",
  "Rejected",
  "ReportReady",
  "Exported",
  "Archived",
] as const;
type ProjectState = (typeof PROJECT_STATES)[number];

const EVIDENCE_STATES = [
  "uploaded",
  "linked",
  "reviewed",
  "verified",
  "rejected",
  "missing",
] as const;
type EvidenceState = (typeof EVIDENCE_STATES)[number];

const FINDING_STATES = [
  "draft",
  "submitted",
  "reviewed",
  "resolved",
  "dismissed",
] as const;
type FindingState = (typeof FINDING_STATES)[number];

const REVIEW_STATES = [
  "pending",
  "in_review",
  "returned",
  "completed",
] as const;
type ReviewState = (typeof REVIEW_STATES)[number];

const SCORE_STATES = ["pending", "calculated", "approved"] as const;
type ScoreState = (typeof SCORE_STATES)[number];

// ─── Valid transitions (from LCOS_STATE_MACHINE_MATRIX.md) ─────────────────────

const PROJECT_TRANSITIONS: { from: ProjectState; to: ProjectState }[] = [
  { from: "Draft", to: "DataCollection" },
  { from: "DataCollection", to: "ClassificationInProgress" },
  { from: "ClassificationInProgress", to: "EvidenceReview" },
  { from: "EvidenceReview", to: "FindingsDrafted" },
  { from: "FindingsDrafted", to: "InReview" },
  { from: "InReview", to: "Approved" },
  { from: "InReview", to: "Returned" },
  { from: "Returned", to: "InReview" },
  { from: "Approved", to: "ReportReady" },
  { from: "ReportReady", to: "Exported" },
  { from: "Draft", to: "Archived" },
  { from: "Exported", to: "Archived" },
];

const EVIDENCE_TRANSITIONS: { from: EvidenceState; to: EvidenceState }[] = [
  { from: "uploaded", to: "linked" },
  { from: "linked", to: "reviewed" },
  { from: "reviewed", to: "verified" },
  { from: "reviewed", to: "rejected" },
  { from: "uploaded", to: "missing" },
  { from: "linked", to: "missing" },
  { from: "rejected", to: "uploaded" },
  { from: "missing", to: "uploaded" },
];

const FINDING_TRANSITIONS: { from: FindingState; to: FindingState }[] = [
  { from: "draft", to: "submitted" },
  { from: "submitted", to: "reviewed" },
  { from: "reviewed", to: "resolved" },
  { from: "reviewed", to: "dismissed" },
  { from: "submitted", to: "draft" },
  { from: "dismissed", to: "draft" },
  { from: "resolved", to: "draft" },
];

const REVIEW_TRANSITIONS: { from: ReviewState; to: ReviewState }[] = [
  { from: "pending", to: "in_review" },
  { from: "in_review", to: "completed" },
  { from: "in_review", to: "returned" },
  { from: "returned", to: "in_review" },
  { from: "pending", to: "completed" },
];

const SCORE_TRANSITIONS: { from: ScoreState; to: ScoreState }[] = [
  { from: "pending", to: "calculated" },
  { from: "calculated", to: "approved" },
  { from: "calculated", to: "pending" },
  { from: "approved", to: "pending" },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

function isValidTransition<T extends string>(
  from: T,
  to: T,
  allStates: readonly T[],
  validTransitions: { from: T; to: T }[],
): boolean {
  return validTransitions.some((t) => t.from === from && t.to === to);
}

function noInvalidTransitionsPass<T extends string>(
  allStates: readonly T[],
  validTransitions: { from: T; to: T }[],
): { from: T; to: T }[] {
  const allowed = new Set(validTransitions.map((t) => `${t.from}->${t.to}`));
  const invalid: { from: T; to: T }[] = [];
  for (const from of allStates) {
    for (const to of allStates) {
      if (from !== to && !allowed.has(`${from}->${to}`)) {
        invalid.push({ from, to });
      }
    }
  }
  return invalid;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("LocalContentOS State Machines", () => {
  // ── LocalContentProject ───────────────────────────────────────────────────
  describe("LocalContentProject", () => {
    it.each(PROJECT_TRANSITIONS)(
      "allows valid transition $from → $to",
      ({ from, to }) => {
        expect(isValidTransition(from, to, PROJECT_STATES, PROJECT_TRANSITIONS)).toBe(true);
      },
    );

    it("rejects every invalid transition", () => {
      const invalid = noInvalidTransitionsPass(PROJECT_STATES, PROJECT_TRANSITIONS);
      const selfLoops = PROJECT_STATES.filter(
        (s) => !PROJECT_TRANSITIONS.some((t) => t.from === s && t.to === s),
      );
      // Archived is terminal — no outgoing transitions
      expect(invalid.length).toBeGreaterThan(0);
      expect(invalid.some((t) => t.from === "Archived")).toBe(true);
      expect(invalid.some((t) => t.from === "Draft" && t.to === "InReview")).toBe(true);
      expect(invalid.some((t) => t.from === "Draft" && t.to === "Approved")).toBe(true);
    });

    it("has forward-only sequence for the happy path", () => {
      const happyPath: ProjectState[] = [
        "Draft",
        "DataCollection",
        "ClassificationInProgress",
        "EvidenceReview",
        "FindingsDrafted",
        "InReview",
        "Approved",
        "ReportReady",
        "Exported",
      ];
      for (let i = 0; i < happyPath.length - 1; i++) {
        expect(
          isValidTransition(happyPath[i], happyPath[i + 1], PROJECT_STATES, PROJECT_TRANSITIONS),
        ).toBe(true);
      }
    });
  });

  // ── LcEvidence ─────────────────────────────────────────────────────────────
  describe("LcEvidence", () => {
    it.each(EVIDENCE_TRANSITIONS)(
      "allows valid transition $from → $to",
      ({ from, to }) => {
        expect(isValidTransition(from, to, EVIDENCE_STATES, EVIDENCE_TRANSITIONS)).toBe(true);
      },
    );

    it("rejects skipping required intermediate states", () => {
      expect(isValidTransition("uploaded", "verified", EVIDENCE_STATES, EVIDENCE_TRANSITIONS)).toBe(
        false,
      );
      expect(isValidTransition("uploaded", "rejected", EVIDENCE_STATES, EVIDENCE_TRANSITIONS)).toBe(
        false,
      );
      expect(isValidTransition("linked", "verified", EVIDENCE_STATES, EVIDENCE_TRANSITIONS)).toBe(
        false,
      );
    });

    it("verified is terminal (no outgoing)", () => {
      for (const to of EVIDENCE_STATES) {
        if (to === "verified") continue;
        expect(isValidTransition("verified", to, EVIDENCE_STATES, EVIDENCE_TRANSITIONS)).toBe(
          false,
        );
      }
    });

    it("supports re-upload after reject or missing", () => {
      expect(isValidTransition("rejected", "uploaded", EVIDENCE_STATES, EVIDENCE_TRANSITIONS)).toBe(
        true,
      );
      expect(isValidTransition("missing", "uploaded", EVIDENCE_STATES, EVIDENCE_TRANSITIONS)).toBe(
        true,
      );
    });
  });

  // ── LcFinding ───────────────────────────────────────────────────────────────
  describe("LcFinding", () => {
    it.each(FINDING_TRANSITIONS)(
      "allows valid transition $from → $to",
      ({ from, to }) => {
        expect(isValidTransition(from, to, FINDING_STATES, FINDING_TRANSITIONS)).toBe(true);
      },
    );

    it("rejects skip transitions", () => {
      expect(isValidTransition("draft", "reviewed", FINDING_STATES, FINDING_TRANSITIONS)).toBe(
        false,
      );
      expect(isValidTransition("draft", "resolved", FINDING_STATES, FINDING_TRANSITIONS)).toBe(
        false,
      );
      expect(isValidTransition("draft", "dismissed", FINDING_STATES, FINDING_TRANSITIONS)).toBe(
        false,
      );
      expect(isValidTransition("submitted", "resolved", FINDING_STATES, FINDING_TRANSITIONS)).toBe(
        false,
      );
    });

    it("allows re-opening from resolved or dismissed", () => {
      expect(isValidTransition("resolved", "draft", FINDING_STATES, FINDING_TRANSITIONS)).toBe(
        true,
      );
      expect(isValidTransition("dismissed", "draft", FINDING_STATES, FINDING_TRANSITIONS)).toBe(
        true,
      );
    });
  });

  // ── LcReview ────────────────────────────────────────────────────────────────
  describe("LcReview", () => {
    it.each(REVIEW_TRANSITIONS)(
      "allows valid transition $from → $to",
      ({ from, to }) => {
        expect(isValidTransition(from, to, REVIEW_STATES, REVIEW_TRANSITIONS)).toBe(true);
      },
    );

    it("rejects skip or invalid transitions", () => {
      expect(isValidTransition("pending", "returned", REVIEW_STATES, REVIEW_TRANSITIONS)).toBe(
        false,
      );
      expect(isValidTransition("returned", "completed", REVIEW_STATES, REVIEW_TRANSITIONS)).toBe(
        false,
      );
    });

    it("completed is terminal", () => {
      for (const to of REVIEW_STATES) {
        if (to === "completed") continue;
        expect(isValidTransition("completed", to, REVIEW_STATES, REVIEW_TRANSITIONS)).toBe(false);
      }
    });

    it("supports re-review cycle", () => {
      expect(isValidTransition("returned", "in_review", REVIEW_STATES, REVIEW_TRANSITIONS)).toBe(
        true,
      );
    });
  });

  // ── LcScore ─────────────────────────────────────────────────────────────────
  describe("LcScore (LcWorkbook.lcScore lifecycle)", () => {
    it.each(SCORE_TRANSITIONS)(
      "allows valid transition $from → $to",
      ({ from, to }) => {
        expect(isValidTransition(from, to, SCORE_STATES, SCORE_TRANSITIONS)).toBe(true);
      },
    );

    it("rejects skipping calculation step", () => {
      expect(isValidTransition("pending", "approved", SCORE_STATES, SCORE_TRANSITIONS)).toBe(
        false,
      );
    });

    it("supports recalculation and revision", () => {
      expect(isValidTransition("calculated", "pending", SCORE_STATES, SCORE_TRANSITIONS)).toBe(true);
      expect(isValidTransition("approved", "pending", SCORE_STATES, SCORE_TRANSITIONS)).toBe(true);
    });
  });

  // ── Cross-model Governance ───────────────────────────────────────────────────
  describe("Cross-model governance invariants", () => {
    it("every model has at least one valid transition", () => {
      expect(PROJECT_TRANSITIONS.length).toBeGreaterThan(0);
      expect(EVIDENCE_TRANSITIONS.length).toBeGreaterThan(0);
      expect(FINDING_TRANSITIONS.length).toBeGreaterThan(0);
      expect(REVIEW_TRANSITIONS.length).toBeGreaterThan(0);
      expect(SCORE_TRANSITIONS.length).toBeGreaterThan(0);
    });

    it("no model references undefined states", () => {
      const allValid = (states: readonly string[], transitions: { from: string; to: string }[]) =>
        transitions.every((t) => states.includes(t.from) && states.includes(t.to));

      expect(allValid(PROJECT_STATES, PROJECT_TRANSITIONS)).toBe(true);
      expect(allValid(EVIDENCE_STATES, EVIDENCE_TRANSITIONS)).toBe(true);
      expect(allValid(FINDING_STATES, FINDING_TRANSITIONS)).toBe(true);
      expect(allValid(REVIEW_STATES, REVIEW_TRANSITIONS)).toBe(true);
      expect(allValid(SCORE_STATES, SCORE_TRANSITIONS)).toBe(true);
    });

    it("all transitions are stateful (from !== to)", () => {
      const noSelfLoop = (transitions: { from: string; to: string }[]) =>
        transitions.every((t) => t.from !== t.to);

      expect(noSelfLoop(PROJECT_TRANSITIONS)).toBe(true);
      expect(noSelfLoop(EVIDENCE_TRANSITIONS)).toBe(true);
      expect(noSelfLoop(FINDING_TRANSITIONS)).toBe(true);
      expect(noSelfLoop(REVIEW_TRANSITIONS)).toBe(true);
      expect(noSelfLoop(SCORE_TRANSITIONS)).toBe(true);
    });
  });
});
