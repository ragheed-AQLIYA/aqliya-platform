/** SalesOS L5 — relational governance types (String status fields, not Prisma enums). */

export type SalesProposalStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "archived";

export type SalesReviewStatus = "pending" | "approved" | "rejected";

export type SalesApprovalStatus = "approved" | "rejected" | "revoked";

export type SalesReviewType =
  | "opportunity_governance"
  | "proposal"
  | "outreach"
  | "claim";

export type SalesApprovalKind =
  | "opportunity_stage"
  | "proposal_export"
  | "commercial_claim";

export const SALES_REVIEW_TARGET_DEAL = "SalesDeal" as const;
