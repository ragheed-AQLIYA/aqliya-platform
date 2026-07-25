import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  Brain,
  KanbanSquare,
  Building2,
  ScrollText,
  Bot,
  Globe,
  FileText,
  FileSpreadsheet,
  FolderKanban,
  BarChart3,
  Hash,
  Bell,
  HeartPulse,
} from "lucide-react";

export type NavItem = {
  name: string;
  nameAr?: string;
  href: string;
  icon: LucideIcon;
};

export type Module = {
  id: string;
  name: string;
  nameAr: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bgActive: string;
  borderActive: string;
};

export const modules: Module[] = [
  {
    id: "audit",
    name: "AuditOS",
    nameAr: "نظام التدقيق المالي",
    icon: ShieldCheck,
    href: "/audit",
    color: "text-module-audit",
    bgActive: "bg-module-audit/10",
    borderActive: "border-l-module-audit",
  },
  {
    id: "decision",
    name: "DecisionOS",
    nameAr: "نظام القرارات",
    icon: Brain,
    href: "/decisions",
    color: "text-module-decision",
    bgActive: "bg-module-decision/10",
    borderActive: "border-l-module-decision",
  },
  {
    id: "workflowos",
    name: "WorkflowOS",
    nameAr: "سير العمل الذكي",
    icon: KanbanSquare,
    href: "/workflowos",
    color: "text-aqliya-cyan",
    bgActive: "bg-aqliya-cyan/10",
    borderActive: "border-l-aqliya-cyan",
  },
  {
    id: "localContent",
    name: "LocalContentOS",
    nameAr: "المحتوى المحلي",
    icon: Globe,
    href: "/local-content",
    color: "text-module-localcontent",
    bgActive: "bg-module-localcontent/10",
    borderActive: "border-l-module-localcontent",
  },
  {
    id: "sales",
    name: "SalesOS",
    nameAr: "نظام المبيعات",
    icon: TrendingUp,
    href: "/sales",
    color: "text-module-sales",
    bgActive: "bg-module-sales/10",
    borderActive: "border-l-module-sales",
  },
];

export const platformNav: NavItem[] = [
  {
    name: "Platform Overview",
    nameAr: "نظرة عامة على المنصة",
    href: "/overview",
    icon: HeartPulse,
  },
  {
    name: "Notifications",
    nameAr: "التنبيهات",
    href: "/notifications",
    icon: Bell,
  },
  {
    name: "Decision Intelligence",
    nameAr: "الذكاء القرارات",
    href: "/decisions",
    icon: LayoutDashboard,
  },
  {
    name: "Sunbul Company",
    nameAr: "شركة سنبل",
    href: "/organizations/sunbul",
    icon: Building2,
  },
  { name: "الذكاء", href: "/intelligence/sectors", icon: Brain },
  {
    name: "Contacts Dashboard",
    nameAr: "لوحة علاقات المؤسسات",
    href: "/contacts/dashboard",
    icon: Users,
  },
  {
    name: "All Contacts",
    nameAr: "جهات الاتصال",
    href: "/contacts",
    icon: Users,
  },
  { name: "الإعدادات", href: "/settings", icon: Settings },
  {
    name: "Platform Organization",
    nameAr: "منظمة المنصة",
    href: "/settings/platform-organization",
    icon: ShieldCheck,
  },
  {
    name: "Client Workspaces",
    nameAr: "مساحات العملاء",
    href: "/settings/workspaces",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Audit Logs",
    nameAr: "سجلات تدقيق المنصة",
    href: "/settings/audit-logs",
    icon: ScrollText,
  },
  {
    name: "Chain Verification",
    nameAr: "التحقق من سلسلة التجزئة",
    href: "/settings/chain-verification",
    icon: Hash,
  },
  {
    name: "AI Governance",
    nameAr: "حوكمة الذكاء الاصطناعي",
    href: "/settings/ai-governance",
    icon: ShieldCheck,
  },
  {
    name: "Governance Hub",
    nameAr: "مركز الحوكمة",
    href: "/governance-hub",
    icon: ShieldCheck,
  },
  {
    name: "Operator Dashboard",
    nameAr: "لوحة المشغل",
    href: "/operator",
    icon: BarChart3,
  },
  {
    name: "Office AI Assistant",
    nameAr: "مساعد العمل الذكي",
    href: "/assistant",
    icon: Bot,
  },
  {
    name: "Skills Evaluation",
    nameAr: "تقييم المهارات",
    href: "/settings/skills/evaluate",
    icon: BarChart3,
  },
];

const auditNav: NavItem[] = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    href: "/audit",
    icon: LayoutDashboard,
  },
  { name: "Engagements", nameAr: "المهام", href: "/audit", icon: ShieldCheck },
  { name: "Clients", nameAr: "العملاء", href: "/audit", icon: Users },
  { name: "Evidence", nameAr: "الأدلة", href: "/audit", icon: LayoutDashboard },
  {
    name: "Findings",
    nameAr: "الملاحظات",
    href: "/audit",
    icon: LayoutDashboard,
  },
  {
    name: "Reviews",
    nameAr: "المراجعات",
    href: "/audit",
    icon: LayoutDashboard,
  },
  { name: "Approval", nameAr: "الموافقة", href: "/audit", icon: ShieldCheck },
  {
    name: "Audit Trail",
    nameAr: "سجل التدقيق",
    href: "/audit",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Organization",
    nameAr: "منظمة المنصة",
    href: "/settings/platform-organization",
    icon: ShieldCheck,
  },
  {
    name: "Client Workspaces",
    nameAr: "مساحات العملاء",
    href: "/settings/workspaces",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Audit Logs",
    nameAr: "سجلات تدقيق المنصة",
    href: "/settings/audit-logs",
    icon: ScrollText,
  },
  {
    name: "Office AI Assistant",
    nameAr: "مساعد العمل الذكي",
    href: "/assistant",
    icon: Bot,
  },
  {
    name: "Skills Evaluation",
    nameAr: "تقييم المهارات",
    href: "/settings/skills/evaluate",
    icon: BarChart3,
  },
];

const salesNav: NavItem[] = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    href: "/sales",
    icon: LayoutDashboard,
  },
  {
    name: "Pipeline",
    nameAr: "مسار المبيعات",
    href: "/sales/pipeline",
    icon: TrendingUp,
  },
  {
    name: "Deals",
    nameAr: "الصفقات",
    href: "/sales/deals",
    icon: FileSpreadsheet,
  },
  {
    name: "Accounts",
    nameAr: "الحسابات",
    href: "/sales/accounts",
    icon: Building2,
  },
  {
    name: "Intelligence",
    nameAr: "الذكاء التجاري",
    href: "/sales/intelligence",
    icon: Brain,
  },
  {
    name: "Activities",
    nameAr: "النشاطات",
    href: "/sales/activities",
    icon: BarChart3,
  },
  {
    name: "Reports",
    nameAr: "التقارير",
    href: "/sales/reports",
    icon: FileText,
  },
];

const workflowosNav: NavItem[] = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    href: "/workflowos",
    icon: LayoutDashboard,
  },
  {
    name: "Records",
    nameAr: "السجلات",
    href: "/workflowos/records",
    icon: FileText,
  },
  {
    name: "Templates",
    nameAr: "القوالب",
    href: "/workflowos/templates",
    icon: FolderKanban,
  },
  {
    name: "Admin Dashboard",
    nameAr: "لوحة الإدارة",
    href: "/workflowos/admin",
    icon: TrendingUp,
  },
  {
    name: "WorkflowOS Admin",
    nameAr: "إدارة سير العمل",
    href: "/workflowos/admin",
    icon: Settings,
  },
];

const localContentNav: NavItem[] = [
  {
    name: "Dashboard",
    nameAr: "لوحة التحكم",
    href: "/local-content",
    icon: LayoutDashboard,
  },
  {
    name: "AI Quality",
    nameAr: "جودة الذكاء",
    href: "/local-content/quality-dashboard",
    icon: BarChart3,
  },
  {
    name: "AI Advisor",
    nameAr: "المستشار الذكي",
    href: "/local-content/ai-advisor",
    icon: Brain,
  },
  {
    name: "Review Center",
    nameAr: "مركز المراجعة",
    href: "/local-content/review-center",
    icon: FileText,
  },
  {
    name: "Pilot Readiness",
    nameAr: "الجاهزية التشغيلية",
    href: "/local-content/pilot-readiness",
    icon: ShieldCheck,
  },
  {
    name: "Projects",
    nameAr: "المشاريع",
    href: "/local-content/projects",
    icon: Globe,
  },
  {
    name: "Workbook Engine",
    nameAr: "محرك الدفتر",
    href: "/local-content/workbook",
    icon: FileSpreadsheet,
  },
  {
    name: "Platform Organization",
    nameAr: "منظمة المنصة",
    href: "/settings/platform-organization",
    icon: ShieldCheck,
  },
  {
    name: "Client Workspaces",
    nameAr: "مساحات العملاء",
    href: "/settings/workspaces",
    icon: LayoutDashboard,
  },
  {
    name: "Platform Audit Logs",
    nameAr: "سجلات تدقيق المنصة",
    href: "/settings/audit-logs",
    icon: ScrollText,
  },
  {
    name: "Office AI Assistant",
    nameAr: "مساعد العمل الذكي",
    href: "/assistant",
    icon: Bot,
  },
];

export function getActiveModule(pathname: string | null): string {
  if (!pathname) return "decision";
  if (pathname.startsWith("/audit")) return "audit";
  if (pathname.startsWith("/local-content")) return "localContent";
  if (pathname.startsWith("/workflowos") || pathname.startsWith("/sunbul"))
    return "workflowos";
  if (pathname.startsWith("/sales")) return "sales";
  if (
    pathname.startsWith("/decisions") ||
    pathname.startsWith("/organizations") ||
    pathname.startsWith("/intelligence")
  )
    return "decision";
  return "decision";
}

export function getModuleNav(moduleId: string): NavItem[] {
  switch (moduleId) {
    case "audit":
      return auditNav;
    case "sales":
      return salesNav;
    case "workflowos":
      return workflowosNav;
    case "localContent":
      return localContentNav;
    case "decision":
      return platformNav;
    default:
      return platformNav;
  }
}
