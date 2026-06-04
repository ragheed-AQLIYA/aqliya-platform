import "server-only";
import type { NotificationTemplate } from "./types";

type TemplateVariables = Record<string, string | number | undefined>;

function fill(template: string, vars: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val != null ? String(val) : `{{${key}}}`;
  });
}

function render(
  arSubject: string,
  arBody: string,
  enSubject: string,
  enBody: string,
  vars: TemplateVariables,
): NotificationTemplate {
  return {
    arSubject: fill(arSubject, vars),
    arBody: fill(arBody, vars),
    enSubject: fill(enSubject, vars),
    enBody: fill(enBody, vars),
    actionUrl: vars.actionUrl ? String(vars.actionUrl) : undefined,
  };
}

import type { ProductTemplateKey } from "./types";
export type { ProductTemplateKey };

const TEMPLATES: Record<ProductTemplateKey, { arSubject: string; arBody: string; enSubject: string; enBody: string }> = {
  audit_review_assigned: {
    arSubject: "تم تعيينك لمراجعة مهمة تدقيق: {{title}}",
    arBody: "السلام عليكم،\n\nتم تعيينك لمراجعة مهمة تدقيق \"{{title}}\" للعميل \"{{clientName}}\". يرجى الدخول إلى المنصة لبدء المراجعة.\n\nتاريخ التعيين: {{assignedAt}}",
    enSubject: "Audit Review Assigned: {{title}}",
    enBody: "You have been assigned to review the audit engagement \"{{title}}\" for client \"{{clientName}}\". Please log in to the platform to start the review.\n\nAssigned: {{assignedAt}}",
  },
  audit_approval_needed: {
    arSubject: "طلب اعتماد تقرير تدقيق: {{title}}",
    arBody: "السلام عليكم،\n\nتقرير التدقيق \"{{title}}\" للعميل \"{{clientName}}\" جاهز للاعتماد. يرجى مراجعة التقرير واتخاذ القرار.\n\nتاريخ الطلب: {{requestedAt}}",
    enSubject: "Audit Approval Needed: {{title}}",
    enBody: "The audit report \"{{title}}\" for client \"{{clientName}}\" is ready for approval. Please review the report and make your decision.\n\nRequested: {{requestedAt}}",
  },
  audit_finding_updated: {
    arSubject: "تحديث على نتيجة تدقيق: {{title}}",
    arBody: "السلام عليكم،\n\nتم تحديث نتيجة التدقيق \"{{title}}\" في مهمة \"{{engagementTitle}}\". الحالة الجديدة: {{newStatus}}.\n\nيرجى الاطلاع على التحديثات.",
    enSubject: "Audit Finding Updated: {{title}}",
    enBody: "The audit finding \"{{title}}\" in engagement \"{{engagementTitle}}\" has been updated. New status: {{newStatus}}.\n\nPlease review the updates.",
  },
  decision_for_review: {
    arSubject: "قرار بانتظار المراجعة: {{title}}",
    arBody: "السلام عليكم،\n\nالقرار \"{{title}}\" من النوع \"{{decisionType}}\" جاهز للمراجعة. يرجى الدخول إلى المنصة لمراجعة التفاصيل واتخاذ القرار المناسب.\n\nتاريخ الطلب: {{requestedAt}}",
    enSubject: "Decision Pending Review: {{title}}",
    enBody: "The decision \"{{title}}\" ({{decisionType}}) is ready for review. Please log in to review the details and make your decision.\n\nRequested: {{requestedAt}}",
  },
  decision_approved: {
    arSubject: "تم اعتماد القرار: {{title}}",
    arBody: "السلام عليكم،\n\nتم اعتماد القرار \"{{title}}\" من قبل {{approvedBy}}. يمكنك الآن متابعة تنفيذ الإجراءات اللازمة.\n\nتاريخ الاعتماد: {{approvedAt}}",
    enSubject: "Decision Approved: {{title}}",
    enBody: "The decision \"{{title}}\" has been approved by {{approvedBy}}. You may now proceed with the necessary actions.\n\nApproved: {{approvedAt}}",
  },
  decision_rejected: {
    arSubject: "تم رفض القرار: {{title}}",
    arBody: "السلام عليكم،\n\nتم رفض القرار \"{{title}}\". السبب: {{reason}}.\n\nيرجى مراجعة الملاحظات وإعادة التقديم بعد التعديل.",
    enSubject: "Decision Rejected: {{title}}",
    enBody: "The decision \"{{title}}\" has been rejected. Reason: {{reason}}.\n\nPlease review the feedback and resubmit after making necessary changes.",
  },
  localcontent_review_routing: {
    arSubject: "إحالة للمراجعة: {{projectName}}",
    arBody: "السلام عليكم،\n\nتم إحالة مشروع المحتوى المحلي \"{{projectName}}\" إليك للمراجعة. نسبة المحتوى المحلي المقدرة: {{score}}%.\n\nيرجى مراجعة البيانات والملفات المرفقة.",
    enSubject: "Review Routing: {{projectName}}",
    enBody: "The local content project \"{{projectName}}\" has been routed to you for review. Estimated local content score: {{score}}%.\n\nPlease review the data and attached files.",
  },
  localcontent_batch_import_complete: {
    arSubject: "اكتمل استيراد الدفعة: {{batchName}}",
    arBody: "السلام عليكم،\n\nاكتمل استيراد الدفعة \"{{batchName}}\" بنجاح. تم استيراد {{recordCount}} سجل.\n\nيمكنك الآن مراجعة البيانات وتصنيفها.",
    enSubject: "Batch Import Complete: {{batchName}}",
    enBody: "The batch import \"{{batchName}}\" has completed successfully. {{recordCount}} records were imported.\n\nYou may now review and classify the data.",
  },
  localcontent_erp_sync_error: {
    arSubject: "خطأ في مزامنة ERP: {{systemName}}",
    arBody: "السلام عليكم،\n\nحدث خطأ أثناء مزامنة البيانات من نظام ERP \"{{systemName}}\". الخطأ: {{errorMessage}}.\n\nيرجى التحقق من الاتصال وإعادة المحاولة.",
    enSubject: "ERP Sync Error: {{systemName}}",
    enBody: "An error occurred while syncing data from ERP system \"{{systemName}}\". Error: {{errorMessage}}.\n\nPlease check the connection and try again.",
  },
  sales_deal_stage_change: {
    arSubject: "تغير مرحلة الصفقة: {{dealName}}",
    arBody: "السلام عليكم،\n\nتم تغيير مرحلة الصفقة \"{{dealName}}\" مع العميل \"{{accountName}}\" من {{oldStage}} إلى {{newStage}}.\n\nقيمة الصفقة: {{dealValue}}",
    enSubject: "Deal Stage Changed: {{dealName}}",
    enBody: "The deal \"{{dealName}}\" for account \"{{accountName}}\" has moved from {{oldStage}} to {{newStage}}.\n\nDeal value: {{dealValue}}",
  },
  sales_crm_sync_error: {
    arSubject: "خطأ في مزامنة CRM: {{systemName}}",
    arBody: "السلام عليكم،\n\nحدث خطأ أثناء مزامنة البيانات من نظام CRM \"{{systemName}}\". الخطأ: {{errorMessage}}.\n\nيرجى التحقق من الاتصال وإعادة المحاولة.",
    enSubject: "CRM Sync Error: {{systemName}}",
    enBody: "An error occurred while syncing data from CRM system \"{{systemName}}\". Error: {{errorMessage}}.\n\nPlease check the connection and try again.",
  },
  workflowos_export_approved: {
    arSubject: "تم اعتماد طلب التصدير",
    arBody: "السلام عليكم،\n\nتم اعتماد طلب تصدير السجل \"{{recordTitle}}\" بواسطة {{approvedBy}}. يمكنك الآن تنزيل التصدير.\n\nتاريخ الاعتماد: {{approvedAt}}",
    enSubject: "Export Request Approved",
    enBody: "The export request for record \"{{recordTitle}}\" has been approved by {{approvedBy}}. You may now download the export.\n\nApproved: {{approvedAt}}",
  },
  workflowos_export_rejected: {
    arSubject: "تم رفض طلب التصدير",
    arBody: "السلام عليكم،\n\nتم رفض طلب تصدير السجل \"{{recordTitle}}\". السبب: {{reason}}.\n\nيرجى مراجعة الملاحظات وإعادة تقديم الطلب.",
    enSubject: "Export Request Rejected",
    enBody: "The export request for record \"{{recordTitle}}\" has been rejected. Reason: {{reason}}.\n\nPlease review the feedback and resubmit.",
  },
  workflowos_escalation_alert: {
    arSubject: "تنبيه تصعيد: طلب تصدير معلق",
    arBody: "السلام عليكم،\n\nطلب تصدير السجل \"{{recordTitle}}\" معلق منذ {{daysPending}} يوم. يرجى اتخاذ إجراء.\n\nتاريخ التصعيد: {{escalatedAt}}",
    enSubject: "Escalation Alert: Pending Export Request",
    enBody: "The export request for record \"{{recordTitle}}\" has been pending for {{daysPending}} days. Please take action.\n\nEscalated: {{escalatedAt}}",
  },
};

export function getTemplate(
  key: ProductTemplateKey,
  vars?: TemplateVariables,
): NotificationTemplate {
  const tpl = TEMPLATES[key];
  if (!tpl) {
    throw new Error(`Unknown template key: ${key}`);
  }
  if (vars) {
    return render(tpl.arSubject, tpl.arBody, tpl.enSubject, tpl.enBody, vars);
  }
  return {
    arSubject: tpl.arSubject,
    arBody: tpl.arBody,
    enSubject: tpl.enSubject,
    enBody: tpl.enBody,
  };
}

export function getRegisteredTemplateKeys(): ProductTemplateKey[] {
  return Object.keys(TEMPLATES) as ProductTemplateKey[];
}
