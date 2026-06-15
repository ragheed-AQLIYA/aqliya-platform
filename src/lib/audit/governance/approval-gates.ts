/**
 * Factory approval gates — pure evaluators (AuditOS 2.0 Phase 10)
 */

import { extractRuleCitations } from "@/lib/audit/notes/disclosure-types";
import { hasIntelligenceEnrichment } from "@/lib/audit/intelligence/types";
import type {
  ApprovalGateCheck,
  FactoryGateEvaluation,
  FactoryGateSnapshot,
} from "./types";

const APPROVED_NOTE_STATUSES = new Set(["reviewed", "approved"]);
const OPEN_ISSUE_STATUSES = new Set(["open"]);

function pushGate(
  checklist: ApprovalGateCheck[],
  blockingIssues: string[],
  gate: ApprovalGateCheck,
): void {
  checklist.push(gate);
  if (!gate.passed) {
    blockingIssues.push(`${gate.label}: ${gate.detail}`);
  }
}

export function evaluateFactoryApprovalGates(
  snapshot: FactoryGateSnapshot,
): FactoryGateEvaluation {
  const checklist: ApprovalGateCheck[] = [];
  const blockingIssues: string[] = [];

  const ruleCitationNotes = snapshot.notes.filter(
    (n) => extractRuleCitations(n.missingInformation).length > 0,
  );
  const unapprovedRuleNotes = ruleCitationNotes.filter(
    (n) => !APPROVED_NOTE_STATUSES.has(n.status),
  );
  pushGate(checklist, blockingIssues, {
    gateId: "factory-disclosure-approved",
    label: "Rule-linked disclosure notes approved",
    passed: unapprovedRuleNotes.length === 0,
    detail:
      unapprovedRuleNotes.length === 0
        ? `${ruleCitationNotes.length} rule-linked note(s) reviewed`
        : `${unapprovedRuleNotes.length} rule-linked note(s) pending review (${unapprovedRuleNotes.map((n) => n.title).slice(0, 2).join(", ")})`,
  });

  const enrichedNotes = snapshot.notes.filter((n) =>
    hasIntelligenceEnrichment(n.content),
  );
  const unreviewedEnriched = enrichedNotes.filter(
    (n) => n.status === "draft" || n.status === "needs_info",
  );
  pushGate(checklist, blockingIssues, {
    gateId: "factory-intelligence-reviewed",
    label: "Intelligence-enriched notes reviewed",
    passed: unreviewedEnriched.length === 0,
    detail:
      unreviewedEnriched.length === 0
        ? enrichedNotes.length > 0
          ? `${enrichedNotes.length} enriched note(s) reviewed`
          : "No intelligence enrichment pending"
        : `${unreviewedEnriched.length} enriched note(s) require human review`,
  });

  const aiDraftNotes = snapshot.notes.filter(
    (n) => n.aiDrafted && !APPROVED_NOTE_STATUSES.has(n.status),
  );
  pushGate(checklist, blockingIssues, {
    gateId: "factory-ai-drafts-reviewed",
    label: "AI-assisted disclosure drafts reviewed",
    passed: aiDraftNotes.length === 0,
    detail:
      aiDraftNotes.length === 0
        ? "No pending AI-assisted drafts"
        : `${aiDraftNotes.length} AI-assisted draft(s) pending review`,
  });

  const blockingValidation = snapshot.validationIssues.filter(
    (i) =>
      OPEN_ISSUE_STATUSES.has(i.status) &&
      (i.severity === "critical" || i.severity === "high"),
  );
  pushGate(checklist, blockingIssues, {
    gateId: "factory-validation-clean",
    label: "No open critical/high validation issues",
    passed: blockingValidation.length === 0,
    detail:
      blockingValidation.length === 0
        ? "Validation clear for approval"
        : `${blockingValidation.length} open critical/high validation issue(s)`,
  });

  const draftStatements = snapshot.statements.filter(
    (s) => s.status !== "approved",
  );
  pushGate(checklist, blockingIssues, {
    gateId: "factory-fs-approved",
    label: "Financial statements approved",
    passed: draftStatements.length === 0,
    detail:
      draftStatements.length === 0
        ? "All statements approved"
        : `${draftStatements.length} statement(s) not approved (${draftStatements.map((s) => s.statementType).join(", ")})`,
  });

  return { checklist, blockingIssues };
}
