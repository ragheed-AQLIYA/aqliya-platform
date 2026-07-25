"use client";

import { createLogger } from "@/lib/observability/logger";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, FileSpreadsheet } from "lucide-react";
import { getTraceabilityAction } from "@/actions/audit-actions";
import {
  getFinancialStatementsAction,
  getEngagementAction,
} from "@/actions/audit-read-actions";
import {
  isFsV2EnabledAction,
  markAllStatementsReviewedAction,
  rebuildFinancialStatementsV2Action,
  transitionStatementStatusAction,
} from "@/actions/audit-fs-actions";
import { getGovernanceContext } from "@/lib/governance/retrieval-router";
import type {
  FinancialStatement,
  FinancialStatementLine,
  Engagement,
} from "@/types/audit";
import type { TraceabilityNode } from "@/components/audit/shared/traceability-drawer";

const logger = createLogger({ product: "platform", action: "unknown" });

export const sar = (v: number | null | undefined) =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(Number.isFinite(v) ? (v as number) : 0);

export function formatExportError(status: number, message: string): string {
  if (status === 401) return "يلزم تسجيل الدخول لتصدير الملف.";
  if (status === 403) return "لا تملك صلاحية التصدير لهذا التكليف.";
  if (status === 404) return "التصدير غير متاح — تحقق من وجود القوائم المالية.";
  if (status >= 500)
    return "خطأ في الخادم أثناء التصدير. حاول مرة أخرى لاحقاً.";
  return message || "تعذر تنزيل الملف. تحقق من اكتمال البيانات وحاول مرة أخرى.";
}

export async function downloadEngagementExport(
  engagementId: string,
  format: "pdf" | "xlsx",
) {
  const res = await fetch(
    `/api/audit/engagements/${engagementId}/exports/${format}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Export failed" }));
    throw new Error(formatExportError(res.status, err.error || ""));
  }
  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error("الملف المُصدَّر فارغ — تحقق من اكتمال القوائم المالية.");
  }
  const disposition = res.headers.get("content-disposition");
  const filenameMatch = disposition?.match(/filename=\"?([^\";]+)\"?/);
  const filename =
    filenameMatch?.[1] ??
    `financial_statements_${engagementId.substring(0, 8)}.${format}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const statementLabels = (t: (key: string) => string) => ({
  balance_sheet: t("balanceSheet"),
  income_statement: t("incomeStatement"),
  equity: t("equity"),
  cash_flow: t("cashFlow"),
});

export const statementIcons: Record<string, React.ReactNode> = {
  balance_sheet: <FileText className="size-4" />,
  income_statement: <FileSpreadsheet className="size-4" />,
  equity: <FileText className="size-4" />,
  cash_flow: <FileText className="size-4" />,
};

export function useStatementsPage() {
  const params = useParams();
  const engagementId = params.engagementId as string;
  const t = useTranslations("audit.statements");
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLine, setSelectedLine] = useState<{
    statement: FinancialStatement;
    line: FinancialStatementLine;
  } | null>(null);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [traceData, setTraceData] = useState<{
    forward: TraceabilityNode[];
    backward: TraceabilityNode[];
  }>({ forward: [], backward: [] });
  const [governanceOpen, setGovernanceOpen] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fsV2Enabled, setFsV2Enabled] = useState(false);
  const [fsActionLoading, setFsActionLoading] = useState(false);
  const governanceCtx = getGovernanceContext("statement_drafting");

  const loadStatements = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    return Promise.all([
      getFinancialStatementsAction(engagementId),
      getEngagementAction(engagementId),
    ])
      .then(([s, e]) => {
        setStatements(Array.isArray(s) ? s : []);
        setEngagement(e);
      })
      .catch((err) => {
        logger.error("[StatementsPage] load failed:", err instanceof Error ? err : undefined);
        setLoadError(
          err instanceof Error ? err.message : "تعذر تحميل القوائم المالية",
        );
      })
      .finally(() => setLoading(false));
  }, [engagementId]);

  useEffect(() => {
    isFsV2EnabledAction().then(setFsV2Enabled).catch(() => setFsV2Enabled(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getFinancialStatementsAction(engagementId),
      getEngagementAction(engagementId),
    ])
      .then(([s, e]) => {
        if (cancelled) return;
        setStatements(Array.isArray(s) ? s : []);
        setEngagement(e);
      })
      .catch((err) => {
        if (cancelled) return;
        logger.error("[StatementsPage] load failed:", err instanceof Error ? err : undefined);
        setLoadError(
          err instanceof Error ? err.message : "تعذر تحميل القوائم المالية",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [engagementId]);

  const handleExport = useCallback(
    async (format: "pdf" | "xlsx") => {
      setExporting(format);
      setExportError(null);
      setExportSuccess(null);
      try {
        await downloadEngagementExport(engagementId, format);
        setExportSuccess(
          format === "pdf"
            ? "تم تنزيل PDF بنجاح — تحقق من مجلد التنزيلات."
            : "تم تنزيل Excel بنجاح — تحقق من مجلد التنزيلات.",
        );
        window.setTimeout(() => setExportSuccess(null), 5000);
      } catch (e: unknown) {
        setExportError(
          e instanceof Error ? e.message : "فشل التصدير",
        );
      } finally {
        setExporting(null);
      }
    },
    [engagementId],
  );

  const handleGovernanceToggle = useCallback(() => {
    setGovernanceOpen((prev) => !prev);
  }, []);

  const handleLineClick = useCallback(
    async (statement: FinancialStatement, line: FinancialStatementLine) => {
      setSelectedLine({ statement, line });
      try {
        const trace = await getTraceabilityAction(
          engagementId,
          "statement_line",
          line.id,
        );
        setTraceData({
          forward: trace.forwardTrace ?? [],
          backward: trace.backwardTrace ?? [],
        });
      } catch {
        setTraceData({ forward: [], backward: [] });
      }
      setTraceabilityOpen(true);
    },
    [engagementId],
  );

  const handleTransitionStatus = useCallback(
    async (statementId: string) => {
      setFsActionLoading(true);
      try {
        await transitionStatementStatusAction({
          engagementId,
          statementId,
          toStatus: "reviewed",
        });
        await loadStatements();
      } finally {
        setFsActionLoading(false);
      }
    },
    [engagementId, loadStatements],
  );

  const handleRebuildV2 = useCallback(async () => {
    setFsActionLoading(true);
    try {
      await rebuildFinancialStatementsV2Action(engagementId);
      await loadStatements();
    } finally {
      setFsActionLoading(false);
    }
  }, [engagementId, loadStatements]);

  const handleMarkAllReviewed = useCallback(async () => {
    setFsActionLoading(true);
    try {
      await markAllStatementsReviewedAction(engagementId);
      await loadStatements();
    } finally {
      setFsActionLoading(false);
    }
  }, [engagementId, loadStatements]);

  const handleTraceabilityClose = useCallback(() => {
    setTraceabilityOpen(false);
    setSelectedLine(null);
  }, []);

  const getDefaultTab = useCallback(() => {
    const bs = statements.find((s) => s.statementType === "balance_sheet");
    const is = statements.find((s) => s.statementType === "income_statement");
    return bs?.id || is?.id || statements[0]?.id || "";
  }, [statements]);

  return {
    engagementId,
    t,
    statements,
    engagement,
    loading,
    loadError,
    selectedLine,
    traceData,
    traceabilityOpen,
    governanceOpen,
    exporting,
    exportError,
    exportSuccess,
    fsV2Enabled,
    fsActionLoading,
    governanceCtx,
    loadStatements,
    getDefaultTab,
    handleExport,
    handleGovernanceToggle,
    handleLineClick,
    handleTransitionStatus,
    handleRebuildV2,
    handleMarkAllReviewed,
    handleTraceabilityClose,
  };
}
