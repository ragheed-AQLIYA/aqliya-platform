import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialIcp,
} from "@/lib/sales/services/executive-commercial-dashboard-service";
import { SectionFallback } from "./section-fallback";

export function IcpCard({
  section,
}: {
  section: ExecutiveCommercialSection<ExecutiveCommercialIcp>;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">ICP</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {section.status !== "ok" || !section.data ? (
          <SectionFallback section={section} />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                \u062b\u0642\u0629 {section.data.overallConfidencePct}%
              </Badge>
              {section.data.reviewQueueCount > 0 && (
                <Badge variant="outline">
                  \u0645\u0631\u0627\u062c\u0639\u0629: {section.data.reviewQueueCount}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">DRAFT</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {section.data.hypothesisAr}
            </p>
            {section.data.topFitSegments.map((row) => (
              <div
                key={row.labelAr}
                className="flex justify-between border-b border-border/50 pb-2 last:border-0"
              >
                <span className="font-medium">{row.labelAr}</span>
                <span className="text-xs">{row.pct}%</span>
              </div>
            ))}
            <Link
              href="/sales/icp"
              className="block text-xs text-primary hover:underline"
            >
              \u0639\u0631\u0636 ICP \u0643\u0627\u0645\u0644 \u2190
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
