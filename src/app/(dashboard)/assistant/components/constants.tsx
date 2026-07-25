import type { ReactNode } from "react";
import {
  FileText, BarChart3, FileEdit, Presentation, ListTodo, MessageSquare,
} from "lucide-react";

export const TASK_TYPE_INFO: Record<string, { en: string; ar: string; icon: ReactNode }> = {
  document_summary: {
    en: "Summarize PDFs, Word docs, or reports into key points.",
    ar: "تلخيص ملفات PDF أو Word أو التقارير في نقاط رئيسية.",
    icon: <FileText className="h-5 w-5" />,
  },
  excel_analysis: {
    en: "Analyze Excel sheets for trends, totals, and insights.",
    ar: "تحليل جداول Excel للاتجاهات والمجاميع والرؤى.",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  report_draft: {
    en: "Draft structured reports from instructions and files.",
    ar: "صياغة تقارير منظمة من التعليمات والملفات.",
    icon: <FileEdit className="h-5 w-5" />,
  },
  presentation_outline: {
    en: "Generate slide-by-slide presentation outlines.",
    ar: "توليد هياكل عرض تقديمي شريحة بشريحة.",
    icon: <Presentation className="h-5 w-5" />,
  },
  executive_summary: {
    en: "Synthesize multiple inputs into an executive summary.",
    ar: "تجميع مدخلات متعددة في ملخص تنفيذي.",
    icon: <ListTodo className="h-5 w-5" />,
  },
  meeting_notes: {
    en: "Structure meeting notes into topics, decisions, and actions.",
    ar: "تنظيم ملاحظات الاجتماع إلى موضوعات وقرارات وإجراءات.",
    icon: <MessageSquare className="h-5 w-5" />,
  },
};

export const WORKFLOW_STEPS = [
  { ar: "اختر العميل والمشروع", en: "Choose client & project" },
  { ar: "أنشئ المهمة", en: "Create task" },
  { ar: "أرفق الملفات", en: "Attach files" },
  { ar: "ولّد المسودة", en: "Generate draft" },
  { ar: "راجع واعتمد", en: "Review & approve" },
];

export const STATUS_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  draft: { ar: "مسودة", en: "Draft", color: "bg-muted text-muted-foreground" },
  generated: {
    ar: "تم التوليد",
    en: "Generated",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  },
  needs_review: {
    ar: "بانتظار المراجعة",
    en: "Needs Review",
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  },
  reviewed: {
    ar: "تمت المراجعة",
    en: "Reviewed",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  },
  approved: {
    ar: "معتمد",
    en: "Approved",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  },
  rejected: {
    ar: "مرفوض",
    en: "Rejected",
    color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  },
  archived: {
    ar: "مؤرشف",
    en: "Archived",
    color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};
