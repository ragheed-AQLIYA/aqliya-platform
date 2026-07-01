/**
 * Phase 8.1 — Knowledge Review Governance Dashboard.
 *
 * Lists knowledge candidates for human review before promotion.
 * Calls existing knowledge-mining services; no new data models.
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getCandidates,
  getKPIs,
} from "@/actions/knowledge-mining-actions";
import { KpiCards } from "@/components/knowledge-review/kpi-cards";
import type { KnowledgeCandidateStatus } from "@/lib/tb-intelligence/knowledge-mining/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}>;

export default async function KnowledgeReviewPage(props: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Only ADMIN/OPERATOR roles may view the governance dashboard.
  // Viewer role is deliberately excluded from governance actions.
  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    redirect("/access-denied");
  }

  const sp = await props.searchParams;
  const status = (sp.status as KnowledgeCandidateStatus) ?? undefined;
  const search = sp.search ?? undefined;
  const sortBy = (sp.sortBy as "supportCount" | "confidence" | "createdAt" | "updatedAt") ?? undefined;
  const sortDir = (sp.sortDir as "asc" | "desc") ?? undefined;

  const [candidateResult, kpis] = await Promise.all([
    getCandidates({
      status,
      search,
      sortBy,
      sortDir,
      limit: 50,
    }),
    getKPIs(),
  ]);

  const candidates = candidateResult.candidates ?? [];
  const total = candidateResult.total ?? 0;
  const error = "error" in candidateResult ? candidateResult.error : undefined;

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <header>
        <p className="text-xs tracking-wide text-muted-foreground">
          AQLIYA Core · Knowledge Foundation · Phase 8.1
        </p>
        <h1 className="text-2xl font-bold">مراجعة المعرفة</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          لوحة حوكمة لمراجعة مرشّحات المعرفة قبل الترقية. الذكاء الاصطناعي
          يقترح. الإنسان يراجع. الدليل يحكم.
        </p>
      </header>

      {/* KPI cards — reuse existing getKnowledgeMiningKPIs */}
      <KpiCards kpis={kpis} />

      {/* Candidate queue controls */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            قائمة المرشّحات
            <span className="mr-2 text-sm font-normal text-muted-foreground">
              ({total} إجمالي)
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {/* Filter by status — triggers client navigation */}
            <FilterChip
              label="الكل"
              href="."
              active={!status}
            />
            {(["CANDIDATE", "UNDER_REVIEW", "APPROVED", "REJECTED", "PROMOTED"] as const).map((key) => (
              <FilterChip
                key={key}
                label={STATUS_FILTERS[key]}
                href={`?status=${key}`}
                active={status === key}
              />
            ))}
          </div>
        </div>

        {/* Search */}
        <form
          method="GET"
          className="mb-4 flex items-center gap-2"
        >
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="بحث باسم المرشّح..."
            className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
            aria-label="بحث عن مرشّح معرفة"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            بحث
          </button>
        </form>

        {/* Error banner */}
        {error && (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Table */}
        <CandidateTableServer candidates={candidates} total={total} />
      </section>
    </div>
  );
}

/* ── Filter chip component ─────────────────────── */

import Link from "next/link";

const STATUS_FILTERS: Record<string, string> = {
  CANDIDATE: "مرشّح",
  UNDER_REVIEW: "قيد المراجعة",
  APPROVED: "معتمد",
  REJECTED: "مرفوض",
  PROMOTED: "مُرقّى",
};

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {label}
    </Link>
  );
}

/* ── Inline table (server-rendered) ────────────── */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { KnowledgeCandidateDTO } from "@/lib/tb-intelligence/knowledge-mining/types";

function CandidateTableServer({
  candidates,
}: {
  candidates: KnowledgeCandidateDTO[];
  total: number;
}) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-sm text-muted-foreground">
        <span className="text-2xl">📋</span>
        <p>لا يوجد مرشّحون للمعرفة في هذه الفئة.</p>
        <p className="text-xs">
          شغّل دورة التعدين لإنشاء مرشّحين جدد، أو غيّر عامل التصفية.
        </p>
      </div>
    );
  }

  const STATUS_BADGES: Record<string, string> = {
    CANDIDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    UNDER_REVIEW:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    PROMOTED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>المرشّح</TableHead>
          <TableHead>الرمز الموحّد</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>الدعم</TableHead>
          <TableHead>الثقة</TableHead>
          <TableHead>التاريخ</TableHead>
          <TableHead className="text-left">
            <span className="sr-only">إجراءات</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((c) => (
          <TableRow key={c.id}>
            <TableCell className="font-medium">
              <Link
                href={`/knowledge-review/${c.id}`}
                className="text-primary underline-offset-2 hover:underline"
              >
                {c.candidatePhrase}
              </Link>
            </TableCell>
            <TableCell dir="ltr" className="font-mono text-xs">
              {c.canonicalCode}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  STATUS_BADGES[c.status] ??
                  "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {STATUS_FILTERS[c.status] ?? c.status}
              </span>
            </TableCell>
            <TableCell>{c.supportCount}</TableCell>
            <TableCell>{Math.round(c.confidence * 100)}%</TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(c.createdAt).toLocaleDateString("ar-SA")}
            </TableCell>
            <TableCell className="text-left">
              <Link
                href={`/knowledge-review/${c.id}`}
                className="text-xs text-primary hover:underline"
              >
                عرض التفاصيل
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
