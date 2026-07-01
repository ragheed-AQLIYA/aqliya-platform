/**
 * Phase 9 — Knowledge Foundation Versioning Dashboard.
 *
 * Displays versioned institutional knowledge foundation with:
 * - Current active version
 * - Release history
 * - Version comparison
 * - Diff viewer
 * - Rollback center
 * - Release evidence
 * - Audit history
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  listVersions,
  getFoundationDashboardKPIs,
  getFoundationCandidatePoolOverview,
} from "@/actions/knowledge-foundation/actions";
import { FoundationKpiCards } from "@/components/knowledge-foundation/kpi-cards";
import { CandidatePoolOverviewCard } from "@/components/knowledge-foundation/candidate-pool-overview-card";
import { VersionTable } from "@/components/knowledge-foundation/version-table";
import { PlusCircle, FileDiff, History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KnowledgeFoundationPage() {
  try {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = user.role === "ADMIN";
  const isOperator = user.role === "OPERATOR" || isAdmin;

  // ─── DIAGNOSTIC: Isolated query execution (replacing Promise.all) ───
  // Task: PHASE_29_TABLETOP_BLOCKER_INVESTIGATION
  // DO NOT REMOVE — captures exact failing query and exception
  let versions: Awaited<ReturnType<typeof listVersions>>;
  let kpis: Awaited<ReturnType<typeof getFoundationDashboardKPIs>>;
  let poolOverview: Awaited<ReturnType<typeof getFoundationCandidatePoolOverview>> | null = null;

  // Query 1: listVersions
  try {
    const t0 = Date.now();
    versions = await listVersions();
    const elapsed = Date.now() - t0;
    console.error(JSON.stringify({
      event: "KF_DIAG_QUERY_OK",
      query: "listVersions",
      elapsed,
      resultType: typeof versions,
      isArray: Array.isArray(versions),
      length: Array.isArray(versions) ? (versions as unknown[]).length : null,
    }));
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    const prismaCode = (err as unknown as Record<string, unknown>).code;
    console.error(JSON.stringify({
      event: "KF_DIAG_QUERY_FAIL",
      query: "listVersions",
      exception: err.message,
      name: err.name,
      stack: (err.stack || "").split("\n").slice(0, 6).join("\n"),
      prismaErrorCode: typeof prismaCode === "string" ? prismaCode : null,
      failedBeforeRender: true,
    }));
    throw err; // preserve original SSR failure behavior
  }

  // Query 2: getFoundationDashboardKPIs
  try {
    const t0 = Date.now();
    kpis = await getFoundationDashboardKPIs();
    const elapsed = Date.now() - t0;
    console.error(JSON.stringify({
      event: "KF_DIAG_QUERY_OK",
      query: "getFoundationDashboardKPIs",
      elapsed,
      resultType: typeof kpis,
      hasActiveVersion: typeof kpis === "object" && kpis !== null ? "activeVersion" in kpis : false,
    }));
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    const prismaCode = (err as unknown as Record<string, unknown>).code;
    console.error(JSON.stringify({
      event: "KF_DIAG_QUERY_FAIL",
      query: "getFoundationDashboardKPIs",
      exception: err.message,
      name: err.name,
      stack: (err.stack || "").split("\n").slice(0, 6).join("\n"),
      prismaErrorCode: typeof prismaCode === "string" ? prismaCode : null,
      failedBeforeRender: true,
    }));
    throw err;
  }

  // Query 3: getFoundationCandidatePoolOverview (OPERATOR only)
  if (isOperator) {
    try {
      const t0 = Date.now();
      poolOverview = await getFoundationCandidatePoolOverview();
      const elapsed = Date.now() - t0;
      console.error(JSON.stringify({
        event: "KF_DIAG_QUERY_OK",
        query: "getFoundationCandidatePoolOverview",
        elapsed,
        resultType: typeof poolOverview,
        keys: poolOverview ? Object.keys(poolOverview) : null,
      }));
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      const prismaCode = (err as unknown as Record<string, unknown>).code;
      console.error(JSON.stringify({
        event: "KF_DIAG_QUERY_FAIL",
        query: "getFoundationCandidatePoolOverview",
        exception: err.message,
        name: err.name,
        stack: (err.stack || "").split("\n").slice(0, 6).join("\n"),
      prismaErrorCode: typeof prismaCode === "string" ? prismaCode : null,
        failedBeforeRender: true,
      }));
      throw err;
    }
  }

  console.error(JSON.stringify({
    event: "KF_DIAG_ALL_OK",
    queries: ["listVersions", "getFoundationDashboardKPIs", ...(isOperator ? ["getFoundationCandidatePoolOverview"] : [])],
  }));

  // ─── RENDER PHASE BEGINS ───
  console.error(JSON.stringify({ event: "KF_DIAG_RENDER_START" }));

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <header>
        <p className="text-xs tracking-wide text-muted-foreground">
          AQLIYA Core · Knowledge Foundation · Phase 9
        </p>
        <h1 className="text-2xl font-bold">أساس المعرفة المؤسسية</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          إصدارات المعرفة المحوكمة. كل إصدار يمثل حزمة معرفة مؤسسية معتمدة مع
          إمكانية الرجوع وسجل تدقيقي كامل.
        </p>
      </header>

      {/* KPI cards */}
      <FoundationKpiCards kpis={kpis} />

      {isOperator && poolOverview && (
        <CandidatePoolOverviewCard overview={poolOverview} />
      )}

      {/* Actions bar */}
      {isOperator && (
        <div className="flex flex-wrap gap-3">
          <a
            href="/knowledge-foundation/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            إنشاء إصدار جديد
          </a>
          <a
            href="/knowledge-foundation/diff"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted/50"
          >
            <FileDiff className="h-4 w-4" />
            مقارنة الإصدارات
          </a>
          <a
            href="/knowledge-foundation/history"
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted/50"
          >
            <History className="h-4 w-4" />
            سجل التدقيق
          </a>
        </div>
      )}

      {/* Release History Table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          سجل الإصدارات
          <span className="mr-2 text-sm font-normal text-muted-foreground">
            ({Array.isArray(versions) ? versions.length : 0} إصدار)
          </span>
        </h2>
        <VersionTable versions={versions} />
      </section>

      {/* Governance summary */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">دورة حوكمة الإصدار</h2>
        <div className="grid gap-4 text-sm sm:grid-cols-5">
          {[
            { step: "مسودة", desc: "إنشاء الإصدار من المرشّحات المعتمدة", by: "مشغّل" },
            { step: "اعتماد", desc: "مراجعة واعتماد محتوى الإصدار", by: "مدير" },
            { step: "إطلاق", desc: "توليد حزمة الإصدار الثابتة", by: "مشغّل" },
            { step: "نشط", desc: "تفعيل الإصدار كمعرفة مؤسسية", by: "مدير" },
            { step: "متقاعد", desc: "إيقاف الإصدار (يدوي أو استرجاع)", by: "مدير" },
          ].map((item) => (
            <div key={item.step} className="rounded-lg border bg-muted/30 p-3">
              <p className="font-medium">{item.step}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                الصلاحية: {item.by}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    const prismaCode = (err as unknown as Record<string, unknown>).code;
    console.error(JSON.stringify({
      event: "KF_DIAG_FATAL",
      exception: err.message,
      name: err.name,
      stack: (err.stack || "").split("\n").slice(0, 15).join("\n"),
      prismaErrorCode: typeof prismaCode === "string" ? prismaCode : null,
      failedInRender: true,
    }));
    throw err;
  }
}
