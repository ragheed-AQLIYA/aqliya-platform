import {
  readAccountResearchRun,
  type AccountResearchRun,
} from "./agents/account-research";
import {
  listEvidenceLinksForAccount,
  type SalesEvidenceLinkView,
} from "./evidence-links";
import {
  icpBandLabelAr,
  readAccountIcpScore,
  type AccountIcpAssessment,
} from "./icp-types";
import { getSalesAccount } from "./services";
import type { SalesOrgScope } from "./services";
import {
  listSignalsForAccount,
  signalSeverityLabelAr,
  signalTypeLabelAr,
  type SalesSignalView,
} from "./signals";

/** PR-21c — read-only account brief aggregating fields, ICP, signals, research, deals, evidence count. */

export interface AccountBriefDealSummary {
  id: string;
  title: string;
  status: string;
  amount: number | null;
  currency: string;
  stageName: string | null;
  updatedAt: Date;
}

export interface AccountBriefPack {
  accountId: string;
  accountName: string;
  status: string;
  industry: string | null;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
  icpAssessment: AccountIcpAssessment;
  signals: SalesSignalView[];
  research: AccountResearchRun | null;
  deals: AccountBriefDealSummary[];
  evidenceCount: number;
  evidenceLinks: SalesEvidenceLinkView[];
  generatedAt: string;
}

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  inactive: "غير نشط",
  archived: "مؤرشف",
};

const DEAL_STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة",
  won: "مكسوبة",
  lost: "مخسورة",
};

const RESEARCH_STATUS_LABELS: Record<string, string> = {
  draft_pending_review: "مسودة — بانتظار المراجعة",
  reviewed: "تمت المراجعة",
};

function formatArDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = iso instanceof Date ? iso : new Date(iso);
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

function accountStatusLabelAr(status: string): string {
  return ACCOUNT_STATUS_LABELS[status] ?? status;
}

function dealStatusLabelAr(status: string): string {
  return DEAL_STATUS_LABELS[status] ?? status;
}

export function assembleAccountBriefPack(input: {
  account: {
    id: string;
    name: string;
    status: string;
    industry: string | null;
    isDemo: boolean;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
    deals: Array<{
      id: string;
      title: string;
      status: string;
      amount: number | null;
      currency: string;
      updatedAt: Date;
      stage: { name: string } | null;
    }>;
  };
  signals: SalesSignalView[];
  evidenceLinks: SalesEvidenceLinkView[];
}): AccountBriefPack {
  return {
    accountId: input.account.id,
    accountName: input.account.name,
    status: input.account.status,
    industry: input.account.industry,
    isDemo: input.account.isDemo,
    createdAt: input.account.createdAt,
    updatedAt: input.account.updatedAt,
    icpAssessment: readAccountIcpScore(input.account.metadata),
    signals: input.signals,
    research: readAccountResearchRun(input.account.metadata),
    deals: input.account.deals.map((deal) => ({
      id: deal.id,
      title: deal.title,
      status: deal.status,
      amount: deal.amount,
      currency: deal.currency,
      stageName: deal.stage?.name ?? null,
      updatedAt: deal.updatedAt,
    })),
    evidenceCount: input.evidenceLinks.length,
    evidenceLinks: input.evidenceLinks,
    generatedAt: new Date().toISOString(),
  };
}

export async function loadAccountBriefPack(
  accountId: string,
  scope: SalesOrgScope,
): Promise<AccountBriefPack | null> {
  const account = await getSalesAccount(accountId, scope.organizationId);
  if (!account) return null;

  const [signals, evidenceLinks] = await Promise.all([
    listSignalsForAccount(scope, accountId),
    listEvidenceLinksForAccount(scope, accountId),
  ]);

  return assembleAccountBriefPack({
    account,
    signals,
    evidenceLinks,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildIcpSection(pack: AccountBriefPack): string {
  const icp = pack.icpAssessment.score;
  if (!pack.icpAssessment.configured || !icp) {
    return `<p class="muted">لا يوجد تقييم ICP.</p>`;
  }

  const dimensions = icp.dimensions
    ? [
        icp.dimensions.pain != null
          ? `<li>الألم: ${icp.dimensions.pain}%</li>`
          : "",
        icp.dimensions.urgency != null
          ? `<li>الإلحاح: ${icp.dimensions.urgency}%</li>`
          : "",
        icp.dimensions.budget != null
          ? `<li>الميزانية: ${icp.dimensions.budget}%</li>`
          : "",
        icp.dimensions.authority != null
          ? `<li>الصلاحية: ${icp.dimensions.authority}%</li>`
          : "",
      ]
        .filter(Boolean)
        .join("")
    : "";

  const reasoning =
    icp.reasoning && icp.reasoning.length > 0
      ? `<ul>${icp.reasoning.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
      : icp.notes
        ? `<p>${escapeHtml(icp.notes)}</p>`
        : "";

  return `<h2>ICP</h2><p><strong>${icp.fitScore ?? "—"}%</strong> — ${escapeHtml(icpBandLabelAr(icp.band))}${icp.segment ? ` · ${escapeHtml(icp.segment)}` : ""}</p>${icp.confidence != null ? `<p>الثقة: ${icp.confidence}%</p>` : ""}${dimensions ? `<ul>${dimensions}</ul>` : ""}${reasoning}`;
}

function buildSignalsSection(pack: AccountBriefPack): string {
  if (pack.signals.length === 0) {
    return `<p class="muted">لا إشارات مسجّلة.</p>`;
  }

  const rows = pack.signals
    .map((signal) => {
      const severity = signal.severity
        ? signalSeverityLabelAr(signal.severity)
        : "—";
      const summary = signal.summary ? escapeHtml(signal.summary) : "";
      return `<tr><td>${escapeHtml(signalTypeLabelAr(signal.type))}</td><td>${escapeHtml(signal.title)}</td><td>${severity}</td><td>${escapeHtml(formatArDate(signal.detectedAt))}</td><td>${summary}</td></tr>`;
    })
    .join("");

  return `<h2>الإشارات (${pack.signals.length})</h2><table><thead><tr><th>النوع</th><th>العنوان</th><th>الشدة</th><th>التاريخ</th><th>الملخص</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function buildResearchSection(pack: AccountBriefPack): string {
  const research = pack.research;
  if (!research) {
    return `<p class="muted">لا موجز بحث بعد.</p>`;
  }

  const status =
    RESEARCH_STATUS_LABELS[research.status] ?? research.status;
  const sources =
    research.sources.length > 0
      ? `<h3>المصادر</h3><ul>${research.sources
          .map(
            (source) =>
              `<li>${escapeHtml(source.label)}${source.value != null ? ` — ${escapeHtml(String(source.value))}` : ""}</li>`,
          )
          .join("")}</ul>`
      : "";

  return `<h2>موجز البحث</h2><p class="meta">${escapeHtml(status)} · الثقة: ${research.confidence}% · ${research.sources.length} مصدر</p><pre>${escapeHtml(research.brief)}</pre>${sources}<p class="meta">توليد: ${escapeHtml(research.generatedByName ?? research.generatedById)} · ${escapeHtml(formatArDate(research.generatedAt))}</p>`;
}

function buildDealsSection(pack: AccountBriefPack): string {
  if (pack.deals.length === 0) {
    return `<p class="muted">لا صفقات مرتبطة.</p>`;
  }

  const rows = pack.deals
    .map(
      (deal) =>
        `<tr><td>${escapeHtml(deal.title)}</td><td>${escapeHtml(dealStatusLabelAr(deal.status))}</td><td>${escapeHtml(deal.stageName ?? "—")}</td><td>${escapeHtml(formatAmount(deal.amount, deal.currency))}</td><td>${escapeHtml(formatArDate(deal.updatedAt))}</td></tr>`,
    )
    .join("");

  return `<h2>الصفقات المرتبطة (${pack.deals.length})</h2><table><thead><tr><th>العنوان</th><th>الحالة</th><th>المرحلة</th><th>القيمة</th><th>آخر تحديث</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function buildEvidenceSection(pack: AccountBriefPack): string {
  const countLine = `<p><strong>${pack.evidenceCount}</strong> دليل مرتبط.</p>`;
  if (pack.evidenceLinks.length === 0) {
    return `<h2>الأدلة</h2>${countLine}<p class="muted">لا روابط أدلة.</p>`;
  }

  const items = pack.evidenceLinks
    .map(
      (link) =>
        `<li>${escapeHtml(link.title)} (${escapeHtml(link.evidenceId)})</li>`,
    )
    .join("");

  return `<h2>الأدلة</h2>${countLine}<ul>${items}</ul>`;
}

export function buildAccountBriefExportHtml(pack: AccountBriefPack): string {
  const name = escapeHtml(pack.accountName);
  const industry = escapeHtml(pack.industry ?? "غير محدد");
  const status = escapeHtml(accountStatusLabelAr(pack.status));
  const generated = escapeHtml(formatArDate(pack.generatedAt));
  const demo = pack.isDemo ? " · demo" : "";

  const accountFields = `<h2>بيانات الحساب</h2><table><tbody>
<tr><th>الاسم</th><td>${name}</td></tr>
<tr><th>القطاع</th><td>${industry}</td></tr>
<tr><th>الحالة</th><td>${status}${demo}</td></tr>
<tr><th>تاريخ الإنشاء</th><td>${escapeHtml(formatArDate(pack.createdAt))}</td></tr>
<tr><th>آخر تحديث</th><td>${escapeHtml(formatArDate(pack.updatedAt))}</td></tr>
</tbody></table>`;

  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>موجز الحساب — ${name}</title><style>body{font-family:system-ui,sans-serif;max-width:820px;margin:32px auto;padding:24px;line-height:1.65}table{width:100%;border-collapse:collapse;margin-bottom:16px}th,td{border:1px solid #ddd;padding:8px;text-align:right;vertical-align:top}th{background:#f9f9f9;width:28%}pre{white-space:pre-wrap;background:#f5f5f5;padding:12px}.meta{color:#555;font-size:12px}.muted{color:#666}@media print{body{margin:0;padding:16px}}</style></head><body><h1>موجز الحساب</h1><p class="meta">${name} · ${generated}</p>${accountFields}${buildIcpSection(pack)}${buildSignalsSection(pack)}${buildResearchSection(pack)}${buildDealsSection(pack)}${buildEvidenceSection(pack)}<p class="meta">قراءة فقط — PR-21c · HTML للطباعة (بدون PDF)</p></body></html>`;
}
