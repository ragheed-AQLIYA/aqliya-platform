import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialRisk,
} from "@/lib/sales/services/executive-commercial-dashboard-service";
import { SectionFallback } from "./section-fallback";
import { severityVariant } from "./constants";

export function ExecutiveRisksSection({
  section,
}: {
  section: ExecutiveCommercialSection<ExecutiveCommercialRisk[]>;
}) {
  return (
    <Card className="rounded-xl border-destructive/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          \u0645\u062e\u0627\u0637\u0631 \u062a\u0646\u0641\u064a\u0630\u064a\u0629
        </CardTitle>
      </CardHeader>
      <CardContent>
        {section.status === "fallback" ||
        !section.data ||
        section.data.length === 0 ? (
          <SectionFallback section={section} />
        ) : (
          <ul className="space-y-2 text-sm">
            {section.data.map((risk) => (
              <li key={risk.id}>
                {risk.href ? (
                  <Link
                    href={risk.href}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2 hover:border-destructive/40 hover:bg-muted/40"
                  >
                    <span className="min-w-0 truncate">{risk.labelAr}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {risk.source}
                      </Badge>
                      <Badge
                        variant={severityVariant(risk.severity)}
                        className="text-[10px]"
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2">
                    <span className="min-w-0 truncate">{risk.labelAr}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {risk.source}
                      </Badge>
                      <Badge
                        variant={severityVariant(risk.severity)}
                        className="text-[10px]"
                      >
                        {risk.severity}
                      </Badge>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
