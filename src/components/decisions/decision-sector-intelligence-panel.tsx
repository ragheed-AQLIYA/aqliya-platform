import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDecisionSectorIntelligence } from "@/lib/decision/sector-intelligence-service";

export async function DecisionSectorIntelligencePanel({
  decisionId,
  organizationId,
}: {
  decisionId: string;
  organizationId: string;
}) {
  const snapshot = await getDecisionSectorIntelligence(
    decisionId,
    organizationId,
  );

  return (
    <Card dir="rtl" className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">ذكاء القطاع (D3-03)</CardTitle>
          <Link href={`/decisions/${decisionId}/sector`}>
            <Button variant="outline" size="sm" type="button">
              إدارة القطاع
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {snapshot.assigned && snapshot.sector ? (
          <p>
            <Badge variant="secondary">{snapshot.sector.code}</Badge>{" "}
            <span className="font-medium">{snapshot.sector.name}</span>
          </p>
        ) : (
          <p className="text-muted-foreground">
            لم يُعيَّن قطاع بعد — المعايير والأنماط غير متاحة على هذه الصفحة.
          </p>
        )}

        <ul className="list-disc pr-5 text-muted-foreground space-y-1">
          {snapshot.guidance.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        {snapshot.benchmarks.length > 0 ? (
          <div>
            <p className="font-medium mb-1">معايير مقارنة (أعلى {snapshot.benchmarks.length})</p>
            <ul className="space-y-1 text-muted-foreground">
              {snapshot.benchmarks.map((b) => (
                <li key={`${b.metricName}-${b.benchmarkType}`}>
                  {b.metricName}: {b.value} {b.unit} ({b.benchmarkType})
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {snapshot.patterns.length > 0 ? (
          <div>
            <p className="font-medium mb-1">أنماط مرصودة</p>
            <ul className="space-y-1 text-muted-foreground">
              {snapshot.patterns.map((p) => (
                <li key={`${p.patternType}-${p.patternKey}`}>
                  {p.patternType} — {p.patternKey}
                  {p.occurrenceCount > 0 ? ` (×${p.occurrenceCount})` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
