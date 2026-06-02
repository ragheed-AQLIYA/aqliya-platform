export interface ReviewApprovalActor {
  id: string;
  role: string;
  organizationId?: string;
  displayName?: string;
}

export type ReviewApprovalDecision = "approved" | "rejected" | "amend" | "pending";

export interface ReviewApprovalPackage {
  id: string;
  resourceType: string;
  resourceId: string;
  organizationId: string;
  productSlug: string;
  status: "draft" | "in_review" | "approved" | "rejected" | "amend";
  submittedBy: ReviewApprovalActor;
  assignedReviewers: ReviewApprovalActor[];
  decisions: {
    actor: ReviewApprovalActor;
    decision: ReviewApprovalDecision;
    comment?: string;
    timestamp: string;
  }[];
  currentCycle: number;
  createdAt: string;
  updatedAt: string;
}
