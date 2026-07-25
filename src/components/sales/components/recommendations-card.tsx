import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialRecommendationRow,
} from "@/lib/sales/services/executive-commercial-dashboard-service";
import { SectionFallback } from "./section-fallback";

function RecommendationRow({
  item,
}: {
  item: ExecutiveCommercialRecommendationRow;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={item.priority === "high" ? "destructive" : "secondary"}
          className="text-[10px]"
        >
          {item.priority}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {item.category}
        </Badge>
        <span className="font-medium">{item.titleAr}</span>
      </div>
      {item.reasoningAr && (
        <p className="mt-1 text-xs text-muted-foreground">{item.reasoningAr}</p>
      )}
    </>
  );
}

export function RecommendationsCard({
  section,
}: {
  section: ExecutiveCommercialSection<ExecutiveCommercialRecommendationRow[]>;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          \u062a\u0648\u0635\u064a\u0627\u062a \u0627\u0633\u062a\u0631\u0627\u062a\u064a\u062c\u064a\u0629
        </CardTitle>
      </CardHeader>
      <CardContent>
        {section.status === "fallback" ||
        !section.data ||
        section.data.length === 0 ? (
          <SectionFallback section={section} />
        ) : (
          <ul className="space-y-2 text-sm">
            {section.data.map((item) => (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="block rounded-md border border-border/60 p-2 hover:border-primary/40 hover:bg-muted/40"
                  >
                    <RecommendationRow item={item} />
                  </Link>
                ) : (
                  <div className="rounded-md border border-border/60 p-2">
                    <RecommendationRow item={item} />
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
