const SAFE_EVENT_DESCRIPTIONS: Record<string, string> = {
  "engagement.created": "تهيئة حالة عرض تجريبية لمسار AuditOS.",
  "team.assigned": "تخصيص أدوار عرض داخلية لهذا السيناريو التجريبي.",
  "trial_balance.uploaded": "إدراج ميزان مراجعة تجريبي ثابت ضمن العرض.",
  "mapping.ai_suggested": "توليد مقترحات تصنيف تجريبية بمساعدة الذكاء المؤسسي.",
  "mapping.confirmed": "اعتماد التصنيف داخل سيناريو العرض من قبل فريق العرض.",
  "validation.completed": "اكتمال التحقق على البيانات التجريبية الثابتة.",
  "evidence.uploaded": "ربط ملف دليل تجريبي ضمن سيناريو العرض.",
  "evidence.accepted": "اعتماد دليل تجريبي بعد مراجعة داخلية.",
  "signal.generated": "توليد إشارة ذكية تجريبية للمراجعة البشرية.",
  "finding.created": "إنشاء ملاحظة تجريبية داخل المسار المحكوم.",
  "finding.state_changed": "تحديث حالة ملاحظة تجريبية ضمن مسار العرض.",
  "recommendation.ai_suggested": "اقتراح توصية تجريبية بمساعدة الذكاء المؤسسي.",
  "recommendation.created": "مراجعة توصية تجريبية واعتمادها داخل العرض.",
  "recommendation.state_changed": "تحديث حالة توصية تجريبية ضمن مسار العرض.",
  "review.comment_added": "إضافة تعليق مراجعة تجريبي على مخرج مالي.",
  "engagement.state_changed": "نقل حالة سيناريو العرض بين مراحل العمل.",
};

const SAFE_TEXT_REPLACEMENTS = [
  ["Gulf Trading Co.", "the demo entity"],
  ["Saudi Logistics Co.", "another demo entity"],
  ["Red Sea Construction Co.", "a demo entity"],
  ["Ahmed Al Ghamdi", "the demo operator"],
  ["Sarah Al Otaibi", "the demo reviewer"],
  ["Farida Al Zamil", "the demo manager"],
  ["Khalid Al Saud", "the demo approver"],
  ["Faisal Al Harbi", "the demo stakeholder"],
  ["gulf_trading_tb_fy2025.xlsx", "demo_trial_balance.xlsx"],
  ["bank_confirmation_samba.pdf", "demo_supporting_document_1.pdf"],
  ["ar_aging_report.pdf", "demo_supporting_document_2.pdf"],
  ["ppe_schedule.xlsx", "demo_supporting_document_3.xlsx"],
  ["loan_agreement.pdf", "demo_supporting_document_4.pdf"],
  ["inventory_count_sheet.pdf", "demo_missing_supporting_document.pdf"],
  ["Statement of Profit or Loss", "قائمة الدخل التجريبية"],
  ["Statement of Financial Position", "قائمة المركز المالي التجريبية"],
  ["has not been uploaded", "is intentionally absent in this demo scenario"],
  ["Client must provide", "The demo entity should provide"],
  ["client must provide", "the demo entity should provide"],
  [
    "Send formal evidence request to Gulf Trading Co.",
    "Request the supporting evidence from the demo entity",
  ],
  ["customer-level", "counterparty-level"],
  ["per customer", "per revenue source"],
  ["Customer", "Counterparty"],
];

const SAFE_STATEMENT_TITLES: Record<string, string> = {
  income_statement: "قائمة الدخل التجريبية",
  balance_sheet: "قائمة المركز المالي التجريبية",
};

export function getSafeDemoActorLabel(actorName: string) {
  if (actorName === "AI Assistant") {
    return "المساعد الذكي";
  }

  if (actorName === "System") {
    return "النظام";
  }

  return "فريق العرض";
}

export function getSafeDemoEventDescription(
  eventType: string,
  fallback: string,
) {
  return SAFE_EVENT_DESCRIPTIONS[eventType] ?? sanitizeDemoNarrative(fallback);
}

export function getSafeDemoFileLabel(
  index: number,
  fileType?: string,
  state?: string,
) {
  if (state === "missing") {
    return `دليل تجريبي غير مكتمل ${index + 1}`;
  }

  if (fileType?.toLowerCase() === "xlsx") {
    return `ملف بيانات تجريبي ${index + 1}`;
  }

  return `مستند دليل تجريبي ${index + 1}`;
}

export function getSafeDemoEvidenceLinkLabel(index: number) {
  return `مرجع محاسبي تجريبي ${index + 1}`;
}

export function getSafeDemoStatementTitle(
  statementType: string,
  fallback: string,
) {
  return (
    SAFE_STATEMENT_TITLES[statementType] ?? sanitizeDemoNarrative(fallback)
  );
}

export function getSafeDemoModelLabel() {
  return "نموذج عرض تجريبي";
}

export function sanitizeDemoNarrative(text: string) {
  return SAFE_TEXT_REPLACEMENTS.reduce(
    (sanitized, [from, to]) => sanitized.replaceAll(from, to),
    text,
  );
}
