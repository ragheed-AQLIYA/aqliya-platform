import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { LcScoreResult } from "@/lib/local-content/workbook/types";

interface Props {
  scoreResult: LcScoreResult;
  showScoreDetail: boolean;
  onToggleDetail: () => void;
}

export function ScoreCard({ scoreResult, showScoreDetail, onToggleDetail }: Props) {
  return (
    <Card className={showScoreDetail ? "border-primary/30" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-lg">📊</span>
            نتيجة المحتوى المحلي
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleDetail}
            >
              {showScoreDetail ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-3">
          {scoreResult.overallScore !== null ? (
            <>
              <div
                className={`text-3xl font-bold ${
                  scoreResult.overallScore >= 60
                    ? "text-green-600"
                    : scoreResult.overallScore >= 40
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {scoreResult.overallScore}%
              </div>
              <div>
                <p className="text-sm font-medium">{scoreResult.statusLabel}</p>
                <p className="text-xs text-muted-foreground">
                  النتيجة الإجمالية للمحتوى المحلي
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              لا توجد بيانات كافية لاحتساب النتيجة
            </p>
          )}
        </div>

        {showScoreDetail && (
          <div className="space-y-2 mt-3">
            <p className="text-xs text-muted-foreground mb-2">{scoreResult.summaryAr}</p>

            <p className="text-xs font-semibold mt-3 mb-1">المؤشرات</p>
            {scoreResult.metrics.map((m) => (
              <div
                key={m.code}
                className="flex items-center justify-between text-sm p-2 border rounded"
              >
                <div className="flex-1">
                  <p className="font-medium">{m.labelAr}</p>
                  <p className="text-xs text-muted-foreground">{m.explanationAr}</p>
                </div>
                <div className="text-right shrink-0 mr-3">
                  <p className="font-bold">
                    {m.score !== null ? `${m.score}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.numerator !== null
                      ? `${m.numerator.toLocaleString("ar-SA")} / ${m.denominator?.toLocaleString("ar-SA") ?? "—"}`
                      : "لا توجد بيانات"}
                  </p>
                </div>
              </div>
            ))}

            {scoreResult.contributions && scoreResult.contributions.length > 0 && (
              <>
                <p className="text-xs font-semibold mt-3 mb-1">تحليل المساهمة</p>
                {scoreResult.contributions.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between text-sm p-2 border rounded bg-muted/20"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{c.labelAr}</p>
                      <p className="text-xs text-muted-foreground">
                        الوزن: {Math.round(c.weight * 100)}%
                        {c.score !== null && (
                          <> ← الوزن الفعلي: {Math.round(c.effectiveWeight * 100)}%</>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0 mr-3">
                      <p className="font-bold">
                        {c.contributionPct !== null
                          ? `${c.contributionPct.toFixed(1)}%`
                          : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.contributionPct !== null ? "مساهمة في النتيجة" : "لا توجد بيانات"}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {scoreResult.sectionBreakdown && scoreResult.sectionBreakdown.length > 0 && (
              <>
                <p className="text-xs font-semibold mt-3 mb-1">تعبئة الأقسام</p>
                {scoreResult.sectionBreakdown.map((s) => (
                  <div key={s.section} className="text-sm p-2 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{s.labelAr}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.filledLines}/{s.totalLines} (
                        {s.fillPct}%)
                      </span>
                    </div>
                    <Progress value={s.fillPct} className="h-1.5" />
                  </div>
                ))}
              </>
            )}

            <p className="text-[10px] text-muted-foreground mt-2">
              تم الاحتساب: {new Date(scoreResult.computedAt).toLocaleString("ar-SA")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
