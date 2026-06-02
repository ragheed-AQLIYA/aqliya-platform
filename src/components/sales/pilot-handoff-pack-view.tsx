import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  icpBandLabelAr,
  type AccountIcpAssessment,
} from "@/lib/sales/icp-types";
import type { ConversionMemo } from "@/lib/sales/conversion-memo";
import type { SalesEvidenceLinkView } from "@/lib/sales/evidence-links";
import type { ReviewDecisionRecord } from "@/lib/sales/governance";
import type {
  PilotHandoffChecklistItem,
  PilotHandoffDealSummary,
} from "@/lib/sales/pilot-handoff-pack";
import { PilotHandoffExportButton } from "@/components/sales/pilot-handoff-export-button";
import {
  Building2,
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Shield,
  Target,
} from "lucide-react";

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

function ChecklistSection({ items }: { items: PilotHandoffChecklistItem[] }) {
  const requiredDone = items.filter((i) => i.required && i.checked).length;
  const requiredTotal = items.filter((i) => i.required).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {requiredDone}/{requiredTotal} بنود إلزامية مكتملة
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2 rounded-md border border-border p-3 text-sm"
          >
            {item.checked ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{item.label}</span>
                {!item.required ? (
                  <Badge variant="outline" className="text-[10px]">
                    اختياري
                  </Badge>
                ) : null}
              </div>
              {item.detail ? (
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IcpSummary({ assessment }: { assessment: AccountIcpAssessment }) {
  const score = assessment.score;
  if (!score) {
    return (
      <p className="text-sm text-muted-foreground">
        لا يوجد تقييم ICP —{" "}
        <Link
          href="#"
          className="pointer-events-none text-primary underline-offset-2"
        >
          راجع صفحة الحساب لإعادة الحساب (قواعد)
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl font-bold tabular-nums">{score.fitScore}</span>
        <span className="text-muted-foreground">/100</span>
        <Badge variant="secondary">{icpBandLabelAr(score.band)}</Badge>
        {score.reviewed ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            مُراجع
          </Badge>
        ) : (
          <Badge variant="outline">بانتظار مراجعة</Badge>
        )}
      </div>
      {score.segment ? (
        <p>
          <span className="text-muted-foreground">الشريحة: </span>
          {score.segment}
        </p>
      ) : null}
      {score.assessedAt ? (
        <p className="text-xs text-muted-foreground">
          آخر تقييم: {formatArDate(score.assessedAt)}
        </p>
      ) : null}
      {score.reasoning && score.reasoning.length > 0 ? (
        <ul className="list-disc pr-4 text-xs text-muted-foreground">
          {score.reasoning.slice(0, 4).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MemoSummary({
  memo,
  evidenceLinks,
}: {
  memo: ConversionMemo | null;
  evidenceLinks: SalesEvidenceLinkView[];
}) {
  if (!memo) {
    return (
      <p className="text-sm text-muted-foreground">
        لا توجد مذكرة تحويل — أكملها من صفحة الصفقة (PR-13).
      </p>
    );
  }

  const linkById = new Map(evidenceLinks.map((l) => [l.id, l]));

  return (
    <div className="space-y-3 text-sm">
      <Badge variant="secondary">
        {MEMO_STATUS_LABELS[memo.status] ?? memo.status}
      </Badge>
      <div>
        <p className="text-xs text-muted-foreground">المسودة</p>
        <p className="whitespace-pre-wrap">{memo.draft || "—"}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">معايير pilot</p>
        <p className="whitespace-pre-wrap">{memo.pilotCriteria || "—"}</p>
      </div>
      {memo.evidenceRefs.length > 0 ? (
        <div>
          <p className="text-xs text-muted-foreground">مراجع الأدلة</p>
          <ul className="list-disc pr-4">
            {memo.evidenceRefs.map((ref) => (
              <li key={ref}>{linkById.get(ref)?.title ?? ref}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function PilotHandoffPackView({
  deal,
  conversionMemo,
  evidenceLinks,
  reviewDecisions,
  icpAssessment,
  checklist,
  generatedAt,
}: {
  deal: PilotHandoffDealSummary;
  conversionMemo: ConversionMemo | null;
  evidenceLinks: SalesEvidenceLinkView[];
  reviewDecisions: ReviewDecisionRecord[];
  icpAssessment: AccountIcpAssessment;
  checklist: PilotHandoffChecklistItem[];
  generatedAt: string;
}) {
  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <p className="text-xs text-muted-foreground">
            حزمة onboarding pilot — PR-19 (قراءة فقط)
          </p>
          <p className="text-xs text-muted-foreground">
            توليد: {formatArDate(generatedAt)}
          </p>
        </div>
        <PilotHandoffExportButton dealId={deal.id} />
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base">ملخص الصفقة</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">الحساب:</span>
            <Link
              href={`/sales/accounts/${deal.accountId}`}
              className="font-medium text-primary hover:underline print:text-black print:no-underline"
            >
              {deal.accountName}
            </Link>
          </div>
          <div>
            <span className="text-muted-foreground">المرحلة: </span>
            {deal.stageName ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">القيمة: </span>
            {formatAmount(deal.amount, deal.currency)}
          </div>
          <div>
            <span className="text-muted-foreground">الحالة: </span>
            {deal.status}
          </div>
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            ملاءمة ICP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <IcpSummary assessment={icpAssessment} />
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            مذكرة تحويل pilot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemoSummary memo={conversionMemo} evidenceLinks={evidenceLinks} />
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base">أدلة مربوطة ({evidenceLinks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {evidenceLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا أدلة مربوطة.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {evidenceLinks.map((link) => (
                <li key={link.id} className="rounded-md border p-2">
                  <span className="font-medium">{link.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {link.evidenceId} · {link.type}
                    {link.resolved ? "" : " · غير محلول"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            قرارات المراجعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewDecisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا قرارات مسجّلة.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {reviewDecisions.map((d) => (
                <li key={d.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {DECISION_LABELS[d.decision] ?? d.decision}
                    </Badge>
                    {d.stageSlug ? (
                      <span className="text-xs text-muted-foreground">
                        {d.stageSlug}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1">{d.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.actorName ?? d.actorId} · {formatArDate(d.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader>
          <CardTitle className="text-base">قائمة تحقق التسليم</CardTitle>
        </CardHeader>
        <CardContent>
          <ChecklistSection items={checklist} />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground print:hidden">
        stub PR-19 — تجميع metadata فقط. للتصدير HTML للطباعة استخدم «تصدير
        قائمة التحقق» (بدون مكتبة PDF).
      </p>

      <Link
        href={`/sales/deals/${deal.id}`}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline print:hidden"
      >
        <ExternalLink className="h-4 w-4" />
        العودة إلى صفحة الصفقة
      </Link>
    </div>
  );
}
