/**
 * A1-08 — multi-role reviewer sign-off chain (deterministic stage model).
 */

export type SignoffStageKey =
  | "fieldwork"
  | "technical_review"
  | "partner_signoff"
  | "publication";

export type SignoffStageStatus = "pending" | "in_progress" | "complete" | "blocked";

export type SignoffStage = {
  key: SignoffStageKey;
  labelAr: string;
  requiredRole: string;
  status: SignoffStageStatus;
  detailAr: string;
  completedAt: string | null;
  completedBy: string | null;
};

export type ReviewerSignoffChainSnapshot = {
  stages: SignoffStage[];
  overallProgressPct: number;
  currentStageKey: SignoffStageKey | null;
  blocked: boolean;
  disclaimerAr: string;
};

export type SignoffChainInput = {
  engagementStatus: string;
  hasTrialBalance: boolean;
  hasStatements: boolean;
  openReviewComments: number;
  approvalRecords: Array<{
    approverRole: string;
    approverName: string;
    action: string;
    createdAt: string;
  }>;
};

function latestApproval(
  records: SignoffChainInput["approvalRecords"],
  roleMatch: (role: string) => boolean,
): SignoffChainInput["approvalRecords"][number] | null {
  return (
    records
      .filter((r) => roleMatch(r.approverRole.toLowerCase()) && r.action === "approved")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
}

export function buildReviewerSignoffChain(
  input: SignoffChainInput,
): ReviewerSignoffChainSnapshot {
  const fieldworkComplete = input.hasTrialBalance && input.hasStatements;
  const reviewerApproval = latestApproval(
    input.approvalRecords,
    (r) => r.includes("reviewer") || r === "admin",
  );
  const partnerApproval = latestApproval(
    input.approvalRecords,
    (r) => r.includes("partner"),
  );

  const technicalComplete =
    fieldworkComplete &&
    input.openReviewComments === 0 &&
    Boolean(reviewerApproval);

  const partnerComplete = technicalComplete && Boolean(partnerApproval);

  const publicationComplete =
    partnerComplete &&
    (input.engagementStatus === "published" ||
      input.engagementStatus === "ready_for_approval");

  const stages: SignoffStage[] = [
    {
      key: "fieldwork",
      labelAr: "العمل الميداني",
      requiredRole: "operator",
      status: fieldworkComplete
        ? "complete"
        : input.hasTrialBalance
          ? "in_progress"
          : "pending",
      detailAr: fieldworkComplete
        ? "ميزان المراجعة والقوائم جاهزة"
        : "يلزم رفع الميزان وإنشاء القوائم",
      completedAt: fieldworkComplete ? input.approvalRecords[0]?.createdAt ?? null : null,
      completedBy: null,
    },
    {
      key: "technical_review",
      labelAr: "المراجعة الفنية",
      requiredRole: "reviewer",
      status: !fieldworkComplete
        ? "blocked"
        : technicalComplete
          ? "complete"
          : input.openReviewComments > 0
            ? "in_progress"
            : "pending",
      detailAr: technicalComplete
        ? `اعتماد مراجع: ${reviewerApproval?.approverName ?? "—"}`
        : `${input.openReviewComments} تعليق مراجعة مفتوح`,
      completedAt: reviewerApproval?.createdAt ?? null,
      completedBy: reviewerApproval?.approverName ?? null,
    },
    {
      key: "partner_signoff",
      labelAr: "اعتماد الشريك",
      requiredRole: "partner",
      status: !technicalComplete
        ? "blocked"
        : partnerComplete
          ? "complete"
          : "pending",
      detailAr: partnerComplete
        ? `اعتماد شريك: ${partnerApproval?.approverName ?? "—"}`
        : "بانتظار اعتماد الشريك",
      completedAt: partnerApproval?.createdAt ?? null,
      completedBy: partnerApproval?.approverName ?? null,
    },
    {
      key: "publication",
      labelAr: "النشر",
      requiredRole: "partner",
      status: !partnerComplete
        ? "blocked"
        : publicationComplete
          ? "complete"
          : "in_progress",
      detailAr: publicationComplete
        ? "جاهز للنشر أو منشور"
        : "بانتظار اكتمال الاعتمادات",
      completedAt: publicationComplete ? partnerApproval?.createdAt ?? null : null,
      completedBy: null,
    },
  ];

  const completeCount = stages.filter((s) => s.status === "complete").length;
  const overallProgressPct = Math.round((completeCount / stages.length) * 100);
  const current =
    stages.find((s) => s.status === "in_progress" || s.status === "pending") ??
    null;

  return {
    stages,
    overallProgressPct,
    currentStageKey: current?.key ?? null,
    blocked: stages.some((s) => s.status === "blocked" && s.key !== "fieldwork"),
    disclaimerAr:
      "سلسلة الاعتماد — لا تعوّض عن سجل الاعتماد الرسمي؛ الإنسان يقرر النشر النهائي.",
  };
}
