"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ─── Types ───

export interface LcgpaScoreDisplayData {
  overallLcPct: number;
  totalCosts: number;
  lcGoodsServices: number;
  lcAssetDepreciation: number;
  lcLaborCompensation: number;
  lcCapacityBuilding: number;
  recordable: boolean;
  gateReason: string;
  regulatoryDatasetVersion: string | null;
  regulatoryArtifactSha256: string | null;
  ruleVersion: string;
  method: string;
}

interface Props {
  score: LcgpaScoreDisplayData | null;
  isLoading: boolean;
  showDetail: boolean;
  onCompute: () => void;
  onToggleDetail: () => void;
}

// ─── Pillar Display ───

const PILLARS = [
  { key: "lcGoodsServices", labelAr: "السلع والخدمات", labelEn: "G&S" },
  { key: "lcAssetDepreciation", labelAr: "إهلاك الأصول", labelEn: "Assets" },
  { key: "lcLaborCompensation", labelAr: "أجور العمالة", labelEn: "Labor" },
  { key: "lcCapacityBuilding", labelAr: "بناء القدرات", labelEn: "Capacity" },
] as const;

// ─── Component ───

export function LcgpaScoreCard({
  score,
  isLoading,
  showDetail,
  onCompute,
  onToggleDetail,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">
            نتيجة المحتوى المحلي (LCGPA)
          </CardTitle>
          <CardDescription className="text-xs">
            احتساب رباعي مرتبط بإصدار تنظيمي محدد — LC% = (LC_GS + LC_AD + LC_LC +
            LC_CB) / إجمالي التكاليف × 100
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCompute}
            disabled={isLoading}
            aria-label="احتساب نتيجة LCGPA"
          >
            {isLoading ? "جارٍ الاحتساب…" : "احتساب"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!score ? (
          <p className="text-sm text-muted-foreground">
            لم يتم احتساب النتيجة بعد. اضغط «احتساب» لتشغيل الحساب المرتبط
            بالبيانات التنظيمية الفعّالة.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Score headline */}
            <div className="flex items-baseline gap-3">
              <span
                className={`text-4xl font-bold tabular-nums ${
                  score.overallLcPct >= 60
                    ? "text-green-600"
                    : score.overallLcPct >= 40
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {score.overallLcPct.toFixed(2)}%
              </span>
              <Badge
                variant={score.recordable ? "default" : "destructive"}
                className="text-xs"
              >
                {score.recordable ? "مرتبط" : "غير قابل للتسجيل"}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                قاعدة {score.ruleVersion}
              </Badge>
            </div>

            {/* Pillar breakdown */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PILLARS.map((p) => (
                <div
                  key={p.key}
                  className="rounded-lg border p-3 text-center"
                  dir="rtl"
                >
                  <p className="text-xs text-muted-foreground">{p.labelAr}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {score[p.key].toLocaleString("en", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-[10px] text-muted-foreground" dir="ltr">
                    {p.labelEn}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <p className="text-sm text-muted-foreground">
              إجمالي التكاليف:{" "}
              <span className="font-medium tabular-nums">
                {score.totalCosts.toLocaleString("en", {
                  maximumFractionDigits: 2,
                })}
              </span>{" "}
              ريال
            </p>

            {/* Detail toggle */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleDetail}
              aria-expanded={showDetail}
            >
              {showDetail ? "إخفاء تفاصيل الربط ▲" : "تفاصيل الربط التنظيمي ▼"}
            </Button>

            {showDetail && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5">
                <DetailRow
                  label="الإصدار التنظيمي"
                  value={
                    score.regulatoryDatasetVersion ?? "غير محدد — لا توجد بيانات فعّالة"
                  }
                />
                <DetailRow
                  label="بصمة المصدر (SHA-256)"
                  value={
                    score.regulatoryArtifactSha256
                      ? `${score.regulatoryArtifactSha256.slice(0, 16)}…`
                      : "—"
                  }
                />
                <DetailRow label="منهجية الاحتساب" value={score.method} />
                <DetailRow
                  label="بوابة التسجيل"
                  value={score.gateReason}
                  mono
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={`break-all text-left ${mono ? "font-mono text-[11px]" : ""}`}
        dir="ltr"
      >
        {value}
      </span>
    </div>
  );
}
