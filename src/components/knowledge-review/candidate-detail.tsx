/**
 * Phase 8.1 — Candidate Detail Panel (Client Component).
 *
 * Displays full candidate info, evidence list, promotion history,
 * and embeds the ReviewActions component for governance actions.
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  User,
  Brain,
  ExternalLink,
  AlertTriangle,
  BarChart3,
  Layers,
} from "lucide-react";
import {
  approveCandidate,
  rejectCandidate,
  promoteCandidate,
  submitCandidateForReview,
} from "@/actions/knowledge-mining-actions";
import { ReviewActions } from "@/components/knowledge-review/review-actions";
import type { KnowledgeCandidateDTO, KnowledgeMiningKPIs } from "@/lib/tb-intelligence/knowledge-mining/types";

/* ── Status badge config ──────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CANDIDATE: {
    label: "مرشّح",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  UNDER_REVIEW: {
    label: "قيد المراجعة",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  APPROVED: {
    label: "معتمد",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    label: "مرفوض",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  PROMOTED: {
    label: "مُرقّى",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
};

/* ── Types ───────────────────────────────────── */

type EvidenceItem = {
  id: string;
  evidenceType: string;
  evidenceId: string;
  organizationId: string;
  accountCode: string;
  accountName: string | null;
  createdAt: string;
};

type PromotionItem = {
  id: string;
  promotedBy: string;
  promotedAt: string;
  artifactType: string;
  artifactPath: string | null;
  notes: string | null;
};

/* ── Component ───────────────────────────────── */

export function CandidateDetailClient({
  candidate,
  evidence,
  promotions,
  kpis,
}: {
  candidate: KnowledgeCandidateDTO;
  evidence: EvidenceItem[];
  promotions: PromotionItem[];
  kpis: KnowledgeMiningKPIs | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState(candidate.status);
  const [liveNotes, setLiveNotes] = useState(candidate.reviewNotes ?? "");

  const statusCfg = STATUS_CONFIG[liveStatus] ?? {
    label: liveStatus,
    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  /* ── Review action handler ────────────────── */

  const handleReview = useCallback(
    async (
      action: "approve" | "reject" | "promote" | "submit",
      notes?: string,
    ) => {
      setBusy(true);
      setLastAction(action);
      setActionError(null);

      try {
        let result;
        switch (action) {
          case "approve":
            result = await approveCandidate(candidate.id, notes);
            break;
          case "reject":
            result = await rejectCandidate(candidate.id, notes);
            break;
          case "promote":
            result = await promoteCandidate(
              candidate.id,
              "candidate-synonyms",
              notes,
            );
            break;
          case "submit":
            result = await submitCandidateForReview(candidate.id);
            break;
        }

        if (result && "success" in result && result.success) {
          if (action === "promote") {
            setLiveStatus("PROMOTED");
          } else if ("newStatus" in result) {
            setLiveStatus(result.newStatus as typeof liveStatus);
          }
          if (notes !== undefined) setLiveNotes(notes);
          router.refresh();
        } else {
          setActionError(
            (result && "error" in result ? result.error : "فشلت العملية") ??
              "فشلت العملية",
          );
        }
      } catch (err) {
        setActionError(String(err));
      } finally {
        setBusy(false);
      }
    },
    [candidate.id, router],
  );

  /* ── Render ───────────────────────────────── */

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        {/* Candidate header */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-bold">{candidate.candidatePhrase}</h2>
                <p className="text-xs text-muted-foreground">
                  {candidate.category} · {candidate.canonicalCode}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusCfg.color}`}
            >
              {statusCfg.label}
            </span>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">قوّة الدعم</p>
              <p className="font-semibold">{candidate.supportCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">المنظمات</p>
              <p className="font-semibold">{candidate.organizationCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">نسبة الثقة</p>
              <p className="font-semibold">
                {Math.round(candidate.confidence * 100)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">المصدر</p>
              <p className="font-mono text-xs">{candidate.source}</p>
            </div>
          </div>

          {/* Review notes */}
          {liveNotes && (
            <div className="mt-4 rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground">
                ملاحظات المراجعة
              </p>
              <p className="mt-1">{liveNotes}</p>
            </div>
          )}

          {/* Reviewer info */}
          {candidate.reviewerId && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>تمت المراجعة بواسطة {candidate.reviewerId}</span>
              {candidate.reviewedAt && (
                <>
                  <Clock className="mr-2 h-3 w-3" />
                  <span>
                    {new Date(candidate.reviewedAt).toLocaleString("ar-SA")}
                  </span>
                </>
              )}
            </div>
          )}
        </section>

        {/* Review Actions */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Shield className="h-4 w-4" />
            إجراءات المراجعة
          </h3>

          <ReviewActions
            candidateId={candidate.id}
            currentStatus={liveStatus}
            busy={busy}
            lastAction={lastAction}
            actionError={actionError}
            onReview={handleReview}
          />

          {/* Last action result */}
          {lastAction && !actionError && !busy && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
              <CheckCircle className="h-3 w-3" />
              <span>
                تم تنفيذ &quot;{lastAction}&quot; بنجاح — الحالة الآن:{" "}
                {STATUS_CONFIG[liveStatus]?.label ?? liveStatus}
              </span>
            </div>
          )}
        </section>

        {/* Evidence list */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <BarChart3 className="h-4 w-4" />
            الأدلة ({evidence.length})
          </h3>
          {evidence.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              لا توجد أدلة مرتبطة بهذا المرشّح.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {evidence.map((e) => (
                <div
                  key={e.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs">{e.accountCode}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.evidenceType}
                    </span>
                  </div>
                  {e.accountName && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {e.accountName}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>معرّف: {e.evidenceId.slice(0, 12)}...</span>
                    <span>جهة: {e.organizationId.slice(0, 12)}...</span>
                    <span>
                      {new Date(e.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Promotion history */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4" />
            سجل الترقية ({promotions.length})
          </h3>
          {promotions.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              لم يتم ترقية هذا المرشّح بعد.
            </p>
          ) : (
            <div className="space-y-2">
              {promotions.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{p.artifactType}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.promotedAt).toLocaleString("ar-SA")}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>بواسطة: {p.promotedBy}</span>
                    {p.artifactPath && (
                      <a
                        href={p.artifactPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        الملف
                      </a>
                    )}
                  </div>
                  {p.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4">
        {/* Top emerging patterns */}
        {kpis && kpis.topEmergingPatterns.length > 0 && (
          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Layers className="h-4 w-4" />
              الأنماط الصاعدة
            </h3>
            <ul className="space-y-2">
              {kpis.topEmergingPatterns.slice(0, 5).map((p, i) => (
                <li
                  key={`${p.phrase}-${i}`}
                  className="rounded-lg border px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.phrase}</span>
                    <span className="text-muted-foreground">{p.canonicalCode}</span>
                  </div>
                  <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                    <span>الدعم: {p.supportCount}</span>
                    <span>الثقة: {Math.round(p.confidence * 100)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Error banner */}
        {actionError && (
          <div
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">فشلت العملية</p>
              <p className="mt-0.5 text-xs">{actionError}</p>
            </div>
          </div>
        )}

        {/* Back link */}
        <Link
          href="/knowledge-review"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى قائمة المراجعة
        </Link>
      </aside>
    </div>
  );
}
