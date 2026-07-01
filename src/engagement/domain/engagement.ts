/** Engagement Aggregate — CPV-001 WP-01. Template: SalesOS Deal aggregate */
import { BusinessRuleError, ValidationError } from "./errors";

export type EngagementStatus = "Proposal" | "Accepted" | "Planning" | "RiskAssessment" | "Fieldwork" | "InReview" | "Reporting" | "SignOff" | "Archived";

export interface ReviewRecord {
  level: "senior" | "manager" | "partner" | "quality";
  reviewerId: string; decision: "approved" | "revision_required"; reason: string; reviewedAt: string;
}

export interface RevisionCycle {
  revisionNumber: number; returnedToFieldworkAt: string; reason: string; resolved: boolean;
}

export interface MaterialityThreshold {
  planning: number; performance: number; clearlyTrivial: number;
}

export interface CreateEngagementProps {
  clientId: string; period: string; team?: { userId: string; role: string }[];
  organizationId: string; createdById: string;
}

export interface EngagementProps extends CreateEngagementProps {
  id: string; status: EngagementStatus; reviewHistory: ReviewRecord[];
  revisionCycles: RevisionCycle[]; materiality?: MaterialityThreshold;
  qualityReviewCompleted: boolean; version: number; createdAt: string; updatedAt: string;
}

export class Engagement {
  private constructor(private props: EngagementProps) {}

  static create(props: CreateEngagementProps): Engagement {
    const now = new Date().toISOString();
    return new Engagement({ ...props, id: "", status: "Proposal", reviewHistory: [], revisionCycles: [], qualityReviewCompleted: false, version: 1, createdAt: now, updatedAt: now });
  }
  static reconstitute(props: EngagementProps): Engagement { return new Engagement(props); }

  get id(): string { return this.props.id; }
  get status(): EngagementStatus { return this.props.status; }
  get version(): number { return this.props.version; }
  get clientId(): string { return this.props.clientId; }
  get period(): string { return this.props.period; }
  get reviewHistory(): ReviewRecord[] { return [...this.props.reviewHistory]; }
  get revisionCycles(): RevisionCycle[] { return [...this.props.revisionCycles]; }
  get materiality(): MaterialityThreshold | undefined { return this.props.materiality; }
  get qualityReviewCompleted(): boolean { return this.props.qualityReviewCompleted; }

  transition(to: EngagementStatus, action: string, _actorId: string): Engagement {
    const valid: Record<string, EngagementStatus> = {
      accept: "Accepted", plan: "Planning", assess_risk: "RiskAssessment", start_fieldwork: "Fieldwork",
      submit_review: "InReview", approve_review: "Reporting", report: "SignOff", sign_off: "Archived",
      return_to_fieldwork: "Fieldwork",
    };
    const target = valid[action];
    if (!target) throw new ValidationError("Invalid transition action");
    const now = new Date().toISOString();
    const revisions = [...this.props.revisionCycles];
    if (action === "return_to_fieldwork") {
      revisions.push({ revisionNumber: revisions.length + 1, returnedToFieldworkAt: now, reason: "", resolved: false });
    }
    return Engagement.reconstitute({ ...this.props, status: target, revisionCycles: revisions, updatedAt: now });
  }

  addReview(record: ReviewRecord): Engagement {
    return Engagement.reconstitute({ ...this.props, reviewHistory: [...this.props.reviewHistory, record], updatedAt: new Date().toISOString() });
  }

  setMateriality(m: MaterialityThreshold): Engagement {
    if (m.clearlyTrivial > m.performance || m.performance > m.planning) throw new BusinessRuleError("Materiality hierarchy violated");
    return Engagement.reconstitute({ ...this.props, materiality: m, updatedAt: new Date().toISOString() });
  }

  completeQualityReview(): Engagement { return Engagement.reconstitute({ ...this.props, qualityReviewCompleted: true, updatedAt: new Date().toISOString() }); }

  toJSON(): EngagementProps { return { ...this.props }; }
}
