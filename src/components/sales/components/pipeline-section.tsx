import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialPipeline,
} from "@/lib/sales/services/executive-commercial-dashboard-service";
import { SectionFallback } from "./section-fallback";

export function PipelineSection({
  section,
}: {
  section: ExecutiveCommercialSection<ExecutiveCommercialPipeline>;
}) {
  const pipeline = section.data;

  return (
    <section aria-labelledby="exec-pipeline">
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle id="exec-pipeline" className="text-sm">
            \u0627\u0644\u0645\u0633\u0627\u0631
          </CardTitle>
        </CardHeader>
        <CardContent>
          {section.status !== "ok" || !pipeline ? (
            <SectionFallback
              section={section}
              emptyMessage="\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0631\u0635 \u0641\u064a \u0627\u0644\u0645\u0633\u0627\u0631."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  \u0641\u0631\u0635 \u0646\u0634\u0637\u0629
                </p>
                <p className="text-xl font-bold">
                  {pipeline.activeOpportunityCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  \u0642\u064a\u0645\u0629 \u0645\u0631\u062c\u0651\u062d\u0629
                </p>
                <p className="text-xl font-bold">
                  {pipeline.weightedValue.toLocaleString("ar-SA")} \u0631.\u0633
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  \u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0645\u0631\u0627\u062c\u0639\u0629
                </p>
                <p className="text-xl font-bold">
                  {pipeline.dealsRequiringReview}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  \u0645\u062a\u0648\u0642\u0641\u0629
                </p>
                <p className="text-xl font-bold">{pipeline.stalledCount}</p>
              </div>
              {pipeline.topStages.length > 0 && (
                <div className="md:col-span-2 lg:col-span-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    \u062a\u0648\u0632\u064a\u0639 \u0627\u0644\u0645\u0631\u0627\u062d\u0644
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pipeline.topStages.map((s) => (
                      <Badge key={s.stage} variant="outline">
                        {s.stage}: {s.count} ({s.pct}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
