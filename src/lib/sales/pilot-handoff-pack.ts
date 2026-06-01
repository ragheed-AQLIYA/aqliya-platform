import { readConversionMemo, type ConversionMemo } from "./conversion-memo";
import type { SalesEvidenceLinkView } from "./evidence-links";
import { readReviewDecisions, type ReviewDecisionRecord } from "./governance";
import {
  icpBandLabelAr,
  readAccountIcpScore,
  type AccountIcpAssessment,
} from "./icp-types";

export interface PilotHandoffDealSummary {
  id: string;
  title: string;
  status: string;
  amount: number | null;
  currency: string;
  stageName: string | null;
  stageSlug: string | null;
  accountId: string;
  accountName: string;
  updatedAt: string;
}

export interface PilotHandoffChecklistItem {
  id: string;
  label: string;
  detail?: string;
  checked: boolean;
  required: boolean;
}

export interface PilotHandoffPack {
  deal: PilotHandoffDealSummary;
  conversionMemo: ConversionMemo | null;
  evidenceLinks: SalesEvidenceLinkView[];
  reviewDecisions: ReviewDecisionRecord[];
  icpAssessment: AccountIcpAssessment;
  checklist: PilotHandoffChecklistItem[];
  generatedAt: string;
}

export interface BuildPilotHandoffPackInput {
  deal: {
    id: string;
    title: string;
    status: string;
    amount: number | null;
    currency: string;
    updatedAt: Date | string;
    metadata: unknown;
    account: { id: string; name: string };
    stage?: { name: string; slug: string } | null;
  };
  accountMetadata: unknown;
  evidenceLinks: SalesEvidenceLinkView[];
}

function formatIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function latestApprovedDecision(
  decisions: ReviewDecisionRecord[],
): ReviewDecisionRecord | null {
  return (
    decisions.find((d) => d.decision === "approved") ??
    decisions[0] ??
    null
  );
}

export function buildPilotHandoffChecklist(input: {
  conversionMemo: ConversionMemo | null;
  evidenceLinks: SalesEvidenceLinkView[];
  reviewDecisions: ReviewDecisionRecord[];
  icpAssessment: AccountIcpAssessment;
}): PilotHandoffChecklistItem[] {
  const memoSubmitted =
    input.conversionMemo != null &&
    (input.conversionMemo.status === "submitted" ||
      input.conversionMemo.status === "decided");
  const memoDecided = input.conversionMemo?.status === "decided";
  const evidenceCount = input.evidenceLinks.length;
  const memoEvidenceCount = input.conversionMemo?.evidenceRefs.length ?? 0;
  const approved = input.reviewDecisions.some((d) => d.decision === "approved");
  const icpConfigured = input.icpAssessment.configured;
  const icpReviewed = Boolean(input.icpAssessment.score?.reviewed);

  return [
    {
      id: "evidence-linked",
      label: "ربط دليل واحد على الأقل بالصفقة",
      detail: `${evidenceCount} رابط(روابط)`,
      checked: evidenceCount > 0,
      required: true,
    },
    {
      id: "icp-scored",
      label: "تقييم ملاءمة ICP للحساب",
      detail: icpConfigured
        ? `${input.icpAssessment.score?.fitScore ?? "—"}/100 — ${icpBandLabelAr(input.icpAssessment.score?.band ?? "unknown")}`
        : "غير مُقيَّم",
      checked: icpConfigured,
      required: true,
    },
    {
      id: "icp-reviewed",
      label: "مراجعة بشرية لدرجة ICP (قواعد)",
      detail: icpReviewed ? "تمت المراجعة" : "بانتظار مراجعة",
      checked: icpReviewed,
      required: true,
    },
    {
      id: "governance-approved",
      label: "قرار حوكمة معتمد للمرحلة",
      detail: approved ? "موجود" : "لا يوجد اعتماد",
      checked: approved,
      required: true,
    },
    {
      id: "conversion-memo-draft",
      label: "مسودة مذكرة تحويل pilot مكتملة",
      detail: input.conversionMemo?.draft.trim()
        ? "موجودة"
        : "غير مكتملة",
      checked: Boolean(input.conversionMemo?.draft.trim()),
      required: true,
    },
    {
      id: "pilot-criteria",
      label: "معايير نجاح pilot موثّقة",
      detail: input.conversionMemo?.pilotCriteria.trim()
        ? "موثّقة"
        : "غير موثّقة",
      checked: Boolean(input.conversionMemo?.pilotCriteria.trim()),
      required: true,
    },
    {
      id: "memo-evidence-refs",
      label: "مراجع الأدلة مُحدَّدة في المذكرة",
      detail: `${memoEvidenceCount} مرجع(مراجع)`,
      checked: memoEvidenceCount > 0,
      required: true,
    },
    {
      id: "conversion-memo-submitted",
      label: "إرسال مذكرة التحويل للتسليم",
      detail: memoSubmitted ? input.conversionMemo?.status ?? "" : "مسودة",
      checked: memoSubmitted,
      required: true,
    },
    {
      id: "conversion-memo-decided",
      label: "تسجيل قرار التحويل (اختياري)",
      detail: memoDecided ? "قرار مسجّل" : "لم يُسجَّل بعد",
      checked: memoDecided,
      required: false,
    },
  ];
}

export function buildPilotHandoffPack(
  input: BuildPilotHandoffPackInput,
): PilotHandoffPack {
  const conversionMemo = readConversionMemo(input.deal.metadata);
  const reviewDecisions = readReviewDecisions(input.deal.metadata);
  const icpAssessment = readAccountIcpScore(input.accountMetadata);

  return {
    deal: {
      id: input.deal.id,
      title: input.deal.title,
      status: input.deal.status,
      amount: input.deal.amount,
      currency: input.deal.currency,
      stageName: input.deal.stage?.name ?? null,
      stageSlug: input.deal.stage?.slug ?? null,
      accountId: input.deal.account.id,
      accountName: input.deal.account.name,
      updatedAt: formatIso(input.deal.updatedAt),
    },
    conversionMemo,
    evidenceLinks: input.evidenceLinks,
    reviewDecisions,
    icpAssessment,
    checklist: buildPilotHandoffChecklist({
      conversionMemo,
      evidenceLinks: input.evidenceLinks,
      reviewDecisions,
      icpAssessment,
    }),
    generatedAt: new Date().toISOString(),
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatArDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function formatAmount(amount: number | null, currency: string): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency || "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const DECISION_LABELS: Record<string, string> = {
  approved: "معتمد",
  rejected: "مرفوض",
  pending: "قيد الانتظار",
};

const MEMO_STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  submitted: "مُرسَل للتسليم",
  decided: "قرار مسجّل",
};

export function renderPilotHandoffExportHtml(pack: PilotHandoffPack): string {
  const approved = latestApprovedDecision(pack.reviewDecisions);
  const icp = pack.icpAssessment.score;
  const memo = pack.conversionMemo;

  const checklistRows = pack.checklist
    .map(
      (item) => `<tr>
  <td>${item.checked ? "☑" : "☐"}</td>
  <td>${escapeHtml(item.label)}${item.required ? "" : " <span class=\"optional\">(اختياري)</span>"}</td>
  <td>${escapeHtml(item.detail ?? "—")}</td>
</tr>`,
    )
    .join("\n");

  const evidenceRows =
    pack.evidenceLinks.length > 0
      ? pack.evidenceLinks
          .map(
            (link) => `<li><strong>${escapeHtml(link.title)}</strong> — ${escapeHtml(link.evidenceId)} (${escapeHtml(link.type)})</li>`,
          )
          .join("\n")
      : "<li>لا توجد أدلة مربوطة</li>";

  const decisionRows =
    pack.reviewDecisions.length > 0
      ? pack.reviewDecisions
          .map(
            (d) =>
              `<li>${escapeHtml(DECISION_LABELS[d.decision] ?? d.decision)} — ${escapeHtml(d.reason)} (${formatArDate(d.createdAt)})</li>`,
          )
          .join("\n")
      : "<li>لا قرارات مراجعة مسجّلة</li>";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>حزمة تسليم pilot — ${escapeHtml(pack.deal.title)}</title>
  <style>
    body { font-family: system-ui, "Segoe UI", Tahoma, sans-serif; max-width: 820px; margin: 32px auto; padding: 24px; line-height: 1.65; color: #111; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.1rem; margin-top: 1.75rem; border-bottom: 1px solid #ddd; padding-bottom: 0.35rem; }
    .meta { color: #555; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .disclaimer { background: #f6f6f6; border: 1px solid #e0e0e0; padding: 12px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: right; vertical-align: top; }
    th { background: #f5f5f5; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 0.9rem; }
    .label { color: #666; }
    pre { white-space: pre-wrap; background: #fafafa; border: 1px solid #eee; padding: 12px; border-radius: 8px; font-family: inherit; font-size: 0.9rem; }
    ul { margin: 0.25rem 0 0; padding-right: 1.25rem; }
    .optional { color: #777; font-size: 0.8rem; }
    @media print { body { margin: 0; padding: 16px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="no-print"><button onclick="window.print()">طباعة / حفظ PDF</button></p>
  <h1>حزمة onboarding pilot — SalesOS</h1>
  <div class="meta">
    الصفقة: ${escapeHtml(pack.deal.title)} · الحساب: ${escapeHtml(pack.deal.accountName)} ·
    توليد: ${formatArDate(pack.generatedAt)}
  </div>
  <div class="disclaimer">
    وثيقة قراءة فقط — تجميع metadata موجود (مذكرة تحويل، أدلة، حوكمة، ICP). لا إرسال بريد ولا LLM. PR-19 stub.
  </div>

  <h2>ملخص الصفقة</h2>
  <div class="grid">
    <div><span class="label">المرحلة:</span> ${escapeHtml(pack.deal.stageName ?? "—")}</div>
    <div><span class="label">الحالة:</span> ${escapeHtml(pack.deal.status)}</div>
    <div><span class="label">القيمة:</span> ${escapeHtml(formatAmount(pack.deal.amount, pack.deal.currency))}</div>
    <div><span class="label">آخر تحديث:</span> ${formatArDate(pack.deal.updatedAt)}</div>
  </div>

  <h2>درجة ICP (حساب)</h2>
  ${
    icp
      ? `<div class="grid">
    <div><span class="label">الدرجة:</span> ${icp.fitScore}/100</div>
    <div><span class="label">التصنيف:</span> ${escapeHtml(icpBandLabelAr(icp.band))}</div>
    <div><span class="label">الشريحة:</span> ${escapeHtml(icp.segment ?? "—")}</div>
    <div><span class="label">مراجعة بشرية:</span> ${icp.reviewed ? "نعم" : "لا"}</div>
  </div>`
      : "<p>لا يوجد تقييم ICP — استخدم إعادة الحساب (قواعد) من صفحة الحساب.</p>"
  }

  <h2>مذكرة تحويل pilot</h2>
  ${
    memo
      ? `<p><strong>الحالة:</strong> ${escapeHtml(MEMO_STATUS_LABELS[memo.status] ?? memo.status)}</p>
  <p class="label">المسودة</p><pre>${escapeHtml(memo.draft || "—")}</pre>
  <p class="label">معايير pilot</p><pre>${escapeHtml(memo.pilotCriteria || "—")}</pre>`
      : "<p>لا توجد مذكرة تحويل.</p>"
  }

  <h2>أدلة مربوطة</h2>
  <ul>${evidenceRows}</ul>

  <h2>قرارات المراجعة</h2>
  <ul>${decisionRows}</ul>
  ${approved ? `<p class="label">آخر اعتماد: ${escapeHtml(approved.reason)} (${formatArDate(approved.createdAt)})</p>` : ""}

  <h2>قائمة تحقق التسليم</h2>
  <table>
    <thead><tr><th>✓</th><th>البند</th><th>الحالة</th></tr></thead>
    <tbody>${checklistRows}</tbody>
  </table>

  <script>/* optional auto-print: window.print(); */</script>
</body>
</html>`;
}
