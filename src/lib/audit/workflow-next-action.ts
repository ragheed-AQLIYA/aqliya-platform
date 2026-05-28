import type { WorkflowContext } from "@/lib/audit/workflow-gating";

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  not_ready: "غير جاهز",
  ready: "جاهز للاعتماد",
  pending_approval: "بانتظار الاعتماد",
  approved: "معتمد",
  blocked: "محظور",
};

export const ENGAGEMENT_STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  setup: "إعداد",
  in_progress: "قيد التنفيذ",
  under_review: "قيد المراجعة",
  awaiting_client: "بانتظار العميل",
  ready_for_approval: "جاهز للاعتماد",
  approved: "معتمد",
  published: "منشور",
  archived: "مؤرشف",
};

export interface NextWorkflowAction {
  label: string;
  href: string;
  reason?: string;
  urgent: boolean;
}

function stepHref(engagementId: string, step: string) {
  return `/audit/engagements/${engagementId}/${step}`;
}

export function getApprovalStatusLabel(status: string): string {
  return APPROVAL_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function getEngagementStatusLabel(status: string): string {
  return ENGAGEMENT_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export type OperatorStatusTone =
  | "neutral"
  | "warning"
  | "error"
  | "success"
  | "info";

export interface OperatorStatusDisplay {
  label: string;
  tone: OperatorStatusTone;
}

/** Operator-facing engagement status for lists and headers. */
export function getOperatorStatusDisplay(
  engagementStatus: string,
  blockingIssues: readonly string[] = [],
): OperatorStatusDisplay {
  if (blockingIssues.length > 0) {
    return { label: "معوق", tone: "error" };
  }
  if (engagementStatus === "ready_for_approval") {
    return { label: "جاهز للاعتماد", tone: "info" };
  }
  if (engagementStatus === "approved") {
    return { label: "معتمد", tone: "success" };
  }
  if (engagementStatus === "under_review") {
    return { label: "يحتاج مراجعة", tone: "warning" };
  }
  if (engagementStatus === "draft" || engagementStatus === "setup") {
    return { label: "مسودة", tone: "neutral" };
  }
  if (engagementStatus === "published") {
    return { label: "منشور", tone: "success" };
  }
  return {
    label: getEngagementStatusLabel(engagementStatus),
    tone: "neutral",
  };
}

const STEP_KEY_TO_INDEX: Record<string, number> = {
  "trial-balance": 1,
  mapping: 2,
  validation: 3,
  statements: 4,
  notes: 4,
  evidence: 5,
  findings: 6,
  recommendations: 7,
  review: 8,
  approval: 9,
  publication: 10,
  exports: 10,
  "audit-trail": 10,
};

/** Maps readiness context to WorkflowProgress step index (0–10). */
export function getWorkflowProgressStep(
  engagementId: string,
  ctx: WorkflowContext,
  blockingIssues: readonly string[],
): number {
  if (ctx.isPublished) {
    return 10;
  }

  const action = getNextWorkflowAction(engagementId, ctx, blockingIssues);
  const segment = action.href.split("/").pop() ?? "";
  const fromAction = STEP_KEY_TO_INDEX[segment];

  if (fromAction !== undefined) {
    return fromAction;
  }

  if (ctx.isApproved) {
    return 10;
  }

  return 0;
}

export function getNextWorkflowAction(
  engagementId: string,
  ctx: WorkflowContext,
  blockingIssues: readonly string[],
): NextWorkflowAction {
  if (ctx.isPublished) {
    return {
      label: "عرض سجل التدقيق",
      href: stepHref(engagementId, "audit-trail"),
      reason: "تم نشر التكليف — راجع سجل التدقيق للتتبع الكامل.",
      urgent: false,
    };
  }

  if (!ctx.hasTrialBalance) {
    return {
      label: "رفع ميزان المراجعة",
      href: stepHref(engagementId, "trial-balance"),
      reason: "ابدأ باستيراد أو رفع ميزان المراجعة.",
      urgent: false,
    };
  }

  if (!ctx.hasConfirmedMappings) {
    return {
      label: ctx.hasMappings ? "تأكيد تعيين الحسابات" : "تعيين الحسابات",
      href: stepHref(engagementId, "mapping"),
      reason: ctx.hasMappings
        ? "أكمل تأكيد جميع تعيينات الحسابات قبل توليد القوائم."
        : "عيّن الحسابات إلى التصنيفات المعيارية.",
      urgent: !ctx.hasMappings,
    };
  }

  if (!ctx.hasFinancialStatements) {
    return {
      label: "توليد القوائم المالية",
      href: stepHref(engagementId, "statements"),
      reason: "بعد التعيين، ولّد القوائم المالية.",
      urgent: false,
    };
  }

  if (!ctx.hasNotes) {
    return {
      label: "إعداد الإيضاحات",
      href: stepHref(engagementId, "notes"),
      reason: "أضف إيضاحات القوائم المالية قبل المراجعة النهائية.",
      urgent: false,
    };
  }

  if (!ctx.hasEvidence) {
    return {
      label: "رفع الأدلة",
      href: stepHref(engagementId, "evidence"),
      reason: "ارفع الأدلة الداعمة قبل تسجيل النتائج.",
      urgent: false,
    };
  }

  if (!ctx.hasFindings) {
    return {
      label: "تسجيل النتائج",
      href: stepHref(engagementId, "findings"),
      reason: "سجّل نتائج المراجعة المرتبطة بالأدلة.",
      urgent: false,
    };
  }

  if (!ctx.hasRecommendations) {
    return {
      label: "إعداد التوصيات",
      href: stepHref(engagementId, "recommendations"),
      reason: "أضف توصيات مرتبطة بالنتائج قبل المراجعة.",
      urgent: false,
    };
  }

  if (!ctx.hasReviewActivity) {
    return {
      label: "بدء المراجعة",
      href: stepHref(engagementId, "review"),
      reason: "أضف تعليقات مراجعة بشرية قبل طلب الاعتماد.",
      urgent: false,
    };
  }

  if (blockingIssues.length > 0) {
    return {
      label: "معالجة معوقات الاعتماد",
      href: stepHref(engagementId, "approval"),
      reason: blockingIssues[0],
      urgent: true,
    };
  }

  if (!ctx.isApproved) {
    return {
      label: "إكمال الاعتماد",
      href: stepHref(engagementId, "approval"),
      reason: "المراجعة البشرية مطلوبة — أكمل خطوة الاعتماد.",
      urgent: false,
    };
  }

  if (!ctx.isPublished) {
    return {
      label: "نشر التكليف",
      href: stepHref(engagementId, "publication"),
      reason: "تم الاعتماد — يمكنك نشر المخرجات.",
      urgent: false,
    };
  }

  return {
    label: "تصدير المخرجات",
    href: stepHref(engagementId, "exports"),
    reason: "صدّر التقرير بصيغ PDF أو XLSX.",
    urgent: false,
  };
}
