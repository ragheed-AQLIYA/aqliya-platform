import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialLearningTrend,
} from "@/lib/sales/services/executive-commercial-dashboard-service";
import { SectionFallback } from "./section-fallback";
import { trendArrow } from "./constants";

export function LearningTrendsSection({
  section,
}: {
  section: ExecutiveCommercialSection<ExecutiveCommercialLearningTrend[]>;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          \u0627\u062a\u062c\u0627\u0647\u0627\u062a \u0627\u0644\u062a\u0639\u0644\u0645
        </CardTitle>
      </CardHeader>
      <CardContent>
        {section.status === "fallback" ||
        !section.data ||
        section.data.length === 0 ? (
          <SectionFallback section={section} />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {section.data.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-lg leading-none">
                    {trendArrow(t.direction)}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {t.confidencePct}%
                  </Badge>
                </div>
                <p className="mt-2 font-medium leading-snug">{t.labelAr}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.summaryAr}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
