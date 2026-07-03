/**
 * Generates all missing error.tsx, loading.tsx, not-found.tsx files
 * for every product route segment using shared product-boundary components.
 * 
 * Run: node scripts/ops/generate-boundaries.mjs
 */

import { existsSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { join, relative, sep } from "path";

const APP_DIR = join(process.cwd(), "src", "app");

// Product route configurations
const PRODUCTS = [
  // ── ContentStudio ──
  { path: "content-studio", icon: "FileText", arTitle: "استوديو المحتوى", enTitle: "ContentStudio" },
  { path: "content-studio/[workspaceId]", icon: "FileText", arTitle: "مساحة المحتوى", enTitle: "Content Workspace" },
  { path: "content-studio/[workspaceId]/[contentId]", icon: "FileText", arTitle: "المحتوى", enTitle: "Content" },
  { path: "content-studio/[workspaceId]/create", icon: "FilePlus", arTitle: "إنشاء المحتوى", enTitle: "Create Content" },
  { path: "content-studio/templates", icon: "FileText", arTitle: "القوالب", enTitle: "Templates" },

  // ── RiskOS ──
  { path: "risk", icon: "AlertTriangle", arTitle: "مخاطر المنشأة", enTitle: "RiskOS" },
  { path: "risk/[id]", icon: "AlertTriangle", arTitle: "المخاطرة", enTitle: "Risk Detail" },
  { path: "risk/assessments", icon: "AlertTriangle", arTitle: "التقييمات", enTitle: "Risk Assessments" },
  { path: "risk/assessments/[id]", icon: "AlertTriangle", arTitle: "التقييم", enTitle: "Assessment Detail" },

  // ── Contacts (LocalContactOS) ──
  { path: "contacts", icon: "Users", arTitle: "جهات الاتصال", enTitle: "Contacts" },
  { path: "contacts/dashboard", icon: "LayoutDashboard", arTitle: "لوحة جهات الاتصال", enTitle: "Contact Dashboard", skipNf: true },
  { path: "contacts/new", icon: "UserPlus", arTitle: "جهة اتصال جديدة", enTitle: "New Contact", skipNf: true },
  { path: "contacts/[id]", icon: "User", arTitle: "جهة الاتصال", enTitle: "Contact" },
  { path: "contacts/[id]/edit", icon: "Edit", arTitle: "تعديل جهة الاتصال", enTitle: "Edit Contact" },
  { path: "contacts/[id]/interactions", icon: "MessageCircle", arTitle: "التفاعلات", enTitle: "Interactions" },
  { path: "contacts/[id]/interactions/new", icon: "MessageCircle", arTitle: "تفاعل جديد", enTitle: "New Interaction" },
  { path: "contacts/[id]/relations", icon: "Share2", arTitle: "العلاقات", enTitle: "Relations" },
  { path: "contacts/[id]/relations/new", icon: "Share2", arTitle: "علاقة جديدة", enTitle: "New Relation" },

  // ── LocalContentOS ──
  { path: "local-content/ai-advisor", icon: "Bot", arTitle: "المستشار الذكي", enTitle: "AI Advisor" },
  { path: "local-content/analytics", icon: "BarChart3", arTitle: "التحليلات", enTitle: "Analytics" },
  { path: "local-content/campaigns", icon: "Megaphone", arTitle: "الحملات", enTitle: "Campaigns" },
  { path: "local-content/campaigns/[id]", icon: "Megaphone", arTitle: "الحملة", enTitle: "Campaign" },
  { path: "local-content/classification-rules", icon: "FileCheck", arTitle: "قواعد التصنيف", enTitle: "Classification Rules" },
  { path: "local-content/health", icon: "HeartPulse", arTitle: "صحة المنشأة", enTitle: "Health" },
  { path: "local-content/outputs", icon: "FileOutput", arTitle: "المخرجات", enTitle: "Outputs" },
  { path: "local-content/pilot-readiness", icon: "Rocket", arTitle: "جاهزية التجربة", enTitle: "Pilot Readiness" },
  { path: "local-content/projects", icon: "FolderKanban", arTitle: "المشاريع", enTitle: "Projects" },
  { path: "local-content/projects/[projectId]", icon: "FolderKanban", arTitle: "المشروع", enTitle: "Project" },
  { path: "local-content/projects/[projectId]/approval", icon: "CheckCircle", arTitle: "الاعتماد", enTitle: "Approval" },
  { path: "local-content/projects/[projectId]/audit-trail", icon: "ScrollText", arTitle: "سجل التدقيق", enTitle: "Audit Trail" },
  { path: "local-content/projects/[projectId]/classification", icon: "FileCheck", arTitle: "التصنيف", enTitle: "Classification" },
  { path: "local-content/projects/[projectId]/evidence", icon: "FolderOpen", arTitle: "الأدلة", enTitle: "Evidence" },
  { path: "local-content/projects/[projectId]/findings", icon: "Search", arTitle: "النتائج", enTitle: "Findings" },
  { path: "local-content/projects/[projectId]/reports", icon: "FileBarChart", arTitle: "التقارير", enTitle: "Reports" },
  { path: "local-content/projects/[projectId]/review", icon: "Eye", arTitle: "المراجعة", enTitle: "Review" },
  { path: "local-content/projects/[projectId]/spend", icon: "DollarSign", arTitle: "الإنفاق", enTitle: "Spend" },
  { path: "local-content/projects/[projectId]/suppliers", icon: "Truck", arTitle: "الموردين", enTitle: "Suppliers" },
  { path: "local-content/projects/[projectId]/tender-match", icon: "GitCompare", arTitle: "مطابقة المناقصات", enTitle: "Tender Match" },
  { path: "local-content/projects/[projectId]/verification", icon: "ShieldCheck", arTitle: "التحقق", enTitle: "Verification" },
  { path: "local-content/projects/[projectId]/workbook/[workbookId]/ai-advisor", icon: "Bot", arTitle: "المستشار الذكي", enTitle: "AI Advisor" },
  { path: "local-content/quality-dashboard", icon: "Gauge", arTitle: "لوحة الجودة", enTitle: "Quality Dashboard" },
  { path: "local-content/review", icon: "Eye", arTitle: "المراجعة", enTitle: "Review" },
  { path: "local-content/review-center", icon: "ListChecks", arTitle: "مركز المراجعة", enTitle: "Review Center" },
  { path: "local-content/settings/integrations", icon: "Cable", arTitle: "التكاملات", enTitle: "Integrations" },
  { path: "local-content/workbook", icon: "BookOpen", arTitle: "دفتر العمل", enTitle: "Workbook" },
  { path: "local-content/workbook/[workbookId]", icon: "BookOpen", arTitle: "دفتر العمل", enTitle: "Workbook" },

  // ── SalesOS ──
  { path: "sales", icon: "TrendingUp", arTitle: "نظام المبيعات", enTitle: "SalesOS" },
  { path: "sales/accounts", icon: "Building2", arTitle: "الحسابات", enTitle: "Accounts" },
  { path: "sales/accounts/[id]", icon: "Building2", arTitle: "الحساب", enTitle: "Account" },
  { path: "sales/accounts/[id]/brief", icon: "FileText", arTitle: "موجز الحساب", enTitle: "Account Brief" },
  { path: "sales/accounts/new", icon: "UserPlus", arTitle: "حساب جديد", enTitle: "New Account" },
  { path: "sales/activities", icon: "Activity", arTitle: "النشاطات", enTitle: "Activities" },
  { path: "sales/approval", icon: "CheckCircle", arTitle: "الاعتماد", enTitle: "Approval" },
  { path: "sales/audit-trail", icon: "ScrollText", arTitle: "سجل التدقيق", enTitle: "Audit Trail" },
  { path: "sales/command-center", icon: "Monitor", arTitle: "مركز القيادة", enTitle: "Command Center" },
  { path: "sales/deals", icon: "TrendingUp", arTitle: "الصفقات", enTitle: "Deals" },
  { path: "sales/deals/[id]", icon: "TrendingUp", arTitle: "الصفقة", enTitle: "Deal" },
  { path: "sales/deals/[id]/pilot", icon: "Rocket", arTitle: "التجربة", enTitle: "Pilot" },
  { path: "sales/deals/new", icon: "PlusCircle", arTitle: "صفقة جديدة", enTitle: "New Deal" },
  { path: "sales/forecast", icon: "ChartLine", arTitle: "التوقعات", enTitle: "Forecast" },
  { path: "sales/funnel", icon: "Funnel", arTitle: "مسار التحويل", enTitle: "Funnel" },
  { path: "sales/icp", icon: "Target", arTitle: "العميل المثالي", enTitle: "ICP" },
  { path: "sales/intelligence", icon: "Brain", arTitle: "الذكاء", enTitle: "Intelligence" },
  { path: "sales/intelligence/forecasts", icon: "ChartLine", arTitle: "توقعات الذكاء", enTitle: "Intelligence Forecasts" },
  { path: "sales/opportunities", icon: "Target", arTitle: "الفرص", enTitle: "Opportunities" },
  { path: "sales/opportunities/[id]", icon: "Target", arTitle: "الفرصة", enTitle: "Opportunity" },
  { path: "sales/opportunities/new", icon: "PlusCircle", arTitle: "فرصة جديدة", enTitle: "New Opportunity", skipNf: true },
  { path: "sales/outreach", icon: "Send", arTitle: "التواصل", enTitle: "Outreach" },
  { path: "sales/pilot-handoff/[dealId]", icon: "Rocket", arTitle: "تسليم التجربة", enTitle: "Pilot Handoff" },
  { path: "sales/pipeline", icon: "GitBranch", arTitle: "خط الأنابيب", enTitle: "Pipeline" },
  { path: "sales/pipeline-depth", icon: "BarChart3", arTitle: "عمق الأنابيب", enTitle: "Pipeline Depth" },
  { path: "sales/reports", icon: "FileBarChart", arTitle: "التقارير", enTitle: "Reports" },
  { path: "sales/revenue", icon: "DollarSign", arTitle: "الإيرادات", enTitle: "Revenue" },
  { path: "sales/review", icon: "Eye", arTitle: "المراجعة", enTitle: "Review" },
  { path: "sales/settings/crm", icon: "Settings", arTitle: "إعدادات CRM", enTitle: "CRM Settings" },
  { path: "sales/signals", icon: "Bell", arTitle: "الإشارات", enTitle: "Signals" },

  // ── Sampling ──
  { path: "sampling", icon: "Beaker", arTitle: "أخذ العينات", enTitle: "Sampling" },
  { path: "sampling/[id]", icon: "Beaker", arTitle: "العينة", enTitle: "Sample" },

  // ── Institutional Memory ──
  { path: "institutional-memory/collections", icon: "FolderOpen", arTitle: "المجموعات", enTitle: "Collections" },
  { path: "institutional-memory/events", icon: "History", arTitle: "الأحداث", enTitle: "Events" },
  { path: "institutional-memory/graph", icon: "Share2", arTitle: "الرسم البياني", enTitle: "Graph" },

  // ── Office AI Assistant ──
  { path: "office-ai/advanced", icon: "Bot", arTitle: "المساعد الذكي", enTitle: "Office AI" },
  { path: "office-ai/advanced/role-config", icon: "Shield", arTitle: "تكوين الأدوار", enTitle: "Role Config" },
  { path: "office-ai/advanced/schedules", icon: "Calendar", arTitle: "الجدولة", enTitle: "Schedules" },
  { path: "office-ai/advanced/templates", icon: "FileText", arTitle: "قوالب المساعد", enTitle: "Assistant Templates" },
  { path: "assistant/stats", icon: "BarChart3", arTitle: "إحصائيات المساعد", enTitle: "Assistant Stats" },

  // ── Platform / Settings ──
  { path: "settings/ai-governance", icon: "Shield", arTitle: "حوكمة الذكاء الاصطناعي", enTitle: "AI Governance" },
  { path: "settings/retention", icon: "Archive", arTitle: "سياسة الاحتفاظ", enTitle: "Retention Policy" },
  { path: "settings/audit-bridge/logs", icon: "ScrollText", arTitle: "سجل جسر التدقيق", enTitle: "Audit Bridge Logs" },
  { path: "settings/organization/advanced/events", icon: "Activity", arTitle: "أحداث المنشأة", enTitle: "Organization Events" },
  { path: "settings/audit-bridge", icon: "ScrollText", arTitle: "جسر التدقيق", enTitle: "Audit Bridge" },
  { path: "settings/audit-bridge/log", icon: "ScrollText", arTitle: "سجل جسر التدقيق", enTitle: "Audit Bridge Log" },

  // ── Knowledge Foundation ──
  { path: "(dashboard)/knowledge-foundation", icon: "Brain", arTitle: "أساس المعرفة", enTitle: "Knowledge Foundation" },
  { path: "(dashboard)/knowledge-foundation/[id]", icon: "Brain", arTitle: "أساس المعرفة", enTitle: "Knowledge Foundation" },
  { path: "(dashboard)/knowledge-foundation/diff", icon: "GitCompare", arTitle: "المقارنة", enTitle: "Differences" },
  { path: "(dashboard)/knowledge-foundation/history", icon: "History", arTitle: "السجل", enTitle: "History" },
  { path: "(dashboard)/knowledge-foundation/new", icon: "PlusCircle", arTitle: "أساس معرفة جديد", enTitle: "New Knowledge Foundation" },
  { path: "(dashboard)/knowledge-review", icon: "CheckSquare", arTitle: "مراجعة المعرفة", enTitle: "Knowledge Review" },
  { path: "(dashboard)/knowledge-review/[id]", icon: "CheckSquare", arTitle: "مراجعة المعرفة", enTitle: "Knowledge Review" },

  // ── Dashboard sub-routes ──
  { path: "(dashboard)/intelligence", icon: "Brain", arTitle: "الذكاء المؤسسي", enTitle: "Intelligence" },
  { path: "(dashboard)/intelligence/sectors", icon: "Globe", arTitle: "القطاعات", enTitle: "Sectors" },
  { path: "(dashboard)/intelligence/sectors/[id]", icon: "Globe", arTitle: "القطاع", enTitle: "Sector" },
  { path: "(dashboard)/monitoring", icon: "Activity", arTitle: "المراقبة", enTitle: "Monitoring" },
  { path: "(dashboard)/monitoring/ai", icon: "Brain", arTitle: "مراقبة الذكاء الاصطناعي", enTitle: "AI Monitoring" },
  { path: "(dashboard)/governance-hub", icon: "Shield", arTitle: "مركز الحوكمة", enTitle: "Governance Hub" },
  { path: "(dashboard)/operator", icon: "Terminal", arTitle: "المشغل", enTitle: "Operator" },
  { path: "(dashboard)/overview", icon: "LayoutDashboard", arTitle: "نظرة عامة", enTitle: "Dashboard" },

  // ── DecisionOS tab routes ──
  { path: "(dashboard)/decisions/[id]/alerts", icon: "Bell", arTitle: "التنبيهات", enTitle: "Alerts" },
  { path: "(dashboard)/decisions/[id]/framework", icon: "Layout", arTitle: "الإطار", enTitle: "Framework" },
  { path: "(dashboard)/decisions/[id]/governance", icon: "Shield", arTitle: "الحوكمة", enTitle: "Governance" },
  { path: "(dashboard)/decisions/[id]/insight", icon: "Lightbulb", arTitle: "الرؤية", enTitle: "Insight" },
  { path: "(dashboard)/decisions/[id]/intake", icon: "Inbox", arTitle: "الاستقبال", enTitle: "Intake" },
  { path: "(dashboard)/decisions/[id]/outcome", icon: "Target", arTitle: "النتائج", enTitle: "Outcome" },
  { path: "(dashboard)/decisions/[id]/overview", icon: "LayoutDashboard", arTitle: "نظرة عامة", enTitle: "Overview" },
  { path: "(dashboard)/decisions/[id]/recommendation", icon: "FileText", arTitle: "التوصية", enTitle: "Recommendation" },
  { path: "(dashboard)/decisions/[id]/report", icon: "FileBarChart", arTitle: "التقرير", enTitle: "Report" },
  { path: "(dashboard)/decisions/[id]/risks", icon: "AlertTriangle", arTitle: "المخاطر", enTitle: "Risks" },
  { path: "(dashboard)/decisions/[id]/scenarios", icon: "GitBranch", arTitle: "السيناريوهات", enTitle: "Scenarios" },
  { path: "(dashboard)/decisions/[id]/sector", icon: "Globe", arTitle: "القطاع", enTitle: "Sector" },
  { path: "(dashboard)/decisions/[id]/signals", icon: "Bell", arTitle: "الإشارات", enTitle: "Signals" },
  { path: "(dashboard)/decisions/[id]/simulation", icon: "Beaker", arTitle: "المحاكاة", enTitle: "Simulation" },
  { path: "(dashboard)/decisions/[id]/tender", icon: "FileText", arTitle: "المناقصة", enTitle: "Tender" },
  { path: "(dashboard)/decisions/[id]/what-to-do", icon: "HelpCircle", arTitle: "ماذا تفعل", enTitle: "What To Do" },
  { path: "(dashboard)/decisions/gov/escalation-rules", icon: "ArrowUpCircle", arTitle: "قواعد التصعيد", enTitle: "Escalation Rules" },
  { path: "(dashboard)/decisions/new", icon: "PlusCircle", arTitle: "قرار جديد", enTitle: "New Decision", skipNf: true },
  { path: "(dashboard)/decisions/pilot-readiness", icon: "Rocket", arTitle: "جاهزية التجربة", enTitle: "Pilot Readiness" },

  // ── Settings (dashboard) ──
  { path: "(dashboard)/settings/ai", icon: "Brain", arTitle: "إعدادات الذكاء الاصطناعي", enTitle: "AI Settings" },
  { path: "(dashboard)/settings/audit-logs", icon: "ScrollText", arTitle: "سجلات التدقيق", enTitle: "Audit Logs" },
  { path: "(dashboard)/settings/chain-verification", icon: "Shield", arTitle: "التحقق المتسلسل", enTitle: "Chain Verification" },
  { path: "(dashboard)/settings/mfa", icon: "Shield", arTitle: "التحقق متعدد العوامل", enTitle: "Multi-Factor Auth" },
  { path: "(dashboard)/settings/platform-organization", icon: "Building2", arTitle: "المنشأة", enTitle: "Organization" },
  { path: "(dashboard)/settings/siem", icon: "Monitor", arTitle: "SIEM", enTitle: "SIEM Settings" },
  { path: "(dashboard)/settings/skills/evaluate", icon: "Brain", arTitle: "تقييم المهارات", enTitle: "Skills Evaluation" },
  { path: "(dashboard)/settings/sso", icon: "Shield", arTitle: "الدخول الموحد", enTitle: "SSO Settings" },
  { path: "(dashboard)/settings/team", icon: "Users", arTitle: "الفريق", enTitle: "Team Settings" },
  { path: "(dashboard)/settings/workspaces", icon: "Layout", arTitle: "مساحات العمل", enTitle: "Workspaces" },
];

// ============================================================
// TEMPLATES
// ============================================================

function errorTemplate({ icon, arTitle, enTitle }) {
  return `"use client";

import { ${icon}, RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function ${enTitle.replace(/[^a-zA-Z]/g, "")}Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("${enTitle} error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <${icon} className="h-10 w-10 text-destructive" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">
          تعذر تحميل ${arTitle}
        </h2>
        <p className="text-sm text-muted-foreground">
          حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
        </p>
        <p className="text-xs text-muted-foreground/60">
          ${enTitle} encountered an error. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/40">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        إعادة المحاولة
      </button>
    </div>
  );
}
`;
}

function loadingTemplate({ icon, arTitle, enTitle }) {
  return `import { ${icon} } from "lucide-react";

export default function ${enTitle.replace(/[^a-zA-Z]/g, "")}Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <${icon} className="h-12 w-12 text-primary/40 animate-pulse" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-muted-foreground">
          جارٍ تحميل ${arTitle}...
        </p>
        <p className="text-sm text-muted-foreground/60">
          ${enTitle} is loading...
        </p>
      </div>
    </div>
  );
}
`;
}

function notFoundTemplate({ icon, arTitle, enTitle }) {
  const isDynamic = enTitle.includes("Detail") || enTitle.includes("Item");
  const returnHref = isDynamic ? "../.." : "..";
  return `import Link from "next/link";
import { ArrowLeft, ${icon} } from "lucide-react";

export default function ${enTitle.replace(/[^a-zA-Z]/g, "")}NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4" dir="rtl">
      <div className="rounded-full bg-muted p-4">
        <${icon} className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">${arTitle} غير موجود</h2>
        <p className="text-sm text-muted-foreground">
          لم نتمكن من العثور على ${arTitle} المطلوبة أو ليس لديك صلاحية الوصول إليها.
        </p>
        <p className="text-xs text-muted-foreground/60">
          ${enTitle} not found or access is not permitted.
        </p>
      </div>
      <Link
        href="${returnHref}"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        العودة
      </Link>
    </div>
  );
}
`;
}

// ============================================================
// GENERATION
// ============================================================

let created = 0;
let skipped = 0;

for (const product of PRODUCTS) {
  const segments = product.path.split("/");
  const fullPath = join(APP_DIR, ...segments);
  
  // Create directory if it doesn't exist
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }

  // Check if page.tsx exists
  const hasPage = existsSync(join(fullPath, "page.tsx"));
  if (!hasPage) {
    skipped++;
    continue;
  }

  // error.tsx
  const errorPath = join(fullPath, "error.tsx");
  if (!existsSync(errorPath)) {
    writeFileSync(errorPath, errorTemplate(product), "utf-8");
    created++;
  }

  // loading.tsx
  const loadingPath = join(fullPath, "loading.tsx");
  if (!existsSync(loadingPath)) {
    writeFileSync(loadingPath, loadingTemplate(product), "utf-8");
    created++;
  }

  // not-found.tsx (skip for create/new pages)
  if (!product.skipNf) {
    const nfPath = join(fullPath, "not-found.tsx");
    if (!existsSync(nfPath)) {
      writeFileSync(nfPath, notFoundTemplate(product), "utf-8");
      created++;
    }
  }
}

console.log(`✅ Generated ${created} boundary files`);
console.log(`ℹ️ Skipped ${skipped} routes (no page.tsx)`);
