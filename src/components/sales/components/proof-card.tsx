import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialProof,
} from "@/lib/sales/services/executive-commercial-dashboard-service";
import { SectionFallback } from "./section-fallback";

export function ProofCard({
  section,
}: {
  section: ExecutiveCommercialSection<ExecutiveCommercialProof>;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          \u0634\u0628\u0643\u0629 \u0627\u0644\u0625\u062b\u0628\u0627\u062a
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {section.status !== "ok" || !section.data ? (
          <SectionFallback section={section} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  \u0623\u0635\u0648\u0644 \u0646\u0634\u0637\u0629
                </p>
                <p className="font-bold">{section.data.activeAssetCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  \u0641\u0631\u0635 \u0645\u0631\u0628\u0648\u0637\u0629
                </p>
                <p className="font-bold">
                  {section.data.linkedOpportunityCount}
                </p>
              </div>
            </div>
            {section.data.coverageGapHintAr && (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                {section.data.coverageGapHintAr}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {section.data.assetTypes.map((t) => (
                <Badge key={t.type} variant="outline">
                  {t.type}: {t.count}
                </Badge>
              ))}
            </div>
            {section.data.topEffectiveAssets.length > 0 && (
              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  \u0623\u0641\u0636\u0644 \u0627\u0644\u0623\u0635\u0648\u0644
                </p>
                <ul className="space-y-1 text-xs">
                  {section.data.topEffectiveAssets.map((asset) => (
                    <li
                      key={asset.title}
                      className="flex justify-between gap-2"
                    >
                      <span className="truncate">{asset.title}</span>
                      <span className="shrink-0 font-mono">{asset.score}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
