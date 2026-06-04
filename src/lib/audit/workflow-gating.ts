export interface WorkflowContext {
  engagementStatus: string;
  hasTrialBalance: boolean;
  hasMappings: boolean;
  hasConfirmedMappings: boolean;
  hasFinancialStatements: boolean;
  hasNotes: boolean;
  hasEvidence: boolean;
  hasFindings: boolean;
  hasRecommendations: boolean;
  hasReviewActivity: boolean;
  isApproved: boolean;
  isPublished: boolean;
  governanceFinalizationAllowed: boolean;
}

export interface TabGateResult {
  locked: boolean;
  reason?: string;
}

type TabGate = (ctx: WorkflowContext) => TabGateResult;

const tabGates: Record<string, TabGate> = {
  overview: () => ({ locked: false }),

  "trial-balance": () => ({ locked: false }),

  sampling: (ctx) => {
    if (!ctx.hasTrialBalance) {
      return {
        locked: true,
        reason: "ارفع ميزان المراجعة قبل توليد العينة.",
      };
    }
    return { locked: false };
  },

  mapping: (ctx) => {
    if (!ctx.hasTrialBalance) {
      return {
        locked: true,
        reason: "ارفع ميزان المراجعة قبل تعيين الحسابات.",
      };
    }
    return { locked: false };
  },

  validation: (ctx) => {
    if (!ctx.hasTrialBalance) {
      return { locked: true, reason: "ارفع ميزان المراجعة قبل تشغيل التحقق." };
    }
    return { locked: false };
  },

  statements: (ctx) => {
    if (!ctx.hasTrialBalance) {
      return {
        locked: true,
        reason: "ارفع ميزان المراجعة قبل توليد القوائم المالية.",
      };
    }
    if (!ctx.hasMappings) {
      return {
        locked: true,
        reason: "أكمل تعيين الحسابات قبل توليد القوائم المالية.",
      };
    }
    return { locked: false };
  },

  notes: (ctx) => {
    if (!ctx.hasFinancialStatements) {
      return {
        locked: true,
        reason: "ولّد القوائم المالية قبل إعداد الإيضاحات.",
      };
    }
    return { locked: false };
  },

  evidence: () => ({ locked: false }),

  findings: (ctx) => {
    if (!ctx.hasEvidence) {
      return { locked: true, reason: "أضف أدلة قبل تسجيل النتائج." };
    }
    return { locked: false };
  },

  recommendations: (ctx) => {
    if (!ctx.hasFindings) {
      return { locked: true, reason: "سجّل النتائج قبل إعداد التوصيات." };
    }
    return { locked: false };
  },

  review: (ctx) => {
    if (!ctx.hasFindings && !ctx.hasRecommendations && !ctx.hasReviewActivity) {
      return { locked: true, reason: "أضف نتائج أو توصيات قبل بدء المراجعة." };
    }
    return { locked: false };
  },

  approval: (ctx) => {
    if (!ctx.hasReviewActivity) {
      return {
        locked: true,
        reason: "أكمل المراجعة البشرية قبل طلب الاعتماد.",
      };
    }
    if (ctx.isPublished) {
      return { locked: true, reason: "تم نشر هذا التكليف مسبقاً." };
    }
    if (ctx.isApproved) {
      return { locked: true, reason: "تم اعتماد هذا التكليف مسبقاً." };
    }
    return { locked: false };
  },

  publication: (ctx) => {
    if (ctx.isPublished) {
      return { locked: true, reason: "تم نشر هذا التكليف مسبقاً." };
    }
    if (!ctx.isApproved && !ctx.governanceFinalizationAllowed) {
      return {
        locked: true,
        reason: "الاعتماد مطلوب قبل النشر — أكمل خطوة الاعتماد أولاً.",
      };
    }
    return { locked: false };
  },

  exports: (ctx) => {
    if (!ctx.hasFinancialStatements) {
      return { locked: true, reason: "ولّد القوائم المالية قبل التصدير." };
    }
    return { locked: false };
  },

  "audit-trail": () => ({ locked: false }),

  pilot: () => ({ locked: false }),
};

export function evaluateTabGate(
  tabKey: string,
  ctx: WorkflowContext,
): TabGateResult {
  const gate = tabGates[tabKey];
  if (!gate) return { locked: false };
  return gate(ctx);
}

export function evaluateAllTabGates(
  ctx: WorkflowContext,
): Record<string, TabGateResult> {
  const results: Record<string, TabGateResult> = {};
  for (const tabKey of Object.keys(tabGates)) {
    results[tabKey] = evaluateTabGate(tabKey, ctx);
  }
  return results;
}

export function isTabAccessible(tabKey: string, ctx: WorkflowContext): boolean {
  return !evaluateTabGate(tabKey, ctx).locked;
}
