import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, TrendingUp } from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  Draft: "مسودة",
  DataCollection: "جمع البيانات",
  ClassificationInProgress: "تصنيف",
  EvidenceReview: "مراجعة الأدلة",
  FindingsDrafted: "نتائج",
  InReview: "مراجعة",
  Returned: "مرتجع",
  Approved: "معتمد",
  Rejected: "مرفوض",
  ReportReady: "تقرير جاهز",
  Exported: "مُصدّر",
  Archived: "مؤرشف",
};

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-muted",
  Approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  InReview:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

export function LocalContentStatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] || status;
  return (
    <Badge variant="outline" className={STATUS_COLORS[status] || ""}>
      {label}
    </Badge>
  );
}

export type ProjectListItem = {
  id: string;
  name: string;
  reportingPeriod: string;
  status: string;
  localContentScore: number | null;
  createdAt: Date;
};

export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link href={`/local-content/projects/${project.id}`}>
      <Card className="p-4 hover:border-primary transition-colors">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-base font-semibold truncate">{project.name}</h2>
          <LocalContentStatusBadge status={project.status} />
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {project.reportingPeriod}
          </div>
          {project.localContentScore != null && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {project.localContentScore.toFixed(1)}%
            </div>
          )}
          <div>{new Date(project.createdAt).toLocaleDateString("ar-SA")}</div>
        </div>
      </Card>
    </Link>
  );
}

export function ProjectList({ projects }: { projects: ProjectListItem[] }) {
  if (projects.length === 0) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="py-16 text-center">
      <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="p-8 max-w-6xl mx-auto" dir="rtl">
      {children}
    </main>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

export function DevPhaseBadge() {
  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      LocalContentOS قيد التطوير النشط ضمن v0.1. هذه الصفحات حقيقية وتستخدم
      بيانات محفوظة لكن المنتج لم يكتمل بعد.
    </div>
  );
}
